import type { Diagnostic, LintRule, TaggedField } from "../types";

/* -------------------------------------------------------------------------
 * Story-tag coherence + word-count
 *
 * tag-coherence: scans passage body for $player.<field>.push("X") /
 * .pushUnique / array-literal-in-<<set>> (writes) and .includes / .indexOf
 * / .contains (reads). Compares against the cross-file write/read sets
 * built in runner.loadTaggedFields. Warns when a tag is on one side but
 * not the other:
 *   - "tag written here is never read anywhere — dead flag"
 *   - "tag read here is never written anywhere — typo or unreachable"
 *
 * word-count: counts words in passage body (macros, wiki-link targets,
 * and HTML stripped). Warns over 120 words per CLAUDE.md ceiling.
 * Strictly warning — human's call (per explicit direction).
 * ------------------------------------------------------------------------- */

const WRITE_PUSH_RE = /\$player\.(storyTags|kinks|quirks|statusEffects)\.push(?:Unique)?\(\s*['"]([^'"]+)['"]\s*\)/g;
const WRITE_SET_RE = /<<set\s+\$player\.(storyTags|kinks|quirks|statusEffects)\s+to\s+\[([\s\S]*?)\]\s*>>/g;
const READ_RE = /\$player\.(storyTags|kinks|quirks|statusEffects)\.(?:includes|indexOf|contains)\(\s*['"]([^'"]+)['"]\s*\)/g;
const LIT_RE = /['"]([^'"]+)['"]/g;
const WORD_NOTE_LIMIT = 120;
const WORD_WARNING_LIMIT = 200;

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

export const tagCoherenceRule: LintRule = {
  id: "tag-coherence",
  name: "Tag coherence",
  description:
    "Story tags (storyTags/kinks/quirks/statusEffects) written but never read, or read but never written. Likely typos or stale gates.",
  check(passage, ctx) {
    const out: Diagnostic[] = [];
    const body = passage.body;
    let m: RegExpExecArray | null;

    /* Writes via push / pushUnique */
    WRITE_PUSH_RE.lastIndex = 0;
    while ((m = WRITE_PUSH_RE.exec(body)) !== null) {
      const field = m[1] as TaggedField;
      const tag = m[2];
      const bucket = ctx.taggedFields.get(field);
      if (!bucket) continue;
      if (!bucket.reads.has(tag)) {
        const { line, col } = offsetToFilePos(body, m.index, passage.bodyStartLine);
        out.push({
          ruleId: "tag-coherence",
          severity: "note",
          message: `Tag \`${tag}\` written to \`$player.${field}\` is never read anywhere — dead flag?`,
          passageName: passage.name,
          filePath: passage.filePath,
          line,
          col,
          length: m[0].length,
          data: { field, tag, direction: "write-only" },
        });
      }
    }

    /* Writes via <<set $player.<field> to [...]>> */
    WRITE_SET_RE.lastIndex = 0;
    while ((m = WRITE_SET_RE.exec(body)) !== null) {
      const field = m[1] as TaggedField;
      const arrayBody = m[2];
      const arrayOffset = m.index + m[0].indexOf("[") + 1;
      const bucket = ctx.taggedFields.get(field);
      if (!bucket) continue;
      LIT_RE.lastIndex = 0;
      let lm: RegExpExecArray | null;
      while ((lm = LIT_RE.exec(arrayBody)) !== null) {
        const tag = lm[1];
        if (bucket.reads.has(tag)) continue;
        const absOffset = arrayOffset + lm.index;
        const { line, col } = offsetToFilePos(body, absOffset, passage.bodyStartLine);
        out.push({
          ruleId: "tag-coherence",
          severity: "note",
          message: `Tag \`${tag}\` set in \`$player.${field}\` array is never read anywhere`,
          passageName: passage.name,
          filePath: passage.filePath,
          line,
          col,
          length: lm[0].length,
          data: { field, tag, direction: "write-only" },
        });
      }
    }

    /* Reads */
    READ_RE.lastIndex = 0;
    while ((m = READ_RE.exec(body)) !== null) {
      const field = m[1] as TaggedField;
      const tag = m[2];
      const bucket = ctx.taggedFields.get(field);
      if (!bucket) continue;
      if (!bucket.writes.has(tag)) {
        const { line, col } = offsetToFilePos(body, m.index, passage.bodyStartLine);
        out.push({
          ruleId: "tag-coherence",
          severity: "note",
          message: `Tag \`${tag}\` read from \`$player.${field}\` is never set anywhere — typo or unreachable code?`,
          passageName: passage.name,
          filePath: passage.filePath,
          line,
          col,
          length: m[0].length,
          data: { field, tag, direction: "read-only" },
        });
      }
    }

    return out;
  },
};

function countWords(body: string): number {
  let t = body;
  /* Drop SugarCube macros, wiki-link targets, and HTML tags before counting. */
  t = t.replace(/<<[\s\S]*?>>/g, " ");
  t = t.replace(/\[\[[^\]]+\]\]/g, " ");
  t = t.replace(/<[^>]+>/g, " ");
  t = t.replace(/\$[A-Za-z_][A-Za-z0-9_.]*/g, " "); /* drop $var.path interpolations */
  return t.split(/\s+/).filter(Boolean).length;
}

export const wordCountRule: LintRule = {
  id: "word-count",
  name: "Word count over ceiling",
  description: `Passage body over the ${WORD_NOTE_LIMIT}-word soft ceiling from CLAUDE.md becomes a note; over ${WORD_WARNING_LIMIT} escalates to warning. Human's call whether to split.`,
  check(passage) {
    const count = countWords(passage.body);
    if (count <= WORD_NOTE_LIMIT) return [];
    const severity = count > WORD_WARNING_LIMIT ? "warning" : "note";
    const limit = severity === "warning" ? WORD_WARNING_LIMIT : WORD_NOTE_LIMIT;
    return [
      {
        ruleId: "word-count",
        severity,
        message: `${count} words (over ${limit}-word ${severity === "warning" ? "warning threshold" : "soft ceiling"}). Consider splitting.`,
        passageName: passage.name,
        filePath: passage.filePath,
        line: passage.headerLine,
        col: 0,
        length: passage.fileLines[passage.headerLine]?.length ?? 0,
        data: { count, noteLimit: WORD_NOTE_LIMIT, warningLimit: WORD_WARNING_LIMIT },
      },
    ];
  },
};
