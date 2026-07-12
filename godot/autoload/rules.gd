extends Node
## The command surface — the ONLY mutation path into State
## (sizzle/docs/godot/STATE-SCHEMA.md). Semantics ported from
## sizzle/src/scripts/macros.js:
##   - set_time / set_date never reset composure
##   - advance_time / advance_days reset current composure to baseline
##     when (and only when) the calendar day actually advances
##   - laterNight rolls over into the next day's earlyMorning
##   - composure clamps to 0..7

signal state_changed(op: String)
signal toast_requested(kind: String, text: String)
signal suspicion_band_changed(old_band: String, new_band: String)

const COMPOSURE_MIN := 0
const COMPOSURE_MAX := 7
const SUSPICION_MIN := 0
const SUSPICION_MAX := 10
const REPUTATION_MIN := 0
const REPUTATION_MAX := 10
const ACCESS_MIN := 0
const ACCESS_MAX := 3

const TIME_SLOTS := [
	"earlyMorning", "morning", "noon", "afternoon",
	"evening", "night", "laterNight",
]

const DAY_LABELS := [
	"Sunday", "Monday", "Tuesday", "Wednesday",
	"Thursday", "Friday", "Saturday",
]


# --- Time ops ---------------------------------------------------------------

func set_time(slot: String) -> void:
	if not _is_slot(slot):
		push_error("set_time: invalid slot '%s'" % slot)
		return
	State.date()["slot"] = slot
	state_changed.emit("set_time")


func set_date(year: int, month: int, day: int, slot: String) -> void:
	if not _is_slot(slot):
		push_error("set_date: invalid slot '%s'" % slot)
		return
	# Explicit scene-entry date changes do NOT reset composure (macros.js).
	var date := State.date()
	date["year"] = year
	date["month"] = month
	date["day"] = day
	date["slot"] = slot
	state_changed.emit("set_date")


func advance_time(count: int = 1) -> void:
	if count < 0:
		push_error("advance_time: count must be non-negative")
		return
	var date := State.date()
	var index := TIME_SLOTS.find(date["slot"])
	if index == -1:
		push_error("advance_time: current slot is invalid: %s" % date["slot"])
		return
	var total := index + count
	@warning_ignore("integer_division")
	var days := total / TIME_SLOTS.size()
	date["slot"] = TIME_SLOTS[total % TIME_SLOTS.size()]
	if days > 0:
		_shift_calendar_days(days)
		_reset_current_to_baseline()
	state_changed.emit("advance_time")


func advance_days(count: int, slot: String) -> void:
	if count < 0:
		push_error("advance_days: count must be non-negative")
		return
	if not _is_slot(slot):
		push_error("advance_days: invalid slot '%s'" % slot)
		return
	if count > 0:
		_shift_calendar_days(count)
		_reset_current_to_baseline()
	State.date()["slot"] = slot
	state_changed.emit("advance_days")


## day_of_week is derived, never stored (STATE-SCHEMA.md).
func day_of_week() -> String:
	var date := State.date()
	return day_of_week_for(int(date["year"]), int(date["month"]), int(date["day"]))


static func day_of_week_for(year: int, month: int, day: int) -> String:
	var unix := Time.get_unix_time_from_datetime_dict({
		"year": year, "month": month, "day": day,
		"hour": 12, "minute": 0, "second": 0,
	})
	var weekday: int = Time.get_datetime_dict_from_unix_time(unix)["weekday"]
	return DAY_LABELS[weekday]


# --- Composure ops ----------------------------------------------------------

func reset_composure() -> void:
	_reset_current_to_baseline()
	state_changed.emit("reset_composure")


func set_composure(value: int) -> void:
	State.player()["current_composure"] = _clamp_composure(value)
	state_changed.emit("set_composure")


func adjust_composure(delta: int) -> void:
	var player := State.player()
	player["current_composure"] = _clamp_composure(int(player["current_composure"]) + delta)
	state_changed.emit("adjust_composure")


# --- Skills / tags / influence ----------------------------------------------

func grant_skill(skill_name: String, delta: int) -> void:
	var skills: Dictionary = State.player()["skills"]
	if not skills.has(skill_name):
		push_error("grant_skill: unknown skill '%s'" % skill_name)
		return
	skills[skill_name]["level"] = int(skills[skill_name]["level"]) + delta
	state_changed.emit("grant_skill")


func add_tag(tag: String) -> void:
	_append_if_absent(State.player()["story_tags"], tag)
	state_changed.emit("add_tag")


func add_kink(kink: String) -> void:
	_append_if_absent(State.player()["kinks"], kink)
	state_changed.emit("add_kink")


func add_quirk(quirk: String) -> void:
	_append_if_absent(State.player()["quirks"], quirk)
	state_changed.emit("add_quirk")


func adjust_influence(delta: int) -> void:
	# nyse.influence: goes up and down by ops only; no natural decay, ever.
	State.data["nyse"]["influence"] = int(State.data["nyse"]["influence"]) + delta
	state_changed.emit("adjust_influence")


# --- Sizzle ops ----------------------------------------------------------------

