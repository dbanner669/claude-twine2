extends GutTest
## SaveManager disk persistence: slot round-trips, autosave-on-choice-commit,
## int type fidelity through var_to_str, corrupt/missing handling.

const SLICE := "res://content/slice/blackout_slice.ink"


func before_each() -> void:
	for slot in SaveManager.list_slots():
		SaveManager.delete_slot(slot)
	SaveManager.delete_save(SaveManager.AUTOSAVE_NAME)
	StoryBridge.start(SLICE, "BLK_130")


func test_autosave_written_on_knot_entry() -> void:
	assert_true(SaveManager.has_autosave(),
		"starting a story enters a knot and must autosave")


func test_slot_round_trip_restores_knot_and_state() -> void:
	StoryBridge.choose(0)
	StoryBridge.choose(0)
	var saved_knot := String(State.current_frame().get("knot", ""))
	assert_true(SaveManager.save_slot(1))

	StoryBridge.choose(0)
	assert_ne(String(State.current_frame().get("knot", "")), saved_knot)

	assert_true(SaveManager.load_slot(1))
	assert_eq(String(State.current_frame().get("knot", "")), saved_knot)


func test_int_fidelity_through_disk_round_trip() -> void:
	assert_true(SaveManager.save_slot(1))
	assert_true(SaveManager.load_slot(1))
	assert_eq(typeof(State.date()["day"]), TYPE_INT,
		"var_to_str must preserve int types (JSON would floatify)")
	assert_eq(typeof(State.player()["current_composure"]), TYPE_INT)


func test_list_and_delete_slots() -> void:
	SaveManager.save_slot(2)
	SaveManager.save_slot(5)
	assert_eq(SaveManager.list_slots(), [2, 5] as Array[int])
	SaveManager.delete_slot(2)
	assert_eq(SaveManager.list_slots(), [5] as Array[int])


func test_missing_slot_fails_cleanly() -> void:
	assert_false(SaveManager.load_slot(42))
	assert_push_error("no usable save")


func test_corrupt_slot_fails_cleanly() -> void:
	var file := FileAccess.open(SaveManager.save_path("slot_9"), FileAccess.WRITE)
	file.store_string("this is not a save")
	file.close()
	assert_false(SaveManager.load_slot(9))
	assert_push_error("no usable save")


func test_autosave_load_resumes_current_knot() -> void:
	StoryBridge.choose(0)
	var knot := String(State.current_frame().get("knot", ""))
	assert_true(SaveManager.load_autosave())
	assert_eq(String(State.current_frame().get("knot", "")), knot)
