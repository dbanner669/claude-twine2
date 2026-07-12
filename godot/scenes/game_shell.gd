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
var _scene_frame: PanelContainer
var _scene_clip: Control
var _scene_image: TextureRect
var _drift_tween: Tween
var _prose: RichTextLabel
var _extract_holder: VBoxContainer   # BranchFileExtract panel mounts here (F)
var _check_holder: VBoxContainer     # check panel mounts here (E)
var _choices_label: Label
var _choices_box: VBoxContainer
var _end_panel: VBoxContainer
# Main-menu title block (native labels so the wordmark glow can breathe)
var _menu_panel: VBoxContainer
var _menu_title: Label
var _menu_subtitle: Label
var _menu_kicker: Label
var _menu_glow_tween: Tween
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
var _saves_dialog: SavesDialog
var _settings_dialog: SettingsDialog
var _menu_button: Button
var _saves_button: Button
var _settings_button: Button
## Paced prose reveal (Settings.text_speed): visible_characters advances at
## N chars/sec in _process; choices stay hidden until the reveal lands.
## 0 cps = instant = exactly the old behavior.
var _reveal_position := 0.0
var _reveal_active := false
var _choices_label_wanted := false
var _choices_tween: Tween
var _check_panel: CheckPanel
var _menu_shown := false
# Character creation (Phase 5)
var _cc_holder: VBoxContainer
var _cc_flow: CCFlow
var _cc_active := false
## Set when a *_end handoff knot is reached; the following flow_ended then
## returns to the CC summary instead of the end screen.
var _handoff_pending := false


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
	StoryBridge.handoff_reached.connect(_on_handoff_reached)
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

	# In-game route back to the main menu (the twee header's clickable
	# wordmark; the merged Godot header had no equivalent — first-play
	# review finding, 2026-07-11). Safe mid-story: autosave already runs
	# on every knot entry, so Continue restores the exact position.
	_menu_button = Button.new()
	_menu_button.text = "MENU"
	_menu_button.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	_menu_button.focus_mode = Control.FOCUS_NONE
	_menu_button.pressed.connect(_on_menu_pressed)
	header_row.add_child(_menu_button)

	_saves_button = Button.new()
	_saves_button.text = "SAVES"
	_saves_button.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	_saves_button.focus_mode = Control.FOCUS_NONE
	_saves_button.pressed.connect(_on_saves_pressed)
	header_row.add_child(_saves_button)

	_character_button = Button.new()
	_character_button.text = "CHARACTER"
	_character_button.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	_character_button.focus_mode = Control.FOCUS_NONE
	_character_button.pressed.connect(_on_character_pressed)
	header_row.add_child(_character_button)

	_settings_button = Button.new()
	_settings_button.text = "SETTINGS"
	_settings_button.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	_settings_button.focus_mode = Control.FOCUS_NONE
	_settings_button.pressed.connect(_on_settings_pressed)
	header_row.add_child(_settings_button)

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

	_menu_panel = VBoxContainer.new()
	_menu_panel.visible = false
	_menu_panel.add_theme_constant_override("separation", 26)
	_column.add_child(_menu_panel)
	_menu_title = Label.new()
	_menu_title.text = "Sizzle"
	_menu_title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_menu_panel.add_child(_menu_title)
	_menu_subtitle = Label.new()
	_menu_subtitle.text = "An infiltration in three acts"
	_menu_subtitle.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_menu_panel.add_child(_menu_subtitle)
	_menu_kicker = Label.new()
	_menu_kicker.text = "T O R O N T O   ·   2 0 0 5"
	_menu_kicker.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_menu_panel.add_child(_menu_kicker)

	# Scene image sits in a dossier-photograph mat: hairline border + mat
	# padding, contents clipped so the slow drift can overscan.
	_scene_frame = PanelContainer.new()
	_scene_frame.visible = false
	_column.add_child(_scene_frame)
	_scene_clip = Control.new()
	_scene_clip.clip_contents = true
	_scene_frame.add_child(_scene_clip)
	_scene_image = TextureRect.new()
	_scene_image.set_anchors_preset(Control.PRESET_FULL_RECT)
	_scene_image.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	_scene_image.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	_scene_clip.add_child(_scene_image)

	_prose = RichTextLabel.new()
	_prose.bbcode_enabled = true
	_prose.fit_content = false
	_prose.scroll_active = true
	_prose.scroll_following = false
	_prose.selection_enabled = true
	_prose.size_flags_vertical = Control.SIZE_EXPAND_FILL
	_prose.meta_hover_started.connect(_on_meta_hover_started)
	_prose.meta_hover_ended.connect(_on_meta_hover_ended)
	_prose.gui_input.connect(_on_prose_gui_input)
	_column.add_child(_prose)

	_extract_holder = VBoxContainer.new()
	_extract_holder.visible = false
	_extract_holder.size_flags_vertical = Control.SIZE_EXPAND_FILL
	_column.add_child(_extract_holder)

	_cc_holder = VBoxContainer.new()
	_cc_holder.visible = false
	_column.add_child(_cc_holder)
	_cc_flow = load("res://scenes/cc/cc_flow.tscn").instantiate()
	_cc_flow.incident_chosen.connect(_on_cc_incident_chosen)
	_cc_flow.summary_signed.connect(_on_cc_summary_signed)
	_cc_holder.add_child(_cc_flow)

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
	# Atmosphere (vignette + grain) above the shell chrome, below toasts and
	# the glossary tooltip — the layout.css stacking, minus the backdrop bars.
	add_child(AtmosphereOverlay.new())

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

	_saves_dialog = SavesDialog.new()
	add_child(_saves_dialog)

	_settings_dialog = SettingsDialog.new()
	add_child(_settings_dialog)


