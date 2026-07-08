extends Node
## Bridge between the godot-ink runtime (C#) and the GDScript engine layer.
##
## Responsibilities (STATE-SCHEMA.md / INK-CONVENTIONS.md):
##   - load the compiled ink story and bind the external command/query surface
##   - push the mirror set into ink variables after every op, on load,
##     and on every restore
##   - drive continuation line-by-line, reading knot tags (`# id:`,
##     `# check:`, `# scene:`, presentation tags)
##   - pause at `# check:` knots, run the engine-side roll, write
##     check_passed / check_total into ink, resume
##   - commit choice-commit frames on knot entry; back/load = frame restore
##
## Snapshot timing: engine + ink state are captured immediately BEFORE the
## Continue() call that surfaces a knot's `# id:` line. Restoring a frame
## therefore re-runs the knot's entry ops (set_header / set_date / grants at
## knot top) against the restored state — deterministic, and everything the
## frame above mutated is un-fired, including one-shot grants.

signal text_appended(line: String)
signal knot_entered(knot: String, tags: Dictionary)
signal choices_ready(choices: Array)
signal check_ready(check: Dictionary)
signal scene_stub(scene_kind: String, extract_id: String)
signal flow_reset(knot: String)
signal flow_ended
signal handoff_reached(knot: String)

## Native-handoff knots: reaching one sets player.inciting_incident engine-side
## (ink has no write op for a mirrored variable — Phase 1 report follow-up #2).
## Strings match the frozen twee exactly. intro_end is deliberately absent.
const HANDOFF_INCIDENTS := {
	"blk_end": "the Toronto Blackout",
	"man_end": "the Dark of Manitoulin",
	"pale_end": "the Woman with the Pale Eyes",
	"wds_end": "Wet Dog Smell",
}

var story = null  # GodotInk.InkStory (C#); duck-typed from GDScript.
var story_path: String = ""

## {skill: String, dice: String, target: int} while a roll is pending; {} otherwise.
var pending_check: Dictionary = {}
## [{index: int, text: String}, ...] at a choice point; [] otherwise.
var current_choices: Array = []
## Result of the most recent resolved check (for UI/tests).
var last_check_result: Dictionary = {}
## Most recent `# scene:` stub info (for UI/tests).
var last_stub: Dictionary = {}
## Accumulated visible text since the last flow_reset (for tests).
var transcript: String = ""
## True once the story hits END.
var ended: bool = false

## Instance ids of InkStory resources whose externals are already bound.
## load() returns cached resources for repeat paths, so a per-instance record
## is the only safe way to avoid double-binding (godot-ink throws on rebind).
var _bound_story_ids := {}
var _rng := RandomNumberGenerator.new()


func _ready() -> void:
	_rng.randomize()
	Rules.state_changed.connect(_on_state_changed)


## Load the story, reset all state, and enter start_knot.
func start(path: String, start_knot: String) -> void:
	if story == null or story_path != path:
		story = load(path)
		story_path = path
	if story == null:
		push_error("StoryBridge.start: failed to load %s" % path)
		return
	story.ResetState()
	if not _bound_story_ids.has(story.get_instance_id()):
		_bind_externals()
		_bound_story_ids[story.get_instance_id()] = true
	State.reset()
	pending_check = {}
	current_choices = []
	last_check_result = {}
	last_stub = {}
	transcript = ""
	ended = false
	push_mirror()
	story.ChoosePathString(start_knot)
	_continue_flow()


## Pick a choice by index (as listed in current_choices).
func choose(index: int) -> void:
	if not pending_check.is_empty():
		push_error("StoryBridge.choose: a check is pending; roll first")
		return
	if current_choices.is_empty():
		push_error("StoryBridge.choose: no choices available")
		return
	story.ChooseChoiceIndex(index)
	current_choices = []
	_continue_flow()


## Player-facing roll for the pending check (random dice + skill modifier).
func roll() -> void:
	if pending_check.is_empty():
		return
	var dice_total := _roll_dice(String(pending_check["dice"]))
	var total := dice_total + check_modifier(String(pending_check["skill"]))
	resolve_check(total)


## Dice-panel display path: roll the pending check's dice WITHOUT resolving,
## so the UI can animate toward the settled total before handing it to
## resolve_check(). Returns {} when no check is pending. roll() and
## resolve_check() are unchanged (test path stays deterministic).
func roll_preview() -> Dictionary:
	if pending_check.is_empty():
		return {}
	var dice_total := _roll_dice(String(pending_check["dice"]))
	var modifier := check_modifier(String(pending_check["skill"]))
	return {
		"skill": pending_check["skill"],
		"dice": pending_check["dice"],
		"target": int(pending_check["target"]),
		"dice_total": dice_total,
		"modifier": modifier,
		"total": dice_total + modifier,
	}


