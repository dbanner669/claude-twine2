# LoRA Registry

Record exact files before scoring. A model or LoRA is not eligible for the scored bakeoff until filename, source URL, license, trigger words, recommended weight, and hash are captured.

## SDXL: RealVisXL V5.0

### Base Checkpoint

| Field | Value |
|---|---|
| Name | RealVisXL V5.0 |
| Source | https://huggingface.co/SG161222/RealVisXL_V5.0 |
| Filename | TODO |
| SHA256 | TODO |
| License | TODO: capture exact license text/source snapshot |
| Notes | SDXL photoreal baseline for grounded Sizzle look. |

### Candidate LoRAs

Use exactly one for the scored LoRA pass unless a later exploratory pass explicitly tests stacks.

| Candidate | Source | Purpose | Initial Weight | Trigger Words | License | SHA256 | Status |
|---|---|---|---:|---|---|---|---|
| Realistic Skin Texture style (Detailed Skin) XL | TODO | Realistic skin detail, reduce plastic rendering | 0.35 | TODO | TODO | TODO | Candidate |
| PhotorealTouch SDXL | TODO | Photoreal correction / anti-AI polish | 0.45 | TODO | TODO | TODO | Candidate |

## FLUX.2 Klein 4B

### Base Models

| Field | 4B Base | 4B Distilled |
|---|---|---|
| Source | TODO: official BFL/Hugging Face source | TODO: official BFL/Hugging Face source |
| Filename | TODO | TODO |
| SHA256 | TODO | TODO |
| License | TODO: confirm Apache 2.0 or exact source license | TODO: confirm exact source license |
| Notes | Higher quality/editing/flexibility target | Faster low-step diagnostic |

### Required User-Specified LoRA Candidates

Test these separately. Do not stack them for the scored pass.

| Candidate | Source | Purpose | Initial Weight | Trigger Words | License | SHA256 | Status |
|---|---|---|---:|---|---|---|---|
| Excellent Full Nude Flux2 Klein 4B by Sarcastic Tofu | https://civitai.red/models/2432232/excellent-full-nude-flux2-klein-4b-by-sarcastic-tofu?modelVersionId=2734784 | Tasteful adult anatomy / reduce refusal or censoring | 0.65 | TODO | TODO | TODO | Required |
| Klein Fixes NSFW | https://civitai.red/models/2482439/klein-fixes-nsfw?modelVersionId=2802658 | Tasteful adult anatomy / fix Klein NSFW behavior | 0.65 | TODO | TODO | TODO | Required |

Weight protocol:

- Start at `0.65`.
- If output becomes overfit, glossy, distorted, or too explicit for the tasteful-anatomy pass, rerun at `0.45`.
- If output still refuses or anatomically collapses, rerun at `0.85`.
- Record every scored weight in the manifest.

## Pony Realism: CyberRealistic Pony

### Base Checkpoint

| Field | Value |
|---|---|
| Name | CyberRealistic Pony |
| Source | TODO |
| Filename | TODO |
| SHA256 | TODO |
| License | TODO: capture exact license text/source snapshot |
| Notes | Realism-leaning Pony contender; must be checked for Sizzle aesthetic drift. |

### Candidate LoRAs

Use exactly one for the scored LoRA pass unless a later exploratory pass explicitly tests stacks.

| Candidate | Source | Purpose | Initial Weight | Trigger Words | License | SHA256 | Status |
|---|---|---|---:|---|---|---|---|
| PhotorealTouch PONY | TODO | Push Pony toward believable photographic rendering | 0.45 | TODO | TODO | TODO | Candidate |
| Realistic Skin Texture style Pony | TODO | Skin/anatomy texture, reduce plastic rendering | 0.35 | TODO | TODO | TODO | Candidate |

## Eligibility Checklist

- Exact file is downloaded locally.
- Source URL is recorded.
- License/source terms are copied or snapshotted.
- Generated image usage is allowed for this project.
- Trigger words and recommended weights are recorded.
- File hash is recorded before scoring.
- LoRA does not force a celebrity likeness, underage-coded subject, anime style, or narrow identity that conflicts with Sizzle.

