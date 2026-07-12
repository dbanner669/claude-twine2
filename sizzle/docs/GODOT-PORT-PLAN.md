# Godot Greenfield Plan

Status: **approved direction, not started**. Supersedes the twee-canonical port plan that briefly lived in this file (2026-07-05, same day): the SugarCube build is now treated as an experimental feel-out of process, not a codebase to preserve. Drivers unchanged: (1) a real avatar runtime (the Option 2 explicit layer stack), (2) future gamestate complexity SugarCube would struggle with.

This revision folds in two adversarial review rounds (Sonnet, Codex — both 2026-07-05). Their shared conclusion: the architecture holds; the risk lives in the seams — conventions, state sync, save semantics, and phase ordering. The amendments below address that directly, chiefly by proving every hard runtime behavior in a vertical slice **before** bulk content conversion.

Core architectural decision: **ink becomes the canonical content language.** No custom exporter DSL, no dual runtime. The existing 153 passages (~25K words) get a **one-time** twee→ink conversion, after which twee, Tweego, and the Obsidian shadow-MD pipeline are retired. ink is plain text — agents and lint work on it directly, no shadow layer needed.

## Fixed decisions

| Decision | Value |
|---|---|
| Engine | Godot 4.7-stable **.NET edition** (`_tools/godot4/`) — required by godot-ink. Game code stays **GDScript**; C# is only the ink runtime layer |
| Content | ink, compiled by inklecate (bundled in Inky, `_tools/inky/`); godot-ink addon bridges it into Godot |
| Window | Fixed 16:9, base canvas 1920×1080, stretch `canvas_items` / `keep` |
| Project | `godot/` at repo root |
| Plugins | godot-ink, a save-system addon, **GUT** (test framework). Nothing else |
| State ownership | The engine owns canonical state (one GDScript autoload). **Reads are mirrored, writes are commands:** the engine pushes canonical values into ink variables so prose conditions stay native ink (`{background == "rcmp": ...}`); ink mutates engine state only through named external-function ops. Mirrored reads are projections, not authority |
| History/save atom | **Choice commit.** State snapshots at knot entry; every mutation until the next committed choice belongs to that frame; back = restore the entry snapshot. Set-once grants restore with everything else — this *replaces* the SugarCube `$player.flags` latch workaround rather than inheriting the re-fire problem that created it |
| New-construct rule | Any new narrative-facing construct ships as an ink convention + runtime handler **pair**, documented in the conventions doc, or not at all |
| Workflow | Claude orchestrates/reviews, Codex implements. Systems code gets normal code review + GUT tests — that *is* the editorial pipeline for non-prose |

## Phase 0 — Contracts (before any code)

Week-one paper work; everything downstream targets these four artifacts (drafts live in `docs/godot/`: [STATE-SCHEMA.md](godot/STATE-SCHEMA.md), [INK-CONVENTIONS.md](godot/INK-CONVENTIONS.md), [AVATAR-MANIFEST.md](godot/AVATAR-MANIFEST.md), [PARITY-MATRIX.md](godot/PARITY-MATRIX.md)):

