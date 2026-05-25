/// <reference types="@figma/plugin-typings" />

/**
 * Sizzle Story Sync — FigJam plugin sandbox.
 *
 * Receives a StoryGraph payload from the UI and lays it out as Sections
 * containing title+body sticky pairs with connectors between linked passages.
 * Stamps every node it creates with setPluginData so a later Export pass
 * can reconstruct identity for round-trip interpretation.
 */

interface StoryGraphPassage {
  id: string;
  name: string;
  prefix: string;
  act: string;
  tags: string[];
  summary: string;
  displayBody: string;
  body: string;
  sourceFile: string;
  wordCount: number;
}

interface StoryGraphEdge {
  from: string;
  to: string;
  linkType: string;
  linkText?: string;
}

interface StoryGraphSection {
  id: string;
  name: string;
  color: string;
}

interface StoryGraph {
  generatedAt: string;
  story: string;
  passages: StoryGraphPassage[];
  edges: StoryGraphEdge[];
  sections: StoryGraphSection[];
}

interface UiMessage {
  type: "load-graph" | "request-export" | "cancel";
  graph?: StoryGraph;
}

const STICKY_COLORS: Record<string, RGB> = {
  blue: { r: 0.62, g: 0.78, b: 0.96 },
  green: { r: 0.67, g: 0.88, b: 0.70 },
  yellow: { r: 0.98, g: 0.92, b: 0.55 },
  red: { r: 0.96, g: 0.60, b: 0.55 },
  light_gray: { r: 0.85, g: 0.85, b: 0.85 },
  violet: { r: 0.78, g: 0.65, b: 0.92 },
  orange: { r: 0.98, g: 0.74, b: 0.46 },
  dark_gray: { r: 0.55, g: 0.55, b: 0.55 },
  /* Tan: used for branch-passage stickies per Design item #5. */
  tan: { r: 0.93, g: 0.78, b: 0.58 },
};

const CONNECTOR_COLORS = {
  /* Next beat (linear) — solid black. */
  next: { r: 0.15, g: 0.15, b: 0.15 },
  /* Player choice / dialogue option — dashed red. */
  choice: { r: 0.78, g: 0.28, b: 0.28 },
  /* Branch / optional side-beat — dashed tan. */
  branch: { r: 0.55, g: 0.42, b: 0.20 },
  /* Widget-next (CC tab navigation) — light gray, secondary. */
  widget: { r: 0.6, g: 0.6, b: 0.6 },
};

const LAYOUT = {
  /* FigJam "wide" sticky width (~320px). One sticky per passage. */
  stickyWidth: 320,
  /* Generous gaps so connector labels have room between stickies. All values
     snap to a 16px grid per Design item #10. */
  layerGap: 176,
  columnGap: 176,
  sectionPadding: 80,
  beatHeaderClearance: 96,
  beatGap: 64,
  sectionGap: 320,
  zoneGap: 240,
  emptySectionWidth: 480,
  emptySectionHeight: 640,
  maxChainLength: 5,
};

const PLUGIN_NAMESPACE = "sizzle-story-sync";

figma.showUI(__html__, { width: 320, height: 360 });

figma.ui.onmessage = async (msg: UiMessage) => {
  if (msg.type === "cancel") {
    figma.closePlugin();
    return;
  }

  if (msg.type === "load-graph" && msg.graph) {
    try {
      await loadGraph(msg.graph);
      figma.ui.postMessage({ type: "load-complete", count: msg.graph.passages.length });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      figma.ui.postMessage({ type: "error", message });
    }
    return;
  }

  if (msg.type === "request-export") {
    /* Phase 3 — board export. Stub for now. */
    figma.ui.postMessage({ type: "error", message: "Export not implemented yet (Phase 3)." });
    return;
  }
};

interface LayoutResult {
  width: number;
  height: number;
  stickyByPassage: Map<string, StickyNode>;
  createdNodes: SceneNode[];
}

