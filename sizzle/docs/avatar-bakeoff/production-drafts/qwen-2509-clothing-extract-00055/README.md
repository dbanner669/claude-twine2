# Qwen 2509 Clothing Extraction 00055

Generated: 2026-05-25

This folder contains draft transparent clothing layers extracted from `C:\Users\Oculus\Downloads\ComfyUI_00055_.png`.

## Method

- Cropped the Qwen-native `624x1672` output to the unchanged padded avatar region: `x=24, y=68, w=576, h=1536`.
- Cropped the rightmost 53 px to return to the canonical `523x1536` draft canvas.
- Compared the cropped output against the noface Qwen source over white.
- Built separate shirt, jeans, and shoe masks with source-difference plus color/region constraints.

## Draft Layers

- `layers/tops/60_black-sizzle-tshirt-qwen2509-00055.png`
- `layers/bottoms/55_blue-jeans-qwen2509-00055.png`
- `layers/shoes/65_white-sneakers-qwen2509-00055.png`
- `layers/combined/outfit-qwen2509-00055.png`

## QA

- `qa/composite-medium-body-outfit-qwen2509-00055.png`
- `qa/composite-medium-body-outfit-qwen2509-00055-dark-ui.png`
- `qa/extracted-outfit-qwen2509-00055-checker.png`
- `qa/extracted-shirt-qwen2509-00055-checker.png`
- `qa/extracted-jeans-qwen2509-00055-checker.png`
- `qa/extracted-shoes-qwen2509-00055-checker.png`

## Notes

This is a draft extraction only and has not been promoted to `sizzle/media/avatar/`.

The shirt and jeans extraction is promising. The shoes are usable for QA, but white shoes on a white source background remain the weakest case and should be checked carefully over dark UI/checker backgrounds.
