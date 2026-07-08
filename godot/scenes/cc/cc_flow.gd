class_name CCFlow
extends VBoxContainer
## Native character-creation dossier flow (Phase 5) — the four-step port of
## sizzle/src/content/character-creator.twee (CC-200 appearance was descoped):
##
##   step 0  IDENTIFICATION  (CC-100) name / surname entry + randomize
##   step 1  BACKGROUND      (CC-300) four background cards, guardrailed
##   step 2  INCIDENT        (CC-400) four incident cards -> flashback launch
##   step 3  SUMMARY         (CC-500) dossier table + signature block
##
## Derived state goes through the Rules command surface only:
##   - identity applied on leaving step 0 (Rules.cc_apply_identity)
##   - incident card confirm = the CC-400-top rebuild (Rules.cc_rebuild_derived)
##     then `incident_chosen` — the shell starts the flashback ink
##   - "Sign & Deploy" emits `summary_signed` — the shell finalizes + starts
##     the briefing. This scene never calls StoryBridge itself.
##
## Visual language approximates sizzle/src/styles/character-creator.css
## (tab strip, dossier surface, option cards, selected states) through
## ThemeService tokens; everything re-renders on day/night mode change.

signal incident_chosen(incident: Dictionary)
signal summary_signed

const STEP_TITLES := [
	["Identification", "Tonight's name needn't be your last. The Branch assigns the rest."],
	["Pre-Branch Career", "What did you do before the Branch found a use for you?"],
	["The Incident", "There is a year of your file that no one talks about. Not even you."],
	["Personnel Summary", "Review and sign. The file goes to the vault at 06:00."],
]
const TAB_LABELS := ["IDENTIFICATION", "BACKGROUND", "INCIDENT", "SUMMARY"]

var step := 0
var selected_background := ""
var selected_incident := ""

var _tabs: HBoxContainer
var _dossier: PanelContainer
var _dossier_box: VBoxContainer
var _body: VBoxContainer
var _first_edit: LineEdit
var _surname_edit: LineEdit


func _ready() -> void:
	custom_minimum_size.x = 980
	add_theme_constant_override("separation", 0)

	_tabs = HBoxContainer.new()
	_tabs.add_theme_constant_override("separation", 0)
	add_child(_tabs)

	_dossier = PanelContainer.new()
	add_child(_dossier)
	_dossier_box = VBoxContainer.new()
	_dossier_box.add_theme_constant_override("separation", 20)
	_dossier.add_child(_dossier_box)

	ThemeService.mode_changed.connect(func(_m: String) -> void: _render())
	_render()


# =========================================================================
# Public API (shell + screenshot runner)
# =========================================================================

## Fresh creation run (main menu Begin). Caller resets State first.
func begin() -> void:
	step = 0
	selected_background = ""
	selected_incident = ""
	_render()


## Post-flashback return (CC-500 equivalent) — also the landing point when a
## blk_end/man_end/pale_end/wds_end autosave is loaded. Selections are
## re-derived from State so Back into the incident/background steps shows
## the correct selected cards.
func open_summary() -> void:
	selected_background = String(State.player()["background"])
	selected_incident = String(State.player()["inciting_incident"])
	_enter_step(3)


## Programmatic identity entry (runner). On the identity step this fills the
## visible fields; they are applied through Rules on Continue as usual.
func set_identity(first_name: String, surname: String) -> void:
	if step == 0 and is_instance_valid(_first_edit):
		_first_edit.text = first_name
		_surname_edit.text = surname
	else:
		Rules.cc_apply_identity(first_name, surname, "")


## Background card click / programmatic pick.
func select_background(background_id: String) -> void:
	if Rules.cc_background(background_id).is_empty():
		push_error("CCFlow.select_background: unknown '%s'" % background_id)
		return
	selected_background = background_id
	_render()


