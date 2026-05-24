# Female Agent Project

## Overview

Three projects:
1. **twine-mcp-server/** — MCP server (Node.js/TypeScript) for programmatic Twine story interaction (32 tools)
2. **twine-sugarcube-template/** — Reusable SugarCube game template extracted from Female Agent
3. **sizzle/** — An adult interactive fiction game built on the SugarCube template. Start with `sizzle/AGENTS.md` for implementation handoff, then `sizzle/CLAUDE.md` for the broader project guide.

## Project Structure

```
Female Agent/
├── twine-mcp-server/          # MCP server source
│   ├── src/
│   │   ├── index.ts           # Entry point (stdio transport)
│   │   ├── tools.ts           # 24 core MCP tool registrations
│   │   ├── sugarcube-tools.ts # 8 SugarCube-specific tools
│   │   ├── store.ts           # In-memory story store + JSON persistence
│   │   ├── twine-parser.ts    # HTML/Twee parsing + export + link extraction
│   │   └── types.ts           # TwinePassage, TwineStory interfaces
│   ├── test/
│   │   ├── twine-parser.test.ts  # 21 parser tests
│   │   └── store.test.ts         # 29 store tests
│   └── vitest.config.ts
├── twine-sugarcube-template/  # Game template (Twee source)
│   ├── src/
│   │   ├── story/             # System passages (StoryInit, StoryInterface, etc.)
│   │   ├── widgets/           # Reusable widget passages (7 files)
│   │   ├── scripts/           # JavaScript (5 files)
│   │   ├── styles/            # CSS (8 files)
│   │   └── content/           # Example passages (3 files)
│   ├── build/                 # Tweego compilation scripts
│   └── template-docs/         # Architecture and reference documentation
├── sizzle/                    # Sizzle game project (active development)
│   ├── src/
│   │   ├── story/             # System passages (StoryInit, interface, variables, caption)
│   │   ├── widgets/           # Reusable widgets (7 files: avatar, clothing, expressions, etc.)
│   │   ├── scripts/           # JavaScript (5 files: macros, events, avatar, preload, index)
│   │   ├── styles/            # CSS (8 files: reset, layout, avatar, passages, character-creator, notifications, tables, icons)
│   │   └── content/           # Playable passages (main-menu, character-creator, briefing)
│   ├── fonts/                 # WOFF2 web fonts (5 families, 8 files)
│   ├── media/                 # Avatar layers, location images, UI assets
│   ├── docs/                  # GDD, design brief, NPC profiles, greybox checklists
│   ├── build/                 # Tweego compilation scripts
│   ├── AGENTS.md              # Game-specific implementation handoff (start here)
│   └── CLAUDE.md              # Broader project + design-system guide
├── _tools/tweego/             # Tweego compiler + story formats (gitignored)
├── Female_Agent_1.20.1P_offlin/  # Reference game (gitignored)
└── Twine-2.12.0-Windows.exe     # Twine app (gitignored)
```

## Tech Stack

- **Runtime:** Node.js 24.x
- **Language:** TypeScript 5.x
- **MCP SDK:** @modelcontextprotocol/sdk 1.12.0
- **HTML parsing:** cheerio 1.0.0
- **Testing:** vitest 2.1.8
- **Build:** tsc (TypeScript compiler)
- **Story format:** SugarCube v2.37.3
- **Compiler:** Tweego (in `_tools/tweego/`)

## Key Conventions

- Passage content is HTML-encoded in Twine HTML files; cheerio `.text()` handles decoding
- The game uses PREFIX-NUMBER naming (e.g., GNO-100, TNG-200)
- SugarCube link patterns handled: `[[]]`, `<<goto>>`, `<<goto $var>>`, `<<include>>`, `<<button>>`, `<<link>>`, `data-passage=`
- Wiki links with setter syntax `[[text|Target][$var to val]]` are supported (setter stripped from target)

## Workflow

Codex orchestrates. Codex (cc-codex-plugin:codex-agent) implements. Codex reviews.

## Commands

```bash
# MCP server
cd twine-mcp-server && npm install && npm run build
npm test                    # 50 tests (vitest)

# Template (using local Tweego)
# On Windows with local Tweego:
$env:TWEEGO_PATH = "_tools/tweego/storyformats"
& _tools/tweego/tweego.exe -o twine-sugarcube-template/output.html twine-sugarcube-template/src/

# Or if Tweego is in PATH:
cd twine-sugarcube-template && tweego -o output.html src/

# Sizzle game:
$env:TWEEGO_PATH = "_tools/tweego/storyformats"
& _tools/tweego/tweego.exe -o sizzle/output.html sizzle/src/
```

## Reference Game Stats

- **File:** `FemaleAgent_(1201P).html` (12.4 MB)
- **Passages:** 6,433 (verified via MCP import)
- **Words:** 705,356
- **Widgets:** 1,022 definitions in 29 widget passages
- **Custom macros:** page, first, rollDice, dropdownCustom, checkvars
- **Key prefixes:** GNO (1,696 passages), TNG, WR, WW, FNG, DINBOSS, MALAY
