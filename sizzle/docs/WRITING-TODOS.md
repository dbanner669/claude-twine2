# Writing TODOs

Open prose-level revisions and notes captured from FigJam round-trip interpretation passes. Entries here are *writing concerns* — not bugs, not gameplay, not tooling.

Format: one block per concern, grouped by source passage, newest at the top of each passage. Mark resolved entries with `~~strikethrough~~` and a brief note instead of deleting them — keeps the editorial history visible.

## Conventions

- **Source** — where the note came from (FigJam board export, in-editor review, etc.).
- **Status** — `open`, `in-progress`, `resolved`.
- **Concern** — the issue, with enough context to act on it without re-reading the passage.

---

## INTRO-100 Briefing

- **Source:** FigJam board export (2026-05-25)
  **Status:** open
  **Concern:** "since the Trudeau government — the first one" is meant as a wink at the elder Trudeau era. In 2005 there's only ever been one Trudeau (Pierre), so the qualifier "the first one" is technically anachronistic — Justin Trudeau wouldn't lead the Liberals until 2013. As a 2026 reader the line reads forward-looking, but in-world it's wrong. Either drop "— the first one" (simplest, but loses the joke), keep it and accept the reader-pov anachronism, or recast around something else (e.g. "since the Mulroney years"). Decision needed.

## INTRO-105 Waiting

- **Source:** FigJam board export (2026-05-25)
  **Status:** open
  **Concern:** "the limestone facades the colour of old honey" reads as an AI-ism — too literary, too clean. Recast in plainer voice if it's bothering you on reread; otherwise leave it. Style-call.

- **Source:** FigJam board export (2026-05-25)
  **Status:** clarification needed
  **Concern:** Note on the board said "we probably need different text in this paragraph for each background." The source already has per-background variants (RCMP / CSIS / grad student / else). The note may have been written without seeing the source, since the FigJam sticky only renders the first branch of `<<if>>` blocks. Verify whether the existing variants are wrong, or whether more variants are needed (e.g. for the new `unemployed after university` background).

## INTRO-110 Robert arrives

- **Source:** FigJam board export (2026-05-25)
  **Status:** open
  **Concern:** Plausibility — the player and Robert are meeting for clandestine business at a diner the player frequents regularly on Bank Street, presumably near their workplace. Reads as a tradecraft failure for two trained operatives. Either move the meet to a non-regular spot (and acknowledge in prose that this *isn't* a regular spot for either of them), or thread a justification (e.g. they meet here precisely because the player is a known regular and Robert dropping in once doesn't read as unusual).

## INTRO-115 Morning

- **Source:** FigJam board export (2026-05-25, second pass)
  **Status:** open · reaffirmed
  **Concern:** User flagged this a second time on the board: `[This doesn't make sense, Claude revise]` on the "you still don't know the story" line. Same concern as the original entry below — kept open.

- **Source:** FigJam board export (2026-05-25)
  **Status:** open
  **Concern:** "you still don't know the story" about Robert's scarred hands doesn't align with what we've established about his background. The NPC handler doc gives him a Lakehead → U of T → field-work-up-north path. Plausible sources for the knuckle scars: northern field work, fights in his Sault/Thunder Bay youth, manual labour during school. Either pick one and seed it earlier (so the player *does* roughly know the story), or revise this line to acknowledge what she does know but flag what she doesn't (e.g. "you know the why — northern winters, communities you'd rather not name — but not the specific night").

## INTRO-200a Personal

- **Source:** FigJam board export (2026-05-25)
  **Status:** open
  **Concern:** "He gives you a look — not annoyed, just noting it." reads as an AI-ism — the "not X, just Y" cadence is one of the more obvious tells. Recast.

## INTRO-205 Field placement

- **Source:** FigJam board export (2026-05-25, second pass)
  **Status:** open
  **Concern:** User noted on the board that the Branch's pretend-conservation-club shooting range "should be somewhere near Ottawa, not Toronto." Currently the line places it in Barrie (north of Toronto, halfway to Muskoka). Move to somewhere plausible for an Ottawa-based agent to actually shoot at — Carp, Renfrew County, the Gatineau side, or a specific named range in the National Capital Region. Pick one with verisimilitude.

- **Source:** FigJam board export (2026-05-25)
  **Status:** resolved (applied this pass)
  **Concern:** ~~"You let the silence do the work." reads as an AI-ism.~~ Link text rewritten to "You raise an eyebrow." in commit applying interpretation pass 2.

## INTRO-340 Why me

- **Source:** FigJam board export (2026-05-25, second pass)
  **Status:** resolved
  **Concern:** ~~User design note on the board: "this sequence, or a version of it, feels important, it should be harder to miss." INTRO-340 currently sits as one optional branch of INTRO-325 No concerns.~~ Resolved: INTRO-410 Rules now carries a conditional beat (`<<if not hasVisited("INTRO-340 Why me")>>`) where Robert volunteers a condensed version of the why-me framing — "You haven't asked why you" + the small-talent-pool line + the looking-at-coffee-instead-of-you beat. Player who asked early still gets the full INTRO-340 scene; player who skipped past it hears the essential content in Robert's own voice before the briefing closes.

## Cross-passage notes

- **Source:** FigJam board export (2026-05-25)
  **Status:** noted (not a writing TODO)
  **Concern:** Original feedback was a tooling request — render choice/next-passage links on FigJam stickies with an arrow marker (e.g. `Morning →`). Tracked instead as a plugin task; the source-side rendering is unaffected.
