/**
 * Phase 1 twee → ink bulk converter for the Sizzle Godot rebuild.
 *
 * Conversion target: sizzle/docs/godot/INK-CONVENTIONS.md, proven shape in
 * godot/content/slice/blackout_slice.ink. Ops/queries: STATE-SCHEMA.md
 * (godot/content/ops.ink). Prose carries over in full (no trimming).
 */

import type { TwinePassage, TwineStory } from "../types";
import { camelToSnake, convertExpr, knotRef } from "./expr";

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export interface Warning {
  file: string;
  passage: string;
  construct: string;
  detail: string;
}

export interface FileStats {
  passages: number;
  knots: number;
  stubs: number;
  checks: number;
  choices: number;
}

export interface ConvertOptions {
  /** Human label, e.g. "blackout". Used for file comments and the end knot. */
  label: string;
  /** Passage prefix, e.g. "BLK". */
  prefix: string;
  /** Source file name for warnings, e.g. "blackout.twee". */
  sourceName: string;
}

export interface ConvertResult {
  ink: string;
  warnings: Warning[];
  stats: FileStats;
}

// ---------------------------------------------------------------------------
// Tokenizer — split passage text into text / <<macro>> tokens
// ---------------------------------------------------------------------------

interface MacroTok {
  type: "macro";
  name: string;
  closing: boolean;
  args: string;
  raw: string;
}

interface TextTok {
  type: "text";
  value: string;
}

type Tok = MacroTok | TextTok;

export function tokenize(src: string): Tok[] {
  const toks: Tok[] = [];
  let i = 0;
  while (i < src.length) {
    const open = src.indexOf("<<", i);
    if (open === -1) {
      if (i < src.length) toks.push({ type: "text", value: src.slice(i) });
      break;
    }
    if (open > i) toks.push({ type: "text", value: src.slice(i, open) });

    // Find the matching >> with quote awareness.
    let j = open + 2;
    let quote: string | null = null;
    while (j < src.length) {
      const ch = src[j];
      if (quote) {
        if (ch === quote && src[j - 1] !== "\\") quote = null;
      } else if (ch === '"' || ch === "'") {
        quote = ch;
      } else if (ch === ">" && src[j + 1] === ">") {
        break;
      }
      j += 1;
    }
    if (j >= src.length) {
      toks.push({ type: "text", value: src.slice(open) });
      break;
    }

    const inner = src.slice(open + 2, j);
    const m = inner.match(/^(\/?)([A-Za-z_][\w-]*)([\s\S]*)$/);
    if (m) {
      toks.push({
        type: "macro",
        name: m[2],
        closing: m[1] === "/",
        args: m[3].trim(),
        raw: src.slice(open, j + 2),
      });
    } else {
      toks.push({ type: "text", value: src.slice(open, j + 2) });
    }
    i = j + 2;
  }
  return toks;
}

/** Split a macro argument string on whitespace, respecting quoted strings. */
export function parseArgs(args: string): string[] {
  const out: string[] = [];
  const re = /"((?:\\.|[^"\\])*)"|'((?:\\.|[^'\\])*)'|(\S+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(args)) !== null) {
    out.push(m[1] ?? m[2] ?? m[3]);
  }
  return out;
}

// ---------------------------------------------------------------------------
// Parser — token stream → node tree
// ---------------------------------------------------------------------------

interface TextNode {
  kind: "text";
  value: string;
}

interface MacroNode {
  kind: "macro";
  name: string;
  args: string;
  argv: string[];
}

interface IfNode {
  kind: "if";
  branches: { cond: string | null; children: Node[] }[];
}

interface SwitchNode {
  kind: "switch";
  expr: string;
  cases: { vals: string[] | null; children: Node[] }[];
}

interface CheckNode {
  kind: "check";
  argv: string[];
  pre: Node[];
  success: Node[];
  failure: Node[];
}

interface LinkNode {
  kind: "link";
  text: string;
  target?: string;
  children: Node[];
}

interface ContainerNode {
  kind: "container";
  name: string; // silently | page | nobr | linkreplace | replace
  arg?: string;
  children: Node[];
}

type Node = TextNode | MacroNode | IfNode | SwitchNode | CheckNode | LinkNode | ContainerNode;

const SIMPLE_CONTAINERS = new Set(["silently", "page", "nobr", "linkreplace", "replace"]);

class Parser {
  private pos = 0;

  constructor(private toks: Tok[]) {}

  parse(): Node[] {
    return this.seq(() => false);
  }

  /** Parse until EOF or a macro token matching `stop` (stop token not consumed). */
  private seq(stop: (t: MacroTok) => boolean): Node[] {
    const nodes: Node[] = [];
    while (this.pos < this.toks.length) {
      const t = this.toks[this.pos];
      if (t.type === "text") {
        nodes.push({ kind: "text", value: t.value });
        this.pos += 1;
        continue;
      }
      if (stop(t)) return nodes;
      this.pos += 1;
      if (t.closing) continue; // stray close; ignore

      if (t.name === "if") {
        nodes.push(this.parseIf(t));
      } else if (t.name === "switch") {
        nodes.push(this.parseSwitch(t));
      } else if (t.name === "skillCheck") {
        nodes.push(this.parseCheck(t));
      } else if (t.name === "link") {
        const argv = parseArgs(t.args);
        const children = this.until("link");
        nodes.push({ kind: "link", text: argv[0] ?? "", target: argv[1], children });
      } else if (SIMPLE_CONTAINERS.has(t.name)) {
        const argv = parseArgs(t.args);
        const children = this.until(t.name);
        nodes.push({ kind: "container", name: t.name, arg: argv[0], children });
      } else {
        nodes.push({ kind: "macro", name: t.name, args: t.args, argv: parseArgs(t.args) });
      }
    }
    return nodes;
  }

  private until(name: string): Node[] {
    const children = this.seq((t) => t.closing && t.name === name);
    this.pos += 1; // consume the close (or run past EOF harmlessly)
    return children;
  }

