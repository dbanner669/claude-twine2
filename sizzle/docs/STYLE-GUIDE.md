# Sizzle — Writing Style Guide

*Living document. Update after every major writing or revision session — new pitfalls caught, new rules earned, new annotated examples.*

---

## 1. What This Document Is

The complete style guide for prose in Sizzle. Universal craft principles, AI-pitfall warnings, and Sizzle-specific rules in one place. Other docs cover what this one doesn't:

- [docs/GDD.md](GDD.md) — narrative design, structure, mechanics intent. The *what* of the story.
- [docs/NPC-handler.md](NPC-handler.md) — Robert Flett's full profile. The first worked NPC voice.
- [docs/STORY-TAGS.md](STORY-TAGS.md) — `storyTags`, `quirks`, `kinks` reference.
- [docs/WRITING-TODOS.md](WRITING-TODOS.md) — open prose-level revisions.
- [docs/WRITING.md](WRITING.md) — short index + current writing scope.
- [CLAUDE.md](../CLAUDE.md) — broader project + design-system orientation.

This guide is the *synthesis layer*. It does not restate those documents — it tells you how to write the prose that makes them real.

---

## 2. House Voice — Sizzle in One Page

Sizzle is a **literate erotic thriller**. Every word in that phrase carries weight.

- **Literate** — the prose is observant, specific, trusts the reader. The narrator notices the colour of the light on limestone, the way a man stirs his coffee exactly three times, the smell of bacon grease that's been in the ventilation since before the [Diefenbunker](#) was built. The reference points are real and adult. No hand-holding. Think le Carré crossed with a writer who actually knows what desire feels like.
- **Erotic** — this is erotica, not erotica-adjacent. When sex arrives, the writing arrives with it: vivid, physical, written to arouse, in working language. No "her sex," no "her womanhood." The body is real. Heat is the deliverable.
- **Thriller** — infiltration is the spine. Cover identity is the daily mechanic. Tradecraft, observation, paranoia, and the slow accumulation of stakes are the texture even in scenes where nothing overtly thrilling happens.

The three registers are not in conflict. **Porn and plot are not in conflict.** Both serve story, and story is king. A sex scene that doesn't reveal character is failing the same way a briefing scene without subtext is failing.

### The dramatic irony at the centre

NYSE *is* supernatural. The Branch will never call it that. The institutional vocabulary — NYSE, "anomalous," "atypical," "the focal point," "cognitive risk" — is a bureaucratic veneer drawn over things that, when you stop and look at them, are impossible. The reader is in on the joke. The Branch is, mostly, not.

The clinical voice is funny *and* unsettling because it's a coping mechanism that almost works. Robert says "ass fisting" in a briefing without changing his face. The escalation patterns at Sizzle are described in personnel-form language.

**Write to the form. Trust the reader to feel the gap.**

### What the player character sounds like

She has a pulse and a sense of humour. Two years at the Branch — trained, not a rookie. She notices things. She has opinions about Robert, about Toronto, about the men at the counter reading the same section of the *Citizen*. She is the camera and the camera has a personality. Her interiority is not a clinical instrument; it is a particular woman thinking.

She is also under construction. Some of her — name, background, inciting incident, the small physical facts — comes from character creation. The voice underneath stays consistent: smart, observant, dry, sexual without being performative, capable of fear without being undone by it.

### What the reader feels

The reader feels like they are inside a competent, sexy, slightly weird thriller written by a person who respects them. They laugh at the dryness, register the texture of 2005 Toronto, get aroused when the writing is doing arousal, and feel the cold finger on the back of the neck when something at Sizzle stops adding up.

Every rule below is in service of that.

---

## 3. Voice and POV

### 3.1 The Character Voice Test

The single most important rule: **would this specific character think this specific thing in this specific moment?**

Applies to:

- Dialogue
- Internal thought
- Narrator description (the narrator is the player character — second person, but her interiority)
- Similes and metaphors (use sparingly regardless)
- Exposition delivered through anyone's mouth

Every metaphor, simile, and descriptor must pass through the POV character's filter. If the narrator describes Robert's voice and the word "recitative" appears, it fails — the player character is not reaching for music-conservatory vocabulary.

**Words to watch:** any descriptor that belongs to a specialized discipline the POV character doesn't inhabit. Academic, musical, architectural, religious, tech/computing terms — unless the character (background-dependent) would actually reach for them. The grad student background buys you more academic vocabulary. The RCMP background does not.

### 3.2 POV and Address

- **Second person, present implied.** "You're early. You're always early for Robert."
- **The "you" is the player character — but the second person is an invitation.** The "you" is not a neutral camera and it is not a generic "the reader." It is a specific woman whose interiority drives the narration, *and* it is the form by which the player/reader is invited to inhabit her more intimately than a third-person narrator would allow. That doubleness is the point. When she notices the colour of the light or the way Robert stirs his coffee, the player is given the noticing as her own. When she feels arousal or fear or amusement, the player is given the feeling. Write to both at once: lines that are sharp enough to be a specific woman's specific thought, and open enough that the player can step inside the thought as if it were theirs.
- **The pronouns are she/her** when the player character is referred to in the third person (rare — usually only in Branch documents, file extracts, or NPC dialogue). The "you" address is the default voice.
- **Background variants** appear via `<<if $player.background eq ...>>` blocks. Each variant must sound like the same woman with different prior years — not four different narrators. The branches should be *parallel*: same structural beat, different sentences. Each variant should typically be one or two sentences — the conditional is shading, not a rewrite. A reader of any one playthrough doesn't know the others exist; the writer must.

### 3.3 Don't Over-Explain

The reader is smart.

- **Labels get cut.** "She felt a surge of desire" → cut or convert to physical sensation.
- **Thought stays.** "What the hell was that?" / "No shit, Bob." → the character's mind working.

If a line could be preceded by *"Dear reader, you were feeling…"* it's a label.

### 3.4 Character Actions vs. Narrator Commentary

End scenes on images, actions, or silence. Not on narrator thesis statements.

- ✅ "He turns south, toward the office." (action)
- ✅ "Wednesday. Ten o'clock. ID photos." (image, fragmentary)
- ❌ "She realized this was the beginning of something she couldn't take back." (narrator commentary — cut it, the previous line already did the work)

### 3.5 Interiority Is Showing (When the Character Is Thinking)

