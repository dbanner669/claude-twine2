extends Control
## The Sizzle presentation shell (Phase 3) — replaces the Phase 0.5 slice
## player. Fixed 1920x1080 canvas (project stretch handles fitting):
##
##   Header (54px): back arrow, location, time, weather, status badge,
##                  Character button
##   Mid:           AvatarPanel (430px, scene mode only) + passage area
##   Footer (28px): date/slot from State via SizzleFormat + version label
##
## Screen modes (# screen tag): scene = two-column; menu / creation =
## single centered column, avatar hidden. Styling translates the CSS in
## sizzle/src/styles/ (reset/layout/passages) through ThemeService tokens;
## everything restyles on ThemeService.mode_changed.

const VERSION_LABEL := "v 0.2.0-godot"

const BRIEFING_PATH := "res://content/briefing.ink"
const BRIEFING_START := "INTRO_100"

const HEADER_HEIGHT := 54
const FOOTER_HEIGHT := 28
const CONTENT_WIDTH := 680.0

## Knot-id-driven scene images (deliverable H). Shown above the prose.
const KNOT_IMAGES := {
	"INTRO_110": "res://media/robert-flett-diner-entry.png",
	"MAN_110": "res://media/lake-mansion.png",
}

## Badge table from sizzle/CLAUDE.md (Current Composure -> badge/color token).
const STATUS_BADGES := [
	# [min_composure, text, palette token] — first row whose min <= value wins.
	[7, "ICE VEINS", "status_ice"],
	[5, "COOL & COLLECTED", "status_cool"],
	[2, "STEADY", "status_steady"],
	[1, "SHAKEN", "status_shaken"],
	[-1000, "RATTLED", "status_rattled"],
]

var _screen_mode := "scene"
var _current_knot := ""
var _current_tags := {}
## Check knots pause on an ops-only line BEFORE their prose is emitted
## (the pause-on-tag protocol). Clearing the prose there would leave the
## dice panel floating over an empty page, so for check knots the clear is
## deferred until the knot's first real text arrives after the roll —
## the previous passage stays readable behind the panel, like the twee.
var _defer_prose_clear := false

# Header
var _header: PanelContainer
var _back_button: Button
var _location_label: Label
var _time_label: Label
var _weather_label: Label
var _status_badge: Label
var _character_button: Button
# Mid
var _avatar_panel: AvatarPanel
var _passage_bg: ColorRect
var _outer_column: VBoxContainer
var _column: VBoxContainer
var _scene_image: TextureRect
var _prose: RichTextLabel
var _extract_holder: VBoxContainer   # BranchFileExtract panel mounts here (F)
var _check_holder: VBoxContainer     # check panel mounts here (E)
var _choices_label: Label
var _choices_box: VBoxContainer
var _end_panel: VBoxContainer
# Footer
var _footer: PanelContainer
var _footer_date: Label
var _footer_version: Label
# Overlays
var _tooltip: PanelContainer         # glossary tooltip (D)
var _tooltip_text: RichTextLabel
var _toast_box: VBoxContainer        # toast stack (D)
var _glossary: Dictionary = {}
var _charsheet: CharSheetDialog
var _check_panel: CheckPanel
var _menu_shown := false


func _ready() -> void:
	theme = ThemeService.theme
	_glossary = _load_glossary()
	_build_ui()
	StoryBridge.text_appended.connect(_on_text_appended)
	StoryBridge.knot_entered.connect(_on_knot_entered)
	StoryBridge.choices_ready.connect(_on_choices_ready)
	StoryBridge.check_ready.connect(_on_check_ready)
	StoryBridge.scene_stub.connect(_on_scene_stub)
	StoryBridge.flow_reset.connect(_on_flow_reset)
	StoryBridge.flow_ended.connect(_on_flow_ended)
	Rules.toast_requested.connect(_on_toast)
	Rules.state_changed.connect(_on_state_changed)
	ThemeService.mode_changed.connect(func(_m: String) -> void: _restyle())
	_restyle()
	_show_main_menu()


# =========================================================================
# UI construction
# =========================================================================

