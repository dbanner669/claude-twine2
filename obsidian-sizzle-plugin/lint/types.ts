/* -------------------------------------------------------------------------
 * Lint type model
 *
 * Shared types for the lint pipeline. A Diagnostic is one issue found in
 * one passage. A LintRule is a function that scans a parsed passage (and
 * optional global context) and returns zero or more Diagnostics.
 *
 * Severity:
 *   error    — something is structurally wrong (broken link, bad macro)
 *   warning  — something looks suspect (orphan passage, word count high)
 *   note     — editorial marker the writer left for later; not a problem
 * ------------------------------------------------------------------------- */

export type Severity = "error" | "warning" | "note";

export interface Diagnostic {
  ruleId: string;
  severity: Severity;
  message: string;
  /** Passage name from the :: header inside the shadow MD. */
  passageName: string;
  /** Vault-relative path to the shadow MD that contains this diagnostic. */
  filePath: string;
  /** 0-indexed line within the full shadow MD file (NOT line within the fence body). */
  line: number;
  /** 0-indexed column where the offending span starts. */
  col: number;
  /** Length of the offending span in characters. */
  length: number;
  /** Optional rule-specific structured data — used by editorial-note surfacing, etc. */
  data?: Record<string, unknown>;
}

export interface ParsedPassage {
  /** Passage name from the :: header. */
  name: string;
  /** Tag array from the :: header bracket. */
  tags: string[];
  /** Vault-relative path to the shadow MD. */
  filePath: string;
  /** Front-matter values as a flat key→value record. */
  frontMatter: Record<string, string | number>;
  /** Full text of the shadow MD (so rules can compute file-level offsets). */
  fileText: string;
  /** Lines of fileText, pre-split for convenience. */
  fileLines: string[];
  /** 0-indexed line within fileText where the :: header sits. */
  headerLine: number;
  /** 0-indexed line within fileText where the body content starts (line AFTER the :: header). */
  bodyStartLine: number;
  /** 0-indexed line where the body content ends (exclusive — first line after body). */
  bodyEndLine: number;
  /** The body text as a single string (with newlines). */
  body: string;
}

export interface LintContext {
  /** Map of glossary key (case-sensitive) to its definition. Populated from setup.glossary. */
  glossary: Map<string, string>;
  /** Set of all passage names found across the codebase — for ref-existence checks. */
  knownPassages: Set<string>;
  /** Map of passage name → list of source file paths where it's defined. >1 entry = duplicate. */
  passageDefinitions: Map<string, string[]>;
  /** Map of target passage name → set of source passages that link to it. */
  incomingEdges: Map<string, Set<string>>;
  /** Set of passage names exempt from orphan checks (system entries, widgets). */
  orphanExempt: Set<string>;
  /** Set of all media paths (relative to sizzle/) — for img-ref checks. */
  knownMediaPaths: Set<string>;
  /** Set of declared $-variables — anything ever <<set>> or <<unset>> anywhere in src/. */
  declaredVariables: Set<string>;
  /** Tag-coherence tracking for $player.storyTags / kinks / quirks / statusEffects.
      Per-field: union of string literals written (push/pushUnique/array-literal-in-set)
      and read (includes/indexOf/contains) anywhere in src/. */
  taggedFields: Map<TaggedField, { writes: Set<string>; reads: Set<string> }>;
}

export type TaggedField = "storyTags" | "kinks" | "quirks" | "statusEffects";

export interface LintRule {
  id: string;
  name: string;
  description: string;
  /**
   * Run the rule against a single parsed passage. Returning [] means "no issues."
   * Rules that need cross-passage knowledge (e.g. duplicate-name detection) get
   * called once per passage but can rely on ctx.knownPassages.
   */
  check(passage: ParsedPassage, ctx: LintContext): Diagnostic[];
}

/** Listener signature for diagnostic updates. */
export type LintListener = (diagnostics: Diagnostic[]) => void;
