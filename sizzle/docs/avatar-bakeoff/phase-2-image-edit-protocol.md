# Phase 2 Protocol: Canonical Template + Image Edit

This protocol replaces the original assumption that independent text-to-image generations can produce production-ready avatar layers.

## Goal

Test whether a model stack can start from approved canonical avatar templates and derive reusable Sizzle layers through controlled image edits.

Primary success condition:

```text
canonical template -> edited variants -> extracted layers -> crossed composites still align
```

## Required Inputs

Use the approved canonical cropped templates before running edits. Earlier protocol text referred to creating a separate master sprite; the current Sizzle process instead treats the user-provided Alex canonical crops as the fixed master registration.

Current canonical template set:

- `baseline-inputs/canonical/alex-blank-crop.png`
- `baseline-inputs/canonical/alex-nohair-nude-crop.png`
- `baseline-inputs/canonical/alex-noface-blank.png`
- `baseline-inputs/canonical/alex-hair-nude-crop.png`
- `baseline-inputs/canonical/alex-hair-underwear-crop.png`

These cropped transparent-background templates are the default source references for Phase 2 control-map extraction and image-edit tests. They share a `523x1536` canvas; any derived control maps, edit outputs, masks, and extracted layers should preserve that registration unless the project explicitly migrates to a new canonical canvas.

Canonical/reference requirements:

- Adult woman, age 27.
- Front-facing 3:4 avatar pose.
- Hands/arms positioned to avoid covering clothing.
- Hair pulled or shaped so hair-front/hair-back separation can be tested.
- Neutral expression.
- Simple neutral underwear or body-safe reference state.
- Stylized realism / painterly semi-realism, not full photographic realism.
- Clean, readable silhouette.
- Lighting simple enough that derived layers will not fight each other.
- Canvas: `523x1536` for accepted draft layers. ComfyUI working images may be padded to `576x1536` and cropped back after generation.

Legacy master-reference prompt direction:

```text
stylized realistic visual novel character sprite, adult 27 year old Canadian woman, grounded undercover thriller tone, 2005 Toronto, realistic proportions, clean silhouette, controlled soft lighting, subtle painterly realism, front-facing avatar pose, neutral expression, plain background, designed for layered PNG game avatar
```

## Copy-Ready ChatGPT Image Prompt

This is retained for historical reference and optional art-direction exploration. The active production workflow now uses the canonical Alex templates instead of generating a new master reference.

```text
Create a full-body character sprite reference for an adult interactive fiction game called Sizzle.

This image will be used as the art-direction reference for a layered PNG avatar system. The final game avatar will be built from separate transparent layers: body, nipples, genitals, non-anatomy body mods, face, eyes, hair back/front, underwear, clothing bottoms, clothing tops, shoes, expressions, overlays, and backgrounds. Because of that, the character must be drawn in a clean, stable, front-facing pose with clear attachment points for hair, clothing, anatomy overlays, and expression layers.

Subject:
- Adult woman, age 27.
- Canadian federal undercover operative.
- Natural, believable proportions.
- Attractive but grounded, not model-glamour, not influencer, not pin-up exaggeration.
- She should feel like a real person in a classy 2005 Toronto erotic thriller: intelligent, observant, controlled, and slightly guarded.

Setting/tone:
- The game is set in Toronto in 2005/2006.
- Genre tone: grounded undercover thriller with adult erotic content later in the story.
- The art should feel mature, stylish, and story-driven, not pornographic in this reference image.
- Think polished visual-novel character sprite with realistic proportions and subtle painterly realism.

Style:
- Stylized realism / painterly semi-realism.
- Clean readable silhouette.
- Controlled soft lighting.
- Moderate detail, not full photographic realism.
- Avoid anime, cartoon, 3D render, glossy fashion editorial, influencer portrait, hyperreal skin texture, and adult-site glamour.
- The image should be easy to separate into transparent PNG layers later.

Pose and composition:
- Full body, centered, front-facing.
- Neutral standing pose.
- Arms relaxed slightly away from the torso so clothing layers can be extracted cleanly.
- Hands visible but not covering the body.
- Legs in a simple natural stance.
- Head level, eyes forward.
- Neutral calm expression.
- Plain neutral background.
- No dramatic shadows crossing the body.
- No props, no phone, no bag, no furniture.

Layering constraints:
- Hair should have a clear silhouette and should not obscure too much of the shoulders or chest.
- Clothing should be simple enough to use as a template for later clothing layers.
- Use simple neutral underwear or a minimal body-safe reference outfit; this is an anatomical/layering reference, not an erotic scene.
- Avoid loose scarves, complex jewelry, transparent fabric, extreme poses, crossed arms, hands on hips, or anything that would make layer extraction difficult.

Character design:
- Era-appropriate for 2005, understated and believable.
- No modern smartphone-era styling.
- No visible brand logos.
- No celebrity likeness.
- Do not make her look underage.

Output:
- One full-body character sprite reference.
- Plain background.
- Consistent lighting.
- Clean edges.
- The image should look like the approved baseline art style for a layered game avatar system.
```

