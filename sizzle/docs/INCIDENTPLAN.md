# Sizzle Incident Plan

Working plan for CC-400 inciting incidents. This is an ideation document, not implemented content.

The current direction is that each incident becomes a full playable flashback/prologue sequence. Character creation may branch into one of these sequences, then return to the existing 2005 briefing structure after recruitment context is established.

**Detailed playable-sequence designs** live in `docs/incidents/`, one MD per incident. This file remains the shared ideation/principles source; the per-incident docs carry the beat maps, background variants, choices/checks, variable hooks, and risks.

- The Toronto Blackout → [`incidents/BLACKOUT.md`](incidents/BLACKOUT.md)
- The Dark of Manitoulin → [`incidents/MANITOULIN.md`](incidents/MANITOULIN.md)
- The Woman with the Pale Eyes → [`incidents/PALE.md`](incidents/PALE.md)
- Wet Dog Smell → [`incidents/WDS.md`](incidents/WDS.md)

> **The per-incident docs are canonical where they diverge from the incident notes below.** This file's per-incident sections (§Incident 1–4) are the original ideation source; the four `incidents/*.md` docs supersede them on any point of detail (beat maps, specifics, geography, the spray used, explicitness, time/palette, etc.).

Cross-cutting decisions established during the Blackout pass (apply to all four unless a doc says otherwise): per-incident passage prefixes (`BLK`/`MAN`/`PALE`/`WDS`); avatar visible during flashbacks; convergent branching (choices/checks change texture, scar, and an earned +1 skill — never the outcome); +1 skill grants written as plain set-once `+=` and made durable by relocating the destructive skill rebuild from CC-500 to the top of CC-400 (upstream of the flashback) — no `skillMods` array or tracking layer; no incident-specific storyTags that are 1:1 derivable from `$player.incitingIncident`; rich length (~18–22 passages, plus two or three short table-setting passages before the opener). Starting `$nyse.influence` values are now locked — see **Locked `$nyse.influence` Calibration** below.

### Cross-cutting tonal rules (whole-game)

The four whole-game **tonal** rules settled during this pass now live in the master style guide — **[STYLE-GUIDE.md](STYLE-GUIDE.md) §10.5 and §11.12–11.13**: the PC is sex-positive in every background/incident; sell the dread, don't police the heat; the PC can be funny but the situation never is; the victims are people, not a joke. Follow them there; each incident doc's §0 restates them in incident-specific terms.

Two **design-doc / drafting conventions** are recorded in both places — here for the incident-authoring workflow, and in **[STYLE-GUIDE.md §11.14](STYLE-GUIDE.md)** because they govern how any explicit beat gets drafted:

- **State the explicit specifics in the design docs, not euphemisms.** If a beat-map note can only gesture ("a humiliating arrangement," "does something degraded"), that vagueness propagates into the prose and pinpoints the exact beat a human may need to draft. Name what is depicted in §2.
- **Explicit-by-default with a placeholder fallback.** The drafting agent writes explicit beats explicitly by default (style guide §11.1). The `%%% HUMAN-DRAFT %%%` block is a **fallback only** — dropped in solely if the drafting agent itself judges a specific beat to need more explicitness than it can comfortably write, with beat structure/links/hooks left intact around it.

### Locked `$nyse.influence` Calibration

Set jointly across all four incidents. `$nyse.influence` is hidden, has no decay, and is set once by the chosen incident. Shape reflects how *directly and unavoidably* the PC is exposed:

| Incident | Base | Cap | Exposure structure | Expected outcome |
|----------|------|-----|--------------------|------------------|
| The Toronto Blackout | +1 | +2 | Observed from the threshold; barely touched. | ~+1 |
| The Woman with the Pale Eyes | +1 | +2 | Low ambient by design (avoids contact) + one deep command spike. | ~+1 (+2 if bitten) |
| The Dark of Manitoulin | +2 | +3 | Progressive soak — steeped room by room, nearly joins. | +2 (up to +3 on deep-immersion failure) |
| Wet Dog Smell | +2 | +3 | **Single highest.** Direct bodily intake of the vector; contamination is near-unavoidable. | ~+3 |

