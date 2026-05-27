# Production Drafts: Avatar Workflow Workspace

Generated: 2026-05-25

This folder is a research/draft workspace only. Nothing here has been promoted to `sizzle/media/avatar/`.

## V0 No-Key Workflow

`_scripts/build_no_key_avatar_drafts.py` builds a first-pass avatar layer set without OpenAI API calls, ComfyUI, or game source changes.

The script:

1. Loads the original canonical `523x1536` transparent templates from `../baseline-inputs/canonical/`.
2. Creates deterministic masks and QA backgrounds under `source/`.
3. Builds fixed-canvas transparent layer drafts under `body/`, `eyes/`, `hair/`, `underwear/`, and `clothing/`.
4. Creates crossed QA composites under `qa/`.
5. Writes `manifest.no-key-drafts.json` with source/template notes.

Run with the bundled Codex Python:

```powershell
& "C:\Users\Oculus\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe" "C:\Users\Oculus\My Drive\Female Agent\sizzle\docs\avatar-bakeoff\production-drafts\_scripts\build_no_key_avatar_drafts.py"
```

## V0 Outputs

All V0 PNG outputs are `523x1536`.

Layer drafts:

- `body/20_body-light.png`
- `body/20_body-medium.png`
- `body/20_body-dark.png`
- `eyes/40_eyes-blue.png`
- `eyes/40_eyes-green.png`
- `eyes/40_eyes-brown.png`
- `hair/back/30_hair-back-long-straight-brown.png`
- `hair/back/30_hair-back-long-straight-black.png`
- `hair/back/30_hair-back-long-straight-blonde.png`
- `hair/front/70_hair-front-long-straight-brown.png`
- `hair/front/70_hair-front-long-straight-black.png`
- `hair/front/70_hair-front-long-straight-blonde.png`
- `underwear/50_bra-neutral-grey.png`
- `underwear/50_briefs-neutral-grey.png`
- `clothing/tops/60_black-tshirt.png`
- `clothing/bottoms/55_dark-jeans.png`
- `clothing/shoes/65_sneakers.png`

QA composites:

- `qa/composite_light_long-straight-black_blue_blackTshirt_darkJeans_sneakers.png`
- `qa/composite_medium_long-straight-brown_green_underwear-only.png`
- `qa/composite_dark_long-straight-blonde_brown_blackTshirt_darkJeans_sneakers.png`

Diagnostic previews:

- `qa/checks/body-light-checker.png`
- `qa/checks/hair-split-brown-checker.png`
- `qa/checks/underwear-checker.png`
- `qa/checks/outfit-checker.png`

## QA Notes

Useful for technical diagnostics:

- Canvas registration is preserved.
- Body skin-tone variants share the same silhouette.
- Hair colour variants reuse the same extracted hair geometry.
- Iris overlays are tiny colour-only overlays and do not repaint skin, brows, or eyelids.
- Underwear layers are extracted from the canonical underwear reference and recoloured neutral grey.

Not promotion-ready:

- V0 deterministic outputs are superseded by the ComfyUI V1 candidate workflow.
- The deterministic black t-shirt, jeans, and sneakers are crude mask-fill drafts. They are useful for proving slot order and cross-composite fit, not final art direction.
- Hair split is algorithmic: `hairBack` is hair outside the body mask, `hairFront` is hair overlapping the body mask. It should be reviewed by eye before production promotion.
- Body recolours are local colour transforms, not model-edited redraws. They preserve geometry but may need art-direction tuning.

## Active V1 Direction

Use `workflows/phase2-edit/` to create ComfyUI-edited candidates from the canonical templates, especially `alex-noface-blank.png` for body skin-tone work. Candidate assets that may be reviewed for acceptance live under `candidates/v1/`; they should still not be promoted to `sizzle/media/avatar/` until crossed composites pass review.

## Clothing And Mask Experiments

Recent draft folders record the clothing-mask exploration and should not be mistaken for production assets:

- `imagegen-clothing-test/`, `imagegen-clothing-test-v2/`, and `imagegen-clothing-test-v3/` are built-in imagegen concept attempts with increasingly refined visual masks. They demonstrate that this route can suggest clothing, but it does not preserve the source image strongly enough for clean layer extraction.
- `mask-approval/` contains Codex-generated mask iterations `v4` through `v7`. These are useful process history. The current best guide for the next model test is still the user-supplied `mask-test.png`.
- `imagegen-clothing-test-user-mask/` is the best built-in imagegen concept attempt because it uses the user mask. It still fails production requirements: the generated figure was rescaled/redrawn and the extracted layers retain residue.
- `qwen-2509-clothing-test-00054/` records the first strong Qwen Image Edit 2509 clothing-fit test. It includes the original `624x1672` opaque RGB output, a normalized `576x1536` review image, a canonical-width crop, and a report.
- `qwen-2509-clothing-extract-00055/` contains the first extracted transparent shirt, jeans, and shoe draft layers from a Qwen 2509 clothing-fit output.
- `comfy-review/` contains review artifacts from Comfy outputs, including skin-tone candidate inspection.

Current clothing test input:

```text
C:\Users\Oculus\Documents\ComfyUI\input\sizzle_alex_noface_blank_qwen2509_canvas_624x1672.png
```

The next accepted clothing candidate should use Qwen Image Edit 2509 with standalone garment reference images, then crop back to the canonical `523x1536` canvas with alpha restored before extraction. The Qwen source keeps the old `576x1536` padded avatar unchanged at `x=24, y=68`, so no resize should be needed.
