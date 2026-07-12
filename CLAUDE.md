# Female Agent Project

## Overview

Three projects:
1. **godot/ + sizzle/** — **Sizzle**, an adult interactive fiction game. The game runs in
   **Godot 4.7 .NET with ink content** (`godot/` is the engine project, `sizzle/` holds
   design docs, media, and the retired-twee archive). See `sizzle/CLAUDE.md` and
   `sizzle/AGENTS.md` (start there for game work). SugarCube/twee was retired 2026-07-11;
   the twee line lives on in a fork and on the frozen `master` branch.
2. **twine-mcp-server/** — MCP server (Node.js/TypeScript) for programmatic Twine story
   interaction (32 tools). Post-retirement its live role for Sizzle is the one-time
   twee→ink converter (`npm run export-ink`) and the import-fidelity verifier
   (`scripts/verify-ink-import.mjs`), both now pointed at `sizzle/archive/twee-src/`.
   The general Twine tooling remains useful for other SugarCube projects.
3. **twine-sugarcube-template/** — Reusable SugarCube game template (predates the Godot
   port; still a valid standalone template).

## Branch model

- `godot-main` — active default line. Work here.
- `master` — frozen twee/SugarCube legacy line. Don't touch.

## Project Structure

```
Female Agent/
├── godot/                     # The Sizzle game (Godot 4.7 .NET + godot-ink)
│   ├── autoload/              # State, Rules, StoryBridge, ThemeService, SaveManager…
│   ├── scenes/                # game_shell, cc/, ui/
│   ├── content/               # *.ink — canonical story content
│   ├── theme/                 # palette.gd tokens, theme, shaders
│   ├── test/                  # GUT unit + differential suites
│   └── tools/                 # screenshot_runner, review_dump
├── sizzle/                    # Sizzle design docs, media, fonts, archive
│   ├── docs/                  # GDD, STYLE-GUIDE, GODOT-PORT-PLAN, docs/godot contracts
│   ├── media/  fonts/         # art + type assets
│   └── archive/twee-src/      # retired SugarCube twee (frozen; do not edit)
├── twine-mcp-server/          # MCP server + twee→ink converter + verifier
│   ├── src/                   # tools, parser, ink-export/, figjam-sync/ (archived)
│   └── test/                  # vitest suites
├── twine-sugarcube-template/  # Standalone SugarCube template (twee + build)
├── obsidian-sizzle-plugin/    # ARCHIVED (twee-era lint/round-trip plugin)
├── figjam-sync-plugin/        # ARCHIVED (twee-era FigJam sync)
├── _tools/godot4/             # Godot 4.7 .NET editor (gitignored)
├── _tools/inky/               # Inky/inklecate (gitignored)
├── _tools/tweego/             # Tweego compiler (gitignored; template + archive only)
└── Female_Agent_1.20.1P_offlin/  # Reference game (gitignored)
```

## Tech Stack

- **Game:** Godot 4.7-stable .NET (GDScript game code; C# only under the godot-ink
  addon), ink content, GUT tests. Details + commands: `sizzle/CLAUDE.md`.
- **MCP server:** Node.js 24.x, TypeScript 5.x, @modelcontextprotocol/sdk 1.12.0,
  cheerio 1.0.0, vitest 2.1.8.
- **Template / archive era:** SugarCube v2.37.3, Tweego (`_tools/tweego/`).

## Key Conventions

- Passage content is HTML-encoded in Twine HTML files; cheerio `.text()` handles decoding
- PREFIX-NUMBER naming (e.g. GNO-100, TNG-200); ink knots use underscores (BLK_100)
- SugarCube link patterns handled: `[[]]`, `<<goto>>`, `<<goto $var>>`, `<<include>>`,
  `<<button>>`, `<<link>>`, `data-passage=`; setter syntax `[[text|Target][$var to val]]`
  supported (setter stripped from target)

## Workflow

Claude orchestrates. Codex (cc-codex-plugin:codex-agent) implements. Claude reviews.
Note: the Codex CLI runs on its own (OpenAI) budget; the Claude subagent driving it
shares the Claude plan limit — subagent "session limit" errors are the Claude side.

## Commands

```powershell
# Sizzle (the game) — full command set in sizzle/CLAUDE.md
$godot = "_tools/godot4/Godot_v4.7-stable_mono_win64/Godot_v4.7-stable_mono_win64.exe"
& $godot --path godot                                  # play
dotnet build godot/Sizzle.sln                          # build
& $godot --headless --path godot -s res://addons/gut/gut_cmdln.gd `
    -gdir=res://test/unit -gdir=res://test/differential -gexit   # tests (GUT)

# MCP server
cd twine-mcp-server; npm install; npm run build
npm test                                   # vitest
npm run export-ink                         # one-time twee->ink converter (archive input)
node scripts/verify-ink-import.mjs         # ink vs archived twee fidelity audit

# SugarCube template (standalone; local Tweego)
$env:TWEEGO_PATH = "_tools/tweego/storyformats"
& _tools/tweego/tweego.exe -o twine-sugarcube-template/output.html twine-sugarcube-template/src/
```

## Reference Game Stats

- **File:** `FemaleAgent_(1201P).html` (12.4 MB)
- **Passages:** 6,433 (verified via MCP import)
- **Words:** 705,356
- **Widgets:** 1,022 definitions in 29 widget passages
- **Custom macros:** page, first, rollDice, dropdownCustom, checkvars
- **Key prefixes:** GNO (1,696 passages), TNG, WR, WW, FNG, DINBOSS, MALAY
