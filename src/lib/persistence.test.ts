import test, { mock } from 'node:test';
import assert from 'node:assert/strict';
import type { AppState } from '../types.ts';
import {
  STATE_KEY,
  UNREADABLE_KEY,
  createSaver,
  defaultState,
  fromImport,
  load,
  memoryAdapter,
  normalise,
  toExport,
} from './persistence.ts';
import { panelWidths } from './workspace.ts';

// ── Fixtures ────────────────────────────────────────────────────

// A complete, current-format state.
function current(): AppState {
  return {
    folders: [
      {
        id: 'f1',
        name: 'Work',
        hidden: false,
        panels: [
          { id: 'p1', title: 'Notes', content: '<p>hello</p>', hidden: false },
          { id: 'p2', title: 'Todo', content: '', hidden: true },
        ],
        panelWidths: [100],
      },
      { id: 'f2', name: 'Home', hidden: true, panels: [], panelWidths: [] },
    ],
    activeFolderId: 'f1',
    theme: { fontSize: 15, accentColor: 'iris' },
    preferences: {
      showPanelHeaders: false,
      showTabBarScrollBar: true,
      showPanelScrollBar: false,
    },
    ai: {
      provider: 'openai',
      apiKey: 'sk-secret',
      model: 'some-model',
      customBaseURL: '',
    },
  };
}

function must(raw: unknown): AppState {
  const state = normalise(raw);
  assert.ok(state, 'expected normalise to accept this input');
  return state;
}

// ── normalise: accept / reject ──────────────────────────────────

test('a current-format state passes through unchanged', () => {
  assert.deepEqual(normalise(current()), current());
});

test('normalise is stable: running it twice changes nothing more', () => {
  const once = must({ folders: [{ panels: [{}] }] });
  assert.deepEqual(normalise(once), once);
});

test('input that is not an object with a folders array is rejected', () => {
  for (const bad of [null, undefined, 'text', 42, [], {}, { folders: 'x' }]) {
    assert.equal(normalise(bad), null);
  }
});

test('normalise does not mutate its input', () => {
  const raw = { folders: [{ id: 'a', panels: [{ id: 'p' }] }], theme: {} };
  const snapshot = structuredClone(raw);
  normalise(raw);
  assert.deepEqual(raw, snapshot);
});

test('unknown fields are dropped', () => {
  const state = must({ ...current(), junk: 1 });
  assert.deepEqual(state, current());
});

// ── normalise: past formats ─────────────────────────────────────

test('the earliest format (folders only) gains every default', () => {
  const state = must({
    folders: [
      {
        id: 'f1',
        name: 'Old',
        panels: [{ id: 'p1', title: 'A', content: 'x' }],
      },
    ],
    activeFolderId: 'f1',
  });
  assert.equal(state.folders[0].hidden, false);
  assert.equal(state.folders[0].panels[0].hidden, false);
  assert.deepEqual(state.folders[0].panelWidths, []);
  assert.deepEqual(state.theme, { fontSize: 13, accentColor: 'amber' });
  assert.deepEqual(state.preferences, {
    showPanelHeaders: true,
    showTabBarScrollBar: false,
    showPanelScrollBar: true,
  });
  assert.deepEqual(state.ai, {
    provider: '',
    apiKey: '',
    model: '',
    customBaseURL: '',
  });
});

test('showPanelHeaders is carried over from the legacy theme', () => {
  const legacy = {
    folders: [],
    theme: { fontSize: 14, showPanelHeaders: false },
  };
  const state = must(legacy);
  assert.equal(state.preferences.showPanelHeaders, false);
  assert.deepEqual(state.theme, { fontSize: 14, accentColor: 'amber' });
});

test('a preference set directly wins over the legacy theme value', () => {
  const state = must({
    folders: [],
    theme: { showPanelHeaders: false },
    preferences: { showPanelHeaders: true },
  });
  assert.equal(state.preferences.showPanelHeaders, true);
});

test('partial AI settings are completed, not discarded', () => {
  const state = must({ folders: [], ai: { provider: 'gemini', apiKey: 'k' } });
  assert.deepEqual(state.ai, {
    provider: 'gemini',
    apiKey: 'k',
    model: '',
    customBaseURL: '',
  });
});

// ── normalise: validation ───────────────────────────────────────

test('font size is kept only as a whole number from 12 to 18', () => {
  const size = (fontSize: unknown) =>
    must({ folders: [], theme: { fontSize } }).theme.fontSize;
  assert.equal(size(12), 12);
  assert.equal(size(18), 18);
  assert.equal(size('16'), 16);
  assert.equal(size(11), 13);
  assert.equal(size(19), 13);
  assert.equal(size(14.5), 13);
  assert.equal(size('big'), 13);
  assert.equal(size(undefined), 13);
});

