class_name AtmosphereOverlay
extends ColorRect
## Full-stage atmosphere overlay — vignette + film grain via
## theme/atmosphere.gdshader (the layout.css body::before/::after rebuild;
## see PARITY-MATRIX.md). Mouse-transparent; sits above the shell chrome and
## below toasts/tooltip (insertion order in game_shell._build_ui).

const SHADER := preload("res://theme/atmosphere.gdshader")


func _init() -> void:
	mouse_filter = Control.MOUSE_FILTER_IGNORE
	var shader_material := ShaderMaterial.new()
	shader_material.shader = SHADER
	material = shader_material


func _ready() -> void:
	set_anchors_preset(Control.PRESET_FULL_RECT)
	ThemeService.mode_changed.connect(_on_mode_changed)
	_on_mode_changed(ThemeService.mode)


func _on_mode_changed(mode: String) -> void:
	(material as ShaderMaterial).set_shader_parameter("day", mode == "day")