# =========================================================================
# Styling (all palette-dependent; re-run on mode change)
# =========================================================================

func _restyle() -> void:
	# Day mode gets the bronze header variant (layout.css "Daytime header"):
	# ink-4 bronze bar, #ecdcb8 text, brass-glow accents. Night values are
	# untouched (bronze_cream's night value IS cream).
	var day := ThemeService.mode == "day"
	var header_style := StyleBoxFlat.new()
	header_style.bg_color = ThemeService.color("ink_4" if day else "ink_2")
	header_style.border_color = ThemeService.color("rule")
	header_style.border_width_bottom = 1
	header_style.content_margin_left = 24
	header_style.content_margin_right = 24
	_header.add_theme_stylebox_override("panel", header_style)

	_style_ui_button(_back_button, 14)
	_style_ui_button(_menu_button, 10)
	_style_ui_button(_saves_button, 10)
	_style_ui_button(_character_button, 10)
	_style_ui_button(_settings_button, 10)

	_location_label.add_theme_font_override("font", _tracked(ThemeService.font("ui_medium"), 2.4))
	_location_label.add_theme_font_size_override("font_size", ThemeService.font_size("ui"))
	_location_label.add_theme_color_override("font_color", ThemeService.color("brass_glow" if day else "brass"))

	_time_label.add_theme_font_override("font", ThemeService.font("display_italic"))
	_time_label.add_theme_font_size_override("font_size", 22)
	_time_label.add_theme_color_override("font_color", ThemeService.color("bronze_cream"))

	var weather_color := ThemeService.color("bronze_cream") if day else ThemeService.color("cream_faint")
	if day:
		weather_color.a = 0.75
	_weather_label.add_theme_font_override("font", _tracked(ThemeService.font("mono"), 2.0))
	_weather_label.add_theme_font_size_override("font_size", ThemeService.font_size("ui"))
	_weather_label.add_theme_color_override("font_color", weather_color)

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

	# Scene-image mat (dossier-photograph treatment)
	var mat := StyleBoxFlat.new()
	mat.bg_color = ThemeService.color("ink_2")
	mat.border_color = ThemeService.color("rule_strong")
	mat.set_border_width_all(1)
	mat.set_content_margin_all(10)
	_scene_frame.add_theme_stylebox_override("panel", mat)

	# Main-menu title block
	_menu_title.add_theme_font_override("font", load("res://fonts/Allura-Regular.woff2"))
	_menu_title.add_theme_font_size_override("font_size", 120)
	if _menu_glow_tween == null or not _menu_glow_tween.is_valid():
		_menu_title.add_theme_color_override("font_color", ThemeService.color("brick_glow"))
	_menu_subtitle.add_theme_font_override("font", ThemeService.font("display_italic"))
	_menu_subtitle.add_theme_font_size_override("font_size", 38)
	_menu_subtitle.add_theme_color_override("font_color", ThemeService.color("cream"))
	_menu_kicker.add_theme_font_override("font", _tracked(ThemeService.font("ui"), 2.0))
	_menu_kicker.add_theme_font_size_override("font_size", ThemeService.font_size("ui_md"))
	_menu_kicker.add_theme_color_override("font_color", ThemeService.color("brass_dim"))

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
	# Day bronze header: menu links brass-glow, hover #f6ead0 (layout.css).
	var day := ThemeService.mode == "day"
	button.add_theme_color_override("font_color", ThemeService.color("brass_glow" if day else "brass"))
	button.add_theme_color_override("font_hover_color", ThemeService.color("bronze_cream_bright" if day else "cream"))
	button.add_theme_color_override("font_disabled_color", ThemeService.color("cream_faint"))


