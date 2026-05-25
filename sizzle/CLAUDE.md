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
│   ├── scripts/     JavaScript (macros, events, settings, menus)
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
│   ├── WRITING.md             Top-level writing doc pointer
│   └── ART.md                 Top-level art doc pointer
├── build/           Tweego compilation scripts
├── AGENTS.md        Agent handoff guide
└── CLAUDE.md        This file
```

## Tech Stack

- **Story format:** SugarCube v2.37.3
- **Compiler:** Tweego (located at `_tools/tweego/`)
- **Template:** Based on `twine-sugarcube-template/` in this repo
- **MCP Server:** Available at `twine-mcp-server/` for programmatic story manipulation
- **FigJam round-trip:** `twine-mcp-server/src/figjam-sync/` (local HTTP service on `:4747`) + `figjam-sync-plugin/` (Figma desktop dev plugin). Load the story graph into a FigJam board, edit visually, click Export, then ask Claude to interpret `sizzle/.figjam/board-latest.json` against current Twee.

## Design System

### CSS Architecture

Eight stylesheet files in `src/styles/`, loaded in order:

| File | Purpose |
|------|---------|
| `reset.css` | Design tokens (`:root` custom properties), `@font-face`, base resets, SugarCube overrides |
| `layout.css` | CSS Grid scaffold for `#game`, screen mode switching, header/footer, atmosphere overlays |
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
| `daytime` | Forces day mode regardless of `$date.hour` |
| `nighttime` | Forces night mode regardless of `$date.hour` |
| *(neither)* | Auto-detect: hour 6–17 = day, 18–5 = night |

### Avatar Visibility & Header Bar

The in-passage header bar is rendered by the `<<header>>` widget. Set these variables before calling:

- `$header.location` — uppercase location text (e.g., "Diner, Bank Street, Ottawa")
- `$header.time` — italic time display (e.g., "Monday morning")
- `$header.status` — status badge text (defaults to "COMPOSED" if not set)
- `$header.weather` — optional weather text

The avatar panel (left column) shows automatically on `scene` mode passages. The `AvatarMeta` passage (in `caption.twee`) renders the identity block and composure bar via `data-passage` attribute. The `FooterStatus` passage renders the save/time display in the footer. The fake autosave/quicksave helper text has been removed from the UI.

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
| Composure | Emotional control, resisting influence, maintaining cover (key NYSE defense) |
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

### Sizzle
- `$sizzle.suspicion` — how suspicious the club is of the player
- `$sizzle.accessLevel` — depth of access (0-3)
- `$sizzle.reputation` — social standing at Sizzle

### NYSE (hidden from player)
- `$nyse.influence` — how affected by NYSE phenomena (goes up/down, no natural decay)
- `$nyse.power` — player's developing abilities (dormant early game)

### World
- `$date` — in-game date/time tracking (starts September 2005)

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

### 5. Composure level calculation

Skills start at level -4. To display 0-based values (e.g., composure pips), use:
```
<<set _compLevel to Math.max(0, $player.skills.composure.level + 4)>>
```

## Current Project Status

### What's built and working
- **Main menu** — centered title page with night mode, single "Begin" link
- **Character creation (5 steps)** — full dossier-style flow with tab strip, option grids with `:has()` selection, background cards, redacted incident file, summary table, signature block, and background-selection guardrails
- **Derived-state rebuilds** — `CC-500` recalculates skill bonuses and background-derived story tags from scratch on revisit instead of stacking
- **Briefing scene (INTRO-100 through INTRO-800)** — ~30 passages, complete prologue with branching dialogue, skill checks, background-specific variants
- **Glossary hover terms** — `<<term>>` widget and tooltip styling are live, currently used for `NYSE`
- **Robert briefing art** — `media/characters/robert-flett-diner-entry.png` is placed at the top of `INTRO-110`, with a matching reference sheet in `media/characters/robert-flett-reference-sheet.png`
- **Avatar panel** — placeholder frame, identity block (name/kicker), composure pip bar
- **Header bar** — location, time, status badge, weather
- **Footer** — save timestamp and version
- **Day/night mode** — full CSS palette swap with atmosphere overlays
- **Day-mode header polish** — daytime header now uses the darker bronze-brown UI family instead of a lighter mismatched bar
- **UI design system** — 8 CSS files, 5 font families, complete token system

### What's placeholder / not yet built
- **Avatar art** — all image arrays are empty; placeholder frame shows "avatar layers" text
- **CC-400 inciting incidents** — placeholder text, no actual options
- **Hair style swatches** — show dark rectangles (no art yet)
- **Location/background art** — still sparse; only a small number of location/character images exist so far
- **NPC roster** — only Robert Flett is profiled
- **Act 1 content** — INTRO-800 is "End of Prologue" — no gameplay content beyond the briefing
- **WRITING.md and ART.md** — currently light-weight pointer docs, not full production trackers yet

## Writing Conventions

- **Passage length: 80-120 visible words max.** The player should never have to scroll. One beat per passage — a moment, a reaction, a short dialogue exchange. Break longer scenes into multiple click-through passages. This mirrors the style of Female Agent, where passages are typically 30-80 words. If a passage has conditional variants (background-specific text), count the longest variant, not the total source.
- **Link text rules:** Link text must always be a complete sentence. No single-word or fragment links embedded in prose. Links can be: (1) player character dialogue (`"What's the risk assessment?"`), (2) narration (`The weight of those words settles over the table.`), or (3) `Continue`. Links must never be dialogue from an NPC — if an NPC is speaking, put their line in the prose and use a narration link or `Continue` to advance.
- The Branch is never called "supernatural" — they use NYSE ("nigh-see"), "anomalous," "atypical"
- The Branch has verisimilitude: mundane bureaucracy crossed with CSIS-level secrecy and professionalism
- Toronto locations should be real and period-accurate to 2005/2006
- All characters are grounded, fully realized people — no caricatures
- Writing style: classy thriller fiction, literate, observant, trusts the reader
- Erotic content: vivid, physical, written to arouse. Heat is required. Earned heat is hotter.
- The player character is female, always referred to with she/her pronouns
- Cover identity is central — NPCs at Sizzle don't know the real player
- Player character has been at the Branch for two years at game start — trained, not a rookie
