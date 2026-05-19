# SugarCube Avatar Template

A reusable SugarCube 2.x game template with a layered avatar compositing system, character creation, custom macros, and modular architecture. Designed for narrative games with visual character representation.

## Features

- **6-layer avatar system** — background, body, modifications, underwear, clothing, foreground
- **Character creation flow** — name, appearance, faction selection with randomization
- **Custom macros** — `<<page>>`, `<<first>>`, `<<rollDice>>`
- **Widget architecture** — clothing wear/remove, expressions, notifications, parsers
- **Responsive layout** — header nav, avatar sidebar, mobile-friendly
- **Settings integration** — avatar size, text size, avatar visibility
- **Dark theme** — ready-to-use CSS with gold accent

## Quick Start

### Requirements

- [Tweego](https://www.motoslave.net/tweego/) (Twee compiler)
- [SugarCube 2.x](https://www.motoslave.net/sugarcube/2/) story format installed in Tweego

### Build

```batch
cd build
compile.bat
```

Or manually:

```bash
tweego -o output.html src/
```

Open `output.html` in your browser to play.

## Project Structure

```
src/
  story/      System passages (StoryInit, StoryInterface, etc.)
  widgets/    Reusable widget passages (avatar, clothing, expressions)
  scripts/    JavaScript (menus, settings, macros, events)
  styles/     CSS (layout, avatar, passages, notifications)
  content/    Playable content (main menu, character creator, demo)
build/        Tweego compilation scripts
template-docs/  Architecture and reference documentation
```

## Documentation

- [Architecture](template-docs/ARCHITECTURE.md) — system overview, data flow, file organization
- [Passage Naming](template-docs/PASSAGE-NAMING.md) — PREFIX-NUMBER convention
- [Avatar System](template-docs/AVATAR-SYSTEM.md) — layer stack, adding items, expressions
- [Variable Guide](template-docs/VARIABLE-GUIDE.md) — all state variables documented

## Customization

1. **Change the theme** — edit CSS custom properties in `styles/layout.css`
2. **Add clothing** — follow the wear/remove pattern in `widgets/clothing.twee`
3. **Add expressions** — add emote widgets in `widgets/expressions.twee`
4. **Add content** — create new `.twee` files in `content/` using PREFIX-NUMBER naming
5. **Change the player** — modify `$player` initialization in `story/variables.twee`

## License

MIT
