extends GutTest

const SLICE := "res://content/slice/blackout_slice.ink"


func before_each() -> void:
	State.reset()


func test_suspicion_zero_delta_and_clamped_same_are_noops() -> void:
	watch_signals(Rules)

	Rules.sizzle_suspicion(0)
	Rules.sizzle_suspicion(-5)
	assert_eq(int(State.data["sizzle"]["suspicion"]), 0)
	assert_signal_emit_count(Rules, "state_changed", 0)
	assert_signal_emit_count(Rules, "toast_requested", 0)
	assert_signal_emit_count(Rules, "suspicion_band_changed", 0)

	Rules.sizzle_suspicion(10)
	assert_eq(int(State.data["sizzle"]["suspicion"]), 10)
	assert_signal_emit_count(Rules, "state_changed", 1)
	assert_signal_emit_count(Rules, "toast_requested", 1)
	assert_signal_emit_count(Rules, "suspicion_band_changed", 1)

	Rules.sizzle_suspicion(5)
	assert_eq(int(State.data["sizzle"]["suspicion"]), 10)
	assert_signal_emit_count(Rules, "state_changed", 1)
	assert_signal_emit_count(Rules, "toast_requested", 1)
	assert_signal_emit_count(Rules, "suspicion_band_changed", 1)


func test_suspicion_clamps_at_both_ends_and_toasts_directionally() -> void:
	watch_signals(Rules)

	Rules.sizzle_suspicion(99)
	assert_eq(int(State.data["sizzle"]["suspicion"]), 10)
	assert_signal_emitted_with_parameters(Rules, "state_changed", ["sizzle_suspicion"], 0)
	assert_signal_emitted_with_parameters(Rules, "toast_requested",
		["warn", "You're drawing attention."], 0)
	assert_signal_emitted_with_parameters(Rules, "suspicion_band_changed",
		["unremarked", "burned"], 0)

	Rules.sizzle_suspicion(-99)
	assert_eq(int(State.data["sizzle"]["suspicion"]), 0)
	assert_signal_emitted_with_parameters(Rules, "toast_requested",
		["info", "Attention drifts elsewhere."], 1)
	assert_signal_emitted_with_parameters(Rules, "suspicion_band_changed",
		["burned", "unremarked"], 1)


func test_reputation_zero_delta_and_clamped_same_are_noops() -> void:
	watch_signals(Rules)

	Rules.sizzle_reputation(0)
	Rules.sizzle_reputation(-3)
	assert_eq(int(State.data["sizzle"]["reputation"]), 0)
	assert_signal_emit_count(Rules, "state_changed", 0)
	assert_signal_emit_count(Rules, "toast_requested", 0)

	Rules.sizzle_reputation(10)
	assert_eq(int(State.data["sizzle"]["reputation"]), 10)
	assert_signal_emit_count(Rules, "state_changed", 1)
	assert_signal_emit_count(Rules, "toast_requested", 0)

	Rules.sizzle_reputation(4)
	assert_eq(int(State.data["sizzle"]["reputation"]), 10)
	assert_signal_emit_count(Rules, "state_changed", 1)
	assert_signal_emit_count(Rules, "toast_requested", 0)


func test_reputation_clamps_at_both_ends_without_toast() -> void:
	watch_signals(Rules)

	Rules.sizzle_reputation(99)
	assert_eq(int(State.data["sizzle"]["reputation"]), 10)
	assert_signal_emitted_with_parameters(Rules, "state_changed", ["sizzle_reputation"], 0)
	assert_signal_emit_count(Rules, "toast_requested", 0)

	Rules.sizzle_reputation(-99)
	assert_eq(int(State.data["sizzle"]["reputation"]), 0)
	assert_signal_emitted_with_parameters(Rules, "state_changed", ["sizzle_reputation"], 1)
	assert_signal_emit_count(Rules, "toast_requested", 0)


func test_access_ratchets_and_clamps_above_three() -> void:
	watch_signals(Rules)

	Rules.sizzle_access(2)
	assert_eq(int(State.data["sizzle"]["access_level"]), 2)
	assert_signal_emitted_with_parameters(Rules, "state_changed", ["sizzle_access"], 0)

	Rules.sizzle_access(1)
	assert_eq(int(State.data["sizzle"]["access_level"]), 2,
		"lower grants must never reduce access")
	assert_signal_emit_count(Rules, "state_changed", 1)

	Rules.sizzle_access(9)
	assert_eq(int(State.data["sizzle"]["access_level"]), 3)
	assert_signal_emit_count(Rules, "state_changed", 2)


