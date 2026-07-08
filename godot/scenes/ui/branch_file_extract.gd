class_name BranchFileExtract
extends PanelContainer
## Branch file extract document panel — native rendering of the twee
## extract passages (styling source: the preserved HTML in
## PHASE-1-CONVERSION-REPORT.md — dark ink-3 panel, hairline border, rotated
## rubber stamp, brick eyebrow, mono 12 body with solid redaction boxes,
## brass-italic "pending review", optional signature line).
##
## Data: godot/content/extracts/<extract_id>.json —
##   stamp:      { text, rotation_deg }
##   eyebrow:    String
##   paragraphs: [ { seg: [ {t|r|em} ] } | { variants: { <background>|else } } ]
##   signature:  String (optional)
## Segment forms: {"t": "prose"} plain, {"r": px} redaction box of that CSS
## pixel width, {"em": "text"} brass italic. A "variants" paragraph picks by
## State.player().background (falling back to "else") — man_occurrence_report
## flags RCMP vs OPP.

const EXTRACT_DIR := "res://content/extracts"
const MONO_SIZE := 12
const MONO_CHAR_WIDTH := 7.2  # JetBrains Mono advance ~0.6em at 12px

var extract_id: String = ""

var _data: Dictionary = {}
var _eyebrow: Label
var _stamp: Label
var _body: RichTextLabel


func _ready() -> void:
	_data = _load_data(extract_id)
	_build()
	ThemeService.mode_changed.connect(func(_m: String) -> void: _restyle())
	_restyle()


func _load_data(id: String) -> Dictionary:
	var path := "%s/%s.json" % [EXTRACT_DIR, id]
	var file := FileAccess.open(path, FileAccess.READ)
	if file == null:
		push_error("BranchFileExtract: missing extract data '%s'" % path)
		return {}
	var parsed: Variant = JSON.parse_string(file.get_as_text())
	file.close()
	if parsed is not Dictionary:
		push_error("BranchFileExtract: unparseable extract data '%s'" % path)
		return {}
	return parsed


func _build() -> void:
	var box := VBoxContainer.new()
	box.add_theme_constant_override("separation", 14)
	add_child(box)

	var header := HBoxContainer.new()
	header.add_theme_constant_override("separation", 12)
	box.add_child(header)

	_eyebrow = Label.new()
	_eyebrow.text = String(_data.get("eyebrow", extract_id)).to_upper()
	_eyebrow.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	_eyebrow.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	header.add_child(_eyebrow)

	var stamp_data: Dictionary = _data.get("stamp", {})
	_stamp = Label.new()
	_stamp.text = String(stamp_data.get("text", "")).to_upper()
	_stamp.rotation_degrees = float(stamp_data.get("rotation_deg", -8))
	_stamp.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	_stamp.visible = _stamp.text != ""
	header.add_child(_stamp)

	_body = RichTextLabel.new()
	_body.bbcode_enabled = true
	_body.fit_content = true
	_body.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	_body.selection_enabled = true
	_body.custom_minimum_size.x = 600
	box.add_child(_body)


func _restyle() -> void:
	var style := StyleBoxFlat.new()
	style.bg_color = ThemeService.color("ink_3")
	style.border_color = ThemeService.color("rule")
	style.set_border_width_all(1)
	style.set_content_margin_all(28)
	add_theme_stylebox_override("panel", style)

	_eyebrow.add_theme_font_override("font", _tracked(ThemeService.font("ui_medium"), 2.4))
	_eyebrow.add_theme_font_size_override("font_size", ThemeService.font_size("ui"))
	_eyebrow.add_theme_color_override("font_color", ThemeService.color("brick"))

	var stamp_style := StyleBoxFlat.new()
	stamp_style.bg_color = Color.TRANSPARENT
	stamp_style.border_color = ThemeService.color("brick")
	stamp_style.set_border_width_all(2)
	stamp_style.content_margin_left = 10
	stamp_style.content_margin_right = 10
	stamp_style.content_margin_top = 3
	stamp_style.content_margin_bottom = 3
	_stamp.add_theme_stylebox_override("normal", stamp_style)
	_stamp.add_theme_font_override("font", _tracked(ThemeService.font("ui_medium"), 2.5))
	_stamp.add_theme_font_size_override("font_size", 14)
	_stamp.add_theme_color_override("font_color", ThemeService.color("brick"))
	_stamp.modulate = Color(1, 1, 1, 0.85)
	_stamp.pivot_offset = _stamp.size / 2.0

	_body.add_theme_font_override("normal_font", ThemeService.font("mono"))
	_body.add_theme_font_size_override("normal_font_size", MONO_SIZE)
	_body.add_theme_font_override("italics_font", ThemeService.font("body_italic"))
	_body.add_theme_font_size_override("italics_font_size", MONO_SIZE + 1)
	_body.add_theme_color_override("default_color", ThemeService.color("cream_soft"))
	_body.add_theme_constant_override("line_separation", 9)
	_render_body()


func _render_body() -> void:
	_body.clear()
	var background := String(State.player().get("background", ""))
	var blocks: Array[String] = []
	for paragraph in _data.get("paragraphs", []):
		var segments: Array = []
		if (paragraph as Dictionary).has("variants"):
			var variants: Dictionary = paragraph["variants"]
			segments = variants.get(background, variants.get("else", []))
		else:
			segments = paragraph.get("seg", [])
		blocks.append(_render_segments(segments))
	var text := "\n\n".join(blocks)
	var signature := String(_data.get("signature", ""))
	if signature != "":
		text += "\n\n\n%s" % signature
	_body.append_text(text)


func _render_segments(segments: Array) -> String:
	var out := ""
	for segment: Dictionary in segments:
		if segment.has("t"):
			out += String(segment["t"])
		elif segment.has("r"):
			out += _redaction(int(segment["r"]))
		elif segment.has("em"):
			out += "[color=%s][i]%s[/i][/color]" % [
				ThemeService.color("brass").to_html(false), String(segment["em"]),
			]
	return out


## Solid redaction box approximating a CSS `width: <px>` span — a run of
## non-breaking spaces under [bgcolor], sized by the mono advance width.
func _redaction(width_px: int) -> String:
	var chars := maxi(3, roundi(width_px / MONO_CHAR_WIDTH))
	var redact_color := ThemeService.color("redact").to_html(false)
	return "[bgcolor=#%s]%s[/bgcolor]" % [redact_color, String.chr(0x00A0).repeat(chars)]


static func _tracked(base: Font, spacing_px: float) -> FontVariation:
	var variation := FontVariation.new()
	variation.base_font = base
	variation.spacing_glyph = int(spacing_px)
	return variation
