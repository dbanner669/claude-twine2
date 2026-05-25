# Avatar Bakeoff Status

Last updated: 2026-05-25

This folder now covers three related efforts:

1. The original offline model bakeoff: SDXL/RealVisXL, FLUX.2 Klein 4B, and CyberRealistic Pony.
2. The process pivot after early results showed direct text-to-image layer generation is not stable enough.
3. The Option 2 asset plan for a more explicit layered avatar runtime.

## Current Conclusion

The direct independent-generation workflow should not be promoted to production yet. Early bakeoff results show that current text-to-image models can make attractive full-body sprites, but they do not reliably preserve the exact body silhouette, face geometry, hair attachment points, garment seams, and alpha edges needed for mix-and-match avatar layers.

The recommended next path is:

1. Pick or create one stylized master avatar reference.
2. Use controlled image-edit workflows to alter one attribute at a time.
3. Extract transparent layers from those edited outputs.
4. Test crossed composites before accepting any generated layer.

This means the bakeoff is now primarily about **pixel-stable editable layers**, not one-off image quality.

## Files Added By This Work

Core research and protocol:

- `../AVATAR-RESEARCH.md` - offline stack research report and original model-landscape recommendation.
- `README.md` - bakeoff overview, current status, contender list, protocol, and output convention.
- `INTERIM-FINDINGS.md` - recorded process discovery and the case for the Phase 2 pivot.
- `phase-2-image-edit-protocol.md` - master-reference plus image-edit workflow protocol.
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
- `build_workflows.py` - generator for the API workflow drafts.

Reference inputs:

- `master-candidates/` - generated stylized master-reference candidates for user review.
- `baseline-inputs/` - filed user-provided Alex baseline references, with hashes and intended roles.

## Current Reference Inputs

The user-provided Alex files are filed under `baseline-inputs/` and should be treated as research/reference inputs, not production assets. They are useful for:

- Control-map extraction.
- Pose and silhouette locking.
- Testing whether local edit models can preserve one body/face geometry.
- Comparing hair, underwear, and no-hair states.

The generated master candidates under `master-candidates/` are also references only. They are useful for deciding the target stylization level, especially the move away from full realism toward stylized realism / painterly semi-realism.

## Option 2 Runtime Target

Option 2 assumes the eventual runtime exposes explicit visual layers rather than burying hair, eyes, and clothing inside generic arrays:

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

See `OPTION-2-ASSET-TODO.md` for the complete checklist. The current minimum production target is 36 generated production layers, excluding source/control files and QA composites. The recommended v1 target is 53 generated production layers, excluding source/control files and QA composites.

## Next Decisions Needed

- Choose the master visual direction from `master-candidates/` and/or the user-provided Alex references.
- Decide whether Option 2 runtime changes should be implemented before producing final art assets.
- Build actual local ComfyUI visual workflows from the API drafts in the installed ComfyUI environment.
- Capture exact local model filenames, hashes, trigger words, and licenses before any scored run.
- Run crossed composites from `layer-composition-protocol.md` before accepting any asset family.

