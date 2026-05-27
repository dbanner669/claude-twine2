#!/usr/bin/env node
/*
 * Sync shadow markdown back to source Twee.
 *
 * Reads sizzle/.obsidian-vault/passages/*.md, extracts each passage's
 * :: header line and body from its fenced twee block, groups by
 * front-matter sourceFile, sorts by originalIndex, and reconstructs
 * sizzle/src/content/*.twee.
 *
 *   node sizzle/scripts/build-twee-from-vault.js          # dry-run
 *   node sizzle/scripts/build-twee-from-vault.js --apply  # write files
 *
 * Dry-run prints a per-file summary: would-write / unchanged / new-passages
 * / dropped-passages. --apply actually writes the .twee files and prints
 * the same summary.
 *
 * Constraint: this only touches .twee files that have at least one MD
 * claiming them via front-matter. Files not referenced by any MD are
 * left alone. Passages present in source but absent from any MD will
 * be DROPPED — this is intentional (it makes the vault authoritative)
 * but flagged loudly so deletions are deliberate.
 */

const path = require("path");
const fs = require("fs");
const fsp = require("fs").promises;

const REPO_ROOT = path.resolve(__dirname, "..", "..");
const VAULT_DIR = path.resolve(REPO_ROOT, "sizzle", ".obsidian-vault");
const PASSAGES_DIR = path.join(VAULT_DIR, "passages");
const CONTENT_DIR = path.resolve(REPO_ROOT, "sizzle", "src", "content");

const args = process.argv.slice(2);
const APPLY = args.includes("--apply");

/* -- MD parsing ---------------------------------------------------------- */

function parseFrontMatter(text) {
  /* Returns { fm: object, rest: string } or null if no front-matter.
     Tolerant of the minimal YAML we emit: KEY: VALUE, scalar only. */
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!m) return null;
  const body = m[1];
  const fm = {};
  for (const line of body.split(/\r?\n/)) {
    if (!line.trim()) continue;
    const kv = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*:\s*(.*)$/);
    if (!kv) continue;
    let value = kv[2].trim();
    /* Strip surrounding quotes if present. */
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    /* Integer coercion for numeric fields. */
    if (/^-?\d+$/.test(value)) value = parseInt(value, 10);
    fm[kv[1]] = value;
  }
  return { fm, rest: text.slice(m[0].length) };
}