## Incident card click / programmatic pick — the CC-400 confirm. Runs the
## upstream rebuild, then hands the incident to the shell to start the
## flashback. Matches the twee: clicking a memory card launches immediately.
func select_incident(incident_id: String) -> void:
	if selected_background == "":
		push_error("CCFlow.select_incident: no background selected (CC-400 guardrail)")
		return
	var incident := Rules.cc_incident(incident_id)
	if incident.is_empty():
		push_error("CCFlow.select_incident: unknown '%s'" % incident_id)
		return
	selected_incident = incident_id
	Rules.cc_rebuild_derived(selected_background)
	incident_chosen.emit(incident)


func next_step() -> void:
	match step:
		0:
			Rules.cc_apply_identity(_first_edit.text, _surname_edit.text, "")
			_enter_step(1)
		1:
			if selected_background != "":  # CC-300 guardrail
				_enter_step(2)
		2:
			# Continue exists only once an incident has been lived through
			# (twee: footer link to CC-500 appears when incitingIncident set).
			if String(State.player()["inciting_incident"]) != "":
				_enter_step(3)
		3:
			summary_signed.emit()


func prev_step() -> void:
	if step > 0:
		_enter_step(step - 1)


func _enter_step(next: int) -> void:
	step = next
	if step == 3 and String(State.player()["codename"]) == "":
		# CC-500 silent block: auto-assign a codename when none is set.
		var codenames: Array = Rules.cc_data().get("codenames", [])
		if not codenames.is_empty():
			Rules.cc_apply_identity("", "", String(codenames.pick_random()))
	_render()


# =========================================================================
# Rendering
# =========================================================================

func _render() -> void:
	_render_tabs()
	_render_dossier()


func _render_tabs() -> void:
	for child in _tabs.get_children():
		_tabs.remove_child(child)
		child.queue_free()
	for i in TAB_LABELS.size():
		var cell := PanelContainer.new()
		cell.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		var style := StyleBoxFlat.new()
		style.bg_color = Color.TRANSPARENT
		style.border_width_bottom = 2
		style.border_color = Color.TRANSPARENT
		style.content_margin_left = 20
		style.content_margin_right = 20
		style.content_margin_top = 16
		style.content_margin_bottom = 16
		var text_color := ThemeService.color("cream_faint")
		var num_color := ThemeService.color("brass_dim")
		if i == step:
			style.border_color = ThemeService.color("brick")
			var wash := ThemeService.color("brick")
			wash.a = 0.08
			style.bg_color = wash
			text_color = ThemeService.color("cream")
			num_color = ThemeService.color("brick_glow")
		elif i < step:
			text_color = ThemeService.color("brass")
		cell.add_theme_stylebox_override("panel", style)
		var row := HBoxContainer.new()
		row.add_theme_constant_override("separation", 10)
		cell.add_child(row)
		var num := Label.new()
		num.text = "0%d" % (i + 1)
		num.add_theme_font_override("font", ThemeService.font("mono"))
		num.add_theme_font_size_override("font_size", 10)
		num.add_theme_color_override("font_color", num_color)
		row.add_child(num)
		var label := Label.new()
		label.text = TAB_LABELS[i]
		label.add_theme_font_override("font", _tracked(ThemeService.font("ui_medium"), 2.4))
		label.add_theme_font_size_override("font_size", 11)
		label.add_theme_color_override("font_color", text_color)
		row.add_child(label)
		_tabs.add_child(cell)


func _render_dossier() -> void:
	var surface := StyleBoxFlat.new()
	surface.bg_color = ThemeService.color("ink_2")
	surface.border_color = ThemeService.color("rule")
	surface.set_border_width_all(1)
	surface.content_margin_left = 48
	surface.content_margin_right = 48
	surface.content_margin_top = 32
	surface.content_margin_bottom = 24
	_dossier.add_theme_stylebox_override("panel", surface)

	for child in _dossier_box.get_children():
		_dossier_box.remove_child(child)
		child.queue_free()
	_first_edit = null
	_surname_edit = null

	_dossier_box.add_child(_build_header())
	_body = VBoxContainer.new()
	_body.add_theme_constant_override("separation", 18)
	_dossier_box.add_child(_body)
	match step:
		0: _build_identity_step()
		1: _build_background_step()
		2: _build_incident_step()
		3: _build_summary_step()
	_dossier_box.add_child(_build_footer())