"Show don't tell" does not mean converting every interior beat to a body reaction. When the character is genuinely thinking — assessing, questioning, processing — that thought *is* showing. It shows who she is.

- A flushed cheek tells you something is happening.
- A thought ("*In my experience.* Robert has seen cases like this before.") tells you *who* is experiencing it.

Both have their place. Don't reflex-convert one into the other.

### 3.6 Show Don't Tell Means Convert, Not Delete

When a passage is told badly, the fix is to show it better — not to cut the content. A character's backstory doesn't become optional because the original delivery was clunky.

After every revision, check: is any character info, plot setup, or reader signal from the original now missing? If yes, it goes back in — delivered better.

---

## 4. Setting Fidelity

### 4.1 Period — September 2005 onward

Pre-smartphone, pre-condo-boom, pre-social-media-panopticon. The texture matters; the bludgeoning of period references doesn't.

**In:**
- Flip phones, BlackBerrys for the corporate. Home internet — research happens at the laptop, not at the table.
- Facebook is a college thing. MySpace is for bands. People can plausibly disappear into a scene without a digital trail.
- Streetcars on Queen, Osgoode and St. Andrew subway stops, taxis if you're in a hurry. No Uber.
- *Globe and Mail*, *Toronto Star*, *Now*, *Eye Weekly*. The *Ottawa Citizen* on a diner counter.
- Music, politics, TV, slang of the era — used sparingly, never as decoration. Period detail earns its place by doing other work simultaneously (character, mood, atmosphere).

**Out (anachronisms — caught at draft time, killed at revision time):**
- Smartphones, group chats, "googling" something at the table, push notifications.
- Streaming services that didn't exist yet (Netflix was DVDs by mail; Spotify launched 2008).
- Justin Trudeau as a political figure. Pierre is "Trudeau" in 2005; Justin doesn't lead the Liberals until 2013. A line like *"since the Trudeau government — the first one"* reads forward-looking to a contemporary reader, but in-world there's only ever been one Trudeau. The qualifier doesn't exist yet. Either drop the modifier, or, better, anchor the civil-servant detail on something period-accurate — *"worried that the minority Liberal parliament might lose a confidence vote"* puts you in the Martin government in 2005 and earns the verisimilitude the joke was reaching for.
- Post-2006 cultural references. If you're tempted by a 2010s neologism, find the 2005 equivalent or cut.

### 4.2 Geography — Ottawa vs. Toronto vs. Northern Ontario

The greybox lives in Ottawa. The game proper lives in Toronto. The Branch's wider operations live in the north. These are three different textures.

**Ottawa** (briefing scenes): government-town quiet. Bank Street south of Gloucester, civil servants in lanyards, limestone, the OC Transpo bus, the *Citizen*. Conservative, walkable, unremarkable on purpose. The diner is brown vinyl and weak-tea light. This is where the Branch hides because Ottawa is excellent at hiding things in plain sight.

**Toronto** (Act 1 onward): the contradictory city. West Queen West specifically — the Drake era, the gentrification fight, the lingerie store with topless dancers in the window during business hours, Queen Video filing porn alphabetically with everything else. Stratified, multicultural, social strata mixing freely only in the rooms where mutual secrecy enforces it. Streetcars, brick, October light.

**Northern Ontario / Shield country** (Robert's background, possibly the player's): the Sault-to-Thunder-Bay corridor. The Canadian Shield. Closer to Winnipeg or Duluth than to the GTA. Leaving home meant *leaving*. This is geography, not heritage — see §6.4.

**Real streets, real places.** Bank Street in Ottawa. Queen Street West in Toronto. Carp for the conservation-club shooting range (NCR, ~30 min from downtown Ottawa). Specific named locations earn trust. If you're unsure, look it up or get a smaller, more confident detail.

### 4.3 The Diner-and-Globe Register

The briefing voice has a particular density: government men reading newspapers in unremarkable rooms, talking around what they're talking about. Period-accurate Canadian. Civil-servant cadence. Look at INTRO-100 through INTRO-115 for the worked example. This register dominates the prologue. It will share screen time later with Queen West's louder, sharper, more sexual register, and the contrast itself becomes a tool.

---

## 5. World-Bible Voice Rules

### 5.1 NYSE — The Bureaucratic Veneer

NYSE *is* supernatural. The Branch refuses to call it that. The reader is in on it.

The rule is not "avoid the word supernatural because nothing supernatural is happening." The rule is:

- **In-world voice never reaches for "supernatural," "paranormal," "magic," "occult."** The Branch's vocabulary has been chosen across decades to drain wonder out of the impossible. Use it: *NYSE, anomalous, atypical, influence patterns, intrusive ideation, focal point, cognitive risk, the indicators.*
- **The player character speaks Branch when she's on the clock.** Internal narration too. "Sorry, the NYSE." Two years of training means she catches herself the way Robert catches himself, and she also *knows what she's doing* — the parenthetical correction is dry snark from her, not earnest self-correction. She's the woman who thinks "no shit, Bob." in a briefing. The institutional vocabulary is something she wears, not something she is.
- **The dramatic irony is the writer's tool.** When the prose underplays an obviously impossible thing with personnel-form language, the gap between the form and the content does the work. Don't close the gap by editorializing.

> "Ass fisting," he says dryly.
>
> You raise an eyebrow. He gets an imp-like glimmer in his eye. He's giving you shit.
>
> "The escalation is the signature."

Robert is briefing on cognitive contamination at a sex club. The prose is talking about coffee mug rotations.

### 5.2 The Branch — Texture and Tone

- **Bureaucratic, not parodic.** Real government agency. Forms, expense reports, mortgages, office birthdays, security clearances, institutional pride. Not played for laughs at the institution's expense — the people who work here take serious work seriously.
- **CSIS-secrecy professionalism crossed with Service Canada or CRA procedural texture.** The agency has existed for decades. It has internal politics, institutional memory, quiet competence.
- **Dark humour is real-professional humour** — the dryness people develop after years of doing difficult work together. Not for the audience. Robert never *performs* his dryness; it's just how he sounds.
- **The bureaucracy may be partly a performance.** Half the forms may be destroyed further up the chain. Never confirmed, never denied. This is theme, not punchline.

### 5.3 Cover Identity

Cover is central. Inside Sizzle, NPCs know a different woman than the one the reader is following. Every scene where the player is in cover has at least two layers running at once: what she is performing, and what she is actually thinking.

