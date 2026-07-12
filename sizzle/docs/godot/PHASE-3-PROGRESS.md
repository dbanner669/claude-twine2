# Phase 3 Progress — Presentation Layer (Godot)

Branch: `godot/greenfield`. Do not commit from this session.

Status legend: `[ ]` not started · `[~]` in progress · `[x]` done + verified (build/import/GUT green)

## Deliverables

- [x] A. Assets in (fonts + selected images)
- [x] B. Theme (sizzle_theme.tres, palettes, ThemeService)
- [x] C. Shell (game_shell.tscn replaces slice_player)
- [x] D. Glossary + toasts
- [x] E. Dice panel (check_panel.tscn)
- [x] F. Branch file extract
- [x] G. Charsheet dialog
- [x] H. Odds and ends (scene images, end screen, main menu)

## Verification commands

```powershell
# Build
dotnet build "C:\Users\Oculus\My Drive\Female Agent\godot\Sizzle.sln"

# Import (headless)
& "C:\Users\Oculus\My Drive\Female Agent\_tools\godot4\Godot_v4.7-stable_mono_win64\Godot_v4.7-stable_mono_win64.exe" --headless --path "C:\Users\Oculus\My Drive\Female Agent\godot" --import

# GUT (must stay 49/49)
& "C:\Users\Oculus\My Drive\Female Agent\_tools\godot4\Godot_v4.7-stable_mono_win64\Godot_v4.7-stable_mono_win64.exe" --headless --path "C:\Users\Oculus\My Drive\Female Agent\godot" -s res://addons/gut/gut_cmdln.gd -gdir=res://test/unit -gdir=res://test/differential -ginclude_subdirs -gexit

# Smoke/screenshot runner — drives menu -> Begin -> INTRO_110 -> Continue-restore ->
# BLK_130..BLK_140 check (animated roll) -> BLK_210/MAN_200 extracts -> charsheet -> end screen.
# Headless: exercises every stage with assertions, captures skipped:
& "C:\Users\Oculus\My Drive\Female Agent\_tools\godot4\Godot_v4.7-stable_mono_win64\Godot_v4.7-stable_mono_win64.exe" --headless --path "C:\Users\Oculus\My Drive\Female Agent\godot" res://tools/screenshot_runner.tscn
# Windowed: same, plus PNGs to %APPDATA%\Godot\app_userdata\Sizzle\shots\ :
& "C:\Users\Oculus\My Drive\Female Agent\_tools\godot4\Godot_v4.7-stable_mono_win64\Godot_v4.7-stable_mono_win64.exe" --path "C:\Users\Oculus\My Drive\Female Agent\godot" res://tools/screenshot_runner.tscn

# Play the game normally (main scene = game_shell.tscn):
& "C:\Users\Oculus\My Drive\Female Agent\_tools\godot4\Godot_v4.7-stable_mono_win64\Godot_v4.7-stable_mono_win64.exe" --path "C:\Users\Oculus\My Drive\Female Agent\godot"
```

## A. Assets in — DONE (verified)

- `godot/fonts/` — all 8 WOFF2 files copied from `sizzle/fonts/` (Godot 4 imports WOFF2 natively as FontFile; `.import` sidecars generated).
- `godot/media/` — exactly 5 images: `blackout-day.png`, `blackout-night.png`, `placeholder-suit.png` (from `sizzle/media/avatar/`), `robert-flett-diner-entry.png` (characters), `lake-mansion.png` (locations). The `*b.png` variants and charactersheet renders were deliberately NOT copied.
- **Avatar phase coverage note:** only the BLK phase-override images exist (`blackout-day/night.png` → `# avatar: blk_day` / `blk_night`). MAN/PALE/WDS phase images (`man_day`, `man_night`, `pale_night`, `wds_night`) do not exist yet — the avatar panel must fall back to `placeholder-suit.png` for any unknown `# avatar:` id. Phase 4 wires the rest.
- Verified: dotnet build 0 errors; headless import 13 assets clean; GUT 49/49 (249 asserts).

## B. Theme — DONE (verified)

