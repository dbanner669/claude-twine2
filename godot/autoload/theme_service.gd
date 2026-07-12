extends Node
## Day/night palette service — the events.js mode logic, native.
##
## Mode resolution per knot (sizzle/CLAUDE.md "Day/Night Mode" +
## INK-CONVENTIONS.md tags): `# mode: day` / `# mode: night` force the
## palette; absent, the mode derives from State.date().slot against the
## day-slot set (earlyMorning/morning/noon/afternoon = day). Night is the
## default before any story starts.
##
## Mode changes CROSS-FADE: color() lerps NIGHT->DAY by a tweened
## day_amount, and mode_changed re-emits every tween step — consumers are
## idempotent restylers, so the whole shell glides between palettes.
## instant_mode (tools/tests) jumps straight to the endpoint.
##
## UI scripts pull colors via color("name") and restyle on mode_changed.
## The shared Theme resource (fonts/sizes) lives at theme/sizzle_theme.tres.

signal mode_changed(mode: String)

const THEME_PATH := "res://theme/sizzle_theme.tres"
const FADE_SECONDS := 0.4

var mode: String = "night"
var theme: Theme
## Tools/tests: skip the cross-fade and restyle once at the endpoint.
var instant_mode := false

var _day_amount := 0.0  # 0 = night palette, 1 = day palette
var _fade_tween: Tween


func _ready() -> void:
	theme = load(THEME_PATH)
	StoryBridge.knot_entered.connect(_on_knot_entered)


## Palette color by reset.css token name (e.g. "brass", "ink_2", "rule").
## Mid-fade this is the blend of the two palettes.
func color(token: String) -> Color:
	if not SizzlePalette.NIGHT.has(token):
		push_error("ThemeService.color: unknown token '%s'" % token)
		return Color.MAGENTA
	if _day_amount <= 0.0:
		return SizzlePalette.NIGHT[token]
	if _day_amount >= 1.0:
		return SizzlePalette.DAY[token]
	return (SizzlePalette.NIGHT[token] as Color).lerp(SizzlePalette.DAY[token], _day_amount)


## Current day-ness 0..1 (mid-fade fractional) — atmosphere shader, sunbeam.
func day_amount() -> float:
	return _day_amount


## Font / font size accessors off the shared theme's "Sizzle" custom type.
func font(font_name: String) -> Font:
	return theme.get_font(font_name, "Sizzle")


func font_size(size_name: String) -> int:
	return theme.get_font_size(size_name, "Sizzle")


## Force a mode ("day"/"night"); emits only on change (then per fade step).
func set_mode(new_mode: String) -> void:
	if new_mode != "day" and new_mode != "night":
		push_error("ThemeService.set_mode: invalid mode '%s'" % new_mode)
		return
	if new_mode == mode:
		return
	mode = new_mode
	var target := 1.0 if mode == "day" else 0.0
	if _fade_tween != null and _fade_tween.is_valid():
		_fade_tween.kill()
	if instant_mode:
		_apply_day_amount(target)
		return
	_fade_tween = create_tween()
	_fade_tween.tween_method(_apply_day_amount, _day_amount, target, FADE_SECONDS)


func _apply_day_amount(value: float) -> void:
	_day_amount = value
	mode_changed.emit(mode)


## Mode a knot's tags resolve to, given current State (pure helper).
func resolve_mode(tags: Dictionary) -> String:
	if tags.has("mode"):
		return String(tags["mode"])
	var slot := String(State.date().get("slot", "morning"))
	return "day" if SizzlePalette.DAY_SLOTS.has(slot) else "night"


func _on_knot_entered(_knot: String, tags: Dictionary) -> void:
	set_mode(resolve_mode(tags))
