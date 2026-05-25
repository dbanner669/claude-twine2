# Sizzle Avatar Bakeoff

This folder defines the ComfyUI bakeoff and draft-production workflow for Sizzle's layered avatar pipeline. It is research infrastructure, not production game art. Draft outputs should stay under `sizzle/docs/avatar-bakeoff/production-drafts/` or a clearly named external Comfy output folder until explicitly promoted; do not write generated assets directly to `sizzle/media/avatar/`.

**Current status:** see `STATUS.md` and `INTERIM-FINDINGS.md`. Early bakeoff results indicate the original direct text-to-image layer-generation approach is not consistent enough for production. The active process is now canonical-template image editing through ComfyUI, with fixed registration, local post-processing, and crossed composite QA.

Important companion files:

- `STATUS.md` - consolidated current state and file inventory.
- `OPTION-2-ASSET-TODO.md` - complete asset creation checklist for the expanded layer model.
- `phase-2-image-edit-protocol.md` - canonical-template plus image-edit protocol.
- `baseline-inputs/README.md` - user-provided Alex reference files, canonical cropped templates, and hashes.
- `master-candidates/README.md` - generated master-reference candidates and review criteria.

The primary question is not "which model makes the prettiest character?" The primary question is whether a stack can render **separate same-canvas avatar elements** that remain coherent when recombined through Sizzle's actual SugarCube avatar model.

Sizzle currently renders a generic runtime avatar widget, but the art target is now an explicit layer stack. The locked production target is:

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

The greybox proof deliberately locks appearance to medium skin, long straight hair, and blue eyes. The wider skin/hair/eye matrix remains a later production expansion after the layer process is proven.

## Contenders

1. **SDXL:** RealVisXL V5.0 + one SDXL realism/skin community LoRA.
2. **FLUX.2 Klein 4B:** Base and Distilled modes, each tested with:
   - no LoRA
   - `Excellent Full Nude Flux2 Klein 4B by Sarcastic Tofu`
   - `Klein Fixes NSFW`
3. **Pony realism:** CyberRealistic Pony + one Pony-compatible realism/skin community LoRA.

No custom Sizzle character LoRA is in scope for this bakeoff.

## Revised Phase 2 Direction

The active bakeoff phase tests image-edit workflows rather than fresh independent layer generation:

1. Start from the canonical `523x1536` Alex templates in `baseline-inputs/canonical/`.
2. Use FLUX.2 Klein image edit, preferably from the faceless/no-hair body for skin passes.
3. Keep Comfy working images padded to `576x1536` only for latent compatibility.
4. Crop back to `523x1536` and restore canonical alpha/silhouette before accepting a layer.
5. Composite crossed previews before promoting any family.

Current working setup:

- Local edit derivation: FLUX.2 Klein 4B image edit in ComfyUI.
- Clothing edit testing: Qwen Image Edit currently looks more promising for garment realism, but still needs strict canvas/alpha/pose validation.
- Prompting: short natural-language FLUX.2 prompts, no SD/SDXL-style negative prompt lists.
- Candidate staging: `production-drafts/candidates/v1/`.
- Body candidates: light, medium, and dark faceless-body layers exist as V1 candidates; greybox uses the medium candidate.

This is also an art-direction pivot: full realism should be deprioritized in favor of stylized realism / painterly semi-realism that can survive layer recombination.

## Recent Clothing Mask Tests

Recent clothing experiments tested black visual garment masks for a white t-shirt, dark jeans, and shoes:

- The built-in Codex imagegen path is not a production inpaint path. It can make a plausible concept image, but even with a tight guide it may redraw the whole avatar, change scale, and leave extraction residue.
- The user-provided `mask-test.png` is the best garment guide so far. It is much more coherent than the early Codex masks and should be used as the next reference mask shape.
- Qwen Image Edit produced the best clothing realism so far, but its first inspected output failed technical acceptance: it used a `576x1536` opaque RGB image, cropped the top of the head, shifted skin/lighting, omitted sneakers, and did not return transparent layers.

Next clothing tests should use:

```text
C:\Users\Oculus\Documents\ComfyUI\input\sizzle_alex_noface_blank_padded_576x1536.png
```

This image is derived from `baseline-inputs/canonical/alex-noface-blank.png`. After generation, crop the rightmost 53 px back to `523x1536`, restore canonical alpha, and extract only garment pixels.

## Avatar Target

Use this target across every contender:

- Adult woman, age 27.
- Canadian, blue eyes.
- Grounded 2005 Toronto undercover thriller tone.
- Natural proportions, understated photographic/semi-realistic look.
- Avoid influencer glamour, anime, 3D render, cartoon, celebrity likeness, and underage-coded styling.
- Test separate body, nipples, genitals, bodyMods, face, eyes, hair, underwear, clothing, expression, overlay, and background-capable layers.

