from __future__ import annotations

import json
from pathlib import Path

from PIL import Image, ImageChops


COMFY_OUT = Path(r"C:\Users\Oculus\Documents\ComfyUI\output\sizzle-avatar-bakeoff\phase2-edit")
SIZZLE_OUT = Path(r"C:\Users\Oculus\My Drive\Female Agent\sizzle\docs\avatar-bakeoff\production-drafts\comfy-review")
SOURCE = Path(r"C:\Users\Oculus\My Drive\Female Agent\sizzle\docs\avatar-bakeoff\production-drafts\comfy-input\sizzle_alex_noface_blank_padded_576x1536.png")
MASK = Path(r"C:\Users\Oculus\My Drive\Female Agent\sizzle\docs\avatar-bakeoff\production-drafts\comfy-input\sizzle_mask_noface_body_skin_padded_576x1536.png")


def crop_canonical(image: Image.Image) -> Image.Image:
    return image.crop((0, 0, 523, 1536))


def main() -> None:
    SIZZLE_OUT.mkdir(parents=True, exist_ok=True)
    files = sorted(COMFY_OUT.rglob("*.png"), key=lambda p: p.stat().st_mtime)
    latest = {}
    for path in files:
        if "raw" in path.parts:
            latest["raw"] = path
        if "masked" in path.parts:
            latest["masked"] = path
    if not latest:
        raise SystemExit("No Comfy outputs found.")

    source = Image.open(SOURCE).convert("RGBA")
    mask = Image.open(MASK).convert("RGBA")

    report = {"outputs": {}}
    for kind, path in latest.items():
        image = Image.open(path).convert("RGBA")
        copied = SIZZLE_OUT / f"skin-medium_{kind}_latest_576x1536.png"
        image.save(copied)
        cropped = crop_canonical(image)
        cropped_path = SIZZLE_OUT / f"skin-medium_{kind}_latest_523x1536.png"
        cropped.save(cropped_path)

        if image.size == source.size:
            diff = ImageChops.difference(image, source)
            diff_path = SIZZLE_OUT / f"skin-medium_{kind}_diff_vs_source_576x1536.png"
            diff.save(diff_path)
            bbox = diff.getbbox()
        else:
            bbox = None

        report["outputs"][kind] = {
            "source_path": str(path),
            "size": image.size,
            "copied": str(copied),
            "cropped": str(cropped_path),
            "diff_bbox_vs_source": bbox,
        }

    mask.save(SIZZLE_OUT / "skin-medium_mask_used_576x1536.png")
    (SIZZLE_OUT / "report.json").write_text(json.dumps(report, indent=2), encoding="utf-8")


if __name__ == "__main__":
    main()
