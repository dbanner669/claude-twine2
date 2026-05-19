# Architecture

## Overview

This template implements a SugarCube 2.x game with a layered avatar system, character creation, and modular widget architecture. It's designed for narrative games where the player character has a visual representation that changes based on clothing, expressions, and scene context.

## System Passages

SugarCube reserves certain passage names for special purposes:

| Passage | File | Purpose |
|---------|------|---------|
| `StoryData` | `story/init.twee` | Twee 3 metadata (IFID, format version) |
| `StoryTitle` | `story/init.twee` | Game title displayed in the browser tab |
| `StoryInit` | `story/init.twee` | Runs once on new game. Initializes all state. |
| `StoryInterface` | `story/interface.twee` | Custom HTML layout replacing SugarCube's default |
| `StoryCaption` | `story/caption.twee` | Rendered inside `#avatar-container` every passage |
| `PassageDone` | `story/done.twee` | Runs after every passage. Shows notifications. |
| `variables` | `story/variables.twee` | Included by StoryInit. All state initialization. |

## Directory Layout

```
src/
  story/      System passages and state initialization
  widgets/    Reusable macro-like passage widgets (tagged [widget])
  scripts/    JavaScript files (compiled as story scripts)
  styles/     CSS files (compiled as story stylesheets)
  content/    Playable passage content
```

## Widget Organization

All widget passages are tagged `[widget]`. Each file groups related widgets:

- **avatar.twee** - Core avatar rendering and layer manipulation
- **expressions.twee** - Facial expression emotes (smile, frown, etc.)
- **clothing.twee** - Wear/remove clothing pattern with slot management
- **character-sheet.twee** - Character profile dialog widget
- **notifications.twee** - Toast notification system
- **parsers.twee** - Dynamic text output (names, factions, pronouns)
- **ui.twee** - Header bar, icons, utility widgets

## Script Roles

| Script | Purpose |
|--------|---------|
| `index.js` | Menu initialization, click handlers for header UI |
| `avatar.js` | Settings registration (avatar size, text size, visibility) |
| `macros.js` | Custom macros: `<<page>>`, `<<first>>`, `<<rollDice>>` |
| `events.js` | Passage lifecycle event handlers |
| `preload.js` | Image preloading utility |

## CSS Organization

Each CSS file handles one concern. Load order matters for specificity:

1. `reset.css` - Hides SugarCube defaults, base styles
2. `layout.css` - Game structure, header, flexbox layout
3. `avatar.css` - Avatar container and layer stacking
4. `passages.css` - Page containers, text, decision links
5. `character-creator.css` - Creation flow options and inputs
6. `notifications.css` - Toast notifications
7. `tables.css` - Character sheet tables and badges
8. `icons.css` - UI icon placeholders

## Data Flow

```
StoryInit
  └─ <<include "variables">>
       └─ Sets: $avatar, $player, $ui, $header, $temp,
                $imagePath, $notifications, $statistics

Per-passage:
  1. :passageinit → events.js resets $temp
  2. Passage renders → widgets set $header, $avatar layers
  3. PassageDone → <<showNotifications>> displays and clears alerts
  4. StoryCaption → <<avatar>> re-renders the avatar layers
```