Ordering by expected value: **WDS (≈+3) > Manitoulin (+2, up to +3) > Blackout ≈ Pale Eyes (+1, up to +2).** WDS and Manitoulin share the +2/+3 *shape*, but WDS is the single highest because its contamination soak is the most direct and hardest to avoid — a typical WDS run lands at the +3 ceiling where a typical Manitoulin run lands at +2. The extra +1 toward each cap is earned on failed in-sequence checks (the deep-immersion / spine-bite / contamination beats), never on a "loss."

## Global Principles

- Each incident should feel like a lived NYSE trauma/mystery that later becomes a classified Branch file, not a superhero origin.
- The player character encounters NYSE directly and sees it affecting others.
- She arrives after the initial turn has already happened.
- She is not the anomaly's centre, chosen subject, or special exception.
- She may feel the pull, but she is affected less than the people already inside the event.
- Her recruitment-worthy quality is ingenuity under impossible conditions: observation, quick thinking, and practical action.
- Each incident should have erotic charge because Sizzle is an erotic supernatural thriller, but the spice should be part of the anomaly and its danger.
- Each incident should imply different NYSE grammar so the options do not all read as "weird shit happened."
- The outcome should be somewhat positive but incomplete: lives preserved, harm limited, evidence created, or the event interrupted without being understood.
- The Branch can classify, suspect, and redact. It should not fully explain.
- Robert contacts or recruits her after the incident and becomes the person who gives the impossible a Branch vocabulary.

## Final Candidate Set

1. The Toronto Blackout
2. The Dark of Manitoulin
3. The Woman with the Pale Eyes
4. Wet Dog Smell

## Incident 1: The Toronto Blackout

### Working Label

`the Toronto Blackout`

This is the likely value or phrase referenced by `$player.incitingIncident`.

### Date

August 14, 2003, during the real Northeast/Ontario blackout.

This places the incident almost exactly two years before the current intro briefing on September 12, 2005.

### Setting

A small walkup apartment building, roughly 10-15 units, just off the Danforth in Toronto.

The player character is outside the building when she becomes aware something is wrong. She may hear a moan from an open door while trying to make her way home through the darkened city.

### Background Integration

- Grad student / unemployed after university: She was having a beer on the Danforth when the lights went out. With the TTC down, she tries to get home on foot and passes the building.
- RCMP constable: She is in Toronto for a policing conference. The blackout strands her away from normal routes or her hotel, and she moves through the city with a constable's instinct for trouble.
- CSIS analyst: She is in Toronto for an intelligence-analysis conference. She is not field-trained yet, but the event shows she can observe, infer, and act under uncertainty.

### NYSE Shape

Focused environmental anomaly.

The anomaly is the darkness in the stairwell itself. It is not a person, ritual, or creature. The stairwell had a light that had reportedly been on continuously for years before the blackout. When the city goes dark, whatever the light had been holding back becomes active.

The Branch later finds the maintenance history unsettling: tenant comments, building records, hydro oddities, or superintendent statements suggest the stairwell light had been on for literal years.

### Observable Effect

The darkness pulls people upstairs.

People who pass up through the darkened stairwell emerge into the upper floors altered. The primary outward behaviour is compulsive sexual intimacy. Something explicit is happening higher up, but the player character does not go upstairs to see the full scene.

Affected residents remember that something happened, but not clearly. Everyone survives. Multiple people later wake naked.

### Player Character Exposure

She arrives late enough to observe the effect rather than be fully taken by it.

She feels heat, desire, and a clouding of the mind. The pull is real, but she does not go upstairs. This should not read as immunity. Her advantage is timing, caution, and instinct.

### Key Detail: The Matchbook

Earlier that evening, at the Danforth bar, she took a book of matches.

She does not smoke. She does not know why she took them. She just did.

Later, outside the walkup, with the city dark and the stairwell wrong, her hand finds the matchbook in her pocket. The Branch can read this two ways:

- Mundane reading: she took an available object absently and later used what she had.
- NYSE reading: something upstream of the incident nudged her into carrying the one thing that could interrupt it.

