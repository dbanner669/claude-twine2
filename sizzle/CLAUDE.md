# Sizzle

For agent handoff, read `AGENTS.md` first. This file is the broader project and
design-system guide. **The game is the Godot project at `godot/` (repo root); ink is the
canonical content format.** SugarCube/twee was retired 2026-07-11 (Phase 6 of
`docs/GODOT-PORT-PLAN.md`); the twee line lives on in a fork, on the frozen `master`
branch, and at `sizzle/archive/twee-src/`.

## Overview

An adult interactive fiction game. Set in Toronto, 2005/2006. The player is a woman
recruited by a secret federal agency ("the Branch") to infiltrate an exclusive swingers
club called Sizzle on Queen Street West. Something is happening beneath the surface —
something the Branch classifies as "not yet scientifically explained" (NYSE, pronounced
"nigh-see").

## Genre

Infiltration (spine) with investigation, social/relationship, and survival elements.
Grounded realism in a world with hidden supernatural elements (mind control adjacent).
Unapologetically erotic — sex scenes should have heat. Characters are real people, the
world is plausible, story is king. Porn and plot are not in conflict.

## Setting

- **City:** Toronto, Ontario, Canada
- **Era:** September 2005 onward (pre-smartphone, pre-condo-boom Queen West)
- **Key location:** Sizzle — a members-only swingers club on West Queen West (inspired by
  the real club WICKED)

## Tech Stack

- **Engine:** Godot 4.7-stable **.NET edition** (`_tools/godot4/`). Game code is
  **GDScript**; C# exists only under `godot/addons/GodotInk/` (the godot-ink bridge).
- **Content:** ink, compiled by inklecate (bundled with Inky at `_tools/inky/`), loaded
  through the godot-ink addon. Content files: `godot/content/*.ink`.
- **Tests:** GUT (`godot/addons/gut/`) — unit + differential suites.
- **Canvas:** fixed 16:9, 1920×1080, project stretch `canvas_items` / `keep`.

## Where Things Live

```
godot/                    The game (Godot project; sln for the .NET build)
├── autoload/             State, Rules, StoryBridge, ThemeService, SaveManager,
│                         Settings, AvatarManifest — the runtime spine
├── scenes/               game_shell.gd (presentation shell), cc/ (character creator),
│                         ui/ (avatar panel, check panel, extract, dialogs, atmosphere)
├── content/              *.ink (canonical story content) + data/ (glossary etc.)
├── theme/                palette.gd (design tokens), sizzle_theme.tres, shaders
├── avatar/               manifest.json + layer art (placeholder until bakeoff art lands)
├── test/                 GUT suites: unit/ + differential/
└── tools/                screenshot_runner.tscn, review_dump.tscn (verification)
sizzle/                   Design docs, media, fonts, archive
├── docs/                 GDD.md, STYLE-GUIDE.md, docs/godot/ (port contracts + gates)
├── media/, fonts/        Art and type assets (Godot loads WOFF2 directly)
└── archive/twee-src/     Frozen SugarCube-era twee (retired; do not edit)
```

Authoritative port documentation: `docs/GODOT-PORT-PLAN.md` (roadmap + gate records) and
`docs/godot/` — STATE-SCHEMA.md, INK-CONVENTIONS.md, AVATAR-MANIFEST.md,
PARITY-MATRIX.md, plus per-phase gate/status reports.

## Commands (run from repo root; PowerShell)

```powershell
$godot = "_tools/godot4/Godot_v4.7-stable_mono_win64/Godot_v4.7-stable_mono_win64.exe"

& $godot --path godot                    # play the game
dotnet build godot/Sizzle.sln            # build the C# (godot-ink) side
& $godot --headless --path godot --import                            # re-import assets
& $godot --headless --path godot -s res://addons/gut/gut_cmdln.gd `
    -gdir=res://test/unit -gdir=res://test/differential -gexit       # GUT (all suites)
