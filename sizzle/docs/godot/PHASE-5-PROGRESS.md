# Phase 5 Progress — Native Character Creator + Full Game Flow

Session started: 2026-07-07. Branch: godot/greenfield. DO NOT COMMIT.

Status legend: [ ] not started · [~] in progress · [x] done + verified

## Deliverables

- [x] A1. godot/content/data/cc.json (backgrounds + bonuses + story tags + incidents with ink story/start knots, name/surname/codename lists from variables.twee). Background/incident ids are the exact twee strings (ink conditionals + extract variants compare against them).
- [x] A2. Rules CC section (godot/autoload/rules.gd, "Character creation (Phase 5)" block): cc_data()/cc_background()/cc_incident() (lazy cc.json), cc_apply_identity (empty args keep current), cc_rebuild_derived (reset skills+xp+specialities, erase 3 background tags, apply bonuses+tags, Branch training +1 agent +1 composure, set player.background), cc_finalize (baseline=composure level, current=baseline; no clamp — twee plain copy).
- [x] A3. GUT tests godot/test/unit/test_cc_rules.gd (11 tests): data completeness, identity, per-background table (incl. training), unknown-background reject, rebuild idempotence, background-switch no-stack, xp/specialities reset, non-background tags preserved, rebuild→grant+1→finalize ordering walk (baseline includes flashback grant), finalize idempotence. VERIFIED: dotnet build clean, headless import clean, GUT 70/70 (370 asserts).
- [x] B. CC scenes: godot/scenes/cc/cc_flow.gd (+ cc_flow.tscn, class_name CCFlow). Four-step dossier: tab strip (active brick underline/wash, done brass, locked faint), identification (Given Name/Surname LineEdits prefilled from State + RANDOMIZE NAME + service-record panel + quote), background 2x2 cards (title/blurb/perks, SELECTED tag + brick wash), incident step (redacted file-extract panel with █-block redactions + 4 memory cards), summary (dossier grid: name/codename/age/background/incident/status + ASSESSED SKILLS 8-skill grid + avatar-composite slot + Allura signature block + classified line). Guardrail hints exactly per twee ("Select a background first" / "Select an incident first") with disabled CONTINUE. All styling via ThemeService tokens; full re-render on mode_changed (day/night reactive). Mutations only via Rules.cc_*.
- [x] C. Flow wiring (game_shell.gd): Begin -> State.reset + night mode + CC step 1. Incident card click -> CCFlow runs cc_rebuild_derived (CC-400-top, upstream of flashback) -> shell StoryBridge.start(incident ink, *_085, keep_engine_state=true). handoff_reached(*_end) sets _handoff_pending; the following flow_ended -> CC summary (open_summary; NO rebuild here) instead of end screen. Sign & Deploy -> Rules.cc_finalize() -> StoryBridge.start(briefing, INTRO_100, true). intro_end still -> existing end screen (HANDOFF_INCIDENTS never contained it). knot_entered/flow_reset/_show_main_menu all exit the CC view, so back-nav, LOAD-anywhere, and menu return degrade cleanly. StoryBridge.start() gained the documented keep_engine_state param (see decision 1). SavesDialog: SAVE disabled while CC is on screen via block_saves flag (see decision 5); LOAD stays available; loading a *_end autosave replays the handoff and lands back at the summary.
- [x] D. screenshot_runner: Begin now drives CC (old "Begin starts briefing" stage replaced): asserts CC opens at identity, identity applied via Rules, background guardrail blocks, RCMP selected, incident guardrail blocks, blackout confirm starts BLK_085 with rebuilt skills (confrontation 2 / agent 1) and hidden CC, force-resolves (resolve_check(99)/choose(0)) to blk_end, handoff sets inciting_incident, summary reappears at step 4 with codename + composure>=2, sign lands INTRO_100 with kept engine state and baseline==composure. Shots 10_cc_identity/11_cc_background/12_cc_incident/13_cc_summary + all Phase 3 shots. All original stages (INTRO_110 image, autosave Continue, BLK_140 check, extracts, charsheet, INTRO_800 end) retained and green.

## Verify commands (repo root)

```
dotnet build godot/Sizzle.sln
"_tools/godot4/Godot_v4.7-stable_mono_win64/Godot_v4.7-stable_mono_win64.exe" --headless --path godot --import
"_tools/godot4/Godot_v4.7-stable_mono_win64/Godot_v4.7-stable_mono_win64.exe" --headless --path godot -s res://addons/gut/gut_cmdln.gd -gdir=res://test/unit -gdir=res://test/differential -ginclude_subdirs -gexit
"_tools/godot4/Godot_v4.7-stable_mono_win64/Godot_v4.7-stable_mono_win64.exe" --headless --path godot res://tools/screenshot_runner.tscn
```

