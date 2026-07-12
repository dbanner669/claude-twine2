# Sizzle Suspicion / Reputation Model — Design Proposal

Status: **IMPLEMENTED 2026-07-11 — approved design shipped in the Godot port, with the
human's locked §7 resolutions preserved.** First system of the Phase 7 systems track
(GODOT-PORT-PLAN.md). Pattern locked by the plan: simulation lives in GDScript (`Rules` +
`State`), exposed to ink only as mirrored variables and command ops; passages stay thin;
lands with GUT tests and normal review.

Sources: GDD §5 (access levels), §6 (key variables), §8 (Cover & Suspicion), §9 (act
structure); STATE-SCHEMA.md (fields already exist — no schema migration needed).

## 1. Scope

- **In:** `sizzle.suspicion`, `sizzle.reputation`, `sizzle.access_level` — semantics,
  clamps, bands, command surface, ink mirrors, threshold signals, GUT tests.
- **Out (later systems):** NPC schedules, per-NPC relationship tracks, club-night calendar,
  clothing/perception checks, NYSE↔suspicion coupling. Hooks are noted where they'll attach,
  nothing speculative gets built.
- **Timing:** implementable now against GUT + a debug harness; first *consumer* is Act 1
  content ("an operation to infiltrate the club's culture and get a job").

## 2. State semantics

All three fields already live in the canonical `State` dict (`sizzle.*`, schema v1) and
already start at 0. Proposed ranges and meaning:

| Field | Range | Meaning |
|---|---|---|
| `suspicion` | 0–10, clamped | Cumulative institutional suspicion of the player *by the club* (not per-NPC). GDD: high suspicion limits access, triggers confrontations, can end the operation. |
| `reputation` | 0–10, clamped | Social standing inside Sizzle's world. Earned; gates invitations and access-level advancement. |
| `access_level` | 0–3, ratchet (never auto-lowers) | GDD table: 0 public / 1 members / 2 inner circle / 3 the underneath. Granted by story beats, never by formula. |

### Suspicion bands (derived, not stored)

Same pattern as the composure status badge — a pure derivation `Rules.suspicion_band()`:

| Suspicion | Band | Intended authoring use |
|---|---|---|
| 0–2 | `unremarked` | Nothing sticks; default state |
| 3–5 | `noticed` | Staff remember her; light prose color, occasional probing questions |
| 6–8 | `watched` | Active attention; confrontation scenes become reachable, some options lock |
| 9–10 | `burned` | Operation-threat territory; content decides consequences (not an auto game-over) |

Bands are the ink-facing vocabulary (`{sizzle_band == "watched": ...}`); raw numbers stay an
implementation detail wherever possible, mirroring how composure badges work.

### Movement rules

- **No passive decay** for either value (matches the GDD's `nyse.influence` philosophy:
  time alone fixes nothing; specific player actions reduce suspicion via authored ops).
- Deltas are **authored, flat integers** at call sites (±1 typical, ±2 for serious slips).
  No hidden multipliers in v1 — arousal/NYSE modifiers attach to the *checks that precede*
  a suspicion op, not to the op itself, so trajectories stay differential-testable.
- **Reputation and suspicion are independent axes**, not a single slider — being popular
  and being suspected coexist by design (that tension is the Act 2 texture).
- Day-crossing does **not** touch either value (unlike current composure).

## 3. Command surface (ink → engine ops)

Four new external-function ops, INK-CONVENTIONS style, all clamping, all no-ops on
zero-delta, all emitting `state_changed`:

```
~ sizzle_suspicion(delta)     // ±n, clamped 0..10
~ sizzle_reputation(delta)    // ±n, clamped 0..10
~ sizzle_access(level)        // ratchet: max(current, level), 0..3
~ sizzle_reset()              // debug/test only; not for content
```

Choice-commit snapshots already give back/undo semantics for free (the Phase 0 fixed
decision) — no set-once latches needed.

## 4. Mirrors (engine → ink, read-only projections)

| ink variable | Source |
|---|---|
| `sizzle_suspicion` | raw int (authoring escape hatch) |
| `sizzle_reputation` | raw int |
| `sizzle_access` | raw int |
| `sizzle_band` | derived band string — the intended workhorse |

Pushed on every mutation through the existing mirror-sync path in `StoryBridge`.

## 5. Signals / UI

- `Rules.suspicion_band_changed(old_band, new_band)` — emitted on band transitions only.
  v1 UI consumers: none; the signal exists so Act 1 content and the eventual club-state
  system can attach programmatic consequences later without restructuring (per §7.3).
- **Directional change indicator (per §7.1):** every suspicion movement surfaces a
  player-facing indicator of direction only — v1 uses the existing toast system
  (`warn` kind rising, `info` kind easing), text at implementation's discretion,
  **never showing the number**. No running count anywhere player-facing: no header
  element, no CHARACTER-sheet row. Reputation gets no indicator in v1.
- No header/avatar UI change (the header badge stays composure's).

## 6. Tests (GUT, `test/unit/test_rules.gd` additions or a new `test_sizzle_rules.gd`)

- Clamp behavior at both ends for suspicion/reputation; access ratchet (grant 2 then 1 → 2).
- Band derivation across every boundary value (2/3, 5/6, 8/9).
- `suspicion_band_changed` fires exactly on transitions, not on same-band movement.
- Mirror sync: after each op, ink variables reflect engine state.
- Save/load round-trip preserves all three plus band derivation.
- Back-across-a-mutation restores the pre-choice value (choice-commit contract).

## 7. Design questions — RESOLVED (human, 2026-07-11)

1. **Visibility:** a player-facing **indicator when suspicion moves up or down**, but **no
   running count of the number** anywhere. (Implemented as the directional toast in §5;
   no persistent display, numeric or band, in v1.)
2. **Scale:** keep **0–10**, with the caveat that content may never actually use values
   above 6 — the 7–10 range (and the `burned` band) may stay unexercised early.
3. **`burned` consequences:** authored-only for now, **both authored and programmatic
   wanted in the final game** — do not architect in a way that excludes programmatic
   triggers later. (Satisfied by `suspicion_band_changed`: engine-forced consequences
   attach as listeners when wanted; nothing else needs restructuring.)
4. **Suspicion reduction:** confirmed — **no passive decay; it only goes down through
   authored ops.**
