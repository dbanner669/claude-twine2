class_name CheckPanel
extends PanelContainer
## The skill-check roll panel — the <<skillCheck>> widget, native
## (passages.css .skill-check). Shown by the shell on StoryBridge.check_ready:
## skill name(s), dice notation + modifier, target; Roll button; ~1s Tween
## cycling dice faces, settling on the pre-rolled total from
## StoryBridge.roll_preview(); outcome strip; then resolve_check() continues
## the story. StoryBridge.resolve_check stays the deterministic/test path.

const SPIN_SECONDS := 1.0
const SETTLE_PAUSE := 0.45

var _skill_label: Label
var _target_label: Label
var _dice_label: Label
var _total_label: Label
var _roll_button: Button
var _outcome_label: Label
var _check: Dictionary = {}
var _spin_min := 2
var _spin_max := 12
var _outcome_token := ""  # "", "composed" (pass) or "rattled" (fail)


func _ready() -> void:
	_build()
	ThemeService.mode_changed.connect(func(_m: String) -> void: _restyle())
	_restyle()


func _build() -> void:
	var box := VBoxContainer.new()
	box.add_theme_constant_override("separation", 12)
	add_child(box)

	var header := HBoxContainer.new()
	box.add_child(header)
	_skill_label = Label.new()
	_skill_label.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	header.add_child(_skill_label)
	_target_label = Label.new()
	header.add_child(_target_label)

	var dice_row := HBoxContainer.new()
	dice_row.add_theme_constant_override("separation", 12)
	box.add_child(dice_row)
	_dice_label = Label.new()
	_dice_label.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	dice_row.add_child(_dice_label)
	_total_label = Label.new()
	_total_label.custom_minimum_size.x = 40
	_total_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	dice_row.add_child(_total_label)

	var footer := HBoxContainer.new()
	footer.add_theme_constant_override("separation", 12)
	box.add_child(footer)
	_roll_button = Button.new()
	_roll_button.text = "ROLL"
	_roll_button.focus_mode = Control.FOCUS_NONE
	_roll_button.pressed.connect(_on_roll_pressed)
	footer.add_child(_roll_button)
	_outcome_label = Label.new()
	_outcome_label.visible = false
	_outcome_label.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	footer.add_child(_outcome_label)


func present(check: Dictionary) -> void:
	_check = check
	_outcome_token = ""
	_outcome_label.visible = false
	var skills := String(check["skill"]).split("/", false)
	var display_parts: Array[String] = []
	for skill in skills:
		display_parts.append(String(skill).capitalize().to_upper())
	_skill_label.text = "%s CHECK" % " / ".join(display_parts)
	_target_label.text = "TARGET %d" % int(check["target"])
	var modifier := StoryBridge.check_modifier(String(check["skill"]))
	var notation := String(check["dice"])
	_dice_label.text = notation + (" + %d" % modifier if modifier > 0 else "")
	_total_label.text = "—"
	_total_label.add_theme_color_override("font_color", ThemeService.color("cream"))
	_roll_button.disabled = false
	_roll_button.visible = true
	# Spin range from the notation (n dice of s sides, plus the modifier).
	var regex := RegEx.create_from_string("^(\\d+)d(\\d+)")
	var found := regex.search(notation)
	if found != null:
		var n := int(found.get_string(1))
		var s := int(found.get_string(2))
		_spin_min = n + modifier
		_spin_max = n * s + modifier
	_restyle()


func _on_roll_pressed() -> void:
	if StoryBridge.pending_check.is_empty():
		return
	_roll_button.disabled = true
	var preview := StoryBridge.roll_preview()
	var tween := create_tween()
	tween.tween_method(_spin_tick, 0.0, 1.0, SPIN_SECONDS)
	tween.tween_callback(_settle.bind(preview))


func _spin_tick(_progress: float) -> void:
	_total_label.text = str(randi_range(_spin_min, _spin_max))
	_total_label.add_theme_color_override("font_color", ThemeService.color("brass_glow"))


func _settle(preview: Dictionary) -> void:
	var total := int(preview["total"])
	var passed := total >= int(preview["target"])
	_total_label.text = str(total)
	_total_label.add_theme_color_override("font_color", ThemeService.color("cream"))
	_outcome_token = "composed" if passed else "rattled"
	_outcome_label.text = "PASSED" if passed else "FAILED"
	_outcome_label.visible = true
	_restyle()
	var tween := create_tween()
	tween.tween_interval(SETTLE_PAUSE)
	tween.tween_callback(func() -> void:
		if not StoryBridge.pending_check.is_empty():
			StoryBridge.resolve_check(total))


func _restyle() -> void:
	var style := StyleBoxFlat.new()
	style.bg_color = ThemeService.color("ink_2")
	if _outcome_token != "":
		var outcome_color := ThemeService.color(_outcome_token)
		outcome_color.a = 0.65
		style.border_color = outcome_color
	else:
		style.border_color = ThemeService.color("rule_strong")
	style.set_border_width_all(1)
	style.set_content_margin_all(16)
	add_theme_stylebox_override("panel", style)

	for label in [_skill_label, _target_label]:
		label.add_theme_font_override("font", _tracked(ThemeService.font("ui"), 2.0))
		label.add_theme_font_size_override("font_size", ThemeService.font_size("ui"))
	_skill_label.add_theme_color_override("font_color", ThemeService.color("brass"))
	_target_label.add_theme_color_override("font_color", ThemeService.color("cream_faint"))

	_dice_label.add_theme_font_override("font", _tracked(ThemeService.font("mono"), 1.5))
	_dice_label.add_theme_font_size_override("font_size", 13)
	_dice_label.add_theme_color_override("font_color", ThemeService.color("cream_soft"))

	_total_label.add_theme_font_override("font", ThemeService.font("mono"))
	_total_label.add_theme_font_size_override("font_size", 20)

	_outcome_label.add_theme_font_override("font", _tracked(ThemeService.font("ui"), 2.0))
	_outcome_label.add_theme_font_size_override("font_size", ThemeService.font_size("ui"))
	if _outcome_token != "":
		_outcome_label.add_theme_color_override("font_color", ThemeService.color(_outcome_token))

	var normal := StyleBoxFlat.new()
	normal.bg_color = ThemeService.color("ink_3")
	normal.border_color = ThemeService.color("brass_dim")
	normal.set_border_width_all(1)
	normal.content_margin_left = 14
	normal.content_margin_right = 14
	normal.content_margin_top = 8
	normal.content_margin_bottom = 8
	var hover := normal.duplicate()
	hover.bg_color = ThemeService.color("ink_4")
	hover.border_color = ThemeService.color("brass")
	for state in ["normal", "pressed", "focus", "disabled"]:
		_roll_button.add_theme_stylebox_override(state, normal)
	_roll_button.add_theme_stylebox_override("hover", hover)
	_roll_button.add_theme_font_override("font", _tracked(ThemeService.font("ui"), 2.0))
	_roll_button.add_theme_font_size_override("font_size", ThemeService.font_size("ui"))
	_roll_button.add_theme_color_override("font_color", ThemeService.color("brass"))
	_roll_button.add_theme_color_override("font_hover_color", ThemeService.color("cream"))
	_roll_button.add_theme_color_override("font_disabled_color", ThemeService.color("cream_faint"))


static func _tracked(base: Font, spacing_px: float) -> FontVariation:
	var variation := FontVariation.new()
	variation.base_font = base
	variation.spacing_glyph = int(spacing_px)
	return variation
