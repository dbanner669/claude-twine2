# ink Conventions Contract (Phase 0, artifact 2 of 4)

Status: **draft — pending human sign-off**. How Sizzle content is written in ink and how the runtime interprets it. The converter (Phase 1) targets these conventions; the vertical slice (Phase 0.5) proves them.

## Files

```
godot/content/
  main.ink            # includes + entry
  mirror.ink          # GENERATED — mirrored variable declarations (hand-editing = lint error)
  ops.ink             # EXTERNAL declarations for the command/query surface
  briefing.ink        # from briefing.twee (INTRO_*)
  blackout.ink        # BLK_*
  manitoulin.ink      # MAN_*
  pale.ink            # PALE_*
  wds.ink             # WDS_*
  data/               # glossary.json, name lists, slot labels (from setup.*)
```

Character-creator and main-menu passages are **not converted** — native scenes (plan Phases 3/5).

## Knots and naming

- Knot = passage. `:: BLK-100 Some title [tags]` → `=== BLK_100 ===` (hyphens → underscores; the prose title becomes a `//` comment above the knot).
- PREFIX_NUM naming carried over unchanged: `INTRO_110`, `BLK_160`, `MAN_150`, `PALE_205`, `WDS_085`.

## Tags (knot-level `#` tags; engine reads them on entry)

| twee tag | ink tag | Runtime effect |
|---|---|---|
| *(none)* | *(none)* | `screen: scene` — two-column, avatar visible |
| `avatar-hidden` | `# screen: menu` | Single column, no avatar |
| `character-creation` | `# screen: creation` | (native scenes; tag exists for any ink-driven CC bridge knots) |
| `daytime` / `nighttime` | `# mode: day` / `# mode: night` | Force palette; absent = auto from `date_slot` vs the day-slot set |
| `history-root` | `# history_root` | Back arrow disabled at this knot |
| `avatar-blk-day`, `avatar-blk-night`, `avatar-man-day`, `avatar-man-night`, `avatar-pale-night`, `avatar-wds-night` | `# avatar: blk_day` etc. | Full-frame avatar phase override (see AVATAR-MANIFEST.md); absent = clear override |
| `nobr` | *(dropped)* | ink whitespace semantics make it meaningless |

## Choices and links

- `[[Sentence.|BLK-110 Title]]` → `* [Sentence.] -> BLK_110`
- STYLE-GUIDE link-text rules carried **verbatim**: complete sentence; PC dialogue, narration, or `Continue`; never NPC dialogue.
- Visited-choice greying: presentation reads ink visit counts for the divert target; no authored markup.
- `<<goto>>` → bare divert `-> TARGET`.

## Conditional prose and logic

- Inline: `{background == "rcmp": ...prose...}`
- Multi-branch (`<<if>>/<<elseif>>/<<else>>`, `<<switch>>/<<case>>`):
  ```
  { background:
    - "RCMP constable": ...
    - "CSIS analyst":   ...
    - else:             ...
  }
  ```
- `<<print expr>>` → ink inline `{expr}` (mirrored vars / temps only; anything else becomes a query op).
- One-shot content/grants: `{once: ...}` or knot-visit guards — replaces the `$player.flags` latch pattern.
- All mutations via `~ op(...)` calls to the command surface (STATE-SCHEMA.md). Direct assignment to mirrored variables is a lint error.
- Header setup at knot entry: `~ set_header("WALKUP LOBBY", "Thursday evening")` (replaces the `<<silently>><<set $header...>><</silently>><<header>>` preamble — the header *widget* itself is native UI reacting to header state).

## The skill-check protocol (mid-knot interactive pause)

The one place ink yields to an interactive widget. Convention:

```
=== BLK_160_check ===
# check: composure 2d6 8
{ check_passed:
    Success prose.
    -> BLK_170
- else:
    Failure prose.
    -> BLK_175
}
```

Runtime contract: on entering a knot tagged `# check:`, the engine **pauses continuation before evaluating the conditional block**, presents the dice scene (click-to-roll → animate → settle → reveal → toast), writes `check_passed` / `check_total` (runtime-set ink globals declared in `mirror.ink`), then resumes. Post-check links live inside both branches — the player cannot skip the roll (same rule as `<<skillCheck>>` today).

Save/back semantics: the check knot's entry snapshot is the restore point; loading or backing into it re-offers the roll (matches current SugarCube behavior when leaving mid-check).

## Reveal-in-place (`<<linkreplace>>` / `<<link>>+<<replace>>`)

**Accepted semantic drift, decided per instance** (census: 1 `linkreplace`, 7 `replace`, 27 `link` — most `link`s are plain navigation):

1. Default conversion: choice-with-content + gather — ink's native "pick, see result text, continue" pattern. Result text *appends* rather than replacing in place.
2. Where in-place replacement is dramatically load-bearing, the knot gets a `# reveal` presentation hint and the passage view swaps the choice line for its result text. Only if the slice (BLK_130/145) shows the drift actually hurts.

## Rich text

- `//emphasis//` → `[i]emphasis[/i]` (BBCode passes through ink as literal text into RichTextLabel).
- Allowed inline set: `[i]`, `[b]` (rare), glossary spans. Anything beyond this is a presentation scene, not markup.
- Glossary: `<<term "NYSE">>` → `[url=gloss:NYSE]NYSE[/url]`; definitions from `data/glossary.json`; tooltip via RichTextLabel `meta_hover_started`. Optional display-text form: `[url=gloss:KEY]shown text[/url]`.
- Player-name interpolation (`<<playerName>>` etc.) → mirrored variables inline: `{player_name}`, `{player_full_name}`, `{cover_known_as}`.

## Document passages (Branch file extracts)

`BLK_210/215` and the closing report passages of MAN/PALE/WDS are **not converted as prose markup**. Convention: a stub knot with `# scene: branch_file_extract` + an id; content (headers, stamps, redaction spans, body slots) lives in a per-extract data resource consumed by the native `BranchFileExtract` scene template.

## Style rules (unchanged)

STYLE-GUIDE.md remains the prose source of truth: 80–120 visible words per knot (200 ceiling — longest single render for conditional variants), one beat per knot, all existing voice/mechanics rules. Editorial markers (`%%% ... %%%`) survive as ink `// %%%` comments and stay lintable.

## Lint (ports of the Obsidian rules — see PARITY-MATRIX.md for coverage)

inklecate itself catches broken diverts, duplicate knots, undeclared variables, and syntax errors for free. Custom linter adds: orphan knots, word-count-per-knot, link-text form, editorial markers, tag coherence (`# check` knots have both branches; `# scene` knots have a matching resource; mirrored-var assignment ban).

## Open questions for sign-off

1. Reveal drift default (append vs `# reveal` hint) — accept append as the norm? **Draft says: yes; hint only if the slice proves it matters.**
2. Do knot display titles (the prose halves of passage names) survive anywhere player-visible? **Draft says: no — they were never player-visible in SugarCube either; comments only.**