## ChatGPT Follow-Up Edit Prompt Pattern

Use this after a master is approved, if using ChatGPT image generation to explore edit feasibility before moving edits into local tools.

```text
Using the approved master avatar as the identity, pose, canvas, and art-style reference, create a new version that changes only [TARGET ATTRIBUTE].

Preserve everything else exactly as much as possible:
- Same character identity.
- Same adult age and proportions.
- Same front-facing pose.
- Same head position, eye line, shoulders, torso, hands, legs, and feet.
- Same canvas framing.
- Same lighting and painterly semi-realistic style.
- Same plain background.

Only change:
- [EXAMPLE: hair colour from brown to black]

Do not change:
- Face shape.
- Body shape.
- Skin tone unless specifically requested.
- Clothing unless specifically requested.
- Expression unless specifically requested.
- Pose, framing, lighting, or style.

This is for a layered PNG game avatar, so the edited result must remain geometrically aligned with the master image for later layer extraction.
```

## Phase 2A: Canonical Template Selection

Earlier Phase 2A proposed generating master candidates with Codex/ChatGPT-style image generation. That path failed the mask/pose test for production layers. The current canonical source is the user-provided Alex template set, especially `alex-noface-blank.png` for body skin-tone work.

Current body production approach:

- Start from `alex-noface-blank.png`.
- Use FLUX.2 Klein image edit for skin-tone candidates.
- Use simple natural-language prompts and low CFG.
- Prefer raw output when silhouette adheres well, then crop padded output back to `523x1536` and restore canonical alpha.
- Keep `face`, `eyes`, `expression/brows`, `expression/mouth`, `nipples`, and `genitals` as separate overlays.

Current clothing production approach:

- Start from the noface blank body when testing clothing shape unless a specific hair/underwear occlusion test is intended.
- For ComfyUI, use `C:\Users\Oculus\Documents\ComfyUI\input\sizzle_alex_noface_blank_padded_576x1536.png` as the current source image.
- Use the user-provided `mask-test.png` style as the garment-region guide: black filled shirt, jeans, and shoe regions on the same avatar pose.
- Treat built-in Codex image generation as concept-only for clothing. It does not guarantee hard-mask preservation of unmasked pixels.
- Treat Qwen Image Edit as the current best clothing-model candidate, pending a successful no-crop, no-skin-drift, all-garments run.

## Phase 2B: Candidate Model Roles

Master generator:

- Codex/ChatGPT image generation or another high-adherence image model.
- This can be cloud-assisted concept/reference generation only if the offline constraint is relaxed for reference creation.

Local edit generator:

- Qwen Image Edit.
- FLUX.2 Klein image edit.
- Other local inpaint/edit workflows if they can preserve geometry and tolerate adult/tasteful anatomy.

