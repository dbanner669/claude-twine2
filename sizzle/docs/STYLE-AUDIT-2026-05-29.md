# Style Guide Audit — 2026-05-29

Scope: the Toronto Blackout origin sequence (`src/content/blackout.twee`, BLK-085–BLK-215, 26 passages) plus the CC-400 incident-selection copy (`src/content/character-creator.twee`). This is a punch-up / prose-elevation pass against [STYLE-GUIDE.md](STYLE-GUIDE.md), run through the [EDITORIAL-SWEEP.md](EDITORIAL-SWEEP.md) Stage 0–4 workflow. The draft is strong and beat-accurate; nothing here is construction or a mechanics change.

## Summary

Overall health: **good.** The sequence lands its beats, holds the pre-Branch voice through BLK-205, keeps the upstairs off-page, and nails the consent-as-horror thesis at its core (§11.12). The work here is elevation, not repair. **47 cards** across 19 passages: **2 hard** (tense lapse, off-spec/missing CSIS variant), **31 AI-isms** (the §13.1/§13.5 tells — composed fragment-kickers, narrator winks, meta-vocabulary, negation/passive labels, spaced em-dashes added beyond house need), **14 light calls.** Seven passages are clean and omitted (BLK-110, BLK-210) or near-clean (noted in Scope).

Standards decisions carried in from the sample-calibration rounds (chat, this session):

1. **Composed fragment-kickers and nominalized abstractions at passage-end get flattened to plain thought.** This is the headline pattern. The PC's interiority should sound like a specific frightened woman thinking, not like a polished closing line. ("The wanting you didn't choose" → cut to "It isn't the people upstairs that scare you. It's that you want to be one of them.")
2. **State the beat, then stop — cut the explain-the-show tail; trust the reader to infer** (§3.3). Most cards lose a clause, not information.
3. **Kill the narrator winks / foreknowledge** — the protest-too-much underlining of the Chekhov matchbook and the "this will matter later" foreshadows.
4. **Reduce spaced em-dashes** per the author's explicit direction this session — see the §7.1 tension note in Systemic Patterns. Recast cleanly (comma / colon / period / sentence split), never mechanically strip into broken punctuation; dialogue-interruption dashes and the BLK-215 byline dash are left alone.
5. **Push the dial harder, and let the PC's dry voice show** — but not in the peak-dread beats (§10.5). The wit lives in the table-setting, the bar, the walk, the lobby man, and Robert's memo; BLK-155/160 stay humour-free.

### Systemic patterns (worth a group decision)

- **A. Composed fragment-kickers / nominalized abstractions ending a passage.** The most common tell here. Instances: BLK-095 ("The last fully unremarkable moment of the afternoon."), BLK-140 ("that absence is the thing"), BLK-155 ("The wanting you didn't choose."), BLK-160 ("Not the same part that makes decisions." / "watching the wanting from outside"), BLK-185 ("The building doesn't know how to be embarrassed, but the people in it do."), BLK-200 ("You know three things."), BLK-205 ("a language that doesn't have it"). Cards 8, 19, 30–31, 33, 38, 40, 42. *One motif kicker is deliberately KEPT* — BLK-170's "The dark is the thing." (the sequence's spine line; I removed its pre-echo at BLK-140 so it lands clean once).
- **B. Narrator winks / foreknowledge.** Underlining the matchbook by denying its significance, or telling the reader a moment will matter later. Instances: BLK-090 grad ("will seem unremarkable later… You won't try."), BLK-095 ("last fully unremarkable moment"), BLK-105 ("there is absolutely no reason to think about it twice"), BLK-175 ("This is the part where things go wrong"). Cards 6, 8, 14, 36.
- **C. Meta / craft-vocabulary leak** (§13.1 — "the texture," "the structure," and music-register metaphors creeping from craft-talk into prose). "texture" ×3 (BLK-120, BLK-125 CSIS, BLK-130 keep-walking), "structure"/"interior monologue" (BLK-200), "drops/different register" ×2 (BLK-165, BLK-180). Cards 22, 24, 28, 35, 37, 40.
- **D. "You find yourself" / "found themselves"** passive narrator-labels (§13.4). BLK-090 CSIS, BLK-125 CSIS, BLK-185. Cards 5, 23, 39.
- **E. Spaced em-dashes beyond house need.** ~22 instances across the sequence; recast within the relevant prose cards. See §7.1 tension note below.

**§7.1 tension to acknowledge:** STYLE-GUIDE §7.1 records a *project override* — spaced em-dashes are house style and are NOT to be auto-stripped from existing greybox passages. The author has given an explicit, repeated instruction this session to reduce them ("There are ALREADY too many of them"). I am treating the live instruction as superseding the standing override for this sweep, and reducing by clean recast (not mechanical stripping). If you'd rather hold the §7.1 override and keep the dashes, reject the dash portion of any card and I'll keep the prose change without the punctuation swap. Flagging so the override doc can be updated either way.

### Confirmed skipped per scope