func _build_header() -> Control:
	var box := VBoxContainer.new()
	box.add_theme_constant_override("separation", 4)
	var title := Label.new()
	title.text = STEP_TITLES[step][0]
	title.add_theme_font_override("font", ThemeService.font("display_italic"))
	title.add_theme_font_size_override("font_size", 38)
	title.add_theme_color_override("font_color", ThemeService.color("cream"))
	box.add_child(title)
	var subtitle := Label.new()
	subtitle.text = STEP_TITLES[step][1]
	subtitle.add_theme_font_override("font", ThemeService.font("body_italic"))
	subtitle.add_theme_font_size_override("font_size", 15)
	subtitle.add_theme_color_override("font_color", ThemeService.color("cream_soft"))
	box.add_child(subtitle)
	box.add_child(_hrule())
	return box


func _build_footer() -> Control:
	var box := VBoxContainer.new()
	box.add_theme_constant_override("separation", 14)
	box.add_child(_hrule())
	var row := HBoxContainer.new()
	row.add_theme_constant_override("separation", 14)
	box.add_child(row)

	if step > 0:
		var back := Button.new()
		back.text = "BACK"
		back.focus_mode = Control.FOCUS_NONE
		_style_subtle_button(back)
		back.pressed.connect(prev_step)
		row.add_child(back)

	var counter := Label.new()
	counter.text = "STEP %d / 4" % (step + 1)
	counter.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	counter.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	counter.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	counter.add_theme_font_override("font", _tracked(ThemeService.font("mono"), 2.2))
	counter.add_theme_font_size_override("font_size", 11)
	counter.add_theme_color_override("font_color", ThemeService.color("cream_faint"))
	row.add_child(counter)

	var hint := _footer_hint()
	if hint != "":
		var hint_label := Label.new()
		hint_label.text = hint
		hint_label.size_flags_vertical = Control.SIZE_SHRINK_CENTER
		hint_label.add_theme_font_override("font", ThemeService.font("mono"))
		hint_label.add_theme_font_size_override("font_size", 11)
		hint_label.add_theme_color_override("font_color", ThemeService.color("cream_faint"))
		row.add_child(hint_label)

	var next := Button.new()
	next.text = "SIGN & DEPLOY" if step == 3 else "CONTINUE"
	next.name = "NextButton"
	next.focus_mode = Control.FOCUS_NONE
	next.disabled = hint != ""
	_style_next_button(next)
	next.pressed.connect(next_step)
	row.add_child(next)
	return box


func _footer_hint() -> String:
	# The twee guardrails: disabled Continue + reason text.
	if step == 1 and selected_background == "":
		return "Select a background first"
	if step == 2 and String(State.player()["inciting_incident"]) == "":
		return "Select an incident first"
	return ""


# --- Step 0: identification (CC-100) -----------------------------------------

func _build_identity_step() -> void:
	var columns := HBoxContainer.new()
	columns.add_theme_constant_override("separation", 48)
	_body.add_child(columns)

	var left := VBoxContainer.new()
	left.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	left.size_flags_stretch_ratio = 1.2
	left.add_theme_constant_override("separation", 16)
	columns.add_child(left)

	left.add_child(_eyebrow("GIVEN NAME", "brass"))
	_first_edit = _make_input(String(State.player()["first_name"]))
	left.add_child(_first_edit)
	left.add_child(_eyebrow("SURNAME", "brass"))
	_surname_edit = _make_input(String(State.player()["surname"]))
	left.add_child(_surname_edit)

	var randomize_button := Button.new()
	randomize_button.text = "RANDOMIZE NAME"
	randomize_button.focus_mode = Control.FOCUS_NONE
	randomize_button.size_flags_horizontal = Control.SIZE_SHRINK_BEGIN
	_style_subtle_button(randomize_button)
	randomize_button.pressed.connect(_on_randomize_pressed)
	left.add_child(randomize_button)

	var right := VBoxContainer.new()
	right.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	right.add_theme_constant_override("separation", 16)
	columns.add_child(right)
	right.add_child(_build_service_record())

	var quote := Label.new()
	quote.text = "\"Codename and cover identity are assigned once the file is complete. The Branch likes to know who you were before it tells you who to be.\""
	quote.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	quote.add_theme_font_override("font", ThemeService.font("body_italic"))
	quote.add_theme_font_size_override("font_size", 15)
	quote.add_theme_color_override("font_color", ThemeService.color("cream_soft"))
	right.add_child(quote)


