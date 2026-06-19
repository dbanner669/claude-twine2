# CC-400 Origin Sequence — The Toronto Blackout

*Playable-sequence design doc. Parent: [INCIDENTPLAN.md](../INCIDENTPLAN.md). Voice/rules: [STYLE-GUIDE.md](../STYLE-GUIDE.md).*

> **Status: Implemented — pending first-play review.**
> Source: `sizzle/src/content/blackout.twee` (26 passages, BLK-085–BLK-215). CC-400 incident selection wired. Hooks confirmed in compiled output: `$nyse.influence`, `$player.flags.blkSkillGranted`, `$player.flags.blkClimbed`, `$player.flags.blkInfluenceGranted`, `$player.incitingIncident`, date restore before CC-500. Three remaining incidents remain "Coming Soon" in CC-400.

---

## 0. Design Spine (read first)

- **Convergent branching.** Choices and skill checks reroute *texture* (what she notices, feels, understands), never the outcome. Every path ends: she resists enough, introduces light, the effect collapses, she leaves, the Branch finds her on a resident's camcorder tape. A failed check = she nearly goes under and claws back, which is its own beat — not a fail state.
- **Felt stakes, fixed plumbing.** The player should believe a check could go badly. It can't, in story terms. It can in *who she becomes* terms — see §8 skill-point grants.
- **Pre-Branch voice.** August 2003. She has no NYSE vocabulary, no Branch frame. Her interiority is a sharp woman in the dark, nothing more. No "anomalous," no "focal point," no "influence pattern." Those words arrive only when Robert does, a week later. The gap between her plain 2003 noticing and his 2005 classification *is* the recruitment hinge.
- **She is not special.** Timing, caution, instinct, and a matchbook. Not immunity, not chosen. She feels the heat and the pull; she is simply not as far in as the people upstairs.
- **The anomaly stays ordinary.** Peeling paint, mailboxes, stale heat, emergency signage, old cooking smells. The horror is that a normal stairwell went wrong, not that a portal opened.
- **The PC is sex-positive — in every background, in every incident.** *(Cross-cutting; see MANITOULIN §0.)* Her horror is the **involuntary pull and the overwritten will** of the people upstairs, not that sex is happening. She is not a prude; she is afraid because the dark is reaching into bodies, including hers, and erasing the line of consent. Never frame her fear as prudishness.
- **Sell the dread, don't police the heat.** *(Cross-cutting — true for the whole game.)* Our job is to make the horror land: the wrongness, the overwritten consent, the pull she didn't choose. We do **not** write to suppress or correct for arousal. If charged material also reads as hot to a given player, that's their interpretation and it's fine. Aim at the dread; don't aim away from the heat.
- **The PC can be funny; the situation never is.** *(Cross-cutting.)* The incident and the affected residents are never played for laughs. But the **player character's voice** can be dry, sardonic, gallows-wry — a woman who copes with fear through clipped, mordant interior observation. Her wit is character and relief valve, never a joke at a victim's expense.

---

## 1. Playable Sequence Premise

Thursday, August 14, 2003. At 4:11 p.m. the power dies across Ontario and the northeast. The player character is somewhere on or near the Danforth when the grid fails; earlier that evening, for no reason she can name, she pocketed a book of matches at a bar she doesn't smoke. With the TTC dead and the city walking home in the heat, she passes a small walkup just off the Danforth and hears something through a propped-open door — a moan that is the wrong kind of wrong. Inside, the stairwell is too dark, and the dark has a pull to it. Neighbours are drifting up the stairs and not coming back down the same. She feels the heat rise in her own body and stops at the threshold. She works out, or simply senses, that the dark is the thing — and that the building's stairwell light, the one tenants say has been on for years, is finally off. She strikes a match. Light floods the stairwell and the pull collapses. People wake confused and half-dressed. She leaves before anyone can fix on her face. A week later, the incident is a Branch file — an odd police report, a ground-floor resident's camcorder tape of a woman bringing light into a stairwell, and a recommendation, signed Flett, that the subject be contacted.

**One-line for the player:** *The night the lights went out, you were the one who lit a match.*

---

## 2. Beat / Passage Map

Prefix **`BLK`** (decided — per-incident origin prefixes: `BLK` / `MAN` / `PALE` / `WDS`). Each passage targets 80–120 visible words, one beat, link text = complete sentence (PC dialogue / narration / `Continue`). Target length is **rich: ~18–22 passages** — an origin flashback that breathes, with room for background texture and the consent-ambiguity exposure to land across many small clicks rather than a few dense ones.

