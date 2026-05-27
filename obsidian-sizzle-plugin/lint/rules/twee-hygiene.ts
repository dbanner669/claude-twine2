import type { Diagnostic, LintRule, ParsedPassage } from "../types";

/* -------------------------------------------------------------------------
 * Twee hygiene rules
 *
 * Four rules in one file (they share infrastructure / cross-file context):
 *   unclosedMacroRule    (error)
 *   duplicatePassageRule (error)
 *   orphanPassageRule    (warning)
 *   undeclaredVariableRule (warning)
 * ------------------------------------------------------------------------- */

const PAIRED_MACROS = new Set([
  "if",
  "silently",
  "nobr",
  "link",
  "button",
  "for",
  "switch",
  "replace",
  "append",
  "prepend",
  "widget",
  "page",
  "first",
  "capture",
  "do",
  "linkappend",
  "linkprepend",
  "linkreplace",
  "timed",
  "type",
]);

/** Branch-tokens that appear inside paired macros but don't open new pairs. */
const INTERIOR_MACROS = new Set(["elseif", "else", "case", "default", "next"]);

/** Convert a 0-indexed offset within `body` into a {line, col} in fileLines. */
function offsetToFilePos(body: string, offset: number, bodyStartLine: number): { line: number; col: number } {
  let line = bodyStartLine;
  let col = 0;
  for (let i = 0; i < offset && i < body.length; i += 1) {
    if (body[i] === "\n") {
      line += 1;
      col = 0;
    } else {
      col += 1;
    }
  }
  return { line, col };
}

/* -------------------- unclosed macros -------------------- */

export const unclosedMacroRule: LintRule = {
  id: "unclosed-macro",
  name: "Unclosed macro",
  description:
    "Paired macros (<<if>>, <<silently>>, <<link>>, etc.) without a matching closing tag, or mismatched/extra close tags.",
  check(passage) {
    const out: Diagnostic[] = [];
    const body = passage.body;
    const tokenRe = /<<(\/?)(\w+)/g;
    const stack: { name: string; offset: number }[] = [];
    let m: RegExpExecArray | null;
    while ((m = tokenRe.exec(body)) !== null) {
      const isClose = m[1] === "/";
      const name = m[2];
      if (INTERIOR_MACROS.has(name)) continue;
      if (!PAIRED_MACROS.has(name)) continue;
      if (isClose) {
        const top = stack[stack.length - 1];
        if (!top) {
          const { line, col } = offsetToFilePos(body, m.index, passage.bodyStartLine);
          out.push({
            ruleId: "unclosed-macro",
            severity: "error",
            message: `Stray <</${name}>> with no matching open`,
            passageName: passage.name,
            filePath: passage.filePath,
            line,
            col,
            length: m[0].length + 2,
          });
        } else if (top.name !== name) {
          const { line, col } = offsetToFilePos(body, m.index, passage.bodyStartLine);
          out.push({
            ruleId: "unclosed-macro",
            severity: "error",
            message: `<</${name}>> closes <<${top.name}>> (mismatched nesting)`,
            passageName: passage.name,
            filePath: passage.filePath,
            line,
            col,
            length: m[0].length + 2,
          });
          stack.pop();
        } else {
          stack.pop();
        }
      } else {
        stack.push({ name, offset: m.index });
      }
    }
    for (const item of stack) {
      const { line, col } = offsetToFilePos(body, item.offset, passage.bodyStartLine);
      out.push({
        ruleId: "unclosed-macro",
        severity: "error",
        message: `<<${item.name}>> never closed`,
        passageName: passage.name,
        filePath: passage.filePath,
        line,
        col,
        length: item.name.length + 4,
      });
    }
    return out;
  },
};

/* -------------------- duplicate passage names -------------------- */

export const duplicatePassageRule: LintRule = {
  id: "duplicate-passage",
  name: "Duplicate passage name",
  description: "A passage name is defined in more than one .twee file. Tweego will error on this.",
  check(passage, ctx) {
    const defs = ctx.passageDefinitions.get(passage.name);
    if (!defs || defs.length <= 1) return [];
    return [
      {
        ruleId: "duplicate-passage",
        severity: "error",
        message: `Passage \`${passage.name}\` is defined in ${defs.length} files: ${defs.join(", ")}`,
        passageName: passage.name,
        filePath: passage.filePath,
        line: passage.headerLine,
        col: 0,
        length: passage.fileLines[passage.headerLine]?.length ?? 0,
      },
    ];
  },
};

/* -------------------- orphan passages -------------------- */

export const orphanPassageRule: LintRule = {
  id: "orphan-passage",
  name: "Orphan passage",
  description: "Passage has no incoming references and isn't a known entry point or widget. Probably unreachable.",
  check(passage, ctx) {
    if (ctx.orphanExempt.has(passage.name)) return [];
    if (passage.tags.includes("widget")) return [];
    const incoming = ctx.incomingEdges.get(passage.name);
    if (incoming && incoming.size > 0) return [];
    return [
      {
        ruleId: "orphan-passage",
        severity: "warning",
        message: `\`${passage.name}\` has no incoming links — unreachable unless intentionally hidden`,
        passageName: passage.name,
        filePath: passage.filePath,
        line: passage.headerLine,
        col: 0,
        length: passage.fileLines[passage.headerLine]?.length ?? 0,
      },
    ];
  },
};

/* -------------------- undeclared variables -------------------- */

const VAR_USE_RE = /\$([A-Za-z_][A-Za-z0-9_]*)/g;
/** SugarCube globals and conventional helpers — never need a <<set>>. */
const BUILTIN_VARS = new Set([
  "state",
  "args",
  "loopValue",
  "loopIndex",
]);

export const undeclaredVariableRule: LintRule = {
  id: "undeclared-variable",
  name: "Undeclared variable",
  description: "Variable referenced but never <<set>> or <<unset>> anywhere in src/.",
  check(passage, ctx) {
    const out: Diagnostic[] = [];
    const reported = new Set<string>();
    for (let i = passage.bodyStartLine; i < passage.bodyEndLine; i += 1) {
      const line = passage.fileLines[i];
      VAR_USE_RE.lastIndex = 0;
      let m: RegExpExecArray | null;
      while ((m = VAR_USE_RE.exec(line)) !== null) {
        const name = m[1];
        if (BUILTIN_VARS.has(name)) continue;
        if (ctx.declaredVariables.has(name)) continue;
        /* Don't spam: one diagnostic per (passage, variable). */
        if (reported.has(name)) continue;
        reported.add(name);
        out.push({
          ruleId: "undeclared-variable",
          severity: "warning",
          message: `\`$${name}\` is referenced but never <<set>> anywhere in src/`,
          passageName: passage.name,
          filePath: passage.filePath,
          line: i,
          col: m.index,
          length: name.length + 1,
        });
      }
    }
    return out;
  },
};
