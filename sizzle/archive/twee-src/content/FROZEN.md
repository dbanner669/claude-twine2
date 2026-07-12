# CONTENT FREEZE — 2026-07-05 (Phase 1 gate)

The five narrative twee files in this directory are **frozen** as of the Phase 1
twee→ink conversion sign-off (branch `godot/greenfield`):

- `briefing.twee`, `blackout.twee`, `manitoulin.twee`, `pale.twee`, `wds.twee`

**ink is now the canonical content format.** All prose edits go to
`godot/content/*.ink` (authoring: Inky at `_tools/inky/`; conventions:
`sizzle/docs/godot/INK-CONVENTIONS.md`). Do not edit the frozen twee files —
they exist only so the SugarCube build stays compilable as the reference
implementation for the Phase 2 five-sequence differential and Phase 6 parity
checks. Full retirement (files moved to an archive path) happens at the
Phase 6 gate per `sizzle/docs/GODOT-PORT-PLAN.md`.

`main-menu.twee` and `character-creator.twee` are NOT converted content — they
are rebuilt as native Godot scenes (Phases 3/5) and remain editable only if the
SugarCube reference build needs a compile fix.

Filesystem read-only attributes are set on the five frozen files (local
belt-and-suspenders; git does not track them).