| Passage | Beat | Type |
|---------|------|------|
| `BLK-085 The hottest day of the year` | Table-setting (normality). Aug 14, brutal Toronto heat, the city slow and sticky. Where she is and why (background-variant). Pure ordinary. A good place for her dry voice. | Table-setting |
| `BLK-090 Up the Danforth` | Table-setting. The strip in the late afternoon — Greek diners, fruit stands, streetcars, ordinary errands and people. She drifts toward the bar. | Table-setting |
| `BLK-095 Somewhere with a fan` | Table-setting. Stepping out of the heat into the dim bar, the relief of it, first read of the room before she settles. The last fully normal beat. | Table-setting |
| `BLK-100 Last call before dark` | The Danforth bar. The room, the company (background-variant), the heat of the afternoon coming off her. She settles in. | Opening |
| `BLK-105 You don't even smoke` | She pockets a book of matches off the bar. No reason. Plants the object without underlining it. | Setup (Chekhov) |
| `BLK-110 Four-eleven` | 4:11 p.m. The power dies mid-afternoon. The bar stalls — fans stop, the cooler ticks off, the music cuts. | Turn |
| `BLK-115 Warm beer and a radio` | The bar in the dark: candle lit, the bartender's transistor radio, patrons working out it's not just the block. CSIS infers regional scope here; RCMP clocks exits. She settles up and leaves (RCMP: last to go). | Atmosphere |
| `BLK-120 Walking home in the heat` | Out into the street. TTC dead, no signals, the long walk. The civic dark — odd, communal, almost warm. | Travel |
| `BLK-125 The city helping itself` | A vignette: a stranger directing traffic, candles in shop windows, neighbours on stoops. Baseline "normal dark" so the wrong dark reads wrong. Background-flavored read of the crowd. | Atmosphere |
| `BLK-130 The propped door` | She passes the walkup. A moan through the open door — the wrong kind of wrong. **CHOICE:** look in vs. keep walking (convergent). | Choice |
| `BLK-135 Crossing the little yard` | The approach: a bike on the lawn, a propped screen door, the smell of someone's dinner gone cold. Her unease sharpening. | Beat |
| `BLK-140 The lobby` | Inside the threshold: mailboxes, stale heat, emergency signage half-lit on its battery. The stairwell is wrong — darker than the dark night behind her. **CHECK:** notice *how* wrong. | Skill check |
| `BLK-145 The man who won't go up` | A ground-floor resident, scared and lucid, hasn't climbed. His offhand line plants the maintenance history in-scene: that stairwell light's been on since he moved in, years. | Beat (the reveal seed) |
| `BLK-150 What the dark is doing` | A neighbour drifts past her toward the stairs, undressing, blank-faced, climbing into the dark. | Escalation |
| `BLK-155 The sound from above` | Sounds, a glimpsed silhouette on the landing. Her own body answering — heat, a low want she didn't choose. Consent-ambiguity exposure. | Escalation |
| `BLK-160 The pull` | The dark wants her up the stairs and part of her wants to go. **CHECK:** Composure to hold at the threshold (convergent — fail = a step up). | Skill check |
| `BLK-165 Two steps up` | Resolution of the check. Pass: she keeps her feet. Fail: she's a step or two up before a sound / her hand on the matchbook snaps her back. Closest she comes. | Beat |
| `BLK-170 It's the dark itself` | The realization: not a person, not a smell — the absence of light, and a light that should have been on. **CHECK (optional):** reason it vs. act on instinct. | Insight |
| `BLK-175 The matchbook` | Her hand finds it. The decision to act. A first strike that doesn't catch — the match is damp, her hands aren't steady. Tension. | Intervention (build) |
| `BLK-180 One match` | It catches. Light enters the stairwell. The pull collapses. Minor **CHOICE:** what she carries the flame to (cosmetic). | Intervention |
| `BLK-185 The building exhales` | Above and around her, people stirring, confused, half-dressed, ashamed without a source. The wrong is over. | Aftermath (scene) |
| `BLK-190 Before anyone thanks you` | She backs out over the same threshold she held at, and goes. No thanks, no questions. | Aftermath (scene) |
| `BLK-200 The rest of the dark` | The walk home, changed. She can't make the night make sense and knows better than to try out loud. | Aftermath (interior) |
| `BLK-205 Still out` | Brief: next morning, power still down across the city (it was, for days). A quiet, ordinary beat that lets the strangeness settle. | Aftermath (interior) |
| `BLK-210 Incident report` | ~One week later, presented as a **Branch report document** (file extract, clinical NYSE voice): an odd police report flagged, a ground-floor resident's camcorder tape obtained, the footage described in personnel-form language — a woman hesitates at the stairwell threshold, introduces a light source, departs. First appearance of the bureaucratic veneer. | Recruitment bridge (report) |
| `BLK-215 Recommendation` | A **recruitment recommendation memo**, signed Flett: classifies the event without explaining it, names her, recommends contact. Bridges to `CC-500` (personnel file). Sets `$player.incitingIncident`. | Recruitment bridge (report) |

