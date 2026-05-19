import { describe, it, expect } from 'vitest';
import {
  extractLinks,
  parseTwee,
  storyToTwee,
  parseHtml,
  storyToHtml,
  generateIfid,
} from '../src/twine-parser';
import type { TwineStory } from '../src/types';

// ---------------------------------------------------------------------------
// extractLinks
// ---------------------------------------------------------------------------

describe('extractLinks', () => {
  it('extracts a simple [[Target]] link', () => {
    expect(extractLinks('Go to [[Target]]')).toEqual(['Target']);
  });

  it('extracts the target from [[Display->Target]]', () => {
    expect(extractLinks('Click [[here->Hallway]]')).toEqual(['Hallway']);
  });

  it('extracts the target from [[Display|Target]]', () => {
    expect(extractLinks('See [[label|Room]]')).toEqual(['Room']);
  });

  it('extracts multiple links from the same passage', () => {
    expect(extractLinks('[[A]] and [[B]]')).toEqual(['A', 'B']);
  });

  it('returns an empty array when there are no links', () => {
    expect(extractLinks('No links here.')).toEqual([]);
  });

  it('trims whitespace inside link targets', () => {
    expect(extractLinks('[[ Target ]]')).toEqual(['Target']);
    expect(extractLinks('[[ display -> Target ]]')).toEqual(['Target']);
    expect(extractLinks('[[ display | Target ]]')).toEqual(['Target']);
  });

  it('handles multiple link styles in the same text', () => {
    const text = '[[Simple]] then [[Show->Place]] then [[Alt|Dest]]';
    expect(extractLinks(text)).toEqual(['Simple', 'Place', 'Dest']);
  });
});

// ---------------------------------------------------------------------------
// parseTwee / storyToTwee round-trip
// ---------------------------------------------------------------------------

describe('parseTwee / storyToTwee round-trip', () => {
  const tweeSource = [
    ':: StoryData',
    JSON.stringify(
      {
        ifid: 'AAAAAAAA-BBBB-4CCC-DDDD-EEEEEEEEEEEE',
        format: 'SugarCube',
        'format-version': '2.37.3',
        start: 'Intro',
      },
      null,
      2,
    ),
    '',
    ':: StoryTitle',
    'My Test Story',
    '',
    ':: Intro',
    'Welcome. [[Next]]',
    '',
    ':: Next [important]',
    'The end.',
    '',
  ].join('\n');

  it('parses story metadata correctly', () => {
    const story = parseTwee(tweeSource);
    expect(story.name).toBe('My Test Story');
    expect(story.format).toBe('SugarCube');
    expect(story.formatVersion).toBe('2.37.3');
    expect(story.ifid).toBe('AAAAAAAA-BBBB-4CCC-DDDD-EEEEEEEEEEEE');
    expect(story.startPassage).toBe('Intro');
  });

  it('parses the correct number of passages', () => {
    const story = parseTwee(tweeSource);
    expect(story.passages).toHaveLength(2);
  });

  it('populates tags on tagged passages', () => {
    const story = parseTwee(tweeSource);
    const next = story.passages.find((p) => p.name === 'Next');
    expect(next).toBeDefined();
    expect(next!.tags).toContain('important');
  });

  it('populates links from passage text', () => {
    const story = parseTwee(tweeSource);
    const intro = story.passages.find((p) => p.name === 'Intro');
    expect(intro).toBeDefined();
    expect(intro!.links).toEqual(['Next']);
  });

  it('survives a round-trip through storyToTwee then parseTwee', () => {
    const original = parseTwee(tweeSource);
    const exported = storyToTwee(original);
    const reimported = parseTwee(exported);

    expect(reimported.name).toBe(original.name);
    expect(reimported.format).toBe(original.format);
    expect(reimported.formatVersion).toBe(original.formatVersion);
    expect(reimported.startPassage).toBe(original.startPassage);
    expect(reimported.passages).toHaveLength(original.passages.length);

    for (const orig of original.passages) {
      const found = reimported.passages.find((p) => p.name === orig.name);
      expect(found, `passage "${orig.name}" missing after round-trip`).toBeDefined();
      expect(found!.text).toBe(orig.text);
      expect(found!.tags).toEqual(orig.tags);
    }
  });
});

// ---------------------------------------------------------------------------
// parseHtml / storyToHtml round-trip
// ---------------------------------------------------------------------------

describe('parseHtml / storyToHtml round-trip', () => {
  const baseStory: TwineStory = {
    name: 'HTML Round Trip',
    ifid: '11111111-2222-4333-4444-555555555555',
    format: 'Harlowe',
    formatVersion: '3.3.9',
    startPassage: 'Start',
    passages: [
      { name: 'Start', pid: 1, tags: [], text: 'Begin here. [[Middle]]', links: ['Middle'] },
      { name: 'Middle', pid: 2, tags: ['scene'], text: 'Midpoint. [[End]]', links: ['End'] },
      { name: 'End', pid: 3, tags: [], text: 'The end.', links: [] },
    ],
  };

  it('exports to HTML and parses back without losing passages', () => {
    const html = storyToHtml(baseStory);
    const parsed = parseHtml(html);

    expect(parsed.passages).toHaveLength(3);
    for (const orig of baseStory.passages) {
      const found = parsed.passages.find((p) => p.name === orig.name);
      expect(found, `passage "${orig.name}" missing after HTML round-trip`).toBeDefined();
      expect(found!.text).toBe(orig.text);
    }
  });

  it('preserves the startPassage through HTML round-trip', () => {
    const html = storyToHtml(baseStory);
    const parsed = parseHtml(html);
    expect(parsed.startPassage).toBe('Start');
  });

  it('preserves story name and format', () => {
    const html = storyToHtml(baseStory);
    const parsed = parseHtml(html);
    expect(parsed.name).toBe('HTML Round Trip');
    expect(parsed.format).toBe('Harlowe');
    expect(parsed.formatVersion).toBe('3.3.9');
  });

  it('preserves tags on passages', () => {
    const html = storyToHtml(baseStory);
    const parsed = parseHtml(html);
    const middle = parsed.passages.find((p) => p.name === 'Middle');
    expect(middle!.tags).toContain('scene');
  });

  it('preserves stylesheet and script', () => {
    const withExtras: TwineStory = {
      ...baseStory,
      stylesheet: 'body { color: red; }',
      script: 'console.log("hello");',
    };
    const html = storyToHtml(withExtras);
    const parsed = parseHtml(html);
    expect(parsed.stylesheet).toBe('body { color: red; }');
    expect(parsed.script).toBe('console.log("hello");');
  });
});

// ---------------------------------------------------------------------------
// generateIfid
// ---------------------------------------------------------------------------

describe('generateIfid', () => {
  it('returns a string matching the UUID v4 pattern', () => {
    const ifid = generateIfid();
    expect(ifid).toMatch(
      /^[A-F0-9]{8}-[A-F0-9]{4}-4[A-F0-9]{3}-[A-F0-9]{4}-[A-F0-9]{12}$/,
    );
  });

  it('generates unique values on successive calls', () => {
    const a = generateIfid();
    const b = generateIfid();
    expect(a).not.toBe(b);
  });
});