async function loadGraph(graph: StoryGraph): Promise<void> {
  /* FigJam stickies use Inter; load weights up-front so sticky.text.characters
     assignments succeed synchronously inside the layout loop. */
  await figma.loadFontAsync({ family: "Inter", style: "Medium" });
  await figma.loadFontAsync({ family: "Inter", style: "Regular" });

  /* Pre-compute outgoing wiki-link counts per source passage so we can classify
     connectors: a source with multiple outgoing wiki edges renders each as a
     player-choice (dashed red); a single outgoing wiki edge is a linear next
     beat (solid black). Widget edges and self-loops are excluded from the
     count. */
  const outgoingWikiCount = new Map<string, number>();
  for (const edge of graph.edges) {
    if (edge.from === edge.to) continue;
    if (edge.linkType.indexOf("widget-") === 0) continue;
    outgoingWikiCount.set(edge.from, (outgoingWikiCount.get(edge.from) ?? 0) + 1);
  }

  const stickyByPassage = new Map<string, StickyNode>();
  const createdNodes: SceneNode[] = [];
  let briefingBottom = 0;

  /* === Top zone: Prologue · Briefing with nested beat sub-sections ===

     Per Design item #6, INTRO is split into Beat 1 (100-199, Diner setup),
     Beat 2 (200-499, The briefing) and Beat 3 (500+, Closing). Each beat is
     its own inner section; an outer section wraps them. */
  const introSection = graph.sections.find((s) => s.id === "act-intro");
  if (introSection) {
    const introPassages = graph.passages.filter((p) => sectionIdForPassage(p) === "act-intro");
    const byBeat = new Map<string, StoryGraphPassage[]>();
    for (const passage of introPassages) {
      const beat = beatForIntroPassage(passage.name);
      if (!beat) continue;
      let bucket = byBeat.get(beat.id);
      if (!bucket) {
        bucket = [];
        byBeat.set(beat.id, bucket);
      }
      bucket.push(passage);
    }

    const beatIds = ["beat-1", "beat-2", "beat-3"];
    const outerOriginX = LAYOUT.sectionPadding;
    const outerOriginY = LAYOUT.sectionPadding;
    let beatCursorY = outerOriginY + LAYOUT.beatHeaderClearance;
    let outerMaxRight = outerOriginX + LAYOUT.sectionPadding + LAYOUT.stickyWidth;

    for (const beatId of beatIds) {
      const beatPassages = byBeat.get(beatId);
      if (!beatPassages || beatPassages.length === 0) continue;
      const beatMeta = beatForIntroPassage(beatPassages[0].name)!;

      const innerStickyOriginX = outerOriginX + LAYOUT.sectionPadding * 2;
      const innerStickyOriginY = beatCursorY + LAYOUT.beatHeaderClearance;
      const result = await layoutPassagesInBox(beatPassages, graph.edges, innerStickyOriginX, innerStickyOriginY);

      for (const [name, sticky] of result.stickyByPassage) stickyByPassage.set(name, sticky);
      createdNodes.push(...result.createdNodes);

      const beatWidth = result.width + LAYOUT.sectionPadding * 2;
      const beatHeight = result.height + LAYOUT.beatHeaderClearance + LAYOUT.sectionPadding;
      const beatSection = createBeatSection(
        beatMeta.label,
        outerOriginX + LAYOUT.sectionPadding,
        beatCursorY,
        beatWidth,
        beatHeight,
      );
      createdNodes.push(beatSection);

      beatCursorY += beatHeight + LAYOUT.beatGap;
      outerMaxRight = Math.max(outerMaxRight, outerOriginX + LAYOUT.sectionPadding + beatWidth);
    }

    const outerWidth = (outerMaxRight - outerOriginX) + LAYOUT.sectionPadding;
    const outerHeight = beatCursorY - outerOriginY - LAYOUT.beatGap + LAYOUT.sectionPadding;
    const outer = createSectionNode(introSection, outerOriginX, outerOriginY, outerWidth, outerHeight);
    createdNodes.push(outer);
    briefingBottom = outerOriginY + outerHeight;
  }

  /* === Bottom zone: all other sections placed below the briefing ===

     Per Design item #2 (partial), Character Creation no longer sits inline
     beside the narrative — it moves to its own zone below. System and any
     placeholder sections (Act 1 concept) join it in a left-to-right row. */
  let bottomCursorX = LAYOUT.sectionPadding;
  const bottomY = briefingBottom + LAYOUT.zoneGap;

  for (const section of graph.sections) {
    if (section.id === "act-intro") continue;

    const sectionPassages = graph.passages.filter((p) => sectionIdForPassage(p) === section.id);

    if (sectionPassages.length === 0) {
      const node = createSectionNode(section, bottomCursorX, bottomY, LAYOUT.emptySectionWidth, LAYOUT.emptySectionHeight);
      createdNodes.push(node);
      bottomCursorX += LAYOUT.emptySectionWidth + LAYOUT.sectionGap;
      continue;
    }

    const innerStickyOriginX = bottomCursorX + LAYOUT.sectionPadding;
    const innerStickyOriginY = bottomY + LAYOUT.sectionPadding;
    const result = await layoutPassagesInBox(sectionPassages, graph.edges, innerStickyOriginX, innerStickyOriginY);

    for (const [name, sticky] of result.stickyByPassage) stickyByPassage.set(name, sticky);
    createdNodes.push(...result.createdNodes);

    const sectionWidth = result.width + LAYOUT.sectionPadding * 2;
    const sectionHeight = result.height + LAYOUT.sectionPadding * 2;
    const node = createSectionNode(section, bottomCursorX, bottomY, sectionWidth, sectionHeight);
    createdNodes.push(node);

    bottomCursorX += sectionWidth + LAYOUT.sectionGap;
  }

  /* === Connectors with classification (Design item #4) ===

     Magnets are picked from the source-vs-target spatial relationship so
     elbowed lines route OUT of the row through the column gap (RIGHT->LEFT
     for same-row forward, BOTTOM->TOP for downward, etc.) instead of the
     AUTO heuristic which often elbowed back through the next sticky.

     Labels on chain-adjacent connectors (source and target in the same row,
     in adjacent columns) are skipped: the visual proximity already implies
     the link, and the wiki display text was sitting on top of the next
     sticky's body. Labels on cross-row / cross-section connectors stay.

     Convergent labels (multiple edges that share linkText AND target — e.g.
     INTRO-200 and INTRO-200a both linking to INTRO-205 with "The weight of
     those words settles...") are de-duplicated: the first occurrence keeps
     the label, parallel duplicates render unlabeled. */
  const labeledConvergence = new Set<string>();
  for (const edge of graph.edges) {
    if (edge.linkType === "widget-back") continue;

    const source = stickyByPassage.get(edge.from);
    const target = stickyByPassage.get(edge.to);
    if (!source || !target) continue;

    const wikiCount = outgoingWikiCount.get(edge.from) ?? 0;
    const toBranch = isBranchPassage(edge.to);
    const fromBranch = isBranchPassage(edge.from);
    const style = classifyEdge(edge, wikiCount, toBranch, fromBranch);
    const magnets = magnetsForRelativePosition(source, target);
    const chainAdjacent = isChainAdjacent(source, target);

    const connector = figma.createConnector();
    connector.connectorStart = { endpointNodeId: source.id, magnet: magnets.start };
    connector.connectorEnd = { endpointNodeId: target.id, magnet: magnets.end };
    connector.connectorLineType = "ELBOWED";
    connector.strokes = [{ type: "SOLID", color: style.color }];
    if (style.dashPattern.length > 0) {
      connector.dashPattern = style.dashPattern;
    }
    connector.strokeWeight = style.weight;
    connector.setPluginData("kind", "link");
    connector.setPluginData("linkType", edge.linkType);
    connector.setPluginData("styleKind", style.kind);
    connector.setPluginData("from", edge.from);
    connector.setPluginData("to", edge.to);
    connector.setPluginData("namespace", PLUGIN_NAMESPACE);

    const convergenceKey = `${edge.linkText ?? ""}::${edge.to}`;
    const alreadyLabeled = edge.linkText ? labeledConvergence.has(convergenceKey) : false;

    if (style.showLabel && edge.linkText && !chainAdjacent && !alreadyLabeled) {
      connector.text.characters = truncate(edge.linkText, 30);
      connector.textBackground.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
      labeledConvergence.add(convergenceKey);
    }
    createdNodes.push(connector);
  }

  figma.viewport.scrollAndZoomIntoView(createdNodes);
}

