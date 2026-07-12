# Psych Eval — Prologue Extension Plan

Status: **framework for human review — no ink written yet.** Extends the prologue with a
Branch psychological evaluation scene between the diner briefing and departure for
Toronto, and replaces the abrupt "End of Prologue" with real transition-out beats.

Design locked in conversation 2026-07-12 (20-question round). Open items for sign-off at
the bottom.

## What this scene is

**Masked character creation.** A warm, disarming Branch psychologist asks the player
character 5–6 set questions. The answers write persistent story flags that later content
draws on for texture. The player experiences a lived-in bureaucratic scene (diner-scene
register); the game banks a truth-profile of who this woman is.

The player is never shown mechanics. Some questions offer a **lie** option — mechanically
the flag records the TRUTH either way (a lie stores the same flag as the honest answer),
so there are really only two or three recorded outcomes per question. The lying is pure
story texture, and the player doesn't know it has no mechanical knock-on. The scene
cannot be failed.

## Placement & framing

- **When:** two–three days after the diner briefing, other prep having happened off-page.
  Briefing is Monday, September 12, 2005 (morning); the eval lands **Thursday,
  September 15, 2005, morning** (day mode).
- **Why, in-fiction:** both — pre-deployment clearance is routine, AND this operation's
  nature (sexual infiltration, extended deep cover) means someone upstairs specifically
  wants her cleared for it. The psychologist can say as much; it's the Branch being the
  Branch.
- **Where:** a leased office **across the street** from the building the Branch actually
  works out of — anonymous, borrowed, a nameplate that says nothing. First (and likely
  only) look at the Branch's Ottawa footprint from this angle; deliberately NOT a grand
  HQ reveal.
- **Clearance:** she is **fully NYSE-cleared**. She can name the incident, use the
  institutional vocabulary (NYSE, "anomalous," "atypical" — never "supernatural"), and
  ask about it plainly. No dramatic-irony compartment.

## The psychologist

- ~45. **Warm and disarming — which is itself a technique.** Coffee offered, first names
  attempted, a laugh that arrives easily. The warmth is real AND it is how she works;
  the player character (a trained agent) can notice both things being true.
- Mostly this one scene. She gets a short profile block (below), not a full NPC doc.
- She talks **generally** about the incident — no four-way incident branching. Inline
  `{inciting_incident}` interpolation is fine for one-word texture; her questions are
  written to work for all four.
- **Name — pick one (or supply another):**
  1. **Dr. Denise Caron** (recommended — Franco-Ontarian, Ottawa-right, warm)
  2. Dr. Maureen Kelly
  3. Dr. Judith Kastner
  4. Dr. Patricia Osei
  5. Dr. Margot Chen

## Mechanics

- **Storage: `story_tags`**, via the existing `add_tag` op — same human-readable-phrase
  convention as "Northern Ontario" / "City Dweller". STORY-TAGS.md gets the new entries
  when implementation lands.
- **Kinks:** two of the questions seed the `kinks` array via `add_kink` — this is the
  diegetic mechanism for initial kink flags.
- **Lie options record the truth.** `yes / no / no [lie]` → flags `yes / no / yes`. We do
  NOT record that she lied (deliberate non-feature; the ink choices are distinct, so a
  "lied in her eval" tag could be added later with zero retrofit cost if wanted).
- **No skill checks, no fail state, nothing learned** — the scene is pure intake wearing
  a bathrobe of texture. Payoff ambition (how far later content reaches back into these
  flags) is intentionally deferred.
- Reaction branching within the scene uses story-local `VAR eval_q1 = ""` etc. (set at
  the choice, read in the reaction knot) — mirrors/queries not needed.

## Structure (linear; ~19 knots, budget 15–25)

Strictly sequential, per direction: set question → reaction knot (conditional prose on
the answer, three renders) → next set question. No hub.