& $godot --path godot res://tools/screenshot_runner.tscn             # UI smoke + shots
& $godot --headless --path godot res://tools/review_dump.tscn        # prose review dumps
node twine-mcp-server/scripts/verify-ink-import.mjs   # audit ink vs archived twee
```

**Verify every change** with the ladder: `dotnet build` → headless `--import` → GUT →
screenshot runner. Screenshots land in `%APPDATA%/Godot/app_userdata/Sizzle/shots/`.

## Content: ink Conventions (full contract: docs/godot/INK-CONVENTIONS.md)

- Knot = passage; names like `BLK_100` (ink identifiers can't contain hyphens). Prefixes:
  `CC` creation · `INTRO` briefing · `BLK/MAN/PALE/WDS` origin incidents · Act 1 will add
  `QW`, `SZ`, `BRANCH`, `NPC`, `APT`.
- Tags drive presentation: `# screen: menu|creation|scene`, `# mode: day|night` (absent =
  derived from `date.slot`), `# check` (mid-knot interactive pause), `# avatar: <phase>`,
  `# history_root`.
- Engine state is mutated ONLY through external-function ops (`adjust_composure`,
  `advance_time`, `sizzle_suspicion`, …) and read in prose through mirrored variables
  (`current_composure`, `sizzle_band`, …). Reads are projections; writes are commands.
- Emphasis is BBCode `[i]…[/i]` in ink (RichTextLabel renders it). Glossary terms are
  `[url=gloss:KEY]label[/url]`; the shell decorates them brass at display time.
- The five original `.ink` files carry a `// GENERATED by twine-mcp-server` banner —
  that is **historical**. Since retirement, ink is canonical and edited directly; the
  converter and `verify-ink-import.mjs` remain only as an audit against the archive.
- History/save atom is the **choice commit**: state snapshots at knot entry; back
  restores the entry snapshot. No set-once latches needed — grants restore with
  everything else.
- Any new narrative-facing construct ships as an ink convention + runtime handler pair,
  documented in INK-CONVENTIONS.md, or not at all.

## Runtime: State, Rules, Bridge (full contract: docs/godot/STATE-SCHEMA.md)

- `State` (autoload) owns the canonical dict — `player` / `sizzle` / `nyse` / `date` /
  `header`, snake_case keys, schema-versioned saves.
- `Rules` (autoload) is the only mutation surface; every op emits `state_changed`.
  Composure ops clamp 0..7; day-crossings reset current composure to baseline. Time is
  slot-based (`earlyMorning` … `laterNight`); day slots render the day palette.
- Sizzle suspicion/reputation system (Phase 7, `docs/godot/SUSPICION-MODEL.md`):
  suspicion/reputation clamp 0..10, access ratchets 0..3, bands
  `unremarked/noticed/watched/burned`, `suspicion_band_changed` on transitions,
  directional toast that never shows the number. No passive decay.
- `StoryBridge` (autoload) wraps godot-ink: continue/choices, external bindings, mirror
  push, ink-runtime save/restore.

## Design System

- Tokens live in `godot/theme/palette.gd` (`SizzlePalette.NIGHT/DAY`) — translated 1:1
  from the retired CSS `--sz-*` custom properties; same names, dashes → underscores. UI
  code colors itself via `ThemeService.color("token")` and restyles on `mode_changed`.
- Fonts (5 families, WOFF2, loaded natively): Allura (script), Cormorant Garamond
  (display), EB Garamond (body), Inter (UI), JetBrains Mono.
- Day/night: night = warm charcoal (default), day = sunlit parchment with the bronze
  header variant. Atmosphere vignette/grain: `godot/theme/atmosphere.gdshader`.
- Header badge from Current Composure: ≤0 RATTLED · 1 SHAKEN · 2–4 STEADY · 5–6 COOL &
  COLLECTED · ≥7 ICE VEINS (`header.status` overrides).
- Choice rows: brass italic, em-dash prefix, right chevron, hover shifts right and glows
  brick. Visited choices grey out via ink visit counts.

