# Sizzle — Claude Design Brief

Use this as the initial prompt when starting a Claude Design project for Sizzle. Copy everything below the line into Claude Design.

---

## Goal

Design the UI for **Sizzle**, an adult interactive fiction game built with SugarCube (Twine). The game is set in Toronto in 2005/2006. The player is a female government agent going undercover at an exclusive swingers club called Sizzle on Queen Street West. The tone is classy thriller fiction — think literate spy novel meets unapologetic erotica. The setting is grounded and realistic with hidden supernatural elements.

I need a complete visual design for the game's HTML interface, which will be implemented as CSS stylesheets applied to a SugarCube game. The output should be a design system and screen designs that can be handed off to Claude Code for implementation.

## Layout Structure

The game uses a fixed HTML layout (SugarCube's StoryInterface). The structure is:

```
┌─────────────────────────────────────────────┐
│ HEADER BAR                                  │
│ [Logo/Menu] [< >] [Turn Avatar] [Character] │
│                   [Saves] [Settings]        │
├──────────────┬──────────────────────────────┤
│              │                              │
│  AVATAR      │  PASSAGE CONTENT             │
│  PANEL       │  (main text area)            │
│  (left side) │                              │
│              │  - narrative text             │
│  Layered     │  - dialogue                  │
│  character   │  - choices/links             │
│  portrait    │  - location/time header      │
│              │                              │
│              │                              │
├──────────────┴──────────────────────────────┤
│ FOOTER (minimal)                            │
└─────────────────────────────────────────────┘
```

The avatar panel can be hidden on certain screens (main menu, character creation). On those screens, the passage content takes the full width.

## Screens to Design

1. **Main Menu** — Title screen. "Sizzle" title, "Toronto, 2005" subtitle, "New Game" button. Should feel like the cover of a novel or a moody movie poster. The avatar panel is hidden here.

2. **Character Creation (5 screens)** — Personnel File (name entry), Appearance (option grids for skin tone, hair, eyes), Background (pre-Branch career options), The Incident (placeholder), Personnel Summary (table). Avatar panel hidden. These should feel like government dossier forms — clean, institutional, but with a hint of the game's warmth underneath.

3. **In-Game Passage** — The main gameplay view. Location/time header bar at the top of the passage area. Narrative text body. Dialogue blocks (speaker name + quoted text). Choice links at the bottom. Avatar visible on the left. This is where the player spends 90% of their time — it needs to be highly readable and atmospheric.

4. **Character Sheet Dialog** — A modal/overlay showing the player's stats, skills, cover identity, operation status, traits, journal. Triggered from the header.

5. **Notification Toasts** — Small temporary messages that appear after actions ("You arrived at Queen West", "Composure check: passed").

## Audience

Adults (18+) who enjoy interactive fiction, visual novels, and narrative games. Players who appreciate good writing, atmospheric design, and erotic content that's integrated with story rather than separated from it.

## Visual Direction

### Color Palette
- **Base:** Deep charcoal to near-black. Not navy — warmer than that. The feeling of a dimly lit club interior.
- **Primary accent:** Rich, warm red — like the red panels on the Sizzle building exterior (see reference image). Not bright or aggressive. Think velvet, brick, wine.
- **Secondary accent:** Muted gold or brass. Used sparingly for highlights, labels, interactive elements. Not the bright yellow of the current template.
- **Text:** Off-white or warm cream for body text. Not pure white. Easy on the eyes for long reading sessions.
- **Dialogue/UI:** Subtle warm grays for borders, table rows, secondary elements.

### Typography
- **Headers:** An elegant serif with character. Something that could work on a cocktail menu or a literary novel cover. Not overly decorative — sophisticated.
- **Body text:** A clean, highly readable serif or sans-serif. This is a reading-heavy game — typography must be comfortable for long passages. Good line height, appropriate measure.
- **UI elements:** Clean sans-serif for buttons, labels, navigation, stats.
- **The "Sizzle" title:** Should have its own treatment — cursive/script that echoes the neon sign on the building. Warm, inviting, slightly dangerous.

### Mood & References
- The feeling of walking into a sophisticated club at night — warm lighting, dark walls, the sense that interesting things happen here
- 2005 aesthetic — not retro-styled, but avoiding anything that feels post-2010 (no flat design extremes, no Material Design, no rounded-everything modern trends)
- The exterior of the building: Victorian-era brick, warm uplighting, red accents, the "Sizzle" cursive neon — this is the visual anchor
- Think: the UI of a quality visual novel crossed with the atmosphere of a noir film crossed with the warmth of a cocktail bar

### What to Avoid
- Generic dark-mode game template look
- Bright, saturated colors (especially pure yellow, blue, green)
- Anything that feels clinical, cold, or tech-startup
- Overly ornate or fantasy-game decoration
- Anything that screams "this is a porn game" — the sophistication is the point

## Reference Image

The club's exterior (I will upload this image): A Victorian-era corner building on Queen Street West. Heritage brick with arched windows and a turret. Warm uplighting on the facade. Red and white panels on the ground floor. "Sizzle" in cursive neon above the entrance. Photographed at night. This building IS the visual identity of the game.

## Technical Constraints

- This is an HTML/CSS game rendered in a browser. All designs must be implementable with CSS (no canvas rendering, no WebGL).
- Fonts must be web-safe or embeddable via @font-face (the game runs offline as a single HTML file, so Google Fonts CDN won't work — fonts need to be bundled or web-safe).
- The avatar panel displays layered PNG images (transparent overlays composited via CSS absolute positioning). The design needs to accommodate this without breaking the layer system.
- The game needs to be readable and functional at multiple text sizes (XS through XL) and avatar sizes (XXS through XXL).
- Responsive: should work reasonably on both desktop and tablet. Mobile is a secondary concern.

## Handoff

When the design is ready, please package it as a handoff for Claude Code. I'll be implementing the designs as CSS files in a SugarCube game project. The key files to produce specs for:

- `reset.css` — base resets and SugarCube default overrides
- `layout.css` — game structure, header, flexbox layout, avatar panel
- `avatar.css` — avatar container and layer stacking
- `passages.css` — passage containers, text styling, dialogue, choice links
- `character-creator.css` — creation flow options and inputs
- `notifications.css` — toast notifications
- `tables.css` — character sheet tables, stats display
- `icons.css` — UI icon styling

Include: color values, font specifications, spacing values, border treatments, hover/active states for interactive elements, and any transitions or subtle animations.