~25 passages (three table-setting + the original ~22). Branches in BLK-130 / BLK-160 / BLK-170 / BLK-180 all reconverge by BLK-180/185.

**Time / palette:** BLK-085–135 are **afternoon, day mode**; crossing into the building at **BLK-140 flips to evening, night mode** (see §9). The recruitment-bridge report passages (BLK-210/215) are presented as documents, outside the scene clock.

---

## 3. Opening Setup & Background Variants

**Universal frame (BLK-085 → BLK-110):** All four backgrounds spend three ordinary table-setting beats arriving at the **same Danforth bar** on the brutally hot late afternoon of Aug 14. She pockets a matchbook off the bar — doesn't smoke, doesn't know why. The grid fails at 4:11 while she's there. The matchbook always comes from this bar; the variants change *why she's there* and *what she does with a cop's / analyst's / civilian's eyes* — not the events or the props.

- **Grad student (psychology) — `City Dweller`, `Lived in Toronto`:** A beer, marking up a stack of readings or killing a slow afternoon. She knows this stretch. When the lights go she reads the room the way she reads a seminar — who's calm, who's about to panic.
- **Unemployed after university — `City Dweller`, `Lived in Toronto`:** Same bar, less reason to be anywhere. Nursing one beer because money's tight, in no hurry to get back to an apartment she can't really afford. The walk home is the only option a dead transit system leaves her anyway.
- **RCMP constable — `Northern Ontario`:** In Toronto for a policing conference, unwinding at the bar with a few other junior officers from the sessions. This isn't her city and its scale sits wrong with her. The group thins out as the dark settles; she's the **last to leave**. When the grid fails she clocks it as an incident before an inconvenience — exits, crowd flow, where trouble will start.
- **CSIS analyst — `City Dweller`:** In Toronto for an intelligence-analysis event, decompressing at the same bar rather than the conference hotel. Desk-trained, not field-trained, and aware of the difference. She doesn't act on instinct so much as *infer* — she's the one who works out the outage is regional, not local, from what the radio and the streetlights aren't doing.

**Voice discipline across variants:** same woman, different prior years. One or two sentences of shading per branch, parallel structure, not a rewrite (STYLE-GUIDE §3.2). A reader of one playthrough never knows the others exist.

---

## 4. Escalation Pattern

A four-rung ladder from ordinary to nearly-lost, each rung a passage:

1. **Civic dark (BLK-120).** The blackout as shared, mundane, even warm — strangers helping strangers. Establishes baseline so the wrong dark reads as wrong.
2. **Wrong dark (BLK-130→140).** The propped door, the moan, the stairwell that is darker than the rest of the dark night. Curiosity edged with unease.
3. **Pull (BLK-150→160).** Someone goes up and changes. Her own body answers — heat, a low want she didn't choose. The horror and the arousal share the same nerve; she can't cleanly separate fear from desire, and that's the point.
4. **Almost (BLK-160 fail / BLK-170).** The closest she comes to going up. She is a step in before instinct or the matchbook pulls her out. She wins by being *late and careful*, not strong.

The eroticism escalates with the danger and never detaches from it: the further up the stairs the pull reaches, the more her own composure frays. What's happening upstairs stays off-page — sounds, a glimpsed silhouette, the aftermath. Implication beats depiction (INCIDENTPLAN tonal pitfall).

---

## 5. Player Choices & Skill Checks

All convergent. Difficulties tuned low-to-moderate so a passing feel is common; failure is always survivable and generative.

### Choices
- **BLK-130 — Look in or keep walking.** *Look in* → straight into the lobby. *Keep walking* → the moan/heat follows her half a block, she can't shake it, she turns back. Same destination, different self-image (drawn in vs. couldn't leave it).
- **BLK-160 — Hold or climb (framed as instinct, not menu-y).** *Hold* → she keeps her feet. *Climb* → one or two steps up before a sound, a falling object, or her own hand on the matchbook snaps her back. Both reach BLK-170; *climb* nudges starting `$nyse.influence` up by 1 (she got further in).
- **BLK-180 — What she lights (cosmetic).** Match held up / a hallway votive / a folded flyer as a torch. Pure flavor; all produce "light enters."

