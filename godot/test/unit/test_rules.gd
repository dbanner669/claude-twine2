extends GutTest
## Rules command-op semantics (ported from sizzle/src/scripts/macros.js):
## day-crossing composure resets, laterNight rollover, clamps, grants.


func before_each() -> void:
	State.reset()


# --- set_time / set_date -------------------------------------------------------

func test_set_date_sets_fields_and_derives_day_of_week() -> void:
	Rules.set_date(2003, 8, 14, "afternoon")
	assert_eq(State.date()["year"], 2003)
	assert_eq(State.date()["month"], 8)
	assert_eq(State.date()["day"], 14)
	assert_eq(State.date()["slot"], "afternoon")
	assert_eq(Rules.day_of_week(), "Thursday")


func test_set_time_and_set_date_never_reset_composure() -> void:
	State.player()["baseline_composure"] = 3
	Rules.set_composure(1)
	Rules.set_time("evening")
	Rules.set_date(2005, 9, 13, "morning")
	assert_eq(int(State.player()["current_composure"]), 1,
		"explicit scene-entry time changes must not reset composure")


func test_set_time_rejects_invalid_slot() -> void:
	Rules.set_date(2005, 9, 12, "morning")
	Rules.set_time("teatime")
	assert_push_error("invalid slot 'teatime'")
	assert_eq(State.date()["slot"], "morning", "invalid slot must be ignored")


# --- advance_time ----------------------------------------------------------------

func test_advance_time_within_day_keeps_composure() -> void:
	Rules.set_date(2005, 9, 12, "morning")
	State.player()["baseline_composure"] = 3
	Rules.set_composure(1)
	Rules.advance_time(2)
	assert_eq(State.date()["slot"], "afternoon")
	assert_eq(State.date()["day"], 12)
	assert_eq(int(State.player()["current_composure"]), 1)


func test_later_night_rollover_crosses_day_and_resets_composure() -> void:
	Rules.set_date(2005, 9, 12, "laterNight")
	State.player()["baseline_composure"] = 3
	Rules.set_composure(0)
	Rules.advance_time(1)
	assert_eq(State.date()["slot"], "earlyMorning")
	assert_eq(State.date()["day"], 13)
	assert_eq(Rules.day_of_week(), "Tuesday")
	assert_eq(int(State.player()["current_composure"]), 3,
		"day crossing resets current composure to baseline")


func test_advance_time_multi_slot_rollover() -> void:
	Rules.set_date(2005, 9, 12, "night")
	State.player()["baseline_composure"] = 2
	Rules.set_composure(0)
	Rules.advance_time(3)
	# night(5) + 3 = 8 -> one day forward, slot index 1 = morning.
	assert_eq(State.date()["slot"], "morning")
	assert_eq(State.date()["day"], 13)
	assert_eq(int(State.player()["current_composure"]), 2)


# --- advance_days ------------------------------------------------------------------

func test_advance_days_shifts_calendar_resets_composure_and_sets_slot() -> void:
	Rules.set_date(2005, 9, 12, "evening")
	State.player()["baseline_composure"] = 2
	Rules.set_composure(0)
	Rules.advance_days(1, "morning")
	assert_eq(State.date()["day"], 13)
	assert_eq(State.date()["slot"], "morning")
	assert_eq(int(State.player()["current_composure"]), 2)


func test_advance_days_zero_sets_slot_without_reset() -> void:
	Rules.set_date(2005, 9, 12, "morning")
	State.player()["baseline_composure"] = 2
	Rules.set_composure(0)
	Rules.advance_days(0, "noon")
	assert_eq(State.date()["day"], 12)
	assert_eq(State.date()["slot"], "noon")
	assert_eq(int(State.player()["current_composure"]), 0,
		"advance_days(0, ...) must not reset composure")


func test_advance_days_across_month_boundary() -> void:
	Rules.set_date(2003, 8, 31, "evening")
	Rules.advance_days(1, "morning")
	assert_eq(State.date()["year"], 2003)
	assert_eq(State.date()["month"], 9)
	assert_eq(State.date()["day"], 1)
	assert_eq(Rules.day_of_week(), "Monday")


# --- Composure clamps ---------------------------------------------------------------

func test_composure_clamps_to_0_and_7() -> void:
	Rules.set_composure(99)
	assert_eq(int(State.player()["current_composure"]), 7)
	Rules.adjust_composure(-99)
	assert_eq(int(State.player()["current_composure"]), 0)
	Rules.adjust_composure(3)
	assert_eq(int(State.player()["current_composure"]), 3)
	Rules.adjust_composure(99)
	assert_eq(int(State.player()["current_composure"]), 7)


func test_reset_composure_clamps_baseline() -> void:
	State.player()["baseline_composure"] = 99
	Rules.reset_composure()
	assert_eq(int(State.player()["current_composure"]), 7)


# --- Grants / tags / influence --------------------------------------------------------

func test_grant_skill_bumps_level() -> void:
	Rules.grant_skill("composure", 1)
	assert_eq(State.skill_level("composure"), 1)
	Rules.grant_skill("composure", 2)
	assert_eq(State.skill_level("composure"), 3)


func test_add_tag_is_append_if_absent() -> void:
	Rules.add_tag("blk_witness")
	Rules.add_tag("blk_witness")
	assert_eq(State.player()["story_tags"], ["blk_witness"])


func test_adjust_influence_accumulates_without_decay() -> void:
	Rules.adjust_influence(2)
	Rules.adjust_influence(1)
	assert_eq(int(State.data["nyse"]["influence"]), 3)


func test_set_header() -> void:
	Rules.set_header("WALKUP LOBBY", "Thursday evening")
	assert_eq(State.header()["location"], "WALKUP LOBBY")
	assert_eq(State.header()["time"], "Thursday evening")
