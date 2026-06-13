# Style Guide Audit — 2026-06-13

Scope: the Wet Dog Smell origin sequence (`src/content/wds.twee`, WDS-085–WDS-205, 21 passages). Fourth and final CC-400 origin pass, run through the [EDITORIAL-SWEEP.md](EDITORIAL-SWEEP.md) workflow against [STYLE-GUIDE.md](STYLE-GUIDE.md), mirroring the [BLK](STYLE-AUDIT-2026-05-29.md) / [MAN](STYLE-AUDIT-2026-06-01.md) / [PALE](STYLE-AUDIT-2026-06-12.md) audits. Every passage ships as a `%%% HUMAN-DRAFT %%%` placeholder and **all 21 are drafted by the agent in this pass** (author direction), at the full explicit register — WDS is the most explicit of the four sequences and that is maintained. Mechanics are untouched throughout.

## Summary

The scaffolding plumbing is fully correct as shipped: Aug 20, 2003 is a Wednesday and Aug 25 a Monday; `laterNight` set at WDS-100 with night mode held throughout (no flip); the WDS-165 grant block implements the locked **+2 base / +3 cap** (single highest of the four) with set-once guards; check DCs run 7/7/8/9 per design.

**29 cards**: **25 drafts** (every passage, check branch, and document), **1 link-text fix**, **1 design-doc sync** (the WDS-110 heat correction), **1 style-guide addition** (the trite-simile / poetry-verb register), **1 glossary-candidate proposal**.

Standards decisions carried from the calibration exchanges (chat, this session):

1. **WDS-110 is a woman in heat, not blank compulsion** — author correction overriding WDS.md §2 ("glassy and blank… without arousal or distress"), which had drifted toward PALE's grammar. The musk produces desperate, genuine, hijacked arousal: clothes shed carelessly, sloppy wet, whimpering when the can won't go, gratification-seeking — with nobody home behind the eyes. The absence is in *judgment and awareness*, never in affect. Card 28 syncs WDS.md so the doc matches canon.
2. **The creature (WDS-125) pushed further** — sustained explicit anatomy as the visible source of the musk; size by body-measure comparison; no werewolf vocabulary anywhere.
3. **Register purge, sequence-wide:** trite similes ("counting change," "tired too," "pays rent"), atmospheric verbs doing poetry ("where the light gives up," "swims up," "carried you to dark"), and passive scene-dressing recast active ("Everything looks like evidence under the ice machine's cold white light"). Functional comparisons (size, sound) survive; admire-me comparisons don't. Captured permanently in STYLE-GUIDE §13.1 (card 29).
4. **Robert speaks plainly** — "a person who keeps working the problem while the problem is working on her," not constructions nobody says.
5. **Full register maintained** — explicit working language at the two extreme beats (WDS-110, WDS-125) and the PC's own dose beats; the spray-the-victims triage (WDS-155) written awful-but-necessary, never cool.

Second author revision round + directed §13.1 sweep (chat, this session — all folded into the cards below before any source edit):

- **The eleven author fixes:** 090 RCMP register ("standard as the spare" → plain); 105 screen-door-spring logic replaced with plain doors-and-footsteps wrongness; 110 anchored to the curtain gap with connective tissue plus a closing direct thought (`//What the fuuuuuuuuuuuck.//`); 115/175 "pop" → "soda"; 120 "that nobody asked you about" and "tilts a few degrees toward why not" cut (the dulled judgment is now the concrete thought "maybe just watch for a minute"); 145 expanded so the filter is visualizable (fold, soak, wring, tie, knot at the back of the skull); 150 de-duplicated (no replay of the sign or the purchase; the partial-filter experience dramatized instead); 155 names the dog spray in the burst; 160 success opening de-tweed (the hold reframed as range); 165 yelp sentence rebuilt; 180 bow-on-a-bow closer cut.
- **The directed sweep** then re-audited all 25 drafts against the three new §13.1 rules and caught eight more: 090 "an air conditioner losing to August" (poetry verb); 100 "the highway gives one car" (poetry verb) and the constructed "the nothing… the nothing" echo; 120-success "the wave goes through you without taking you with it" (softened) and "because that's what they are" (filler); 130-success "isn't a symptom, the smell is the mechanism" (not-X-but-Y construction); 135 "which is the worst part so far" (bow) and "standing still in this air only goes one direction" (constructed); 140-run "the court lays itself out" (reflexive-poetic); 150 "finding its way in" (personification). All recast plain.