## The .choices .choice pattern: brass italic, em-dash prefix, hairline
## bottom border; hover shifts right and glows brick. One SHARED StyleBox
## across all states so the hover shift can be tweened (the CSS had
## transition: padding-left/border-color 0.15s; Button state swaps snap).
func _style_choice_button(button: Button, greyed: bool) -> void:
	if button.has_meta("hover_tween"):
		var old_tween: Tween = button.get_meta("hover_tween")
		if old_tween != null and old_tween.is_valid():
			old_tween.kill()
	var box := StyleBoxFlat.new()
	box.bg_color = Color.TRANSPARENT
	box.border_color = ThemeService.color("rule")
	box.border_width_bottom = 1
	box.content_margin_left = 22
	box.content_margin_right = 8
	box.content_margin_top = 8
	box.content_margin_bottom = 8
	for state in ["normal", "hover", "pressed", "focus", "disabled"]:
		button.add_theme_stylebox_override(state, box)
	button.set_meta("box", box)
	button.add_theme_font_override("font", ThemeService.font("body_italic"))
	button.add_theme_font_size_override("font_size", ThemeService.font_size("lg"))
	var base_color := ThemeService.color("cream_faint") if greyed else ThemeService.color("brass")
	button.add_theme_color_override("font_color", base_color)
	button.add_theme_color_override("font_hover_color", ThemeService.color("brick_glow"))
	button.add_theme_color_override("font_pressed_color", ThemeService.color("brick_glow"))
	button.add_theme_color_override("font_focus_color", base_color)
	button.add_theme_color_override("font_disabled_color", ThemeService.color("cream_faint"))
	_style_choice_chevron(button, base_color)


## Right-aligned "›" on every choice row (passages.css .choice::after:
## \203A, margin-left auto, normal style, opacity 0.5; hover brick-glow).
## Buttons can't right-align a suffix glyph, so the chevron is an anchored
## Label child, created once and recolored on every restyle.
func _style_choice_chevron(button: Button, base_color: Color) -> void:
	var chevron: Label = button.get_node_or_null("Chevron")
	if chevron == null:
		chevron = Label.new()
		chevron.name = "Chevron"
		chevron.text = "›"
		chevron.mouse_filter = Control.MOUSE_FILTER_IGNORE
		button.add_child(chevron)
		button.mouse_entered.connect(_on_choice_chevron_hover.bind(button, true))
		button.mouse_exited.connect(_on_choice_chevron_hover.bind(button, false))
	chevron.add_theme_font_override("font", ThemeService.font("body"))
	chevron.add_theme_font_size_override("font_size", ThemeService.font_size("lg"))
	var color := base_color
	color.a = 0.5
	chevron.add_theme_color_override("font_color", color)
	chevron.set_anchors_and_offsets_preset(
		Control.PRESET_CENTER_RIGHT, Control.PRESET_MODE_MINSIZE, 8)


