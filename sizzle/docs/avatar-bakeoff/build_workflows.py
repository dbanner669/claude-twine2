"""Generate ComfyUI API prompt workflows for the Sizzle avatar bakeoff.

These are API-format workflows for ComfyUI's /prompt endpoint, not visual
editor exports. They intentionally avoid background-removal custom nodes so
the generation graphs remain portable; alpha extraction is documented as a
separate BiRefNet/rembg pass.
"""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parent
OUT = ROOT / "workflows" / "api"
WIDTH = 1024
HEIGHT = 1360


NEGATIVE_SDXL = (
    "anime, cartoon, illustration, 3d render, plastic skin, glossy fashion shoot, "
    "influencer, exaggerated breasts, exaggerated hips, childlike, teen, young-looking, "
    "deformed anatomy, extra fingers, missing fingers, bad hands, bad eyes, crossed eyes, "
    "asymmetrical face, heavy makeup, modern smartphone, watermark, signature, text, logo, "
    "cropped, out of frame, celebrity"
)

NEGATIVE_PONY = (
    "score_4, score_5, score_6, source_anime, source_cartoon, source_pony, source_furry, "
    "anime, furry, cartoon, illustration, 3d render, child, teen, young-looking, "
    "exaggerated body, influencer, plastic skin, bad anatomy, bad hands, bad eyes, "
    "text, watermark, logo, celebrity"
)

NEGATIVE_FLUX = (
    "avoid anime, avoid cartoon, avoid 3d render, avoid influencer glamour, avoid childlike "
    "features, avoid teen appearance, avoid celebrity likeness, avoid exaggerated body "
    "proportions, avoid watermark, avoid text, avoid logo"
)

PONY_PREFIX = "score_9, score_8_up, score_7_up, source_photo, realistic, photorealistic, adult woman, "