### Systemic patterns

- **A. Heat vs. the other three grammars.** The guests' degradation is *desperate arousal with absent judgment* — distinct from BLK's pull, MAN's frenzy-logic, and PALE's commanded blankness. Drafts keep affect present (whimpering, grinding, grief on release) and awareness absent ("She doesn't see you. She doesn't see anything.").
- **B. The dose clock.** Her own exposure escalates in every on-court passage: first hit (120), clothes-wrong and fear-quieting (135), towel-filtered but leaking (145→160), towel slipped unnoticed (165), the smell in her hair (180). Each beat's pull is written one notch deeper than the last.
- **C. Plant-and-pay objects.** WDS-090 plants the coyote notice and the dog spray (purchase for civilians, glovebox for RCMP); WDS-150 spends both with the callback "COYOTE SIGHTINGS, the sign said. Sure." The vending/ice machines are planted in 090/095 and carry 100, 110, 165, 170, 175.
- **D. Cross-incident echo avoidance (§13.6).** Steered around at draft time: no "wrong part" constructions (BLK), no furniture imagery or blankness-as-calm (PALE), no "gets a vote" (BLK audit). The 110 closer ("She's going to hurt herself trying.") and 155's "You are the one hurting her." are this sequence's own.
- **E. Em-dashes: zero spaced em-dashes added** across all 25 drafts. Byline dash per convention.

### Confirmed skipped per scope (mechanics — untouched by every card)

- All `<<silently>>` blocks: `<<setDate 2003 8 20>>` / `<<setTime "laterNight">>` / `<<setDate 2003 8 25>>`, every `<<set $header.*>>`.
- The WDS-165 grant block in full: `$nyse.influence` +2/+3 math, `wdsInfluenceGranted` / `wdsSkillGranted` set-once guards, the Academic/Composure/Streetwise grant ladder.
- All four `<<skillCheck>>` calls, DCs (7/7/8/9), and modifier expressions; the `wdsVectorReasoned` / `wdsDeepFailed` / `wdsSpineHeld` / `wdsSpineFailed` flag sets.
- Every passage **name** and link **target**; the WDS-140 `<<link>>`/`<<replace>>` choice structure; the WDS-205 → CC-500 link and its `incitingIncident` + `setDate 2005 9 12` setters.
- I add prose, background-variant prose, and one link-text recast (card 16); I remove only the `%%% HUMAN-DRAFT %%%` blocks being replaced.

### Scope notes

- **Word counts (longest single render, post-draft):** 085 ≈ 105 · 090 ≈ 100 · 095 ≈ 85 · 100 ≈ 80 · 105 ≈ 90 · **110 ≈ 120** · 115 ≈ 100 · 120 ≈ 115 (with success text) · **125 ≈ 150** · 130 ≈ 140 (with success) · 135 ≈ 125 (with failure) · 140 ≈ 145 (main + run branch) · 145 ≈ 95 · 150 ≈ 70 · 155 ≈ 105 · 160 ≈ 110 · 165 ≈ 90 · 170 ≈ 110 · 175 ≈ 115 · 180 ≈ 95 · 200 ≈ 145 visible mono · 205 ≈ 140 visible mono. **None exceed the 200 ceiling.** WDS-125 (≈150) is the explicit heart, given the same allowance as PALE-130.
- **File code `03-ONT-0820`** is deliberately province-generic: the motel's region varies by background (past the Sault / outside Ottawa / north of Toronto), so the documents redact location rather than fix one.
- **Glossary:** WDS-085 reuses `Sault` ("Soo"), WDS-175 reuses `OPP` (both existing keys; the OPP entry was written for this incident's geography). **[! glossary candidate: WHMIS — Workplace Hazardous Materials Information System; the mandatory Canadian hazmat training nearly every working adult has sat through; first appearance WDS-130; the joke and the hazmat logic both land harder if non-Canadian readers know it's universal and universally hated.]** Proposed report-side only. `NYSE` in WDS-200/205 stays unwrapped per the BLK precedent.
- **Tag candidates:** none minted, per WDS.md §8 defaults. The went-under fork (`wdsDeepFailed`/`wdsSpineFailed`) and reasoned-vs-instinct fork (`wdsVectorReasoned`) are already captured by existing flags.
- **WDS-085's `nighttime` tag on an evening slot** is consistent with the design's held night palette (evening auto-detects to night mode anyway) — plumbing, untouched.

