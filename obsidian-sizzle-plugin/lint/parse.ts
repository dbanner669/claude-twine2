import type { ParsedPassage } from "./types";

/* -------------------------------------------------------------------------
 * Shadow-MD parser
 *
 * Mirrors what build-twee-from-vault.js does, but tracks LINE positions so
 * lint diagnostics can point at the right place in the file.
 *
 * Expected shape of a shadow MD:
 *
 *   ---
 *   sourceFile: ...
 *   originalIndex: N
 *   wordCount: N
 *   ---
 *
 *   ```twee
 *   :: Name [tag1 tag2]
 *   body line 1
 *   body line 2
 *   ```
 * ------------------------------------------------------------------------- */

export function parseShadowMd(
  filePath: string,
  fileText: string,
): ParsedPassage | { error: string } {
  const fileLines = fileText.split(/\r?\n/);

  /* --- 1. Front matter --- */
  const fm: Record<string, string | number> = {};
  let cursor = 0;
  if (fileLines[0] !== "---") {
    return { error: "no opening front-matter delimiter" };
  }
  cursor = 1;
  while (cursor < fileLines.length && fileLines[cursor] !== "---") {
    const line = fileLines[cursor];
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*:\s*(.*)$/);
    if (m) {
      let value: string | number = m[2].trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (typeof value === "string" && /^-?\d+$/.test(value)) {
        value = parseInt(value, 10);
      }
      fm[m[1]] = value;
    }
    cursor += 1;
  }
  if (cursor >= fileLines.length) {
    return { error: "unterminated front-matter" };
  }
  cursor += 1; /* skip closing --- */

  /* --- 2. Skip optional blank lines --- */
  while (cursor < fileLines.length && fileLines[cursor].trim() === "") cursor += 1;

  /* --- 3. Open fence --- */
  const fenceMatch = fileLines[cursor]?.match(/^(```|~~~)twee\s*$/);
  if (!fenceMatch) {
    return { error: "expected ```twee or ~~~twee opening fence" };
  }
  const fenceMarker = fenceMatch[1];
  const fenceOpenLine = cursor;
  cursor += 1;

  /* --- 4. :: header line --- */
  const headerLine = cursor;
  const header = fileLines[cursor];
  if (header === undefined || !header.startsWith(":: ")) {
    return { error: "expected :: header line inside fence" };
  }
  const headerMatch = header.match(/^::\s+(.+?)(?:\s+\[([^\]]*)\])?\s*$/);
  if (!headerMatch) {
    return { error: "malformed :: header" };
  }
  const name = headerMatch[1].trim();
  const tags = headerMatch[2] ? headerMatch[2].split(/\s+/).filter(Boolean) : [];
  cursor += 1;

  /* --- 5. Body until closing fence --- */
  const bodyStartLine = cursor;
  let bodyEndLine = cursor;
  let fenceClosed = false;
  while (cursor < fileLines.length) {
    if (fileLines[cursor].trim() === fenceMarker) {
      bodyEndLine = cursor;
      fenceClosed = true;
      break;
    }
    cursor += 1;
  }
  if (!fenceClosed) {
    return { error: "unterminated twee fence" };
  }

  const body = fileLines.slice(bodyStartLine, bodyEndLine).join("\n");

  return {
    name,
    tags,
    filePath,
    frontMatter: fm,
    fileText,
    fileLines,
    headerLine,
    bodyStartLine,
    bodyEndLine,
    body,
  };
}
