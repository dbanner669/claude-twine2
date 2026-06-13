# Sizzle

For agent handoff, read `AGENTS.md` first. This file remains the broader project and design-system guide.

## Overview

An adult interactive fiction game built on the SugarCube Avatar Template. Set in Toronto, 2005/2006. The player is a woman recruited by a secret federal agency ("the Branch") to infiltrate an exclusive swingers club called Sizzle on Queen Street West. Something is happening beneath the surface — something the Branch classifies as "not yet scientifically explained" (NYSE, pronounced "nigh-see").

## Genre

Infiltration (spine) with investigation, social/relationship, and survival elements. Grounded realism in a world with hidden supernatural elements (mind control adjacent). Unapologetically erotic — sex scenes should have heat. Characters are real people, the world is plausible, story is king. Porn and plot are not in conflict.

## Setting

- **City:** Toronto, Ontario, Canada
- **Era:** September 2005 onward (pre-smartphone, pre-condo-boom Queen West)
- **Key location:** Sizzle — a members-only swingers club on West Queen West (inspired by the real club WICKED)

## Project Structure

```
sizzle/
├── src/
│   ├── story/       System passages (StoryInit, interface, variables)
│   ├── widgets/     Reusable widgets (avatar, clothing, expressions, etc.)
│   ├── scripts/     JavaScript (preload, macros, events, avatar, index, ui-scale)
│   ├── styles/      CSS (8 files — design tokens through icons)
│   └── content/     All playable passage content
├── fonts/           WOFF2 web fonts (Allura, Cormorant Garamond, EB Garamond, Inter, JetBrains Mono)
├── media/
│   ├── avatar/      Avatar layer images (body, clothing, expressions, etc.)
│   ├── characters/  Character stills and reference sheets
│   ├── locations/   Location images (building exteriors, interiors)
│   └── ui/          UI images (icons, logos)
├── docs/
│   ├── GDD.md                 Game Design Document (comprehensive)
│   ├── STORY-TAGS.md          Narrative tag, quirk, and kink tracking reference
│   ├── CLAUDE-DESIGN-BRIEF.md Claude Design prompt used to create the visual system
│   ├── NPC-handler.md         Robert Flett — the player's Branch handler
│   ├── GREYBOX-WRITING.md     Writing checklist for prologue + briefing scope
│   ├── GREYBOX-ART.md         Art asset checklist for prologue + briefing scope
│   ├── WRITING-TODOS.md       Open prose-level revisions (FigJam round-trip output)
│   ├── AVATAR-RESEARCH.md     Offline image-gen stack research (Codex deliverable)
│   ├── avatar-bakeoff/        Bakeoff workflows, STATUS, OPTION-2 asset plan, baseline-inputs/ (start at STATUS.md)
│   ├── STYLE-GUIDE.md         Comprehensive writing style guide (voice, mechanics, AI-pitfall watchlist) — source of truth for prose
│   ├── EDITORIAL-SWEEP.md     Process template for running a style-guide audit against existing prose (Stage 0–4 workflow)
│   ├── STYLE-AUDIT-YYYY-MM-DD.md  Per-sweep audit reports (first: STYLE-AUDIT-2026-05-26.md against the greybox)
│   ├── WRITING.md             Slim index + current writing scope (points at STYLE-GUIDE.md)
│   ├── UI-TODOS.md            Deferred interface/accessibility follow-up list
│   └── ART.md                 Slim index + current art scope
├── build/           Tweego compilation scripts
├── AGENTS.md        Agent handoff guide
└── CLAUDE.md        This file
```

## Tech Stack

- **Story format:** SugarCube v2.37.3
- **Compiler:** Tweego (located at `_tools/tweego/`)
- **Template:** Based on `twine-sugarcube-template/` in this repo
- **MCP Server:** Available at `twine-mcp-server/` for programmatic story manipulation
- **Story-graph round-trip (primary):** Obsidian Canvas vault at `sizzle/.obsidian-vault/`. Generator script `sizzle/scripts/build-obsidian-canvas.js` writes shadow MD per passage + `story.canvas`; sync-back `sizzle/scripts/build-twee-from-vault.js` (dry-run / `--apply`) writes edits back to `.twee` byte-stably. Obsidian plugin `obsidian-sizzle-plugin/` wraps the scripts and runs a continuous lint pipeline (9 rules: broken refs, unclosed macros, dup passages, orphan passages, undeclared vars, editorial notes + malformed, tag coherence, word count). See `obsidian-sizzle-plugin/README.md` for details.
- **FigJam round-trip (legacy):** `twine-mcp-server/src/figjam-sync/` (local HTTP service on `:4747`) + `figjam-sync-plugin/` (Figma desktop dev plugin). Replaced by the Obsidian path for routine editing; kept for collaborative whiteboarding.