This is structural and the prose has to handle it. Treatment:

- Real-name narration when the player is alone, at home, or with Robert.
- Cover-name dialogue when she's on, with internal narration tracking the gap.
- Slips, near-slips, and the work of maintaining the surface — that's *gameplay*, surfaced as prose.

[? Open question — does cover-voice deserve its own sub-style section once Act 1 is being written? Park until first Sizzle-interior content exists.]

### 5.4 The Player's Cover Inside Sizzle

She's a young woman who needed a job, took the bartender/hostess/coat-check role, has a vaguely plausible backstory. NPCs see what she lets them see. The player character knows what she really is. The prose tracks both. Cover-identity sentences should not feel safe.

---

## 6. Character Voice Profiles

NPC voice work lives in per-character profile docs. This section establishes the template and walks through the first worked example.

### 6.1 The Profile Template

For each profiled NPC, the writing-relevant fields are:

- **Cadence** — pace, rhythm, comfort with silence.
- **Vocabulary register** — what disciplines they reach for; what kinds of words feel foreign in their mouth.
- **Tells** — the small physical or verbal moves that mark them as themselves.
- **What they don't say** — silences, evasions, things they would never put in a report.
- **How they fail (charmingly or otherwise)** — the seams where the polished version slips.

**Important: a profile is not a straightjacket.** Tells exist so the writer knows the character has a body and a pattern, not so every scene the character appears in has to deploy them. A character who stirs their coffee exactly three times in every scene becomes a tic, then a parody. Deploy tells sparingly — when the moment wants the character to feel familiar, when a beat needs grounding, when the gesture is doing real work. Most scenes the character appears in will not feature a single one of their listed tells, and that's correct. Read the profile to know who the person is. Then write the person — don't deploy the profile.

Robert's full profile lives in [NPC-handler.md](NPC-handler.md). Read it before writing his dialogue.

### 6.2 Robert Flett — The Worked Example

- **Cadence:** Northern Ontario. Unhurried, not slow. Doesn't fill silences. Briefs in structured chunks with deliberate pauses where the weight lands.
- **Vocabulary register:** Government-speak as his second language for NYSE — fluent, but with seams. Occasional phrase ("In my experience —") that reveals a deeper, pre-Branch frame of reference. Catches himself, switches back to the form.
- **Tells:** Coffee mug rotation when choosing words. Adds one cream, stirs exactly three times. Folds papers before the sentence is finished. Pays for coffee out of pocket, never expensed. Carries the *Globe* like a prop on meets.
- **What he doesn't say:** His personal life. Where the knuckle scars came from. What he's seen north of 60 that doesn't translate into NYSE classification codes. How much of the institutional certainty in his briefings is genuine vs. performed for the player's morale.
- **How he fails:** Pauses. Looking at his coffee instead of at the player. The microsecond of professional discomfort when he reads from the personnel form about needing a "credibly attractive woman under thirty."

His humour is not stand-up. It is *dryness*. Small-town Canadian understatement deployed as institutional coping. Describing a terrifying NYSE encounter as "a bit unusual." Calling the escalation pattern of mind-control swingers "ass fisting" in the same tone he uses for the budget.

### 6.3 The "Government Version" Pivot

Recurring move in Robert's dialogue, and probably in other Branch-lifer NPCs as they emerge. He starts to say something from lived experience — *"In my experience —"* — then catches himself and restarts in clinical language. This is a *deliberate writing tool*. It surfaces the gap between the Branch's official position and what its officers actually know. Use it. Don't overuse it.

The skill-check reward in INTRO-335 is the player noticing this happen. Skill-gated noticing of the pivot is one of the cleanest mechanics-as-prose patterns in the greybox.

### 6.4 Indigenous Representation — Métis vs. Shield Country

These are two different things. Conflating them flattens both.

- **Métis** is heritage. One of three constitutionally recognized Indigenous peoples of Canada (alongside First Nations and Inuit). Robert is Métis. This is a fact about who he is, his family, his community of origin, the framework his elders used for talking about what the Branch now calls NYSE.
- **Shield country / Northern Ontario** is geography. The Sault-to-Thunder-Bay corridor on the Canadian Shield. A 10–12 hour drive from Toronto. It is where Robert grew up, but the geography is shared by many people — settlers, Cree, Ojibwe, Métis, French-Canadian, mining-town descendants. Calling someone "Northern Ontario" tells you about climate, distance, and small-town texture. It does not tell you about heritage.

**Rules:**

- Use `<<term "Métis">>` for heritage. Use `<<term "Shield country">>`, `<<term "Sault">>`, `<<term "Thunder Bay">>`, "Northern Ontario" for geography. Don't substitute one for the other to "vary the wording."
- The `Northern Ontario` storyTag (from RCMP constable background) is a *geography* tag. It does not imply Indigenous heritage on the player character.
- Robert is not the wise Indigenous elder. He is a career government employee who happens to be Métis and happens to have a framework for understanding NYSE that predates the Branch. That background enriches him; it does not define him.
- Don't write Indigenous spirituality as plot device. If Robert's pre-Branch frame surfaces, it surfaces as *what it is to him* — family knowledge, things his grandmother said, a word in Michif — not as exotic colour.
- Don't deploy Indigenous content for atmosphere. It is part of a person, not a vibe.

When in doubt: name the specific thing. *His grandmother's word for it. The Shield. The lake outside Marathon. Lakehead.* Specific beats generic.

---

## 7. Prose Mechanics

### 7.1 Em-Dashes

Use sparingly. Known AI tell.

- **No spaces around them.** Correct: `word—word`. Wrong: `word — word`.
- One or two per page is fine. Four in a paragraph is a red flag.
- After drafting, search for spaced em-dashes (`" — "`) and fix every instance. Mechanical check.
- Count total per passage. Reduce if it's getting heavy.

[! Note: existing greybox passages use spaced em-dashes throughout. This is house style for this project for now — *spaced* em-dashes are kept because they read more naturally in EB Garamond at the body size we render. Do NOT auto-strip the spaces on existing passages. The "no spaces" rule above is the template default and is overridden here. Reassess when type-rendering work happens.]

### 7.2 One Space After Periods

We aren't using typewriters. One space.

[! Note: existing passages use two spaces after periods (`.  `) throughout — this is a quirk of the source format and reads as one space in the rendered output. Leave existing source alone. Author new prose with one space; lint will not flag either.]

