extends GutTest
## Graphic-polish pass: day/night cross-fade (ThemeService day_amount tween),
## animation kill-switch determinism, main-menu title block, and the
## scene-image dossier frame. Runs the real shell headless.


func after_each() -> void:
	# Return global visual state to the defaults other suites assume.
	ThemeService.instant_mode = true
	ThemeService.set_mode("night")
	ThemeService.instant_mode = false
	Settings.animations_override_disabled = false
	Settings.text_speed_override = ""


func test_mode_change_cross_fades_day_amount() -> void:
	ThemeService.instant_mode = true
	ThemeService.set_mode("night")
	ThemeService.instant_mode = false
	ThemeService.set_mode("day")
	await wait_seconds(0.1)
	var mid := ThemeService.day_amount()
	assert_true(mid > 0.0 and mid < 1.0,
		"mid-fade day_amount is fractional (got %f)" % mid)
	var mid_ink := ThemeService.color("ink")
	assert_ne(mid_ink, SizzlePalette.NIGHT["ink"], "mid-fade color left night")
	assert_ne(mid_ink, SizzlePalette.DAY["ink"], "mid-fade color hasn't reached day")
	await wait_seconds(0.5)
	assert_eq(ThemeService.day_amount(), 1.0, "fade lands on the day endpoint")
	assert_eq(ThemeService.color("ink"), SizzlePalette.DAY["ink"] as Color,
		"endpoint colors are exactly the DAY palette")


func test_instant_mode_jumps_without_tween() -> void:
	ThemeService.instant_mode = true
	ThemeService.set_mode("day")
	assert_eq(ThemeService.day_amount(), 1.0, "instant_mode jumps straight to day")
	ThemeService.set_mode("night")
	assert_eq(ThemeService.day_amount(), 0.0, "and straight back to night")


func test_animations_disabled_choices_appear_fully_opaque() -> void:
	ThemeService.instant_mode = true
	Settings.animations_override_disabled = true
	Settings.text_speed_override = "instant"
	var shell: Control = load("res://scenes/game_shell.tscn").instantiate()
	add_child_autofree(shell)
	StoryBridge.start("res://content/briefing.ink", "INTRO_100")
	await wait_frames(3)
	assert_true(shell._choices_box.visible)
	for button: Control in shell._choices_box.get_children():
		assert_eq(button.modulate.a, 1.0, "kill switch = no stagger, fully opaque")


func test_menu_panel_shows_on_menu_and_hides_in_story() -> void:
	ThemeService.instant_mode = true
	Settings.animations_override_disabled = true
	Settings.text_speed_override = "instant"
	var shell: Control = load("res://scenes/game_shell.tscn").instantiate()
	add_child_autofree(shell)
	await wait_frames(1)
	assert_true(shell._menu_panel.visible, "title block on the main menu")
	assert_eq(shell._menu_title.text, "Sizzle")
	StoryBridge.start("res://content/briefing.ink", "INTRO_100")
	await wait_frames(1)
	assert_false(shell._menu_panel.visible, "title block leaves with the menu")


func test_scene_image_gets_the_dossier_frame() -> void:
	ThemeService.instant_mode = true
	Settings.animations_override_disabled = true
	Settings.text_speed_override = "instant"
	var shell: Control = load("res://scenes/game_shell.tscn").instantiate()
	add_child_autofree(shell)
	StoryBridge.start("res://content/briefing.ink", "INTRO_110")
	await wait_frames(2)
	assert_true(shell._scene_frame.visible, "image knot shows the framed image")
	assert_not_null(shell._scene_image.texture)
	assert_eq(shell._scene_frame.modulate.a, 1.0, "no fade when animations are off")
	StoryBridge.start("res://content/briefing.ink", "INTRO_100")
	await wait_frames(2)
	assert_false(shell._scene_frame.visible, "frame hides on non-image knots")
