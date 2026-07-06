import { describe, it, expect } from 'vitest';
import {
  convertEmphasis,
  convertPassageStandalone,
  convertStory,
  convertTerm,
  parseArgs,
  tokenize,
} from '../src/ink-export/convert';
import { camelToSnake, convertExpr, knotRef } from '../src/ink-export/expr';
import type { TwinePassage } from '../src/types';

function passage(name: string, text: string, tags: string[] = []): TwinePassage {
  return { name, tags, text };
}

// ---------------------------------------------------------------------------
// expr
// ---------------------------------------------------------------------------

describe('convertExpr', () => {
  it('normalizes eq/neq/is comparisons', () => {
    expect(convertExpr('$player.background eq "RCMP constable"').out).toBe(
      'background == "RCMP constable"',
    );
    expect(convertExpr('$player.background neq "x"').out).toBe('background != "x"');
  });

  it('keeps and/or/not word forms', () => {
    expect(convertExpr('$player.flags.a or $player.flags.b').out).toBe('a or b');
    expect(convertExpr('not $player.flags.blkClimbed').out).toBe('not blk_climbed');
  });

  it('maps skills to the query surface', () => {
    expect(convertExpr('$player.skills.Academic.level gte 2').out).toBe(
      'skill_level("academic") >= 2',
    );
  });

  it('maps storyTags.includes to has_tag', () => {
    expect(convertExpr('$player.storyTags.includes("Lived in Toronto")').out).toBe(
      'has_tag("Lived in Toronto")',
    );
  });

  it('maps hasVisited to knot visit counts', () => {
    expect(convertExpr('not hasVisited("INTRO-340 Why me")').out).toBe('INTRO_340 == 0');
    expect(convertExpr('hasVisited("BLK-100 Last call")').out).toBe('BLK_100 > 0');
  });

  it('maps nyse influence reads to the mirror', () => {
    expect(convertExpr('$nyse.influence gt 0').out).toBe('nyse_influence > 0');
  });

  it('flags unconvertible constructs', () => {
    expect(convertExpr('Math.max($player.skills.agent.level, 1)').ok).toBe(false);
    expect(convertExpr('(typeof $x === "number") ? 1 : 2').ok).toBe(false);
  });
});

describe('helpers', () => {
  it('camelToSnake', () => {
    expect(camelToSnake('blkSkillGranted')).toBe('blk_skill_granted');
    expect(camelToSnake('manFocalHeld')).toBe('man_focal_held');
  });

  it('knotRef', () => {
    expect(knotRef('BLK-130 The propped door')).toBe('BLK_130');
    expect(knotRef('INTRO-200a Personal')).toBe('INTRO_200a');
    expect(knotRef('Start')).toBeNull();
  });

  it('tokenize splits macros and text', () => {
    const toks = tokenize('a <<set $x to 1>> b <</page>>');
    expect(toks).toHaveLength(4);
    expect(toks[1]).toMatchObject({ type: 'macro', name: 'set', closing: false });
    expect(toks[3]).toMatchObject({ type: 'macro', name: 'page', closing: true });
  });

  it('parseArgs respects quotes', () => {
    expect(parseArgs('"Composure / Streetwise" "2d6" _checkSkill 7')).toEqual([
      'Composure / Streetwise',
      '2d6',
      '_checkSkill',
      '7',
    ]);
  });

  it('convertEmphasis and convertTerm produce BBCode', () => {
    expect(convertEmphasis('it is //because// you are')).toBe('it is [i]because[/i] you are');
    expect(convertTerm(['NYSE'])).toBe('[url=gloss:NYSE]NYSE[/url]');
    expect(convertTerm(['Sault', 'Soo'])).toBe('[url=gloss:Sault]Soo[/url]');
  });
});

// ---------------------------------------------------------------------------
// passage transforms
// ---------------------------------------------------------------------------

