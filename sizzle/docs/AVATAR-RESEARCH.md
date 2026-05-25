# Avatar Research: Offline Image Generation Stack

**2026-05-25 status update:** this report is the original offline-stack research baseline. Subsequent bakeoff work found that direct independent text-to-image generation is not stable enough for Sizzle's mix-and-match layered avatar needs. The current recommended process is documented in `docs/avatar-bakeoff/STATUS.md`, `docs/avatar-bakeoff/INTERIM-FINDINGS.md`, and `docs/avatar-bakeoff/phase-2-image-edit-protocol.md`: create one approved stylized master reference, derive variants through controlled image editing, then prove every extracted layer through crossed composites. The model landscape below remains useful for choosing local edit/render candidates, but the production question has shifted from "which model makes the best single sprite?" to "which workflow preserves pixel-stable layers?"

This report assumes Sizzle's current avatar architecture: a SugarCube layered PNG system with arrays for `background`, `body`, `bodyMods`, `underwear`, `clothing`, and `foreground`, rendered bottom-to-top inside a 3:4 avatar frame. The character creator currently exposes skin tone, hair colour, hair style, and eye colour, with clothing and expression layers already anticipated by the template. The art direction is not pin-up gloss or anime. It needs grounded, attractive, adult, period-2005 Toronto thriller imagery: a believable under-30 Canadian woman in an undercover/infiltration story, with tasteful but explicit-adult capacity later.

The practical implication: do not treat this as "generate many unrelated pretty portraits." It is a production asset pipeline problem. The stack must preserve one body rig, face identity, hair silhouette, clothing alignment, and alpha edges across many regenerated layers.

## 1. Model landscape

**Ranking by fit for Sizzle**

| Rank | Candidate | Fit | Notes |
|---:|---|---|---|
| 1 | SDXL photoreal finetune: RealVisXL V5.0 or Juggernaut XL/X | Best starting point | Mature local ecosystem, strong ControlNet/IP-Adapter/LoRA support, workable NSFW finetunes, fits 16-24 GB VRAM. |
| 2 | SDXL base plus custom character LoRA | Best long-term base discipline | More neutral than finetunes, good for training reproducible character concepts, but raw SDXL people need more prompt/control polish. |
| 3 | SD 1.5 photoreal finetunes | Good fallback | Fast, low VRAM, huge adult ecosystem, but lower native resolution and weaker prompt adherence/anatomy than SDXL. |
| 4 | SD 3.5 Large/Medium | Watchlist | Better prompt adherence and local/self-host support, but adult finetune/control ecosystem is less mature than SDXL. |
| 5 | FLUX.1 schnell/dev | Watchlist, not first | Excellent general image quality, but `dev` is non-commercial, `schnell` is distilled, and identity/control/NSFW workflows remain less settled. |
| 6 | Pony Diffusion v6/XL | Not for this aesthetic | Excellent explicit/anatomical illustrated ecosystem, but tag-driven anime/cartoon/furry bias and licensing friction make it a poor fit. |
| 7 | Illustrious / NoobAI | Not recommended | Strong illustration/anime lineage, awkward commercial licensing in NoobAI, weak match for grounded photographic thriller art. |

**SDXL plus photoreal finetunes**

SDXL is still the center of gravity for this project. The [SDXL base model card](https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0) lists OpenRAIL++ licensing, local Diffusers usage, 1024-scale generation, and a large model tree of finetunes/adapters. Its model card also states the usual limitations: not perfect photorealism, problems with faces/people in some cases, and lossy autoencoding. Those are real issues, but the ecosystem around SDXL has had years to compensate with finetunes, LoRAs, ControlNets, IP-Adapter, inpainting, ADetailer-style face repair, and segmentation nodes.

