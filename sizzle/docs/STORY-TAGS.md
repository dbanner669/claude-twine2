# Sizzle — Story Tags, Quirks, and Kinks Reference

Project reference document for player-carried narrative flags.

This file is for writers/designers/developers only. It is not read by the game at runtime.

## Scope

This document tracks three different kinds of player state:

- `storyTags` — broad narrative flags that represent meaningful background or story history and can be checked later for dialogue, description, gating, or NPC reactions.
- `quirks` — personality traits or character tendencies.
- `kinks` — sexual preferences, interests, or discovered tastes.

Important: these are **not** the same thing as Twine passage tags like `[daytime]`, `[avatar-hidden]`, or `[character-creation]`.

Current storage locations in game state:

- `$player.storyTags`
- `$player.quirks`
- `$player.kinks`

## Story Tags

These are the currently implemented player story tags in source.

| Tag | Source | Current assignment rule | Intended meaning / future use |
|-----|--------|-------------------------|-------------------------------|
| `Northern Ontario` | Character creation background | Assigned if the player chooses `RCMP constable` | The player has roots and lived experience connected to Northern Ontario. Useful for regional familiarity, tone, recognition, and grounded cultural/social references. |
| `City Dweller` | Character creation background | Assigned if the player chooses `CSIS analyst`, `grad student`, or `unemployed after university` | The player is more urban-oriented in background and default frame of reference. Useful for reactions to cities, institutions, nightlife, crowds, and social texture. |
| `Lived in Toronto` | Character creation background | Assigned if the player chooses `grad student` or `unemployed after university` | The player has prior lived experience in Toronto. Useful for neighborhood familiarity, transit knowledge, local memory, and city-specific internal narration. |

### Implementation Notes

- Background-derived story tags are currently rebuilt in `CC-500 Summary`, so they stay accurate if the player goes back and changes backgrounds during character creation.
- When adding new background-derived tags, update the same rebuild logic so obsolete tags do not linger after a change.

## Quirks

Quirks exist structurally in `$player.quirks`, but no concrete quirk values have been implemented in source yet.

Current status:

- No active quirk entries assigned during character creation
- No quirk checks currently used in story passages

Use quirks for:

- personality shading
- internal narration tone
- small dialogue variants
- recurring behavioral tendencies

## Kinks

Kinks exist structurally in `$player.kinks`, but no concrete kink values have been implemented in source yet.

Current status:

- No active kink entries assigned during character creation
- No kink checks currently used in story passages

Use kinks for:

- sexual preference tracking
- attraction or curiosity patterns
- NPC-specific chemistry or compatibility
- later-choice unlocks, temptations, and scene variation

## Maintenance

When adding a new `storyTag`, `quirk`, or `kink`:

1. Add it to this file.
2. Note where it is assigned.
3. Note what it is meant to signal in narrative terms.
4. If it is mutually exclusive with another entry, document that here.
