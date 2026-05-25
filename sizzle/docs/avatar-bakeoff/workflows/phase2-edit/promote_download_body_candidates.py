from __future__ import annotations

import json
import shutil
from pathlib import Path

from PIL import Image


DOWNLOADS = Path(r"C:\Users\Oculus\Downloads")
CANONICAL = Path(
    r"C:\Users\Oculus\My Drive\Female Agent\sizzle\docs\avatar-bakeoff\baseline-inputs\canonical\alex-noface-blank.png"
)
OUT = Path(
    r"C:\Users\Oculus\My Drive\Female Agent\sizzle\docs\avatar-bakeoff\production-drafts\candidates\v1"
)

CANDIDATES = [
    {
        "input": DOWNLOADS / "body-skin-medium_00029_.png",
        "role": "light",
        "output": "20_body-light-comfy-00029.png",
    },
    {
        "input": CANONICAL,
        "role": "medium",
        "output": "20_body-medium-canonical-noface.png",
        "canonical_size": True,
    },
    {
        "input": DOWNLOADS / "body-skin-medium_00017_.png",
        "role": "dark",
        "output": "20_body-dark-comfy-00017.png",
    },
]


def checkerboard(size: tuple[int, int]) -> Image.Image:
    image = Image.new("RGBA", size, (0, 0, 0, 255))
    px = image.load()
    tile = 32
    for y in range(size[1]):
        for x in range(size[0]):
            value = 76 if ((x // tile + y // tile) % 2) else 38
            px[x, y] = (value, value, value, 255)
    return image


def dark_ui_bg(size: tuple[int, int]) -> Image.Image:
    return Image.new("RGBA", size, (22, 18, 17, 255))


def restore_alpha(source: Image.Image, alpha_source: Image.Image) -> Image.Image:
    cropped = source.convert("RGBA").crop((0, 0, 523, 1536))
    r, g, b, _ = cropped.split()
    return Image.merge("RGBA", (r, g, b, alpha_source.getchannel("A")))


def composite_preview(layer: Image.Image, bg: Image.Image) -> Image.Image:
    out = bg.copy()
    out.alpha_composite(layer)
    return out


def main() -> None:
    body_dir = OUT / "body"
    qa_dir = OUT / "qa"
    source_dir = OUT / "source"
    body_dir.mkdir(parents=True, exist_ok=True)
    qa_dir.mkdir(parents=True, exist_ok=True)
    source_dir.mkdir(parents=True, exist_ok=True)

    canonical = Image.open(CANONICAL).convert("RGBA")
    report = {
        "method": "Crop Comfy 576x1536 RGB body output to canonical 523x1536 and restore alpha from alex-noface-blank.png.",
        "canonical_alpha": str(CANONICAL),
        "candidates": [],
    }

    for item in CANDIDATES:
        src_path = item["input"]
        if not src_path.exists():
            raise FileNotFoundError(src_path)
        src = Image.open(src_path).convert("RGBA")
        expected_size = (523, 1536) if item.get("canonical_size") else (576, 1536)
        if src.size != expected_size:
            raise ValueError(f"{src_path.name}: expected {expected_size}, got {src.size}")

        shutil.copy2(src_path, source_dir / src_path.name)
        layer = src if item.get("canonical_size") else restore_alpha(src, canonical)
        layer_path = body_dir / item["output"]
        layer.save(layer_path)

        checker_path = qa_dir / item["output"].replace(".png", "-checker.png")
        dark_path = qa_dir / item["output"].replace(".png", "-dark-ui.png")
        composite_preview(layer, checkerboard(layer.size)).save(checker_path)
        composite_preview(layer, dark_ui_bg(layer.size)).save(dark_path)

        report["candidates"].append(
            {
                "role": item["role"],
                "source": str(src_path),
                "archived_source": str(source_dir / src_path.name),
                "layer": str(layer_path),
                "qa_checker": str(checker_path),
                "qa_dark_ui": str(dark_path),
                "size": layer.size,
            }
        )

    (OUT / "body-skin-candidates.report.json").write_text(json.dumps(report, indent=2), encoding="utf-8")


if __name__ == "__main__":
    main()
