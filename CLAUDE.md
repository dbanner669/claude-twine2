# Female Agent Project

## Overview

Two deliverables:
1. **twine-mcp-server/** — MCP server (Node.js/TypeScript) for programmatic Twine story interaction
2. **twine-sugarcube-template/** — Reusable SugarCube game template extracted from Female Agent

## Project Structure

```
Female Agent/
├── twine-mcp-server/        # MCP server source
│   ├── src/
│   │   ├── index.ts         # Entry point (stdio transport)
│   │   ├── server.ts        # Tool/resource registration
│   │   ├── types/           # TypeScript interfaces
│   │   ├── parsers/         # HTML and Twee parsers
│   │   ├── generators/      # HTML and Twee exporters
│   │   ├── models/          # In-memory story model
│   │   ├── analysis/        # Story graph analysis
│   │   ├── tools/           # MCP tool implementations
│   │   └── utils/           # Link extraction, macro parsing
│   └── test/
├── twine-sugarcube-template/ # Game template (Twee source)
│   ├── src/
│   │   ├── story/           # System passages (StoryInit, etc.)
│   │   ├── widgets/         # Reusable widget passages
│   │   ├── scripts/         # JavaScript
│   │   ├── styles/          # CSS
│   │   └── content/         # Example passages
│   └── build/               # Tweego compilation scripts
├── Female_Agent_1.20.1P_offlin/  # Reference game (gitignored)
└── Twine-2.12.0-Windows.exe     # Twine app (gitignored)
```

## Tech Stack

- **Runtime:** Node.js 24.x
- **Language:** TypeScript 5.x
- **MCP SDK:** @modelcontextprotocol/sdk
- **HTML parsing:** cheerio + he (entity decoding)
- **Testing:** vitest
- **Build:** tsup
- **Story format:** SugarCube v2.x (latest)
- **Compiler:** Tweego

## Key Conventions

- MCP tools prefixed with `twine_`
- Passage content is HTML-encoded in Twine HTML files; always use he.decode()
- The game uses PREFIX-NUMBER naming (e.g., GNO-100, TNG-200)
- SugarCube link patterns to handle: [[]], <<goto>>, <<include>>, <<button>>, <<link>>, data-passage=

## Workflow

Claude orchestrates. Codex (cc-codex-plugin:codex-agent) implements. Claude reviews.

## Commands

```bash
# MCP server
cd twine-mcp-server && npm install && npm run build
npm test

# Template (requires Tweego in PATH)
cd twine-sugarcube-template && tweego -o output.html src/
```
