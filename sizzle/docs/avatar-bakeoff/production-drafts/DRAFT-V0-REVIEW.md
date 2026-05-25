# Draft V0 Review

Review date: 2026-05-25

Status: diagnostic only. Do not promote these outputs to `sizzle/media/avatar/`.

## User Review Summary

### Body recolors

Rejected as asset candidates.

The current outputs are simple whole-image recolors. They do not produce distinct skin tones while preserving non-skin elements at consistent colour/lightness. Future body variants need skin-specific recolouring or model-assisted edits that alter skin tone only.

### Hair

Rejected as asset candidates.

The `hairBack` / `hairFront` concept is valid, but the current algorithmic split is rough. The front layer obscures facial elements in ways that feel accidental. Hair colour variants should eventually be generated or edited as distinct assets, not only filter recolours.

### Underwear

Rejected as asset candidates.

The bra and briefs masks are not clean. The bra layer pulled figure outline fragments. The briefs layer pulled body outline, bra, and briefs together. Future underwear extraction needs tighter masks or a better edit/extraction source.

### Clothing

Rejected as asset candidates.

The shirt, jeans, and shoes are visibly mask-fill placeholders. They are useful only for testing canvas registration and layer order.

## What V0 Proved

- The draft workspace is correctly isolated from `media/avatar/`.
- All local PNG outputs preserve the `523x1536` canonical canvas.
- Local QA composite generation works.
- Fixed registration can be checked quickly across layer combinations.
- The layer stack and filename conventions are viable for draft production.

## Next Working Folder

Use `candidates/v1/` for the next serious pass. V1 should not inherit V0 assets automatically; each layer family must earn candidate status through QA.

## V1 Requirements

- Skin tone changes must affect skin only.
- Non-skin facial features, eyes, brows, mouth, and linework must remain consistent across body tones.
- Hair front/back masks must be cleaned so face details are not unintentionally covered.
- Underwear must be isolated as garment-only transparent layers.
- New clothing should come from model-assisted generation/editing or a hand-authored art pass, not mask fills.
- Every candidate remains full-canvas `523x1536`.
