# Phase 6 Status — Content QA + Retirement Readiness

Date: 2026-07-07. Status: **content QA (mechanical) PASSED; prose review + retirement HELD pending human sign-off and parity discharge.**

Phase 6 has two halves with different owners. The mechanical half is done; the two things that actually close the phase are not mine to sign.

## 1. Mechanical content QA — CLEAN ✔

New tool `godot/tools/review_dump.{gd,tscn}` plays every sequence deterministically and writes the engine-rendered prose (choices taken, check outcomes, extract stubs annotated) to markdown — nine runs: briefing + each incident × {all-pass, all-fail}. Output committed under `sizzle/docs/godot/first-play/` and regenerable:

```
& <godot.exe> --headless --path godot res://tools/review_dump.tscn
# -> user://review/*.md  (also copied to sizzle/docs/godot/first-play/)
```

Automated defect scan (`_ISSUES.md`): **0 issues.** No unconverted twee macros, no unrendered ink conditionals, no raw `$` variables in any run. Every sequence reaches END; influence and skill trajectories match the locked calibration (BLK 1/2, MAN 2/3, PALE 1/2, WDS 2/3; one skill grant each). This corroborates the Phase 2 differential from the rendered-prose side.

Reviewer note: the dumps read `StoryBridge.transcript` (the ink prose), so file-extract knots show their **stub placeholder line** ("Rendered by the native BranchFileExtract scene template…"). In the running game the styled `BranchFileExtract` scene renders the real document there — the dump is for prose review, not extract-layout review (see the extract screenshots from Phase 3 for those).

## 2. Prose first-play review — YOURS (pending)

The four incident sequences and the briefing are now reachable in-game (Phase 5) and read correctly. The **prose-quality** sign-off — the "first-play review" the plan has carried since these sequences were drafted — is a human judgment I can't substitute for. The review packet in `sizzle/docs/godot/first-play/` is the fastest way to do it (read the rendered prose without driving the UI), or play it: `& <godot.exe> --path godot`.

Until you sign off on the prose, the four incidents stay "pending first-play review" as they have since the SugarCube era — the port didn't change that; it just made the review possible in the shipping engine.

## 3. SugarCube retirement — HELD (do not execute yet)

The plan gates retirement on "**every `port`/`rebuild` parity-matrix row demonstrably live in Godot.**" It is not, yet. Open rebuild rows:

- **Atmosphere overlays (vignette/grain)** — deferred at Phase 3; not ported. This is a live `rebuild` row.
- **Day-mode header bronze variant** — deferred at Phase 3.
- **Glossary dotted-underline brass term styling** — currently default link styling (tooltip itself matches).
- **Choice-row right chevron** — omitted (dash prefix / hover shift / brick glow present).

None are load-bearing, but the retirement rule is explicit, and archiving working tooling (Tweego build, Obsidian vault + scripts, FigJam sync, moving `sizzle/src` twee, rewriting CLAUDE.md/AGENTS.md) is hard to walk back. Two blockers, either sufficient to hold:

1. Parity matrix not fully discharged (above).
2. Human prose review (#2) not done — retiring the reference build before the content it's the reference for is signed off removes the differential safety net prematurely.

**Recommendation:** clear the deferred parity rows (a small Phase 3-style polish pass) and get the prose sign-off, *then* execute retirement as a clean, deliberate step. Retirement is intentionally left unexecuted this session.

## Verdict

Phase 6 mechanical QA gate: **PASSED.** Phase 6 as a whole remains **open** on the two human/polish items above. No content or runtime defects found.
