# Parity Matrix (Phase 0, artifact 4 of 4)

Status: **draft — pending human sign-off**. Every live SugarCube-side construct and tool, with usage counts from the 2026-07-05 source census (153 passages, 19 twee files), marked `port` / `rebuild` / `drop`. **Retirement rule (GODOT-PORT-PLAN.md Phase 6): nothing on the SugarCube side is switched off until every `port`/`rebuild` row is demonstrably live in Godot.**

## Narrative constructs (converter territory — Phase 1)

| Construct | Count | Disposition | Replacement |
|---|---|---|---|
| `<<set>>` | 506 | port | command ops (engine state) / ink temps (local) |
| `<<if>>/<<elseif>>/<<else>>` | 104/34/43 | port | ink conditionals `{...}` |
| `<<silently>>` | 134 | drop | ink logic lines produce no output by nature |
| `<<page>>` | 131 | drop | knot = page; chrome is native UI |
| `<<header>>` widget calls | 131 | rebuild | `set_header(...)` op + native header bar |
| `<<print>>` | 48 | port | ink inline `{expr}` |
| `<<term>>` | 44 | port | `[url=gloss:KEY]` + native tooltip; glossary → `data/glossary.json` |
| `<<link>>` | 27 | port | choices/diverts; the few non-navigation uses → reveal pattern |
| `<<for>>` | 24 | drop/rebuild | all in init & CC — StoryInit dies (schema), CC is native (Phase 5) |
| `<<goto>>` | 18 | port | bare diverts |
| `<<skillCheck>>/<<success>>/<<failure>>` | 18 | rebuild | `# check:` protocol + dice scene (INK-CONVENTIONS.md) |
| `<<setDate>>/<<setTime>>/<<advanceDays>>` | 12/4/1 | port | time ops (semantics from macros.js incl. day-crossing composure reset) |
| `<<advanceTime>>` | 0 in content | port | op exists for future content regardless |
| `<<emote-*>>` (10 widgets) | 9 | rebuild | `avatar_set_expression(...)` |
| `<<case>>/<<switch>>` | 8/2 | port | ink multi-branch conditionals |
| `<<replace>>/<<linkreplace>>` | 7/1 | rebuild | choice+gather reveal (accepted drift; `# reveal` hint fallback) |
| `<<include>>` | 2 | port | ink INCLUDE / tunnels |
| `<<textbox>>` | 2 | rebuild | native LineEdit (CC name entry — Phase 5) |
| `playerName/playerRealName/…` parser widgets (14) | ~2 direct + widget-internal | port | mirrored vars inline `{player_name}` etc. |
| `<<addNotification>>/<<showNotifications>>` | 3/2 | rebuild | `toast(...)` + toast scene |
| `<<avatar>>`, `avatar-*`, `wear-*`, `remove-*` widgets (21) | 5 + clothing calls | rebuild | manifest API ops (AVATAR-MANIFEST.md) |
| `ccTabStrip/ccDossierHeader/ccDossierFooter` | 4/4/6 | rebuild | native CC scenes (Phase 5) |
| `<<charSheet>>` | widget | rebuild | character-sheet dialog scene (deferred until post-parity is fine) |
| `<<first>>` (macros.js) | **0** | drop | never used in content; ink has native `{once:}`/visit counts anyway |
| `<<rollDice>>` (low-level) | 0 player-facing | drop | GDScript RNG util inside the dice scene |
| `newFeatureIcon/improvementIcon/bugreport` | dev-only | drop | dev affordances; re-add natively if missed |
| `<<widget>>` definitions | 54 | n/a | concept dissolves into ops + native scenes |

## Passage tags

| Tag | Count | Disposition | Replacement |
|---|---|---|---|
| `nighttime`/`daytime` | 63/41 | port | `# mode:` tags |
| `avatar-{blk,man,pale,wds}-{day,night}` | 86 total | port | `# avatar:` phase overrides |
| `nobr` | 42 | drop | meaningless in ink |
| `avatar-hidden`/`character-creation` | 13/4 | port | `# screen:` tags |
| `history-root` | 1 | port | `# history_root` |

## Runtime & UI systems

| System | Disposition | Replacement (phase) |
|---|---|---|
| Fixed-proportion stage + `ui-scale.js` + `--zoom` | drop | native stretch `canvas_items`/`keep` (P2) |
| CSS design system (8 files, `--sz-*` tokens) | rebuild | Godot Theme + variants (P3) |
| Day/night palette swap | rebuild | theme variants driven by `# mode:`/slot (P3) |
| Fonts (5 families, WOFF2) | port | Godot loads WOFF2 directly (P3) |
| Atmosphere overlays (vignette/grain) | rebuild | shaders (P3) |
| Header bar / footer date / composure badge | rebuild | native scenes off mirrored state (P3) |
| Toast system (4 kinds) | rebuild | toast scene (P2/P3) |
| Glossary tooltip | rebuild | RichTextLabel `meta_hover` (P3) |
| Choice-link styling incl. visited-greying | rebuild | theme + ink visit counts (P3) |
| SugarCube saves/history/back arrow | rebuild | choice-commit snapshots + save addon (P2) |
| `$statistics`, achievements | rebuild | engine dict; no UI exists yet anyway (P7) |
| Avatar 6-array compositor | drop | Option 2 manifest runtime (P4) |

## Tooling & pipeline

| Tool | Disposition | Notes |
|---|---|---|
| Tweego build (`build/compile.bat`, output.html) | drop | at Phase 6 retirement gate only |
| Obsidian vault + `build-obsidian-canvas.js` / `build-twee-from-vault.js` | rebuild (half) | **Authoring moves to Inky** (live playable preview while writing — the primary writer interface). `build-obsidian-canvas.js` is ported to read `.ink` and emit a **read-only** `story.canvas`, so Obsidian stays available as the story-map viewer. Sync-back (`build-twee-from-vault.js`) is dropped — ink is directly editable, no round-trip needed |
| obsidian-sizzle-plugin lint (9 rules) | port | free via inklecate: broken refs, dup passages, undeclared vars, unclosed syntax. Custom ink linter: orphan knots, word count, editorial markers, link-text form, tag coherence + mirrored-var ban (INK-CONVENTIONS.md) |
| FigJam sync (`:4747` + plugin) | drop | already legacy; archive |
| twine-mcp-server | port (repurposed) | hosts the one-time twee→ink converter; story-manipulation tools retire with twee at P6 |
| STYLE-GUIDE.md / EDITORIAL-SWEEP.md / audit workflow | port | unchanged in substance; operates on ink text |
| Story graph visualization (canvas) | rebuild | read-only `story.canvas` generated from `.ink` (see Obsidian row above) |

## Census notes

- The hard-case tail is **smaller than both reviews assumed**: 1 `linkreplace`, 7 `replace`, 0 `<<first>>`, 2 document-layout passage families (Branch file extracts ×4 sequences, CC dossier — both already dispositioned as native scenes).
- The 506 `<<set>>` calls concentrate in `<<silently>>` header/state preambles — mechanical converter fodder, not logic.

## Sign-off record (2026-07-05)

1. ~~Story-graph visualization~~ **Resolved:** authoring interface must remain writer-friendly. Inky becomes the primary writing environment (live playable preview); the canvas generator is ported to read `.ink` and emit a read-only `story.canvas` for Obsidian viewing; only the sync-back machinery is dropped. Rows above updated.
2. `charSheet` dialog: **pending final word** — recommendation revised to *rebuild in P3* (small scope, and useful during P6 first-play QA for watching grants/composure).
