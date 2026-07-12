class_name AvatarPanel
extends Control
## Left avatar column (~430px, the CSS grid's avatar area): dotted-border
## frame, the Option 2 manifest-driven layer stack, and the bottom identity
## block — name / codename kicker / composure pips 0..7.
##
## Display precedence (Phase 4):
##   1. `# avatar:` phase override with a manifest phase_overrides entry
##      (full-frame image, hides the stack — the BLK day/night PNGs)
##   2. layer stack, when State avatar slot-state is in use (any key set)
##   3. greybox placeholder portrait (unknown phase ids land here too —
##      MAN/PALE/WDS art doesn't exist yet)

const PANEL_WIDTH := 430.0
const FRAME_PAD := 30.0  # --sz-avatar-pad

const PLACEHOLDER := "res://media/placeholder-suit.png"

const COMPOSURE_MAX := 7

var _bg: ColorRect
var _sunbeam: TextureRect
var _border_right: ColorRect
var _frame: Control
var _portrait: TextureRect
var _fade_rect: TextureRect
var _fade_tween: Tween
var _layer_holder: Control
var _layer_rects: Dictionary = {}  # slot -> TextureRect, manifest z-order
var _phase_id := ""
var _last_composure := -1
var _identity: PanelContainer
var _name_label: Label
var _kicker: Label
var _pip_label: Label
var _pips: Array[Panel] = []
var _pip_value: Label


func _ready() -> void:
	custom_minimum_size.x = PANEL_WIDTH
	_build()
	ThemeService.mode_changed.connect(_on_mode_changed)
	Rules.state_changed.connect(_on_state_changed)
	Settings.changed.connect(_on_settings_changed)
	set_phase("")
	restyle()
	refresh()


func _on_mode_changed(_mode: String) -> void:
	restyle()


func _on_state_changed(op: String) -> void:
	if op.begins_with("avatar_"):
		_render()
	refresh()


func _on_settings_changed(key: String) -> void:
	if key == "explicit_layers_visible":
		_render()


func _build() -> void:
	_bg = ColorRect.new()
	_bg.set_anchors_preset(Control.PRESET_FULL_RECT)
	add_child(_bg)

	# Day-mode sunbeam wash (layout.css #avatar::before): warm radial from
	# the upper frame, faded in/out with ThemeService.day_amount().
	_sunbeam = TextureRect.new()
	_sunbeam.set_anchors_preset(Control.PRESET_FULL_RECT)
	_sunbeam.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	_sunbeam.stretch_mode = TextureRect.STRETCH_SCALE
	_sunbeam.mouse_filter = Control.MOUSE_FILTER_IGNORE
	var beam_gradient := Gradient.new()
	beam_gradient.set_color(0, Color(1.0, 0.894, 0.667, 0.30))
	beam_gradient.set_color(1, Color(1.0, 0.894, 0.667, 0.0))
	var beam_texture := GradientTexture2D.new()
	beam_texture.gradient = beam_gradient
	beam_texture.fill = GradientTexture2D.FILL_RADIAL
	beam_texture.fill_from = Vector2(0.5, 0.3)
	beam_texture.fill_to = Vector2(0.5, 0.85)
	_sunbeam.texture = beam_texture
	_sunbeam.modulate.a = 0.0
	add_child(_sunbeam)

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

	# Layer stack: one TextureRect per manifest slot, manifest order = z-order.
	# All layers share the canonical 523x1536 canvas, so identical
	# keep-aspect-centered rects stay in registration at any panel size.
	_layer_holder = Control.new()
	_layer_holder.set_anchors_preset(Control.PRESET_FULL_RECT)
	portrait_margin.add_child(_layer_holder)
	for slot: String in AvatarManifest.slots:
		var rect := TextureRect.new()
		rect.set_anchors_preset(Control.PRESET_FULL_RECT)
		rect.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
		rect.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
		_layer_holder.add_child(rect)
		_layer_rects[slot] = rect

	# Full-frame override / greybox placeholder portrait, above the stack.
	_portrait = TextureRect.new()
	_portrait.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	_portrait.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	portrait_margin.add_child(_portrait)

	# Cross-fade layer: holds the OUTGOING portrait while it fades.
	_fade_rect = TextureRect.new()
	_fade_rect.set_anchors_preset(Control.PRESET_FULL_RECT)
	_fade_rect.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	_fade_rect.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	_fade_rect.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_fade_rect.visible = false
	portrait_margin.add_child(_fade_rect)

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


## `# avatar:` phase id ("" = no override). Precedence per the class doc.
func set_phase(avatar_id: String) -> void:
	_phase_id = avatar_id
	_render()


## Recompute what the frame shows: override image, layer stack, or placeholder.
func _render() -> void:
	var previous: Texture2D = _portrait.texture if _portrait.visible else null
	var override_path := AvatarManifest.phase_override_path(_phase_id)
	if _phase_id != "" and override_path != "":
		_portrait.texture = load(override_path)
		_portrait.visible = true
		_layer_holder.visible = false
		if _portrait.texture != previous:
			_crossfade_from(previous)
		return

	var slot_state: Dictionary = State.data.get("avatar", {})
	if _phase_id == "" and not slot_state.is_empty():
		_layer_holder.visible = true
		_portrait.visible = false
		var show_explicit := Settings.explicit_layers_visible()
		for slot: String in _layer_rects:
			var rect: TextureRect = _layer_rects[slot]
			if AvatarManifest.explicit_slots.has(slot) and not show_explicit:
				rect.texture = null
				continue
			var asset_id := AvatarManifest.resolve_slot(slot, slot_state)
			rect.texture = load(AvatarManifest.asset_path(asset_id)) if asset_id != "" else null
		_crossfade_from(previous)
		return

	# Greybox default and unknown phase ids (man_*/pale_*/wds_* until art lands).
	_portrait.texture = load(PLACEHOLDER)
	_portrait.visible = true
	_layer_holder.visible = false
	if _portrait.texture != previous:
		_crossfade_from(previous)


## Fades the outgoing portrait out over whatever replaced it.
func _crossfade_from(old_texture: Texture2D) -> void:
	if old_texture == null or not Settings.animations_enabled():
		return
	_fade_rect.texture = old_texture
	_fade_rect.visible = true
	_fade_rect.modulate.a = 1.0
	if _fade_tween != null and _fade_tween.is_valid():
		_fade_tween.kill()
	_fade_tween = create_tween()
	_fade_tween.tween_property(_fade_rect, "modulate:a", 0.0, 0.35)
	_fade_tween.tween_callback(_hide_fade_rect)


func _hide_fade_rect() -> void:
	_fade_rect.visible = false


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
	# Pulse the pips that changed so composure movement is legible.
	if _last_composure >= 0 and current != _last_composure and Settings.animations_enabled():
		for i in range(mini(current, _last_composure), maxi(current, _last_composure)):
			if i < _pips.size():
				_pulse_pip(_pips[i])
	_last_composure = current


func restyle() -> void:
	_bg.color = ThemeService.color("ink")
	_border_right.color = ThemeService.color("rule")
	# Tracks the day/night cross-fade (mode_changed re-emits per step).
	_sunbeam.modulate.a = ThemeService.day_amount()

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


func _pulse_pip(pip: Panel) -> void:
	pip.modulate = Color(1.7, 1.55, 1.2)
	pip.create_tween().tween_property(pip, "modulate", Color.WHITE, 0.6)


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
