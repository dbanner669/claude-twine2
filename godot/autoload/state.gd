extends Node
## Canonical game state (sizzle/docs/godot/STATE-SCHEMA.md, schema_version 1)
## plus the choice-commit snapshot history.
##
## Ownership model: this autoload owns the one canonical dictionary. All
## mutations go through the Rules command surface; ink only ever sees
## mirrored projections pushed by StoryBridge.
##
## History atom = choice commit: a frame is snapshotted immediately BEFORE
## the Continue() that surfaces a knot's entry line (`# id:` tag), so
## restoring a frame re-runs the knot's entry ops deterministically and
## un-fires every mutation that belonged to the frame above it.

const SCHEMA_VERSION := 1

const SKILL_NAMES := [
	"academic", "agent", "athlete", "confrontation",
	"charmer", "streetwise", "composure", "sexology",
]

## The canonical tree.
var data: Dictionary = default_state()

## Choice-commit history. Each frame:
## { "knot": String, "engine_snapshot": Dictionary, "ink_snapshot": String }
var history: Array = []


static func default_state() -> Dictionary:
	var skills := {}
	for skill_name: String in SKILL_NAMES:
		skills[skill_name] = {"level": 0, "xp": 0, "specialities": []}
	return {
		"schema_version": SCHEMA_VERSION,
		"player": {
			"age": 27,
			"first_name": "Alex",
			"surname": "Morgan",
			"background": "grad student",
			"nationality": "Canadian",
			"complexion": "medium",
			"inciting_incident": "",
			"codename": "",
			"cover": {"firstname": "", "known_as": "", "surname": ""},
			"arousal": 0,
			"baseline_composure": 2,
			"current_composure": 2,
			"skills": skills,
			"kinks": [],
			"quirks": [],
			"story_tags": [],
			"status_effects": [],
			"achievements": [],
			"personal_bio": [],
			"is_wearing": [],
			"piercings": [],
			"tattoos": [],
			# Greybox-locked appearance (consumed by the avatar manifest).
			"hair_colour": "brown",
			"hair_style": "long straight",
			"eye_colour": "blue",
			"eye_shape": "",
			"face_shape": "",
			"nose_shape": "",
			"mouth_shape": "",
		},
		"sizzle": {"suspicion": 0, "access_level": 0, "reputation": 0},
		"nyse": {"influence": 0, "power": 0},
		# day_of_week is DERIVED (Rules.day_of_week()), never stored.
		"date": {"year": 2005, "month": 9, "day": 12, "slot": "morning"},
		"header": {"location": "", "time": "", "status": "", "weather": ""},
	}


func reset() -> void:
	data = default_state()
	history.clear()


# --- Named accessors -------------------------------------------------------

func player() -> Dictionary:
	return data["player"]


func date() -> Dictionary:
	return data["date"]


func header() -> Dictionary:
	return data["header"]


func skill_level(skill_name: String) -> int:
	var skills: Dictionary = data["player"]["skills"]
	if not skills.has(skill_name):
		push_error("Unknown skill: %s" % skill_name)
		return 0
	return int(skills[skill_name]["level"])


# --- Choice-commit history --------------------------------------------------

## Commit a frame. Snapshots are the state captured just BEFORE the knot's
## entry line was continued (see StoryBridge._continue_flow).
func push_frame(knot: String, engine_snapshot: Dictionary, ink_snapshot: String) -> void:
	history.append({
		"knot": knot,
		"engine_snapshot": engine_snapshot,
		"ink_snapshot": ink_snapshot,
	})


func current_frame() -> Dictionary:
	return history.back() if not history.is_empty() else {}


func can_go_back() -> bool:
	return history.size() >= 2


func restore_engine(frame: Dictionary) -> void:
	data = (frame["engine_snapshot"] as Dictionary).duplicate(true)