Matting/segmentation:

- BiRefNet first.
- rembg as a simple fallback.
- SAM-style correction only when a mask needs manual prompting.

## Phase 2C: Comfy Edit Workflow Build

After the canonical source is selected, build ComfyUI workflows for the local edit phase. These workflows should not repeat the Phase 1 mistake of relying on prompts alone. They must preserve canonical registration and either use hard-mask compositing or post-process the raw output by restoring canonical alpha.

Required workflow families:

- `workflows/phase2-edit/flux2-klein-4b-base-mask-edit.api.json`
- Optional later: `qwen-image-edit-master-variants.json`
- Optional fallback: `sdxl-inpaint-controlnet-master-variants.json`

Each workflow must include:

- Canonical source image loader.
- Mask loader or mask-generation node.
- Control image loaders derived from the master.
- Image-edit/inpaint model loader.
- Prompt slot for the single attribute being changed.
- Empty negative conditioning for FLUX.2 unless a later workflow documents a FLUX-compatible negative guidance method.
- Output saver for edited RGB image.
- Optional alpha extraction pass or export handoff to BiRefNet/rembg workflow.

Control phase:

- Generate and save a canonical pose/edge/depth/control bundle from the approved template set.
- At minimum:
  - `control_openpose.png` or equivalent body pose guide.
  - `control_canny.png` or soft edge guide.
  - `control_depth.png` if supported.
  - `control_silhouette_mask.png`.
  - `control_face_landmarks.png` if supported.
- The edit workflows must reuse these controls for every variant.

Edit workflow requirement:

- The edit model receives the canonical source image plus a tight mask for the target change when masking helps. For broad body skin-tone edits, raw FLUX output may preserve texture better; in that case crop back to `523x1536` and restore canonical alpha.
- Control images constrain the full canvas, not just the masked area.
- The prompt asks for exactly one changed attribute.
- Denoise/edit strength starts low enough to preserve geometry.
- Every accepted output keeps `523x1536` dimensions. Comfy working outputs may be `576x1536` and must be cropped back.

Clothing edit source rule:

- Use `sizzle_alex_noface_blank_padded_576x1536.png` for the next shirt/jeans/shoes tests.
- Do not use the hair/underwear source for the main clothing test unless the goal is specifically to evaluate hair or underwear occlusion.
- If the edit model outputs `576x1536`, the rightmost 53 px are padding. Crop them away before QA.
- Restore the canonical transparent alpha from `alex-noface-blank.png` before extracting clothing layers.

Recommended initial edit settings:

- Start with conservative denoise/edit strength.
- Increase only if the requested attribute does not change.
- Prefer failed-underedited outputs over outputs that alter pose, face geometry, body silhouette, or style.

The generated Comfy workflows should be saved under:

```text
sizzle/docs/avatar-bakeoff/workflows/phase2-edit/
```

These workflow files become the implementation target for the next local bakeoff round.

## Edit Tests

Run each edit from the same approved master.

### Appearance Edits

- Skin tone: light -> medium.
- Skin tone: light -> dark.
- Hair colour: brown -> black.
- Hair colour: brown -> blonde.
- Hair style: long straight -> short bob.
- Hair style: long straight -> long curly.
- Eye colour: blue -> green.
- Eye colour: blue -> brown.

### Clothing / Underwear Edits

- Add neutral bra.
- Add neutral briefs.
- Add black t-shirt.
- Add white blouse.
- Add dark jeans.
- Add sneakers.

For the shirt/jeans/sneakers test, the model prompt should explicitly say that the pose, canvas, crop, body silhouette, blank face, visible skin, lighting, and unmasked regions must remain unchanged. For FLUX.2, phrase this as positive natural language rather than a negative prompt list.

### Expression Edits

- Calm/neutral.
- Frown/worried.
- Surprised/open mouth.
- Relaxed brows.
- Worried brows.
- Raised brows.