## Design System

### CSS Architecture

Eight stylesheet files in `src/styles/`, loaded in order:

| File | Purpose |
|------|---------|
| `reset.css` | Design tokens (`:root` custom properties), fixed-proportion stage tokens, `@font-face`, base resets, SugarCube overrides |
| `layout.css` | Fixed-proportion stage (`#game` as a scaled 1920×992 canvas), CSS Grid scaffold, screen mode switching, header/footer, atmosphere overlays |
| `avatar.css` | Layered PNG composite, avatar meta block, composure pips |
| `passages.css` | Prose typography, dialogue, choice links, main menu, buttons |
| `character-creator.css` | Dossier creation flow — tabs, option grids, background cards |
| `notifications.css` | Toast system (info/success/warn/hot) |
| `tables.css` | Dossier tables, stat bars, trait cards, journal entries, character sheet dialog |
| `icons.css` | Unicode glyph icon system with tinting variants |

### Design Tokens

All tokens are prefixed `--sz-` and defined on `:root` in `reset.css`:

- **Colors:** `--sz-ink-*` (dark backgrounds), `--sz-cream` / `--sz-cream-dim` (text), `--sz-brass` / `--sz-brass-dim` / `--sz-brass-glow` (accent gold), `--sz-brick` / `--sz-brick-glow` (accent red), `--sz-burgundy` (deep red)
- **Typography:** `--sz-f-body` (EB Garamond), `--sz-f-display` (Cormorant Garamond), `--sz-f-ui` (Inter), `--sz-f-script` (Allura), `--sz-f-mono` (JetBrains Mono)
- **Text sizes:** `--sz-text-xs` through `--sz-text-xl`
- **Spacing, borders, shadows, radius:** `--sz-space-*`, `--sz-border-*`, `--sz-shadow-*`, `--sz-radius-*`
- **Stage scaling:** `--sz-stage-w` / `--sz-stage-h` (the 1920×992 design canvas), `--sz-scale` (uniform fit factor), `--zoom` (browser-zoom factor; see Fixed-Proportion Stage below)

### Fixed-Proportion Stage

The entire UI renders on a fixed **1920×992 design canvas** (`#game`), centered and uniformly scaled to fit the window via `transform: scale(var(--sz-scale))`. Relative proportions of the header, avatar column, passage area, and footer never drift with window size. The window is filled as far as the aspect ratio allows; the remainder is solid bars (the page backdrop, `--sz-ink-deep`):

- Window **wider** than ~1.935:1 → pillarbox bars left and right.
- Window **taller** → letterbox bars top and bottom.

`src/scripts/ui-scale.js` keeps two `:root` custom properties current:

| Property | Driven by | Effect |
|----------|-----------|--------|
| `--sz-scale` | window size — `min(innerW/1920, innerH/992)` | scales the whole stage to fit; updated on resize/load/observer |
| `--zoom` | `devicePixelRatio` relative to first load | **browser zoom is the one exception to "everything scales together"** — `--zoom` multiplies into the text-size tokens only, so Ctrl +/− resizes reading text inside the unmoving frame |

A pure-CSS `min()` fallback on `--sz-scale` keeps the stage sized before the script runs. Known caveat: moving the window between monitors of different DPI reads as zoom (DPR-based detection). Body-level fixed elements (glossary tooltip overlay, toasts, atmosphere overlays) stay viewport-anchored rather than scaling with the stage — they live on `<body>`, outside the transformed canvas.

### Screen Modes

The `data-screen` attribute on `#game` switches layout between three modes, driven by passage tags set in `events.js`:

| Tag | `data-screen` | Layout |
|-----|---------------|--------|
| `avatar-hidden` | `menu` | Single column, avatar hidden (main menu, system screens) |
| `character-creation` | `creation` | Single column, avatar hidden (dossier creation flow) |
| *(none)* | `scene` | Two columns — avatar + passage (default gameplay) |