- **SugarCube logic** — all `<<silently>>` blocks, `<<setDate>>`/`<<setTime>>`/`<<advanceDays>>`, `<<set $header.*>>`, `<<skillCheck>>` calls/DCs/modifiers, `$player.flags.*` guards, `$nyse.influence` math, `$player.incitingIncident`, the BLK-215→CC-500 link target and its setters. Untouched by every card below.
- **HTML/CSS** in the BLK-210/215 document blocks and the CC-400 dossier — styling only; cards touch `<p>`/text content exclusively.
- **CC-400 redacted file-extract block** ("On the night of ▮▮▮…") — redacted placeholder, out of scope per EDITORIAL-SWEEP Stage 0 §3.
- **CC-400 "Coming Soon" cards** (Manitoulin / Pale Eyes / WDS blurbs) — other incidents, not this sequence.

### Scope notes

- **Word counts:** the only passages whose longest single render approaches the target band are the variant-bearing ones (BLK-085, BLK-100, BLK-115, BLK-125). Post-edit longest renders: BLK-085 ≈100, BLK-100 ≈95, BLK-115 ≈116 (CSIS), BLK-125 ≈95. None near the 200 ceiling. The two document passages (BLK-210 ≈150 visible, BLK-215 ≈118) are under ceiling.
- **BLK-110** ("Four-eleven") and **BLK-210** ("Incident report") are clean — omitted by design (§ anti-pad). BLK-210's clinical voice and "Classification: pending review" non-resolution are exactly right (§13.5); leave it.
- **CC-400 Blackout card** ("Thursday, August 14, 2003. The night the lights went out, you were the one who lit a match.") is the design one-liner verbatim and works — no change.

---

## Findings

### `BLK-085 The hottest day of the year` — [blackout.twee:9](../src/content/blackout.twee#L9)

**01. [AI-ism]** [§13.1 portent/editorializing; §7.1 dash] — vague dread-seed kicker + spaced em-dash in the opener.

Before:
> The hottest week of the year has saved its worst for today. Thirty degrees, and the humidity is doing its own work on top — the kind of afternoon that softens the asphalt and turns sidewalk fruit to mush by two o'clock. The city is slow and sticky and moving in the wrong direction.

After:
> The hottest week of the year has saved its worst for today. Thirty degrees, and the humidity is doing its own work on top, the kind of afternoon that softens the asphalt and turns sidewalk fruit to mush by two o'clock. Nobody's moving faster than they have to, and most are moving slower than that.

Rationale: "moving in the wrong direction" reads as narrator foreshadowing in a pre-Branch beat; the replacement is a plain, dry observation. Dash → comma. (Meaning change: minor — drops an ambiguous portent, keeps the heat-and-sluggishness image.)

**02. [light call]** [§3.2 variant shading; §10.5 dry voice] — unemployed variant ends flat.

Before:
> No particular reason to be on the Danforth. No particular reason to be anywhere. That's the honest answer today.

After:
> No particular reason to be on the Danforth. No particular reason to be much of anywhere, these days.

Rationale: trims the flat "honest answer" tag; "these days" lets the unemployment shade in without stating it (BLACKOUT §3). (Meaning change: no.)

---

### `BLK-090 Up the Danforth` — [blackout.twee:28](../src/content/blackout.twee#L28)

**03. [light call]** [§13.6 echo] — second consecutive passage ending on the city moving slow.

Before:
> The 504 streetcar runs past, overhead wire humming, moving slow the way the whole city moves slow today.

After:
> The 504 streetcar runs past, overhead wire humming, in no more hurry than anyone else.

Rationale: removes the "slow… slow" doubling and the echo of BLK-085's closer. (Meaning change: no.)

**04. [AI-ism]** [§7.1 dash] — RCMP variant dash.

Before:
> You read it the way you read a quiet patrol — nothing wrong, but you note the exits anyway. Habit.

After:
> You read it the way you read a quiet patrol: nothing wrong, but you note the exits anyway. Habit.

Rationale: dash → colon; "Habit." one-word landing kept (it earns it). (Meaning change: no.)

**05. [AI-ism]** [§13.4 passive label; §3.1 register] — CSIS variant "you find yourself" + "occupational reflex" jargon.

Before:
> You find yourself clocking patterns without meaning to. Who's moving fast, who's stopped. An occupational reflex you haven't managed to turn off.

After:
> You clock patterns without meaning to. Who's moving fast, who's stopped. The reflex doesn't switch off just because you're off the clock.

Rationale: kills "you find yourself," flattens "occupational reflex," adds a dry beat. (Meaning change: no.)

**06. [AI-ism]** [§13.5 foreknowledge; §13.1 narrator profundity] — grad variant tells the reader the day will matter later.

Before:
> Ordinary Thursday afternoon. The kind of afternoon that will seem unremarkable later when you try to recall it. You won't try.

After:
> Ordinary Thursday afternoon. The street gives you nothing to study, and you're grateful for it.

Rationale: removes the narrator foreshadow she can't possess in 2003; replaces with grad-voice dry (always-studying). (Meaning change: yes — drops the "you'll try to recall this later" implication, which is exactly the foreknowledge to cut.)

---

### `BLK-095 Somewhere with a fan` — [blackout.twee:47](../src/content/blackout.twee#L47)

**07. [AI-ism]** [§7.1 dash ×3] — three spaced em-dashes in eight lines; the bartender appositive recasts cleanly.

Before:
> The door swings shut behind you and the heat drops by about five degrees — not cool, but survivable. The bar is a low-lit room: vinyl stools, a mirror behind the bottles, two ceiling fans doing their best. A handful of people. The bartender — older, moustache, a towel over his shoulder — gives you the nod.
>
> Your eyes find the room's edges before they find a seat. Bar on the right, washrooms at the back, the patio door propped open to the lane.