/* Lay out a slice of passages inside an arbitrary box. Returns the occupied
   width/height so callers can size their containing section. Layout flow:
   BFS layering -> row grouping (with chain compaction) -> top-to-bottom rows
   of stickies whose height is measured after creation so long bodies don't
   collide with the next row. */
async function layoutPassagesInBox(
  passages: StoryGraphPassage[],
  edges: StoryGraphEdge[],
  originX: number,
  originY: number,
): Promise<LayoutResult> {
  const stickyByPassage = new Map<string, StickyNode>();
  const createdNodes: SceneNode[] = [];

  if (passages.length === 0) {
    return { width: LAYOUT.stickyWidth, height: 0, stickyByPassage, createdNodes };
  }

  const layerByPassage = bfsLayers(passages, edges);
  const layers = groupByLayer(passages, layerByPassage);
  const rows = groupLayersIntoRows(layers, LAYOUT.maxChainLength);

  let rowCursorY = originY;
  let maxRight = originX;

  for (const passagesInRow of rows) {
    let rowHeight = 0;

    for (let index = 0; index < passagesInRow.length; index += 1) {
      const passage = passagesInRow[index];
      const x = originX + index * (LAYOUT.stickyWidth + LAYOUT.columnGap);
      const sticky = await createSceneSticky(passage, x, rowCursorY);

      if (sticky.height > rowHeight) rowHeight = sticky.height;
      stickyByPassage.set(passage.name, sticky);
      createdNodes.push(sticky);
      maxRight = Math.max(maxRight, x + LAYOUT.stickyWidth);
    }

    rowCursorY += rowHeight + LAYOUT.layerGap;
  }

  return {
    width: maxRight - originX,
    height: rowCursorY - originY - LAYOUT.layerGap,
    stickyByPassage,
    createdNodes,
  };
}

