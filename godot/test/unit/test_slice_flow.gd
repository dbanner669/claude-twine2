extends GutTest
## StoryBridge integration tests against the compiled BLK slice:
## check protocol, choice-commit back semantics (grant un-fire),
## save/restore mid-check, day-crossing through ink ops.
##
## Requires the imported blackout_slice.ink resource (is_main_file=true).

const SLICE := "res://content/slice/blackout_slice.ink"


func before_each() -> void:
	StoryBridge.start(SLICE, "BLK_130")


## BLK_130 -> BLK_135 -> BLK_140 -> BLK_145 -> (reveal) -> BLK_150 -> BLK_155 -> BLK_160
func _walk_to_first_check() -> void:
	for hop in 7:
		assert_false(StoryBridge.current_choices.is_empty(),
			"expected choices at hop %d (knot %s)" % [hop, State.current_frame().get("knot", "?")])
		StoryBridge.choose(0)


# --- Reveal pattern -----------------------------------------------------------

func test_reveal_choice_appends_and_regathers() -> void:
	# BLK_130: "keep walking" is the reveal-drift choice.
	assert_eq(StoryBridge.current_choices.size(), 2)
	StoryBridge.choose(1)
	assert_true(StoryBridge.transcript.contains("Half a block."),
		"reveal content should append")
	assert_eq(StoryBridge.current_choices.size(), 1)
	assert_eq(String(StoryBridge.current_choices[0]["text"]),
		"You cross back to the propped door.")
	StoryBridge.choose(0)
	assert_eq(String(State.current_frame().get("knot", "")), "BLK_135")


# --- Check protocol ---------------------------------------------------------------

func test_check_knot_pauses_before_conditional() -> void:
	_walk_to_first_check()
	assert_eq(String(State.current_frame().get("knot", "")), "BLK_160")
	assert_eq(String(StoryBridge.pending_check.get("skill", "")), "composure")
	assert_eq(String(StoryBridge.pending_check.get("dice", "")), "2d6")
	assert_eq(int(StoryBridge.pending_check.get("target", 0)), 8)
	assert_true(StoryBridge.current_choices.is_empty(),
		"no choices may be offered while a roll is pending")
	assert_false(StoryBridge.transcript.contains("Your feet stay."),
		"conditional block must not render before the roll")


func test_check_pass_renders_success_branch_and_grants_once() -> void:
	_walk_to_first_check()
	assert_eq(State.skill_level("composure"), 0)
	StoryBridge.resolve_check(12)
	assert_true(bool(StoryBridge.last_check_result["passed"]))
	assert_true(StoryBridge.transcript.contains("Your feet stay."))
	assert_eq(State.skill_level("composure"), 1, "one-shot grant fires on pass")
	assert_true(bool(StoryBridge.story.FetchVariable("blk_skill_granted")))
	assert_false(bool(StoryBridge.story.FetchVariable("blk_climbed")))


func test_check_fail_renders_failure_branch() -> void:
	_walk_to_first_check()
	StoryBridge.resolve_check(2)
	assert_false(bool(StoryBridge.last_check_result["passed"]))
	assert_true(StoryBridge.transcript.contains("Your foot finds the first stair."))
	assert_eq(State.skill_level("composure"), 0)
	assert_true(bool(StoryBridge.story.FetchVariable("blk_climbed")))
	StoryBridge.choose(0)
	assert_true(StoryBridge.transcript.contains("Two steps up."),
		"BLK_165 must follow the climbed branch")


# --- Back across a grant (choice-commit restore) -------------------------------------

func test_back_across_skill_grant_unfires_it() -> void:
	_walk_to_first_check()
	StoryBridge.resolve_check(12)
	assert_eq(State.skill_level("composure"), 1)
	StoryBridge.choose(0)
	assert_eq(String(State.current_frame().get("knot", "")), "BLK_165")

	assert_true(StoryBridge.go_back())
	assert_eq(String(State.current_frame().get("knot", "")), "BLK_160")
	assert_eq(State.skill_level("composure"), 0, "back must un-fire the grant")
	assert_false(bool(StoryBridge.story.FetchVariable("blk_skill_granted")),
		"ink-side one-shot guard must restore too")
	assert_false(StoryBridge.pending_check.is_empty(), "roll must be re-offered")

	# Re-resolving fires the grant exactly once again.
	StoryBridge.resolve_check(12)
	assert_eq(State.skill_level("composure"), 1)


# --- Save/restore mid-check ------------------------------------------------------------