func _build_service_record() -> Control:
	var panel := PanelContainer.new()
	var style := StyleBoxFlat.new()
	style.bg_color = ThemeService.color("ink_3")
	style.border_color = ThemeService.color("rule")
	style.set_border_width_all(1)
	style.set_content_margin_all(20)
	panel.add_theme_stylebox_override("panel", style)
	var box := VBoxContainer.new()
	box.add_theme_constant_override("separation", 8)
	panel.add_child(box)

	var head := HBoxContainer.new()
	box.add_child(head)
	var eyebrow := _eyebrow("SERVICE RECORD · PRE-FILL", "brass")
	eyebrow.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	head.add_child(eyebrow)
	var stamp := Label.new()
	stamp.text = "VERIFIED"
	stamp.add_theme_font_override("font", _tracked(ThemeService.font("mono"), 2.0))
	stamp.add_theme_font_size_override("font_size", 10)
	stamp.add_theme_color_override("font_color", ThemeService.color("composed"))
	head.add_child(stamp)

	var grid := GridContainer.new()
	grid.columns = 2
	grid.add_theme_constant_override("h_separation", 18)
	grid.add_theme_constant_override("v_separation", 8)
	box.add_child(grid)
	var rows := [
		["FILE NO.", "04-227-B", "cream"],
		["CLEARANCE", "Tier III — restricted", "cream"],
		["BRANCH ENTRY", "September 2003", "cream"],
		["STATUS", "Active · cleared", "composed"],
		["HANDLER", "R. Flett", "cream"],
		["NEXT OF KIN", "none on file", "cream_faint"],
	]
	for row: Array in rows:
		grid.add_child(_eyebrow(String(row[0]), "brass_dim"))
		var value := Label.new()
		value.text = String(row[1])
		value.add_theme_font_override("font", ThemeService.font("body"))
		value.add_theme_font_size_override("font_size", 15)
		value.add_theme_color_override("font_color", ThemeService.color(String(row[2])))
		grid.add_child(value)
	return panel


func _on_randomize_pressed() -> void:
	var data := Rules.cc_data()
	var first_names: Array = data.get("first_names", [])
	var surnames: Array = data.get("surnames", [])
	if is_instance_valid(_first_edit) and not first_names.is_empty():
		_first_edit.text = String(first_names.pick_random())
	if is_instance_valid(_surname_edit) and not surnames.is_empty():
		_surname_edit.text = String(surnames.pick_random())


# --- Step 1: background cards (CC-300) ----------------------------------------

func _build_background_step() -> void:
	var grid := GridContainer.new()
	grid.columns = 2
	grid.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	grid.add_theme_constant_override("h_separation", 16)
	grid.add_theme_constant_override("v_separation", 16)
	_body.add_child(grid)
	for background: Dictionary in Rules.cc_data().get("backgrounds", []):
		var id := String(background["id"])
		var perks := PackedStringArray()
		for skill_name: String in background["bonuses"]:
			perks.append("+ %s +%d" % [
				String(skill_name).to_upper(), int(background["bonuses"][skill_name])])
		grid.add_child(_make_card(
			String(background["title"]), String(background["blurb"]),
			" ".join(perks), id == selected_background,
			func() -> void: select_background(id)))


# --- Step 2: incident cards (CC-400) -------------------------------------------

