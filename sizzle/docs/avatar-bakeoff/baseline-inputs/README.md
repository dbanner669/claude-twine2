# Baseline Inputs

User-provided baseline images for the Sizzle avatar image-edit pipeline.

These files are adult anatomy/reference assets for testing layered avatar generation and extraction. They are research inputs, not production game assets yet.

## Files

| File | Source | SHA256 | Role |
|---|---|---|---|
| `alex-blank.png` | `C:\Users\Oculus\Downloads\Alex-Blank.png` | `7ECD55B55BBBE31C91474E34EA24C7117898E406340C97F0BC81546693345F86` | Baseline blank/no-hair body reference. |
| `alex-nohair-nude.png` | `C:\Users\Oculus\Downloads\Alex-NoHair-Nude.png` | `EC47925CFCA2AE55EC6BC875CC97F43A0C5BF8D1BFA7404F40FC20A8FBB3376B` | No-hair anatomy reference for base body/skin-tone and control-map extraction. |
| `alex-hair-nude.png` | `C:\Users\Oculus\Downloads\Alex-Hair-nude.png` | `1CB30F86680984265BD8D11A5CB29133B39BE4D1E5C73CFBE8D5B2F96C032362` | Hair-on anatomy reference for hair geometry and identity/style anchor. |
| `alex-hair-underwear.png` | `C:\Users\Oculus\Downloads\Alex-Hair-Underwear.png` | `335EB5785338E94B25190E1F487E041EB55B6874863AF188C8D78221BDE42ACE` | Hair + underwear reference for underwear/clothing alignment tests. |

## Intended Use

- Build Phase 2 control images: silhouette, pose/edge/depth guides, face landmarks where available.
- Test local image-edit workflows against a fixed body/face geometry.
- Extract candidate layers for Sizzle's runtime stack:
  - `body`
  - `hairBack`
  - `hairFront`
  - `underwear`
  - `clothingTop`
  - `clothingBottom`
  - `eyes`
  - `expression`
- Keep originals unchanged; all edits should be made from copies or generated derivatives.