func _on_choice_chevron_hover(button: Button, entered: bool) -> void:
	var chevron: Label = button.get_node_or_null("Chevron")
	if chevron == null:
		return
	var color: Color
	if entered:
		color = ThemeService.color("brick_glow")
	elif button.get_meta("greyed", false):
		color = ThemeService.color("cream_faint")
	else:
		color = ThemeService.color("brass")
	color.a = 0.5
	chevron.add_theme_color_override("font_color", color)

	# The hover glide (padding-left 22->28, border rule->brick-glow, 0.15s).
	if button.disabled or not button.has_meta("box"):
		return
	var box: StyleBoxFlat = button.get_meta("box")
	if box == null:
		return
	var margin := 28.0 if entered else 22.0
	var border := ThemeService.color("brick_glow") if entered else ThemeService.color("rule")
	if button.has_meta("hover_tween"):
		var old_tween: Tween = button.get_meta("hover_tween")
		if old_tween != null and old_tween.is_valid():
			old_tween.kill()
	if not Settings.animations_enabled():
		box.content_margin_left = margin
		box.border_color = border
		return
	var tween := button.create_tween().set_parallel(true)
	tween.tween_property(box, "content_margin_left", margin, 0.15)
	tween.tween_property(box, "border_color", border, 0.15)
	button.set_meta("hover_tween", tween)


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
	_exit_cc_view()
	_hide_menu_panel()
	_current_knot = knot
	_current_tags = tags
	if tags.has("check"):
		_defer_prose_clear = true
	else:
		_defer_prose_clear = false
		_prose.clear()
		_begin_reveal()
	_clear_choices()
	_end_panel.visible = false
	_extract_holder.visible = false
	_prose.visible = true
	_check_holder.visible = false
	var screen := String(tags.get("screen", "scene"))
	_apply_screen_mode(screen)
	_avatar_panel.set_phase(String(tags.get("avatar", "")))
	if KNOT_IMAGES.has(knot):
		_show_scene_image(load(String(KNOT_IMAGES[knot])))
	else:
		_hide_scene_image()
	_refresh_header()
	_refresh_footer()
	_avatar_panel.refresh()


func _on_text_appended(line: String) -> void:
	if _menu_shown:
		return
	if _defer_prose_clear:
		_defer_prose_clear = false
		_prose.clear()
		_begin_reveal()
	# Brass glossary terms (passages.css .glossary-label): decorated at
	# display time so the generated ink stays untouched. Append-time color is
	# mode-correct because ThemeService (autoload, connected first) resolves
	# the knot's day/night mode before the shell receives any of its text.
	_prose.append_text(_decorate_gloss(line, ThemeService.color("brass").to_html(false)) + "\n\n")
	if _reveal_active:
		# New text joins the queue rather than flashing in fully.
		_prose.visible_characters = int(_reveal_position)


func _on_choices_ready(choices: Array) -> void:
	if _menu_shown:
		return
	_clear_choices()
	_choices_label_wanted = _screen_mode == "scene" and choices.size() > 1
	# During a reveal the choices wait for the prose to finish landing.
	_choices_box.visible = not _reveal_active
	_choices_label.visible = _choices_label_wanted and not _reveal_active
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
	if not _reveal_active:
		_animate_choices_in()


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
	_reveal_active = false
	_prose.visible_characters = -1
	_clear_choices()
	_exit_cc_view()
	_extract_holder.visible = false
	_end_panel.visible = false
	_prose.visible = true


func _on_flow_ended() -> void:
	_clear_choices()
	if _handoff_pending:
		# A *_end incident handoff ended the flashback story: return to the
		# CC summary (CC-500 equivalent) instead of the end screen.
		_handoff_pending = false
		_enter_cc_summary()
	else:
		_show_end_screen()


func _on_handoff_reached(_knot: String) -> void:
	_handoff_pending = true


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
	_menu_button.disabled = _menu_shown


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
	_exit_cc_view()
	_handoff_pending = false
	_prose.visible = true
	_prose.clear()
	_reveal_active = false
	_prose.visible_characters = -1
	_hide_scene_image()
	_extract_holder.visible = false
	_check_holder.visible = false
	_end_panel.visible = false
	_clear_choices()
	_menu_panel.visible = true
	_choices_label.visible = false
	_add_menu_button("Begin", _start_character_creation)
	if SaveManager.has_autosave():
		_add_menu_button("Continue", _continue_from_autosave)
	_animate_menu_in()
	_refresh_header()
	_refresh_footer()