After:
> The door swings shut behind you and the heat drops about five degrees. Not cool, but survivable. The bar is a low-lit room: vinyl stools, a mirror behind the bottles, two ceiling fans doing their best. A handful of people. The bartender gives you the nod. Older, moustache, a towel over his shoulder.
>
> You take the room in before you take a seat. Bar on the right, washrooms at the back, the patio door propped open to the lane.

Rationale: three dashes gone; "you take the room in" reads for civilian backgrounds too (the trained-eye phrasing over-claimed for grad/unemployed, who have no variant here). (Meaning change: no.)

**08. [AI-ism]** [§13.1 narrator profundity at scene end; §13.5 foreknowledge — pattern A & B] — composed dread-kicker she can't know.

Before:
> The last fully unremarkable moment of the afternoon.

After:
> Cool enough that you could sit here a while.

Rationale: "the last fully unremarkable moment" is narrator foreknowledge dressed as atmosphere; end on a plain, present-tense beat instead. (Meaning change: yes — removes the foreshadow; the dread is carried by what actually happens next, not by the narrator promising it.)

---

### `BLK-100 Last call before dark` — [blackout.twee:64](../src/content/blackout.twee#L64)

**09. [AI-ism]** [§7.1 dash] — RCMP variant dash.

Before:
> Two other constables from the conference are at the end of the bar — Robichaud and someone from Sudbury. You're half listening.

After:
> Two other constables from the conference are at the end of the bar, Robichaud and someone from Sudbury. You're half listening.

Rationale: dash → comma. (Meaning change: no.)

**10. [light call]** [§13.6 repetition] — grad variant repeats "library."

Before:
> York's library had the AC but the library didn't have beer, so here you are, approximately working.

After:
> York's library had the air conditioning but not the beer, so here you are, approximately working.

Rationale: drops the "library… library" doubling; keeps "approximately working" (good dry). (Meaning change: no.)

**11. [AI-ism]** [§7.1 dash; §15.12 "the kind of"] — unemployed variant dash + cliché frame.

Before:
> One beer, slowly. Money is the reason — the kind of arithmetic that means the afternoon counts as lunch. You're in no hurry.

After:
> One beer, slowly. Money's the reason; nursing it long enough that the afternoon can count as lunch. You're in no hurry.

Rationale: dash and "the kind of arithmetic" gone, keeps the dry poverty-math. (Meaning change: no.)

---

### `BLK-105 You don't even smoke` — [blackout.twee:83](../src/content/blackout.twee#L83)

**12. [AI-ism]** [§7.1 dash] — opener dash.

Before:
> There's a book of matches on the bar — the bar's own, advertising nothing in particular, just a logo you'll forget.

After:
> There's a book of matches on the bar, the bar's own, advertising nothing, a logo you'll forget.

Rationale: dash → comma, light tighten. (Meaning change: no.)

**13. [AI-ism]** [§13.1 additive editorializing; pattern B — calibration sample] — the matchbook-wink; protest-too-much underlining of the Chekhov plant.

Before:
> The bartender doesn't notice. The ceiling fans keep turning. Nobody's keeping score of what a person picks up off a bar on a Thursday afternoon in August, and there is absolutely no reason to think about it twice.

After:
> The bartender doesn't notice. The ceiling fans keep turning.

Rationale: BLACKOUT §2 wants the object planted *without* underlining; the wink does the opposite. The passage title + "you don't know why you did that" already carry it. Ending on the fans turning makes their stop at BLK-110 land harder (§3.4 end on image). (Meaning change: yes — removes editorial denial; no story information lost.)

---

### `BLK-115 Warm beer and a radio` — [blackout.twee:123](../src/content/blackout.twee#L123)

**14. [hard]** [BLACKOUT §3/§2 off-spec; §3.2 missing variant] — the radio announces regional scope, denying the CSIS analyst the *inference* the design assigns her; no CSIS branch exists. (Calibration sample.)

Before:
> The bartender finds a candle behind the bar — white, half used, the emergency kind — and lights it. Someone's transistor radio produces static and then a voice: the outage is widespread, not just the block. Not just the neighbourhood. Ontario Hydro, the whole grid.
>
> The bar settles into the strange intimacy of a blackout: lower voices, people looking at each other differently.
>
> `<<if $player.background eq "RCMP constable">>`Robichaud says something about getting back to the hotel. The Sudbury constable agrees. You order another round — someone should stay and you're curious. You're the last one out.
> `<<else>>`You settle up and leave when the beer gets warm.
> `<</if>>`

After:
> The bartender finds a candle behind the bar, the half-used emergency kind, and lights it. Someone's transistor radio coughs static, then a voice that won't commit to much: not just the block, not just the neighbourhood. Bigger than that. The man holding it keeps working the dial like the next station will say something better.
>
> The bar settles into the strange intimacy of a blackout: lower voices, people looking at each other differently.
>
> `<<if $player.background eq "RCMP constable">>`Robichaud's talking about the walk back to the hotel; the Sudbury constable's with him. You stay for one more. Somebody should keep an eye on a dark room full of warm beer and bored strangers, off the clock or not, and tonight that's you. You're the last one out.
> `<<elseif $player.background eq "CSIS analyst">>`You do the arithmetic the radio won't. Every light on the strip died on the same instant. Not a blown transformer, not a line down in a storm; something let go a long way upstream of here. Whatever it is, it's well above your pay grade, and it won't be fixed before your beer's warm. You settle up and go.
> `<<else>>`You settle up and leave when the beer gets warm.
> `<</if>>`

