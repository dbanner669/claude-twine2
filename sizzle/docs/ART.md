# Sizzle — Art Asset Development List

Use this file as the top-level art doc pointer.

Current actionable references:

- `docs/GREYBOX-ART.md` — current greybox art checklist and asset status
- `docs/avatar-bakeoff/STATUS.md` — current avatar pipeline status, including the Phase 2 pivot and files created during bakeoff work
- `docs/avatar-bakeoff/OPTION-2-ASSET-TODO.md` — full mix-and-match avatar asset checklist for the expanded layer model
- `docs/avatar-bakeoff/phase-2-image-edit-protocol.md` — current recommended process: canonical templates plus controlled image-edit derivation
- `docs/avatar-bakeoff/layer-composition-protocol.md` — pass/fail protocol for whether generated layers actually recombine
- `docs/AVATAR-RESEARCH.md` — original offline model-stack research report
- `docs/NPC-handler.md` — Robert Flett's written profile for character consistency
- `media/characters/robert-flett-reference-sheet.png` — Robert visual consistency sheet

Current state:

- Avatar art is still placeholder-only in `media/avatar/`; candidate body layers and workflow outputs live under `docs/avatar-bakeoff/production-drafts/` until explicitly promoted.
- Early bakeoff results indicate independently generated text-to-image layers are not consistent enough for production. The current recommended art process is canonical-template editing, controlled local image-edit variants, layer extraction, and crossed composite QA.
- The explicit avatar asset model is now locked: `background`, `hairBack`, `body`, `nipples`, `genitals`, `bodyMods`, `face`, `eyes`, `underwear`, `clothingBottom`, `clothingTop`, `shoes`, `hairFront`, `expression`, and `overlay`.
- The first greybox avatar proof is intentionally constrained to medium skin, long straight hair, and blue eyes.
- Clothing-layer experiments are still draft-only. Qwen Image Edit 2509 is now the leading clothing-fit route because it can adapt generated garment reference images to the fixed avatar body, but no clothing output has passed alpha extraction and crossed-composite QA yet.
- Robert-specific briefing/reference art now exists.
- Location art remains minimal.

If this document needs to become a full production tracker later, it should expand from the greybox checklist rather than replace it.
