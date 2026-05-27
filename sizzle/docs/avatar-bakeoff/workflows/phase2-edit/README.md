# Phase 2 Edit Workflow: FLUX.2 Klein 4B Mask Edit

This folder contains the ComfyUI workflow target for Sizzle avatar asset production after the free-generation route failed the mask/pose test.

## Research Conclusion

The official ComfyUI FLUX.2 Klein image-edit template uses core ComfyUI nodes:

- `UNETLoader`
- `CLIPLoader` with `type: flux2`
- `VAELoader`
- `VAEEncode`
- `ReferenceLatent`
- `Flux2Scheduler`
- `SamplerCustomAdvanced`
- `VAEDecode`

That is the right base for Sizzle because it edits from a reference image instead of generating a fresh pose from text.

Native FLUX.2 Klein image edit does not appear to use SDXL-style ControlNet/inpaint masking as its primary control path. To keep custom nodes out of the workflow, this Sizzle workflow uses:

1. FLUX.2 reference-latent image edit as the soft full-image geometry control.
2. A loaded mask as a hard final compositor control.
3. Strict prompts requiring same pose, same silhouette, same canvas, and target-only edits.

When the hard-mask path is used, the final `ImageCompositeMasked` node means pixels outside the white mask are restored from the original source image exactly. This is not as powerful as true masked diffusion, but it is stable, native, and avoids brittle custom nodes. For broad body skin-tone edits, raw output plus alpha/silhouette restoration may preserve more texture than hard compositing.

FLUX.2 prompting should use natural language. Do not use SD/SDXL-style negative prompt lists: Black Forest Labs' FLUX.2 prompting guide says FLUX.2 does not support negative prompts. The workflow therefore keeps negative conditioning empty and puts constraints into the positive instruction as plain-language invariants.

## Files

- `prepare_flux2_mask_edit_inputs.py` - creates padded Comfy input images and starter masks.
- `build_flux2_mask_edit_workflow.py` - writes the API workflow JSON.
- `flux2-klein-4b-base-mask-edit.api.json` - generated ComfyUI `/prompt` workflow.

## Why 576x1536?

The canonical Sizzle canvas is `523x1536`. That width is not latent-friendly. The prep script pads the right edge to `576x1536`, preserving all original pixels at their original coordinates.

After a Comfy run, crop the rightmost 53 px to return to the canonical `523x1536` production draft canvas.

## Why 624x1672 For Qwen 2509?

Qwen Image Edit 2509 appears to emit `624x1672` for this workflow. For clothing tests, use:

```text
sizzle_alex_noface_blank_qwen2509_canvas_624x1672.png
```

This keeps the `576x1536` padded avatar unchanged and adds transparent padding around it:

```text
left/right padding: 24 px each
top/bottom padding: 68 px each
avatar offset: x=24, y=68
```

After Qwen generation, crop `x=24, y=68, w=576, h=1536` to recover the old padded canvas. Then crop the rightmost 53 px to return to canonical `523x1536`.

## Setup

Run from the repo root:

```powershell
& "C:\Users\Oculus\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe" "C:\Users\Oculus\My Drive\Female Agent\sizzle\docs\avatar-bakeoff\workflows\phase2-edit\prepare_flux2_mask_edit_inputs.py"
& "C:\Users\Oculus\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe" "C:\Users\Oculus\My Drive\Female Agent\sizzle\docs\avatar-bakeoff\workflows\phase2-edit\build_flux2_mask_edit_workflow.py"
```

Then copy the generated PNGs from:

```text
sizzle/docs/avatar-bakeoff/production-drafts/comfy-input/
```

into your ComfyUI `input/` folder.

Use the plain `sizzle_mask_*_padded_576x1536.png` black/white masks in Comfy nodes. The workflow converts the loaded mask image to a true MASK with `ImageToMask` using the red channel, so it does not depend on Comfy PNG alpha handling.

## Required Model Files

The generated workflow assumes the official template names:

- `models/diffusion_models/flux-2-klein-base-4b-fp8.safetensors`
- `models/text_encoders/qwen_3_4b.safetensors`
- `models/vae/full_encoder_small_decoder.safetensors`

If your local files are named differently, update nodes:

- `3` - `UNETLoader`
- `4` - `CLIPLoader`
- `5` - `VAELoader`

If your install expects `flux2-vae.safetensors` instead of `full_encoder_small_decoder.safetensors`, change node `5`.

## How To Use

Import or POST:

```text
flux2-klein-4b-base-mask-edit.api.json
```

For each asset, update:

- Node `1`: source image.
- Node `2`: mask image.
- Node `6`: positive prompt.
- Node `7`: keep empty for normal FLUX.2 runs.
- Node `13`: seed, usually fixed while tuning one asset.
- Node `19` and `21`: filename prefixes.

