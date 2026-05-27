# Qwen 2509 Clothing Test 00054

Generated: 2026-05-25

This folder records the first strong Qwen Image Edit 2509 clothing-fit test.

## Source

- User-provided output: `C:\Users\Oculus\Downloads\ComfyUI_00054_.png`
- Copied source: `source/ComfyUI_00054_.png`
- Source size: `624x1672`
- Source format: opaque RGB PNG

The Comfy graph used:

- Avatar source: `sizzle_alex_noface_blank_padded_576x1536.png`
- Optional clothing references: generated Sizzle t-shirt image and generated jeans/shoes image
- Model: Qwen Image Edit 2509 with Lightning 4-step LoRA, per the user's screenshot

## Processed Review Files

- `processed/qwen2509-outfit-scaled-576x1536.png`
- `processed/qwen2509-outfit-canonical-crop-523x1536.png`
- `qwen2509-clothing-test-00054.report.json`

## Assessment

This is the best clothing-fit result so far. Unlike the built-in imagegen tests, Qwen 2509 appears to preserve the pose while adapting clothing references to the avatar body.

Update after the first test: future Qwen 2509 runs should use `sizzle_alex_noface_blank_qwen2509_canvas_624x1672.png`, which keeps the old `576x1536` padded avatar unchanged at `x=24, y=68`. That should let Qwen output at `624x1672` without creating scaling artifacts.

Still not production-accepted yet:

- Output is opaque RGB, not transparent layers.
- Output size is `624x1672`, so future runs should be cropped to `576x1536` at `x=24, y=68` and then cropped to `523x1536`.
- Alpha restoration, layer extraction, and crossed composites still need to pass.

Use this as the current preferred clothing workflow direction.
