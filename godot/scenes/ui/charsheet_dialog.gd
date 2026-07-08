class_name CharSheetDialog
extends AcceptDialog
## Character sheet dialog (deliverable G) — the header "Character" button's
## target, styled per tables.css: name + codename header, details dossier
## table, cover identity when set, skill rows with level/XP, Baseline +
## Current composure. Reads State directly; rebuilt on every open() so it
## always reflects live state and the current palette.

var _wrapper: MarginContainer
var _content: VBoxContainer


func _init() -> void:
	title = "Character"
	ok_button_text = "Close"
	unresizable = false
	min_size = Vector2i(720, 640)


func open() -> void:
	_rebuild()
	popup_centered()


func _rebuild() -> void:
	# tables.css .dialog-character-sheet: ink-2 body, brass-dim border.
	var panel := StyleBoxFlat.new()
	panel.bg_color = ThemeService.color("ink_2")
	panel.border_color = ThemeService.color("brass_dim")
	panel.set_border_width_all(1)
	panel.set_content_margin_all(8)
	add_theme_stylebox_override("panel", panel)

	if _wrapper != null:
		_wrapper.queue_free()
	# AcceptDialog does not auto-arrange custom children: anchor a wrapper
	# to the full window, keeping clear of the button row at the bottom.
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
	_content.add_theme_constant_override("separation", 14)
	_content.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	scroll.add_child(_content)

	var player := State.player()

	# --- Header: name + codename (profile-header) ------------------------
	var name_label := Label.new()
	name_label.text = "%s %s" % [player["first_name"], player["surname"]]
	name_label.add_theme_font_override("font", ThemeService.font("display_italic"))
	name_label.add_theme_font_size_override("font_size", 30)
	name_label.add_theme_color_override("font_color", ThemeService.color("cream"))
	_content.add_child(name_label)

	var codename := String(player["codename"])
	if codename != "":
		var code_label := Label.new()
		code_label.text = "Codename: %s" % codename
		code_label.add_theme_font_override("font", ThemeService.font("body_italic"))
		code_label.add_theme_font_size_override("font_size", 16)
		code_label.add_theme_color_override("font_color", ThemeService.color("brass_glow"))
		_content.add_child(code_label)

	# --- Details (dossier table) ------------------------------------------
	_add_section("DETAILS")
	var details := GridContainer.new()
	details.columns = 2
	details.add_theme_constant_override("h_separation", 24)
	details.add_theme_constant_override("v_separation", 8)
	_content.add_child(details)
	_add_row(details, "AGE", str(int(player["age"])))
	_add_row(details, "BACKGROUND", String(player["background"]))
	if String(player["inciting_incident"]) != "":
		_add_row(details, "INCIDENT", String(player["inciting_incident"]))
	_add_row(details, "NATIONALITY", String(player["nationality"]))

	# --- Cover identity (when set) ----------------------------------------
	var cover: Dictionary = player["cover"]
	if String(cover["known_as"]) != "":
		_add_section("COVER IDENTITY")
		var cover_grid := GridContainer.new()
		cover_grid.columns = 2
		cover_grid.add_theme_constant_override("h_separation", 24)
		cover_grid.add_theme_constant_override("v_separation", 8)
		_content.add_child(cover_grid)
		_add_row(cover_grid, "KNOWN AS", String(cover["known_as"]))
		if String(cover["firstname"]) != "" or String(cover["surname"]) != "":
			_add_row(cover_grid, "FULL NAME", "%s %s" % [cover["firstname"], cover["surname"]])

	# --- Skills (skill rows with level/XP) ---------------------------------
	_add_section("SKILLS")
	var skills: Dictionary = player["skills"]
	for skill_name: String in State.SKILL_NAMES:
		var row := HBoxContainer.new()
		_content.add_child(row)
		var skill_label := Label.new()
		skill_label.text = String(skill_name).capitalize()
		skill_label.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		skill_label.add_theme_font_override("font", ThemeService.font("body"))
		skill_label.add_theme_font_size_override("font_size", 13)
		skill_label.add_theme_color_override("font_color", ThemeService.color("cream_soft"))
		row.add_child(skill_label)
		var level_label := Label.new()
		level_label.text = "LVL %d" % int(skills[skill_name]["level"])
		level_label.add_theme_font_override("font", ThemeService.font("mono"))
		level_label.add_theme_font_size_override("font_size", 13)
		level_label.add_theme_color_override("font_color", ThemeService.color("brass"))
		row.add_child(level_label)
		var xp_label := Label.new()
		xp_label.text = "  %d XP" % int(skills[skill_name]["xp"])
		xp_label.add_theme_font_override("font", ThemeService.font("mono"))
		xp_label.add_theme_font_size_override("font_size", 11)
		xp_label.add_theme_color_override("font_color", ThemeService.color("cream_faint"))
		row.add_child(xp_label)

	# --- Composure ----------------------------------------------------------
	_add_section("COMPOSURE")
	var composure := GridContainer.new()
	composure.columns = 2
	composure.add_theme_constant_override("h_separation", 24)
	composure.add_theme_constant_override("v_separation", 8)
	_content.add_child(composure)
	_add_row(composure, "BASELINE", str(int(player["baseline_composure"])))
	_add_row(composure, "CURRENT", str(int(player["current_composure"])))


func _add_section(text: String) -> void:
	var label := Label.new()
	label.text = text
	var variation := FontVariation.new()
	variation.base_font = ThemeService.font("ui_medium")
	variation.spacing_glyph = 2
	label.add_theme_font_override("font", variation)
	label.add_theme_font_size_override("font_size", ThemeService.font_size("ui"))
	label.add_theme_color_override("font_color", ThemeService.color("brick_glow"))
	_content.add_child(label)


func _add_row(grid: GridContainer, key: String, value: String) -> void:
	var key_label := Label.new()
	key_label.text = key
	key_label.custom_minimum_size.x = 180
	var variation := FontVariation.new()
	variation.base_font = ThemeService.font("ui")
	variation.spacing_glyph = 2
	key_label.add_theme_font_override("font", variation)
	key_label.add_theme_font_size_override("font_size", ThemeService.font_size("ui"))
	key_label.add_theme_color_override("font_color", ThemeService.color("brass"))
	grid.add_child(key_label)
	var value_label := Label.new()
	value_label.text = value
	value_label.add_theme_font_override("font", ThemeService.font("body"))
	value_label.add_theme_font_size_override("font_size", 15)
	value_label.add_theme_color_override("font_color", ThemeService.color("cream"))
	grid.add_child(value_label)