### Skill checks (use `<<skillCheck>>`, place onward links in both branches)
- **BLK-140 — Notice how wrong (Composure or Streetwise, low DC).** *Pass:* she registers that the dark is unnatural, not just absence of power — earns her a head start on the insight. *Fail:* she only feels it as dread, understands later; slightly more exposure.
- **BLK-160 — Hold at the threshold (Composure, moderate DC). The spine check.** *Pass:* she holds; clean. *Fail:* she takes the step (→ climb branch), claws back; +1 `$nyse.influence`, +texture for the scar. Never a loss — momentum/instinct recovers her, mirroring how the other incidents weaponize physical inevitability.
- **BLK-170 — Name the cause (Academic or Streetwise, low DC, optional).** *Pass:* she *reasons* it — the light, the years it was on (she heard it from the man in BLK-145), the dark as the active thing. *Fail:* she doesn't reason it; her hand finds the matchbook anyway and she acts on instinct. Both → BLK-175/180. This is the cleanest "ingenuity vs. luck" fork; both are recruitment-worthy, differently. Outcome differs only in prose texture and which skill earns the +1 (§8) — no tag, no story divergence.

---

## 6. The Recruitment-Worthy Intervention

She lights a match in a stairwell that should never have gone dark. That's the whole of it, and that's the point: small, practical, unmythic. A woman who doesn't smoke, carrying matches she can't explain, does the one thing the phenomenon cannot tolerate — and does it while feeling the pull herself.

The Branch's read (surfaced only in the BLK-210/215 report documents, in clinical voice): she didn't panic, didn't rationalize it away, didn't freeze, and didn't go up. Of everyone near that building, she was the one who *acted on what she observed.* The matchbook is left deliberately ambiguous (per INCIDENTPLAN): absent-minded acquisition, or something upstream nudged her to carry the one useful object. The report won't oversell the second reading — at most, a note that the subject "was, by chance or otherwise, equipped in a way that proved operationally useful."

---

## 7. Aftermath & Branch / Robert Bridge

- **BLK-190 (scene aftermath):** people waking confused and half-dressed, a shared shame no one can source. She does not wait to be thanked or questioned. Threshold exit — she steps back over the same line she held at, and goes. (Mirror image: the threshold she refused to cross upward is the one she now crosses outward.)
- **BLK-200 (interior aftermath):** the walk home. No phobia — the scar is the general one (INCIDENTPLAN): there is a hidden layer to the ordinary world, it is dark and dangerous, and she has now seen it. She already knows not to say it out loud.
- **BLK-210 / BLK-215 (Branch report documents, ~1 week later):** because the game never leaves the PC's PoV, the Branch-side discovery is **shown as written reports, not omniscient narration**. BLK-210 is an incident-report/camcorder extract in clinical NYSE voice (odd police report flagged → a ground-floor resident's camcorder tape: subject hesitates at the stairwell threshold, introduces light, departs). The source is a camcorder, **not CCTV** — the power is out and a 2003 walkup has no cameras, so the ground-floor resident (the "don't go up" man) filmed her without her noticing; Flett notes she never clocks him. BLK-215 is a recruitment recommendation memo signed Flett — classifying the event without explaining it, naming her, recommending contact. This is the first appearance of the bureaucratic veneer and the dramatic irony (the report drains the wonder out of the impossible). It styles like the personnel-file aesthetic CC already uses (JetBrains mono stamps, redaction texture). The bridge hands off to `CC-500 Summary`, which sets `$player.incitingIncident` and returns to the existing flow. (See §9.)
  - *Note:* this defers the first **in-person** Robert beat. The player meets him face-to-face two years later in the existing INTRO briefing; the origin sequence introduces him only as a signature on a report. That's a deliberate PoV-preserving choice — flag for the author in case they'd rather have a brief in-person contact beat at the end of 2003 (see §11).

Robert relationship seed: he recruited her because she did the practical thing the phenomenon couldn't tolerate, under its pull, without a framework. That's the quality he'll later trust — and quietly worry about — when he sends her into Sizzle.

---

## 8. Variable Hooks

