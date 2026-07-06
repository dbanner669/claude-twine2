# Phase 1 Conversion Report — twee → ink bulk converter

Status: **COMPLETE** — all three verification gates green (dotnet build, headless ink import, GUT 26/26).

Date: 2026-07-05. Branch: `godot/greenfield` (uncommitted, per instructions).

## Scope & deliverables

One-time conversion of the five playable sequences from `sizzle/src/content/` (READ-ONLY source) to `godot/content/`. `main-menu.twee` and `character-creator.twee` excluded — native scenes (plan Phases 3/5).

| Deliverable | Location |
|---|---|
| Converter | `twine-mcp-server/src/ink-export/{expr,convert,index}.ts`, npm script `export-ink` |
| Outputs | `godot/content/{briefing,blackout,manitoulin,pale,wds}.ink` + `.ink.import` sidecars (`is_main_file=true`, fresh uids, Godot-scheme md5 dest paths — Phase 0.5 gate finding #2) |
| Tests | `twine-mcp-server/test/ink-export.test.ts` (29 tests; whole suite 79/79 incl. the pre-existing 50) |
| Warning dump | `twine-mcp-server/ink-export-warnings.json` (machine-readable; regenerated on every run — build artifact, safe to gitignore) |
| This report | `sizzle/docs/godot/PHASE-1-CONVERSION-REPORT.md` |

## Per-file results

| File | Passages | Knots emitted | Stubs | Checks | Choices | Warnings | Hand-fixed |
|---|---|---|---|---|---|---|---|
| briefing.twee → briefing.ink | 37 | 37 + `intro_end` | 0 | 3 | 55 | 13 | 0 |
| blackout.twee → blackout.ink | 26 | 26 + `blk_end` | 2 | 3 | 32 | 10 | 0 |
| manitoulin.twee → manitoulin.ink | 24 | 24 + `man_end` | 2 | 4 | 31 | 11 | 0 |
| pale.twee → pale.ink | 22 | 22 + `pale_end` | 2 | 4 | 32 | 15 | 0 |
| wds.twee → wds.ink | 22 | 22 + `wds_end` | 2 | 4 | 30 | 12 | 0 |
| **Total** | **131** | **131 + 5 end knots** | **8** | **18** | **180** | **61** | **0** |

**Hand-fixes: none.** Every construct went through the converter; the generated files are byte-for-byte converter output. (Two converter-side bugs found during development — a brace-balance false positive and test-fixture mistakes — were fixed in the converter, not by editing output.)

## Stop-loss assessment

Threshold was >20% of passages needing hand conversion → **0% needed hand conversion.** 8/131 passages (6.1%) are deliberate extract stubs per INK-CONVENTIONS.md (converter-emitted, not hand conversions). Stop-loss not triggered.

## Verification (all green, 2026-07-05)

1. `dotnet build godot/Sizzle.sln` — 0 errors (1 pre-existing godot-ink CS0108 warning).
2. Headless import (`--headless --path godot --import`) — all five .ink reimported, **zero ink compile errors**; compiled resources present in `godot/.godot/imported/` (11–17 KB each). `is_main_file=true` and generated uids survived the import round-trip.
3. GUT: **26/26 passing, 175 asserts** (unchanged from the Phase 0.5 gate).

Residue scan of the generated files: no `<<` macro leftovers, no `UNCONVERTED` markers, no HTML tags, no raw `$vars` (only two `//` comments mention `$` deliberately).

## Transform coverage (what mapped to what)

- `:: PREFIX-NUM Title [tags]` → `// Title` + `=== PREFIX_NUM ===` + `# id:` + mapped tags (`avatar-*-day/night` → `# avatar:`, `daytime/nighttime` → `# mode:`, `avatar-hidden` → `# screen: menu`, `history-root` → `# history_root`, `nobr` dropped).
- `<<silently>>` preambles → op lines, ordered date/time → `set_header` → everything else (matches the slice shape). `<<header>>`/`<<page>>` dropped. `/* … */` comments survive as `// …`.
- `<<set $header.location/time>>` pairs → `~ set_header(loc, time)`; `<<setDate/setTime/advanceDays/advanceTime>>` → `~ set_date/set_time/advance_days/advance_time`; `<<addNotification>>` → `~ toast("info", …)`.
- `$player.flags.*` → per-file `VAR` (camelCase → snake_case) + `{ not x: … }` guards; skill grants → `~ grant_skill("name", n)`; `$nyse.influence +=` → `~ adjust_influence(n)` — incl. the MAN/PALE/WDS temp-var pattern, translated via ink `~ temp`.
- `<<skillCheck>>` → hoisted `# check: <skill> <dice> <target>` knot tag + `{ check_passed: … - else: … }`; prose before the check stays before the conditional (runtime pauses after the knot's first line). `_checkSkill` set-expressions dropped (engine resolves the skill from the tag) — every instance warned.
- `<<if>>/<<elseif>>/<<else>>` → dashed conditional blocks; sentence-embedded ifs → inline `{cond: a|b}` (nested for elseif chains). `<<switch>>/<<case>>` → conditional block (no corpus instances; covered by tests).
- `[[Sentence.|TARGET]]` → `* [Sentence.] -> TARGET`; `<<goto>>` → bare divert; `<<link>>+<<goto>>` → plain choice; `<<link>>+<<replace>>` / `<<linkreplace>>` → choice+gather reveal (append drift, warned per instance).
- INTRO-410 question hub (`hasVisited` + greyedOut spans) → conditional once-only choices `* {TARGET == 0} […] -> TARGET`; visited-greying is presentation (visit counts) per conventions. The twee's own quirk is preserved: the NYSE question gates on `INTRO_300`, not its own target `INTRO_500` (ink `*` once-only also closes the twee's re-ask loophole).
- `<<term "K">>`/`<<term "K" "shown">>` → `[url=gloss:K]shown[/url]`; `//emphasis//` → `[i]…[/i]`; `<<playerRealName>>` → `{player_name}`; `<<print $x || "fb">>` → `{x != "": {x}|fb}` (mirror vars only).
- `hasVisited("P")` → knot visit counts (`P > 0` / `P == 0`); `$player.storyTags.includes` → `has_tag(…)`; `eq/neq/is/gte/…` → operators; `and/or/not` kept.
- `$briefing` scene-state object → per-file `VAR briefing_*`; `<<set $briefing to {}>>` → explicit resets of the discovered fields.
- Branch-file-extract passages → stub knots (`# screen: menu`, `# scene: branch_file_extract`, `# extract: <id>`, preamble ops, one placeholder line, onward choice). Full HTML preserved below.
- Out-of-file link targets (`CC-500 Summary`, `Start`) → per-file `<prefix>_end` handoff knot → `-> END`, each warned.

## Runtime / Phase-2 follow-ups surfaced by the conversion

1. **Multi-skill checks (7):** `# check: composure/streetwise 2d6 7` etc. The twee used `Math.max()` of two skills. The engine's check handler must treat slash-separated skill names as max-of when resolving the modifier. Affected: BLK-140, MAN-165, PALE-120/135/145, WDS-130/160.
2. **`inciting_incident` writes (4):** the closing `<<link "The file closes.">>` in each origin sequence set `$player.incitingIncident` and jumped to CC-500. `inciting_incident` is mirrored (read-only in ink; no command op exists). The native CC-500 handoff must set it engine-side when leaving `blk_end`/`man_end`/`pale_end`/`wds_end`. A `// TODO(runtime)` comment sits in each final choice.
3. **Composure-check semantics:** twee "Composure" checks rolled `$player.currentComposure` (with skill-level fallback). The `# check: composure …` tag must resolve to *current composure*, matching the slice/StoryBridge behavior proven at the gate.
4. **Images (2):** INTRO-110 (Robert diner entry) and MAN-110 (lake mansion) had `<img>` headers — dropped with `// [image] …` breadcrumbs; native presentation decision pending.
5. **INTRO-800 end screen:** the `end-screen` div flattened to two prose lines + `-> END`; a native end-of-prologue treatment can replace it later.
6. **MAN-200 extract variant:** the occurrence-report extract HTML contains a `<<if $player.background…>>` variant (RCMP vs OPP flagging). The BranchFileExtract data resource needs a background-conditional slot (conditional preserved verbatim in the HTML below).
7. **Time-slot strings pass through verbatim** (e.g. `set_time("laterNight")`, WDS-100) — the ops layer must accept the SugarCube slot spellings (they are the canonical `$date.slot` values in STATE-SCHEMA.md).
8. **`toast("info", …)`:** INTRO-620's `<<addNotification>>` mapped to kind `info`; revisit if another toast kind fits better.

## Prose fidelity

**No trimming.** Full prose carries over line-for-line for all 123 non-stub passages. The Phase 0.5 slice's trims do NOT apply here — `godot/content/blackout.ink` supersedes the slice's coverage with full prose (the slice itself, in `godot/content/slice/`, is untouched). Known, accepted deltas:

- Paragraph breaks: twee blank-line paragraphs → one ink line per paragraph (ink renders each line as a paragraph; same reading experience).
- Reveal choices append their continuation text rather than replacing in place (approved drift, INK-CONVENTIONS.md sign-off #1). 7 instances, in the warning table.
- Greyed visited links become hidden once-only choices (conventions: greying is presentation from visit counts; the authored `greyedOut` spans were markup, not prose).
- The slice's demonstrative `{day_of_week}` interpolation in BLK-205 is not reproduced — the twee prose says "Friday morning" and that ships (the date is still advanced via `~ advance_days`, so the mirror stays correct).
- Double-spaces after periods in the twee are preserved as-is.

## Full warning list (61)

53 rows below plus 8 `extract-stub` warnings (one per document passage; their HTML is in the next section). Category counts: check-expr-dropped 19, extract-stub 8, reveal-drift 7, multi-skill-check 7, hub-conditional-link 6, external-target 5, no-op-for-write 4, raw-html 3, raw-html-img 2.

| File | Passage | Category | Detail |
|---|---|---|---|
| briefing | INTRO-110 Robert arrives | raw-html-img | `<img>` dropped, src=media/characters/robert-flett-diner-entry.png |
| briefing | INTRO-410 Rules | hub-conditional-link | visited-link hub "Tell me more about the NYSE reports." → conditional once-only choice |
| briefing | INTRO-410 Rules | hub-conditional-link | visited-link hub "Tell me more about the club itself." → conditional once-only choice |
| briefing | INTRO-410 Rules | hub-conditional-link | visited-link hub "What's the risk assessment?" → conditional once-only choice |
| briefing | INTRO-410 Rules | hub-conditional-link | visited-link hub "Have you sent anyone in before?" → conditional once-only choice |
| briefing | INTRO-410 Rules | hub-conditional-link | visited-link hub "I lived in Toronto for a few years. What if someone recognizes me?" → conditional once-only choice |
| briefing | INTRO-410 Rules | hub-conditional-link | visited-link hub "Ugh, Toronto?" → conditional once-only choice |
| briefing | INTRO-530 Question previous | check-expr-dropped | `<<set _checkSkill to (typeof $player.currentComposure === "number") ? $player.currentComposure : $player.skills.composure.level>>` dropped — engine resolves via # check tag |
| briefing | INTRO-610 Reading Robert | check-expr-dropped | same `_checkSkill` current-composure expression dropped |
| briefing | INTRO-800 End | raw-html | stripped tag: `<div class="end-screen">` |
| briefing | INTRO-800 End | raw-html | stripped tag: `<p class="end-label">` |
| briefing | INTRO-800 End | raw-html | stripped tag: `<p class="end-continue">` |
| briefing | INTRO-322 Concerns | external-target | link target "Start" is outside this file — routed to intro_end |
| blackout | BLK-130 The propped door | reveal-drift | `<<link>>+<<replace>>` "You keep walking." → choice+gather |
| blackout | BLK-140 The lobby | multi-skill-check | "Composure / Streetwise" — engine must resolve max-of for "composure/streetwise" |
| blackout | BLK-140 The lobby | check-expr-dropped | `<<set _checkSkill to Math.max($player.skills.composure.level, $player.skills.streetwise.level)>>` dropped |
| blackout | BLK-145 The man who won't go up | reveal-drift | `<<linkreplace>>` "You ask if he knows what's happening." → choice+gather |
| blackout | BLK-160 The pull | check-expr-dropped | `<<set _checkSkill to $player.skills.composure.level>>` dropped |
| blackout | BLK-170 It's the dark itself | check-expr-dropped | `<<set _checkSkill to $player.skills.academic.level>>` dropped |
| blackout | BLK-215 Recommendation | no-op-for-write | native CC-500 handoff must apply `<<set $player.incitingIncident to "the Toronto Blackout">>` |
| blackout | BLK-215 Recommendation | external-target | link target "CC-500 Summary" routed to blk_end |
| manitoulin | MAN-110 Nobody answers | raw-html-img | `<img>` dropped, src=media/locations/lake-mansion.png |
| manitoulin | MAN-125 Look at me | check-expr-dropped | `_checkSkill` current-composure expression dropped |
| manitoulin | MAN-140 Forward or back | reveal-drift | `<<link>>+<<replace>>` "You try to leave." → choice+gather |
| manitoulin | MAN-145 The sunroom | check-expr-dropped | `_checkSkill` current-composure expression dropped |
| manitoulin | MAN-160 Almost | check-expr-dropped | `_checkSkill` current-composure expression dropped |
| manitoulin | MAN-165 The pattern is the thing | multi-skill-check | "Academic / Streetwise" — max-of for "academic/streetwise" |
| manitoulin | MAN-165 The pattern is the thing | check-expr-dropped | `Math.max(academic, streetwise)` expression dropped |
| manitoulin | MAN-205 Recommendation | no-op-for-write | native CC-500 handoff must apply `<<set $player.incitingIncident to "the Dark of Manitoulin">>` |
| manitoulin | MAN-205 Recommendation | external-target | link target "CC-500 Summary" routed to man_end |
| pale | PALE-120 The rule | multi-skill-check | "Agent / Academic" — max-of for "agent/academic" |
| pale | PALE-120 The rule | check-expr-dropped | `Math.max(agent, academic)` expression dropped |
| pale | PALE-125 The mirror | reveal-drift | `<<link>>+<<replace>>` "You use the mirror." → choice+gather |
| pale | PALE-125 The mirror | reveal-drift | `<<link>>+<<replace>>` "You stay with cover and glimpses." → choice+gather |
| pale | PALE-135 Don't look up | multi-skill-check | "Composure / Agent" — max-of for "composure/agent" |
| pale | PALE-135 Don't look up | check-expr-dropped | `_composureSkill` current-composure expression dropped |
| pale | PALE-135 Don't look up | check-expr-dropped | `Math.max(_composureSkill, agent)` expression dropped |
| pale | PALE-140 She can't just walk out | reveal-drift | `<<link>>+<<replace>>` "You try to slip away." → choice+gather |
| pale | PALE-145 The loophole | multi-skill-check | "Academic / Streetwise" — max-of for "academic/streetwise" |
| pale | PALE-145 The loophole | check-expr-dropped | `Math.max(academic, streetwise)` expression dropped |
| pale | PALE-160 "STOP." | check-expr-dropped | `_checkSkill` current-composure expression dropped |
| pale | PALE-205 Recommendation | no-op-for-write | native CC-500 handoff must apply `<<set $player.incitingIncident to "the Woman with the Pale Eyes">>` |
| pale | PALE-205 Recommendation | external-target | link target "CC-500 Summary" routed to pale_end |
| wds | WDS-120 The smell | check-expr-dropped | `_checkSkill` current-composure expression dropped |
| wds | WDS-130 The smell is doing it | multi-skill-check | "Academic / Streetwise" — max-of for "academic/streetwise" |
| wds | WDS-130 The smell is doing it | check-expr-dropped | `Math.max(academic, streetwise)` expression dropped |
| wds | WDS-135 Her own body | check-expr-dropped | `_checkSkill` current-composure expression dropped |
| wds | WDS-140 Run or stay | reveal-drift | `<<link>>+<<replace>>` "You run for the car." → choice+gather |
| wds | WDS-160 Driving it off | multi-skill-check | "Composure / Confrontation" — max-of for "composure/confrontation" |
| wds | WDS-160 Driving it off | check-expr-dropped | `_composureSkill` current-composure expression dropped |
| wds | WDS-160 Driving it off | check-expr-dropped | `Math.max(_composureSkill, confrontation)` expression dropped |
| wds | WDS-205 Recommendation | no-op-for-write | native CC-500 handoff must apply `<<set $player.incitingIncident to "Wet Dog Smell">>` |
| wds | WDS-205 Recommendation | external-target | link target "CC-500 Summary" routed to wds_end |

## Extract-passage HTML (preserved for the BranchFileExtract scene template)

Eight stub knots; each `# extract:` id below matches the tag in the generated ink. This HTML is the styling source of truth for the native scene template (stamps, eyebrows, redaction spans, mono body).

### BLK-210 Incident report — `# extract: blk_incident_report_03_DAN_0814`

```html
<div style="background:var(--sz-ink-3);border:1px solid var(--sz-rule);padding:28px;position:relative;margin-top:8px">
<span class="stamp" style="position:absolute;top:14px;right:14px;transform:rotate(-8deg)">Classified</span>
<div class="eyebrow --brick" style="margin-bottom:14px">Incident File · 03-DAN-0814 · Extract</div>
<div style="font-family:var(--sz-f-mono);font-size:12px;line-height:1.8;color:var(--sz-cream-soft)">
<p>INCIDENT DATE: 2003.08.14. Flagged from TPS unusual-occurrence log 2003.08.18.</p>
<p>Complaint received re: disturbance, <span class="redact" style="width:110px"></span> Danforth Avenue East, approx. 18:30 hrs. Responding officer: no evidence. Residents, upper floors: disoriented, no recall 16:15–19:00 hrs. No injuries. No charges.</p>
<p>Recording obtained 2003.08.20: handheld camcorder footage from a ground-floor resident, taped through the outage on battery. Subject (F, approx. 25–30) enters lobby, hesitates at the stairwell threshold approx. 45 sec., introduces <span class="redact" style="width:80px"></span> light source, departs approx. 3 min. later. Subject does not return to frame.</p>
<p>Building maintenance records: stairwell fixture confirmed operational continuously, min. <span class="redact" style="width:50px"></span> years prior to incident date. Classification: <span style="color:var(--sz-brass);font-style:italic">pending review</span>.</p>
</div>
</div>
```

### BLK-215 Recommendation — `# extract: blk_recommendation_r_flett`

```html
<div style="background:var(--sz-ink-3);border:1px solid var(--sz-rule);padding:28px;position:relative;margin-top:8px">
<span class="stamp" style="position:absolute;top:14px;right:14px;transform:rotate(5deg)">Eyes Only</span>
<div class="eyebrow --brick" style="margin-bottom:14px">Recruitment Recommendation · R. Flett · 2003.08.21</div>
<div style="font-family:var(--sz-f-mono);font-size:12px;line-height:1.8;color:var(--sz-cream-soft)">
<p>Re: <span class="redact" style="width:130px"></span> (subject, file 03-DAN-0814).</p>
<p>Event classification: NYSE. Focal condition, environmental vector, single-structure scope. Resolved before we arrived, by the subject, with a book of matches.</p>
<p>Subject behaviour, per the ground-floor resident's camcorder: enters the lobby, holds at the threshold some forty-five seconds, brings up a light, and leaves. No panic. No call to emergency services. She does not wait to be seen. What she misses is the resident in his doorway with the camcorder, which is the only reason we have her at all. By chance or otherwise, she was carrying the one thing the condition could not tolerate.</p>
<p>Recommend contact inside thirty days. She is field-eligible, pending evaluation. What we look for is not nerve, and it is not immunity. It is the person who keeps seeing straight after the situation stops making sense, and then does the next plain thing. The footage is three minutes of exactly that.</p>
<p style="margin-top:14px">— R. Flett, Branch</p>
</div>
</div>
```

### MAN-200 Occurrence report — `# extract: man_occurrence_report_03_MAN_0816`

Note the twee background conditional in the first paragraph — the scene template's data resource needs a background-variant slot here.

```html
<div style="background:var(--sz-ink-3);border:1px solid var(--sz-rule);padding:28px;position:relative;margin-top:8px">
<span class="stamp" style="position:absolute;top:14px;right:14px;transform:rotate(-8deg)">Classified</span>
<div class="eyebrow --brick" style="margin-bottom:14px">Incident File · 03-MAN-0816 · Extract</div>
<div style="font-family:var(--sz-f-mono);font-size:12px;line-height:1.8;color:var(--sz-cream-soft)">
<p>INCIDENT DATE: 2003.08.16. <<if $player.background eq "RCMP constable">>Flagged from an off-duty RCMP member's occurrence report, filed through <span class="redact" style="width:90px"></span> detachment 2003.08.18.<<else>>Flagged from OPP general occurrence log, <span class="redact" style="width:70px"></span> detachment, 2003.08.18.<</if>></p>
<p>LOCATION: private residence, <span class="redact" style="width:130px"></span>, Manitoulin Island. Twenty-three adults on scene. No fatalities. No injuries consistent with assault. No charges laid.</p>
<p>WITNESSES (22): no coherent recall of a period of approx. <span class="redact" style="width:40px"></span> hours. Reports of a "party," embarrassment, waking undressed. Statements do not corroborate one another, or the scene.</p>
<p>WITNESS (1): full and consistent recall. Describes a five-point figure marked in chalk on the dock, ringed with candles, and its deliberate disruption. Figure photographed and logged. No determination as to function. Classification: <span style="color:var(--sz-brass);font-style:italic">pending review</span>.</p>
</div>
</div>
```

### MAN-205 Recommendation — `# extract: man_recommendation_r_flett`

```html
<div style="background:var(--sz-ink-3);border:1px solid var(--sz-rule);padding:28px;position:relative;margin-top:8px">
<span class="stamp" style="position:absolute;top:14px;right:14px;transform:rotate(5deg)">Eyes Only</span>
<div class="eyebrow --brick" style="margin-bottom:14px">Recruitment Recommendation · R. Flett · 2003.08.23</div>
<div style="font-family:var(--sz-f-mono);font-size:12px;line-height:1.8;color:var(--sz-cream-soft)">
<p>Re: <span class="redact" style="width:130px"></span> (subject, file 03-MAN-0816).</p>
<p>Event classification: NYSE. Focal condition, marked locus, residence-scale scope. Active when the subject arrived. Ended when she broke the marking.</p>
<p>Twenty-three people in that house and the subject is the only one who can tell us what happened in it. She walked in looking for a telephone, went all the way to the centre of an event that had taken everyone else, felt it begin to take her, and ruined it anyway. By her own account she nearly didn't. I find the account more convincing for that.</p>
<p>Recommend contact inside thirty days. She is field-eligible, pending evaluation. The quality is not immunity. Nobody in that house was immune, and neither was she. It is staying able to see the shape of a thing while it works on you, and then wrecking the shape. That is rarer than nerve, and it is what we are short of.</p>
<p style="margin-top:14px">— R. Flett, Branch</p>
</div>
</div>
```

### PALE-200 Field report — `# extract: pale_field_report_03_OTT_0818`

```html
<div style="background:var(--sz-ink-3);border:1px solid var(--sz-rule);padding:28px;position:relative;margin-top:8px">
<span class="stamp" style="position:absolute;top:14px;right:14px;transform:rotate(-8deg)">Classified</span>
<div class="eyebrow --brick" style="margin-bottom:14px">Incident File · 03-OTT-0818 · Extract</div>
<div style="font-family:var(--sz-f-mono);font-size:12px;line-height:1.8;color:var(--sz-cream-soft)">
<p>INCIDENT DATE: 2003.08.18. Occurrence report, Ottawa duty element, filed 2003.08.19.</p>
<p>Response to <span class="redact" style="width:110px"></span>, downtown Ottawa, 21:40 hrs. Interval, alert to arrival: four minutes. Subject (F, age indeterminate) secured without resistance, unconscious on arrival, transferred to <span class="redact" style="width:80px"></span>. Ocular presentation consistent with file <span class="redact" style="width:60px"></span>.</p>
<p>Verbal compliance influence documented in effects only; mechanism not explained. Affected persons: nine. Treated on site, released. Recall absent or fragmentary. Hotel records for the evening removed; registry page substituted.</p>
<p>One civilian witness retains complete recall. Interviewed on site, released pending assessment. See attached recommendation. Classification: <span style="color:var(--sz-brass);font-style:italic">pending review</span>.</p>
</div>
</div>
```

### PALE-205 Recommendation — `# extract: pale_recommendation_r_flett`

```html
<div style="background:var(--sz-ink-3);border:1px solid var(--sz-rule);padding:28px;position:relative;margin-top:8px">
<span class="stamp" style="position:absolute;top:14px;right:14px;transform:rotate(5deg)">Eyes Only</span>
<div class="eyebrow --brick" style="margin-bottom:14px">Recruitment Recommendation · R. Flett · 2003.08.22</div>
<div style="font-family:var(--sz-f-mono);font-size:12px;line-height:1.8;color:var(--sz-cream-soft)">
<p>Re: <span class="redact" style="width:130px"></span> (witness, file 03-OTT-0818).</p>
<p>Event classification: NYSE. Subject-anchored, verbal compliance vector. The duty element did the containment; the resolving was done before they reached the lounge, by the witness, with the nearest heavy thing she could lift.</p>
<p>Witness behaviour, per debrief and her own account: she worked out the operating condition from cover, kept her eyes to herself for the better part of half an hour, and committed to a swing she could not call back before the subject could tell her to stop. The subject did tell her to stop. The swing was already past arguing with.</p>
<p>She did not resist the order. I am not persuaded that resisting it was available, to her or to anyone. She beat its timing, and timing can be trained. She survived a direct command on a technicality; I would not plan on that luck twice. Recommend contact inside thirty days. Field-eligible, pending evaluation.</p>
<p style="margin-top:14px">— R. Flett, Branch</p>
</div>
</div>
```

### WDS-200 Occurrence report — `# extract: wds_occurrence_report_03_ONT_0820`

```html
<div style="background:var(--sz-ink-3);border:1px solid var(--sz-rule);padding:28px;position:relative;margin-top:8px">
<span class="stamp" style="position:absolute;top:14px;right:14px;transform:rotate(-8deg)">Classified</span>
<div class="eyebrow --brick" style="margin-bottom:14px">Incident File · 03-ONT-0820 · Extract</div>
<div style="font-family:var(--sz-f-mono);font-size:12px;line-height:1.8;color:var(--sz-cream-soft)">
<p>INCIDENT DATE: 2003.08.20–21. Flagged from OPP occurrence report 2003.08.21; file assumed 2003.08.22.</p>
<p>Location: motel, <span class="redact" style="width:110px"></span>, Ontario. Affected: eleven registered guests. Common presentation: disinhibition, fixation, partial or absent recall 02:10–03:00 hrs approx. Two treated for minor injuries, one for <span class="redact" style="width:80px"></span>. No fatalities.</p>
<p>Subject: large unidentified, bipedal/quadrupedal, est. 210+ cm, heavy hair cover, nude, fled north on foot. Not recovered. Influence assessed atypical: airborne/olfactory, oil-borne, severity gradient consistent with concentration. Recovered: hair samples (analysis pending), partial prints (no species match), persistent odour on witness effects.</p>
<p>One witness retains complete, ordered recall and applied effective exposure countermeasures during the event. See attached recommendation. Classification: <span style="color:var(--sz-brass);font-style:italic">pending review</span>.</p>
</div>
</div>
```

### WDS-205 Recommendation — `# extract: wds_recommendation_r_flett`

```html
<div style="background:var(--sz-ink-3);border:1px solid var(--sz-rule);padding:28px;position:relative;margin-top:8px">
<span class="stamp" style="position:absolute;top:14px;right:14px;transform:rotate(5deg)">Eyes Only</span>
<div class="eyebrow --brick" style="margin-bottom:14px">Recruitment Recommendation · R. Flett · 2003.08.25</div>
<div style="font-family:var(--sz-f-mono);font-size:12px;line-height:1.8;color:var(--sz-cream-soft)">
<p>Re: <span class="redact" style="width:130px"></span> (witness, file 03-ONT-0820).</p>
<p>Event classification: NYSE. Mobile biological subject, atypical olfactory influence vector. Subject not recovered. What we have is what it left: hair, prints, one coherent statement, and a parking lot of people who cannot account for forty minutes.</p>
<p>Witness behaviour, per her statement and the site walk-through: she connected the effect to the odour while actively exposed, improvised respiratory cover from a wet towel, understood the cover was partial and worked inside the window it bought, cleared the affected guests off the source, and turned the subject with a can of dog repellent.</p>
<p>She is not resistant to the influence. Her statement is plain about how hard it was working on her the whole time. What she is, is rarer: a person who keeps working the problem while the problem is working on her. A wet towel and a can of dog spray is not training, and it is not equipment we issue. Recommend contact inside thirty days. Field-eligible, pending evaluation.</p>
<p style="margin-top:14px">— R. Flett, Branch</p>
</div>
</div>
```

## Repro commands

```powershell
# Regenerate the five .ink files + sidecars (idempotent; uids reused from existing sidecars)
cd twine-mcp-server
npm run export-ink

# Converter + full server test suite (79 tests)
npm test

# Godot-side verification (from repo root)
$godot = "_tools/godot4/Godot_v4.7-stable_mono_win64/Godot_v4.7-stable_mono_win64.exe"
dotnet build godot/Sizzle.sln
& $godot --headless --path godot --import
& $godot --headless --path godot -s res://addons/gut/gut_cmdln.gd -gdir=res://test/unit -ginclude_subdirs -gexit
```

## Progress log

- 2026-07-05: Report created early per process rule. Read contracts, slice, parser, all five twee sources.
- 2026-07-05: Converter written (`src/ink-export/`), wired as `npm run export-ink`. First run: 131 knots, 61 warnings, all expected categories. Blackout output verified against the slice conventions.
- 2026-07-05: Fixed brace-balance false positive; vitest suite added (29 tests); full suite 79/79.
- 2026-07-05: Verification pass — dotnet build 0 errors; headless import compiled all five stories (zero ink errors, `is_main_file=true` preserved); GUT 26/26 (175 asserts). Residue scan clean. Report finalized. **Phase 1 conversion complete; no hand-fixes; stop-loss not triggered.**
