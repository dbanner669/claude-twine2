extends Control
## Minimal Phase 0.5 slice player. Ugly is fine; correct is mandatory.
##
## Prose in a RichTextLabel, choices as buttons, a Roll button for # check
## knots, a Back button driving choice-commit snapshot restore, plus a bare
## status line (header/date/composure) and a toast label.

const SLICE_PATH := "res://content/slice/blackout_slice.ink"
const START_KNOT := "BLK_130"

var _status: Label
var _stub_banner: Label
var _prose: RichTextLabel
var _choices_box: VBoxContainer
var _roll_button: Button
var _back_button: Button
var _toast: Label


func _ready() -> void:
	_build_ui()
	StoryBridge.text_appended.connect(_on_text_appended)
	StoryBridge.choices_ready.connect(_on_choices_ready)
	StoryBridge.check_ready.connect(_on_check_ready)
	StoryBridge.knot_entered.connect(_on_knot_entered)
	StoryBridge.scene_stub.connect(_on_scene_stub)
	StoryBridge.flow_reset.connect(_on_flow_reset)
	StoryBridge.flow_ended.connect(_on_flow_ended)
	Rules.toast_requested.connect(_on_toast)
	StoryBridge.start(SLICE_PATH, START_KNOT)


func _build_ui() -> void:
	set_anchors_preset(Control.PRESET_FULL_RECT)

	var margin := MarginContainer.new()
	margin.set_anchors_preset(Control.PRESET_FULL_RECT)
	for side in ["margin_left", "margin_top", "margin_right", "margin_bottom"]:
		margin.add_theme_constant_override(side, 24)
	add_child(margin)

	var column := VBoxContainer.new()
	column.add_theme_constant_override("separation", 12)
	margin.add_child(column)

	_status = Label.new()
	column.add_child(_status)

	_stub_banner = Label.new()
	_stub_banner.visible = false
	_stub_banner.modulate = Color(1.0, 0.8, 0.4)
	column.add_child(_stub_banner)

	_prose = RichTextLabel.new()
	_prose.bbcode_enabled = true
	_prose.fit_content = false
	_prose.scroll_following = true
	_prose.size_flags_vertical = Control.SIZE_EXPAND_FILL
	column.add_child(_prose)

	_choices_box = VBoxContainer.new()
	_choices_box.add_theme_constant_override("separation", 6)
	column.add_child(_choices_box)

	_roll_button = Button.new()
	_roll_button.visible = false
	_roll_button.pressed.connect(_on_roll_pressed)
	column.add_child(_roll_button)

	var footer := HBoxContainer.new()
	footer.add_theme_constant_override("separation", 12)
	column.add_child(footer)

	_back_button = Button.new()
	_back_button.text = "Back"
	_back_button.pressed.connect(_on_back_pressed)
	footer.add_child(_back_button)

	_toast = Label.new()
	_toast.visible = false
	footer.add_child(_toast)


# --- Bridge signal handlers ---------------------------------------------------

func _on_text_appended(line: String) -> void:
	_prose.append_text(line + "\n\n")


func _on_choices_ready(choices: Array) -> void:
	_clear_choices()
	for choice in choices:
		var button := Button.new()
		button.text = String(choice["text"])
		var index := int(choice["index"])
		button.pressed.connect(func() -> void: StoryBridge.choose(index))
		_choices_box.add_child(button)


func _on_check_ready(check: Dictionary) -> void:
	_clear_choices()
	_roll_button.text = "Roll %s — %s check vs %d (skill +%d)" % [
		check["dice"], String(check["skill"]).capitalize(),
		int(check["target"]), State.skill_level(String(check["skill"])),
	]
	_roll_button.visible = true


func _on_knot_entered(knot: String, tags: Dictionary) -> void:
	_stub_banner.visible = false
	_refresh_status(knot, tags)


func _on_scene_stub(scene_kind: String, extract_id: String) -> void:
	# Placeholder for the native BranchFileExtract scene template.
	_stub_banner.text = "[ %s placeholder — %s ]" % [scene_kind, extract_id]
	_stub_banner.visible = true


func _on_flow_reset(_knot: String) -> void:
	_prose.clear()
	_clear_choices()
	_stub_banner.visible = false


func _on_flow_ended() -> void:
	_clear_choices()
	_prose.append_text("[center]— END OF SLICE —[/center]\n")


func _on_toast(kind: String, text: String) -> void:
	_toast.text = "[%s] %s" % [kind, text]
	_toast.visible = true
	var tween := create_tween()
	tween.tween_interval(3.6)
	tween.tween_callback(func() -> void: _toast.visible = false)


# --- Buttons -------------------------------------------------------------------

func _on_roll_pressed() -> void:
	_roll_button.visible = false
	StoryBridge.roll()
	_refresh_status(String(State.current_frame().get("knot", "")), {})


func _on_back_pressed() -> void:
	if not StoryBridge.go_back():
		_on_toast("info", "Nothing to go back to.")


# --- Helpers ---------------------------------------------------------------------

func _clear_choices() -> void:
	_roll_button.visible = false
	for child in _choices_box.get_children():
		child.queue_free()


func _refresh_status(knot: String, tags: Dictionary) -> void:
	var date := State.date()
	var header := State.header()
	_status.text = "%s  |  %s — %s %s/%s/%s (%s)  |  composure %d/%d  |  influence %d%s" % [
		knot,
		header["location"], Rules.day_of_week(),
		date["year"], date["month"], date["day"], date["slot"],
		int(State.player()["current_composure"]), int(State.player()["baseline_composure"]),
		int(State.data["nyse"]["influence"]),
		"  |  avatar: %s" % tags["avatar"] if tags.has("avatar") else "",
	]
