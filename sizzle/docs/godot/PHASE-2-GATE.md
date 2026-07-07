# Phase 2 Gate Report — Runtime Hardening + Five-Sequence Differential

Date: 2026-07-05. Verdict: **PASSED.** GUT **49/49, 249 asserts** across unit + differential suites. All four Phase-2 runtime follow-ups from the Phase 1 conversion report are implemented and tested, and scripted differential runs through **all five stories** match the state trajectories derived from the frozen twee and the locked `$nyse.influence` calibration.

Process note: the Codex implementation agent for this phase hit its session limit before writing any code; Phase 2 was implemented directly by the orchestrator (deviation from the usual Codex-implements convention, recorded here).

## What was built

1. **Check resolution** (`story_bridge.gd` — `check_modifier()`): slash-separated `# check` specs (`composure/streetwise`) resolve as **max-of**; `composure` reads **Current Composure** with the `macros.js` skill-level fallback. Covers all 7 multi-skill checks and every composure check.
2. **Native handoff** (`story_bridge.gd` — `HANDOFF_INCIDENTS`): entering `blk_end`/`man_end`/`pale_end`/`wds_end` sets `player.inciting_incident` engine-side (exact twee strings), pushes the mirror, and emits `handoff_reached(knot)` for the future CC-500 scene. `intro_end` deliberately unmapped.
3. **SaveManager** (new autoload): slots + autosave-on-choice-commit under `user://saves/`. Serialization is `var_to_str`/`str_to_var`, **not JSON** — Godot's JSON round-trip floatifies ints and the schema is int-heavy; saves are local so JSON portability buys nothing. Missing/corrupt saves fail cleanly; schema-version rejection surfaces from `load_game`.
4. **Differential suite** (`test/differential/test_differential.gd`): deterministic scripted runs (forced check outcomes via `resolve_check`, first-choice walks) through all five stories, all-pass and all-fail variants per incident.

## Differential expectations (derived from frozen twee + INCIDENTPLAN calibration)

| Sequence | All-pass | All-fail | Verified extras |
|---|---|---|---|
| briefing | terminates, no incident | terminates | 2005 date; INTRO-410 hub exhausts via once-only choices |
| blackout | influence **+1**, composure grant | **+2** (climbed), streetwise fallback grant | shared one-shot guard blocks stacking; `blk_end` restores 2005-09-12 Monday; day-crossing leaves composure at baseline |
| manitoulin | **+2** | **+3** (sunroom/focal failure) | exactly one skill grant either path |
| pale | **+1** | **+2** (gaze-grazed/bitten) | exactly one skill grant |
| wds | **+2** | **+3** (deep/spine failure) | exactly one skill grant; highest of the four |

`handoff_reached` asserted with `blk_end`; autosave present after every run.

## Defects found and fixed during this phase

1. **Double-bind crash on story switching** (pre-existing, latent since Phase 0.5): Godot caches resources by path, so re-loading a previously-played story returned an already-bound `InkStory`; the bridge's single `_bound` flag then re-bound every external → C# `Function 'set_time' has already been bound` exceptions. Fixed with per-instance binding bookkeeping (`_bound_story_ids` keyed by `get_instance_id()`). This would have broken ANY runtime flow that switches between stories (menu → incident → CC), so the differential earned its keep before Phase 3 exists.
2. Two initially-wrong test expectations (mine): asserted the blackout end date as the 2003 extract date; the twee's `blk_end` restores 2005-09-12 for the CC handoff. Tests corrected to the source-of-truth behavior; runtime was right.

## Repro

```powershell
$godot = "_tools/godot4/Godot_v4.7-stable_mono_win64/Godot_v4.7-stable_mono_win64.exe"
& $godot --headless --path godot -s res://addons/gut/gut_cmdln.gd -gdir=res://test/unit -gdir=res://test/differential -ginclude_subdirs -gexit
```

## Gate decision

Phase 2 exit gate ("all five sequences pass scripted differential runs") is met. Proceed to **Phase 3 — presentation layer** (theme from `--sz-*` tokens, 1920×1080 shell, dice-panel polish, glossary tooltips, toasts, charSheet dialog per sign-off) with the Phase-1 presentation leftovers (2 images, INTRO-800 end screen, BranchFileExtract scene template from the preserved HTML).