- **`$player.incitingIncident`** = `"the Toronto Blackout"` (reads correctly in INTRO-101's interpolation; replaces the `"the incident"` fallback).
- **`$nyse.influence` (starting):** low — recommend base **+1** (she observed more than she absorbed; lowest of the four incidents per INCIDENTPLAN). Modifiers: `climb` choice (BLK-160) or failed Composure hold → **+1**. Cap incident contribution at +2 so it stays the "least exposed" origin. *LOCKED in the joint four-incident calibration (INCIDENTPLAN): +1 base / +2 cap, tied with Pale Eyes as the lowest of the four; expected outcome ~+1.*
- **`storyTags` — the rule (general, all four docs):** a tag earns its place **only if it's choice-derived** — i.e. some playthroughs of the sequence get it and some don't. If *every* player who plays this incident would receive the tag, it's redundant with `$player.incitingIncident === "the Toronto Blackout"` and later content should check the flag instead. If only some players get it (because of a choice or check outcome), the tag is doing real work and is worth minting.
  - **No "every-playthrough" tags from this incident** (no `Blackout Witness`). Later checks key off the incident flag. Background tags (`City Dweller`, etc.) are unaffected — those come from CC-300.
  - **Candidate choice-derived tags** (mint only if later content will actually branch on them; propose via `[! tag candidate]`, don't add unilaterally):
    - Whether she **climbed** at BLK-160 (a step onto the stairs) vs. **held** — a real fork some players experience and some don't. Could justify a tag if later Sizzle content wants to know she once felt the pull strongly enough to move toward it.
    - Whether she **reasoned** the cause (BLK-170 pass) vs. acted on **instinct** — likewise, only if later content distinguishes them.
  - Default position: leave these as prose texture + the §8 skill grant unless a concrete downstream use appears. Don't pre-mint.
- **The "scar" is prose texture, not a tag.** The lasting disturbance — sensitivity around darkness, thresholds, heat, close bodies, unexplained desire — lives in how later passages are written for a Blackout-origin character (surfaced by the incident flag), not in a tracked scar variable.
- **Skill-point grant — DECIDED: yes, grant +1.** Award **+1 to one skill** based on the play pattern, e.g.:
  - Held the threshold cleanly (BLK-160 pass) → +1 **Composure**.
  - Reasoned the cause (BLK-170 pass) → +1 **Academic**.
  - Acted decisively / went in and intervened fast → +1 **Streetwise** (or **Confrontation**).
- **General skill-adjustment scaffolding — DECIDED: no array, no system needed (implemented).** The whole game still needs to add and subtract skill points over time (incident grants now; story rewards, NYSE penalties, training, fatigue later), but this needs **no tracking layer**. Grants and penalties are written as a plain `<<set $player.skills.X.level += n>>` (or `-=`) wherever they occur. The only thing that ever wiped such a grant was `CC-500 Summary`, which zeroed all skills and rebuilt them from the background on every visit. That destructive rebuild has been **relocated to the top of `CC-400 Incident`** (background is locked at CC-300, always upstream), so it runs *before* any flashback. A flashback grant done after CC-400 therefore survives to the summary and into play. Incident grants must be written **set-once** — guard each with a per-grant flag (e.g. `$player.flags.blkSkillGranted`) so re-entering the flashback as a fresh moment can't stack it. The `$player.flags` object (a namespace for one-shot boolean latches) is initialized in `variables.twee`; an unset flag reads as `undefined` (falsy), so no pre-seeding is needed. Mid-game rewards/penalties need no guard unless the passage can re-fire as a fresh moment. (See §10.)
- **Robert relationship hook:** no separate tag — later Robert dialogue keys off `$player.incitingIncident`. "You lit a match" becomes his shorthand for why he trusts her judgment under pressure; it needs no flag beyond the incident value.

---

## 9. Integration With Existing Flow

Proposed character-creation path:

```
CC-300 Background  →  CC-400 Incident (select "the Toronto Blackout")
                     →  BLK-085 … BLK-215 (playable flashback)
                     →  CC-500 Summary (sets $player.incitingIncident, applies hooks)
                     →  INTRO-100 (existing 2005 briefing, unchanged)
```

- `CC-400` currently holds redacted placeholder text; selection there picks the sequence.
- BLK passages are **scene-mode** flashback with the **avatar panel visible** (decided — she's the created character; her fixed baseline appearance carries into the flashback).
- **Day→night transition at the threshold (decided).** BLK-085 through BLK-135 run in **afternoon / day mode** (`<<setTime "afternoon">>`, daytime palette) — the table-setting, the bar, the blackout at 4:11, the walk. When she **crosses into the building at BLK-140**, set evening (`<<setTime "evening">>`) and the palette flips to **night mode**. The mode flip lands on the act of entering the wrong space, and it tracks the real event clock (blackout mid-afternoon, full dark by the time the trouble inside is underway). Everything BLK-140 onward is night.
- BLK-210 → `CC-500` keeps the existing summary/signature/deploy flow intact.
- No edits to INTRO-* required; INTRO-101's fallback simply stops being exercised once the value is set.

---

## 10. Risks, Content Warnings, Tonal Pitfalls

**Content warnings (this sequence):**
- Ambient non-consensual compulsion (the upstairs effect) experienced as off-page sound/aftermath, not depicted.
- The PC's own involuntary arousal under influence — consent-ambiguity. The non-negotiable is that it **reads as horror**: her want is not cleanly hers and the prose must let her feel that wrongness. Whether it *also* reads as titillating is left to the player's interpretation and is acceptable — the two are not in conflict here, as long as the horror is always present underneath.
- Voyeuristic glimpses (a drifting, undressing neighbour). No explicit upstairs scene.
- **No minors** in any sexualized or compromised context. The walkup's affected residents are adults.

**Tonal pitfalls (from INCIDENTPLAN + this design):**
- Don't make the stairwell a portal. Keep it a real, shabby walkup stairwell.
- Don't make her immune. She feels the pull; she's just late and careful.
- Don't show too much upstairs. Sounds, glimpses, reports.
- Don't let the Branch (or the narration) explain the mechanics. The dark can be classified as a vector/focal condition without being solved. Keep her perception subjective — she suspects, she can be wrong.
- Don't let Branch vocabulary leak into the 2003 flashback. Pre-Branch voice until BLK-210.
- Period: Aug 14 2003, not 2005. Real, well-documented event — lean on real texture (4:11 p.m., ~30°C, evening commute stranded, streetcars dead, candle-lit patios, radios for news). Tech is *earlier* than the 2005 baseline, never later.
- Convergence must not feel like railroading. The choices need real textural payoff (different self-image, different scar, different skill grant) so the funnel is invisible.

---

## 11. Decisions & Remaining Questions

**Resolved (folded into the doc above):**

- **Prefix:** per-incident `BLK` / `MAN` / `PALE` / `WDS`.
- **Avatar:** visible during the flashback.
- **Skill grant:** yes, +1 based on play pattern (§8).
- **Skill-mod scaffolding:** no array, no system — the destructive skill rebuild was **relocated from CC-500 to the top of CC-400** (upstream of the flashback), so grants are plain set-once `+=` and survive. Implemented (§8).
- **Matchbook + all backgrounds:** all four start in the same Danforth bar; matchbook always from that bar (§3).
- **"Light was on for years":** revealed **in-sequence** via the ground-floor resident (BLK-145), not held for Robert.
- **`$nyse.influence` numbers:** **LOCKED** in the joint four-incident calibration (INCIDENTPLAN): **+1 base / +2 cap**, tied with Pale Eyes as the lowest of the four.
- **Length:** **rich, ~18–22 passages** (possibly more). Sets the template for the other three.
- **Cross-linking:** approved — add pointers from `INCIDENTPLAN.md` to these docs.

**Newly resolved this pass:**

- **Tagging rule:** tags are allowed when **choice-derived** (some playthroughs get them, some don't); every-playthrough facts stay on `$player.incitingIncident`. (§8)
- **Day→night:** flips at the building threshold, BLK-140. (§2, §9)
- **Recruitment bridge:** framed as **written Branch reports** (PoV-preserving), deferring the first in-person Robert beat to the 2005 briefing. (§2, §7)
- **Skill-grant mapping:** confirmed for now (Composure / Academic / Streetwise per play pattern). (§8)
- **BLK-155 calibration:** must read as horror; reading *also* as titillation is fine and player-dependent. (§10)

**Still open (deferred):**

1. **Skill-mod implementation — DONE.** The CC-500 rebuild was relocated to the top of CC-400 (upstream of the flashback), so a flashback grant written as a plain set-once `+=` survives. No `skillMods` array exists or is needed. BLK prose that grants a point just sets `$player.skills.X.level += 1` behind a per-grant flag. The `$player.flags` namespace now exists in `variables.twee`, so the guard pattern is ready to use.
2. **First in-person Robert beat in 2003?** Default is no — he's only a signature on a report in the origin sequence, with the face-to-face deferred to INTRO. Flag if you'd rather add a brief 2003 contact beat. (§7)
