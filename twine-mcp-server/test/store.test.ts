import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

// ---------------------------------------------------------------------------
// Because store.ts computes SAVE_DIR at module scope (reading process.env at
// load time) and exports a singleton, we must set the env var and use
// vi.resetModules() + dynamic import() before each test to get a fresh store
// that points at a temporary directory.
// ---------------------------------------------------------------------------

describe('StoryStore', () => {
  let tmpDir: string;
  let store: (typeof import('../src/store'))['store'];

  beforeEach(async () => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'twine-test-'));
    process.env.TWINE_SAVE_DIR = tmpDir;
    vi.resetModules();
    const mod = await import('../src/store');
    store = mod.store;
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
    delete process.env.TWINE_SAVE_DIR;
  });

  // -------------------------------------------------------------------------
  // create / get / list
  // -------------------------------------------------------------------------

  describe('create, get, list', () => {
    it('creates a story that can be retrieved by name', () => {
      const story = store.create('Demo');
      expect(story.name).toBe('Demo');
      expect(story.ifid).toBeDefined();

      const retrieved = store.get('Demo');
      expect(retrieved).toBeDefined();
      expect(retrieved!.name).toBe('Demo');
    });

    it('lists created stories', () => {
      store.create('Alpha');
      store.create('Beta');
      const names = store.list();
      expect(names).toContain('Alpha');
      expect(names).toContain('Beta');
    });

    it('returns undefined for a non-existent story', () => {
      expect(store.get('nope')).toBeUndefined();
    });

    it('sets format and formatVersion correctly for SugarCube', () => {
      const story = store.create('SC Story', 'SugarCube');
      expect(story.format).toBe('SugarCube');
      expect(story.formatVersion).toBe('2.37.3');
    });

    it('defaults to Harlowe when no format is given', () => {
      const story = store.create('Harlowe Story');
      expect(story.format).toBe('Harlowe');
      expect(story.formatVersion).toBe('3.3.9');
    });
  });

  // -------------------------------------------------------------------------
  // addPassage
  // -------------------------------------------------------------------------

  describe('addPassage', () => {
    it('adds a passage and auto-assigns a pid', () => {
      store.create('S1');
      const p = store.addPassage('S1', { name: 'First', text: 'Hello' });
      expect(p.pid).toBe(1);
    });

    it('auto-increments pid for successive passages', () => {
      store.create('S2');
      store.addPassage('S2', { name: 'A', text: 'a' });
      const b = store.addPassage('S2', { name: 'B', text: 'b' });
      expect(b.pid).toBe(2);
    });

    it('sets the first passage as startPassage if none is set', () => {
      store.create('S3');
      store.addPassage('S3', { name: 'Opening', text: '' });
      const story = store.get('S3')!;
      expect(story.startPassage).toBe('Opening');
    });

    it('throws when adding a passage with a duplicate name', () => {
      store.create('S4');
      store.addPassage('S4', { name: 'Dup', text: 'first' });
      expect(() => store.addPassage('S4', { name: 'Dup', text: 'second' })).toThrow(
        /already exists/,
      );
    });

    it('throws when adding to a non-existent story', () => {
      expect(() => store.addPassage('Ghost', { name: 'X', text: '' })).toThrow(/not found/);
    });

    it('auto-assigns a grid position when none is provided', () => {
      store.create('S5');
      const p = store.addPassage('S5', { name: 'P1', text: '' });
      expect(p.position).toBeDefined();
      expect(typeof p.position!.x).toBe('number');
      expect(typeof p.position!.y).toBe('number');
    });
  });

  // -------------------------------------------------------------------------
  // updatePassage
  // -------------------------------------------------------------------------

  describe('updatePassage', () => {
    it('updates the text of an existing passage', () => {
      store.create('U1');
      store.addPassage('U1', { name: 'Page', text: 'old' });
      const updated = store.updatePassage('U1', 'Page', { text: 'new' });
      expect(updated.text).toBe('new');
      expect(store.getPassage('U1', 'Page')!.text).toBe('new');
    });

    it('renames a passage and updates link references in other passages', () => {
      store.create('U2');
      store.addPassage('U2', { name: 'A', text: '[[B]]', links: ['B'] });
      store.addPassage('U2', { name: 'B', text: 'target' });
      store.updatePassage('U2', 'B', { name: 'C' });

      // Passage B should now be accessible as C
      expect(store.getPassage('U2', 'C')).toBeDefined();

      // Passage A's links array should have been updated to reference C
      const a = store.getPassage('U2', 'A')!;
      expect(a.links).toContain('C');
      expect(a.links).not.toContain('B');
    });

    it('updates startPassage when the start passage is renamed', () => {
      store.create('U3');
      store.addPassage('U3', { name: 'Start', text: '' });
      expect(store.get('U3')!.startPassage).toBe('Start');

      store.updatePassage('U3', 'Start', { name: 'Begin' });
      expect(store.get('U3')!.startPassage).toBe('Begin');
    });

    it('throws when updating a passage in a non-existent story', () => {
      expect(() => store.updatePassage('Ghost', 'X', { text: '' })).toThrow(/not found/);
    });

    it('throws when updating a non-existent passage', () => {
      store.create('U4');
      expect(() => store.updatePassage('U4', 'Nope', { text: '' })).toThrow(/not found/);
    });
  });

  // -------------------------------------------------------------------------
  // deletePassage
  // -------------------------------------------------------------------------

  describe('deletePassage', () => {
    it('removes a passage from the story', () => {
      store.create('D1');
      store.addPassage('D1', { name: 'Gone', text: '' });
      const result = store.deletePassage('D1', 'Gone');
      expect(result).toBe(true);
      expect(store.getPassage('D1', 'Gone')).toBeUndefined();
    });

    it('returns false for a non-existent passage', () => {
      store.create('D2');
      expect(store.deletePassage('D2', 'Nope')).toBe(false);
    });

    it('returns false for a non-existent story', () => {
      expect(store.deletePassage('Ghost', 'X')).toBe(false);
    });

    it('reassigns startPassage when the start passage is deleted', () => {
      store.create('D3');
      store.addPassage('D3', { name: 'First', text: '' });
      store.addPassage('D3', { name: 'Second', text: '' });
      expect(store.get('D3')!.startPassage).toBe('First');

      store.deletePassage('D3', 'First');
      expect(store.get('D3')!.startPassage).toBe('Second');
    });
  });

  // -------------------------------------------------------------------------
  // rename
  // -------------------------------------------------------------------------

  describe('rename', () => {
    it('makes the story accessible under the new name', () => {
      store.create('OldName');
      store.rename('OldName', 'NewName');
      expect(store.get('NewName')).toBeDefined();
      expect(store.get('NewName')!.name).toBe('NewName');
    });

    it('makes the old name return undefined', () => {
      store.create('Before');
      store.rename('Before', 'After');
      expect(store.get('Before')).toBeUndefined();
    });

    it('throws when renaming a non-existent story', () => {
      expect(() => store.rename('Ghost', 'New')).toThrow(/not found/);
    });

    it('throws when the new name already exists', () => {
      store.create('One');
      store.create('Two');
      expect(() => store.rename('One', 'Two')).toThrow(/already exists/);
    });
  });

  // -------------------------------------------------------------------------
  // delete (story)
  // -------------------------------------------------------------------------

  describe('delete', () => {
    it('removes the story', () => {
      store.create('Deletable');
      expect(store.delete('Deletable')).toBe(true);
      expect(store.get('Deletable')).toBeUndefined();
      expect(store.list()).not.toContain('Deletable');
    });

    it('returns false for a non-existent story', () => {
      expect(store.delete('Ghost')).toBe(false);
    });

    it('removes the persisted JSON file', () => {
      store.create('FileGone');
      const files = fs.readdirSync(tmpDir);
      expect(files.some((f) => f.includes('FileGone'))).toBe(true);

      store.delete('FileGone');
      const after = fs.readdirSync(tmpDir);
      expect(after.some((f) => f.includes('FileGone'))).toBe(false);
    });
  });

  // -------------------------------------------------------------------------
  // persistence
  // -------------------------------------------------------------------------

  describe('persistence', () => {
    it('persists stories to JSON files in the save directory', () => {
      store.create('Persist');
      const files = fs.readdirSync(tmpDir);
      expect(files).toHaveLength(1);
      expect(files[0]).toMatch(/\.json$/);

      const raw = fs.readFileSync(path.join(tmpDir, files[0]), 'utf-8');
      const data = JSON.parse(raw);
      expect(data.name).toBe('Persist');
    });

    it('reloads stories from disk when a new store is created', async () => {
      store.create('Reloaded');
      store.addPassage('Reloaded', { name: 'P1', text: 'content' });

      // Create a fresh store pointing at the same directory
      vi.resetModules();
      const mod2 = await import('../src/store');
      const store2 = mod2.store;

      expect(store2.get('Reloaded')).toBeDefined();
      expect(store2.get('Reloaded')!.passages).toHaveLength(1);
      expect(store2.get('Reloaded')!.passages[0].text).toBe('content');
    });
  });
});
