# Style Guide Audit — 2026-05-26

## Summary

The greybox prose is in fundamentally good shape. Voice is settled, Robert sounds like Robert, the Branch sounds bureaucratic without parody, and Ottawa-2005 is convincingly drawn. No hard violations — no word-count blowouts, no NPC dialogue in links, no anachronisms, no Métis/Shield conflation, no Branch voice reaching for "supernatural" except one intentional self-correction. **33 findings total:** 0 hard violations, 29 AI-isms, 4 light calls. Findings cluster around three systemic patterns called out below.

Each finding is a self-contained card with **Before** quoted exactly, **After** as exact replacement prose, severity, the style-guide rule it lands under, and a one-sentence rationale. Give a thumbs up or down per card, or approve in bulk.

### Systemic patterns (worth a group decision)

- **Negation cadence ("not X, just Y" / "Not X, not Y — just Z")** — 9 instances across the briefing (findings 07, 11, 12, 17, 19, 20, 25, 31, 32). Single biggest AI-tell concentration. Hitting these as a group would tighten the prose noticeably.
- **Parallel construction ("X is one thing. Y is something else." / "X and Y.")** — 5 instances (findings 03, 14, 23, 24, plus the merged 07). Less load-bearing than the negation cadence but recurring.
- **Robert-as-Northerner romanticization** — 2 instances (findings 06, 31). Two is the threshold §13.5 warns about; resolving both keeps the character from sliding into stereotype.

### Confirmed skipped per scope

- CC-400 redacted file extract (placeholder).
- INTRO-550 Question Toronto (explicit `//To be written.//` stub).
- SugarCube macro logic, HTML/CSS in CC dossiers, variable interpolations.

### Scope notes

- CC dossier header taglines ("Tonight's name needn't be your last. The Branch assigns the rest." etc.) and the CC-100 italic flavor quote read as in-voice prose. I audited them; all came up clean.
- CC-300 background cards are natural-language prose; audited. One soft finding (01).
- INTRO-410 visible word count: the longest render path (player has not visited INTRO-340 *and* all five optional question links still available) renders at approximately 180 words plus six link sentences. Within the 200 ceiling but tight. No fix proposed — flagging in case future additions push it over.

---

## Findings

### CC-300 Background — [character-creator.twee:154](../src/content/character-creator.twee#L154)

**01. light call** [§3.4 narrator commentary as scene close]

The CSIS analyst card ends on a narrator-thesis closer that names what the prior sentences already show.

Before:
> You read reports, cross-referenced data, identified patterns no one else saw. You were never in the field — you were the person the field reported to. Your mind works in systems.

After:
> You read reports, cross-referenced data, identified patterns no one else saw. You were never in the field — you were the person the field reported to.

Rationale: Cutting the final sentence loses no information — "the person the field reported to" already establishes the analyst pattern. The other three background cards end on character-flavor; this one ends on a thesis statement. (Other cards reviewed clean.)

---

### INTRO-101 Lost in thought — [briefing.twee:706](../src/content/briefing.twee#L706)

**02. light call (note only — no proposed change)** [§5.1 NYSE bureaucratic veneer]

Before:
> Despite the fact that you both worked in the field of the supernatural — sorry, the <<term "NYSE">> — all you'd done for the past two years since <<print $player.incitingIncident || "the incident">> was get trained.

Note only: §5.1 explicitly endorses the snarky self-correction ("the parenthetical correction is dry snark from her, not earnest self-correction"). Flagging that this is the *one* place in the greybox where "supernatural" appears in-voice; the line works because of the self-correct, but if the project ever decides to tighten §5.1 further, this is where it surfaces. No change proposed.

---

### INTRO-105 Waiting — [briefing.twee:29](../src/content/briefing.twee#L29)

**03. AI-ism** [§13.1 parallel construction] — CSIS variant

Before:
> You used to meet sources in places like this. The tradecraft is the same. The stakes are different.

After:
> You used to meet sources in places like this. The tradecraft is the same.

Rationale: The "X is the same. Y is different." construction is composed cleverness; cutting the second beat leaves the analyst-recognition without the parallel. The weight of the new stakes is delivered by the next 25 passages — this line doesn't need to certify them.

**04. AI-ism** [§3.4 / §13.1 narrator-thesis scene close] — default variant

Before:
> Two years ago you wouldn't have known what to look for in a diner — the exits, the sightlines, the two men at the counter reading the same section of the Citizen. Training changes how you see a room.