Robert should not overstate the second interpretation. He might only note that she was equipped in a way that proved useful.

### Player Character Intervention

She lights a match, candle, or improvised flame source from the matchbook and introduces light into the stairwell.

The light breaks the darkness enough to collapse the effect. The act should feel practical and small, not mythic: a woman who does not smoke lights a match in a stairwell that should never have gone dark.

### Evidence and Branch Attention

The Branch first flags the incident through an unusual police report, then obtains CCTV.

The CCTV shows the player character entering or approaching the building, hesitating at the threshold, introducing light into the stairwell, and leaving. The footage lets the Branch identify and track her.

Robert contacts her about a week later.

### Emotional Aftermath

No narrow phobia is currently planned.

The scar is more general: a lasting disturbance that there is a hidden world just beyond what she can see, and that it is dark and dangerous.

### Possible Future Flags

- `Blackout Witness`
- `Light in Dark Places`
- `Urban Exposure`
- `Threshold Sense`

Possible hidden mechanical texture:

- Lower starting `$nyse.influence` than incidents where she fully enters the affected space.
- Later prose sensitivity around darkness, thresholds, heat, close bodies, and unexplained desire.
- Robert relationship texture: he recruited her because she did not panic, did not rationalize, and did the one practical thing the phenomenon could not tolerate.

### Tonal Pitfalls

- Do not make the stairwell feel like a magic portal. It should stay physically ordinary: peeling paint, mailboxes, stale heat, emergency signage, old cooking smells.
- Do not make the player character immune. She feels the pull.
- Do not show too much upstairs. Sounds, glimpses, aftermath, and reports are stronger than explicit flashback.
- Do not let the Branch explain the mechanics. The darkness can be classified as vector or focal condition without being solved.

## Incident 2: The Dark of Manitoulin

### Working Label

`the Dark of Manitoulin`

This is the likely value or phrase referenced by `$player.incitingIncident`.

### Date

August 2003.

All four incidents are currently planned for August 2003, placing the inciting event almost exactly two years before the September 12, 2005 intro briefing.

### Setting

Manitoulin Island.

The event takes place at a mansion-sized private "cottage" with its own private dock. The quotation marks matter: this is not a modest camp. It is southern Ontario money wearing northern leisure as a costume.

### Background Integration

- RCMP constable: She is called to investigate. This is the most official version of the route in.
- CSIS analyst / grad student / unemployed after university: She is on vacation in the area. Her car breaks down, putting her on the road near the lakehouse after the event has already started.

### NYSE Shape

Ritual that was not supposed to work.

The affected people are seasonal residents who spend most of their time in larger population centres in southern Ontario. The ritual began as bullshit: party theatre, transgressive play, rich people daring each other to do something silly and dark at the cottage. Then it became real.

The focal element is a pentagram or five-point ritual mark at the lakehouse. In Branch language, this should likely be described as a diagram, circle, or focal marking rather than treated as proof of "occult" mechanics.

### Observable Effect

The player character enters after the compulsion is already active.

Everyone is having sex, including people on the porch and on the docks. The first wrong thing is not merely the sex. It is that everyone is completely focused on it and ignores her. The social rules of being interrupted have stopped working.

The erotic behaviour is central and explicit. The scene should feel adult, surreal, and unnerving, not winking or camp.

### Player Character Movement

She moves through several spaces:

- from the front road
- into the house
- through many rooms
- out the back
- down toward the dock
- to the ritual focal point

The "rooms" may be literal rooms or defined regions/scenes outside. Each space should escalate the sense that the compulsive sex makes more sense. The deeper she goes, the more the behaviour feels internally logical.

### Player Character Exposure

She is affected progressively by proximity and movement through the scene.

In each room or region, the compulsion makes more "sense." By the time she reaches the focal point, she realizes she is almost ready to enter the same frenzy as the rest of the party.

This is not immunity. Her advantage is that she arrives after the initial incident, keeps moving, and notices the structure before fully joining it.

### Player Character Intervention

She breaks the circle.