  private parseIf(open: MacroTok): IfNode {
    const branches: { cond: string | null; children: Node[] }[] = [];
    let cond: string | null = open.args;
    for (;;) {
      const children = this.seq(
        (t) => (t.closing && t.name === "if") || (!t.closing && (t.name === "elseif" || t.name === "else")),
      );
      branches.push({ cond, children });
      const next = this.toks[this.pos];
      if (!next || next.type !== "macro") break;
      this.pos += 1;
      if (next.closing) break; // <</if>>
      cond = next.name === "else" ? null : next.args;
    }
    return { kind: "if", branches };
  }

  private parseSwitch(open: MacroTok): SwitchNode {
    const cases: { vals: string[] | null; children: Node[] }[] = [];
    const stop = (t: MacroTok) =>
      (t.closing && t.name === "switch") || (!t.closing && (t.name === "case" || t.name === "default"));
    this.seq(stop); // discard anything before the first case
    for (;;) {
      const next = this.toks[this.pos];
      if (!next || next.type !== "macro") break;
      this.pos += 1;
      if (next.closing) break; // <</switch>>
      const vals = next.name === "default" ? null : parseArgs(next.args);
      const children = this.seq(stop);
      cases.push({ vals, children });
    }
    return { kind: "switch", expr: open.args, cases };
  }

  private parseCheck(open: MacroTok): CheckNode {
    const stop = (t: MacroTok) =>
      (t.closing && t.name === "skillCheck") || (!t.closing && (t.name === "success" || t.name === "failure"));
    const pre = this.seq(stop);
    let success: Node[] = [];
    let failure: Node[] = [];
    for (;;) {
      const next = this.toks[this.pos];
      if (!next || next.type !== "macro") break;
      this.pos += 1;
      if (next.closing) break; // <</skillCheck>>
      const body = this.seq(stop);
      if (next.name === "success") success = body;
      else failure = body;
    }
    return { kind: "check", argv: parseArgs(open.args), pre, success, failure };
  }
}

export function parsePassageText(text: string): Node[] {
  return new Parser(tokenize(text)).parse();
}

// ---------------------------------------------------------------------------
// Story context
// ---------------------------------------------------------------------------

interface StoryCtx {
  file: string;
  label: string;
  prefix: string;
  knots: Set<string>;
  vars: string[]; // declaration order, snake_case
  briefingVars: string[]; // subset of vars for the $briefing reset
  warnings: Warning[];
  stats: FileStats;
  endKnot: string;
  endUsed: boolean;
  endTargets: Set<string>;
}

function warn(ctx: StoryCtx, passage: string, construct: string, detail: string): void {
  ctx.warnings.push({ file: ctx.file, passage, construct, detail });
}

function registerVar(ctx: StoryCtx, name: string): void {
  if (!ctx.vars.includes(name)) ctx.vars.push(name);
}

// ---------------------------------------------------------------------------
// Inline text helpers
// ---------------------------------------------------------------------------

/** //emphasis// → [i]emphasis[/i] (BBCode; INK-CONVENTIONS.md rich text). */
export function convertEmphasis(line: string): string {
  return line.replace(/\/\/([^/]+?)\/\//g, "[i]$1[/i]");
}

/** <<term "KEY">> / <<term "KEY" "shown">> → [url=gloss:KEY]shown[/url]. */
export function convertTerm(argv: string[]): string {
  const key = argv[0] ?? "";
  const shown = argv[1] ?? key;
  return `[url=gloss:${key}]${shown}[/url]`;
}

const BENIGN_TAG =
  /^<\/(?:div|span|p)>$|^<(?:div|span)\s+(?:class="(?:choices|choice)"|id="[^"]*")\s*>$/;

// ---------------------------------------------------------------------------
// Writer
// ---------------------------------------------------------------------------

class Writer {
  lines: string[] = [];
  buf = "";
  indent = 0;
  choiceDepth = 1;
  choices = 0;
  diverts = 0;

  constructor(
    private ctx: StoryCtx,
    private passage: string,
  ) {}

  push(line: string): void {
    this.lines.push("    ".repeat(this.indent) + line);
  }

  text(fragment: string): void {
    this.buf += fragment;
  }

  flush(): void {
    const raw = this.buf;
    this.buf = "";
    this.emitProseLine(raw);
  }

  emitProseLine(raw: string): void {
    let line = raw.trim();
    if (!line) return;

    // Drop greyed visited-link placeholders (presentation reads visit counts).
    line = line.replace(/<span class="greyedOut">.*?<\/span>/g, "");

    // Images have no ink representation yet; keep a breadcrumb comment.
    line = line.replace(/<img\b[^>]*>/g, (m) => {
      const src = /src="([^"]*)"/.exec(m)?.[1] ?? "(unknown)";
      warn(this.ctx, this.passage, "raw-html-img", `<img> dropped, src=${src}`);
      this.push(`// [image] ${src} — native presentation TBD`);
      return "";
    });

    // Strip structural wrapper tags; warn on anything that isn't a known wrapper.
    line = line.replace(/<\/?(?:div|span|p)\b[^>]*>/g, (m) => {
      if (!BENIGN_TAG.test(m)) {
        warn(this.ctx, this.passage, "raw-html", `stripped tag: ${m}`);
      }
      return "";
    });

    line = line.trim();
    if (!line) return;

    // A line that is exactly one wiki link becomes a choice.
    const wiki = line.match(/^\[\[([^\]]+)\]\]$/);
    if (wiki) {
      const inner = wiki[1];
      const pipe = inner.indexOf("|");
      const text = pipe === -1 ? inner : inner.slice(0, pipe);
      const target = pipe === -1 ? inner : inner.slice(pipe + 1);
      this.emitChoice(text.trim(), target.trim());
      return;
    }
    if (line.includes("[[")) {
      warn(this.ctx, this.passage, "inline-link", `link embedded in prose line: ${line}`);
    }

    line = convertEmphasis(line);

    if (/\$[A-Za-z]/.test(line)) {
      warn(this.ctx, this.passage, "unconverted-var", `possible raw $var left in prose: ${line}`);
    }
    let depth = 0;
    for (const ch of line) {
      if (ch === "{") depth += 1;
      else if (ch === "}") depth -= 1;
      if (depth < 0) break;
    }
    if (depth !== 0) {
      warn(this.ctx, this.passage, "brace-in-prose", `unbalanced brace in prose line: ${line}`);
    }

    this.push(line);
  }

  resolveTarget(rawTarget: string): string {
    const knot = knotRef(rawTarget);
    if (knot && this.ctx.knots.has(knot)) return knot;
    this.ctx.endUsed = true;
    this.ctx.endTargets.add(rawTarget);
    warn(
      this.ctx,
      this.passage,
      "external-target",
      `link target "${rawTarget}" is outside this file — routed to ${this.ctx.endKnot}`,
    );
    return this.ctx.endKnot;
  }

  emitChoice(text: string, rawTarget: string, cond?: string): void {
    const target = this.resolveTarget(rawTarget);
    const stars = Array(this.choiceDepth).fill("*").join(" ");
    const condPart = cond ? ` {${cond}}` : "";
    this.push(`${stars}${condPart} [${convertEmphasis(text)}] -> ${target}`);
    this.choices += 1;
  }

  divert(rawTarget: string): void {
    this.push(`-> ${this.resolveTarget(rawTarget)}`);
    this.diverts += 1;
  }
}

