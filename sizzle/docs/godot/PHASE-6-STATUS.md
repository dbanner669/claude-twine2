# Phase 6 Status — Content QA + Retirement Readiness

Date: 2026-07-07. Status: **content QA (mechanical) PASSED; prose review + retirement HELD pending human sign-off and parity discharge.**

Phase 6 has two halves with different owners. The mechanical half is done; the two things that actually close the phase are not mine to sign.

## 1. Mechanical content QA — CLEAN ✔

New tool `godot/tools/review_dump.{gd,tscn}` plays every sequence deterministically and writes the engine-rendered prose (choices taken, check outcomes, extract stubs annotated) to markdown — nine runs: briefing + each incident × {all-pass, all-fail}. Output committed under `sizzle/docs/godot/first-play/` and regenerable:

```
& <godot.exe> --headless --path godot res://tools/review_dump.tscn
# -> user://review/*.md  (also copied to sizzle/docs/godot/first-play/)
```

Automated defect scan (`_ISSUES.md`): **0 issues.** No unconverted twee macros, no unrendered ink conditionals, no raw `$` variables in any run. Every sequence reaches END; influence and skill trajectories match the locked calibration (BLK 1/2, MAN 2/3, PALE 1/2, WDS 2/3; one skill grant each). This corroborates the Phase 2 differential from the rendered-prose side.

Reviewer note: the dumps read `StoryBridge.transcript` (the ink prose), so file-extract knots show their **stub placeholder line** ("Rendered by the native BranchFileExtract scene template…"). In the running game the styled `BranchFileExtract` scene renders the real document there — the dump is for prose review, not extract-layout review (see the extract screenshots from Phase 3 for those).

## 2. Prose first-play review — ✔ SIGNED OFF 2026-07-11

The human played through in-engine and signed off on the prose (the in-engine playthrough, not the rendered-dump reading copy, is what cleared this). The four incidents and the briefing drop their "pending first-play review" status carried since the SugarCube era.

One finding from the playthrough: **no way back to the main menu from in-game** (the twee header's clickable wordmark had no equivalent in the merged Godot header). Fixed same day — a MENU button in the header chrome routes to `_show_main_menu()`; safe mid-story since autosave runs on every knot entry.

## 3. SugarCube retirement — HELD (do not execute yet)

The plan gates retirement on "**every `port`/`rebuild` parity-matrix row demonstrably live in Godot.**" The four rows that were open here were closed by the **parity-polish pass (2026-07-11)** — see PARITY-POLISH-PROGRESS.md for evidence (GUT 75/75, screenshot runner green, shots in `parity-polish-shots/`):

- **Atmosphere overlays (vignette/grain)** — ✔ live: `theme/atmosphere.gdshader` + `AtmosphereOverlay`, night + day variants.
- **Day-mode header bronze variant** — ✔ live: ink-4 bronze bar, `bronze_cream`/brass-glow text (layout.css values).
- **Glossary brass term styling** — ✔ live via display-time BBCode decoration; residual: underline is soft-brass solid, not dotted (no dotted underline style exists in RichTextLabel 4.7).
- **Choice-row right chevron** — ✔ live: right-anchored Label child, opacity 0.5, brick-glow hover.

Both blockers are now resolved:

1. ~~Parity matrix not fully discharged.~~ **Discharged 2026-07-11 (parity-polish pass).**
2. ~~Human prose review (#2) not done.~~ **Signed off 2026-07-11 (in-engine playthrough).**

**Retirement is UNBLOCKED.** It remains a deliberate, explicitly-triggered step (archive Tweego build, Obsidian vault + scripts, FigJam sync; move `sizzle/src` twee to an archive path; rewrite CLAUDE.md/AGENTS.md for the Godot world) — hard to walk back, so it executes on an explicit go, not automatically.

## Verdict

Phase 6 mechanical QA gate: **PASSED.** Parity polish: **DONE (2026-07-11).** Prose first-play review: **SIGNED OFF (2026-07-11).** All Phase 6 gate conditions are met except the retirement execution itself, which awaits an explicit go. No content or runtime defects found; one UI gap (main-menu return) found in review and fixed.
