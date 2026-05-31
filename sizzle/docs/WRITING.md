# Sizzle — Writing Index

Short index and current-scope snapshot for everything writing-related on Sizzle. The long-form rules live elsewhere; this page is a map.

## TL;DR

Sizzle is a literate erotic thriller. Second person, present, female PC. Toronto 2005/2006 with an Ottawa prologue. The Branch calls it NYSE; the reader knows it's supernatural. 80–120 words per passage (hard ceiling 200). Link text is always a complete sentence — PC dialogue, narration, or `Continue` — never NPC dialogue.

## Writing Docs

- [STYLE-GUIDE.md](STYLE-GUIDE.md) — the comprehensive style guide. Voice, mechanics, erotic-content rules, AI-pitfall watchlist, character-voice profiles, mandatory checks, annotated reference passages. **Start here for any writing or revision question.**
- [GDD.md](GDD.md) — narrative design, structure, mechanics intent.
- [INCIDENTPLAN.md](INCIDENTPLAN.md) — current CC-400 incident plan: selected origin incidents, NYSE grammar, background integrations, risks, and playable-sequence direction.
- [NPC-handler.md](NPC-handler.md) — Robert Flett's full character profile.
- [STORY-TAGS.md](STORY-TAGS.md) — `storyTags`, `quirks`, `kinks` reference.
- [WRITING-TODOS.md](WRITING-TODOS.md) — open prose-level revisions (running log).
- [GREYBOX-WRITING.md](GREYBOX-WRITING.md) — prologue + briefing writing checklist.
- [EDITORIAL-SWEEP.md](EDITORIAL-SWEEP.md) — process template for running a style-guide audit against existing prose. Worked example: [STYLE-AUDIT-2026-05-26.md](STYLE-AUDIT-2026-05-26.md).

## Current Writing Scope

Playable greybox prose covers:

- Main menu
- Character creation: `CC-100` through `CC-500` (with `CC-400` still a source placeholder; see below)
- Briefing / prologue: `INTRO-100` through `INTRO-800 End`

Approximate scale: ~30 prologue passages + 26 BLK flashback passages, full branching dialogue, skill-check variants, four background variants throughout.

## Current Writing Gaps

- **`CC-400 Incident` — Toronto Blackout: ✓ implemented, pending review.** `sizzle/src/content/blackout.twee`, BLK-085–BLK-215. The three remaining incidents (`the Dark of Manitoulin`, `the Woman with the Pale Eyes`, `Wet Dog Smell`) are "Coming Soon" stubs in CC-400; their playable-sequence design docs live in [docs/incidents/](incidents/). See [INCIDENTPLAN.md](INCIDENTPLAN.md).
- **`INTRO-322 Concerns`** — refusal branch is functional but minimal.
- **`INTRO-550 Question Toronto`** — Northern Ontario reaction stub; explicit `//To be written.//` marker in source.
- **Act 1 onward** — no playable content yet beyond the prologue. STYLE-GUIDE.md sets the rules forward; no Act 1 prose exists to apply them to.
- **NPC voice profiles** — only Robert Flett is profiled. Each new NPC needs the template in [STYLE-GUIDE.md §6](STYLE-GUIDE.md) filled out before sustained dialogue work.