Rationale: restores BLACKOUT §3's CSIS-infers-scope beat (reasons regional scope from simultaneity + dead streetlights instead of being told); RCMP gets the off-duty cop's-eye read; 3 spaced em-dashes removed. Adds an `<<elseif>>` branch — narrative shading only, no link/target/convergence change. (Meaning change: yes — radio no longer states "Ontario Hydro, the whole grid"; non-CSIS players get "bigger than the block," and the full scope is inferred (CSIS) or surfaces later (Ontario Hydro re-enters naturally at BLK-205). Period-accurate to how scope was actually unknown for a while on Aug 14. If you'd rather all backgrounds hear the grid-wide line, I'll have CSIS infer it a beat *ahead* of the radio instead.) Longest render (CSIS) ≈116 words.

---

### `BLK-120 Walking home in the heat` — [blackout.twee:142](../src/content/blackout.twee#L142)

**15. [AI-ism]** [§7.1 dash] — TTC line dash.

Before:
> The TTC is dead — no streetcars, no signals, no buses.

After:
> The TTC is dead: no streetcars, no signals, no buses.

Rationale: dash → colon. (Meaning change: no.)

**16. [AI-ism]** [§13.1 meta-vocabulary — pattern C] — "has its own texture."

Before:
> The civic dark has its own texture: stranger than a regular evening, friendlier than it should be.

After:
> Out here the dark is almost sociable. Stranger than a normal evening, and friendlier than it ought to be.

Rationale: "texture" is craft-vocabulary leaking into prose; "almost sociable" shows the communal-dark rung (BLACKOUT §4) plainly and dryly. (Meaning change: no.)

---

### `BLK-125 The city helping itself` — [blackout.twee:159](../src/content/blackout.twee#L159)

**17. [AI-ism]** [§7.1 dash] — "chips, maybe" appositive dashes.

Before:
> Three neighbours are on a stoop sharing something from a bag — chips, maybe — watching the foot traffic like it's a parade.

After:
> Three neighbours are on a stoop sharing something from a bag, chips maybe, watching the foot traffic like it's a parade.

Rationale: two dashes → commas. ("He has no vest, no authority, and excellent hand signals." is kept — earned dry tricolon, §7.5.) (Meaning change: no.)

**18. [AI-ism]** [§13.4 passive label; §13.1 meta-vocab — patterns C & D] — CSIS variant "you find yourself," "group affect," "the texture."

Before:
> You find yourself reading group affect — the mood of it, the texture. This isn't panic. It's novelty. These things can shift.

After:
> You read the crowd the way the job taught you. This isn't panic; it's novelty. Novelty shifts.

Rationale: kills "you find yourself," "affect," "texture"; "Novelty shifts." is a clipped, dry landing. (Meaning change: no.)

---

### `BLK-130 The propped door` — [blackout.twee:178](../src/content/blackout.twee#L178)

**19. [light call]** [§15.12 "the kind of"] — building personification frame.

Before:
> The walkup is three stories, ten or twelve units, the kind of building that's been there since the fifties and has no intention of changing.

After:
> The walkup is three stories, ten or twelve units, there since the fifties and not interested in changing.

Rationale: drops "the kind of building that," keeps the dry personification. (Meaning change: no.)

**20. [AI-ism]** [§7.1 dash; §3.1 POV — "the chest/the brain"] — dash + depersonalized body nouns.

Before:
> Not ordinary building sound — not a TV through a wall, not a neighbour's argument. Something lower and sustained. A moan that registers wrong in the chest before the brain has caught up with why.

After:
> Not ordinary building sound. Not a TV through a wall, not a neighbour's argument. Something lower and sustained. A moan that lands wrong in your chest before your head has caught up with why.

