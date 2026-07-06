# Avatar Layer Manifest Contract (Phase 0, artifact 3 of 4)

Status: **draft — pending human sign-off**. The contract both sides target: art production (the Qwen 2509 bakeoff pipeline) and the Godot runtime (Phase 4 consumer). Neither chases the other. Supersedes the SugarCube 6-array system (`$avatar.background[]` … `foreground[]`) and the wear-*/emote-* widget family.

## Canvas and registration

- Canonical layer canvas: **523×1536**, transparent PNG, shared registration (unchanged from `docs/avatar-bakeoff/OPTION-2-ASSET-TODO.md`).
- Working-canvas rules (576×1536 FLUX padding, 624×1672 Qwen 2509 canvas, crop paths back to canonical) stay as documented in the bakeoff docs; **only canonical-canvas assets enter the manifest.**
- Acceptance gate per asset family: the crossed-composite pass/fail test in `docs/avatar-bakeoff/layer-composition-protocol.md`. No manifest entry without a passing composite.

## The layer stack (15 slots, bottom → top; z-order = list order)

```
background, hair_back, body, nipples, genitals, body_mods, face, eyes,
underwear, clothing_bottom, clothing_top, shoes, hair_front, expression, overlay
```

Runtime shape: one `AvatarPanel` scene; one `TextureRect` child per slot, node names = slot names; empty slot = null texture. Positioning is trivial because every asset shares the canonical canvas — all TextureRects are full-rect, stacked.

## Manifest file

`godot/avatar/manifest.json` — the single registry the runtime loads:

```json
{
  "canvas": [523, 1536],
  "assets": {
    "body-medium":              { "slot": "body",      "path": "body/20_body-medium.png" },
    "hair-back-long-straight-brown":  { "slot": "hair_back",  "path": "hair/back/30_hair-back-long-straight-brown.png" },
    "...": {}
  },
  "outfits": {
    "sizzle-tee-jeans": { "clothing_top": "tshirt-black", "clothing_bottom": "jeans-dark", "shoes": "sneakers" }
  },
  "expressions": {
    "calm":   { "face": "mouth-calm",  "eyes": "brows-attentive" },
    "...": {}
  },
  "phase_overrides": {
    "blk_day":   "phases/blackout-day.png",
    "blk_night": "phases/blackout-night.png",
    "man_day":   "...", "man_night": "...", "pale_night": "...", "wds_night": "..."
  }
}
```

File naming keeps the bakeoff convention (`NN_slot-variant.png`, NN = stack order hint). Outfits replace the `wear-*/remove-*` widget pairs; expressions replace the `emote-*` widget family.

## Runtime API (the avatar ops on the command surface)

| Op | Effect |
|---|---|
| `avatar_set_slot(slot, asset_id \| null)` | Direct single-layer set/clear |
| `avatar_apply_outfit(outfit_id)` | Sets every slot the outfit names; clears slots it maps to null |
| `avatar_set_expression(expr_id)` | Expression-group swap (face/eyes/brows slots) |
| `avatar_clear()` | All slots to null except body defaults |
| *(engine-internal)* phase override | Driven by knot tag `# avatar: blk_night` etc. — swaps the whole panel to the full-frame phase image (replaces today's CSS `--sz-avatar-img` tag hack); absent tag clears it |

Composure pips render from mirrored `current_composure` (0–7); the identity block reads mirrored name/codename — both are panel UI, not layers.

## Greybox scope lock (unchanged)

Appearance locked to **medium skin, long straight hair, blue eyes** — one coherent avatar to prove registration, compositing, and the API. The full appearance matrix stays a later production goal; the manifest schema already accommodates it (assets carry variant suffixes), so unlocking is data, not code.

Greybox minimum asset set: 1 body, 1 hair_back, 1 hair_front, 1 face, 1 eyes, the four-piece starter outfit (tee/jeans/sneakers/underwear), 2–3 expressions, 6 phase-override images (already exist in `media/avatar/`). Production targets (39 minimum / 60 recommended layers) remain as per `OPTION-2-ASSET-TODO.md`.

## Sign-off record (2026-07-05)

1. Full-frame phase overrides for greybox: **approved as drafted.**
2. `explicit_layers_visible` setting from day one: **approved as drafted.**
