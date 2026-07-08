extends Node
## Day/night palette service — the events.js mode logic, native.
##
## Mode resolution per knot (sizzle/CLAUDE.md "Day/Night Mode" +
## INK-CONVENTIONS.md tags): `# mode: day` / `# mode: night` force the
## palette; absent, the mode derives from State.date().slot against the
## day-slot set (earlyMorning/morning/noon/afternoon = day). Night is the
## default before any story starts.
##
## UI scripts pull colors via color("name") and restyle on mode_changed.
## The shared Theme resource (fonts/sizes) lives at theme/sizzle_theme.tres.

signal mode_changed(mode: String)

const THEME_PATH := "res://theme/sizzle_theme.tres"

var mode: String = "night"
var theme: Theme


func _ready() -> void:
	theme = load(THEME_PATH)
	StoryBridge.knot_entered.connect(_on_knot_entered)


## Palette color by reset.css token name (e.g. "brass", "ink_2", "rule").
func color(token: String) -> Color:
	var palette := SizzlePalette.get_palette(mode)
	if not palette.has(token):
		push_error("ThemeService.color: unknown token '%s'" % token)
		return Color.MAGENTA
	return palette[token]


## Font / font size accessors off the shared theme's "Sizzle" custom type.
func font(font_name: String) -> Font:
	return theme.get_font(font_name, "Sizzle")


func font_size(size_name: String) -> int:
	return theme.get_font_size(size_name, "Sizzle")


## Force a mode ("day"/"night"); emits only on change.
func set_mode(new_mode: String) -> void:
	if new_mode != "day" and new_mode != "night":
		push_error("ThemeService.set_mode: invalid mode '%s'" % new_mode)
		return
	if new_mode == mode:
		return
	mode = new_mode
	mode_changed.emit(mode)


## Mode a knot's tags resolve to, given current State (pure helper).
func resolve_mode(tags: Dictionary) -> String:
	if tags.has("mode"):
		return String(tags["mode"])
	var slot := String(State.date().get("slot", "morning"))
	return "day" if SizzlePalette.DAY_SLOTS.has(slot) else "night"


func _on_knot_entered(_knot: String, tags: Dictionary) -> void:
	set_mode(resolve_mode(tags))
