# Sizzle Agent Guide

Start here when working in `sizzle/`.

This file is the fast handoff guide for implementation work. Use it alongside:

- `CLAUDE.md` for the broader project and design-system walkthrough
- `docs/GDD.md` for game design and narrative intent
- `docs/NPC-handler.md` for Robert Flett's full profile
- `docs/STORY-TAGS.md` for player-carried narrative flags
- `docs/WRITING-TODOS.md` for open prose-level revisions captured from FigJam round-trip passes
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
- The fake footer text `AUTOSAVE ON` / `QUICK SAVE F5` has been removed.
- Footer status is now just the save/timestamp block plus the version block.

### FigJam round-trip workflow

The story graph can be loaded into a FigJam board for visual editing and round-tripped back to Twee via Claude interpretation.

- Local sync server lives in `twine-mcp-server/src/figjam-sync/`. Start with `node dist/figjam-sync/index.js` (built) — binds `http://127.0.0.1:4747`. Claude manages this process per the terminal-management memory; don't run it manually.
- Figma desktop plugin lives in `figjam-sync-plugin/` (dev plugin, import the manifest).
- **Load story**: plugin fetches `/story-graph.json` and lays out beats, sections, sticky-per-scene, classified connectors, header frame with legend, Act 1 TODO.
- **Export board**: plugin walks nodes, POSTs to `/board.json`. Lands at `sizzle/.figjam/board-latest.json` (gitignored). Then say "interpret the latest board export" and Claude diffs against current Twee and proposes patches.
- Sticky text uses arrow markers (`→ "Morning."`) for wiki-link choices so player choices are visually distinct.
- Convention: stickies the plugin created carry `setPluginData("namespace") = "sizzle-story-sync"`; user-added stickies/connectors have no plugin data and export as concept items.

## Art Assets Already Added

Robert Flett assets now exist in `media/characters/`:

- `robert-flett-diner-entry.png`
- `robert-flett-reference-sheet.png`

`robert-flett-diner-entry.png` is used at the top of `INTRO-110 Robert arrives`.

Avatar art in `media/avatar/` is still placeholder-only. Current candidate body layers, clothing-mask experiments, and workflow outputs live under `docs/avatar-bakeoff/production-drafts/` until explicitly promoted. The next clothing edit test should use `C:\Users\Oculus\Documents\ComfyUI\input\sizzle_alex_noface_blank_padded_576x1536.png` rather than the older hair/underwear source.

## Known Gaps

- `CC-400 Incident` is still placeholder text with no real incident options yet. `$player.incitingIncident` exists as a variable; `INTRO-101 Lost in thought` interpolates it (falling back to "the incident") so the prose works either way.
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
4. `sizzle/docs/NPC-handler.md`
5. `sizzle/docs/STORY-TAGS.md`
6. `sizzle/docs/WRITING-TODOS.md` (open prose-level concerns)
7. `sizzle/docs/AVATAR-RESEARCH.md` (if avatar work is on the table)