// ---------------------------------------------------------------------------
// Ops conversion (<<silently>> preambles, <<set>>, time macros, …)
// ---------------------------------------------------------------------------

interface OpCtx {
  temps: Set<string>;
  header: { location?: string; time?: string };
}

function isLiteral(value: string): boolean {
  return /^(-?\d+(\.\d+)?|true|false|"[^"]*")$/.test(value.trim());
}

/** Convert one <<set …>> into zero or more op lines. */
function convertSet(
  args: string,
  ctx: StoryCtx,
  opCtx: OpCtx,
  passage: string,
  out: (line: string) => void,
): void {
  const m = args.match(/^(\S+)\s+(to|\+=|-=|=)\s+([\s\S]+)$/);
  if (!m) {
    warn(ctx, passage, "unconverted-set", `<<set ${args}>>`);
    out(`// UNCONVERTED: <<set ${args}>>`);
    return;
  }
  const [, target, op, valueRaw] = m;
  const value = valueRaw.trim();

  if (target === "$header.location" || target === "$header.time") {
    const str = value.match(/^"([\s\S]*)"$/);
    if (!str) {
      warn(ctx, passage, "header", `non-literal header value: <<set ${args}>>`);
      return;
    }
    if (target === "$header.location") opCtx.header.location = str[1];
    else opCtx.header.time = str[1];
    return;
  }

  const flags = target.match(/^\$player\.flags\.([A-Za-z]\w*)$/);
  if (flags && op === "to") {
    const name = camelToSnake(flags[1]);
    registerVar(ctx, name);
    out(`~ ${name} = ${convertExpr(value).out}`);
    return;
  }

  if (target === "$briefing" && value === "{}") {
    out("// reset scene state ($briefing = {})");
    for (const name of ctx.briefingVars) out(`~ ${name} = false`);
    return;
  }

  const briefing = target.match(/^\$briefing\.([A-Za-z]\w*)$/);
  if (briefing && op === "to") {
    const name = `briefing_${camelToSnake(briefing[1])}`;
    registerVar(ctx, name);
    out(`~ ${name} = ${convertExpr(value).out}`);
    return;
  }

  const skill = target.match(/^\$player\.skills\.([A-Za-z]\w*)\.level$/);
  if (skill && op === "+=") {
    out(`~ grant_skill("${skill[1].toLowerCase()}", ${convertExpr(value).out})`);
    return;
  }

  if (target === "$nyse.influence" && op === "+=") {
    out(`~ adjust_influence(${convertExpr(value).out})`);
    return;
  }

  if (target === "$player.incitingIncident") {
    warn(
      ctx,
      passage,
      "no-op-for-write",
      `inciting_incident is mirrored (read-only in ink); ` +
        `the native CC-500 handoff must apply <<set ${args}>>`,
    );
    out(`// TODO(runtime): native CC-500 handoff sets inciting_incident ${op} ${value}`);
    return;
  }

  const temp = target.match(/^_([A-Za-z]\w*)$/);
  if (temp) {
    const looksLikeCheckExpr =
      /checkSkill|composureSkill/i.test(temp[1]) ||
      /Math\.|typeof|\$player\.skills|currentComposure/.test(value);
    if (looksLikeCheckExpr) {
      warn(
        ctx,
        passage,
        "check-expr-dropped",
        `<<set ${args}>> dropped — skill resolution moves to the engine via the # check tag`,
      );
      return;
    }
    if (isLiteral(value) && op === "to") {
      const name = camelToSnake(temp[1]);
      if (opCtx.temps.has(name)) {
        out(`~ ${name} = ${value}`);
      } else {
        opCtx.temps.add(name);
        out(`~ temp ${name} = ${value}`);
      }
      return;
    }
  }

  warn(ctx, passage, "unconverted-set", `<<set ${args}>>`);
  out(`// UNCONVERTED: <<set ${args}>>`);
}

/** Ops that map 1:1 onto the command surface. Returns null when not an op macro. */
function convertOpMacro(node: MacroNode, ctx: StoryCtx, passage: string): string | null {
  const a = node.argv;
  switch (node.name) {
    case "setDate":
      return `~ set_date(${a[0]}, ${a[1]}, ${a[2]}, "${a[3]}")`;
    case "setTime":
      return `~ set_time("${a[0]}")`;
    case "advanceTime":
      return `~ advance_time(${a[0] ?? 1})`;
    case "advanceDays":
      return `~ advance_days(${a[0]}, "${a[1]}")`;
    case "resetComposure":
      return "~ reset_composure()";
    case "setCurrentComposure":
      return `~ set_composure(${a[0]})`;
    case "adjustComposure":
      return `~ adjust_composure(${a[0]})`;
    case "addNotification":
      return `~ toast("info", "${(a[0] ?? "").replace(/"/g, '\\"')}")`;
    default:
      return null;
  }
}

// ---------------------------------------------------------------------------
// Body renderer
// ---------------------------------------------------------------------------