The exact physical action is still open, but the intervention should be concrete and practical: breaking the ritual geometry, smearing or disrupting part of the mark, moving an object, stepping through a boundary, or otherwise ruining the pattern at the focal point.

The disruption stops the ritual entirely and breaks the compulsion.

### Evidence and Branch Attention

No object is recovered by the player character.

She is the only one who remembers the event clearly.

- RCMP constable: The Branch finds her through her RCMP report.
- Other backgrounds: The Branch finds her through a general police report.

The other participants remember little or nothing coherent. They may remember a party, embarrassment, missing time, or waking up in compromising states, but not the structure of the event.

### Robert's Knowledge

Robert may know of similar lake or cottage incidents in the region, but that should not be surfaced here in this story.

For CC-400 purposes, the important point is that the Branch sees a witness who remained functional inside a live NYSE event long enough to interrupt it.

### Emotional Aftermath

As with the Toronto Blackout, the scar is not a narrow phobia.

The lasting disturbance is the hidden-world fear: ordinary life has a dark adjacent layer, and under the wrong conditions people can step into it without knowing what they have agreed to.

### Possible Future Flags

- `Dark of Manitoulin`
- `Ritual Breaker`
- `Frenzy Witness`
- `Only Clear Witness`

Possible hidden mechanical texture:

- Higher starting `$nyse.influence` than the Toronto Blackout, because she moves through multiple affected spaces and nearly joins the frenzy.
- Later prose sensitivity around ritualized behaviour, group intimacy, lakehouses, summer heat, rich southern Ontario leisure spaces, and situations where sex appears to overwrite social reality.
- Robert relationship texture: he recruited her because she could be nearly compromised and still find the structure of the event.

### Tonal Pitfalls

- Do not let "pentagram" turn the scene into overt occult fantasy. The Branch can document a five-point marking without certifying its meaning.
- Do not make the participants into cartoon rich degenerates. Their wealth and seasonal-resident status can matter without flattening them.
- Do not make the player character immune. She nearly joins the frenzy.
- Since this will become a playable sequence, plan for pacing, traversal, choices, and escalation.
- Consent ambiguity is central and dangerous here. The erotic charge should be inseparable from the horror of compromised agency.

## Incident 3: Woman with the Pale Eyes

### Working Label

`the Woman with the Pale Eyes`

This is the likely value or phrase referenced by `$player.incitingIncident`.

### Date

August 2003.

All four incidents are currently planned for August 2003, placing the inciting event almost exactly two years before the September 12, 2005 intro briefing.

### Setting

A hotel lobby in Ottawa during heavy rain.

The affected area is tucked away from the main lobby flow: a lounge alcove, seating area, or semi-private corner where people can be in public and still temporarily unseen.

The rain is a major mood signature: damp air, wet coats, umbrellas, water streaking the windows, and the repeated sound of downpour outside the hotel.

### Background Integration

- CSIS analyst: She is in the hotel naturally for work, training, or an intelligence-analysis event.
- RCMP constable: She is in Ottawa for a policing conference. In this origin version, the policing conference is in Ottawa rather than Toronto.
- Grad student / unemployed after university: She is in Ottawa on vacation or a personal trip.

### NYSE Shape

Person-shaped command hazard.

The woman appears human except for her eyes and manner. Her eyes are pale enough to be memorable and wrong without making her visually monstrous.

Whether she is the NYSE entity, a human being used by something else, or something in between is unclear to the player character and the player. The Branch knows more than it says.

### Mechanism

Direct eye contact is required.

Anything the woman says while making direct eye contact becomes absolute truth to the target. If the statement is a command, the target obeys absolutely.

Eye contact can be mediated through a mirror or reflection. This makes mirrors useful but dangerous: they let the player character observe without fully exposing herself, but they are not safe if the woman's reflected gaze meets hers.

### Observable Effect

The woman has commanded adults into objectified roles.

The affected people are a mix of genders. No minors are involved.

Possible tableau details:

- one person acting as her footrest
- another feeding her fresh fruit
- a man commanded to become erect, with the erection used as a hook for her umbrella
- others waiting in uncomfortable, humiliating, or intimate poses as if the arrangement is self-evidently correct

The wrongness is that the commands are being obeyed against the victims' wills, even when the surface behaviour is quiet and orderly.

### Woman's Voice and Manner

She uses a combination of gaze and speech.

Her register is neutral and detached. She speaks as if giving a command to a smart-home assistant app, not to a person.

This detachment is important. She should not feel like a vamp, dominatrix, or theatrical villain. Her horror is the mismatch between ordinary speech and absolute human obedience.

### Player Character Exposure

The player character spends the sequence attempting to avoid the woman's gaze through cleverness.

She uses mirrors, sightlines, cover, and stealth. The playable tension should come from needing to understand the scene without meeting the pale eyes directly.

At the end of the sequence, the player character swings something at the woman: a chair, fire extinguisher, or similarly practical hotel-lobby object.

The woman meets the player character's eyes and says, "STOP."

The command hits. The player character feels the iron knowledge that she must obey. But the physical action is already in motion, and momentum carries the blow through. The strike knocks the woman out.

This is the key recruitment-worthy beat: the player character did not resist because she was immune. She escaped because she committed to an action whose physical consequence could not be recalled in time.

### Player Character Intervention

She disrupts the event by incapacitating the woman before being fully trapped by eye contact.

The intervention should be practical and ugly, not stylish. A chair, fire extinguisher, luggage cart, or lobby fixture is preferable to anything elegant.

### Evidence and Branch Attention

The Branch takes the woman into custody.

What happens to her afterward is unclear to the player character and the player.

No durable evidence remains available to the player character. Records are destroyed or removed. She is the only one who remembers much. Because the incident happens in Ottawa, the Branch is on scene very quickly.

### Emotional Aftermath

As with the other incidents, the scar is the hidden-world fear rather than a narrow phobia.

The specific residue here is the bodily memory of absolute obedience: knowing, for one impossible second, that another person's sentence has become reality inside her.

### Possible Future Flags

- `Pale Eyes`
- `Command Hazard`
- `Momentum Saved Her`
- `Only Clear Witness`

Possible hidden mechanical texture:

- Later sensitivity around direct eye contact, mirrors, commands, and neutral authoritative speech.
- Potential composure implications when ordered directly by powerful or charismatic NPCs.
- Robert relationship texture: he recruited her because she observed the hazard, adapted to its rules, and won by exploiting physical timing rather than imagined immunity.

### Tonal Pitfalls

- Avoid vampire, succubus, or sexy-domme coding. The woman is detached, neutral, and inhumanly casual.
- Avoid making the objectified victims into a joke. The tableau can be sexually explicit and humiliating, but the horror is compromised will.
- Do not over-explain what the Branch knows about her. The player character should leave with fewer answers than the Branch has.
- Be careful with the smart-home comparison in final prose: smart assistants are anachronistic for 2003. It is useful design shorthand only.
- Direct eye contact through mirrors should be treated consistently as dangerous.

## Incident 4: Wet Dog Smell

### Working Label

`Wet Dog Smell`

This is the likely value or phrase referenced by `$player.incitingIncident`.

### Date

August 2003.

All four incidents are currently planned for August 2003, placing the inciting event almost exactly two years before the September 12, 2005 intro briefing.

### Setting

A roadside motel.

The exact location can vary by background, roughly 200-300 km outside the player character's home city or normal base. The key texture is isolation without wilderness romanticism: highway lights, vending machines, thin walls, gravel, bad curtains, and people trying to sleep in cheap rooms.

### Background Integration

All backgrounds begin with the player character staying at the motel while away from home, likely on vacation or taking time alone.

The exact road and region can vary:

- RCMP constable: roadside motel somewhere outside Sault Ste. Marie / Northern Ontario home territory.
- CSIS analyst: motel outside Ottawa / NCR.
- Grad student / unemployed after university: motel outside Toronto or along a southern Ontario route.

### NYSE Shape

Creature / biological or quasi-biological influence.