func _build_ui() -> void:
	set_anchors_preset(Control.PRESET_FULL_RECT)

	var root := VBoxContainer.new()
	root.set_anchors_preset(Control.PRESET_FULL_RECT)
	root.add_theme_constant_override("separation", 0)
	add_child(root)

	# --- Header ---------------------------------------------------------
	_header = PanelContainer.new()
	_header.custom_minimum_size.y = HEADER_HEIGHT
	root.add_child(_header)

	var header_row := HBoxContainer.new()
	header_row.add_theme_constant_override("separation", 18)
	_header.add_child(header_row)

	_back_button = Button.new()
	_back_button.text = "‹"
	_back_button.custom_minimum_size = Vector2(28, 28)
	_back_button.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	_back_button.focus_mode = Control.FOCUS_NONE
	_back_button.pressed.connect(_on_back_pressed)
	header_row.add_child(_back_button)

	_location_label = Label.new()
	_location_label.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	header_row.add_child(_location_label)

	var spacer := Control.new()
	spacer.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	header_row.add_child(spacer)

	_weather_label = Label.new()
	_weather_label.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	header_row.add_child(_weather_label)

	_time_label = Label.new()
	_time_label.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	header_row.add_child(_time_label)

	_status_badge = Label.new()
	_status_badge.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	header_row.add_child(_status_badge)

	_character_button = Button.new()
	_character_button.text = "CHARACTER"
	_character_button.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	_character_button.focus_mode = Control.FOCUS_NONE
	_character_button.pressed.connect(_on_character_pressed)
	header_row.add_child(_character_button)

	# --- Mid row ----------------------------------------------------------
	var mid := HBoxContainer.new()
	mid.size_flags_vertical = Control.SIZE_EXPAND_FILL
	mid.add_theme_constant_override("separation", 0)
	root.add_child(mid)

	_avatar_panel = AvatarPanel.new()
	mid.add_child(_avatar_panel)

	var passage_area := Control.new()
	passage_area.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	passage_area.size_flags_vertical = Control.SIZE_EXPAND_FILL
	mid.add_child(passage_area)

	_passage_bg = ColorRect.new()
	_passage_bg.set_anchors_preset(Control.PRESET_FULL_RECT)
	passage_area.add_child(_passage_bg)

	var passage_margin := MarginContainer.new()
	passage_margin.set_anchors_preset(Control.PRESET_FULL_RECT)
	passage_margin.add_theme_constant_override("margin_left", 56)
	passage_margin.add_theme_constant_override("margin_right", 56)
	passage_margin.add_theme_constant_override("margin_top", 32)
	passage_margin.add_theme_constant_override("margin_bottom", 32)
	passage_area.add_child(passage_margin)

	_outer_column = VBoxContainer.new()
	passage_margin.add_child(_outer_column)

	_column = VBoxContainer.new()
	_column.custom_minimum_size.x = CONTENT_WIDTH
	_column.add_theme_constant_override("separation", 16)
	_outer_column.add_child(_column)

	_scene_image = TextureRect.new()
	_scene_image.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	_scene_image.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_COVERED
	_scene_image.custom_minimum_size = Vector2(CONTENT_WIDTH, 300)
	_scene_image.clip_contents = true
	_scene_image.visible = false
	_column.add_child(_scene_image)

	_prose = RichTextLabel.new()
	_prose.bbcode_enabled = true
	_prose.fit_content = false
	_prose.scroll_active = true
	_prose.scroll_following = false
	_prose.selection_enabled = true
	_prose.size_flags_vertical = Control.SIZE_EXPAND_FILL
	_prose.meta_hover_started.connect(_on_meta_hover_started)
	_prose.meta_hover_ended.connect(_on_meta_hover_ended)
	_column.add_child(_prose)

	_extract_holder = VBoxContainer.new()
	_extract_holder.visible = false
	_extract_holder.size_flags_vertical = Control.SIZE_EXPAND_FILL
	_column.add_child(_extract_holder)

	_check_holder = VBoxContainer.new()
	_check_holder.visible = false
	_column.add_child(_check_holder)
	_check_panel = load("res://scenes/check_panel.tscn").instantiate()
	_check_holder.add_child(_check_panel)

	_end_panel = VBoxContainer.new()
	_end_panel.visible = false
	_end_panel.add_theme_constant_override("separation", 12)
	_column.add_child(_end_panel)

	_choices_label = Label.new()
	_choices_label.text = "WHAT DO YOU DO?"
	_choices_label.visible = false
	_column.add_child(_choices_label)

	_choices_box = VBoxContainer.new()
	_choices_box.add_theme_constant_override("separation", 0)
	_column.add_child(_choices_box)

	# --- Footer -----------------------------------------------------------
	_footer = PanelContainer.new()
	_footer.custom_minimum_size.y = FOOTER_HEIGHT
	root.add_child(_footer)

	var footer_row := HBoxContainer.new()
	_footer.add_child(footer_row)

	_footer_date = Label.new()
	_footer_date.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	_footer_date.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	footer_row.add_child(_footer_date)

	_footer_version = Label.new()
	_footer_version.text = VERSION_LABEL
	_footer_version.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	footer_row.add_child(_footer_version)

	# --- Overlays ---------------------------------------------------------
	_toast_box = VBoxContainer.new()
	_toast_box.set_anchors_preset(Control.PRESET_BOTTOM_RIGHT)
	_toast_box.offset_left = -404.0
	_toast_box.offset_top = -400.0
	_toast_box.offset_right = -24.0
	_toast_box.offset_bottom = -52.0
	_toast_box.alignment = BoxContainer.ALIGNMENT_END
	_toast_box.add_theme_constant_override("separation", 12)
	_toast_box.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(_toast_box)

	_tooltip = PanelContainer.new()
	_tooltip.visible = false
	_tooltip.top_level = true
	_tooltip.z_index = 100
	_tooltip.custom_minimum_size.x = 240
	add_child(_tooltip)
	_tooltip_text = RichTextLabel.new()
	_tooltip_text.bbcode_enabled = false
	_tooltip_text.fit_content = true
	_tooltip_text.custom_minimum_size.x = 240
	_tooltip_text.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	_tooltip.add_child(_tooltip_text)

	_charsheet = CharSheetDialog.new()
	add_child(_charsheet)