test('an unknown accent colour falls back to amber', () => {
  const accent = (accentColor: unknown) =>
    must({ folders: [], theme: { accentColor } }).theme.accentColor;
  assert.equal(accent('rose'), 'rose');
  assert.equal(accent('hotpink'), 'amber');
  assert.equal(accent(7), 'amber');
});

test('an unknown AI provider becomes unset', () => {
  assert.equal(must({ folders: [], ai: { provider: 'acme' } }).ai.provider, '');
});

test('wrong-typed folder and panel fields get defaults', () => {
  const state = must({
    folders: [
      {
        id: 'f',
        name: 5,
        hidden: 'false',
        panels: [{ id: 'p', title: null, content: 9, hidden: 'yes' }, 'junk'],
        panelWidths: 'wide',
      },
      null,
    ],
  });
  const [f, empty] = state.folders;
  assert.equal(f.name, 'Folder');
  assert.equal(f.hidden, false);
  assert.deepEqual(f.panelWidths, []);
  assert.deepEqual(
    f.panels.map((p) => [p.title, p.content, p.hidden]),
    [
      ['Notes', '', false],
      ['Notes', '', false],
    ],
  );
  assert.equal(empty.name, 'Folder');
  assert.deepEqual(empty.panels, []);
});

test('non-numeric widths are dropped and the panels fall back to equal', () => {
  const state = must({
    folders: [
      { id: 'f', panels: [{ id: 'a' }, { id: 'b' }], panelWidths: [50, 'x'] },
    ],
  });
  assert.deepEqual(state.folders[0].panelWidths, []);
  assert.deepEqual(panelWidths(state.folders[0]), [50, 50]);
});

test('missing ids are generated and duplicates replaced', () => {
  const state = must({
    folders: [
      { id: 'same', panels: [{ id: 'p' }, { id: 'p' }, {}] },
      { id: 'same', panels: [{ id: 'p' }] },
      { id: '' },
    ],
  });
  const folderIds = state.folders.map((f) => f.id);
  const panelIds = state.folders.flatMap((f) => f.panels.map((p) => p.id));
  assert.equal(folderIds[0], 'same');
  assert.equal(panelIds[0], 'p');
  assert.equal(new Set(folderIds).size, 3);
  assert.equal(new Set(panelIds).size, 4);
  for (const id of [...folderIds, ...panelIds]) assert.ok(id.length > 0);
});

test('numeric ids are kept as strings', () => {
  const state = must({
    folders: [{ id: 7, panels: [{ id: 8 }] }],
    activeFolderId: '7',
  });
  assert.equal(state.folders[0].id, '7');
  assert.equal(state.folders[0].panels[0].id, '8');
  assert.equal(state.activeFolderId, '7');
});

test('the active folder is repaired when missing, hidden or unknown', () => {
  const folders = [{ id: 'a', hidden: true }, { id: 'b' }];
  assert.equal(must({ folders }).activeFolderId, 'b');
  assert.equal(must({ folders, activeFolderId: 'a' }).activeFolderId, 'b');
  assert.equal(must({ folders, activeFolderId: 'zz' }).activeFolderId, 'b');
  assert.equal(must({ folders: [] }).activeFolderId, null);
});

// ── Export / import ─────────────────────────────────────────────

test('an export holds everything except the AI key', () => {
  const state = current();
  const file = toExport(state) as AppState;
  assert.equal(JSON.stringify(file).includes('sk-secret'), false);
  assert.equal('apiKey' in file.ai, false);
  assert.deepEqual(file.folders, state.folders);
  assert.deepEqual(file.theme, state.theme);
  assert.equal(file.ai.provider, 'openai');
});

test('export then import restores the state, keeping this device’s key', () => {
  const state = current();
  const file = JSON.parse(JSON.stringify(toExport(state)));
  assert.deepEqual(fromImport(file, state), state);
});

test('importing a file without a key keeps this device’s AI settings', () => {
  const device = current();
  const file = toExport({
    ...current(),
    ai: { provider: 'gemini', apiKey: 'other', model: 'm', customBaseURL: '' },
  });
  const next = fromImport(file, device);
  assert.deepEqual(next?.ai, device.ai);
});

test('importing a file that carries a key uses the file’s AI settings', () => {
  const file = {
    ...current(),
    ai: {
      provider: 'gemini',
      apiKey: 'from-file',
      model: 'm',
      customBaseURL: '',
    },
  };
  assert.equal(fromImport(file, current())?.ai.apiKey, 'from-file');
  assert.equal(fromImport(file, current())?.ai.provider, 'gemini');
});

test('with no key on the device, the file’s provider and model are taken', () => {
  const device = { ...current(), ai: { ...defaultState().ai } };
  const next = fromImport(toExport(current()), device);
  assert.equal(next?.ai.provider, 'openai');
  assert.equal(next?.ai.model, 'some-model');
  assert.equal(next?.ai.apiKey, '');
});

