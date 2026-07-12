#!/usr/bin/env node
// Text-fidelity diff: sizzle/archive/twee-src/content/*.twee (frozen source) vs godot/content/*.ink (converted output).
// Verifies every authored prose paragraph / choice-link display text survived the twee->ink conversion.
// Run: node twine-mcp-server/scripts/verify-ink-import.mjs
// Output: JSON report written to scratch path given as argv[2] (optional) and a human summary to stdout.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..", "..");

const PAIRS = [
  { name: "briefing", twee: "sizzle/archive/twee-src/content/briefing.twee", ink: "godot/content/briefing.ink" },
  { name: "blackout", twee: "sizzle/archive/twee-src/content/blackout.twee", ink: "godot/content/blackout.ink" },
  { name: "manitoulin", twee: "sizzle/archive/twee-src/content/manitoulin.twee", ink: "godot/content/manitoulin.ink" },
  { name: "pale", twee: "sizzle/archive/twee-src/content/pale.twee", ink: "godot/content/pale.ink" },
  { name: "wds", twee: "sizzle/archive/twee-src/content/wds.twee", ink: "godot/content/wds.ink" },
];

const KNOWN_ADDED_KNOTS = new Set(["blk_end", "man_end", "pale_end", "wds_end", "intro_end"]);
// Post-retirement (2026-07-11) ink is canonical and new content is authored directly in
// the ink files; knots with these prefixes never had a twee source and are skipped by
// the ink->twee coverage check. The twee->ink direction stays exhaustive.
const KNOWN_ADDED_PREFIXES = ["eval_"];
const isKnownAdded = (id) =>
  KNOWN_ADDED_KNOTS.has(id) ||
  KNOWN_ADDED_PREFIXES.some((p) => id.toLowerCase().startsWith(p));
const PLACEHOLDER = "⟨var⟩"; // ⟨var⟩

// ---------------------------------------------------------------------------
// Normalization (applied identically to both sides at the very end)
// ---------------------------------------------------------------------------
function normalizeUnit(s) {
  let t = s;
  // smart quotes/dashes -> ascii
  t = t.replace(/[‘’′]/g, "'");
  t = t.replace(/[“”″]/g, '"');
  t = t.replace(/[–—]/g, "-");
  t = t.replace(/…/g, "...");
  t = t.toLowerCase();
  t = t.replace(/\s+/g, " ").trim();
  // strip leading/trailing punctuation-only artifacts
  t = t.replace(/^[^a-z0-9⟨]+/, "");
  t = t.replace(/[^a-z0-9⟩.!?]+$/, "");
  return t.trim();
}

