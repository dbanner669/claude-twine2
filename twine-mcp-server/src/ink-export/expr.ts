/**
 * TwineScript → ink expression normalization for the Phase 1 twee→ink converter.
 *
 * Mapping contract: sizzle/docs/godot/STATE-SCHEMA.md (mirror set, query surface)
 * and sizzle/docs/godot/INK-CONVENTIONS.md.
 */

export function camelToSnake(value: string): string {
  return value.replace(/([a-z0-9])([A-Z])/g, "$1_$2").toLowerCase();
}

/**
 * Extract the ink knot name from a twee passage name or link target.
 * "BLK-130 The propped door" → "BLK_130"; "INTRO-200a Personal" → "INTRO_200a".
 * Returns null when the name has no PREFIX-NUMBER head (e.g. "Start").
 */
export function knotRef(passageName: string): string | null {
  const m = passageName.trim().match(/^([A-Z]+-\d+[a-zA-Z]?)\b/);
  return m ? m[1].replace(/-/g, "_") : null;
}

export interface ExprResult {
  out: string;
  /** False when untranslatable constructs remain ($..., Math.*, typeof, ternary). */
  ok: boolean;
}

const BAD = "__UNCONVERTIBLE__";

export function convertExpr(src: string): ExprResult {
  let s = src.trim();

  // hasVisited → ink knot visit counts.
  s = s.replace(/not\s+hasVisited\(\s*"([^"]+)"\s*\)/g, (_m, name: string) => {
    const knot = knotRef(name);
    return knot ? `${knot} == 0` : BAD;
  });
  s = s.replace(/hasVisited\(\s*"([^"]+)"\s*\)/g, (_m, name: string) => {
    const knot = knotRef(name);
    return knot ? `${knot} > 0` : BAD;
  });

  // Collection membership → query surface.
  s = s.replace(/\$player\.storyTags\.includes\(\s*("[^"]*")\s*\)/g, "has_tag($1)");
  s = s.replace(/\$player\.kinks\.includes\(\s*("[^"]*")\s*\)/g, "has_kink($1)");
  s = s.replace(/\$player\.quirks\.includes\(\s*("[^"]*")\s*\)/g, "has_quirk($1)");

  // Skills → query surface.
  s = s.replace(
    /\$player\.skills\.([A-Za-z]\w*)\.level/g,
    (_m, name: string) => `skill_level("${name.toLowerCase()}")`,
  );

  // One-shot flags / scene-state objects → story-local VARs.
  s = s.replace(/\$player\.flags\.([A-Za-z]\w*)/g, (_m, name: string) => camelToSnake(name));
  s = s.replace(/\$briefing\.([A-Za-z]\w*)/g, (_m, name: string) => `briefing_${camelToSnake(name)}`);

  // Mirror set scalars.
  s = s.replace(/\$player\.background\b/g, "background");
  s = s.replace(/\$player\.incitingIncident\b/g, "inciting_incident");
  s = s.replace(/\$player\.currentComposure\b/g, "current_composure");
  s = s.replace(/\$player\.baselineComposure\b/g, "baseline_composure");
  s = s.replace(/\$player\.arousal\b/g, "arousal");
  s = s.replace(/\$player\.codename\b/g, "codename");
  s = s.replace(/\$nyse\.influence\b/g, "nyse_influence");
  s = s.replace(/\$date\.slot\b/g, "date_slot");
  s = s.replace(/\$date\.dayOfWeek\b/g, "day_of_week");

  // TwineScript comparison keywords → operators (and/or/not keep their ink forms).
  s = s
    .replace(/\bis not\b/g, "!=")
    .replace(/\beq\b/g, "==")
    .replace(/\bneq\b/g, "!=")
    .replace(/\bis\b/g, "==")
    .replace(/\bgte\b/g, ">=")
    .replace(/\blte\b/g, "<=")
    .replace(/\bgt\b/g, ">")
    .replace(/\blt\b/g, "<");

  // SugarCube temporaries (_var) → ink temps (snake_case, no sigil).
  s = s.replace(/(?<![\w$])_([A-Za-z]\w*)/g, (_m, name: string) => camelToSnake(name));

  const ok = !/[$]|Math\.|typeof|\?|===|__UNCONVERTIBLE__/.test(s);
  return { out: s, ok };
}
