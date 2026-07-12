# Sizzle Agent Guide

Start here when working on the game. **The game is the Godot project at `godot/` (repo
root); ink is the canonical content format.** SugarCube/twee was retired 2026-07-11 —
anything describing twee/Tweego/Obsidian round-trips is historical (archive notices mark
those directories).

Read alongside:

- `CLAUDE.md` — project + design-system walkthrough, commands, gotchas
- `docs/GODOT-PORT-PLAN.md` — the port roadmap; every phase gate has a record
- `docs/godot/` — the binding contracts: STATE-SCHEMA.md, INK-CONVENTIONS.md,
  AVATAR-MANIFEST.md, PARITY-MATRIX.md, SUSPICION-MODEL.md, and per-phase gate reports
- `docs/GDD.md` — game design and narrative intent
- `docs/STYLE-GUIDE.md` — read before writing or revising ANY prose
- `docs/NPC-handler.md`, `docs/STORY-TAGS.md`, `docs/INCIDENTPLAN.md` — narrative refs
- `docs/avatar-bakeoff/STATUS.md` — offline art pipeline state (Qwen 2509 route)

## Current Scope

Playable: main menu → native character creation (identity / background / incident /
summary+signature) → chosen origin flashback (`BLK` / `MAN` / `PALE` / `WDS`) → briefing
(`INTRO_100`–`INTRO_800`). Prose signed off 2026-07-11. No Act 1 content yet.

## Key Files

Runtime spine (GDScript autoloads, `godot/autoload/`):

- `state.gd` — canonical state dict, choice-commit snapshots, schema-versioned saves
- `rules.gd` — the ONLY mutation surface (composure, time, influence, sizzle
  suspicion/reputation/access, avatar, header); every op emits `state_changed`
- `story_bridge.gd` — godot-ink wrapper: continue/choices, external bindings (named
  methods only), mirror push (skip-if-absent), ink save/restore
- `theme_service.gd` — day/night palette service over `theme/palette.gd` tokens
- `save_manager.gd` — slots + autosave (autosaves on every knot entry)

Presentation:

- `godot/scenes/game_shell.gd` — the whole shell: header/footer chrome, prose
  RichTextLabel, choices, check panel mount, extract mount, CC mount, main menu, end
  screen, glossary tooltip, toasts, atmosphere overlay
- `godot/scenes/cc/` — character-creator flow; `godot/scenes/ui/` — panels and dialogs

Content: `godot/content/*.ink` (+ `mirror.ink` for declared mirror VARs,
`data/glossary.json` for terms).

## Systems To Know

- **State/ops/mirrors:** prose reads mirrored variables; state changes go through
  external ops. Never mutate `State.data` from UI/content paths — add a `Rules` op.
- **Checks:** `# check`-tagged knots pause before their prose; the shell keeps the prior
  page visible during the roll and swaps after (deferred clear — intentional).
- **Composure:** clamp 0..7; day-crossing resets Current to Baseline; header badge maps
  ≤0 RATTLED / 1 SHAKEN / 2–4 STEADY / 5–6 COOL & COLLECTED / ≥7 ICE VEINS.
- **Suspicion (Phase 7):** `sizzle_suspicion/reputation` clamp 0..10, `sizzle_access`
  ratchets 0..3; bands unremarked/noticed/watched/burned; `suspicion_band_changed` on
  transitions; directional toast, never the number; no passive decay. See
  `docs/godot/SUSPICION-MODEL.md`.
- **Avatar:** manifest-driven (`godot/avatar/manifest.json`); `# avatar:` phase tags;
  placeholder art until the bakeoff delivers layers (no code change to swap).
- **Saves:** choice-commit snapshots; autosave every knot entry; Continue reads the
  autosave BEFORE `start()` (start autosaves and would clobber it).

## Hard-Won Gotchas

1. GDScript lambdas cross the godot-ink boundary as null Callables — bind NAMED methods.
2. Main-story `.ink` needs `is_main_file=true` in its `.import` sidecar.
3. Don't edit `godot/addons/` beyond documented extensions (current: `InkStory.
   HasVariable`, 5 lines).
4. Subagents die mid-task here — keep an incremental progress file; verify a dead
   agent's output yourself before trusting it.
5. Prove verification bites: when a check matters, plant a defect and watch it fail.

## Verification Ladder (run ALL after every change)

```powershell
$godot = "_tools/godot4/Godot_v4.7-stable_mono_win64/Godot_v4.7-stable_mono_win64.exe"
dotnet build godot/Sizzle.sln
& $godot --headless --path godot --import
& $godot --headless --path godot -s res://addons/gut/gut_cmdln.gd `
    -gdir=res://test/unit -gdir=res://test/differential -gexit
& $godot --path godot res://tools/screenshot_runner.tscn
```

Baseline at retirement: GUT 85/85. Prose review dumps: `review_dump.tscn` (headless).
Ink-vs-archive audit: `node twine-mcp-server/scripts/verify-ink-import.mjs`.

## Known Gaps

- Avatar art is placeholder (bakeoff in progress); hair swatches and most location art
  missing.
- `INTRO_322` (refusal branch) and `INTRO_550` (Northern Ontario reaction) are stubs.
- No content consumes the suspicion system yet — first consumer is Act 1.
- No gameplay beyond the end of the prologue; Act 1 (Insertion) is next.

## Handoff Notes

Read order for a fresh agent: (1) this file, (2) `CLAUDE.md`, (3) `docs/GODOT-PORT-PLAN.md`
+ the latest `docs/godot/PHASE-*-STATUS/GATE`, (4) `docs/godot/` contracts for whatever
you're touching, (5) `docs/STYLE-GUIDE.md` if prose is on the table.
