# CC-400 Origin Sequence — The Dark of Manitoulin

*Playable-sequence design doc. Planning only — no final passage prose here. Parent: [INCIDENTPLAN.md](../INCIDENTPLAN.md). Voice/rules: [STYLE-GUIDE.md](../STYLE-GUIDE.md). Template sibling: [BLACKOUT.md](BLACKOUT.md).*

> **Editorial markers (for the writer + the review agent).** Drop `[! directive]` inline in the passage prose for an action the review agent should take — e.g. `[! add keyword floatie]` (wrap the term with `<<term>>`), `[! needs background versions]` (add an `<<if $player.background>>` branch), `[! hide until clicked]` (a `<<linkreplace>>` reveal). Use `[? open question]` for things only the human can answer — the agent surfaces these and never guesses. The agent resolves and removes `[! ]` markers during a pass; `[? ]` markers stay until answered. Full convention: [STYLE-GUIDE.md §14.3](../STYLE-GUIDE.md); the lint pipeline flags both (see AGENTS.md).

---

## 0. Design Spine (read first)

- **Convergent branching.** Choices and checks reroute *texture* — how deep she lets herself go, how clearly she reads the scene, how close she comes to joining — never the outcome. Every path ends: she reaches the focal marking, breaks it, the compulsion collapses, she's the only one who remembers, the Branch finds her through a report. A failed Composure check = she nearly joins and pulls back, a beat, not a fail state.
- **Felt stakes, fixed plumbing.** The player should believe she might be swallowed by the frenzy. In story terms she can't. In *who she becomes* terms she can — see §8 skill grant.
- **Pre-Branch voice.** August 2003. No NYSE vocabulary, no Branch frame. She has whatever her background gives her (a cop's procedure, an analyst's inference, a psych grad's behavioural words, an outsider's plain horror) — never "anomalous" or "focal point." Those words arrive only in the BLK-style Branch report at the end.
- **She is not special.** She arrives *after* the turn, keeps moving, and notices the structure before she's fully inside it. Timing and observation, not immunity. She feels the pull and nearly goes under.
- **The anomaly is not occult fantasy.** This is the load-bearing tonal rule. The ritual *began as kitsch* — rich seasonal residents daring each other to do something transgressive at a theme party, with a diagram printed off the internet and dollar-store candles. Then it became real. The horror is the gap between the tacky props and the absolute thing they accidentally switched on. The Branch documents a five-point marking; it never certifies "occult."
- **The participants are victims, not degenerates.** Wealthy, yes; cartoons, no. Give them humanity that surfaces when the compulsion breaks — a wedding ring, reading glasses still on, a man who weeps when he comes to. Their compromised will is the horror; their wealth is texture, not a punchline.
- **The PC is sex-positive — in every background, in every incident.** This is a cross-cutting character rule (applies to all four incidents; flag for INCIDENTPLAN). Whatever her background, she is not a prude and group sex does not, in itself, disgust her. What terrifies her here is that an **unexplainable force is manufacturing a compulsion** — that consent and refusal have stopped working — *not* that she finds an orgy distasteful. The horror is the override of will, never "sex is icky." Any prose or check that frames her fear as moral revulsion at the sex itself is wrong and breaks the character.
- **Sell the dread, don't police the heat.** *(Cross-cutting — true for the whole game.)* Our job is to make the horror land: the manufactured compulsion, the colonized judgment, the obliterated refusal. We do **not** write to suppress or correct for arousal. If explicit material also reads as charged to a given player, that's their interpretation and it's fine. Aim at the dread; don't aim away from the heat.
- **The PC can be funny; the situation never is.** *(Cross-cutting.)* The incident and the participants are never played for laughs — the compromised will is real and horrifying. But the **player character's voice** can be dry, sardonic, gallows-wry: a woman who copes through clipped, mordant interior observation. Her wit is character and relief valve, never a joke at a victim's expense.

### NYSE grammar (how this differs from the Blackout)

The Blackout was an *environmental* anomaly — the absence of light was the active thing, solved by introducing light. Manitoulin is a *focal-marking* anomaly: a bounded space, activated by a physical diagram, that compels everyone inside it and intensifies by proximity to the centre. Blackout was solved by *adding* something (light); Manitoulin is solved by *destroying* something (the pattern). Keep them grammatically distinct so the four incidents don't read as "weird shit happened" four times.