If a passage has both `character-creation` and `avatar-hidden`, creation mode should win.

### Day/Night Mode

The game has two visual palettes: **night** (default, warm charcoal) and **day** (sunlit parchment). CSS custom properties on `:root` swap automatically via `body[data-mode="day"]` overrides in `reset.css`. Atmosphere overlays (vignette, grain) also adapt in `layout.css`.

Mode is set per-passage by `events.js`:

| Passage tag | Effect |
|-------------|--------|
| `daytime` | Forces day mode regardless of `$date.slot` |
| `nighttime` | Forces night mode regardless of `$date.slot` |
| `history-root` | Disables the header back arrow on story boundary passages, e.g. the first assignment card after character creation |
| *(neither)* | Auto-detect: `earlyMorning`, `morning`, `noon`, `afternoon` = day; `evening`, `night`, `laterNight` = night |

### Time Helpers

Time uses a canonical `$date.slot` instead of clock minutes. JS-backed SugarCube helpers in `src/scripts/macros.js` drive it — do not hand-edit `$date` fields in passages:

| Helper | Purpose |
|--------|---------|
| `<<setTime "evening">>` | Set only `$date.slot` |
| `<<setDate 2005 9 12 "morning">>` | Set full date plus slot |
| `<<advanceTime>>` / `<<advanceTime 2>>` | Advance one or more slots, rolling `laterNight` into the next day |
| `<<advanceDays 1 "morning">>` | Advance calendar days and reset the slot |

These live in `src/scripts/macros.js`, backed by shared helpers (`sizzleFormatDate` / `sizzleFormatSlot`, exposed on the `setup` namespace as `setup.formatDate` / `setup.formatSlot`, plus `sizzleSetSlot`, `sizzleSetFullDate`, `sizzleAdvanceSlot`, and `sizzleAdvanceDays`). `$date.dayOfWeek` is recomputed from the calendar date on every change. Scene-entry passages use explicit `<<setDate ...>>` or `<<setTime ...>>`; routine player actions use `<<advanceTime>>`. Crossing into a new calendar day — via `<<advanceTime>>` rollover or `<<advanceDays>>` — resets Current Composure to Baseline; explicit `<<setDate>>` / `<<setTime>>` do not.

### Avatar Visibility & Header Bar

The in-passage header bar is rendered by the `<<header>>` widget. Set these variables before calling:

- `$header.location` — uppercase location text (e.g., "Diner, Bank Street, Ottawa")
- `$header.time` — italic time display (e.g., "Monday morning")
- `$header.status` — optional status badge override. If unset, the badge derives from Current Composure.
- `$header.weather` — optional weather text

Default header status mapping:

| Current Composure | Badge | Color |
|-------------------|-------|-------|
| 0 or lower | `RATTLED` | Red |
| 1 | `SHAKEN` | Orange |
| 2-4 | `STEADY` | Green |
| 5-6 | `COOL & COLLECTED` | Blue |
| 7 or higher | `ICE VEINS` | Dark blue |

The avatar panel (left column) shows automatically on `scene` mode passages. The dotted avatar frame is centered within the flexible space above the metadata block; the `AvatarMeta` passage (in `caption.twee`) renders the bottom-anchored identity block and composure bar via `data-passage` attribute. The Settings dialog currently exposes only live controls: `Avatar Visible` remains available, while inactive `Avatar Size` and `Text Size` controls stay hidden. Reading-size is handled by browser zoom against the fixed-proportion stage (the `--zoom` mechanism above resizes text inside the unmoving frame), so a dedicated `Text Size` control is lower priority; the `.text-*` classes still exist if it is wired later.

The `FooterStatus` passage renders the current in-game date/time as `Month D, YYYY · Slot` from `$date`. The fake autosave/quicksave helper text and misleading `SAVED` label have been removed from the UI.

The footer version label is currently hard-coded in `src/story/interface.twee` as `v 0.1.0`. Treat it as a greybox build label until a real release/versioning policy exists.

### Glossary Terms

Hover glossary terms use explicit widget markup rather than automatic text replacement.

- Definitions live in `setup.glossary` in `variables.twee`
- Terms render through `<<term "KEYWORD">>` in `widgets/parsers.twee`
- Tooltip styling lives in `passages.css`

Current live glossary term:

- `NYSE` -> `Not Yet Scientifically Explained`

### Fonts

Five families, eight WOFF2 files in `fonts/`, loaded via `@font-face` in `reset.css`:

| Family | Weight/Style | Role |
|--------|-------------|------|
| Allura | Regular | Script/signature text |
| Cormorant Garamond | Regular, Italic | Display headings |
| EB Garamond | Regular, Italic | Body prose |
| Inter | Regular (400), Medium (500) | UI text, labels |
| JetBrains Mono | Regular | Monospace, code, stamps |

### Choice Link Pattern

Passage choice links use `.choices .choice` and auto-detected `.link-internal[data-passage]`:
- Brass italic text with em-dash (`::before`) and chevron (`::after`)
- Hover: shifts right (`padding-left: 28px`), glows brick (`--sz-brick-glow`)
- Already-visited choices get `.greyedOut` class

## Build

```bash
# From repo root (Windows):
$env:TWEEGO_PATH = "_tools/tweego/storyformats"
& _tools/tweego/tweego.exe -o sizzle/output.html sizzle/src/

# Or use the build script:
cd sizzle/build
compile.bat
```

## Passage Naming

Follows PREFIX-NUMBER convention from the template:

| Prefix | Domain |
|--------|--------|
| `CC` | Character Creation |
| `INTRO` | Introduction / briefing |
| `QW` | Queen West (street/neighborhood) |
| `SZ` | Sizzle (inside the club) |
| `BRANCH` | Branch HQ / handler meetings |
| `NPC` | NPC-specific interaction scenes |
| `APT` | Player's apartment / safe house |

## Skills

| Skill | Description |
|-------|-------------|
| Academic | Research, analysis, institutional knowledge |
| Agent | Tradecraft, surveillance, operational procedure |
| Athlete | Physical fitness, endurance, reflexes |
| Confrontation | Physical and psychological intimidation, standing your ground |
| Charmer | Social manipulation, persuasion, seduction, reading people |
| Streetwise | Street smarts, criminal knowledge, reading situations |
| Composure | Emotional control, resisting influence, maintaining cover (key NYSE defense). Split into durable Baseline Composure and volatile Current Composure for live checks/status. |
| Sexology | Knowledge of sexual culture, practices, etiquette, terminology (key Sizzle skill) |

## Key Variables

### Player
- `$player.background` — pre-Branch background (government or civilian)
- `$player.incitingIncident` — why the Branch recruited her
- `$player.cover` — cover identity used inside Sizzle (set in-story, not during creation)
- `$player.codename` — Branch operational codename
- `$player.arousal` — current arousal level (0-3)
- `$player.storyTags` — array of persistent narrative flags used for later story checks
- `$player.statusEffects` — array of active temporary modifiers (supports multiple)
- `$player.kinks` — array of preferences (accumulated during play)
- `$player.quirks` — array of personality traits (supports multiple)
- `$player.baselineComposure` — durable composure value established during character creation
- `$player.currentComposure` — volatile composure value used for live composure checks and avatar pips
- `$player.flags` — namespace for one-shot boolean guard latches; ensures a skill grant / event fires exactly once even if its passage is re-entered as a fresh moment (e.g. `$player.flags.blkSkillGranted`)

### Sizzle
- `$sizzle.suspicion` — how suspicious the club is of the player
- `$sizzle.accessLevel` — depth of access (0-3)
- `$sizzle.reputation` — social standing at Sizzle

### NYSE (hidden from player)
- `$nyse.influence` — how affected by NYSE phenomena (goes up/down, no natural decay)
- `$nyse.power` — player's developing abilities (dormant early game)

### World
- `$date` — in-game date/time tracking (starts September 12, 2005, morning). Fields: `year`, `month`, `day`, `dayOfWeek`, `slot`.

Current time slots are `earlyMorning`, `morning`, `noon`, `afternoon`, `evening`, `night`, and `laterNight`. Labels live in `setup.timeSlotLabels`; day/night palette auto-detection uses `setup.dayModeSlots`.

## SugarCube Gotchas (Read Before Editing)

These are hard-won lessons. A new agent MUST know these to avoid wasting time on patterns that don't work.

### 1. Macros do NOT evaluate inside HTML attribute values