1. **State schema** — the full `$player/$sizzle/$nyse/$date/$header` tree as a typed, versioned dictionary with named accessors. Specifies the mirror set (which variables project into ink), the command surface (which ops mutate engine state), and the one-way sync rules. Schema version field from day one; greybox saves may be wiped on schema change, but the version check must exist before the first save is ever written.
2. **ink conventions doc** — knot = passage (`BLK_100`; ink identifiers can't contain hyphens); tags for screen mode / day-night / history-root; the external-function surface (time helpers, composure ops, toasts, avatar cues, glossary); the **mid-knot interactive pause convention** for `<<skillCheck>>` (engine halts continuation at a tagged check point, runs the click-to-roll interaction, writes the result into an ink variable, resumes into conditional weave — a solved pattern in shipped ink titles, but it must be *our* written pattern); the **`<<linkreplace>>` decision** (reveal-in-place primitive vs. restructure, decided per-instance, with explicit acceptance that some navigation semantics drift); rich-text markup convention; link-text and passage-length rules carried over from STYLE-GUIDE.md verbatim.
3. **Avatar layer manifest** — the Option 2 stack (`background → hairBack → body → … → expression → overlay`), canvas size, registration, alpha rules, file naming, and the crossed-composite pass/fail test. Art production and the runtime both target this contract; neither chases the other.
4. **Parity matrix** — one page listing every live SugarCube construct and tool (`<<first>>`, visited-choice styling, glossary, `nobr` layouts, Obsidian lint rules, …), each marked `port` / `rebuild` / `drop`. Several rows are free wins — ink has native visit counts and `once`/`cycle` sequences, superseding `<<first>>` outright. Nothing on the SugarCube side is retired until every `port`/`rebuild` row has a live replacement.

Gate: all four reviewed and signed off by the human (these are the decisions that are expensive to reverse). **✔ PASSED 2026-07-05** — all eight embedded questions resolved; sign-off records in each contract.

## Phase 0.5 — Vertical slice (prove the hard things first)

Both reviews converged here: bulk-converting content against unproven conventions is backwards. Before any corpus conversion:

- **godot-ink integration spike:** `continue`, choice presentation, external-function binding, GDScript↔C# state exchange, and ink-runtime save/restore, all driven from GDScript in the actual addon. The bridge contract — pure queries vs. stateful commands vs. presentation events — gets written down as part of this spike.
- **Hard-passage slice, in-engine:** BLK-130/145 (`<<linkreplace>>`), BLK-160/180 (interactive checks with one-shot grants), BLK-210/215 (Branch file extract). The file-extract passages are **not** converted as narrative markup at all — they become a native `BranchFileExtract` scene template with data-filled text slots (the same document family closes MAN/PALE/WDS, so one template retires the whole class).
- Save/load/back tested *through* the slice: quit-and-restore mid-check, back across a day-crossing, back across a grant.

Gate: the slice plays, and a scripted run through it matches the SugarCube build's state trajectory. This is the plan's global bail point — if the slice fights the addon or the conventions, we reassess **here**, before conversion or presentation spend.

## Phase 1 — Bulk twee→ink conversion (one-time)

- Converter built on the existing `twine-mcp-server` parser: prose, links→choices/diverts, `<<if>>/<<set>>` → ink conditionals and variable ops, JS-backed macros → the Phase 0 external-function conventions, `//italics//` → the markup convention. The slice already proved every hard pattern; this phase is mechanical mop-up.
- **This is scaffolding, not product.** It runs once; "good enough plus a hand-fix report" beats converter perfection. The `nobr` character-creator passages are excluded (rebuilt natively in Phase 5).
- Stop-loss: if more than ~20% of passages need hand conversion, stop improving the converter and just hand-convert with agents — 25K words is small enough that the converter is a convenience, not a bet.

Gate: all narrative content files converted; inklecate compiles clean; prose spot-diff against the twee source; twee files frozen (archived read-only) at sign-off. **✔ PASSED 2026-07-05** — 131 knots, 0 hand-fixes (stop-loss untriggered), all verification green; report in `docs/godot/PHASE-1-CONVERSION-REPORT.md`. Five twee files frozen read-only (`src/content/FROZEN.md`); ink canonical from here.

## Phase 2 — Runtime hardening

- Autoloads matured from the spike: `State` (canonical dict, accessors, choice-commit snapshots per the fixed decision above), `StoryBridge` (compiled ink, continue/choices, external functions, mirror sync), `Rules` (time slots, day-crossing composure reset, clamps, grants — semantics ported from `macros.js`, implementation fresh).
- Saves: engine state dict + ink runtime state JSON, slots + autosave via addon, schema-version checked.
- GUT tests for every `Rules` op, save/restore/history round-trips, and the back/load edge cases around checks, reveals, and day-crossings.

Gate: **all five sequences** (INTRO + BLK/MAN/PALE/WDS) pass scripted differential runs — same choice scripts through the SugarCube build and the Godot build produce matching state trajectories. One sequence proves nothing; the five have different rule patterns, and the marginal cost per sequence is trivial once the harness exists.

## Phase 3 — Presentation layer (built once, natively)

- 1920×1080 shell: header, avatar column, passage area, footer. The 88 px gained over the old 992-tall stage goes to the passage column unless the Phase 3 mockup argues otherwise.
- Godot Theme from the `--sz-*` tokens; the five font families (Godot reads WOFF2); day/night as theme variants; glossary via RichTextLabel `meta_hover`; toast scene; vignette/grain as shaders.
- The skill-check dice panel gets its production polish here (the interaction skeleton already exists from the slice): signal/Tween state machine — roll → animate → settle → reveal → toast.

Gate: side-by-side screenshots vs the SugarCube build reviewed against a written checklist (layout regions, palette, typography, choice-link behavior, visited-choice styling) — "matches at a glance," human signs the checklist. Deliberately not pixel parity; that's the scope-balloon failure mode.

## Phase 4 — Avatar runtime

- One AvatarPanel scene; manifest-driven layer resolution; named TextureRect per layer; API: set layer / expression / outfit; composure pips; per-phase incident images.
- Greybox lock unchanged (medium skin, long straight hair, blue eyes). Layer *production* stays with the Qwen 2509 bakeoff pipeline — this phase builds the consumer against placeholder art first.

Gate: the BLK sequence drives per-phase avatar/background swaps through the API.

## Phase 5 — Character creator (native rebuild)

Godot scenes for the four-step dossier flow (tabs, background cards, incident select, summary, signature). CC-400/CC-500 derived-state and skill-rebuild rules move into `Rules` with GUT tests. The incident sequences themselves are ordinary ink content and need nothing special.

Gate: full flow — creation → incident flashback → briefing — playable without touching a debug menu.

## Phase 6 — Content QA + SugarCube retirement

- **Playthrough harness:** scripted choice runs per sequence asserting state trajectories (skill grants fire once, `$nyse.influence` lands on calibrated values, day-crossings reset composure). The four still-unreviewed incident sequences get their first-play reviews here, in the engine they'll ship in.
- Retirement is gated on the Phase 0 parity matrix: every `port`/`rebuild` row demonstrably live in Godot before the corresponding SugarCube capability is switched off. Then: Tweego build scripts, the Obsidian vault pipeline, and the FigJam sync marked archived; `sizzle/src/` twee moved to an archive path; CLAUDE.md and AGENTS.md rewritten for the Godot world.

Gate: harness green on all sequences; human has played each once; parity matrix fully discharged; no doc still describes SugarCube as the build. **✔ PASSED 2026-07-11** — mechanical QA 2026-07-07, parity polish + prose sign-off + retirement executed 2026-07-11 (human go: "twee lives on in a fork"). Record: `docs/godot/PHASE-6-STATUS.md`.

## Phase 7 — Systems track (the gamestate driver)

The pattern, locked before the first system: simulation (suspicion model, NPC schedules, club state) lives in GDScript systems that read/write `State`, exposed to ink only as mirrored variables and command ops — passages stay thin. Every system lands with GUT tests and normal review. First system: Sizzle suspicion/reputation, when Act 1 content starts.

## Editorial pipeline after the switch

ink files are the agent-legible, lintable format the Obsidian vault was approximating. The lint rules port to an ink linter (word count per knot, link-text forms, editorial markers, orphan knots, undeclared variables); Inky provides human preview/playtesting; the STYLE-GUIDE.md audit workflow continues unchanged in substance. Obsidian becomes optional (it can still browse plain-text ink), not load-bearing. Prose production continues in parallel throughout — written directly in ink from Phase 1 sign-off onward.

## Open decisions (flagged, non-blocking)

- **Distribution:** default desktop-first via itch; Godot web export revisited after greybox (real limitations for fonts/shaders/size).
- **Audio:** none scoped yet anywhere in the project; Godot makes it cheap when the GDD gets there.

## Sizing and stop-losses

Rough sizes: P0 small · P0.5 **medium (and the highest-information spend in the plan)** · P1 small-medium (post-slice, mechanical; stop-loss above) · P2 medium · P3 **large** (the honest biggest item) · P4 small-medium · P5 medium · P6 medium · P7 ongoing. Global bail trigger: the Phase 0.5 gate. Presentation spend (P3) is only justified once content-in-engine is proven by the slice and the five-sequence differential.