### 7.3 Sentence Variety

Mix short punches with longer rolling sentences. Uniform sentence length reads as monotone. Vary rhythm by emotional register — short and staccato for tension, longer and more fluid for surrender or interiority.

> "The diner smells like coffee that's been on the burner since six and bacon grease that's been in the ventilation since before the Diefenbunker was built. A place on Bank Street south of Gloucester, no sign worth reading, where the booths are brown vinyl and the light is the colour of weak tea." → long, rolling, atmosphere.
>
> "Nobody looks at you twice, which is the point." → short, punctuating, function.

### 7.4 Specific Physical Details Are Pictures, Not Labels

"Tan lines from her sports bra forming an X across her chest" is a picture. "Tan lines from her sports bra" is a label.

For every physical detail, ask: *can the reader draw this?* Choose the picture.

> "Working hands, scarred across the knuckles." → picture.
>
> "Hair going grey at the temples." → picture.
>
> "A jacket that's seen better years." → picture (specifically: the wear is doing the work).

### 7.5 Tricolons

Three-item lists must earn the third item. "Soft, pillowy, heavy" — are these three different things or one said three times? Default to the strongest single detail. Tricolons are fine when each item contributes genuinely different information.

> ✅ "Bartender, hostess, coat check — whatever they're hiring for." (three real options, function)
> ❌ "Soft, supple, yielding." (one image said three ways)

### 7.6 Swearing

Blunt and earned. Characters in extreme situations curse. When profanity arrives, it should land with weight.

> "Well fuck you too, junior." — Robert, registering needling, in his voice.
>
> "No shit, Bob." — internal, the player.

The fact that the prose around them is genteel makes the swearing hit harder. Don't pepper it.

### 7.7 Dialogue Voice

Characters should sound distinct and consistent. Age, education, personality constrain word choice. Read every line aloud and ask: would *this specific person* say this?

**Exposition must pass the character voice test.** When a character explains plot-critical information, the explanation must sound like that character talking. The temptation to let an NPC become a clean narrator-mouthpiece is strongest in briefing scenes. Robert resists this by sounding like Robert — structured, pause-laden, occasionally pivoting from lived-experience to government version.

### 7.8 Timeline References Stay In-World

Don't reference story time as proper nouns ("On Day 3," "In Week Two") unless characters actually number their days that way. Natural markers: "the first time," "a few days ago," "by Wednesday," "two years in."

### 7.9 Stagey Delivery

"She closed her eyes, smiled, and whispered to no one" is theatre. A character whispering with no audience reads as performing for the reader. When a thematic beat needs delivery without an audience, *direct thought* is stronger than whispered soliloquy.

---

## 8. Passage Mechanics — Sizzle Specifics

### 8.1 Length

- **Aim: 80–120 visible words per passage.**
- **Hard ceiling: 200 words.** Lint warns over 200; the answer is almost always "split this beat."
- The player should never have to scroll the game window.
- **One beat per passage** — a moment, a reaction, a short dialogue exchange.
- Conditional variants (`<<if $player.background eq ...>>`) count the **longest single variant**, not the total source. A passage that renders at 110 words for any one background is fine even if the source has 300 words of branched content.

### 8.2 Click-Throughs Over Scrolling

Scrolling kills momentum. The click is what keeps the reader moving. Split long scenes into multiple click-through passages — that's why beats are small. Each click is a heartbeat.

If a passage is creeping toward the ceiling, ask:

1. Is there a natural breath halfway through? (A line of dialogue, a beat of action, a shift of attention.) Split there.
2. Can any of this be moved into a conditional that won't fire most playthroughs?
3. Is the prose padded? Can I cut three sentences without losing information? (Run the info-audit from §15.)

### 8.3 One-Beat Discipline

A "beat" is what changes between the start and end of the passage. If you can't name what changed, the passage isn't doing work. Possible beats:

- A line of dialogue and the reaction to it.
- A shift in posture or position.
- An observation that becomes a small decision.
- An NPC entering or leaving.
- Time passing in a way that matters.

A passage that delivers two beats has either been written too long or needs to be split.

### 8.4 Header and `<<header>>`

Most scene passages open with `$header.location`, `$header.time`, and the `<<header>>` widget call. This is mechanical, not stylistic — set them silently, then write the prose. See INTRO-100 for the pattern. Header changes (Robert arrives, the player moves outside) are themselves beats and warrant their own passage break.

---

## 9. Link Text Rules

**Link text must always be a complete sentence.** No single-word or fragment links embedded in prose.

The three valid forms:

### 9.1 Player-Character Dialogue

A line the player character speaks. Quoted, sentence-form, period at end (or question mark, exclamation if the line calls for it).

> `[["What's the risk assessment?"|INTRO-520 Question risk]]`
>
> `[["Walk me through the operational setup."|INTRO-400 Apartment]]`
>
> `[["You look tired."|INTRO-200a Personal]]`

### 9.2 Narration

A sentence of narration that describes what the player character does next — action, observation, gesture. Present tense, second-person implied or explicit.

> `[[The weight of those words settles over the table.|INTRO-205 Field placement]]`
>
> `[[You raise an eyebrow.|INTRO-210 Swingers club]]`
>
> `[[The one thing that doesn't match is his hands.|INTRO-115 Morning]]`

### 9.3 Continue

The fallback when the next passage is a continuation of the same moment and neither dialogue nor a fresh narration beat belongs here. Use sparingly — `Continue` is the lowest-information link. If a beat could be a narration link, prefer that.

> `[[Continue|INTRO-105 Waiting]]`

### 9.4 What Links Must Never Be

- **NPC dialogue.** Robert never speaks via the link. If he says something, put it in the prose and use a narration or Continue link to advance. The player picks the player's words, not anyone else's.
- **Single words or fragments.** "Sip." "Wait." "Onward." Failed. Sentences only.
- **Generic prompts.** "Next." "More." Continue is the one allowed generic.
- **Setter-syntax with no surface change to text.** If you need `[[text|Target][$var to val]]`, the setter does its work — but the text in front of the user still has to be one of the three valid forms.

---

## 10. Tone and Humor

### 10.1 Playful With Teeth

Default register is fun, sharp, self-aware. The player character has an active sense of humour. So does the world — but it's *dry*. Real-professional humour, not punchline humour.

**The teeth are real.** The comedy makes the serious moments land harder *because* the reader is used to laughing. The silence where a joke should be is its own signal.