LAYER_PROMPTS = [
    {
        "name": "20_body-light",
        "seed": 2309122005,
        "prompt": "same locked avatar canvas and pose, isolated base body sprite for the body runtime layer, adult 27 year old Canadian woman, light skin, natural body proportions, neutral front-facing avatar reference pose, arms relaxed slightly away from torso, hair hidden or pulled away for layer testing, no outer clothing, no jewelry, plain matte grey background for segmentation, body silhouette and face geometry must match the canonical pose guide exactly",
    },
    {
        "name": "20_body-medium",
        "seed": 2309122006,
        "prompt": "same locked avatar canvas and pose, isolated base body sprite for the body runtime layer, adult 27 year old Canadian woman, medium brown skin, natural body proportions, neutral front-facing avatar reference pose, arms relaxed slightly away from torso, hair hidden or pulled away for layer testing, no outer clothing, no jewelry, plain matte grey background for segmentation, body silhouette and face geometry must match the canonical pose guide exactly",
    },
    {
        "name": "20_body-dark",
        "seed": 2309122007,
        "prompt": "same locked avatar canvas and pose, isolated base body sprite for the body runtime layer, adult 27 year old Canadian woman, dark skin, natural body proportions, neutral front-facing avatar reference pose, arms relaxed slightly away from torso, hair hidden or pulled away for layer testing, no outer clothing, no jewelry, plain matte grey background for segmentation, body silhouette and face geometry must match the canonical pose guide exactly",
    },
    {
        "name": "30_hair-long-straight-black",
        "seed": 2309122008,
        "prompt": "same locked avatar canvas and head position, isolated hair sprite only, long straight black hair for an adult woman, natural 2005 hairstyle, hair follows the canonical skull, neck, and shoulder guide, no face repainting, no skin repainting, no eye repainting, no clothing repainting, plain matte grey background for segmentation",
    },
    {
        "name": "30_hair-long-straight-brown",
        "seed": 2309122009,
        "prompt": "same locked avatar canvas and head position, isolated hair sprite only, long straight brown hair for an adult woman, natural 2005 hairstyle, hair follows the canonical skull, neck, and shoulder guide, no face repainting, no skin repainting, no eye repainting, no clothing repainting, plain matte grey background for segmentation",
    },
    {
        "name": "30_hair-long-straight-blonde",
        "seed": 2309122010,
        "prompt": "same locked avatar canvas and head position, isolated hair sprite only, long straight dark blonde hair for an adult woman, natural 2005 hairstyle, hair follows the canonical skull, neck, and shoulder guide, no face repainting, no skin repainting, no eye repainting, no clothing repainting, plain matte grey background for segmentation",
    },
    {
        "name": "30_hair-short-bob-brown",
        "seed": 2309122011,
        "prompt": "same locked avatar canvas and head position, isolated hair sprite only, short brown bob haircut for an adult woman, natural 2005 hairstyle, hair follows the canonical skull, neck, and shoulder guide, no face repainting, no skin repainting, no eye repainting, no clothing repainting, plain matte grey background for segmentation",
    },
    {
        "name": "30_hair-long-curly-brown",
        "seed": 2309122012,
        "prompt": "same locked avatar canvas and head position, isolated hair sprite only, long curly brown hair for an adult woman, natural 2005 hairstyle, hair follows the canonical skull, neck, and shoulder guide, no face repainting, no skin repainting, no eye repainting, no clothing repainting, plain matte grey background for segmentation",
    },
    {
        "name": "35_eyes-blue",
        "seed": 2309122013,
        "prompt": "same locked avatar canvas and face position, isolated eye colour sprite only, adult female blue irises aligned to canonical eye line, change iris colour only, no eyelid repainting, no skin repainting, no brows, no mouth, no hair, no clothing, plain matte grey background for segmentation",
    },
    {
        "name": "35_eyes-green",
        "seed": 2309122014,
        "prompt": "same locked avatar canvas and face position, isolated eye colour sprite only, adult female green irises aligned to canonical eye line, change iris colour only, no eyelid repainting, no skin repainting, no brows, no mouth, no hair, no clothing, plain matte grey background for segmentation",
    },
    {
        "name": "35_eyes-brown",
        "seed": 2309122015,
        "prompt": "same locked avatar canvas and face position, isolated eye colour sprite only, adult female brown irises aligned to canonical eye line, change iris colour only, no eyelid repainting, no skin repainting, no brows, no mouth, no hair, no clothing, plain matte grey background for segmentation",
    },
    {
        "name": "underwear-neutral-bra",
        "seed": 2309122016,
        "prompt": "same locked avatar canvas and body position, isolated underwear sprite only, neutral practical bra, aligned to canonical bust and torso, no skin baked into the underwear layer, must fit under outer clothing, plain matte grey background for segmentation",
    },
    {
        "name": "underwear-neutral-briefs",
        "seed": 2309122017,
        "prompt": "same locked avatar canvas and body position, isolated underwear sprite only, neutral practical briefs, aligned to canonical waist, hips, and pelvis, no skin baked into the underwear layer, must fit under outer clothing, plain matte grey background for segmentation",
    },
    {
        "name": "clothing-tops-blackTshirt",
        "seed": 2309122018,
        "prompt": "same locked avatar canvas and torso position, isolated clothing top sprite only, simple fitted dark t-shirt, front-facing, collar aligned to canonical neck, sleeves aligned to canonical shoulders and upper arms, hem aligned to canonical waist, no skin baked into the garment, no underwear baked in, no hair, no face repainting, plain matte grey background for segmentation",
    },
    {
        "name": "clothing-tops-whiteBlouse",
        "seed": 2309122019,
        "prompt": "same locked avatar canvas and torso position, isolated clothing top sprite only, simple white blouse suitable for a 2005 government briefing, front-facing, collar aligned to canonical neck, sleeves aligned to canonical shoulders and upper arms, hem aligned to canonical waist, no skin baked into the garment, no underwear baked in, no hair, no face repainting, plain matte grey background for segmentation",
    },
    {
        "name": "clothing-bottoms-darkJeans",
        "seed": 2309122020,
        "prompt": "same locked avatar canvas and lower body position, isolated clothing bottom sprite only, dark 2005 jeans, waistband aligned to canonical waist, legs aligned to canonical hips and legs, no skin baked into the garment, no shoes baked in, plain matte grey background for segmentation",
    },
    {
        "name": "clothing-shoes-sneakers",
        "seed": 2309122021,
        "prompt": "same locked avatar canvas and foot position, isolated shoe sprite only, practical sneakers, soles aligned to canonical foot position, no legs or skin baked into the shoe layer, plain matte grey background for segmentation",
    },
    {
        "name": "expression-mouth-calm",
        "seed": 2309122022,
        "prompt": "same locked avatar canvas and face position, isolated mouth expression overlay only, calm neutral adult female mouth, subtle expression change, mouth aligned to canonical mouth box, no skin tone change, no brows, no eyes, no hair, no clothing, plain matte grey background for segmentation",
    },
    {
        "name": "expression-mouth-frown",
        "seed": 2309122023,
        "prompt": "same locked avatar canvas and face position, isolated mouth expression overlay only, worried frown adult female mouth, subtle tense expression, mouth aligned to canonical mouth box, no skin tone change, no brows, no eyes, no hair, no clothing, plain matte grey background for segmentation",
    },
    {
        "name": "expression-mouth-open",
        "seed": 2309122024,
        "prompt": "same locked avatar canvas and face position, isolated mouth expression overlay only, surprised slightly open adult female mouth, restrained expression, mouth aligned to canonical mouth box, no skin tone change, no brows, no eyes, no hair, no clothing, plain matte grey background for segmentation",
    },
    {
        "name": "expression-brows-relaxed",
        "seed": 2309122025,
        "prompt": "same locked avatar canvas and face position, isolated brow expression overlay only, relaxed adult female brows, brows aligned to canonical brow box, no skin tone change, no eyes, no mouth, no hair, no clothing, plain matte grey background for segmentation",
    },
    {
        "name": "expression-brows-worried",
        "seed": 2309122026,
        "prompt": "same locked avatar canvas and face position, isolated brow expression overlay only, worried adult female brows, brows aligned to canonical brow box, no skin tone change, no eyes, no mouth, no hair, no clothing, plain matte grey background for segmentation",
    },
    {
        "name": "expression-brows-raised",
        "seed": 2309122027,
        "prompt": "same locked avatar canvas and face position, isolated brow expression overlay only, raised surprised adult female brows, brows aligned to canonical brow box, no skin tone change, no eyes, no mouth, no hair, no clothing, plain matte grey background for segmentation",
    },
    {
        "name": "bodyMods-small-scar",
        "seed": 2309122028,
        "prompt": "same locked avatar canvas and body position, isolated body modification sprite only, small subtle scar on adult woman's torso, no skin repainting beyond the scar mark, no hair, no clothing, transparent layer test on plain matte grey background for segmentation",
    },
]


