# State Schema Contract (Phase 0, artifact 1 of 4)

Status: **draft — pending human sign-off**. Source of truth for canonical game state in the Godot build. Derived from `src/story/variables.twee` as of the greenfield decision; names normalized to snake_case.

## Ownership model

One GDScript autoload (`State`) owns the canonical dictionary. **Reads are mirrored, writes are commands:** the engine pushes the mirror set (below) into ink variables; ink mutates engine state only through the command surface (external functions). Mirrored variables are projections — the linter forbids `~ mirrored_var =` assignments in ink.

## Canonical tree

`schema_version: 1` at the root. Version check runs before any save is read; greybox saves may be wiped on version bump, but the check exists from the first save ever written.

```
player:
  age: int (27)          first_name: String ("Alex")     surname: String ("Morgan")
  background: String     nationality: String              complexion: String
  inciting_incident: String        codename: String
  cover: { firstname, known_as, surname: String }
  arousal: int (0-3)
  baseline_composure: int          current_composure: int   # clamp 0..7 (COMPOSURE_MIN/MAX)
  skills: { academic, agent, athlete, confrontation, charmer, streetwise,
            composure, sexology : { level: int, xp: int, specialities: Array } }
  kinks: Array[String]   quirks: Array[String]   story_tags: Array[String]
  status_effects: Array  achievements: Array     personal_bio: Array
  is_wearing: Array      piercings: Array        tattoos: Array
  hair_colour, hair_style, eye_colour, eye_shape, face_shape,
  nose_shape, mouth_shape: String   # greybox-locked; consumed by avatar manifest
sizzle:  { suspicion: int, access_level: int, reputation: int }
nyse:    { influence: int, power: int }          # hidden from player
date:    { year: int, month: int, day: int, slot: String }
         # day_of_week is DERIVED (recomputed on every change), not stored
header:  { location: String, time: String, status: String, weather: String }
```

### Dropped from the SugarCube tree (with replacements)

| SugarCube | Disposition |
|---|---|
| `$player.flags` (one-shot latches) | **Dropped.** The latch pattern existed because SugarCube re-executed passage code on revisit. Forward re-entry one-shots use ink visit counts / `{once:}`; backward navigation restores the choice-commit snapshot, un-firing everything in the frame |
| `$temp`, `_temp` vars | ink `temp` variables / scene-local GDScript |
| `$avatar` 6-array system | Superseded by the Option 2 explicit slots — see AVATAR-MANIFEST.md |
| `$ui.avatarSize / textSize` | Dropped (were already hidden in Settings). Fixed 16:9 stage; revisit only if a text-size control returns |
| `$imagePath` | Godot resource paths; constants, not state |
| `$notifications`, `$statistics` | Engine-internal (toast queue is transient; statistics an engine dict, not in the mirror set) |
| `setup.*` (name lists, month names, slot labels, glossary) | Static data → Godot resources (`content/data/*.json` or `.tres`). Glossary keys/definitions move verbatim |

## Mirror set (engine → ink, read-only in ink)

Scalars only; collections are queried, never mirrored.

```
background, inciting_incident, arousal,
baseline_composure, current_composure,
nyse_influence,
date_slot, day_of_week,
player_name (first_name), player_full_name, cover_known_as, codename
```

Pushed: at story load, after every command op, and on save-restore. Declared in a **generated** `mirror.ink` include — hand-editing it is a lint error.

## Query surface (ink → engine, pure, no side effects)

```
has_tag(t) / has_kink(k) / has_quirk(q) -> bool
skill_level(name) -> int
```

## Command surface (ink → engine, stateful; the ONLY mutation path)

| Op | Semantics (ported from macros.js) |
|---|---|
| `set_time(slot)` / `set_date(y,m,d,slot)` | Set slot / full date; recompute day_of_week; **no** composure reset |
| `advance_time(n)` / `advance_days(n, slot)` | Advance slots/days; `later_night` rolls into next day; **day-crossing resets current_composure to baseline** |
| `reset_composure()` / `set_composure(v)` / `adjust_composure(d)` | Clamped to 0..7 |
| `grant_skill(name, delta)` | Level bump; pair with ink `{once:}` for one-shot grants |
| `add_tag(t)` / `add_kink(k)` / `add_quirk(q)` | Append-if-absent |
| `adjust_influence(d)` | `nyse.influence` mutation (no decay, ever) |
| `set_header(location, time_label)` (+ optional status/weather variants) | Header presentation state |
| `toast(kind, text)` | info/success/warn/hot notification |
| Avatar ops | See AVATAR-MANIFEST.md (`set_slot`, `apply_outfit`, `set_expression`, …) |

Every command triggers a mirror push before ink continues.

## Save format

```
{ schema_version, engine_state, ink_state_json, current_knot,
  history: [ { engine_snapshot, ink_snapshot, knot } ... ] }
```

History atom = **choice commit** (fixed decision in GODOT-PORT-PLAN.md): snapshot at knot entry; back = restore the entry frame. Explicit GUT tests required for back/load across: a skill check, a one-shot grant, a day-crossing.

## Open questions for sign-off

1. Mirror `nyse_influence` now (cheap, hidden from player anyway) or only when content first conditions on it? **Draft says: mirror now.**
2. `attributes: {}` exists in the tree but nothing writes it yet — keep as reserved or drop until used? **Draft says: drop; re-add with schema bump when a system needs it.**
