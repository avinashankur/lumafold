import test from 'node:test';
import assert from 'node:assert/strict';

// Set up chrome mocks on globalThis before dynamically importing background.ts
const sessionStorage: Record<string, unknown> = {};
const localStorage: Record<string, unknown> = {};

let createCallCount = 0;
let updateCallCount = 0;
let nextWindowId = 100;
const openWindows = new Map<
  number,
  { id: number; state?: string; focused?: boolean }
>();

let onBoundsChangedListener:
  | ((win: {
      id?: number;
      state?: string;
      width?: number;
      height?: number;
      left?: number;
      top?: number;
    }) => Promise<void>)
  | null = null;

(globalThis as unknown as { chrome: unknown }).chrome = {
  commands: {
    onCommand: { addListener: () => {} },
  },
  action: {
    setPopup: async () => {},
    onClicked: { addListener: () => {} },
  },
  runtime: {
    onInstalled: { addListener: () => {} },
    onStartup: { addListener: () => {} },
    getURL: (path: string) => `chrome-extension://mock-id/${path}`,
    onMessage: { addListener: () => {} },
  },
  storage: {
    local: {
      get: async (key: string) => ({ [key]: localStorage[key] }),
      set: async (items: Record<string, unknown>) => {
        Object.assign(localStorage, items);
      },
    },
    session: {
      get: async (key: string) => ({ [key]: sessionStorage[key] }),
      set: async (items: Record<string, unknown>) => {
        Object.assign(sessionStorage, items);
      },
      remove: async (key: string) => {
        delete sessionStorage[key];
      },
    },
    onChanged: { addListener: () => {} },
  },
  system: {
    display: {
      getInfo: async () => [
        {
          id: 'primary',
          bounds: { left: 0, top: 0, width: 1920, height: 1080 },
          isEnabled: true,
        },
      ],
    },
  },
  windows: {
    getAll: async () => [],
    get: async (windowId: number) => {
      const win = openWindows.get(windowId);
      if (!win) throw new Error('Window not found');
      return win;
    },
    create: async () => {
      createCallCount++;
      // Simulate slight async delay so overlapping calls would race if unshared
      await new Promise((r) => setTimeout(r, 10));
      const id = ++nextWindowId;
      const win = { id, state: 'normal', focused: true };
      openWindows.set(id, win);
      return win;
    },
    update: async (
      windowId: number,
      updateInfo: { focused?: boolean; state?: string },
    ) => {
      updateCallCount++;
      const win = openWindows.get(windowId);
      if (win) Object.assign(win, updateInfo);
      return win;
    },
    onRemoved: { addListener: () => {} },
    onBoundsChanged: {
      addListener: (fn: typeof onBoundsChangedListener) => {
        onBoundsChangedListener = fn;
      },
    },
  },
};

const { openOrFocusFloatingWindow } = await import('../src/background.ts');

test('overlapping openOrFocusFloatingWindow calls share one operation and return the same window', async () => {
  createCallCount = 0;
  const [p1, p2] = [openOrFocusFloatingWindow(), openOrFocusFloatingWindow()];
  assert.equal(
    p1,
    p2,
    'Both calls should share the exact same promise instance',
  );

  const [id1, id2] = await Promise.all([p1, p2]);
  assert.equal(id1, id2);
  assert.equal(createCallCount, 1, 'Only one window should have been created');
  assert.equal(sessionStorage['windowId'], id1);
});

test('subsequent call focuses the existing window rather than creating a new one', async () => {
  createCallCount = 0;
  updateCallCount = 0;

  const id = await openOrFocusFloatingWindow();
  assert.equal(
    createCallCount,
    0,
    'No new window should be created when one already exists',
  );
  assert.equal(updateCallCount, 1, 'Existing window should be focused');
  assert.equal(id, sessionStorage['windowId']);
});

test('concurrent calls when window already exists also share pending operation', async () => {
  updateCallCount = 0;
  const [p1, p2] = [openOrFocusFloatingWindow(), openOrFocusFloatingWindow()];
  assert.equal(p1, p2);

  const [id1, id2] = await Promise.all([p1, p2]);
  assert.equal(id1, id2);
  assert.equal(updateCallCount, 1);
});

test('cleans up pending operation on failure so next attempt can proceed', async () => {
  delete sessionStorage['windowId'];
  const chromeWindows = (
    globalThis as unknown as {
      chrome: { windows: { create: () => Promise<unknown> } };
    }
  ).chrome.windows;
  const originalCreate = chromeWindows.create;
  chromeWindows.create = async () => {
    throw new Error('Create failed');
  };

  await assert.rejects(
    async () => {
      await openOrFocusFloatingWindow();
    },
    { message: 'Create failed' },
  );

  // Restore create and verify next call succeeds
  chromeWindows.create = originalCreate;
  const id = await openOrFocusFloatingWindow();
  assert.ok(typeof id === 'number');
});

test('onBoundsChanged listener does not overwrite saved bounds when window is maximized', async () => {
  sessionStorage['windowId'] = 100;
  localStorage['floatingBounds'] = {
    width: 380,
    height: 540,
    left: 200,
    top: 150,
  };

  assert.ok(onBoundsChangedListener, 'Listener should have been registered');

  // Trigger onBoundsChanged with maximized window state
  await onBoundsChangedListener({
    id: 100,
    state: 'maximized',
    width: 1920,
    height: 1080,
    left: 0,
    top: 0,
  });

  // Saved bounds should NOT have been overwritten
  assert.deepEqual(localStorage['floatingBounds'], {
    width: 380,
    height: 540,
    left: 200,
    top: 150,
  });

  // Trigger onBoundsChanged with normal window state
  await onBoundsChangedListener({
    id: 100,
    state: 'normal',
    width: 450,
    height: 600,
    left: 250,
    top: 180,
  });

  // Saved bounds should be updated
  assert.deepEqual(localStorage['floatingBounds'], {
    width: 450,
    height: 600,
    left: 250,
    top: 180,
  });
});