function createSectionNode(section: StoryGraphSection, x: number, y: number, width: number, height: number): SectionNode {
  const sectionNode = figma.createSection();
  sectionNode.name = section.name;
  sectionNode.x = x;
  sectionNode.y = y;
  sectionNode.resizeWithoutConstraints(width, height);
  const sectionFill = STICKY_COLORS[section.color] ?? STICKY_COLORS.light_gray;
  sectionNode.fills = [{ type: "SOLID", color: sectionFill, opacity: 0.15 }];
  sectionNode.setPluginData("kind", "section");
  sectionNode.setPluginData("sectionId", section.id);
  sectionNode.setPluginData("namespace", PLUGIN_NAMESPACE);
  return sectionNode;
}

/* Shortest-path BFS layering: each passage's layer = shortest distance from
   any root, where a root is a passage with no in-section incoming edges.
   Cycles are handled naturally (first visit wins). Orphans (unreachable from
   any root, typically because they're inside a cycle with no entry point)
   land on a trailing layer so they're visible rather than dropped. */
function bfsLayers(passages: StoryGraphPassage[], edges: StoryGraphEdge[]): Map<string, number> {
  const passageSet = new Set(passages.map((p) => p.name));
  const adjacency = new Map<string, string[]>();
  const inDegree = new Map<string, number>();

  for (const passage of passages) {
    adjacency.set(passage.name, []);
    inDegree.set(passage.name, 0);
  }

  for (const edge of edges) {
    if (edge.from === edge.to) continue;
    if (!passageSet.has(edge.from) || !passageSet.has(edge.to)) continue;
    adjacency.get(edge.from)!.push(edge.to);
    inDegree.set(edge.to, (inDegree.get(edge.to) ?? 0) + 1);
  }

  const layer = new Map<string, number>();
  const queue: string[] = [];

  function drainQueue(): void {
    while (queue.length > 0) {
      const current = queue.shift()!;
      const currentLayer = layer.get(current) ?? 0;
      for (const next of adjacency.get(current) ?? []) {
        if (!layer.has(next)) {
          layer.set(next, currentLayer + 1);
          queue.push(next);
        }
      }
    }
  }

  /* Seed with passages that have no in-section incoming edges (true roots). */
  for (const passage of passages) {
    if ((inDegree.get(passage.name) ?? 0) === 0) {
      layer.set(passage.name, 0);
      queue.push(passage.name);
    }
  }
  drainQueue();

  /* Any passages still unvisited form a cycle with no in-section entry point
     (e.g. CC tabs, which are bidirectional and have no true root). Seed each
     remaining component from its alphabetically-smallest passage. */
  while (true) {
    const unvisited = passages.filter((p) => !layer.has(p.name));
    if (unvisited.length === 0) break;
    unvisited.sort((a, b) => a.name.localeCompare(b.name));
    const seed = unvisited[0].name;
    layer.set(seed, 0);
    queue.push(seed);
    drainQueue();
  }

  return layer;
}

/* Collapse runs of single-passage layers into shared horizontal rows. A row
   is either:
     - a single multi-passage layer (a branch — passages render side-by-side
       in BFS order), or
     - a chain of consecutive single-passage layers up to maxChainLength
       (linear stretches render as a horizontal ribbon).
   A multi-passage layer always flushes the chain buffer first so branches
   stay vertically separated from their preceding chain. */
