# Baseline Inputs

User-provided baseline images for the Sizzle avatar image-edit pipeline.

These files are adult anatomy/reference assets for testing layered avatar generation and extraction. They are research inputs, not production game assets yet.

## Canonical Templates

The cropped transparent-background files in `canonical/` are the current canonical templates. Use these for control-map extraction, image-edit tests, layer registration, and any future ComfyUI workflow setup unless a later canonical set explicitly replaces them.

All five canonical templates share a `523x1536` canvas and transparent background.

| File | Source | Dimensions | SHA256 | Role |
|---|---|---:|---|---|
| `canonical/alex-blank-crop.png` | `C:\Users\Oculus\Downloads\Alex-Blank-Crop.png` | `523x1536` | `97A2E56DF55A76C27126900531BEE7338996AE24E2980E34156103372ED9DD44` | Canonical blank/no-hair body reference for non-explicit body silhouette and face placement. |
| `canonical/alex-nohair-nude-crop.png` | `C:\Users\Oculus\Downloads\Alex-NoHair-Nude-Crop.png` | `523x1536` | `F1FED07EB8389859D1119AC38F07C528869420C56252F7D19061494044AC3937` | Canonical no-hair anatomy reference for base body, skin-tone edits, and body control maps. |
| `canonical/alex-hair-nude-crop.png` | `C:\Users\Oculus\Downloads\Alex-Hair-Nude-Crop.png` | `523x1536` | `1BBDDD8A4F74591690192EEF27C44785E61B956996293AB0C12ED26D21EA845E` | Canonical hair-on anatomy reference for identity, hair geometry, and hair-front/hair-back planning. |
| `canonical/alex-hair-underwear-crop.png` | `C:\Users\Oculus\Downloads\Alex-Hair-Underwear-Crop.png` | `523x1536` | `E26155974BC60C20DCBB887C8130CB0AE620673806C34658CE696ABDCB75B228` | Canonical hair + underwear reference for underwear, clothing anchor points, and non-nude edit tests. |
| `canonical/alex-noface-blank.png` | `C:\Users\Oculus\Downloads\Alex-noface-blank.png` | `523x1536` | `CF6E2D7874D3598ACF3D8893BD4E9C207E13BBA470F82613D57272245E2C4121` | Canonical no-hair/no-face body reference for body skin-tone edits, with face details and explicit detail layers intended to be produced separately. |

## Legacy Full-Frame Files

The older files remain filed for provenance and comparison, but they are no longer the default templates.

| File | Source | SHA256 | Role |
|---|---|---|---|
| `alex-blank.png` | `C:\Users\Oculus\Downloads\Alex-Blank.png` | `7ECD55B55BBBE31C91474E34EA24C7117898E406340C97F0BC81546693345F86` | Baseline blank/no-hair body reference. |
| `alex-nohair-nude.png` | `C:\Users\Oculus\Downloads\Alex-NoHair-Nude.png` | `EC47925CFCA2AE55EC6BC875CC97F43A0C5BF8D1BFA7404F40FC20A8FBB3376B` | No-hair anatomy reference for base body/skin-tone and control-map extraction. |
| `alex-hair-nude.png` | `C:\Users\Oculus\Downloads\Alex-Hair-nude.png` | `1CB30F86680984265BD8D11A5CB29133B39BE4D1E5C73CFBE8D5B2F96C032362` | Hair-on anatomy reference for hair geometry and identity/style anchor. |
| `alex-hair-underwear.png` | `C:\Users\Oculus\Downloads\Alex-Hair-Underwear.png` | `335EB5785338E94B25190E1F487E041EB55B6874863AF188C8D78221BDE42ACE` | Hair + underwear reference for underwear/clothing alignment tests. |

## Intended Use

- Build Phase 2 control images from the canonical cropped templates: silhouette, pose/edge/depth guides, face landmarks where available.
- Test local image-edit workflows against a fixed body/face geometry.
- Extract candidate layers for Sizzle's runtime stack:
  - `body`
  - `nipples`
  - `genitals`
  - `bodyMods`
  - `face`
  - `eyes`
  - `hairBack`
  - `hairFront`
  - `underwear`
  - `clothingTop`
  - `clothingBottom`
  - `shoes`
  - `expression`
  - `overlay`
  - `background`
- Keep originals unchanged; all edits should be made from copies or generated derivatives.