## Godot Gotchas (Read Before Editing — hard-won)

1. **GDScript lambdas arrive as null Callables across the godot-ink boundary.** Bind
   NAMED methods only (`story.BindExternalFunction("op", Rules.op)`).
2. Main-story `.ink` files need `is_main_file=true` in their `.import` sidecar; includes
   must not have it.
3. Skill checks pause on an ops-only tagged line BEFORE the check knot's prose; the shell
   defers the prose clear until after the roll. Don't "fix" the deferred clear.
4. Mirrors push skip-if-absent (`InkStory.HasVariable`) — a story that doesn't declare a
   mirrored VAR is fine. Declare mirrors you consume in `godot/content/mirror.ink`.
5. Never edit `godot/addons/` beyond deliberate, documented extensions (current total:
   `InkStory.HasVariable`, 5 lines — re-apply if the addon is upgraded).
6. Subagents here repeatedly hit session limits mid-task — keep an incremental progress
   file and verify a dead agent's output yourself (build/import/GUT/runner).

## Skills

Academic · Agent · Athlete · Confrontation · Charmer · Streetwise · Composure (split into
durable Baseline and volatile Current; key NYSE defense) · Sexology (key Sizzle skill).
Player-facing rolls use the check panel (roll → animate → settle → reveal); checks read
Current Composure, not Baseline.

## Key State (snake_case in `State`; see STATE-SCHEMA.md for the full tree)

- `player`: background, inciting_incident, cover, codename, arousal (0–3), story_tags,
  status_effects, kinks, quirks, baseline_composure, current_composure, skills
- `sizzle`: suspicion (0–10), access_level (0–3), reputation (0–10)
- `nyse` (hidden from player): influence, power
- `date`: year/month/day/slot (day_of_week derived); starts September 12, 2005, morning

## Current Status

- **Playable end-to-end:** main menu → character creation (native dossier flow) → chosen
  origin-incident flashback (BLK/MAN/PALE/WDS) → briefing (INTRO), with saves, day/night
  theming, animated checks, glossary, Branch-file extracts, MENU/SAVES/CHARACTER chrome.
- **Prose:** all four incidents + briefing human-signed-off (first-play review,
  2026-07-11).
- **Avatar:** manifest-driven runtime is live against placeholder art; real layers come
  from the Qwen 2509 bakeoff (`docs/avatar-bakeoff/`) and swap in via
  `godot/avatar/manifest.json` with no code change.
- **Systems:** suspicion/reputation model implemented (no content consumer yet).
- **Next:** Act 1 content (Insertion), written directly in ink.

## Writing Conventions

**Source of truth: [docs/STYLE-GUIDE.md](docs/STYLE-GUIDE.md).** Read it before writing
or revising any prose. Quick reference:

- **Passage length: 80–120 visible words target, 200 hard ceiling.** One beat per knot.
  Conditional variants count the longest single render.
- **Link/choice text:** complete sentence, always. Three valid forms: (1) player
  character dialogue, (2) narration, (3) `Continue`. Never NPC dialogue.
- The Branch never says "supernatural" / "magic" / "paranormal" — only NYSE ("nigh-see"),
  "anomalous," "atypical." The institutional vocabulary refuses to name what it tracks.
- The Branch has verisimilitude: mundane bureaucracy crossed with CSIS-level secrecy.
- Toronto / Ottawa locations: real, period-accurate to 2005/2006. No smartphones, no
  post-2006 cultural refs.
- Métis (heritage) and Shield country (geography) are distinct — don't conflate.
- All characters are grounded, fully realized people — no caricatures.
- Writing style: literate erotic thriller. Observant, specific, trusts the reader.
- Erotic content: vivid, physical, written to arouse. Earned heat is hotter.
- The player character is female, always she/her; two years at the Branch — trained, not
  a rookie. Cover identity is central: NPCs at Sizzle don't know the real her.