function splitParagraphs(text) {
  return text
    .split(/\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
}

// Approximate sentence splitter, used only as a fallback tie-breaker (see comparePassage) to
// avoid false positives when the twee/ink converter merged or split a paragraph boundary
// differently (e.g. a blank-line paragraph break in twee collapsed into one glued ink line)
// while every sentence's words remain identical and present on both sides.
function splitSentences(paragraph) {
  const parts = paragraph.match(/[^.!?]+[.!?]+|[^.!?]+$/g);
  return parts ? parts.map((s) => s.trim()).filter(Boolean) : [paragraph];
}

// Expand a line containing inline ink conditionals `{cond: A|B}` or single-branch `{cond: A}`
// (flat, no nested braces -- those are consumed earlier as mirror-var placeholders) into all
// textual variants. Returns array of strings (>=1).
function expandInlineConditionals(line) {
  const re = /\{([^{}:]+):([^{}]*)\}/;
  const m = line.match(re);
  if (!m) return [line];
  const [whole, , body] = m;
  const parts = body.split("|");
  const variants = parts.map((p) => line.slice(0, m.index) + p + line.slice(m.index + whole.length));
  return variants.flatMap((v) => expandInlineConditionals(v));
}

// ---------------------------------------------------------------------------
// TWEE side
// ---------------------------------------------------------------------------
function parseTweePassages(fileText) {
  const passages = new Map(); // id -> { id, title, tags, raw, order }
  const chunks = fileText.split(/\n(?=:: )/);
  let order = 0;
  for (const chunk of chunks) {
    if (!chunk.startsWith(":: ")) continue;
    const nl = chunk.indexOf("\n");
    const headerLine = nl === -1 ? chunk.slice(3) : chunk.slice(3, nl);
    const body = nl === -1 ? "" : chunk.slice(nl + 1);
    // header: "ID Title [tags]" -- id is first whitespace token
    const idMatch = headerLine.match(/^(\S+)/);
    if (!idMatch) continue;
    const id = idMatch[1];
    passages.set(id, { id, title: headerLine.trim(), raw: body, order: order++ });
  }
  return passages;
}

// Expand an inline (same-line) twee <<if>>...<<elseif>>...<<else>>...<</if>> block into one line
// per branch, keeping any prefix text before <<if>> and suffix text after <</if>> attached to
// every branch. Only fires when the opening and closing tags are on the SAME source line --
// the far more common multi-line <<if>>/<<elseif>>/<<else>> case already yields one branch per
// physical line once tags are stripped, so it is left untouched here.
function expandInlineIfLine(line) {
  const ifTag = /<<if\b[^>]*>>/.exec(line);
  if (!ifTag) return [line];
  const endTag = /<<\/if>>/.exec(line);
  if (!endTag) return [line];
  const ifTagEnd = ifTag.index + ifTag[0].length;
  if (endTag.index < ifTagEnd) return [line];
  const prefix = line.slice(0, ifTag.index);
  const middle = line.slice(ifTagEnd, endTag.index);
  const suffix = line.slice(endTag.index + endTag[0].length);
  const branches = middle.split(/<<elseif\b[^>]*>>|<<else\s*>>/);
  const expanded = branches.map((b) => prefix + b + suffix);
  // handle a further inline if-block still present in prefix/suffix (rare) by recursing once more
  return expanded.flatMap((l) => (l !== line ? expandInlineIfLine(l) : [l]));
}

function tweeContentUnits(rawBody) {
  let t = rawBody;

  // 1. strip /* ... */ comments
  t = t.replace(/\/\*[\s\S]*?\*\//g, "");

  // 1.5 expand same-line <<if>>...<<elseif>>...<<else>>...<</if>> into one line per branch
  t = t
    .split("\n")
    .flatMap((line) => expandInlineIfLine(line))
    .join("\n");

  // 2. <<print ...>> -> placeholder (covers $x || "fallback" and any bare print)
  t = t.replace(/<<print\b[\s\S]*?>>/g, PLACEHOLDER);

  // 3. <<playerRealName>> -> placeholder (mirrors ink {player_name})
  t = t.replace(/<<playerRealName>>/g, PLACEHOLDER);

  // 4. <<term "KEY" "shown">> / <<term "KEY">>
  t = t.replace(/<<term\s+"([^"]*)"(?:\s+"([^"]*)")?\s*>>/g, (_, key, shown) => (shown !== undefined ? shown : key));

  // 5. <<link "Display">> / <<linkreplace "Display">> (opening tag only; optional 2nd quoted target arg dropped)
  t = t.replace(/<<link\s+"([^"]*)"(?:\s+"[^"]*")?\s*>>/g, "$1\n");
  t = t.replace(/<<linkreplace\s+"([^"]*)"\s*>>/g, "$1\n");

  // 6. [[Display|Target]] (setter form [$x to y] stripped as part of ]...] not matched by our simple form,
  //    but handle it explicitly first in case it appears)
  t = t.replace(/\[\[([^|\]]*)\|[^\]]*?\]\[[^\]]*\]\]/g, "$1"); // [[Display|Target][$x to y]]
  t = t.replace(/\[\[([^|\]]*)\|[^\]]*\]\]/g, "$1"); // [[Display|Target]]
  t = t.replace(/\[\[([^\]]*)\]\]/g, "$1"); // [[Target]] (bare)

  // 7. strip all remaining <<...>> macro tags (set/if/elseif/else/silently/header/page/goto/replace/
  //    addNotification/skillCheck/success/failure/setDate/setTime/advanceDays/etc.)
  t = t.replace(/<<[^>]*?>>/g, "");

  // 8. strip HTML tags (keep inner text)
  t = t.replace(/<[^>]+>/g, "");

  // 9. //italics// -> italics
  t = t.replace(/\/\/(.*?)\/\//g, "$1");

  // decode a couple of common HTML entities that may appear in raw twee HTML blocks
  t = t.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'");

  const paragraphs = splitParagraphs(t);
  const units = new Map(); // normalized -> raw (first seen)
  for (const p of paragraphs) {
    const norm = normalizeUnit(p);
    if (norm.length === 0) continue;
    if (!units.has(norm)) units.set(norm, p);
  }
  return units;
}