```twee
/* BROKEN — renders the literal text "<<print _cls>>" as the class name */
<div class="cc-tab <<print _cls>>">

/* WORKS — use <<print>> to output the entire element as a string */
<<print '<div class="' + _cls + '">' + _content + '</div>'>>
```

This applies to `<<print>>`, `<<if>>`, `<<set>>` — any macro placed inside an HTML tag's attribute.

### 2. Use CSS `:has()` for dynamic styling instead of dynamic classes

Since you can't put `<<if>>` inside a `class=""` attribute, use hidden marker spans and CSS `:has()`:

```twee
/* In the passage: */
<div class="cc-option">
  <<if $player.complexion eq "light">><span class="is-selected"></span><</if>>
  /* ... option content ... */
</div>

/* In CSS: */
.cc-option:has(.is-selected) { border-color: var(--sz-brick); }
.cc-option .is-selected { display: none; }
```

### 3. Split widgets don't work

Opening a `<div>` in one widget and closing it in another fails — the browser auto-closes unclosed tags at widget boundaries. Keep all HTML balanced within each widget. If you need a wrapper div around widget content, put it directly in the passage.

### 4. Use `nobr` passage tag for structural HTML

Without `nobr`, SugarCube converts blank lines between macros/HTML to `<br>` tags, breaking layout. Add `nobr` to the tag list of any passage with complex HTML structure (character creation, UI-heavy passages).

### 5. Baseline vs Current Composure

Skills start at level 0. During character creation, `$player.skills.composure.level` is copied into `$player.baselineComposure`, and `$player.currentComposure` starts at that baseline.

Live checks and avatar pips should read Current Composure:
```
<<set _checkSkill to (typeof $player.currentComposure === "number") ? $player.currentComposure : $player.skills.composure.level>>
```

Use the helper macros instead of hand-editing the fields:

| Macro | Effect |
|-------|--------|
| `<<resetComposure>>` | Set Current Composure back to Baseline Composure |
| `<<setCurrentComposure 2>>` | Set Current Composure directly, clamped to the configured range |
| `<<adjustComposure -1>>` | Nudge Current Composure up or down, clamped to the configured range |

The header status badge derives from Current Composure unless `$header.status` is explicitly set for a passage-specific override.

### 6. Player-facing rolls use `<<skillCheck>>`

Use `<<skillCheck>>` for visible checks. It renders a roll panel, waits for the player to click the roll button, animates the dice, settles on the final total, then reveals only the success or failure payload. Put any post-check continuation links inside both result branches so the player cannot skip the roll.

```twee
<<skillCheck "Composure" "2d6" _checkSkill 8>>
<<success>>
Success text and onward links.
<<failure>>
Failure text and onward links.
<</skillCheck>>
```

`<<rollDice>>` remains available as a low-level instant roller, but it should not be used for player-facing checks unless there is a specific reason to hide the roll interaction.

## Current Project Status

