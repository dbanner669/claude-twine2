# Imagegen Clothing Test: User Mask

Generated: 2026-05-25

This folder records a built-in Codex imagegen clothing concept test that used the user-supplied `mask-test.png` as the visual garment guide.

## Source

- Body source: `source/20_body-medium-canonical-noface.png`
- User mask copy: `source/mask-test.png`
- Raw generated concept: `source/imagegen-user-mask-clothing-raw.png`
- Aligned inspection render: `source/imagegen-user-mask-clothing-aligned-white.png`

## Outputs

- Extracted draft layers: `extracted/`
- Derived masks: `masks/`
- QA previews: `qa/`
- Process report: `imagegen-user-mask-extraction.report.json`

## Assessment

This is the best built-in imagegen clothing concept test so far because the user mask gives the generator a much clearer garment silhouette. The result is still not production-safe:

- The generated figure was redrawn and rescaled rather than preserving canonical registration.
- Extraction required bbox fitting instead of direct same-canvas compositing.
- Extracted clothing keeps residue/background artifacts.
- The result should not be promoted to `sizzle/media/avatar/`.

Use this folder as evidence that the mask shape is useful, not as accepted clothing art.
