extends Node
## godot-ink v1.1.2 compatibility spike (Phase 0.5, deliverable A).
##
## Proves six capabilities from GDScript against the real addon, printing
## one "SPIKE n PASS/FAIL — name" line per capability, then quits with
## exit code 0 (all pass) or 1.
##
## Run headless:
##   & <godot.exe> --headless --path godot res://spike/spike.tscn

var _results: Dictionary = {}
var _observed: Dictionary = {}
var _ext_calls: Array = []


## Named methods instead of lambdas: GDScript lambda Callables arrive as
## null::null across the godot-ink C# marshalling boundary (4.7 + v1.1.2);
## bound-method Callables survive it.
func _spike_boost(x: int) -> int:
	_ext_calls.append(x)
	return x * 10


func _on_mood_changed(variable_name: String, value) -> void:
	_observed[variable_name] = value


func _ready() -> void:
	# (1) Load the compiled InkStory resource.
	var story = load("res://spike/spike.ink")
	_record(1, "load compiled InkStory resource",
		story != null and story.has_method("ContinueMaximally"))
	if story == null:
		_finish()
		return

	# (4) External function binding — must be bound before the first continue.
	story.BindExternalFunction("spike_boost", _spike_boost)

	# (2) continue / continue_maximally text retrieval.
	var text: String = story.ContinueMaximally()
	_record(2, "continue/continue_maximally text retrieval",
		text.contains("Hello from ink."))
	_record(4, "external function binding (GDScript callable from ink EXTERNAL)",
		_ext_calls == [2] and text.contains("Boost returned 20."))

	# (3) Choices list + choosing by index.
	var choices = story.GetCurrentChoices()
	var ok3: bool = choices.size() == 2 \
		and choices[0].GetText() == "Go left." \
		and choices[1].GetText() == "Go right." \
		and choices[0].GetIndex() == 0
	story.ChooseChoiceIndex(0)
	var after_choice: String = story.ContinueMaximally()
	ok3 = ok3 and after_choice.contains("You went left")
	_record(3, "choices list + choosing by index", ok3)

	# (5) Get / set / observe an ink variable from GDScript.
	var mood_before = story.FetchVariable("mood")
	story.ObserveVariable("mood", _on_mood_changed)
	story.StoreVariable("mood", "spiked")
	_record(5, "get/set/observe ink variable from GDScript",
		str(mood_before) == "steady"
		and str(story.FetchVariable("mood")) == "spiked"
		and str(_observed.get("mood", "")) == "spiked")

	# (6) Full story-state save + restore round-trip.
	# We are mid-story: left branch, one choice ("Strike a match.") pending.
	var saved: String = story.SaveState()
	story.ResetState()
	var restarted: String = story.ContinueMaximally()
	var reset_ok: bool = restarted.contains("Hello from ink.") \
		and str(story.FetchVariable("mood")) == "steady"
	story.LoadState(saved)
	var restored_choices = story.GetCurrentChoices()
	_record(6, "story-state save + restore round-trip (position preserved)",
		saved.length() > 0
		and reset_ok
		and restored_choices.size() == 1
		and restored_choices[0].GetText() == "Strike a match."
		and str(story.FetchVariable("mood")) == "spiked")

	_finish()


func _record(index: int, capability: String, passed: bool) -> void:
	_results[index] = {"name": capability, "passed": passed}


func _finish() -> void:
	var all_passed := true
	for index in range(1, 7):
		var result: Dictionary = _results.get(index, {"name": "(not run)", "passed": false})
		var passed: bool = result["passed"]
		all_passed = all_passed and passed
		print("SPIKE %d %s — %s" % [index, "PASS" if passed else "FAIL", result["name"]])
	get_tree().quit(0 if all_passed else 1)
