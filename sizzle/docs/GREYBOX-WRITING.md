# Sizzle — Greybox Writing List (Prologue + Briefing)

*Granular breakdown of all written content needed for v1.*

---

## 1. Character Creation Screens (Prologue)

### CC-100 Name
- [x] Header text ("Personnel File") — done (now "Identification")
- [x] Field labels — done
- [x] Flavor text — done. Service record panel + blockquote about codename assignment.

### CC-200 Appearance
- [x] Header and option labels — done
- [ ] Flavor text: brief, optional. Could be a note about the player looking at herself, or the clinical tone of a personnel file describing physical characteristics.

### CC-300 Background
- [x] Header and intro paragraph — done
- [x] **Short descriptions for each background option** — done (in `character-creator.twee`):
  - RCMP Constable
  - CSIS Analyst
  - Grad Student (Psychology)
  - Unemployed After University
- [x] **Skill bonus text** — done, displayed per-option with `.cc-skills` class
- [x] **Background selection guardrail** — done. Player cannot continue without making a selection.

### CC-400 The Incident
- [ ] **Playable inciting incident sequences** — this is the biggest remaining writing task in character creation. The selected direction is four full playable August 2003 origin sequences:
  - `the Toronto Blackout`
  - `the Dark of Manitoulin`
  - `the Woman with the Pale Eyes`
  - `Wet Dog Smell`
- [ ] Each sequence needs:
  - A compact selectable title/entry point
  - Background-specific setup text where needed
  - A playable scene arc with escalation, observation, and intervention
  - Erotic NYSE charge that is part of the danger, not detachable spice
  - A clear recruitment-worthy action by the player character
  - Aftermath/recruitment bridge that can set `$player.incitingIncident`
  - Possible later hooks for `$nyse.influence`, `storyTags`, composure texture, and Robert relationship texture
- [ ] Current design source: `docs/INCIDENTPLAN.md`

### CC-500 Summary
- [x] Table layout — done
- [x] CLASSIFIED footer text — done ("CLASSIFIED — Branch personnel file. Unauthorized access is an offence under the Security of Information Act.")
- [x] Signature block with script font — done
- [x] Transition to briefing — "Sign & Deploy" button links to INTRO-100
- [x] Derived-state rebuild on revisit — done. Skills and background-derived story tags recalculate cleanly if the player goes back and changes background.

---

## 2. Briefing Scene (Opening of Act 1)

**Status: COMPLETE.** All briefing passages are written in `content/briefing.twee`. 23 passages covering the full briefing at a diner on Bank Street in Ottawa (Centretown).

### INTRO-100 through INTRO-115 (Arrival)
- [x] Setting description — Bank Street diner in Ottawa, brown vinyl booths, weak-tea light, civil servants
- [x] Background-specific internal monologue while waiting (4 variants)
- [x] Robert Flett's introduction — physical details, mannerisms, the hands detail

### INTRO-200 through INTRO-210 (The Assignment)
- [x] Mission briefing — Sizzle, Queen West, NYSE classification, behavioral changes
- [x] Hover glossary support for `NYSE` — done via `<<term>>`
- [x] Three player response branches:
  - "What kind of anomalous?" → NYSE details path
  - "What's my cover?" → Cover/operational path
  - "A swingers club." → Personal reaction path
- [x] Background-specific response variants (grad student, RCMP, CSIS, unemployed)

### INTRO-300 through INTRO-345 (Deep Dive)
- [x] NYSE details — influence patterns, escalation signature, dreams, intrusive ideation
- [x] Cover identity details — employment as staff, apartment in Parkdale, documents
- [x] "Why me?" branch — Robert's clinical assessment + human moment
- [x] Source discussion — "We don't know" + Robert's near-slip about personal experience
- [x] Skill-gated observation (academic check on Robert's word choice)
- [x] Player-facing roll UI — check waits for player click, animates dice, then reveals pass/fail text.

### INTRO-400 through INTRO-530 (Operational Details + Questions)
- [x] Apartment, reporting schedule, extraction protocol
- [x] Four optional question branches (greyed out once visited):
  - NYSE reports (if not already covered)
  - The club itself (Viktor Reeves name-dropped)
  - Risk assessment ("Moderate to high")
  - Previous agents ("You'll be the first")
- [x] Composure-gated observation on "previous agents" answer
- [x] Player-facing roll UI — check waits for player click, animates dice, then reveals pass/fail text.

### INTRO-600 through INTRO-630 (The Subtext)
- [x] Composure skill check to read Robert's unease — pass/fail variants
- [x] Player-facing roll UI — check waits for player click, animates dice, then reveals pass/fail text.
- [x] "You're worried about me" dialogue option (if check passed)
- [x] Robert's "But yes" moment — the handler/human duality
- [x] Notification system integration (toast messages for check results)

### INTRO-700 through INTRO-800 (Departure + End)
- [x] Robert paying for coffee (character detail)
- [x] Bank Street exterior — sensory, period-specific Ottawa (limestone, civil servants, OC Transpo)
- [x] Three-way conditional ending based on briefing choices (calledOut / readRobert / default)
- [x] End screen — "End of Prologue / To be continued — Act 1: Insertion"

---

## 3. UI Text

- [x] **StoryTitle** — "Sizzle"
- [ ] **Header navigation labels** — review: "MENU", "Character", "Saves", "Settings" — do these need renaming for tone?
- [x] **Character sheet labels** — updated to distinguish Baseline Composure from Current Composure.
- [x] **Notification text** — skill check toasts working ("Composure check: passed/failed")
- [x] **Header status badge** — tied to Current Composure by default, with `$header.status` available as a passage-specific override.
- [x] **Footer helper text cleanup** — done. Fake autosave/quicksave copy and misleading `SAVED` label removed. Footer now renders `$date` as `Month D, YYYY · Slot`, plus the hard-coded greybox version label.
- [x] **Settings cleanup** — inactive `Avatar Size` and `Text Size` controls are hidden for now; `Avatar Visible` remains in the menu.

---

## 4. Writing Style Notes for the Greybox

Reference the GDD Section 10 (Tone & Content Guidelines) during all writing. Key reminders:

- Classy thriller fiction. Literate, observant, trusts the reader.
- Grounded and sensory. Toronto should feel real.
- The Branch is professional and institutional — not a caricature.
- Robert Flett's voice: precise, unhurried, dry. See `docs/NPC-handler.md`.
- The player character has interiority. We hear her thoughts.
- Erotic content may appear in the new CC-400 origin sequences. Treat it as compromised NYSE evidence and danger, not detachable titillation. The existing 2005 briefing remains non-erotic but sexually charged by subject matter.
- Period details: this is September 2005. Small touches, not overdone.
- 80-120 visible words per passage max. One beat per passage.

---

## Summary

| Category | Total Items | Done | Remaining |
|----------|------------|------|-----------|
| CC screen text polish | 5 screens | 4 | 1 (CC-200 flavor text) |
| Background descriptions | 4 | 4 | 0 |
| Skill bonuses per background | 4 | 4 | 0 |
| Playable inciting incident sequences | 4 | 0 | **4 selected; need full sequence design and implementation** |
| Briefing scene passages | 23 | 23 | 0 |
| Dialogue branches | ~15 | ~15 | 0 |
| Skill check variants | 3 | 3 | 0 |
| UI text review | ~5 items | 4 | 1 |
| **Total** | | | **~6 items remaining** |

### Critical path

The main blocking item is **CC-400 inciting incidents**. The four concepts are selected and documented in `docs/INCIDENTPLAN.md`; the next step is fleshing them out into playable sequences, then implementing the chosen structure.
