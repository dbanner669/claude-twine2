# Style Guide Audit — 2026-06-12

Scope: the Woman with the Pale Eyes origin sequence (`src/content/pale.twee`, PALE-085–PALE-205, 21 passages). Third CC-400 origin pass, run through the [EDITORIAL-SWEEP.md](EDITORIAL-SWEEP.md) Stage 0–4 workflow against [STYLE-GUIDE.md](STYLE-GUIDE.md), mirroring the [2026-05-29 Blackout](STYLE-AUDIT-2026-05-29.md) and [2026-06-01 Manitoulin](STYLE-AUDIT-2026-06-01.md) audits. This draft ships with **17 `%%% CLAUDE-DRAFT %%%` placeholder blocks** the author deferred to me (directive at PALE-085), so this report is mostly **drafting** from [incidents/PALE.md](incidents/PALE.md), plus **directive-resolution** and **style/logic elevation** on the three human-drafted passages (PALE-110, PALE-115, PALE-120). Mechanics are untouched throughout.

## Summary

Overall health of the human-drafted core: **strong and load-bearing.** PALE-115's staccato dread ("she can. not. know. you're. there.") and PALE-120's flat command ("Crawl out of the room and get me another coffee.") are the sequence's spine and are kept verbatim. The plumbing is fully correct as shipped — dates verify (Aug 18, 2003 is a Monday; Aug 22 a Friday), the PALE-165 grant block implements the locked +1/+2 calibration exactly, all guards are set-once, night mode holds with no flip per design.

**28 cards** across 21 passages: **20 drafts** (placeholders → full prose), **1 hard** (orphaned comment tail at PALE-115 that renders on screen), **4 directive/logic fixes**, **3 light calls**, plus **1 glossary candidate** (propose only, report-side — not inserted into source).

Standards decisions carried from the read-gate and calibration exchanges (chat, this session):

1. **The prompt's +2/+3 influence figures and "consent-ambiguity" framing were copy-paste from the MAN brief** — the docs govern: PALE is **+1 base / +2 cap** (locked), and the horror is consent *obliterated*, not ambiguous. The PALE-165 code already implements this; untouched.
2. **Lodging map:** CSIS analyst lives close enough to walk home; RCMP / grad student / unemployed are **staying in this hotel** — they sleep upstairs from the alcove that night. Baked into PALE-085, PALE-100, PALE-180.
3. **The commanded staffer crawls out through a kitchen service door** (author decision), not past the PC into the public lobby. The same service door recurs at PALE-150 (extinguisher bracket) and PALE-175 (responder entry).
4. **The hotel is the Fairmont Château Laurier**, named in prose.
5. **PALE-130 explicitness: hotter** (author calibration). The tableau runs ≈165 words — over the 120 target, under the 200 ceiling; flagged in Scope notes for explicit sign-off.
6. **"Furniture that breathes" kept** (author calibration).
7. **Flett memo stays cagier** — no institutional certainty that "nobody resists"; Robert hedges ("I am not persuaded that resisting it was available"), because the Branch may legitimately not know.
8. **PALE-110's "empty room" becomes her perception, not narrator fact** (author calibration) — preserves the victims-read-as-furniture misdirection without the §13.4 fact/perception collapse.

Author revision round (chat, pre-application — all eight applied to the cards below before any source edit):

- **PALE-095:** the lobby is crowded with storm refugees; the piano no longer "plays to nobody" — it "keeps at it, mostly drowned out," and the check-in line runs three deep.
- **PALE-100:** "settled in like it pays rent" cut as a trite simile (the AI-ism class, not similes per se) — now "The storm has settled in to stay."
- **PALE-120:** "Office-blank." cut as unparseable; "nothing at all" carries the blankness alone.
- **PALE-145:** success/failure both rewritten for literal clarity (§3.7) — success now walks the chain (eyes → gap → a falling swing needs neither); failure states plainly that instinct hands her the same plan: something heavy, from behind the chair.
- **PALE-150:** "honest" cut from "a short, honest inventory" (classic AI filler).
- **PALE-170:** "a sound like surfacing" cut (no perceivable referent) — now "gasps, one long ragged pull of air."
- **PALE-175:** "Their shoulders are dry" cut — logically broken (four minutes through that downpour soaks anyone). The pre-positioned tell is now behavioural: they enter already knowing where the woman is and which doors need watching, and triage the PC last, "as if you've already been sorted."
- **PALE-180:** passage renamed `PALE-180 The drive home` → **`PALE-180 The way home`** (author-directed exception to the passage-name freeze); the PALE-175 link target updated to match.

### Systemic patterns

