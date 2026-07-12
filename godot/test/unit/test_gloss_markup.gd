extends GutTest
## GameShell._decorate_gloss — display-time brass wrapping of generated
## [url=gloss:KEY]label[/url] spans (parity-polish pass; PARITY-MATRIX
## glossary row). The generated ink itself must never be edited.

const GameShellScript := preload("res://scenes/game_shell.gd")
const HEX := "b8945e"


func test_wraps_single_term() -> void:
	var got: String = GameShellScript._decorate_gloss(
		"An [url=gloss:NYSE]NYSE[/url] file.", HEX)
	assert_eq(got, "An [color=#b8945e][url=gloss:NYSE]NYSE[/url][/color] file.")


func test_wraps_multiple_terms_in_one_line() -> void:
	var got: String = GameShellScript._decorate_gloss(
		"[url=gloss:Sault]Soo[/url] to [url=gloss:U of T]U of T[/url].", HEX)
	assert_eq(got,
		"[color=#b8945e][url=gloss:Sault]Soo[/url][/color] to " +
		"[color=#b8945e][url=gloss:U of T]U of T[/url][/color].")


func test_term_with_spaces_in_key_and_label() -> void:
	var got: String = GameShellScript._decorate_gloss(
		"an [url=gloss:OC Transpo]OC Transpo[/url] bus", HEX)
	assert_eq(got,
		"an [color=#b8945e][url=gloss:OC Transpo]OC Transpo[/url][/color] bus")


func test_line_without_terms_passes_through() -> void:
	var line := "No terms here, just [i]italics[/i] and a $ sign."
	assert_eq(GameShellScript._decorate_gloss(line, HEX), line)


func test_empty_line_passes_through() -> void:
	assert_eq(GameShellScript._decorate_gloss("", HEX), "")