# =========================================================================
# Styling (all palette-dependent; re-run on mode change)
# =========================================================================

func _restyle() -> void:
	var header_style := StyleBoxFlat.new()
	header_style.bg_color = ThemeService.color("ink_2")
	header_style.border_color = ThemeService.color("rule")
	header_style.border_width_bottom = 1
	header_style.content_margin_left = 24
	header_style.content_margin_right = 24
	_header.add_theme_stylebox_override("panel", header_style)

	_style_ui_button(_back_button, 14)
	_style_ui_button(_character_button, 10)

	_location_label.add_theme_font_override("font", _tracked(ThemeService.font("ui_medium"), 2.4))
	_location_label.add_theme_font_size_override("font_size", ThemeService.font_size("ui"))
	_location_label.add_theme_color_override("font_color", ThemeService.color("brass"))

	_time_label.add_theme_font_override("font", ThemeService.font("display_italic"))
	_time_label.add_theme_font_size_override("font_size", 22)
	_time_label.add_theme_color_override("font_color", ThemeService.color("cream"))

	_weather_label.add_theme_font_override("font", _tracked(ThemeService.font("mono"), 2.0))
	_weather_label.add_theme_font_size_override("font_size", ThemeService.font_size("ui"))
	_weather_label.add_theme_color_override("font_color", ThemeService.color("cream_faint"))

	_status_badge.add_theme_font_override("font", _tracked(ThemeService.font("ui"), 2.0))
	_status_badge.add_theme_font_size_override("font_size", ThemeService.font_size("ui"))

	_passage_bg.color = ThemeService.color("ink")

	_prose.add_theme_color_override("default_color", ThemeService.color("cream"))
	_prose.add_theme_font_override("normal_font", ThemeService.font("body"))
	_prose.add_theme_font_override("italics_font", ThemeService.font("body_italic"))
	_prose.add_theme_font_override("mono_font", ThemeService.font("mono"))
	_prose.add_theme_font_size_override("normal_font_size", ThemeService.font_size("lg"))
	_prose.add_theme_font_size_override("italics_font_size", ThemeService.font_size("lg"))
	_prose.add_theme_constant_override("line_separation", 8)

	_choices_label.add_theme_font_override("font", _tracked(ThemeService.font("ui_medium"), 2.4))
	_choices_label.add_theme_font_size_override("font_size", ThemeService.font_size("ui"))
	_choices_label.add_theme_color_override("font_color", ThemeService.color("brass_dim"))

	var footer_style := StyleBoxFlat.new()
	footer_style.bg_color = ThemeService.color("ink_2")
	footer_style.border_color = ThemeService.color("rule")
	footer_style.border_width_top = 1
	footer_style.content_margin_left = 24
	footer_style.content_margin_right = 24
	_footer.add_theme_stylebox_override("panel", footer_style)

	for label in [_footer_date, _footer_version]:
		label.add_theme_font_override("font", _tracked(ThemeService.font("mono"), 1.8))
		label.add_theme_font_size_override("font_size", ThemeService.font_size("mono"))
		label.add_theme_color_override("font_color", ThemeService.color("cream_faint"))

	var tooltip_style := StyleBoxFlat.new()
	tooltip_style.bg_color = ThemeService.color("ink_3")
	tooltip_style.border_color = ThemeService.color("rule_strong")
	tooltip_style.set_border_width_all(1)
	tooltip_style.set_content_margin_all(11)
	_tooltip.add_theme_stylebox_override("panel", tooltip_style)
	_tooltip_text.add_theme_color_override("default_color", ThemeService.color("cream"))
	_tooltip_text.add_theme_font_override("normal_font", ThemeService.font("ui"))
	_tooltip_text.add_theme_font_size_override("normal_font_size", 12)

	for button: Button in _choices_box.get_children():
		_style_choice_button(button, button.get_meta("greyed", false))
	_refresh_header()
	_refresh_footer()