After:
> Two years ago you wouldn't have known what to look for in a diner — the exits, the sightlines, the two men at the counter reading the same section of the Citizen.

Rationale: The picture already shows training's effect; the closing thesis names what's already shown.

---

### INTRO-115 Morning — [briefing.twee:63](../src/content/briefing.twee#L63)

**05. AI-ism** [§13.1 constructed cleverness / decorative metaphor]

Before:
> He slides into the booth across from you, sets the <<term "Globe">> on the table, and signals the waitress with a look that somehow communicates both "coffee" and "not yet" about the food.

After:
> He slides into the booth across from you, sets the <<term "Globe">> on the table, and catches the waitress's eye. Coffee. No food yet.

Rationale: "Somehow communicates both X and Y" is narrator explaining the cleverness of the gesture; converting to action + clipped thought delivers the same information in the PC's voice.

**06. AI-ism** [§13.5 Robert-as-wise-Northerner]

Before:
> Especially since you do know the story of how he was an academic at <<term "Lakehead">> and a star grad student at <<term "U of T">>. But who knows what he's seen in the dark of the woods.

After:
> Especially since you do know the story of how he was an academic at <<term "Lakehead">> and a star grad student at <<term "U of T">>. The hands are from after.

Rationale: "The dark of the woods" abstracts Robert into Shield-country mystique; "the hands are from after" preserves the mystery (his scars come from a later, less-academic chapter), pulls the focus back to the hands the passage opened on, and stays inside the PC's actual evidence. **Meaning change:** the original gestures at unspecified backwoods experience; the revision narrows to "post-academic, source unknown." Both leave the gap open.

---

### INTRO-200 Assignment + INTRO-200a Personal — [briefing.twee:97](../src/content/briefing.twee#L97), [briefing.twee:83](../src/content/briefing.twee#L83)

**07. AI-ism** [§13.1 negation cadence / parallel construction]

This block appears verbatim in both passages — fix applies to both.

Before:
> He doesn't reach for a folder. He doesn't open a laptop. He just looks at you for a moment with that particular expression he gets when he's about to tell you something he's been thinking about for a while.

After:
> No folder this time, no laptop. Robert looks at you for a moment with that particular expression he gets when he's about to tell you something he's been thinking about for a while.

Rationale: "He doesn't X. He doesn't Y. He just Z." is the negation-parallel pattern §13.1 explicitly flags. Collapsing the two negations into a single fragment ("No folder this time, no laptop.") preserves the load-bearing absence-of-bureaucracy beat without the cadence.

---

### INTRO-205 Field placement — [briefing.twee:115](../src/content/briefing.twee#L115)

**08. AI-ism** [§13.1 silence-as-device]

Before:
> He pauses to let that land.

After:
> He pauses.

Rationale: "To let that land" certifies Robert's intent in narrator voice. The next paragraph (two years of training, this is what it was for) does the landing.

---

### INTRO-300 NYSE details — [briefing.twee:171](../src/content/briefing.twee#L171)

**09. light call** [§13.1 composed vocabulary]

Before:
> You raise an eyebrow. He gets an imp-like glimmer in his eye. He's giving you shit.

After:
> You raise an eyebrow. He almost grins. He's giving you shit.

Rationale: "Imp-like glimmer" is slightly literary; "almost grins" delivers the same beat in plainer register. Minor — could also be left alone.

---

### INTRO-310 Cover — [briefing.twee:207](../src/content/briefing.twee#L207)

**10. AI-ism** [§13.1 decorative metaphor]

Before:
> He almost smiles. Almost. The corners of his mouth do something that in another man might be amusement.

After:
> He almost smiles. Almost.

Rationale: The third sentence over-explains what the first two already establish. Cutting it leaves the staged-repetition beat (which is voice) and drops the literary gloss.

---

### INTRO-320 Reaction — [briefing.twee:245](../src/content/briefing.twee#L245)

**11. AI-ism** [§13.1 negation cadence + composed simile]

Before:
> You say it flat. Not a question, not a judgment — just the words, sitting there between you on the table like the sugar dispenser.

After:
> You say it flat. The words sit between you on the table.

Rationale: "Not X, not Y — just Z" is the negation-cadence pattern; the sugar-dispenser simile is cute but compounds the cleverness. The "flat" delivery is the beat. **Alt if you want to keep diner texture:** *"You say it flat. The words sit there like the sugar dispenser between you."* — keeps the simile, drops only the negation.

