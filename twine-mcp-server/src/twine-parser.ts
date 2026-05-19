import * as cheerio from "cheerio";

import type { TwinePassage, TwineStory } from "./types";

interface ParsedHeader {
  name: string;
  tags: string[];
  meta: string;
  index: number;
}

/**
 * Strip SugarCube setter syntax from a link target.
 * E.g. "Target][$var to true" → "Target"
 *       "Target][someExpr" → "Target"
 */
function stripSetter(target: string): string {
  const bracket = target.indexOf("][");
  return bracket !== -1 ? target.slice(0, bracket).trim() : target.trim();
}

export function extractLinks(text: string): string[] {
  const links: string[] = [];
  const re = /\[\[(.*?)\]\]/g;
  let match: RegExpExecArray | null;

  while ((match = re.exec(text)) !== null) {
    const inner = match[1];
    const arrow = inner.indexOf("->");
    const pipe = inner.indexOf("|");

    if (arrow !== -1) {
      links.push(stripSetter(inner.slice(arrow + 2)));
    } else if (pipe !== -1) {
      links.push(stripSetter(inner.slice(pipe + 1)));
    } else {
      links.push(stripSetter(inner));
    }
  }

  return links;
}

export function parseHtml(html: string): TwineStory {
  const $ = cheerio.load(html);
  const storyEl = $("tw-storydata");
  const story: TwineStory = {
    name: storyEl.attr("name") || "Untitled",
    ifid: storyEl.attr("ifid"),
    format: storyEl.attr("format"),
    formatVersion: storyEl.attr("format-version"),
    startPassage: undefined,
    passages: [],
  };

  const startPid = storyEl.attr("startnode");
  const styleEl = $("tw-storydata style[type='text/twine-css']");
  if (styleEl.length) {
    story.stylesheet = styleEl.text();
  }

  const scriptEl = $("tw-storydata script[type='text/twine-javascript']");
  if (scriptEl.length) {
    story.script = scriptEl.text();
  }

  $("tw-passagedata").each((_index, element) => {
    const passageEl = $(element);
    const pid = parseInt(passageEl.attr("pid") || "0", 10);
    const name = passageEl.attr("name") || "";
    const tagsStr = passageEl.attr("tags") || "";
    const posStr = passageEl.attr("position") || "";
    const sizeStr = passageEl.attr("size") || "";
    const text = passageEl.text();

    const passage: TwinePassage = {
      name,
      pid,
      tags: tagsStr ? tagsStr.split(/\s+/) : [],
      text,
      links: extractLinks(text),
    };

    if (posStr) {
      const [x, y] = posStr.split(",").map(Number);
      passage.position = { x, y };
    }

    if (sizeStr) {
      const [width, height] = sizeStr.split(",").map(Number);
      passage.size = { width, height };
    }

    if (String(pid) === startPid) {
      story.startPassage = name;
    }

    story.passages.push(passage);
  });

  return story;
}

export function storyToTwee(story: TwineStory): string {
  const lines: string[] = [];

  lines.push(":: StoryData");
  lines.push(
    JSON.stringify(
      {
        ifid: story.ifid || generateIfid(),
        format: story.format || "Harlowe",
        "format-version": story.formatVersion || "3.3.9",
        start: story.startPassage || story.passages[0]?.name || "Start",
      },
      null,
      2,
    ),
  );
  lines.push("");
  lines.push(":: StoryTitle");
  lines.push(story.name);
  lines.push("");

  if (story.stylesheet) {
    lines.push(":: UserStylesheet [stylesheet]");
    lines.push(story.stylesheet);
    lines.push("");
  }

  if (story.script) {
    lines.push(":: UserScript [script]");
    lines.push(story.script);
    lines.push("");
  }

  for (const passage of story.passages) {
    let header = `:: ${passage.name}`;
    if (passage.tags && passage.tags.length > 0) {
      header += ` [${passage.tags.join(" ")}]`;
    }
    if (passage.position) {
      header += ` {"position":"${passage.position.x},${passage.position.y}"}`;
    }

    lines.push(header);
    lines.push(passage.text);
    lines.push("");
  }

  return lines.join("\n");
}

