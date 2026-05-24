import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { store } from "./store";
import type { TwinePassage, TwineStory } from "./types";

interface ToolRegistrar {
  tool(
    name: string,
    description: string,
    params: Record<string, unknown>,
    handler: (args: any) => Promise<unknown> | unknown,
  ): void;
}

type TypedLinkType =
  | "wiki"
  | "wiki-arrow"
  | "wiki-reverse-arrow"
  | "goto"
  | "goto-variable"
  | "include"
  | "button"
  | "link"
  | "data-passage";

interface TypedLink {
  type: TypedLinkType;
  target: string;
  raw: string;
  display?: string;
}

interface IndexedTypedLink extends TypedLink {
  index: number;
}

interface VariableCount {
  name: string;
  count: number;
}

function jsonResult(value: unknown, isError = false) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(value, null, 2) }],
    ...(isError ? { isError: true } : {}),
  };
}

function textResult(text: string, isError = false) {
  return {
    content: [{ type: "text" as const, text }],
    ...(isError ? { isError: true } : {}),
  };
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function getStoryOrError(storyName: string): TwineStory | undefined {
  return store.get(storyName);
}

function getPassageOrError(storyName: string, passageName: string): TwinePassage | undefined {
  return store.getPassage(storyName, passageName);
}

function collectMatches(
  re: RegExp,
  text: string,
  map: Map<string, number>,
  transform?: (raw: string) => string,
): void {
  let match: RegExpExecArray | null;
  while ((match = re.exec(text)) !== null) {
    const raw = match[0];
    const name = transform ? transform(raw) : raw;
    map.set(name, (map.get(name) || 0) + 1);
  }
}

function sortedCounts(map: Map<string, number>): VariableCount[] {
  return [...map.entries()]
    .sort((left, right) => left[0].localeCompare(right[0]))
    .map(([name, count]) => ({ name, count }));
}

function stripVariablePrefix(name: string): string {
  if (name.startsWith("setup.")) {
    return name.slice("setup.".length);
  }
  return name.replace(/^[$_]/, "");
}

function matchesPrefix(name: string, prefix?: string): boolean {
  if (!prefix) {
    return true;
  }
  return name.startsWith(prefix) || stripVariablePrefix(name).startsWith(prefix);
}

function pushIndexedMatch(
  matches: IndexedTypedLink[],
  index: number,
  link: Omit<IndexedTypedLink, "index">,
): void {
  matches.push({ ...link, index });
}

/**
 * Strip SugarCube setter syntax from a wiki link target.
 * E.g. "Target][$var to true" → "Target"
 */
function stripSetter(target: string): string {
  const bracket = target.indexOf("][");
  return bracket !== -1 ? target.slice(0, bracket).trim() : target.trim();
}

export function extractTypedLinks(text: string): TypedLink[] {
  const matches: IndexedTypedLink[] = [];
  let match: RegExpExecArray | null;

  const wikiRe = /\[\[(.*?)\]\]/g;
  while ((match = wikiRe.exec(text)) !== null) {
    const inner = match[1].trim();
    const pipe = inner.indexOf("|");
    const arrow = inner.indexOf("->");
    const reverseArrow = inner.indexOf("<-");

    if (pipe !== -1) {
      pushIndexedMatch(matches, match.index, {
        type: "wiki",
        display: inner.slice(0, pipe).trim(),
        target: stripSetter(inner.slice(pipe + 1)),
        raw: match[0],
      });
    } else if (arrow !== -1) {
      pushIndexedMatch(matches, match.index, {
        type: "wiki-arrow",
        display: inner.slice(0, arrow).trim(),
        target: stripSetter(inner.slice(arrow + 2)),
        raw: match[0],
      });
    } else if (reverseArrow !== -1) {
      pushIndexedMatch(matches, match.index, {
        type: "wiki-reverse-arrow",
        display: inner.slice(reverseArrow + 2).trim(),
        target: stripSetter(inner.slice(0, reverseArrow)),
        raw: match[0],
      });
    } else {
      pushIndexedMatch(matches, match.index, {
        type: "wiki",
        target: stripSetter(inner),
        raw: match[0],
      });
    }
  }

  /* <<goto "literal">> — string-targeted goto */
  const gotoRe = /<<goto\s+["']([^"']+)["'][^>]*>>/g;
  while ((match = gotoRe.exec(text)) !== null) {
    pushIndexedMatch(matches, match.index, {
      type: "goto",
      target: match[1],
      raw: match[0],
    });
  }

  /* <<goto $variable>> or <<goto _variable>> — dynamic goto */
  const gotoVarRe = /<<goto\s+([$_][A-Za-z_]\w*(?:\.[A-Za-z_]\w*)*)\s*>>/g;
  while ((match = gotoVarRe.exec(text)) !== null) {
    pushIndexedMatch(matches, match.index, {
      type: "goto-variable",
      target: match[1],
      raw: match[0],
    });
  }

  const includeRe = /<<include\s+["']([^"']+)["'][^>]*>>/g;
  while ((match = includeRe.exec(text)) !== null) {
    pushIndexedMatch(matches, match.index, {
      type: "include",
      target: match[1],
      raw: match[0],
    });
  }

  const buttonRe = /<<button\s+["']([^"']+)["']\s+["']([^"']+)["'][^>]*>>/g;
  while ((match = buttonRe.exec(text)) !== null) {
    pushIndexedMatch(matches, match.index, {
      type: "button",
      display: match[1],
      target: match[2],
      raw: match[0],
    });
  }

  const linkRe = /<<link\s+["']([^"']+)["']\s+["']([^"']+)["'][^>]*>>/g;
  while ((match = linkRe.exec(text)) !== null) {
    pushIndexedMatch(matches, match.index, {
      type: "link",
      display: match[1],
      target: match[2],
      raw: match[0],
    });
  }

  const dataPassageRe = /data-passage\s*=\s*["']([^"']+)["']/g;
  while ((match = dataPassageRe.exec(text)) !== null) {
    pushIndexedMatch(matches, match.index, {
      type: "data-passage",
      target: match[1],
      raw: match[0],
    });
  }

  return matches
    .sort((left, right) => left.index - right.index)
    .map(({ index: _index, ...link }) => link);
}

function buildAdjacency(story: TwineStory): Map<string, Map<string, Set<TypedLinkType>>> {
  const allNames = new Set(story.passages.map((passage) => passage.name));
  const adjacency = new Map<string, Map<string, Set<TypedLinkType>>>();

  for (const passage of story.passages) {
    const edges = new Map<string, Set<TypedLinkType>>();
    for (const link of extractTypedLinks(passage.text)) {
      if (!allNames.has(link.target)) {
        continue;
      }

      const types = edges.get(link.target) || new Set<TypedLinkType>();
      types.add(link.type);
      edges.set(link.target, types);
    }
    adjacency.set(passage.name, edges);
  }

  return adjacency;
}

export function registerSugarCubeTools(mcpServer: McpServer): void {
  const server = mcpServer as unknown as ToolRegistrar;

  server.tool(
    "sc_extract_widgets",
    "Extract SugarCube widget definitions from passages tagged widget.",
    {
      storyName: z.string().describe("Name of the story"),
    },
    async ({ storyName }) => {
      const story = getStoryOrError(storyName);
      if (!story) {
        return textResult(`Story "${storyName}" not found.`, true);
      }

      const widgets: Array<{ name: string; sourcePassage: string }> = [];
      const widgetRe = /<<widget\s+["']([^"']+)["']\s*>>/g;

      for (const passage of story.passages) {
        if (!passage.tags?.includes("widget")) {
          continue;
        }

        let match: RegExpExecArray | null;
        while ((match = widgetRe.exec(passage.text)) !== null) {
          widgets.push({ name: match[1], sourcePassage: passage.name });
        }
      }

      return jsonResult(widgets);
    },
  );

  server.tool(
    "sc_extract_variables",
    "Scan passage text for SugarCube story, temp, and setup variable references.",
    {
      storyName: z.string().describe("Name of the story"),
      prefix: z.string().optional().describe("Optional variable name prefix filter"),
    },
    async ({ storyName, prefix }) => {
      const story = getStoryOrError(storyName);
      if (!story) {
        return textResult(`Story "${storyName}" not found.`, true);
      }

      const storyVars = new Map<string, number>();
      const tempVars = new Map<string, number>();
      const setupVars = new Map<string, number>();

      for (const passage of story.passages) {
        collectMatches(/\$[A-Za-z_]\w*/g, passage.text, storyVars);
        collectMatches(/_[A-Za-z_]\w*/g, passage.text, tempVars);
        collectMatches(/setup\.[A-Za-z_$][\w$]*/g, passage.text, setupVars);
      }

      return jsonResult({
        storyVariables: sortedCounts(storyVars).filter((entry) => matchesPrefix(entry.name, prefix)),
        tempVariables: sortedCounts(tempVars).filter((entry) => matchesPrefix(entry.name, prefix)),
        setupVariables: sortedCounts(setupVars).filter((entry) => matchesPrefix(entry.name, prefix)),
      });
    },
  );

  server.tool(
    "sc_extract_macros",
    "Extract custom SugarCube macro names registered via Macro.add in story script.",
    {
      storyName: z.string().describe("Name of the story"),
    },
    async ({ storyName }) => {
      const story = getStoryOrError(storyName);
      if (!story) {
        return textResult(`Story "${storyName}" not found.`, true);
      }

      const macros = new Set<string>();
      const script = story.script || "";
      const macroRe = /Macro\.add\(\s*["']([^"']+)["']/g;
      let match: RegExpExecArray | null;

      while ((match = macroRe.exec(script)) !== null) {
        macros.add(match[1]);
      }

      return jsonResult([...macros].sort((left, right) => left.localeCompare(right)));
    },
  );

  server.tool(
    "sc_find_links_typed",
    "Extract SugarCube-aware links from a passage and label each link by type.",
    {
      storyName: z.string().describe("Name of the story"),
      passageName: z.string().describe("Passage name to inspect"),
    },
    async ({ storyName, passageName }) => {
      const passage = getPassageOrError(storyName, passageName);
      if (!passage) {
        return textResult(`Passage "${passageName}" not found in "${storyName}".`, true);
      }

      return jsonResult(extractTypedLinks(passage.text));
    },
  );

  server.tool(
    "sc_trace_path",
    "Find a path between two passages using SugarCube-aware link extraction.",
    {
      storyName: z.string().describe("Name of the story"),
      fromPassage: z.string().describe("Starting passage"),
      toPassage: z.string().describe("Destination passage"),
    },
    async ({ storyName, fromPassage, toPassage }) => {
      const story = getStoryOrError(storyName);
      if (!story) {
        return textResult(`Story "${storyName}" not found.`, true);
      }

      const allNames = new Set(story.passages.map((passage) => passage.name));
      if (!allNames.has(fromPassage)) {
        return textResult(`Passage "${fromPassage}" not found in "${storyName}".`, true);
      }
      if (!allNames.has(toPassage)) {
        return textResult(`Passage "${toPassage}" not found in "${storyName}".`, true);
      }

      if (fromPassage === toPassage) {
        return jsonResult({ path: [fromPassage], edges: [], steps: 0 });
      }

      const adjacency = buildAdjacency(story);
      const queue: string[] = [fromPassage];
      const visited = new Set<string>();
      const previous = new Map<string, string>();

      while (queue.length > 0) {
        const current = queue.shift();
        if (!current || visited.has(current)) {
          continue;
        }

        visited.add(current);
        const edges = adjacency.get(current);
        for (const next of edges?.keys() || []) {
          if (visited.has(next) || previous.has(next)) {
            continue;
          }

          previous.set(next, current);
          if (next === toPassage) {
            queue.length = 0;
            break;
          }

          queue.push(next);
        }
      }

      if (!previous.has(toPassage)) {
        return jsonResult({
          path: null,
          edges: [],
          steps: null,
          message: `No path found from "${fromPassage}" to "${toPassage}".`,
        });
      }

      const path: string[] = [toPassage];
      let cursor = toPassage;
      while (cursor !== fromPassage) {
        const parent = previous.get(cursor);
        if (!parent) {
          break;
        }
        path.push(parent);
        cursor = parent;
      }
      path.reverse();

      const edgeDetails = [];
      for (let index = 0; index < path.length - 1; index += 1) {
        const from = path[index];
        const to = path[index + 1];
        const types = [...(adjacency.get(from)?.get(to) || new Set<TypedLinkType>())];
        edgeDetails.push({ from, to, types });
      }

      return jsonResult({
        path,
        edges: edgeDetails,
        steps: Math.max(path.length - 1, 0),
      });
    },
  );

  server.tool(
    "find_by_prefix",
    "Find passages whose names start with the given prefix.",
    {
      storyName: z.string().describe("Name of the story"),
      prefix: z.string().describe("Prefix to match"),
    },
    async ({ storyName, prefix }) => {
      const story = getStoryOrError(storyName);
      if (!story) {
        return textResult(`Story "${storyName}" not found.`, true);
      }

      return jsonResult(
        story.passages
          .filter((passage) => passage.name.startsWith(prefix))
          .map((passage) => passage.name),
      );
    },
  );

  server.tool(
    "get_passages_batch",
    "Fetch multiple passages from a story in one call.",
    {
      storyName: z.string().describe("Name of the story"),
      passageNames: z.array(z.string()).describe("Passage names to fetch"),
    },
    async ({ storyName, passageNames }) => {
      const story = getStoryOrError(storyName);
      if (!story) {
        return textResult(`Story "${storyName}" not found.`, true);
      }

      const found: TwinePassage[] = [];
      const missing: string[] = [];

      for (const passageName of passageNames) {
        const passage = story.passages.find((candidate) => candidate.name === passageName);
        if (passage) {
          found.push(passage);
        } else {
          missing.push(passageName);
        }
      }

      return jsonResult({ found, missing });
    },
  );

  server.tool(
    "sc_extract_setup_vars",
    "Extract setup variable assignments from SugarCube story script.",
    {
      storyName: z.string().describe("Name of the story"),
    },
    async ({ storyName }) => {
      const story = getStoryOrError(storyName);
      if (!story) {
        return textResult(`Story "${storyName}" not found.`, true);
      }

      try {
        const assignments = new Map<string, number>();
        const script = story.script || "";
        collectMatches(/setup\.[A-Za-z_$][\w$]*\s*=/g, script, assignments, (raw) =>
          raw.replace(/\s*=.*/, ""),
        );
        collectMatches(/setup\[\s*["']([^"']+)["']\s*\]\s*=/g, script, assignments, (raw) => {
          const match = raw.match(/setup\[\s*["']([^"']+)["']\s*\]\s*=/);
          return match ? `setup.${match[1]}` : raw;
        });

        return jsonResult(sortedCounts(assignments));
      } catch (error) {
        return textResult(getErrorMessage(error), true);
      }
    },
  );
}