```
EVAL_100  Arrival — the building across the street, morning, sign-in     [ops: set_date 2005-9-15 morning, set_header]
EVAL_105  Meeting her — coffee, the folder, the disarming open
EVAL_110  SQ1 (choices)   →  EVAL_115  reaction to SQ1
EVAL_120  SQ2             →  EVAL_125  reaction
EVAL_130  SQ3             →  EVAL_135  reaction
EVAL_140  SQ4             →  EVAL_145  reaction
EVAL_150  SQ5             →  EVAL_155  reaction
EVAL_160  SQ6             →  EVAL_165  reaction
EVAL_170  Wrap — she closes the folder; one human beat off the record
EVAL_200  Out — the street, the ordinary city, what she notices now
EVAL_205  Last days in Ottawa — packing the apartment down to two bags   [ops: advance_days]
EVAL_210  Departure — the platform/bus bay, Toronto ahead                → End of Prologue
```

- EVAL_* knots are appended to `briefing.ink` (one continuous prologue story — no story
  switch). `INTRO_800` stops being the end screen: Robert's wrap gains a line setting the
  eval appointment, and the flow diverts on to `EVAL_100` (via a short time-skip beat).
  The "End of Prologue / TO BE CONTINUED — ACT 1: INSERTION" screen moves to fire at
  `EVAL_210`. This directly fixes the abrupt ending.
- Act 1 then opens with **arrival** in Toronto — the prologue ends on departure.

## The six set questions (DRAFT — for approval; wording is direction, not final prose)

Formats per design: some are truth-axis (`yes / no / no [lie]`), some are plain picks
(three flavors, no lie). SQ1 is deliberately low-stakes so the player learns the lie
option exists before anything that counts.

| # | Domain | The question (gist) | Options | Flags written (truth) |
|---|--------|--------------------|---------|----------------------|
| SQ1 | Stress baseline (opener) | "How have you been sleeping since the assignment came down?" | fine / badly / "fine" [lie] | `Sleeps fine` / `Sleeps badly` / `Sleeps badly` |
| SQ2 | The incident, fear | "The file says what happened. I'm asking what stayed. What still has weight — what you saw, that no one could be told, or that it could happen again?" | what I saw / the silence after / that it isn't over | `Haunted by what she saw` / `Marked by the silence` / `Fears it isn't over` |
| SQ3 | Attachment, isolation | "Months under, nobody who knows your name. Is there anyone outside the Branch you'd call close?" | yes / no / "no" [lie] | `Has someone who'd miss her` / `No close attachments` / `Has someone who'd miss her` |
| SQ4 | Sexual comfort — being seen (kink seed) | "The venue's social fabric is sexual and it is not private. Being watched — is that something that appeals to you, personally?" | yes / no / "no" [lie] | tag `Drawn to being watched` + kink `exhibitionism` on truth-yes; tag `Prefers the door closed` on no |
| SQ5 | Sexual comfort — women (kink seed) | "You may need to be convincing with women as well as men. Is there anything true underneath that, for you?" | yes / no / "no" [lie] | tag `Attracted to women` + kink `women` on truth-yes; tag `Men only, truthfully` on no |
| SQ6 | Motive (closer) | "Last one, and it's off the form. Two years in — why are you still here?" | to understand what happened to me / because someone has to stand between / because nothing else felt real afterward | `Here to understand` / `Here to protect` / `Here because nothing else is real` |

Reaction knots: her response in-character (warm, precise, occasionally one notch too
perceptive), three conditional renders each, 80–120 words per render, converging on the
next question. She never judges an answer; she writes things down at moments that don't
line up with what was just said — texture, not mechanics.

## Tone contract

Diner-scene register: bureaucratic slice of life, personality coming through procedure,
the world feeling lived in. Kinks and sex discussed **directly and clinically** — vocabulary
on the table, zero heat staging; her office is the one place in the game sex is a
checkbox. STYLE-GUIDE.md governs prose throughout (80–120 words/knot, 200 ceiling; choice
text = complete sentence, PC dialogue / narration / Continue).

## Open items (need your call before ink)

1. **Name** — pick from the list (Caron recommended) or supply one.
2. **The six questions** — approve/edit/replace the set above; SQ4/SQ5 are the kink
   seeds, swap targets if you want different kinks seeded here.
3. **Departure detail** — train or bus to Toronto (EVAL_210 staging; Ottawa→Toronto 2005
   is plausibly either; train reads better on the page).
