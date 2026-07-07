extends GutTest
## check_modifier resolution (Phase 1 report follow-ups #1 and #3):
## slash-separated multi-skill specs resolve as max-of; "composure" reads
## Current Composure with the macros.js skill-level fallback.


func before_each() -> void:
	State.reset()


func test_single_skill_uses_level() -> void:
	State.player()["skills"]["streetwise"]["level"] = 3
	assert_eq(StoryBridge.check_modifier("streetwise"), 3)


func test_composure_reads_current_not_level() -> void:
	State.player()["skills"]["composure"]["level"] = 2
	State.player()["current_composure"] = 5
	assert_eq(StoryBridge.check_modifier("composure"), 5,
		"composure checks roll Current Composure (macros.js semantics)")


func test_composure_falls_back_to_level_when_current_missing() -> void:
	State.player()["skills"]["composure"]["level"] = 2
	State.player().erase("current_composure")
	assert_eq(StoryBridge.check_modifier("composure"), 2,
		"skill-level fallback when current_composure is not a number")


func test_multi_skill_resolves_max_of() -> void:
	State.player()["current_composure"] = 1
	State.player()["skills"]["streetwise"]["level"] = 4
	assert_eq(StoryBridge.check_modifier("composure/streetwise"), 4)
	assert_eq(StoryBridge.check_modifier("streetwise/composure"), 4,
		"max-of is order-independent")


func test_multi_skill_max_can_come_from_composure() -> void:
	State.player()["current_composure"] = 6
	State.player()["skills"]["agent"]["level"] = 2
	assert_eq(StoryBridge.check_modifier("composure/agent"), 6)