func _style_ui_button(button: Button, font_size: int) -> void:
	var normal := StyleBoxFlat.new()
	normal.bg_color = ThemeService.color("ink_3")
	normal.border_color = ThemeService.color("rule")
	normal.set_border_width_all(1)
	normal.content_margin_left = 10
	normal.content_margin_right = 10
	normal.content_margin_top = 5
	normal.content_margin_bottom = 5
	var hover := normal.duplicate()
	hover.bg_color = ThemeService.color("ink_4")
	hover.border_color = ThemeService.color("brass")
	for state in ["normal", "pressed", "focus"]:
		button.add_theme_stylebox_override(state, normal)
	button.add_theme_stylebox_override("hover", hover)
	button.add_theme_font_override("font", _tracked(ThemeService.font("ui"), 1.8))
	button.add_theme_font_size_override("font_size", font_size)
	button.add_theme_color_override("font_color", ThemeService.color("brass"))
	button.add_theme_color_override("font_hover_color", ThemeService.color("cream"))
	button.add_theme_color_override("font_disabled_color", ThemeService.color("cream_faint"))


## The .choices .choice pattern: brass italic, em-dash prefix, hairline
## bottom border; hover shifts right and glows brick.
func _style_choice_button(button: Button, greyed: bool) -> void:
	var normal := StyleBoxFlat.new()
	normal.bg_color = Color.TRANSPARENT
	normal.border_color = ThemeService.color("rule")
	normal.border_width_bottom = 1
	normal.content_margin_left = 22
	normal.content_margin_right = 8
	normal.content_margin_top = 8
	normal.content_margin_bottom = 8
	var hover := normal.duplicate()
	hover.border_color = ThemeService.color("brick_glow")
	hover.content_margin_left = 28
	for state in ["normal", "pressed", "focus"]:
		button.add_theme_stylebox_override(state, normal)
	button.add_theme_stylebox_override("hover", hover)
	button.add_theme_stylebox_override("disabled", normal)
	button.add_theme_font_override("font", ThemeService.font("body_italic"))
	button.add_theme_font_size_override("font_size", ThemeService.font_size("lg"))
	var base_color := ThemeService.color("cream_faint") if greyed else ThemeService.color("brass")
	button.add_theme_color_override("font_color", base_color)
	button.add_theme_color_override("font_hover_color", ThemeService.color("brick_glow"))
	button.add_theme_color_override("font_pressed_color", ThemeService.color("brick_glow"))
	button.add_theme_color_override("font_focus_color", base_color)
	button.add_theme_color_override("font_disabled_color", ThemeService.color("cream_faint"))


