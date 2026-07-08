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