### 10.2 What's In Bounds

- Gallows humour. The Branch's institutional dryness as coping mechanism. Robert calling escalation "ass fisting" with a straight face.
- Period-appropriate pop-culture references, used sparingly. Character-appropriate — a 2005 CSIS analyst's references are not a 2005 grad student's references.
- Self-aware narrator wit — "No shit, Bob." "Ah, there it is."
- Comedy of mundanity — the *Globe* held like a prop, the coffee stirred exactly three times, the limestone going yellow.

### 10.3 What's Out of Bounds

- Quippy comedy at the expense of stakes. Marvel-isms.
- Characters explaining their own jokes.
- Narrator commentary that announces the comedy ("she said, laughing"). If a line is funny, the next line doesn't have to certify that it was.
- Anything that breaks the dignity of Robert or the Branch's professional surface. *Their* dryness is the comedy; commenting on it from outside isn't.

### 10.4 The Funniness Test

**If the text claims something is funny ("she laughed," "he chuckled"), the preceding line must actually be funny.** "She said, and everyone laughed" doesn't make the line funny — it claims it is. If you can't articulate the mechanism (wordplay, irony, deflation, absurdity), the joke doesn't work. Either write a line that earns the reaction, or cut the reaction.

---

## 11. Erotic Content and Sex Scenes

*Forward-prescriptive: greybox contains no sex scenes yet. The calibration must exist before the first scene is written, not after.*

### 11.1 This Is Erotic Fiction — Don't Tame It

When revising sexual material, the revision must be as explicit as the original. Softening a sexual image into a neutral one is not "tightening" — it's changing the register of the novel. If the original shows a character presenting herself sexually, the revision shows the same thing.

**The voice is not coy.** If the character knows where the sweat is running, say it. "Running down into places she didn't want to think about" is coy. "Running between her legs" is direct. Match the register.

### 11.2 Register

Full explicit. Working language. *Pussy, clit, tits, ass, cock, fingers, mouth, tongue.* No "her sex," no "her womanhood," no "her most sensitive spot," no "his manhood." Say what it is.

This holds even — *especially* — when the surrounding prose is doing the literate-thriller thing. The contrast is part of the work. The same prose that knows the colour of autumn light on limestone also knows what a wet finger feels like sliding past a clit. Both registers are the same writer.

### 11.3 Heat Is Required, Earned Heat Is Hotter

- Sex scenes are not clinical, not fade-to-black, not euphemistic. They are vivid, physical, written to arouse.
- Earned heat hits harder. Sexual content that emerges from character dynamics, relationship history, and story tension lands deeper than content arriving out of nowhere. **Anticipation is a mechanic.** Buildup is structural.
- Grinding, teasing, denied entry — these can do more work than immediate penetration. The first contact lands harder if it was withheld.

### 11.4 Sex Scene Structure

- **Establish scope once, then focus on story beats.** One panoramic paragraph sets who is doing what. After that, the camera follows the plot-relevant action. Don't cycle back to panoramic sweeps between every beat.
- **Compress repetitive cycles.** If the same beat repeats, identify which iterations carry unique story information (a new sensation, a new revelation, an escalation, a NYSE-influence breakthrough) and which are rhythm. Keep the iterations that advance character or escalate. Compress or cut the rest.
- **Split across passages aggressively.** The 80–120 word ceiling does not relax for sex scenes — if anything, the click rhythm is *more* important here. A long sex scene is many small passages, each landing a beat. The click is part of the pacing the reader feels.

### 11.5 Physical Logistics in Sex Scenes

- **Track bodies in space.** Where is every limb? Every position change needs at least a half-sentence of transition. The reader must always know where the bodies are.
- **Sensory details must be physically possible from the character's actual position.** If her mouth is somewhere, she can't simultaneously taste something elsewhere. Route impossible sensory information through a different channel — thought, awareness, sight.
- **Track clothing state.** Especially relevant inside Sizzle — uniforms, dress codes, cover-identity outfits. What is being undone, when, by whom. What's still on at the end of the scene.
- **Track who knows what.** In cover, the NPC knows the cover identity. The player character knows her real self. Every encounter is layered. The sex scene cannot forget this.

### 11.6 Cover Identity and NYSE in Sex Scenes

These are the two layers that make Sizzle sex different from generic erotica:

- **Cover identity** means there's always a third presence in the room: the woman the NPC thinks he's with. Sometimes the gap is invisible to the prose. Sometimes it's the whole point of the scene. The player character can be enjoying herself *and* tracking the cover *and* aware of the gap, all at once. The prose has the bandwidth for all three.
- **NYSE influence** means consent itself becomes the question. As `$nyse.influence` rises, the prose can register the ground shifting under the player character — choices that *feel* like hers but are also being made *for* her, attractions that don't match her usual patterns, sensations more vivid than they should be. The eroticism and the horror share the same nerve. The club's surface culture is consent-forward. The supernatural undermines this. That tension is thematic, not incidental — Sizzle is partly *about* consent, influence, and the boundary between persuasion and compulsion.

These are gameplay-adjacent and will sharpen as `$nyse.influence` mechanics develop. For now: write the gap. Trust the reader to feel both at once. [? Living-doc question: as `$nyse.influence` and `$nyse.power` mechanics formalize, this section gets specific guidance on how the prose registers each stage. Keep prescriptions general until then.]

### 11.7 Agency

The player should always have meaningful choices about whether and how to engage with sexual content. When agency is compromised — by NYSE influence — that violation is felt *precisely because* agency was the norm. The mechanic of the choice is part of the prose. Don't write sex scenes that lock the player out of the situation; write sex scenes where the choice the player has just made is what they are now living.

### 11.8 Characters Stay Whole

An NPC the player sleeps with is the same fully realized person before, during, and after. The sex reveals character — who someone is in bed tells you something about who they are. Don't reduce an NPC to body parts in the scene and then expect them to be a person in the next one. Continuity of personhood is the rule.

### 11.9 Paragraph-Start Repetition in Sex Scenes

In extended scenes with two characters, check the first word of each paragraph. If three or more consecutive paragraphs start with the same name, vary entry points: a body part, a sensation, the setting, dialogue, a structural bridge. Mechanical check after drafting.

### 11.10 Word Repetition in Sustained Physical Registers