### What's built and working
- **Main menu** — centered title page with night mode, single "Begin" link
- **Character creation (5 steps)** — full dossier-style flow with tab strip, option grids with `:has()` selection, background cards, redacted incident placeholder, summary table, signature block, and background-selection guardrails
- **Derived-state rebuilds** — `CC-500` recalculates skill bonuses and background-derived story tags from scratch on revisit instead of stacking
- **Briefing scene (INTRO-100 through INTRO-800)** — ~30 passages, complete prologue with branching dialogue, skill checks, background-specific variants
- **Glossary hover terms** — `<<term>>` widget and tooltip styling are live, currently used for `NYSE`
- **Robert briefing art** — `media/characters/robert-flett-diner-entry.png` is placed at the top of `INTRO-110`, with a matching reference sheet in `media/characters/robert-flett-reference-sheet.png`
- **Avatar panel** — placeholder frame, identity block (name/kicker), composure pip bar
- **Header bar** — location, time, Current Composure status badge, weather, guarded history arrows
- **Footer** — canonical date/time display from `$date` and hard-coded greybox version (`v 0.1.0`)
- **Day/night mode** — full CSS palette swap with atmosphere overlays
- **Time helpers** — `<<setTime>>` / `<<setDate>>` / `<<advanceTime>>` / `<<advanceDays>>` macros drive `$date`; the footer clock and day/night palette react automatically, and day-crossings reset Current Composure to Baseline
- **Day-mode header polish** — daytime header now uses the darker bronze-brown UI family instead of a lighter mismatched bar
- **UI design system** — 8 CSS files, 5 font families, complete token system
- **BLK inciting-incident flashback** — 26 passages (`BLK-085` through `BLK-215`), scene mode, avatar visible. Toronto Blackout origin sequence with four background variants, three skill checks, convergent choices, `$nyse.influence` grant (base +1 / climb +2 cap), skill grant (Composure / Academic / Streetwise by play pattern), and Branch report bridge to CC-500. CC-400 incident selection is wired for all four incidents. **Status: complete, pending first-play review.**
- **MAN inciting-incident flashback** — 24 passages (`MAN-085`–`MAN-205`), the Dark of Manitoulin origin sequence: lakehouse traversal, day→night flip at MAN-150, `$nyse.influence` +2/+3, set-once skill grant, Branch report bridge. Drafted and style-audited (`docs/STYLE-AUDIT-2026-06-01.md`). **Status: complete, pending first-play review.**
- **PALE inciting-incident flashback** — 21 passages (`PALE-085`–`PALE-205`), the Woman with the Pale Eyes origin sequence at the Château Laurier: single-location observation/stealth structure, night mode throughout, four skill checks, `$nyse.influence` +1/+2, set-once skill grant, Branch report bridge. Drafted and style-audited (`docs/STYLE-AUDIT-2026-06-12.md`). **Status: complete, pending first-play review.**
- **WDS inciting-incident flashback** — 21 passages (`WDS-085`–`WDS-205`), the Wet Dog Smell origin sequence: roadside-motel contamination event, deep-night palette throughout, four skill checks, `$nyse.influence` +2/+3 (highest of the four), set-once skill grant, Branch report bridge. Drafted and style-audited (`docs/STYLE-AUDIT-2026-06-13.md`). **Status: complete, pending first-play review.**

### What's placeholder / not yet built
- **Avatar art/runtime** — `media/avatar/` remains placeholder-only and the runtime image arrays still need the explicit-slot implementation. Current candidate body layers, clothing-mask experiments, Qwen 2509 clothing-fit tests, and workflow outputs live under `docs/avatar-bakeoff/production-drafts/`; the greybox avatar proof is locked to medium skin, long straight hair, and blue eyes. Clothing tests are still draft-only, but Qwen Image Edit 2509 is the current leading route because it can adapt generated garment references to the noface source body.
- **Hair style swatches** — show dark rectangles (no art yet)
- **Location/background art** — still sparse; only a small number of location/character images exist so far
- **NPC roster** — only Robert Flett is profiled
- **Act 1 content** — INTRO-800 is "End of Prologue" — no gameplay content beyond the briefing
- **WRITING.md and ART.md** — intentionally slim index docs that point at the meatier resources (STYLE-GUIDE.md for writing, the bakeoff docs for art). Not aspiring to be full production trackers.

## Writing Conventions

**Source of truth: [docs/STYLE-GUIDE.md](docs/STYLE-GUIDE.md).** Read it before writing or revising any prose. The bullets below are quick-reference only — if anything here conflicts with STYLE-GUIDE.md, the style guide wins.

- **Passage length: 80–120 visible words target, 200 hard ceiling.** The player should never have to scroll. One beat per passage. Conditional variants count the longest single render, not the total source.
- **Link text rules:** Complete sentence, always. Three valid forms: (1) player character dialogue, (2) narration, (3) `Continue`. Never NPC dialogue.
- The Branch never reaches for "supernatural" / "magic" / "paranormal" — only NYSE ("nigh-see"), "anomalous," "atypical." The dramatic irony is that NYSE is supernatural; the institutional vocabulary refuses to say so.
- The Branch has verisimilitude: mundane bureaucracy crossed with CSIS-level secrecy and professionalism.
- Toronto / Ottawa locations: real, period-accurate to 2005/2006. No smartphones, no post-2006 cultural refs.
- Métis (heritage) and Shield country (geography) are distinct — don't conflate.
- All characters are grounded, fully realized people — no caricatures.
- Writing style: literate erotic thriller. Observant, specific, trusts the reader.
- Erotic content: vivid, physical, written to arouse. Heat is required. Earned heat is hotter.
- The player character is female, always referred to with she/her pronouns.
- Cover identity is central — NPCs at Sizzle don't know the real player.
- Player character has been at the Branch for two years at game start — trained, not a rookie.
