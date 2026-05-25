# Layer Composition Protocol

This is the primary bakeoff test. A contender wins only if it can make separate avatar layers that recombine cleanly on the same canvas.

## Goal

Produce interchangeable transparent PNG layers that behave like Sizzle runtime assets:

```text
background + hairBack + body + nipples + genitals + bodyMods + face + eyes + underwear + clothingBottom + clothingTop + shoes + hairFront + expression + overlay = coherent avatar
```

The same layer must be reusable across combinations. A clothing item generated against the light-skin body must also fit medium and dark body sprites. Hair sprites must fit all skin tones. Eye-colour sprites and expression parts must land on the same face geometry regardless of skin tone and hair selection. The result should look like a single coherent person, not a collage.

## Target Layer Model

The current SugarCube runtime may still need implementation work, but the target art/runtime layer model is explicit:

```text
background
hairBack
body
nipples
genitals
bodyMods
face
eyes
underwear
clothingBottom
clothingTop
shoes
hairFront
expression
overlay
```

`body` is now a faceless body base. `face` contains the nose/neutral face structure. `eyes` contains the eye layer. `expression` contains brows and mouth. `nipples` and `genitals` are explicit anatomy overlays, not `bodyMods`. `bodyMods` is reserved for non-anatomy marks such as scars, tattoos, piercings, bruises, and similar state changes.

## Required Layer Set

Use `523x1536` for every accepted layer and preview. ComfyUI working images may be padded to `576x1536`, but accepted assets must be cropped back to the canonical canvas and preserve registration.

Greybox appearance lock:

- Skin tone: medium.
- Hair style: long straight.
- Eye colour: blue.

### Background

- `background_neutral-grey.png`
- Optional: `background_briefing-diner.png`

### Body / Appearance Sublayers

- `20_body-medium.png`
- `30_hair-long-straight-brown.png`
- `38_face-nose-medium.png`
- `40_eyes-blue.png`
- `43_nipples-medium.png`
- `44_genitals-medium.png`
- `expression/81_brows-relaxed-brown.png`
- `expression/80_mouth-calm.png`

The full production matrix can later add light/dark skin bodies, more hair styles/colours, eye colours, expression variants, and tone-specific anatomy overlays.

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

- `composite_medium_long-straight-brown_blue_body-only.png`
- `composite_medium_long-straight-brown_blue_anatomy-overlays.png`
- `composite_medium_long-straight-brown_blue_underwear-only.png`
- `composite_medium_long-straight-brown_blue_blackTshirt_darkJeans_sneakers_calm.png`

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
- Full canvas crop, including top of head/skull and bottom of feet.

Tolerance target:

- Exact pixel identity is not required.
- Landmark drift above roughly `3-5 px` at `523x1536` should be treated as a problem.
- Any drift large enough to expose skin gaps, crop hair, float clothing, or misplace facial features is a fail.

## Generation Strategy To Test

Each contender should try to use the strongest available control stack for its ecosystem:

- Fixed pose reference or OpenPose/depth/Canny equivalent.
- A canonical silhouette/edge guide for body and clothing.
- Inpaint or masked generation for hair, underwear, and clothing layers where possible.
- Segmentation or matte extraction after generation.
- Transparent PNG export with the original canvas preserved.

Do not score a layer that was manually painted to fit after generation. Minor alpha cleanup is allowed; geometry repair is not.

For clothing masks, the mask itself must first pass visual review. A usable clothing mask covers only the intended garment regions and hugs the avatar silhouette: shoulders/sleeves follow the body, jean waist matches the avatar waist, pant legs cover the full visible leg width where jeans should exist, and shoes do not swallow toes/ankles beyond the intended shoe shape. Bad masks are process failures, not model evidence.

## Recommended Layer Build Order

1. Use the approved canonical templates in `baseline-inputs/canonical/`, preserving the `523x1536` registration.
2. Extract/approve the body geometry reference from the noface body template.
3. Accept `20_body-medium.png` for the greybox, with light/dark retained as later palette candidates.
4. Generate separate `face`, `eyes`, `expression/brows`, `expression/mouth`, `nipples`, and `genitals` overlays.
5. Generate long-straight hair layers on the same head/shoulder geometry, preserving transparent background.
6. Generate underwear using the same bust/waist/hip guide, with no baked skin.
7. Generate top, bottom, and shoe sprites using the same torso/leg/foot guide, with no baked skin.
8. Composite all greybox combinations without further image edits.

## Pass/Fail Checks

Hard fail:

- Hair only fits the skin tone it was generated with.
- Eye overlays repaint eyelids/skin or drift between skin tones.
- Underwear includes baked skin or only fits one body tone.
- Clothing includes baked skin that conflicts with another body layer.
- Top/bottom/shoes float, stretch, or expose gaps when moved to another body layer.
- Clothing edit changes unmasked skin, lighting, pose, blank face, canvas crop, or body proportions.
- Clothing extraction includes checkerboard, white background, skin fragments, or broad body-outline residue.
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