func test_save_mid_check_reoffers_roll_on_load() -> void:
	_walk_to_first_check()
	var save := StoryBridge.save_game()
	assert_eq(String(save["current_knot"]), "BLK_160")

	StoryBridge.resolve_check(12)
	StoryBridge.choose(0)
	assert_eq(State.skill_level("composure"), 1)
	assert_eq(String(State.current_frame().get("knot", "")), "BLK_165")

	assert_true(StoryBridge.load_game(save.duplicate(true)))
	assert_eq(String(State.current_frame().get("knot", "")), "BLK_160")
	assert_false(StoryBridge.pending_check.is_empty(),
		"loading a mid-check save must re-offer the roll")
	assert_eq(State.skill_level("composure"), 0,
		"grant made after the save must be gone")

	StoryBridge.resolve_check(12)
	assert_eq(State.skill_level("composure"), 1)
	assert_eq(StoryBridge.current_choices.size(), 1)


func test_load_rejects_schema_mismatch() -> void:
	_walk_to_first_check()
	var save := StoryBridge.save_game()
	save["schema_version"] = 999
	assert_false(StoryBridge.load_game(save))
	assert_push_error("schema_version mismatch")


# --- Full chain: second check, influence one-shot, day crossing, stubs ------------------

func _walk_full_chain_to(knot: String) -> void:
	_walk_to_first_check()
	StoryBridge.resolve_check(12)            # BLK_160 pass (composure grant)
	StoryBridge.choose(0)                    # -> BLK_165
	StoryBridge.choose(0)                    # -> BLK_170 (check)
	StoryBridge.resolve_check(12)            # BLK_170 pass
	StoryBridge.choose(0)                    # -> BLK_175
	if knot == "BLK_175":
		return
	StoryBridge.choose(0)                    # -> BLK_180
	if knot == "BLK_180":
		return
	StoryBridge.choose(0)                    # -> BLK_185
	StoryBridge.choose(0)                    # -> BLK_190
	StoryBridge.choose(0)                    # -> BLK_200
	if knot == "BLK_200":
		return
	StoryBridge.choose(0)                    # -> BLK_205
	if knot == "BLK_205":
		return
	StoryBridge.choose(0)                    # -> BLK_210
	if knot == "BLK_210":
		return
	StoryBridge.choose(0)                    # -> BLK_215
	if knot == "BLK_215":
		return
	StoryBridge.choose(0)                    # -> blk_slice_end


func test_shared_one_shot_grant_across_checks() -> void:
	_walk_full_chain_to("BLK_175")
	# Composure granted at BLK_160; BLK_170 pass and BLK_175 fallback must not stack.
	assert_eq(State.skill_level("composure"), 1)
	assert_eq(State.skill_level("academic"), 0)
	assert_eq(State.skill_level("streetwise"), 0)


func test_influence_one_shot_base_grant() -> void:
	_walk_full_chain_to("BLK_180")
	assert_eq(int(State.data["nyse"]["influence"]), 1,
		"held-the-line run grants base +1 influence")
	assert_eq(StoryBridge.current_choices.size(), 3, "three convergent match choices")


func test_day_crossing_via_ink_and_back_across_it() -> void:
	_walk_full_chain_to("BLK_200")
	Rules.adjust_composure(-2)               # composure 0 within BLK_200's frame
	assert_eq(int(State.player()["current_composure"]), 0)
	assert_eq(State.date()["day"], 14)

	StoryBridge.choose(0)                    # -> BLK_205 (advance_days 1 morning)
	assert_eq(State.date()["day"], 15)
	assert_eq(State.date()["slot"], "morning")
	assert_eq(int(State.player()["current_composure"]),
		int(State.player()["baseline_composure"]),
		"day crossing resets composure")
	assert_eq(Rules.day_of_week(), "Friday")
	assert_true(StoryBridge.transcript.contains("Friday morning"),
		"mirrored day_of_week must interpolate post-op")
	assert_eq(String(StoryBridge.story.FetchVariable("date_slot")), "morning")

	assert_true(StoryBridge.go_back())       # back across the day crossing
	assert_eq(String(State.current_frame().get("knot", "")), "BLK_200")
	assert_eq(State.date()["day"], 14)
	assert_eq(State.date()["slot"], "evening")
	assert_eq(int(State.player()["current_composure"]), 2,
		"back restores BLK_200's entry snapshot (pre-adjust)")


func test_branch_file_extract_stubs_and_end() -> void:
	_walk_full_chain_to("BLK_210")
	assert_eq(String(StoryBridge.last_stub.get("scene", "")), "branch_file_extract")
	assert_eq(String(StoryBridge.last_stub.get("extract", "")),
		"blk_incident_report_03_DAN_0814")
	assert_eq(State.date()["year"], 2003)
	assert_eq(State.date()["month"], 8)
	assert_eq(State.date()["day"], 21)

	StoryBridge.choose(0)                    # -> BLK_215
	assert_eq(String(StoryBridge.last_stub.get("extract", "")),
		"blk_recommendation_r_flett")
	StoryBridge.choose(0)                    # -> blk_slice_end -> END
	assert_true(StoryBridge.ended)
