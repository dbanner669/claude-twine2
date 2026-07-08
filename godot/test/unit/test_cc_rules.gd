extends GutTest
## Character-creation rules (Phase 5) — the twee CC-400-top rebuild semantics
## ported to Rules.cc_* (sizzle/src/content/character-creator.twee):
##   - reset-then-derive rebuild is idempotent and never stacks on revisit
##   - per-background bonuses / story tags match the twee switch exactly
##   - a flashback grant applied AFTER the rebuild survives to finalize
##     (rebuild is upstream of the flashback and never re-runs after it)


func before_each() -> void:
	State.reset()


# --- cc.json data ------------------------------------------------------------

func test_cc_data_loads_and_is_complete() -> void:
	var data := Rules.cc_data()
	assert_eq((data["backgrounds"] as Array).size(), 4, "four backgrounds")
	assert_eq((data["incidents"] as Array).size(), 4, "four incidents")
	assert_eq((data["first_names"] as Array).size(), 20)
	assert_eq((data["surnames"] as Array).size(), 20)
	assert_eq((data["codenames"] as Array).size(), 15)
	assert_eq(data["background_story_tags"],
		["Northern Ontario", "City Dweller", "Lived in Toronto"])
	for incident: Dictionary in data["incidents"]:
		assert_true(ResourceLoader.exists(String(incident["story"])),
			"incident story exists: %s" % incident["story"])


# --- cc_apply_identity ---------------------------------------------------------

func test_apply_identity_sets_fields() -> void:
	Rules.cc_apply_identity("Riley", "Nash", "Osprey")
	assert_eq(State.player()["first_name"], "Riley")
	assert_eq(State.player()["surname"], "Nash")
	assert_eq(State.player()["codename"], "Osprey")


func test_apply_identity_empty_arguments_keep_current_values() -> void:
	Rules.cc_apply_identity("Riley", "Nash", "Osprey")
	Rules.cc_apply_identity("", "  ", "")
	assert_eq(State.player()["first_name"], "Riley")
	assert_eq(State.player()["surname"], "Nash")
	assert_eq(State.player()["codename"], "Osprey")


# --- cc_rebuild_derived: per-background tables ---------------------------------

## Expected levels INCLUDE Branch training (+1 agent, +1 composure) — the
## twee applies it in the same CC-400 silent block.
const BACKGROUND_TABLE := {
	"RCMP constable": {
		"skills": {"confrontation": 2, "composure": 2, "athlete": 1, "agent": 1},
		"tags": ["Northern Ontario"],
	},
	"CSIS analyst": {
		"skills": {"agent": 3, "academic": 1, "composure": 2},
		"tags": ["City Dweller"],
	},
	"grad student": {
		"skills": {"academic": 2, "charmer": 1, "sexology": 1, "agent": 1, "composure": 1},
		"tags": ["City Dweller", "Lived in Toronto"],
	},
	"unemployed after university": {
		"skills": {"streetwise": 1, "sexology": 1, "composure": 2, "agent": 1},
		"tags": ["City Dweller", "Lived in Toronto"],
	},
}


func test_each_background_bonuses_and_story_tags() -> void:
	for background_id: String in BACKGROUND_TABLE:
		State.reset()
		Rules.cc_rebuild_derived(background_id)
		var expected: Dictionary = BACKGROUND_TABLE[background_id]
		assert_eq(State.player()["background"], background_id)
		for skill_name: String in State.SKILL_NAMES:
			var want: int = (expected["skills"] as Dictionary).get(skill_name, 0)
			assert_eq(State.skill_level(skill_name), want,
				"%s: %s level" % [background_id, skill_name])
		assert_eq(State.player()["story_tags"], expected["tags"],
			"%s: story tags" % background_id)


func test_rebuild_rejects_unknown_background() -> void:
	Rules.cc_rebuild_derived("astronaut")
	assert_push_error("unknown background 'astronaut'")
	assert_eq(State.player()["background"], State.default_state()["player"]["background"],
		"unknown background must change nothing")


# --- cc_rebuild_derived: idempotence / no stacking ------------------------------

func test_rebuild_twice_equals_rebuild_once() -> void:
	Rules.cc_rebuild_derived("RCMP constable")
	var after_once: Dictionary = State.player().duplicate(true)
	Rules.cc_rebuild_derived("RCMP constable")
	assert_eq(State.player(), after_once,
		"rebuild must be idempotent — revisiting CC-400 never stacks")


func test_rebuild_after_background_change_never_stacks() -> void:
	Rules.cc_rebuild_derived("RCMP constable")
	Rules.cc_rebuild_derived("grad student")
	var expected: Dictionary = BACKGROUND_TABLE["grad student"]
	for skill_name: String in State.SKILL_NAMES:
		assert_eq(State.skill_level(skill_name),
			int((expected["skills"] as Dictionary).get(skill_name, 0)),
			"switched background: %s derives from scratch" % skill_name)
	assert_eq(State.player()["story_tags"], expected["tags"],
		"old background's tags (Northern Ontario) removed on switch")


func test_rebuild_resets_xp_and_specialities() -> void:
	Rules.cc_rebuild_derived("CSIS analyst")
	State.player()["skills"]["agent"]["xp"] = 5
	(State.player()["skills"]["agent"]["specialities"] as Array).append("tailing")
	Rules.cc_rebuild_derived("CSIS analyst")
	assert_eq(int(State.player()["skills"]["agent"]["xp"]), 0)
	assert_eq(State.player()["skills"]["agent"]["specialities"], [])


func test_rebuild_preserves_non_background_story_tags() -> void:
	Rules.add_tag("Owns a Cat")
	Rules.cc_rebuild_derived("RCMP constable")
	assert_true((State.player()["story_tags"] as Array).has("Owns a Cat"),
		"only the three background-derived tags are reset")


# --- The ordering contract: rebuild -> flashback grant -> finalize ---------------

func test_flashback_grant_after_rebuild_survives_to_finalize() -> void:
	# CC-400: incident confirmed -> rebuild (upstream of the flashback).
	Rules.cc_rebuild_derived("RCMP constable")
	assert_eq(State.skill_level("composure"), 2, "background 1 + training 1")
	# Flashback: a plain += grant (ink grant_skill), exactly like BLK's
	# composure grant. Rebuild is NOT called again after this point.
	Rules.grant_skill("composure", 1)
	# CC-500 revisit equivalent: entering/signing the summary re-runs
	# finalize only — never the rebuild — so the grant must still be there.
	Rules.cc_finalize()
	assert_eq(State.skill_level("composure"), 3, "flashback grant survived")
	assert_eq(int(State.player()["baseline_composure"]), 3,
		"baseline copied AFTER the flashback includes the incident grant")
	assert_eq(int(State.player()["current_composure"]), 3,
		"current composure starts at baseline")


func test_finalize_is_idempotent() -> void:
	Rules.cc_rebuild_derived("grad student")
	Rules.cc_finalize()
	var baseline := int(State.player()["baseline_composure"])
	Rules.cc_finalize()
	assert_eq(int(State.player()["baseline_composure"]), baseline)
	assert_eq(int(State.player()["current_composure"]), baseline)
