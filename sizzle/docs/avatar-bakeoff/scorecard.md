# Bakeoff Scorecard

Score `1-5`, where `5` means production-ready for the criterion and `1` means unusable.

Current interim read: early results suggest the Phase 1 direct text-to-image layer workflows are not production-viable. Continue scoring only to document evidence; the next recommended bakeoff should evaluate master-reference plus image-edit workflows.

## Summary Scores

| Contender | Setup | Full Stack Composite | Pixel Stability | Alpha Quality | Slot Reuse | Aesthetic Fit | Identity Consistency | Adult Anatomy | Prompt Adherence | Reproducibility | Hardware | Total | Verdict |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| SDXL RealVisXL V5 | Control |  |  |  |  |  |  |  |  |  |  |  |
| SDXL RealVisXL V5 | Selected LoRA |  |  |  |  |  |  |  |  |  |  |  |
| FLUX.2 Klein 4B Base | Control |  |  |  |  |  |  |  |  |  |  |  |
| FLUX.2 Klein 4B Base | Excellent Full Nude |  |  |  |  |  |  |  |  |  |  |  |
| FLUX.2 Klein 4B Base | Klein Fixes NSFW |  |  |  |  |  |  |  |  |  |  |  |
| FLUX.2 Klein 4B Distilled | Control |  |  |  |  |  |  |  |  |  |  |  |
| FLUX.2 Klein 4B Distilled | Excellent Full Nude |  |  |  |  |  |  |  |  |  |  |  |
| FLUX.2 Klein 4B Distilled | Klein Fixes NSFW |  |  |  |  |  |  |  |  |  |  |  |
| CyberRealistic Pony | Control |  |  |  |  |  |  |  |  |  |  |  |
| CyberRealistic Pony | Selected LoRA |  |  |  |  |  |  |  |  |  |  |  |

## Layer-Composition Pass

Fill this after selecting the best setup from each contender family.

| Contender Family | Best Setup | Body Skin Swap | Hair Matrix | Eye Overlay | Underwear | Top/Bottom/Shoes | Expression Parts | Full Composite | Notes |
|---|---|---:|---:|---:|---:|---:|---:|---|
| SDXL |  |  |  |  |  |  |  |  |  |
| FLUX.2 Klein |  |  |  |  |  |  |  |  |  |
| Pony Realism |  |  |  |  |  |  |  |  |  |

## Required Composite Checks

| Contender Family | Setup | light + black hair + blue eyes + blackTshirt | medium + brown hair + green eyes + blackTshirt | dark + blonde hair + brown eyes + blackTshirt | light + curly hair + whiteBlouse | dark + black hair + underwear only | Notes |
|---|---|---:|---:|---:|---:|---|
| SDXL |  |  |  |  |  |  |  |
| FLUX.2 Klein |  |  |  |  |  |  |  |
| Pony Realism |  |  |  |  |  |  |  |

## Criterion Notes

- **Full stack composite:** background, body, hair, eyes, underwear, clothing, and expression parts recombine into a coherent avatar.
- **Pixel stability:** head, face, shoulders, torso, clothing anchors, shoe anchors, and expression boxes remain locked to the same canvas positions.
- **Alpha quality:** segmentation produces usable hair/skin/fabric edges with minimal halos.
- **Slot reuse:** top, bottom, shoes, underwear, hair, and eyes can be reused across tested appearance combinations.
- **Aesthetic fit:** believable 2005 Toronto thriller character, not influencer, anime, fashion gloss, or adult-site render.
- **Identity consistency:** same woman across variants without a custom character LoRA.
- **Adult anatomy:** tasteful adult anatomy/underwear pass works without refusal, censor artifacts, or anatomy collapse.
- **Prompt adherence:** follows age, hair, eyes, outfit, tone, and framing.
- **Reproducibility:** fixed settings rerun near-identically on the same workstation.
- **Hardware:** fits expected 16-24 GB VRAM workflow without unacceptable offload or instability.

## Decision

Winner:

Interim recommendation: no Phase 1 winner. Move to Phase 2 image-edit derivation unless remaining runs show unexpectedly stable geometry.

Rationale:

Reference-only stacks:

Rejected stacks:
