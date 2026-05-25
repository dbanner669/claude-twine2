from __future__ import annotations

import json
from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter


ROOT = Path(__file__).resolve().parents[4]
CANONICAL = ROOT / "docs" / "avatar-bakeoff" / "baseline-inputs" / "canonical"
OUT = ROOT / "docs" / "avatar-bakeoff" / "production-drafts"

CANVAS = (523, 1536)


def load_rgba(name: str) -> Image.Image:
    img = Image.open(CANONICAL / name).convert("RGBA")
    if img.size != CANVAS:
        raise ValueError(f"{name} is {img.size}, expected {CANVAS}")
    return img


def ensure_dirs() -> None:
    for rel in [
        "source",
        "body",
        "eyes",
        "hair/back",
        "hair/front",
        "underwear",
        "clothing/tops",
        "clothing/bottoms",
        "clothing/shoes",
        "qa",
        "qa/checks",
    ]:
        (OUT / rel).mkdir(parents=True, exist_ok=True)


def save(img: Image.Image, rel: str) -> None:
    path = OUT / rel
    path.parent.mkdir(parents=True, exist_ok=True)
    img.save(path)


def arr(img: Image.Image) -> np.ndarray:
    return np.asarray(img.convert("RGBA")).astype(np.float32)


def mask_img(mask: np.ndarray) -> Image.Image:
    return Image.fromarray(np.where(mask, 255, 0).astype(np.uint8), "L")


def rgba_from_mask(mask: np.ndarray, rgb: tuple[int, int, int], alpha: np.ndarray | None = None) -> Image.Image:
    a = np.where(mask, 255, 0).astype(np.uint8) if alpha is None else np.where(mask, alpha, 0).astype(np.uint8)
    out = np.zeros((CANVAS[1], CANVAS[0], 4), dtype=np.uint8)
    out[..., 0] = rgb[0]
    out[..., 1] = rgb[1]
    out[..., 2] = rgb[2]
    out[..., 3] = a
    return Image.fromarray(out, "RGBA")


def bbox(mask: np.ndarray) -> tuple[int, int, int, int]:
    ys, xs = np.where(mask)
    if len(xs) == 0:
        return (0, 0, 0, 0)
    return int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1


def diff_mask(a: Image.Image, b: Image.Image, threshold: float = 26.0) -> np.ndarray:
    aa, bb = arr(a), arr(b)
    rgb_delta = np.abs(aa[..., :3] - bb[..., :3]).mean(axis=2)
    alpha_delta = np.abs(aa[..., 3] - bb[..., 3])
    present = (aa[..., 3] > 12) | (bb[..., 3] > 12)
    return present & ((rgb_delta > threshold) | (alpha_delta > threshold))


def clean_mask(mask: np.ndarray, blur: float = 1.2, cutoff: int = 80) -> np.ndarray:
    img = mask_img(mask).filter(ImageFilter.GaussianBlur(blur))
    return np.asarray(img) > cutoff


def connected_components(mask: np.ndarray, min_area: int = 25) -> list[np.ndarray]:
    h, w = mask.shape
    seen = np.zeros_like(mask, dtype=bool)
    comps: list[np.ndarray] = []
    for y, x in zip(*np.where(mask & ~seen)):
        if seen[y, x]:
            continue
        q: deque[tuple[int, int]] = deque([(int(y), int(x))])
        seen[y, x] = True
        pts = []
        while q:
            cy, cx = q.popleft()
            pts.append((cy, cx))
            for ny in range(max(0, cy - 1), min(h, cy + 2)):
                for nx in range(max(0, cx - 1), min(w, cx + 2)):
                    if not seen[ny, nx] and mask[ny, nx]:
                        seen[ny, nx] = True
                        q.append((ny, nx))
        if len(pts) >= min_area:
            comp = np.zeros_like(mask, dtype=bool)
            yy, xx = zip(*pts)
            comp[np.array(yy), np.array(xx)] = True
            comps.append(comp)
    return comps


def extract_with_mask(src: Image.Image, mask: np.ndarray, feather: float = 0.6) -> Image.Image:
    srca = np.asarray(src.convert("RGBA")).astype(np.uint8)
    alpha = np.asarray(mask_img(mask).filter(ImageFilter.GaussianBlur(feather))).astype(np.uint8)
    out = np.zeros_like(srca)
    out[..., :3] = srca[..., :3]
    out[..., 3] = np.minimum(srca[..., 3], alpha)
    return Image.fromarray(out, "RGBA")


def recolor_layer(layer: Image.Image, target: tuple[int, int, int], strength: float = 0.92) -> Image.Image:
    data = arr(layer)
    alpha = data[..., 3]
    rgb = data[..., :3]
    luma = (0.2126 * rgb[..., 0] + 0.7152 * rgb[..., 1] + 0.0722 * rgb[..., 2]) / 255.0
    shaded = np.zeros_like(rgb)
    target_arr = np.array(target, dtype=np.float32)
    shade = np.clip(0.42 + luma[..., None] * 1.05, 0.05, 1.35)
    shaded[:] = np.clip(target_arr * shade, 0, 255)
    dark_detail = luma[..., None] < 0.20
    mixed = np.where(dark_detail, rgb * 0.72 + shaded * 0.28, rgb * (1.0 - strength) + shaded * strength)
    out = np.zeros_like(data, dtype=np.uint8)
    out[..., :3] = np.clip(mixed, 0, 255).astype(np.uint8)
    out[..., 3] = alpha.astype(np.uint8)
    return Image.fromarray(out, "RGBA")


def recolor_mask_region(src: Image.Image, mask: np.ndarray, target: tuple[int, int, int]) -> Image.Image:
    layer = extract_with_mask(src, mask, feather=0.8)
    return recolor_layer(layer, target)


def alpha_mask(img: Image.Image, threshold: int = 8) -> np.ndarray:
    return np.asarray(img.getchannel("A")) > threshold


def make_checkerboard() -> Image.Image:
    tile = 32
    img = Image.new("RGBA", CANVAS, (0, 0, 0, 255))
    draw = ImageDraw.Draw(img)
    for y in range(0, CANVAS[1], tile):
        for x in range(0, CANVAS[0], tile):
            c = (42, 42, 42, 255) if ((x // tile + y // tile) % 2) else (78, 78, 78, 255)
            draw.rectangle([x, y, x + tile - 1, y + tile - 1], fill=c)
    return img


def make_dark_ui_background() -> Image.Image:
    img = Image.new("RGBA", CANVAS, (22, 18, 17, 255))
    draw = ImageDraw.Draw(img, "RGBA")
    draw.rectangle([0, 0, CANVAS[0], CANVAS[1]], fill=(22, 18, 17, 255))
    for i in range(28):
        alpha = max(0, 36 - i)
        draw.rectangle([i, i, CANVAS[0] - i, CANVAS[1] - i], outline=(184, 148, 94, alpha))
    return img


def composite(bg: Image.Image, layers: list[Image.Image]) -> Image.Image:
    out = bg.convert("RGBA").copy()
    for layer in layers:
        out.alpha_composite(layer.convert("RGBA"))
    return out


def make_iris_overlays(blank: Image.Image, body_mask: np.ndarray) -> dict[str, Image.Image]:
    rgba = arr(blank)
    x0, y0, x1, y1 = bbox(body_mask)
    h = y1 - y0
    cx = (x0 + x1) // 2
    # The generated masks are deliberately tiny. They are overlays, not repainted eyes.
    search = np.zeros(body_mask.shape, dtype=bool)
    search[max(0, y0 + int(h * 0.065)) : min(CANVAS[1], y0 + int(h * 0.19)), max(0, cx - 85) : min(CANVAS[0], cx + 85)] = True
    luma = 0.2126 * rgba[..., 0] + 0.7152 * rgba[..., 1] + 0.0722 * rgba[..., 2]
    dark = search & body_mask & (luma < 105)
    comps = connected_components(clean_mask(dark, blur=0.4, cutoff=80), min_area=4)
    candidates = []
    for comp in comps:
        bx0, by0, bx1, by1 = bbox(comp)
        bw, bh = bx1 - bx0, by1 - by0
        area = int(comp.sum())
        if 2 <= bw <= 34 and 2 <= bh <= 18 and area <= 220:
            candidates.append((bx0 + bw / 2, by0 + bh / 2, bw, bh, area))
    if len(candidates) >= 2:
        candidates.sort(key=lambda c: abs(c[1] - (y0 + h * 0.12)) + abs(c[0] - cx) * 0.05)
        pair = sorted(candidates[:6], key=lambda c: c[0])
        left = pair[0]
        right = pair[-1]
        centers = [(left[0], (left[1] + right[1]) / 2), (right[0], (left[1] + right[1]) / 2)]
    else:
        centers = [(cx - 27, y0 + h * 0.125), (cx + 27, y0 + h * 0.125)]

    colors = {
        "blue": (85, 111, 128),
        "green": (82, 122, 78),
        "brown": (53, 35, 24),
    }
    overlays = {}
    mask = Image.new("L", CANVAS, 0)
    md = ImageDraw.Draw(mask)
    for ex, ey in centers:
        md.ellipse([ex - 4.0, ey - 2.4, ex + 4.0, ey + 2.4], fill=220)
    save(mask, "source/control_eye_irises_mask.png")
    for name, rgb in colors.items():
        img = Image.new("RGBA", CANVAS, (0, 0, 0, 0))
        data = np.asarray(img).copy()
        a = np.asarray(mask)
        data[..., 0] = rgb[0]
        data[..., 1] = rgb[1]
        data[..., 2] = rgb[2]
        data[..., 3] = a
        overlays[name] = Image.fromarray(data, "RGBA")
    return overlays


def make_simple_clothing(body: Image.Image, body_mask: np.ndarray) -> dict[str, Image.Image]:
    x0, y0, x1, y1 = bbox(body_mask)
    h = y1 - y0
    torso_top = y0 + int(h * 0.205)
    torso_bottom = y0 + int(h * 0.475)
    waist = y0 + int(h * 0.465)
    ankle = y0 + int(h * 0.88)
    foot_top = y0 + int(h * 0.875)

    top_mask = np.zeros_like(body_mask)
    top_mask[torso_top:torso_bottom, :] = body_mask[torso_top:torso_bottom, :]
    top_mask[:, : max(0, x0 + 20)] = False
    top_mask[:, min(CANVAS[0], x1 - 20) :] = False
    top = rgba_from_mask(clean_mask(top_mask, blur=1.0, cutoff=55), (22, 22, 24))
    top_a = np.asarray(top).copy()
    td = ImageDraw.Draw(top)
    neck_w = max(34, int((x1 - x0) * 0.14))
    td.ellipse([CANVAS[0] / 2 - neck_w, torso_top - 10, CANVAS[0] / 2 + neck_w, torso_top + 42], fill=(0, 0, 0, 0))
    top = top.filter(ImageFilter.GaussianBlur(0.25))

    jeans_mask = np.zeros_like(body_mask)
    jeans_mask[waist:ankle, :] = body_mask[waist:ankle, :]
    jeans = rgba_from_mask(clean_mask(jeans_mask, blur=0.9, cutoff=60), (27, 38, 54))
    jd = ImageDraw.Draw(jeans, "RGBA")
    jd.line([x0 + 45, waist + 7, x1 - 45, waist + 7], fill=(62, 73, 88, 190), width=3)
    jd.line([CANVAS[0] / 2, waist + 10, CANVAS[0] / 2, ankle - 12], fill=(13, 20, 30, 120), width=2)

    shoes_mask = np.zeros_like(body_mask)
    shoes_mask[foot_top:y1, :] = body_mask[foot_top:y1, :]
    shoes = rgba_from_mask(clean_mask(shoes_mask, blur=1.2, cutoff=45), (34, 32, 31))
    sd = ImageDraw.Draw(shoes, "RGBA")
    sd.line([x0 + 35, y1 - 20, x1 - 35, y1 - 20], fill=(82, 78, 72, 180), width=3)

    save(mask_img(top_mask), "source/control_clothing_top_mask.png")
    save(mask_img(jeans_mask), "source/control_clothing_bottom_mask.png")
    save(mask_img(shoes_mask), "source/control_shoes_mask.png")
    return {"top": top, "jeans": jeans, "shoes": shoes}


def main() -> None:
    ensure_dirs()

    blank = load_rgba("alex-blank-crop.png")
    nohair = load_rgba("alex-nohair-nude-crop.png")
    hair = load_rgba("alex-hair-nude-crop.png")
    underwear_ref = load_rgba("alex-hair-underwear-crop.png")

    blank_alpha = alpha_mask(blank)
    nohair_alpha = alpha_mask(nohair)
    hair_alpha = alpha_mask(hair)
    body_mask = clean_mask(blank_alpha, blur=0.8, cutoff=80)

    save(mask_img(body_mask), "source/control_body_mask.png")
    save(mask_img(body_mask), "source/control_silhouette.png")
    save(make_checkerboard(), "source/checkerboard_background.png")
    save(make_dark_ui_background(), "source/sizzle_dark_ui_background.png")

    # Body drafts derive from the less explicit blank source, per user approval.
    body_light = blank.copy()
    body_medium = recolor_layer(blank, (168, 122, 85), strength=0.88)
    body_dark = recolor_layer(blank, (74, 47, 31), strength=0.92)
    save(body_light, "body/20_body-light.png")
    save(body_medium, "body/20_body-medium.png")
    save(body_dark, "body/20_body-dark.png")

    # Hair mask is derived from the two comparable nude states, then split by overlap.
    hair_mask = diff_mask(hair, nohair, threshold=24.0)
    hair_mask &= hair_alpha
    hair_mask[:0, :] = False
    hair_mask[int(CANVAS[1] * 0.68) :, :] = False
    hair_mask = clean_mask(hair_mask, blur=1.0, cutoff=65)
    front_mask = hair_mask & body_mask
    back_mask = hair_mask & ~body_mask
    save(mask_img(hair_mask), "source/control_hair_full_mask.png")
    save(mask_img(front_mask), "source/control_hair_front_mask.png")
    save(mask_img(back_mask), "source/control_hair_back_mask.png")

    hair_front_brown = extract_with_mask(hair, front_mask, feather=0.7)
    hair_back_brown = extract_with_mask(hair, back_mask, feather=0.7)
    hair_colors = {
        "brown": (58, 40, 24),
        "black": (26, 20, 16),
        "blonde": (140, 100, 56),
    }
    hair_layers = {}
    for name, rgb in hair_colors.items():
        front = recolor_layer(hair_front_brown, rgb, strength=0.82) if name != "brown" else hair_front_brown
        back = recolor_layer(hair_back_brown, rgb, strength=0.82) if name != "brown" else hair_back_brown
        hair_layers[f"front_{name}"] = front
        hair_layers[f"back_{name}"] = back
        save(back, f"hair/back/30_hair-back-long-straight-{name}.png")
        save(front, f"hair/front/70_hair-front-long-straight-{name}.png")

    eyes = make_iris_overlays(blank, body_mask)
    for name, img in eyes.items():
        save(img, f"eyes/40_eyes-{name}.png")

    undie_mask = diff_mask(underwear_ref, hair, threshold=22.0)
    undie_mask &= alpha_mask(underwear_ref)
    x0, y0, x1, y1 = bbox(body_mask)
    undie_mask[: y0 + int((y1 - y0) * 0.20), :] = False
    undie_mask[y0 + int((y1 - y0) * 0.63) :, :] = False
    undie_mask = clean_mask(undie_mask, blur=0.8, cutoff=70)
    comps = connected_components(undie_mask, min_area=80)
    comps.sort(key=lambda c: bbox(c)[1])
    if len(comps) >= 2:
        bra_mask = comps[0]
        briefs_mask = np.zeros_like(undie_mask)
        for comp in comps[1:]:
            briefs_mask |= comp
    else:
        bra_mask = np.zeros_like(undie_mask)
        briefs_mask = np.zeros_like(undie_mask)
        split = y0 + int((y1 - y0) * 0.43)
        bra_mask[:split, :] = undie_mask[:split, :]
        briefs_mask[split:, :] = undie_mask[split:, :]
    save(mask_img(undie_mask), "source/control_underwear_mask.png")
    save(mask_img(bra_mask), "source/control_bra_mask.png")
    save(mask_img(briefs_mask), "source/control_briefs_mask.png")
    bra = recolor_mask_region(underwear_ref, bra_mask, (112, 112, 112))
    briefs = recolor_mask_region(underwear_ref, briefs_mask, (112, 112, 112))
    save(bra, "underwear/50_bra-neutral-grey.png")
    save(briefs, "underwear/50_briefs-neutral-grey.png")

    clothing = make_simple_clothing(blank, body_mask)
    save(clothing["top"], "clothing/tops/60_black-tshirt.png")
    save(clothing["jeans"], "clothing/bottoms/55_dark-jeans.png")
    save(clothing["shoes"], "clothing/shoes/65_sneakers.png")

    checker = make_checkerboard()
    dark_bg = make_dark_ui_background()
    save(composite(checker, [body_light]), "qa/checks/body-light-checker.png")
    save(composite(checker, [hair_layers["back_brown"], body_light, hair_layers["front_brown"]]), "qa/checks/hair-split-brown-checker.png")
    save(composite(checker, [body_light, bra, briefs]), "qa/checks/underwear-checker.png")
    save(composite(checker, [body_light, clothing["jeans"], clothing["top"], clothing["shoes"]]), "qa/checks/outfit-checker.png")

    qa = {
        "qa/composite_light_long-straight-black_blue_blackTshirt_darkJeans_sneakers.png": [
            hair_layers["back_black"],
            body_light,
            eyes["blue"],
            clothing["jeans"],
            clothing["top"],
            clothing["shoes"],
            hair_layers["front_black"],
        ],
        "qa/composite_medium_long-straight-brown_green_underwear-only.png": [
            hair_layers["back_brown"],
            body_medium,
            eyes["green"],
            bra,
            briefs,
            hair_layers["front_brown"],
        ],
        "qa/composite_dark_long-straight-blonde_brown_blackTshirt_darkJeans_sneakers.png": [
            hair_layers["back_blonde"],
            body_dark,
            eyes["brown"],
            clothing["jeans"],
            clothing["top"],
            clothing["shoes"],
            hair_layers["front_blonde"],
        ],
    }
    for rel, layers in qa.items():
        save(composite(dark_bg, layers), rel)

    manifest = {
        "workflow": "no-key deterministic draft generator",
        "canvas": {"width": CANVAS[0], "height": CANVAS[1]},
        "inputs": {
            "body_primary": "baseline-inputs/canonical/alex-blank-crop.png",
            "body_compatibility": "baseline-inputs/canonical/alex-nohair-nude-crop.png",
            "hair": "baseline-inputs/canonical/alex-hair-nude-crop.png",
            "underwear": "baseline-inputs/canonical/alex-hair-underwear-crop.png",
        },
        "notes": [
            "Drafts are generated without API calls or ComfyUI.",
            "Body skin tones are recolors of the less explicit blank template.",
            "Hair colour variants reuse one extracted hair geometry.",
            "Clothing top/bottom/shoes are simple local mask drafts for registration QA, not final art direction.",
            "No files are written to media/avatar.",
        ],
    }
    (OUT / "manifest.no-key-drafts.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")


if __name__ == "__main__":
    main()