describe('convertPassage — header preamble', () => {
  it('converts the silently/header/page preamble into ops', () => {
    const p = passage(
      'TST-100 Opening',
      `<<silently>>
<<setDate 2003 8 14 "afternoon">>
<<set $header.location to "THE DANFORTH, TORONTO">>
<<set $header.time to "Thursday afternoon">>
<</silently>>\\
<<header>>\\
<<page>>\\
Prose line.

[[Onward.|TST-110 Next]]
<</page>>`,
      ['avatar-blk-day'],
    );
    const { lines } = convertPassageStandalone(p, ['TST_110']);
    expect(lines).toContain('=== TST_100 ===');
    expect(lines).toContain('# id: TST_100');
    expect(lines).toContain('# avatar: blk_day');
    expect(lines).toContain('~ set_date(2003, 8, 14, "afternoon")');
    expect(lines).toContain('~ set_header("THE DANFORTH, TORONTO", "Thursday afternoon")');
    expect(lines).toContain('Prose line.');
    expect(lines).toContain('* [Onward.] -> TST_110');
    // header/page widgets leave no macro residue
    expect(lines.join('\n')).not.toContain('<<');
  });
});

describe('convertPassage — skill check', () => {
  const p = passage(
    'TST-160 The pull [nobr avatar-blk-night]',
    `<<silently>>
<<set $header.location to "WALKUP LOBBY">>
<<set $header.time to "Thursday evening">>
<</silently>>
<<header>>
<<page>>
Prose before the check.

<<set _checkSkill to $player.skills.composure.level>>
<<skillCheck "Composure" "2d6" _checkSkill 8>>
<<success>>
<<if not $player.flags.tstSkillGranted>>
<<set $player.skills.composure.level += 1>>
<<set $player.flags.tstSkillGranted to true>>
<</if>>
Success prose.

[[You hold.|TST-165 Next]]
<<failure>>
Failure prose.

[[You step.|TST-165 Next]]
<</skillCheck>>
<</page>>`,
  );

  it('hoists the # check tag with lowercased skill', () => {
    const { lines } = convertPassageStandalone(p, ['TST_165']);
    expect(lines).toContain('# check: composure 2d6 8');
  });

  it('keeps prose before the conditional and renders both branches', () => {
    const { lines } = convertPassageStandalone(p, ['TST_165']);
    const text = lines.join('\n');
    const proseIdx = text.indexOf('Prose before the check.');
    const condIdx = text.indexOf('{ check_passed:');
    expect(proseIdx).toBeGreaterThan(-1);
    expect(condIdx).toBeGreaterThan(proseIdx);
    expect(text).toContain('- else:');
    expect(text).toContain('* [You hold.] -> TST_165');
    expect(text).toContain('* [You step.] -> TST_165');
  });

  it('converts the one-shot flag guard into a VAR-backed ink guard', () => {
    const { lines, vars } = convertPassageStandalone(p, ['TST_165']);
    const text = lines.join('\n');
    expect(vars).toContain('tst_skill_granted');
    expect(text).toContain('{ not tst_skill_granted:');
    expect(text).toContain('~ grant_skill("composure", 1)');
    expect(text).toContain('~ tst_skill_granted = true');
  });

  it('drops the _checkSkill expression with a warning', () => {
    const { warnings } = convertPassageStandalone(p, ['TST_165']);
    expect(warnings.some((w) => w.construct === 'check-expr-dropped')).toBe(true);
  });
});

describe('convertPassage — linkreplace reveal', () => {
  it('converts linkreplace to choice + nested continuation', () => {
    const p = passage(
      'TST-145 The man [avatar-blk-night]',
      `<<page>>\\
"Don't go up," he says.

<<linkreplace "You ask what is happening.">>He is quiet for a moment.

[[You stand with that.|TST-150 Next]]<</linkreplace>>
<</page>>`,
    );
    const { lines, warnings } = convertPassageStandalone(p, ['TST_150']);
    const text = lines.join('\n');
    expect(text).toContain('* [You ask what is happening.]');
    expect(text).toContain('    He is quiet for a moment.');
    expect(text).toContain('    * * [You stand with that.] -> TST_150');
    expect(warnings.some((w) => w.construct === 'reveal-drift')).toBe(true);
  });

  it('converts link+replace to the same reveal pattern', () => {
    const p = passage(
      'TST-130 Door [nobr]',
      `<<page>>
You stop.

<span id="tst-130-choices">
<div class="choices">
<div class="choice">[[You look in.|TST-135 Next]]</div>
<div class="choice"><<link "You keep walking.">><<replace "#tst-130-choices">>
The sound follows you.

[[You cross back.|TST-135 Next]]
<</replace>><</link>></div>
</div>
</span>
<</page>>`,
    );
    const { lines } = convertPassageStandalone(p, ['TST_135']);
    const text = lines.join('\n');
    expect(text).toContain('* [You look in.] -> TST_135');
    expect(text).toContain('* [You keep walking.]');
    expect(text).toContain('    The sound follows you.');
    expect(text).toContain('    * * [You cross back.] -> TST_135');
  });
});

