# Sizzle Avatar Bakeoff

This folder defines the ComfyUI bakeoff for Sizzle's layered avatar pipeline. It is research infrastructure, not production game art. Generated images must go to `C:\tmp\sizzle-avatar-bakeoff\outputs\`, not `sizzle/media/avatar/`.

**Current status:** see `STATUS.md` and `INTERIM-FINDINGS.md`. Early bakeoff results indicate the original direct text-to-image layer-generation approach is not consistent enough for production. The workflows in this folder are now Phase 1 evidence and diagnostics. The recommended next process is stylized master-reference generation plus controlled image-edit derivation.

Important companion files:

- `STATUS.md` - consolidated current state and file inventory.
- `OPTION-2-ASSET-TODO.md` - complete asset creation checklist for the expanded layer model.
- `phase-2-image-edit-protocol.md` - master-reference plus image-edit protocol.
- `baseline-inputs/README.md` - user-provided Alex reference files and hashes.
- `master-candidates/README.md` - generated master-reference candidates and review criteria.

The primary question is not "which model makes the prettiest character?" The primary question is whether a stack can render **separate same-canvas avatar elements** that remain coherent when recombined through Sizzle's actual SugarCube avatar model.

Sizzle currently renders six runtime arrays, bottom to top:

1. `$avatar.background[]`
2. `$avatar.body[]`
3. `$avatar.bodyMods[]`
4. `$avatar.underwear[]`
5. `$avatar.clothing[]`
6. `$avatar.foreground[]`

The art checklist subdivides those runtime arrays into production sprites: skin-tone body sprites, hair style/colour sprites, eye colour sprites, body modifications, underwear, clothing slots, and expression parts. The bakeoff must test that these sprites can be generated independently and recombined without repainting or drifting.

## Contenders

1. **SDXL:** RealVisXL V5.0 + one SDXL realism/skin community LoRA.
2. **FLUX.2 Klein 4B:** Base and Distilled modes, each tested with:
   - no LoRA
   - `Excellent Full Nude Flux2 Klein 4B by Sarcastic Tofu`
   - `Klein Fixes NSFW`
3. **Pony realism:** CyberRealistic Pony + one Pony-compatible realism/skin community LoRA.

No custom Sizzle character LoRA is in scope for this bakeoff.

## Revised Phase 2 Direction

The next bakeoff phase should test image-edit workflows rather than fresh independent layer generation:

1. Create or select one approved stylized master avatar.
2. Use an image-edit model to change one attribute at a time.
3. Extract the changed element as a transparent layer.
4. Composite it back over the original master and crossed appearance variants.
5. Score pixel stability and style consistency before model beauty.

Likely candidates:

- Master reference generation: high-adherence image generation such as ChatGPT image generation, if cloud reference generation is accepted.
- Local edit derivation: Qwen Image Edit, FLUX.2 Klein image edit, or another local edit/inpaint workflow with adult/tasteful anatomy tolerance.
- Alpha extraction: BiRefNet/rembg plus manual QA.

This is also an art-direction pivot: full realism should be deprioritized in favor of stylized realism / painterly semi-realism that can survive layer recombination.

## Avatar Target

Use this target across every contender:

- Adult woman, age 27.
- Canadian, blue eyes.
- Grounded 2005 Toronto undercover thriller tone.
- Natural proportions, understated photographic/semi-realistic look.
- Avoid influencer glamour, anime, 3D render, cartoon, celebrity likeness, and underage-coded styling.
- Test separate body, hair, eyes, bodyMods, underwear, clothing, expression, and background-capable layers.

Canvas: `1024x1360` for all tests. This is effectively a 3:4 portrait canvas and keeps both dimensions divisible by 16 for FLUX.2 Klein compatibility.

Layer lock requirements:

- Every generated layer must use the same canvas size, same body anchor, same face/head position, same shoulder line, and same garment anchor points.
- Body skin-tone sprites must change skin tone without changing body silhouette, face geometry, eye line, or attachment points.
- Hair sprites must change style/colour without repainting skin, eyes, clothing, or expression.
- Eye sprites must change eye colour without altering face, eyelids, makeup, or expression.
- Clothing sprites must be reusable over all tested body/hair/underwear combinations.
- Expression sprites must land on the same brows/mouth region over all body/hair/eye combinations.
- Underwear must be tested both as its own layer and under outer clothing.
- A layer fails if it only looks correct when baked into the original full-body render.

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

Use this output root:

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

Each run should save:

- Main RGB render.
- RGBA transparent PNG.
- Alpha/mask preview.
- Composite preview over dark, light, and Sizzle-like backgrounds.
- Manifest JSON using `manifest-template.json`.

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
