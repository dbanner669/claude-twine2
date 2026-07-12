extends GutTest
## Paced prose reveal (Settings.text_speed + game_shell _process driver).
## Instantiates the real shell headless: at "slow" the knot's prose must be
## partially visible and growing with choices held back; at "instant" it must
## render fully with choices shown — the pre-feature behavior.

var _shell: Control


func before_each() -> void:
	_shell = load("res://scenes/game_shell.tscn").instantiate()
	add_child_autofree(_shell)


func after_each() -> void:
	Settings.text_speed_override = ""


func test_speed_map_and_default() -> void:
	Settings.text_speed_override = ""
	assert_true(Settings.TEXT_SPEEDS.has(Settings.text_speed()),
		"persisted/default speed is always a known preset")
	Settings.text_speed_override = "slow"
	assert_eq(Settings.text_speed_cps(), 30.0)
	Settings.text_speed_override = "instant"
	assert_eq(Settings.text_speed_cps(), 0.0)


func test_slow_reveal_is_partial_growing_and_gates_choices() -> void:
	Settings.text_speed_override = "slow"
	StoryBridge.start("res://content/briefing.ink", "INTRO_100")
	await wait_frames(3)
	var prose: RichTextLabel = _shell._prose
	var total := prose.get_total_character_count()
	assert_gt(total, 0, "knot text is laid out in full immediately")
	var early := prose.visible_characters
	assert_true(early >= 0 and early < total,
		"at 30 cps only part of the text is visible after 3 frames (got %d/%d)" % [early, total])
	assert_false(_shell._choices_box.visible, "choices wait for the reveal")
	await wait_frames(10)
	assert_gt(prose.visible_characters, early, "the reveal advances over time")


func test_skip_click_completes_reveal_and_shows_choices() -> void:
	Settings.text_speed_override = "slow"
	StoryBridge.start("res://content/briefing.ink", "INTRO_100")
	await wait_frames(3)
	var click := InputEventMouseButton.new()
	click.button_index = MOUSE_BUTTON_LEFT
	click.pressed = true
	_shell._on_prose_gui_input(click)
	assert_eq(_shell._prose.visible_characters, -1, "skip click reveals everything")
	assert_true(_shell._choices_box.visible, "skip click releases the choices")


func test_instant_mode_is_the_old_behavior() -> void:
	Settings.text_speed_override = "instant"
	StoryBridge.start("res://content/briefing.ink", "INTRO_100")
	await wait_frames(3)
	assert_eq(_shell._prose.visible_characters, -1, "instant renders the full knot")
	assert_true(_shell._choices_box.visible, "choices show immediately")
