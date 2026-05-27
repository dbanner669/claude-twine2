from __future__ import annotations

from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter


ROOT = Path(__file__).resolve().parents[4]
CANONICAL = ROOT / "docs" / "avatar-bakeoff" / "baseline-inputs" / "canonical"
OUT = ROOT / "docs" / "avatar-bakeoff" / "production-drafts" / "comfy-input"

CANONICAL_SIZE = (523, 1536)
PADDED_SIZE = (576, 1536)
QWEN_2509_SIZE = (624, 1672)
QWEN_2509_OFFSET = (
    (QWEN_2509_SIZE[0] - PADDED_SIZE[0]) // 2,
    (QWEN_2509_SIZE[1] - PADDED_SIZE[1]) // 2,
)


def load(name: str) -> Image.Image:
    image = Image.open(CANONICAL / name).convert("RGBA")
    if image.size != CANONICAL_SIZE:
        raise ValueError(f"{name}: expected {CANONICAL_SIZE}, got {image.size}")
    return image


def pad_right(image: Image.Image, fill=(0, 0, 0, 0)) -> Image.Image:
    padded = Image.new("RGBA", PADDED_SIZE, fill)
    padded.alpha_composite(image, (0, 0))
    return padded


def pad_for_qwen_2509(image: Image.Image, fill=(0, 0, 0, 0)) -> Image.Image:
    padded_576 = pad_right(image, fill)
    padded_624 = Image.new("RGBA", QWEN_2509_SIZE, fill)
    padded_624.alpha_composite(padded_576, QWEN_2509_OFFSET)
    return padded_624


def save(image: Image.Image, name: str) -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    image.save(OUT / name)


def mask_to_rgba(mask: np.ndarray) -> Image.Image:
    alpha = np.where(mask, 255, 0).astype(np.uint8)
    rgba = np.zeros((alpha.shape[0], alpha.shape[1], 4), dtype=np.uint8)
    rgba[..., :3] = 255
    rgba[..., 3] = alpha
    return Image.fromarray(rgba, "RGBA")


def mask_to_comfy_alpha_rgba(mask: np.ndarray) -> Image.Image:
    # ComfyUI LoadImage's MASK output interprets alpha inverted: transparent
    # pixels become active mask. Store inverse alpha so the visually intended
    # white target region becomes the active Comfy mask.
    alpha = np.where(mask, 0, 255).astype(np.uint8)
    rgba = np.zeros((alpha.shape[0], alpha.shape[1], 4), dtype=np.uint8)
    rgba[..., :3] = np.where(mask[..., None], 255, 0).astype(np.uint8)
    rgba[..., 3] = alpha
    return Image.fromarray(rgba, "RGBA")


def smooth(mask: np.ndarray, blur=1.2, cutoff=90) -> np.ndarray:
    image = Image.fromarray(np.where(mask, 255, 0).astype(np.uint8), "L")
    return np.asarray(image.filter(ImageFilter.GaussianBlur(blur))) > cutoff


def bbox(mask: np.ndarray) -> tuple[int, int, int, int]:
    ys, xs = np.where(mask)
    if len(xs) == 0:
        return 0, 0, 0, 0
    return int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1


def diff_mask(a: Image.Image, b: Image.Image, threshold=22.0) -> np.ndarray:
    aa = np.asarray(a.convert("RGBA")).astype(np.float32)
    bb = np.asarray(b.convert("RGBA")).astype(np.float32)
    rgb_delta = np.abs(aa[..., :3] - bb[..., :3]).mean(axis=2)
    alpha_delta = np.abs(aa[..., 3] - bb[..., 3])
    present = (aa[..., 3] > 8) | (bb[..., 3] > 8)
    return present & ((rgb_delta > threshold) | (alpha_delta > threshold))


