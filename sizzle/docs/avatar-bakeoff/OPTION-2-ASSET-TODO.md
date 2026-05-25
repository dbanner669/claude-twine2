# Option 2 Avatar Asset TODO

Option 2 means the avatar runtime gets explicit visual layers instead of forcing hair/eyes into the current generic arrays. This checklist assumes the target stack is:

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

All accepted avatar draft assets must share the same full canonical canvas: `523x1536`. ComfyUI may use padded `576x1536` working images for FLUX latent compatibility, but accepted layers must be cropped back to `523x1536` and preserve registration.

## 0. Source / Control Assets

Use `baseline-inputs/canonical/` as the current canonical source set. Any exported control images should preserve the canonical crop registration unless the whole avatar stack intentionally migrates to a new canvas.

- [ ] `source/master_stylized_reference.png`
- [ ] `source/alex-blank-crop.png`
- [ ] `source/alex-nohair-nude-crop.png`
- [ ] `source/alex-noface-blank.png`
- [ ] `source/alex-hair-nude-crop.png`
- [ ] `source/alex-hair-underwear-crop.png`
- [ ] `source/mask-test-clothing-guide.png`
- [ ] `source/control_silhouette.png`
- [ ] `source/control_openpose.png`
- [ ] `source/control_canny.png`
- [ ] `source/control_depth.png`
- [ ] `source/control_face_landmarks.png`
- [ ] `source/checkerboard_background.png`
- [ ] `source/sizzle_dark_ui_background.png`

## Greybox Scope Lock

For the first greybox/avatar proof, lock player appearance to:

- Skin tone: medium only.
- Hair style: long straight only.
- Eye colour: blue only.

The full three-by-three appearance matrix remains a later production goal. The greybox goal is to prove layer registration, compositing, and extraction on one coherent avatar.

## 1. Body Layer

Base body sprites should include body, head, ears, and blank/featureless face skin. They should not include hair, clothing, underwear, nipples, genitals, face details, eyes, brows, mouth, or other body modifications. To support overlays cleanly, avoid baked facial features.

- [ ] `body/20_body-light.png`
- [ ] `body/20_body-medium.png`
- [ ] `body/20_body-dark.png`

Count: **3**

Greybox count: **1** (`body/20_body-medium.png`)

## 2. Hair Back Layer

Hair back renders behind the body/clothing. Required for long styles; optional but useful for uniform handling of short bob.

### Short Bob

- [ ] `hair/back/30_hair-back-short-bob-brown.png`
- [ ] `hair/back/30_hair-back-short-bob-black.png`
- [ ] `hair/back/30_hair-back-short-bob-blonde.png`

### Long Straight

- [ ] `hair/back/30_hair-back-long-straight-brown.png`
- [ ] `hair/back/30_hair-back-long-straight-black.png`
- [ ] `hair/back/30_hair-back-long-straight-blonde.png`

### Long Curly

- [ ] `hair/back/30_hair-back-long-curly-brown.png`
- [ ] `hair/back/30_hair-back-long-curly-black.png`
- [ ] `hair/back/30_hair-back-long-curly-blonde.png`

Count: **9**

Greybox count: **1** (`hair/back/30_hair-back-long-straight-brown.png`)

## 3. Hair Front Layer

Hair front renders above body, clothing, and underwear. It contains bangs, face-framing strands, and any hair that falls over shoulders/chest.

### Short Bob

- [ ] `hair/front/70_hair-front-short-bob-brown.png`
- [ ] `hair/front/70_hair-front-short-bob-black.png`
- [ ] `hair/front/70_hair-front-short-bob-blonde.png`

### Long Straight

- [ ] `hair/front/70_hair-front-long-straight-brown.png`
- [ ] `hair/front/70_hair-front-long-straight-black.png`
- [ ] `hair/front/70_hair-front-long-straight-blonde.png`

### Long Curly

- [ ] `hair/front/70_hair-front-long-curly-brown.png`
- [ ] `hair/front/70_hair-front-long-curly-black.png`
- [ ] `hair/front/70_hair-front-long-curly-blonde.png`

Count: **9**

Greybox count: **1** (`hair/front/70_hair-front-long-straight-brown.png`)

## 4. Face Layer

Face layers contain neutral non-expression facial structure, especially the nose. They should not include irises, brows, mouth, hair, or skin outside the face feature area.

- [ ] `face/38_face-nose-medium.png`

Minimum count: **1**

## 5. Eye Layer

Eye layers should be iris/eye-colour overlays only, aligned to the same eye geometry. Avoid repainting eyelids, lashes, brows, skin, or expression.

- [ ] `eyes/40_eyes-blue.png`
- [ ] `eyes/40_eyes-green.png`
- [ ] `eyes/40_eyes-brown.png`

Count: **3**

Greybox count: **1** (`eyes/40_eyes-blue.png`)

## 6. Nipples Layer

Nipple layers contain chest anatomy details only. They render above body and below underwear/clothing. These may need tone-specific variants if one overlay does not blend across skin tones.

- [ ] `nipples/43_nipples-medium.png`

Greybox count: **1**

## 7. Genitals Layer

Genital layers contain pelvis anatomy details only. They render above body and below underwear/clothing. These may need tone-specific variants if one overlay does not blend across skin tones.