## Source-of-truth notes (extracted from sizzle/src/content/character-creator.twee)

- Flow: CC-100 Identification -> CC-300 Background -> CC-400 Incident -> CC-500 Summary (CC-200 appearance descoped).
- CC-100: firstName/surname textboxes + Randomize (setup.firstNames/surnames.random()). Codename NOT set here — auto-assigned at CC-500 if unset (setup.codenames.random()).
- CC-300 guardrail: cannot Continue until a background selected ("Select a background first").
- CC-400 guardrail: redirect to CC-300 if no background; cannot Continue until incident selected ("Select an incident first").
- CC-400 TOP (silent, BEFORE flashback links): full rebuild — reset all 8 skills (level/xp/specialities) to 0, delete the 3 background story tags, re-apply per-background bonuses+tags, then Branch training +1 agent +1 composure. Runs upstream of flashback so flashback grants survive; reset-first means revisits never stack.
- Backgrounds (twee CC-400 switch):
  - "RCMP constable": confrontation +2, composure +1, athlete +1; tag "Northern Ontario"
  - "CSIS analyst": agent +2, academic +1, composure +1; tag "City Dweller"
  - "grad student": academic +2, charmer +1, sexology +1; tags "City Dweller", "Lived in Toronto"
  - "unemployed after university": streetwise +1, sexology +1, composure +1; tags "City Dweller", "Lived in Toronto"
- Branch training (all backgrounds): agent +1, composure +1.
- Background-derived tags to reset each rebuild: ["Northern Ontario", "City Dweller", "Lived in Toronto"].
- Incidents (CC-400 cards -> entry passages): Toronto Blackout -> BLK-085; Dark of Manitoulin -> MAN-085 (sets incitingIncident before goto); Woman with the Pale Eyes -> PALE-085; Wet Dog Smell -> WDS-085. NOTE: twee BLK card does NOT set incitingIncident before goto (the others do) — in Godot the handoff map sets inciting_incident at *_end for all four, per PHASE-4 handoff map.
- CC-500 (silent): redirect to CC-300 if no background; auto-assign codename if unset; NO skill rebuild here; baselineComposure = skills.composure.level (AFTER flashback, so incident composure grants flow into baseline); currentComposure = baselineComposure.
- CC-500 footer: "Sign & Deploy" -> INTRO-100 Briefing.

## Design decisions (documented deviations / choices)

1. **StoryBridge.start() gains an optional `keep_engine_state` param (DONE — the one story_bridge.gd change this phase).** start() unconditionally called State.reset(), which would wipe CC identity/background/skills before the flashback (whose first knot BLK_085 immediately reads the `background` mirror var for its four variants). Real gap blocking the flow — the CC flow calls `start(path, knot, true)`, which keeps State.data and clears only the choice-commit history. Default `false` keeps every pre-existing call site and test identical. Change is comment-documented at the function.
2. **Rebuild timing:** twee runs the rebuild at CC-400 render; the Godot flow runs it on incident-card confirm (per task spec). Equivalent: both are after the final background choice and upstream of the flashback; re-picking an incident after a flashback re-runs the rebuild (wiping the prior run's grants), exactly like re-entering CC-400 in twee.
3. **Codename:** twee assigns setup.codenames.random() at CC-500 entry if unset — replicated at summary-step entry via cc_apply_identity("", "", random).
4. **cc_finalize at Sign (not summary entry):** task spec. Observably identical to the twee's CC-500-entry copy (no state changes between summary entry and sign; finalize is idempotent, tested).
5. **SAVE disabled during the whole CC flow** (SavesDialog.block_saves, set by the shell when opening the dialog while CC is visible). Rationale: pre-story CC steps have no story/choice-commit frame to serialize; a summary-time manual save would only duplicate the *_end autosave (which already restores to the summary — the handoff re-fires on frame re-entry). LOAD stays enabled everywhere; loading mid-CC simply leaves the dossier for the loaded story (flow_reset exits the CC view).
6. **Header during CC** shows "BRANCH HQ — PERSONNEL FILE" via Rules.set_header (twee CC passages render no header widget; the Godot shell header is persistent, so it gets dossier flavor instead of stale story text).
7. **Twee BLK card quirk preserved by architecture:** in twee, MAN/PALE/WDS cards set incitingIncident before goto but BLK does not; the Godot flow relies uniformly on the Phase-2 handoff map (StoryBridge.HANDOFF_INCIDENTS at *_end), so all four incidents record identically at flashback end. Card selected-state at the incident step reads State inciting_incident (post-flashback revisit), matching twee behavior.

## Log

- (init) Progress file created. Reading sources.
- Deliverable A complete + verified (build clean, import clean, GUT 70/70). Baseline before Phase 5 was 59/59.