## Title block entrance (staggered fades) + the breathing wordmark glow.
func _animate_menu_in() -> void:
	if _menu_glow_tween != null and _menu_glow_tween.is_valid():
		_menu_glow_tween.kill()
	_menu_title.add_theme_color_override("font_color", ThemeService.color("brick_glow"))
	if not Settings.animations_enabled():
		for label: Control in [_menu_title, _menu_subtitle, _menu_kicker]:
			label.modulate.a = 1.0
		for child: Control in _choices_box.get_children():
			child.modulate.a = 1.0
		return
	var entrance := create_tween().set_parallel(true)
	var index := 0
	for label: Control in [_menu_title, _menu_subtitle, _menu_kicker]:
		label.modulate.a = 0.0
		entrance.tween_property(label, "modulate:a", 1.0, 0.5).set_delay(index * 0.18)
		index += 1
	_animate_choices_in()
	# Slow breath on the wordmark: brick-glow up to the hover pink and back.
	_menu_glow_tween = create_tween().set_loops()
	_menu_glow_tween.tween_property(_menu_title, "theme_override_colors/font_color",
		Color("#f07880"), 2.6).set_trans(Tween.TRANS_SINE).set_ease(Tween.EASE_IN_OUT)
	_menu_glow_tween.tween_property(_menu_title, "theme_override_colors/font_color",
		ThemeService.color("brick_glow"), 2.6).set_trans(Tween.TRANS_SINE).set_ease(Tween.EASE_IN_OUT)


func _hide_menu_panel() -> void:
	if _menu_glow_tween != null and _menu_glow_tween.is_valid():
		_menu_glow_tween.kill()
	_menu_panel.visible = false


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
	_reveal_active = false
	_prose.visible_characters = -1
	_hide_menu_panel()
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
	_animate_choices_in()


# =========================================================================
# Character creation (Phase 5) — native CC-100/300/400/500 flow
# =========================================================================

## Main menu Begin: fresh character, dossier flow at step 1. The twee CC
## passages are tagged `nighttime`, so night mode is forced for the flow.
func _start_character_creation() -> void:
	State.reset()
	_menu_shown = false
	_current_knot = ""
	_current_tags = {}
	_handoff_pending = false
	ThemeService.set_mode("night")
	Rules.set_header("Branch HQ — Personnel File", "")
	_show_cc_view()
	_cc_flow.begin()


## Post-flashback return point (CC-500). inciting_incident was already set
## by the StoryBridge handoff map at *_end. No rebuild happens here — the
## CC-400-top rebuild ran before the flashback and re-running it would wipe
## the flashback's skill grants.
func _enter_cc_summary() -> void:
	ThemeService.set_mode("night")
	Rules.set_header("Branch HQ — Personnel File", "")
	_show_cc_view()
	_cc_flow.open_summary()


func _show_cc_view() -> void:
	_cc_active = true
	_apply_screen_mode("creation")
	_hide_menu_panel()
	_prose.visible = false
	_hide_scene_image()
	_extract_holder.visible = false
	_check_holder.visible = false
	_end_panel.visible = false
	_clear_choices()
	_cc_holder.visible = true
	_refresh_header()
	_refresh_footer()


func _exit_cc_view() -> void:
	_cc_active = false
	_cc_holder.visible = false


## Incident card confirmed at the incident step. CCFlow already ran
## Rules.cc_rebuild_derived (upstream of the flashback); the engine state
## must survive into the story, hence keep_engine_state = true.
func _on_cc_incident_chosen(incident: Dictionary) -> void:
	StoryBridge.start(String(incident["story"]), String(incident["start"]), true)


## Summary signed: finalize (baseline composure copy, AFTER the flashback)
## and hand off to the briefing.
func _on_cc_summary_signed() -> void:
	Rules.cc_finalize()
	StoryBridge.start(BRIEFING_PATH, BRIEFING_START, true)


# =========================================================================
# Glossary tooltip (deliverable D)
# =========================================================================

## Wraps every [url=gloss:...]...[/url] span in a color tag so terms render
## brass and the meta underline (drawn at underline_alpha, 50%) reads as the
## soft hairline from passages.css. Pure; unit-tested in test_gloss_markup.gd.
static func _decorate_gloss(line: String, brass_hex: String) -> String:
	var regex := RegEx.create_from_string("\\[url=gloss:.*?\\[/url\\]")
	return regex.sub(line, "[color=#" + brass_hex + "]$0[/color]", true)


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