---

### INTRO-322 Concerns — [briefing.twee:722](../src/content/briefing.twee#L722)

**12. AI-ism** [§13.1 negation cadence]

Before:
> Robert nods once. Not surprise, not disappointment — just the acknowledgment of a piece of information.

After:
> Robert nods once.

Rationale: The single beat carries the meaning; the explanatory tail labels what the action already shows. Robert's affect-flat redirect to Vandermeer two sentences later confirms the lack of surprise/disappointment.

**13. AI-ism** [§13.1 composed simile]

Before:
> He folds the paper before you've finished the sentence and slides it back into his jacket. He drinks the rest of his coffee like it's the only thing the morning was for.

After:
> He folds the paper before you've finished the sentence and slides it back into his jacket. He finishes his coffee in two long pulls.

Rationale: "Like it's the only thing the morning was for" is composed metaphor doing editorial work the action already does. Two long pulls is the same "businesslike, moving on" beat in clean action.

---

### INTRO-325 No concerns — [briefing.twee:265](../src/content/briefing.twee#L265)

**14. AI-ism** [§13.1 parallel construction] — grad student variant

Before:
> You wrote a thesis chapter on environments like this — the social dynamics, the consent frameworks, the group psychology. Studying it is one thing. Working inside it is something else.

After:
> You wrote a thesis chapter on environments like this — the social dynamics, the consent frameworks, the group psychology. The fieldwork won't read like the literature.

Rationale: "X is one thing. Y is something else." is the parallel-construction tic; the revision delivers the same gap-between-theory-and-practice beat in one sentence, with grad-student-flavored vocabulary ("literature").

**15. AI-ism** [§11.11 lazy vagueness + §13.1 negation cadence] — unemployed variant

Before:
> You've been in places like this. Not as an agent — as a person. That's a different kind of knowledge, and it's sitting in your chest right now doing something complicated.

After:
> You've been in places like this as a customer. That's a different kind of knowledge to bring to a briefing.

Rationale: "Not as an agent — as a person" is negation cadence; "doing something complicated" is lazy vagueness — the character could name (or specifically not name) what she's feeling. The revision specifies the prior role ("as a customer") and anchors the discomfort to the present scene without the unnamed-feeling dodge. **Meaning change:** the original implies an active in-chest sensation; the revision implies the knowledge-mismatch is the beat. The replacement loses the body-felt charge but the §11.11 audit suggests the original was reaching for a feeling it didn't actually name.

---

### INTRO-330 Source — [briefing.twee:282](../src/content/briefing.twee#L282)

**16. AI-ism** [§13.1 dual-comparison construction]

Before:
> Robert is quiet for a moment. It's a different quiet than his briefing pauses — less structured, more considered.

After:
> Robert is quiet for a moment. It's a different quiet than his briefing pauses.

Rationale: "Less X, more Y" is the parallel-comparison construction; "different" already does the work, and the next beat (the In-my-experience pivot) shows what makes it different.

---

### INTRO-340 Why me — [briefing.twee:321](../src/content/briefing.twee#L321)

**17. AI-ism** [§13.1 negation cadence + literary metaphor]

Before:
> Robert's expression doesn't change, but something behind it shifts — a microsecond of something that isn't discomfort, exactly, but might be its professional cousin.

After:
> Robert's expression doesn't change, but something behind it shifts — a microsecond of professional discomfort.

Rationale: "Isn't X, exactly, but might be Y" is the negation-with-hedge pattern; "professional cousin" is constructed metaphor. The revision delivers the same beat in half the words.

---

### INTRO-345 Qualified — [briefing.twee:344](../src/content/briefing.twee#L344)

**18. AI-ism** [§13.1 meta-vocabulary leak ("the gap")] — default variant

Before:
> There's a gap between his list of qualifications and his actual answer, and you can feel the shape of it. The truth is simpler: the Branch doesn't have many options, and you're the best one.

After:
> His list of qualifications skips the simpler answer. The Branch doesn't have many options, and you're the best one.

Rationale: "The gap" and "feel the shape of it" are exactly the craft-talk meta-vocabulary §13.1 flags as AI describing its own intentions rather than executing them. The revision delivers the same recognition in PC voice.

---

### INTRO-400 Apartment — [briefing.twee:360](../src/content/briefing.twee#L360)

**19. AI-ism** [§13.1 negation cadence]

Before:
> Robert reaches into his jacket — not a folder, just a single sheet of paper folded twice.

