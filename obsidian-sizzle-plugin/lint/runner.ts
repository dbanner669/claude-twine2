import { App, TFile, TFolder } from "obsidian";
import * as path from "node:path";
import * as fs from "node:fs";

import type {
  Diagnostic,
  LintContext,
  LintListener,
  LintRule,
  ParsedPassage,
} from "./types";
import { parseShadowMd } from "./parse";

/* -------------------------------------------------------------------------
 * Lint runner
 *
 * Walks all passages/*.md in the vault, parses them, builds a LintContext
 * (glossary + known passages + media + declared vars), runs each
 * registered rule, and broadcasts the resulting Diagnostic[] to subscribed
 * listeners (sidebar pane, status bar, etc.).
 *
 * Lifecycle:
 *   const runner = new LintRunner(app, repoRoot);
 *   runner.register(myRule);
 *   runner.on(diagnostics => updateUI(diagnostics));
 *   await runner.run();        // initial scan
 *   runner.scheduleRun();      // debounced re-run (call from vault events)
 *
 * Context loading is best-effort: missing files produce empty sets. That
 * means lint never silently breaks the editor — it just reports fewer
 * things until the missing source is restored.
 * ------------------------------------------------------------------------- */

const DEBOUNCE_MS = 400;
const PASSAGES_SUBDIR = "passages";

export class LintRunner {
  private rules: LintRule[] = [];
  private listeners: Set<LintListener> = new Set();
  private diagnostics: Diagnostic[] = [];
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(private app: App, private repoRoot: string) {}

  /** Add a rule. Order is not significant — diagnostics are merged. */
  register(rule: LintRule): void {
    this.rules.push(rule);
  }

  /** Subscribe to diagnostic updates. Returns an unsubscribe function. */
  on(listener: LintListener): () => void {
    this.listeners.add(listener);
    /* Fire immediately with current state so new subscribers don't see a blank pane. */
    listener(this.diagnostics);
    return () => this.listeners.delete(listener);
  }

  /** Latest diagnostics — for synchronous reads (status bar count, etc.). */
  current(): Diagnostic[] {
    return this.diagnostics;
  }

