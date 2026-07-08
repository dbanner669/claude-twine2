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

const COMPOSURE_MIN := 0
const COMPOSURE_MAX := 7

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
