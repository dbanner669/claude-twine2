extends Node
## Screenshot / smoke runner (Phase 3 verification; Phase 5 CC stages).
##
## Drives the shell through its states — main menu, the four-step character
## creation flow (identity, background, incident, flashback round-trip,
## summary, sign-off into the briefing), scene knot, image knot, dice check,
## branch-file extract — capturing a PNG at each stop.
##
## Run (windowed, real pixels):
##   & <godot-exe> --path godot res://tools/screenshot_runner.tscn
## Run (headless — exercises the whole flow, but captures are skipped):
##   & <godot-exe> --headless --path godot res://tools/screenshot_runner.tscn
##
## Shots land in user://shots/ (Windows:
## %APPDATA%/Godot/app_userdata/Sizzle/shots/). The runner quits when done;
## exit code 1 if any stage failed.

const SHOT_DIR := "user://shots"

var _shell: Control
var _failed := false


func _ready() -> void:
	DirAccess.make_dir_recursive_absolute(SHOT_DIR)
	_watchdog()
	# Deterministic shots: bypass the paced prose reveal, cosmetic animation,
	# and the day/night cross-fade (all session-only; the user's settings
	# file is untouched).
	Settings.text_speed_override = "instant"
	Settings.animations_override_disabled = true
	ThemeService.instant_mode = true
	_shell = load("res://scenes/game_shell.tscn").instantiate()
	add_child(_shell)
	_run()


## A crashed stage kills the _run coroutine before its final quit(), leaving
## the process alive forever (this hung two background shells during the
## Phase 3 gate). Hard deadline: if we're still running, quit(1).
func _watchdog() -> void:
	await get_tree().create_timer(120.0).timeout
	push_error("screenshot_runner: watchdog deadline hit — forcing quit(1)")
	get_tree().quit(1)