Rationale: dash → period; "the chest/the brain" → "your chest/your head" (it's her body, second person). (Meaning change: no.)

**21. [AI-ism]** [§7.1 dash; §13.1 meta-vocab — pattern C] — keep-walking branch dash + "texture."

Before:
> Half a block. Maybe a little more. The sound follows you — or doesn't follow you, exactly, but the memory of it does, and the memory has a texture you can't shake loose.

After:
> Half a block. Maybe a little more. The sound follows you. Or it doesn't, exactly, but the memory of it does, and it won't shake loose.

Rationale: dash gone; "texture" gone; tighter. (Meaning change: no.)

---

### `BLK-135 Crossing the little yard` — [blackout.twee:204](../src/content/blackout.twee#L204)

**22. [AI-ism]** [§7.1 dash] — yard appositive dash; also drops a "concrete… concrete" repeat.

Before:
> Between the sidewalk and the door there's a small concrete yard — a bike leaned against the railing, a planter dried out from the week, a scorch mark on the concrete where someone used to barbecue. Normal. All of it normal.

After:
> Between the sidewalk and the door there's a small concrete yard: a bike against the railing, a planter dried out from the week, a scorch mark where someone used to barbecue. Normal. All of it normal.

Rationale: dash → colon; "on the concrete" cut (already "concrete yard"). (Meaning change: no.)

---

### `BLK-140 The lobby` — [blackout.twee:222](../src/content/blackout.twee#L222)

**23. [AI-ism]** [§7.1 dash] — lobby appositive dash.

Before:
> The lobby is a short hallway — mailboxes on one wall, a fire extinguisher on the other, emergency lighting running off its battery pack in a dim orange arc.

After:
> The lobby is a short hallway: mailboxes on one wall, a fire extinguisher on the other, emergency lighting running off its battery pack in a dim orange arc.

Rationale: dash → colon. (Meaning change: no.)

**24. [light call]** [§13.6 repetition] — "registers… registering."

Before:
> Your skin registers it before you understand what you're registering.

After:
> Your skin knows it before you do.

Rationale: kills the register/registering doubling; plainer and stronger. (Meaning change: no.)

**25. [AI-ism]** [§7.1 dash; §13.1 abstraction kicker — pattern A; §13.6 pre-echo] — success branch ends on "that absence is the thing," which also pre-echoes BLK-170's spine line.

Before:
> It's not absence of power. You've been in plenty of powerless dark today and it doesn't feel like this. This is wrong in a way that has nothing to do with the circuit breakers. The stairwell light should be on. It has been on. And now it isn't, and whatever difference that makes — that absence is the thing.

After:
> It's not the power being out. You've been walking through powerless dark all evening and none of it felt like this. The stairwell light should be on. It always has been. Now it's off, and what's standing in for it is wrong.

Rationale: removes the abstraction-kicker "that absence is the thing" (and its dash), reserving "the thing" for BLK-170 where the motif lands once; tighter throughout. (Meaning change: no — "nothing to do with the circuit breakers" is preserved as "not the power being out / none felt like this.")

**26. [AI-ism]** [§7.1 dash] — failure branch dash.

Before:
> You don't have a framework for it. There's just the dread — the animal certainty that something at the top of those stairs is not what it should be. You feel it in your throat before anywhere else.

After:
> You don't have a framework for it. There's just the dread, the animal certainty that something at the top of those stairs is not what it should be. You feel it in your throat before anywhere else.

Rationale: dash → comma; "animal certainty" and "in your throat" kept (both earn it). (Meaning change: no.)

---

### `BLK-145 The man who won't go up` — [blackout.twee:249](../src/content/blackout.twee#L249)

**27. [AI-ism]** [§7.1 dash] — only fix; otherwise this passage is a model (leave the dialogue).

Before:
> He's in the doorway of the ground-floor unit — a heavy man in his fifties, undershirt, forearms on the door frame, watching the stairwell the same way you are.

After:
> He's in the doorway of the ground-floor unit: a heavy man in his fifties, undershirt, forearms on the door frame, watching the stairwell the way you are.

Rationale: dash → colon; "the same way" → "the way" (tighten). His dialogue ("Light's been on since I moved in. Five years. Never went out." / "Now it has.") and the deadbolt ending are untouched. (Meaning change: no.)

---

### `BLK-150 What the dark is doing` — [blackout.twee:270](../src/content/blackout.twee#L270)

**28. [AI-ism]** [§7.1 dash ×2] — paired dashes around "you hear the door above."

Before:
> The woman comes from the second floor — you hear the door above — and descends toward you. Mid-thirties, wearing a sundress, one strap slipping off her shoulder. She's looking at the stairwell above her, not at you.

After:
> The woman comes down from the second floor; you hear the door, then her on the stairs. Mid-thirties, a sundress, one strap slipping off her shoulder. She's looking up the stairwell, not at you.

Rationale: two dashes gone; tighter. "She's undoing the dress as she walks," "Attending to something," and "You don't hear her stop climbing." are kept — all strong. (Meaning change: no.)

**29. [light call]** [§3.3 label] — "in a way that is completely wrong" tells the calm is wrong.

Before:
> Not in a hurry. Not afraid. Attending to something. Her expression is calm in a way that is completely wrong.

After:
> Not in a hurry. Not afraid. Attending to something. Her face is calm, and the calm is the wrong part.

Rationale: shows the locus of wrongness (the calm itself) instead of labeling it. (Meaning change: no.)

---

### `BLK-155 The sound from above` — [blackout.twee:289](../src/content/blackout.twee#L289)

**30. [AI-ism]** [§7.1 dash] — silhouette line dash. (Calibration sample.)

Before:
> A shape moves across the top of the stairwell — a silhouette pressed against another, mouths finding each other in the dark. Gone before you've fixed on it.

After:
> A shape moves across the top of the stairwell, a silhouette pressed against another, mouths finding each other in the dark. Gone before you've fixed on it.

Rationale: dash → comma. (Meaning change: no.)

**31. [AI-ism]** [§13.1 nominalized kicker + §3.6 explain-the-show — pattern A; the headline calibration card] — "the wanting you didn't choose" and the clause that pre-explains the body's response.

Before:
> You notice, then, that you're warm. Not the-city's-been-thirty-degrees warm. Warm between your legs, a low pulse of want that you did not decide to feel. It arrived without permission. It's been there a moment already and you didn't notice it arriving.
>
> That's the part that frightens you. Not what's happening up there. The wanting you didn't choose.

After:
> You're warm. Not from the heat. Warm between your legs, a low pulse that quickens with the sounds above.
>
> It isn't the people upstairs that scare you. It's that you want to be one of them.

Rationale: ¶3 now carries the involuntariness as pure body — the pulse quickening *with* the upstairs sounds shows her body answering on its own clock — so the naming clause ("you didn't decide to feel," "without permission," the nominalized "the wanting you didn't choose") is no longer telling the reader what they just felt. The fear is stated plainly and stops; the unchosen quality is left to inference (§3.3). (Meaning change: converted, not lost — "want," "unchosen," and "the people upstairs aren't the fear, my own response is" all survive, moved from tell to show + plain statement, per §3.6/§13.2. This is the sequence's thesis line (BLACKOUT §0/§4); confirm the new register before I match it sequence-wide.)

---

### `BLK-160 The pull` — [blackout.twee:308](../src/content/blackout.twee#L308)

**32. [AI-ism]** [§7.1 dash; §13.1 abstraction] — glass simile tail "a weight before the fact."

Before:
> The dark at the top of the stairs wants you in it. You know this the way you know a glass is full before you pick it up — a weight before the fact. Part of you is ready to go. Not the same part that makes decisions.

After:
> The dark at the top of the stairs wants you in it. You know it the way you know a glass is full before you lift it. Your body is already braced.

Rationale: keeps the homely physical simile (§7.4), drops the composed abstraction "a weight before the fact" and the dash; "Your body is already braced" shows the pre-cognition. (Meaning change: no.)

**33. [light call]** [§13.1 fragment-kicker — pattern A] — "Not the same part that makes decisions."

Before (now follows the card 32 rewrite):
> Part of you is ready to go. Not the same part that makes decisions.

After:
> Part of you is ready to go. Not the part that gets a vote.

Rationale: same dissociation beat, drier and less composed-aphoristic. (Light — the original is defensible; flag for your call.) (Meaning change: no.)

**34. [AI-ism]** [§7.1 dash ×2; §13.1 nominalization "the wanting"; §13.6 intra-echo] — success branch.

Before:
> Your feet stay. The want is real — you're not pretending it isn't — but the part of you that decides things is holding at the line, watching the wanting from outside like it belongs to someone else.

After:
> Your feet stay. The want is real. You're not pretending it isn't. But the part that decides is holding at the line, watching the rest of you strain toward the dark like it belongs to someone else.

Rationale: two dashes → periods; "watching the wanting" nominalization → "watching the rest of you strain toward the dark" (concrete); keeps the dissociation image "like it belongs to someone else." (Meaning change: no.) Failure branch ("Your foot finds the first stair.") untouched.

---

### `BLK-165 Two steps up` — [blackout.twee:339](../src/content/blackout.twee#L339)

**35. [hard]** [§12.2 continuity — tense] — both branches lapse into past tense; the rest of the sequence is present.

Before (climbed branch):
> Two steps up. Maybe three. The dark on the stairs was thicker than the lobby dark — warmer, and the want hit a different register the moment you crossed the bottom stair. Louder. More specific. Something moving from background noise to something with your name on it.
>
> Your hand found the matchbook in your pocket.
>
> You don't know if you put it there deliberately. You know you stopped.

After:
> Two steps up. Maybe three. The dark on the stairs is thicker than the lobby dark, and warmer, and the moment you crossed the bottom stair the want changed. Louder. More definite. Something that was background noise a breath ago, now with your name on it.
>
> Your hand is around the matchbook in your pocket.
>
> You don't know if you put it there on purpose. You know you've stopped.

Before (held branch):
> You didn't go. Some part of you that's been keeping score without your knowledge drew the line here, at the bottom stair, and it held.
>
> The want is still there. It hasn't left because you said no to it. But you're still at the line, and that feels like something worth noting.

After:
> You don't go. Some part of you that's been keeping score without your knowledge draws the line here, at the bottom stair, and holds it.
>
> The want is still there. Saying no didn't make it leave. But your feet are still where you left them, and that counts for something.

Rationale: present-tense to match the whole sequence; "a different register" (music-vocab, pattern C) → "changed / More definite"; "something… something" doubling removed; flatter, drier closers. (Meaning change: no.)

---

### `BLK-170 It's the dark itself` — [blackout.twee:362](../src/content/blackout.twee#L362)

**36. [AI-ism]** [§7.1 dash; §13.1 abstraction] — "comes into the absence."

Before:
> A stairwell light running continuously for five years goes out the moment the city loses power — and whatever that light was keeping at bay comes into the absence. Not a person. Not a smell. Not something that was up there before the power died.
>
> The dark is the thing.

After:
> A stairwell light that's run five years straight goes out the second the city loses power. Whatever it was holding back is loose now in the dark it left. Not a person. Not a smell. Not something that was up there before the power died.
>
> The dark is the thing.

Rationale: dash → period; "comes into the absence" → "loose now in the dark it left" (plainer). **"The dark is the thing." is deliberately KEPT** — the sequence's motif/spine line, now landing once (pre-echo removed at BLK-140, card 25). The negation triad is real enumeration ruling out mundane causes; kept. (Meaning change: no.)

---

### `BLK-175 The matchbook` — [blackout.twee:397](../src/content/blackout.twee#L397)

**37. [AI-ism]** [§7.1 dash] — damp-match dash.

Before:
> Nothing. The head skids and crumbles. The match is damp from the heat — your hands too, probably.

After:
> Nothing. The head skids and crumbles. The match is damp from the heat. Your hands too, probably.

Rationale: dash → period. ("Above you, sounds. The dark is patient." kept — motif, earns it.) (Meaning change: no.)

**38. [AI-ism]** [§13.1 narrator wink/foreknowledge — pattern B; §7.1 dash] — "This is the part where things go wrong."

Before:
> You tear off another match. Your hands aren't steady. This is the part where things go wrong — where the damp and the shaking combine into nothing, and whatever is happening upstairs happens to you too.

After:
> You tear off another match. Your hands won't hold still. If the damp wins, the stairwell stays dark and whatever's up there gets you too.

Rationale: "This is the part where things go wrong" is the narrator narrating the suspense; recast as her own in-the-moment stakes (conditional fear), which is tenser and in-voice. (Meaning change: no — the danger (damp + shaking = failure = she's taken) is preserved, relocated into her head.)

---

### `BLK-180 One match` — [blackout.twee:427](../src/content/blackout.twee#L427)

**39. [AI-ism]** [§7.1 dash; §13.6 "responds… responds"] — held-breath simile doubling.

Before:
> A small orange flame, not much bigger than a thumbnail. The stairwell responds to it the way a held breath responds to release — the dark that was wrong eases back, not all at once but like something withdrawing. The want in your body drops a register, then another.

After:
> A small orange flame, not much bigger than a thumbnail. The stairwell eases the way a held breath eases. The wrong dark pulls back, not all at once, more like something withdrawing. The want in your body steps down, then down again.

Rationale: dash gone; "responds… responds" doubling fixed; "drops a register" (music-vocab, pattern C) → "steps down, then down again." Keeps the held-breath image. (Meaning change: no.)

**40. [light call]** [§13.6 "confusion… confusion"] — repeat in the same sentence.

Before:
> Above you, the sounds change. Confusion where there wasn't confusion before.

After:
> Above you, the sounds change. Confusion where a moment ago there was none.

Rationale: removes the doubling. (Meaning change: no.) The three cosmetic-choice links are valid narration links — untouched.

---

### `BLK-185 The building exhales` — [blackout.twee:446](../src/content/blackout.twee#L446)

**41. [light call]** [§13.4 passive label; §4.1 period check] — "found themselves" + a period-phone sanity check.

Before:
> Then more of it. The sounds of people who've found themselves somewhere other than where they remember being. The specific shame of not knowing why your clothes are undone, or where your phone is, or who the stranger next to you is.

After:
> Then more of it. The sounds of people who don't know how they got where they're standing. The specific shame of not knowing why your clothes are undone, or where your phone is, or who the stranger next to you is.

Rationale: "found themselves" → plain. ("where your phone is" reads as a 2003 cell/landline — period-fine, not a smartphone tell; kept. The tricolon of shame is concrete and strong; kept.) (Meaning change: no.)

**42. [AI-ism]** [§13.1 parallel-construction kicker — pattern A] — the building/people coda.

Before:
> Nobody comes downstairs. Not yet.
>
> The building doesn't know how to be embarrassed, but the people in it do.

After:
> Nobody comes downstairs. Not yet.

Rationale: "The building doesn't know how to be embarrassed, but the people in it do" is a composed X-but-Y contrast tacked after a stronger, plainer line; "Not yet." is the better ending (restraint, dread-residue). (Meaning change: yes — drops the coda image; the shame is already carried by the prior paragraph.)

---

### `BLK-190 Before anyone thanks you` — [blackout.twee:465](../src/content/blackout.twee#L465)

**43. [light call]** [§13.6 "happened… happened" / "registered"] — closing line repeats.

Before:
> They don't know anything happened. Thirty metres away, something happened that you can't name, and nothing out here registered it.

After:
> They don't know anything happened. Thirty metres away something did, something you can't name, and the street never felt it.

Rationale: removes "happened… happened" and "registered" (cf. BLK-140); keeps the isolation-of-knowledge beat. The designed threshold-mirror ("The threshold you refused to cross upward is the one you now cross outward.") is KEPT — it's an intended structural mirror (BLACKOUT §7), not gratuitous. (Meaning change: no.)

---

### `BLK-200 The rest of the dark` — [blackout.twee:482](../src/content/blackout.twee#L482)

**44. [AI-ism]** [§7.1 dash; §13.1 meta-vocab "structure"/"interior monologue" — pattern C] — opening.

Before:
> The walk home takes an hour. You don't try to make sense of it — not out loud, not to the strangers walking next to you, not even as an interior monologue with a structure. Whatever that was, it doesn't have a structure you can impose on it.

After:
> The walk home takes an hour. You don't try to make sense of it. Not out loud, not to the strangers walking beside you, not even to yourself. Whatever that was, it doesn't come apart into reasons.

Rationale: dash gone; "interior monologue with a structure" / "a structure you can impose" is craft-talk in the prose — flattened to "to yourself" and "doesn't come apart into reasons." (Meaning change: no.)

**45. [AI-ism]** [§13.1 list-kicker — pattern A; calibration] — "You know three things."

Before:
> You know three things. There was something wrong in that stairwell. You stopped it. You don't smoke, and you were carrying matches.

After:
> There was something wrong in that stairwell. You stopped it. You don't smoke, and you were carrying matches.

Rationale: the "You know three things" scaffold is a composed enumeration frame; cut it and let the three plain sentences stand — the reader counts. (Meaning change: no.) The horizon/hospital-generator image ending is kept.

---

### `BLK-205 Still out` — [blackout.twee:500](../src/content/blackout.twee#L500)

**46. [AI-ism]** [§13.1 abstraction kicker — pattern A; calibration] — "a language that doesn't have it."

Before:
> You haven't told anyone about the walkup. You won't.
>
> The right word for what happened there hasn't arrived yet. You're not sure it exists. You've lived your whole life in a language that doesn't have it, and one night on the Danforth doesn't change that.

After:
> You haven't told anyone about the walkup. You won't.
>
> There's no word for what happened in there, not one anybody ever gave you. One night on the Danforth doesn't change that.

Rationale: flattens the "lived your whole life in a language that doesn't have it" abstraction while keeping the recruitment-hinge (she has no vocabulary for it yet — and "not one anybody ever gave you" quietly seeds that someone, i.e. Robert, will). (Meaning change: no — the no-word-for-it theme survives, plainer.) ("Ontario Hydro says probably today. Ontario Hydro said probably yesterday too." is kept — earned dry repetition.)

---

### `BLK-215 Recommendation` — [blackout.twee:546](../src/content/blackout.twee#L546)

**47. [AI-ism / voice]** [NPC-handler §6.2–6.3; §5.1 veneer; §7.1 dash] — the Flett memo reads generic-institutional, not like Robert. (Calibration sample — your favourite of the three.)

Before (the four `<p>` lines):
> Re: ▮▮▮ (subject, file 03-DAN-0814).
>
> Event classification: NYSE — focal condition, environmental vector, single-structure scope. Resolved without Branch intervention.
>
> Subject behaviour on CCTV: threshold approach, approx. 45-sec. observation pause, intervention, withdrawal. No panic, no escalation, no attempt to involve emergency services. Subject was, by chance or otherwise, equipped in a way that proved operationally useful.
>
> Recommend contact within 30 days. In my assessment the subject is field-eligible, pending evaluation. The quality we look for is not strength or immunity — it is the capacity to observe accurately under adverse conditions and to act on what is observed. The CCTV supports this.

After:
> Re: ▮▮▮ (subject, file 03-DAN-0814).
>
> Event classification: NYSE. Focal condition, environmental vector, single-structure scope. Resolved before we arrived, by the subject, with a book of matches.
>
> Subject behaviour on CCTV: approaches, holds at the threshold some forty-five seconds, goes inside, puts light into the stairwell, and leaves. No panic. No call to emergency services. She doesn't wait to be seen. By chance or otherwise, she was carrying the one thing the condition could not tolerate.
>
> Recommend contact inside thirty days. She is field-eligible, pending evaluation. What we look for is not nerve, and it is not immunity. It is the person who keeps seeing straight after the situation stops making sense, and then does the next plain thing. The footage is three minutes of exactly that.

Rationale: the dry comedy is the gap (§5.1) — clinical classification, then "Resolved… with a book of matches," straight face. "the next plain thing" and the plainness throughout are Robert's seam showing through the form (NPC-handler §6.3), rendered as register rather than a spoken "In my experience" pivot. Closes on the concrete callback to BLK-210's three minutes instead of the flat "The CCTV supports this." Two spaced em-dashes removed (the classification line and the "not immunity" line). The byline dash "— R. Flett, Branch" is left as-is (byline convention). **Held one line of restraint:** did NOT add "she doesn't smoke," because BLACKOUT §6 says the memo must not oversell the second (NYSE-nudge) reading of the matchbook; the underplayed "by chance or otherwise" carries it. (Meaning change: minor — Robert now names the matchbook, which BLK-210's CCTV extract redacts; the eyes-only memo stating plainly what the form coyly hid characterizes Robert and lands the "you lit a match" shorthand he uses later (BLACKOUT §7). Confirm you want that reveal; I can keep the light source unnamed here instead.) ≈118 words.

**Glossary note (propose, don't add):** `[! glossary candidate: NYSE]` — BLK-215 is the first appearance of "NYSE" in a Blackout playthrough, so §14.1's default is to wrap it `<<term "NYSE">>`. Recommendation: **leave it unwrapped here** — the bureaucratic opacity is the point at this beat, and a hover-definition inside the styled classified document undercuts it (you concurred in chat). Let INTRO carry the first wrap.

---

## Verification plan (Stage 4, after approval)

After applying approved cards:

```powershell
$env:TWEEGO_PATH = "_tools/tweego/storyformats"
& _tools/tweego/tweego.exe -o sizzle/output.html sizzle/src/
```

Then play CC-300 → select Blackout → through the flashback → CC-500, confirming mechanics untouched: `$player.incitingIncident = "the Toronto Blackout"`; `$nyse.influence` +1 (held) / +2 (climb); exactly one skill point granted by play pattern; re-entering the flashback stacks neither grant nor influence; footer clock reads Aug 14 2003 through the flashback and resets to Sept 12 2005 by CC-500; no single background render exceeds 200 words.