// ---------------------------------------------------------------------------
// INK side
// ---------------------------------------------------------------------------
function parseInkKnots(fileText) {
  const knots = new Map(); // id -> { id, raw, order }
  const lines = fileText.split(/\n/);
  let current = null;
  let order = 0;
  for (const line of lines) {
    const knotMatch = line.match(/^===\s*(\S+?)\s*===\s*$/);
    if (knotMatch) {
      if (current) knots.set(current.id, current);
      current = { id: knotMatch[1], lines: [], order: order++ };
      continue;
    }
    if (current) current.lines.push(line);
  }
  if (current) knots.set(current.id, current);
  for (const k of knots.values()) k.raw = k.lines.join("\n");
  return knots;
}

function isStubKnot(rawBody) {
  return /^#\s*scene:\s*branch_file_extract\s*$/m.test(rawBody);
}

function inkContentUnits(rawBody) {
  const rawLines = rawBody.split(/\n/);
  const outLines = [];

  const reComment = /^\/\//;
  const reTag = /^#/;
  const reOp = /^~/;
  const reDivertOnly = /^->\s*\S+\s*$/;
  const reVarDecl = /^(VAR|CONST|INCLUDE|EXTERNAL)\b/;
  const reBraceOpenBare = /^\{\s*$/;
  const reBraceOpenCond = /^\{\s*[^{}|]+:\s*$/; // "{ check_passed:" / "{ not x_granted:"
  const reBraceClose = /^\}\s*$/;
  const reGatherCond = /^-\s*[^{}|]+:\s*$/; // "- background == \"X\":" / "- else:"
  const reGatherBare = /^-\s*$/;

  for (let raw of rawLines) {
    let line = raw.trim();
    if (line.length === 0) continue;
    if (reComment.test(line)) continue;
    if (reTag.test(line)) continue;
    if (reVarDecl.test(line)) continue;
    if (reDivertOnly.test(line)) continue;
    if (reBraceOpenBare.test(line)) continue;
    if (reBraceOpenCond.test(line)) continue;
    if (reBraceClose.test(line)) continue;
    if (reGatherCond.test(line)) continue;
    if (reGatherBare.test(line)) continue;

    // choice line: * [Display] -> Target   (also nested "* *" / "* * *", optional leading {cond} guard)
    const choiceMatch = line.match(/^(?:\*\s*)+(?:\{[^}]*\}\s*)?\[([^\]]*)\](?:\s*->.*)?\s*$/);
    if (choiceMatch) {
      line = choiceMatch[1];
      if (line.length === 0) continue;
    } else if (reOp.test(line)) {
      // pure ops line (~ set_header / ~ grant_skill / ~ toast / assignments) -- no visible content per spec
      continue;
    }

    // strip trailing pure ops/tags glued after a choice divert target (already handled above)

    // [url=gloss:KEY]label[/url] -> label
    line = line.replace(/\[url=gloss:[^\]]*\]([^\[]*)\[\/url\]/g, "$1");
    // [i]...[/i]
    line = line.replace(/\[\/?i\]/g, "");

    // mirror-var ternary-with-fallback -> placeholder (must run before generic inline conditional)
    line = line.replace(/\{(\w+)\s*!=\s*""\s*:\s*\{\1\}\s*\|[^{}]*\}/g, PLACEHOLDER);
    // bare mirror-var interpolation -> placeholder
    line = line.replace(/\{[a-zA-Z_][a-zA-Z0-9_]*\}/g, PLACEHOLDER);

    // decode entities
    line = line.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'");

    if (line.length === 0) continue;

    // general inline conditional {cond: A|B} -- expand to both variants (flat, no nested braces expected here)
    const variants = expandInlineConditionals(line);
    for (const v of variants) outLines.push(v);
  }

  const units = new Map();
  for (const l of outLines) {
    const norm = normalizeUnit(l);
    if (norm.length === 0) continue;
    if (!units.has(norm)) units.set(norm, l);
  }
  return units;
}