export function parseTwee(twee: string): TwineStory {
  const story: TwineStory = {
    name: "Untitled",
    passages: [],
  };

  const headerRe = /^:: (.+)$/gm;
  const headers: ParsedHeader[] = [];
  let match: RegExpExecArray | null;

  while ((match = headerRe.exec(twee)) !== null) {
    const full = match[1];
    const tagMatch = full.match(/\[([^\]]*)\]/);
    const tags = tagMatch ? tagMatch[1].split(/\s+/).filter(Boolean) : [];
    const metaMatch = full.match(/\{([^}]*)\}/);
    const meta = metaMatch ? metaMatch[0] : "";
    const name = full.replace(/\s*\[.*/, "").replace(/\s*\{.*/, "").trim();
    headers.push({ name, tags, meta, index: match.index + match[0].length });
  }

  let pid = 1;
  for (let index = 0; index < headers.length; index += 1) {
    const start = headers[index].index;
    const end =
      index + 1 < headers.length
        ? twee.lastIndexOf("\n:: ", headers[index + 1].index) !== -1
          ? twee.indexOf(`\n:: ${headers[index + 1].name}`, start)
          : headers[index + 1].index - headers[index + 1].name.length - 4
        : twee.length;

    const text = twee.slice(start, end).replace(/^\n+/, "").replace(/\n+$/, "");
    const header = headers[index];

    if (header.name === "StoryTitle") {
      story.name = text.trim();
      continue;
    }

    if (header.name === "StoryData") {
      try {
        const data = JSON.parse(text) as {
          ifid?: string;
          format?: string;
          "format-version"?: string;
          start?: string;
        };
        story.ifid = data.ifid;
        story.format = data.format;
        story.formatVersion = data["format-version"];
        story.startPassage = data.start;
      } catch {
        // Ignore parse errors.
      }
      continue;
    }

    if (header.tags.includes("stylesheet")) {
      story.stylesheet = text;
      continue;
    }

    if (header.tags.includes("script")) {
      story.script = text;
      continue;
    }

    const passage: TwinePassage = {
      name: header.name,
      pid: pid++,
      tags: header.tags,
      text,
      links: extractLinks(text),
    };

    if (header.meta) {
      try {
        const meta = JSON.parse(header.meta) as { position?: string };
        if (meta.position) {
          const [x, y] = String(meta.position).split(",").map(Number);
          passage.position = { x, y };
        }
      } catch {
        // Ignore malformed metadata.
      }
    }

    story.passages.push(passage);
  }

  return story;
}

export function storyToHtml(story: TwineStory): string {
  const ifid = story.ifid || generateIfid();
  const startPid = story.passages.find((passage) => passage.name === story.startPassage)?.pid || 1;
  const format = story.format || "Harlowe";
  const formatVersion = story.formatVersion || "3.3.9";

  let html = `<tw-storydata name="${escapeAttr(story.name)}" startnode="${startPid}" creator="claude-twine-bridge" creator-version="0.1.0" format="${escapeAttr(format)}" format-version="${escapeAttr(formatVersion)}" ifid="${escapeAttr(ifid)}" options="" tags="" zoom="1" hidden>\n`;

  if (story.stylesheet) {
    html += `  <style role="stylesheet" id="twine-user-stylesheet" type="text/twine-css">${story.stylesheet}</style>\n`;
  }

  if (story.script) {
    html += `  <script role="script" id="twine-user-script" type="text/twine-javascript">${story.script}</script>\n`;
  }

  for (const passage of story.passages) {
    const tags = passage.tags?.join(" ") || "";
    const pos = passage.position ? `${passage.position.x},${passage.position.y}` : "0,0";
    const size = passage.size ? `${passage.size.width},${passage.size.height}` : "100,100";
    html += `  <tw-passagedata pid="${passage.pid}" name="${escapeAttr(passage.name)}" tags="${escapeAttr(tags)}" position="${pos}" size="${size}">${escapeHtml(passage.text)}</tw-passagedata>\n`;
  }

  html += "</tw-storydata>";
  return html;
}

function escapeAttr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function generateIfid(): string {
  const hex = () =>
    Math.floor(Math.random() * 0x10000)
      .toString(16)
      .padStart(4, "0")
      .toUpperCase();

  return `${hex()}${hex()}-${hex()}-4${hex().slice(1)}-${hex()}-${hex()}${hex()}${hex()}`;
}
