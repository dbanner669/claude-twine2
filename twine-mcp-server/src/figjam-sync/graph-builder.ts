import { promises as fs } from "fs";
import * as path from "path";

import * as he from "he";

import { parseTwee } from "../twine-parser";
import { extractTypedLinks } from "../sugarcube-tools";

export interface StoryGraphPassage {
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

export interface StoryGraphEdge {
  from: string;
  to: string;
  linkType: string;
  linkText?: string;
}

export interface StoryGraphSection {
  id: string;
  name: string;
  color: string;
}

export interface StoryGraph {
  generatedAt: string;
  story: string;
  passages: StoryGraphPassage[];
  edges: StoryGraphEdge[];
  sections: StoryGraphSection[];
}

const PREFIX_TO_ACT: Record<string, string> = {
  CC: "Prologue · Character Creation",
  INTRO: "Prologue · Briefing",
  QW: "Act 1 · Queen West",
  SZ: "Act 2 · Sizzle Interior",
  BRANCH: "Branch HQ / Handler",
  NPC: "NPC Scenes",
  APT: "Player Apartment",
  SYS: "System / Entry",
};

const PREFIX_COLORS: Record<string, string> = {
  CC: "green",
  INTRO: "blue",
  QW: "yellow",
  SZ: "red",
  BRANCH: "light_gray",
  NPC: "violet",
  APT: "orange",
  SYS: "dark_gray",
};

const SYSTEM_PASSAGE_NAMES = new Set(["Start"]);

const PLANNED_SECTIONS: StoryGraphSection[] = [
  { id: "concept-act-1", name: "Act 1 · Insertion (concept)", color: "yellow" },
];

function prefixOf(name: string): string {
  if (SYSTEM_PASSAGE_NAMES.has(name)) return "SYS";
  const match = name.match(/^([A-Z]+)-/);
  return match ? match[1] : "";
}

function actOf(prefix: string): string {
  return PREFIX_TO_ACT[prefix] ?? "Unsorted";
}

function unescapeQuoted(text: string, quote: '"' | "'"): string {
  return text.split(`\\${quote}`).join(quote);
}

function stripSugarCubeStructure(body: string): string {
  let text = body;
  /* Drop <<silently>>...<</silently>> setup blocks. */
  text = text.replace(/<<silently>>[\s\S]*?<<\/silently>>/g, "");
  /* Extract the display text from <<link 'display' ...>>...<</link>> and
     <<button 'display' ...>>...<</button>> blocks. The block body is the
     click handler (<<set>>/<<goto>> logic, not story prose); the display
     argument is the choice label, which we want to keep. The wrapping
     quote can be ' or ", and may contain the opposite quote freely or its
     own quote escaped with a backslash (e.g. `Master\'s`). Captured HTML
     spans get cleaned up by the later HTML-strip pass. Captured escape
     sequences are unescaped after the replace. */
  text = text.replace(
    /<<link\s+'((?:\\'|[^'])*)'[\s\S]*?<<\/link>>/g,
    (_full, display) => `\n• ${unescapeQuoted(display, "'")}\n`,
  );
  text = text.replace(
    /<<link\s+"((?:\\"|[^"])*)"[\s\S]*?<<\/link>>/g,
    (_full, display) => `\n• ${unescapeQuoted(display, '"')}\n`,
  );
  text = text.replace(
    /<<button\s+'((?:\\'|[^'])*)'[\s\S]*?<<\/button>>/g,
    (_full, display) => `\n• ${unescapeQuoted(display, "'")}\n`,
  );
  text = text.replace(
    /<<button\s+"((?:\\"|[^"])*)"[\s\S]*?<<\/button>>/g,
    (_full, display) => `\n• ${unescapeQuoted(display, '"')}\n`,
  );
  /* Drop /* ... *\/ SugarCube comments. */
  text = text.replace(/\/\*[\s\S]*?\*\//g, "");
  /* For <<if>>...<<elseif>>...<<else>>...<</if>>, keep only the first branch's body. */
  text = text.replace(
    /<<if\s[\s\S]*?>>([\s\S]*?)(?:<<elseif[\s\S]*?<<\/if>>|<<else>>[\s\S]*?<<\/if>>|<<\/if>>)/g,
    "$1",
  );
  /* Drop trailing-backslash line continuations. */
  text = text.replace(/\\$/gm, "");
  /* Replace <<term "Key">> / <<term "Key" "Label">> with the visible label so
     glossary hover terms survive macro stripping. Without this, the generic
     macro sweep below erases them and leaves blank gaps in the sticky text. */
  text = text.replace(
    /<<term\s+(?:'((?:\\'|[^'])*)'|"((?:\\"|[^"])*)")(?:\s+(?:'((?:\\'|[^'])*)'|"((?:\\"|[^"])*)"))?\s*>>/g,
    (_full, k1, k2, l1, l2) => {
      const key = k1 !== undefined ? unescapeQuoted(k1, "'") : unescapeQuoted(k2 ?? "", '"');
      const label =
        l1 !== undefined
          ? unescapeQuoted(l1, "'")
          : l2 !== undefined
            ? unescapeQuoted(l2, '"')
            : key;
      return label;
    },
  );
  /* Drop any remaining macros. */
  text = text.replace(/<<[\s\S]*?>>/g, "");
  /* Convert wiki links to "→ display" so the player choice / next beat is
     visually distinct in the sticky text (per FigJam round-trip feedback —
     the unmarked display text didn't read as a link target). Handles all
     four SugarCube wiki-link forms; for the bare [[target]] form the
     target itself becomes the display. */
  text = text.replace(/\[\[([^\]|\->]+)\|[^\]]+\]\]/g, "→ $1");
  text = text.replace(/\[\[([^\]|\->]+)->[^\]]+\]\]/g, "→ $1");
  text = text.replace(/\[\[[^\]]+<-([^\]]+)\]\]/g, "→ $1");
  text = text.replace(/\[\[([^\]]+)\]\]/g, "→ $1");
  /* Separate adjacent HTML tags with a space so that <span>A</span><span>B</span>
     reads as "A B" after tag removal, not "AB". */
  text = text.replace(/></g, "> <");
  /* Drop raw HTML tags. */
  text = text.replace(/<[^>]+>/g, "");
  return text;
}

function summaryOf(body: string): string {
  const cleaned = he.decode(stripSugarCubeStructure(body)).replace(/\s+/g, " ").trim();
  if (cleaned.length <= 160) return cleaned;
  return cleaned.slice(0, 157).trimEnd() + "…";
}

const DISPLAY_BODY_LIMIT = 600;

function displayBodyOf(body: string): string {
  /* Preserve paragraph breaks so the body sticky reads as prose, but strip
     SugarCube structure, decode HTML entities (&middot;, &amp;, &nbsp;, etc.),
     and cap length so all bodies are roughly uniform. */
  const cleaned = he
    .decode(stripSugarCubeStructure(body))
    /* Collapse intra-line whitespace runs to single spaces. */
    .replace(/[ \t]+/g, " ")
    /* Drop trailing whitespace on every line so blank-with-spaces lines
       become true blank lines (matters where macros lived on indented
       lines and left spacing behind after stripping). */
    .replace(/[ \t]+$/gm, "")
    /* Collapse 2+ blank lines down to a single blank line. */
    .replace(/\n{3,}/g, "\n\n")
    .replace(/^\s+|\s+$/g, "");
  if (cleaned.length <= DISPLAY_BODY_LIMIT) return cleaned;
  return cleaned.slice(0, DISPLAY_BODY_LIMIT - 1).replace(/\s+\S*$/, "") + "…";
}

function wordCountOf(body: string): number {
  return stripSugarCubeStructure(body).split(/\s+/).filter(Boolean).length;
}

/* Project-specific widgets that take passage names as string arguments and
   render navigation. The link extractor sees the widget call as a macro and
   strips it; we re-discover the implied edges here so layout/connectors
   reflect the real story flow. */
function extractWidgetEdges(text: string, fromName: string): StoryGraphEdge[] {
  const edges: StoryGraphEdge[] = [];

  /* <<ccDossierFooter step "backTarget" "nextTarget" ...>>
     args[0] = step number
     args[1] = back passage name (optional, may be "")
     args[2] = next passage name (optional, may be "")
     args[3..] = label overrides (ignored) */
  const footerRe = /<<ccDossierFooter\s+\d+\s+"([^"]*)"\s+"([^"]*)"/g;
  let match: RegExpExecArray | null;
  while ((match = footerRe.exec(text)) !== null) {
    const back = match[1].trim();
    const next = match[2].trim();
    if (back) {
      edges.push({ from: fromName, to: back, linkType: "widget-back", linkText: "Back" });
    }
    if (next) {
      edges.push({ from: fromName, to: next, linkType: "widget-next", linkText: "Continue" });
    }
  }

  return edges;
}

export async function buildGraphFromDirectory(contentDir: string, storyName: string): Promise<StoryGraph> {
  const entries = await fs.readdir(contentDir);
  const tweeFiles = entries.filter((name) => name.endsWith(".twee"));

  const passages: StoryGraphPassage[] = [];
  const edges: StoryGraphEdge[] = [];
  const sectionMap = new Map<string, StoryGraphSection>();

  for (const file of tweeFiles) {
    const absPath = path.join(contentDir, file);
    const source = await fs.readFile(absPath, "utf8");
    const story = parseTwee(source);

    for (const passage of story.passages) {
      const prefix = prefixOf(passage.name);
      const act = actOf(prefix);
      const color = PREFIX_COLORS[prefix] ?? "light_gray";
      const sectionId = `act-${prefix.toLowerCase() || "misc"}`;

      if (!sectionMap.has(sectionId)) {
        sectionMap.set(sectionId, { id: sectionId, name: act, color });
      }

      passages.push({
        id: passage.name,
        name: passage.name,
        prefix,
        act,
        tags: passage.tags ?? [],
        summary: summaryOf(passage.text),
        displayBody: displayBodyOf(passage.text),
        body: passage.text,
        sourceFile: path.relative(path.resolve(contentDir, "..", "..", ".."), absPath).replace(/\\/g, "/"),
        wordCount: wordCountOf(passage.text),
      });

      for (const link of extractTypedLinks(passage.text)) {
        if (!link.target) continue;
        edges.push({
          from: passage.name,
          to: link.target,
          linkType: link.type,
          linkText: link.display,
        });
      }

      for (const widgetEdge of extractWidgetEdges(passage.text, passage.name)) {
        edges.push(widgetEdge);
      }
    }
  }

  const sections = Array.from(sectionMap.values());
  for (const planned of PLANNED_SECTIONS) {
    if (!sections.find((existing) => existing.id === planned.id)) {
      sections.push(planned);
    }
  }

  return {
    generatedAt: new Date().toISOString(),
    story: storyName,
    passages,
    edges,
    sections,
  };
}
