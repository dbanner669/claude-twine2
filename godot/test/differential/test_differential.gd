extends GutTest
## Phase 2 gate: five-sequence differential. Scripted runs through every
## converted story, forcing check outcomes deterministically, asserting the
## state trajectories derived from the frozen twee sources and the locked
## $nyse.influence calibration (sizzle/docs/INCIDENTPLAN.md):
##
##   BLK  base +1, cap +2 (blk_climbed — composure check at BLK_160 fails)
##   MAN  base +2, cap +3 (man_sunroom_failed or man_focal_failed)
##   PALE base +1, cap +2 (pale_gaze_grazed or pale_command_bitten)
##   WDS  base +2, cap +3 (wds_deep_failed or wds_spine_failed)
##
## Each incident grants exactly ONE +1 skill (shared one-shot guard), and the
## all-pass vs all-fail paths pick different skills — the sum-of-levels == 1
## assertion is path-independent; per-skill assertions cover blackout, whose
## grant map is fully documented in the slice work.

const MAX_STEPS := 300


func _run_story(path: String, start: String, pass_checks: bool) -> int:
	StoryBridge.start(path, start)
	var steps := 0
	while not StoryBridge.ended and steps < MAX_STEPS:
		steps += 1
		if not StoryBridge.pending_check.is_empty():
			StoryBridge.resolve_check(999 if pass_checks else -999)
		elif not StoryBridge.current_choices.is_empty():
			StoryBridge.choose(0)
		else:
			break
	assert_true(StoryBridge.ended,
		"%s must reach END within %d steps (stalled at %s)" % [
			path, MAX_STEPS, State.current_frame().get("knot", "?")])
	return steps


## Same walk as _run_story but always taking the LAST offered choice — on the
## psych-eval questions that's the lie option where one exists.
func _run_story_last_choice(path: String, start: String) -> void:
	StoryBridge.start(path, start)
	var steps := 0
	while not StoryBridge.ended and steps < MAX_STEPS:
		steps += 1
		if not StoryBridge.pending_check.is_empty():
			StoryBridge.resolve_check(999)
		elif not StoryBridge.current_choices.is_empty():
			StoryBridge.choose(StoryBridge.current_choices.size() - 1)
		else:
			break
	assert_true(StoryBridge.ended, "%s must reach END" % path)


func _skill_sum() -> int:
	var total := 0
	for skill_name in State.SKILL_NAMES:
		total += State.skill_level(skill_name)
	return total


# --- Briefing -------------------------------------------------------------------

func test_briefing_all_pass_reaches_end_without_incident() -> void:
	_run_story("res://content/briefing.ink", "INTRO_100", true)
	assert_eq(String(State.player()["inciting_incident"]), "",
		"intro_end is not a handoff knot")
	assert_eq(State.date()["year"], 2005, "briefing plays in September 2005")
	assert_true(SaveManager.has_autosave())


func test_briefing_all_fail_also_terminates() -> void:
	_run_story("res://content/briefing.ink", "INTRO_100", false)
	assert_eq(String(State.player()["inciting_incident"]), "")


# --- Psych eval (EVAL_090..210; sizzle/docs/PSYCH-EVAL-PLAN.md) --------------------

func test_eval_first_choice_path_records_truth_flags() -> void:
	_run_story("res://content/briefing.ink", "EVAL_090", true)
	var tags: Array = State.player()["story_tags"]
	for expected: String in ["Sleeps fine", "Remembers what she saw",
			"Has someone who would miss her", "Likes being watched",
			"Openly bi", "Here to understand"]:
		assert_true(tags.has(expected), "eval records '%s'" % expected)
	assert_true(Array(State.player()["kinks"]).has("exhibitionism"),
		"SQ4 yes seeds the kink")
	assert_eq(State.date()["month"], 9)
	assert_eq(State.date()["day"], 19, "EVAL_205 advances to departure day")
	assert_eq(Rules.day_of_week(), "Monday", "departure is Monday Sept 19 2005")


func test_eval_lie_options_record_the_truth() -> void:
	# Last-choice path takes the lie on SQ1/SQ3/SQ4 — the recorded flags must
	# match the honest-yes flags (a lie stores the truth; player-facing only).
	_run_story_last_choice("res://content/briefing.ink", "EVAL_090")
	var tags: Array = State.player()["story_tags"]
	for expected: String in ["Sleeps badly", "Thinks it will happen again",
			"Has someone who would miss her", "Likes being watched",
			"Closeted outside the Branch", "Here because nothing else is real"]:
		assert_true(tags.has(expected), "lie path records '%s'" % expected)
	assert_true(Array(State.player()["kinks"]).has("exhibitionism"),
		"the lie at SQ4 still seeds the kink")


