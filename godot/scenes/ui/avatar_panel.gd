class_name AvatarPanel
extends Control
## Left avatar column (~430px, the CSS grid's avatar area): dotted-border
## frame with the `# avatar:` phase image (or the placeholder suit), and the
## bottom identity block — name / codename kicker / composure pips 0..7.
##
## Phase 3 scope: only the BLK phase overrides exist as art. Any unknown
## `# avatar:` id (man_*, pale_*, wds_*) falls back to the placeholder;
## Phase 4 wires the manifest-driven layer stack.

const PANEL_WIDTH := 430.0
const FRAME_PAD := 30.0  # --sz-avatar-pad

const PHASE_IMAGES := {
	"blk_day": "res://media/blackout-day.png",
	"blk_night": "res://media/blackout-night.png",
}
const PLACEHOLDER := "res://media/placeholder-suit.png"

const COMPOSURE_MAX := 7

var _bg: ColorRect
var _border_right: ColorRect
var _frame: Control
var _portrait: TextureRect
var _identity: PanelContainer
var _name_label: Label
var _kicker: Label
var _pip_label: Label
var _pips: Array[Panel] = []
var _pip_value: Label


func _ready() -> void:
	custom_minimum_size.x = PANEL_WIDTH
	_build()
	ThemeService.mode_changed.connect(func(_m: String) -> void: restyle())
	set_phase("")
	restyle()
	refresh()


func _build() -> void:
	_bg = ColorRect.new()
	_bg.set_anchors_preset(Control.PRESET_FULL_RECT)
	add_child(_bg)

	_border_right = ColorRect.new()
	_border_right.set_anchors_preset(Control.PRESET_RIGHT_WIDE)
	_border_right.custom_minimum_size.x = 1.0
	_border_right.offset_left = -1.0
	add_child(_border_right)

	var column := VBoxContainer.new()
	column.set_anchors_preset(Control.PRESET_FULL_RECT)
	column.add_theme_constant_override("separation", 0)
	add_child(column)

	# Dotted frame area — centered in the flexible space above the meta block.
	var frame_holder := MarginContainer.new()
	frame_holder.size_flags_vertical = Control.SIZE_EXPAND_FILL
	for side in ["margin_left", "margin_top", "margin_right", "margin_bottom"]:
		frame_holder.add_theme_constant_override(side, int(FRAME_PAD))
	column.add_child(frame_holder)

	_frame = Control.new()
	_frame.draw.connect(_draw_dotted_border)
	frame_holder.add_child(_frame)

	var portrait_margin := MarginContainer.new()
	portrait_margin.set_anchors_preset(Control.PRESET_FULL_RECT)
	for side in ["margin_left", "margin_top", "margin_right", "margin_bottom"]:
		portrait_margin.add_theme_constant_override(side, 10)
	_frame.add_child(portrait_margin)

	_portrait = TextureRect.new()
	_portrait.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	_portrait.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	portrait_margin.add_child(_portrait)

	# Identity block — bottom-anchored (the AvatarMeta passage, native).
	_identity = PanelContainer.new()
	column.add_child(_identity)

	var identity_box := VBoxContainer.new()
	identity_box.add_theme_constant_override("separation", 4)
	_identity.add_child(identity_box)

	_kicker = Label.new()
	identity_box.add_child(_kicker)

	_name_label = Label.new()
	identity_box.add_child(_name_label)

	var stat_row := HBoxContainer.new()
	stat_row.add_theme_constant_override("separation", 10)
	identity_box.add_child(stat_row)

	_pip_label = Label.new()
	_pip_label.text = "COMPOSURE"
	stat_row.add_child(_pip_label)

	var pip_box := HBoxContainer.new()
	pip_box.add_theme_constant_override("separation", 3)
	pip_box.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	pip_box.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	stat_row.add_child(pip_box)
	for _i in COMPOSURE_MAX:
		var pip := Panel.new()
		pip.custom_minimum_size = Vector2(0, 10)
		pip.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		pip_box.add_child(pip)
		_pips.append(pip)

	_pip_value = Label.new()
	stat_row.add_child(_pip_value)


## `# avatar:` phase id ("" = no override -> placeholder for the greybox).
func set_phase(avatar_id: String) -> void:
	var path: String = PHASE_IMAGES.get(avatar_id, PLACEHOLDER)
	_portrait.texture = load(path)


## Re-read name/codename/composure from State.
func refresh() -> void:
	var player := State.player()
	_name_label.text = "%s %s" % [player["first_name"], player["surname"]]
	var codename := String(player["codename"])
	_kicker.text = codename.to_upper() if codename != "" else "THE BRANCH"
	var current := int(player["current_composure"])
	_pip_value.text = "%d/%d" % [current, COMPOSURE_MAX]
	for i in _pips.size():
		_style_pip(_pips[i], i < current)


func restyle() -> void:
	_bg.color = ThemeService.color("ink")
	_border_right.color = ThemeService.color("rule")

	var identity_style := StyleBoxFlat.new()
	identity_style.bg_color = ThemeService.color("ink_2")
	identity_style.set_content_margin_all(20)
	_identity.add_theme_stylebox_override("panel", identity_style)

	_kicker.add_theme_font_override("font", _tracked(ThemeService.font("ui_medium"), 2.4))
	_kicker.add_theme_font_size_override("font_size", ThemeService.font_size("ui"))
	_kicker.add_theme_color_override("font_color", ThemeService.color("brass"))

	_name_label.add_theme_font_override("font", ThemeService.font("display_italic"))
	_name_label.add_theme_font_size_override("font_size", 24)
	_name_label.add_theme_color_override("font_color", ThemeService.color("cream"))

	_pip_label.add_theme_font_override("font", _tracked(ThemeService.font("ui_medium"), 2.2))
	_pip_label.add_theme_font_size_override("font_size", 10)
	_pip_label.add_theme_color_override("font_color", ThemeService.color("brass"))

	_pip_value.add_theme_font_override("font", ThemeService.font("mono"))
	_pip_value.add_theme_font_size_override("font_size", 11)
	_pip_value.add_theme_color_override("font_color", ThemeService.color("cream_soft"))

	_frame.queue_redraw()
	refresh()


func _style_pip(pip: Panel, on: bool) -> void:
	var style := StyleBoxFlat.new()
	style.bg_color = ThemeService.color("brass") if on else ThemeService.color("ink_3")
	style.border_color = ThemeService.color("brass_glow") if on else ThemeService.color("ink_4")
	style.set_border_width_all(1)
	pip.add_theme_stylebox_override("panel", style)


func _draw_dotted_border() -> void:
	var rect := Rect2(Vector2.ZERO, _frame.size)
	var col := ThemeService.color("brass_dim")
	col.a = 0.55
	var dash := 4.0
	_frame.draw_dashed_line(rect.position, Vector2(rect.end.x, rect.position.y), col, 1.0, dash)
	_frame.draw_dashed_line(Vector2(rect.end.x, rect.position.y), rect.end, col, 1.0, dash)
	_frame.draw_dashed_line(rect.end, Vector2(rect.position.x, rect.end.y), col, 1.0, dash)
	_frame.draw_dashed_line(Vector2(rect.position.x, rect.end.y), rect.position, col, 1.0, dash)


static func _tracked(base: Font, spacing_px: float) -> FontVariation:
	var variation := FontVariation.new()
	variation.base_font = base
	variation.spacing_glyph = int(spacing_px)
	return variation
