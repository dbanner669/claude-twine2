# Twee -> Ink Text-Fidelity Diff

Automated verification that the twee->ink conversion for the five Godot content sequences
preserved every authored text block (prose paragraphs and choice/link display text). The twee
files under `sizzle/src/content/` are the frozen source of truth; the `.ink` files under
`godot/content/` are the converted output being audited. Neither was modified by this check.

## How it works

Standalone Node script: `twine-mcp-server/scripts/verify-ink-import.mjs` (ES module, no
dependencies, run with `node`).

**Run command:**

```bash
node twine-mcp-server/scripts/verify-ink-import.mjs twine-mcp-server/scripts/import-diff-report.json
```

The script parses each twee file into passages (splitting on `^:: `) and each `.ink` file into
knots directly from source (splitting on `=== KNOT ===`, walking every line — it does **not** use
any pre-rendered/played-path prose dump, so every conditional branch and every knot is covered,
not just what a playthrough would visit). Passages are matched to knots by id
(`BLK-085` <-> `BLK_085`, hyphen/underscore only).

For each matched pair, both sides are reduced to a normalized set of "content units"
(authored visible text — prose paragraphs and choice/link display text):

- Twee: `[[Display|Target]]` links, `<<link "Display">>` / `<<linkreplace "Display">>` display
  text, `<<term "KEY">>` / `<<term "KEY" "shown">>`, `//italics//` unwrapped, `<<print $x ||
  "fallback">>` and `<<playerRealName>>` collapsed to a shared placeholder token `⟨var⟩`. Same-line
  `<<if>>...<<elseif>>...<<else>>...<</if>>` blocks are expanded into one line per branch (with any
  glued prefix/suffix text preserved on every branch) so no branch's prose is lost by naive tag
  stripping. All other macros, HTML tags, and `/* comments */` are stripped.
- Ink: choice display text (`* [Display] -> Target`, including nested `* *`), `[url=gloss:KEY]
  label[/url]` -> `label`, `[i]...[/i]` unwrapped, inline conditionals `{cond: A|B}` (and
  single-branch `{cond: A}`) expanded to every text alternative, block conditionals
  (`{ x: ... - else: ... }`) walked line-by-line so every branch's prose is kept. Mirror-var
  interpolations (`{player_name}`, `{background}`, `{x != "": {x}|fallback}`) collapse to the same
  `⟨var⟩` placeholder as the twee side. `# tags`, `~ ops`, `-> diverts`, `VAR`/gather-marker lines
  are stripped.

Both sides are then normalized identically (lowercased, whitespace-collapsed, smart
quotes/dashes/ellipses -> ASCII, punctuation-only edges trimmed) and compared **as a set** per
passage/knot — order-independent, so reordering, conditional restructuring, and reveal-drift
(append vs. replace) don't produce false positives.

**Paragraph-merge tie-breaker.** A handful of passages author a background-variant `<<if>>text
A<<else>>text B<</if>>` inline on one twee source line with a shared prose suffix glued after
`<</if>>`; the ink conversion sometimes represents the same content as one glued line instead of
twee's two blank-line-separated paragraphs (or vice versa). Comparing at paragraph granularity
alone flags these as false mismatches even though every word is present on both sides. To handle
this, any candidate paragraph-level mismatch is given one more chance: it is split into sentences,
and if every one of its sentences is independently present somewhere in the other side's sentence
set, the paragraph-level mismatch is discarded as a boundary artifact rather than a real drop. A
mismatch is only kept if at least one of its sentences has no counterpart on the other side.

**Self-test performed before trusting the "0 mismatches" result:** a scratch copy of
`blackout.ink` was deliberately corrupted (one full sentence deleted from a prose branch, one word
changed in a choice's display text) and re-run against the real `blackout.twee`. The script
correctly flagged both injected changes (`BLK-100 you stay a while.` vs `you linger a while.`, and
the dropped sentence in `BLK-115`'s CSIS-analyst branch) and did not suppress them via the
sentence tie-breaker — confirming the tie-breaker only forgives boundary/merge artifacts, not
actual text loss or wording changes.

## Summary

| Sequence | Passages compared | Clean | Mismatched | Stubbed (excluded) | Added knots (excluded) |
|---|---|---|---|---|---|
| briefing | 37 | 37 | 0 | 0 | 1 |
| blackout | 24 | 24 | 0 | 2 | 1 |
| manitoulin | 22 | 22 | 0 | 2 | 1 |
| pale | 20 | 20 | 0 | 2 | 1 |
| wds | 20 | 20 | 0 | 2 | 1 |
| **Total** | **123** | **123** | **0** | **8** | **5** |

## Mismatches

None. Zero TWEE-ONLY / INK-ONLY content units across all 123 compared passage/knot pairs.

(Two earlier bugs in the diff tool itself — not in the conversion — were found and fixed during
development: a nested-choice regex that didn't allow the `* *` space-separated asterisk form, and
same-line `<<if>>...<<else>>...<</if>>` blocks being naively tag-stripped into one run-on
paragraph instead of one paragraph per branch. Both were corrected before the final run above; see
git history of `twine-mcp-server/scripts/verify-ink-import.mjs` for detail.)

## Known-stubbed (excluded)

Branch-file-extract passages, identified by the ink `# scene: branch_file_extract` tag. Their
twee body (inline-HTML "document" styling) was deliberately replaced by a stub knot; the real
content now lives in `godot/content/extracts/*.json`, not in the `.ink` prose. Verified by tag,
not by trusting the task's suggested list — the tag-based scan found exactly these eight, matching
the suggested list exactly:

- BLK-210 / BLK_210, BLK-215 / BLK_215
- MAN-200 / MAN_200, MAN-205 / MAN_205
- PALE-200 / PALE_200, PALE-205 / PALE_205
- WDS-200 / WDS_200, WDS-205 / WDS_205

## Added knots (excluded)

Ink knots with no twee source — expected native-scene handoff/terminal knots, not conversion
errors:

- `intro_end` (briefing)
- `blk_end` (blackout)
- `man_end` (manitoulin)
- `pale_end` (pale)
- `wds_end` (wds)

## Coverage check

- Twee passage ids with **no** matching ink knot: **none** (0 across all five sequences).
- Ink knots (excluding the 5 added handoff knots above) with **no** twee source: **none** (0
  across all five sequences).

Passage/knot counts reconcile exactly: `ink knots = twee passages + 1 added handoff knot` for
every sequence (briefing 37+1=38, blackout 26+1=27, manitoulin 24+1=25, pale 22+1=23, wds
22+1=23).

## Verdict

**IMPORT VERIFIED (no material text loss).** All 123 non-stub, non-added passage/knot pairs across
briefing, blackout, manitoulin, pale, and wds matched with zero unmatched content units.