Words like *slick, heat, pulse, throb, wet* accumulate invisibly in sex scenes. Audit key vocabulary after drafting. Watch **slick** especially — it implies wetness and contradicts dried fluids. Vary vocabulary based on the actual state of the substance and the surface.

### 11.11 Uncanny Vagueness vs. Lazy Vagueness

"Something" is the right word when it points at something genuinely beyond the character's ability to categorize — a sensation that resists being named, a NYSE-tinged shift that doesn't fit any prior framework. The vagueness *is* the point.

"Something" is the wrong word when the writer is dodging specificity. "Something uncomfortable in her chest" is lazy — name it or show it.

The distinction matters more in Sizzle than in baseline erotica because NYSE produces real uncategorizable experiences. Both legitimate uses and lazy uses will appear. Audit by asking: *if the character could name this, would she?* If yes, name it. If no, leave it as "something" — and the reader registers the reach toward language that doesn't quite fit.

---

## 12. Physical Logistics and Continuity

### 12.1 Know the Characters' Bodies

Physical descriptions must be consistent with established facts. Build, scars, tattoos, hair, physical capabilities — these are constraints on all future descriptions. Getting a body detail wrong breaks trust.

The player character's appearance is set at CC-200 (skin tone, hair colour, hair style, eye colour) and reflected in `$player.complexion` / `$player.hairColour` / `$player.hairStyle` / `$player.eyeColour` / `$player.faceShape`. Reference these via `<<print>>` or background-conditional prose rather than asserting fixed traits.

Robert's appearance is fixed (NPC-handler.md §Appearance). Future NPCs get their fixed appearance written into their profile docs at first introduction.

**Check physical logistics of postures.** If a character is in a specific position, their body must work that way.

### 12.2 Weather, Time, and Setting Continuity

If a scene establishes a condition (temperature, time of day, weather), every subsequent reference must be consistent. Easy to miss when the focus is prose quality. After establishing any environmental condition, audit forward.

`$header.location`, `$header.time`, and the `[daytime]` / `[nighttime]` passage tags are continuity scaffolding. Use them.

### 12.3 Character Knowledge Must Be Earned

Characters can only reference information they've witnessed or been told. Before giving any character a line referencing a specific event, trace backward: when did this character learn this?

This matters especially inside Sizzle, where the cover dynamic means NPCs *don't* know real-player information. A Sizzle NPC who suddenly knows the player's real codename has either been told (in which case: when, by whom, and what does that mean) or the writer has made a continuity error.

### 12.4 Know the Objects You're Describing

Don't invent sensory details for objects you're unsure about. If you don't know what sound a specific thing makes, describe the action instead of guessing the sensation. *He set the mug down* is safe. *The mug clicked against the formica with that specific Bakelite hollowness* requires you to actually know that's what diner counters and mugs sound like.

### 12.5 Sensory Similes Must Be Experientially Accurate

A simile must match real experience, not just concept. If you compare a smell to something that doesn't actually smell that way, the reader's trust breaks even if the concept is apt. Use vehicles the reader has actually experienced.

### 12.6 Missing Setup for Physical Details

When a detail appears on a character's body (substance on skin, marks, smell), trace it backward: when did this get there? If the answer isn't in the text, add a beat showing the moment of contact.

### 12.7 Ambiguous Dialogue Offers

If a character says "Want some?" after an action involving one thing, but the intended referent is something else, the reader has no way to know. For any ambiguous offer, read the three preceding lines. What would a reader assume is being offered? If the assumption is wrong, fix the context — don't trust the reader to follow you on faith.

---

## 13. AI Voice Problems and Revision Pitfalls

Documented patterns where AI-assisted writing goes wrong. Watch for all of them.

### 13.1 AI Voice Leaking In

- **Over-crafted metaphors.** Metaphors that sound *written* — polished, literary, composed. "Faint as a bruise you press to check if it still hurts." "The limestone facades the colour of old honey." If it sounds like it belongs in a literary review rather than in the character's head, flatten it. Plainer is almost always better: "the light has changed — that particular quality of autumn sun that makes the limestone go yellow" delivers the same Ottawa-in-September image without the literary varnish.

- **Constructed comparisons as cleverness.** "X was [thing]. Y was [other thing]." Structure draws attention to itself. Flatten.

- **Dual-metaphor and parallel constructions.** "His voice was thunder, but also velvet." "Half dare, half promise." "Equal parts approval and challenge." Too composed. Built → flatten.

- **Narrator profundity at scene endings.** Grand thematic statements at the end of scenes. Cut and end on the previous line — unless the ending is a character action or image.

- **Additive editorializing.** Adding narrator commentary that wasn't in the original. The impulse to "seed dread" or "add subtext" piles interpretation on top of scenes already working.

- **Decorative metaphors that sound like showing.** "Tall enough to bend the air around him." *Sounds* physical but no character would think about air bending. Literary decoration in a showing-not-telling costume.

- **Negation cadence as character beat.** *"He gives you a look — not annoyed, just noting it."* The "not X, just Y" structure is one of the more obvious AI tells. The fix is almost always to deliver the same beat *in the character's voice* instead of in narration-by-negation: let the character say or do something that registers the thing the negation was reaching for.

- **Silence as deliberate device.** *"You let the silence do the work."* *"She let the question hang in the air."* The narrator commenting on the silence dispels the silence. A real beat (a sip of coffee, a raised eyebrow, the next line of dialogue starting before the silence is named) does it better.

- **Religious/literary metaphors in physical descriptions.** "Fingers interlaced like prayer." "As if every patch of skin needed to be baptized." Imposes thematic frameworks that don't belong to the POV character — especially not a recently-recruited Branch agent who isn't reaching for liturgical vocabulary.

- **Tech/computing metaphors.** "As if a new subroutine had been loaded." Comes from the AI's domain, not the character's.

- **Vocabulary register bleed.** Words like *recitative, architectural, liminal* in narrator description when the POV character wouldn't use them.

- **"The engine," "load-bearing," "the cope."** Meta-vocabulary that creeps from craft-talk into prose. These belong in documents *about* the writing, not in the writing itself. Watch also for *"the work,"* *"the stakes,"* *"the texture,"* *"the gap"* used in narration — they're symptoms of the AI describing its own intentions instead of executing them. If a sentence sounds like it could appear in a workshop critique, recast it as the thing the critique would be praising.

### 13.2 Information Loss (the most damaging mistakes)

