extends Node
## Phase 6 content-QA tool. Plays each sequence through a deterministic path
## and writes the engine-RENDERED prose (with choices taken, check outcomes,
## and file-extract stubs annotated) to a readable markdown file per sequence.
## The output is the first-play review packet — it lets a human read exactly
## what the engine shows, in play order, without driving the UI.
##
## Two passes per incident (all-pass and all-fail) so both branch textures and
## the influence-cap prose are on the page. Background is set per run so the
## background-variant prose renders; the chosen background is noted in the file.
##
## Runs as a scene (needs the autoloads):
##   & <godot.exe> --headless --path godot res://tools/review_dump.tscn

const OUT_DIR := "user://review"
const MAX_STEPS := 400

const SEQUENCES := [
	{ "name": "briefing", "path": "res://content/briefing.ink", "start": "INTRO_100", "incident": false },
	{ "name": "blackout", "path": "res://content/blackout.ink", "start": "BLK_085", "incident": true },
	{ "name": "manitoulin", "path": "res://content/manitoulin.ink", "start": "MAN_085", "incident": true },
	{ "name": "pale", "path": "res://content/pale.ink", "start": "PALE_085", "incident": true },
	{ "name": "wds", "path": "res://content/wds.ink", "start": "WDS_085", "incident": true },
]

var _lines: PackedStringArray = []
var _issues: PackedStringArray = []


func _ready() -> void:
	DirAccess.make_dir_recursive_absolute(OUT_DIR)
	for seq: Dictionary in SEQUENCES:
		if bool(seq["incident"]):
			_dump_run(seq, true, "all-pass")
			_dump_run(seq, false, "all-fail")
		else:
			_dump_run(seq, true, "single path")
	_write_issue_summary()
	print("review_dump: wrote sequence files to %s" % OUT_DIR)
	print("review_dump: %d mechanical issues flagged" % _issues.size())
	get_tree().quit(0)


func _dump_run(seq: Dictionary, pass_checks: bool, label: String) -> void:
	var seq_name := String(seq["name"])
	State.reset()
	if bool(seq["incident"]):
		State.player()["background"] = "RCMP constable"
	StoryBridge.start(String(seq["path"]), String(seq["start"]), true)

	_lines = PackedStringArray()
	_lines.append("## %s — %s" % [seq_name, label])
	if bool(seq["incident"]):
		_lines.append("_Background: RCMP constable · checks forced %s_" % ("PASS" if pass_checks else "FAIL"))
	_lines.append("")

	var steps := 0
	var last_len := 0
	while not StoryBridge.ended and steps < MAX_STEPS:
		steps += 1
		var t := StoryBridge.transcript
		if t.length() > last_len:
			var fresh := t.substr(last_len).strip_edges()
			if fresh != "":
				_lines.append(fresh)
				_lines.append("")
			last_len = t.length()

		if not StoryBridge.last_stub.is_empty():
			_lines.append("> **[FILE EXTRACT: %s]**" % String(StoryBridge.last_stub.get("extract", "?")))
			_lines.append("")
			StoryBridge.last_stub = {}

		# Prose produced by the action below is captured at the TOP of the next
		# iteration — do NOT advance last_len here or it gets skipped.
		if not StoryBridge.pending_check.is_empty():
			var c := StoryBridge.pending_check
			StoryBridge.resolve_check(999 if pass_checks else -999)
			var r := StoryBridge.last_check_result
			_lines.append("> `CHECK %s (target %d) -> %s`" % [
				String(c["skill"]), int(c["target"]), "PASS" if bool(r["passed"]) else "FAIL"])
			_lines.append("")
		elif not StoryBridge.current_choices.is_empty():
			var choices: Array = StoryBridge.current_choices
			if choices.size() > 1:
				var picked := String(choices[0]["text"])
				var others: PackedStringArray = []
				for i in range(1, choices.size()):
					others.append("“%s”" % String(choices[i]["text"]))
				_lines.append("> _choice: **“%s”**  (other: %s)_" % [picked, ", ".join(others)])
				_lines.append("")
			StoryBridge.choose(0)
		else:
			break

	if not StoryBridge.ended:
		_issues.append("%s/%s: did NOT reach END in %d steps (stalled at %s)" % [
			seq_name, label, MAX_STEPS, State.current_frame().get("knot", "?")])
	_lines.append("---")
	_lines.append("_influence %d · skills{%s} · incident '%s'_" % [
		int(State.data["nyse"]["influence"]), _skill_summary(),
		String(State.player()["inciting_incident"])])
	_check_for_issues(seq_name, label)

	var path := "%s/%s_%s.md" % [OUT_DIR, seq_name, label.replace(" ", "_").replace("-", "")]
	var file := FileAccess.open(path, FileAccess.WRITE)
	file.store_string("\n".join(_lines))
	file.close()


## Scans only PROSE lines (skips my own annotation/footer lines starting with
## > _ # ---) for genuine conversion-failure signatures. Note: [i]/[url=gloss:]
## BBCode in prose is EXPECTED — it's what RichTextLabel renders — so it is not
## an error; only unconverted twee/raw-var/unrendered-conditional markers are.
func _check_for_issues(seq_name: String, label: String) -> void:
	for line in _lines:
		var s := String(line).strip_edges()
		if s == "" or s.begins_with(">") or s.begins_with("_") or s.begins_with("#") or s.begins_with("---"):
			continue
		if s.contains("<<") or s.contains(">>"):
			_issues.append("%s/%s: unconverted twee macro: %s" % [seq_name, label, s.left(60)])
		if s.contains("{") or s.contains("}"):
			_issues.append("%s/%s: unrendered ink conditional: %s" % [seq_name, label, s.left(60)])
		for raw_var in ["$player", "$sizzle", "$nyse", "$date", "$header"]:
			if s.contains(raw_var):
				_issues.append("%s/%s: raw variable %s: %s" % [seq_name, label, raw_var, s.left(60)])


func _skill_summary() -> String:
	var parts: PackedStringArray = []
	for skill_name: String in State.SKILL_NAMES:
		var lvl := State.skill_level(skill_name)
		if lvl != 0:
			parts.append("%s %d" % [skill_name, lvl])
	return ", ".join(parts) if parts.size() > 0 else "all 0"


func _write_issue_summary() -> void:
	var path := "%s/_ISSUES.md" % OUT_DIR
	var file := FileAccess.open(path, FileAccess.WRITE)
	if _issues.is_empty():
		file.store_string("# Mechanical QA: clean\n\nNo rendering/flow issues in any run.\n")
	else:
		file.store_string("# Mechanical QA issues (%d)\n\n- %s\n" % [
			_issues.size(), "\n- ".join(_issues)])
	file.close()