func _build_incident_step() -> void:
	var columns := HBoxContainer.new()
	columns.add_theme_constant_override("separation", 40)
	_body.add_child(columns)

	var left := VBoxContainer.new()
	left.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	left.size_flags_stretch_ratio = 1.3
	left.add_theme_constant_override("separation", 12)
	columns.add_child(left)
	left.add_child(_build_redacted_extract())
	var footnote := Label.new()
	footnote.text = "※ FULL TEXT AVAILABLE UPON COMPLETION OF IN-GAME MEMORY RECOVERY."
	footnote.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	footnote.add_theme_font_override("font", _tracked(ThemeService.font("mono"), 1.4))
	footnote.add_theme_font_size_override("font_size", 10)
	footnote.add_theme_color_override("font_color", ThemeService.color("cream_faint"))
	left.add_child(footnote)

	var right := VBoxContainer.new()
	right.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	right.add_theme_constant_override("separation", 10)
	columns.add_child(right)
	right.add_child(_eyebrow("WHAT DO YOU REMEMBER?", "brass"))
	var chosen := String(State.player()["inciting_incident"])
	if chosen == "":
		chosen = selected_incident
	for incident: Dictionary in Rules.cc_data().get("incidents", []):
		var id := String(incident["id"])
		right.add_child(_make_card(
			String(incident["title"]), String(incident["blurb"]), "",
			id == chosen,
			func() -> void: select_incident(id)))


func _build_redacted_extract() -> Control:
	var panel := PanelContainer.new()
	var style := StyleBoxFlat.new()
	style.bg_color = ThemeService.color("ink_3")
	style.border_color = ThemeService.color("rule")
	style.set_border_width_all(1)
	style.set_content_margin_all(24)
	panel.add_theme_stylebox_override("panel", style)
	var box := VBoxContainer.new()
	box.add_theme_constant_override("separation", 12)
	panel.add_child(box)

	var head := HBoxContainer.new()
	box.add_child(head)
	var eyebrow := _eyebrow("FILE EXTRACT · 09.2003", "brick_glow")
	eyebrow.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	head.add_child(eyebrow)
	var stamp := Label.new()
	stamp.text = "REDACTED"
	stamp.add_theme_font_override("font", _tracked(ThemeService.font("mono"), 2.0))
	stamp.add_theme_font_size_override("font_size", 10)
	stamp.add_theme_color_override("font_color", ThemeService.color("brick_glow"))
	head.add_child(stamp)

	var body := RichTextLabel.new()
	body.bbcode_enabled = true
	body.fit_content = true
	body.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	body.add_theme_font_override("normal_font", ThemeService.font("body"))
	body.add_theme_font_override("italics_font", ThemeService.font("body_italic"))
	body.add_theme_font_size_override("normal_font_size", 15)
	body.add_theme_font_size_override("italics_font_size", 15)
	body.add_theme_color_override("default_color", ThemeService.color("cream_soft"))
	var redact := ThemeService.color("redact").to_html(false)
	var block := func(width: int) -> String:
		return "[color=#%s]%s[/color]" % [redact, "█".repeat(width)]
	body.text = ("On the night of %s, the subject reported for debrief at %s in the " +
		"company of %s. Initial statements were consistent with the account given " +
		"by %s, however subsequent interviews revealed %s %s %s.\n\n" +
		"The subject's recollection of events between %s and %s hours remains " +
		"incomplete. Polygraph: [i][color=#%s]inconclusive[/color][/i]. Psychiatric " +
		"clearance: [color=#%s]granted[/color] on condition of %s.\n\n" +
		"The Branch considers the file [i]operationally closed[/i]. The subject does not.") % [
		block.call(6), block.call(9), block.call(11), block.call(8),
		block.call(5), block.call(12), block.call(7), block.call(4), block.call(4),
		ThemeService.color("brass").to_html(false),
		ThemeService.color("composed").to_html(false), block.call(10),
	]
	box.add_child(body)
	return panel


# --- Step 3: summary + signature (CC-500) ---------------------------------------