- **Amputation instead of conversion.** Cutting content that was *told badly* instead of converting it to *showing*. Information disappears with the clunky delivery. (See §3.6.)
- **Losing specific physical details when tightening.** Collapsing a detailed description into a shorter version, losing discrete pieces of information. Each detail does its own work. Before cutting any physical description, list every individual detail it contains. The revision must preserve each one.
- **Cutting "obvious" information that isn't.** Removing a beat because "the reader already knows this." In unprecedented scenes (NYSE incidents, first-time experiences, supernatural events), the reader often does NOT know. The more extreme the event, the more the reader needs confirmation.
- **Meaning drift when replacing metaphors.** The replacement carries a *different meaning*. Drift becomes visible only when you check against the original. Before replacing any metaphor, write down what it means in plain language. Does the replacement say the same thing?
- **Amputating genre-register images while cutting similes.** A simile is over-crafted, so you cut it — but it was carrying specific genre information. When cutting a simile, ask: what information was it carrying? If the answer is a specific image doing genre work, the image needs preserving in a different form.
- **Cutting character signals that serve the plot.** Removing character information because it was delivered clumsily, when the information itself is a plot signal.
- **Setting information disguised as literary decoration.** A landscape description sounds literary, so you cut it — but it carried real information: scale, isolation, spatial relationships.

### 13.3 Revision Instinct Problems

- **Replacing good lines with worse ones.** Changing a line that works because revision creates an expectation of change.
- **Downgrading lines that already show.** The replacement is also physical but less evocative or more ambiguous. If the original works, leave it alone.
- **Changing similes without improvement.** A simile is working — in-register, clear, doing its job. Before changing, articulate what's wrong with the original. "Nothing, I just thought of a different way" → original stays.
- **The revision instinct is itself a pitfall.** The impulse to change things because you're revising is separate from the need to change things because they're broken. If you can't articulate what's wrong, leave it alone.

### 13.4 Narrator and POV Problems

- **Narrator labels disguised as action framing.** "She couldn't move." "She found herself doing X." These frame the character as passive. Valid early when an experience is new and surprising. In later stages, cut the framing and show the action.
- **Narrator asides that break POV.** "She didn't mention that she could now [ability]. If, you know, she wanted." If it could be preceded by "Dear reader," it's a POV break.
- **Collapsing perception into fact.** "She became convinced something was following them" → "Something was following them." The original is subjective experience. The replacement is narrator-confirmed fact. Keep perception as perception — especially around NYSE phenomena, where the player character's certainty *is* part of what's at stake.

### 13.5 Sizzle-Specific Tells

- **Pre-resolving the investigation.** The Branch *suspects* NYSE involvement at Sizzle. The investigation is whether the activity is anomalous, mundane, or a mix — that's the player's job. NYSE is a category label the Branch uses to flag something for investigation; it euphemizes the supernatural without committing to it, and the Branch's whole institutional posture is "we will use this term until the evidence forces something else." Prose that leaks the answer — narration that *knows* a given moment is NYSE-caused, or *knows* it isn't, before the investigation has earned that certainty — collapses the dramatic tension. Keep the player character's perception subjective. She can feel that something is off; she can suspect; she can be wrong. The narrator must not certify what she doesn't yet know.
- **Letting Robert become wise-Indigenous-elder by accident.** He gets one too many sentences about "the land knows things" and the character has slid into stereotype. The fix is specificity — *his grandmother, his lake, the specific phrase she used* — never the abstracted reverence.
- **Conflating Métis (heritage) and Shield country (geography).** See §6.4.
- **Sneaking smartphones, group chats, or post-2006 references into 2005 Toronto.** §4.1.
- **Letting cover-identity NPCs know real-player information.** §12.3.
- **Resolving NYSE moments with narrator certainty.** The player character can be afraid she's being influenced; the narrator should not confirm she is. Subjective stays subjective.

### 13.6 Escalation and Pacing Problems

- **Hedging language at wrong stages.** "Almost" when the sensation has arrived. "Found herself" when the behaviour is no longer surprising. Audit hedge words against the current stage of the player character's NYSE arc.
- **Panoramic sweeps as padding.** Multiple panoramic paragraphs in a scene. The first establishes scope. The rest stall.
- **Echoing distinctive phrases across passages.** A striking phrase appears verbatim in the next passage. Readers register callbacks as repetition. Different language; continuity in the impulse, not the wording.

---

## 14. Glossary Terms, Tagging, and Editorial Markers

### 14.1 Glossary Terms — `<<term "X">>`

Definitions live in `setup.glossary` in [variables.twee](../src/story/variables.twee) — that file is the source of truth for the current term list. Render with `<<term "KEYWORD">>`. This is explicit markup, not automatic text replacement. The lint pipeline catches broken `<<term>>` references.

**When to surface a term:**

- The first time it appears in the prose, definitely.
- Subsequent appearances in dense paragraphs, optionally — too many tooltips in one passage become noise. Use judgement.
- Words a reader could reasonably miss the cultural weight of: regional slang, Canadian-specific references, institutional names, Branch jargon.

**Adding a new term:**

Propose first; don't add unilaterally. Candidates should be:

- A named real-world thing the contemporary reader might not know (period or regional specificity).
- A Branch / NYSE term where the Branch's framing is meaningful in itself.
- A character-flavour callout (Métis, Shield country) that earns a clarifying tooltip without flattening.

Editorial-note convention for proposing a term: drop `[! glossary candidate: NEW-TERM — short reason]` in the passage where you wanted it. Don't add to `setup.glossary` without sign-off.

### 14.2 Tagging Conventions

Three player-carried arrays drive narrative state: `$player.storyTags`, `$player.quirks`, `$player.kinks`. The fourth, `$player.statusEffects`, is temporary modifiers. Full reference: [STORY-TAGS.md](STORY-TAGS.md).

**For writers:**

- **storyTags** — broad narrative flags from background, history, or major story events. Currently: `Northern Ontario`, `City Dweller`, `Lived in Toronto`. Branch on these in prose when the recognition or memory would meaningfully change what the player notices or says.
- **quirks** — personality traits. None implemented yet. When they appear, use them for small dialogue variants and internal-narration shading, not for plot gating.
- **kinks** — sexual preferences. None implemented yet. When they appear, use them for chemistry, scene-variation, and choice unlocks. Kinks should change the colour of a scene, not toggle its existence.
- **statusEffects** — temporary states (Caffeinated, Flustered, Influenced…). Use for in-scene shading and brief mechanical modifiers.

