# Sizzle — Greybox Art Asset List (Prologue + Briefing)

*Granular breakdown of all visual assets needed for v1.*

---

## Status: What's needed vs. what can wait

The greybox scope is prologue (character creation) and briefing only. No Sizzle interior, no Queen West exploration, no clothing changes during gameplay. The avatar panel is hidden during character creation, and the briefing scene is the first place the avatar would be visible — but the GDD notes that avatar system is optional for v1.

**Decision resolved:** The avatar panel IS visible during the briefing scene. All briefing passages use the `[daytime]` tag (two-column layout with avatar). Currently the avatar uses a temporary placeholder image in `media/avatar/`; candidate avatar production work remains in `docs/avatar-bakeoff/production-drafts/` until explicitly promoted.

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

**Updated avatar-production note:** this section is the older greybox minimum. The active avatar research now lives in `docs/avatar-bakeoff/`. The explicit layer model is locked as `background`, `hairBack`, `body`, `nipples`, `genitals`, `bodyMods`, `face`, `eyes`, `underwear`, `clothingBottom`, `clothingTop`, `shoes`, `hairFront`, `expression`, and `overlay`. The first proof is constrained to medium skin, long straight hair, and blue eyes. See `docs/avatar-bakeoff/STATUS.md` and `docs/avatar-bakeoff/OPTION-2-ASSET-TODO.md` before producing or promoting final avatar art.

### Body Sprites
All accepted avatar draft layers must share the canonical `523x1536` transparent canvas. ComfyUI working images may be padded to `576x1536`, but accepted assets must be cropped back to `523x1536`.

- [ ] **Base body sprites** — one per skin tone option (from `setup.complexions`):
  - Light
  - Medium
  - Dark
  - **Total: 3 body sprites**
  - Greybox proof uses medium only.

### Hair
- [ ] **Hair sprites** — one per combination of hair style × hair colour:
  - Styles: Short bob, Long straight, Long curly (3 — from CC-200)
  - Colours: Brown, Black, Blonde (3 — from CC-200)
  - **Total: 18 hair sprites** in the explicit model: 9 `hairBack` plus 9 `hairFront`
  - Greybox proof uses long straight brown only, split into back/front layers.

### Face
- [ ] **Face and eye sprites** — `face` contains neutral nose/face structure; `eyes` contains iris/eye colour overlays only.
  - Minimum full matrix: **1 face layer plus 3 eye colour variants**
  - Greybox proof uses face-medium plus blue eyes only.
- [ ] **Face shape** — if this affects the sprite: round, heart, square, diamond, oval
  - *May be skippable for v1 if face shape is text-only and doesn't affect the visual*
- [ ] **Anatomy overlays** — `nipples` and `genitals` are separate layers, not `bodyMods`; greybox needs medium-tone overlays only.

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
  - Current clothing tests are draft-only. Built-in imagegen with visual masks is useful for concept exploration but not production extraction; Qwen Image Edit is the next promising route if it preserves the noface source crop, pose, alpha, and unmasked skin.

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

### Avatar Production Direction
The avatar production direction is now canonical-template image editing rather than independent text-to-image generation. Use the `523x1536` canonical templates in `docs/avatar-bakeoff/baseline-inputs/canonical/`, create or edit one layer family at a time, extract transparent layers, and accept assets only after crossed composites pass. The current ComfyUI workflow and candidate workspace live in `docs/avatar-bakeoff/workflows/phase2-edit/` and `docs/avatar-bakeoff/production-drafts/`.

### Dimensions & Format
- All avatar layer images: canonical `523x1536` transparent PNG
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
| Hair sprites `[AVATAR]` | 18 | Art style + split cleanup |
| Face/eye sprites `[AVATAR]` | 4 | Art style decision |
| Anatomy overlays `[AVATAR]` | 2+ | Tone blending decision |
| Expression parts `[AVATAR]` | 6 | Art style decision |
| Starting outfit `[AVATAR]` | 3 | Art style decision |
| Briefing background `[AVATAR]` | 1 | Art style decision |
| **Total avatar art** | **37+** | |
| | | |
| **Grand total** | **40-47+ assets** | |

### Recommendation

For the greybox, keep treating avatar art as lower priority than writing and flow polish unless the briefing avatar becomes a presentation requirement. The current build already tolerates a placeholder avatar panel. If avatar work resumes, do not use the simplified counts above as the production plan; use `docs/avatar-bakeoff/OPTION-2-ASSET-TODO.md` and validate layers with `docs/avatar-bakeoff/layer-composition-protocol.md`.