const DATE_TIME_MACROS = new Set(["setDate", "setTime", "advanceTime", "advanceDays"]);

interface Preamble {
  dateTime: string[];
  header: string | null;
  rest: string[];
}

function isWhitespace(node: Node): boolean {
  return node.kind === "text" && node.value.trim() === "";
}

function meaningful(nodes: Node[]): Node[] {
  return nodes.filter((n) => !isWhitespace(n));
}

class PassageRenderer {
  private opCtx: OpCtx = { temps: new Set(), header: {} };

  constructor(
    private ctx: StoryCtx,
    private passage: TwinePassage,
    private w: Writer,
  ) {}

  // ---- ops context ---------------------------------------------------------

  renderPreamble(silently: ContainerNode): Preamble {
    const pre: Preamble = { dateTime: [], header: null, rest: [] };
    const sub = new Writer(this.ctx, this.passage.name);
    for (const node of silently.children) {
      if (node.kind === "text") {
        this.opComment(node.value, (l) => sub.push(l));
        continue;
      }
      if (node.kind === "macro" && DATE_TIME_MACROS.has(node.name)) {
        const line = convertOpMacro(node, this.ctx, this.passage.name);
        if (line) pre.dateTime.push(line);
        continue;
      }
      this.renderOpNode(node, sub);
    }
    pre.rest = sub.lines;
    const h = this.opCtx.header;
    if (h.location !== undefined || h.time !== undefined) {
      pre.header = `~ set_header("${h.location ?? ""}", "${h.time ?? ""}")`;
      if (h.location === undefined || h.time === undefined) {
        warn(this.ctx, this.passage.name, "header", "header pair incomplete (location/time)");
      }
      this.opCtx.header = {};
    }
    return pre;
  }

