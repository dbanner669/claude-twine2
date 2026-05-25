# Phase 2 Protocol: Master Reference + Image Edit

This protocol replaces the original assumption that independent text-to-image generations can produce production-ready avatar layers.

## Goal

Test whether a model stack can start from one approved master avatar and derive reusable Sizzle layers through controlled image edits.

Primary success condition:

```text
one master sprite -> edited variants -> extracted layers -> crossed composites still align
```

## Required Inputs

Create one approved master sprite/reference before running edits.

Master requirements:

- Adult woman, age 27.
- Front-facing 3:4 avatar pose.
- Hands/arms positioned to avoid covering clothing.
- Hair pulled or shaped so hair-front/hair-back separation can be tested.
- Neutral expression.
- Simple neutral underwear or body-safe reference state.
- Stylized realism / painterly semi-realism, not full photographic realism.
- Clean, readable silhouette.
- Lighting simple enough that derived layers will not fight each other.
- Canvas: `1024x1360`.

Recommended master-reference prompt direction:

```text
stylized realistic visual novel character sprite, adult 27 year old Canadian woman, grounded undercover thriller tone, 2005 Toronto, realistic proportions, clean silhouette, controlled soft lighting, subtle painterly realism, front-facing avatar pose, neutral expression, plain background, designed for layered PNG game avatar
```

## Copy-Ready ChatGPT Image Prompt

Use this when generating the first master reference. The goal is to create a stable art-direction anchor, not a finished production layer.

```text
Create a full-body character sprite reference for an adult interactive fiction game called Sizzle.

This image will be used as the master reference for a layered PNG avatar system. The final game avatar will be built from separate transparent layers: base body, skin tone variants, hair style and hair colour variants, eye colour overlays, underwear, clothing items, shoes, and facial expression overlays. Because of that, the character must be drawn in a clean, stable, front-facing pose with clear attachment points for hair, clothing, and expression layers.

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

## Phase 2A: Master Candidate Generation

Before testing local image-edit models, generate a small set of master avatar candidates with Codex/ChatGPT-style image generation. This phase is allowed to be more art-directable and less offline-pure because its purpose is to establish the baseline look, pose, silhouette, and stylization target. Treat these images as **reference candidates** until the project formally accepts cloud-generated master art.

The output of this phase is not a final production layer. It is the visual anchor that later edit/inpaint models must preserve.

Generate 3-5 candidates with the same production constraints:

- Full-body, centered, front-facing.
- Adult woman, age 27.
- Neutral underwear baseline: plain opaque bra and briefs.
- Arms relaxed slightly away from torso.
- Hands visible and not occluding body.
- Feet visible and aligned to a simple standing pose.
- Plain neutral background.
- Stylized realism / painterly semi-realism.
- Clean sprite silhouette over photographic realism.
- No props, no logos, no modern fashion tells, no celebrity likeness.

Candidate review criteria:

- Does the pose support reusable clothing layers?
- Does the hair silhouette support hair-front/hair-back separation?
- Are face, eyes, brows, and mouth clear enough for expression overlays?
- Is the body attractive but grounded, adult, and non-caricatured?
- Does the style feel like Sizzle: mature, 2005 Toronto thriller, erotic-capable but not pornographic?
- Would this still look good as a small avatar panel in the current UI?

Once one master candidate is approved, save it as:

- `master_stylized_reference.png`
- `master_manifest.json`

Then move to Phase 2B.

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

After a master candidate is approved, build ComfyUI workflows for the local edit phase. These workflows should not repeat the Phase 1 mistake of relying on prompts alone. They must include an explicit control phase that derives and reuses control images from the approved master.

Required workflow families:

- `qwen-image-edit-master-variants.json`
- `flux2-klein-image-edit-master-variants.json`
- Optional fallback: `sdxl-inpaint-controlnet-master-variants.json`

Each workflow must include:

- Master image loader.
- Mask loader or mask-generation node.
- Control image loaders derived from the master.
- Image-edit/inpaint model loader.
- Prompt slot for the single attribute being changed.
- Negative/constraint prompt slot.
- Output saver for edited RGB image.
- Optional alpha extraction pass or export handoff to BiRefNet/rembg workflow.

Control phase:

- Generate and save a canonical pose/edge/depth/control bundle from the approved master.
- At minimum:
  - `control_openpose.png` or equivalent body pose guide.
  - `control_canny.png` or soft edge guide.
  - `control_depth.png` if supported.
  - `control_silhouette_mask.png`.
  - `control_face_landmarks.png` if supported.
- The edit workflows must reuse these controls for every variant.

Edit workflow requirement:

- The edit model receives the master image plus a tight mask for the target change.
- Control images constrain the full canvas, not just the masked area.
- The prompt asks for exactly one changed attribute.
- Denoise/edit strength starts low enough to preserve geometry.
- Every output keeps `1024x1360` dimensions.

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

- `master_stylized_reference.png`
- `master_manifest.json`

Edited variants:

- `edit_skin-medium.png`
- `edit_skin-dark.png`
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
- `30_hair-long-straight-black.png`
- `30_hair-long-straight-blonde.png`
- `30_hair-short-bob-brown.png`
- `30_hair-long-curly-brown.png`
- `35_eyes-green.png`
- `35_eyes-brown.png`
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
- Extracted layer only works over the image it was edited from.
- Style drifts toward full photo realism, anime, or adult-site gloss.

Strong pass:

- Most edits alter only the target attribute.
- Extracted layers work over crossed body/hair/clothing combinations.
- Stylized realism stays consistent.
- Final composites look intentionally designed, not patched together.