- **A. Perception ladder (deliberate, preserved).** The victims must resolve gradually: PALE-105 "hard to say if anyone's in there at all" → PALE-110 "as far as you can tell, the only person…" → PALE-115 "more people around her" → PALE-130 the full tableau. Every draft keeps the camera's knowledge inside hers (§13.4); nothing is narrator-certified early.
- **B. Eyes-down discipline as camera grammar.** From PALE-115 on, the prose never describes the woman's face until the mirror branch (glimpse, reflected) and PALE-160 (full lock, "pale as milk in water"). A cover-branch player meets the pale eyes for the first time at the same instant the PC does. The existing link "You make yourself not look up." pays this off.
- **C. Plant-and-pay objects.** PALE-095 plants the luggage cart and the piano; PALE-120 plants the service door; PALE-150 spends all three (cart as weapon option, door as extinguisher bracket location), PALE-105 spends the piano (its absence past the arch), PALE-175 spends the door again (responder entry). No object appears at need without a prior beat.
- **D. Em-dashes: zero added.** The three human-drafted passages contain none; no draft introduces a spaced em-dash. The §7.1 reduce-don't-strip tension from the BLK pass doesn't arise here. The PALE-205 byline dash follows the BLK-215 convention.
- **E. Cross-incident echo avoidance (§13.6).** Three near-echoes of shipped BLK lines were caught at draft time and steered around: the "oh god" release line (BLK-185) → "off, off, get off" at PALE-170; "the calm is the wrong part" (BLK-150) → "was nothing at all" at PALE-120; "the part that gets a vote" (BLK-160 audit) → "another person's sentence was the truest thing in your body" at PALE-180.

### Confirmed skipped per scope (mechanics — untouched by every card)

- All `<<silently>>` blocks: `<<setDate 2003 8 18>>` / `<<setDate 2003 8 22>>`, every `<<set $header.*>>` (including the alcove↔lobby location bounces — they track her position at the arch boundary and are correct).
- The PALE-165 grant block in full: `$nyse.influence` +1/+2 math, `paleInfluenceGranted` / `paleSkillGranted` set-once guards, the Agent/Academic/Composure/Confrontation grant ladder.
- All four `<<skillCheck>>` calls, DCs (7/8/7/9), and modifier expressions; the `paleRuleRead` / `paleUnseen` / `paleGazeGrazed` / `paleLoopholeReasoned` / `paleCommandHeld` / `paleCommandBitten` flag sets.
- Every passage **name** and link **target**; the PALE-125 / PALE-140 `<<link>>`/`<<replace>>` choice structures; the PALE-205 → CC-500 link and its `incitingIncident` + `setDate 2005 9 12` setters.
- **Passage-name note:** `PALE-180 The drive home` described a walk (CSIS) or an elevator ride (guests); the author directed a rename to **`PALE-180 The way home`** in the revision round — the one sanctioned exception to the passage-name freeze. The PALE-175 link target was updated in the same edit; no other passage references PALE-180.
- I add only prose, background-variant prose, and two link-text recasts (cards 02, 06); I remove only the resolved `[! drafting deferred…]` directives, the `%%% CLAUDE-DRAFT %%%` blocks being replaced, and the orphaned comment tail (card 08).

### Scope notes

- **Word counts (longest single render, post-draft):** PALE-085 ≈ 102 (unemployed) · 090 ≈ 85 · 095 ≈ 95 · 100 ≈ 100 · 105 ≈ 85 · 110 ≈ 75 · 115 ≈ 70 · 120 ≈ 115 (with success text) · 125 ≈ 135 (main + mirror branch in one render) · **130 ≈ 165** · 135 ≈ 120 · 140 ≈ 130 (main + slip branch) · 145 ≈ 105 · 150 ≈ 95 · 155 ≈ 85 · 160 ≈ 110 · 165 ≈ 75 · 170 ≈ 100 · 175 ≈ 100 · 180 ≈ 105 (CSIS) · 200 ≈ 140 visible mono · 205 ≈ 135 visible mono. **None exceed the 200 ceiling.** PALE-130 (165) is the only one materially over the 120 target — it is the explicit heart and was calibrated "hotter" this session; flagging rather than splitting, since splitting the tableau would dissipate it. Say the word and I'll tighten to ~120.
- **PALE-200's "nine affected persons"** intentionally exceeds the count the PC itemizes (five in the tableau plus the staffer) — the Branch counted people she never resolved from cover. Continuity-safe; flagged so it reads as intent, not error.
- **Glossary:** PALE-090 reuses the existing `OC Transpo` key (unilateral reuse is in-scope). **[! glossary candidate: Château Laurier — grand railway hotel beside Parliament; first appearance PALE-085; the register (national-landmark hotel, not a Best Western) is load-bearing and non-Canadian readers may miss it.]** Proposed report-side only; not inserted into source. Per the BLK-215 precedent, `NYSE` in the PALE-200/205 documents stays **unwrapped** — bureaucratic opacity is the point at this beat; INTRO carries the first wrap.
- **Tag candidates:** none minted, per PALE.md §8 defaults. The two candidate forks (command-bite at 160; reasoned-vs-instinct at 145) are already captured by existing flags if later content wants them.

---

## Findings

### `PALE-085 A reason to be in Ottawa` — [pale.twee:1](../src/content/pale.twee#L1)