## Modifier for a # check skill spec. Slash-separated specs ("composure/agent")
## resolve as MAX of the parts — the twee's Math.max two-skill checks.
## "composure" reads Current Composure with the macros.js skill-level fallback.
func check_modifier(skill_spec: String) -> int:
	var best := 0
	var first := true
	for part in skill_spec.split("/", false):
		var value := _resolve_skill_value(String(part).strip_edges())
		if first or value > best:
			best = value
			first = false
	return best


func _resolve_skill_value(skill_name: String) -> int:
	if skill_name == "composure":
		var current: Variant = State.player().get("current_composure")
		if current is int or current is float:
			return int(current)
		return State.skill_level("composure")
	return State.skill_level(skill_name)


## Resolve the pending check with an explicit total (deterministic path;
## roll() funnels here). Writes the engine-set ink globals and resumes.
func resolve_check(total: int) -> void:
	if pending_check.is_empty():
		push_error("StoryBridge.resolve_check: no pending check")
		return
	var target := int(pending_check["target"])
	var passed := total >= target
	last_check_result = {
		"skill": pending_check["skill"],
		"total": total,
		"target": target,
		"passed": passed,
	}
	story.StoreVariable("check_total", total)
	story.StoreVariable("check_passed", passed)
	Rules.toast(
		"success" if passed else "warn",
		"%s check: %s (%d vs %d)" % [
			String(pending_check["skill"]).capitalize(),
			"passed" if passed else "failed", total, target,
		]
	)
	pending_check = {}
	_continue_flow()


## Back = choice commit restore: discard the current knot's frame and
## re-enter the previous knot from its entry snapshot.
func go_back() -> bool:
	if not State.can_go_back():
		return false
	State.history.pop_back()             # discard current knot's frame
	var frame: Dictionary = State.history.pop_back()  # re-pushed on re-entry
	_restore_frame(frame)
	return true


# --- Save / load -------------------------------------------------------------

## Save atom per STATE-SCHEMA.md. Loading restores the top history frame,
## which re-enters the current knot from its entry snapshot (so a save taken
## mid-check re-offers the roll).
func save_game() -> Dictionary:
	var frame := State.current_frame()
	return {
		"schema_version": State.SCHEMA_VERSION,
		"engine_state": State.data.duplicate(true),
		"ink_state_json": frame.get("ink_snapshot", ""),
		"current_knot": frame.get("knot", ""),
		"history": State.history.duplicate(true),
	}


func load_game(save: Dictionary) -> bool:
	if int(save.get("schema_version", -1)) != State.SCHEMA_VERSION:
		push_error("load_game: schema_version mismatch — refusing to load")
		return false
	if story == null:
		push_error("load_game: no story loaded; call start() first")
		return false
	var loaded_history: Array = (save["history"] as Array).duplicate(true)
	if loaded_history.is_empty():
		push_error("load_game: empty history")
		return false
	State.history = loaded_history
	var frame: Dictionary = State.history.pop_back()  # re-pushed on re-entry
	_restore_frame(frame)
	return true


# --- Mirror ------------------------------------------------------------------

## Push the mirror set (STATE-SCHEMA.md) into ink. Scalars only.
func push_mirror() -> void:
	if story == null:
		return
	var player := State.player()
	story.StoreVariable("background", String(player["background"]))
	story.StoreVariable("inciting_incident", String(player["inciting_incident"]))
	story.StoreVariable("arousal", int(player["arousal"]))
	story.StoreVariable("baseline_composure", int(player["baseline_composure"]))
	story.StoreVariable("current_composure", int(player["current_composure"]))
	story.StoreVariable("nyse_influence", int(State.data["nyse"]["influence"]))
	story.StoreVariable("date_slot", String(State.date()["slot"]))
	story.StoreVariable("day_of_week", Rules.day_of_week())
	story.StoreVariable("player_name", String(player["first_name"]))
	story.StoreVariable("player_full_name", "%s %s" % [player["first_name"], player["surname"]])
	story.StoreVariable("cover_known_as", String(player["cover"]["known_as"]))
	story.StoreVariable("codename", String(player["codename"]))


func _on_state_changed(_op: String) -> void:
	push_mirror()


# --- External surface --------------------------------------------------------

func _bind_externals() -> void:
	# Commands: stateful, lookahead-UNSAFE (must not fire during ink lookahead).
	story.BindExternalFunction("set_time", Rules.set_time)
	story.BindExternalFunction("set_date", Rules.set_date)
	story.BindExternalFunction("advance_time", Rules.advance_time)
	story.BindExternalFunction("advance_days", Rules.advance_days)
	story.BindExternalFunction("reset_composure", Rules.reset_composure)
	story.BindExternalFunction("set_composure", Rules.set_composure)
	story.BindExternalFunction("adjust_composure", Rules.adjust_composure)
	story.BindExternalFunction("grant_skill", Rules.grant_skill)
	story.BindExternalFunction("add_tag", Rules.add_tag)
	story.BindExternalFunction("add_kink", Rules.add_kink)
	story.BindExternalFunction("add_quirk", Rules.add_quirk)
	story.BindExternalFunction("adjust_influence", Rules.adjust_influence)
	story.BindExternalFunction("set_header", Rules.set_header)
	story.BindExternalFunction("toast", Rules.toast)
	# Queries: pure, lookahead-safe.
	story.BindExternalFunction("has_tag", _query_has_tag, true)
	story.BindExternalFunction("has_kink", _query_has_kink, true)
	story.BindExternalFunction("has_quirk", _query_has_quirk, true)
	story.BindExternalFunction("skill_level", _query_skill_level, true)