  private opComment(text: string, out: (line: string) => void): void {
    const re = /\/\*([\s\S]*?)\*\//g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      const body = m[1].trim().replace(/\s*\n\s*/g, " ");
      if (body) out(`// ${body}`);
    }
    const leftover = text.replace(re, "").trim();
    if (leftover) {
      warn(this.ctx, this.passage.name, "silently-text", `stray text in <<silently>>: ${leftover}`);
    }
  }

  /** Render an ops-context node (inside <<silently>> or an op-only <<if>>). */
  private renderOpNode(node: Node, w: Writer): void {
    if (node.kind === "text") {
      this.opComment(node.value, (l) => w.push(l));
      return;
    }
    if (node.kind === "macro") {
      if (node.name === "set") {
        convertSet(node.args, this.ctx, this.opCtx, this.passage.name, (l) => w.push(l));
        return;
      }
      const line = convertOpMacro(node, this.ctx, this.passage.name);
      if (line) {
        w.push(line);
        return;
      }
      warn(this.ctx, this.passage.name, "unconverted-macro", `<<${node.name} ${node.args}>> in ops context`);
      w.push(`// UNCONVERTED: <<${node.name} ${node.args}>>`);
      return;
    }
    if (node.kind === "if") {
      this.renderOpIf(node, w);
      return;
    }
    warn(this.ctx, this.passage.name, "unconverted-node", `${node.kind} node in ops context`);
  }

  private renderOpIf(node: IfNode, w: Writer): void {
    const branches = node.branches;
    const renderChildren = (children: Node[]) => {
      w.indent += 1;
      for (const c of children) this.renderOpNode(c, w);
      w.indent -= 1;
    };
    const cond = (c: string | null) => this.expr(c ?? "");
    if (branches.length === 1) {
      w.push(`{ ${cond(branches[0].cond)}:`);
      renderChildren(branches[0].children);
      w.push("}");
    } else if (branches.length === 2 && branches[1].cond === null) {
      w.push(`{ ${cond(branches[0].cond)}:`);
      renderChildren(branches[0].children);
      w.push("- else:");
      renderChildren(branches[1].children);
      w.push("}");
    } else {
      w.push("{");
      for (const b of branches) {
        w.push(`- ${b.cond === null ? "else" : cond(b.cond)}:`);
        renderChildren(b.children);
      }
      w.push("}");
    }
  }

  expr(src: string): string {
    const r = convertExpr(src);
    if (!r.ok) {
      warn(this.ctx, this.passage.name, "unconverted-expr", src);
    }
    // Register story-local flag vars found in expressions.
    const flagRe = /\$player\.flags\.([A-Za-z]\w*)|\$briefing\.([A-Za-z]\w*)/g;
    let m: RegExpExecArray | null;
    while ((m = flagRe.exec(src)) !== null) {
      registerVar(this.ctx, m[1] ? camelToSnake(m[1]) : `briefing_${camelToSnake(m[2])}`);
    }
    return r.out;
  }

  // ---- prose context --------------------------------------------------------

  renderBody(nodes: Node[]): void {
    const w = this.w;
    for (let i = 0; i < nodes.length; i += 1) {
      const node = nodes[i];
      switch (node.kind) {
        case "text": {
          const parts = node.value.split("\n");
          for (let k = 0; k < parts.length; k += 1) {
            if (k > 0) w.flush();
            w.text(parts[k]);
          }
          break;
        }
        case "macro":
          this.renderProseMacro(node);
          break;
        case "container":
          this.renderContainer(node);
          break;
        case "link":
          w.flush();
          this.renderLink(node);
          break;
        case "if": {
          if (this.tryHubChoice(node)) break;
          const nextInline =
            w.buf.trim() !== "" ||
            (nodes[i + 1]?.kind === "text" &&
              (nodes[i + 1] as TextNode).value.length > 0 &&
              !(nodes[i + 1] as TextNode).value.startsWith("\n"));
          this.renderIf(node, nextInline);
          break;
        }
        case "switch":
          this.renderIf(this.switchToIf(node), false);
          break;
        case "check":
          this.renderCheck(node);
          break;
      }
    }
    w.flush();
  }

  private renderProseMacro(node: MacroNode): void {
    const w = this.w;
    switch (node.name) {
      case "term":
        w.text(convertTerm(node.argv));
        return;
      case "print":
        w.text(this.convertPrint(node.args));
        return;
      case "playerRealName":
      case "playerName":
        w.text("{player_name}");
        return;
      case "playerFullName":
        w.text("{player_full_name}");
        return;
      case "header":
      case "page":
      case "nobr":
        return; // presentation widgets — native UI
      case "goto": {
        w.flush();
        w.divert(node.argv[0] ?? "");
        return;
      }
      case "include":
        warn(this.ctx, this.passage.name, "include", `<<include ${node.args}>> needs manual review`);
        w.flush();
        w.push(`// UNCONVERTED: <<include ${node.args}>>`);
        return;
      case "set":
      case "setDate":
      case "setTime":
      case "advanceTime":
      case "advanceDays":
      case "resetComposure":
      case "setCurrentComposure":
      case "adjustComposure":
      case "addNotification":
        w.flush();
        this.renderOpNode(node, w);
        return;
      default:
        warn(this.ctx, this.passage.name, "unconverted-macro", `<<${node.name} ${node.args}>>`);
        w.flush();
        w.push(`// UNCONVERTED: <<${node.name} ${node.args}>>`);
    }
  }

  private renderContainer(node: ContainerNode): void {
    const w = this.w;
    if (node.name === "silently") {
      // Mid-body silently block: emit ops inline.
      w.flush();
      for (const child of node.children) this.renderOpNode(child, w);
      const h = this.opCtx.header;
      if (h.location !== undefined || h.time !== undefined) {
        w.push(`~ set_header("${h.location ?? ""}", "${h.time ?? ""}")`);
        this.opCtx.header = {};
      }
      return;
    }
    if (node.name === "page" || node.name === "nobr") {
      this.renderBody(node.children);
      return;
    }
    if (node.name === "linkreplace") {
      w.flush();
      this.renderReveal(node.arg ?? "", node.children, "<<linkreplace>>");
      return;
    }
    if (node.name === "replace") {
      // Bare <<replace>> outside <<link>> — unexpected; render children in place.
      warn(this.ctx, this.passage.name, "replace", "bare <<replace>> rendered in place");
      this.renderBody(node.children);
      return;
    }
    this.renderBody(node.children);
  }

  /** Choice-with-content + gather (INK-CONVENTIONS.md reveal drift, default form). */
  private renderReveal(text: string, children: Node[], construct: string): void {
    const w = this.w;
    warn(
      this.ctx,
      this.passage.name,
      "reveal-drift",
      `${construct} "${text}" → choice+gather (append drift accepted per conventions)`,
    );
    w.push(`${Array(w.choiceDepth).fill("*").join(" ")} [${convertEmphasis(text)}]`);
    w.choices += 1;
    w.indent += 1;
    w.choiceDepth += 1;
    this.renderBody(children);
    w.choiceDepth -= 1;
    w.indent -= 1;
  }

  private renderLink(node: LinkNode): void {
    const w = this.w;
    const kids = meaningful(node.children);

    // <<link "text" "Target">> with ops inside → choice with ops + divert.
    if (node.target !== undefined) {
      if (kids.length === 0) {
        w.emitChoice(node.text, node.target);
        return;
      }
      w.push(`${Array(w.choiceDepth).fill("*").join(" ")} [${convertEmphasis(node.text)}]`);
      w.choices += 1;
      w.indent += 1;
      for (const child of kids) this.renderOpNode(child, w);
      w.divert(node.target);
      w.indent -= 1;
      return;
    }

    // <<link "text">><<goto "Target">><</link>> → plain choice.
    if (kids.length === 1 && kids[0].kind === "macro" && kids[0].name === "goto") {
      w.emitChoice(node.text, (kids[0] as MacroNode).argv[0] ?? "");
      return;
    }

    // <<link "text">><<replace "#id">>…<</replace>><</link>> → reveal.
    if (kids.length === 1 && kids[0].kind === "container" && (kids[0] as ContainerNode).name === "replace") {
      this.renderReveal(node.text, (kids[0] as ContainerNode).children, "<<link>>+<<replace>>");
      return;
    }

    // Fallback: reveal with whatever the body is.
    this.renderReveal(node.text, node.children, "<<link>>");
  }

  /**
   * Visited-question hub pattern (INTRO-410):
   *   <<if not hasVisited(X)>><<link "t">><<goto Y>><</link>><<else>>greyed<</if>>
   * → conditional once-only choice `* {cond} [t] -> Y`.
   */
  private tryHubChoice(node: IfNode): boolean {
    if (node.branches.length < 1 || node.branches[0].cond === null) return false;
    const first = meaningful(node.branches[0].children);
    if (first.length !== 1 || first[0].kind !== "link") return false;
    const link = first[0] as LinkNode;
    const kids = meaningful(link.children);
    let target: string | undefined = link.target;
    if (!target && kids.length === 1 && kids[0].kind === "macro" && kids[0].name === "goto") {
      target = (kids[0] as MacroNode).argv[0];
    }
    if (!target || (kids.length > 0 && !(kids.length === 1 && kids[0].kind === "macro" && kids[0].name === "goto"))) {
      return false;
    }
    // Remaining branches must be greyed-out presentation only.
    for (const b of node.branches.slice(1)) {
      for (const child of meaningful(b.children)) {
        if (child.kind !== "text" || !/greyedOut/.test(child.value)) return false;
      }
    }
    this.w.flush();
    this.w.emitChoice(link.text, target, this.expr(node.branches[0].cond));
    warn(
      this.ctx,
      this.passage.name,
      "hub-conditional-link",
      `visited-link hub "${link.text}" → conditional once-only choice`,
    );
    return true;
  }

  private switchToIf(node: SwitchNode): IfNode {
    warn(this.ctx, this.passage.name, "switch", "switch/case converted to conditional block");
    const branches = node.cases.map((c) => ({
      cond:
        c.vals === null
          ? null
          : c.vals.map((v) => `${node.expr} eq ${JSON.stringify(v)}`).join(" or "),
      children: c.children,
    }));
    return { kind: "if", branches };
  }

  private renderIf(node: IfNode, inlineContext: boolean): void {
    const w = this.w;

    if (inlineContext) {
      const inline = this.tryInlineIf(node);
      if (inline !== null) {
        w.text(inline);
        return;
      }
    }

    w.flush();
    // Op-only if? (e.g. one-shot grant guards inside check branches)
    const allOps = this.ifIsOpsOnly(node);
    if (allOps) {
      this.renderOpIf(node, w);
      return;
    }

    const cond = (c: string | null) => this.expr(c ?? "");
    const renderChildren = (children: Node[]) => {
      w.indent += 1;
      this.renderBody(children);
      w.indent -= 1;
    };
    if (node.branches.length === 1) {
      w.push(`{ ${cond(node.branches[0].cond)}:`);
      renderChildren(node.branches[0].children);
      w.push("}");
    } else if (node.branches.length === 2 && node.branches[1].cond === null) {
      w.push(`{ ${cond(node.branches[0].cond)}:`);
      renderChildren(node.branches[0].children);
      w.push("- else:");
      renderChildren(node.branches[1].children);
      w.push("}");
    } else {
      w.push("{");
      for (const b of node.branches) {
        w.push(`- ${b.cond === null ? "else" : cond(b.cond)}:`);
        renderChildren(b.children);
      }
      w.push("}");
    }
  }

  private ifIsOpsOnly(node: IfNode): boolean {
    const opsOnly = (nodes: Node[]): boolean =>
      nodes.every(
        (n) =>
          isWhitespace(n) ||
          (n.kind === "macro" &&
            (n.name === "set" || DATE_TIME_MACROS.has(n.name) || convertOpMacro(n, this.ctx, "") !== null)) ||
          (n.kind === "if" && opsOnly((n as IfNode).branches.flatMap((b) => b.children))),
      );
    return node.branches.every((b) => opsOnly(b.children));
  }

  /** Render an if group inline: {cond: a|b}. Returns null when not inline-able. */
  private tryInlineIf(node: IfNode): string | null {
    const parts: { cond: string | null; text: string }[] = [];
    for (const b of node.branches) {
      const text = this.tryInlineSeq(b.children);
      if (text === null) return null;
      parts.push({ cond: b.cond, text });
    }
    const build = (items: { cond: string | null; text: string }[]): string => {
      if (items.length === 1) {
        return items[0].cond === null
          ? items[0].text
          : `{${this.expr(items[0].cond)}: ${items[0].text}}`;
      }
      if (items.length === 2 && items[1].cond === null) {
        return `{${this.expr(items[0].cond ?? "")}: ${items[0].text}|${items[1].text}}`;
      }
      return `{${this.expr(items[0].cond ?? "")}: ${items[0].text}|${build(items.slice(1))}}`;
    };
    return build(parts);
  }

  private tryInlineSeq(nodes: Node[]): string | null {
    let out = "";
    for (const node of nodes) {
      if (node.kind === "text") {
        if (/\S\s*\n\s*\S/.test(node.value)) return null; // real line break
        out += node.value.replace(/\n/g, " ");
      } else if (node.kind === "macro" && node.name === "term") {
        out += convertTerm(node.argv);
      } else if (node.kind === "macro" && node.name === "print") {
        out += this.convertPrint(node.args);
      } else if (
        node.kind === "macro" &&
        (node.name === "playerRealName" || node.name === "playerName")
      ) {
        out += "{player_name}";
      } else if (node.kind === "if") {
        const nested = this.tryInlineIf(node);
        if (nested === null) return null;
        out += nested;
      } else {
        return null;
      }
    }
    if (out.includes("[[")) return null;
    return convertEmphasis(out.replace(/\s+/g, " ").trim());
  }

  private convertPrint(args: string): string {
    const fallback = args.match(/^([\s\S]+?)\s*\|\|\s*"([^"]*)"$/);
    if (fallback) {
      const e = this.expr(fallback[1]);
      return `{${e} != "": {${e}}|${fallback[2]}}`;
    }
    const e = this.expr(args);
    const MIRROR = new Set([
      "background",
      "inciting_incident",
      "arousal",
      "baseline_composure",
      "current_composure",
      "nyse_influence",
      "date_slot",
      "day_of_week",
      "player_name",
      "player_full_name",
      "cover_known_as",
      "codename",
    ]);
    if (!MIRROR.has(e)) {
      warn(this.ctx, this.passage.name, "print-non-mirror", `<<print ${args}>> — not in the mirror set`);
    }
    return `{${e}}`;
  }

  private renderCheck(node: CheckNode): void {
    const w = this.w;
    this.renderBody(node.pre);
    w.flush();
    w.push("{ check_passed:");
    w.indent += 1;
    this.renderBody(node.success);
    w.indent -= 1;
    w.push("- else:");
    w.indent += 1;
    this.renderBody(node.failure);
    w.indent -= 1;
    w.push("}");
  }
}

