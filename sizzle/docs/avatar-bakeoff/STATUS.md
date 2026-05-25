# Avatar Bakeoff Status

Last updated: 2026-05-25

This folder now covers four related efforts:

1. The original offline model bakeoff: SDXL/RealVisXL, FLUX.2 Klein 4B, and CyberRealistic Pony.
2. The process pivot after early results showed direct text-to-image layer generation is not stable enough.
3. The Option 2 asset plan for a more explicit layered avatar runtime.
4. The active FLUX.2 Klein ComfyUI image-edit workflow and V1 body-candidate workspace.

## Current Conclusion

The direct independent-generation workflow should not be promoted to production yet. Early bakeoff results show that current text-to-image models can make attractive full-body sprites, but they do not reliably preserve the exact body silhouette, face geometry, hair attachment points, garment seams, and alpha edges needed for mix-and-match avatar layers.

The recommended next path is:

1. Use the approved canonical Alex templates as fixed registration references.
2. Use controlled image-edit workflows to alter one attribute at a time.
3. Extract transparent layers from those edited outputs.
4. Test crossed composites before accepting any generated layer.

This means the bakeoff is now primarily about **pixel-stable editable layers**, not one-off image quality.

## Latest Clothing Edit Finding

The clothing workflow is still not production-ready, but the latest tests clarified the path:

- Built-in Codex image generation can create useful clothing concept tests, but it does not act like a hard masked inpaint workflow. Even with a good visual mask, it tends to redraw, rescale, or relight the whole avatar. Treat these outputs as concept evidence only, not extractable production layers.
- Mask quality is decisive. The early Codex clothing masks failed for basic garment geometry. The best mask shape so far is the user-provided `C:\Users\Oculus\Downloads\mask-test.png`, which uses coherent black garment regions for shirt, jeans, and shoes on the same avatar canvas.
- Qwen Image Edit is currently the most promising clothing-edit direction. The test output `C:\Users\Oculus\Downloads\ComfyUI_00046_.png` produced a plausible white t-shirt and dark jeans, but it failed production gates because it was RGB/opaque `576x1536`, cropped the head at the top, changed skin/lighting, omitted sneakers, and did not preserve canonical alpha.
- For the next clothing test, use `C:\Users\Oculus\Documents\ComfyUI\input\sizzle_alex_noface_blank_padded_576x1536.png` as the source image. It is derived from `baseline-inputs/canonical/alex-noface-blank.png`. If the model requires the user mask, copy/use `C:\Users\Oculus\Documents\ComfyUI\input\mask-test.png` as the visual guide.
- Accepted clothing outputs must be cropped from padded `576x1536` back to `523x1536` by removing the rightmost 53 px, then restored to the canonical alpha/silhouette before layer extraction.

## Files Added By This Work

Core research and protocol:

- `../AVATAR-RESEARCH.md` - offline stack research report and original model-landscape recommendation.
- `README.md` - bakeoff overview, current status, contender list, protocol, and output convention.
- `INTERIM-FINDINGS.md` - recorded process discovery and the case for the Phase 2 pivot.
- `phase-2-image-edit-protocol.md` - canonical-template plus image-edit workflow protocol.
- `layer-composition-protocol.md` - the actual pass/fail test for mix-and-match avatar layers.
- `OPTION-2-ASSET-TODO.md` - full production asset checklist for the expanded layer model.

Bakeoff setup:

- `loras.md` - model and LoRA candidate registry, including the two user-provided FLUX.2 Klein NSFW/anatomy LoRAs.
- `prompts.md` - prompt templates for the original bakeoff pass.
- `scorecard.md` - scoring rubric.
- `manifest-template.json` - required sidecar metadata shape.

ComfyUI workflow scaffolding:

- `workflows/*.json` - human-readable workflow specifications for SDXL, FLUX.2 Klein Base, FLUX.2 Klein Distilled, and Pony realism.
- `workflows/api/*.api.json` - generated ComfyUI `/prompt` API workflow drafts for layer-matrix runs.
- `workflows/api/README.md` - notes for using the API workflow drafts.
- `workflows/phase2-edit/` - active FLUX.2 Klein image-edit workflow, prompt presets, input prep scripts, and post-processing helpers.
- `build_workflows.py` - generator for the API workflow drafts.

Reference inputs:

- `master-candidates/` - generated stylized master-reference candidates for user review.
- `baseline-inputs/` - filed user-provided Alex baseline references, with hashes and intended roles.
- `baseline-inputs/canonical/` - current canonical cropped transparent templates.
- `production-drafts/candidates/v1/` - current V1 candidate workspace; contains body skin-tone candidates and QA previews.
- `production-drafts/imagegen-clothing-test*/` - built-in imagegen clothing-mask experiments; useful for process evidence only.
- `production-drafts/mask-approval/` - Codex clothing mask iterations; superseded for the next test by the user-supplied mask.
- `production-drafts/imagegen-clothing-test-user-mask/` - best built-in imagegen clothing concept test using the user mask; still not production-safe because the generator redrew/rescaled the figure.

## Current Reference Inputs

The user-provided Alex crop files are filed under `baseline-inputs/canonical/` and are the current canonical templates. They share a `523x1536` transparent canvas and should be treated as the default inputs for:

- Control-map extraction.
- Pose and silhouette locking.
- Testing whether local edit models can preserve one body/face geometry.
- Comparing hair, underwear, and no-hair states.
- Building the faceless body layer workflow, with face, eyes, nipples, genitals, and expressions separated into overlays.

The older full-frame Alex files remain in `baseline-inputs/` for provenance and comparison only.

The generated master candidates under `master-candidates/` are references only. They are useful for art-direction comparison, but the active production workflow is based on the canonical Alex crops.

## Option 2 Runtime Target

Option 2 assumes the eventual runtime exposes explicit visual layers rather than burying hair, eyes, and clothing inside generic arrays:

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

See `OPTION-2-ASSET-TODO.md` for the complete checklist. The current minimum production target is 39 generated production layers, excluding source/control files and QA composites. The recommended v1 target is 60 generated production layers, excluding source/control files and QA composites.

For the greybox proof, appearance is locked to one coherent avatar: medium skin, long straight hair, and blue eyes. This intentionally defers the full skin/hair/eye matrix until the layer-production process is proven.

## Next Decisions Needed

- Decide when Option 2 runtime changes should be implemented for the locked explicit layer stack.
- Continue deriving Comfy inputs and control images from `baseline-inputs/canonical/`, not the older full-frame inputs.
- Continue V1 greybox production from the faceless medium body, long straight hair, and blue eyes.
- Continue clothing tests with Qwen Image Edit or another local edit model using the noface padded input and the user mask as guide; reject outputs that crop the head/feet, alter unmasked skin, or fail to produce all requested garments.
- Capture exact local model filenames, hashes, trigger words, and licenses before any scored run.
- Run crossed composites from `layer-composition-protocol.md` before accepting any asset family.
