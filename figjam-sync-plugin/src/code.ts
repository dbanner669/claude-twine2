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
  titleHeight: 160,
  bodyHeight: 320,
  pairGap: 16,
  rowGap: 80,
  columnGap: 100,
  sectionPadding: 60,
  sectionGap: 280,
  columnsPerSection: 3,
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

  /* Layout: sections side by side, passages stacked in columns within each
     section. Each passage produces a title sticky + body sticky pair,
     connected with a thin straight connector. */
  let sectionCursorX = 0;

  for (const section of graph.sections) {
    const passagesInSection = graph.passages.filter((passage) => sectionIdForPassage(passage) === section.id);
    const columns = Math.max(1, Math.min(LAYOUT.columnsPerSection, passagesInSection.length || 1));
    const rows = Math.max(1, Math.ceil(passagesInSection.length / columns));
    const innerWidth = columns * LAYOUT.stickyWidth + (columns - 1) * LAYOUT.columnGap;
    const pairHeight = LAYOUT.titleHeight + LAYOUT.pairGap + LAYOUT.bodyHeight;
    const innerHeight = Math.max(pairHeight, rows * pairHeight + (rows - 1) * LAYOUT.rowGap);
    const sectionWidth = innerWidth + LAYOUT.sectionPadding * 2;
    const sectionHeight = innerHeight + LAYOUT.sectionPadding * 2;

    const sectionNode = figma.createSection();
    sectionNode.name = section.name;
    sectionNode.x = sectionCursorX;
    sectionNode.y = 0;
    sectionNode.resizeWithoutConstraints(sectionWidth, sectionHeight);
    const sectionFill = STICKY_COLORS[section.color] ?? STICKY_COLORS.light_gray;
    sectionNode.fills = [{ type: "SOLID", color: sectionFill, opacity: 0.15 }];
    sectionNode.setPluginData("kind", "section");
    sectionNode.setPluginData("sectionId", section.id);
    sectionNode.setPluginData("namespace", PLUGIN_NAMESPACE);

    for (let index = 0; index < passagesInSection.length; index += 1) {
      const passage = passagesInSection[index];
      const column = index % columns;
      const row = Math.floor(index / columns);
      const x = sectionCursorX + LAYOUT.sectionPadding + column * (LAYOUT.stickyWidth + LAYOUT.columnGap);
      const titleY = LAYOUT.sectionPadding + row * (pairHeight + LAYOUT.rowGap);
      const bodyY = titleY + LAYOUT.titleHeight + LAYOUT.pairGap;

      const titleSticky = await createPassageSticky(passage, "title", x, titleY);
      await createPassageSticky(passage, "body", x, bodyY);

      titleByPassage.set(passage.name, titleSticky);
    }

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
  }

  figma.viewport.scrollAndZoomIntoView([...figma.currentPage.children].filter((node) => node.removed === false));
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
