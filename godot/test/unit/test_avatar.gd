extends GutTest
## Phase 4 avatar runtime: manifest validation, the Rules avatar ops,
## slot-state snapshot semantics through the story, panel display precedence,
## and the explicit-layers setting.

const SLICE := "res://content/slice/blackout_slice.ink"


func before_each() -> void:
	State.reset()


# --- Manifest -----------------------------------------------------------------

func test_manifest_loads_and_validates() -> void:
	assert_true(AvatarManifest.valid, "manifest.json must validate")
	assert_eq(AvatarManifest.slots.size(), 15, "the Option 2 stack is 15 slots")
	assert_eq(AvatarManifest.canvas, Vector2i(523, 1536))
	assert_eq(AvatarManifest.asset_slot("tshirt-black"), "clothing_top")
	assert_true(AvatarManifest.phase_override_path("blk_night").ends_with("blackout-night.png"))
	assert_eq(AvatarManifest.phase_override_path("man_night"), "",
		"missing phase art resolves to empty (panel falls back)")


func test_resolve_slot_precedence() -> void:
	# Absent = base look; present-empty = cleared; present = override.
	assert_eq(AvatarManifest.resolve_slot("hair_back", {}), "hair-back-long-straight-brown")
	assert_eq(AvatarManifest.resolve_slot("hair_back", {"hair_back": ""}), "")
	assert_eq(AvatarManifest.resolve_slot("clothing_top", {"clothing_top": "tshirt-black"}), "tshirt-black")
	assert_eq(AvatarManifest.resolve_slot("clothing_top", {}), "",
		"slots outside the base look default to empty")


# --- Rules ops ------------------------------------------------------------------

func test_set_slot_valid_and_invalid() -> void:
	Rules.avatar_set_slot("clothing_top", "tshirt-black")
	assert_eq(String(State.data["avatar"]["clothing_top"]), "tshirt-black")

	Rules.avatar_set_slot("clothing_top", "jeans-dark")
	assert_push_error("belongs to slot")
	assert_eq(String(State.data["avatar"]["clothing_top"]), "tshirt-black",
		"wrong-slot asset must not apply")

	Rules.avatar_set_slot("hat", "tshirt-black")
	assert_push_error("unknown slot")
	Rules.avatar_set_slot("clothing_top", "nonexistent")
	assert_push_error("unknown asset")


func test_outfit_expression_clear() -> void:
	Rules.avatar_apply_outfit("street-casual")
	assert_eq(String(State.data["avatar"]["clothing_top"]), "tshirt-black")
	assert_eq(String(State.data["avatar"]["shoes"]), "sneakers")

	Rules.avatar_apply_outfit("underwear-only")
	assert_eq(String(State.data["avatar"]["clothing_top"]), "",
		"outfit null-slots clear explicitly")
	assert_eq(String(State.data["avatar"]["underwear"]), "underwear-basic")

	Rules.avatar_set_expression("smile")
	assert_eq(String(State.data["avatar"]["expression"]), "expression-smile")

	Rules.avatar_clear()
	assert_true((State.data["avatar"] as Dictionary).is_empty(), "clear = pure base look")

	Rules.avatar_apply_outfit("gala-gown")
	assert_push_error("unknown outfit")
	Rules.avatar_set_expression("smoulder")
	assert_push_error("unknown expression")


# --- Snapshot semantics through the story ------------------------------------------

func test_avatar_state_restores_on_back() -> void:
	# Choice-commit atom: back restores the PREVIOUS knot's ENTRY snapshot.
	# Outfit applied inside BLK_130's frame is part of BLK_135's entry state
	# (survives a back INTO BLK_135) but not BLK_130's own entry.
	StoryBridge.start(SLICE, "BLK_130")
	Rules.avatar_apply_outfit("street-casual")
	StoryBridge.choose(0)  # -> BLK_135 (entry snapshot includes the outfit)
	StoryBridge.choose(0)  # -> BLK_140
	Rules.avatar_set_expression("smile")

	assert_true(StoryBridge.go_back())  # restore BLK_135's entry
	assert_eq(String(State.current_frame().get("knot", "")), "BLK_135")
	assert_eq(String(State.data["avatar"].get("expression", "<absent>")), "<absent>",
		"expression set in the frame above must un-fire")
	assert_eq(String(State.data["avatar"].get("clothing_top", "")), "tshirt-black",
		"outfit inside an earlier committed frame survives")

	assert_true(StoryBridge.go_back())  # restore BLK_130's entry
	assert_eq(String(State.data["avatar"].get("clothing_top", "<absent>")), "<absent>",
		"backing into BLK_130 un-fires its own mid-frame outfit op")


# --- Panel display precedence --------------------------------------------------------

func _make_panel() -> AvatarPanel:
	var panel := AvatarPanel.new()
	add_child_autofree(panel)
	return panel


func test_panel_phase_override_beats_stack() -> void:
	var panel := _make_panel()
	Rules.avatar_apply_outfit("street-casual")
	panel.set_phase("blk_night")
	assert_false(panel._layer_holder.visible)
	assert_true(panel._portrait.visible)


func test_panel_stack_when_state_in_use() -> void:
	var panel := _make_panel()
	Rules.avatar_apply_outfit("street-casual")
	panel.set_phase("")
	assert_true(panel._layer_holder.visible)
	assert_false(panel._portrait.visible)
	var top: TextureRect = panel._layer_rects["clothing_top"]
	assert_not_null(top.texture, "outfit layer must render")


func test_panel_placeholder_for_untouched_state_and_unknown_phase() -> void:
	var panel := _make_panel()
	panel.set_phase("")
	assert_true(panel._portrait.visible, "pure default state shows the placeholder portrait")
	panel.set_phase("man_night")
	assert_true(panel._portrait.visible, "unknown phase id falls back to placeholder")
	assert_false(panel._layer_holder.visible)


func test_panel_explicit_layers_follow_setting() -> void:
	var panel := _make_panel()
	Rules.avatar_apply_outfit("underwear-only")
	var previous := Settings.explicit_layers_visible()

	Settings.set_explicit_layers_visible(false)
	panel.set_phase("")
	var nipples: TextureRect = panel._layer_rects["nipples"]
	assert_null(nipples.texture, "explicit slots hidden when the setting is off")

	Settings.set_explicit_layers_visible(true)
	assert_not_null(nipples.texture, "setting change re-renders explicit slots")

	Settings.set_explicit_layers_visible(previous)
