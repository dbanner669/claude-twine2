# Prompt Set

These prompts are shared across contenders, with syntax adapted per model family.

## Base Natural-Language Prompt

```text
grounded semi-realistic photographic character reference of an adult 27 year old Canadian woman, light skin, long straight brown hair, blue eyes, natural face, believable body proportions, understated attractiveness, front-facing avatar reference pose, arms relaxed slightly away from torso, 2005 Toronto undercover thriller tone, soft practical studio light, realistic skin texture, indie film still, plain matte grey background, full body portrait, centered, no celebrity likeness
```

## Professional Outfit Variant

```text
grounded semi-realistic photographic character reference of an adult 27 year old Canadian woman, light skin, long straight brown hair, blue eyes, wearing professional-casual 2005 government office clothing, fitted dark slacks, simple blouse or fine sweater, practical shoes, understated, believable body proportions, front-facing avatar reference pose, 2005 Toronto undercover thriller tone, plain matte grey background, full body portrait, centered, no celebrity likeness
```

## Layer Body Light

```text
same locked avatar canvas and pose, isolated transparent PNG base body sprite for the body runtime layer, adult 27 year old Canadian woman, light skin, natural body proportions, neutral front-facing avatar reference pose, arms relaxed slightly away from torso, hair hidden or pulled away for layer testing, no outer clothing, no jewelry, plain matte grey background for segmentation, body silhouette and face geometry must match the canonical pose guide exactly
```

## Layer Body Medium Or Brown

```text
same locked avatar canvas and pose, isolated transparent PNG base body sprite for the body runtime layer, adult 27 year old Canadian woman, medium brown skin, natural body proportions, neutral front-facing avatar reference pose, arms relaxed slightly away from torso, hair hidden or pulled away for layer testing, no outer clothing, no jewelry, plain matte grey background for segmentation, body silhouette and face geometry must match the canonical pose guide exactly
```

## Layer Body Dark

```text
same locked avatar canvas and pose, isolated transparent PNG base body sprite for the body runtime layer, adult 27 year old Canadian woman, dark skin, natural body proportions, neutral front-facing avatar reference pose, arms relaxed slightly away from torso, hair hidden or pulled away for layer testing, no outer clothing, no jewelry, plain matte grey background for segmentation, body silhouette and face geometry must match the canonical pose guide exactly
```

## Layer Hair Long Straight Black

```text
same locked avatar canvas and head position, isolated transparent PNG hair sprite only, long straight black hair for an adult woman, natural 2005 hairstyle, hair follows the canonical skull, neck, and shoulder guide, no face repainting, no skin repainting, no eye repainting, no clothing repainting, plain matte grey background for segmentation
```

## Layer Hair Long Straight Brown

```text
same locked avatar canvas and head position, isolated transparent PNG hair sprite only, long straight brown hair for an adult woman, natural 2005 hairstyle, hair follows the canonical skull, neck, and shoulder guide, no face repainting, no skin repainting, no eye repainting, no clothing repainting, plain matte grey background for segmentation
```

## Layer Hair Short Bob Brown

```text
same locked avatar canvas and head position, isolated transparent PNG hair sprite only, short brown bob haircut for an adult woman, natural 2005 hairstyle, hair follows the canonical skull, neck, and shoulder guide, no face repainting, no skin repainting, no eye repainting, no clothing repainting, plain matte grey background for segmentation
```

## Layer Hair Long Curly Brown

```text
same locked avatar canvas and head position, isolated transparent PNG hair sprite only, long curly brown hair for an adult woman, natural 2005 hairstyle, hair follows the canonical skull, neck, and shoulder guide, no face repainting, no skin repainting, no eye repainting, no clothing repainting, plain matte grey background for segmentation
```

## Layer Eyes Blue/Green/Brown

```text
same locked avatar canvas and face position, isolated transparent PNG eye colour sprite only, adult female eyes aligned to canonical eye line, change iris colour only, no eyelid repainting, no skin repainting, no brows, no mouth, no hair, no clothing, plain matte grey background for segmentation
```

## Layer T-Shirt

```text
same locked avatar canvas and torso position, isolated transparent PNG clothing top sprite only, simple fitted dark t-shirt, front-facing, collar aligned to canonical neck, sleeves aligned to canonical shoulders and upper arms, hem aligned to canonical waist, no skin baked into the garment, no underwear baked in, no hair, no face repainting, plain matte grey background for segmentation
```

## Layer White Blouse

```text
same locked avatar canvas and torso position, isolated transparent PNG clothing top sprite only, simple white blouse suitable for a 2005 government briefing, front-facing, collar aligned to canonical neck, sleeves aligned to canonical shoulders and upper arms, hem aligned to canonical waist, no skin baked into the garment, no underwear baked in, no hair, no face repainting, plain matte grey background for segmentation
```