- `godot/theme/palette.gd` — `class_name SizzlePalette`; `NIGHT` / `DAY` const dictionaries translating every `--sz-*` color token from `sizzle/src/styles/reset.css` (night = `:root`, day = `body[data-mode=day]` overrides), plus text-size consts and `DAY_SLOTS` (the `setup.dayModeSlots` set).
- `godot/theme/sizzle_theme.tres` — Theme resource: default font EB Garamond 16; RichTextLabel normal/italics/bold/mono font wiring (EB Garamond + Italic, Inter Medium as bold stand-in, JetBrains Mono); custom theme type `Sizzle` exposing all 8 font files (`body`, `body_italic`, `display`, `display_italic`, `ui`, `ui_medium`, `mono`, `script`) and font sizes (`base` 16, `lg` 18, `xl` 20, `ui` 11, `ui_md` 13, `mono` 10, `mono_body` 12).
- `godot/autoload/theme_service.gd` — new `ThemeService` autoload (registered in `project.godot` after SaveManager). Listens to `StoryBridge.knot_entered`: `# mode: day/night` tag forces palette, else derived from `State.date().slot` vs `DAY_SLOTS` — exactly events.js. API: `color(token)`, `font(name)`, `font_size(name)`, `set_mode()`, `resolve_mode(tags)`, signal `mode_changed(mode)`. Colors are served from the palette dictionaries at runtime (day/night swap = UI restyles on `mode_changed`); the .tres carries fonts/sizes only.
- Verified: dotnet build 0 errors; import clean; GUT 49/49.

## C. Shell — DONE (verified)

