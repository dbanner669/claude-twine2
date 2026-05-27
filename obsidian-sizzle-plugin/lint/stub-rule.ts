import type { LintRule } from "./types";

/* -------------------------------------------------------------------------
 * Stub rule — proves the pipeline works end-to-end before real rules land.
 *
 * Flags any occurrence of the literal word "TODO" in passage body as a
 * warning. Will be removed when task #6 (broken refs) ships.
 * ------------------------------------------------------------------------- */

export const stubTodoRule: LintRule = {
  id: "stub-todo",
  name: "Stub: TODO marker",
  description: "Flags 'TODO' anywhere in passage body. Placeholder rule for v1 lint smoke test.",
  check(passage) {
    const out: ReturnType<LintRule["check"]> = [];
    const re = /\bTODO\b/g;
    for (let i = passage.bodyStartLine; i < passage.bodyEndLine; i += 1) {
      const line = passage.fileLines[i];
      let m: RegExpExecArray | null;
      re.lastIndex = 0;
      while ((m = re.exec(line)) !== null) {
        out.push({
          ruleId: "stub-todo",
          severity: "warning",
          message: "TODO marker in passage body",
          passageName: passage.name,
          filePath: passage.filePath,
          line: i,
          col: m.index,
          length: 4,
        });
      }
    }
    return out;
  },
};