test('import replaces folders, theme and preferences', () => {
  const device = defaultState();
  const next = fromImport(toExport(current()), device);
  assert.deepEqual(next?.folders, current().folders);
  assert.deepEqual(next?.theme, current().theme);
  assert.deepEqual(next?.preferences, current().preferences);
});

test('importing something that is not a Lumafold file returns null', () => {
  assert.equal(fromImport({ hello: 'world' }, current()), null);
  assert.equal(fromImport('nope', current()), null);
});

// ── Load ────────────────────────────────────────────────────────

test('load returns the starter state when nothing is stored', async () => {
  const adapter = memoryAdapter();
  const state = await load(adapter);
  assert.equal(state.folders.length, 2);
  assert.equal(state.activeFolderId, state.folders[0].id);
  assert.equal(adapter.writes, 0);
});

test('load gives independent starter states each time', async () => {
  const a = await load(memoryAdapter());
  const b = await load(memoryAdapter());
  a.folders[0].name = 'changed';
  assert.notEqual(b.folders[0].name, 'changed');
});

test('load normalises what is stored', async () => {
  const adapter = memoryAdapter({
    [STATE_KEY]: { folders: [{ id: 'f', name: 'Old', panels: [] }] },
  });
  const state = await load(adapter);
  assert.equal(state.folders[0].name, 'Old');
  assert.equal(state.activeFolderId, 'f');
  assert.equal(state.theme.accentColor, 'amber');
  assert.equal(adapter.data.has(UNREADABLE_KEY), false);
});

test('unreadable stored data is backed up before defaults take over', async () => {
  for (const bad of ['{not json', { folders: 'broken' }, 42]) {
    const adapter = memoryAdapter({ [STATE_KEY]: bad });
    const state = await load(adapter);
    assert.equal(state.folders.length, 2);
    assert.deepEqual(adapter.data.get(UNREADABLE_KEY), bad);
    assert.deepEqual(adapter.data.get(STATE_KEY), bad);
  }
});

test('load survives a storage that throws', async (t) => {
  t.mock.method(console, 'error', () => {});
  const state = await load({
    read: async () => {
      throw new Error('boom');
    },
    write: async () => {},
  });
  assert.equal(state.folders.length, 2);
});

// ── Save ────────────────────────────────────────────────────────

test('a scheduled save lands only after the quiet period', async () => {
  mock.timers.enable({ apis: ['setTimeout'] });
  try {
    const adapter = memoryAdapter();
    const saver = createSaver(adapter, 400);
    saver.schedule(current());
    mock.timers.tick(399);
    assert.equal(adapter.writes, 0);
    mock.timers.tick(1);
    await Promise.resolve();
    assert.equal(adapter.writes, 1);
    assert.deepEqual(adapter.data.get(STATE_KEY), current());
  } finally {
    mock.timers.reset();
  }
});

test('rapid changes collapse into one save of the latest state', async () => {
  mock.timers.enable({ apis: ['setTimeout'] });
  try {
    const adapter = memoryAdapter();
    const saver = createSaver(adapter, 400);
    for (const name of ['a', 'b', 'c']) {
      const state = current();
      state.folders[0].name = name;
      saver.schedule(state);
      mock.timers.tick(200);
    }
    assert.equal(adapter.writes, 0);
    mock.timers.tick(400);
    await Promise.resolve();
    assert.equal(adapter.writes, 1);
    assert.equal(
      (adapter.data.get(STATE_KEY) as AppState).folders[0].name,
      'c',
    );
  } finally {
    mock.timers.reset();
  }
});

test('flush saves a waiting change immediately, and only once', async () => {
  mock.timers.enable({ apis: ['setTimeout'] });
  try {
    const adapter = memoryAdapter();
    const saver = createSaver(adapter, 400);
    saver.schedule(current());
    await saver.flush();
    assert.equal(adapter.writes, 1);
    mock.timers.tick(1000);
    await Promise.resolve();
    assert.equal(adapter.writes, 1);
  } finally {
    mock.timers.reset();
  }
});

test('flush with nothing waiting writes nothing', async () => {
  const adapter = memoryAdapter();
  await createSaver(adapter).flush();
  assert.equal(adapter.writes, 0);
});

test('a failed save does not throw and later saves still work', async (t) => {
  t.mock.method(console, 'error', () => {});
  let fail = true;
  const good = memoryAdapter();
  const saver = createSaver({
    read: good.read,
    write: async (key, value) => {
      if (fail) throw new Error('quota');
      await good.write(key, value);
    },
  });
  saver.schedule(current());
  await saver.flush();
  assert.equal(good.writes, 0);
  fail = false;
  saver.schedule(current());
  await saver.flush();
  assert.equal(good.writes, 1);
});

test('what is saved can be loaded back unchanged', async () => {
  const adapter = memoryAdapter();
  const saver = createSaver(adapter);
  saver.schedule(current());
  await saver.flush();
  assert.deepEqual(await load(adapter), current());
});
