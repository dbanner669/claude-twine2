# Parity-Polish Pass — Progress (recovery record)

Date: 2026-07-11. Branch: godot-main. Goal: implement the four deferred
parity-matrix rebuild rows natively (PHASE-6-STATUS.md section 3) so SugarCube
retirement can proceed. **Status: COMPLETE — all four items live and verified.**

| # | Item | Status |
|---|------|--------|
| 1 | Atmosphere overlay (vignette + grain, shader) | **DONE** |
| 2 | Day-mode header bronze variant | **DONE** |
| 3 | Glossary term styling (brass + underline) | **DONE** (residual: solid-soft underline, not dotted) |
| 4 | Choice-row right chevron | **DONE** |

## What shipped

1. **Atmosphere overlay** — new `godot/theme/atmosphere.gdshader` +
   `godot/scenes/ui/atmosphere_overlay.gd` (`AtmosphereOverlay`, mouse-transparent
   full-rect ColorRect added in `game_shell._build_ui` above the chrome, below
   toasts/tooltip). Ports layout.css 268-305 with exact CSS alphas: night =
   elliptical vignette (transparent→40%, rgba(0,0,0,0.55) at edge, center 50%/35%)
   + warm two-grid dot grain at 6% overlay blend; day = sunbeam + bottom sepia
   shadow + grain at 10% multiply. Screen-texture sampling implements the real
   overlay/multiply blend modes. Grain is static (CSS pattern, not animated
   noise). Day/night switches on `ThemeService.mode_changed`. Approximations:
   applied over the full stage (the twee build's opaque `#game` at z-index 2
   confined the visible effect to the backdrop bars, which don't exist under
   Godot's stretch mode); day grain omits the CSS `sepia(0.3)` filter (negligible
   on an already-warm tone).
2. **Day-mode bronze header** — `_restyle()`/`_style_ui_button()` now apply the
   layout.css "Daytime header" variant in day mode: ink-4 bronze bar, time/weather
   in `bronze_cream` (#ecdcb8, new palette token; its night value IS cream so
   night styling is value-identical), location + header buttons brass-glow, button
   hover `bronze_cream_bright` (#f6ead0). Night rendering unchanged, with one
   deliberate exception: the SAVES button was never styled at all (pre-existing
   gap noted below) and now gets `_style_ui_button` like BACK/CHARACTER.
3. **Glossary term styling** — `GameShell._decorate_gloss` (pure static, RegEx)
   wraps generated `[url=gloss:...]...[/url]` spans in `[color=<brass>]` at
   display time in `_on_text_appended`; generated ink untouched; append-time
   color is mode-correct because ThemeService resolves the knot's mode before the
   shell receives its text. New GUT suite `test/unit/test_gloss_markup.gd`
   (5 tests). **Residual:** RichTextLabel 4.7 (verified from the installed
   engine's `--doctool` class reference) has `push_underline(color)` and meta
   underline modes but no dotted/dashed underline style — the term underline is
   the meta underline drawn in brass at `underline_alpha` 50% (soft solid
   hairline), not dotted. Term hover-recolor (brick-glow) not ported; the tooltip
   is the hover feedback.
4. **Choice chevron** — `_style_choice_chevron()` gives every choice-styled
   Button a right-anchored "›" Label child (opacity 0.5, body font, non-italic),
   recolored brick-glow on hover via named-method mouse_entered/exited handlers,
   created once and restyled in place on mode change. Applies to story choices
   and menu/end-screen buttons (the twee menu links were `.choice` rows with
   chevrons too).

## Verification (all green, run 2026-07-11)

- `dotnet build godot/Sizzle.sln` — 0 errors.
- Headless `--import` — clean; `AtmosphereOverlay` registered.
- GUT `-gdir=res://test/unit -gdir=res://test/differential` — **75/75 passed**
  (baseline 70 + 5 new gloss-markup tests), 375 asserts.
- Windowed screenshot runner — exit 0, every stage OK (menu → CC → flashback →
  summary → briefing → continue-from-autosave → check → extract).
- Shots inspected and archived in `parity-polish-shots/`: `01_main_menu.png`
  (night: chevrons, vignette), `02_scene_intro_100.png` (day: bronze header,
  brass glossary terms, chevroned choice), `05_check_resolved.png` (night scene:
  check panel intact, night styling in character).

## Log

- (session start) Progress file created. No deliverables complete yet.
- Read game_shell.gd, palette.gd, theme_service.gd, layout.css 268-338,
  passages.css 102-125 / 461-479, PHASE-6-STATUS.md, PARITY-MATRIX.md,
  screenshot_runner.gd.
- Pre-existing observation: `_saves_button` was never styled in `_restyle()`;
  fixed as part of item 2 (now styled like BACK/CHARACTER in both modes).
- Codex session died at the API limit before writing any code (working tree
  clean apart from this file). Orchestrator (Claude) took over implementation
  directly from the plan above.
- Underline investigation settled from the installed engine's class reference
  (`--doctool` dump): no dotted underline in RichTextLabel 4.7 → soft-brass
  solid underline shipped and documented as the residual.
- All four items implemented, verified (build/import/GUT/runner), shots
  archived, PARITY-MATRIX.md / PHASE-3-PROGRESS.md / PHASE-6-STATUS.md updated.
  Parity matrix discharged; retirement now waits only on the human prose
  first-play review.