// ---------------------------------------------------------------------------
// Tags
// ---------------------------------------------------------------------------

interface TagInfo {
  screen?: string;
  avatar?: string;
  mode?: string;
  historyRoot: boolean;
}

function mapTags(tags: string[], ctx: StoryCtx, passage: string): TagInfo {
  const info: TagInfo = { historyRoot: false };
  for (const tag of tags) {
    if (tag === "nobr") continue;
    if (tag === "daytime") info.mode = "day";
    else if (tag === "nighttime") info.mode = "night";
    else if (tag === "avatar-hidden") info.screen = "menu";
    else if (tag === "character-creation") info.screen = "creation";
    else if (tag === "history-root") info.historyRoot = true;
    else {
      const avatar = tag.match(/^avatar-([a-z]+)-(day|night)$/);
      if (avatar) info.avatar = `${avatar[1]}_${avatar[2]}`;
      else warn(ctx, passage, "unknown-tag", tag);
    }
  }
  return info;
}

// ---------------------------------------------------------------------------
// Skill checks — # check tag hoisting
// ---------------------------------------------------------------------------

function findChecks(nodes: Node[]): CheckNode[] {
  const found: CheckNode[] = [];
  const walk = (list: Node[]) => {
    for (const n of list) {
      switch (n.kind) {
        case "check":
          found.push(n);
          walk(n.pre);
          walk(n.success);
          walk(n.failure);
          break;
        case "if":
          for (const b of n.branches) walk(b.children);
          break;
        case "switch":
          for (const c of n.cases) walk(c.children);
          break;
        case "link":
        case "container":
          walk(n.children);
          break;
        default:
          break;
      }
    }
  };
  walk(nodes);
  return found;
}