## Layer Dark Jeans

```text
same locked avatar canvas and lower body position, isolated transparent PNG clothing bottom sprite only, dark 2005 jeans, waistband aligned to canonical waist, legs aligned to canonical hips and legs, no skin baked into the garment, no shoes baked in, plain matte grey background for segmentation
```

## Layer Sneakers

```text
same locked avatar canvas and foot position, isolated transparent PNG shoe sprite only, practical sneakers, soles aligned to canonical foot position, no legs or skin baked into the shoe layer, plain matte grey background for segmentation
```

## Qwen Clothing Edit Test

Use this for the current Comfy/Qwen shirt, jeans, and sneakers pass with `sizzle_alex_noface_blank_padded_576x1536.png` and the user mask guide.

```text
Edit only the black clothing guide regions. Preserve the exact same canvas, crop, scale, front-facing pose, body silhouette, blank face, visible skin, hands, feet, lighting, and background. Add a plain white fitted t-shirt, dark blue jeans, and simple black sneakers. Do not change any unmasked pixels or redraw the body.
```

## Layer Neutral Underwear

```text
same locked avatar canvas and body position, isolated transparent PNG underwear sprite only, neutral practical bra and briefs, aligned to canonical bust, waist, hips, and pelvis, no skin baked into the underwear layer, must fit under outer clothing, plain matte grey background for segmentation
```

## Layer Expression Calm

```text
same locked avatar canvas and face position, isolated transparent PNG expression overlay only, calm neutral adult female expression, subtle mouth and brow change, eyes aligned to canonical eye line, no hair repainting, no skin tone change, no clothing, plain matte grey background for segmentation
```

## Layer Expression Worried/Surprised

```text
same locked avatar canvas and face position, isolated transparent PNG expression overlay only, worried surprised adult female expression, tense but controlled, brows and mouth aligned to canonical face geometry, no hair repainting, no skin tone change, no clothing, plain matte grey background for segmentation
```

## Calm Expression Variant

```text
grounded semi-realistic photographic character reference of an adult 27 year old Canadian woman, light skin, long straight brown hair, blue eyes, calm neutral expression, alert but controlled, believable body proportions, front-facing avatar reference pose, 2005 Toronto undercover thriller tone, plain matte grey background, full body portrait, centered, no celebrity likeness
```

## Worried/Surprised Expression Variant

```text
grounded semi-realistic photographic character reference of an adult 27 year old Canadian woman, light skin, long straight brown hair, blue eyes, worried surprised expression, tense but controlled, believable body proportions, front-facing avatar reference pose, 2005 Toronto undercover thriller tone, plain matte grey background, full body portrait, centered, no celebrity likeness
```

## Tasteful Anatomy Variant

```text
grounded semi-realistic photographic anatomical character reference of an adult 27 year old woman, light skin, long straight brown hair, blue eyes, natural body proportions, tasteful adult anatomy reference, neutral nonsexual pose, front-facing avatar reference pose, plain matte grey background, realistic skin texture, understated, no celebrity likeness
```

## SDXL Negative Prompt

```text
anime, cartoon, illustration, 3d render, plastic skin, glossy fashion shoot, influencer, exaggerated breasts, exaggerated hips, childlike, teen, young-looking, deformed anatomy, extra fingers, missing fingers, bad hands, bad eyes, crossed eyes, asymmetrical face, heavy makeup, modern smartphone, watermark, signature, text, logo, cropped, out of frame, celebrity
```

## Legacy FLUX Constraint Text

This was used during the original Phase 1 bakeoff. For the active FLUX.2 image-edit workflow, use short natural-language positive prompts and keep the negative/constraint node empty unless a later workflow documents a FLUX-compatible negative guidance method.

```text
avoid anime, avoid cartoon, avoid 3d render, avoid influencer glamour, avoid childlike features, avoid teen appearance, avoid celebrity likeness, avoid exaggerated body proportions, avoid watermark, avoid text, avoid logo
```

## Pony Prompt Prefix

Use this prefix before the natural-language target, then tune based on the exact CyberRealistic Pony recommendations:

```text
score_9, score_8_up, score_7_up, source_photo, realistic, photorealistic, adult woman,
```

## Pony Negative Prompt

```text
score_4, score_5, score_6, source_anime, source_cartoon, source_pony, source_furry, anime, furry, cartoon, illustration, 3d render, child, teen, young-looking, exaggerated body, influencer, plastic skin, bad anatomy, bad hands, bad eyes, text, watermark, logo, celebrity
```