func _run() -> void:
	await _settle()
	await _shot("01_main_menu")

	# --- Main menu: Begin -> character creation (Phase 5) --------------------
	var begin := _button_containing("Begin")
	_expect(begin != null, "main menu shows Begin")
	if begin != null:
		begin.pressed.emit()
	await _settle()
	var cc := _cc_flow()
	_expect(cc != null and cc.is_visible_in_tree(), "Begin opens the CC dossier flow")
	_expect(cc != null and cc.step == 0, "CC starts at the identification step")
	await _shot("10_cc_identity")

	# --- CC step 1: identity ---------------------------------------------------
	cc.set_identity("Riley", "Nash")
	cc.next_step()
	await _settle()
	_expect(cc.step == 1, "identity Continue reaches the background step")
	_expect(String(State.player()["first_name"]) == "Riley"
		and String(State.player()["surname"]) == "Nash",
		"identity applied through Rules on Continue")

	# --- CC step 2: background (guardrail + selection) -----------------------
	cc.next_step()
	await _settle()
	_expect(cc.step == 1, "background guardrail blocks Continue until selected")
	cc.select_background("RCMP constable")
	await _settle()
	await _shot("11_cc_background")
	cc.next_step()
	await _settle()
	_expect(cc.step == 2, "background selected -> incident step reachable")
	await _shot("12_cc_incident")

	# --- CC step 3: incident confirm -> rebuild -> flashback ------------------
	cc.next_step()
	await _settle()
	_expect(cc.step == 2, "incident guardrail blocks Continue until an incident is lived")
	cc.select_incident("the Toronto Blackout")
	await _settle()
	_expect(String(State.current_frame().get("knot", "")) == "BLK_085",
		"incident confirm starts the flashback at BLK_085 (got '%s')" %
		State.current_frame().get("knot", ""))
	_expect(String(State.player()["background"]) == "RCMP constable",
		"CC-400-top rebuild set the background")
	_expect(State.skill_level("confrontation") == 2 and State.skill_level("agent") == 1,
		"rebuild applied background bonuses + Branch training before the flashback")
	_expect(cc != null and not cc.is_visible_in_tree(),
		"CC view yields to the story once the flashback starts")

	# --- Force-resolve the flashback through to blk_end ----------------------
	for _i in 80:
		if StoryBridge.ended:
			break
		if not StoryBridge.pending_check.is_empty():
			StoryBridge.resolve_check(99)
		elif not StoryBridge.current_choices.is_empty():
			StoryBridge.choose(0)
		else:
			break
		await _settle()
	_expect(StoryBridge.ended, "flashback force-resolves through to blk_end")
	_expect(String(State.player()["inciting_incident"]) == "the Toronto Blackout",
		"handoff map set inciting_incident at blk_end")

	# --- CC step 4: summary (post-flashback return) ---------------------------
	_expect(cc.is_visible_in_tree() and cc.step == 3,
		"blk_end handoff returns to the CC summary step")
	_expect(String(State.player()["codename"]) != "",
		"summary auto-assigned a codename")
	var composure_at_summary := State.skill_level("composure")
	_expect(composure_at_summary >= 2,
		"summary shows rebuilt skills (composure >= background+training)")
	await _shot("13_cc_summary")

	# --- Sign & Deploy -> briefing --------------------------------------------
	cc.next_step()
	await _settle()
	_expect(String(State.current_frame().get("knot", "")) == "INTRO_100",
		"signing starts the briefing at INTRO_100")
	_expect(StoryBridge.current_choices.size() > 0, "INTRO_100 offers a choice")
	_expect(String(State.player()["first_name"]) == "Riley",
		"engine state survives into the briefing (keep_engine_state)")
	_expect(int(State.player()["baseline_composure"]) == composure_at_summary,
		"cc_finalize copied the composure level into baseline")
	await _shot("02_scene_intro_100")

	# --- Image knot: INTRO_110 (Robert diner entry) ----------------------
	for _i in 3:  # INTRO_100 -> INTRO_101 -> INTRO_105 -> INTRO_110
		if StoryBridge.current_choices.is_empty():
			break
		StoryBridge.choose(0)
		await _settle()
	_expect(String(State.current_frame().get("knot", "")) == "INTRO_110",
		"reached INTRO_110 (got '%s')" % State.current_frame().get("knot", ""))
	await _shot("03_intro_110_image")

	# --- Main menu: Continue (autosave restore) ------------------------------
	# The autosave was just written on INTRO_110 entry; Continue must restore
	# it (read-into-memory-first ordering in the shell).
	_shell._show_main_menu()
	await _settle()
	var continue_button := _button_containing("Continue")
	_expect(continue_button != null, "menu offers Continue when an autosave exists")
	if continue_button != null:
		continue_button.pressed.emit()
		await _settle()
		_expect(String(State.current_frame().get("knot", "")) == "INTRO_110",
			"Continue restores the autosave at INTRO_110")

	# --- Dice check: walk BLK_130 -> BLK_135 -> BLK_140 (2d6 check) -------
	StoryBridge.start("res://content/blackout.ink", "BLK_130")
	await _settle()
	for _i in 4:
		if not StoryBridge.pending_check.is_empty() or StoryBridge.current_choices.is_empty():
			break
		StoryBridge.choose(0)
		await _settle()
	_expect(not StoryBridge.pending_check.is_empty(), "BLK_140 raises a check")
	_expect(_prose_text().length() > 0,
		"previous knot's prose stays on screen at the check pause")
	await _shot("04_check_panel")
	# Roll through the panel's animated path (spin ~1s + settle pause).
	var panels := _shell.find_children("*", "CheckPanel", true, false)
	_expect(panels.size() == 1, "check panel present in the shell")
	if panels.size() == 1:
		(panels[0] as CheckPanel)._on_roll_pressed()
		await get_tree().create_timer(2.2).timeout
	else:
		StoryBridge.roll()
	await _settle()
	_expect(StoryBridge.pending_check.is_empty(), "check resolved after animated roll")
	_expect(_prose_text().contains("The lobby is a short hallway"),
		"check knot prose replaces the old page after the roll")
	await _shot("05_check_resolved")

	# --- Branch file extract: BLK_210 -------------------------------------
	StoryBridge.start("res://content/blackout.ink", "BLK_210")
	await _settle()
	_expect(StoryBridge.last_stub.get("scene", "") == "branch_file_extract",
		"BLK_210 emits the extract stub")
	_expect(_extract_body_text().contains("INCIDENT DATE: 2003.08.14"),
		"BLK_210 extract renders the incident report body")
	await _shot("06_branch_file_extract")

	# --- Extract with background variant: MAN_200 -------------------------
	# start() resets State, so the background is mutated afterwards and the
	# extract re-rendered (in-game the background is long set before MAN_200).
	StoryBridge.start("res://content/manitoulin.ink", "MAN_200")
	await _settle()
	_expect(_extract_body_text().contains("OPP general occurrence log"),
		"MAN_200 extract defaults to the OPP variant")
	State.player()["background"] = "RCMP constable"
	_rerender_extract()
	await _settle()
	_expect(_extract_body_text().contains("off-duty RCMP member's occurrence report"),
		"MAN_200 extract picks the RCMP variant")
	await _shot("07_extract_man_variant")

	# --- Charsheet dialog ---------------------------------------------------
	var sheets := _shell.find_children("*", "CharSheetDialog", true, false)
	_expect(sheets.size() == 1, "charsheet dialog present")
	if sheets.size() == 1:
		var sheet := sheets[0] as CharSheetDialog
		sheet.open()
		await _settle()
		_expect(sheet.visible, "charsheet opens")
		await _shot("08_charsheet")
		sheet.hide()

	# --- End screen --------------------------------------------------------
	StoryBridge.start("res://content/briefing.ink", "INTRO_800")
	await _settle()
	_expect(StoryBridge.ended, "INTRO_800 reaches END")
	await _shot("09_end_of_prologue")

	print("screenshot_runner: %s" % ("FAILED" if _failed else "all stages OK"))
	get_tree().quit(1 if _failed else 0)