def main() -> None:
    blank = load("alex-blank-crop.png")
    noface = load("alex-noface-blank.png")
    nohair = load("alex-nohair-nude-crop.png")
    hair = load("alex-hair-nude-crop.png")
    underwear = load("alex-hair-underwear-crop.png")

    sources = {
        "sizzle_alex_blank_crop_padded_576x1536.png": blank,
        "sizzle_alex_noface_blank_padded_576x1536.png": noface,
        "sizzle_alex_nohair_nude_crop_padded_576x1536.png": nohair,
        "sizzle_alex_hair_nude_crop_padded_576x1536.png": hair,
        "sizzle_alex_hair_underwear_crop_padded_576x1536.png": underwear,
    }
    for name, image in sources.items():
        save(pad_right(image), name)

    save(
        pad_for_qwen_2509(noface),
        "sizzle_alex_noface_blank_qwen2509_canvas_624x1672.png",
    )

    rgba = np.asarray(underwear).astype(np.float32)
    alpha = rgba[..., 3] > 8
    rgb = rgba[..., :3] / 255.0
    maxc = rgb.max(axis=2)
    minc = rgb.min(axis=2)
    sat = np.where(maxc == 0, 0, (maxc - minc) / np.maximum(maxc, 1e-6))
    val = maxc

    body = np.asarray(blank.getchannel("A")) > 8
    nohair_body = np.asarray(nohair.getchannel("A")) > 8
    x0, y0, x1, y1 = bbox(body)
    h = y1 - y0

    hair_rgba = np.asarray(hair).astype(np.float32)
    underwear_luma = 0.2126 * rgba[..., 0] + 0.7152 * rgba[..., 1] + 0.0722 * rgba[..., 2]
    hair_luma = 0.2126 * hair_rgba[..., 0] + 0.7152 * hair_rgba[..., 1] + 0.0722 * hair_rgba[..., 2]
    garment_delta = np.abs(rgba[..., :3] - hair_rgba[..., :3]).mean(axis=2)

    # Underwear is a grey/taupe garment that is visibly darker and less saturated
    # than the skin underneath. Combine colour and reference-difference tests so
    # we catch garment fills, not only outline antialiasing.
    underwear_mask = alpha & (sat < 0.46) & (val > 0.14) & (val < 0.74)
    underwear_mask &= (garment_delta > 10) | (underwear_luma < hair_luma - 6)
    underwear_mask[: y0 + int(h * 0.18), :] = False
    underwear_mask[y0 + int(h * 0.62) :, :] = False
    underwear_mask = smooth(underwear_mask, blur=1.0, cutoff=75)

    bra_mask = underwear_mask.copy()
    briefs_mask = underwear_mask.copy()
    split = y0 + int(h * 0.42)
    bra_mask[split:, :] = False
    briefs_mask[:split, :] = False

    hair_mask = diff_mask(hair, nohair, threshold=20.0)
    hair_mask &= np.asarray(hair.getchannel("A")) > 8
    hair_mask[y0 + int(h * 0.52) :, :] = False
    hair_mask = smooth(hair_mask, blur=0.9, cutoff=65)

    visible_skin = alpha & body & ~underwear_mask & ~hair_mask
    # Exclude the strongest dark facial/hairline details; the edit prompt must preserve them.
    luma = 0.2126 * rgba[..., 0] + 0.7152 * rgba[..., 1] + 0.0722 * rgba[..., 2]
    visible_skin &= luma > 55
    visible_skin = smooth(visible_skin, blur=0.6, cutoff=70)

    nohair_rgba = np.asarray(nohair).astype(np.float32)
    nohair_luma = 0.2126 * nohair_rgba[..., 0] + 0.7152 * nohair_rgba[..., 1] + 0.0722 * nohair_rgba[..., 2]
    body_skin = nohair_body & (nohair_luma > 45)
    # Keep eyes, brows, lips, nostrils, and dark linework from the source. The
    # model edits skin colour only, then the hard composite preserves details.
    body_skin = smooth(body_skin, blur=0.6, cutoff=70)

    noface_body = np.asarray(noface.getchannel("A")) > 8
    noface_rgba = np.asarray(noface).astype(np.float32)
    noface_luma = 0.2126 * noface_rgba[..., 0] + 0.7152 * noface_rgba[..., 1] + 0.0722 * noface_rgba[..., 2]
    noface_body_skin = noface_body & (noface_luma > 35)
    noface_body_skin = smooth(noface_body_skin, blur=0.6, cutoff=70)

    nx0, ny0, nx1, ny1 = bbox(noface_body)
    nh = ny1 - ny0
    face_features = np.zeros_like(noface_body)
    face_features[ny0 + int(nh * 0.030) : ny0 + int(nh * 0.135), nx0 + int((nx1 - nx0) * 0.30) : nx0 + int((nx1 - nx0) * 0.70)] = True
    eyes_mask = np.zeros_like(noface_body)
    eyes_mask[ny0 + int(nh * 0.055) : ny0 + int(nh * 0.085), nx0 + int((nx1 - nx0) * 0.33) : nx0 + int((nx1 - nx0) * 0.67)] = True
    nose_mask = np.zeros_like(noface_body)
    nose_mask[ny0 + int(nh * 0.075) : ny0 + int(nh * 0.110), nx0 + int((nx1 - nx0) * 0.43) : nx0 + int((nx1 - nx0) * 0.57)] = True
    mouth_mask = np.zeros_like(noface_body)
    mouth_mask[ny0 + int(nh * 0.105) : ny0 + int(nh * 0.130), nx0 + int((nx1 - nx0) * 0.39) : nx0 + int((nx1 - nx0) * 0.61)] = True
    chest_detail = np.zeros_like(noface_body)
    chest_detail[ny0 + int(nh * 0.220) : ny0 + int(nh * 0.330), nx0 + int((nx1 - nx0) * 0.26) : nx0 + int((nx1 - nx0) * 0.74)] = True
    pelvis_detail = np.zeros_like(noface_body)
    pelvis_detail[ny0 + int(nh * 0.455) : ny0 + int(nh * 0.535), nx0 + int((nx1 - nx0) * 0.35) : nx0 + int((nx1 - nx0) * 0.65)] = True

    top_mask = np.zeros_like(body)
    top_mask[y0 + int(h * 0.20) : y0 + int(h * 0.48), :] = body[y0 + int(h * 0.20) : y0 + int(h * 0.48), :]
    top_mask &= ~hair_mask
    top_mask = smooth(top_mask, blur=1.1, cutoff=70)

    bottom_mask = np.zeros_like(body)
    bottom_mask[y0 + int(h * 0.43) : y0 + int(h * 0.88), :] = body[y0 + int(h * 0.43) : y0 + int(h * 0.88), :]
    bottom_mask = smooth(bottom_mask, blur=1.1, cutoff=70)

    shoes_mask = np.zeros_like(body)
    shoes_mask[y0 + int(h * 0.86) : y1, :] = body[y0 + int(h * 0.86) : y1, :]
    shoes_mask = smooth(shoes_mask, blur=1.1, cutoff=60)

    masks = {
        "sizzle_mask_skin_visible_padded_576x1536.png": visible_skin,
        "sizzle_mask_body_skin_padded_576x1536.png": body_skin,
        "sizzle_mask_noface_body_skin_padded_576x1536.png": noface_body_skin,
        "sizzle_mask_face_features_padded_576x1536.png": face_features,
        "sizzle_mask_eyes_padded_576x1536.png": eyes_mask,
        "sizzle_mask_nose_padded_576x1536.png": nose_mask,
        "sizzle_mask_mouth_padded_576x1536.png": mouth_mask,
        "sizzle_mask_chest_detail_padded_576x1536.png": chest_detail,
        "sizzle_mask_pelvis_detail_padded_576x1536.png": pelvis_detail,
        "sizzle_mask_hair_padded_576x1536.png": hair_mask,
        "sizzle_mask_underwear_padded_576x1536.png": underwear_mask,
        "sizzle_mask_bra_padded_576x1536.png": bra_mask,
        "sizzle_mask_briefs_padded_576x1536.png": briefs_mask,
        "sizzle_mask_clothing_top_padded_576x1536.png": top_mask,
        "sizzle_mask_clothing_bottom_padded_576x1536.png": bottom_mask,
        "sizzle_mask_shoes_padded_576x1536.png": shoes_mask,
    }
    for name, mask in masks.items():
        save(pad_right(mask_to_rgba(mask)), name)
        comfy_name = name.replace("_padded_", "_comfy-mask_padded_")
        save(pad_right(mask_to_comfy_alpha_rgba(mask)), comfy_name)

    (OUT / "README.txt").write_text(
        "Copy these PNGs into ComfyUI/input before loading the Sizzle Flux2 mask-edit workflow.\n"
        "The canonical 523x1536 images are padded on the right to 576x1536 for FLUX latent compatibility.\n"
        "After Comfy generation, crop the rightmost 53 px to return to the canonical 523x1536 canvas.\n"
        "For Qwen Image Edit 2509 clothing tests, use sizzle_alex_noface_blank_qwen2509_canvas_624x1672.png.\n"
        "It keeps the 576x1536 padded avatar unchanged at x=24,y=68 inside a 624x1672 canvas.\n"
        "After Qwen generation, crop x=24,y=68,w=576,h=1536, then crop the rightmost 53 px for canonical 523x1536.\n",
        encoding="utf-8",
    )


if __name__ == "__main__":
    main()
