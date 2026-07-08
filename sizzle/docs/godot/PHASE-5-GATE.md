# Phase 5 Gate Report — Native Character Creator + Full Game Flow

Date: 2026-07-07. Verdict: **PASSED.** GUT **70/70 (370 asserts)**; smoke runner all stages OK — including the complete new loop: main menu → CC dossier (identify → background → incident) → flashback → handoff → CC summary → sign → briefing. This is the phase that makes the four origin sequences reachable in-game (the gap noted at the Phase 3 gate).

Codex-implemented; the agent hit its session limit after marking all deliverables done but before logging verification of B/C/D. Verified independently by the orchestrator (build/import/GUT/runner all green; windowed CC screenshots reviewed).

## What was built

- **cc.json + Rules CC section** — backgrounds/bonuses/tags/incidents and name pools extracted from `character-creator.twee` (ids are the exact twee strings, so ink conditionals and extract variants still match). `cc_apply_identity`, `cc_rebuild_derived` (reset 8 skills, clear the 3 background tags, re-apply bonuses + tags + Branch training, set background), `cc_finalize` (baseline = composure level after the flashback, current = baseline). 11 dedicated rules tests.
- **CCFlow scene** — four-step dossier (tab strip, name entry + randomize, 2×2 background cards, redacted incident file + memory cards, personnel summary with assessed-skills grid, Allura signature, classified line). Guardrail hints and disabled CONTINUE match the twee ("Select a background first" / "Select an incident first"). All ThemeService-tokened, day/night reactive, mutations only via `Rules.cc_*`.
- **Flow wiring** — Begin → CC; incident confirm runs the CC-400-top rebuild then starts the flashback (`keep_engine_state=true`); `*_end` handoff returns to the summary; Sign runs `cc_finalize` and starts the briefing with state intact.

## The one runtime change (documented)

`StoryBridge.start()` gained an optional `keep_engine_state` param. It previously always called `State.reset()`, which would wipe CC identity/background/rebuilt skills before the flashback — whose first knot (`BLK_085` etc.) immediately reads the `background` mirror var for its four variants. The CC flow passes `true` (keeps `State.data`, clears only choice-commit history). Default `false` keeps every prior call site and test byte-identical; the differential/save tests confirm (70/70).

## Verified state pipeline (from the summary screenshot)

RCMP + Branch training + all-pass Blackout produced exactly the expected sheet: Composure 3 (bg +1, training +1, flashback +1), Confrontation 2, Agent 1, Athlete 1; codename auto-assigned; incident "the Toronto Blackout" set at handoff; baseline = 3 → STEADY badge. Skill math, handoff, codename assignment, and finalize ordering all correct.

## Deferred (unchanged expectations)

- Summary "FINAL AVATAR COMPOSITE" slot is an empty placeholder frame — wires to the Phase 4 layer stack once production art exists.
- CC appearance selection remains descoped (CC-200), per the frozen design.

## Repro

```powershell
$godot = "_tools/godot4/Godot_v4.7-stable_mono_win64/Godot_v4.7-stable_mono_win64.exe"
& $godot --headless --path godot -s res://addons/gut/gut_cmdln.gd -gdir=res://test/unit -gdir=res://test/differential -ginclude_subdirs -gexit
& $godot --headless --path godot res://tools/screenshot_runner.tscn
```

Screenshots: `%APPDATA%/Godot/app_userdata/Sizzle/shots/10_cc_identity`..`13_cc_summary`.