func _on_menu_pressed() -> void:
	if _menu_shown:
		return
	_show_main_menu()


func _on_saves_pressed() -> void:
	# SAVE is blocked during the CC flow (pre-story steps have no story
	# frame; see PHASE-5-PROGRESS.md). LOAD remains available.
	_saves_dialog.block_saves = _cc_active
	_saves_dialog.open()


func _on_settings_pressed() -> void:
	_settings_dialog.open()


func _clear_choices() -> void:
	_choices_label.visible = false
	_choices_label_wanted = false
	_choices_box.visible = true
	if _choices_tween != null and _choices_tween.is_valid():
		_choices_tween.kill()
	for child in _choices_box.get_children():
		_choices_box.remove_child(child)
		child.queue_free()


# =========================================================================
# Paced prose reveal (Settings.text_speed)
# =========================================================================

func _begin_reveal() -> void:
	if _menu_shown or Settings.text_speed_cps() <= 0.0:
		_reveal_active = false
		_prose.visible_characters = -1
		return
	_reveal_position = 0.0
	_prose.visible_characters = 0
	_reveal_active = true


func _finish_reveal() -> void:
	_reveal_active = false
	_prose.visible_characters = -1
	_choices_box.visible = true
	_choices_label.visible = _choices_label_wanted
	_animate_choices_in()


## Cascade fade-in for whatever is in the choices box (60ms stagger).
func _animate_choices_in() -> void:
	if _choices_tween != null and _choices_tween.is_valid():
		_choices_tween.kill()
	if not Settings.animations_enabled():
		for child: Control in _choices_box.get_children():
			child.modulate.a = 1.0
		return
	if _choices_box.get_child_count() == 0:
		return
	_choices_tween = create_tween().set_parallel(true)
	var index := 0
	for child: Control in _choices_box.get_children():
		child.modulate.a = 0.0
		_choices_tween.tween_property(child, "modulate:a", 1.0, 0.15).set_delay(index * 0.06)
		index += 1


func _process(delta: float) -> void:
	if not _reveal_active:
		return
	# Switching to instant mid-reveal (settings dialog is reachable live).
	var cps := Settings.text_speed_cps()
	if cps <= 0.0:
		_finish_reveal()
		return
	var total := _prose.get_total_character_count()
	if total <= 0:
		return
	_reveal_position = minf(_reveal_position + cps * delta, float(total))
	_prose.visible_characters = int(_reveal_position)
	if int(_reveal_position) >= total:
		_finish_reveal()


## Click anywhere in the prose during a reveal = show it all now.
func _on_prose_gui_input(event: InputEvent) -> void:
	if _reveal_active and event is InputEventMouseButton and event.pressed:
		_finish_reveal()


# =========================================================================
# Scene image (dossier-photograph treatment)
# =========================================================================

## Full frame at natural aspect scaled to the content column (gate
## punch-list: no 16:9 cropping), fade-in on entry, and a very slow drift
## (scale 1.0 -> 1.02 over ~18s, yoyo) so stills read as alive.
func _show_scene_image(texture: Texture2D) -> void:
	var inner_w := CONTENT_WIDTH - 20.0  # mat padding both sides
	var aspect := texture.get_height() / float(texture.get_width())
	var inner := Vector2(inner_w, inner_w * aspect)
	_scene_image.texture = texture
	_scene_clip.custom_minimum_size = inner
	_scene_image.pivot_offset = inner / 2.0
	_scene_image.scale = Vector2.ONE
	_scene_frame.visible = true
	if _drift_tween != null and _drift_tween.is_valid():
		_drift_tween.kill()
	if not Settings.animations_enabled():
		_scene_frame.modulate.a = 1.0
		return
	_scene_frame.modulate.a = 0.0
	create_tween().tween_property(_scene_frame, "modulate:a", 1.0, 0.4)
	_drift_tween = create_tween().set_loops()
	_drift_tween.tween_property(_scene_image, "scale", Vector2(1.02, 1.02), 18.0)
	_drift_tween.tween_property(_scene_image, "scale", Vector2.ONE, 18.0)


func _hide_scene_image() -> void:
	_scene_frame.visible = false
	if _drift_tween != null and _drift_tween.is_valid():
		_drift_tween.kill()