- `godot/scenes/game_shell.tscn` + `game_shell.gd` — new main scene (`project.godot` `run/main_scene` updated; `slice_player.*` left in place but no longer the entry point). Fixed 1920×1080 canvas; project stretch (canvas_items/keep) handles fitting.
- Layout: header 54px (back arrow ‹, location tracked-brass left, weather, time in Cormorant italic 22, composure status badge, CHARACTER button) / mid row (AvatarPanel 430px + passage area; the 88px height gain over the old 992 canvas is absorbed by the mid row) / footer 28px (date `Month D, YYYY · Slot` via `SizzleFormat`, right label `v 0.2.0-godot`).
- `godot/scenes/ui/avatar_panel.gd` (`AvatarPanel`) — dotted-border frame (custom `draw_dashed_line`), `# avatar:` phase image (`blk_day`/`blk_night` → the two blackout PNGs; **anything else falls back to `placeholder-suit.png`** — MAN/PALE/WDS art doesn't exist yet, Phase 4), bottom identity block: codename kicker (or THE BRANCH), name in display italic, COMPOSURE pip row (7 pips, lit = current composure) + n/7 mono value.
- `godot/scenes/ui/format.gd` (`SizzleFormat`) — month/slot label formatting (ports `sizzleFormatDate`/`sizzleFormatSlot`).
- Screen modes from `# screen` tag: `scene` = two-column; `menu`/`creation` = avatar hidden, 680px column centered both axes.
- Choices: flat Buttons in the `.choices .choice` pattern — EB Garamond italic 18 brass, em-dash text prefix, hairline bottom border; hover = brick-glow border/text + left content-margin shift 22→28 (StyleBox pair). Right-chevron omitted (Button can't right-align a suffix glyph cheaply) — documented approximation.
- **Visited greying caveat:** ink's public API does not expose a choice's divert target (`GetPathStringOnChoice()` is the choice's own content path), so per-choice destination greying is not obtainable. The converter already turned all visited-greyed twee hubs into once-only `*` choices (they *disappear* when visited — INK-CONVENTIONS.md calls greying presentation-from-visit-counts). `StoryBridge.visit_count(knot)` (new sanctioned helper wrapping `VisitCountAtPathString`) exists for knot-level greying if a future tag convention needs it.
- Status badge table (CLAUDE.md): ≤0 RATTLED, 1 SHAKEN, 2–4 STEADY, 5–6 COOL & COLLECTED, ≥7 ICE VEINS; `header.status` override renders as --custom (steady color). Header/footer/pips refresh on `Rules.state_changed`.
- Day/night: every style pulls from `ThemeService.color()`; whole shell restyles on `mode_changed`.
- Companions created in baseline form for compile-completeness, finalized in their own deliverables: `check_panel.gd`, `branch_file_extract.gd`, `charsheet_dialog.gd`.
- `godot/tools/screenshot_runner.gd` + `.tscn` — smoke/screenshot driver (see Verification below). Headless run: **all stages OK** (menu → INTRO_100 scene → INTRO_110 image knot → BLK_140 check + roll → BLK_210 extract stub → MAN_200 variant → INTRO_800 end).
- Verified: dotnet build 0 errors; import clean; GUT 49/49; headless boot of main scene error-free; runner all stages OK.

## D. Glossary + toasts — DONE (verified)

- `godot/content/data/glossary.json` — all 17 terms extracted verbatim from `setup.glossary` in `sizzle/src/story/variables.twee` (NYSE, Branch, OC Transpo, Globe, Métis, Shield country, Sault, Thunder Bay, Bank Street, Diefenbunker, Lakehead, U of T, TTC, walkup, cell phone, cordless phone, OPP).
- Glossary tooltip: prose RichTextLabel `meta_hover_started/ended` on `[url=gloss:KEY]` → PanelContainer tooltip (ink-3 bg, rule-strong border, Inter 12, cream text) positioned above the cursor, clamped to viewport; hides on hover end. (Brass-underline term styling inside prose is RichTextLabel's url styling — terms render as links.)
- Toasts: bottom-right VBox stack in the shell, max 4; kinds info/success/warn/hot with left accent border brass/composed/rattled/brick (notifications.css); label = kind uppercase tracked + body text; fade-in 0.24s, linger 4s, fade-out 0.32s. Wired to `Rules.toast_requested` — exercised live by the check-resolution toast in the smoke run.
- Verified: build/import/GUT green; toast path exercised headless via runner (roll → toast). Hover requires a windowed session (code parsed + runs; runner leaves the state on screen for the windowed pass).

## E. Dice panel — DONE (verified)

- `godot/scenes/check_panel.tscn` (root PanelContainer + `godot/scenes/ui/check_panel.gd`, `class_name CheckPanel`). Shell instantiates the scene into the passage column; shows on `StoryBridge.check_ready`.
- Displays: skill name(s) — slash-specs render as "COMPOSURE / STREETWISE CHECK" — dice notation + modifier ("2d6 + 1"), TARGET n; Roll button (passages.css .skill-check styling).
- Roll flow: button → **`StoryBridge.roll_preview()`** (new, non-breaking: rolls the dice + resolves the max-of modifier WITHOUT resolving the check, returns `{skill, dice, target, dice_total, modifier, total}`) → 1s Tween cycling random faces in the plausible range (n+mod .. n*sides+mod), brass-glow while rolling → settles on the pre-rolled total → PASSED/FAILED outcome strip + composed/rattled border → 0.45s pause → `StoryBridge.resolve_check(total)` resumes the story (which fires the toast, per the protocol).
- `StoryBridge.roll()` and `resolve_check()` are byte-identical in behavior — the deterministic test path is untouched (GUT 49/49 confirms).
- Since check branches end in a `*` choice (INK-CONVENTIONS), the reveal prose appends below the panel and the panel stays visible with its outcome until the next knot entry hides it.
- Verified: build 0 errors; import clean; runner drives the roll through the panel's animated path headless ("check resolved after animated roll" OK); GUT 49/49.

## F. Branch file extract — DONE (verified)

- Data: `godot/content/extracts/*.json` — all 8 extracts transcribed from the preserved HTML in PHASE-1-CONVERSION-REPORT.md (`blk_incident_report_03_DAN_0814`, `blk_recommendation_r_flett`, `man_occurrence_report_03_MAN_0816`, `man_recommendation_r_flett`, `pale_field_report_03_OTT_0818`, `pale_recommendation_r_flett`, `wds_occurrence_report_03_ONT_0820`, `wds_recommendation_r_flett`). Filename = the `# extract:` tag id.
- Schema (documented in the script header too): `stamp {text, rotation_deg}` (Classified −8° / Eyes Only +5°), `eyebrow`, `paragraphs[]` of segment lists — `{"t": prose}`, `{"r": px}` redaction, `{"em": text}` brass italic — plus optional `signature`. A paragraph may instead carry `variants` keyed by background with an `"else"` fallback — `man_occurrence_report` holds the RCMP-vs-OPP flagging variant, picked from `State.player().background` at render time.
- Scene: `godot/scenes/branch_file_extract.tscn` + `scenes/ui/branch_file_extract.gd` (`BranchFileExtract`). Styling per the HTML: ink-3 panel, hairline rule border, 28px padding, rotated bordered stamp (brick, 0.85 alpha), brick eyebrow tracked-uppercase, JetBrains Mono 12 body with line-height ~1.8, redactions as `[bgcolor]` runs of NBSP sized `px / 7.2` (mono advance at 12px), "pending review" in brass italic, signature line after a blank gap. Re-renders on palette swap.
- Shell wiring: on `scene_stub("branch_file_extract", id)` the prose panel hides and the extract mounts in its place (extract stubs are `# screen: menu`, so it renders centered single-column); the stub knot's onward choice ("You turn the page.") renders below.
- Verified: build/import clean; runner asserts BLK_210 body text, MAN_200 OPP default AND RCMP variant (re-rendered after background change); GUT 49/49. Windowed screenshot `06_branch_file_extract.png` confirms visual fidelity (stamp, redactions, brass pending-review, toast stacking bottom-right).

## G. Charsheet dialog — DONE (verified)

- `godot/scenes/ui/charsheet_dialog.gd` (`CharSheetDialog`, AcceptDialog): header CHARACTER button → `open()` → rebuilt from State on every open (always live, always current palette). tables.css styling: ink-2 panel with brass-dim border; name in Cormorant italic 30 + codename line (when set); DETAILS dossier grid (age/background/incident-when-set/nationality); COVER IDENTITY section only when `cover.known_as` is set; SKILLS as rows (name / LVL n / n XP mono); COMPOSURE section with BASELINE and CURRENT rows. Content in a full-rect MarginContainer + ScrollContainer (AcceptDialog doesn't lay out custom children; wrapper keeps clear of the Close button row).
- Verified: runner opens the dialog headless ("charsheet opens" OK) and captures `08_charsheet.png` windowed; GUT 49/49.

## H. Odds and ends — DONE (verified; see Log for final gate)

- **Scene images (knot-id-driven):** `KNOT_IMAGES` map at the top of `game_shell.gd` — `INTRO_110` → `robert-flett-diner-entry.png`, `MAN_110` → `lake-mansion.png`, shown in a 680×300 keep-aspect-covered TextureRect above the prose (passages.css `.passage-header-image`). **Convention documented here:** adding a scene image = one entry in `KNOT_IMAGES` (knot id → res:// path). A `# img:` ink tag was considered but rejected for Phase 3 — content/*.ink is generated and frozen; the map keeps presentation fully native-side. If Phase 4+ wants author-driven images, teach the converter to emit `# img:` and read `tags["img"]` in `_on_knot_entered` (one-line change where `KNOT_IMAGES` is consulted).
- **End screen:** `flow_ended` at `INTRO_800`/`intro_end` → centered end panel: "End of Prologue" in Cormorant italic 44, "TO BE CONTINUED — ACT 1: INSERTION" tracked kicker, Main-menu button. Other `*_end` handoff knots get the generic "The story ends here — for now." treatment (their real behavior — CC-500 handoff — is Phase 5).
- **Main menu (menu mode):** script-font "Sizzle" title (brick glow), display-italic subtitle, tracked TORONTO · 2005 kicker; Begin → `StoryBridge.start("res://content/briefing.ink", "INTRO_100")`; Continue (only when `SaveManager.has_autosave()`) → **reads the autosave into memory FIRST**, then start(), then `load_game(save)` — ordering matters because start() itself autosaves on the first knot entry and would clobber the file.
- Verified: runner presses the real Begin/Continue buttons — "Begin starts the briefing at INTRO_100", "Continue restores the autosave at INTRO_110" both OK; end-screen and image-knot stages OK; windowed shots 01/03/09 confirm visuals.

## Known approximations / deferred polish

- ~~Choice rows have no right-aligned chevron~~ **Resolved 2026-07-11 (parity-polish pass):** chevron shipped as a right-anchored Label child of each choice Button — "›", opacity 0.5, brick-glow on hover.
- Check knots pause before their own prose is emitted (ops-only first line carries the `# check` tag — engine protocol, unchanged). The shell keeps the previous knot's prose on screen during the pause and swaps it for the check knot's prose after the roll (deferred-clear; matches twee reading order as closely as the protocol allows).
- The header status badge and CHARACTER button also show on the main menu (twee hid the in-passage header there). Cosmetic; one `visible` toggle in `_show_main_menu` if it bothers anyone.
- ~~Atmosphere overlays (vignette/grain) and day-mode header bronze variant not ported~~ **Resolved 2026-07-11 (parity-polish pass):** `theme/atmosphere.gdshader` + `AtmosphereOverlay` port the layout.css vignette/grain (night and day variants, CSS alphas exact, static grain) over the full stage; day header now uses the ink-4 bronze bar with `bronze_cream`/brass-glow text per layout.css "Daytime header".
- `# screen: creation` currently behaves like `menu` (native CC flow is Phase 5).
- ~~Glossary terms render in RichTextLabel's default link styling~~ **Resolved 2026-07-11 (parity-polish pass, with residual):** terms now render brass via display-time BBCode decoration (`GameShell._decorate_gloss`, unit-tested; generated ink untouched). Residual: RichTextLabel 4.7 has no dotted underline style, so the underline is the meta underline drawn in brass at `underline_alpha` 50% — a soft solid hairline, not dotted; term hover-recolor not ported (the tooltip is the hover feedback).

## Log

- (session start) Progress file created. No deliverables complete yet.
- A complete: fonts + 5 images in, import sidecars generated, all gates green.