// ---------------------------------------------------------------------------
// Comparison driver
// ---------------------------------------------------------------------------
// Build the set of normalized sentences from every paragraph unit on one side, used only as a
// fallback tie-breaker below.
function sentenceSetOf(unitsMap) {
  const set = new Set();
  for (const raw of unitsMap.values()) {
    for (const s of splitSentences(raw)) {
      const norm = normalizeUnit(s);
      if (norm.length > 0) set.add(norm);
    }
  }
  return set;
}

function comparePassage(tweeUnits, inkUnits) {
  const tweeOnly = [];
  const inkOnly = [];
  const tweeCandidates = [];
  const inkCandidates = [];
  for (const [norm, raw] of tweeUnits) {
    if (!inkUnits.has(norm)) tweeCandidates.push({ norm, raw });
  }
  for (const [norm, raw] of inkUnits) {
    if (!tweeUnits.has(norm)) inkCandidates.push({ norm, raw });
  }

  if (tweeCandidates.length === 0 && inkCandidates.length === 0) {
    return { tweeOnly, inkOnly };
  }

  // Fallback tie-breaker: a paragraph-level mismatch is only a REAL mismatch if it doesn't fully
  // decompose into sentences that are all present on the other side. This tolerates the converter
  // merging/splitting a paragraph boundary differently (e.g. a twee blank-line break collapsed
  // into one glued ink line) without losing or altering any authored words.
  const inkSentences = sentenceSetOf(inkUnits);
  const tweeSentences = sentenceSetOf(tweeUnits);

  for (const c of tweeCandidates) {
    const sentences = splitSentences(c.raw).map(normalizeUnit).filter((s) => s.length > 0);
    const allCovered = sentences.length > 0 && sentences.every((s) => inkSentences.has(s));
    if (!allCovered) tweeOnly.push(c);
  }
  for (const c of inkCandidates) {
    const sentences = splitSentences(c.raw).map(normalizeUnit).filter((s) => s.length > 0);
    const allCovered = sentences.length > 0 && sentences.every((s) => tweeSentences.has(s));
    if (!allCovered) inkOnly.push(c);
  }

  return { tweeOnly, inkOnly };
}

