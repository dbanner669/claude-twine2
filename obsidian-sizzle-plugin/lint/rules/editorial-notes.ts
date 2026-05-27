import type { Diagnostic, LintRule } from "../types";

/* -------------------------------------------------------------------------
 * Editorial notes surfacing
 *
 * Inline brackets in passage prose:
 *   [! text]   — directive for Claude
 *   [? text]   — open question
 *
 * These are read by humans during prose editing and by Claude during
 * interpretation passes; they survive sync-back as literal text. The rule
 * extracts them and emits:
 *   - severity "note" for each well-formed marker (separate filter in pane)
 *   - severity "warning" for unclosed markers ([!  ... no ])
 *
 * Convention requires a space after `!` or `?` (so `[!important]` and
 * `[?]` from regular prose don't false-positive). Markers must be
 * single-line — multi-line notes are an unusual case and would mostly
 * indicate a missing `]`.
 *
 * Note text is stored in `data.text` so future UI (e.g. dedicated
 * "Editorial notes" pane, canvas node badges) can read it without
 * re-parsing the diagnostic message.
 * ------------------------------------------------------------------------- */

const OPEN_RE = /\[([!?])\s/g;

export const editorialNotesRule: LintRule = {
  id: "editorial-note",
  name: "Editorial note",
  description: "Inline [! directive] and [? question] markers left for later attention.",
  check(passage) {
    const out: Diagnostic[] = [];
    for (let lineNum = passage.bodyStartLine; lineNum < passage.bodyEndLine; lineNum += 1) {
      const line = passage.fileLines[lineNum];
      OPEN_RE.lastIndex = 0;
      let m: RegExpExecArray | null;
      while ((m = OPEN_RE.exec(line)) !== null) {
        const kind = m[1] === "!" ? "directive" : "question";
        const openCol = m.index;
        /* Find the matching ] from the position after the [!/[? marker. */
        const closeRel = line.slice(openCol + 3).indexOf("]");
        if (closeRel === -1) {
          out.push({
            ruleId: "editorial-note-malformed",
            severity: "warning",
            message: `Unclosed editorial ${kind} marker — missing \`]\` before end of line`,
            passageName: passage.name,
            filePath: passage.filePath,
            line: lineNum,
            col: openCol,
            length: Math.min(3, line.length - openCol),
            data: { kind },
          });
          continue;
        }
        const closeCol = openCol + 3 + closeRel;
        const text = line.slice(openCol + 3, closeCol).trim();
        if (!text) continue; /* empty marker, ignore */
        out.push({
          ruleId: "editorial-note",
          severity: "note",
          message:
            kind === "directive"
              ? `Directive: ${text}`
              : `Open question: ${text}`,
          passageName: passage.name,
          filePath: passage.filePath,
          line: lineNum,
          col: openCol,
          length: closeCol - openCol + 1,
          data: { kind, text },
        });
      }
    }
    return out;
  },
};
