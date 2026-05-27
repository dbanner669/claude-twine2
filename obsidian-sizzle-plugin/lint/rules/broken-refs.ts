import type { Diagnostic, LintRule } from "../types";

/* -------------------------------------------------------------------------
 * Broken refs
 *
 * Detects dead targets across:
 *   - Wiki links: [[X]], [[label|X]], [[label->X]], [[X<-label]]
 *   - <<goto X>> / <<include X>> string-literal forms ($var forms skipped)
 *   - <<term "X">> glossary lookups
 *   - Image refs: [img[path]], <img src="...">, CSS background-image: url(...)
 *   - <<ccDossierFooter N "back" "next" ...>>
 *
 * All severity: error. Dynamic refs (containing $vars or ${...} templates)
 * are skipped silently — we can't statically resolve them.
 * ------------------------------------------------------------------------- */

const WIKI_RE = /\[\[([^\]]+)\]\]/g;
const GOTO_RE = /<<goto\s+(?:'((?:\\'|[^'])+)'|"((?:\\"|[^"])+)"|\$\S+)\s*>>/g;
const INCLUDE_RE = /<<include\s+(?:'((?:\\'|[^'])+)'|"((?:\\"|[^"])+)"|\$\S+)\s*>>/g;
const TERM_RE = /<<term\s+(?:'((?:\\'|[^'])+)'|"((?:\\"|[^"])+)")(?:\s+(?:'(?:\\'|[^'])*'|"(?:\\"|[^"])*"))?\s*>>/g;
const FOOTER_RE = /<<ccDossierFooter\s+\d+\s+"([^"]*)"\s+"([^"]*)"/g;
const IMG_TWINE_RE = /\[img\[([^\]]+)\]\]/g;
const IMG_HTML_RE = /<img\b[^>]*\bsrc=["']([^"']+)["']/gi;
const IMG_CSS_RE = /background-image\s*:\s*url\(\s*["']?([^"')]+)["']?\s*\)/gi;

function resolveWikiTarget(inner: string): string | null {
  let s = inner;
  const arrow = s.indexOf("->");
  const reverseArrow = s.indexOf("<-");
  const pipe = s.indexOf("|");

  if (arrow !== -1) {
    s = s.slice(arrow + 2);
  } else if (reverseArrow !== -1) {
    s = s.slice(0, reverseArrow);
  } else if (pipe !== -1) {
    s = s.slice(pipe + 1);
  }
  /* Strip "][...]" setter syntax. */
  const setter = s.indexOf("][");
  if (setter !== -1) s = s.slice(0, setter);
  s = s.trim();
  if (!s) return null;
  /* Dynamic targets (variable interpolation) — skip. */
  if (s.includes("$") || s.includes("`") || s.includes("{")) return null;
  return s;
}

function looksDynamic(ref: string): boolean {
  return ref.includes("$") || ref.includes("{") || ref.includes("`");
}

function isExternalUrl(ref: string): boolean {
  return /^(?:https?:|data:|file:|\/\/)/i.test(ref);
}

function normalizeMedia(ref: string): string {
  /* Strip leading slash so "media/x.png" and "/media/x.png" both match
     the same key. Trailing query strings or hashes — strip. */
  let r = ref.replace(/^\//, "");
  const q = r.search(/[?#]/);
  if (q !== -1) r = r.slice(0, q);
  return r;
}

export const brokenRefsRule: LintRule = {
  id: "broken-ref",
  name: "Broken reference",
  description:
    "Wiki link, <<goto>>, <<include>>, <<term>>, image path, or ccDossierFooter target that doesn't exist.",
  check(passage, ctx) {
    const out: Diagnostic[] = [];

    const push = (
      target: string,
      kind: string,
      message: string,
      line: number,
      col: number,
      length: number,
    ): void => {
      out.push({
        ruleId: "broken-ref",
        severity: "error",
        message,
        passageName: passage.name,
        filePath: passage.filePath,
        line,
        col,
        length,
        data: { target, kind },
      });
    };

    /* Walk only the body lines of the shadow MD (skip front-matter + fence). */
    for (let lineNum = passage.bodyStartLine; lineNum < passage.bodyEndLine; lineNum += 1) {
      const line = passage.fileLines[lineNum];
      let m: RegExpExecArray | null;

      /* 1. Wiki links */
      WIKI_RE.lastIndex = 0;
      while ((m = WIKI_RE.exec(line)) !== null) {
        const target = resolveWikiTarget(m[1]);
        if (target === null) continue;
        if (!ctx.knownPassages.has(target)) {
          push(target, "wiki", `Unknown passage \`${target}\` (wiki link)`, lineNum, m.index, m[0].length);
        }
      }

      /* 2. <<goto "X">> */
      GOTO_RE.lastIndex = 0;
      while ((m = GOTO_RE.exec(line)) !== null) {
        const target = m[1] ?? m[2];
        if (!target) continue; /* variable form */
        if (!ctx.knownPassages.has(target)) {
          push(target, "goto", `Unknown passage \`${target}\` (<<goto>>)`, lineNum, m.index, m[0].length);
        }
      }

      /* 3. <<include "X">> */
      INCLUDE_RE.lastIndex = 0;
      while ((m = INCLUDE_RE.exec(line)) !== null) {
        const target = m[1] ?? m[2];
        if (!target) continue;
        if (!ctx.knownPassages.has(target)) {
          push(target, "include", `Unknown passage \`${target}\` (<<include>>)`, lineNum, m.index, m[0].length);
        }
      }

      /* 4. <<term "Key">> — glossary keys live in setup.glossary. */
      TERM_RE.lastIndex = 0;
      while ((m = TERM_RE.exec(line)) !== null) {
        const key = m[1] ?? m[2];
        if (!key) continue;
        if (!ctx.glossary.has(key)) {
          push(key, "term", `Unknown glossary term \`${key}\` (<<term>>)`, lineNum, m.index, m[0].length);
        }
      }

      /* 5. <<ccDossierFooter N "back" "next" ...>> */
      FOOTER_RE.lastIndex = 0;
      while ((m = FOOTER_RE.exec(line)) !== null) {
        const back = m[1].trim();
        const next = m[2].trim();
        if (back && !ctx.knownPassages.has(back)) {
          push(back, "footer-back", `Unknown passage \`${back}\` (ccDossierFooter back arg)`, lineNum, m.index, m[0].length);
        }
        if (next && !ctx.knownPassages.has(next)) {
          push(next, "footer-next", `Unknown passage \`${next}\` (ccDossierFooter next arg)`, lineNum, m.index, m[0].length);
        }
      }

      /* 6. [img[path]] (Twine image link) */
      IMG_TWINE_RE.lastIndex = 0;
      while ((m = IMG_TWINE_RE.exec(line)) !== null) {
        const ref = m[1].trim();
        if (looksDynamic(ref) || isExternalUrl(ref)) continue;
        const norm = normalizeMedia(ref);
        if (!ctx.knownMediaPaths.has(norm)) {
          push(ref, "img-twine", `Missing image \`${ref}\` ([img[]])`, lineNum, m.index, m[0].length);
        }
      }

      /* 7. <img src="path"> */
      IMG_HTML_RE.lastIndex = 0;
      while ((m = IMG_HTML_RE.exec(line)) !== null) {
        const ref = m[1].trim();
        if (looksDynamic(ref) || isExternalUrl(ref)) continue;
        const norm = normalizeMedia(ref);
        if (!ctx.knownMediaPaths.has(norm)) {
          push(ref, "img-html", `Missing image \`${ref}\` (<img src>)`, lineNum, m.index, m[0].length);
        }
      }

      /* 8. CSS background-image: url(...) */
      IMG_CSS_RE.lastIndex = 0;
      while ((m = IMG_CSS_RE.exec(line)) !== null) {
        const ref = m[1].trim();
        if (looksDynamic(ref) || isExternalUrl(ref)) continue;
        const norm = normalizeMedia(ref);
        if (!ctx.knownMediaPaths.has(norm)) {
          push(ref, "img-css", `Missing image \`${ref}\` (background-image)`, lineNum, m.index, m[0].length);
        }
      }
    }

    return out;
  },
};
