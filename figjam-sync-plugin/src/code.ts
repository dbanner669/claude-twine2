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
};

const BODY_COLOR: RGB = { r: 0.98, g: 0.97, b: 0.93 };

const LAYOUT = {
  stickyWidth: 240,
  pairGap: 16,
  layerGap: 100,
  columnGap: 80,
  sectionPadding: 60,
  sectionGap: 280,
  emptySectionWidth: 360,
  emptySectionHeight: 600,
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

async function loadGraph(graph: StoryGraph): Promise<void> {
  /* FigJam stickies use the "Inter Medium" font by default; load both weights
     for title and body stickies and for connector labels. */
  await figma.loadFontAsync({ family: "Inter", style: "Medium" });
  await figma.loadFontAsync({ family: "Inter", style: "Regular" });

  const titleByPassage = new Map<string, StickyNode>();
  const createdNodes: SceneNode[] = [];

  /* Layout: sections side by side. Within each section, passages are placed in
     BFS layers based on longest path from any entry point. Each layer is a row
     whose Y advances by the actual rendered height of the tallest pair in the
     previous layer, so long bodies never overlap the next row. */
  let sectionCursorX = 0;

  for (const section of graph.sections) {
    const passagesInSection = graph.passages.filter((passage) => sectionIdForPassage(passage) === section.id);

    if (passagesInSection.length === 0) {
      /* Empty placeholder (e.g. the Act 1 concept section). Draw an empty
         section at a default size so users have a target for new stickies. */
      const sectionNode = createSectionNode(section, sectionCursorX, 0, LAYOUT.emptySectionWidth, LAYOUT.emptySectionHeight);
      createdNodes.push(sectionNode);
      sectionCursorX += LAYOUT.emptySectionWidth + LAYOUT.sectionGap;
      continue;
    }

    const layerByPassage = bfsLayers(passagesInSection, graph.edges);
    const layers = groupByLayer(passagesInSection, layerByPassage);

    let layerCursorY = LAYOUT.sectionPadding;
    let sectionMaxRight = sectionCursorX;

    for (const passagesInLayer of layers) {
      let layerHeight = 0;
      const layerWidth =
        passagesInLayer.length * LAYOUT.stickyWidth + Math.max(0, passagesInLayer.length - 1) * LAYOUT.columnGap;
      const layerStartX = sectionCursorX + LAYOUT.sectionPadding;

      for (let index = 0; index < passagesInLayer.length; index += 1) {
        const passage = passagesInLayer[index];
        const x = layerStartX + index * (LAYOUT.stickyWidth + LAYOUT.columnGap);
        const titleY = layerCursorY;

        const titleSticky = await createPassageSticky(passage, "title", x, titleY);
        const bodyY = titleY + titleSticky.height + LAYOUT.pairGap;
        const bodySticky = await createPassageSticky(passage, "body", x, bodyY);

        const pairHeight = titleSticky.height + LAYOUT.pairGap + bodySticky.height;
        if (pairHeight > layerHeight) layerHeight = pairHeight;

        titleByPassage.set(passage.name, titleSticky);
        createdNodes.push(titleSticky, bodySticky);
        sectionMaxRight = Math.max(sectionMaxRight, x + LAYOUT.stickyWidth);
      }

      layerCursorY += layerHeight + LAYOUT.layerGap;
    }

    const sectionWidth = Math.max(sectionMaxRight - sectionCursorX + LAYOUT.sectionPadding, LAYOUT.stickyWidth + LAYOUT.sectionPadding * 2);
    const sectionHeight = layerCursorY - LAYOUT.layerGap + LAYOUT.sectionPadding;
    const sectionNode = createSectionNode(section, sectionCursorX, 0, sectionWidth, sectionHeight);
    createdNodes.push(sectionNode);

    sectionCursorX += sectionWidth + LAYOUT.sectionGap;
  }

  /* Inter-passage link connectors — drawn after all stickies exist so both
     endpoints resolve. Cross-section connectors are fine. */
  for (const edge of graph.edges) {
    const source = titleByPassage.get(edge.from);
    const target = titleByPassage.get(edge.to);
    if (!source || !target) continue;

    const connector = figma.createConnector();
    connector.connectorStart = { endpointNodeId: source.id, magnet: "AUTO" };
    connector.connectorEnd = { endpointNodeId: target.id, magnet: "AUTO" };
    connector.connectorLineType = "ELBOWED";
    connector.strokeWeight = 1.5;
    connector.setPluginData("kind", "link");
    connector.setPluginData("linkType", edge.linkType);
    connector.setPluginData("from", edge.from);
    connector.setPluginData("to", edge.to);
    connector.setPluginData("namespace", PLUGIN_NAMESPACE);

    if (edge.linkText) {
      connector.text.characters = truncate(edge.linkText, 60);
      connector.textBackground.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
    }
    createdNodes.push(connector);
  }

  figma.viewport.scrollAndZoomIntoView(createdNodes);
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

async function createPassageSticky(
  passage: StoryGraphPassage,
  kind: "title" | "body",
  x: number,
  y: number,
): Promise<StickyNode> {
  const sticky = figma.createSticky();
  sticky.x = x;
  sticky.y = y;

  if (kind === "title") {
    const fill = STICKY_COLORS[colorForPrefix(passage.prefix)] ?? STICKY_COLORS.light_gray;
    sticky.fills = [{ type: "SOLID", color: fill }];
    const tagSuffix = passage.tags.length ? `\n[${passage.tags.join(" ")}]` : "";
    sticky.text.characters = `${passage.name}${tagSuffix}\n\n${passage.summary}`;
  } else {
    sticky.isWideWidth = true;
    sticky.fills = [{ type: "SOLID", color: BODY_COLOR }];
    sticky.text.characters = passage.displayBody || passage.summary;
  }

  sticky.setPluginData("kind", kind);
  sticky.setPluginData("passageName", passage.name);
  sticky.setPluginData("prefix", passage.prefix);
  sticky.setPluginData("act", passage.act);
  sticky.setPluginData("sourceFile", passage.sourceFile);
  sticky.setPluginData("tags", JSON.stringify(passage.tags));
  sticky.setPluginData("namespace", PLUGIN_NAMESPACE);
  /* Source of truth for round-trip: raw Twee body stored only on body stickies. */
  if (kind === "body") {
    sticky.setPluginData("rawBody", passage.body);
  }

  return sticky;
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
