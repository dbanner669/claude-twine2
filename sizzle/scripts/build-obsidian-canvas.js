#!/usr/bin/env node
/*
 * Generate the Obsidian Canvas vault from current Sizzle Twee content.
 *
 * Outputs under sizzle/.obsidian-vault/:
 *   passages/<safe-name>.md   — one shadow markdown per passage. Front-matter
 *                                holds tooling metadata; a fenced ```twee block
 *                                holds the literal :: header + body from source.
 *   story.canvas              — JSON Canvas 1.0 with grouped layout:
 *                                  outer Group per act,
 *                                  inner Group per beat,
 *                                  File-nodes per passage laid out horizontally
 *                                  with row-wrap inside each beat.
 *   beats.json                — Editable beat-name manifest. Generated on first
 *                                run from prefix + hundreds-digit; re-read on
 *                                subsequent runs. Edit beat names freely.
 *                                Any prefix the manifest doesn't claim is
 *                                auto-grouped into its own act named after the
 *                                prefix (passages kept together, number order).
 *   README.md                 — short orientation note.
 *
 * This is one-way (Twee → vault). Sync-back lives in build-twee-from-vault.js
 * (task #2). Shadow MDs not in the new set are deleted, so the vault stays in
 * sync after passage renames.
 *
 * Reuses figjam-sync's graph builder for edge extraction.
 */

const path = require("path");
const fs = require("fs");
const fsp = require("fs").promises;

const TWINE_MCP_DIST = path.resolve(__dirname, "..", "..", "twine-mcp-server", "dist");
const { buildGraphFromDirectory } = require(path.join(TWINE_MCP_DIST, "figjam-sync", "graph-builder.js"));
const { parseTwee } = require(path.join(TWINE_MCP_DIST, "twine-parser.js"));

const REPO_ROOT = path.resolve(__dirname, "..", "..");
const CONTENT_DIR = path.resolve(REPO_ROOT, "sizzle", "src", "content");
const VAULT_DIR = path.resolve(REPO_ROOT, "sizzle", ".obsidian-vault");
const PASSAGES_DIR = path.join(VAULT_DIR, "passages");
const CANVAS_FILE = path.join(VAULT_DIR, "story.canvas");
const BEATS_FILE = path.join(VAULT_DIR, "beats.json");
const README_FILE = path.join(VAULT_DIR, "README.md");

/* JSON Canvas preset colors: 1=red 2=orange 3=yellow 4=green 5=cyan 6=purple */
const PREFIX_COLOR = {
  SYS: "3",
  CC: "4",
  INTRO: "5",
  QW: "2",
  SZ: "1",
  BRANCH: "6",
  NPC: "6",
  APT: "2",
};

const EDGE_COLOR = {
  choice: "4",
  branch: "2",
  goto: "5",
  include: "6",
  "widget-next": "5",
};

/* Palette cycled for auto-grouped acts (prefixes the manifest doesn't cover).
   Ordered for visual variety between adjacent acts. */
const AUTO_COLOR_CYCLE = ["6", "2", "4", "1", "3", "5"];

/* Node sizes — tuned for 4–5 nodes per row inside a beat group. */
const NODE_W = 640;
const NODE_H = 1000;
const COL_GAP = 120;         // gap between nodes within a row
const ROW_GAP = 160;         // gap between wrapped rows within a beat
const MAX_COLS_PER_ROW = 5;

const BEAT_PAD_X = 60;
const BEAT_PAD_TOP = 100;    // label area at top of group
const BEAT_PAD_BOT = 60;
const BEAT_GAP_Y = 140;      // gap between beats within an act

const ACT_PAD_X = 80;
const ACT_PAD_TOP = 120;     // label area at top of act group
const ACT_PAD_BOT = 80;
const ACT_GAP_Y = 240;       // gap between acts

const SYSTEM_PASSAGE_NAMES = new Set(["Start"]);

/* -- helpers ------------------------------------------------------------- */