function groupLayersIntoRows(
  layers: StoryGraphPassage[][],
  maxChainLength: number,
): StoryGraphPassage[][] {
  const rows: StoryGraphPassage[][] = [];
  let chain: StoryGraphPassage[] = [];

  function flush(): void {
    if (chain.length > 0) {
      rows.push(chain);
      chain = [];
    }
  }

  for (const layer of layers) {
    if (layer.length === 1) {
      chain.push(layer[0]);
      if (chain.length >= maxChainLength) flush();
    } else {
      flush();
      rows.push(layer);
    }
  }
  flush();

  return rows;
}

function groupByLayer(
  passages: StoryGraphPassage[],
  layerByPassage: Map<string, number>,
): StoryGraphPassage[][] {
  const byLayer = new Map<number, StoryGraphPassage[]>();
  for (const passage of passages) {
    const layer = layerByPassage.get(passage.name) ?? 0;
    let bucket = byLayer.get(layer);
    if (!bucket) {
      bucket = [];
      byLayer.set(layer, bucket);
    }
    bucket.push(passage);
  }
  /* Within a layer, sort by passage name so siblings appear in a stable order. */
  for (const bucket of byLayer.values()) {
    bucket.sort((a, b) => a.name.localeCompare(b.name));
  }
  return Array.from(byLayer.keys())
    .sort((a, b) => a - b)
    .map((layer) => byLayer.get(layer)!);
}

/* Single sticky per scene per Design item #1. The first line carries the
   passage name plus chips for time-of-day and branch status (Design #3, #5);
   subsequent lines are the cleaned prose body. The FigJam author footer is
   suppressed via authorVisible=false (Design #3). Round-trip identity travels
   on the sticky's pluginData. */
async function createSceneSticky(
  passage: StoryGraphPassage,
  x: number,
  y: number,
): Promise<StickyNode> {
  const sticky = figma.createSticky();
  sticky.isWideWidth = true;
  sticky.x = x;
  sticky.y = y;
  sticky.authorVisible = false;

  const branch = isBranchPassage(passage.name);
  const fillKey = branch ? "tan" : colorForPrefix(passage.prefix);
  const fill = STICKY_COLORS[fillKey] ?? STICKY_COLORS.light_gray;
  sticky.fills = [{ type: "SOLID", color: fill }];
  sticky.text.characters = buildStickyText(passage, branch);

  sticky.setPluginData("kind", "scene");
  sticky.setPluginData("passageName", passage.name);
  sticky.setPluginData("prefix", passage.prefix);
  sticky.setPluginData("act", passage.act);
  sticky.setPluginData("sourceFile", passage.sourceFile);
  sticky.setPluginData("tags", JSON.stringify(passage.tags));
  sticky.setPluginData("rawBody", passage.body);
  sticky.setPluginData("namespace", PLUGIN_NAMESPACE);
  if (branch) sticky.setPluginData("branch", "true");

  return sticky;
}

function buildStickyText(passage: StoryGraphPassage, branch: boolean): string {
  const chips: string[] = [];
  if (passage.tags.indexOf("daytime") !== -1) chips.push("DAY");
  if (passage.tags.indexOf("nighttime") !== -1) chips.push("NIGHT");
  if (branch) chips.push("BRANCH");

  const titleLine = chips.length > 0 ? `${passage.name}  ·  ${chips.join("  ·  ")}` : passage.name;
  const body = passage.displayBody || passage.summary || "";
  return `${titleLine}\n\n${body}`;
}

/* Branch passages follow the convention <PREFIX>-<NUMBER><lowercase>, e.g.
   INTRO-200a, INTRO-200b. They get a tan tint and a BRANCH chip per Design
   item #5. */
function isBranchPassage(name: string): boolean {
  return /-\d+[a-z]+($|\s)/.test(name);
}

/* Beat mapping for the Prologue · Briefing section per Design item #6.
   Boundaries chosen by passage number ranges that match the narrative arc:
   100s = arrival/setup, 200-499 = the actual briefing dialogue, 500+ =
   player questions / departure. */
function beatForIntroPassage(name: string): { id: string; label: string; order: number } | null {
  const match = name.match(/^INTRO-(\d+)/);
  if (!match) return null;
  const n = parseInt(match[1], 10);
  if (n < 200) return { id: "beat-1", label: "Beat 1 · Diner setup", order: 0 };
  if (n < 500) return { id: "beat-2", label: "Beat 2 · The briefing", order: 1 };
  return { id: "beat-3", label: "Beat 3 · Closing", order: 2 };
}

/* Inner beat sub-section inside the outer Prologue · Briefing wrapper.
   Slightly warmer / lower-opacity tint than the prefix section so the
   nesting is visible without competing with the outer section's color. */