**01. [draft]** [PALE.md §2/§3; resolves `[! drafting deferred to claude…]`] — placeholder → full passage. Four background variants establish the lodging map (decision #2) and name the Château Laurier. *(Approved as Sample A in calibration; reproduced for the record.)*

After (prose body):

> Ottawa goes home at five and takes the sidewalks with it. By evening the government blocks are quiet enough to hear your own footsteps, and the day's heat is still coming up off the stone. Over the river, the sky has spent the last hour stacking up something green-black and serious.
>
> `<<if $player.background eq "RCMP constable">>`Three days of a policing conference at the Château Laurier, and tonight you finally got out for a dinner that wasn't banquet chicken. Worth it. The hotel's a few blocks back, and you're full and slow and in no hurry.`<<elseif $player.background eq "CSIS analyst">>`An all-day interdepartmental session in one of the Château Laurier's meeting rooms: slide carousels, weak coffee, a binder you signed for and will sign back in tomorrow. You stayed at the reception exactly as long as politeness required. Home is a twenty-minute walk, most of it pretty.`<<elseif $player.background eq "grad student">>`You promised yourself one real trip before the thesis ate the rest of the summer, and Ottawa in August is keeping its end: the gallery this morning, the canal this afternoon, a hotel room nicer than you can strictly justify. You've decided not to think about the Visa bill until September.`<<else>>`You booked this trip in March, back when you had a job. The room at the Château Laurier was non-refundable. So here you are: unemployed, on vacation out of spite, walking back to the nicest hotel you'll ever sleep in.`<</if>>`
>
> The first drops come down fat enough to feel personal.

Rationale: table-setting per design — ordinary day, dry interior voice, no wrongness. RCMP/grad/unemployed are walking *back to* the hotel; CSIS is walking home past it; the storm does the convergence. Link text unchanged. (New content. Longest render ≈102, unemployed.)

---

### `PALE-090 The sky opens up` — [pale.twee:19](../src/content/pale.twee#L19)

**02. [draft + light call]** [PALE.md §2; §14.1 term reuse] — placeholder → full passage, universal; plus a one-word link-text fix.

After (prose body):

> The sky doesn't bother with a warning. One fat drop, two, and then the whole thing comes down at once, a white roar of water that turns Rideau Street into a riverbed.
>
> Half a block ahead an umbrella goes inside out, and its owner gives up on it without breaking stride. Awnings fill. An `<<term "OC Transpo">>` bus sighs past, windows fogged solid.
>
> You run, one arm up over your head like that's ever helped anyone, the rain finding the back of your collar anyway.

Link text: "The nearest dry doorway is **a hotel lobby**." → "The nearest dry doorway is **the hotel's**." — three of four backgrounds are *staying* there and CSIS just left it; "a hotel lobby" reads like she's never seen the building. (Meaning change: no. Target untouched.)

Rationale: mundane scramble per design; reuses the existing `OC Transpo` glossary key. (New content. ≈85.)

---

### `PALE-095 Into the lobby` — [pale.twee:36](../src/content/pale.twee#L36)

**03. [draft]** [PALE.md §2] — placeholder → full passage, universal. Plants the luggage cart (spent at PALE-150) and the piano (spent at PALE-105).

After (prose body):

> The doorman has given up sorting arrivals into anything orderly. You come through in a knot of strangers, everyone dripping, everyone laughing the way people laugh when the weather has made fools of the whole street at once.
>
> Inside is brass and warm light and the smell of wet wool. A check-in line three deep. A bellhop towelling down a luggage cart. Somewhere behind the columns a piano keeps at it, mostly drowned out. The rain is a long held note against the glass, and the crowded lobby hums along underneath it, ordinary as a Monday.

Rationale: the design's "everything ordinary" beat, with the two plants. It *is* Monday. Link text "You cross out of the rain." kept — she's just inside the doors; PALE-100 is the deeper crossing. (New content. ≈95.)

---

### `PALE-100 Out of the rain` — [pale.twee:53](../src/content/pale.twee#L53)

**04. [draft]** [PALE.md §2 — the hinge] — placeholder → full passage. Gives her a reason to head for the lounge (the alcove is her *destination*, which is worse), with a two-line lodging variant.

After (prose body):

> The storm has settled in to stay. Half the lobby is waiting it out with you: wet couples by the windows, a man arguing gently with the concierge about a taxi that isn't coming.
>
> `<<if $player.background eq "CSIS analyst">>`Home is twenty minutes of open sky away. Not in this.`<<else>>`Your room is upstairs, but the evening doesn't feel finished, and your shoes are already ruined.`<</if>>` A drink, then. The lounge is off the back of the lobby, past the elevators, and a wingback chair beats standing here dripping on the marble.
>
> Crossing toward it, somewhere between the front desk and the elevators, the lobby's hum goes uneven on you. Nothing you could point to. Yet.

Rationale: the normality-to-wrong hinge per design ("the room's even, normal hum starts to feel uneven"), kept subjective. The drink motive solves why a hotel guest lingers downstairs instead of going up. (New content. Longest render ≈100.)

---

### `PALE-105 The quiet corner` — [pale.twee:70](../src/content/pale.twee#L70)

**05. [draft]** [PALE.md §2; pattern A perception ladder] — placeholder → full passage.

After (prose body):

> The lounge opens off the back of the lobby through a wide arch, and you're three steps from it when you place what's bothering you. Sound. There isn't any.
>
> The lobby behind you is all storm-talk and luggage wheels and the piano. Past the arch: nothing. No conversation, no glasses, no newspaper. Lounges are never silent. Even empty ones have a clock.
>
> Through the arch you can make out armchairs, unlit lamps, curtains drawn to the floor. Hard to say if anyone's in there at all.

Rationale: the noise-drop beat; "hard to say if anyone's in there" keeps the perception ladder intact below PALE-110's misread. The author's link "You look from cover." kept. (New content. ≈85.)

---

### `PALE-110 Too orderly` — [pale.twee:87](../src/content/pale.twee#L87)

**06. [logic + light]** [§13.4 perception vs. fact; grammar] — *approved as Sample B in calibration.* Three fixes on the author's prose; structure and voice his throughout.

Before:

> This quiet corner around behind the lobby is strange. There should be more people here.
>
> The room is banked by large windows, all of which are covered by deep, long curtains, light only peeking in at the edges. The sound of the pounding rain creating a wall of soft noise from the outside.
>
> The only occupied seat in the dark empty room is a woman sitting next to a grand fireplace near the back.

After:

> This quiet corner behind the lobby is strange. There should be more people here.
>
> The room is banked with tall windows, every one curtained to the floor, what's left of the evening only getting in at the edges. The rain against the glass makes a wall of soft noise.
>
> As far as you can tell, the only person in the dark room is a woman seated by the grand fireplace at the back.

Rationale: "around behind" garbled; the rain sentence had no main verb; "the only occupied seat in the dark **empty** room" stated as narrator fact what PALE-115 contradicts — recast as her read ("as far as you can tell"), so the victims-as-furniture misdirection lands as *her misreading the room* rather than the prose contradicting itself. (Meaning change: no — the empty-read survives, relocated into her perception.)

---

### `PALE-115 Pale eyes` — [pale.twee:104](../src/content/pale.twee#L104)

**07. [hard]** [rendering bug] — orphaned `%%% END %%% */` at line 115 has no opening `/*`, so it renders on screen as literal text. Delete the line.

**08. [light call]** — "high backed chair" → "high-backed chair." Everything else verbatim, including "And she can. not. know. you're. there." — the sequence's heartbeat, untouched.

(Meaning change: no.)

---

### `PALE-120 The rule` — [pale.twee:121](../src/content/pale.twee#L121)

**09. [directive/logic]** [author decision #3 — kitchen service door; §3.7 clarity — the precondition must be observable] — the crawl re-routes through a service door, and the prose now *shows* the eye-contact precondition the success branch claims she saw.

Before:

> She's speaking to someone next to her.
>
> "Crawl out of the room and get me another coffee."
>
> A woman dressed in a hotel uniform scurries on her hands and knees past you.

After:

> She's about to speak to someone beside her chair. First she crooks one finger and waits, and waits, until the person's face comes up to hers.
>
> "Crawl out of the room and get me another coffee."
>
> A woman in a hotel uniform drops to her hands and knees and goes, fast, like it's a race, through a service door on the far wall. A swing of kitchen light, a clatter of dishes, gone. Her expression, in the half-second you had it, was nothing at all.

Rationale: the command line is yours, verbatim. The crook-and-wait is the observable referent for the success inference (without it, "it came from her eyes" is unearned); the service door is your call from calibration and gets re-spent at PALE-150 and PALE-175. ("Office-blank." cut in the revision round — unparseable; "nothing at all" carries the blankness and steers around BLK-150's "the calm is the wrong part," pattern E.) (Meaning change: yes — crawl route changes per your decision; the like-it's-a-race speed and blank face carry the obedience horror the close brush used to.)

**10. [light call]** [§3.3; §13.5 subjective] — success/failure result texts recast in her voice; flags and links untouched.

Before (success):
> You had enough of an angle to tell: Whatever power the strange woman used to control this hotel staffer came from the woman's eyes.

After (success):
> She waited. That's what you saw: she didn't speak until the staffer looked at her. The order rode the look. It's the eyes.

Before (failure):
> Whatever power the strange woman used to control this hotel staffer is a mystery to you.

After (failure):
> However she's doing it, you didn't catch it. A word, and a grown woman went to the floor like it was her own idea. You're missing the part that matters.

Rationale: success now points at the concrete thing she saw (the waiting), per §3.7's referent test; failure keeps the mystery but lands the horror ("like it was her own idea" — no hesitation is the visible wrongness). (Meaning change: no.)

---

### `PALE-125 The mirror` — [pale.twee:149](../src/content/pale.twee#L149)

**11. [draft]** [PALE.md §2/§5; mirror as one-time device] — main placeholder → full prose.

After (prose body, above the choice block):

> What you have is slivers: a shoulder, the woman's hand, her feet up on something that breathes. You need the whole room, and you need it without walking into it.
>
> There's a mirror. Gilt-framed, tall as a door, hung over the sideboard on the lobby side of the arch, and angled to hold most of the alcove in one piece.
>
> Something in you is certain the glass cuts both ways. If you can see her eyes in it, her eyes can see yours.

Rationale: "something that breathes" advances the furniture misread one notch without resolving it; the reflected-gaze danger is her provisional certainty (§3.7 exception), never narrator-confirmed rule. Choice link texts kept (yours, both valid sentence forms). (New content.)

**12. [draft]** — mirror branch placeholder → prose. The reflected-gaze danger dramatized; first partial sight of the pale eyes.

After (branch body):

> You ease along the sideboard and let the glass do the looking.
>
> It's all there at once, small and complete: the chair, the people arranged around it, the stillness. Then her head turns a degree, and your stomach drops, and the pale eyes pass across the mirror without catching, a lighthouse sweeping past a boat it doesn't know about.

(New content. Link text kept.)

**13. [draft]** — cover branch placeholder → prose.

After (branch body):

> You stay in the seam between curtain and arch and build the room a glimpse at a time: a bare shoulder, a kneeling back, the woman's hand rising and falling at her mouth. Slow work. Each look costs seconds, and buys you inches.

Rationale for the pair: clinical-vs-cautious self-image per PALE.md §5; same destination, different route. Cover-branch players don't see the eyes until PALE-160 (pattern B). (New content. Link text kept.)

---

### `PALE-130 The arrangement` — [pale.twee:184](../src/content/pale.twee#L184)

**14. [draft]** [PALE.md §2 — the explicit heart; §11.1–11.2 full register; §10.5 victims are people; calibrated **hotter** this session] — placeholder → full prose.

After (prose body):

> The footrest is a man. Naked, on all fours, her stockinged heels crossed on the small of his back. His glasses are still on. He's hard, flushed dark, and no part of him moves.
>
> Beside the chair a younger woman kneels with a dish of cut melon, naked except for a conference lanyard, lifting a piece to the woman's mouth, waiting, lifting the next. Her nipples are stiff, and her thighs, where she kneels, are wet.
>
> On the other side a man stands at attention in half a suit, trousers pooled at his ankles, cock rigid, her closed umbrella hooked over it, still dripping rain onto the carpet.
>
> Behind the chair, a man and a woman stopped mid-fuck over the arm of a sofa, him buried in her to the root, both faces slack, eyes on nothing.
>
> No ropes. No one holding anyone down. Just a seated woman, and people arranged around her like furniture that breathes.
>
> You still haven't looked at her face.

Rationale: every design-doc element present (footrest, fruit-bearer, umbrella hooked on an erection, others mid-act, blank and silent); humanity carried by the glasses, the lanyard, the dripping umbrella. The bodies' arousal under command is the hotter dial *and* the horror — their bodies are answering too. "No ropes" is the §3.7 minimum clarity (the reader must know nothing physical holds them). Camera stays below her face so the existing link pays off. §11.10 audit: *wet* ×1, no *slick/heat/pulse/throb*. (New content. ≈165 — see Scope notes.)

---

### `PALE-135 Don't look up` — [pale.twee:200](../src/content/pale.twee#L200)

**15. [draft]** — main placeholder → prose: the sweep, and the pull of being noticed.

After (prose body, above the check):

> The woman's head begins to turn. Not at a sound. Not at you. A slow sweep of the room, the way a searchlight doesn't need a reason.
>
> Your eyes want to come up and meet it. That's the part that scares you: being looked at pulls, and something in you wants to answer.

(New content.)

**16. [draft]** — success/failure placeholders → prose. Flags and links untouched.

After (success):
> You put your eyes on the carpet, flatten into the curtain's shadow, and count. Four. Five. When you risk the angle again, her face is turned away and her hand is out for the next piece of fruit.

After (failure):
> You're half a beat slow. The sweep crosses the space where you are and something snags, the way a nail catches a sleeve. Not a lock. The edge of it only. But for that half-second your whole body leans toward being seen, and you have to drag yourself back behind the curtain.

Rationale: the failure is the graze the plumbing already prices in (`paleGazeGrazed` → +1 influence at 165); written as a body answering an invitation, not a will failing — she is never strong-willed, only lucky with angles. (New content.)

---

### `PALE-140 She can't just walk out` — [pale.twee:235](../src/content/pale.twee#L235)

**17. [draft]** — main placeholder → prose: why she's locked in.

After (prose body, above the choice block):

> Out, then. The thought arrives sounding like a plan: back through the arch, across the lobby, gone, and let tomorrow decide what tonight was.
>
> Except the arch is in her line, and the lobby is forty feet of bright, open marble.
>
> And there are the people. The glasses. The lanyard. All evening the lobby has walked past that arch without noticing, and if it hasn't noticed by now, nobody is coming.

(New content. Choice link texts kept.)

**18. [draft]** — slip-away branch placeholder → prose.

After (branch body):

> You make it two steps toward the arch before the math does itself: ten seconds in her line of sight, and a word travels faster than you do.
>
> You come back into the shadow. There's no version of leaving that doesn't pass through her eyes.

Rationale: convergence framed as *trapped into it* vs. the stop-it link's *choosing it*, per PALE.md §5; "nobody is coming" is earned by the evening of nobody noticing, not asserted. (New content.)

---

### `PALE-145 The loophole` — [pale.twee:263](../src/content/pale.twee#L263)

**19. [draft]** — main placeholder → prose: the threshold of the insight.

After (prose body, above the check):

> It has to end here, then, and none of the normal endings apply. You can't argue with her. You can't shout for help without volunteering whoever comes running. You can't even look at her long enough to aim.
>
> One try. Blind. Think.

(New content.)

**20. [draft]** — success/failure placeholders → prose. The reasoned-vs-instinct fork. *(Both rewritten for literal clarity in the revision round — the first cut was too compressed to parse.)*

After (success):
> The staffer. The woman waited for her eyes before she spoke, and even then there was a gap, half a breath between the word and the body obeying. So the command needs two things: her eyes on you, and a moment to take hold.
>
> A swing that's already falling gives her neither. Start it from behind her chair, where she can't see you. By the time she can, it has to be too late to stop. Too late for her, and too late for you.

After (failure):
> You never do work it out, not in words, not in anything you could explain afterward. Your body skips to the end: it wants something heavy in your hands, and it wants you behind that chair, where she can't see you. The plan arrives whole, from somewhere below thinking, and you go with it.

Rationale: success walks the literal chain — the observed precondition (eyes), the observed latency (the gap), and the conclusion (a falling swing needs neither, so swing from behind, irrevocably — too late even for *her* to stop, which is the commit). Failure states plainly that instinct hands her the same plan. Both recruitment-worthy per design; they differ in texture and which skill earns the +1. (New content.)

---

### `PALE-150 Something heavy` — [pale.twee:296](../src/content/pale.twee#L296)

**21. [draft]** — placeholder → prose: the arming inventory and the blind lane. All four existing links untouched.

After (prose body):

> The lounge and the lobby between them offer a short inventory.
>
> A fire extinguisher in its bracket beside the service door, red and fat and heavier than it looks. A side chair by the writing desk, oak, liftable. The bellhop's luggage cart, abandoned mid-lobby with someone's garment bag still on it. A brass stanchion by the arch, top-heavy as a sledgehammer.
>
> And one blind lane: along the curtains, behind the wing of her chair, where the high back will hold her eyes off you until you're inside arm's reach.

Rationale: every option was planted (cart at 095, service door at 120, arch and curtains throughout); the wingback's high back is the concrete blind angle the design needs. (New content. ≈95.)

---

### `PALE-155 The point of no return` — [pale.twee:315](../src/content/pale.twee#L315)

**22. [draft]** [§10.5 — humour-free dread peak] — placeholder → prose: the commit.

After (prose body):

> You pick a point on the back of her chair, shoulder height, and you don't look anywhere else.
>
> The lane along the curtains is six steps. You take them slow, weight settling before each one, the weight in your hands the only thing in the world. The rain keeps its noise up. Under it, close now, the small wet sound of chewing on the other side of the wingback.
>
> Last step. You set your feet the way you'd set them on ice.
>
> Both arms. Up.
>
> You are already swinging.

Rationale: "the weight in your hands" deliberately doesn't name the object (the PALE-150 choice is cosmetic and unnamed downstream); the chewing is the mundane-horror detail at arm's reach. Ends at the irreversible instant so the existing link "The woman looks up." lands as the cut. (New content. ≈85.)

---

### `PALE-160 "STOP."` — [pale.twee:331](../src/content/pale.twee#L331)

**23. [draft]** — main placeholder → prose: the lock and the command.

After (prose body, above the check):

> Something gives you away. Air, shadow, the creak of your own grip; you'll never know what.
>
> Her face comes around the wing of the chair. Her eyes find yours, pale as milk in water, and her mouth opens without any hurry at all.
>
> "STOP."

(New content. First full sight of the eyes — pattern B.)

**24. [draft]** — success/failure placeholders → prose. The spine: she never resists; physics wins on every path.

After (success):
> The word lands somewhere your ears have nothing to do with, and it is true the way gravity is true: you must stop.
>
> But the swing stopped being yours half a second ago. There's nothing left in it for you to take back. Your arms aren't asking.

After (failure):
> The word closes around you like a hand. And you stop. Everything that's still yours stops: breath, thought, grip.
>
> The swing isn't yours anymore. It finishes without you.
>
> For one impossible second, you are a thing that obeys, all the way down. You understand the footrest completely.

Rationale: both branches land the command fully (PALE.md §0 — any version where she shakes it off is wrong). Success = the swing has already left her ownership; failure = full bite, and "you understand the footrest completely" is the empathy-of-horror the sequence has been building since 130. (New content.)

---

### `PALE-165 Impact` — [pale.twee:365](../src/content/pale.twee#L365)

**25. [draft]** — placeholder → prose. The grant block above it untouched.

After (prose body):

> The sound is heavier than you expected, and quieter. One deep thud. The coffee cup rings against its saucer.
>
> She goes sideways out of the chair and doesn't put her hands out. The carpet takes her with a sound like a dropped coat.
>
> Quiet, then. Rain, your own blood in your ears, nothing else. You can't remember deciding to stop swinging.

Rationale: "doesn't put her hands out" is the concrete unconsciousness; the coffee cup is the staffer's errand coming home. (New content. ≈75.)

---

### `PALE-170 The room comes back` — [pale.twee:401](../src/content/pale.twee#L401)

**26. [draft]** [§10.5 — personhood returns] — placeholder → prose.

After (prose body):

> The umbrella hits the floor first.
>
> Then the man it was hanging from gasps, one long ragged pull of air, and grabs for his waistband. The kneeling woman looks at the dish in her hands as if it has just appeared there, sets it down, and starts to shake. Behind the chair a woman's voice says "off, off, get off," and there's the fast, fumbling sound of two people coming apart.
>
> The footrest man crawls two steps, stops, and folds down onto the carpet with his glasses still on, crying without any noise.
>
> Nobody looks at the woman on the floor. Nobody looks at you.

Rationale: each release echoes its tableau detail (umbrella, dish, glasses); the humiliation is theirs and reads as horror; she isn't thanked, per design. (New content. ≈100.)

---

### `PALE-175 They were already coming` — [pale.twee:417](../src/content/pale.twee#L417)

**27. [draft]** [PALE.md §7 — the signature aftermath] — placeholder → prose. Pre-Branch voice; she clocks the apparatus without naming it.

After (prose body):

> They come through the lobby arch and the service door at the same time, six of them, in plain suits, with laminated cards that say something that isn't police. Nobody runs. Two go to the woman on the floor, one to each of the others, voices low and kind and completely unsurprised.
>
> Nobody called them. There wasn't time; the lobby out there is still arguing about taxis. But they come in already knowing where the woman is and which doors need watching, and they get to you last, as if you've already been sorted.
>
> A woman your mother's age asks you four quiet questions, all of them the right ones, and writes nothing down.

Rationale: the pre-positioned tell is behavioural — no call, no questions about what happened, entry through both doors, the room already triaged with the witness sorted last. ("Their shoulders are dry" cut in the revision round — logically broken, since even a four-minute response through that downpour soaks anyone.) The two-door entry re-spends the service door. No NYSE vocabulary; she leaves knowing only that something organized exists. The existing link "They tell you to go home." delivers the dismissal, so the prose stops before it. (New content. ≈100.)

---

### `PALE-180 The way home` (renamed from `The drive home`) — [pale.twee:433](../src/content/pale.twee#L433)

**28. [draft + rename]** [PALE.md §7 interior scar; lodging decision #2; author-directed rename] — placeholder → prose; passage renamed to fit both routes (CSIS walks home; the other three ride the elevator up inside the same building). The PALE-175 link target updated to match.

After (prose body):

> `<<if $player.background eq "CSIS analyst">>`The storm has worn itself out by the time you're halfway home, and the streets have that rinsed, emptied look. You walk the whole way without meeting a single pair of eyes, and you only notice you're doing it at your own front door.`<<else>>`Your room is four floors up. You share the elevator with a couple still laughing about the rain, and you watch the brass doors the whole ride, and you don't know you're avoiding their eyes until they get out.`<</if>>`
>
> In bed, you keep arriving at the same half-second and stopping. Not the swing. Not the woman folding onto the carpet. The word. STOP, and everything in you agreeing.
>
> For one second, another person's sentence was the truest thing in your body.
>
> You leave the bathroom light on. You don't look at the mirror.

Rationale: the scar is the designed residue verbatim-adjacent ("another person's sentence becoming true inside her"), and the avoided eyes / avoided mirror are the sensitivity PALE.md §8 wants as prose texture, already in motion. Works for both 160 outcomes — the command landed on every path. (New content. Longest render ≈105.)

---

### `PALE-200 Field report` — [pale.twee:449](../src/content/pale.twee#L449)

**29. [draft]** [PALE.md §7; mirrors BLK-210 document markup] — placeholder → full document. Clinical NYSE voice; mechanism documented, never explained.

After (full passage body, replacing the placeholder):

> ```
> <div style="background:var(--sz-ink-3);border:1px solid var(--sz-rule);padding:28px;position:relative;margin-top:8px">
> <span class="stamp" style="position:absolute;top:14px;right:14px;transform:rotate(-8deg)">Classified</span>
> <div class="eyebrow --brick" style="margin-bottom:14px">Incident File · 03-OTT-0818 · Extract</div>
> <div style="font-family:var(--sz-f-mono);font-size:12px;line-height:1.8;color:var(--sz-cream-soft)">
> <p>INCIDENT DATE: 2003.08.18. Occurrence report, Ottawa duty element, filed 2003.08.19.</p>
> <p>Response to <span class="redact" style="width:110px"></span>, downtown Ottawa, 21:40 hrs. Interval, alert to arrival: four minutes. Subject (F, age indeterminate) secured without resistance, unconscious on arrival, transferred to <span class="redact" style="width:80px"></span>. Ocular presentation consistent with file <span class="redact" style="width:60px"></span>.</p>
> <p>Verbal compliance influence documented in effects only; mechanism not explained. Affected persons: nine. Treated on site, released. Recall absent or fragmentary. Hotel records for the evening removed; registry page substituted.</p>
> <p>One civilian witness retains complete recall. Interviewed on site, released pending assessment. See attached recommendation. Classification: <span style="color:var(--sz-brass);font-style:italic">pending review</span>.</p>
> </div>
> </div>
> ```

Rationale: "Interval, alert to arrival: four minutes" and "Ocular presentation consistent with file ▮▮▮" let the Branch know more than it says (priors exist; she never learns this). "Nine" affected persons exceeds her count on purpose — see Scope notes. "Pending review" mirrors BLK-210's non-resolution (§13.5). `NYSE` unwrapped per the BLK precedent. (New content. ≈140 visible mono.)

---

### `PALE-205 Recommendation` — [pale.twee:466](../src/content/pale.twee#L466)

**30. [draft]** [NPC-handler voice; mirrors BLK-215; calibrated **cagier** this session] — placeholder → full document. Robert hedges what the Branch may genuinely not know.

After (full passage body, replacing the placeholder; the `<<link>>` block below it untouched):

> ```
> <div style="background:var(--sz-ink-3);border:1px solid var(--sz-rule);padding:28px;position:relative;margin-top:8px">
> <span class="stamp" style="position:absolute;top:14px;right:14px;transform:rotate(5deg)">Eyes Only</span>
> <div class="eyebrow --brick" style="margin-bottom:14px">Recruitment Recommendation · R. Flett · 2003.08.22</div>
> <div style="font-family:var(--sz-f-mono);font-size:12px;line-height:1.8;color:var(--sz-cream-soft)">
> <p>Re: <span class="redact" style="width:130px"></span> (witness, file 03-OTT-0818).</p>
> <p>Event classification: NYSE. Subject-anchored, verbal compliance vector. The duty element did the containment; the resolving was done before they reached the lounge, by the witness, with the nearest heavy thing she could lift.</p>
> <p>Witness behaviour, per debrief and her own account: she worked out the operating condition from cover, kept her eyes to herself for the better part of half an hour, and committed to a swing she could not call back before the subject could tell her to stop. The subject did tell her to stop. The swing was already past arguing with.</p>
> <p>She did not resist the order. I am not persuaded that resisting it was available, to her or to anyone. She beat its timing, and timing can be trained. She survived a direct command on a technicality; I would not plan on that luck twice. Recommend contact inside thirty days. Field-eligible, pending evaluation.</p>
> <p style="margin-top:14px">— R. Flett, Branch</p>
> </div>
> </div>
> ```

Rationale: "the nearest heavy thing she could lift" absorbs the PALE-150 cosmetic choice without a conditional; "I am not persuaded that resisting it was available" is Robert's precise hedging (NPC-handler: says exactly what he means, feels like absence of information when evasive) — his read, not institutional certainty, per calibration. "I would not plan on that luck twice" is the PALE.md §7 relationship seed. Byline dash per BLK-215 convention. (New content. ≈135 visible mono.)

---

## Verification plan (Stage 4, after approval)

After applying approved cards:

```powershell
$env:TWEEGO_PATH = "_tools/tweego/storyformats"
& _tools/tweego/tweego.exe -o sizzle/output.html sizzle/src/
```

Then play CC-300 → select Pale Eyes → through the flashback → CC-500, on at least one walk-home (CSIS) and one hotel-guest background, confirming mechanics untouched: `$player.incitingIncident = "the Woman with the Pale Eyes"`; `$nyse.influence` +1 base, +2 only on a failed graze (135) or failed spine hold (160); exactly one skill point granted by play pattern; re-entering the flashback stacks neither grant nor influence; footer clock reads Mon Aug 18 2003 through the scene, Fri Aug 22 2003 on the documents, and resets to Sept 12 2005 by CC-500; no single background render exceeds the 200-word ceiling; the PALE-115 stray `%%% END %%%` no longer renders; the renamed `PALE-180 The way home` resolves from PALE-175 with no Tweego link warnings.
