# Sizzle Story Sync — FigJam plugin

Loads the sizzle story graph (passages, links, sections) from the local
`figjam-sync` server into a FigJam board for visual editing.

Companion to `twine-mcp-server/src/figjam-sync/` (the local HTTP service)
and the `/sizzle` story source.

## Install (one time, dev plugin)

1. Build the plugin:
   ```powershell
   cd figjam-sync-plugin
   npm install
   npm run build
   ```
2. Open the Figma desktop app.
3. Open or create a FigJam file.
4. Menu: `Plugins` → `Development` → `Import plugin from manifest…`
5. Select `figjam-sync-plugin/manifest.json`.

The plugin now shows up under `Plugins` → `Development` → `Sizzle Story Sync`.

## Use

1. In `twine-mcp-server/`, start the local sync server:
   ```powershell
   npm run figjam-sync
   ```
   It listens on `http://127.0.0.1:4747`.
2. In FigJam, run the plugin (`Plugins` → `Development` → `Sizzle Story Sync`).
3. Click **Load story**. The plugin fetches `/story-graph.json` and lays out:
   - One **Section** per passage prefix (`CC`, `INTRO`, `SYS`, plus an empty
     `Act 1 · Insertion (concept)` placeholder).
   - One **title sticky** per passage (name + tags + 1-line summary, colored by
     prefix) and one **body sticky** below it with the full prose.
   - **Connectors** for every link in the source, labelled with the link's
     display text.

Every node carries `setPluginData` identity so a future Export pass can match
board state back to passage names for AI-interpreted round-trip edits.

## Convention for board edits

- **Stickies you add by hand** (no plugin data) are treated as *concept*
  passages — for ideas you're sketching.
- **Stickies the plugin created** (carry `passageName` + `kind=title|body`)
  represent real passages from the Twee source.
- **Connectors** with `kind=link` are real story links. New connectors you
  draw are interpreted as proposed new links.
- Rearrange freely. The plugin doesn't care about position.

## Phase status

- Phase 2 (done): scaffold + Load story.
- Phase 3 (next): Export board — serialize the current board to JSON, POST to
  `http://127.0.0.1:4747/board.json`, then ask Claude to diff against Twee.