---

## 1. Playable Sequence Premise

August 2003, Manitoulin Island, dusk going to full dark. A mansion-sized private "cottage" on the water — southern Ontario money wearing northern leisure as a costume. The player character arrives after the thing has already started: stranded by a dead car on a back road and looking for a phone (all four backgrounds — the RCMP constable is *off-duty on vacation*, not dispatched; Manitoulin isn't RCMP turf). The house is lit, music playing, cars in the drive — and everyone inside is having sex, on the floors, the porch, the lawn, the dock, and none of them will look at her. The first wrong thing isn't the sex; it's that the social rule of being interrupted has stopped working. Looking for help, she moves deeper — room to room toward the water — and in each room the behaviour makes a little more sense than it should, including to her. She finds the tell: a five-point diagram chalked on the boards, ringed by cheap candles, a printout taped nearby — a party trick that wasn't supposed to work. At the focal point, nearly ready to join, she does the one thing the pattern can't survive: she breaks it. The compulsion drops like a cut wire. People surface cold and ashamed and remembering almost nothing. She remembers all of it. A week later it's a Branch file, and a recommendation signed Flett.

**One-line for the player:** *You walked all the way to the centre of it before you understood that the only way out was to ruin it.*

---

## 2. Beat / Passage Map

Prefix **`MAN`**. 80–120 visible words per passage, one beat, link text = complete sentence (PC dialogue / narration / `Continue`). Target length **rich: ~26 passages** — **each room gets its own passage** (decided). The room-to-room traversal is the escalation engine; one beat per room lets the dual ladders (§4) ratchet a notch at a time instead of compressing.

| Passage | Beat | Type |
|---------|------|------|
| `MAN-085 The long drive up` | Table-setting (normality). Leaving home/the city behind, the highway north, the radio, the decompression of a trip. Why she's headed to Manitoulin (background-variant). Ordinary. A good place for her dry voice. | Table-setting |
| `MAN-090 Onto the island` | Table-setting. Crossing over — the swing bridge at Little Current (or the Chi-Cheemaun ferry) — concrete, ordinary Manitoulin texture. Tourist-normal. | Table-setting |
| `MAN-095 A stop on the rock` | Table-setting. A gas station / general store / coffee, small-town quiet, the heat coming off the Shield. The last fully normal beat. | Table-setting |
| `MAN-100 The island road` | Dusk on a back road on Manitoulin. The place, the heat of the day going off the rock. She drives on toward the lakehouse turn. | Opening |
| `MAN-105 Dead in the water` | The car dies on the back road (all backgrounds). The lakehouse below: lit windows, music, too many cars. Money pretending to be a cottage. The RCMP route's tourist-eyes start to sharpen. | Setup |
| `MAN-110 Nobody answers` | Up the drive on foot. Sounds she can't place yet. A couple on the lawn, oblivious; she calls out and gets nothing. The interruption rule has failed. First wrongness. | Escalation |
| `MAN-115 The front door` | The threshold. She's after a phone. The foyer — coats, sandals, a catering tray. The frenzy audible past the hall. (RCMP: the investigator instinct is fully online by now — she's reading, not just looking.) | Beat |
| `MAN-120 The great room` | First full sight. Bodies, indifferent to her. The wrongness *named*: it isn't the sex, it's that no one registers a stranger in the room. | Escalation |
| `MAN-125 Look at me` | She addresses someone directly — gets a face that looks *through* her. **CHECK:** Composure to keep her head (or background read of the scene). | Skill check |
| `MAN-130 Party favours` | The tell: a printout taped to the wall, dollar-store candles, a chalk diagram half-smudged underfoot. Catering and kitsch. This started as a dare. In-scene reveal of the "wasn't supposed to work" origin. | Beat (the reveal seed) |
| `MAN-135 The kitchen` | Deeper. Her own body answering now — heat, a low pull. The behaviour starting, horribly, to make sense to her. | Escalation (self) |
| `MAN-140 Forward or back` | **CHOICE:** push toward the back of the house / the water, or try to leave (convergent — leaving loops her back or she grasps that forward is the only way to stop it). | Choice |
| `MAN-145 The sunroom` | A more explicit tableau, stated so the drafter isn't guessing: a clustered knot of guests on the floor and furniture — mid-act, several partners to a person, oral and penetrative sex in plain view — all blank-faced and utterly indifferent to her presence. Their humanity intact underneath. She catches herself drawn toward it. **CHECK:** Composure to not join here. **(Explicit — drafter writes it concretely; fallback block only if truly needed.)** | Skill check |
| `MAN-150 Out the back` | Through the doors. Lawn sloping to the North Channel, full dark now, no city glow — stars and torchlight. The dock, and on it the centre of the thing. | Escalation |
| `MAN-155 The dock` | The focal point on the boards: the five-point chalk marking and candles, ringed by the densest, most explicit concentration of the frenzy — the deepest pull of the compulsion. The "logic" nearly complete in her own head. **(Explicit — drafter writes it concretely; fallback block only if truly needed.)** | Escalation (self) |
| `MAN-160 Almost` | The closest she comes to joining — she understands *why*, and part of her wants to. **CHECK:** the big Composure hold (convergent — fail = she begins to, and claws back). | Skill check (spine) |
| `MAN-165 The pattern is the thing` | The insight: break the marking, break the compulsion. **CHECK (optional):** reason it vs. act on instinct. | Insight |
| `MAN-170 Break the circle` | The intervention. A concrete, ugly, practical disruption of the pattern. **CHOICE:** how (cosmetic — drag a foot through it, kick the candles, haul an object across it, pour the cooler-melt over the chalk). | Intervention |
| `MAN-175 Cut wire` | The collapse. Sudden silence, the music suddenly too loud, then off. The compulsion drops. | Aftermath (scene) |
| `MAN-180 Surfacing` | People coming to — cold, naked on grass and boards, ashamed without a source. Their humanity returns: a wedding ring, glasses still on, a man weeping. She is the only one clear. | Aftermath (scene) |
| `MAN-185 Someone has to call this in` | Civilian: she finds a working phone / flags help, gives a statement she knows won't hold together. RCMP: she begins to build a report out of something that has no report language. | Aftermath |
| `MAN-190 The drive back` | Leaving, or waiting for dawn on the rock. Interior scar beat — the hidden-world fear, not a phobia. | Aftermath (interior) |
| `MAN-200 Occurrence report` | ~A week+ later, a **Branch report document**: how the case surfaced (RCMP report / general police report), the five-point marking *documented but not certified*, witnesses with missing time. Clinical NYSE voice; bureaucratic veneer. | Recruitment bridge (report) |
| `MAN-205 Recommendation` | A **recruitment recommendation memo**, signed Flett: a subject who stayed functional inside a live event long enough to interrupt it. Names her, recommends contact. Bridges to `CC-500`. Sets `$player.incitingIncident`. | Recruitment bridge (report) |

