# ARCHIVED — Obsidian Canvas round-trip scripts (retired 2026-07-11)

`build-obsidian-canvas.js` / `build-twee-from-vault.js` operated on the twee source,
which was retired at Phase 6 of `sizzle/docs/GODOT-PORT-PLAN.md` (now archived at
`sizzle/archive/twee-src/`). ink (`godot/content/*.ink`) is plain text and directly
editable, so the shadow-MD round-trip is no longer needed.

Per PARITY-MATRIX.md, a future rebuild may port the canvas *generator* to read `.ink`
and emit a read-only `story.canvas` for Obsidian viewing; the sync-back direction is
dropped permanently. The lint rules live on in the planned ink linter
(inklecate + custom rules — see PARITY-MATRIX.md "Tooling & pipeline").