---

## Findings

### `WDS-085 The last stretch of highway` — [wds.twee:1](../src/content/wds.twee#L1)

**01. [draft]** [WDS.md §2/§3] — placeholder → full passage. *(Approved as revised Sample A in calibration; recorded here.)*

After (prose body):

> The radio's been losing its station for twenty minutes and you've let it, half static and half country, because reaching for the dial means admitting how far you are from anything.
>
> `<<if $player.background eq "RCMP constable">>`Four days off, the first in months, spent the way you always swore you would: driving nowhere with the windows down. These are your highways. You know how empty it gets, how fast, once the `<<term "Sault" "Soo">>`'s lights drop off the mirror.`<<elseif $player.background eq "CSIS analyst">>`A week off, booked under protest, half gone already. You drove out of Ottawa with no plan except west and away, and it's worked: nobody within two hundred kilometres knows what you do for a living. Tonight, neither do you.`<<elseif $player.background eq "grad student">>`You finished the chapter. The actual, entire chapter. The reward was always going to be this: north of Toronto with a tent you probably won't use and a week where the only behaviour you have to code is your own.`<<else>>`There's no job to be away from, which is its own kind of freedom if you say it fast. You pointed the car north of Toronto with a tank of gas and a vague plan about lakes, and the vague plan has run out with the daylight.`<</if>>`
>
> Then a sign comes up out of the dark: VACANCY, electric pink, half the tubes buzzing.

(New content. Longest render ≈105.)

---

### `WDS-090 Checking in` — [wds.twee:18](../src/content/wds.twee#L18)

**02. [draft]** [WDS.md §2/§10 — plants the coyote notice and the dog spray] — placeholder → full passage.

After (prose body):

> The office smells like cigarettes from twenty years back and an air conditioner that can't keep up. The clerk takes cash, gives you a key on an orange plastic diamond, room 9, and points out the ice machine without being asked.
>
> Taped to the desk, handwritten in marker: COYOTE SIGHTINGS. DO NOT LEAVE FOOD OUT. DO NOT WALK THE TREELINE AFTER DARK.
>
> `<<if $player.background eq "RCMP constable">>`There's a can of dog spray in your glovebox already. It's been there since spring.`<<else>>`"They come right into the lot some nights," the clerk says, and sells you a can of dog spray off the shelf behind him. Twelve ninety-nine. You buy it mostly to end the conversation.`<</if>>`

Rationale: the spray is motivated for all four backgrounds per the §10 realism note (dog spray, never bear spray); the purchase-to-end-a-conversation is her dry voice doing the planting work. (New content. ≈100.)

---

### `WDS-095 Settling in for the night` — [wds.twee:34](../src/content/wds.twee#L34)

**03. [draft]** — placeholder → full passage. The last normal beat.

After (prose body):

> Room 9 is brown on brown, a bedspread you choose not to think about, an air conditioner with two settings: off and labouring. Somebody's TV comes through the wall, a laugh track with the jokes filtered out.
>
> You get a chocolate bar from the vending machine and eat it on top of the covers, watching truck headlights sweep the ceiling. This is either the loneliest you've felt all year or the most relaxed. You decide not to push on which.
>
> Lights out.

(New content. ≈85.)

---

### `WDS-100 Two hundred clicks from anywhere` — [wds.twee:50](../src/content/wds.twee#L50)

**04. [draft]** — placeholder → full passage. The hinge.

After (prose body):

> You surface sometime after two, no reason, the way you do in strange beds.
>
> The room is striped orange where the vending machine's glow gets through the curtain gap. The air conditioner has cycled off. There's one car on the highway every few minutes, a long approach, a long fade.
>
> Two hundred clicks from anywhere. You lie there with your eyes closed, nearly asleep again, when the quiet outside changes.

(New content. ≈80.)

---

### `WDS-105 Something outside` — [wds.twee:67](../src/content/wds.twee#L67)

**05. [draft]** — placeholder → full passage.

After (prose body):