func sizzle_suspicion(delta: int) -> void:
	var sizzle: Dictionary = State.data["sizzle"]
	var current := int(sizzle["suspicion"])
	var updated := clampi(current + delta, SUSPICION_MIN, SUSPICION_MAX)
	if updated == current:
		return
	var old_band := _suspicion_band_for(current)
	var new_band := _suspicion_band_for(updated)
	sizzle["suspicion"] = updated
	if old_band != new_band:
		suspicion_band_changed.emit(old_band, new_band)
	toast_requested.emit(
		"warn" if updated > current else "info",
		"You're drawing attention." if updated > current else "Attention drifts elsewhere."
	)
	state_changed.emit("sizzle_suspicion")


func sizzle_reputation(delta: int) -> void:
	var sizzle: Dictionary = State.data["sizzle"]
	var current := int(sizzle["reputation"])
	var updated := clampi(current + delta, REPUTATION_MIN, REPUTATION_MAX)
	if updated == current:
		return
	sizzle["reputation"] = updated
	state_changed.emit("sizzle_reputation")


func sizzle_access(level: int) -> void:
	var sizzle: Dictionary = State.data["sizzle"]
	var current := int(sizzle["access_level"])
	var updated := maxi(current, clampi(level, ACCESS_MIN, ACCESS_MAX))
	if updated == current:
		return
	sizzle["access_level"] = updated
	state_changed.emit("sizzle_access")


func sizzle_reset() -> void:
	var sizzle: Dictionary = State.data["sizzle"]
	var old_band := _suspicion_band_for(int(sizzle["suspicion"]))
	var changed := false
	if int(sizzle["suspicion"]) != 0:
		sizzle["suspicion"] = 0
		changed = true
	if int(sizzle["reputation"]) != 0:
		sizzle["reputation"] = 0
		changed = true
	if int(sizzle["access_level"]) != 0:
		sizzle["access_level"] = 0
		changed = true
	if not changed:
		return
	var new_band := _suspicion_band_for(int(sizzle["suspicion"]))
	if old_band != new_band:
		suspicion_band_changed.emit(old_band, new_band)
	state_changed.emit("sizzle_reset")


func suspicion_band() -> String:
	return _suspicion_band_for(int(State.data["sizzle"]["suspicion"]))


# --- Avatar ops (AVATAR-MANIFEST.md runtime API) ------------------------------

func avatar_set_slot(slot: String, asset_id: String) -> void:
	if not AvatarManifest.slots.has(slot):
		push_error("avatar_set_slot: unknown slot '%s'" % slot)
		return
	if asset_id != "" and not AvatarManifest.has_asset(asset_id):
		push_error("avatar_set_slot: unknown asset '%s'" % asset_id)
		return
	if asset_id != "" and AvatarManifest.asset_slot(asset_id) != slot:
		push_error("avatar_set_slot: asset '%s' belongs to slot '%s', not '%s'" % [
			asset_id, AvatarManifest.asset_slot(asset_id), slot])
		return
	State.data["avatar"][slot] = asset_id
	state_changed.emit("avatar_set_slot")


func avatar_apply_outfit(outfit_id: String) -> void:
	if not AvatarManifest.outfits.has(outfit_id):
		push_error("avatar_apply_outfit: unknown outfit '%s'" % outfit_id)
		return
	var outfit: Dictionary = AvatarManifest.outfits[outfit_id]
	for slot: String in outfit:
		State.data["avatar"][slot] = String(outfit[slot])
	state_changed.emit("avatar_apply_outfit")


func avatar_set_expression(expression_id: String) -> void:
	if not AvatarManifest.expressions.has(expression_id):
		push_error("avatar_set_expression: unknown expression '%s'" % expression_id)
		return
	var expression: Dictionary = AvatarManifest.expressions[expression_id]
	for slot: String in expression:
		State.data["avatar"][slot] = String(expression[slot])
	state_changed.emit("avatar_set_expression")


## Back to the pure manifest base look.
func avatar_clear() -> void:
	(State.data["avatar"] as Dictionary).clear()
	state_changed.emit("avatar_clear")


# --- Character creation (Phase 5) --------------------------------------------
## Native port of sizzle/src/content/character-creator.twee derived-state logic.
## Data (backgrounds, bonuses, tags, name lists) lives in content/data/cc.json.
##
## Ordering contract (the twee's CC-500 -> CC-400 rebuild relocation):
##   cc_rebuild_derived runs when an incident is confirmed at CC-400 —
##   UPSTREAM of the inciting-incident flashback. It resets skills and
##   background-derived story tags FROM SCRATCH (idempotent; revisits never
##   stack) and is NEVER called again after the flashback, so flashback
##   grant_skill() grants stay durable through the CC-500 summary.
##   cc_finalize runs at CC-500 sign-off — AFTER the flashback — copying the
##   composure skill level (including any flashback composure grant) into
##   durable baseline_composure, with current_composure starting at baseline.

const CC_DATA_PATH := "res://content/data/cc.json"

var _cc_data: Dictionary = {}


