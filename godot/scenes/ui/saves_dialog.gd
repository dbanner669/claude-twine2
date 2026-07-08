class_name SavesDialog
extends AcceptDialog
## Save/load dialog (Phase 3 gate punch-list) — the header "SAVES" button's
## target. Autosave row (load only) + numbered slots with SAVE / LOAD / DELETE.
## Wraps SaveManager; per-row metadata (knot + modified time) read from the
## save files on every open() so the list is always live.

const SLOT_COUNT := 5

## Phase 5: the shell sets this while the character-creation flow is on
## screen. Pre-story CC steps have no story frame to save (and a summary-time
## manual save would just duplicate the *_end autosave), so SAVE is disabled
## for the whole CC flow; LOAD stays available.
var block_saves := false

var _wrapper: MarginContainer
var _content: VBoxContainer


func _init() -> void:
	title = "Saves"
	ok_button_text = "Close"
	unresizable = false
	min_size = Vector2i(640, 480)


func open() -> void:
	_rebuild()
	popup_centered()


func _rebuild() -> void:
	var panel := StyleBoxFlat.new()
	panel.bg_color = ThemeService.color("ink_2")
	panel.border_color = ThemeService.color("brass_dim")
	panel.set_border_width_all(1)
	panel.set_content_margin_all(8)
	add_theme_stylebox_override("panel", panel)

	if _wrapper != null:
		_wrapper.queue_free()
	_wrapper = MarginContainer.new()
	add_child(_wrapper)
	_wrapper.set_anchors_preset(Control.PRESET_FULL_RECT)
	_wrapper.offset_left = 20
	_wrapper.offset_top = 12
	_wrapper.offset_right = -20
	_wrapper.offset_bottom = -56

	var scroll := ScrollContainer.new()
	scroll.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	_wrapper.add_child(scroll)

	_content = VBoxContainer.new()
	_content.add_theme_constant_override("separation", 10)
	_content.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	scroll.add_child(_content)

	_add_row(SaveManager.AUTOSAVE_NAME, "AUTOSAVE", false)
	for slot in range(1, SLOT_COUNT + 1):
		_add_row("slot_%d" % slot, "SLOT %d" % slot, true)


func _add_row(save_name: String, label_text: String, is_slot: bool) -> void:
	var row := HBoxContainer.new()
	row.add_theme_constant_override("separation", 12)
	_content.add_child(row)

	var name_label := Label.new()
	name_label.text = label_text
	name_label.custom_minimum_size.x = 110
	var variation := FontVariation.new()
	variation.base_font = ThemeService.font("ui_medium")
	variation.spacing_glyph = 2
	name_label.add_theme_font_override("font", variation)
	name_label.add_theme_font_size_override("font_size", ThemeService.font_size("ui"))
	name_label.add_theme_color_override("font_color", ThemeService.color("brass"))
	row.add_child(name_label)

	var save := SaveManager.read_save(save_name)
	var meta_label := Label.new()
	meta_label.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	meta_label.add_theme_font_override("font", ThemeService.font("mono"))
	meta_label.add_theme_font_size_override("font_size", 11)
	if save.is_empty():
		meta_label.text = "— empty —"
		meta_label.add_theme_color_override("font_color", ThemeService.color("cream_faint"))
	else:
		var modified := FileAccess.get_modified_time(SaveManager.save_path(save_name))
		var stamp := Time.get_datetime_string_from_unix_time(
			modified + Time.get_time_zone_from_system()["bias"] * 60).replace("T", "  ")
		meta_label.text = "%s   %s" % [String(save.get("current_knot", "?")), stamp]
		meta_label.add_theme_color_override("font_color", ThemeService.color("cream_soft"))
	row.add_child(meta_label)

	if is_slot:
		row.add_child(_make_button("SAVE", _on_save_pressed.bind(save_name),
			not StoryBridge.story_path.is_empty() and not block_saves))
	row.add_child(_make_button("LOAD", _on_load_pressed.bind(save_name), not save.is_empty()))
	if is_slot:
		row.add_child(_make_button("DELETE", _on_delete_pressed.bind(save_name), not save.is_empty()))


func _make_button(text: String, handler: Callable, enabled: bool) -> Button:
	var button := Button.new()
	button.text = text
	button.disabled = not enabled
	button.focus_mode = Control.FOCUS_NONE
	button.pressed.connect(handler)
	return button


func _on_save_pressed(save_name: String) -> void:
	if SaveManager.write_save(save_name):
		Rules.toast("success", "Saved to %s." % save_name.replace("_", " "))
	_rebuild()


func _on_load_pressed(save_name: String) -> void:
	if SaveManager.load_save(save_name):
		Rules.toast("info", "Loaded %s." % save_name.replace("_", " "))
		hide()
	else:
		Rules.toast("warn", "Could not load %s." % save_name.replace("_", " "))
		_rebuild()


func _on_delete_pressed(save_name: String) -> void:
	SaveManager.delete_save(save_name)
	_rebuild()
