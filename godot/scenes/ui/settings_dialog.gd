class_name SettingsDialog
extends AcceptDialog
## Settings dialog — the header "SETTINGS" button's target. Exposes the
## per-install options from the Settings autoload: prose text speed
## (slow/normal/fast/instant) and the explicit avatar layers toggle
## (AVATAR-MANIFEST.md sign-off #2).

const SPEED_ORDER := ["slow", "normal", "fast", "instant"]

var _wrapper: MarginContainer
var _speed_buttons := {}


func _init() -> void:
	title = "Settings"
	ok_button_text = "Close"
	unresizable = false
	min_size = Vector2i(520, 220)


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

	var content := VBoxContainer.new()
	content.add_theme_constant_override("separation", 18)
	_wrapper.add_child(content)

	# --- Text speed -------------------------------------------------------
	content.add_child(_make_row_label("TEXT SPEED"))
	var speed_row := HBoxContainer.new()
	speed_row.add_theme_constant_override("separation", 8)
	content.add_child(speed_row)
	_speed_buttons.clear()
	for speed: String in SPEED_ORDER:
		var button := Button.new()
		button.text = speed.to_upper()
		button.focus_mode = Control.FOCUS_NONE
		button.pressed.connect(_on_speed_pressed.bind(speed))
		speed_row.add_child(button)
		_speed_buttons[speed] = button
	_refresh_speed_buttons()

	# --- Explicit avatar layers -------------------------------------------
	content.add_child(_make_row_label("AVATAR"))
	var explicit := CheckButton.new()
	explicit.text = "Explicit layers visible"
	explicit.button_pressed = Settings.explicit_layers_visible()
	explicit.focus_mode = Control.FOCUS_NONE
	explicit.add_theme_font_override("font", ThemeService.font("body"))
	explicit.add_theme_font_size_override("font_size", ThemeService.font_size("base"))
	explicit.add_theme_color_override("font_color", ThemeService.color("cream"))
	explicit.toggled.connect(_on_explicit_toggled)
	content.add_child(explicit)


func _make_row_label(text: String) -> Label:
	var label := Label.new()
	label.text = text
	var variation := FontVariation.new()
	variation.base_font = ThemeService.font("ui_medium")
	variation.spacing_glyph = 2
	label.add_theme_font_override("font", variation)
	label.add_theme_font_size_override("font_size", ThemeService.font_size("ui"))
	label.add_theme_color_override("font_color", ThemeService.color("brass"))
	return label


func _refresh_speed_buttons() -> void:
	var current := Settings.text_speed()
	for speed: String in _speed_buttons:
		var button: Button = _speed_buttons[speed]
		var selected: bool = speed == current
		var style := StyleBoxFlat.new()
		style.bg_color = ThemeService.color("ink_4" if selected else "ink_3")
		style.border_color = ThemeService.color("brass" if selected else "rule")
		style.set_border_width_all(1)
		style.content_margin_left = 14
		style.content_margin_right = 14
		style.content_margin_top = 6
		style.content_margin_bottom = 6
		for state in ["normal", "hover", "pressed", "focus"]:
			button.add_theme_stylebox_override(state, style)
		button.add_theme_color_override("font_color",
			ThemeService.color("brass_glow" if selected else "brass_dim"))
		button.add_theme_color_override("font_hover_color", ThemeService.color("cream"))


func _on_speed_pressed(speed: String) -> void:
	Settings.set_text_speed(speed)
	_refresh_speed_buttons()


func _on_explicit_toggled(pressed: bool) -> void:
	Settings.set_explicit_layers_visible(pressed)