Canonical canvas: `523x1536` for all accepted draft layers and QA composites. ComfyUI source/edit images may be padded to `576x1536`, but must be cropped back to `523x1536` before acceptance.

Layer lock requirements:

- Every generated layer must use the same canvas size, same body anchor, same face/head position, same shoulder line, and same garment anchor points.
- Body skin-tone sprites must change skin tone without changing body silhouette, face geometry, eye line, or attachment points.
- Hair sprites must change style/colour without repainting skin, eyes, clothing, or expression.
- Eye sprites must change eye colour without altering face, eyelids, makeup, or expression.
- Clothing sprites must be reusable over all tested body/hair/underwear combinations.
- Expression sprites must land on the same brows/mouth region over all body/hair/eye combinations.
- Underwear must be tested both as its own layer and under outer clothing.
- A layer fails if it only looks correct when baked into the original full-body render.
- Clothing tests fail if the source crop changes, the model alters visible skin or pose outside the garment area, or the extraction includes background/checker/skin residue.

Seed discipline:

- Control pass seed: `2309122005`
- LoRA pass seed: `2309122005`
- Consistency pass seeds:
  - neutral body: `2309122005`
  - professional outfit: `2309122006`
  - calm expression: `2309122007`
  - worried/surprised expression: `2309122008`
  - tasteful anatomy check: `2309122009`

## Workflow Files

The files under `workflows/` are ComfyUI workflow specifications. They define the intended graph, model slots, LoRA slots, prompts, settings, output names, and post-processing requirements.

They are intentionally explicit about required node families rather than claiming local validation. This repo does not contain ComfyUI, FLUX.2 Klein nodes, BiRefNet nodes, model checkpoints, or LoRA files. During setup, build or import the matching graph in the installed ComfyUI environment, then export the runnable Comfy workflow JSON back to these filenames while preserving the settings in each spec.

Required ComfyUI capabilities:

- SDXL checkpoint loading and LoRA loading.
- FLUX.2 Klein 4B Base and Distilled loading.
- FLUX-compatible LoRA loading.
- Pony/SDXL checkpoint and LoRA loading.
- BiRefNet or equivalent background-removal node producing RGBA PNG or alpha mask.
- Image save nodes that preserve metadata where supported.

## Run Protocol

1. Fill in exact model filenames and hashes in `loras.md`.
2. Build or reconcile each workflow JSON against the installed ComfyUI nodes.
3. Build a locked pose/geometry reference: same full-body silhouette, same head box, same shoulder line, same shirt collar/hem guide.
4. Run the **control pass** for every contender/mode with LoRA disabled.
5. Run the **LoRA pass**:
   - SDXL with its selected realism/skin LoRA.
   - Pony with its selected realism/skin LoRA.
   - FLUX.2 Base and Distilled separately with each user-specified NSFW/anatomy LoRA.
6. Pick each contender family's best setup.
7. Run the **layer-composition pass** for each best setup.
8. Complete `scorecard.md`.

The layer-composition pass is the scored core of the bakeoff. It must produce the v1 layer matrix defined in `layer-composition-protocol.md`, including body skin tones, hair style/colour sprites, eye colour sprites, underwear, top, bottom, shoes, expression mouth/brow parts, and crossed composite previews.

See `layer-composition-protocol.md` for exact scoring rules.

## Output Convention

Legacy Phase 1 workflow outputs used this output root:

`C:\tmp\sizzle-avatar-bakeoff\outputs\`

Use this folder shape:

```text
outputs/
  sdxl-realvisxl-v5/
    control/
    lora/
    layer-composition/
  flux2-klein-4b-base/
    control/
    excellent-full-nude/
    klein-fixes-nsfw/
    layer-composition/
  flux2-klein-4b-distilled/
    control/
    excellent-full-nude/
    klein-fixes-nsfw/
    layer-composition/
  pony-cyberrealistic/
    control/
    lora/
    layer-composition/
```

Current Phase 2 candidate outputs should save:

- Main RGB render.
- RGBA transparent PNG.
- Alpha/mask preview.
- Composite preview over dark, light, and Sizzle-like backgrounds.
- Manifest JSON using `manifest-template.json`.

Use `production-drafts/candidates/v1/` for current candidate layers and QA previews.

## Decision Rule

Pick one winner only if it scores at least `4/5` on:

- Cross-composition layer fit.
- Pixel/geometry stability.
- Sizzle aesthetic fit.
- Same-character consistency.
- Tasteful adult anatomy tolerance.
- Reproducibility.

If no contender clears the bar, do not promote a production stack. Mark the best stack as reference-only and run a second bakeoff with adjusted models/LoRAs.

Current interim decision: no Phase 1 text-to-image contender should be promoted yet. Continue only if the remaining results contradict `INTERIM-FINDINGS.md`; otherwise move to the Phase 2 image-edit process.