func _build_summary_step() -> void:
	var columns := HBoxContainer.new()
	columns.add_theme_constant_override("separation", 48)
	_body.add_child(columns)

	var left := VBoxContainer.new()
	left.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	left.size_flags_stretch_ratio = 1.4
	left.add_theme_constant_override("separation", 14)
	columns.add_child(left)

	var player := State.player()
	var grid := GridContainer.new()
	grid.columns = 2
	grid.add_theme_constant_override("h_separation", 24)
	grid.add_theme_constant_override("v_separation", 10)
	left.add_child(grid)
	var rows := [
		["NAME", "%s %s" % [player["first_name"], player["surname"]], "cream"],
		["CODENAME", String(player["codename"]), "cream"],
		["AGE", str(int(player["age"])), "cream"],
		["BACKGROUND", String(player["background"]), "cream"],
		["INCIDENT", String(player["inciting_incident"]), "cream"],
		["STATUS", "Cleared for deployment", "composed"],
	]
	for row: Array in rows:
		var key := _eyebrow(String(row[0]), "brass")
		key.custom_minimum_size.x = 130
		grid.add_child(key)
		var value := Label.new()
		value.text = String(row[1])
		value.add_theme_font_override("font", ThemeService.font("body"))
		value.add_theme_font_size_override("font_size", 16)
		value.add_theme_color_override("font_color", ThemeService.color(String(row[2])))
		grid.add_child(value)

	# Skills after the CC-400 rebuild — flashback grants included.
	# NYSE influence is deliberately NOT shown (hidden from the player).
	left.add_child(_eyebrow("ASSESSED SKILLS", "brick_glow"))
	var skills: Dictionary = player["skills"]
	var skills_grid := GridContainer.new()
	skills_grid.columns = 4
	skills_grid.add_theme_constant_override("h_separation", 18)
	skills_grid.add_theme_constant_override("v_separation", 6)
	left.add_child(skills_grid)
	for skill_name: String in State.SKILL_NAMES:
		var name_label := Label.new()
		name_label.text = String(skill_name).capitalize()
		name_label.custom_minimum_size.x = 130
		name_label.add_theme_font_override("font", ThemeService.font("body"))
		name_label.add_theme_font_size_override("font_size", 14)
		name_label.add_theme_color_override("font_color", ThemeService.color("cream_soft"))
		skills_grid.add_child(name_label)
		var level_label := Label.new()
		level_label.text = "LVL %d" % int(skills[skill_name]["level"])
		level_label.add_theme_font_override("font", ThemeService.font("mono"))
		level_label.add_theme_font_size_override("font_size", 13)
		level_label.add_theme_color_override("font_color",
			ThemeService.color("brass") if int(skills[skill_name]["level"]) > 0
			else ThemeService.color("cream_faint"))
		skills_grid.add_child(level_label)

	var right := VBoxContainer.new()
	right.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	right.add_theme_constant_override("separation", 16)
	columns.add_child(right)

	var slot := PanelContainer.new()
	var slot_style := StyleBoxFlat.new()
	slot_style.bg_color = Color.TRANSPARENT
	slot_style.border_color = ThemeService.color("brass_dim")
	slot_style.set_border_width_all(1)
	slot_style.set_content_margin_all(8)
	slot.add_theme_stylebox_override("panel", slot_style)
	slot.custom_minimum_size.y = 170
	var slot_label := Label.new()
	slot_label.text = "FINAL AVATAR\nCOMPOSITE"
	slot_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	slot_label.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	slot_label.add_theme_font_override("font", _tracked(ThemeService.font("mono"), 1.6))
	slot_label.add_theme_font_size_override("font_size", 10)
	slot_label.add_theme_color_override("font_color", ThemeService.color("brass_dim"))
	slot.add_child(slot_label)
	right.add_child(slot)

	right.add_child(_build_signature_block())

	var classified := Label.new()
	classified.text = "CLASSIFIED — Branch personnel file. Unauthorized access is an offence under the Security of Information Act."
	classified.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	classified.add_theme_font_override("font", ThemeService.font("body_italic"))
	classified.add_theme_font_size_override("font_size", 13)
	classified.add_theme_color_override("font_color", ThemeService.color("cream_faint"))
	_body.add_child(classified)