static func _tracked(base: Font, spacing_px: float) -> FontVariation:
	var variation := FontVariation.new()
	variation.base_font = base
	variation.spacing_glyph = int(spacing_px)
	return variation


# =========================================================================
# Screen modes
# =========================================================================

func _apply_screen_mode(mode: String) -> void:
	_screen_mode = mode
	var is_scene := mode == "scene"
	_avatar_panel.visible = is_scene
	if is_scene:
		_outer_column.alignment = BoxContainer.ALIGNMENT_BEGIN
		_column.size_flags_horizontal = Control.SIZE_SHRINK_BEGIN
		_column.size_flags_vertical = Control.SIZE_EXPAND_FILL
		_prose.fit_content = false
		_prose.size_flags_vertical = Control.SIZE_EXPAND_FILL
	else:
		_outer_column.alignment = BoxContainer.ALIGNMENT_CENTER
		_column.size_flags_horizontal = Control.SIZE_SHRINK_CENTER
		_column.size_flags_vertical = Control.SIZE_SHRINK_CENTER
		_prose.fit_content = true
		_prose.size_flags_vertical = Control.SIZE_FILL


# =========================================================================
# StoryBridge signal handlers
# =========================================================================

func _on_knot_entered(knot: String, tags: Dictionary) -> void:
	_menu_shown = false
	_current_knot = knot
	_current_tags = tags
	if tags.has("check"):
		_defer_prose_clear = true
	else:
		_defer_prose_clear = false
		_prose.clear()
	_clear_choices()
	_end_panel.visible = false
	_extract_holder.visible = false
	_prose.visible = true
	_check_holder.visible = false
	var screen := String(tags.get("screen", "scene"))
	_apply_screen_mode(screen)
	_avatar_panel.set_phase(String(tags.get("avatar", "")))
	if KNOT_IMAGES.has(knot):
		_scene_image.texture = load(String(KNOT_IMAGES[knot]))
		_scene_image.visible = true
	else:
		_scene_image.visible = false
	_refresh_header()
	_refresh_footer()
	_avatar_panel.refresh()


func _on_text_appended(line: String) -> void:
	if _menu_shown:
		return
	if _defer_prose_clear:
		_defer_prose_clear = false
		_prose.clear()
	_prose.append_text(line + "\n\n")


func _on_choices_ready(choices: Array) -> void:
	if _menu_shown:
		return
	_clear_choices()
	_choices_label.visible = _screen_mode == "scene" and choices.size() > 1
	for choice in choices:
		var index := int(choice["index"])
		var button := Button.new()
		button.text = "—   %s" % String(choice["text"])
		button.alignment = HORIZONTAL_ALIGNMENT_LEFT
		button.focus_mode = Control.FOCUS_NONE
		button.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
		button.set_meta("greyed", false)
		_style_choice_button(button, false)
		button.pressed.connect(func() -> void: StoryBridge.choose(index))
		_choices_box.add_child(button)


func _on_check_ready(check: Dictionary) -> void:
	_clear_choices()
	_check_holder.visible = true
	_check_panel.present(check)


func _on_scene_stub(scene_kind: String, extract_id: String) -> void:
	if scene_kind != "branch_file_extract":
		return
	_prose.visible = false
	for child in _extract_holder.get_children():
		child.queue_free()
	var extract: BranchFileExtract = load("res://scenes/branch_file_extract.tscn").instantiate()
	extract.extract_id = extract_id
	_extract_holder.add_child(extract)
	_extract_holder.visible = true


func _on_flow_reset(_knot: String) -> void:
	_prose.clear()
	_defer_prose_clear = false
	_clear_choices()
	_extract_holder.visible = false
	_end_panel.visible = false
	_prose.visible = true


func _on_flow_ended() -> void:
	_clear_choices()
	_show_end_screen()


func _on_state_changed(_op: String) -> void:
	_refresh_header()
	_refresh_footer()
	_avatar_panel.refresh()


# =========================================================================
# Header / footer refresh
# =========================================================================

