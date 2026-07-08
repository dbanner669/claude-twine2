extends Node
## Loads and validates godot/avatar/manifest.json — the single registry the
## avatar runtime consumes (AVATAR-MANIFEST.md). Art production and the panel
## both target this contract; neither chases the other.

const MANIFEST_PATH := "res://avatar/manifest.json"

var valid := false
var canvas := Vector2i(523, 1536)
var slots: Array = []
var explicit_slots: Array = []
var assets: Dictionary = {}
var base_look: Dictionary = {}
var outfits: Dictionary = {}
var expressions: Dictionary = {}
var phase_overrides: Dictionary = {}


func _ready() -> void:
	_load()


func _load() -> void:
	var file := FileAccess.open(MANIFEST_PATH, FileAccess.READ)
	if file == null:
		push_error("AvatarManifest: cannot open %s" % MANIFEST_PATH)
		return
	var parsed: Variant = JSON.parse_string(file.get_as_text())
	file.close()
	if not parsed is Dictionary:
		push_error("AvatarManifest: manifest is not a JSON object")
		return
	var data: Dictionary = parsed
	canvas = Vector2i(int(data["canvas"][0]), int(data["canvas"][1]))
	slots = data["slots"]
	explicit_slots = data.get("explicit_slots", [])
	assets = data.get("assets", {})
	base_look = data.get("base_look", {})
	outfits = data.get("outfits", {})
	expressions = data.get("expressions", {})
	phase_overrides = data.get("phase_overrides", {})
	valid = _validate()


func _validate() -> bool:
	var ok := true
	for asset_id: String in assets:
		var asset: Dictionary = assets[asset_id]
		if not slots.has(asset.get("slot", "")):
			push_error("AvatarManifest: asset '%s' names unknown slot '%s'" % [asset_id, asset.get("slot", "")])
			ok = false
		if not ResourceLoader.exists(String(asset.get("path", ""))):
			push_error("AvatarManifest: asset '%s' path missing: %s" % [asset_id, asset.get("path", "")])
			ok = false
	ok = _validate_group(base_look, "base_look") and ok
	for outfit_id: String in outfits:
		ok = _validate_group(outfits[outfit_id], "outfit '%s'" % outfit_id) and ok
	for expr_id: String in expressions:
		ok = _validate_group(expressions[expr_id], "expression '%s'" % expr_id) and ok
	for phase_id: String in phase_overrides:
		if not ResourceLoader.exists(String(phase_overrides[phase_id])):
			push_error("AvatarManifest: phase override '%s' path missing" % phase_id)
			ok = false
	return ok


## A group maps slot -> asset_id ("" = explicit clear). Every slot must exist,
## every non-empty asset must exist AND belong to that slot.
func _validate_group(group: Dictionary, label: String) -> bool:
	var ok := true
	for slot: String in group:
		if not slots.has(slot):
			push_error("AvatarManifest: %s names unknown slot '%s'" % [label, slot])
			ok = false
			continue
		var asset_id := String(group[slot])
		if asset_id == "":
			continue
		if not assets.has(asset_id):
			push_error("AvatarManifest: %s references unknown asset '%s'" % [label, asset_id])
			ok = false
		elif String((assets[asset_id] as Dictionary)["slot"]) != slot:
			push_error("AvatarManifest: %s puts asset '%s' in wrong slot '%s'" % [label, asset_id, slot])
			ok = false
	return ok


func has_asset(asset_id: String) -> bool:
	return assets.has(asset_id)


func asset_slot(asset_id: String) -> String:
	return String((assets.get(asset_id, {}) as Dictionary).get("slot", ""))


func asset_path(asset_id: String) -> String:
	return String((assets.get(asset_id, {}) as Dictionary).get("path", ""))


## Phase override image path, or "" when the id is unknown (panel falls back).
func phase_override_path(phase_id: String) -> String:
	return String(phase_overrides.get(phase_id, ""))


## Effective asset id for a slot given the player's slot-state dict:
## state value wins (including "" = cleared); absent = base look; else "".
func resolve_slot(slot: String, slot_state: Dictionary) -> String:
	if slot_state.has(slot):
		return String(slot_state[slot])
	return String(base_look.get(slot, ""))
