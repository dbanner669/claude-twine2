# Interim Findings: Process Pivot

Status: mid-bakeoff finding. This supersedes the original assumption that one local model family might generate independent avatar layers directly from prompts.

## Discovery

The bakeoff is showing that the tested text-to-image workflows are not consistent enough for Sizzle's layered avatar needs.

Main findings:

- Direct generation of separate body, hair, eye, underwear, clothing, and expression layers does not reliably preserve the same pixel geometry.
- The models can make attractive images, but they do not naturally produce reusable production sprites.
- Prompt/seed discipline is not enough. Even with the same canvas and carefully repeated prompts, the head position, face geometry, shoulders, hair silhouette, torso, clothing anchors, and expression areas drift.
- Full realism makes the problem harder. Realistic models introduce small anatomical, lighting, fabric, and face changes that are visually obvious when layers are recombined.
- The layered avatar format wants controlled, slightly stylized sprites more than it wants photographic realism.

Conclusion: the primary production process should shift from **independent text-to-image layer generation** to **canonical-template controlled image-edit derivation**.

## Revised Hypothesis

The strongest path is likely a combination workflow:

1. Use the approved canonical Alex templates as the fixed registration source.
2. Use image-edit models to derive variations from those templates.
3. Extract transparent layers from edited variants.
4. Composite-test every derived layer against crossed combinations on the same canvas.

Candidate roles:

- **Canonical source:** the `523x1536` transparent Alex crops in `baseline-inputs/canonical/`, especially `alex-noface-blank.png` for body and clothing tests.
- **Local/offline edit model:** Qwen Image Edit, FLUX.2 Klein image edit, or another permissive local edit/inpaint model, used to make hair, skin, clothing, expression, and underwear variants from the canonical source.
- **Segmentation/matting:** BiRefNet/rembg/SAM-style correction for alpha extraction after edits.

Important constraint note: using ChatGPT/Codex image generation is now concept-only for this avatar workflow. Built-in imagegen tests have not preserved pose/canvas well enough for production extraction.

## Art Direction Pivot

The bakeoff should no longer optimize for full realism. The new target is:

- Stylized realism or painterly semi-realism.
- Clean silhouettes.
- Controlled lighting.
- Fewer microtexture differences between variants.
- Avatar-sprite readability over photographic detail.
- 2005 Toronto thriller tone without camera-photo literalism.

The desired look should still feel adult, grounded, and character-driven, but it should tolerate layer reuse. A good target is closer to a polished visual-novel character sprite with realistic proportions than a generated film still.

## What The Existing Workflows Are Still Useful For

The current ComfyUI workflows remain useful as Phase 1 evidence:

- They document the failure mode of prompt-only independent layer generation.
- They can still be used to compare base model tendencies.
- They may provide reference images, outfit ideas, or anatomy studies.
- They should not be promoted to production sprite workflows unless a later inpaint/edit pipeline solves the geometry drift.

## Revised Success Criteria

A workflow only passes if it can:

- Start from the approved canonical template set.
- Edit one attribute at a time while preserving the rest of the sprite.
- Keep landmarks stable within roughly `3-5 px` at the canonical `523x1536` canvas.
- Produce body, hairBack, hairFront, face, eyes, nipples, genitals, underwear, clothingTop, clothingBottom, shoes, expression, and overlay-capable variants that recombine through the locked explicit stack.
- Preserve the chosen stylized art direction across edits.
- Support adult/tasteful anatomy variants without refusal or censor artifacts.