func _query_has_tag(tag: String) -> bool:
	return (State.player()["story_tags"] as Array).has(tag)


func _query_has_kink(kink: String) -> bool:
	return (State.player()["kinks"] as Array).has(kink)


func _query_has_quirk(quirk: String) -> bool:
	return (State.player()["quirks"] as Array).has(quirk)


func _query_skill_level(skill_name: String) -> int:
	return State.skill_level(skill_name)


# --- Presentation helpers ------------------------------------------------------

## ink visit count for a knot path (visited-choice greying / knot-driven UI).
## Returns 0 when no story is loaded. Only call with known knot names — the
## underlying ink API raises on paths that don't exist in the story.
func visit_count(knot_path: String) -> int:
	if story == null:
		return 0
	return int(story.VisitCountAtPathString(knot_path))


# --- Flow --------------------------------------------------------------------

func _continue_flow() -> void:
	while story.GetCanContinue():
		# Pre-line snapshots: committed as the knot's frame if this line
		# turns out to be a knot entry (`# id:` tag).
		var pre_ink: String = story.SaveState()
		var pre_engine: Dictionary = State.data.duplicate(true)
		var line: String = story.Continue()
		var tags := _parse_tags(story.GetCurrentTags())
		if tags.has("id"):
			var knot := String(tags["id"])
			State.push_frame(knot, pre_engine, pre_ink)
			if HANDOFF_INCIDENTS.has(knot):
				State.player()["inciting_incident"] = String(HANDOFF_INCIDENTS[knot])
				push_mirror()
				handoff_reached.emit(knot)
			knot_entered.emit(knot, tags)
			if tags.has("scene"):
				last_stub = {
					"scene": tags["scene"],
					"extract": tags.get("extract", ""),
				}
				scene_stub.emit(String(tags["scene"]), String(tags.get("extract", "")))
		var trimmed := line.strip_edges()
		if trimmed != "":
			transcript += trimmed + "\n"
			text_appended.emit(trimmed)
		if tags.has("check"):
			# Pause continuation BEFORE the conditional block evaluates.
			pending_check = _parse_check(String(tags["check"]))
			check_ready.emit(pending_check.duplicate())
			return
	current_choices = []
	for choice in story.GetCurrentChoices():
		current_choices.append({"index": choice.GetIndex(), "text": choice.GetText()})
	if current_choices.is_empty():
		ended = true
		flow_ended.emit()
	else:
		choices_ready.emit(current_choices.duplicate(true))


func _restore_frame(frame: Dictionary) -> void:
	pending_check = {}
	current_choices = []
	last_check_result = {}
	last_stub = {}
	transcript = ""
	ended = false
	State.restore_engine(frame)
	story.LoadState(String(frame["ink_snapshot"]))
	push_mirror()
	flow_reset.emit(String(frame["knot"]))
	_continue_flow()


# --- Parsing helpers -----------------------------------------------------------

## ["id: BLK_130", "avatar: blk_day", "history_root"] ->
## {"id": "BLK_130", "avatar": "blk_day", "history_root": true}
func _parse_tags(raw_tags) -> Dictionary:
	var parsed := {}
	for raw in raw_tags:
		var tag := String(raw)
		var split := tag.find(":")
		if split == -1:
			parsed[tag.strip_edges()] = true
		else:
			parsed[tag.substr(0, split).strip_edges()] = tag.substr(split + 1).strip_edges()
	return parsed


## "composure 2d6 8" -> {skill: "composure", dice: "2d6", target: 8}
func _parse_check(spec: String) -> Dictionary:
	var parts := spec.split(" ", false)
	if parts.size() != 3:
		push_error("Malformed # check tag: '%s'" % spec)
		return {}
	return {"skill": parts[0], "dice": parts[1], "target": int(parts[2])}


func _roll_dice(notation: String) -> int:
	var regex := RegEx.create_from_string("^(\\d+)d(\\d+)([+-]\\d+)?$")
	var found := regex.search(notation)
	if found == null:
		push_error("Invalid dice notation: '%s'" % notation)
		return 0
	var total := int(found.get_string(3)) if found.get_string(3) != "" else 0
	for _i in int(found.get_string(1)):
		total += _rng.randi_range(1, int(found.get_string(2)))
	return total
