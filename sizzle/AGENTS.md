# Sizzle Agent Guide

Start here when working in `sizzle/`.

This file is the fast handoff guide for implementation work. Use it alongside:

- `CLAUDE.md` for the broader project and design-system walkthrough
- `docs/GDD.md` for game design and narrative intent
- `docs/STYLE-GUIDE.md` for the comprehensive writing style guide — read this before writing or revising any prose
- `docs/NPC-handler.md` for Robert Flett's full profile
- `docs/STORY-TAGS.md` for player-carried narrative flags
- `docs/INCIDENTPLAN.md` for the selected CC-400 playable origin incidents and their current design notes
- `docs/WRITING.md` for the slim writing index + current writing scope
- `docs/WRITING-TODOS.md` for open prose-level revisions captured from round-trip passes
- `docs/UI-TODOS.md` for deferred interface/accessibility follow-up items
- `docs/AVATAR-RESEARCH.md` + `docs/avatar-bakeoff/` for the offline image-gen stack research and ComfyUI bakeoff workflows. Start at `docs/avatar-bakeoff/STATUS.md` — it tracks the current pipeline conclusion (direct text-to-image isn't stable enough; pivoted to canonical-template + image-edit). `docs/avatar-bakeoff/OPTION-2-ASSET-TODO.md` is the current production asset checklist for the locked explicit layer model.

## Current Scope

The currently playable greybox is:

- main menu
- character creation: `CC-100` through `CC-500`
- briefing/prologue: `INTRO-100` through `INTRO-800`

There is no playable Act 1 content yet beyond `INTRO-800 End`.

## Key Files

Core story files:

- `src/content/character-creator.twee`
- `src/content/briefing.twee`
- `src/story/init.twee`
- `src/story/variables.twee`
- `src/story/interface.twee`
- `src/story/caption.twee`

Reusable UI/runtime:

- `src/widgets/ui.twee`
- `src/widgets/parsers.twee`
- `src/scripts/events.js`
- `src/styles/layout.css`
- `src/styles/passages.css`
- `src/styles/character-creator.css`

## Current Systems To Know

### Character creation rebuild logic

`CC-500 Summary` recalculates derived character state each time it is visited.

- Background skill bonuses are rebuilt from a clean baseline instead of stacking.
- Background-derived `storyTags` are rebuilt there as well.
- Codename assignment is stable on revisit instead of rerolling every time.

### Character creation guardrails

The player cannot proceed past `CC-300 Background` without selecting a background.

- `CC-400` and `CC-500` also guard against invalid skip-ahead states and redirect back to background selection if needed.

### Story tags

Persistent story tags live in:

- `$player.storyTags`

Current background mappings:

- `RCMP constable` -> `Northern Ontario`
- `CSIS analyst` -> `City Dweller`
- `grad student` -> `City Dweller`, `Lived in Toronto`
- `unemployed after university` -> `City Dweller`, `Lived in Toronto`

Reference doc:

- `docs/STORY-TAGS.md`

### Glossary hover terms

Glossary definitions live in:

- `setup.glossary` in `src/story/variables.twee`

Glossary term rendering uses:

- `<<term "NYSE">>`

The widget lives in `src/widgets/parsers.twee` and the tooltip styling lives in `src/styles/passages.css`.

This is explicit markup, not automatic word replacement.

### Screen-mode precedence

`src/scripts/events.js` sets `data-screen`.

Important: `character-creation` takes precedence over `avatar-hidden`, so creation passages resolve to `creation` mode instead of `menu` mode.

### Header/footer state

- Daytime header styling now uses the same darker bronze-brown family as the avatar meta strip.
- The in-passage header status badge derives from Current Composure unless `$header.status` is set explicitly.
- History arrows are disabled when SugarCube cannot move in that direction; do not call `Engine.backward()` / `Engine.forward()` directly from UI without checking history state.
- Add `history-root` to story boundary passages where the header back arrow should stay disabled even if SugarCube has prior character-creation/history entries.
- The avatar metadata card is bottom-anchored; the dotted avatar frame is vertically centered in the flexible space above it.
- The Settings dialog currently exposes only working controls. `Avatar Visible` stays visible; `Avatar Size` and `Text Size` are intentionally hidden until they affect the current layout.
- The fake footer text `AUTOSAVE ON` / `QUICK SAVE F5` has been removed.
- The misleading `SAVED` label has been removed; footer status renders `$date` as `Month D, YYYY · Slot`.
- The footer version is hard-coded in `src/story/interface.twee` as `v 0.1.0`. It is a greybox build label, not an implemented release/versioning system.

### Time helpers

`$date` uses a coarse `slot` field instead of clock minutes. Current slots are `earlyMorning`, `morning`, `noon`, `afternoon`, `evening`, `night`, and `laterNight`; labels and day-mode slots live in `setup.timeSlotLabels` and `setup.dayModeSlots`.

JS-backed SugarCube helpers (implemented in `src/scripts/macros.js`):

- `<<setTime "evening">>` — set only `$date.slot`
- `<<setDate 2005 9 12 "morning">>` — set date plus slot
- `<<advanceTime>>` / `<<advanceTime 2>>` — advance one or more slots, rolling `laterNight` into the next day
- `<<advanceDays 1 "morning">>` — advance calendar days and reset the slot

Authored scene-entry passages set explicit time with `<<setDate>>` / `<<setTime>>`; routine actions advance time with `<<advanceTime>>`. `dayOfWeek` is recomputed from the calendar date on every change. Crossing into a new calendar day (`<<advanceTime>>` rollover or `<<advanceDays>>`) resets Current Composure to Baseline; explicit date/time sets do not. Formatters are exposed as `setup.formatDate` / `setup.formatSlot`.

### Composure state

Composure is split into:

- `$player.baselineComposure` — stable value established during character creation from `$player.skills.composure.level`
- `$player.currentComposure` — volatile value used by live composure checks and avatar pips

Use the helper macros in passages: `<<resetComposure>>`, `<<setCurrentComposure 2>>`, and `<<adjustComposure -1>>`. These clamp to `setup.composureMin` / `setup.composureMax`.

Header status mapping:

- Current Composure 0 or lower: `RATTLED` (red)
- Current Composure 1: `SHAKEN` (orange)
- Current Composure 2-4: `STEADY` (green)
- Current Composure 5-6: `COOL & COLLECTED` (blue)
- Current Composure 7 or higher: `ICE VEINS` (dark blue)

### Player-facing skill checks

Use `<<skillCheck>>` for visible rolls. It renders a roll panel, waits for player input, animates the dice, settles briefly, and only then reveals the success/failure payload.

Pattern:

```twee
<<skillCheck "Composure" "2d6" _checkSkill 8>>
<<success>>
Success text and onward links.
<<failure>>
Failure text and onward links.
<</skillCheck>>
```

Place continuation links inside both result branches. `<<rollDice>>` still exists as a low-level instant dice helper, but visible checks should not use it by default.

### Story-graph round-trip workflow (Obsidian Canvas)

**Primary workflow.** The story graph lives in `sizzle/.obsidian-vault/` as a JSON Canvas file plus one shadow markdown per passage. Edits in Obsidian sync mechanically back to `.twee` source — no AI interpretation step, the round-trip is byte-stable.

Layout: outer `Act` groups (Title / Character Creation / Prologue · Briefing) contain inner `Beat` groups (auto-derived from prefix + hundreds digit; names live in `beats.json` and are editable), which contain horizontally-arrayed passage File-nodes that wrap to multiple rows for long beats.

Scripts (single source of truth, runnable from CLI):
- `sizzle/scripts/build-obsidian-canvas.js` — Twee → vault. Idempotent. Preserves manually-moved node positions across regenerations (matched by id).
- `sizzle/scripts/build-twee-from-vault.js` — vault → Twee. Dry-run by default; pass `--apply` to write. Reports per-file diffs and added/dropped passages.

Obsidian plugin at `obsidian-sizzle-plugin/` wraps the scripts so they run from inside Obsidian (command palette) instead of a terminal. Build + install:

```powershell
cd obsidian-sizzle-plugin
npm install
npm run build
npm run install-to-vault
```

Then in Obsidian: Settings → Community plugins → Enable "Sizzle Tools". Open the vault at `sizzle/.obsidian-vault/`.

Plugin also runs a **lint pipeline** continuously on shadow MD edits. Sidebar pane + status-bar counts surface diagnostics. Rules (severity in parentheses):
- `broken-ref` (error) — dead wiki / `<<goto>>` / `<<include>>` / `<<term>>` / image / `<<ccDossierFooter>>` targets
- `unclosed-macro` (error) — paired-macro stack imbalance
- `duplicate-passage` (error) — same passage name in >1 file
- `orphan-passage` (warning) — no incoming references, not on exempt list
- `undeclared-variable` (warning) — `$var` never `<<set>>` anywhere in `src/`
- `editorial-note` (note) — `[! directive]` and `[? question]` markers in prose
- `editorial-note-malformed` (warning) — unclosed `[! ...` / `[? ...`
- `tag-coherence` (note) — storyTags/kinks/quirks/statusEffects written-but-never-read or read-but-never-written
- `word-count` (note over 120, warning over 200) — body length over the CLAUDE.md ceiling

Editorial-note convention for prose edits: drop `[! note text]` (directive for Claude) or `[? note text]` (open question) inline in passage body. The `editorial-note` rule surfaces them in the lint pane under their passage — use the Notes filter to isolate.

### FigJam round-trip workflow (legacy)

Still in the repo at `twine-mcp-server/src/figjam-sync/` + `figjam-sync-plugin/`. Replaced by the Obsidian Canvas workflow above for routine editing — the FigJam path required a Node HTTP service, Figma desktop app, and an AI interpretation hop, which Obsidian eliminates. Keep it for collaborative whiteboarding sessions or freeform concept work that benefits from FigJam's UI.

## Art Assets Already Added

Robert Flett assets now exist in `media/characters/`:

- `robert-flett-diner-entry.png`
- `robert-flett-reference-sheet.png`

`robert-flett-diner-entry.png` is used at the top of `INTRO-110 Robert arrives`.

Avatar art in `media/avatar/` is still placeholder-only. Current candidate body layers, clothing-mask experiments, Qwen 2509 clothing-fit tests, and workflow outputs live under `docs/avatar-bakeoff/production-drafts/` until explicitly promoted. The next clothing edit test should use `C:\Users\Oculus\Documents\ComfyUI\input\sizzle_alex_noface_blank_qwen2509_canvas_624x1672.png` plus generated garment reference images rather than the older hair/underwear source.

## Known Gaps

- `CC-400 Incident` is still placeholder text in source, but the selected direction is four full playable August 2003 origin sequences. See `docs/INCIDENTPLAN.md`. `$player.incitingIncident` exists as a variable; `INTRO-101 Lost in thought` interpolates it (falling back to "the incident") so the prose works either way until implementation lands.
- The avatar panel currently shows a single composited placeholder PNG (`media/avatar/placeholder-suit.png`) instead of the dashed pattern, painted via CSS in `avatar.css`. This is temporary — the real `<<avatar>>` widget layer arrays are still empty. Remove the `.avatar-abs::after` background-image rule once Codex's layer pipeline lands and the arrays start populating (see `docs/avatar-bakeoff/STATUS.md`).
- Avatar size/text size styling mismatch is intentionally left alone until avatar implementation work starts.
- `INTRO-322 Concerns` (refusal/exit branch) and `INTRO-550 Question Toronto` (Northern Ontario reaction) are stubs only — content TBD.
- The intended avatar layer-slot model is locked as explicit slots: `background`, `hairBack`, `body`, `nipples`, `genitals`, `bodyMods`, `face`, `eyes`, `underwear`, `clothingBottom`, `clothingTop`, `shoes`, `hairFront`, `expression`, and `overlay`. The current `<<avatar>>` runtime still uses older generic arrays and needs implementation work before production assets are promoted; see `docs/avatar-bakeoff/STATUS.md` and `OPTION-2-ASSET-TODO.md`.
- There is no gameplay content beyond the end of the prologue.

## Build

From the repo root:

```powershell
$env:TWEEGO_PATH = "_tools/tweego/storyformats"
& _tools/tweego/tweego.exe -o sizzle/output.html sizzle/src/
```

Or:

```powershell
cd sizzle/build
.\compile.bat
```

## Local Browser Testing

If you need a lightweight local server:

```powershell
cd sizzle
py -3 -m http.server 8000 --bind 127.0.0.1
```

Then open:

- `http://127.0.0.1:8000/output.html`

## Handoff Notes

Before handing off, another agent should usually read:

1. `sizzle/AGENTS.md`
2. `sizzle/CLAUDE.md`
3. `sizzle/docs/GDD.md`
4. `sizzle/docs/STYLE-GUIDE.md` (if any writing or prose-revision work is on the table)
5. `sizzle/docs/NPC-handler.md`
6. `sizzle/docs/STORY-TAGS.md`
7. `sizzle/docs/WRITING-TODOS.md` (open prose-level concerns)
8. `sizzle/docs/UI-TODOS.md` (deferred UI/accessibility items)
9. `sizzle/docs/AVATAR-RESEARCH.md` (if avatar work is on the table)
