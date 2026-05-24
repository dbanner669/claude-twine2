# Sizzle — Greybox Art Asset List (Prologue + Briefing)

*Granular breakdown of all visual assets needed for v1.*

---

## Status: What's needed vs. what can wait

The greybox scope is prologue (character creation) and briefing only. No Sizzle interior, no Queen West exploration, no clothing changes during gameplay. The avatar panel is hidden during character creation, and the briefing scene is the first place the avatar would be visible — but the GDD notes that avatar system is optional for v1.

**Decision resolved:** The avatar panel IS visible during the briefing scene. All briefing passages use the `[daytime]` tag (two-column layout with avatar). Currently the avatar shows a dashed-border placeholder frame with text "avatar layers · base · hair · eyes · top · bottom · accessory" — no actual art is loaded yet.

Items marked `[AVATAR]` are needed for the briefing to have real character art instead of the placeholder.

### Existing non-placeholder assets

These assets already exist and can be reused as references or in-game art:

- [x] `media/locations/sizzle-exterior.png`
- [x] `media/characters/robert-flett-diner-entry.png`
- [x] `media/characters/robert-flett-reference-sheet.png`

---

## 1. UI Assets

### Logo / Branding
- [ ] **Sizzle logo/wordmark** — for the main menu title treatment. Should echo the cursive neon from the building exterior. Could be a PNG with transparency, or styled purely in CSS/font (depends on Claude Design output).
- [ ] **Header logo** — small version for the top-left corner of the header bar. Replaces the yellow square placeholder. Could be a minimal "S" mark or a tiny version of the wordmark.
- [ ] **Favicon** — 32x32 and 16x16. Small "S" or flame icon.

### Icons
- [ ] **Navigation icons** (optional) — if Claude Design specs icons instead of text links for header nav: character sheet, saves, settings, history back/forward. Simple, warm-toned, consistent style.
- [ ] **Notification icon** (optional) — if toasts get an icon alongside text.

### Backgrounds
- [ ] **Main menu background** — could be the Sizzle exterior image (already have it), a processed/stylized version, or a mood image. Or solid color with the logo treatment — depends on Claude Design direction.

---

## 2. Avatar Assets `[AVATAR]`

*Only needed if avatar is visible during the briefing scene.*

### Body Sprites
All avatar images must be the same dimensions (e.g., 512x768), transparent PNG, layered via CSS.

- [ ] **Base body sprites** — one per skin tone option (from `setup.complexions`):
  - Light
  - Medium
  - Dark
  - **Total: 3 body sprites**

### Hair
- [ ] **Hair sprites** — one per combination of hair style × hair colour:
  - Styles: Short bob, Long straight, Long curly (3 — from CC-200)
  - Colours: Brown, Black, Blonde (3 — from CC-200)
  - **Total: 9 hair sprites** (or layered: 3 style sprites × 3 colour tints)
  - *Note: could be reduced by using a single hair shape layer with colour overlay/tinting in CSS or canvas. Design decision needed.*

### Face
- [ ] **Eye sprites** — per eye colour (Blue, Green, Brown — from CC-200) × eye shape (Almond only in v1)
  - Minimum for v1: **3 eye colour variants** (one shape)
- [ ] **Face shape** — if this affects the sprite: round, heart, square, diamond, oval
  - *May be skippable for v1 if face shape is text-only and doesn't affect the visual*

### Expressions
- [ ] **Expression sprites needed for briefing:**
  - `emote-calm` — default/neutral (mouth-calm.png, brows-relaxed.png)
  - `emote-frown` — concern/worry (mouth-frown.png, brows-worried.png)
  - `emote-surprised` — reaction to briefing info (mouth-open.png, brows-raised.png)
  - **Total: 6 expression part sprites** (3 mouths, 3 brow sets) — or 3 compound expression images

### Starting Outfit
- [ ] **One default outfit for the briefing scene** — what does the player wear to a Branch meeting? Something professional-casual. Government-employee energy.
  - Top (e.g., blouse or sweater)
  - Bottom (e.g., slacks or dark jeans)
  - Shoes
  - **Total: 3 clothing sprites**

### Background
- [ ] **Briefing location background** — diner on Bank Street, Ottawa (Centretown). Brown vinyl booths, weak light, civil-servant crowd. One background image.

---

## 3. Location Images (non-avatar)

These are inline images used in passage text, not avatar layers.

- [ ] **Sizzle exterior** — already have this (`media/locations/sizzle-exterior.png`). Could be shown in the briefing when Robert describes the target, or saved for Act 1.
- [x] **Robert arrives at the diner** — already implemented at the top of `INTRO-110` using `media/characters/robert-flett-diner-entry.png`

---

## 3A. Character Reference Assets

These are production-reference assets rather than avatar layers.

- [x] **Robert Flett reference sheet** — `media/characters/robert-flett-reference-sheet.png`

---

## 4. Asset Production Notes

### Art Style Decision (NEEDS USER INPUT)
The art style for avatar sprites and location images hasn't been decided. Key questions:
- **Realistic vs. stylized?** Photorealistic renders, painted/illustrated, anime-influenced, or something else?
- **AI-generated vs. hand-drawn vs. commissioned?** What's the production pipeline?
- **Consistency method?** How do we ensure all sprites layer correctly and look like they belong together?

### Dimensions & Format
- All avatar layer images: same dimensions (recommend 512x768 or similar portrait ratio), transparent PNG
- Expression sprites: same dimensions as body, positioned to overlay correctly
- Clothing sprites: same dimensions, transparent, positioned to overlay body
- Location backgrounds: could be a different aspect ratio than avatar if they're in a separate container
- UI assets: PNG with transparency, sized per Claude Design specs

---

## Summary

| Category | Items Needed | Depends On |
|----------|-------------|------------|
| Logo/wordmark | 1-2 | Claude Design output |
| Header icon | 1 | Claude Design output |
| Favicon | 1 | No |
| Main menu background | 0-1 | Claude Design output |
| Nav icons | 0-5 | Claude Design output |
| **Total UI art** | **3-10** | |
| | | |
| Body sprites `[AVATAR]` | 3 | Art style decision |
| Hair sprites `[AVATAR]` | 3-9 | Art style + layering decision |
| Eye sprites `[AVATAR]` | 3 | Art style decision |
| Expression parts `[AVATAR]` | 6 | Art style decision |
| Starting outfit `[AVATAR]` | 3 | Art style decision |
| Briefing background `[AVATAR]` | 1 | Art style decision |
| **Total avatar art** | **19-25** | |
| | | |
| **Grand total** | **22-35 assets** | |

### Recommendation

For the greybox, keep treating avatar art as lower priority than writing and flow polish. The current build already tolerates a placeholder avatar panel, and the most immediately useful art wins are still selective scene images, logo/branding work, and reference sheets that support character consistency.