func _settle(frames: int = 3) -> void:
	for _i in frames:
		await get_tree().process_frame


func _shot(shot_name: String) -> void:
	await _settle(2)
	if DisplayServer.get_name() == "headless":
		print("screenshot_runner: [headless] skipping capture '%s'" % shot_name)
		return
	var image := get_viewport().get_texture().get_image()
	var path := "%s/%s.png" % [SHOT_DIR, shot_name]
	var err := image.save_png(path)
	if err == OK:
		print("screenshot_runner: wrote %s" % path)
	else:
		push_error("screenshot_runner: failed to write %s (err %d)" % [path, err])


func _prose_text() -> String:
	var labels := _shell.find_children("*", "RichTextLabel", true, false)
	for node in labels:
		var label := node as RichTextLabel
		if label.visible and label.get_parsed_text().length() > 0:
			return label.get_parsed_text()
	return ""


func _cc_flow() -> CCFlow:
	var flows := _shell.find_children("*", "CCFlow", true, false)
	return flows[0] as CCFlow if not flows.is_empty() else null


func _button_containing(text: String) -> Button:
	for node in _shell.find_children("*", "Button", true, false):
		if (node as Button).text.contains(text):
			return node
	return null


func _extract_body_text() -> String:
	var extracts := _shell.find_children("*", "BranchFileExtract", true, false)
	if extracts.is_empty():
		return ""
	var bodies := (extracts[0] as Control).find_children("*", "RichTextLabel", true, false)
	if bodies.is_empty():
		return ""
	return (bodies[0] as RichTextLabel).get_parsed_text()


func _rerender_extract() -> void:
	var extracts := _shell.find_children("*", "BranchFileExtract", true, false)
	if not extracts.is_empty():
		(extracts[0] as BranchFileExtract)._restyle()


func _expect(condition: bool, label: String) -> void:
	if condition:
		print("screenshot_runner: OK — %s" % label)
	else:
		push_error("screenshot_runner: FAIL — %s" % label)
		_failed = true