function prefixOf(name) {
  if (SYSTEM_PASSAGE_NAMES.has(name)) return "SYS";
  const m = name.match(/^([A-Z]+)-/);
  return m ? m[1] : "MISC";
}

function safeFilename(name) {
  return name.replace(/[\/\\:*?"<>|]/g, "_").replace(/^\.+|\.+$/g, "").trim();
}

function yamlScalar(s) {
  if (s === "") return '""';
  if (/^[A-Za-z0-9 _\-\/.]+$/.test(s) && !/^[\s-]/.test(s)) return s;
  return JSON.stringify(s);
}

function pickFence(body) {
  if (body.includes("```")) return { open: "~~~twee", close: "~~~" };
  return { open: "```twee", close: "```" };
}

function numericSuffix(name) {
  /* Returns the numeric portion of "PREFIX-NNN[a]" for sort and beat matching.
     Handles "INTRO-200a" -> 200 + 0.5 so it sorts between 200 and 205. */
  const m = name.match(/-(\d+)([a-z]*)/);
  if (!m) return 0;
  const base = parseInt(m[1], 10);
  const letter = m[2] || "";
  return base + (letter ? 0.5 : 0);
}

function hundredsOf(name) {
  const m = name.match(/-(\d+)/);
  if (!m) return null;
  return Math.floor(parseInt(m[1], 10) / 100);
}

function buildShadowMd(record) {
  const { passage, sourceFile, originalIndex, wordCount } = record;
  const fm = [
    "---",
    `sourceFile: ${yamlScalar(sourceFile)}`,
    `originalIndex: ${originalIndex}`,
    `wordCount: ${wordCount}`,
    "---",
    "",
  ].join("\n");
  const tagStr = passage.tags.length ? ` [${passage.tags.join(" ")}]` : "";
  const header = `:: ${passage.name}${tagStr}`;
  const body = passage.text;
  const fenced = `${header}\n${body}`;
  const fence = pickFence(fenced);
  return `${fm}\n${fence.open}\n${fenced}\n${fence.close}\n`;
}

function wordCountOf(passage) {
  let t = passage.text;
  t = t.replace(/<<[\s\S]*?>>/g, " ");
  t = t.replace(/\[\[[^\]]+\]\]/g, " ");
  t = t.replace(/<[^>]+>/g, " ");
  return t.split(/\s+/).filter(Boolean).length;
}

/* -- beats manifest ------------------------------------------------------ */

function slugify(s) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function defaultBeatsManifest() {
  return {
    acts: [
      {
        id: "title",
        name: "Title",
        color: "3",
        beats: [{ id: "open", name: "Open", passages: ["Start"] }],
      },
      {
        id: "cc",
        name: "Character Creation",
        color: "4",
        beats: [{ id: "dossier", name: "Dossier", matchPrefix: "CC" }],
      },
      {
        id: "intro",
        name: "Prologue · Briefing",
        color: "5",
        beats: [
          { id: "intro-1", name: "Beat 1 · Diner setup", matchPrefix: "INTRO", matchHundreds: 1 },
          { id: "intro-2", name: "Beat 2 · The assignment", matchPrefix: "INTRO", matchHundreds: 2 },
          { id: "intro-3", name: "Beat 3 · The mark", matchPrefix: "INTRO", matchHundreds: 3 },
          { id: "intro-4", name: "Beat 4 · Tradecraft", matchPrefix: "INTRO", matchHundreds: 4 },
          { id: "intro-5", name: "Beat 5 · Player questions", matchPrefix: "INTRO", matchHundreds: 5 },
          { id: "intro-6", name: "Beat 6 · Personal", matchPrefix: "INTRO", matchHundreds: 6 },
          { id: "intro-7", name: "Beat 7 · Departure", matchPrefix: "INTRO", matchHundreds: 7 },
          { id: "intro-8", name: "Beat 8 · End of prologue", matchPrefix: "INTRO", matchHundreds: 8 },
        ],
      },
    ],
  };
  /* Note: passages whose prefix matches no act/beat above are auto-grouped
     into their own act (named after the prefix) at layout time. No manual
     "Unsorted" catch-all is needed. Add an explicit act/beat here to give a
     prefix a friendlier name or split it into multiple beats. */
}

async function loadOrInitBeatsManifest() {
  let manifest;
  let writeBack = false;
  try {
    const raw = await fsp.readFile(BEATS_FILE, "utf8");
    manifest = JSON.parse(raw);
  } catch (e) {
    if (e.code !== "ENOENT") throw e;
    manifest = defaultBeatsManifest();
    writeBack = true;
  }
  /* Backfill missing beat ids so they survive name edits. Group-node ids
     in the canvas are keyed by beat.id, which is how layout preservation
     finds them on regeneration. Renaming a beat after this preserves
     its position; renaming before this is a one-time loss. */
  for (const act of manifest.acts) {
    const seen = new Set();
    for (const beat of act.beats) {
      if (!beat.id) {
        let base = slugify(beat.name) || `beat-${seen.size + 1}`;
        let candidate = base;
        let n = 2;
        while (seen.has(candidate)) candidate = `${base}-${n++}`;
        beat.id = candidate;
        writeBack = true;
      }
      seen.add(beat.id);
    }
  }
  if (writeBack) {
    await fsp.writeFile(BEATS_FILE, JSON.stringify(manifest, null, 2), "utf8");
  }
  return manifest;
}

async function loadExistingPositions() {
  /* Returns Map<nodeId, {x, y, width, height}>. Empty map if no prior canvas. */
  try {
    const raw = await fsp.readFile(CANVAS_FILE, "utf8");
    const canvas = JSON.parse(raw);
    const map = new Map();
    for (const node of canvas.nodes || []) {
      if (!node.id) continue;
      map.set(node.id, {
        x: node.x,
        y: node.y,
        width: node.width,
        height: node.height,
      });
    }
    return map;
  } catch (e) {
    if (e.code === "ENOENT") return new Map();
    /* Malformed canvas: treat as empty so we don't fail regeneration. */
    if (e instanceof SyntaxError) return new Map();
    throw e;
  }
}

function assignBeat(record, manifest) {
  /* Explicit manifest matching only: passages list wins, then prefix+hundreds,
     then prefix-only. Returns { act, beat } or null. Unmatched records are
     auto-grouped by prefix in buildLayout. (Legacy `matchAny` beats are
     ignored — auto-grouping replaces the old single Unsorted catch-all.) */
  for (const act of manifest.acts) {
    for (const beat of act.beats) {
      if (beat.passages && beat.passages.includes(record.passage.name)) {
        return { act, beat };
      }
    }
  }
  for (const act of manifest.acts) {
    for (const beat of act.beats) {
      if (beat.matchPrefix && record.prefix === beat.matchPrefix) {
        if (beat.matchHundreds !== undefined) {
          if (hundredsOf(record.passage.name) === beat.matchHundreds) return { act, beat };
        } else {
          return { act, beat };
        }
      }
    }
  }
  return null;
}

/* -- layout -------------------------------------------------------------- */

function layoutBeat(passages, originX, originY) {
  /* Lay out passages in rows of up to MAX_COLS_PER_ROW. Returns:
     - nodes: file-node descriptors with absolute x/y
     - intrinsicWidth: width assuming a full row (used for act-width sizing)
     - height: total beat group height including padding */
  const cols = Math.min(passages.length, MAX_COLS_PER_ROW);
  const rows = Math.max(1, Math.ceil(passages.length / MAX_COLS_PER_ROW));
  const innerW = cols * NODE_W + Math.max(0, cols - 1) * COL_GAP;
  const innerH = rows * NODE_H + Math.max(0, rows - 1) * ROW_GAP;
  const beatHeight = BEAT_PAD_TOP + innerH + BEAT_PAD_BOT;
  const intrinsicWidth = innerW + 2 * BEAT_PAD_X;

  const nodes = passages.map((record, idx) => {
    const col = idx % MAX_COLS_PER_ROW;
    const row = Math.floor(idx / MAX_COLS_PER_ROW);
    return {
      record,
      x: originX + BEAT_PAD_X + col * (NODE_W + COL_GAP),
      y: originY + BEAT_PAD_TOP + row * (NODE_H + ROW_GAP),
    };
  });
  return { nodes, intrinsicWidth, height: beatHeight };
}

function buildLayout(records, manifest) {
  /* Bucket records by (act, beat). */
  const buckets = []; // ordered list, follows manifest order
  const bucketByKey = new Map();
  const unassigned = [];

  for (const r of records) {
    const assignment = assignBeat(r, manifest);
    if (!assignment) {
      unassigned.push(r);
      continue;
    }
    const key = `${assignment.act.id}::${assignment.beat.name}`;
    if (!bucketByKey.has(key)) {
      const bucket = { act: assignment.act, beat: assignment.beat, records: [] };
      bucketByKey.set(key, bucket);
      buckets.push(bucket);
    }
    bucketByKey.get(key).records.push(r);
  }

  /* Auto-group everything the manifest didn't claim: one synthetic act per
     prefix, a single beat each (keep-together), appended after the manifest
     acts in the order each prefix first appears in the record list. */
  const autoActs = [];
  const autoActById = new Map();
  for (const r of unassigned) {
    const actId = `auto:${r.prefix}`;
    let act = autoActById.get(actId);
    if (!act) {
      const bucket = { act: null, beat: { id: r.prefix, name: r.prefix }, records: [] };
      act = { id: actId, name: r.prefix, auto: true, _bucket: bucket };
      bucket.act = act;
      autoActById.set(actId, act);
      autoActs.push(act);
      buckets.push(bucket);
    }
    act._bucket.records.push(r);
  }
  /* Colour synthetic acts: honour PREFIX_COLOR when the prefix is known,
     otherwise cycle the auto palette so adjacent acts read as distinct. */
  let autoColorCursor = 0;
  for (const act of autoActs) {
    act.color = PREFIX_COLOR[act.name] || AUTO_COLOR_CYCLE[autoColorCursor++ % AUTO_COLOR_CYCLE.length];
  }

  /* Sort passages inside each bucket by numeric suffix. */
  for (const bucket of buckets) {
    bucket.records.sort((a, b) => {
      const an = numericSuffix(a.passage.name);
      const bn = numericSuffix(b.passage.name);
      if (an !== bn) return an - bn;
      return a.passage.name.localeCompare(b.passage.name);
    });
  }

  /* Group by act: manifest acts first (manifest order), then auto-grouped acts
     (first-appearance order). */
  const actSequence = [...manifest.acts, ...autoActs]
    .map((act) => ({
      act,
      beats: buckets.filter((bk) => bk.act.id === act.id),
    }))
    .filter((entry) => entry.beats.length > 0);

  /* Lay out: stack acts vertically, beats vertically inside each act,
     passages horizontally inside each beat. Within an act, beats share
     a common width = max(beat intrinsic widths). */
  const actLayouts = [];
  const beatLayouts = [];
  const passageLayouts = [];

  let cursorY = 0;
  for (const { act, beats } of actSequence) {
    /* First pass: get each beat's intrinsic width to pick the act width. */
    let maxBeatWidth = 0;
    for (const bucket of beats) {
      const { intrinsicWidth } = layoutBeat(bucket.records, 0, 0);
      bucket.intrinsicWidth = intrinsicWidth;
      if (intrinsicWidth > maxBeatWidth) maxBeatWidth = intrinsicWidth;
    }
    const actInnerWidth = maxBeatWidth;
    const actWidth = actInnerWidth + 2 * ACT_PAD_X;
    const actX = 0;
    const actY = cursorY;

    let beatY = actY + ACT_PAD_TOP;
    for (const bucket of beats) {
      const beatX = actX + ACT_PAD_X;
      const beatW = actInnerWidth;
      const { nodes, height: beatH } = layoutBeat(bucket.records, beatX, beatY);
      beatLayouts.push({
        actId: act.id,
        beatId: bucket.beat.id,
        beatName: bucket.beat.name,
        x: beatX,
        y: beatY,
        width: beatW,
        height: beatH,
        color: act.color,
      });
      const beatGroupId = `beat:${act.id}:${bucket.beat.id}`;
      for (const n of nodes) {
        /* File-node tint: known prefixes keep their PREFIX_COLOR; auto-grouped
           prefixes inherit their synthetic act's colour. */
        n.color = PREFIX_COLOR[n.record.prefix] || act.color;
        /* Stamp the owning beat-group so position-preservation can tell whether
           a node changed groups since the last regeneration. */
        n.beatGroupId = beatGroupId;
        passageLayouts.push(n);
      }
      beatY += beatH + BEAT_GAP_Y;
    }
    const actHeight = beatY - actY - BEAT_GAP_Y + ACT_PAD_BOT;
    actLayouts.push({
      actId: act.id,
      name: act.name,
      x: actX,
      y: actY,
      width: actWidth,
      height: actHeight,
      color: act.color,
    });
    cursorY = actY + actHeight + ACT_GAP_Y;
  }

  return { actLayouts, beatLayouts, passageLayouts, autoPrefixes: autoActs.map((a) => a.name) };
}

function emitNodes({ actLayouts, beatLayouts, passageLayouts }, existingPositions, stats) {
  /* Z-order: act groups (back), beat groups, file nodes (front).
     Overlay existing positions where the node id was seen in the previous
     canvas — preserving user-moved nodes across regenerations. */
  const nodes = [];

  const applyPreservation = (node) => {
    const prior = existingPositions.get(node.id);
    if (prior) {
      node.x = prior.x;
      node.y = prior.y;
      node.width = prior.width;
      node.height = prior.height;
      stats.preserved += 1;
    } else {
      stats.fresh += 1;
    }
    return node;
  };

  for (const a of actLayouts) {
    nodes.push(
      applyPreservation({
        id: `act:${a.actId}`,
        type: "group",
        label: a.name,
        x: a.x,
        y: a.y,
        width: a.width,
        height: a.height,
        ...(a.color ? { color: a.color } : {}),
      }),
    );
  }

  for (const b of beatLayouts) {
    nodes.push(
      applyPreservation({
        id: `beat:${b.actId}:${b.beatId}`,
        type: "group",
        label: b.beatName,
        x: b.x,
        y: b.y,
        width: b.width,
        height: b.height,
        ...(b.color ? { color: b.color } : {}),
      }),
    );
  }

  for (const pl of passageLayouts) {
    const r = pl.record;
    const filename = safeFilename(r.passage.name) + ".md";
    const color = pl.color || PREFIX_COLOR[r.prefix];
    const node = {
      id: r.passage.name,
      type: "file",
      file: `passages/${filename}`,
      x: pl.x,
      y: pl.y,
      width: NODE_W,
      height: NODE_H,
      ...(color ? { color } : {}),
    };
    /* Preserve a hand-moved position only when the node's current beat group
       also existed in the previous canvas. If the node changed groups (newly
       auto-grouped, or its beat was renamed), re-flow it into the fresh layout
       slot instead of stranding it at its old coordinates. */
    if (pl.beatGroupId && existingPositions.has(pl.beatGroupId)) {
      applyPreservation(node);
    } else {
      stats.fresh += 1;
    }
    nodes.push(node);
  }
  return nodes;
}

function buildEdges(graphEdges, nodeIds, stats) {
  const edges = [];
  let i = 0;
  for (const e of graphEdges) {
    if (!nodeIds.has(e.from) || !nodeIds.has(e.to)) {
      stats.crossScope += 1;
      continue;
    }
    if (e.linkType === "widget-back") {
      stats.widgetBack += 1;
      continue;
    }
    const edge = {
      id: `e-${i++}`,
      fromNode: e.from,
      fromSide: "right",
      toNode: e.to,
      toSide: "left",
    };
    const color = EDGE_COLOR[e.linkType];
    if (color) edge.color = color;
    if (e.linkText) {
      edge.label = e.linkText.length > 32 ? e.linkText.slice(0, 31) + "…" : e.linkText;
    } else if (e.linkType && e.linkType !== "next") {
      edge.label = e.linkType;
    }
    edges.push(edge);
  }
  return edges;
}

/* -- I/O ----------------------------------------------------------------- */

async function loadRecords() {
  const entries = await fsp.readdir(CONTENT_DIR);
  const tweeFiles = entries.filter((n) => n.endsWith(".twee")).sort();
  const records = [];
  for (const file of tweeFiles) {
    const abs = path.join(CONTENT_DIR, file);
    const src = await fsp.readFile(abs, "utf8");
    const story = parseTwee(src);
    const sourceFile = path.relative(REPO_ROOT, abs).replace(/\\/g, "/");
    story.passages.forEach((passage, idx) => {
      records.push({
        passage,
        sourceFile,
        originalIndex: idx,
        prefix: prefixOf(passage.name),
        wordCount: wordCountOf(passage),
      });
    });
  }
  return records;
}

async function writeShadowMds(records) {
  await fsp.mkdir(PASSAGES_DIR, { recursive: true });
  const targetNames = new Set();
  for (const r of records) {
    const filename = safeFilename(r.passage.name) + ".md";
    targetNames.add(filename);
    await fsp.writeFile(path.join(PASSAGES_DIR, filename), buildShadowMd(r), "utf8");
  }
  const existing = await fsp.readdir(PASSAGES_DIR);
  let removed = 0;
  for (const name of existing) {
    if (!name.endsWith(".md")) continue;
    if (!targetNames.has(name)) {
      await fsp.unlink(path.join(PASSAGES_DIR, name));
      removed += 1;
    }
  }
  return { written: targetNames.size, removed };
}

async function writeReadme() {
  const content = `# Sizzle Story Canvas

Generated from \`sizzle/src/content/*.twee\`. Open this folder as an
Obsidian vault and double-click \`story.canvas\` to see the story laid out
as acts → beats → passages.

## Layout

- **Acts** (outer groups): Title, Character Creation, Prologue · Briefing.
- **Beats** (inner groups): one per major scene block. Beat names live in
  \`beats.json\` — edit them freely, names update on regeneration.
- **Passages** (file nodes): the actual scenes, laid out left-to-right
  within each beat, wrapping to multiple rows for long beats.
- **Auto-grouped acts**: any passage whose prefix isn't covered by a manifest
  rule gets its own act named after the prefix (e.g. \`PALE\`, \`BLK\`), with all
  of that prefix's passages kept together in number order. Add a named act/beat
  to \`beats.json\` to give the prefix a friendlier name or split it into beats.

## Files

- \`story.canvas\` — the visual graph (JSON Canvas 1.0).
- \`passages/\` — one shadow markdown per passage. Edit prose inside the
  fenced \`\`\`twee block. Sync back to \`.twee\` with
  \`node sizzle/scripts/build-twee-from-vault.js\` (dry-run by default;
  add \`--apply\` to write), or use the Obsidian plugin (see below).
- \`beats.json\` — beat-name manifest. Edit names freely; the script
  re-reads it on next run.

## Obsidian plugin

The \`obsidian-sizzle-plugin/\` directory at the repo root holds an
Obsidian plugin that wraps these scripts (so the canvas/sync commands
run from the command palette) and runs a continuous lint pipeline with
a sidebar pane and status-bar widget.

Lint rules: broken refs, unclosed macros, duplicate passages, orphan
passages, undeclared variables, editorial notes (\`[! ...]\` /
\`[? ...]\`), tag coherence, and word count. See
\`obsidian-sizzle-plugin/README.md\` for the full table with severities.

Build + install:

\`\`\`
cd obsidian-sizzle-plugin
npm install
npm run build
npm run install-to-vault
\`\`\`

Then enable "Sizzle Tools" in Obsidian → Settings → Community plugins.

## Regenerate canvas

From the repo root, or via the plugin's "Rebuild canvas from Twee" command:

\`\`\`
node sizzle/scripts/build-obsidian-canvas.js
\`\`\`

Idempotent: shadow MDs are rewritten, stale ones removed, canvas
regenerated. \`beats.json\` is only created if missing; your edits to it
are preserved. Manually-moved node positions in \`story.canvas\` are
preserved across regenerations (matched by id).

## Editorial notes convention

Drop notes inline in passage prose:

- \`[! add a hoverover for "Bank Street"]\` — directive for Claude
- \`[? some name to come up with]\` — open question

These survive sync-back as literal text. The editorial-note lint rule
(forthcoming) will surface them in a sidebar pane. For now grep
\`sizzle/src/content/\` for \`[!\` or \`[?\`.
`;
  await fsp.writeFile(README_FILE, content, "utf8");
}

/* -- main ---------------------------------------------------------------- */

async function main() {
  await fsp.mkdir(VAULT_DIR, { recursive: true });

  const records = await loadRecords();
  const manifest = await loadOrInitBeatsManifest();

  const { written, removed } = await writeShadowMds(records);

  const existingPositions = await loadExistingPositions();
  const layout = buildLayout(records, manifest);
  const layoutStats = { preserved: 0, fresh: 0 };
  const nodes = emitNodes(layout, existingPositions, layoutStats);
  const nodeIds = new Set(nodes.filter((n) => n.type === "file").map((n) => n.id));

  /* Orphans = previously-present ids not in the new emit. Could be passages
     that were removed, or beat ids that changed. Just an info line. */
  const emittedIds = new Set(nodes.map((n) => n.id));
  const orphanedIds = [];
  for (const id of existingPositions.keys()) {
    if (!emittedIds.has(id)) orphanedIds.push(id);
  }

  const graph = await buildGraphFromDirectory(CONTENT_DIR, "sizzle");
  const edgeStats = { crossScope: 0, widgetBack: 0 };
  const edges = buildEdges(graph.edges, nodeIds, edgeStats);

  await fsp.writeFile(CANVAS_FILE, JSON.stringify({ nodes, edges }, null, 2), "utf8");
  await writeReadme();

  console.log(`Vault: ${VAULT_DIR}`);
  console.log(`  passages: ${written} written, ${removed} removed`);
  const fileNodeCount = nodes.filter((n) => n.type === "file").length;
  const groupNodeCount = nodes.filter((n) => n.type === "group").length;
  console.log(
    `  canvas: ${fileNodeCount} file nodes, ${groupNodeCount} group nodes, ${edges.length} edges ` +
      `(suppressed ${edgeStats.widgetBack} widget-back, ${edgeStats.crossScope} cross-scope)`,
  );
  console.log(
    `  layout: ${layoutStats.preserved} node(s) kept their position, ${layoutStats.fresh} auto-positioned`,
  );
  if (orphanedIds.length > 0) {
    console.log(`  ${orphanedIds.length} orphaned position(s) dropped: ${orphanedIds.slice(0, 5).join(", ")}${orphanedIds.length > 5 ? ", ..." : ""}`);
  }
  if (layout.autoPrefixes && layout.autoPrefixes.length > 0) {
    console.log(`  auto-grouped ${layout.autoPrefixes.length} unmatched prefix(es) into their own act(s): ${layout.autoPrefixes.join(", ")}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
