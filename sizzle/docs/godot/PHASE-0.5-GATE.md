# Phase 0.5 Gate Report — Vertical Slice

Date: 2026-07-05. Verdict: **PASSED.** The global bail point in GODOT-PORT-PLAN.md is cleared: godot-ink v1.1.2 works on Godot 4.7 .NET from GDScript, every hard construct from the contracts runs in-engine, and the save/back/restore semantics hold under test.

## Spike results (godot/spike/, headless)

```
SPIKE 1 PASS — load compiled InkStory resource
SPIKE 2 PASS — continue/continue_maximally text retrieval
SPIKE 3 PASS — choices list + choosing by index
SPIKE 4 PASS — external function binding (GDScript callable from ink EXTERNAL)
SPIKE 5 PASS — get/set/observe ink variable from GDScript
SPIKE 6 PASS — story-state save + restore round-trip (position preserved)
```

## GUT results (godot/test/unit/, headless)

**26/26 passing, 175 asserts.** Coverage includes every case the two plan reviews demanded: check knot pauses before its conditional renders; pass/fail branches; one-shot grant fires once and shared guard holds across BLK_160/170/175; **back across a grant un-fires it** (engine and ink side); **mid-check save re-offers the roll on load** and discards post-save grants; day-crossing via ink `advance_days` resets composure and back across it restores day+slot+composure; influence one-shot; extract stubs; schema-mismatch load rejection.

Repro:
```powershell
$godot = "_tools/godot4/Godot_v4.7-stable_mono_win64/Godot_v4.7-stable_mono_win64.exe"
dotnet build godot/Sizzle.sln
& $godot --headless --path godot --import
& $godot --headless --path godot res://spike/spike.tscn
& $godot --headless --path godot -s res://addons/gut/gut_cmdln.gd -gdir=res://test/unit -ginclude_subdirs -gexit
```

## Deviations & findings (bind into later phases)

1. **GDScript lambdas do not survive the godot-ink marshalling boundary** — `BindExternalFunction`/`ObserveVariable` with an inline `func(...)` arrives as a `null::null` Callable and crashes at invoke time. **Rule: bind named-method Callables only.** (Added here; StoryBridge already complied.)
2. **`is_main_file=true` must be set on main-story `.ink` imports** — the default import leaves stories uncompiled include-fragments. The Phase 1 converter must emit/patch `.import` sidecars (or the docs must call out the manual step per new story file).
3. GUT flags intentional `push_error` paths as failures unless the test declares them via `assert_push_error(...)` — convention adopted in the two error-path tests.
4. Choice-commit snapshot timing implemented as *pre-Continue of the knot's `# id:` line* (StoryBridge). Restoring re-runs knot-entry ops deterministically — this is the concrete realization of the plan's "choice commit" atom and should be carried into Phase 2 unchanged.

## Known gaps (acceptable at this gate)

- The BLK climbed-path influence total (+2 at cap) isn't asserted — only the held-line base (+1). Add to the Phase 2 differential corpus.
- `slice_player.tscn` (the minimal UI) is untested visually in this headless environment; the flow logic it fronts is fully covered by the GUT integration tests.
- Slice prose is trimmed versus twee (declared converter policy: construct fidelity over prose fidelity for the slice).

## Differential note

The GUT slice tests assert the state trajectory (skill grant once, influence +1 base, composure reset on the 08-14→08-15 crossing, extract dates) taken directly from `blackout.twee` + `macros.js` semantics — a hand-derived differential. The full scripted five-sequence differential against the running SugarCube build remains the **Phase 2 gate**, as planned.

## Gate decision

Proceed to Phase 1 (bulk twee→ink conversion) and Phase 2 (runtime hardening). No contract changes required; findings 1–3 above become converter/runtime implementation notes.