func test_suspicion_band_boundaries() -> void:
	var cases := {
		0: "unremarked",
		2: "unremarked",
		3: "noticed",
		5: "noticed",
		6: "watched",
		8: "watched",
		9: "burned",
		10: "burned",
	}

	for value in cases:
		State.data["sizzle"]["suspicion"] = value
		assert_eq(Rules.suspicion_band(), String(cases[value]),
			"unexpected band for suspicion %d" % value)


func test_suspicion_band_changed_only_on_transitions() -> void:
	watch_signals(Rules)

	Rules.sizzle_suspicion(1)
	Rules.sizzle_suspicion(2)
	Rules.sizzle_suspicion(2)
	Rules.sizzle_suspicion(1)
	Rules.sizzle_suspicion(3)
	Rules.sizzle_suspicion(-1)

	assert_signal_emit_count(Rules, "suspicion_band_changed", 4)
	assert_signal_emitted_with_parameters(Rules, "suspicion_band_changed",
		["unremarked", "noticed"], 0)
	assert_signal_emitted_with_parameters(Rules, "suspicion_band_changed",
		["noticed", "watched"], 1)
	assert_signal_emitted_with_parameters(Rules, "suspicion_band_changed",
		["watched", "burned"], 2)
	assert_signal_emitted_with_parameters(Rules, "suspicion_band_changed",
		["burned", "watched"], 3)


func test_sizzle_ops_do_not_break_stories_that_lack_the_new_mirror_vars() -> void:
	StoryBridge.start(SLICE, "BLK_130")
	assert_false(StoryBridge.story.HasVariable("sizzle_suspicion"))
	assert_false(StoryBridge.story.HasVariable("sizzle_reputation"))
	assert_false(StoryBridge.story.HasVariable("sizzle_access"))
	assert_false(StoryBridge.story.HasVariable("sizzle_band"))

	Rules.sizzle_suspicion(3)
	Rules.sizzle_reputation(4)
	Rules.sizzle_access(2)

	assert_eq(int(State.data["sizzle"]["suspicion"]), 3)
	assert_eq(int(State.data["sizzle"]["reputation"]), 4)
	assert_eq(int(State.data["sizzle"]["access_level"]), 2)
	assert_eq(Rules.suspicion_band(), "noticed")
	assert_eq(StoryBridge.current_choices.size(), 2,
		"post-op mirror sync must not break continuation in stories missing the new vars")


func test_save_load_round_trip_preserves_sizzle_state() -> void:
	StoryBridge.start(SLICE, "BLK_130")
	Rules.sizzle_suspicion(4)
	Rules.sizzle_reputation(3)
	Rules.sizzle_access(2)
	StoryBridge.choose(0)  # -> BLK_135; entry snapshot now includes the sizzle mutations
	var save := StoryBridge.save_game()

	Rules.sizzle_suspicion(3)
	Rules.sizzle_reputation(-2)
	Rules.sizzle_access(3)
	assert_eq(int(State.data["sizzle"]["suspicion"]), 7)
	assert_eq(int(State.data["sizzle"]["reputation"]), 1)
	assert_eq(int(State.data["sizzle"]["access_level"]), 3)

	assert_true(StoryBridge.load_game(save.duplicate(true)))
	assert_eq(int(State.data["sizzle"]["suspicion"]), 4)
	assert_eq(int(State.data["sizzle"]["reputation"]), 3)
	assert_eq(int(State.data["sizzle"]["access_level"]), 2)
	assert_eq(Rules.suspicion_band(), "noticed")


func test_back_across_sizzle_mutation_restores_pre_choice_values() -> void:
	StoryBridge.start(SLICE, "BLK_130")
	Rules.sizzle_suspicion(2)
	Rules.sizzle_reputation(1)
	Rules.sizzle_access(2)

	StoryBridge.choose(0)  # -> BLK_135 (entry snapshot includes the first set of ops)
	Rules.sizzle_suspicion(4)
	Rules.sizzle_reputation(3)
	Rules.sizzle_access(3)
	StoryBridge.choose(0)  # -> BLK_140

	assert_eq(int(State.data["sizzle"]["suspicion"]), 6)
	assert_eq(int(State.data["sizzle"]["reputation"]), 4)
	assert_eq(int(State.data["sizzle"]["access_level"]), 3)

	assert_true(StoryBridge.go_back())
	assert_eq(String(State.current_frame().get("knot", "")), "BLK_135")
	assert_eq(int(State.data["sizzle"]["suspicion"]), 2)
	assert_eq(int(State.data["sizzle"]["reputation"]), 1)
	assert_eq(int(State.data["sizzle"]["access_level"]), 2)
	assert_eq(Rules.suspicion_band(), "unremarked")
