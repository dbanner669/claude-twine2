from __future__ import annotations

import json
from pathlib import Path

from PIL import Image


COMFY_ROOT = Path(r"C:\Users\Oculus\Documents\ComfyUI\output\sizzle-avatar-bakeoff\phase2-edit\flux2\raw")
CANONICAL = Path(
    r"C:\Users\Oculus\My Drive\Female Agent\sizzle\docs\avatar-bakeoff\baseline-inputs\canonical\alex-noface-blank.png"
)
OUT = Path(
    r"C:\Users\Oculus\My Drive\Female Agent\sizzle\docs\avatar-bakeoff\production-drafts\candidates\v1"
)


def latest_raw() -> Path:
    candidates = list(COMFY_ROOT.glob("body-skin-medium_*.png"))
    if not candidates:
        candidates = list(COMFY_ROOT.glob("skin-medium_*.png"))
    if not candidates:
        raise SystemExit(f"No raw body-skin-medium or skin-medium PNG found under {COMFY_ROOT}")
    return max(candidates, key=lambda path: path.stat().st_mtime)


def checkerboard(size: tuple[int, int]) -> Image.Image:
    img = Image.new("RGBA", size, (0, 0, 0, 255))
    px = img.load()
    tile = 32
    for y in range(size[1]):
        for x in range(size[0]):
            v = 72 if ((x // tile + y // tile) % 2) else 42
            px[x, y] = (v, v, v, 255)
    return img


def main() -> None:
    raw_path = latest_raw()
    raw = Image.open(raw_path).convert("RGBA")
    canonical = Image.open(CANONICAL).convert("RGBA")

    # FLUX works on the padded 576x1536 image. Return to the canonical canvas
    # and restore the original transparent alpha/silhouette from the source.
    cropped = raw.crop((0, 0, 523, 1536))
    r, g, b, _ = cropped.split()
    candidate = Image.merge("RGBA", (r, g, b, canonical.getchannel("A")))

    body_dir = OUT / "body"
    qa_dir = OUT / "qa"
    body_dir.mkdir(parents=True, exist_ok=True)
    qa_dir.mkdir(parents=True, exist_ok=True)

    candidate_path = body_dir / "20_body-medium-comfy-raw-alpha.png"
    candidate.save(candidate_path)

    bg = checkerboard(candidate.size)
    bg.alpha_composite(candidate)
    qa_path = qa_dir / "body-medium-comfy-raw-alpha-checker.png"
    bg.save(qa_path)

    report = {
        "source_raw": str(raw_path),
        "canonical_alpha": str(CANONICAL),
        "candidate": str(candidate_path),
        "qa": str(qa_path),
        "method": "Use raw FLUX body edit, crop padded 576x1536 to canonical 523x1536, restore original alpha silhouette.",
    }
    (OUT / "body-medium-comfy-raw-alpha.report.json").write_text(json.dumps(report, indent=2), encoding="utf-8")


if __name__ == "__main__":
    main()
