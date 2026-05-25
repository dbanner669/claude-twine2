# Option 2 Avatar Asset TODO

Option 2 means the avatar runtime gets explicit visual layers instead of forcing hair/eyes into the current generic arrays. This checklist assumes the target stack is:

```text
background
hairBack
body
bodyMods
eyes
underwear
clothingBottom
clothingTop
shoes
hairFront
expression
overlay
```

All avatar assets must share the same full canvas, currently `1024x1360` for bakeoff/reference work. Production can downscale later, but every layer in a given set must keep identical dimensions and alignment.

## 0. Source / Control Assets

- [ ] `source/master_stylized_reference.png`
- [ ] `source/master_nohair_nude.png`
- [ ] `source/master_hair_nude.png`
- [ ] `source/master_hair_underwear.png`
- [ ] `source/control_silhouette.png`
- [ ] `source/control_openpose.png`
- [ ] `source/control_canny.png`
- [ ] `source/control_depth.png`
- [ ] `source/control_face_landmarks.png`
- [ ] `source/checkerboard_background.png`
- [ ] `source/sizzle_dark_ui_background.png`

## 1. Body Layer

Base body sprites should include body, head, face skin, nose, ears, and neutral non-eye facial structure. They should not include hair, clothing, underwear, or body modifications. To support expression overlays cleanly, avoid strongly baked mouth/brow shapes where possible.

- [ ] `body/20_body-light.png`
- [ ] `body/20_body-medium.png`
- [ ] `body/20_body-dark.png`

Count: **3**

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

## 4. Eye Layer

Eye layers should be iris/eye-colour overlays only, aligned to the same eye geometry. Avoid repainting eyelids, lashes, brows, skin, or expression.

- [ ] `eyes/40_eyes-blue.png`
- [ ] `eyes/40_eyes-green.png`
- [ ] `eyes/40_eyes-brown.png`

Count: **3**

## 5. Body Mods Layer

Not required for the character creator, but create one diagnostic layer to prove the layer works.

- [ ] `bodyMods/45_scar-small-torso.png`
- [ ] `bodyMods/45_tattoo-small-hip.png`

Count: **2**

## 6. Underwear Layer

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

## 7. Clothing Bottom Layer

Bottoms render above underwear and below tops/hair front. For the briefing slice, one bottom is enough.

- [ ] `clothing/bottoms/55_dark-jeans.png`
- [ ] `clothing/bottoms/55_black-slacks.png`

Minimum count: **1**  
Recommended v1 count: **2**

## 8. Clothing Top Layer

Tops render above underwear and bottoms, below hair front. They must not include baked skin at collar, sleeves, or hem.

- [ ] `clothing/tops/60_black-tshirt.png`
- [ ] `clothing/tops/60_white-blouse.png`
- [ ] `clothing/tops/60_dark-sweater.png`

Minimum count: **1**  
Recommended v1 count: **3**

## 9. Shoes Layer

Shoes render above body/bottoms at the feet. They must align with the same foot position across all bodies.

- [ ] `clothing/shoes/65_black-practical-shoes.png`
- [ ] `clothing/shoes/65_sneakers.png`

Minimum count: **1**  
Recommended v1 count: **2**

## 10. Expression Layer

Current widgets expect separate mouth and brow sprites. These render in `expression`/foreground above face and hair-front where appropriate.

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

## 11. Overlay Layer

Optional atmospheric or state overlays.

- [ ] `overlay/90_arousal-flush-subtle.png`
- [ ] `overlay/90_nyse-influence-subtle.png`
- [ ] `overlay/90_shadow-soft.png`

Minimum count: **0**  
Optional count: **3**

## 12. Background Layer

Backgrounds sit behind the figure. These do not need to be transparent but should match the avatar canvas and not interfere with edge QA.

- [ ] `backgrounds/10_neutral-grey.png`
- [ ] `backgrounds/10_briefing-diner.png`
- [ ] `backgrounds/10_sizzle-backstage.png`

Minimum count: **1**  
Recommended v1 count: **2**

## 13. Composite QA Images

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
| Source/control assets | 11 | 11 |
| Body | 3 | 3 |
| Hair back | 9 | 9 |
| Hair front | 9 | 9 |
| Eyes | 3 | 3 |
| Body mods | 0 | 2 |
| Underwear | 2 | 6 |
| Clothing bottoms | 1 | 2 |
| Clothing tops | 1 | 3 |
| Shoes | 1 | 2 |
| Expressions | 6 | 9 |
| Overlays | 0 | 3 |
| Backgrounds | 1 | 2 |
| QA composites | 7 | 7 |

Minimum production asset count, excluding source/control and QA: **36**

Recommended v1 production asset count, excluding source/control and QA: **53**

Including source/control and QA outputs:

- Minimum tracked files: **54**
- Recommended v1 tracked files: **71**
