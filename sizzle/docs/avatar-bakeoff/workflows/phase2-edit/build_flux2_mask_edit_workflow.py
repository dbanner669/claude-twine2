from __future__ import annotations

import json
from pathlib import Path


HERE = Path(__file__).resolve().parent


POSITIVE_PROMPT = (
    "This is a precise image edit for a layered visual-novel avatar. The source image is the fixed "
    "reference: keep the same canvas, camera, scale, front-facing standing pose, figure silhouette, "
    "head shape, shoulders, torso, arms, hands, hips, legs, feet, soft lighting, linework, and painterly "
    "style. Treat this as a conservative colour-correction pass on the existing painting, not a redraw "
    "and not a smoothing pass. Shift the body skin to a natural medium warm brown "
    "skin tone with believable undertones while preserving the source's fine skin texture, subtle pore "
    "grain, brush texture, small colour variations, soft anatomical shading, and existing highlight "
    "pattern. The skin should remain matte and organic, not glossy, plastic, airbrushed, waxy, oily, "
    "or cartoon-smooth. Keep the face blank and featureless. Keep the body outline and the unmasked "
    "parts of the image visually the same as the source."
)

NEGATIVE_PROMPT = ""


def workflow() -> dict:
    return {
        "1": {
            "class_type": "LoadImage",
            "inputs": {
                "image": "sizzle_alex_noface_blank_padded_576x1536.png",
                "upload": "image",
            },
            "_meta": {"title": "Source image: padded canonical reference"},
        },
        "2": {
            "class_type": "LoadImage",
            "inputs": {
                "image": "sizzle_mask_noface_body_skin_padded_576x1536.png",
                "upload": "image",
            },
            "_meta": {"title": "Edit mask image: white pixels may change"},
        },
        "22": {
            "class_type": "ImageToMask",
            "inputs": {
                "image": ["2", 0],
                "channel": "red",
            },
            "_meta": {"title": "Convert black/white mask image to MASK"},
        },
        "3": {
            "class_type": "UNETLoader",
            "inputs": {
                "unet_name": "flux-2-klein-base-4b-fp8.safetensors",
                "weight_dtype": "default",
            },
            "_meta": {"title": "Load FLUX.2 Klein 4B Base"},
        },
        "4": {
            "class_type": "CLIPLoader",
            "inputs": {
                "clip_name": "qwen_3_4b.safetensors",
                "type": "flux2",
                "device": "default",
            },
            "_meta": {"title": "Load Qwen text encoder"},
        },
        "5": {
            "class_type": "VAELoader",
            "inputs": {"vae_name": "full_encoder_small_decoder.safetensors"},
            "_meta": {"title": "Load official FLUX.2 edit VAE"},
        },
        "6": {
            "class_type": "CLIPTextEncode",
            "inputs": {"clip": ["4", 0], "text": POSITIVE_PROMPT},
            "_meta": {"title": "Positive prompt: single masked edit"},
        },
        "7": {
            "class_type": "CLIPTextEncode",
            "inputs": {"clip": ["4", 0], "text": NEGATIVE_PROMPT},
            "_meta": {"title": "Empty negative conditioning for FLUX.2"},
        },
        "8": {
            "class_type": "VAEEncode",
            "inputs": {"pixels": ["1", 0], "vae": ["5", 0]},
            "_meta": {"title": "Encode source reference"},
        },
        "9": {
            "class_type": "ReferenceLatent",
            "inputs": {"conditioning": ["6", 0], "latent": ["8", 0]},
            "_meta": {"title": "Positive reference latent"},
        },
        "10": {
            "class_type": "ReferenceLatent",
            "inputs": {"conditioning": ["7", 0], "latent": ["8", 0]},
            "_meta": {"title": "Negative reference latent"},
        },
        "11": {
            "class_type": "GetImageSize",
            "inputs": {"image": ["1", 0]},
            "_meta": {"title": "Read padded source size"},
        },
        "12": {
            "class_type": "EmptyFlux2LatentImage",
            "inputs": {"width": ["11", 0], "height": ["11", 1], "batch_size": 1},
            "_meta": {"title": "Edit latent matches padded source"},
        },
        "13": {
            "class_type": "RandomNoise",
            "inputs": {"noise_seed": 2309123001},
            "_meta": {"title": "Fixed seed for repeatability"},
        },
        "14": {
            "class_type": "CFGGuider",
            "inputs": {"model": ["3", 0], "positive": ["9", 0], "negative": ["10", 0], "cfg": 2.0},
            "_meta": {"title": "Flux2 guider"},
        },
        "15": {
            "class_type": "KSamplerSelect",
            "inputs": {"sampler_name": "euler"},
            "_meta": {"title": "Sampler"},
        },
        "16": {
            "class_type": "Flux2Scheduler",
            "inputs": {"steps": 20, "width": ["11", 0], "height": ["11", 1]},
            "_meta": {"title": "Flux2 scheduler"},
        },
        "17": {
            "class_type": "SamplerCustomAdvanced",
            "inputs": {
                "noise": ["13", 0],
                "guider": ["14", 0],
                "sampler": ["15", 0],
                "sigmas": ["16", 0],
                "latent_image": ["12", 0],
            },
            "_meta": {"title": "Sample image edit"},
        },
        "18": {
            "class_type": "VAEDecode",
            "inputs": {"samples": ["17", 0], "vae": ["5", 0]},
            "_meta": {"title": "Decode raw edit"},
        },
        "19": {
            "class_type": "SaveImage",
            "inputs": {
                "images": ["18", 0],
                "filename_prefix": "sizzle-avatar-bakeoff/phase2-edit/flux2/raw/body-skin-medium",
            },
            "_meta": {"title": "Save raw model edit"},
        },
        "20": {
            "class_type": "ImageCompositeMasked",
            "inputs": {
                "destination": ["1", 0],
                "source": ["18", 0],
                "x": 0,
                "y": 0,
                "resize_source": False,
                "mask": ["22", 0],
            },
            "_meta": {"title": "Hard-mask composite over original"},
        },
        "21": {
            "class_type": "SaveImage",
            "inputs": {
                "images": ["20", 0],
                "filename_prefix": "sizzle-avatar-bakeoff/phase2-edit/flux2/masked/body-skin-medium",
            },
            "_meta": {"title": "Save masked candidate"},
        },
    }


def main() -> None:
    path = HERE / "flux2-klein-4b-base-mask-edit.api.json"
    path.write_text(json.dumps(workflow(), indent=2), encoding="utf-8")


if __name__ == "__main__":
    main()