describe('convertPassage — conditionals', () => {
  it('renders multi-branch background ifs as a dashed conditional block', () => {
    const p = passage(
      'TST-085 Opening',
      `<<page>>\\
Common prose.

<<if $player.background eq "RCMP constable">>RCMP text.
<<elseif $player.background eq "CSIS analyst">>CSIS text.
<<else>>Default text.
<</if>>

[[On.|TST-090 Next]]
<</page>>`,
    );
    const { lines } = convertPassageStandalone(p, ['TST_090']);
    const text = lines.join('\n');
    expect(text).toContain('{\n- background == "RCMP constable":\n    RCMP text.');
    expect(text).toContain('- else:\n    Default text.\n}');
  });

  it('renders sentence-embedded ifs inline', () => {
    const p = passage(
      'TST-205 Still out',
      `<<page>>\\
Radio on, <<if $player.background eq "RCMP constable">>your hotel a mess<<else>>her building a mess<</if>>. Still out.

[[On.|TST-090 Next]]
<</page>>`,
    );
    const { lines } = convertPassageStandalone(p, ['TST_090']);
    expect(lines.join('\n')).toContain(
      'Radio on, {background == "RCMP constable": your hotel a mess|her building a mess}. Still out.',
    );
  });

  it('converts switch/case to a conditional block', () => {
    const p = passage(
      'TST-300 Switching',
      `<<page>>\\
<<switch $player.background>>
<<case "RCMP constable">>Constable line.
<<case "CSIS analyst">>Analyst line.
<<default>>Civilian line.
<</switch>>

[[On.|TST-090 Next]]
<</page>>`,
    );
    const { lines, warnings } = convertPassageStandalone(p, ['TST_090']);
    const text = lines.join('\n');
    expect(text).toContain('- background == "RCMP constable":\n    Constable line.');
    expect(text).toContain('- else:\n    Civilian line.');
    expect(warnings.some((w) => w.construct === 'switch')).toBe(true);
  });

  it('converts visited-question hubs into conditional once-only choices', () => {
    const p = passage(
      'TST-410 Rules',
      `<<page>>\\
Hub prose.

<<if not hasVisited("TST-500 Question")>>\\
<<link "Ask the question.">><<goto "TST-500 Question">><</link>>
<<else>>\\
<span class="greyedOut">//Ask the question.//</span>
<</if>>

[[Continue|TST-090 Next]]
<</page>>`,
    );
    const { lines } = convertPassageStandalone(p, ['TST_090', 'TST_500']);
    expect(lines.join('\n')).toContain('* {TST_500 == 0} [Ask the question.] -> TST_500');
  });
});

describe('convertPassage — term, italics, print', () => {
  it('converts term and emphasis markup to BBCode', () => {
    const p = passage(
      'TST-110 Arrives',
      `<<page>>\\
He carries a copy of the <<term "Globe">> that looks read. It is //because// you are a regular.  The <<term "Sault" "Soo">> is far.

[[On.|TST-090 Next]]
<</page>>`,
    );
    const { lines } = convertPassageStandalone(p, ['TST_090']);
    const text = lines.join('\n');
    expect(text).toContain('[url=gloss:Globe]Globe[/url]');
    expect(text).toContain('[i]because[/i]');
    expect(text).toContain('[url=gloss:Sault]Soo[/url]');
  });

  it('converts print-with-fallback into an inline conditional on the mirror var', () => {
    const p = passage(
      'TST-101 Thought',
      `<<page>>\\
Two years since <<print $player.incitingIncident || "the incident">> happened.

[[On.|TST-090 Next]]
<</page>>`,
    );
    const { lines } = convertPassageStandalone(p, ['TST_090']);
    expect(lines.join('\n')).toContain(
      'Two years since {inciting_incident != "": {inciting_incident}|the incident} happened.',
    );
  });
});