function main() {
  const report = {
    sequences: [],
    knownStubbed: [],
    addedKnots: [],
    coverageGapsTweeNoInk: [],
    coverageGapsInkNoTwee: [],
    mismatches: [], // { sequence, id, direction, normalized, raw }
  };

  for (const pair of PAIRS) {
    const tweePath = path.join(REPO_ROOT, pair.twee);
    const inkPath = path.join(REPO_ROOT, pair.ink);
    const tweeText = readFileSync(tweePath, "utf8");
    const inkText = readFileSync(inkPath, "utf8");

    const tweePassages = parseTweePassages(tweeText);
    const inkKnots = parseInkKnots(inkText);

    let compared = 0;
    let clean = 0;
    let mismatched = 0;
    const seqStubbed = [];
    const seqAdded = [];

    // Identify stub knots and added knots up front
    for (const [id, knot] of inkKnots) {
      if (isKnownAdded(id)) {
        seqAdded.push(id);
      }
    }

    for (const [tweeId, passage] of tweePassages) {
      const inkId = tweeId.replace(/-/g, "_");
      const knot = inkKnots.get(inkId);
      if (!knot) {
        report.coverageGapsTweeNoInk.push({ sequence: pair.name, id: tweeId, title: passage.title });
        continue;
      }
      if (isStubKnot(knot.raw)) {
        seqStubbed.push({ id: tweeId, inkId });
        continue;
      }
      compared++;
      const tweeUnits = tweeContentUnits(passage.raw);
      const inkUnits = inkContentUnits(knot.raw);
      const { tweeOnly, inkOnly } = comparePassage(tweeUnits, inkUnits);
      if (tweeOnly.length === 0 && inkOnly.length === 0) {
        clean++;
      } else {
        mismatched++;
        for (const u of tweeOnly) {
          report.mismatches.push({
            sequence: pair.name,
            id: tweeId,
            direction: "TWEE-ONLY",
            normalized: u.norm,
            raw: u.raw,
          });
        }
        for (const u of inkOnly) {
          report.mismatches.push({
            sequence: pair.name,
            id: tweeId,
            direction: "INK-ONLY",
            normalized: u.norm,
            raw: u.raw,
          });
        }
      }
    }

    // coverage: ink knots (excluding added) with no twee source
    for (const [inkId] of inkKnots) {
      if (isKnownAdded(inkId)) continue;
      const tweeId = inkId.replace(/_/g, "-");
      if (!tweePassages.has(tweeId)) {
        // try matching by scanning all twee ids normalized (in case of hyphen/underscore mismatch)
        let found = false;
        for (const tid of tweePassages.keys()) {
          if (tid.replace(/-/g, "_") === inkId) {
            found = true;
            break;
          }
        }
        if (!found) report.coverageGapsInkNoTwee.push({ sequence: pair.name, id: inkId });
      }
    }

    report.knownStubbed.push(...seqStubbed.map((s) => ({ sequence: pair.name, ...s })));
    report.addedKnots.push(...seqAdded.map((id) => ({ sequence: pair.name, id })));

    report.sequences.push({
      sequence: pair.name,
      tweePassages: tweePassages.size,
      inkKnots: inkKnots.size,
      stubbed: seqStubbed.length,
      added: seqAdded.length,
      compared,
      clean,
      mismatched,
    });
  }

  return report;
}

const report = main();

const outPath = process.argv[2];
if (outPath) {
  const { writeFileSync } = await import("node:fs");
  writeFileSync(outPath, JSON.stringify(report, null, 2), "utf8");
}

// human summary to stdout
console.log("=== SUMMARY ===");
for (const s of report.sequences) {
  console.log(
    `${s.sequence.padEnd(12)} compared=${s.compared} clean=${s.clean} mismatched=${s.mismatched} stubbed=${s.stubbed} added=${s.added} (twee=${s.tweePassages} ink=${s.inkKnots})`
  );
}
console.log(`\nTotal mismatch units: ${report.mismatches.length}`);
console.log(`Coverage gaps (twee id, no ink knot): ${report.coverageGapsTweeNoInk.length}`);
console.log(`Coverage gaps (ink knot, no twee id): ${report.coverageGapsInkNoTwee.length}`);
if (report.coverageGapsTweeNoInk.length) console.log(JSON.stringify(report.coverageGapsTweeNoInk, null, 2));
if (report.coverageGapsInkNoTwee.length) console.log(JSON.stringify(report.coverageGapsInkNoTwee, null, 2));