function extractFence(text) {
  /* Find the first fenced block tagged twee (``` or ~~~). Return its
     inner content as a string, or null if no fence found. */
  const m = text.match(/^(```|~~~)twee[ \t]*\r?\n([\s\S]*?)\r?\n\1[ \t]*\r?\n?/m);
  if (!m) return null;
  return m[2];
}

function splitHeaderAndBody(fenceContent) {
  /* The fence contains :: Name [tags] on the first non-empty line followed
     by the body. Return { header, body, name, tags }. */
  const lines = fenceContent.split(/\r?\n/);
  let headerIdx = -1;
  for (let i = 0; i < lines.length; i += 1) {
    if (lines[i].startsWith(":: ")) {
      headerIdx = i;
      break;
    }
    if (lines[i].trim() !== "") {
      /* Non-header non-empty line before header — malformed. */
      return null;
    }
  }
  if (headerIdx === -1) return null;

  const header = lines[headerIdx];
  /* Body = everything after header line. Strip trailing empty lines to
     match the original Twee body shape (twine-parser does the same). */
  let bodyLines = lines.slice(headerIdx + 1);
  while (bodyLines.length > 0 && bodyLines[bodyLines.length - 1].trim() === "") {
    bodyLines.pop();
  }
  const body = bodyLines.join("\n");

  /* Parse the :: line: ":: Name" or ":: Name [tag1 tag2]". */
  const headerMatch = header.match(/^::\s+(.+?)(?:\s+\[([^\]]*)\])?\s*$/);
  if (!headerMatch) return null;
  const name = headerMatch[1].trim();
  const tags = headerMatch[2] ? headerMatch[2].split(/\s+/).filter(Boolean) : [];

  return { header, body, name, tags };
}

async function loadShadowMd(filePath) {
  const text = await fsp.readFile(filePath, "utf8");
  const fm = parseFrontMatter(text);
  if (!fm) {
    return { error: "no front-matter", filePath };
  }
  if (!fm.fm.sourceFile || fm.fm.originalIndex === undefined) {
    return { error: "front-matter missing sourceFile or originalIndex", filePath };
  }
  const fenceContent = extractFence(fm.rest);
  if (fenceContent === null) {
    return { error: "no ```twee fence found", filePath };
  }
  const parsed = splitHeaderAndBody(fenceContent);
  if (!parsed) {
    return { error: "could not parse :: header inside fence", filePath };
  }
  return {
    filePath,
    sourceFile: fm.fm.sourceFile,
    originalIndex: fm.fm.originalIndex,
    name: parsed.name,
    tags: parsed.tags,
    header: parsed.header,
    body: parsed.body,
  };
}

/* -- Twee file rebuild --------------------------------------------------- */

function rebuildTwee(passages) {
  /* Each passage = header + "\n" + body. Passages joined by "\n\n\n"
     (one trailing newline of last body line + blank line + blank line
     before next header), matching the existing Twee file format.
     File ends with a single trailing newline. */
  const parts = passages.map((p) => `${p.header}\n${p.body}`);
  return parts.join("\n\n\n") + "\n";
}

/* -- main ---------------------------------------------------------------- */

async function main() {
  /* Load every shadow MD. */
  const entries = await fsp.readdir(PASSAGES_DIR);
  const mdFiles = entries.filter((n) => n.endsWith(".md")).sort();

  const loaded = [];
  const errors = [];
  for (const name of mdFiles) {
    const result = await loadShadowMd(path.join(PASSAGES_DIR, name));
    if (result.error) {
      errors.push(result);
    } else {
      loaded.push(result);
    }
  }

  if (errors.length > 0) {
    console.error("Failed to parse shadow MDs:");
    for (const e of errors) console.error(`  ${path.basename(e.filePath)}: ${e.error}`);
    process.exit(1);
  }

  /* Group by sourceFile, sort by originalIndex. */
  const bySourceFile = new Map();
  for (const p of loaded) {
    if (!bySourceFile.has(p.sourceFile)) bySourceFile.set(p.sourceFile, []);
    bySourceFile.get(p.sourceFile).push(p);
  }
  for (const list of bySourceFile.values()) {
    list.sort((a, b) => {
      if (a.originalIndex !== b.originalIndex) return a.originalIndex - b.originalIndex;
      return a.name.localeCompare(b.name);
    });
  }

  /* Report and (optionally) write per file. */
  let totalUnchanged = 0;
  let totalChanged = 0;
  let totalDroppedPassages = 0;
  let totalAddedPassages = 0;

  const sourceFiles = Array.from(bySourceFile.keys()).sort();
  for (const sourceFile of sourceFiles) {
    const absPath = path.resolve(REPO_ROOT, sourceFile);
    const passages = bySourceFile.get(sourceFile);

    let existingContent = "";
    let existingPassageNames = [];
    try {
      existingContent = await fsp.readFile(absPath, "utf8");
      /* Quick scan of existing passage names (for drop reporting). */
      const re = /^:: ([^\n\[\{]+?)(?:\s*\[|\s*\{|\s*$)/gm;
      let m;
      while ((m = re.exec(existingContent)) !== null) {
        existingPassageNames.push(m[1].trim());
      }
    } catch (e) {
      if (e.code !== "ENOENT") throw e;
    }

    const newContent = rebuildTwee(passages);
    const newNames = passages.map((p) => p.name);
    const newSet = new Set(newNames);
    const oldSet = new Set(existingPassageNames);
    const dropped = existingPassageNames.filter((n) => !newSet.has(n));
    const added = newNames.filter((n) => !oldSet.has(n));

    const unchanged = newContent === existingContent;
    if (unchanged) {
      totalUnchanged += 1;
      console.log(`  unchanged: ${sourceFile} (${passages.length} passages)`);
      continue;
    }

    totalChanged += 1;
    totalDroppedPassages += dropped.length;
    totalAddedPassages += added.length;

    const action = APPLY ? "WRITE" : "would-write";
    console.log(`  ${action}: ${sourceFile} (${passages.length} passages)`);
    if (added.length > 0) {
      console.log(`    + ${added.length} new passage(s): ${added.join(", ")}`);
    }
    if (dropped.length > 0) {
      console.log(`    - ${dropped.length} dropped passage(s): ${dropped.join(", ")}`);
    }
    /* Show byte-level size diff to make non-trivial edits visible. */
    const sizeDelta = newContent.length - existingContent.length;
    if (sizeDelta !== 0) {
      console.log(`    bytes: ${existingContent.length} -> ${newContent.length} (${sizeDelta > 0 ? "+" : ""}${sizeDelta})`);
    }

    if (APPLY) {
      await fsp.writeFile(absPath, newContent, "utf8");
    }
  }

  console.log("");
  console.log(`Summary: ${totalChanged} file(s) changed, ${totalUnchanged} unchanged`);
  if (totalAddedPassages > 0 || totalDroppedPassages > 0) {
    console.log(`         ${totalAddedPassages} passage(s) added, ${totalDroppedPassages} passage(s) dropped`);
  }
  if (!APPLY && totalChanged > 0) {
    console.log("");
    console.log("Dry run. Re-run with --apply to write changes.");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