func _build_signature_block() -> Control:
	var panel := PanelContainer.new()
	var style := StyleBoxFlat.new()
	var wash := ThemeService.color("brass")
	wash.a = 0.04
	style.bg_color = wash
	style.border_color = ThemeService.color("brass_dim")
	style.set_border_width_all(1)
	style.set_content_margin_all(20)
	panel.add_theme_stylebox_override("panel", style)
	var box := VBoxContainer.new()
	box.add_theme_constant_override("separation", 8)
	panel.add_child(box)
	box.add_child(_eyebrow("SIGN", "brass"))

	var player := State.player()
	var sig := Label.new()
	sig.text = "%s %s" % [player["first_name"], player["surname"]]
	sig.add_theme_font_override("font", ThemeService.font("script"))
	sig.add_theme_font_size_override("font_size", 42)
	sig.add_theme_color_override("font_color", ThemeService.color("cream"))
	box.add_child(sig)
	box.add_child(_hrule())

	var date := State.date()
	var meta := Label.new()
	meta.text = "SIGNATURE · %02d.%02d.%d · BRANCH HQ" % [
		int(date["month"]), int(date["day"]), int(date["year"])]
	meta.add_theme_font_override("font", _tracked(ThemeService.font("mono"), 2.0))
	meta.add_theme_font_size_override("font_size", 10)
	meta.add_theme_color_override("font_color", ThemeService.color("cream_faint"))
	box.add_child(meta)
	return panel


# =========================================================================
# Shared builders / styling
# =========================================================================

## Option card (cc-bg-card): title + blurb + optional perks line, selected
## state = brick border + wash + SELECTED tag. Whole card is clickable.
func _make_card(title: String, blurb: String, perks: String, selected: bool,
		on_pick: Callable) -> Control:
	var card := PanelContainer.new()
	card.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	card.mouse_default_cursor_shape = Control.CURSOR_POINTING_HAND
	var style := StyleBoxFlat.new()
	style.bg_color = ThemeService.color("ink_3")
	style.border_color = ThemeService.color("rule")
	style.set_border_width_all(1)
	style.set_content_margin_all(18)
	if selected:
		var wash := ThemeService.color("brick")
		wash.a = 0.10
		style.bg_color = wash
		style.border_color = ThemeService.color("brick_glow")
	card.add_theme_stylebox_override("panel", style)
	card.gui_input.connect(func(event: InputEvent) -> void:
		var mouse := event as InputEventMouseButton
		if mouse != null and mouse.pressed and mouse.button_index == MOUSE_BUTTON_LEFT:
			on_pick.call())

	var box := VBoxContainer.new()
	box.mouse_filter = Control.MOUSE_FILTER_IGNORE
	box.add_theme_constant_override("separation", 6)
	card.add_child(box)

	var head := HBoxContainer.new()
	head.mouse_filter = Control.MOUSE_FILTER_IGNORE
	box.add_child(head)
	var title_label := Label.new()
	title_label.text = title
	title_label.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	title_label.mouse_filter = Control.MOUSE_FILTER_IGNORE
	title_label.add_theme_font_override("font", ThemeService.font("display_italic"))
	title_label.add_theme_font_size_override("font_size", 24)
	title_label.add_theme_color_override("font_color", ThemeService.color("cream"))
	head.add_child(title_label)
	if selected:
		var tag := Label.new()
		tag.text = "SELECTED"
		tag.mouse_filter = Control.MOUSE_FILTER_IGNORE
		tag.add_theme_font_override("font", _tracked(ThemeService.font("ui"), 2.2))
		tag.add_theme_font_size_override("font_size", 10)
		tag.add_theme_color_override("font_color", ThemeService.color("cream"))
		var tag_style := StyleBoxFlat.new()
		tag_style.bg_color = ThemeService.color("brick")
		tag_style.content_margin_left = 10
		tag_style.content_margin_right = 10
		tag_style.content_margin_top = 3
		tag_style.content_margin_bottom = 3
		tag.add_theme_stylebox_override("normal", tag_style)
		head.add_child(tag)

	var blurb_label := Label.new()
	blurb_label.text = blurb
	blurb_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	blurb_label.mouse_filter = Control.MOUSE_FILTER_IGNORE
	blurb_label.add_theme_font_override("font", ThemeService.font("body"))
	blurb_label.add_theme_font_size_override("font_size", 14)
	blurb_label.add_theme_color_override("font_color", ThemeService.color("cream_soft"))
	box.add_child(blurb_label)

	if perks != "":
		var perks_label := Label.new()
		perks_label.text = perks
		perks_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
		perks_label.mouse_filter = Control.MOUSE_FILTER_IGNORE
		perks_label.add_theme_font_override("font", _tracked(ThemeService.font("ui"), 1.8))
		perks_label.add_theme_font_size_override("font_size", 11)
		perks_label.add_theme_color_override("font_color", ThemeService.color("brass"))
		box.add_child(perks_label)
	return card