**Naming hygiene:**

- Tags read as short noun phrases (`Northern Ontario`) or short adjectival phrases (`City Dweller`).
- Capitalize as if they're proper nouns. They are, in the game's bookkeeping sense.
- Tags should be specific enough that you know why you're checking them and general enough that you'll use them again. A tag used in only one passage probably should have been a scene flag, not a storyTag.

**Branching on tags:**

```twee
<<if $player.storyTags.includes("Lived in Toronto")>>
You used to walk past this corner on the way to class.
<</if>>
```

Background-derived storyTags are rebuilt in `CC-500 Summary` so they stay accurate when the player changes backgrounds. New background-derived tags must be added to the rebuild logic — see [STORY-TAGS.md §Implementation Notes](STORY-TAGS.md) and `character-creator.twee` for the pattern.

**Don't invent new tags / quirks / kinks unilaterally.** Propose in the passage with `[! tag candidate: NEW-TAG — what it would mean and where it'd be checked]`. Tags accumulate across the project; coherence matters. The `tag-coherence` lint rule will catch tags read but never written (or vice versa).

### 14.3 Editorial Markers — `[! ]` and `[? ]`

Inline convention for in-prose notes. Survive sync-back as literal text. The Obsidian lint plugin surfaces them under their passage.

- `[! directive text]` — a directive for the writing AI or human revisor. Examples: `[! Revise — Robert wouldn't say this.]`, `[! tag candidate: First Kiss — set in scene X, checked in scene Y.]`, `[! glossary candidate: Drake Hotel — used in QW-101 first time.]`
- `[? open question text]` — an open question for the human author to answer. Examples: `[? Should this line acknowledge the previous scene's outcome?]`, `[? Does she know Robert's wife exists?]`

**Rules:**

- Both markers must be on a single line, closed in the same paragraph. Multi-line notes break the regex.
- The malformed-marker lint rule (warning) catches unclosed `[! ...` or `[? ...`.
- Notes are non-rendered editorial cargo. They go in source, get linted, and are stripped before publish.
- Use them liberally during drafts. Resolve them before lock.

---

## 15. Mandatory Checks (Run After Every Drafted Passage)

These are mechanical, not judgement calls. Run them after every passage or revision pass.

1. **Information audit.** List every discrete piece of information in the original. The revision preserves each one. Missing info goes back in. (See §13.2.)
2. **Word count.** Body under 200 (hard ceiling). Target 80–120. Lint surfaces this; act on the warnings.
3. **Link-text form check.** Every link is a complete sentence in one of the three valid forms (PC dialogue, narration, Continue). No fragments. No NPC dialogue. (See §9.)
4. **Em-dash check.** Search for spaced em-dashes — see §7.1 for the project override; for *new* passages, follow the override note's guidance, don't reflexively strip from existing source.
5. **Paragraph-start check.** First word of each paragraph. If any name appears 3+ consecutive times, vary entry points.
6. **Character voice test.** Every simile, metaphor, narrator descriptor. Would this specific character think this? If it sounds composed, literary, or from a domain the character doesn't inhabit, flatten. (See §3.1.)
7. **Physical logistics check.** For any sex scene or complex physical staging, verify every sensory detail is possible from the described configuration. (See §11.5.)
8. **Continuity check.** Weather, time of day, character bodies, who knows what — verify against established facts. Header values match the scene.
9. **NYSE voice check.** Branch and player narration never reach for "supernatural" / "magic" / "paranormal." If they do, recast in NYSE / anomalous / atypical. (See §5.1.)
10. **Glossary coverage.** First appearance of a real-world or institutional term — is it `<<term>>`-wrapped? If yes, good. If a term should exist but doesn't, drop a `[! glossary candidate]` marker.
11. **Humor calibration.** Is the humour appropriate to the scene's intensity? Does it step back when needed? If a joke is present, is it actually funny? (See §10.4.)
12. **Cliché check.** Watch for "good girl" and other overused D/s tropes, and for noir/thriller chestnuts ("the kind of man who…", "if you knew where to look"). Find fresher delivery.
13. **Erotic vocabulary audit.** *Slick, heat, pulse, throb, wet* — counted in any sex scene; varied if accumulating. (See §11.10.)

---

## 16. Process Rules

### 16.1 Light Touch Where the Original Works

If a scene is working, don't touch it. The impulse to change things because you're revising is separate from the need to change things because they're broken. If you can't articulate what's wrong, leave it alone.

### 16.2 Living Document

Update after every major writing or revision session — new pitfalls caught, new examples worth annotating, rules earned. Mark living-doc TBD sections with `[?]` as in §11.6.

### 16.3 Present Drafts, Not Just Descriptions

Always show the actual revised prose. Don't just describe changes — the author has to read the words to evaluate them.

### 16.4 Keep the Information Audit Internal

The line-by-line audit is required internal work before every draft. The author doesn't need to see it unless they ask. What the author needs is precise documentation of what was changed and why.

### 16.5 Don't Re-Ask What This Guide Answers

If a rule is in here, follow it. Don't ask for confirmation on settled decisions.

### 16.6 Be Precise When Precision Is Asked For

"What information got cut?" means list every individual detail, not summarize in categories.

### 16.7 Mechanical Checks Are Not Optional

Em-dashes, paragraph starts, word counts, link forms, information audits. Grep-level work, not judgement calls. Run them.

### 16.8 Meaning Drift Is the Sneakiest Form of Information Loss

Always write down the meaning of the original before drafting its replacement.

### 16.9 Don't Restate Other Docs — Link Them

This guide is the synthesis layer. GDD, NPC-handler, STORY-TAGS, CLAUDE.md, AGENTS.md own their content. When this guide needs a fact from them, link it. When the linked doc changes, this guide doesn't have to.

---

## 17. Quick Reference

When in doubt:

- **Read it aloud.** Would she think this? Would he say it that way?
- **Cut a sentence.** Most passages survive losing one.
- **Picture, not label.** Can the reader draw this?
- **Trust the reader.** They got the joke; you don't have to explain it.
- **Specificity beats generic.** Carp, not "a rural range." The mug stirred three times, not "his familiar gesture."
- **Bureaucratic voice over wonder voice** for NYSE. Always.
- **Heat is required.** Earned heat is hotter.
- **Living document.** When this guide doesn't cover a case, write the rule into it.
