extends Node
## Disk persistence over StoryBridge.save_game()/load_game() (STATE-SCHEMA.md
## save format). Slots + an autosave written on every choice commit
## (knot_entered).
##
## Serialization is var_to_str/str_to_var, not JSON: Godot's JSON round-trip
## turns every int into a float, and the schema is int-heavy (dates, composure,
## skill levels). var_to_str preserves Variant types exactly; saves are local
## files, so JSON portability buys nothing here.

const SAVE_DIR := "user://saves"
const AUTOSAVE_NAME := "autosave"


func _ready() -> void:
	DirAccess.make_dir_recursive_absolute(SAVE_DIR)
	StoryBridge.knot_entered.connect(_on_knot_entered)


func _on_knot_entered(_knot: String, _tags: Dictionary) -> void:
	write_save(AUTOSAVE_NAME)


# --- Named saves --------------------------------------------------------------

func save_path(save_name: String) -> String:
	return "%s/%s.save" % [SAVE_DIR, save_name]


func write_save(save_name: String) -> bool:
	var save := StoryBridge.save_game()
	var file := FileAccess.open(save_path(save_name), FileAccess.WRITE)
	if file == null:
		push_error("SaveManager: cannot open '%s' for writing" % save_path(save_name))
		return false
	file.store_string(var_to_str(save))
	file.close()
	return true


## {} when the save is missing or unparseable.
func read_save(save_name: String) -> Dictionary:
	var path := save_path(save_name)
	if not FileAccess.file_exists(path):
		return {}
	var file := FileAccess.open(path, FileAccess.READ)
	if file == null:
		return {}
	var parsed: Variant = str_to_var(file.get_as_text())
	file.close()
	return parsed if parsed is Dictionary else {}


func load_save(save_name: String) -> bool:
	var save := read_save(save_name)
	if save.is_empty():
		push_error("SaveManager: no usable save '%s'" % save_name)
		return false
	return StoryBridge.load_game(save)


func delete_save(save_name: String) -> void:
	var path := save_path(save_name)
	if FileAccess.file_exists(path):
		DirAccess.remove_absolute(path)


# --- Numbered slots -------------------------------------------------------------

func save_slot(slot: int) -> bool:
	return write_save("slot_%d" % slot)


func load_slot(slot: int) -> bool:
	return load_save("slot_%d" % slot)


func delete_slot(slot: int) -> void:
	delete_save("slot_%d" % slot)


## Sorted slot numbers that have a save on disk.
func list_slots() -> Array[int]:
	var slots: Array[int] = []
	var dir := DirAccess.open(SAVE_DIR)
	if dir == null:
		return slots
	for file_name in dir.get_files():
		if file_name.begins_with("slot_") and file_name.ends_with(".save"):
			slots.append(int(file_name.trim_prefix("slot_").trim_suffix(".save")))
	slots.sort()
	return slots


func has_autosave() -> bool:
	return FileAccess.file_exists(save_path(AUTOSAVE_NAME))


func load_autosave() -> bool:
	return load_save(AUTOSAVE_NAME)
