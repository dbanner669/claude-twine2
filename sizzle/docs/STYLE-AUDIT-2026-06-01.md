# Style Guide Audit — 2026-06-01

Scope: the Dark of Manitoulin origin sequence (`src/content/manitoulin.twee`, MAN-085–MAN-205, 24 passages). This is the second CC-400 origin pass, run through the [EDITORIAL-SWEEP.md](EDITORIAL-SWEEP.md) Stage 0–4 workflow against [STYLE-GUIDE.md](STYLE-GUIDE.md), mirroring the [2026-05-29 Blackout audit](STYLE-AUDIT-2026-05-29.md). Unlike the BLK pass, this draft ships with **11 `[! claude draft this passage]` placeholders** the author asked me to draft from [incidents/MANITOULIN.md](incidents/MANITOULIN.md), so this report is part **drafting**, part **directive-resolution**, part **style/logic/period elevation**. Mechanics are untouched throughout.

## Summary

Overall health of the human-drafted half: **strong.** The interiority ladder lands the consent-as-horror thesis cleanly (MAN-135 "for one disorienting second it almost makes sense"; MAN-145 "the thought feels dangerously reasonable"; the MAN-160 refuse/buckle fork), and the mechanics match MANITOULIN.md §8 exactly. The work here is (a) **drafting** the 11 placeholders to spec, (b) **resolving** every `[! ]` directive and the two `[? ]` questions, and (c) **elevation + correctness** on the drafted prose.

