# Variable Guide

## Story Variables (persist across saves)

### $player
The main character state object.

| Property | Type | Description |
|----------|------|-------------|
| `firstName` | string | Player's first name |
| `surname` | string | Player's last name |
| `age` | number | Player's age |
| `faction` | string | Organization: "agency", "bureau", "institute", "network" |
| `nationality` | string | Player's nationality |
| `complexion` | string | Skin tone key for avatar sprites |
| `hairColour` | string | Hair colour name |
| `hairStyle` | string | Hair style name |
| `eyeColour` | string | Eye colour |
| `eyeShape` | string | Eye shape |
| `faceShape` | string | Face shape |
| `noseShape` | string | Nose shape |
| `mouthShape` | string | Mouth shape |
| `arousal` | number | Arousal level (0-3) |
| `kinks` | array | Character kinks/preferences |
| `quirks` | array | Character traits |
| `attributes` | object | Named attributes |
| `statusEffects` | array | Active status effects (strings) |
| `personalBio` | array | Journal entries: `{timestamp, entry}` |
| `achievements` | array | Unlocked achievements (strings) |
| `skills` | object | Skill objects: `{level, xp, specialities[]}` |
| `isWearing` | array | Active clothing slots (strings) |
| `piercings` | array | Body piercings |
| `tattoos` | array | Body tattoos |
| `cover` | object | Cover identity: `{firstname, knownAs, surname}` |
| `codename` | string | Operative codename |

### $avatar
Controls the visual avatar display. See AVATAR-SYSTEM.md for details.

| Property | Type | Description |
|----------|------|-------------|
| `background` | array | Background layer image paths |
| `body` | array | Body layer image paths |
| `bodyMods` | array | Modification layer image paths |
| `underwear` | array | Underwear layer image paths |
| `clothing` | array | Clothing layer image paths |
| `foreground` | array | Foreground layer image paths |
| `blink` | boolean | Blink animation active |
| `barefoot` | boolean | Character is barefoot |
| `cleavage` | boolean | Cleavage sprite active |
| `showRear` | boolean | Currently showing rear view |
| `rearViewEnabled` | boolean | Rear view available in current scene |
| `top` | number | Vertical offset for avatar positioning |

### $header
Per-passage header display state. Set before calling `<<header>>`.

| Property | Type | Description |
|----------|------|-------------|
| `location` | string | Current location name |
| `time` | string | Current time/date display |

### $temp
Per-passage temporary state. Automatically reset to `{}` on each passage transition by `events.js`.

Use for any passage-local data that shouldn't persist.

### $ui
UI preferences (separate from SugarCube settings).

| Property | Type | Description |
|----------|------|-------------|
| `avatarSize` | number | Avatar size multiplier |
| `textSize` | number | Text size multiplier |

### $imagePath
Base paths for media assets.

| Property | Type | Description |
|----------|------|-------------|
| `base` | string | Root media path (default: `"media/"`) |
| `avatar` | string | Avatar images path (default: `"media/avatar/"`) |
| `ui` | string | UI images path (default: `"media/ui/"`) |

### $notifications
Toast notification queue.

| Property | Type | Description |
|----------|------|-------------|
| `list` | array | Pending notification strings |

### $statistics
A `Map` for tracking game statistics (play time, choices made, etc.).

## Setup Variables (read-only after init)

The `setup` namespace holds static data that doesn't change during gameplay:

| Variable | Type | Description |
|----------|------|-------------|
| `setup.factions` | array | Available faction names |
| `setup.firstNames` | array | Name generation pool |
| `setup.surnames` | array | Surname generation pool |
| `setup.codenames` | array | Codename generation pool |

## Temporary Variables

Temporary variables (prefixed with `_`) exist only for the current passage or widget call. Use them for loop counters, intermediate calculations, and widget arguments.

```
<<set _skillNames to ["academic", "agent"]>>
<<for _i to 0; _i lt _skillNames.length; _i++>>
    ...
<</for>>
```