def write_json(path: Path, data: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")


def sdxl_like_api(
    *,
    ckpt_name: str,
    lora_name: str | None,
    lora_strength: float,
    positive_prefix: str,
    negative_prompt: str,
    output_folder: str,
    steps: int,
    cfg: float,
    sampler: str,
    scheduler: str,
) -> dict:
    workflow: dict[str, dict] = {
        "1": {
            "class_type": "CheckpointLoaderSimple",
            "inputs": {"ckpt_name": ckpt_name},
            "_meta": {"title": "Load checkpoint"},
        }
    }
    if lora_name:
        workflow["2"] = {
            "class_type": "LoraLoader",
            "inputs": {
                "model": ["1", 0],
                "clip": ["1", 1],
                "lora_name": lora_name,
                "strength_model": lora_strength,
                "strength_clip": lora_strength,
            },
            "_meta": {"title": "Community LoRA"},
        }
        model_ref = ["2", 0]
        clip_ref = ["2", 1]
    else:
        model_ref = ["1", 0]
        clip_ref = ["1", 1]
    workflow["3"] = {
        "class_type": "CLIPTextEncode",
        "inputs": {"clip": clip_ref, "text": negative_prompt},
        "_meta": {"title": "Negative prompt"},
    }
    next_id = 10
    for i, layer in enumerate(LAYER_PROMPTS):
        pos_id = str(next_id)
        latent_id = str(next_id + 1)
        sampler_id = str(next_id + 2)
        decode_id = str(next_id + 3)
        save_id = str(next_id + 4)
        next_id += 5
        workflow[pos_id] = {
            "class_type": "CLIPTextEncode",
            "inputs": {"clip": clip_ref, "text": positive_prefix + layer["prompt"]},
            "_meta": {"title": f"Positive: {layer['name']}"},
        }
        workflow[latent_id] = {
            "class_type": "EmptyLatentImage",
            "inputs": {"width": WIDTH, "height": HEIGHT, "batch_size": 1},
            "_meta": {"title": f"Latent: {layer['name']}"},
        }
        workflow[sampler_id] = {
            "class_type": "KSampler",
            "inputs": {
                "model": model_ref,
                "positive": [pos_id, 0],
                "negative": ["3", 0],
                "latent_image": [latent_id, 0],
                "seed": layer["seed"],
                "control_after_generate": "fixed",
                "steps": steps,
                "cfg": cfg,
                "sampler_name": sampler,
                "scheduler": scheduler,
                "denoise": 1.0,
            },
            "_meta": {"title": f"Sample: {layer['name']}"},
        }
        workflow[decode_id] = {
            "class_type": "VAEDecode",
            "inputs": {"samples": [sampler_id, 0], "vae": ["1", 2]},
            "_meta": {"title": f"Decode: {layer['name']}"},
        }
        workflow[save_id] = {
            "class_type": "SaveImage",
            "inputs": {
                "images": [decode_id, 0],
                "filename_prefix": f"{output_folder}/{i + 1:02d}_{layer['name']}",
            },
            "_meta": {"title": f"Save RGB: {layer['name']}"},
        }
    return workflow


def flux2_api(
    *,
    model_name: str,
    lora_name: str | None,
    lora_strength: float,
    output_folder: str,
    steps: int,
    cfg: float,
) -> dict:
    workflow: dict[str, dict] = {
        "1": {
            "class_type": "UNETLoader",
            "inputs": {"unet_name": model_name, "weight_dtype": "default"},
            "_meta": {"title": "Load FLUX.2 diffusion model"},
        },
        "2": {
            "class_type": "CLIPLoader",
            "inputs": {
                "clip_name": "qwen_3_4b.safetensors",
                "type": "flux2",
                "device": "default",
            },
            "_meta": {"title": "Load Qwen text encoder"},
        },
        "3": {
            "class_type": "VAELoader",
            "inputs": {"vae_name": "flux2-vae.safetensors"},
            "_meta": {"title": "Load FLUX.2 VAE"},
        },
    }
    if lora_name:
        workflow["4"] = {
            "class_type": "LoraLoaderModelOnly",
            "inputs": {
                "model": ["1", 0],
                "lora_name": lora_name,
                "strength_model": lora_strength,
            },
            "_meta": {"title": "FLUX.2 community NSFW/anatomy LoRA"},
        }
        model_ref = ["4", 0]
        clip_ref = ["2", 0]
    else:
        model_ref = ["1", 0]
        clip_ref = ["2", 0]
    workflow["5"] = {
        "class_type": "CLIPTextEncode",
        "inputs": {"clip": clip_ref, "text": NEGATIVE_FLUX},
        "_meta": {"title": "FLUX constraint/negative prompt"},
    }
    next_id = 10
    for i, layer in enumerate(LAYER_PROMPTS):
        pos_id = str(next_id)
        latent_id = str(next_id + 1)
        sampler_id = str(next_id + 2)
        decode_id = str(next_id + 3)
        save_id = str(next_id + 4)
        next_id += 5
        workflow[pos_id] = {
            "class_type": "CLIPTextEncode",
            "inputs": {"clip": clip_ref, "text": layer["prompt"]},
            "_meta": {"title": f"Positive: {layer['name']}"},
        }
        workflow[latent_id] = {
            "class_type": "EmptyFlux2LatentImage",
            "inputs": {"width": WIDTH, "height": HEIGHT, "batch_size": 1},
            "_meta": {"title": f"Latent: {layer['name']}"},
        }
        workflow[sampler_id] = {
            "class_type": "KSampler",
            "inputs": {
                "model": model_ref,
                "positive": [pos_id, 0],
                "negative": ["5", 0],
                "latent_image": [latent_id, 0],
                "seed": layer["seed"],
                "control_after_generate": "fixed",
                "steps": steps,
                "cfg": cfg,
                "sampler_name": "euler",
                "scheduler": "simple",
                "denoise": 1.0,
            },
            "_meta": {"title": f"Sample: {layer['name']}"},
        }
        workflow[decode_id] = {
            "class_type": "VAEDecode",
            "inputs": {"samples": [sampler_id, 0], "vae": ["3", 0]},
            "_meta": {"title": f"Decode: {layer['name']}"},
        }
        workflow[save_id] = {
            "class_type": "SaveImage",
            "inputs": {
                "images": [decode_id, 0],
                "filename_prefix": f"{output_folder}/{i + 1:02d}_{layer['name']}",
            },
            "_meta": {"title": f"Save RGB: {layer['name']}"},
        }
    return workflow


def main() -> None:
    write_json(
        OUT / "sdxl-realvisxl-v5-control-layer-matrix.api.json",
        sdxl_like_api(
            ckpt_name="RealVisXL_V5.0_fp16.safetensors",
            lora_name=None,
            lora_strength=0.0,
            positive_prefix="",
            negative_prompt=NEGATIVE_SDXL,
            output_folder="sizzle-avatar-bakeoff/sdxl-realvisxl-v5/control",
            steps=32,
            cfg=5.5,
            sampler="dpmpp_2m",
            scheduler="karras",
        ),
    )
    write_json(
        OUT / "sdxl-realvisxl-v5-layer-matrix.api.json",
        sdxl_like_api(
            ckpt_name="RealVisXL_V5.0_fp16.safetensors",
            lora_name="TODO_SELECT_SDXL_REALISM_LORA.safetensors",
            lora_strength=0.45,
            positive_prefix="",
            negative_prompt=NEGATIVE_SDXL,
            output_folder="sizzle-avatar-bakeoff/sdxl-realvisxl-v5/lora",
            steps=32,
            cfg=5.5,
            sampler="dpmpp_2m",
            scheduler="karras",
        ),
    )
    write_json(
        OUT / "pony-cyberrealistic-control-layer-matrix.api.json",
        sdxl_like_api(
            ckpt_name="CyberRealistic_Pony.safetensors",
            lora_name=None,
            lora_strength=0.0,
            positive_prefix=PONY_PREFIX,
            negative_prompt=NEGATIVE_PONY,
            output_folder="sizzle-avatar-bakeoff/pony-cyberrealistic/control",
            steps=30,
            cfg=5.0,
            sampler="dpmpp_2m",
            scheduler="karras",
        ),
    )
    write_json(
        OUT / "pony-cyberrealistic-layer-matrix.api.json",
        sdxl_like_api(
            ckpt_name="CyberRealistic_Pony.safetensors",
            lora_name="TODO_SELECT_PONY_REALISM_LORA.safetensors",
            lora_strength=0.45,
            positive_prefix=PONY_PREFIX,
            negative_prompt=NEGATIVE_PONY,
            output_folder="sizzle-avatar-bakeoff/pony-cyberrealistic/lora",
            steps=30,
            cfg=5.0,
            sampler="dpmpp_2m",
            scheduler="karras",
        ),
    )
    flux_loras = {
        "excellent-full-nude": "excellent_full_nude_flux2_klein_4b_by_sarcastic_tofu.safetensors",
        "klein-fixes-nsfw": "klein_fixes_nsfw.safetensors",
    }
    for mode, model, steps, cfg in [
        ("base", "flux-2-klein-base-4b.safetensors", 20, 5.0),
        ("distilled", "flux-2-klein-4b.safetensors", 4, 1.0),
    ]:
        write_json(
            OUT / f"flux2-klein-4b-{mode}-control-layer-matrix.api.json",
            flux2_api(
                model_name=model,
                lora_name=None,
                lora_strength=0.0,
                output_folder=f"sizzle-avatar-bakeoff/flux2-klein-4b-{mode}/control",
                steps=steps,
                cfg=cfg,
            ),
        )
        for slug, lora in flux_loras.items():
            write_json(
                OUT / f"flux2-klein-4b-{mode}-{slug}-layer-matrix.api.json",
                flux2_api(
                    model_name=model,
                    lora_name=lora,
                    lora_strength=0.65,
                    output_folder=f"sizzle-avatar-bakeoff/flux2-klein-4b-{mode}/{slug}",
                    steps=steps,
                    cfg=cfg,
                ),
            )


if __name__ == "__main__":
    main()