The creature appears as a huge human-like man with far too much body hair, moving like an animal. While looking directly at him, the player character understands that he is not human, or not naturally human. Later, the event can be rationalized as a naked man on drugs, a severe psychiatric crisis, a misidentified attacker, or a witness-stress distortion.

The case may be werewolf-adjacent, but it should remain unclear to the player character and the player whether "werewolf" rules apply or whether that label is merely the nearest folklore-shaped box.

### Creature Presentation

The creature is always nude.

He has exaggerated, explicit sexual anatomy, including a huge semi-hard penis drooling pre-cum. This is not meant to be suave or seductive. The image should be frightening, animal, excessive, and contaminating.

His intelligence appears to be animal cleverness rather than human planning.

His motive is inscrutable, like a bear wandering through a campsite: maybe food, maybe territory, maybe something more carnal, maybe none of those categories fit.

### Mechanism

Constant musk.

The musk is always being emitted. It is oil-based or behaves enough like oil that water-soaked cloth can reduce exposure but not solve it.

Possible effects on humans:

- arousal
- lowered fear response
- attraction to the creature
- attraction to each other
- lowered intelligence
- animal-like behaviour
- hypersexuality
- discomfort being clothed

It is unknown whether animals are affected.

### Observable Effect

The affected people are motel guests.

The first wrong image: a woman by a vending machine trying to jam a soda can inside herself.

This establishes the tone immediately: sexual, unsafe, degraded, and obviously not ordinary desire.

The scene can include people aroused, confused, undressing, approaching the creature, approaching each other, or losing social inhibition. The point is not a sexy motel party; it is human adults reduced by an influence that makes them less able to protect themselves.

### Player Character Entry

She is staying at the motel and wakes in the middle of the night after hearing something outside.

She arrives late enough that multiple guests are already affected.

### Player Character Exposure

She catches a whiff of the musk.

It causes a throbbing response in her body and a dangerous dulling of judgement. She is not immune. She is saved by arriving late, noticing cause and effect, and acting before the musk fully takes her.

### Player Character Intervention

She puts two and two together: the smell is doing it.

She soaks a cloth in water and covers her face. Because the musk is oil-based, this only partly blocks exposure, but it gives her enough room to think and move.

She uses pepper spray on affected people and on the creature. This is crude, practical, and appropriately desperate. The goal is to save the guests by driving the creature away and interrupting immediate exposure.

### Outcome

She saves the people by driving the creature away.

The creature escapes into the woods.

If the Branch later captures or kills it, that is outside the scope of this playable sequence.

### Evidence and Branch Attention

Surviving evidence may include:

- hair / fur
- footprints
- damaged motel property
- witness statements
- possible trace scent on clothing

The creature itself is gone.

The Branch's later conclusions are not surfaced in this sequence.

### Emotional Aftermath

As with the other incidents, the scar is the hidden-world fear rather than a narrow phobia.

This incident's specific residue is bodily contamination: the knowledge that something can get into people through smell, make fear feel irrelevant, and make the body answer before the mind agrees.

### Possible Future Flags

- `Wet Dog Smell`
- `Musk Exposure`
- `Creature Witness`
- `Improvised Filter`

Possible hidden mechanical texture:

- Later prose sensitivity around smell, sweat, musk, animal movement, cheap motels, and sudden bodily arousal.
- Possible higher starting `$nyse.influence` than the Toronto Blackout because she inhales the vector directly, but lower than a full surrender/participation outcome.
- Robert relationship texture: he recruited her because she identified an invisible vector and took practical exposure-control measures under extreme stress.

### Tonal Pitfalls

- The creature can be explicit and sexually grotesque, but should not become porn-monster spectacle.
- Avoid clean werewolf lore. The Branch should document morphology, odour, behaviour, and witness effects rather than naming a folklore creature.
- The affected guests are victims. Their hypersexual behaviour should be frightening and unsafe, not comic.
- The vending-machine image is intentionally extreme; final prose needs careful handling so it reads as urgent harm and NYSE degradation, not shock for its own sake.
- The player character should not seem immune. She feels the musk in her body and wins by inference plus exposure control.