For Sizzle, SDXL photoreal finetunes are the best practical starting class. [RealVisXL V5.0](https://huggingface.co/SG161222/RealVisXL_V5.0/tree/main) is SDXL-based, OpenRAIL++, available as fp16/fp32 safetensors, and aimed at photoreal output. Its V4 page explicitly says it can produce SFW and NSFW images of decent quality and recommends DPM++ 2M Karras with 25+ steps. [Juggernaut XL](https://huggingface.co/RunDiffusion/Juggernaut-XL) is also SDXL-based and photorealistic; RunDiffusion's own page says newer Juggernaut X/v10 has both SFW and NSFW releases, with the unrestricted model available on Civitai/Hugging Face, but it also flags commercial licensing concerns. That means Juggernaut is artistically promising, but RealVisXL is the cleaner research default until a specific Juggernaut file's license is reviewed.

Expected VRAM: SDXL generation at 1024 portrait sizes is comfortable on 16-24 GB VRAM in fp16/bf16. SDXL LoRA training is feasible but should be done carefully: batch size 1, gradient checkpointing, cache latents, and conservative rank. On a 24 GB card, this is normal production territory; on 16 GB, it is still workable with slower settings.

**SD 1.5 plus finetunes**

SD 1.5 is still useful for adult content and fast iteration. Its license lineage is CreativeML OpenRAIL-M, and the ecosystem is huge. It runs easily on modest GPUs and has many mature NSFW photoreal checkpoints. The downside is structural: 512-native generation, more brittle anatomy, weaker prompt adherence, and smaller latent detail. It can produce good avatar layers, but Sizzle wants "indie film still" rather than old WebUI glamour. Use SD 1.5 only as a fallback for explicit scene experimentation or quick silhouette studies, not as the production avatar base.

**Pony Diffusion v6/XL**

[Pony Diffusion V6 XL](https://huggingface.co/LyliaEngine/Pony_Diffusion_V6_XL) is a heavily trained SDXL derivative capable of SFW and NSFW output, with explicit rating tags and a large dataset. It is genuinely strong for explicit illustration and character/anatomy in its domain. But the domain is the issue: its prompting conventions, source tags, and default aesthetic are anime/cartoon/furry/humanoid. The model card also describes a modified Fair AI Public License with restrictions on monetized inference and commercial contact requirements. For Sizzle, Pony is useful as a reference for how an adult-capable model documents rating tags, not as the main model.

**FLUX.1 dev/schnell**

[FLUX.1 dev](https://huggingface.co/black-forest-labs/FLUX.1-dev) is a 12B rectified-flow transformer with very high output quality and prompt following, and ComfyUI support. Its license is non-commercial. [FLUX.1 schnell](https://huggingface.co/black-forest-labs/FLUX.1-schnell) is also 12B and Apache 2.0, but distilled for 1-4 step generation. The quality is impressive, but the project constraints care more about reproducible layer consistency, identity tools, adult tolerance, and batchable masks than single-image beauty. FLUX can run on 24 GB with quantization/offload; it is less comfortable on 16 GB and has a more uneven adult/control ecosystem. Keep it as a future upgrade path, especially if FLUX character-LoRA and identity adapters stabilize.

**SD 3.5**

[Stable Diffusion 3.5 Large](https://huggingface.co/stabilityai/stable-diffusion-3.5-large) supports local/self-hosted use and recommends ComfyUI/Diffusers. Stability's current license page says the Community License is free for individuals and organizations under USD $1M annual revenue, with enterprise licensing above that threshold. SD3.5 Large can be quantized for lower VRAM, and Medium is more consumer-friendly. The issue is not raw promise, but production ecosystem maturity: SDXL still has the better adult finetune, ControlNet, IP-Adapter, and LoRA path for this avatar job.

**Illustrious and NoobAI**

[Illustrious XL](https://huggingface.co/Liberata/illustrious-xl-v1.0) is a high-resolution illustration model with natural-language plus Danbooru tag prompting, LoRA/ControlNet compatibility, and strong detail. That is attractive for an illustrated game, but Sizzle is not an anime/illustration project. [NoobAI-XL](https://civitaiarchive.com/models/833294?modelVersionId=932238) is even more clearly Danbooru/e621-oriented and has a license section prohibiting commercialization of the model, derivative models, and model-generated products. Exclude it for this project.

## 2. Reproducibility techniques

The target should be "pixel-near-identical on the same workstation and environment," not guaranteed bit-for-bit across all future hardware. PyTorch's [reproducibility documentation](https://docs.pytorch.org/docs/stable/notes/randomness.html) is blunt: results are not guaranteed across releases, commits, platforms, or CPU vs GPU, even with identical seeds. Hugging Face Diffusers' [reproducible pipelines guide](https://huggingface.co/docs/diffusers/v0.31.0/using-diffusers/reusing_seeds) recommends passing an explicit `torch.Generator` and using deterministic generation patterns.

Pin these for every generated asset:

- Model checkpoint file, exact filename, SHA256/hash, base architecture, and source URL.
- VAE file and hash. Do not rely on "automatic" VAE resolution.
- Positive prompt, negative prompt, prompt parser mode, clip skip if applicable, token weighting syntax, and any wildcard expansion results after expansion.
- Seed, subseed, batch index, width, height, steps, CFG, sampler, scheduler, denoise strength, hi-res/upscale settings, refiner settings, and inpaint mask blur/padding.
- LoRAs with filenames, hashes, strengths for model/text encoders, trigger words, and training base.
- ControlNets/IP-Adapters with model hashes, preprocessor settings, reference images, reference image hashes, conditioning strengths, start/end percentages, and masks.
- Runtime versions: ComfyUI commit, custom node commits, PyTorch, CUDA, cuDNN, xformers/Sage/Flash attention setting, GPU model, driver version, Python version, OS, and precision mode.

Prefer deterministic samplers for anchor assets: DDIM, Euler, Heun, and DPM++ 2M/Karras are safer than ancestral samplers. Euler ancestral and DPM++ SDE variants introduce more stochastic behavior. They can be reproducible when seeded inside one toolchain, but they are more fragile across samplers/implementations. Avoid changing sampler or scheduler when regenerating a layer family.

Avoid xformers for final reproducible generation if possible. xformers memory-efficient attention is useful, but its own issue tracker has reports of slightly different images from `memory_efficient_attention`, and third-party documentation commonly warns that it can introduce numerical differences. For final runs, use PyTorch SDP deterministic/no-memory-efficient attention where available, disable cuDNN benchmarking, and document the attention backend.

Concrete checklist:

1. Freeze a "Sizzle avatar environment" and never update it mid-asset-family.
2. Save every ComfyUI workflow as JSON plus embed workflow metadata in output PNGs.
3. Store a sidecar manifest per output: `asset.png`, `asset.workflow.json`, `asset.manifest.json`, `asset.refs/`.
4. Generate one image per queued prompt when validating determinism. Batch count/index changes can alter random streams in some UIs.
5. Use the same GPU and precision for final asset regeneration. Treat CPU offload, fp16/bf16/fp32, xformers, and CUDA upgrades as potential output changes.
6. If an intentional prompt tweak breaks identity, do not keep pushing text. Return to the character LoRA/IP-Adapter/reference stack.

## 3. Layer/identity workflow

**Character LoRA**

This is the most robust long-term identity anchor. Train a Sizzle player-character LoRA on a curated reference set: neutral portrait, three-quarter portrait, full body in the canonical avatar pose, hair-back/face visible variants, clothed and unclothed-safe anatomy references if legally and ethically acceptable for the project, and expression references. Tools: [kohya-ss/sd-scripts](https://github.com/kohya-ss/sd-scripts/blob/main/docs/train_network_advanced.md) or [OneTrainer](https://github.com/Nerogar/OneTrainer), both local and SDXL-capable.

Setup cost is medium/high: 20-50 strong images, captions, masks, trial runs, and curation. Consistency is high once tuned. Flexibility is also high: the LoRA can survive expression, outfit, lighting, and pose changes better than prompt-only identity. Reproducibility friction is moderate because LoRA training itself must be versioned, but once the LoRA is frozen it is straightforward to reuse.

For Sizzle, this should be the production identity backbone. Start by generating and hand-curating a reference set, then train the LoRA. Do not train the final LoRA from random one-off outputs without curation; AI-generated training sets can collapse into same-face/same-lighting artifacts if too narrow.

**IP-Adapter FaceID / Plus / Portrait**

IP-Adapter is the best zero-shot face anchor. Its [FaceID documentation](https://github.com/tencent-ailab/IP-Adapter/wiki/IP%E2%80%90Adapter%E2%80%90Face/a6772a2f11ba1c315beac3eccd28b2a332b4e9ef) says FaceID uses face recognition embeddings rather than CLIP image embeddings, with LoRA additions to improve ID consistency. It is excellent for "same person, new image" while building the initial reference set and for repair/regeneration of expressions.

Setup cost is low/medium: InsightFace/reference images, compatible adapter nodes, and strength tuning. Consistency is medium/high for face, lower for hair/clothing unless combined with other controls. Flexibility is good for expression and outfit changes, but it may over-stamp the face or drift if the pose/crop changes too much. Reproducibility friction is manageable if reference images and node versions are pinned.

**InstantID**

[InstantID](https://github.com/instantX-research/InstantID) combines identity embeddings with an IdentityNet/ControlNet-style spatial condition. It is stronger than plain FaceID for preserving likeness and face geometry, especially with a landmark reference. It can also become too rigid and can fight stylization or body composition. Use it for building and validating the canonical face, not necessarily every final layer.

**Reference-only ControlNet**

ControlNet's core purpose is spatial conditioning, as described in the [ControlNet paper](https://arxiv.org/abs/2302.05543): adding controls such as pose/depth/edge maps to pretrained diffusion models. "Reference-only" workflows help preserve style/composition, but they are weaker identity anchors than LoRA or FaceID. Use ControlNet OpenPose/Depth/Canny for the body rig and silhouette, not for identity by itself.

**Textual inversion / embeddings**

Textual inversion is cheap and lightweight, but too weak for this project. It can help with a style phrase or named wardrobe concept, but it will not reliably hold a face, hair silhouette, clothing item, and expression family across hundreds of assets. Use only as a minor prompt convenience.

**Recommended combination**

Use a fixed canonical body/pose rig plus a character LoRA as the main anchor. Use IP-Adapter FaceID/InstantID during reference generation and expression variants. Use ControlNet OpenPose/Depth/Canny to keep the same 3:4 body geometry and clothing alignment. Use regional masks/inpainting for layer-specific regeneration: hair over transparent body, clothing over body, expression overlays over face.

## 4. Transparent-PNG layer pipeline

The current runtime wants same-dimension transparent PNGs. The template docs recommend all avatar images share dimensions such as 512x768; Sizzle's CSS uses a 3:4 frame and `object-fit: contain`. For production, choose a higher working size, for example 1024x1365 or 1024x1366, then optionally downscale to the final in-game size. Every layer must share the exact canvas size.

Recommended path: generate on a controlled plain background, segment, then clean/inpaint masks. Do not ask the diffusion model to directly produce transparent PNGs as the primary method. Most diffusion models generate RGB images; alpha is a postprocess.

For segmentation, prefer BiRefNet first. ComfyUI's [BiRefNet background removal docs](https://docs.comfy.org/tutorials/utility/remove-background-birefnet) describe native support, MIT-licensed weights, RGBA output, and good hair/detail masks. This is a strong match for avatar compositing, especially hair edges. `rembg`/U2Net is simpler and fast, but weaker around hair and translucent fabric. SAM2 is useful for promptable correction masks and isolating specific parts, but it is not automatically a better matting tool for hair. The [SAM2 paper](https://arxiv.org/abs/2408.00714) frames it as promptable image/video segmentation, not alpha matting.

Layer-specific guidance:

- Body base: generate a full body/front canonical pose on a neutral solid background. Segment the full person. Clean the alpha manually or with mask grow/shrink/blur. This becomes the alignment master.
- Hair-back/hair-front: generate hair either as part of the base reference, then separate by mask, or inpaint hair on top of a locked bald/neutral head reference. Long hair needs a back layer and a front layer if it falls behind shoulders and over clothing.
- Eyes: do not rely on separate full eye-colour generated images at avatar resolution unless close-up detail matters. For normal portrait scale, eye colour can be baked into body/face and expression overlays. If kept as a layer, use tiny masked overlays aligned to the same face geometry.
- Clothing: generate clothing over the locked body pose using inpainting masks. Segment the garment, not the whole person. Keep sleeves/hair occlusion rules explicit: garment below hair-front, above body, sometimes above hair-back.
- Expressions: generate face-expression variants via inpaint on the canonical face crop, then extract brow/mouth/eye-region transparent overlays. For realism, full-face expression overlays may look better than separated cartoon mouth/brow layers, but the widget system can still store them as foreground PNGs.

Save alpha in straight PNG RGBA. Test layers over black, white, and the actual Sizzle avatar background to catch halos. Add a 1-2 pixel alpha choke/feather for hair and fabric. Do not premultiply alpha unless the web renderer pipeline expects it.

## 5. Orchestration UI / scripting

**ComfyUI: recommended**

ComfyUI is the best fit because the avatar pipeline is a graph: load checkpoint, apply LoRA, load reference images, condition with ControlNet/IP-Adapter, generate, segment with BiRefNet, join alpha, save image, save metadata. The official [workflow docs](https://docs.comfy.org/development/core-concepts/workflow) say workflows are saved into generated image metadata and can also be stored as JSON, which is ideal for versioning. ComfyUI's API accepts workflow JSON, and local instances can queue workflows through the `/prompt` endpoint pattern documented in ecosystem guides. It also has first-class custom-node culture for IP-Adapter, InstantID, BiRefNet, mask operations, and batch automation.

Reproducibility: strongest of the UIs because the node graph is explicit. Scriptability: strongest because JSON workflows can be templated from a CSV of layer specs. Uncensored support: good because local checkpoints and nodes are user-controlled.

**A1111 / Forge**

A1111 remains excellent for manual prompt exploration and has an [API](https://github.com/AUTOMATIC1111/stable-diffusion-webui/wiki/API) via `--api`, including txt2img/img2img endpoints. Forge is an optimized fork/platform on top of the WebUI, with better resource management and newer model support according to its [README](https://github.com/lllyasviel/stable-diffusion-webui-forge/blob/main/README.md). These are fast for artists, but extension state and hidden settings make exact workflow versioning harder than ComfyUI. Use Forge as an exploration bench, not the final batch factory.

**InvokeAI**

InvokeAI has a strong canvas and a node workflow system. Its docs describe a saved workflow library and a linear UI view for exposing workflow parameters. It is attractive for manual inpainting and art direction, but the SDXL adult/custom-node ecosystem is less broad than ComfyUI for this exact identity/segmentation stack. Good secondary tool.

**SwarmUI**

SwarmUI is useful as a front-end manager over ComfyUI-style backends and can spread batches across backends. That is useful later if the project grows to multiple GPUs. It adds another layer to pin and debug, so it is not the starting recommendation.

## 6. First-pass concrete workflow

Target deliverable: `sizzle/media/avatar/body/20_body-light-long-straight-brown-blue.png`

Goal: a canonical body layer for `skin-tone=light`, `hair-colour=brown`, `hair-style=long-straight`, `eye-colour=blue`, front view, neutral/calm expression, transparent background, aligned to a 3:4 avatar canvas.

Model:

- Checkpoint: RealVisXL V5.0 fp16, or a reviewed Juggernaut XL NSFW-capable checkpoint if licensing is cleared.
- VAE: baked/default only if hash is recorded; otherwise explicitly use the checkpoint's expected SDXL VAE.
- UI: ComfyUI, saved as `sizzle/docs/avatar-workflows/body_canonical_sdxl_realvisxl.workflow.json` when implementation begins.

Prompt template:

`grounded semi-realistic photographic character reference, full body portrait of a 27 year old Canadian woman, light skin tone, long straight brown hair, blue eyes, natural face, believable body proportions, neutral calm expression, standing front view, arms relaxed slightly away from torso, fitted simple neutral underwear for anatomical reference, 2005 indie thriller film still, soft studio light, 85mm lens look, realistic skin texture, understated, not glamour, not influencer, plain matte grey background`

Negative prompt:

`anime, cartoon, illustration, 3d render, plastic skin, glossy fashion shoot, influencer, exaggerated breasts, exaggerated hips, childlike, teen, deformed anatomy, extra fingers, missing fingers, bad hands, bad eyes, crossed eyes, asymmetrical face, heavy makeup, modern smartphone, watermark, signature, text, logo, cropped, out of frame`

Generation settings:

- Canvas: 1024x1365 or 1024x1366. Pick one and freeze it.
- Seed: choose one fixed seed after exploratory search, for example `2309122005`. Do not treat this sample seed as sacred until the first approved anchor exists.
- Sampler: DPM++ 2M Karras or Euler. For maximum reproducibility, validate Euler/DDIM against DPM++ 2M Karras before freezing.
- Steps: 30-40.
- CFG: 4.5-6.0 for photoreal SDXL finetunes.
- Batch: 1 for final outputs.
- Precision: fp16 or bf16, pinned.

Controls:

- ControlNet/OpenPose: canonical standing pose reference. Fixed image and hash.
- ControlNet/Depth or Canny: optional after first approved body, used to regenerate while preserving silhouette.
- IP-Adapter FaceID or InstantID: use an approved face reference once one exists. For the very first body, pick the best candidate, then make it the seed reference set.
- Character LoRA: absent for the first exploratory pass; required after the curated reference set is approved.

Segmentation and alpha:

1. Generate RGB on plain grey background.
2. Run BiRefNet background removal to RGBA.
3. Inspect alpha over black, white, and Sizzle avatar panel colours.
4. Manually or node-clean mask: remove background residue, preserve hair edges, feather 1 pixel, no halo.
5. Save RGBA PNG to `sizzle/media/avatar/body/20_body-light-long-straight-brown-blue.png`.

Save alongside when implementation begins:

- `20_body-light-long-straight-brown-blue.manifest.json`: prompt, negative, seed, model hashes, VAE hash, sampler, steps, CFG, dimensions, node versions, source refs.
- `20_body-light-long-straight-brown-blue.workflow.json`: ComfyUI workflow in API format.
- `refs/`: pose image, face reference, segmentation preview, mask image, and approval notes.

Important: this "body" includes hair and face in the first anchor only if the current game needs a quick vertical slice. For a shippable layered system, split into base skin/body, hair-back, face/eyes, hair-front, and expression overlays after the canonical rig is approved.

## 7. Risks and unknowns

Licensing is the first risk. Base SDXL/OpenRAIL is manageable, and Stability's SD3.5 Community License is clear under the USD $1M threshold, but individual finetunes can add restrictions. Juggernaut's own pages mention NSFW availability and commercial licensing requirements. Pony and NoobAI are especially risky for commercial use. Before shipping commercial assets, record the exact checkpoint and license text used.

The second risk is the gap between "consistent enough for a demo" and "consistent enough for hundreds of variants." A prompt plus seed is not enough. Even IP-Adapter alone is not enough. The production answer is a frozen character LoRA plus fixed pose controls plus masked inpainting plus human curation.

The third risk is layer physics. Photographic clothing does not naturally become a clean transparent sprite. Hair crossing shoulders, collars under hair, transparent fabric, hands over clothing, and breasts/waist silhouettes can create occlusion conflicts. The avatar system may need more layer categories than the template's six arrays: hair-back, base/body, eyes/face, underwear, clothing-bottom, clothing-top, hair-front, expression, foreground effects.

The fourth risk is adult quality. "Uncensored" does not mean anatomically reliable. Some NSFW finetunes are permissive but ugly, overfit, or biased toward glossy adult-site aesthetics. Sizzle needs erotic capacity inside a classy thriller tone. That likely means starting with a tasteful photoreal model, adding anatomy/pose controls, and only using explicit finetunes/LoRAs where needed.

The fifth risk is model rot. Today's best checkpoint can vanish, change license language, or be superseded. Store exact files locally with hashes and license snapshots. Do not depend on Civitai availability for reproducibility.

The sixth risk is training on AI-generated references. It can work, but only if the reference set is curated for variation: lighting, crops, expression, clothing, and angles. A narrow set will bake in one pose, one face angle, or one plastic skin texture. Keep a human approval loop.

## Recommended starting stack

Start with **ComfyUI + SDXL photoreal finetune + SDXL character LoRA workflow**.

Specific stack:

- UI/orchestrator: ComfyUI, pinned commit, workflows saved as JSON and embedded in PNG metadata.
- Primary model: RealVisXL V5.0 fp16 for the first tests because it is SDXL, photoreal, local, OpenRAIL++, and less commercially ambiguous than Juggernaut. Also test one reviewed Juggernaut XL/X NSFW-capable checkpoint for aesthetic comparison after license review.
- Identity: generate a curated Sizzle player reference set, then train a character LoRA in kohya-ss or OneTrainer. Use IP-Adapter FaceID/InstantID as scaffolding and repair tools, not the sole identity system.
- Pose/layer control: ControlNet OpenPose plus Depth/Canny for the canonical body rig; masked inpainting for hair, clothing, and expressions.
- Segmentation: BiRefNet in ComfyUI for RGBA output, with mask cleanup and alpha QA over multiple backgrounds.
- Reproducibility: one asset equals one PNG, one workflow JSON, one manifest JSON, and one reference folder. Pin model hashes, VAE, LoRAs, ControlNets, reference images, seed, sampler, scheduler, precision, ComfyUI/custom-node commits, PyTorch/CUDA/cuDNN, attention backend, and GPU.

Rationale: this stack is fully offline, adult-capable without relying on cloud services, realistic enough for Sizzle's grounded 2005 thriller tone, mature on 16-24 GB VRAM, and explicit enough to support a deterministic batch pipeline for layered transparent PNGs. It also leaves an upgrade path to SD3.5 or FLUX later, once their local adult/control ecosystems catch up to SDXL.