describe('convertPassage — branch file extract stub', () => {
  const p = passage(
    'TST-210 Incident report',
    `<<silently>>
<<setDate 2003 8 21 "morning">>
<<set $header.location to "BRANCH FILE EXTRACT">>
<<set $header.time to "Thursday morning">>
<</silently>>
<<header>>
<<page>>
<div style="background:var(--sz-ink-3);border:1px solid var(--sz-rule);padding:28px">
<span class="stamp">Classified</span>
<div class="eyebrow --brick">Incident File · 03-TST-0814 · Extract</div>
<div><p>INCIDENT DATE: 2003.08.14.</p></div>
</div>

[[You turn the page.|TST-215 Next]]
<</page>>`,
  );

  it('emits a stub knot with scene/extract tags and ops', () => {
    const { lines } = convertPassageStandalone(p, ['TST_215'], 'TST');
    expect(lines).toContain('# screen: menu');
    expect(lines).toContain('# scene: branch_file_extract');
    expect(lines).toContain('# extract: tst_incident_report_03_TST_0814');
    expect(lines).toContain('~ set_date(2003, 8, 21, "morning")');
    expect(lines).toContain('~ set_header("BRANCH FILE EXTRACT", "Thursday morning")');
    expect(lines).toContain(
      'Incident File 03-TST-0814, extract. Rendered by the native BranchFileExtract scene template; this knot is a placeholder.',
    );
    expect(lines).toContain('* [You turn the page.] -> TST_215');
  });

  it('preserves the skipped HTML in the warning for the report', () => {
    const { warnings } = convertPassageStandalone(p, ['TST_215'], 'TST');
    const stub = warnings.find((w) => w.construct === 'extract-stub');
    expect(stub).toBeDefined();
    expect(stub!.detail).toContain('background:var(--sz-ink-3)');
    expect(stub!.detail).toContain('INCIDENT DATE: 2003.08.14.');
  });
});

describe('convertPassage — temp-var influence pattern', () => {
  it('translates SugarCube temps into ink temps', () => {
    const p = passage(
      'TST-175 Cut wire [nobr]',
      `<<silently>>
<<if not $player.flags.tstInfluenceGranted>>
    <<set _tstInfluence to 2>>
    <<if $player.flags.tstFailed>>
        <<set _tstInfluence to 3>>
    <</if>>
    <<set $nyse.influence += _tstInfluence>>
    <<set $player.flags.tstInfluenceGranted to true>>
<</if>>
<<set $header.location to "DOCK">>
<<set $header.time to "Saturday night">>
<</silently>>
<<header>>
<<page>>
Prose.

[[On.|TST-090 Next]]
<</page>>`,
    );
    const { lines } = convertPassageStandalone(p, ['TST_090']);
    const text = lines.join('\n');
    expect(text).toContain('{ not tst_influence_granted:');
    expect(text).toContain('~ temp tst_influence = 2');
    expect(text).toContain('{ tst_failed:\n        ~ tst_influence = 3');
    expect(text).toContain('~ adjust_influence(tst_influence)');
    expect(text).toContain('~ tst_influence_granted = true');
  });
});

// ---------------------------------------------------------------------------
// story-level
// ---------------------------------------------------------------------------

describe('convertStory', () => {
  it('emits includes, VAR block, entry divert and the native-handoff end knot', () => {
    const story = {
      name: 'Test',
      passages: [
        passage(
          'TST-100 First',
          `<<page>>\\
Opening prose with <<if not $player.flags.tstDone>>a guard<<else>>no guard<</if>> inline.

<<link "The file closes." "CC-500 Summary">>
<<setDate 2005 9 12 "morning">>
<</link>>
<</page>>`,
        ),
      ],
    };
    const { ink, warnings } = convertStory(story, {
      label: 'test',
      prefix: 'TST',
      sourceName: 'test.twee',
    });
    expect(ink).toContain('INCLUDE mirror.ink');
    expect(ink).toContain('INCLUDE ops.ink');
    expect(ink).toContain('VAR tst_done = false');
    expect(ink).toContain('-> TST_100');
    expect(ink).toContain('=== tst_end ===');
    expect(ink).toContain('~ set_date(2005, 9, 12, "morning")');
    expect(ink).toContain('-> tst_end');
    expect(warnings.some((w) => w.construct === 'external-target')).toBe(true);
  });
});