export function checkTag(argv: string[], ctx: StoryCtx, passage: string): string {
  const skillRaw = argv[0] ?? "";
  const dice = argv[1] ?? "2d6";
  const target = argv[argv.length - 1] ?? "?";
  const skill = skillRaw.toLowerCase().replace(/\s*\/\s*/g, "/").trim();
  if (skill.includes("/")) {
    warn(
      ctx,
      passage,
      "multi-skill-check",
      `"${skillRaw}" — engine must resolve max-of semantics for "${skill}"`,
    );
  }
  return `# check: ${skill} ${dice} ${target}`;
}

// ---------------------------------------------------------------------------
// Branch file extracts → stub knots
// ---------------------------------------------------------------------------

function isExtractPassage(text: string): boolean {
  return text.includes('class="eyebrow') && text.includes("background:var(--sz-ink-3)");
}

interface ExtractInfo {
  id: string;
  placeholder: string;
  html: string;
}

function deriveExtract(passage: TwinePassage, ctx: StoryCtx): ExtractInfo {
  const text = passage.text;
  const eyebrowMatch = text.match(/<div class="eyebrow[^>]*>([\s\S]*?)<\/div>/);
  const eyebrowRaw = eyebrowMatch ? eyebrowMatch[1].replace(/<[^>]+>/g, "").trim() : "";
  const parts = eyebrowRaw.split("·").map((p) => p.trim()).filter(Boolean);

  const title = passage.name.replace(/^[A-Z]+-\d+[a-zA-Z]?\s*/, "").trim();
  const prefixLc = ctx.prefix.toLowerCase();
  let suffix = "";
  for (const part of parts) {
    if (/^\d{2}-[A-Z]{3}-\d{4}$/.test(part)) suffix = part.replace(/-/g, "_");
  }
  if (!suffix && parts.some((p) => /R\.\s*Flett/.test(p))) suffix = "r_flett";
  const id = [prefixLc, camelToSnake(title.replace(/\s+/g, "_")).replace(/__+/g, "_"), suffix]
    .filter(Boolean)
    .join("_")
    .replace(/[^a-z0-9_]/gi, "");

  let placeholder: string;
  if (parts.length === 3 && parts[2].toLowerCase() === "extract") {
    placeholder = `${parts[0]} ${parts[1]}, extract.`;
  } else if (parts.length > 0) {
    placeholder = `${parts.join(", ")}.`;
  } else {
    placeholder = `${title}.`;
  }
  placeholder += " Rendered by the native BranchFileExtract scene template; this knot is a placeholder.";

  const htmlStart = text.indexOf("<div");
  const htmlEnd = text.lastIndexOf("</div>");
  const html = htmlStart !== -1 && htmlEnd !== -1 ? text.slice(htmlStart, htmlEnd + 6) : "";

  return { id, placeholder, html };
}

// ---------------------------------------------------------------------------
// Passage conversion
// ---------------------------------------------------------------------------

function preprocess(text: string): string {
  return text.replace(/\r/g, "").replace(/\\[ \t]*$/gm, "");
}

export function convertPassage(passage: TwinePassage, ctx: StoryCtx): string[] {
  const knot = knotRef(passage.name);
  if (!knot) {
    warn(ctx, passage.name, "unnamed-passage", "no PREFIX-NUMBER head; passage skipped");
    return [];
  }

  const text = preprocess(passage.text);
  const tree = parsePassageText(text);
  const stub = isExtractPassage(text);
  const title = passage.name.replace(/^[A-Z]+-\d+[a-zA-Z]?\s*/, "").trim();
  const tagInfo = mapTags(passage.tags ?? [], ctx, passage.name);

  const w = new Writer(ctx, passage.name);
  const renderer = new PassageRenderer(ctx, passage, w);

  // Locate the preamble <<silently>> (first meaningful top-level node).
  let preambleNode: ContainerNode | null = null;
  const bodyNodes: Node[] = [];
  let seenMeaningful = false;
  for (const node of tree) {
    if (!seenMeaningful && !isWhitespace(node) && node.kind === "container" && node.name === "silently") {
      preambleNode = node;
      seenMeaningful = true;
      continue;
    }
    if (!isWhitespace(node)) seenMeaningful = true;
    bodyNodes.push(node);
  }

  const preamble = preambleNode
    ? renderer.renderPreamble(preambleNode)
    : { dateTime: [], header: null, rest: [] };

  // Hoist # check tags (protocol: tag lives on the knot).
  const checks = findChecks(bodyNodes);
  if (checks.length > 1) {
    warn(ctx, passage.name, "multiple-checks", `${checks.length} skillCheck blocks in one passage`);
  }

  const lines: string[] = [];
  const comment =
    (stub ? `// ${title} — Branch file extract STUB (native scene template later)` : `// ${title}`) +
    (checks.length > 0 ? " — # check protocol knot" : "");
  lines.push(comment);
  lines.push(`=== ${knot} ===`);
  lines.push(`# id: ${knot}`);

  if (stub) {
    const info = deriveExtract(passage, ctx);
    lines.push("# screen: menu");
    lines.push("# scene: branch_file_extract");
    lines.push(`# extract: ${info.id}`);
    warn(
      ctx,
      passage.name,
      "extract-stub",
      `document passage stubbed (# extract: ${info.id}); HTML preserved in the report:\n${info.html}`,
    );
    lines.push(...preamble.dateTime);
    if (preamble.header) lines.push(preamble.header);
    lines.push(...preamble.rest);
    lines.push(info.placeholder);

    // Onward navigation: first wiki link or <<link>> in the body.
    const emitOnward = (nodes: Node[]): boolean => {
      for (const node of nodes) {
        if (node.kind === "text") {
          const wiki = node.value.match(/\[\[([^\]]+)\]\]/);
          if (wiki) {
            const inner = wiki[1];
            const pipe = inner.indexOf("|");
            w.emitChoice(
              (pipe === -1 ? inner : inner.slice(0, pipe)).trim(),
              (pipe === -1 ? inner : inner.slice(pipe + 1)).trim(),
            );
            return true;
          }
        } else if (node.kind === "link") {
          renderer["renderLink"](node);
          return true;
        } else if (node.kind === "container") {
          if (emitOnward(node.children)) return true;
        }
      }
      return false;
    };
    if (!emitOnward(bodyNodes)) {
      warn(ctx, passage.name, "extract-stub", "no onward link found; knot ends the story");
      w.push("-> END");
      w.diverts += 1;
    }
    lines.push(...w.lines);
    ctx.stats.stubs += 1;
    ctx.stats.knots += 1;
    if (checks.length > 0) ctx.stats.checks += checks.length;
    return lines;
  }

  if (tagInfo.screen) lines.push(`# screen: ${tagInfo.screen}`);
  if (tagInfo.avatar) lines.push(`# avatar: ${tagInfo.avatar}`);
  if (tagInfo.mode) lines.push(`# mode: ${tagInfo.mode}`);
  if (tagInfo.historyRoot) lines.push("# history_root");
  for (const check of checks) {
    lines.push(checkTag(check.argv, ctx, passage.name));
  }

  lines.push(...preamble.dateTime);
  if (preamble.header) lines.push(preamble.header);
  lines.push(...preamble.rest);

  renderer.renderBody(bodyNodes);
  lines.push(...w.lines);

  if (w.choices === 0 && w.diverts === 0) {
    lines.push("-> END");
  }

  ctx.stats.knots += 1;
  ctx.stats.checks += checks.length;
  ctx.stats.choices += w.choices;
  return lines;
}