**28 cards** across 22 passages: **11 drafts** (placeholders → full prose), **3 hard** (broken emphasis markup that won't render; finished prose stranded inside a comment at MAN-160; day/night tag errors), **~9 directive/logic/period fixes**, **~5 light calls**, plus **2 glossary candidates** (propose only). Two `[? ]` resolutions (road geography; glowing chalk) are presented as cards for your confirmation.

Standards decisions carried from the read-gate exchange (chat, this session):

1. **Draft the placeholders** as part of this pass (your "1: Yes").
2. **Date is Aug 16, 2003** (Saturday); the `[! set date Aug 24]` directive lines were a mistake — removed. The `<<setDate 2003 8 16>>` / `<<setDate 2003 8 23>>` plumbing is already correct and stays.
3. **Make the avatar / day-night tags match** the design's palette scheme (§9: day through the approach and interior, flip to night at MAN-150). Follow the `[! ]` directives.
4. **MAN-110's "FUCK MY ASS RAW!" is not a concern** — left as written.
5. **Fix the in-prose typos** (brakes, happens, maintenance, palatial, hand, your mind, "with in").

### Systemic patterns (worth a group decision)

- **A. Broken emphasis markup (hard, rendering bug).** The draft uses `*word*` (MAN-120, 135, 160) and `/word/` (MAN-115) for italics. Stock SugarCube emphasis is `//word//`; `*` and `/` are **not** markup, and there is no markdown plugin in `src/scripts/` (grep-confirmed) — so these render as **literal asterisks/slashes** on screen. The shipped BLK sequence uses **no** italic markup at all. Two clean options: **(a)** convert each to `//word//` (preserves your emphasis intent, renders correctly), or **(b)** strip to plain prose (matches BLK's house default; stress carried by structure). My cards default to **(a) convert to `//…//`**; say the word and I'll strip instead. Affects cards 10, 11, 14, 19.
- **B. Day/night + avatar tags vs. the palette scheme (hard).** Design §2/§9 wants late-afternoon **day mode** through the approach, a forced **day-mode tail** through the lit interior, and the flip to **night** when she steps outside at MAN-150. The interior passages the author tagged himself (MAN-115→145 `avatar-man-day daytime`) already follow this; the two outliers are typos/mis-tags: **MAN-105** `[avatar-man-night time]` and **MAN-110** `[avatar-man-day nightime]`. Cards 6 and 8 normalize both to `avatar-man-day daytime`. (If you'd rather the night flip happen earlier — e.g. at the dark-road breakdown, MAN-105 — that's a one-line change; flagged in card 6.)
- **C. `[! ]` background-variant blocks as pseudocode.** MAN-085, 105, 115 carry `[! RCMP]` / `[! CSIS]` / `[! else]` / `[! all]` shorthand. Resolved into real `<<if $player.background eq …>>` branches (cards 1, 6, 9), each 1–2 sentences, parallel, per §3.2.
- **D. Em-dashes.** Far lighter than BLK — only a handful (MAN-145, 165). Recast cleanly per the §7.1 reduce-don't-strip note; dialogue dashes and the MAN-205 byline left alone.
- **E. Glowing chalk / occult-certification risk.** MAN-155 and the MAN-160 draft both have the chalk "glowing." Resolved to ordinary chalk caught in torchlight (cards 18, 19) — a literal glow risks "certifying occult," which MANITOULIN.md §0/§10 forbids, and photoluminescent glow *in torchlight* is physically backwards anyway.

### Confirmed skipped per scope (mechanics — untouched by every card)

- All `<<silently>>` blocks: `<<setDate>>` / `<<setTime>>`, `<<set $header.*>>`.
- The MAN-175 grant block in full: `$nyse.influence` +2/+3 math, the `manInfluenceGranted` / `manSkillGranted` set-once guards, the Composure/Academic/Confrontation skill grant.
- All `<<skillCheck>>` calls, DCs (7/8/9), and modifier expressions; the `manSunroomFailed` / `manFocalHeld` / `manFocalFailed` / `manStructureReasoned` flag sets.
- Every passage **name** and link **target**; the MAN-140 `<<linkreplace>>` structure; the MAN-205 → CC-500 link and its `incitingIncident` + `setDate 2005 9 12` setters.
- I edit only link **text**, prose, background-variant prose, tags (per decision #3), and the broken-markup/typos.

### Scope notes

- **Word counts:** longest single renders post-edit — MAN-085 ≈ 95, MAN-095 ≈ 105, MAN-105 ≈ 120 (RCMP), MAN-115 ≈ 95, MAN-185 ≈ 110 (RCMP). None near the 200 ceiling. The two document passages (MAN-200/205) render ≈ 90 visible mono words each.
- **`incitingIncident` is set twice for Manitoulin** — once at CC-400 selection (`character-creator.twee:265`) and again at MAN-205's file-close. Harmless (same value), but note it differs from BLK, which sets it only at BLK-215. Left as-is (plumbing); flag only.
- **MAN-200 report date** is Aug 23 (a Saturday); BLK's equivalent was dated a weekday (Thu Aug 21). Defensible — occurrence logs are continuous — and it's plumbing, so left alone. Note only.

---

## Findings

### `MAN-085 The long drive up` — [manitoulin.twee:1](../src/content/manitoulin.twee#L1)

**01. [directive/draft]** [§3.2 variants; §14.1 term; resolves `[! ]` markers] — convert the `[! RCMP]/[! CSIS]/[! else]/[! all]` shorthand into real branches, describe the highway, wrap the existing `Sault` glossary key, make the borrowed cottage universal (it explains the rental-car budget *and* the destination for all four), and remove the resolved `[! make sure formatted]` + `[! set date Aug 24]` directives (date stays Aug 16 in the plumbing).

Before (lines 9–24):
> [! make sure the below text is formatted correctly for twee/twine]
> [! set date Aug 24, 2003, Afternoon]
>
> You drive down the [! describe highway into Manitoulin]. You need this vacation.
>
> [! RCMP]You've been grinding away at your junior job in the Sault[! hoverover] RCMP office for almost a year now, and this is the first real break you've gotten since you started.
>
> [! CSIS]You've been grinding away at your junior job as an analyist in Ottawa for almost a year now, and this is the first real break you've gotten since you started.
>
> [! else]Your mom's cousin's uncle owns a cottage out here, and through the vaguries of extended family you're staying up here for free. Which is good, because the rental car has basically blown your vacation budget.
>
> [! all]Hopefully you can find the place before dark.
>
> [? would the road not be going south? …]
>
> [[The road keeps going north.|MAN-090 Onto the island]]

After (prose body):
> The two-lane unspools north through granite cuts and black spruce, the heat shimmering off the asphalt ahead. You need this vacation.
>
> <<if \$player.background eq "RCMP constable">>A year grinding through a junior posting out of the <<term "Sault">>, and this is the first real break you've taken since you started.<<elseif \$player.background eq "CSIS analyst">>A year grinding at a junior analyst's desk in Ottawa, and this is the first real break you've taken since you started.<<elseif \$player.background eq "grad student">>A year buried in your master's thesis at York, and this is the first real break you've taken since you started.<<else>>A year out of school with no job and too much time, and God knows you've got nothing to take a break from.<</if>>
>
> Your mom's cousin's uncle owns a cottage out here, and through the vagaries of extended family you've got it to yourself for the week. Just as well: the rental car has already eaten most of your vacation budget.
>
> Hopefully you can find the place before dark.
>
> [[The road keeps going north.|MAN-090 Onto the island]]

Rationale: turns the markers into shippable branches; the cottage moves to the universal paragraph so RCMP/CSIS players also learn what "the place" is; `Sault` reuses the existing glossary key. (Meaning change: yes — the borrowed cottage is now universal rather than civilian-only; grad/unemployed get distinct one-line framing instead of sharing the cottage line.)

**02. [? resolution]** [period/geography §4.2; resolves the `[? road direction]` marker] — the open question about compass direction.

The geography: the only **road** onto Manitoulin is the one-lane swing bridge at **Little Current** (Highway 6), which everyone reaches by driving *up* through Espanola — from the GTA (grad/unemployed) and Ottawa (CSIS) you head north up Hwy 6; from the **Sault** (RCMP) you run east on Hwy 17 then south to the bridge. The **Chi-Cheemaun ferry** is the *southern* tourist alternative (Tobermory → South Baymouth). So no single compass word is literally true for all four — but "going up north to the island/lake" is idiomatic Ontario for cottage-country travel regardless of bearing, and the lakehouse sits on the **North Channel** (the island's north side), so once she's *on* the island everyone does drive north toward the water.

Proposed resolution: **keep the idiomatic "up north" framing and the "road keeps going north" link** (true for the majority road route and for the on-island leg), use the universal **swing bridge at Little Current** for the crossing in MAN-090 (card 3), and give the RCMP variant a line acknowledging she's come over from the Sault side. The `$header.location "HIGHWAY NORTH"` stays (plumbing). Remove the `[? ]` marker. (Meaning change: no — clarifies, doesn't alter events.) *If you'd prefer hard accuracy over idiom, alternative: change the link text to "The road keeps going." and drop "north" — say which you want.*

---

### `MAN-090 Onto the island` — [manitoulin.twee:28](../src/content/manitoulin.twee#L28)

**03. [draft]** [MANITOULIN.md §2 table-setting] — placeholder → full passage. Crossing by the swing bridge, ordinary tourist texture, no wrongness.

Before (lines 35–42):
> [! claude draft this passage]
>
> /* %%% DEFERED TO CLAUDE TO DRAFT %%% MAN-090 Onto the island — … crossing over by bridge or ferry … no wrongness yet. ~90 words. %%% END %%% */
>
> [[You cross onto the island.|MAN-095 A stop on the rock]]

After (prose body):
> The swing bridge at Little Current is a single lane of old green steel. You wait while it pivots shut behind a sailboat, then bump across onto the island proper.
>
> <<if \$player.background eq "RCMP constable">>You've crossed it before, up this way on the job. It still feels like driving onto the edge of the map.<<else>>WELCOME TO MANITOULIN, says the sign, WORLD'S LARGEST FRESHWATER ISLAND. You've never been this far up.<</if>>
>
> The town thins out fast. Bush and rock and the lake flashing blue through the trees, a gas bar with a hand-lettered sign for nightcrawlers. An ordinary north-country Saturday.
>
> [[The island opens up ahead of you.|MAN-095 A stop on the rock]]

Rationale: table-setting per §2; RCMP-vs-civilian shading per §3; link text advances (the crossing now happens here). (New content.)

---

### `MAN-095 A stop on the rock` — [manitoulin.twee:46](../src/content/manitoulin.twee#L46)

**04. [draft]** [MANITOULIN.md §2] — placeholder → full passage. The last fully normal beat; plants "city money."

After (prose body):
> The general store has two gas pumps, a chest freezer of bait, and a pot of coffee that's been on the burner since morning. You fill the tank and buy the coffee anyway.
>
> Heat comes off the granite lot in slow waves. A kid on the step works at a freezie and watches you like you're the most interesting thing to happen all day. Maybe you are.
>
> <<if \$player.background eq "RCMP constable">>You ask the woman at the till about the lake road. She knows the cottage you mean. "Big new place. City money," she says, the way you'd note a smell.<<else>>You ask the woman at the till for the lake road. She points with her whole hand and tells you to watch for deer at dusk.<</if>>
>
> Back into the heat. Tank full, the light going long and gold.
>
> [[You get back on the road.|MAN-100 The island road]]

Rationale: small-town quiet, Shield heat, the RCMP variant gets a cop's-ear read that seeds the monied-cottage discomfort (§3). (New content.)

---

### `MAN-100 The island road` — [manitoulin.twee:64](../src/content/manitoulin.twee#L64)

**05. [draft]** [MANITOULIN.md §2 opening] — placeholder → full passage. Dusk back road, heat off the rock, the borrowed cottage now universal.

After (prose body):
> Pavement gives out to gravel, and gravel gives out to two ruts with a crown of grass down the middle. Cottage roads. You crawl along watching for the turn your relative sketched on the back of an envelope, the lake somewhere off to your left behind a wall of cedar.
>
> The day's heat is lifting off the rock now, the first cool breath of evening coming up out of the bush. Mosquitoes find the open window. You roll it up.
>
> Somewhere ahead there's supposed to be a place big enough to see from the water.
>
> [[You follow the road toward the water.|MAN-105 Dead in the water]]

Rationale: opening beat; `<<setTime "evening">>` and the `daytime` tag (day-mode tail) preserved per §9. (New content.)

---

### `MAN-105 Dead in the water` — [manitoulin.twee:83](../src/content/manitoulin.twee#L83)

**06. [hard tag + directive + typos]** [§9 palette; §3.2 variants; §12.2 continuity] — tag fix, variant resolution, typo fixes, cut a pre-incident portent, remove resolved directives.

Tag before: `:: MAN-105 Dead in the water [avatar-man-night time]`
Tag after: `:: MAN-105 Dead in the water [avatar-man-day daytime]`

Before (lines 90–107):
> [! make sure the below text is formatted correctly for twee/twine]
> [! set date Aug 24, 2003, Evening]
>
> As the road weaves into the forest the sun dips beneath the trees leaving the world in an otherworldly twilight. You can still see the lakeshore peeking out past the trees to your left.
>
> Suddenly, there is a loud POP and the pedal under your foot loses all resistance. You quickly jam on the breaks (which thankfully seem to still be working). The lights in the car flicker out, leaving you by the side of an increasingly dark road.
>
> [! RCMP]Fuck. You should have taken her in before coming out here. This is what happenes when you defer maitenence.
>
> [! Else]Fuck. This is what you get for picking the budget rental place.
>
> [! all]Off in the distance you hear the sound of voices. Up toward the water is a cottage with glimmering lights piercing through the darkness.
>
> [! RCMP or CSIS]You should have listened to your boss and gotten a cell phone[! add hoverover…].
>
> [! unemployed or grad student]You should have listened to your friend Genevieve and gotten a cell phone[! add hoverover…]. But they're so damn expensive!

After (prose body):
> As the road winds deeper into the forest the sun drops below the trees and leaves the world in blue dusk. The lakeshore still shows through the trunks to your left, the last of the light going off it.
>
> Then a loud POP, and the pedal under your foot sinks to the floor. You stand on the brakes, which thankfully still work, and coast onto the shoulder as the dashboard lights flicker and die. The engine ticks. The bush goes quiet.
>
> <<if \$player.background eq "RCMP constable">>Fuck. You should have taken her in before the trip. This is what deferred maintenance gets you.<<else>>Fuck. This is what you get for going with the budget rental place.<</if>>
>
> Off through the trees there are voices, and up toward the water a cottage with its lights blazing into the dark.
>
> <<if \$player.background eq "RCMP constable" or \$player.background eq "CSIS analyst">>You should have listened to your boss and bought a cell phone.<<else>>You should have listened to your friend Genevieve and bought a cell phone. But the damn things cost a fortune.<</if>>
>
> [[The house has lights and probably a phone.|MAN-110 Nobody answers]]

Rationale: night→day tag per §9 (interior is still day-mode tail); "otherworldly" cut (narrator certifying weirdness before the incident, §13.5); typos fixed (brakes/happens→implied, maintenance); "Genevieve" callback is consistent with BLK-205. (Meaning change: minor — drops "otherworldly"; cell-phone hover deferred to card 7.) *Alternative noted in Systemic B: if you want the night flip here instead of MAN-150, set this tag to `avatar-man-night nighttime` and I'll cascade.*

**07. [glossary candidate — propose only]** [§14.1; resolves `[! add hoverover … cell phone]`] — the directive asks for a cell-phone floatie; minting a term is propose-only per the hard constraint. Candidate:

> `[! glossary candidate: cell phone — period note]` — suggested `setup.glossary` entry: *"In 2003, a cell phone meant a 'dumb' phone — calls and text, no real internet, and still pricey enough that plenty of people skipped it. Even with one, a back road like this would have no signal."*

On approval I'll add the key to `variables.twee` and wrap the first instance (MAN-105) as `<<term "cell phone">>`. Until then the word stays plain (wrapping a missing key trips the `broken-ref` lint).

---

### `MAN-110 Nobody answers` — [manitoulin.twee:111](../src/content/manitoulin.twee#L111)

**08. [hard tag + typo + light]** [§9 palette] — tag fix and a spelling fix; one light word swap.

Tag before: `:: MAN-110 Nobody answers [avatar-man-day nightime]`
Tag after: `:: MAN-110 Nobody answers [avatar-man-day daytime]`

Before (line 119):
> As you make your way toward the cottage on the lake you're struck by how HUGE it is. Cottage is the wrong word for this palacial new-money mansion. Three stories, with a fully kitted out dockhouse down past the yard.

After:
> As you make your way toward the cottage on the lake you're struck by how HUGE it is. Cottage is the wrong word for this palatial new-money mansion. Three stories, with a fully kitted-out boathouse down past the lawn.

Rationale: fixes the `nightime` tag typo (→ day-mode tail per §9) and "palacial" → "palatial"; "dockhouse" → "boathouse" (the standard term for a lakehouse outbuilding — light call). The "FUCK MY ASS RAW!" line and "But you need that fucking phone." are left as written per your decision #4. (Meaning change: no.)

---

### `MAN-115 The front door` — [manitoulin.twee:131](../src/content/manitoulin.twee#L131)

**09. [directive/draft]** [§3.2; resolves `[! add background specific detail]`] — add the background-variant noticing beat the design assigns here (RCMP's investigator instinct fully online; the others read by their own lights).

Before (line 144):
> [! add background specific detail]

After (appended before the link):
> <<if \$player.background eq "RCMP constable">>You count without meaning to. Exits, doors, how many pairs of shoes. The job doesn't switch off because you're on holiday.<<elseif \$player.background eq "CSIS analyst">>Thirty pairs of shoes by the door and not one person answering it. The arithmetic of that sits wrong.<<elseif \$player.background eq "grad student">>Thirty pairs of shoes and nobody coming to the door. Every model of crowd behaviour you know says someone should have.<<else>>Thirty pairs of shoes, and not one person willing to cross a room to a knocking door. Your skin doesn't like it.<</if>>

Rationale: §3 wants the RCMP investigator instinct online by the threshold and the civilians differing only in what their eyes are trained to do. (New content; meaning change: adds the assigned variant beat.)

**10. [hard markup + AI-ism]** [Systemic A; §7.1] — broken `/must/` italics and the `--` double-hyphen.

Before (lines 138–142):
> You knock on the door and wait a full minute before knocking again. You can see people--a lot of people!--behind those curtains. They /must/ have heard the knocks.
>
> You knock a third time, this time louder and harder. The door pops open. It wasn't locked or even closed all that well.
>
> Inside is a foyer with coats, sandals, and shoes. Enough for several dozen people. You can see shadows moving in the hallway in front of you and wet rhythmic sounds coming from a room to the right of you.

After:
> You knock and wait a full minute before knocking again. You can see people behind those curtains. A lot of people. They must have heard you.
>
> You knock a third time, louder, harder. The door pops open. It wasn't locked, or even properly shut.
>
> Inside is a foyer full of coats and kicked-off sandals and shoes, enough for several dozen people. Shadows move in the hallway ahead of you, and from a room to your right come wet, rhythmic sounds.

Rationale: `/must/` won't render (Systemic A) — emphasis carried by the standalone sentence "A lot of people."; `--…--` recast to plain sentences. (Meaning change: no.) *Per Systemic A, if you want the emphasis kept, I'll set `//must//` instead.*

---

### `MAN-120 The great room` — [manitoulin.twee:150](../src/content/manitoulin.twee#L150)

**11. [hard markup + light]** [Systemic A; §13.6 repetition] — broken `*scale*` italics and a "scent of … scented / fucking … fucking" doubling.

Before (lines 157–159):
> You were pretty sure there were people fucking in here, but the *scale* of the fucking going on is impressive.
>
> Stepping into the sprawling great room a warm scent of cedar-scented air mixed with sweat and cum hits your nose. At least twenty bodies writhe across plush rugs and leather couches by the massive stone fireplace.

After:
> You were pretty sure there were people fucking in here, but the //scale// of it is impressive.
>
> Stepping into the sprawling great room, warm air thick with cedar and sweat and cum hits your nose. At least twenty bodies writhe across plush rugs and leather couches by the massive stone fireplace.

Rationale: `*scale*` → `//scale//` (renders); drops "fucking … fucking" and "scent of … scented" doublings. The tableau (the woman taking two men, the bound-and-edged man) is strong and explicit per §11 — left intact. (Meaning change: no.)

---

### `MAN-125 Look at me` — [manitoulin.twee:173](../src/content/manitoulin.twee#L173)

**12. [light call]** [§3.1 character voice] — the success read leans on clinical vocabulary the *unemployed* background wouldn't have.

Before (lines 188–189):
> You step back, observing calmly. Well that's fucking weird. Total dissociation or extreme sensory override? No reaction to pain stimulus. Interesting. The whole room seems locked in a shared trance state. Hopefully the fact you aren't panicking is healthy.

After:
> You step back and make yourself watch it cold. That is deeply fucking weird. You hit him hard enough to hurt and got nothing, not a flinch. The whole room is locked into the same thing, wherever they've all gone. Some distant part of you notes that you aren't panicking, and hopes that's a good sign.

Rationale: "dissociation / sensory override / pain stimulus / trance state" is textbook vocabulary — perfect for the psych grad, plausible for CSIS/RCMP, but over-claimed for the unemployed background (§3.1). The recast keeps the cool, observant read in universal voice. **Light — the original is defensible if you'd rather gate the clinical version to gov/grad backgrounds instead.** (Meaning change: no — same observations, less jargon.)

---

### `MAN-130 Party favours` — [manitoulin.twee:200](../src/content/manitoulin.twee#L200)

**13. [draft]** [MANITOULIN.md §2 reveal seed; §0 kitsch-origin] — placeholder → full passage. The tell: printout, dollar-store candles, half-smudged chalk; "this started as a dare."

After (prose body):
> On your way through, the details start adding up wrong. A folding catering table with a sterno tray gone cold. Plastic champagne flutes. A glitter banner that reads FORBIDDEN ISLAND.
>
> Taped to the wall by the fireplace is a printout: a diagram, five lines meeting in a star, the kind of thing you'd pull off a website at two in the morning. Someone's chalked the same shape onto the floorboards, half scuffed away now under all the moving feet. Dollar-store tealights ring it.
>
> A party trick. Somebody printed off a diagram and lit some candles for a laugh, the way you'd run a séance at a sleepover.
>
> Nobody's laughing now.
>
> [[You move deeper into the house.|MAN-135 The kitchen]]

Rationale: lands the load-bearing "kitsch until it isn't" reveal (§0); the séance-sleepover comparison gives an experiential referent (§12.5); "this started as a dare" stays her in-scene inference, not narrator fact (§3.7). The "Nobody's laughing now." kicker is her dry register (§10.5) doing double duty. (New content.)

---

### `MAN-135 The kitchen` — [manitoulin.twee:218](../src/content/manitoulin.twee#L218)

**14. [hard markup + light]** [Systemic A; §13.6] — broken `*…*` italics and a "low … low" doubling.

Before (lines 230–232):
> A low heat blooms low in your belly, uninvited. Your nipples tighten against your shirt. For one disorienting second it almost makes sense.
>
> You catch yourself breathing faster. *What the fuck is wrong with me?*

After:
> Heat blooms low in your belly, uninvited. Your nipples tighten against your shirt. For one disorienting second it almost makes sense.
>
> You catch yourself breathing faster. //What the fuck is wrong with me?//

Rationale: `*…*` → `//…//` (renders); drops the "low … low" repeat. The rest of the kitchen tableau is strong and on-thesis ("it almost makes sense") — left intact. (Meaning change: no.)

---

### `MAN-140 Forward or back` — [manitoulin.twee:238](../src/content/manitoulin.twee#L238)

**15. [typo]** [§12 continuity] — in the leave-branch `<<linkreplace>>`.

Before (line 253):
> Your feet carry you back through the great room, past the indifferent bodies, but something catches in you mind. Something is wrong here. Something you need to fix.

After:
> Your feet carry you back through the great room, past the indifferent bodies, but something catches in your mind. Something is wrong here. Something you need to fix.

Rationale: "you mind" → "your mind". The convergent choice structure is strong — otherwise untouched. (Meaning change: no.)

---

### `MAN-145 The sunroom` — [manitoulin.twee:262](../src/content/manitoulin.twee#L262)

**16. [hard markup + typo + continuity + em-dash]** [Systemic A; §7.1; §11.5 clothing] — multiple small fixes around two strong branches.

Before (success, lines 282–284):
> The images keep pulling at you—the slick sounds, the rolling hips, the shameless tangle of bodies—but you force your eyes away and keep moving. Your legs feel heavy, reluctant, but they obey.
>
> No doubt looks fun, but something is *clearly* wrong

After (success):
> The images keep pulling at you: the slick sounds, the rolling hips, the shameless tangle of bodies. But you force your eyes away and keep moving. Your legs feel heavy, reluctant, but they obey.
>
> No doubt it looks fun. But something here is //clearly// wrong.

Before (failure, lines 291–293):
> You take an involuntary half-step forward, one hand already reaching toward the nearest body, the other slipping into your shorts. Heat surges through you, thick and liquid. For a dizzying moment it feels right to walk over, to kneel, to let yourself be pulled into the warm, mindless rhythm with them.
>
> You yank your had out of your panties. They're wet. Shame and arousal twist together in your gut as you force yourself onward, legs unsteady.

After (failure):
> You take an involuntary half-step forward, one hand already reaching toward the nearest body, the other dropping to the front of your shorts. Heat surges through you, thick and liquid. For a dizzying moment it feels right to walk over, to kneel, to let yourself be pulled into the warm, mindless rhythm with them.
>
> You yank your hand back out. Your fingers are wet. Shame and arousal twist together in your gut as you force yourself onward, legs unsteady.

Rationale: `*clearly*` → `//clearly//` and a missing period; "had" → "hand"; **clothing continuity** — she's in shorts (MAN-100), so "into your shorts" then "out of your panties" contradicts; unified to shorts (§11.5). Paired em-dashes → colon + period (§7.1). (Meaning change: no.)

---

### `MAN-150 Out the back` — [manitoulin.twee:300](../src/content/manitoulin.twee#L300)

**17. [typo]** — garbled phrase in the opener.

Before (line 309):
> You push through the back doors and the night air hits with in a shock, cool and sharp, laced with pine and lake water.

After:
> You push through the back doors and the night air hits in a shock, cool and sharp, laced with pine and lake water.

Rationale: "hits with in a shock" → "hits in a shock". The night-flip beat (`<<setTime "night">>`, `avatar-man-night nighttime`) is correct and the North Channel / no-city-glow texture is good — otherwise untouched. (Meaning change: no.)

---

### `MAN-155 The dock` — [manitoulin.twee:321](../src/content/manitoulin.twee#L321)

**18. [? resolution]** [§0/§10 no occult certification; §12.4 physical plausibility; resolves the `(photlumencent chalk?)` note] — the glowing chalk.

Before (line 328):
> The dock boards creak under your feet. At the far end, a five-point chalk marking glows faintly in the torchlight (photlumencent chalk?), surrounded by a loose circle of guttering dollar-store candles. Around it, the frenzy is thickest.

After:
> The dock boards creak under your feet. At the far end, a five-point chalk marking shows pale against the boards in the torchlight, ringed by a loose circle of guttering dollar-store candles. Around it, the frenzy is thickest.

Rationale: drops the glow and the author's parenthetical query. A literal glow risks "certifying occult" (forbidden, §0/§10), and photoluminescent chalk *glowing in torchlight* is backwards (it glows in darkness, faintly, after charging — torchlight would wash it out). Ordinary chalk catching the firelight keeps the props kitsch. The "It looks so god. damn. inviting." staccato is intentional emphasis (renders fine) — left. (Meaning change: yes — removes the glow. Confirm; if you want a genuine glow as an early wrongness tell, I'll keep it but recast so it reads as *wrong* rather than occult-decorative.)

---

### `MAN-160 Almost` — [manitoulin.twee:340](../src/content/manitoulin.twee#L340)

**19. [hard — content not rendering]** [§11.14; Systemic A; resolves the HUMAN-DRAFT block] — your focal-point tableau is finished prose, but it's stranded inside a `/* … */` comment, so MAN-160 currently renders with **no lead-in** — it jumps straight to the skill check. Promote it to live prose (the HUMAN-DRAFT block is for content left *for* a human; you've written it, so it ships), drop the "glowing," and fix the `*refuse*` markup.

Before (lines 347–352, commented out — does not render):
> /* %%% HUMAN-DRAFT %%%
>
> At the centre of everything is the marking: five lines lightly glowing chalk meeting in a rough star, half-smudged already by bare heels and spilled wax. Cheap tealights gutter in a loose ring around it. The air smells of citronella, sweat, and something thicker.
>
>    %%% END %%% */

After (live prose, comment delimiters removed):
> At the centre of everything is the marking: five lines of chalk meeting in a rough star, half-smudged already by bare heels and spilled wax. Cheap tealights gutter in a loose ring around it. The air smells of citronella and sweat and something thicker.

Before (success, line 358):
> You plant your feet on the warm dock boards and *refuse*.

After (success):
> You plant your feet on the warm dock boards and //refuse//.

Rationale: un-comments your tableau so the passage reads (this is the spine Composure beat — it needs its setup); "lightly glowing" → "of chalk" per card 18; `*refuse*` → `//refuse//` (renders). The success/failure branches (the buckle, the candle-wax jolt) are strong and on-thesis — otherwise untouched. (Meaning change: the lead-in now actually appears.)

---

### `MAN-165 The pattern is the thing` — [manitoulin.twee:382](../src/content/manitoulin.twee#L382)

**20. [AI-ism]** [§7.1 dash] — paired em-dashes around the appositive list.

Before (line 395):
> The chalk lines. The candles. The way everything—the bodies, the moans, the need—seems to radiate outward from this stupid little diagram like it's the centre of the universe. It started as a party trick. Dollar-store crap. A dare. And somehow it worked.

After:
> The chalk lines. The candles. Everything in the room — the bodies, the moans, the need — radiating out from this stupid little diagram like it's the centre of the universe. It started as a party trick. Dollar-store crap. A dare. And somehow it worked.

Rationale: keeps one spaced em-dash pair (house style, and it's doing list-aside work) but recasts so the sentence isn't double-clause-interrupted; "radiate outward" → "radiating out". The "party trick … a dare … and somehow it worked" reveal is excellent and on-design — kept verbatim. (Meaning change: no.) *Light — if you'd rather zero dashes here, I'll use a colon: "Everything in the room: the bodies, the moans, the need, all of it radiating out…"*

---

### `MAN-170 Break the circle` — [manitoulin.twee:406](../src/content/manitoulin.twee#L406)

**21. [draft]** [MANITOULIN.md §5/§6 intervention] — placeholder → lead-in prose. The four cosmetic-choice links stay exactly as written (targets unchanged).

After (prose body, above the four existing links):
> Your hand is flat on the chalk. The lines are just lines, powder and grit, already smearing where you've leaned into them.
>
> It would take so little. A scuff, a kick, anything that turns the shape into not-a-shape.
>
> The heat is still in you, the pull, the part that wants to lie down in the middle of it and stop fighting. You use the other part. The one that decides things.
>
> [[You drag your foot through the chalk.|MAN-175 Cut wire]]
> [[You kick the candles apart.|MAN-175 Cut wire]]
> [[You haul a chair across the marking.|MAN-175 Cut wire]]
> [[You pour melted ice over the diagram.|MAN-175 Cut wire]]

Rationale: the recognition-and-act beat (§6) — concrete, unglamorous; the four options are pure flavour and converge per §5. (New content; links untouched.)

---

### `MAN-175 Cut wire` — [manitoulin.twee:427](../src/content/manitoulin.twee#L427)

**22. [draft]** [MANITOULIN.md §7 collapse] — placeholder → prose only. **The entire `<<silently>>` grant block (influence math, set-once guards, skill grant) is untouched** — I draft only what follows `<<page>>`.

After (prose body):
> The shape comes apart and the whole world lurches.
>
> For one second the music is suddenly enormous, some bright stupid pop song that's been playing this entire time and that you never once heard. Then it cuts out mid-chorus, like a plug pulled from a wall.
>
> And the room lets go.
>
> You feel it leave you first. The heat, the pull, the lovely reasonable wanting, gone between one breath and the next, like a wire snipped clean. Around you the sounds change. A moan falters. Someone says "what" in a small, lost voice. Somewhere a woman begins to cry.
>
> [[The party surfaces around you.|MAN-180 Surfacing]]

Rationale: the cut-wire collapse (§7), and "you feel it leave *you* first" keeps her non-immune — she was under it too (§0). (New content.)

---

### `MAN-180 Surfacing` — [manitoulin.twee:463](../src/content/manitoulin.twee#L463)

**23. [draft]** [MANITOULIN.md §7] — placeholder → full passage. People surface cold and ashamed; humanity returns in specific details.

After (prose body):
> They come up like divers, all at once and too fast.
>
> A man sits back on his heels, blinking, and you watch him notice his own nakedness, then the stranger beneath him, then the dark all around. His mouth opens and nothing comes out.
>
> It happens everywhere at once. People peeling apart, reaching for clothes that aren't near them, saying names that turn out to be the wrong names. A woman with her reading glasses still on and nothing else. A wedding ring on a hand that is holding the wrong hand.
>
> Nobody looks at you. For a different reason now. They can't look at anyone.
>
> [[Someone has to make the call.|MAN-185 Someone has to call this in]]

Rationale: the reading glasses and wedding ring are the design's humanity-returns details (§0/§7); "they can't look at anyone" inverts the earlier "none of them will look at her." (New content.)

---

### `MAN-185 Someone has to call this in` — [manitoulin.twee:481](../src/content/manitoulin.twee#L481)

**24. [draft + directive]** [MANITOULIN.md §3/§7] — placeholder → full passage with the RCMP-vs-civilian report route; universal link text.

After (prose body):
> There's a cordless phone in the kitchen, on the counter by the cold catering trays. You stand holding it while the dial tone hums.
>
> <<if \$player.background eq "RCMP constable">>You identify yourself to the operator, give the road, ask for an ambulance and the OPP. Then you start doing the thing the job trained you for: building it into a report, in your head, while you wait. Twenty-odd adults. No injuries you can see. No crime you can name. Cause of incident, you'd have to leave blank. You'll be leaving it blank for a long time.<<else>>You tell the operator there's been an emergency, people hurt, you don't know how to say it. You give the road. When she asks what happened you open your mouth and there's nothing in it but the dial tone of your own head. None of this is going to hold together. You know that already.<</if>>
>
> [[There's nothing more you can do here.|MAN-190 The drive back]]

Rationale: §3's split — RCMP calls it in officially and starts shaping the impossible report (which is how her account reaches the Branch as a police document); civilians give a statement that won't cohere. Link text made universal (the old "report unfinished in your head" leaned RCMP-only). (New content.)

**25. [glossary candidate — propose only]** [§14.1] — `OPP` appears here and in MAN-200, and the RCMP-vs-OPP jurisdiction is a plot point worth a floatie. Candidate:

> `[! glossary candidate: OPP — jurisdiction]` — suggested entry: *"Ontario Provincial Police. The provincial force covering highways and rural and unincorporated Ontario, including Manitoulin — not the federal RCMP, and not a city service. Why an off-duty Mountie here is a witness, not the responding officer."*

On approval I'll add the key and wrap the first instance (MAN-185).

---

### `MAN-190 The drive back` — [manitoulin.twee:499](../src/content/manitoulin.twee#L499)

**26. [draft]** [MANITOULIN.md §7/§8; resolves the mandated-line directive] — placeholder → full passage. Interior scar (general hidden-world fear, not a phobia), includes the required line.

After (prose body):
> You give your statement twice, to two different officers, and neither time does it come out sounding like anything that could have happened. Eventually someone puts you in the back of a cruiser to run you back to town. Your dead rental can wait for daylight and a tow.
>
> Out the window the bush goes by black and endless. The thing that keeps coming back isn't the bodies or the chalk or the crying. It's how close you came. How reasonable it felt. How a person can step into something like that and never once decide to.
>
> I just wanted to use the fucking phone.
>
> You'll think that a lot, after. It stops being funny early.
>
> [[A week later, the file has a number.|MAN-200 Occurrence report]]

Rationale: includes "I just wanted to use the fucking phone." per the directive; the scar is the broad hidden-world dread ("step into something like that and never once decide to"), not a narrow phobia (§8). **Continuity fix baked in:** her rental died at MAN-105, so she leaves by cruiser, not by driving — the car waits for a tow. Stays in night (consistent with the `night` tag and `$header.time`). (New content.)

---

### `MAN-200 Occurrence report` — [manitoulin.twee:517](../src/content/manitoulin.twee#L517)

**27. [draft]** [MANITOULIN.md §7; mirrors BLK-210] — placeholder → document. The `<<setDate 2003 8 23>>` plumbing is untouched. Mirrors BLK-210's markup exactly.

After (body):
> ```
> <div style="background:var(--sz-ink-3);border:1px solid var(--sz-rule);padding:28px;position:relative;margin-top:8px">
> <span class="stamp" style="position:absolute;top:14px;right:14px;transform:rotate(-8deg)">Classified</span>
> <div class="eyebrow --brick" style="margin-bottom:14px">Incident File · 03-MAN-0816 · Extract</div>
> <div style="font-family:var(--sz-f-mono);font-size:12px;line-height:1.8;color:var(--sz-cream-soft)">
> <p>INCIDENT DATE: 2003.08.16. <<if $player.background eq "RCMP constable">>Flagged from an off-duty RCMP member's occurrence report, filed through <span class="redact" style="width:90px"></span> detachment 2003.08.18.<<else>>Flagged from OPP general occurrence log, <span class="redact" style="width:70px"></span> detachment, 2003.08.18.<</if>></p>
> <p>LOCATION: private residence, <span class="redact" style="width:130px"></span>, Manitoulin Island. Twenty-three adults on scene. No fatalities. No injuries consistent with assault. No charges laid.</p>
> <p>WITNESSES (22): no coherent recall of a period of approx. <span class="redact" style="width:40px"></span> hours. Reports of a "party," embarrassment, waking undressed. Statements do not corroborate one another, or the scene.</p>
> <p>WITNESS (1): full and consistent recall. Describes a five-point figure marked in chalk on the dock, ringed with candles, and its deliberate disruption. Figure photographed and logged. No determination as to function. Classification: <span style="color:var(--sz-brass);font-style:italic">pending review</span>.</p>
> </div>
> </div>
> ```

Rationale: the marking is *documented but not certified* ("five-point figure… no determination as to function", §7); 22 witnesses with missing time vs. one coherent account; RCMP-vs-civilian provenance per §3. Clinical, "pending review" non-resolution per §13.5, exactly as BLK-210. (New content; "twenty-three" reconciles with MAN-120's "at least twenty.")

---

### `MAN-205 Recommendation` — [manitoulin.twee:536](../src/content/manitoulin.twee#L536)

**28. [draft / voice]** [MANITOULIN.md §6/§7; NPC-handler §6.2–6.3; mirrors BLK-215] — placeholder → Flett recommendation memo. **The `<<link … CC-500 …>>` + `incitingIncident` + `setDate 2005 9 12` setters are byte-identical to the existing block.**

After (body):
> ```
> <div style="background:var(--sz-ink-3);border:1px solid var(--sz-rule);padding:28px;position:relative;margin-top:8px">
> <span class="stamp" style="position:absolute;top:14px;right:14px;transform:rotate(5deg)">Eyes Only</span>
> <div class="eyebrow --brick" style="margin-bottom:14px">Recruitment Recommendation · R. Flett · 2003.08.23</div>
> <div style="font-family:var(--sz-f-mono);font-size:12px;line-height:1.8;color:var(--sz-cream-soft)">
> <p>Re: <span class="redact" style="width:130px"></span> (subject, file 03-MAN-0816).</p>
> <p>Event classification: NYSE. Focal condition, marked locus, residence-scale scope. Active when the subject arrived. Ended when she broke the marking.</p>
> <p>Twenty-three people in that house and the subject is the only one who can tell us what happened in it. She walked in looking for a telephone, went all the way to the centre of an event that had taken everyone else, felt it begin to take her, and ruined it anyway. By her own account she nearly didn't. I find the account more convincing for that.</p>
> <p>Recommend contact inside thirty days. She is field-eligible, pending evaluation. The quality is not immunity. Nobody in that house was immune, and neither was she. It is staying able to see the shape of a thing while it works on you, and then wrecking the shape. That is rarer than nerve, and it is what we are short of.</p>
> <p style="margin-top:14px">— R. Flett, Branch</p>
> </div>
> </div>
>
> <<link "The file closes." "CC-500 Summary">>
> <<set $player.incitingIncident to "the Dark of Manitoulin">>
> <<setDate 2005 9 12 "morning">>
> <</link>>
> ```

Rationale: the dry gap (§5.1) — clinical classification, then "Ended when she broke the marking." straight-faced; "I find the account more convincing for that" is Robert's understated precision (NPC-handler §6.2) and the "In my experience" frame rendered as register rather than a spoken pivot; "what we are short of" carries his quiet worry that he's sending limited-options people into things built to take them (NPC-handler). "ruined it… wrecking the shape" calls back to MAN-170; "broke the marking" stays method-agnostic (covers all four MAN-170 choices). (New content.)

**Glossary note (propose, don't add):** as in BLK-215, **leave "NYSE" unwrapped here** — the bureaucratic opacity is the point at this beat, and a hover-definition inside the classified document undercuts it. Let INTRO carry the first `<<term "NYSE">>`.

---

## Tag-candidate note

No new `storyTags` minted. The choice-derived forks the design considered (failed the deep hold; reasoned the structure) are already captured as `$player.flags.*` in the locked plumbing (`manFocalFailed` / `manStructureReasoned` etc.) and MANITOULIN.md §8 says **don't pre-mint** the tags. Nothing proposed.

---

## Verification plan (Stage 4, after approval)

After applying approved cards:

```powershell
$env:TWEEGO_PATH = "_tools/tweego/storyformats"
& _tools/tweego/tweego.exe -o sizzle/output.html sizzle/src/
```

Then play CC-300 → select Manitoulin → through the flashback → CC-500, confirming mechanics untouched: `$player.incitingIncident = "the Dark of Manitoulin"`; `$nyse.influence` lands +2 (held) / +3 (deep-immersion failure at MAN-145 or MAN-160); exactly one skill point granted by play pattern (Composure if MAN-160 held / Academic if MAN-165 reasoned / Confrontation otherwise); re-entering the flashback stacks neither grant nor influence; the footer clock reads Aug 16 2003 through the flashback, Aug 23 at the report, and resets to Sept 12 2005 by CC-500; no single background render exceeds the 200-word ceiling. Spot-check that the `//italics//` conversions and promoted MAN-160 lead-in render correctly, and (if approved) that the new `cell phone` / `OPP` glossary floaties resolve.
```