After:
> Robert reaches into his jacket and pulls out a single sheet of paper, folded twice.

Rationale: "Not X, just Y" — direct match for the negation-cadence pattern. The revision delivers the same information without the cadence; the absence of a folder is implied (and was already established beat in INTRO-200/200a).

---

### INTRO-410 Rules — [briefing.twee:403](../src/content/briefing.twee#L403)

**20. AI-ism** [§13.1 negation cadence] — conditional branch (player hasn't visited INTRO-340)

Before:
> He pauses, then adds — like he's saying it because he should, not because he wants to — "You haven't asked why you."

After:
> He pauses. "You haven't asked why you."

Rationale: "Because he should, not because he wants to" is negation cadence wearing an explanatory framing. The next sentence ("He doesn't wait for you to answer.") already carries the reluctance. **Meaning change:** the original explicitly narrator-certifies Robert's reluctance; the revision lets the surrounding beats (skipped question, no waiting for answer, looking at coffee instead of the player) carry it. The reluctance is still readable.

---

### INTRO-500 Question NYSE — [briefing.twee:456](../src/content/briefing.twee#L456)

**21. AI-ism** [§13.1 meta-vocabulary leak ("the gap")]

Before:
> Robert takes a slow breath — the particular care he takes when bridging the gap between what the Branch knows and what it means.

After:
> Robert takes a slow breath — the particular care he takes when Branch language has to carry weight it wasn't designed for.

Rationale: "Bridging the gap" is meta-vocabulary; the revision names the specific thing happening (Branch vocabulary straining under what it has to describe), which is closer to what Robert is actually doing and avoids the craft-talk register.

---

### INTRO-530 Question previous — [briefing.twee:523](../src/content/briefing.twee#L523)

**22. AI-ism** [§13.1 silence-as-device]

Before:
> You wait. Robert is a man who uses silence, but he also respects when someone uses it back.

After:
> You wait.

Rationale: The second sentence is the literal "narrator commenting on silence" pattern §13.1 flags. The action of waiting + the next paragraph (his eighteen-months-ago answer) do the work. Robert's relationship with silence is established across half a dozen prior passages.

**23. AI-ism** [§13.1 parallel construction]

Before:
> You'll be the first. No playbook. That's a disadvantage and an advantage.

After:
> You'll be the first. No playbook.

Rationale: "Disadvantage and an advantage" is constructed-balance cleverness; cutting it lets the two facts speak for themselves and ends the passage on the click rather than on Robert's editorial.

---

### INTRO-600 Subtext — [briefing.twee:545](../src/content/briefing.twee#L545)

**24. AI-ism** [§13.1 constructed parallel cleverness]

Before:
> He picks up his coffee and finishes it in one long pull — a practical man finishing a practical beverage.

After:
> He picks up his coffee and finishes it in one long pull.

Rationale: "A practical man finishing a practical beverage" is the kind of parallel-cleverness §13.1 calls out as composed-sounding; the action already shows the trait.

**25. AI-ism** [§13.1 negation cadence]

Before:
> And then there's a moment. Not a dramatic one.

After:
> And then there's a moment.

Rationale: The four sentences that follow ("Just a small hitch in Robert's efficiency. He puts the mug down and his hand stays on it for a beat too long…") already show the not-dramatic-but-real quality. Narrator-certifying it pre-empts the picture.

---

### INTRO-610 Reading Robert — [briefing.twee:571](../src/content/briefing.twee#L571)

**26. AI-ism** [§13.1 composed simile] — pass branch

Before:
> You've sat across from this man in dozens of briefings. You've learned his rhythms — the pauses, the mug rotations, the way he deploys silence like punctuation.

After:
> You've sat across from this man in dozens of briefings. You've learned his rhythms — the pauses, the mug rotations, the way he uses silence.

Rationale: "Deploys silence like punctuation" is composed simile + craft-talk vocabulary ("deploys"). Same content, plainer register.

**27. AI-ism** [§13.1 tech metaphor] — fail branch

Before:
> Except — you're not sure. There's something there, in the way he's holding the mug, but you can't quite read it. Two years of training and you still can't always crack Robert Flett.
>
> The man is a closed system.

After:
> Except — you're not sure. There's something there, in the way he's holding the mug, but you can't quite read it. Two years of training and you still can't always crack Robert Flett.

Rationale: "Closed system" is engineering vocabulary the PC doesn't reach for. "Can't always crack Robert Flett" already lands the same meaning in the previous sentence.

---

### INTRO-620 Called out — [briefing.twee:601](../src/content/briefing.twee#L601)

**28. AI-ism** [§13.1 meta-vocabulary leak ("the specific weight"); §3.4 narrator profundity]

Before:
> For a second — less than a second — the handler isn't there. Just Robert, a man in his late forties who has been doing this work for longer than you've been out of school, looking at someone he trained and feeling the specific weight of what that means.

After:
> For a second — less than a second — the handler isn't there. Just Robert, a man in his late forties who has been doing this work for longer than you've been out of school, looking at someone he trained.

Rationale: "Feeling the specific weight of what that means" is the exact craft-talk pattern §13.1 flags. The look already does the work; the next line ("I selected you for this assignment because you're the most qualified candidate available," and it's true) confirms it.

---

### INTRO-630 Moment passes — [briefing.twee:624](../src/content/briefing.twee#L624)

**29. light call** [§15.12 noir chestnut]

Before:
> The moment is over. It existed for exactly as long as it needed to, and now it's filed in the space between professional and personal where Robert keeps the things he can't put in reports.

After:
> The moment is over. It existed for exactly as long as it needed to.

Rationale: "The things he can't put in reports" is a familiar spy/noir register tag, and "the space between professional and personal" is composed framing. The cleaner cut lets the moment close without the gloss. **Alt if you want to keep the filing image:** *"The moment is over. Filed somewhere Robert keeps things that don't go in reports."* — same image, less framing.

---

### INTRO-700 Outside — [briefing.twee:641](../src/content/briefing.twee#L641)

**30. light call (no proposed change — flagging for your call)** [§3.4 borderline narrator close]

Before:
> September sun on limestone. Ottawa being unremarkably, specifically itself.

The "unremarkably, specifically" pairing is composed and reads as scene-close thesis, but the line is doing genuine §4.2 geography work (Ottawa = government-town quiet, hiding things in plain sight). Flagging it for your decision; my call is it stays.

---

### INTRO-710 Last words — [briefing.twee:654](../src/content/briefing.twee#L654)

**31. AI-ism** [§13.1 negation cadence + §13.5 Robert-as-Northerner]

Before:
> Robert stands on the sidewalk, hands in his jacket pockets. He looks east, then west — not for threats, just an old habit, the way a northern man checks the weather by looking at the sky.

After:
> Robert stands on the sidewalk, hands in his jacket pockets. He glances east, then west. Old habit.

Rationale: "Not for threats, just an old habit" is negation cadence; "the way a northern man checks the weather by looking at the sky" is the second Robert-as-Northerner-archetype moment in the briefing (paired with finding 06). Two strikes; §13.5 explicitly warns the character slides into stereotype at this threshold. The revision delivers the same beat (old field-officer habit, not active threat-checking) without the negation or the Northerner simile. **Meaning change:** the original's explicit "not for threats" callout is gone; the implicit "old habit" carries it now.

**32. AI-ism** [§13.1 negation cadence] — conditional branch (player passed Composure check in INTRO-610)

Before:
> He pauses. Looks at you one more time with an expression that's almost — not quite — the one from the diner. Then he straightens his shoulders and puts the handler back on.

After:
> He pauses. Looks at you one more time with an expression that's almost the one from the diner. Then he straightens his shoulders and puts the handler back on.

Rationale: "Almost — not quite —" is negation-cadence inside dashes. "Almost the one from the diner" carries the same hedge in a single word.

---

### INTRO-720 Departure — [briefing.twee:677](../src/content/briefing.twee#L677)

**33. AI-ism / light §13.5 call** [§3.4 narrator profundity + §13.5 NYSE pre-resolution]

Before:
> You watch him go — a man in an unremarkable jacket disappearing into the perfectly ordinary Monday morning, on his way back to a building where the paperwork includes things that shouldn't exist.

After:
> You watch him go — a man in an unremarkable jacket disappearing into the perfectly ordinary Monday morning.

Rationale: "Things that shouldn't exist" is narrator-thesis at scene close and, on the §13.5 side, the narrator certifying NYSE-as-supernatural in her own voice (rather than leaving the Branch's vocabulary doing its proper work). The conditional reaction paragraph that follows already carries the assignment's weight in each variant. **Meaning change:** the original's gesture at the impossibility of Branch work is gone; the conditional paragraphs immediately below carry the equivalent weight (`A club on Queen West where something is happening that the Branch can't explain.`).