func _make_input(value: String) -> LineEdit:
	var edit := LineEdit.new()
	edit.text = value
	edit.max_length = 24
	edit.custom_minimum_size = Vector2(320, 40)
	var style := StyleBoxFlat.new()
	style.bg_color = ThemeService.color("ink_3")
	style.border_color = ThemeService.color("rule")
	style.set_border_width_all(1)
	style.content_margin_left = 12
	style.content_margin_right = 12
	var focus := style.duplicate()
	focus.border_color = ThemeService.color("brass")
	edit.add_theme_stylebox_override("normal", style)
	edit.add_theme_stylebox_override("focus", focus)
	edit.add_theme_font_override("font", ThemeService.font("body"))
	edit.add_theme_font_size_override("font_size", 18)
	edit.add_theme_color_override("font_color", ThemeService.color("cream"))
	edit.add_theme_color_override("caret_color", ThemeService.color("brass"))
	return edit


func _eyebrow(text: String, color_token: String) -> Label:
	var label := Label.new()
	label.text = text
	label.add_theme_font_override("font", _tracked(ThemeService.font("ui_medium"), 2.4))
	label.add_theme_font_size_override("font_size", 11)
	label.add_theme_color_override("font_color", ThemeService.color(color_token))
	return label


func _hrule() -> Control:
	var rule := ColorRect.new()
	rule.color = ThemeService.color("rule")
	rule.custom_minimum_size.y = 1
	return rule


func _style_subtle_button(button: Button) -> void:
	var normal := StyleBoxFlat.new()
	normal.bg_color = Color.TRANSPARENT
	normal.border_color = ThemeService.color("brass_dim")
	normal.set_border_width_all(1)
	normal.content_margin_left = 14
	normal.content_margin_right = 14
	normal.content_margin_top = 7
	normal.content_margin_bottom = 7
	var hover := normal.duplicate()
	hover.border_color = ThemeService.color("brass")
	for state in ["normal", "pressed", "focus", "disabled"]:
		button.add_theme_stylebox_override(state, normal)
	button.add_theme_stylebox_override("hover", hover)
	button.add_theme_font_override("font", _tracked(ThemeService.font("ui"), 2.0))
	button.add_theme_font_size_override("font_size", 12)
	button.add_theme_color_override("font_color", ThemeService.color("brass"))
	button.add_theme_color_override("font_hover_color", ThemeService.color("cream"))


func _style_next_button(button: Button) -> void:
	var normal := StyleBoxFlat.new()
	normal.bg_color = ThemeService.color("brick")
	normal.border_color = ThemeService.color("brick_glow")
	normal.set_border_width_all(1)
	normal.content_margin_left = 18
	normal.content_margin_right = 18
	normal.content_margin_top = 7
	normal.content_margin_bottom = 7
	var hover := normal.duplicate()
	hover.bg_color = ThemeService.color("brick_glow")
	var disabled := normal.duplicate()
	disabled.bg_color = Color.TRANSPARENT
	disabled.border_color = ThemeService.color("rule")
	for state in ["normal", "pressed", "focus"]:
		button.add_theme_stylebox_override(state, normal)
	button.add_theme_stylebox_override("hover", hover)
	button.add_theme_stylebox_override("disabled", disabled)
	button.add_theme_font_override("font", _tracked(ThemeService.font("ui_medium"), 2.0))
	button.add_theme_font_size_override("font_size", 12)
	button.add_theme_color_override("font_color", ThemeService.color("cream"))
	button.add_theme_color_override("font_hover_color", ThemeService.color("cream"))
	button.add_theme_color_override("font_disabled_color", ThemeService.color("cream_faint"))


static func _tracked(base: Font, spacing_px: float) -> FontVariation:
	var variation := FontVariation.new()
	variation.base_font = base
	variation.spacing_glyph = int(spacing_px)
	return variation