~29 beats (three table-setting + ~26), with each room as its own passage (decided). The room sequence (MAN-120→160) is the spine of the count — great room, kitchen, hall, sunroom, back lawn, dock each stand alone, with room to add one or two more interior rooms between the great room and the sunroom if the progressive-compromise ladder wants another rung. Branches at MAN-140 / MAN-160 / MAN-165 / MAN-170 all reconverge by MAN-170/175.

**Time / palette:** the table-setting (MAN-085→095) runs in **late afternoon, day mode**; the road opens at **dusk (`evening`, day-mode tail)** at MAN-100; it deepens to **full dark (`night`)** by the time she's out the back at MAN-150. Suggest `afternoon` for MAN-085→095, `evening` at MAN-100, and `night` at MAN-150 (going outside into the real dark). Unlike the Blackout, the dark here is *atmosphere*, not the anomaly. The report passages (MAN-200/205) are documents, outside the scene clock.

---

## 3. Opening Setup & Background Variants

**Universal frame (MAN-085 → MAN-105):** three ordinary table-setting beats (the drive up, crossing onto the island, a stop) into late-August dusk on Manitoulin; she ends up approaching the lakehouse on foot and going in. The variants change *why she's on that road* and *what she notices first* — not the events.

- **RCMP constable — `Northern Ontario`:** *Off-duty, on vacation* — same stranded-on-the-road spine as the others, because Manitoulin policing is an OPP/local matter, not RCMP jurisdiction (the RCMP wouldn't be dispatched here, and getting that wrong would read false to anyone who knows the country). She's a constable up from the Sault corridor for a few days on the rock. Her car dies / she's on foot looking for a phone — and then her **investigator instincts take over** the moment the scene reads wrong: she stops being a tourist and starts counting bodies, looking for the complainant, clocking exits, reading the staging. The route in is civilian; the *eyes* are a cop's. **Crucially, she still files an official report at the end** — once it's over she identifies herself and writes it up properly (a statement to the responding OPP, then her own follow-up report through her detachment), which is how her account reaches the Branch as a police document rather than just a witness interview. Her edge over the other three is procedure under pressure, not jurisdiction.
- **CSIS analyst — `City Dweller`:** On vacation in the area, a city person out of her element on the rock. Her car dies on the back road at dusk. Desk-trained, not field-trained — she *infers*: the staging, the printout, the sequence of "this was a stunt, then it wasn't." Reaches the Branch via a **general police report** (she's interviewed as a witness).
- **Grad student (psychology) — `City Dweller`, `Lived in Toronto`:** On vacation; car dies. She reads it as *behaviour* — deindividuation, lost inhibition, social contagion — and has real (pre-Branch, academic) vocabulary for it, which makes the moment it stops obeying those rules more frightening to her, not less. **General police report.**
- **Unemployed after university — `City Dweller`, `Lived in Toronto`:** On vacation; car dies. The outsider with no professional frame — the most viscerally exposed, the fewest defenses, and her edge is stubborn practicality rather than training. **General police report.**

**Voice discipline:** same woman, different prior years. One or two sentences of shading per branch, parallel structure. The RCMP route is more *procedural*; the three civilian routes share the stranded-car spine and differ only in what her eyes are trained to do.

---

## 4. Escalation Pattern

The room-to-room traversal *is* the escalation. Two ladders climb in parallel:

**The scene ladder (outside her):** lawn couple (oblivious) → great room (indifferent crowd) → kitchen/hall (denser) → sunroom (explicit) → dock/focal point (the centre). Explicitness rises; so does the concentration of the compulsion toward the marking.

**The interiority ladder (inside her) — the real horror:** appalled → unsettled → *catching herself rationalizing* → "well, why not" → nearly moving toward it. The signature of this incident is that the compulsion colonizes her *judgment*, not just her body — by the deep rooms the frenzy feels internally logical to her. **Keep this strictly subjective (STYLE-GUIDE §13.5):** the narrator never certifies that the logic is real; she *experiences* it as making sense, and that experience is what's terrifying. The intervention works precisely because she acts before the rationalization completes.

The eroticism escalates with the danger and is inseparable from it — the deeper she goes, the more her own composure frays and the more the explicit tableaux pull at her. The participants are always people, never props; the explicitness serves the horror of compromised will.

---

## 5. Player Choices & Skill Checks

All convergent. Difficulties low-to-moderate; failure is always survivable and generative.

### Choices
- **MAN-140 — Push deeper or try to leave.** *Deeper* → straight toward the water. *Leave* → the house turns her around (a looping hallway, the pull, or she reasons that the source is ahead, not behind). Same destination; different self-image (drawn forward vs. trapped into going forward).
- **MAN-170 — How she breaks the pattern (cosmetic).** Drag a foot through the chalk / kick over the candles / haul a deck chair across it / pour a cooler's melted ice over the diagram. All produce "the pattern is ruined." Pure flavor.

### Skill checks (use `<<skillCheck>>`, onward links in both branches)
- **MAN-125 — Hold under the look-through (Composure, low DC).** *Pass:* she stays clinical, keeps reading. *Fail:* the indifference rattles her; she's slower to orient, slightly more exposed. Both continue.
- **MAN-145 — Don't join in the sunroom (Composure, moderate DC).** *Pass:* she holds and moves on. *Fail:* she lingers, a hand or a half-step toward it, catches herself; +1 `$nyse.influence`. Both → MAN-150.
- **MAN-160 — The big hold at the focal point (Composure, higher DC). The spine check.** *Pass:* she keeps herself. *Fail:* she begins to join — kneels, reaches, starts to — and the physical fact of the marking under her hand (the chalk grit, a candle's heat, the wrongness of the *compulsion itself* surfacing as a jolt of self-recognition — **not** distaste for the sex) snaps her into breaking it instead. Never a loss; the near-surrender converts directly into the intervention. +1 `$nyse.influence` on fail.
- **MAN-165 — Name the structure (Academic or Streetwise, low DC, optional).** *Pass:* she *reasons* it — the marking is the anchor, ruin it and it stops (the kitsch printout from MAN-130 helps her). *Fail:* she doesn't reason it; raw survival instinct — *get this thing off everyone, including me* — drives her to wreck the pattern anyway (not disgust at the sex; the drive is against the compulsion). Both → MAN-170. The "ingenuity vs. luck" fork; both recruitment-worthy. Differs only in prose texture and which skill earns the +1 (§8).

---

## 6. The Recruitment-Worthy Intervention

She breaks the circle. Not with a special object, not with immunity — with the recognition, arrived at while the compulsion is working on her too, that the pattern is the anchor and that ruining it is the move. The action is concrete and unglamorous: a foot through the chalk, a chair dragged across the boards, candles kicked into the lake. The point is that she found the *structure* of an impossible event while standing at its centre, nearly inside it, and acted on what she found.

The Branch's read (surfaced only in the MAN-200/205 report documents, clinical voice): a witness who remained functional inside a live event long enough to interrupt it, and who is the sole coherent account afterward. That combination — nearly compromised, still observing, still able to act — is the recruitment-worthy quality.

---

## 7. Aftermath & Branch / Robert Bridge

- **MAN-175 / MAN-180 (scene aftermath):** the compulsion drops like a cut wire. People surface cold, ashamed, remembering a "party," missing time, waking in compromising states. Their personhood returns in specific human details. She does not get thanked; mostly she gets confusion and people scrambling for clothes and dignity.
- **MAN-185:** the practical tail — civilian: a working phone, a statement to the responding officers that won't cohere; RCMP: she identifies herself to the responding OPP and then faces the impossible task of writing this into report language in her own follow-up. This is where her clear memory vs. everyone else's fog becomes the thing that will mark her to the Branch.
- **MAN-190 (interior aftermath):** the scar — the general hidden-world fear (per INCIDENTPLAN): ordinary life has a dark adjacent layer, and under the wrong conditions people step into it without knowing what they agreed to. No narrow phobia.
- **MAN-200 / MAN-205 (Branch report documents, ~1 week+ later):** PoV-preserving, same as the Blackout. MAN-200 is an occurrence-report/case extract — the marking *documented but not certified* ("a five-point figure", not "a pentagram with occult function"), witnesses with missing time, one coherent account. MAN-205 is a recommendation memo signed Flett. Hands off to `CC-500 Summary`, which sets `$player.incitingIncident`. First in-person Robert beat is deferred to the 2005 INTRO briefing (consistent with the Blackout; see §11).

Robert relationship seed (keyed off `$player.incitingIncident`, no separate tag): he'll trust her because she stayed functional and found the structure under a pull strong enough to take everyone else — and he'll quietly worry about exactly that when he sends her into a place built to take people slowly.

---

## 8. Variable Hooks

- **`$player.incitingIncident`** = `"the Dark of Manitoulin"` (reads correctly in INTRO-101's interpolation).
- **`$nyse.influence` (starting):** **higher than the Blackout** — she moved through multiple affected spaces and nearly joined the frenzy. Base **+2**, +1 per failed deep Composure hold (MAN-145 / MAN-160), cap incident contribution at **+3**. *LOCKED in the joint four-incident calibration (INCIDENTPLAN): +2 base / +3 cap. Shares the +2/+3 shape with WDS, but WDS is the single highest — Manitoulin reaches +3 only on deep-immersion failure (expected outcome +2), where WDS lands at +3 typically.*
- **`storyTags` — choice-derived only (general rule).** No every-playthrough tag (no `Dark of Manitoulin` / `Frenzy Witness` as guaranteed tags — those are 1:1 derivable from the incident flag). Candidate *choice-derived* tags, to mint only if later content will branch on them (propose via `[! tag candidate]`):
  - Whether she **failed the deep hold** at MAN-160 (began to join) — a real fork some players experience. Could justify a "nearly went under" flavor for later Sizzle scenes. Default: don't pre-mint.
  - Whether she **reasoned** the structure (MAN-165 pass) vs. acted on instinct. Default: don't pre-mint.
- **The "scar" is prose texture, not a tag.** Later sensitivity (surfaced by the incident flag): ritualized behaviour, group intimacy, lakehouses, summer heat, monied-leisure spaces, situations where sex appears to overwrite social reality.
- **Skill-point grant (+1, plain set-once `+=` — see [BLACKOUT.md §8](BLACKOUT.md)).** Award +1 by play pattern, e.g.:
  - Held the focal point cleanly (MAN-160 pass) → +1 **Composure**.
  - Reasoned the structure (MAN-165 pass) → +1 **Academic**.
  - Decisive physical disruption / pushed forward when it was hardest → +1 **Confrontation** (or **Athlete**/**Streetwise**).
  - (Grad-student behavioural read can route the Academic grant naturally.)
  - Written as `<<set $player.skills.X.level += 1>>` behind a per-grant flag (set-once, so re-entering the flashback can't stack it). No tracking array — the destructive CC-500 skill rebuild was relocated to the top of CC-400 (upstream of the flashback), so the grant survives to the summary. See [BLACKOUT.md §8](BLACKOUT.md).
- **Robert relationship hook:** no separate tag — later dialogue keys off `$player.incitingIncident`.

---

## 9. Integration With Existing Flow

```
CC-300 Background  →  CC-400 Incident (select "the Dark of Manitoulin")
                     →  MAN-085 … MAN-205 (playable flashback)
                     →  CC-500 Summary (sets $player.incitingIncident, applies hooks)
                     →  INTRO-100 (existing 2005 briefing, unchanged)
```

- `CC-400` selection picks the sequence.
- MAN passages are **scene-mode** flashback with the **avatar panel visible** (she's the created character). *Note:* this sequence involves her own near-participation; if/when avatar clothing-state is implemented, a partial-undress or flushed-state shading could reflect the deep rooms — out of scope now, flagged for later.
- **Time/palette:** `afternoon` (day mode) for the table-setting MAN-085→095 → `evening` (day-mode tail) at MAN-100 → `night` at MAN-150 (out the back, full dark). The mode flip lands on going outside into the real island dark.
- MAN-205 → `CC-500` keeps the existing summary/signature/deploy flow intact. No edits to INTRO-* required.

---

## 10. Risks, Content Warnings, Tonal Pitfalls

**Content warnings (this sequence):**
- Explicit group sexual activity as an ambient, pervasive tableau — the participants are **victims under compulsion**, rendered with humanity. What must land is the wrongness of compromised will.
- The PC's own progressive, involuntary arousal and near-participation. The non-negotiable is that the **horror lands** (her judgment is being colonized); whether it *also* reads as charged is the player's interpretation and is fine. We aim at the dread, not away from the heat (§0).

> **Explicitness + placeholder convention (decided, cross-cutting).** The deep-room tableaux (esp. MAN-145 sunroom, MAN-155 dock) are meant to be **very explicit** — explicit enough that the drafting agent may judge a beat to need more than it's comfortable writing. **When that happens, do not soften the scene to fit the agent's comfort.** Drop in a clearly-marked placeholder block for a human to draft, e.g.:
>
> ```
> /* %%% HUMAN-DRAFT %%%
>    MAN-155 dock — focal-point tableau.
>    Intent: most explicit beat in the sequence; participants' humanity intact;
>    horror = compulsion/loss-of-will underneath the heat. ~100 words.
>    %%% END %%% */
> ```
>
> Keep the surrounding beat structure, links, and variable hooks intact around the placeholder so the sequence still compiles and flows; only the explicit prose is left for the human. This applies to all four incidents.
>
> **State the specifics in this design doc, not euphemisms.** If a beat-map note can only gesture ("a more explicit tableau") instead of naming what is depicted, that vagueness propagates into the prose and pinpoints the beat a human may need to draft. The explicit content for MAN-145 and MAN-155 is therefore stated concretely in §2 rather than gestured at.
- Consent obliteration is the central horror — the social rule of interruption has failed and no one can refuse.
- **No minors.** The participants are adult seasonal residents and their adult guests. Render the crowd as unambiguously adult; no ambiguity in the prose.

**Tonal pitfalls (from INCIDENTPLAN + this design):**
- **Don't let the five-point marking become occult fantasy.** The kitsch origin (printout, dollar-store candles, theme-party dare) is the whole point — it's tacky until it isn't. The Branch documents a figure; it never certifies meaning.
- **Don't make the participants cartoon rich degenerates.** Wealth is texture. Their compromised will is the horror; give them dignity that returns when it breaks.
- **Don't make her immune.** She nearly joins. The deep-room rationalization must be felt.
- **Keep the "it makes sense" subjective.** The narrator must not certify the compulsion's logic as real — she *experiences* it as logical, which is the horror (STYLE-GUIDE §13.5). Don't let the prose endorse the frenzy.
- **Don't let Branch vocabulary leak into the 2003 flashback.** Pre-Branch voice until the report passages.
- **Don't pre-resolve the mechanism.** The marking, the "it began as a dare and became real," the why — the Branch can document and suspect; it must not explain.
- Period: August 2003. Northern-Ontario/Manitoulin texture (the rock, the North Channel, no light pollution, the long drive, the difference between real cottage country and money cosplaying it). Distinguish Manitoulin geography from any heritage content (STYLE-GUIDE §6.4) — this is *place*, not a people.
- Convergence must not feel like railroading — the room choices and checks need real textural payoff (how deep, how clear, how close, which skill earned).

---

## 11. Decisions & Remaining Questions

**Inherited (decided in the Blackout pass, apply here):** per-incident prefix (`MAN`); avatar visible; convergent branching; +1 skill grant as a plain set-once `+=` (durable because the CC-500 skill rebuild was relocated to CC-400, upstream of the flashback — no tracking array); no every-playthrough storyTags (choice-derived only); recruitment bridge framed as written Branch reports, first in-person Robert beat deferred to INTRO; consent-ambiguity must read as horror (charge acceptable on top); `$nyse.influence` numbers **LOCKED** in the joint four-incident calibration (INCIDENTPLAN): **+2 base / +3 cap** (second-highest; WDS is the single highest).

**Resolved in this review:**

1. **Length of the room sequence — DECIDED.** Each room gets its own passage; target **~26 passages**. The progressive-compromise feel wins over brevity here.
2. **RCMP route — DECIDED.** *Off-duty, on vacation*, same stranded-car spine as the others (Manitoulin isn't RCMP jurisdiction). Her investigator instincts take over when the scene reads wrong, and she **still files an official report** at the end (statement to responding OPP + her own follow-up), so her account reaches the Branch as a police document. See §3.
3. **Deep-room explicitness — DECIDED.** Render it **very explicit**. If a drafting agent judges a beat to need more explicitness than it can comfortably write, it inserts a **`%%% HUMAN-DRAFT %%%` placeholder block** (see §10) rather than softening — cross-cutting convention for all four incidents.
4. **Avatar clothing-state during near-participation — DEFERRED (yes, when built).** Out of scope now (avatar runtime unbuilt), but the answer is *yes* — when the avatar system supports it, her physical/flushed/clothing state should reflect the deep rooms. Revisit at avatar-runtime implementation.
5. **`$nyse.influence` relative value — CONFIRMED (for now).** Base **+2** / cap **+3** (above the Blackout's +1/+2). Final lock when all four are set together.

**Still cross-cutting (not Manitoulin-specific):**
- The **PC sex-positivity rule** (§0) and the **explicitness/placeholder convention** (§10) both apply to all four incidents — fold into INCIDENTPLAN when the suite is done.