func _refresh_header() -> void:
	var header := State.header()
	_location_label.text = String(header["location"]).to_upper()
	_time_label.text = String(header["time"])
	_weather_label.text = String(header["weather"]).to_upper()
	_weather_label.visible = String(header["weather"]) != ""

	var override := String(header["status"])
	var badge_text: String
	var badge_color: Color
	if override != "":
		badge_text = override.to_upper()
		badge_color = ThemeService.color("status_steady")
	else:
		var composure := int(State.player()["current_composure"])
		badge_text = "STEADY"
		badge_color = ThemeService.color("status_steady")
		for row in STATUS_BADGES:
			if composure >= int(row[0]):
				badge_text = String(row[1])
				badge_color = ThemeService.color(String(row[2]))
				break
	_status_badge.text = badge_text
	_status_badge.add_theme_color_override("font_color", badge_color)
	var badge_style := StyleBoxFlat.new()
	badge_style.bg_color = Color.TRANSPARENT
	var border := badge_color
	border.a = 0.55
	badge_style.border_color = border
	badge_style.set_border_width_all(1)
	badge_style.content_margin_left = 10
	badge_style.content_margin_right = 10
	badge_style.content_margin_top = 4
	badge_style.content_margin_bottom = 4
	_status_badge.add_theme_stylebox_override("normal", badge_style)

	_back_button.disabled = _menu_shown \
		or _current_tags.has("history_root") \
		or not State.can_go_back()


func _refresh_footer() -> void:
	_footer_date.text = SizzleFormat.footer_status(State.date()).to_upper()


# =========================================================================
# Main menu / end screen (deliverable H)
# =========================================================================

func _show_main_menu() -> void:
	_menu_shown = true
	_current_knot = ""
	_current_tags = {}
	_apply_screen_mode("menu")
	_prose.visible = true
	_prose.clear()
	_scene_image.visible = false
	_extract_holder.visible = false
	_check_holder.visible = false
	_end_panel.visible = false
	_clear_choices()
	_prose.append_text("[center][font=res://fonts/Allura-Regular.woff2][font_size=120][color=%s]Sizzle[/color][/font_size][/font]\n\n" % ThemeService.color("brick_glow").to_html(false))
	_prose.append_text("[font=res://fonts/CormorantGaramond-Italic.woff2][font_size=38][color=%s]An infiltration in three acts[/color][/font_size][/font]\n\n" % ThemeService.color("cream").to_html(false))
	_prose.append_text("[color=%s]T O R O N T O   ·   2 0 0 5[/color][/center]\n\n" % ThemeService.color("brass_dim").to_html(false))
	_choices_label.visible = false
	_add_menu_button("Begin", func() -> void:
		StoryBridge.start(BRIEFING_PATH, BRIEFING_START))
	if SaveManager.has_autosave():
		_add_menu_button("Continue", _continue_from_autosave)
	_refresh_header()
	_refresh_footer()


func _add_menu_button(label: String, action: Callable) -> void:
	var button := Button.new()
	button.text = "—   %s" % label
	button.alignment = HORIZONTAL_ALIGNMENT_CENTER
	button.focus_mode = Control.FOCUS_NONE
	button.custom_minimum_size.x = 280
	button.size_flags_horizontal = Control.SIZE_SHRINK_CENTER
	button.set_meta("greyed", false)
	_style_choice_button(button, false)
	button.pressed.connect(action)
	_choices_box.add_child(button)


## Continue: the autosave is read into memory FIRST because start() itself
## triggers a knot_entered autosave that would clobber the file on disk.
func _continue_from_autosave() -> void:
	var save := SaveManager.read_save(SaveManager.AUTOSAVE_NAME)
	if save.is_empty():
		Rules.toast("warn", "No usable autosave found.")
		return
	StoryBridge.start(BRIEFING_PATH, BRIEFING_START)
	if not StoryBridge.load_game(save):
		Rules.toast("warn", "Autosave could not be loaded.")


