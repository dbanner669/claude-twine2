import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import * as fs from "fs";
import * as path from "path";
import { z } from "zod";

import { registerSugarCubeTools } from "./sugarcube-tools";
import { store } from "./store";
import {
  extractLinks,
  parseHtml,
  parseTwee,
  storyToHtml,
  storyToTwee,
} from "./twine-parser";
import type { TwinePassage, TwineStory } from "./types";

interface ToolRegistrar {
  tool(
    name: string,
    description: string,
    params: Record<string, unknown>,
    handler: (args: any) => Promise<unknown> | unknown,
  ): void;
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

function definedStory(story: TwineStory | undefined): story is TwineStory {
  return Boolean(story);
}

export function registerTools(sdkServer: McpServer): void {
  const server = sdkServer as unknown as ToolRegistrar;

  server.tool(
    "create_story",
    "Create a new Twine interactive fiction story",
    {
      name: z.string().describe("Story title"),
      format: z
        .enum(["Harlowe", "SugarCube", "Chapbook", "Snowman"])
        .optional()
        .describe("Story format (default: Harlowe)"),
    },
    async ({ name, format }) => {
      const story = store.create(name, format);
      return textResult(`Created story "${story.name}" (${story.format}, IFID: ${story.ifid})`);
    },
  );

  server.tool(
    "list_stories",
    "List all stories (persisted across sessions — always call this first to see what exists)",
    {},
    async () => {
      const names = store.list();
      if (names.length === 0) {
        return textResult("No stories in session. Use create_story to start one.");
      }

      const details = names.map((name) => {
        const story = store.get(name) as TwineStory;
        return `- "${story.name}" (${story.format}, ${story.passages.length} passages, start: ${story.startPassage || "none"})`;
      });

      return textResult(details.join("\n"));
    },
  );

  server.tool(
    "get_story",
    "Get full details of a story including all passages",
    {
      storyName: z.string().describe("Name of the story"),
    },
    async ({ storyName }) => {
      const story = store.get(storyName);
      if (!story) {
        return textResult(`Story "${storyName}" not found.`, true);
      }
      return textResult(JSON.stringify(story, null, 2));
    },
  );

  server.tool(
    "delete_story",
    "Delete a story from the session",
    {
      storyName: z.string().describe("Name of the story to delete"),
    },
    async ({ storyName }) => {
      const deleted = store.delete(storyName);
      return textResult(deleted ? `Deleted "${storyName}".` : `Story "${storyName}" not found.`, !deleted);
    },
  );

  server.tool(
    "add_passage",
    "Add a new passage to a story. Use [[Target]] syntax for links in the text.",
    {
      storyName: z.string().describe("Name of the story"),
      passageName: z.string().describe("Passage title/name"),
      text: z
        .string()
        .describe("Passage content (use [[Link Text->Target]] or [[Target]] for choices)"),
      tags: z.array(z.string()).optional().describe("Tags for the passage"),
    },
    async ({ storyName, passageName, text, tags }) => {
      try {
        const links = extractLinks(text);
        const passage = store.addPassage(storyName, { name: passageName, text, tags, links });
        const linkInfo = links.length > 0 ? ` Links to: ${links.join(", ")}` : " No outgoing links.";
        return textResult(`Added passage "${passage.name}" (pid: ${passage.pid}).${linkInfo}`);
      } catch (error) {
        return textResult(getErrorMessage(error), true);
      }
    },
  );

  server.tool(
    "edit_passage",
    "Edit an existing passage's text, name, or tags",
    {
      storyName: z.string().describe("Name of the story"),
      passageName: z.string().describe("Current passage name"),
      newText: z.string().optional().describe("New passage text (replaces entire content)"),
      newName: z.string().optional().describe("Rename the passage"),
      tags: z.array(z.string()).optional().describe("Replace tags"),
    },
    async ({ storyName, passageName, newText, newName, tags }) => {
      try {
        const updates: Partial<TwinePassage> = {};
        if (newText !== undefined) {
          updates.text = newText;
          updates.links = extractLinks(newText);
        }
        if (newName !== undefined) {
          updates.name = newName;
        }
        if (tags !== undefined) {
          updates.tags = tags;
        }

        const updated = store.updatePassage(storyName, passageName, updates);
        return textResult(`Updated passage "${updated.name}".`);
      } catch (error) {
        return textResult(getErrorMessage(error), true);
      }
    },
  );

  server.tool(
    "read_passage",
    "Read a specific passage's content",
    {
      storyName: z.string().describe("Name of the story"),
      passageName: z.string().describe("Passage name to read"),
    },
    async ({ storyName, passageName }) => {
      const passage = store.getPassage(storyName, passageName);
      if (!passage) {
        return textResult(`Passage "${passageName}" not found in "${storyName}".`, true);
      }
      return textResult(JSON.stringify(passage, null, 2));
    },
  );

  server.tool(
    "list_passages",
    "List all passages in a story with their connections",
    {
      storyName: z.string().describe("Name of the story"),
    },
    async ({ storyName }) => {
      const story = store.get(storyName);
      if (!story) {
        return textResult(`Story "${storyName}" not found.`, true);
      }
      if (story.passages.length === 0) {
        return textResult(`"${storyName}" has no passages yet.`);
      }

      const lines = story.passages.map((passage) => {
        const start = passage.name === story.startPassage ? " [START]" : "";
        const links = passage.links?.length ? ` → ${passage.links.join(", ")}` : " (dead end)";
        const tags = passage.tags?.length ? ` [${passage.tags.join(", ")}]` : "";
        return `- ${passage.name}${start}${tags}${links}`;
      });

      return textResult(lines.join("\n"));
    },
  );

  server.tool(
    "delete_passage",
    "Remove a passage from a story",
    {
      storyName: z.string().describe("Name of the story"),
      passageName: z.string().describe("Passage name to delete"),
    },
    async ({ storyName, passageName }) => {
      const deleted = store.deletePassage(storyName, passageName);
      return textResult(deleted ? `Deleted passage "${passageName}".` : "Passage not found.", !deleted);
    },
  );

  server.tool(
    "set_start",
    "Set which passage is the starting passage of the story",
    {
      storyName: z.string().describe("Name of the story"),
      passageName: z.string().describe("Passage to set as the start"),
    },
    async ({ storyName, passageName }) => {
      const story = store.get(storyName);
      if (!story) {
        return textResult(`Story "${storyName}" not found.`, true);
      }

      const passage = story.passages.find((candidate) => candidate.name === passageName);
      if (!passage) {
        return textResult(`Passage "${passageName}" not found.`, true);
      }

      story.startPassage = passageName;
      store.set(storyName, story);
      return textResult(`Start passage set to "${passageName}".`);
    },
  );

  server.tool(
    "get_story_map",
    "Get a text-based map of the story's passage connections",
    {
      storyName: z.string().describe("Name of the story"),
    },
    async ({ storyName }) => {
      const story = store.get(storyName);
      if (!story) {
        return textResult(`Story "${storyName}" not found.`, true);
      }

      const allNames = new Set(story.passages.map((passage) => passage.name));
      const lines = [`Story Map: "${story.name}" (${story.passages.length} passages)\n`];
      const linkedTo = new Set<string>();

      for (const passage of story.passages) {
        passage.links?.forEach((link) => linkedTo.add(link));
      }

      const orphans = story.passages.filter(
        (passage) => !linkedTo.has(passage.name) && passage.name !== story.startPassage,
      );
      const deadEnds = story.passages.filter(
        (passage) => !passage.links || passage.links.length === 0,
      );
      const brokenLinks: string[] = [];

      for (const passage of story.passages) {
        const start = passage.name === story.startPassage ? " ★" : "";
        const linkStr = passage.links?.length
          ? passage.links
              .map((link) => {
                if (!allNames.has(link)) {
                  brokenLinks.push(`"${passage.name}" → "${link}"`);
                  return `${link} ✗`;
                }
                return link;
              })
              .join(", ")
          : "(dead end)";

        lines.push(`${passage.name}${start} → ${linkStr}`);
      }

      if (orphans.length) {
        lines.push(`\nOrphan passages (unreachable): ${orphans.map((passage) => passage.name).join(", ")}`);
      }
      if (deadEnds.length) {
        lines.push(`Dead ends: ${deadEnds.map((passage) => passage.name).join(", ")}`);
      }
      if (brokenLinks.length) {
        lines.push(`Broken links: ${brokenLinks.join("; ")}`);
      }

      return textResult(lines.join("\n"));
    },
  );

  server.tool(
    "export_html",
    "Export a story as Twine 2 HTML file",
    {
      storyName: z.string().describe("Name of the story"),
      filePath: z.string().describe("Absolute file path to save the HTML file"),
    },
    async ({ storyName, filePath: outPath }) => {
      const story = store.get(storyName);
      if (!story) {
        return textResult(`Story "${storyName}" not found.`, true);
      }

      const html = storyToHtml(story);
      const resolved = path.resolve(outPath);
      fs.mkdirSync(path.dirname(resolved), { recursive: true });
      fs.writeFileSync(resolved, html, "utf-8");
      return textResult(`Exported "${storyName}" to ${resolved}`);
    },
  );

  server.tool(
    "export_twee",
    "Export a story as Twee 3 text file. Note: when importing a Twee file into Twine's editor, all passages will be stacked in one spot — you'll need to manually drag them apart in the visual map.",
    {
      storyName: z.string().describe("Name of the story"),
      filePath: z.string().describe("Absolute file path to save the Twee file"),
    },
    async ({ storyName, filePath: outPath }) => {
      const story = store.get(storyName);
      if (!story) {
        return textResult(`Story "${storyName}" not found.`, true);
      }

      const twee = storyToTwee(story);
      const resolved = path.resolve(outPath);
      fs.mkdirSync(path.dirname(resolved), { recursive: true });
      fs.writeFileSync(resolved, twee, "utf-8");
      return textResult(`Exported "${storyName}" to ${resolved}`);
    },
  );

  server.tool(
    "import_story",
    "Import a Twine story from an HTML or Twee file on disk. Note: Twee files imported into Twine's editor will have all passages stacked at one point — drag them apart in the visual map to arrange them.",
    {
      filePath: z.string().describe("Absolute path to a .html or .twee/.tw file"),
    },
    async ({ filePath: inPath }) => {
      const resolved = path.resolve(inPath);
      if (!fs.existsSync(resolved)) {
        return textResult(`File not found: ${resolved}`, true);
      }

      const content = fs.readFileSync(resolved, "utf-8");
      const ext = path.extname(resolved).toLowerCase();
      const isHtml = ext === ".html" || ext === ".htm";

      try {
        const story = isHtml ? parseHtml(content) : parseTwee(content);
        store.set(story.name, story);
        return textResult(
          `Imported "${story.name}" (${story.passages.length} passages, format: ${story.format || "unknown"})`,
        );
      } catch (error) {
        return textResult(`Parse error: ${getErrorMessage(error)}`, true);
      }
    },
  );

  server.tool(
    "import_story_from_text",
    "Import a Twine story from raw HTML or Twee text content. Note: Twee content imported into Twine's editor will have passages stacked together — rearrange them manually in the visual map.",
    {
      content: z.string().describe("Story content as HTML or Twee 3 text"),
      isHtml: z.boolean().optional().describe("True if content is Twine HTML, false/omit for Twee 3"),
    },
    async ({ content, isHtml }) => {
      try {
        const story = isHtml ? parseHtml(content) : parseTwee(content);
        store.set(story.name, story);
        return textResult(`Imported "${story.name}" (${story.passages.length} passages)`);
      } catch (error) {
        return textResult(`Parse error: ${getErrorMessage(error)}`, true);
      }
    },
  );

  server.tool(
    "convert_format",
    "Convert a story between Twine HTML and Twee 3 (returns the converted text)",
    {
      storyName: z.string().describe("Name of the story to convert"),
      toFormat: z.enum(["html", "twee"]).describe("Target format"),
    },
    async ({ storyName, toFormat }) => {
      const story = store.get(storyName);
      if (!story) {
        return textResult(`Story "${storyName}" not found.`, true);
      }

      const output = toFormat === "html" ? storyToHtml(story) : storyToTwee(story);
      return textResult(output);
    },
  );

  server.tool(
    "validate_story",
    "Run comprehensive integrity checks on a story: broken links, empty passages, orphans, dead ends, reachability, duplicate names, missing start passage",
    {
      storyName: z.string().describe("Name of the story to validate"),
    },
    async ({ storyName }) => {
      const story = store.get(storyName);
      if (!story) {
        return textResult(`Story "${storyName}" not found.`, true);
      }

      const allNames = new Set(story.passages.map((passage) => passage.name));
      const issues: string[] = [];
      const warnings: string[] = [];

      if (!story.startPassage) {
        issues.push("❌ No start passage set");
      } else if (!allNames.has(story.startPassage)) {
        issues.push(`❌ Start passage "${story.startPassage}" does not exist`);
      }

      const nameCounts = new Map<string, number>();
      for (const passage of story.passages) {
        nameCounts.set(passage.name, (nameCounts.get(passage.name) || 0) + 1);
      }

      for (const [name, count] of nameCounts) {
        if (count > 1) {
          issues.push(`❌ Duplicate passage name: "${name}" (${count} copies)`);
        }
      }

      const brokenLinks: string[] = [];
      for (const passage of story.passages) {
        for (const link of passage.links || []) {
          if (!allNames.has(link)) {
            brokenLinks.push(`"${passage.name}" → "${link}"`);
          }
        }
      }
      if (brokenLinks.length) {
        issues.push(`❌ Broken links (${brokenLinks.length}): ${brokenLinks.join("; ")}`);
      }

      const emptyPassages = story.passages.filter(
        (passage) => !passage.text || passage.text.trim() === "",
      );
      if (emptyPassages.length) {
        warnings.push(
          `⚠️ Empty passages (${emptyPassages.length}): ${emptyPassages
            .map((passage) => passage.name)
            .join(", ")}`,
        );
      }

      const deadEnds = story.passages.filter(
        (passage) => (!passage.links || passage.links.length === 0) && passage.text && passage.text.trim() !== "",
      );
      if (deadEnds.length) {
        warnings.push(
          `⚠️ Dead ends (${deadEnds.length}): ${deadEnds.map((passage) => passage.name).join(", ")}`,
        );
      }

      const linkedTo = new Set<string>();
      for (const passage of story.passages) {
        passage.links?.forEach((link) => linkedTo.add(link));
      }

      const orphans = story.passages.filter(
        (passage) => !linkedTo.has(passage.name) && passage.name !== story.startPassage,
      );

      const reachable = new Set<string>();
      if (story.startPassage && allNames.has(story.startPassage)) {
        const queue: string[] = [story.startPassage];
        while (queue.length > 0) {
          const current = queue.shift();
          if (!current || reachable.has(current)) {
            continue;
          }

          reachable.add(current);
          const passage = story.passages.find((candidate) => candidate.name === current);
          if (passage?.links) {
            for (const link of passage.links) {
              if (allNames.has(link) && !reachable.has(link)) {
                queue.push(link);
              }
            }
          }
        }

        const unreachable = story.passages.filter((passage) => !reachable.has(passage.name));
        if (unreachable.length) {
          warnings.push(
            `⚠️ Unreachable from start (${unreachable.length}): ${unreachable
              .map((passage) => passage.name)
              .join(", ")}`,
          );
        }
      }

      if (orphans.length) {
        warnings.push(
          `⚠️ Orphan passages — nothing links to them (${orphans.length}): ${orphans
            .map((passage) => passage.name)
            .join(", ")}`,
        );
      }

      const total = story.passages.length;
      const header = `Validation: "${story.name}" (${total} passages, format: ${story.format || "unknown"})\n`;
      if (issues.length === 0 && warnings.length === 0) {
        return textResult(`${header}✅ All checks passed — story is clean!`);
      }

      return textResult(header + [...issues, ...warnings].join("\n"), issues.length > 0);
    },
  );

  server.tool(
    "search_passages",
    "Search passages by text content, name pattern, tags, or link targets. Searches across one story or all stories.",
    {
      query: z
        .string()
        .describe("Search term (case-insensitive substring match on passage text and names)"),
      storyName: z.string().optional().describe("Limit search to this story (omit to search all)"),
      tag: z.string().optional().describe("Filter to passages with this tag"),
      linkTarget: z.string().optional().describe("Filter to passages that link to this target"),
    },
    async ({ query, storyName, tag, linkTarget }) => {
      const stories = storyName
        ? [store.get(storyName)].filter(definedStory)
        : store.list().map((name) => store.get(name)).filter(definedStory);

      if (stories.length === 0) {
        return textResult(storyName ? `Story "${storyName}" not found.` : "No stories found.", true);
      }

      const queryLower = query.toLowerCase();
      const results: string[] = [];

      for (const story of stories) {
        for (const passage of story.passages) {
          const textMatch =
            passage.text.toLowerCase().includes(queryLower) ||
            passage.name.toLowerCase().includes(queryLower);
          const tagMatch = tag ? (passage.tags || []).includes(tag) : true;
          const linkMatch = linkTarget ? (passage.links || []).includes(linkTarget) : true;

          if (textMatch && tagMatch && linkMatch) {
            const preview =
              passage.text.length > 120 ? `${passage.text.slice(0, 120)}…` : passage.text;
            const tags = passage.tags?.length ? ` [${passage.tags.join(", ")}]` : "";
            results.push(`[${story.name}] ${passage.name}${tags}: ${preview.replace(/\n/g, " ")}`);
          }
        }
      }

      if (results.length === 0) {
        return textResult(`No passages match query "${query}".`);
      }

      return textResult(`Found ${results.length} matching passage(s):\n\n${results.join("\n\n")}`);
    },
  );

  server.tool(
    "story_statistics",
    "Get detailed statistics about a story: word counts, passage counts, branching factor, link density, longest/shortest passages, tag usage",
    {
      storyName: z.string().describe("Name of the story"),
    },
    async ({ storyName }) => {
      const story = store.get(storyName);
      if (!story) {
        return textResult(`Story "${storyName}" not found.`, true);
      }

      const passages = story.passages;
      if (passages.length === 0) {
        return textResult(`"${storyName}" has no passages yet.`);
      }

      const wordCounts = passages.map((passage) => {
        const words = passage.text.trim().split(/\s+/).filter(Boolean);
        return { name: passage.name, count: passage.text.trim() === "" ? 0 : words.length };
      });
      const totalWords = wordCounts.reduce((sum, wordCount) => sum + wordCount.count, 0);
      const avgWords = Math.round(totalWords / passages.length);
      const sorted = [...wordCounts].sort((left, right) => right.count - left.count);
      const longest = sorted[0];
      const shortest = sorted[sorted.length - 1];
      const totalLinks = passages.reduce((sum, passage) => sum + (passage.links?.length || 0), 0);
      const avgBranching = (totalLinks / passages.length).toFixed(1);
      const maxBranching = passages.reduce(
        (max, passage) => Math.max(max, passage.links?.length || 0),
        0,
      );
      const emptyCount = passages.filter(
        (passage) => !passage.text || passage.text.trim() === "",
      ).length;
      const deadEndCount = passages.filter(
        (passage) => !passage.links || passage.links.length === 0,
      ).length;

      const tagCounts = new Map<string, number>();
      for (const passage of passages) {
        for (const tag of passage.tags || []) {
          tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
        }
      }

      const tagLines = [...tagCounts.entries()]
        .sort((left, right) => right[1] - left[1])
        .map(([tag, count]) => `  ${tag}: ${count}`)
        .join("\n");

      let maxDepth = 0;
      const allNames = new Set(passages.map((passage) => passage.name));
      if (story.startPassage && allNames.has(story.startPassage)) {
        const visited = new Set<string>();
        const queue: Array<{ name: string; depth: number }> = [
          { name: story.startPassage, depth: 0 },
        ];

        while (queue.length > 0) {
          const current = queue.shift();
          if (!current || visited.has(current.name)) {
            continue;
          }

          visited.add(current.name);
          maxDepth = Math.max(maxDepth, current.depth);
          const passage = passages.find((candidate) => candidate.name === current.name);
          if (passage?.links) {
            for (const link of passage.links) {
              if (allNames.has(link) && !visited.has(link)) {
                queue.push({ name: link, depth: current.depth + 1 });
              }
            }
          }
        }
      }

      const lines = [
        `📊 Statistics: "${story.name}"`,
        "",
        `Passages: ${passages.length} (${emptyCount} empty, ${deadEndCount} dead ends)`,
        `Total words: ${totalWords.toLocaleString()}`,
        `Avg words/passage: ${avgWords}`,
        `Longest passage: "${longest.name}" (${longest.count} words)`,
        `Shortest passage: "${shortest.name}" (${shortest.count} words)`,
        "",
        `Total links: ${totalLinks}`,
        `Avg branching factor: ${avgBranching}`,
        `Max branching factor: ${maxBranching}`,
        `Max depth from start: ${maxDepth}`,
        "",
        `Format: ${story.format || "unknown"} ${story.formatVersion || ""}`,
        `IFID: ${story.ifid || "none"}`,
      ];

      if (tagCounts.size > 0) {
        lines.push("", "Tags:", tagLines);
      }

      return textResult(lines.join("\n"));
    },
  );

  server.tool(
    "rename_story",
    "Rename a story (updates in memory and the save file on disk)",
    {
      storyName: z.string().describe("Current story name"),
      newName: z.string().describe("New story name"),
    },
    async ({ storyName, newName }) => {
      try {
        store.rename(storyName, newName);
        return textResult(`Renamed "${storyName}" → "${newName}".`);
      } catch (error) {
        return textResult(getErrorMessage(error), true);
      }
    },
  );

  server.tool(
    "merge_stories",
    "Merge all passages from a source story into a target story. Does not overwrite existing passages with the same name.",
    {
      targetStory: z.string().describe("Name of the story to merge INTO"),
      sourceStory: z.string().describe("Name of the story to merge FROM"),
      deleteSource: z.boolean().optional().describe("Delete the source story after merging (default: false)"),
    },
    async ({ targetStory, sourceStory, deleteSource }) => {
      const target = store.get(targetStory);
      if (!target) {
        return textResult(`Target story "${targetStory}" not found.`, true);
      }

      const source = store.get(sourceStory);
      if (!source) {
        return textResult(`Source story "${sourceStory}" not found.`, true);
      }

      const existingNames = new Set(target.passages.map((passage) => passage.name));
      let added = 0;
      let skipped = 0;

      for (const passage of source.passages) {
        if (existingNames.has(passage.name)) {
          skipped += 1;
          continue;
        }

        store.addPassage(targetStory, {
          name: passage.name,
          text: passage.text,
          tags: passage.tags,
          links: passage.links,
        });
        added += 1;
      }

      if (deleteSource) {
        store.delete(sourceStory);
      }

      return textResult(
        `Merged into "${targetStory}": ${added} passages added, ${skipped} skipped (duplicate names).${deleteSource ? ` Source "${sourceStory}" deleted.` : ""}`,
      );
    },
  );

  server.tool(
    "add_passages_batch",
    "Add multiple passages to a story in one call. Much faster for building stories.",
    {
      storyName: z.string().describe("Name of the story"),
      passages: z
        .array(
          z.object({
            name: z.string().describe("Passage name"),
            text: z.string().describe("Passage content with [[link]] syntax"),
            tags: z.array(z.string()).optional().describe("Tags for this passage"),
          }),
        )
        .describe("Array of passages to add"),
    },
    async ({ storyName, passages: newPassages }) => {
      const story = store.get(storyName);
      if (!story) {
        return textResult(`Story "${storyName}" not found.`, true);
      }

      const results: string[] = [];
      let added = 0;

      for (const passage of newPassages) {
        try {
          const links = extractLinks(passage.text);
          store.addPassage(storyName, {
            name: passage.name,
            text: passage.text,
            tags: passage.tags,
            links,
          });
          added += 1;
        } catch (error) {
          results.push(`⚠️ "${passage.name}": ${getErrorMessage(error)}`);
        }
      }

      const summary = `Added ${added}/${newPassages.length} passages to "${storyName}".`;
      if (results.length > 0) {
        return textResult(`${summary}\n${results.join("\n")}`);
      }

      return textResult(summary);
    },
  );

  server.tool(
    "clone_passage",
    "Duplicate a passage with a new name (in the same story or to another story)",
    {
      storyName: z.string().describe("Source story name"),
      passageName: z.string().describe("Passage to clone"),
      newName: z.string().describe("Name for the cloned passage"),
      targetStory: z.string().optional().describe("Clone into a different story (default: same story)"),
    },
    async ({ storyName, passageName, newName, targetStory }) => {
      const source = store.getPassage(storyName, passageName);
      if (!source) {
        return textResult(`Passage "${passageName}" not found in "${storyName}".`, true);
      }

      const destination = targetStory || storyName;
      if (!store.get(destination)) {
        return textResult(`Story "${destination}" not found.`, true);
      }

      try {
        store.addPassage(destination, {
          name: newName,
          text: source.text,
          tags: source.tags ? [...source.tags] : undefined,
          links: source.links ? [...source.links] : undefined,
        });
        return textResult(`Cloned "${passageName}" → "${newName}" in "${destination}".`);
      } catch (error) {
        return textResult(getErrorMessage(error), true);
      }
    },
  );

  server.tool(
    "move_passage",
    "Move a passage from one story to another (removes from source, adds to target)",
    {
      sourceStory: z.string().describe("Story to move FROM"),
      passageName: z.string().describe("Passage name to move"),
      targetStory: z.string().describe("Story to move TO"),
      newName: z.string().optional().describe("Optionally rename the passage during the move"),
    },
    async ({ sourceStory, passageName, targetStory, newName }) => {
      const passage = store.getPassage(sourceStory, passageName);
      if (!passage) {
        return textResult(`Passage "${passageName}" not found in "${sourceStory}".`, true);
      }

      if (!store.get(targetStory)) {
        return textResult(`Story "${targetStory}" not found.`, true);
      }

      try {
        const name = newName || passage.name;
        store.addPassage(targetStory, {
          name,
          text: passage.text,
          tags: passage.tags ? [...passage.tags] : undefined,
          links: passage.links ? [...passage.links] : undefined,
        });
        store.deletePassage(sourceStory, passageName);
        return textResult(
          `Moved "${passageName}" from "${sourceStory}" to "${targetStory}"${newName ? ` as "${newName}"` : ""}.`,
        );
      } catch (error) {
        return textResult(getErrorMessage(error), true);
      }
    },
  );

  registerSugarCubeTools(sdkServer);
}
