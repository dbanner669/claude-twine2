// EXTERNAL declarations for the command/query surface (STATE-SCHEMA.md).
// Commands are stateful and lookahead-unsafe; queries are pure and
// lookahead-safe. StoryBridge binds every one of these before the first
// Continue().

// --- Commands (the ONLY mutation path) ---
EXTERNAL set_time(slot)
EXTERNAL set_date(year, month, day, slot)
EXTERNAL advance_time(count)
EXTERNAL advance_days(count, slot)
EXTERNAL reset_composure()
EXTERNAL set_composure(value)
EXTERNAL adjust_composure(delta)
EXTERNAL grant_skill(name, delta)
EXTERNAL add_tag(tag)
EXTERNAL add_kink(kink)
EXTERNAL add_quirk(quirk)
EXTERNAL adjust_influence(delta)
EXTERNAL set_header(location, time_label)
EXTERNAL toast(kind, text)

// --- Sizzle suspicion/reputation (SUSPICION-MODEL.md) ---
EXTERNAL sizzle_suspicion(delta)
EXTERNAL sizzle_reputation(delta)
EXTERNAL sizzle_access(level)
EXTERNAL sizzle_reset()

// --- Avatar (AVATAR-MANIFEST.md runtime API; asset/outfit/expression ids
//     validated against godot/avatar/manifest.json at call time) ---
EXTERNAL avatar_set_slot(slot, asset_id)
EXTERNAL avatar_apply_outfit(outfit_id)
EXTERNAL avatar_set_expression(expression_id)
EXTERNAL avatar_clear()

// --- Queries (pure, no side effects) ---
EXTERNAL has_tag(tag)
EXTERNAL has_kink(kink)
EXTERNAL has_quirk(quirk)
EXTERNAL skill_level(name)

// ============================================================================
// Inky/inklecate fallbacks. When the story runs OUTSIDE Godot (Inky's live
// play pane, console inklecate -p), no external bindings exist and ink falls
// back to these same-name functions, so playtesting works: commands no-op,
// queries return neutral defaults. Inside Godot, StoryBridge binds every
// external before the first Continue(), so these are never called there —
// the differential suite guards that.
// ============================================================================

=== function set_time(slot) ===
~ return

=== function set_date(year, month, day, slot) ===
~ return

=== function advance_time(count) ===
~ return

=== function advance_days(count, slot) ===
~ return

=== function reset_composure() ===
~ return

=== function set_composure(value) ===
~ return

=== function adjust_composure(delta) ===
~ return

=== function grant_skill(name, delta) ===
~ return

=== function add_tag(tag) ===
~ return

=== function add_kink(kink) ===
~ return

=== function add_quirk(quirk) ===
~ return

=== function adjust_influence(delta) ===
~ return

=== function set_header(location, time_label) ===
~ return

=== function toast(kind, text) ===
~ return

=== function sizzle_suspicion(delta) ===
~ return

=== function sizzle_reputation(delta) ===
~ return

=== function sizzle_access(level) ===
~ return

=== function sizzle_reset() ===
~ return

=== function avatar_set_slot(slot, asset_id) ===
~ return

=== function avatar_apply_outfit(outfit_id) ===
~ return

=== function avatar_set_expression(expression_id) ===
~ return

=== function avatar_clear() ===
~ return

=== function has_tag(tag) ===
~ return false

=== function has_kink(kink) ===
~ return false

=== function has_quirk(quirk) ===
~ return false

=== function skill_level(name) ===
~ return 0