## Parsed cc.json (lazy-loaded, cached).
func cc_data() -> Dictionary:
	if _cc_data.is_empty():
		var file := FileAccess.open(CC_DATA_PATH, FileAccess.READ)
		if file == null:
			push_error("Rules.cc_data: cannot read %s" % CC_DATA_PATH)
			return {}
		var parsed: Variant = JSON.parse_string(file.get_as_text())
		file.close()
		if not (parsed is Dictionary):
			push_error("Rules.cc_data: %s is not a JSON object" % CC_DATA_PATH)
			return {}
		_cc_data = parsed
	return _cc_data


## Background entry by id ("" -> {}).
func cc_background(background_id: String) -> Dictionary:
	for background: Dictionary in cc_data().get("backgrounds", []):
		if String(background["id"]) == background_id:
			return background
	return {}


## Incident entry by id ("" -> {}).
func cc_incident(incident_id: String) -> Dictionary:
	for incident: Dictionary in cc_data().get("incidents", []):
		if String(incident["id"]) == incident_id:
			return incident
	return {}


## CC-100: set the player's identity. Empty arguments leave the current
## value untouched (the twee textboxes always carry a value; codename is
## auto-assigned at CC-500 when still empty).
func cc_apply_identity(first_name: String, surname: String, codename: String) -> void:
	var player := State.player()
	if first_name.strip_edges() != "":
		player["first_name"] = first_name.strip_edges()
	if surname.strip_edges() != "":
		player["surname"] = surname.strip_edges()
	if codename.strip_edges() != "":
		player["codename"] = codename.strip_edges()
	state_changed.emit("cc_apply_identity")


## CC-400-top rebuild (see ordering contract above). Reset-then-derive:
##   1. all skills to {level 0, xp 0, specialities []}
##   2. background-derived story tags removed
##   3. the chosen background's bonuses + tags applied from scratch
##   4. Branch training (+1 agent, +1 composure)
## Calling twice equals calling once.
func cc_rebuild_derived(background_id: String) -> void:
	var background := cc_background(background_id)
	if background.is_empty():
		push_error("cc_rebuild_derived: unknown background '%s'" % background_id)
		return
	var data := cc_data()
	var player := State.player()
	var skills: Dictionary = player["skills"]
	for skill_name: String in State.SKILL_NAMES:
		skills[skill_name] = {"level": 0, "xp": 0, "specialities": []}
	var story_tags: Array = player["story_tags"]
	for tag: String in data.get("background_story_tags", []):
		story_tags.erase(tag)
	var bonuses: Dictionary = background["bonuses"]
	for skill_name: String in bonuses:
		skills[skill_name]["level"] = int(skills[skill_name]["level"]) + int(bonuses[skill_name])
	for tag: String in background["story_tags"]:
		_append_if_absent(story_tags, tag)
	var training: Dictionary = data.get("branch_training", {})
	for skill_name: String in training:
		skills[skill_name]["level"] = int(skills[skill_name]["level"]) + int(training[skill_name])
	player["background"] = background_id
	state_changed.emit("cc_rebuild_derived")


## CC-500 finalization (twee timing: after the flashback, so an incident
## composure grant flows into the durable baseline). No clamp — matches the
## twee's plain copy; values here cannot exceed the 0..7 range anyway.
func cc_finalize() -> void:
	var player := State.player()
	player["baseline_composure"] = int(player["skills"]["composure"]["level"])
	player["current_composure"] = int(player["baseline_composure"])
	state_changed.emit("cc_finalize")


# --- Presentation ops -------------------------------------------------------

func set_header(location: String, time_label: String) -> void:
	var header := State.header()
	header["location"] = location
	header["time"] = time_label
	state_changed.emit("set_header")


func set_header_full(location: String, time_label: String, status: String, weather: String) -> void:
	var header := State.header()
	header["location"] = location
	header["time"] = time_label
	header["status"] = status
	header["weather"] = weather
	state_changed.emit("set_header")


func toast(kind: String, text: String) -> void:
	toast_requested.emit(kind, text)


# --- Internals ---------------------------------------------------------------

func _is_slot(slot: String) -> bool:
	return TIME_SLOTS.has(slot)


func _clamp_composure(value: int) -> int:
	return clampi(value, COMPOSURE_MIN, COMPOSURE_MAX)


func _reset_current_to_baseline() -> void:
	var player := State.player()
	player["current_composure"] = _clamp_composure(int(player["baseline_composure"]))


func _shift_calendar_days(count: int) -> void:
	var date := State.date()
	var unix := Time.get_unix_time_from_datetime_dict({
		"year": int(date["year"]), "month": int(date["month"]), "day": int(date["day"]),
		"hour": 12, "minute": 0, "second": 0,
	})
	unix += count * 86400
	var shifted := Time.get_datetime_dict_from_unix_time(unix)
	date["year"] = shifted["year"]
	date["month"] = shifted["month"]
	date["day"] = shifted["day"]


func _append_if_absent(list: Array, value: String) -> void:
	if not list.has(value):
		list.append(value)


func _suspicion_band_for(value: int) -> String:
	if value <= 2:
		return "unremarked"
	if value <= 5:
		return "noticed"
	if value <= 8:
		return "watched"
	return "burned"
