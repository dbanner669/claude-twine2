# ARCHIVED — SugarCube/twee source (retired 2026-07-11)

This is the frozen twee source of the SugarCube greybox, moved here from `sizzle/src/`
at SugarCube retirement (Phase 6 of `sizzle/docs/GODOT-PORT-PLAN.md`). **The Godot build
is the game; ink (`godot/content/*.ink`) is the canonical content format.** The twee
line also lives on in a fork and in git history (`master` branch = frozen legacy line).

- Content was frozen at Phase 1 conversion sign-off (see `content/FROZEN.md`) and is
  verified text-identical to the generated ink:
  `node twine-mcp-server/scripts/verify-ink-import.mjs` (repointed at this path).
- Nothing here is built, linted, or edited. Do not fix bugs here; fix them in the
  Godot/ink world.
- Retirement record: `sizzle/docs/godot/PHASE-6-STATUS.md`.
