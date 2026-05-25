# ComfyUI API Workflows

These files are ComfyUI `/prompt` API-format workflows, not visual editor exports. Use them by POSTing the JSON object as the `prompt` value, or import/rebuild them in ComfyUI and export a visual workflow from there.

Generated files:

- `sdxl-realvisxl-v5-layer-matrix.api.json`
- `sdxl-realvisxl-v5-control-layer-matrix.api.json`
- `pony-cyberrealistic-layer-matrix.api.json`
- `pony-cyberrealistic-control-layer-matrix.api.json`
- `flux2-klein-4b-base-control-layer-matrix.api.json`
- `flux2-klein-4b-base-excellent-full-nude-layer-matrix.api.json`
- `flux2-klein-4b-base-klein-fixes-nsfw-layer-matrix.api.json`
- `flux2-klein-4b-distilled-control-layer-matrix.api.json`
- `flux2-klein-4b-distilled-excellent-full-nude-layer-matrix.api.json`
- `flux2-klein-4b-distilled-klein-fixes-nsfw-layer-matrix.api.json`

Each workflow generates the full layer matrix as RGB images on a plain matte grey background. Run those outputs through an offline BiRefNet/rembg alpha-removal pass, then score the resulting RGBA layers using `../../layer-composition-protocol.md`.

Before queueing:

- Replace placeholder checkpoint and LoRA filenames with exact local filenames.
- Confirm the model files are in the expected ComfyUI model folders.
- For SDXL/Pony, use `CheckpointLoaderSimple` + `LoraLoader`.
- For FLUX.2 Klein, update ComfyUI to a version with `UNETLoader`, `CLIPLoader` type `flux2`, `VAELoader`, `EmptyFlux2LatentImage`, and `LoraLoaderModelOnly`.
- Use the `*-control-layer-matrix.api.json` files for no-LoRA control runs.
