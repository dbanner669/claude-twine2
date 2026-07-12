extends Node
## Per-install settings (NOT game state — lives outside saves).
## AVATAR-MANIFEST.md sign-off #2: explicit_layers_visible exists from day one.

signal changed(key: String)

const PATH := "user://settings.cfg"
const SECTION := "sizzle"

## Prose reveal pace, characters/second; 0 = instant (no reveal animation).
const TEXT_SPEEDS := {
	"slow": 30.0,
	"normal": 60.0,
	"fast": 120.0,
	"instant": 0.0,
}

## Session-only override for tools (screenshot runner, tests) — bypasses the
## persisted value WITHOUT writing the user's settings file.
var text_speed_override := ""

## Session-only kill switch for cosmetic animation (staggered fades, hover
## glides, drifts) — tools set this for deterministic frames. Not persisted,
## not player-facing.
var animations_override_disabled := false


func animations_enabled() -> bool:
	return not animations_override_disabled

var _config := ConfigFile.new()


func _ready() -> void:
	_config.load(PATH)  # missing file is fine — defaults apply


func explicit_layers_visible() -> bool:
	return bool(_config.get_value(SECTION, "explicit_layers_visible", false))


func set_explicit_layers_visible(value: bool) -> void:
	_config.set_value(SECTION, "explicit_layers_visible", value)
	_config.save(PATH)
	changed.emit("explicit_layers_visible")


func text_speed() -> String:
	if TEXT_SPEEDS.has(text_speed_override):
		return text_speed_override
	var value := String(_config.get_value(SECTION, "text_speed", "normal"))
	return value if TEXT_SPEEDS.has(value) else "normal"


func text_speed_cps() -> float:
	return float(TEXT_SPEEDS[text_speed()])


func set_text_speed(value: String) -> void:
	if not TEXT_SPEEDS.has(value):
		push_error("Settings.set_text_speed: unknown speed '%s'" % value)
		return
	_config.set_value(SECTION, "text_speed", value)
	_config.save(PATH)
	changed.emit("text_speed")