- [ ] `genitals/44_genitals-medium.png`

Greybox count: **1**

## 8. Body Mods Layer

Body mods are non-anatomy modifications: scars, tattoos, piercings, bruises, temporary marks, and other state overlays. Nipples and genitals do not live in `bodyMods`.

- [ ] `bodyMods/45_scar-small-torso.png`
- [ ] `bodyMods/45_tattoo-small-hip.png`

Count: **2**

## 9. Underwear Layer

Underwear must fit all three body skin tones and sit below outer clothing. Split bra/briefs so future topless/bottomless states can be represented.

- [ ] `underwear/50_bra-neutral-grey.png`
- [ ] `underwear/50_briefs-neutral-grey.png`

Optional variants:

- [ ] `underwear/50_bra-neutral-black.png`
- [ ] `underwear/50_briefs-neutral-black.png`
- [ ] `underwear/50_bra-neutral-white.png`
- [ ] `underwear/50_briefs-neutral-white.png`

Minimum count: **2**  
Expanded count: **6**

## 10. Clothing Bottom Layer

Bottoms render above underwear and below tops/hair front. For the briefing slice, one bottom is enough.

- [ ] `clothing/bottoms/55_dark-jeans.png`
- [ ] `clothing/bottoms/55_black-slacks.png`

Minimum count: **1**  
Recommended v1 count: **2**

## 11. Clothing Top Layer

Tops render above underwear and bottoms, below hair front. They must not include baked skin at collar, sleeves, or hem.

- [ ] `clothing/tops/60_black-tshirt.png`
- [ ] `clothing/tops/60_white-blouse.png`
- [ ] `clothing/tops/60_dark-sweater.png`

Minimum count: **1**  
Recommended v1 count: **3**

## 12. Shoes Layer

Shoes render above body/bottoms at the feet. They must align with the same foot position across all bodies.

- [ ] `clothing/shoes/65_black-practical-shoes.png`
- [ ] `clothing/shoes/65_sneakers.png`

Minimum count: **1**  
Recommended v1 count: **2**

## 13. Expression Layer

Current widgets expect separate mouth and brow sprites. These render in `expression`/foreground above face and hair-front where appropriate. Brows are expression layers, not part of `face`, `eyes`, or `hairFront`.

### Mouth

- [ ] `expression/80_mouth-calm.png`
- [ ] `expression/80_mouth-frown.png`
- [ ] `expression/80_mouth-open.png`
- [ ] `expression/80_mouth-smile.png`

### Brows

- [ ] `expression/81_brows-relaxed.png`
- [ ] `expression/81_brows-worried.png`
- [ ] `expression/81_brows-raised.png`
- [ ] `expression/81_brows-angry.png`
- [ ] `expression/81_brows-attentive.png`

Minimum count for current widgets: **6**  
Recommended v1 count: **9**

## 14. Overlay Layer

Optional atmospheric or state overlays.

- [ ] `overlay/90_arousal-flush-subtle.png`
- [ ] `overlay/90_nyse-influence-subtle.png`
- [ ] `overlay/90_shadow-soft.png`

Minimum count: **0**  
Optional count: **3**

## 15. Background Layer

Backgrounds sit behind the figure. These do not need to be transparent but should match the avatar canvas and not interfere with edge QA.

- [ ] `backgrounds/10_neutral-grey.png`
- [ ] `backgrounds/10_briefing-diner.png`
- [ ] `backgrounds/10_sizzle-backstage.png`

Minimum count: **1**  
Recommended v1 count: **2**

## 16. Composite QA Images

Create these after the individual layers exist. They are review outputs, not runtime assets.

- [ ] `qa/composite-light-short-bob-brown-blue-underwear.png`
- [ ] `qa/composite-light-long-straight-black-blue-black-tshirt-dark-jeans-shoes.png`
- [ ] `qa/composite-medium-long-straight-brown-green-white-blouse-dark-jeans-shoes.png`
- [ ] `qa/composite-dark-long-curly-blonde-brown-black-tshirt-black-slacks-shoes.png`
- [ ] `qa/composite-light-long-curly-brown-blue-underwear-frown.png`
- [ ] `qa/composite-medium-short-bob-black-green-underwear-surprised.png`
- [ ] `qa/composite-dark-long-straight-brown-brown-underwear-calm.png`

Count: **7**

## Count Summary

| Category | Minimum | Recommended v1 |
|---|---:|---:|
| Source/control assets | 14 | 14 |
| Body | 3 | 3 |
| Hair back | 9 | 9 |
| Hair front | 9 | 9 |
| Eyes | 3 | 3 |
| Nipples | 1 | 3 |
| Genitals | 1 | 3 |
| Face | 1 | 3 |
| Body mods | 0 | 2 |
| Underwear | 2 | 6 |
| Clothing bottoms | 1 | 2 |
| Clothing tops | 1 | 3 |
| Shoes | 1 | 2 |
| Expressions | 6 | 9 |
| Overlays | 0 | 3 |
| Backgrounds | 1 | 2 |
| QA composites | 7 | 7 |

Minimum production asset count, excluding source/control and QA: **39**

Recommended v1 production asset count, excluding source/control and QA: **60**

Including source/control and QA outputs:

- Minimum tracked files: **60**
- Recommended v1 tracked files: **81**
