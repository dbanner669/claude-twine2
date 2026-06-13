# Sizzle — UI/UX TODOs

Open interface and usability items that are important but not the current priority.

## Deferred

- **Mobile / small viewport layout pass** — The UI now renders on a fixed-proportion 1920×992 stage that scales to fit (see CLAUDE.md → Fixed-Proportion Stage), so a narrow window letterboxes the whole desktop layout rather than reflowing. A true small-screen/mobile pass would need a separate narrow-stage ratio or a reflow mode; until then, check that the scaled-down layout stays legible on small windows (header, footer, avatar column, character creation, roll panels, glossary overlays, dialogs).
- **Roll UI accessibility pass** — Add reduced-motion handling, focus polish, keyboard verification, and cleaner screen-reader announcements for roll result changes.
- **Character sheet hierarchy pass** — Revisit ordering, labels, information density, and whether the sheet should feel more like an in-world dossier or a debug/status panel.
- **Main menu / restart flow pass** — Review restart confirmation, begin-again states, and whether the system flow feels tonally aligned.
- **Avatar/text size settings pass** — `Avatar Size` and `Text Size` are hidden from Settings. Reading-size is now covered by browser zoom against the fixed-proportion stage (the `--zoom` mechanism resizes text inside the unmoving frame), so `Text Size` is lower priority; the `.text-*` classes still exist if it's wired later. `Avatar Size` would still need a deliberate pass against the scaled stage layout.

- **Tooltip/toast stage-scale consistency** — Glossary tooltip overlays and toasts live on `<body>`, outside the transformed `#game` stage, so they render at viewport scale rather than stage scale. On a large window they read slightly smaller than the surrounding UI. Revisit if it looks off in practice; moving them inside the stage risks the `position: fixed`-inside-`transform` containment trap.

## Watch After Current UI Pass

- **Manual save UX** — After the Saves dialog style pass settles, decide whether the manual save flow needs clearer in-world labeling or confirmation language now that the footer no longer implies autosave.