  /** Schedule a debounced re-run. Call this from vault event handlers. */
  scheduleRun(): void {
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.debounceTimer = null;
      void this.run();
    }, DEBOUNCE_MS);
  }

  /** Run synchronously. Call after register() at plugin load and from scheduleRun. */
  async run(): Promise<void> {
    const passages = await this.loadPassages();
    const ctx = await this.loadContext(passages);
    const diagnostics: Diagnostic[] = [];
    for (const passage of passages) {
      for (const rule of this.rules) {
        try {
          const results = rule.check(passage, ctx);
          for (const d of results) diagnostics.push(d);
        } catch (err) {
          console.error(`[Sizzle Tools] rule ${rule.id} threw on ${passage.name}:`, err);
        }
      }
    }
    diagnostics.sort((a, b) => {
      if (a.filePath !== b.filePath) return a.filePath.localeCompare(b.filePath);
      if (a.line !== b.line) return a.line - b.line;
      return a.col - b.col;
    });
    this.diagnostics = diagnostics;
    for (const l of this.listeners) {
      try {
        l(diagnostics);
      } catch (err) {
        console.error("[Sizzle Tools] lint listener threw:", err);
      }
    }
  }

  /* -------------------- internals -------------------- */

  private async loadPassages(): Promise<ParsedPassage[]> {
    const folder = this.app.vault.getAbstractFileByPath(PASSAGES_SUBDIR);
    if (!folder || !(folder instanceof TFolder)) return [];
    const out: ParsedPassage[] = [];
    for (const child of folder.children) {
      if (!(child instanceof TFile)) continue;
      if (!child.name.endsWith(".md")) continue;
      const text = await this.app.vault.read(child);
      const parsed = parseShadowMd(child.path, text);
      if ("error" in parsed) {
        console.warn(`[Sizzle Tools] could not parse ${child.path}: ${parsed.error}`);
        continue;
      }
      out.push(parsed);
    }
    return out;
  }

  private async loadContext(passages: ParsedPassage[]): Promise<LintContext> {
    const glossary = await this.loadGlossary();
    const declaredVariables = await this.loadDeclaredVariables();
    const knownMediaPaths = await this.loadKnownMediaPaths();
    const { passageDefinitions, incomingEdges, orphanExempt } = await this.loadCrossFileInfo(passages);
    const taggedFields = await this.loadTaggedFields();
    const knownPassages = new Set(passageDefinitions.keys());
    return {
      glossary,
      declaredVariables,
      knownMediaPaths,
      knownPassages,
      passageDefinitions,
      incomingEdges,
      orphanExempt,
      taggedFields,
    };
  }

  /**
   * Scan all .twee + .js under sizzle/src/ for writes and reads on the
   * four tag-style player fields. Returns per-field write/read sets.
   *
   * Writes:
   *   $player.<field>.push("X") / .pushUnique("X")
   *   <<set $player.<field> to ["A", "B"]>>
   * Reads:
   *   $player.<field>.includes("X") / .indexOf("X") / .contains("X")
   */
  private async loadTaggedFields(): Promise<
    Map<"storyTags" | "kinks" | "quirks" | "statusEffects", { writes: Set<string>; reads: Set<string> }>
  > {
    type Field = "storyTags" | "kinks" | "quirks" | "statusEffects";
    const fields: Field[] = ["storyTags", "kinks", "quirks", "statusEffects"];
    const out = new Map<Field, { writes: Set<string>; reads: Set<string> }>();
    for (const f of fields) out.set(f, { writes: new Set(), reads: new Set() });
    if (!this.repoRoot) return out;

    const srcRoot = path.join(this.repoRoot, "sizzle", "src");
    const pushRe = /\$player\.(storyTags|kinks|quirks|statusEffects)\.push(?:Unique)?\(\s*['"]([^'"]+)['"]\s*\)/g;
    const setArrayRe = /<<set\s+\$player\.(storyTags|kinks|quirks|statusEffects)\s+to\s+\[([\s\S]*?)\]\s*>>/g;
    const readRe = /\$player\.(storyTags|kinks|quirks|statusEffects)\.(?:includes|indexOf|contains)\(\s*['"]([^'"]+)['"]\s*\)/g;
    const litRe = /['"]([^'"]+)['"]/g;

    const walk = async (dir: string): Promise<void> => {
      let entries: fs.Dirent[];
      try {
        entries = await fs.promises.readdir(dir, { withFileTypes: true });
      } catch {
        return;
      }
      for (const entry of entries) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          await walk(full);
        } else if (entry.isFile() && (entry.name.endsWith(".twee") || entry.name.endsWith(".js"))) {
          let text = "";
          try {
            text = await fs.promises.readFile(full, "utf8");
          } catch {
            continue;
          }
          let m: RegExpExecArray | null;
          pushRe.lastIndex = 0;
          while ((m = pushRe.exec(text)) !== null) {
            out.get(m[1] as Field)!.writes.add(m[2]);
          }
          setArrayRe.lastIndex = 0;
          while ((m = setArrayRe.exec(text)) !== null) {
            const field = m[1] as Field;
            const arrayBody = m[2];
            litRe.lastIndex = 0;
            let lm: RegExpExecArray | null;
            while ((lm = litRe.exec(arrayBody)) !== null) {
              out.get(field)!.writes.add(lm[1]);
            }
          }
          readRe.lastIndex = 0;
          while ((m = readRe.exec(text)) !== null) {
            out.get(m[1] as Field)!.reads.add(m[2]);
          }
        }
      }
    };
    await walk(srcRoot);
    return out;
  }

  /**
   * Walk all .twee under sizzle/src/, returning:
   *  - passageDefinitions: name → file paths that define it (for duplicate detection)
   *  - incomingEdges: name → set of source passages that link to it (for orphan detection)
   *  - orphanExempt: passages that are legitimate entries / widget definitions
   *
   * Edge extraction recognizes wiki links, <<goto "X">>, <<include "X">>, and
   * <<ccDossierFooter N "back" "next">> args. Variable-form refs are skipped
   * (we can't statically know the target).
   */
  private async loadCrossFileInfo(
    shadowPassages: ParsedPassage[],
  ): Promise<{
    passageDefinitions: Map<string, string[]>;
    incomingEdges: Map<string, Set<string>>;
    orphanExempt: Set<string>;
  }> {
    const passageDefinitions = new Map<string, string[]>();
    const incomingEdges = new Map<string, Set<string>>();
    const orphanExempt = new Set<string>([
      "Start",
      "StoryInit",
      "StoryInterface",
      "StoryCaption",
      "StoryMenu",
      "StoryAuthor",
      "StoryShortTitle",
      "StoryDisplayTitle",
      "StorySubtitle",
      "StoryDescription",
      "PassageHeader",
      "PassageFooter",
      "AvatarMeta",
      "FooterStatus",
    ]);

    if (!this.repoRoot) return { passageDefinitions, incomingEdges, orphanExempt };

    const srcRoot = path.join(this.repoRoot, "sizzle", "src");
    const fileSources: { absPath: string; relPath: string; text: string; isWidget: boolean }[] = [];

    const walk = async (dir: string): Promise<void> => {
      let entries: fs.Dirent[];
      try {
        entries = await fs.promises.readdir(dir, { withFileTypes: true });
      } catch {
        return;
      }
      for (const entry of entries) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          await walk(full);
        } else if (entry.isFile() && entry.name.endsWith(".twee")) {
          let text = "";
          try {
            text = await fs.promises.readFile(full, "utf8");
          } catch {
            continue;
          }
          const rel = path.relative(this.repoRoot, full).replace(/\\/g, "/");
          const isWidget = rel.includes("/widgets/");
          fileSources.push({ absPath: full, relPath: rel, text, isWidget });
        }
      }
    };
    await walk(srcRoot);

    /* Pass 1: collect passage definitions. */
    const headerRe = /^::\s+([^\[\{\n]+?)(?:\s*\[([^\]]*)\])?(?:\s*\{[^}]*\})?\s*$/gm;
    type PassageRecord = { name: string; tags: string[]; sourceFile: string; bodyStart: number; bodyEnd: number; isWidget: boolean };
    const allRecords: PassageRecord[] = [];

    for (const fs of fileSources) {
      headerRe.lastIndex = 0;
      const matches: { name: string; tags: string[]; index: number; endOfHeader: number }[] = [];
      let m: RegExpExecArray | null;
      while ((m = headerRe.exec(fs.text)) !== null) {
        const name = m[1].trim();
        if (name === "StoryTitle" || name === "StoryData") continue;
        const tags = m[2] ? m[2].split(/\s+/).filter(Boolean) : [];
        matches.push({ name, tags, index: m.index, endOfHeader: m.index + m[0].length });
      }
      matches.forEach((match, i) => {
        const bodyStart = match.endOfHeader;
        const bodyEnd = i + 1 < matches.length ? matches[i + 1].index : fs.text.length;
        const list = passageDefinitions.get(match.name) ?? [];
        list.push(fs.relPath);
        passageDefinitions.set(match.name, list);
        allRecords.push({
          name: match.name,
          tags: match.tags,
          sourceFile: fs.relPath,
          bodyStart,
          bodyEnd,
          isWidget: fs.isWidget || match.tags.includes("widget"),
        });
        if (fs.isWidget || match.tags.includes("widget") || match.tags.includes("script") || match.tags.includes("stylesheet")) {
          orphanExempt.add(match.name);
        }
      });
    }

    /* Pass 2: scan each passage body for outgoing refs → register as incoming. */
    const wikiRe = /\[\[([^\]]+)\]\]/g;
    const gotoRe = /<<goto\s+(?:'([^']+)'|"([^"]+)")\s*>>/g;
    const includeRe = /<<include\s+(?:'([^']+)'|"([^"]+)")\s*>>/g;
    const footerRe = /<<ccDossierFooter\s+\d+\s+"([^"]*)"\s+"([^"]*)"/g;

    const fileTextByPath = new Map(fileSources.map((f) => [f.relPath, f.text]));

    const addEdge = (target: string, source: string): void => {
      const set = incomingEdges.get(target) ?? new Set<string>();
      set.add(source);
      incomingEdges.set(target, set);
    };

    for (const rec of allRecords) {
      const text = fileTextByPath.get(rec.sourceFile);
      if (!text) continue;
      const body = text.slice(rec.bodyStart, rec.bodyEnd);

      const resolveWiki = (inner: string): string | null => {
        let s = inner;
        const arrow = s.indexOf("->");
        const reverseArrow = s.indexOf("<-");
        const pipe = s.indexOf("|");
        if (arrow !== -1) s = s.slice(arrow + 2);
        else if (reverseArrow !== -1) s = s.slice(0, reverseArrow);
        else if (pipe !== -1) s = s.slice(pipe + 1);
        const setter = s.indexOf("][");
        if (setter !== -1) s = s.slice(0, setter);
        s = s.trim();
        if (!s || s.includes("$") || s.includes("{")) return null;
        return s;
      };

      let m: RegExpExecArray | null;
      wikiRe.lastIndex = 0;
      while ((m = wikiRe.exec(body)) !== null) {
        const t = resolveWiki(m[1]);
        if (t) addEdge(t, rec.name);
      }
      gotoRe.lastIndex = 0;
      while ((m = gotoRe.exec(body)) !== null) {
        const t = (m[1] ?? m[2]).trim();
        if (t) addEdge(t, rec.name);
      }
      includeRe.lastIndex = 0;
      while ((m = includeRe.exec(body)) !== null) {
        const t = (m[1] ?? m[2]).trim();
        if (t) addEdge(t, rec.name);
      }
      footerRe.lastIndex = 0;
      while ((m = footerRe.exec(body)) !== null) {
        const back = m[1].trim();
        const next = m[2].trim();
        if (back) addEdge(back, rec.name);
        if (next) addEdge(next, rec.name);
      }
    }

    return { passageDefinitions, incomingEdges, orphanExempt };
  }

  /* loadAllPassageNames removed — passageDefinitions.keys() in loadCrossFileInfo
     covers the same data plus per-file source tracking for duplicate detection. */

  private async loadGlossary(): Promise<Map<string, string>> {
    const out = new Map<string, string>();
    if (!this.repoRoot) return out;
    const file = path.join(this.repoRoot, "sizzle", "src", "story", "variables.twee");
    let text = "";
    try {
      text = await fs.promises.readFile(file, "utf8");
    } catch {
      return out;
    }
    /* setup.glossary block. SugarCube form is <<set setup.glossary to { ... }>>;
       plain JS form is setup.glossary = { ... }. Accept either. We only
       care about the key names for lint purposes. */
    const blockMatch = text.match(/setup\.glossary\s*(?:=|\bto\b)\s*\{([\s\S]*?)\n\}/);
    if (!blockMatch) return out;
    const block = blockMatch[1];
    const keyRe = /(?:^|,)\s*(?:"([^"]+)"|'([^']+)')\s*:/g;
    let m: RegExpExecArray | null;
    while ((m = keyRe.exec(block)) !== null) {
      out.set(m[1] ?? m[2], "");
    }
    return out;
  }

  private async loadDeclaredVariables(): Promise<Set<string>> {
    /* A variable is "declared" if it's ever <<set>> or <<unset>> anywhere
       in src/. We walk all .twee and .js looking for these patterns.
       This catches: variables.twee setup, StoryInit assignments, and
       passages that introduce new variables mid-story. */
    const out = new Set<string>();
    if (!this.repoRoot) return out;

    const srcRoot = path.join(this.repoRoot, "sizzle", "src");
    const declareRe = /<<(?:set|unset)\s+\$([A-Za-z_][A-Za-z0-9_]*)/g;
    /* Also extract from <<set $x to ...>> inside <<silently>> blocks etc. (same syntax). */

    const walk = async (dir: string): Promise<void> => {
      let entries: fs.Dirent[];
      try {
        entries = await fs.promises.readdir(dir, { withFileTypes: true });
      } catch {
        return;
      }
      for (const entry of entries) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          await walk(full);
        } else if (entry.isFile() && (entry.name.endsWith(".twee") || entry.name.endsWith(".js"))) {
          let text = "";
          try {
            text = await fs.promises.readFile(full, "utf8");
          } catch {
            continue;
          }
          declareRe.lastIndex = 0;
          let m: RegExpExecArray | null;
          while ((m = declareRe.exec(text)) !== null) out.add(m[1]);
        }
      }
    };
    await walk(srcRoot);
    return out;
  }

  private async loadKnownMediaPaths(): Promise<Set<string>> {
    const out = new Set<string>();
    if (!this.repoRoot) return out;
    const root = path.join(this.repoRoot, "sizzle", "media");
    const walk = async (dir: string, prefix: string): Promise<void> => {
      let entries: fs.Dirent[];
      try {
        entries = await fs.promises.readdir(dir, { withFileTypes: true });
      } catch {
        return;
      }
      for (const entry of entries) {
        const full = path.join(dir, entry.name);
        const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
        if (entry.isDirectory()) {
          await walk(full, rel);
        } else if (entry.isFile()) {
          out.add(`media/${rel}`);
          out.add(rel);
        }
      }
    };
    await walk(root, "");
    return out;
  }
}