function createBeatSection(label: string, x: number, y: number, width: number, height: number): SectionNode {
  const node = figma.createSection();
  node.name = label;
  node.x = x;
  node.y = y;
  node.resizeWithoutConstraints(width, height);
  node.fills = [{ type: "SOLID", color: { r: 0.95, g: 0.93, b: 0.88 }, opacity: 0.35 }];
  node.setPluginData("kind", "beat-section");
  node.setPluginData("namespace", PLUGIN_NAMESPACE);
  return node;
}

interface EdgeStyle {
  kind: "next" | "choice" | "branch" | "widget";
  color: RGB;
  dashPattern: number[];
  weight: number;
  showLabel: boolean;
}

/* Connector classification per Design item #4. Precedence: widget < next <
   branch < choice. Branch edges trump choice so that the "branch" visual
   wins on a fork into a labelled side passage (INTRO-200 -> INTRO-200a). */
function classifyEdge(
  edge: StoryGraphEdge,
  outgoingWikiCount: number,
  toIsBranch: boolean,
  fromIsBranch: boolean,
): EdgeStyle {
  if (edge.linkType.indexOf("widget-") === 0) {
    return {
      kind: "widget",
      color: CONNECTOR_COLORS.widget,
      dashPattern: [3, 6],
      weight: 1,
      showLabel: false,
    };
  }
  if (toIsBranch || fromIsBranch) {
    return {
      kind: "branch",
      color: CONNECTOR_COLORS.branch,
      dashPattern: [6, 6],
      weight: 1.5,
      showLabel: true,
    };
  }
  if (outgoingWikiCount > 1) {
    return {
      kind: "choice",
      color: CONNECTOR_COLORS.choice,
      dashPattern: [8, 6],
      weight: 1.5,
      showLabel: true,
    };
  }
  return {
    kind: "next",
    color: CONNECTOR_COLORS.next,
    dashPattern: [],
    weight: 1.75,
    showLabel: true,
  };
}

function sectionIdForPassage(passage: StoryGraphPassage): string {
  return `act-${(passage.prefix || "misc").toLowerCase()}`;
}

function colorForPrefix(prefix: string): string {
  switch (prefix) {
    case "CC":
      return "green";
    case "INTRO":
      return "blue";
    case "QW":
      return "yellow";
    case "SZ":
      return "red";
    case "BRANCH":
      return "light_gray";
    case "NPC":
      return "violet";
    case "APT":
      return "orange";
    case "SYS":
      return "dark_gray";
    default:
      return "light_gray";
  }
}

function truncate(value: string, max: number): string {
  if (value.length <= max) return value;
  return `${value.slice(0, max - 1)}…`;
}

/* Pick connector endpoint magnets based on the spatial relationship of the
   two stickies. Forces the elbowed line to exit the row through the column
   gap rather than routing through neighbour stickies. */
type Magnet = "NONE" | "AUTO" | "TOP" | "LEFT" | "BOTTOM" | "RIGHT" | "CENTER";

function magnetsForRelativePosition(
  source: StickyNode,
  target: StickyNode,
): { start: Magnet; end: Magnet } {
  const sourceCenterY = source.y + source.height / 2;
  const targetCenterY = target.y + target.height / 2;
  const sourceCenterX = source.x + source.width / 2;
  const targetCenterX = target.x + target.width / 2;
  const dx = targetCenterX - sourceCenterX;
  const dy = targetCenterY - sourceCenterY;
  const sameRow = Math.abs(dy) < Math.min(source.height, target.height) / 2;

  if (sameRow) {
    return dx >= 0
      ? { start: "RIGHT", end: "LEFT" }
      : { start: "LEFT", end: "RIGHT" };
  }
  return dy > 0
    ? { start: "BOTTOM", end: "TOP" }
    : { start: "TOP", end: "BOTTOM" };
}

/* Two stickies are "chain adjacent" when they sit in the same row and are
   close enough horizontally that there's no room for a connector label
   between them. We skip labels in that case (the visual proximity carries
   the linear-flow meaning) so the label doesn't end up on the next sticky. */
function isChainAdjacent(source: StickyNode, target: StickyNode): boolean {
  const sourceCenterY = source.y + source.height / 2;
  const targetCenterY = target.y + target.height / 2;
  const sameRow = Math.abs(targetCenterY - sourceCenterY) < Math.min(source.height, target.height) / 2;
  if (!sameRow) return false;
  const horizontalGap = Math.abs((target.x) - (source.x + source.width));
  return horizontalGap < LAYOUT.columnGap * 1.5;
}
