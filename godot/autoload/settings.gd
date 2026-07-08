extends Node
## Per-install settings (NOT game state — lives outside saves).
## AVATAR-MANIFEST.md sign-off #2: explicit_layers_visible exists from day one.

signal changed(key: String)

const PATH := "user://settings.cfg"
const SECTION := "sizzle"

var _config := ConfigFile.new()


func _ready() -> void:
	_config.load(PATH)  # missing file is fine — defaults apply


func explicit_layers_visible() -> bool:
	return bool(_config.get_value(SECTION, "explicit_layers_visible", false))


func set_explicit_layers_visible(value: bool) -> void:
	_config.set_value(SECTION, "explicit_layers_visible", value)
	_config.save(PATH)
	changed.emit("explicit_layers_visible")