func _show_end_screen() -> void:
	var is_prologue_end := _current_knot == "INTRO_800" or _current_knot == "intro_end"
	_prose.visible = false
	_check_holder.visible = false
	_apply_screen_mode("menu")
	_end_panel.visible = true
	for child in _end_panel.get_children():
		child.queue_free()

	var label := Label.new()
	label.text = "End of Prologue" if is_prologue_end else "The story ends here — for now."
	label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	label.add_theme_font_override("font", ThemeService.font("display_italic"))
	label.add_theme_font_size_override("font_size", 44)
	label.add_theme_color_override("font_color", ThemeService.color("cream"))
	_end_panel.add_child(label)

	var sub := Label.new()
	sub.text = "TO BE CONTINUED — ACT 1: INSERTION" if is_prologue_end else "END OF AVAILABLE CONTENT"
	sub.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	sub.add_theme_font_override("font", _tracked(ThemeService.font("ui"), 3.0))
	sub.add_theme_font_size_override("font_size", ThemeService.font_size("ui"))
	sub.add_theme_color_override("font_color", ThemeService.color("brass_dim"))
	_end_panel.add_child(sub)

	_add_menu_button("Main menu", _show_main_menu)


# =========================================================================
# Glossary tooltip (deliverable D)
# =========================================================================

func _load_glossary() -> Dictionary:
	var file := FileAccess.open("res://content/data/glossary.json", FileAccess.READ)
	if file == null:
		push_error("GameShell: cannot read glossary.json")
		return {}
	var parsed: Variant = JSON.parse_string(file.get_as_text())
	file.close()
	return parsed if parsed is Dictionary else {}


func _on_meta_hover_started(meta: Variant) -> void:
	var meta_string := String(meta)
	if not meta_string.begins_with("gloss:"):
		return
	var key := meta_string.trim_prefix("gloss:")
	if not _glossary.has(key):
		return
	_tooltip_text.text = String(_glossary[key])
	_tooltip.visible = true
	_tooltip.reset_size()
	var pos := get_global_mouse_position() + Vector2(12, -_tooltip.size.y - 16)
	pos.x = clampf(pos.x, 8.0, get_viewport_rect().size.x - _tooltip.size.x - 8.0)
	pos.y = maxf(pos.y, 8.0)
	_tooltip.position = pos


func _on_meta_hover_ended(_meta: Variant) -> void:
	_tooltip.visible = false


# =========================================================================
# Toasts (deliverable D) — bottom-right stack, 4 kinds, ~4s auto-dismiss
# =========================================================================

func _on_toast(kind: String, text: String) -> void:
	var accent_token := "brass"
	match kind:
		"success": accent_token = "composed"
		"warn": accent_token = "rattled"
		"hot": accent_token = "brick"
	var toast := PanelContainer.new()
	var style := StyleBoxFlat.new()
	style.bg_color = ThemeService.color("ink_2")
	style.border_color = ThemeService.color("rule")
	style.set_border_width_all(1)
	style.border_width_left = 3
	style.border_color = ThemeService.color(accent_token)
	style.set_content_margin_all(12)
	toast.add_theme_stylebox_override("panel", style)
	toast.custom_minimum_size.x = 360

	var box := VBoxContainer.new()
	box.add_theme_constant_override("separation", 3)
	toast.add_child(box)

	var label := Label.new()
	label.text = kind.to_upper()
	label.add_theme_font_override("font", _tracked(ThemeService.font("ui"), 2.4))
	label.add_theme_font_size_override("font_size", ThemeService.font_size("ui"))
	label.add_theme_color_override("font_color", ThemeService.color(accent_token))
	box.add_child(label)

	var body := Label.new()
	body.text = text
	body.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	body.add_theme_font_override("font", ThemeService.font("body"))
	body.add_theme_font_size_override("font_size", 15)
	body.add_theme_color_override("font_color", ThemeService.color("cream"))
	box.add_child(body)

	_toast_box.add_child(toast)
	while _toast_box.get_child_count() > 4:
		_toast_box.get_child(0).free()

	toast.modulate.a = 0.0
	var tween := toast.create_tween()
	tween.tween_property(toast, "modulate:a", 1.0, 0.24)
	tween.tween_interval(4.0)
	tween.tween_property(toast, "modulate:a", 0.0, 0.32)
	tween.tween_callback(toast.queue_free)


# =========================================================================
# Buttons
# =========================================================================

func _on_back_pressed() -> void:
	if not StoryBridge.go_back():
		Rules.toast("info", "Nothing to go back to.")


func _on_character_pressed() -> void:
	_charsheet.open()


func _clear_choices() -> void:
	_choices_label.visible = false
	for child in _choices_box.get_children():
		_choices_box.remove_child(child)
		child.queue_free()
