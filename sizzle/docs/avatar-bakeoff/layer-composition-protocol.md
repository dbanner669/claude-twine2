# Layer Composition Protocol

This is the primary bakeoff test. A contender wins only if it can make separate avatar layers that recombine cleanly on the same canvas.

## Goal

Produce interchangeable transparent PNG layers that behave like Sizzle runtime assets:

```text
background[] + body[] + bodyMods[] + underwear[] + clothing[] + foreground[] = coherent avatar
```

The same layer must be reusable across combinations. A clothing item generated against the light-skin body must also fit medium and dark body sprites. Hair sprites must fit all skin tones. Eye-colour sprites and expression parts must land on the same face geometry regardless of skin tone and hair selection. The result should look like a single coherent person, not a collage.

## Runtime Layer Model

The active Sizzle widget renders six arrays in this order:

| Runtime array | Production sprites to test | Notes |
|---|---|---|
| `background[]` | Diner/neutral avatar background | Optional for visual context; must not affect alignment. |
| `body[]` | Base body skin tones, hair sprites, eye sprites if no dedicated runtime array exists | The docs and current media folders do not define a separate hair/eyes array; until code changes, these are production sublayers that must be assigned to an existing runtime array. |
| `bodyMods[]` | Tattoos, scars, piercings | Not required for the v1 briefing slice, but include one simple diagnostic if time allows. |
| `underwear[]` | Bra/briefs or neutral underwear | Must fit under clothing and over all skin-tone bodies. |
| `clothing[]` | Top, bottom, shoes, dress | Slot-managed by `wear-*`/`remove-*` widgets. Test top/bottom/shoes, plus dress only if time allows. |
| `foreground[]` | Mouth expressions, brow expressions, overlays/effects | Current expression widgets use separate `expression/mouth-*` and `expression/brows-*` PNGs. |

The bakeoff should not assume a nonexistent dedicated hair runtime array. If the winning stack needs one, that becomes a later implementation recommendation, not a bakeoff precondition.

## Required Layer Set

Use `1024x1360` for every layer and preview.

### Background

- `background_neutral-grey.png`
- Optional: `background_briefing-diner.png`

### Body / Appearance Sublayers

- `20_body-light.png`
- `20_body-medium.png`
- `20_body-dark.png`
- `30_hair-short-bob-brown.png`
- `30_hair-long-straight-black.png`
- `30_hair-long-straight-brown.png`
- `30_hair-long-straight-blonde.png`
- `30_hair-long-curly-brown.png`
- `35_eyes-blue.png`
- `35_eyes-green.png`
- `35_eyes-brown.png`

This is smaller than the eventual full `3 skin tones x 3 hair styles x 3 hair colours x 3 eye colours` matrix, but it deliberately hits the hardest reuse cases: multiple skin tones, hair-colour swaps, hair-style swaps, and eye-colour overlays.

### Body Mods

- Optional diagnostic: `bodyMods/simple-scar.png` or `bodyMods/small-tattoo.png`

### Underwear

- `underwear/neutral-bra.png`
- `underwear/neutral-briefs.png`

### Clothing

- `clothing/tops/blackTshirt.png`
- `clothing/tops/whiteBlouse.png`
- `clothing/bottoms/darkJeans.png`
- `clothing/shoes/sneakers.png`

### Foreground / Expressions

- `expression/mouth-calm.png`
- `expression/mouth-frown.png`
- `expression/mouth-open.png`
- `expression/brows-relaxed.png`
- `expression/brows-worried.png`
- `expression/brows-raised.png`

### Required Composite Previews

- `composite_light_long-straight-black_blue_blackTshirt_darkJeans_sneakers_calm.png`
- `composite_medium_long-straight-brown_green_blackTshirt_darkJeans_sneakers_calm.png`
- `composite_dark_long-straight-blonde_brown_blackTshirt_darkJeans_sneakers_calm.png`
- `composite_light_long-curly-brown_blue_whiteBlouse_darkJeans_sneakers_worried.png`
- `composite_medium_short-bob-brown_brown_whiteBlouse_darkJeans_sneakers_surprised.png`
- `composite_dark_long-straight-black_green_underwear_only_calm.png`

Optional diagnostic previews:

- Body only over Sizzle-like background.
- Body + hair only.
- Body + underwear only.
- Body + underwear + top only.
- Body + top + bottom + shoes.
- Hair mask over checkerboard.
- Clothing masks over checkerboard.
- Expression parts over checkerboard and over face.

## Pixel Lock Requirements

The following landmarks must stay aligned across every layer:

- Top of skull/hair mass.
- Eye line.
- Chin.
- Neck center.
- Shoulder slope.
- Bust/chest outline used by tops and underwear.
- Waist/hip centerline.
- Top collar, sleeve openings, and hem.
- Waistline for bottoms.
- Shoe sole/foot anchor.
- Brow and mouth boxes for expression overlays.

Tolerance target:

- Exact pixel identity is not required.
- Landmark drift above roughly `3-5 px` at 1024x1360 should be treated as a problem.
- Any drift large enough to expose skin gaps, crop hair, float clothing, or misplace facial features is a fail.

## Generation Strategy To Test

Each contender should try to use the strongest available control stack for its ecosystem:

- Fixed pose reference or OpenPose/depth/Canny equivalent.
- A canonical silhouette/edge guide for body and clothing.
- Inpaint or masked generation for hair, underwear, and clothing layers where possible.
- Segmentation or matte extraction after generation.
- Transparent PNG export with the original canvas preserved.

Do not score a layer that was manually painted to fit after generation. Minor alpha cleanup is allowed; geometry repair is not.

## Recommended Layer Build Order

1. Generate or select a canonical full-body reference image.
2. Extract/approve the body geometry reference.
3. Generate `20_body-light.png`, `20_body-medium.png`, and `20_body-dark.png` against that same geometry.
4. Generate hair layers on the same head/shoulder geometry, preserving transparent background.
5. Generate eye-colour overlays on the same eye line.
6. Generate underwear using the same bust/waist/hip guide, with no baked skin.
7. Generate top, bottom, and shoe sprites using the same torso/leg/foot guide, with no baked skin.
8. Generate expression mouth and brow overlays on the same face geometry.
9. Composite all crossed combinations without further image edits.

## Pass/Fail Checks

Hard fail:

- Hair only fits the skin tone it was generated with.
- Eye overlays repaint eyelids/skin or drift between skin tones.
- Underwear includes baked skin or only fits one body tone.
- Clothing includes baked skin that conflicts with another body layer.
- Top/bottom/shoes float, stretch, or expose gaps when moved to another body layer.
- Hair/face position changes between hair colours or hair styles beyond the intended silhouette.
- Expression overlays do not land on the same brows/mouth.
- Alpha edges leave obvious halos over Sizzle dark UI.

Strong pass:

- Body, hair, eyes, underwear, clothing, and expression layers look natural in all crossed composites.
- Hair colour changes without changing haircut silhouette for the same style.
- Skin tone changes without changing body silhouette.
- Eye colour changes without changing expression or eyelid shape.
- Clothing looks like the same garments on all bodies.
- Underwear sits correctly under outerwear and in underwear-only previews.
- Expressions read clearly and land on the same face.