// ---------------------------------------------------------------------------
// Story conversion
// ---------------------------------------------------------------------------

export function convertStory(story: TwineStory, opts: ConvertOptions): ConvertResult {
  const passages = story.passages.filter((p) => knotRef(p.name) !== null);

  const ctx: StoryCtx = {
    file: opts.sourceName,
    label: opts.label,
    prefix: opts.prefix,
    knots: new Set(passages.map((p) => knotRef(p.name) as string)),
    vars: [],
    briefingVars: [],
    warnings: [],
    stats: { passages: story.passages.length, knots: 0, stubs: 0, checks: 0, choices: 0 },
    endKnot: `${opts.prefix.toLowerCase()}_end`,
    endUsed: false,
    endTargets: new Set(),
  };

  // Pre-register story-local vars in first-appearance order so declarations and
  // the `$briefing to {}` reset see the full set.
  for (const p of story.passages) {
    const re = /\$player\.flags\.([A-Za-z]\w*)|\$briefing\.([A-Za-z]\w*)/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(p.text)) !== null) {
      if (m[1]) registerVar(ctx, camelToSnake(m[1]));
      else {
        const name = `briefing_${camelToSnake(m[2])}`;
        registerVar(ctx, name);
        if (!ctx.briefingVars.includes(name)) ctx.briefingVars.push(name);
      }
    }
  }

  const knotBlocks: string[][] = [];
  for (const p of passages) {
    knotBlocks.push(convertPassage(p, ctx));
  }

  const out: string[] = [];
  out.push(
    `// GENERATED by twine-mcp-server \`npm run export-ink\` from sizzle/archive/twee-src/content/${opts.sourceName}.`,
  );
  out.push(
    "// Phase 1 bulk conversion — conventions: sizzle/docs/godot/INK-CONVENTIONS.md.",
  );
  out.push(
    "// Hand-edits must be recorded in sizzle/docs/godot/PHASE-1-CONVERSION-REPORT.md.",
  );
  out.push("");
  out.push("INCLUDE mirror.ink");
  out.push("INCLUDE ops.ink");
  out.push("");
  if (ctx.vars.length > 0) {
    out.push("// Story-local narrative state (not mirrored; ink may assign freely).");
    for (const v of ctx.vars) out.push(`VAR ${v} = false`);
    out.push("");
  }
  const entry = knotRef(passages[0]?.name ?? "");
  if (entry) {
    out.push(`-> ${entry}`);
    out.push("");
  }

  for (const block of knotBlocks) {
    if (block.length === 0) continue;
    out.push(...block);
    out.push("");
  }

  if (ctx.endUsed) {
    const targets = Array.from(ctx.endTargets).join(", ");
    out.push(`// Native-scene handoff — original twee target(s): ${targets}.`);
    out.push(`=== ${ctx.endKnot} ===`);
    out.push(`# id: ${ctx.endKnot}`);
    out.push(
      `The ${opts.label} sequence ends here; the runtime hands off to the native scene (${targets}).`,
    );
    out.push("-> END");
    out.push("");
  }

  return { ink: out.join("\n"), warnings: ctx.warnings, stats: ctx.stats };
}

/** Test helper: convert a single twee passage in a minimal story context. */
export function convertPassageStandalone(
  passage: TwinePassage,
  extraKnots: string[] = [],
  prefix = "TEST",
): { lines: string[]; warnings: Warning[]; vars: string[] } {
  const ctx: StoryCtx = {
    file: "test.twee",
    label: "test",
    prefix,
    knots: new Set([knotRef(passage.name) ?? "", ...extraKnots].filter(Boolean) as string[]),
    vars: [],
    briefingVars: [],
    warnings: [],
    stats: { passages: 1, knots: 0, stubs: 0, checks: 0, choices: 0 },
    endKnot: `${prefix.toLowerCase()}_end`,
    endUsed: false,
    endTargets: new Set(),
  };
  const re = /\$player\.flags\.([A-Za-z]\w*)|\$briefing\.([A-Za-z]\w*)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(passage.text)) !== null) {
    if (m[1]) registerVar(ctx, camelToSnake(m[1]));
    else {
      const name = `briefing_${camelToSnake(m[2])}`;
      registerVar(ctx, name);
      if (!ctx.briefingVars.includes(name)) ctx.briefingVars.push(name);
    }
  }
  const lines = convertPassage(passage, ctx);
  return { lines, warnings: ctx.warnings, vars: ctx.vars };
}
