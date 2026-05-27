# Sizzle Tools — Obsidian plugin

Drive the Twee ↔ Obsidian Canvas round-trip for the Sizzle story project from
inside Obsidian, instead of switching to a terminal every time.

The plugin wraps two existing CLI scripts; the scripts remain the single
source of truth.

## Commands

Open the command palette (Ctrl/Cmd-P) and search "Sizzle":

- **Sizzle Tools: Rebuild canvas from Twee** — runs
  `sizzle/scripts/build-obsidian-canvas.js`. Regenerates `story.canvas` and
  the shadow `passages/*.md` files from current Twee source. Preserves
  manually-moved node positions.
- **Sizzle Tools: Sync passages back to Twee (dry-run)** — runs
  `sizzle/scripts/build-twee-from-vault.js`. Reports which `.twee` files
  would change. Does not write.
- **Sizzle Tools: Sync passages back to Twee (apply)** — same script with
  `--apply`. Writes changes to `sizzle/src/content/*.twee`.
- **Sizzle Tools: Open lint pane** — opens the right-sidebar lint pane.
- **Sizzle Tools: Re-run lint now** — forces a lint refresh (normally runs
  automatically on file edits, debounced 400ms).

Also adds a refresh icon to the left ribbon for one-click canvas rebuild.

## Lint pipeline

The plugin runs a lint pass continuously over `passages/*.md` and surfaces
diagnostics in three places:

- **Sidebar pane** — filterable list grouped by passage. Severity toggles
  (Errors / Warnings / Notes) hide each category; search box does
  substring filter on rule id / message / passage name. Click a row to
  jump to the offending line in the shadow MD.
- **Status bar** — `● <errors>  ▲ <warnings>  ✎ <notes>` widget at the
  bottom of the Obsidian window. Click to open the pane.
- **Lint runs on**: initial pane open, any modify/create/delete/rename of
  `passages/*.md` or `beats.json` (debounced 400ms), and explicit
  "Re-run lint now" command.

### Current rules

| Rule id | Severity | What it catches |
|---|---|---|
| `broken-ref` | error | Dead wiki links / `<<goto>>` / `<<include>>` / `<<term>>` / image paths / `<<ccDossierFooter>>` back/next args. Dynamic refs (`$`, `{`, `` ` ``) and external URLs skipped. |
| `unclosed-macro` | error | Paired-macro stack imbalance — `<<if>>`, `<<silently>>`, `<<link>>`, `<<button>>`, `<<for>>`, `<<switch>>`, `<<replace>>`, `<<append>>`, `<<prepend>>`, `<<widget>>`, `<<page>>`, `<<first>>`, `<<capture>>`, `<<do>>`, `<<linkappend/prepend/replace>>`, `<<timed>>`, `<<type>>`. |
| `duplicate-passage` | error | Same passage name in >1 `.twee` file under `sizzle/src/`. |
| `orphan-passage` | warning | No incoming wiki / `<<goto>>` / `<<include>>` / footer-arg references AND not on the exempt list AND not tagged `widget` AND not under `src/widgets/`. |
| `undeclared-variable` | warning | `$varname` referenced but never `<<set>>` or `<<unset>>` anywhere in `src/*.twee` / `src/*.js`. One diagnostic per (passage, variable). Skips SugarCube builtins (`$state`, `$args`, etc.). |
| `editorial-note` | note | `[! directive]` or `[? question]` markers — surface for later attention. Stored in `data.text` for downstream UI. |
| `editorial-note-malformed` | warning | `[! ` or `[? ` opener with no closing `]` on the same line. |
| `tag-coherence` | note | Story tags pushed/set on `$player.storyTags` / `kinks` / `quirks` / `statusEffects` but never read anywhere (or vice versa). |
| `word-count` | note / warning | Passage body over 120 words (note) or over 200 words (warning) per the CLAUDE.md ceiling. |

Cross-file context loaded on every lint pass: glossary keys, all known
passage names across `src/content` / `src/story` / `src/widgets`, media
file inventory, declared `$variables`, write/read sets for each tag
field, and the orphan-exempt list (system entries + widgets).

### Editorial notes convention

Drop inline notes in passage prose:

- `[! add a hoverover for "Bank Street"]` — directive for Claude
- `[? some name to come up with]` — open question

The `editorial-note` rule surfaces these as notes in the pane. Use the
Notes filter to isolate them.

## Install (dev)

From the repo root:

```
cd obsidian-sizzle-plugin
npm install
npm run build
npm run install-to-vault
```

`install-to-vault` copies the built `main.js` + `manifest.json` into
`sizzle/.obsidian-vault/.obsidian/plugins/sizzle-tools/`. Then in Obsidian:

1. Open the vault `sizzle/.obsidian-vault/`.
2. Settings → Community plugins → Enable "Sizzle Tools".
   (If the toggle says "Restricted mode is on," turn restricted mode off first.)

After source changes: `npm run build && npm run install-to-vault`, then
toggle the plugin off/on in Obsidian to reload.

## Settings

- **Repo root** — absolute path to the Female Agent repo. Auto-detected
  if the vault sits at `<repo>/sizzle/.obsidian-vault/`. Set manually
  otherwise.
- **Node binary** — defaults to `node` on PATH. Override if Node lives
  somewhere else.
- **Re-detect repo root** — button to redo auto-detection if something
  got stale.

## How it works

The plugin doesn't reimplement anything. Each command spawns
`node <scriptPath> [--apply]` with `cwd` set to the repo root, captures
stdout/stderr, and surfaces the last meaningful line of stdout as a
Notice. Full output is logged to the developer console
(Ctrl/Cmd-Shift-I).

This keeps maintenance lean: change the script, the plugin picks up
the new behavior automatically.

## Why not implement the scripts directly in the plugin?

We could. The downside is two copies of the parsing / layout / sync-back
logic that have to stay in sync. The CLI scripts are also useful for
automation, CI, and ad-hoc terminal use. The subprocess approach is the
small operational overhead that keeps the logic monolithic.

If startup latency becomes a problem (Node cold-start is ~200ms here),
we can port hot paths into the plugin process later.
