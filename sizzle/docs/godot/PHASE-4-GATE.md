# Phase 4 Gate Report — Avatar Runtime

Date: 2026-07-07. Verdict: **PASSED.** GUT **59/59 (293 asserts)**; smoke runner all stages OK (BLK day/night phase swaps drive through the runtime, per the plan's gate line). Implemented directly by the orchestrator (same rationale as Phase 2).

## What was built

- **Manifest** — `godot/avatar/manifest.json`: canonical 523×1536 canvas, the 15-slot Option 2 stack, assets/outfits/expressions/base_look/phase_overrides, `explicit_slots` (nipples/genitals). Loaded + validated by the new `AvatarManifest` autoload (unknown slots, missing files, wrong-slot assets and dangling references all fail loud).
- **State** — `player`-adjacent `avatar` slot-state dict (schema **v2**; greybox saves invalidated by design). Semantics: key absent = manifest base look, `""` = explicitly cleared, else asset id. Rides choice-commit snapshots and saves for free.
- **Ops** — `avatar_set_slot` / `avatar_apply_outfit` / `avatar_set_expression` / `avatar_clear` on the Rules command surface, validated against the manifest; EXTERNAL declarations added to `ops.ink` and bound in StoryBridge (no generated content calls them yet — future content and the CC flow will).
- **Panel** — display precedence: phase override (manifest `phase_overrides`) → layer stack (when slot-state is in use) → greybox placeholder portrait (also the fallback for unknown phase ids — MAN/PALE/WDS art pending from the bakeoff). Stack = one keep-aspect TextureRect per slot in manifest z-order; registration holds because every asset shares the canonical canvas.
- **Settings** — new autoload (`user://settings.cfg`): `explicit_layers_visible`, off by default; panel re-renders on change (AVATAR-MANIFEST.md sign-off #2 delivered).
- **Placeholder art** — `tools/gen_placeholder_layers.gd` generated 13 tinted-band layers on the canonical canvas so stack order/registration is visually verifiable until Qwen 2509 production layers land; real art replaces files + manifest paths only, no code.
- **Runner watchdog** — 120s hard deadline force-quits(1); a crashed stage can no longer strand a headless Godot process (the Phase 3 "2 running tasks" incident class is closed).

## Test coverage highlights

Manifest validation; resolve-slot precedence (absent/cleared/set); wrong-slot and unknown-id rejection paths; outfit null-slot clearing; expression swap; clear-to-base; **choice-commit semantics for avatar state** (op inside a frame un-fires backing into that frame, survives backing into a later frame); panel precedence (override > stack > placeholder, unknown-phase fallback); explicit-layers setting live re-render.

## Deferred (unchanged expectations)

- MAN/PALE/WDS phase-override images — bakeoff pipeline; manifest entries + fallback already in place.
- Real production layers — replace placeholders via manifest, crossed-composite acceptance test per `layer-composition-protocol.md` still governs.
- A Settings UI surface for `explicit_layers_visible` (the setting works; exposing it in a dialog is Phase 5+ polish).

## Repro

```powershell
$godot = "_tools/godot4/Godot_v4.7-stable_mono_win64/Godot_v4.7-stable_mono_win64.exe"
& $godot --headless --path godot -s res://tools/gen_placeholder_layers.gd   # regenerate placeholders
& $godot --headless --path godot -s res://addons/gut/gut_cmdln.gd -gdir=res://test/unit -gdir=res://test/differential -ginclude_subdirs -gexit
& $godot --headless --path godot res://tools/screenshot_runner.tscn
```
