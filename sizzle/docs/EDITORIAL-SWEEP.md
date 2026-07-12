# Editorial Sweep — Process Template

> **Since SugarCube retirement (2026-07-11), prose source is ink at `godot/content/*.ink`**
> — sweeps operate on the ink files directly. Path references to `sizzle/src/` in this
> template and in past audit reports are twee-era; the workflow itself is unchanged in
> substance.

How to run a style-guide audit against existing Sizzle prose and convert findings into source edits. The process is staged so the human approves before any source touches happen.

The source of truth for *what* counts as a finding is [STYLE-GUIDE.md](STYLE-GUIDE.md). This doc is *how* an audit happens — the workflow, the stage-gates, and the local conventions a sweep agent needs to know.

The first worked example is [STYLE-AUDIT-2026-05-26.md](STYLE-AUDIT-2026-05-26.md), produced against the playable greybox. Read it alongside this doc for what a finished audit looks like in practice.

---

## 1. When to run a sweep

- Major scope of prose has just landed (a new act, a new Sizzle interior, a new NPC's first sustained dialogue) and you want a full check before locking.
- The style guide has been substantively updated and you want to know where the existing prose drifted from the new rules.
- A specific AI-tell pattern is suspected to have spread and you want a targeted hunt.
- A new NPC voice profile has gone in and you want all that NPC's dialogue audited against the profile.

Not for: line-by-line copy-edit passes on freshly drafted prose. Use the mandatory-checks list in [STYLE-GUIDE.md §15](STYLE-GUIDE.md) for that during drafting.

---

## 2. Stage 0 — Setup and scope

Before reading any prose:

1. **Read the rulebooks in order.**
   - [STYLE-GUIDE.md](STYLE-GUIDE.md) in full. Every rule, every AI-tell, every mandatory check. This is the spec.
   - [WRITING.md](WRITING.md) for current-scope snapshot.
   - [CLAUDE.md](../CLAUDE.md) "Writing Conventions" section + project-quirk notes (spaced em-dashes, two-spaces-after-periods house style — these are NOT to be flagged).
   - Any NPC profile docs relevant to the scope ([NPC-handler.md](NPC-handler.md) for Robert; future NPCs as they appear).

2. **Define scope precisely.** Which files, which passages, which clusters. Name them.

3. **Define what NOT to audit.** Standard exclusions:
   - SugarCube macro logic (`<<if>>`, `<<set>>`, `<<goto>>`, etc.) — mechanical, not prose.
   - HTML/CSS in character-creator dossier passages — design system, not writing.
   - Variable interpolations themselves (`$player.firstName` etc.).
   - Placeholder content explicitly marked as TBD (e.g. `//To be written.//`, redacted file-extract blocks).
   - Anything the human has named "out of scope" at session start.

4. **House-style overrides — do NOT flag these:**
   - Spaced em-dashes (` — `) per [STYLE-GUIDE.md §7.1](STYLE-GUIDE.md) project override.
   - Two spaces after periods in source per [STYLE-GUIDE.md §7.2](STYLE-GUIDE.md) project quirk.
   - Existing glossary/tag/quirk/kink terms — the human controls these; flag candidates as `[! glossary candidate: ...]` style notes, do NOT propose adding them.

5. **Hard rule: do not edit source files during the audit.** The deliverable is the report. Source edits are a *separate, named action* the human authorizes after the audit lands ("apply this fix" / "implement all of the changes").

---

## 3. Stage 1 — Preview

After reading the rulebooks and all in-scope prose, **stop before writing the full report** and post a preview to chat.

The preview must include:

- **Overall impression** of the prose in one short paragraph.
- **Total finding count**, broken down by severity (hard violation / AI-ism / light call) and by passage cluster.
- **3–5 representative findings** as concrete cards (passage, offending quote, severity, one-line proposed fix) so the human can calibrate whether your standards match theirs.
- **Scope ambiguities** — passages or call types you weren't sure how to handle. Surface them now.
- **Systemic patterns** — anything that appears repeatedly across passages. Flag as a group so the human can decide whether to address them collectively.

Then **wait.** The human will either:

- Approve the standards and scope ("looks good, write the full report").
- Adjust the standards ("don't be that strict on X," "ignore Y," "audit Z that you skipped").
- Redirect the audit entirely.

The preview exists because audit standards are calibration-sensitive. Five representative findings give the human a much faster read on whether the agent has the calibration right than a 34-finding report does.

---

## 4. Stage 2 — Full report

After preview sign-off, write **one report file** at:

```
sizzle/docs/STYLE-AUDIT-YYYY-MM-DD.md
```

The file is the canonical record of standards applied at that date.

### Structure

```markdown
# Style Guide Audit — YYYY-MM-DD

## Summary

One short paragraph: overall health, headline findings, count of issues by severity.
Reference any standards decisions the human made during preview.

### Systemic patterns (worth a group decision)

(If any. Call out repeated patterns so the human can approve/reject as a group.)

### Confirmed skipped per scope

(List anything explicitly out of scope so the human knows you didn't miss it.)

### Scope notes

(Edge cases: passages near the word ceiling, taglines you treated as in-scope, etc.)

---

## Findings

### `PASSAGE-NAME` — [content/file.twee:LINE](../src/content/file.twee#LLINE)

**NN. [severity]** [rule §X.Y] — one-line description.

Before:
> exact quote from source

After:
> exact replacement prose

Rationale: one sentence. (Meaning change: yes/no — if yes, what specifically shifts.)
```

### Card rules

- **Number every card** sequentially across the whole report. The human approves by card number ("yes to 1–14, no to 15, approve the rest in bulk") so the numbering must be stable.
- **Before / After are exact prose.** Not descriptions of changes. The human needs to read the actual replacement to evaluate it. ([STYLE-GUIDE.md §16.3](STYLE-GUIDE.md))
- **Severity tiers:**
  - **hard violation** — hard-ceiling broken, link-form broken, anachronism, NYSE pre-resolution, Métis/Shield conflation, NPC dialogue in link, etc.
  - **AI-ism** — the §13.1 / §13.5 style tells: negation cadence, parallel construction, composed similes, meta-vocabulary leak, tech metaphors, religious/literary metaphors, narrator profundity at scene close, silence-as-device, etc.
  - **light call** — judgment-call suggestions where the original might be fine. Flagged so the human can decide. Don't pad the report with these; if you can't articulate what's wrong, leave the line alone ([STYLE-GUIDE.md §16.1](STYLE-GUIDE.md)).
- **Meaning-change flag is mandatory** when the proposed fix alters meaning rather than delivery. Information loss is the sneakiest failure mode ([STYLE-GUIDE.md §13.2, §16.8](STYLE-GUIDE.md)) — calling it out lets the human catch what the agent might have missed.
- **Note-only findings are allowed.** Some findings warrant the human's awareness but no proposed change (e.g. lines the style guide explicitly endorses, borderline calls where leaving alone is the right answer). Mark them `note only — no proposed change` and explain why.
- **Skip clean passages by omission.** Don't pad the report with "this passage is fine" sections.

### After writing the report

Summarize the top-line findings back in chat. The human shouldn't have to open the file to learn what you found. Mirror the report's summary: severity counts, systemic patterns, anything that surfaced in Stage 2 that wasn't in Stage 1 preview.

---

## 5. Stage 3 — Approval

The human reviews the report and responds with some combination of:

- **Bulk approval** ("implement all of the changes").
- **Per-card thumbs up/down** ("yes to 01–14, skip 15, yes to 16–33").
- **Tweaks and overrides** — specific cards where the intent was right but the proposed prose isn't. The human supplies the alternative phrasing or the reason for keeping the original.

Tweaks come in three flavors, all of which happened in the worked example:

1. **Skip** ("keep it" — the original is fine because of context the agent missed).
2. **Different fix, same problem** ("the intent was right but your fix was worse — here's better prose").
3. **Apply the fix plus a tweak the audit didn't catch** ("yes, and also fix this related thing I noticed while reading your fix").

The agent doesn't argue with overrides. The audit found the lint; the human is the editor.

---

## 6. Stage 4 — Application

Only after explicit approval ("implement all of the changes" / "apply 01–14"), the agent edits source.

### Mechanics

- **Use the Edit tool, not Write.** Each card is a quote-for-quote replacement against the exact `Before` text. If Edit fails, the audit's `Before` quote doesn't match the source — re-read the source and reconcile before continuing.
- **Match the file's whitespace convention.** Whitespace varies by file. Confirmed at time of writing:
  - `src/content/character-creator.twee` — single space after periods in card prose.
  - `src/content/briefing.twee` — two spaces after periods throughout.
  - Verify per file. The Edit tool is byte-exact; a mismatched space count fails the edit.
- **Apply the cards in source order or by card number.** Either is fine; consistency makes verification easier.
- **`replace_all: true` is appropriate when the same prose appears in mirror passages.** Example from the 2026-05-26 sweep: a paragraph in INTRO-200 and INTRO-200a that was identical. One replace_all covers both.
- **Track per-card outcomes mentally as you go.** When done, summarize back: applied as written, applied with override, skipped per override.

### Verify

Compile to confirm no whitespace surprise broke parsing:

```powershell
$env:TWEEGO_PATH = "_tools/tweego/storyformats"
& _tools/tweego/tweego.exe -o sizzle/output.html sizzle/src/
```

Tweego is silent on success. If anything prints, read it.

If the human wants visual verification, serve `sizzle/output.html` over `python -m http.server` and hand them the URL. Background the server, kill it when done.

### After application

- **Audit report file stays.** It's the record of standards applied at that date. Do not delete or edit it after application — if you discover something wrong during application, note it in the chat summary, not in the audit file.
- **No need to update STYLE-GUIDE.md** unless the sweep surfaced a new rule worth codifying. If it did, the audit's summary should say so, and the human will direct the addition.

---

## 7. Hard rules (carry-overs from the audit session itself)

These are restated from the session-instruction pattern that worked in the first sweep:

- **Do not edit source files during Stages 0–2.** Deliverable is the report. Source edits happen only after named human approval at Stage 3.
- **Do not add glossary terms, story tags, quirks, or kinks.** Propose as `[!]` candidates in the report; let the human decide.
- **Do not spawn subagents.** An editorial sweep is a focused single-agent reading-and-writing task. Spawn cost wastes context the audit needs.
- **Do not use the Obsidian sync scripts or touch the vault during a sweep.** Work directly from `.twee` source. The Obsidian shadow-MD layer is a separate workflow for live editing.
- **If you spot a finding in Stage 2 that the preview missed, call it out in the summary.** The human needs to know the report exceeded the preview's calibration so they can decide whether to recalibrate.
- **Period-quirk rule:** Spaced em-dashes and two-spaces-after-periods are house style, NOT findings. Don't strip them.

---

## 8. Anti-patterns to watch for in your own audit

The audit agent is a writing agent in a different hat, and the same AI tells leak into the audit prose itself:

- **Don't write findings that sound like workshop critique.** A finding like "this line lacks specificity and doesn't earn its place in the cadence" is the meta-vocabulary §13.1 calls out. State the actual issue ("negation cadence — see §13.1") and propose the fix.
- **Don't soften severity to be polite.** If a hard violation is hard, call it hard. The human will catch it eventually anyway; better the audit names it.
- **Don't pad the report.** Cards have a fixed cost in human reading time. Each one should pay for itself. Skip "this is fine" sections.
- **Don't propose prose that's worse than the original.** [STYLE-GUIDE.md §13.3](STYLE-GUIDE.md) — revision instinct is itself a pitfall. If you can't articulate what's wrong with the original, leave the card out.
- **Don't bury meaning changes.** If the fix loses information, say so explicitly. The human cannot un-lose information they didn't know was being lost.

---

## 9. Living document

Update this doc after every editorial sweep — new conventions earned, new override patterns the human used, new whitespace quirks discovered, anti-patterns the sweep itself fell into. The 2026-05-26 sweep is the founding worked example; subsequent sweeps add experience.

The audit reports themselves accumulate as historical record. Don't delete prior `STYLE-AUDIT-YYYY-MM-DD.md` files — they show the prose's drift over time and the calibration of standards at each pass.
