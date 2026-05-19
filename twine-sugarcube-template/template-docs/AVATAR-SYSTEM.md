# Avatar System

## Overview

The avatar is a layered compositing system that renders a character portrait from stacked PNG images. Each layer is an array of filenames stored in `$avatar`. Images are rendered bottom-to-top as absolutely-positioned elements inside `#avatar-container`.

## Layer Stack

```
Layer 6: foreground[]  ← expressions, overlays, effects
Layer 5: clothing[]    ← outerwear (shirts, pants, dresses)
Layer 4: underwear[]   ← underwear items
Layer 3: bodyMods[]    ← tattoos, scars, piercings
Layer 2: body[]        ← base body sprite
Layer 1: background[]  ← room, sky, environment
```

Each layer is an array of image paths relative to `$imagePath.avatar` (default: `media/avatar/`).

## The $avatar Object

```javascript
$avatar = {
    background: [],    // Environment images
    body: [],          // Base body sprite(s)
    bodyMods: [],      // Body modifications
    underwear: [],     // Underwear layer
    clothing: [],      // Outerwear layer
    foreground: [],    // Expressions, overlays
    blink: false,      // Blink animation state
    barefoot: false,   // No shoes flag
    cleavage: false,   // Cleavage visibility flag
    showRear: false,   // Currently showing rear view
    rearViewEnabled: false  // Rear view available for this scene
}
```

## Widget Reference

### Core
- `<<avatar>>` - Renders all layers (called by StoryCaption)
- `<<avatar-clear>>` - Empties all layer arrays
- `<<avatar-setBody "fair">>` - Sets the body layer
- `<<avatar-setBackground "room.png">>` - Sets background

### Clothing Pattern
Each item has a `wear-` and `remove-` widget pair:
```
<<wear-blackTshirt>>   → adds to clothing[], sets slot tracking
<<remove-blackTshirt>> → removes from clothing[], clears slot
<<removeTop>>          → removes whatever top is currently worn
```

### Expressions
```
<<emote-smile>>       → compound: mouth + brows
<<emote-frown>>       → compound: mouth + brows
<<emote-surprised>>   → compound: mouth + brows
<<emote-calm>>        → neutral expression
<<emote-clear>>       → removes all expression images
```

## Adding New Items

### New Clothing Item
1. Create the PNG image and place it in `media/avatar/clothing/{slot}/`
2. Add a wear widget:
```
<<widget "wear-myItem">><<nobr>>
<<set _path to "clothing/tops/">>
<<removeTop>>               /* Remove current top */
<<set $avatar.clothing.pushUnique(_path + "myItem.png")>>
<<set $player.isWearing.pushUnique("top")>>
<<set $player.lastWornTop to "myItem">>
<</nobr>><</widget>>
```
3. Add a remove widget:
```
<<widget "remove-myItem">><<nobr>>
<<set _path to "clothing/tops/">>
<<set $avatar.clothing.delete(_path + "myItem.png")>>
<<set $player.isWearing.delete("top")>>
<</nobr>><</widget>>
```

### New Expression
1. Create the PNG(s) in `media/avatar/expression/`
2. Add to `expressions.twee`:
```
<<widget "emote-myExpression">><<nobr>>
<<emote-clear>>
<<set $avatar.foreground.pushUnique("expression/mouth-myExpr.png")>>
<<set $avatar.foreground.pushUnique("expression/brows-myExpr.png")>>
<</nobr>><</widget>>
```

## Image Requirements

- All avatar images must be the same dimensions (e.g., 512x768)
- Use transparent PNGs so layers composite correctly
- Name files descriptively: `20_body-fair.png`, `40_brows-angry.png`
- The number prefix indicates render order within a layer

## Settings

Players can adjust the avatar through the Settings dialog:
- **Avatar Size**: XXS through XXL (CSS classes control container width)
- **Avatar Visible**: Toggle to hide/show the avatar panel
- **Turn Avatar**: Click to toggle front/rear view (if `rearViewEnabled`)