For body skin-tone passes from `alex-noface-blank`, prefer evaluating node `19` raw output first. If the raw output keeps the silhouette well, run `postprocess_flux2_body_raw.py` to crop the padded image back to `523x1536` and restore the original alpha/silhouette. This avoids the texture loss that can happen when a broad hard mask composites most of the body from a sampled reconstruction. Recent acceptable body candidates came from simple prompts and low CFG around `1.5`; do not treat the workflow default as a locked best value.

Recommended starting source/mask pairs:

| Target | Source | Mask |
|---|---|---|
| Light body skin | `sizzle_alex_noface_blank_padded_576x1536.png` | `sizzle_mask_noface_body_skin_padded_576x1536.png` |
| Medium body skin | `sizzle_alex_noface_blank_padded_576x1536.png` | `sizzle_mask_noface_body_skin_padded_576x1536.png` |
| Dark body skin | `sizzle_alex_noface_blank_padded_576x1536.png` | `sizzle_mask_noface_body_skin_padded_576x1536.png` |
| Visible skin with underwear/hair | `sizzle_alex_hair_underwear_crop_padded_576x1536.png` | `sizzle_mask_skin_visible_padded_576x1536.png` |
| Black t-shirt test | `sizzle_alex_noface_blank_padded_576x1536.png` | `mask-test.png` or a refined shirt-only mask derived from it |
| Dark jeans test | `sizzle_alex_noface_blank_padded_576x1536.png` | `mask-test.png` or a refined jeans-only mask derived from it |
| Sneakers test | `sizzle_alex_noface_blank_padded_576x1536.png` | `mask-test.png` or a refined shoes-only mask derived from it |
| Hair edit | `sizzle_alex_hair_nude_crop_padded_576x1536.png` | `sizzle_mask_hair_padded_576x1536.png` |

Use the hair/underwear source for clothing only when intentionally testing occlusion against hair or underwear. The next main clothing test should use the noface blank source.

## Qwen Image Edit Clothing Note

Qwen Image Edit 2509 is now the leading clothing-fit route. Its useful behavior is not just text-prompted editing: it can take standalone garment reference images and adapt them onto the fixed avatar body.

The earlier Qwen output `ComfyUI_00046_.png` looked more plausible than built-in imagegen but was not technically acceptable: it cropped the head, changed visible skin/lighting, omitted sneakers, and returned an opaque RGB full render rather than clean transparent layers.

The newer Qwen 2509 output `ComfyUI_00054_.png` is much stronger: it fits the referenced Sizzle t-shirt, jeans, and sneakers to the noface body without obvious pose damage. Its output is `624x1672` opaque RGB, so the normalization path is:

```text
624x1672 Qwen output from the 624x1672 padded source
-> crop x=24,y=68,w=576,h=1536
-> crop rightmost 53 px to 523x1536
-> restore canonical alpha/silhouette from alex-noface-blank.png
-> extract shirt / jeans / shoes layers
```

For the next Qwen test:

```text
Source: C:\Users\Oculus\Documents\ComfyUI\input\sizzle_alex_noface_blank_qwen2509_canvas_624x1672.png
Optional image2/image3: generated clothing reference images
Fallback guide mask: C:\Users\Oculus\Documents\ComfyUI\input\mask-test.png
```

Prompt shape:

```text
Put the referenced t-shirt, jeans, and shoes on the figure. Change nothing else about the figure. Keep the placement of the hands and feet pixel-perfect exactly where they are now.
```

Do not accept the output as production merely because it looks aligned. It must still survive alpha restoration, garment extraction, and crossed composites.

## Prompting

Use `prompt-presets.json` as the source for prompt text.

For node `7`, leave the text empty for the first pass. If a local Comfy FLUX.2 workflow uses a specialized negative guidance method later, document that separately; do not assume SD-style negative prompting.

Good FLUX.2 prompt shape for this task:

```text
This is a precise image edit for a layered visual-novel avatar. The source image is the fixed reference: keep the same canvas, camera, scale, front-facing standing pose, figure silhouette, head shape, shoulders, torso, arms, hands, hips, legs, feet, soft lighting, linework, and painterly style. Treat this as a conservative skin-tone edit on the existing painting, not a redraw and not a smoothing pass. Shift the body skin to a natural medium warm brown tone with believable undertones while preserving the source's fine skin texture, subtle pore grain, brush texture, small colour variations, soft anatomical shading, and existing highlight pattern. The skin should remain matte and organic, not glossy, plastic, airbrushed, waxy, oily, or cartoon-smooth. Keep the face blank and featureless. Keep the body outline visually the same as the source.
```

## Acceptance Gate

A Comfy output only moves to `production-drafts/candidates/v1/` if:

- Pose and silhouette match the canonical canvas.
- Pixels outside the intended target region remain unchanged after hard-mask composite.
- The target layer can be extracted without baked skin/hair/body fragments.
- Crossed composites pass on light, medium, and dark body variants.
- Final crop back to `523x1536` preserves registration.

## Custom Node Policy

This workflow uses no third-party custom nodes. If true masked diffusion or ControlNet-style conditioning is needed later, add it only after this core-node version fails, and document the exact custom node, model file, and reason.