# --- Blackout (full grant map documented) ------------------------------------------

func test_blackout_all_pass_base_influence_and_composure_grant() -> void:
	_run_story("res://content/blackout.ink", "BLK_085", true)
	assert_eq(int(State.data["nyse"]["influence"]), 1, "held-the-line base +1")
	assert_eq(State.skill_level("composure"), 1, "BLK_160 pass grants composure")
	assert_eq(State.skill_level("academic"), 0, "shared guard blocks BLK_170 grant")
	assert_eq(State.skill_level("streetwise"), 0, "shared guard blocks BLK_175 fallback")
	assert_eq(_skill_sum(), 1)
	assert_eq(String(State.player()["inciting_incident"]), "the Toronto Blackout")
	# blk_end restores present day for the CC handoff (twee BLK-215 setDate).
	assert_eq(State.date()["year"], 2005)
	assert_eq(State.date()["month"], 9)
	assert_eq(State.date()["day"], 12)
	assert_eq(Rules.day_of_week(), "Monday", "game start is Monday morning")
	assert_eq(int(State.player()["current_composure"]),
		int(State.player()["baseline_composure"]),
		"day crossing at BLK_205 leaves composure at baseline")


func test_blackout_all_fail_caps_influence_and_falls_back_to_streetwise() -> void:
	_run_story("res://content/blackout.ink", "BLK_085", false)
	assert_eq(int(State.data["nyse"]["influence"]), 2, "climbed path caps at +2")
	assert_eq(State.skill_level("streetwise"), 1, "BLK_175 fallback grant")
	assert_eq(State.skill_level("composure"), 0)
	assert_eq(State.skill_level("academic"), 0)
	assert_eq(_skill_sum(), 1)
	assert_eq(String(State.player()["inciting_incident"]), "the Toronto Blackout")


# --- Manitoulin ---------------------------------------------------------------------

func test_manitoulin_all_pass_base_influence() -> void:
	_run_story("res://content/manitoulin.ink", "MAN_085", true)
	assert_eq(int(State.data["nyse"]["influence"]), 2, "progressive soak base +2")
	assert_eq(_skill_sum(), 1, "exactly one skill grant")
	assert_eq(String(State.player()["inciting_incident"]), "the Dark of Manitoulin")


func test_manitoulin_all_fail_deep_immersion_cap() -> void:
	_run_story("res://content/manitoulin.ink", "MAN_085", false)
	assert_eq(int(State.data["nyse"]["influence"]), 3,
		"sunroom/focal failure escalates to +3")
	assert_eq(_skill_sum(), 1)
	assert_eq(String(State.player()["inciting_incident"]), "the Dark of Manitoulin")


# --- Pale Eyes ------------------------------------------------------------------------

func test_pale_all_pass_low_ambient() -> void:
	_run_story("res://content/pale.ink", "PALE_085", true)
	assert_eq(int(State.data["nyse"]["influence"]), 1, "avoids contact by design: +1")
	assert_eq(_skill_sum(), 1)
	assert_eq(String(State.player()["inciting_incident"]), "the Woman with the Pale Eyes")


func test_pale_all_fail_grazed_or_bitten_cap() -> void:
	_run_story("res://content/pale.ink", "PALE_085", false)
	assert_eq(int(State.data["nyse"]["influence"]), 2, "gaze-grazed/bitten path: +2")
	assert_eq(_skill_sum(), 1)
	assert_eq(String(State.player()["inciting_incident"]), "the Woman with the Pale Eyes")


# --- Wet Dog Smell ------------------------------------------------------------------------

func test_wds_all_pass_contamination_base() -> void:
	_run_story("res://content/wds.ink", "WDS_085", true)
	assert_eq(int(State.data["nyse"]["influence"]), 2, "direct intake base +2")
	assert_eq(_skill_sum(), 1)
	assert_eq(String(State.player()["inciting_incident"]), "Wet Dog Smell")


func test_wds_all_fail_highest_of_the_four() -> void:
	_run_story("res://content/wds.ink", "WDS_085", false)
	assert_eq(int(State.data["nyse"]["influence"]), 3, "deep/spine failure caps at +3")
	assert_eq(_skill_sum(), 1)
	assert_eq(String(State.player()["inciting_incident"]), "Wet Dog Smell")


# --- Cross-cutting -----------------------------------------------------------------------

func test_handoff_signal_fires_with_knot() -> void:
	watch_signals(StoryBridge)
	_run_story("res://content/blackout.ink", "BLK_085", true)
	assert_signal_emitted_with_parameters(StoryBridge, "handoff_reached", ["blk_end"])