## Extraction Method

For each edit:

1. Align edited output to the master canvas.
2. Difference-check against the master to identify changed regions.
3. Use a mask to isolate the intended changed element.
4. Extract the changed element as transparent PNG.
5. Composite it over the master and crossed variants.
6. Reject the layer if the edit changed unrelated geometry that cannot be cleanly isolated.

Allowed cleanup:

- Alpha cleanup.
- Small matte feather/choke.
- Removing background residue.
- Cropping nothing; canvas must stay full size.

Not allowed for scoring:

- Hand-painting geometry to make a failed layer fit.
- Moving, scaling, or warping a generated layer after extraction.
- Baking skin into clothing.
- Baking hair into face/body layers.

## Required Outputs

Master:

- `source/alex-noface-blank.png`
- `source/alex-blank-crop.png`
- `source/alex-nohair-nude-crop.png`
- `source/alex-hair-nude-crop.png`
- `source/alex-hair-underwear-crop.png`
- `master_manifest.json` or candidate report JSON

Edited variants:

- `edit_skin-medium.png`
- `edit_skin-dark.png`
- `edit_face-nose.png`
- `edit_eyes-blue.png`
- `edit_brows-relaxed.png`
- `edit_mouth-calm.png`
- `edit_nipples-medium.png`
- `edit_genitals-medium.png`
- `edit_hair-black.png`
- `edit_hair-blonde.png`
- `edit_hair-short-bob.png`
- `edit_hair-long-curly.png`
- `edit_eyes-green.png`
- `edit_eyes-brown.png`
- `edit_underwear-bra.png`
- `edit_underwear-briefs.png`
- `edit_top-blackTshirt.png`
- `edit_top-whiteBlouse.png`
- `edit_bottom-darkJeans.png`
- `edit_shoes-sneakers.png`
- `edit_expression-frown.png`
- `edit_expression-surprised.png`

Extracted layers should use Sizzle-compatible names:

- `20_body-light.png`
- `20_body-medium.png`
- `20_body-dark.png`
- `38_face-nose-medium.png`
- `40_eyes-blue.png`
- `43_nipples-medium.png`
- `44_genitals-medium.png`
- `30_hair-long-straight-black.png`
- `30_hair-long-straight-blonde.png`
- `30_hair-short-bob-brown.png`
- `30_hair-long-curly-brown.png`
- `40_eyes-green.png`
- `40_eyes-brown.png`
- `underwear/neutral-bra.png`
- `underwear/neutral-briefs.png`
- `clothing/tops/blackTshirt.png`
- `clothing/tops/whiteBlouse.png`
- `clothing/bottoms/darkJeans.png`
- `clothing/shoes/sneakers.png`
- `expression/mouth-frown.png`
- `expression/mouth-open.png`
- `expression/brows-worried.png`
- `expression/brows-raised.png`

## Scoring

Score each edit model on:

- Geometry preservation.
- Single-attribute edit discipline.
- Layer extractability.
- Cross-composite fit.
- Stylized art direction fit.
- Adult/tasteful anatomy tolerance.
- Alpha/matte quality.
- Repeatability with saved edit settings.

Hard fail:

- Edit changes face identity when only clothing changes.
- Edit changes body silhouette when only skin tone changes.
- Edit changes pose/canvas framing.
- Edit crops the top of the head, feet, or hands relative to the canonical canvas.
- Clothing edit changes unmasked skin tone, lighting, body proportions, or blank-face state.
- Clothing output omits a requested garment, such as shoes in a full outfit test.
- Output is only an opaque RGB full render with no recoverable alpha or clean extraction path.
- Extracted layer only works over the image it was edited from.
- Style drifts toward full photo realism, anime, or adult-site gloss.

Strong pass:

- Most edits alter only the target attribute.
- Extracted layers work over crossed body/hair/clothing combinations.
- Stylized realism stays consistent.
- Final composites look intentionally designed, not patched together.