> A door opens somewhere along the row. Then another one. No voices go with them.
>
> Then gravel: footsteps, several sets, slow. People are moving around out there at half past two without saying one word to each other.
>
> You get up and put an eye to the curtain gap.
>
> Three doors stand open along the row, lamplight spilling out of one. Six or seven people are out on the court in nightclothes and less. Nobody is talking. Nobody is hurrying.

(New content. ≈95.)

---

### `WDS-110 The ice machine` — [wds.twee:83](../src/content/wds.twee#L83)

**06. [draft]** [WDS.md §2/§10 — the tone-setter; **heat register per author calibration**, overriding the doc's "blank compulsion" — see card 28] — placeholder → full prose. *(Approved as revised Sample B.)*

After (prose body):

> Straight across the court from your window is the ice machine, and everything looks like evidence under its cold white light. You watch through the curtain gap, one eye, your forehead against the glass.
>
> There's a woman crouched in that light, naked from the waist down, slacks kicked off into the gravel, underwear hanging off one ankle. She's got a cold can from the vending machine in both hands and she's grinding herself down onto it, trying to get it inside her. She's soaked. You can see the shine of it from across the court, running down the insides of her thighs, and the can keeps slipping in it, too wide to go. Every time it slips she whimpers, a high, cheated sound, close to crying, and lines it up and tries again.
>
> She doesn't see you. She doesn't see anything.
>
> She's going to hurt herself trying.
>
> //What the fuuuuuuuuuuuck.//

Rationale: heat, not blankness — desperate gratification-seeking with nobody home behind the eyes; the harm framing lands per §10 (urgent harm, never spectacle). (New content. ≈105.)

---

### `WDS-115 The whole court` — [wds.twee:99](../src/content/wds.twee#L99)

**07. [draft]** — placeholder → full passage. The wider court, same heat grammar.

After (prose body):

> You open your door. The night is blood-warm, and the court is full of people getting out of their clothes.
>
> A man in his fifties stands by the soda machine, barefoot, working his shirt buttons with slow drunk focus. A couple sways against a parked pickup, mouths together, his hand down the front of her shorts, and the sounds they're making don't change when your door creaks. Two more cross the end of the row holding hands, walking like the gravel isn't sharp, toward the dark end of the lot.
>
> They're all drifting the same direction. Away from the light.

(New content. ≈100.)

---

### `WDS-120 The smell` — [wds.twee:115](../src/content/wds.twee#L115)

**08. [draft]** — main placeholder → prose. First dose.

After (prose body, above the check):

> Then the air moves and you get it full in the face.
>
> Wet dog. Under that, something ranker: rut, oil, an animal smell with sex in it. It coats the back of your throat and stays.
>
> And your body answers. Heat drops straight down through you, nipples tightening against your shirt, a throb starting up between your legs. A second behind it comes the thought, in your own voice, reasonable as anything: maybe just watch for a minute.

(New content.)

**09. [draft]** — success/failure placeholders → prose.

After (success):
> You grab the doorframe and hold on, and the worst of it passes. Your head stays yours. The throb doesn't leave. You file both facts: whatever is wrong with these people came in on the air.

After (failure):
> It rolls over you, and for a few seconds you just stand in it, lips parted, breathing deeper on purpose. Your hand is at the waistband of your shorts before you know it's moved. You stop the hand. It takes longer than it should.

(New content. No flag on this check by design — texture only.)

---

### `WDS-125 At the edge of the light` — [wds.twee:147](../src/content/wds.twee#L147)

**10. [draft]** [WDS.md §0/§2 — the creature; **pushed further per author calibration**] — placeholder → full prose. *(Approved as revised Sample C.)*

After (prose body):

> It's pacing the far edge of the lot, just past where the light ends, back and forth on all fours.
>
> Your eyes keep trying to make it a bear: the bulk, the hair. Then it rises onto two legs without effort, the way no bear stands, and the shape under all that matted hair is a man's. Seven feet of it, easy. Naked. The pelt runs thick down its shoulders and spine, worn to bare skin at the throat and hips, and the skin is shining with sweat.
>
> Its cock hangs half-hard from the hair at its groin, longer than your forearm and thicker than your wrist, swaying as it walks, drooling pre-cum in a rope that doesn't break, a wet thread swinging from the head to the gravel when it turns. Its balls are heavy as fists. The smell is pouring off all of it.
>
> Two of the guests have already drifted within arm's reach. It moves past them like they're not there.
>
> You don't reason your way to it. You know the second you see it stand: that is not a man.

(New content. ≈150 — the explicit heart, same allowance as PALE-130.)

---

### `WDS-130 The smell is doing it` — [wds.twee:163](../src/content/wds.twee#L163)

**11. [draft]** — main placeholder → prose. The gradient, observed.

After (prose body, above the check):

> The couple at the pickup has stopped kissing. They're both facing the dark end of the lot now, swaying where they stand. The barefoot man has stopped moving at all.
>
> You make yourself look at it as a layout. The closer a person stands to the dark end, the further gone they are. The man nearest the trees was first out and is worst off. You, in your doorway, furthest upwind: still thinking. Mostly.

(New content.)

**12. [draft]** — success/failure placeholders → prose. Carries the WHMIS glossary candidate (see Scope notes).

After (success):
> It lines up all at once. The gradient runs with distance, and distance means concentration. The smell is doing it. It's coming off that thing, it's in the air, and the air is the whole problem. Cover your mouth. Stay upwind. Pull them off the source. You sat through WHMIS twice and hated it both times. Apparently it took.

After (failure):
> You don't reason it out. You trip over it: turning away to cough, you notice the fog thin. Face forward, fog back. It takes three tries before you trust what that means. The smell. It's the smell doing it.

(New content. Flag `wdsVectorReasoned` untouched in the success branch.)

---

### `WDS-135 Her own body` — [wds.twee:196](../src/content/wds.twee#L196)

**13. [draft]** — main placeholder → prose. The not-immune beat; her own heat, fought.

After (prose body, above the check):

> Knowing doesn't stop it working.
>
> Your shirt has started to feel wrong, collar tight, fabric dragging at your nipples with every breath. Your fear is going quiet, and the quiet feels good. And under it all, low and patient, the pull: the couple at the truck has room for a third, says some part of you that has never once talked like that.

(New content.)

**14. [draft]** — success/failure placeholders → prose.

After (success):
> You bite the inside of your cheek until your eyes water, and the pain cuts through the fog. Still here. Still yours. You keep your breathing shallow and you get moving, because every minute in this air costs you.

After (failure):
> You've taken four steps toward the pickup before you understand that you're walking. Your fingers are at your collar, and the top button is already open. You bite your cheek hard enough to taste blood and drag yourself back to your door, and the whole way, part of you is still pulling the other direction.

(New content. Flag `wdsDeepFailed` untouched in the failure branch.)

---

### `WDS-140 Run or stay` — [wds.twee:229](../src/content/wds.twee#L229)

**15. [draft]** — main placeholder → prose.

After (prose body, above the choice block):

> Your keys are in your jacket. The car is eight spots down, upwind. You could be on the highway in under a minute, windows shut, and tonight would turn into a story you never tell because nobody would believe it.
>
> Behind you, the woman at the ice machine whimpers again.
>
> By morning these people will have followed that thing into the trees, or done worse to themselves in the gravel. Nobody here is coming back on their own, and there's nobody else awake to care.

(New content.)

**16. [draft + light call]** — run-branch placeholder → prose, plus a link-text fix: the scaffolded "You go back with your face covered." pre-empts WDS-145 (the covering hasn't happened yet) → **"You get back out of the car."**

After (branch body):

> You run for it. Gravel, keys, door, locks, and your hand on the ignition.
>
> Through the windshield you can see the whole court in the vending light: the swaying couple, the barefoot man, the woman at the ice machine still working at the can, still crying. Strangers. Nobody you owe a thing.
>
> Your hand won't turn the key.

(New content. Link target untouched; stay-branch link text kept.)

---

### `WDS-145 Something over her face` — [wds.twee:257](../src/content/wds.twee#L257)

**17. [draft]** — placeholder → prose. Exposure control; the three soak links untouched.

After (prose body):

> Filter first.
>
> The smell has a grease to it; you can feel it filming the back of your throat, and grease means water won't stop it. Wet cloth will slow it down. Slow is what's on offer.
>
> You duck back into your room and run the bathroom tap cold. The plan is simple enough to do with shaking hands: fold the cloth in three, soak it through, wring it once, tie it over your nose and mouth with the knot at the back of your skull. Breathe through the wet.

(New content. ≈95 — expanded in the revision round so the filter is fully visualizable.)

---

### `WDS-150 What she's got` — [wds.twee:275](../src/content/wds.twee#L275)

**18. [draft]** — placeholder → prose. Arming; the three secondary-tool links untouched.

After (prose body):

> The wet cloth sits tight over your nose and mouth, and every breath comes through it cold and slow. It helps. It doesn't help enough; the grease in the air is still getting in at the edges.
>
> The dog spray can is small and dense and fits your fist. One can, one thumb, a lot of dark. You want something else in your other hand:

(New content. ≈70. The sign/purchase callbacks were cut in the revision round — no replaying what the player saw at WDS-090; the partial-filter experience is dramatized here instead, which the design needs anyway.)

---

### `WDS-155 Driving them back` — [wds.twee:293](../src/content/wds.twee#L293)

**19. [draft]** [WDS.md §10 — awful-but-necessary, never cool] — placeholder → full prose. The triage.

After (prose body):

> The couple at the pickup is closest to the dark end, so they're first.
>
> "Hey. HEY." Nothing. Their faces are aimed at the treeline. You turn your own face aside and put a half-second burst of dog spray across both of them.
>
> The sound they make is the worst part. Not anger. Grief. They fold up coughing and you grab the woman's arm and haul, and she fights you the whole way to her door, crying, reaching back toward the dark like you're the one hurting her. You are the one hurting her.
>
> You do it again at the next door. And again. You're crying too, somewhere in there. It doesn't slow you down.

(New content. ≈105.)

---

### `WDS-160 Driving it off` — [wds.twee:309](../src/content/wds.twee#L309)

**20. [draft]** — main placeholder → prose. Close range, half-dosed.

After (prose body, above the check):

> It has come up the lot. Maybe because you took its people away.
>
> Twenty feet, fifteen, head low, on all fours. This close the smell comes straight through the wet towel, and your body starts agreeing with it again, fear thinning out, warmth climbing.
>
> You get the can up.

(New content.)

**21. [draft]** — success/failure placeholders → prose. The spine: it recoils on every path.

After (success):
> Your legs want to stay put and let it come. You make them hold for a better reason: range. You let it close to where you cannot miss, thumb on the tab, arm level, and you empty the charge into its eyes and nose.

After (failure):
> At ten feet the fear shuts off like a tap, and what floods in behind it is warm and slow and interested. Your arm starts to drop. Some part of you is measuring its hands, its mouth, the weight of it, and approving.
>
> Your thumb remembers the plan anyway. The spray catches it across the eyes and muzzle.

(New content. Flags `wdsSpineHeld` / `wdsSpineFailed` untouched.)

---

### `WDS-165 Into the dark` — [wds.twee:344](../src/content/wds.twee#L344)

**22. [draft]** — placeholder → prose. The grant block above it untouched.

After (prose body):

> It screams like a kicked dog, deeper than any dog could go, and goes backward off its feet, pawing at its face.
>
> Then it runs. Low, fast, on all fours, across the gravel margin and the dead grass, out past the reach of the highway light. Branches, then nothing.
>
> The lot stands quiet. The vending machine buzzes. Your towel is down around your neck, and you don't know how long ago that happened.

Rationale: the slipped towel is the dose clock paying off — she's been breathing it unfiltered without noticing, which is what the +2/+3 shape prices in. (New content. ≈90.)

---

### `WDS-170 Coming back` — [wds.twee:378](../src/content/wds.twee#L378)

**23. [draft]** — placeholder → prose. Personhood returns.

After (prose body):

> It lets go of them in ones and twos.
>
> The barefoot man looks down at his own chest and starts to shake. The couple you sprayed sit apart against the pickup's tire, eyes streaming, not talking. A heavyset man you never saw go under comes back from the dark end at a walk that keeps trying to be a run, fly open, feet bleeding.
>
> By the ice machine the woman has stopped trying. She sits in the gravel with her slacks held against her front, crying in long low pulls, and when you crouch down beside her she says, "I don't. I don't. I don't."
>
> The smell is still on everything.

(New content. ≈110.)

---

### `WDS-175 Someone has to call this in` — [wds.twee:394](../src/content/wds.twee#L394)

**24. [draft]** — placeholder → prose. The practical tail; reuses the existing `OPP` glossary key.

After (prose body):

> The office phone smells like the office. `<<if $player.background eq "RCMP constable">>`You call your own detachment, because you know exactly how this is going to sound, and it should sound that way to someone who knows you.`<<else>>`You call 911 and listen to yourself try to build the sentence. A man. An animal. Big. The smell, you keep saying, as if that helps.`<</if>>`
>
> The `<<term "OPP">>` cruiser takes forty minutes. By then the guests have statements that contradict each other and themselves, and you have the only account with a beginning, a middle, and an end. There's hair snagged on the corner of the soda machine. Prints in the soft ground past the gravel, too wide, too long. And your clothes, which still smell like it.

(New content. ≈115.)

---

### `WDS-180 She can still smell it` — [wds.twee:410](../src/content/wds.twee#L410)

**25. [draft]** [WDS.md §7 — the contamination scar] — placeholder → prose.

After (prose body):

> You shower until the hot water quits. It's in your hair anyway. Faint, under the motel soap, but there: wet dog, rut, oil.
>
> What you keep coming back to, sitting on the end of the bed, isn't the thing itself. It's how good the fear felt going quiet. Something got into you through the air, through nothing, through breathing, and your body took its side.
>
> You sleep with the window shut and the air conditioner roaring. You check the lock twice.

(New content. ≈95.)

---

### `WDS-200 Occurrence report` — [wds.twee:426](../src/content/wds.twee#L426)

**26. [draft]** [mirrors BLK-210 document markup] — placeholder → full document. Clinical; morphology documented, never named.

After (full passage body, replacing the placeholder):

> ```
> <div style="background:var(--sz-ink-3);border:1px solid var(--sz-rule);padding:28px;position:relative;margin-top:8px">
> <span class="stamp" style="position:absolute;top:14px;right:14px;transform:rotate(-8deg)">Classified</span>
> <div class="eyebrow --brick" style="margin-bottom:14px">Incident File · 03-ONT-0820 · Extract</div>
> <div style="font-family:var(--sz-f-mono);font-size:12px;line-height:1.8;color:var(--sz-cream-soft)">
> <p>INCIDENT DATE: 2003.08.20–21. Flagged from OPP occurrence report 2003.08.21; file assumed 2003.08.22.</p>
> <p>Location: motel, <span class="redact" style="width:110px"></span>, Ontario. Affected: eleven registered guests. Common presentation: disinhibition, fixation, partial or absent recall 02:10–03:00 hrs approx. Two treated for minor injuries, one for <span class="redact" style="width:80px"></span>. No fatalities.</p>
> <p>Subject: large unidentified, bipedal/quadrupedal, est. 210+ cm, heavy hair cover, nude, fled north on foot. Not recovered. Influence assessed atypical: airborne/olfactory, oil-borne, severity gradient consistent with concentration. Recovered: hair samples (analysis pending), partial prints (no species match), persistent odour on witness effects.</p>
> <p>One witness retains complete, ordered recall and applied effective exposure countermeasures during the event. See attached recommendation. Classification: <span style="color:var(--sz-brass);font-style:italic">pending review</span>.</p>
> </div>
> </div>
> ```

Rationale: "no species match" and "analysis pending" document without explaining (§13.5); the redacted injury is the ice-machine woman's, left grim and unstated. (New content. ≈145 visible mono.)

---

### `WDS-205 Recommendation` — [wds.twee:443](../src/content/wds.twee#L443)

**27. [draft]** [NPC-handler voice; mirrors BLK-215; plain-speech fix per calibration] — placeholder → full document. *(Approved as revised Sample D.)* The `<<link>>` block below it untouched.

After (full passage body, replacing the placeholder):

> ```
> <div style="background:var(--sz-ink-3);border:1px solid var(--sz-rule);padding:28px;position:relative;margin-top:8px">
> <span class="stamp" style="position:absolute;top:14px;right:14px;transform:rotate(5deg)">Eyes Only</span>
> <div class="eyebrow --brick" style="margin-bottom:14px">Recruitment Recommendation · R. Flett · 2003.08.25</div>
> <div style="font-family:var(--sz-f-mono);font-size:12px;line-height:1.8;color:var(--sz-cream-soft)">
> <p>Re: <span class="redact" style="width:130px"></span> (witness, file 03-ONT-0820).</p>
> <p>Event classification: NYSE. Mobile biological subject, atypical olfactory influence vector. Subject not recovered. What we have is what it left: hair, prints, one coherent statement, and a parking lot of people who cannot account for forty minutes.</p>
> <p>Witness behaviour, per her statement and the site walk-through: she connected the effect to the odour while actively exposed, improvised respiratory cover from a wet towel, understood the cover was partial and worked inside the window it bought, cleared the affected guests off the source, and turned the subject with a can of dog repellent.</p>
> <p>She is not resistant to the influence. Her statement is plain about how hard it was working on her the whole time. What she is, is rarer: a person who keeps working the problem while the problem is working on her. A wet towel and a can of dog spray is not training, and it is not equipment we issue. Recommend contact inside thirty days. Field-eligible, pending evaluation.</p>
> <p style="margin-top:14px">— R. Flett, Branch</p>
> </div>
> </div>
> ```

(New content. ≈140 visible mono.)

---

### Doc sync — `docs/incidents/WDS.md` (the heat correction)

**28. [doc sync]** [author override, calibration round] — WDS.md describes WDS-110 as blank compulsion ("glassy and blank… without arousal or distress"), which is PALE's grammar. Canon is now **heat**. Three spots updated so the doc matches the drafted sequence:

- **§1 premise:** "By the ice machine, a woman is trying to force a soda can into herself with a blank, glassy focus." → "By the ice machine, a woman stripped from the waist down is grinding herself against a soda can she can't force inside herself — soaked, whimpering, desperate, and not home behind the eyes."
- **§2 WDS-110 row:** "glassy and blank, methodically trying to force a cold soda can up into herself — working at it without arousal or distress, just blank compulsion" → "in heat: stripped, soaked, whimpering when the can won't go in; the attempt is sexual gratification, frantic rather than methodical. The horror is desperate, hijacked arousal with nobody home behind the eyes — absence of judgment and awareness, not absence of affect."
- **§10 fallback-block example intent line:** "blank, compulsive, forcing a soda can into herself; degraded and unsafe, no arousal or distress on her part" → "in heat: soaked, whimpering, gratification-seeking; degraded and unsafe; horror = a person reduced below safety by her own hijacked arousal."

(Meaning change: yes, deliberately — this is the author's correction of a design-doc drift toward the PALE register.)

---

### Style-guide capture — `STYLE-GUIDE.md` §13.1

**29. [style-guide addition]** [author direction: "make sure that register is captured"] — §13.1 already catches the *literary* varnish (over-crafted metaphors, dual constructions, decorative imagery) but not the plainer-dressed forms purged this session. Three bullets appended to the §13.1 list:

> - **Trite similes — plainness is no defence.** A simile doesn't need literary varnish to be a tell. "The storm settled in like it pays rent," "buzzing like it's tired too," "her face was the face of someone counting change" are trite-clever rather than over-crafted, and they read as generated just the same. A comparison must carry information the plain statement can't: size by a body measure ("thicker than your wrist"), a sound by its real referent ("a yelp like a kicked dog, deeper than any dog could go") survive; comparisons that exist to be admired don't. *(Earned in the WDS pass, 2026-06.)*
> - **Atmospheric verbs doing poetry instead of work.** "Where the highway light gives up," "a sign swims up out of the dark," "the plan carried you to dark." Light doesn't give up and signs don't swim; this is the over-crafted metaphor wearing a verb. Say where the light ends and what the thing does. *(Earned in the WDS pass.)*
> - **Passive scene-dressing → recast active.** "The light was the kind that makes everything look like evidence" → "Everything looks like evidence under the ice machine's cold white light." When a description can be recast so the scene's objects act, recast it. Pairs with the §15.12 "the kind of" check.

---

## Verification plan (Stage 4, after approval)

After applying approved cards:

```powershell
$env:TWEEGO_PATH = "_tools/tweego/storyformats"
& _tools/tweego/tweego.exe -o sizzle/output.html sizzle/src/
```

Then play CC-300 → select Wet Dog Smell → through the flashback → CC-500, on the RCMP route and one civilian route, confirming mechanics untouched: `$player.incitingIncident = "Wet Dog Smell"`; `$nyse.influence` +2 base, +3 only on a failed deep hold (135) or failed spine hold (160); exactly one skill point granted by play pattern; re-entering stacks neither grant nor influence; footer clock reads Wed Aug 20 2003 through the scene, Mon Aug 25 2003 on the documents, and resets to Sept 12 2005 by CC-500; no single render exceeds the 200-word ceiling; no `%%%` markers remain in `wds.twee`.
