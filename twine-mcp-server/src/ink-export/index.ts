/**
 * CLI entry for the Phase 1 twee → ink bulk conversion.
 *
 * Usage: npm run export-ink   (from twine-mcp-server/)
 *
 * Reads the five sequence files from sizzle/archive/twee-src/content/, writes
 * godot/content/{briefing,blackout,manitoulin,pale,wds}.ink plus a
 * matching .ink.import sidecar with is_main_file=true (Phase 0.5 gate
 * finding #2). main-menu / character-creator are native scenes — excluded.
 */

import * as crypto from "crypto";
import * as fs from "fs";
import * as path from "path";

import { parseTwee } from "../twine-parser";
import { convertStory, type Warning } from "./convert";

const REPO_ROOT = path.resolve(__dirname, "..", "..", "..");
const SRC_DIR = path.join(REPO_ROOT, "sizzle", "archive", "twee-src", "content");
const OUT_DIR = path.join(REPO_ROOT, "godot", "content");

interface FileSpec {
  twee: string;
  out: string;
  prefix: string;
  label: string;
}

const FILES: FileSpec[] = [
  { twee: "briefing.twee", out: "briefing.ink", prefix: "INTRO", label: "briefing" },
  { twee: "blackout.twee", out: "blackout.ink", prefix: "BLK", label: "blackout" },
  { twee: "manitoulin.twee", out: "manitoulin.ink", prefix: "MAN", label: "manitoulin" },
  { twee: "pale.twee", out: "pale.ink", prefix: "PALE", label: "pale" },
  { twee: "wds.twee", out: "wds.ink", prefix: "WDS", label: "wds" },
];

const UID_ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789";

function freshUid(): string {
  let uid = "";
  for (let i = 0; i < 13; i += 1) {
    uid += UID_ALPHABET[crypto.randomInt(UID_ALPHABET.length)];
  }
  return `uid://${uid}`;
}

/** Godot names imported artifacts <file>-<md5(res-path)>.res. */
function importSidecar(outName: string, uid: string): string {
  const resPath = `res://content/${outName}`;
  const hash = crypto.createHash("md5").update(resPath).digest("hex");
  const dest = `res://.godot/imported/${outName}-${hash}.res`;
  return [
    "[remap]",
    "",
    'importer="ink"',
    'type="Resource"',
    `uid="${uid}"`,
    `path="${dest}"`,
    "",
    "[deps]",
    "",
    `source_file="${resPath}"`,
    `dest_files=["${dest}"]`,
    "",
    "[params]",
    "",
    "is_main_file=true",
    "compress=true",
    "",
  ].join("\n");
}

function existingUid(sidecarPath: string): string | null {
  if (!fs.existsSync(sidecarPath)) return null;
  const m = fs.readFileSync(sidecarPath, "utf8").match(/uid="(uid:\/\/[^"]+)"/);
  return m ? m[1] : null;
}

function main(): void {
  const allWarnings: Warning[] = [];
  const summary: string[] = [];

  for (const spec of FILES) {
    const tweePath = path.join(SRC_DIR, spec.twee);
    const twee = fs.readFileSync(tweePath, "utf8");
    // parseTwee expects a leading passage header at line starts; normalize CRLF.
    const story = parseTwee(twee.replace(/\r\n/g, "\n"));

    const result = convertStory(story, {
      label: spec.label,
      prefix: spec.prefix,
      sourceName: spec.twee,
    });

    const outPath = path.join(OUT_DIR, spec.out);
    fs.writeFileSync(outPath, result.ink + "\n", "utf8");

    const sidecarPath = `${outPath}.import`;
    const uid = existingUid(sidecarPath) ?? freshUid();
    fs.writeFileSync(sidecarPath, importSidecar(spec.out, uid), "utf8");

    allWarnings.push(...result.warnings);
    const s = result.stats;
    summary.push(
      `${spec.out}: ${s.knots} knots (${s.stubs} stubs, ${s.checks} checks, ${s.choices} choices), ` +
        `${result.warnings.length} warnings`,
    );
  }

  console.log("=== export-ink summary ===");
  for (const line of summary) console.log(line);

  console.log(`\n=== warnings (${allWarnings.length}) ===`);
  for (const w of allWarnings) {
    const detail = w.detail.includes("\n") ? `${w.detail.split("\n")[0]} …(html preserved)` : w.detail;
    console.log(`[${w.construct}] ${w.file} :: ${w.passage} — ${detail}`);
  }

  // Full machine-readable dump for the conversion report.
  const dumpPath = path.join(OUT_DIR, "..", "..", "twine-mcp-server", "ink-export-warnings.json");
  fs.writeFileSync(path.resolve(dumpPath), JSON.stringify(allWarnings, null, 2), "utf8");
  console.log(`\nFull warning dump: twine-mcp-server/ink-export-warnings.json`);
}

main();
