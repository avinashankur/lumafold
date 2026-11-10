import test from 'node:test';
import assert from 'node:assert/strict';
import type { Folder, Panel, Workspace } from '../types.ts';
import {
  MAX_VISIBLE_PANELS,
  MIN_PANEL_WIDTH,
  activeFolder,
  addFolder,
  addPanel,
  canShowAnotherPanel,
  deleteFolder,
  deletePanel,
  equalizePanels,
  folderHasContent,
  hideFolder,
  hidePanel,
  initialWorkspace,
  moveFolder,
  movePanel,
  panelHasContent,
  panelWidths,
  plainText,
  renameFolder,
  renamePanel,
  resizePanels,
  setActiveFolder,
  setPanelContent,
  showFolder,
  showPanel,
  visibleFolders,
  visiblePanels,
  withValidActiveFolder,
} from './workspace.ts';

// ── Fixtures ────────────────────────────────────────────────────

function panel(id: string, over: Partial<Panel> = {}): Panel {
  return { id, title: id, content: '', hidden: false, ...over };
}

function folder(id: string, over: Partial<Folder> = {}): Folder {
  const panels = over.panels ?? [panel(`${id}-1`), panel(`${id}-2`)];
  return {
    id,
    name: id,
    hidden: false,
    panels,
    panelWidths: [50, 50],
    ...over,
  };
}

function workspace(
  folders: Folder[],
  activeFolderId?: string | null,
): Workspace {
  return {
    folders,
    activeFolderId:
      activeFolderId === undefined ? (folders[0]?.id ?? null) : activeFolderId,
  };
}

const folderIds = (ws: Workspace) => ws.folders.map((f) => f.id);
const panelIds = (ws: Workspace, folderId: string) =>
  ws.folders.find((f) => f.id === folderId)!.panels.map((p) => p.id);
const widthsOf = (ws: Workspace, folderId: string) =>
  panelWidths(ws.folders.find((f) => f.id === folderId)!);

function assertWidths(actual: number[], expected: number[]) {
  assert.equal(actual.length, expected.length);
  actual.forEach((w, i) =>
    assert.ok(
      Math.abs(w - expected[i]) < 1e-9,
      `width ${i}: expected ${expected[i]}, got ${w}`,
    ),
  );
}

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);

// ── Starter content ─────────────────────────────────────────────

test('initialWorkspace has two folders, the first active, with unique ids', () => {
  const ws = initialWorkspace();
  assert.equal(ws.folders.length, 2);
  assert.equal(ws.activeFolderId, ws.folders[0].id);
  const ids = ws.folders.flatMap((f) => [f.id, ...f.panels.map((p) => p.id)]);
  assert.equal(new Set(ids).size, ids.length);
  for (const f of ws.folders) assertWidths(panelWidths(f), [50, 50]);
});

// ── Content queries ─────────────────────────────────────────────

test('plainText strips tags and surrounding whitespace', () => {
  assert.equal(plainText('<p> Hello <b>there</b> </p>'), 'Hello there');
});

test('a panel holding only empty markup has no content', () => {
  assert.equal(panelHasContent(panel('a', { content: '' })), false);
  assert.equal(panelHasContent(panel('a', { content: '<p></p>' })), false);
  assert.equal(panelHasContent(panel('a', { content: '<p>  </p>' })), false);
  assert.equal(panelHasContent(panel('a', { content: '<p>x</p>' })), true);
});

test('a folder has content if any panel does, hidden ones included', () => {
  assert.equal(folderHasContent(folder('a')), false);
  const f = folder('a', {
    panels: [panel('p1'), panel('p2', { content: '<p>x</p>', hidden: true })],
  });
  assert.equal(folderHasContent(f), true);
});

// ── Active folder ───────────────────────────────────────────────

test('withValidActiveFolder repairs a missing, hidden or unset active folder', () => {
  const folders = [folder('a', { hidden: true }), folder('b'), folder('c')];
  assert.equal(
    withValidActiveFolder(workspace(folders, null)).activeFolderId,
    'b',
  );
  assert.equal(
    withValidActiveFolder(workspace(folders, 'a')).activeFolderId,
    'b',
  );
  assert.equal(
    withValidActiveFolder(workspace(folders, 'zz')).activeFolderId,
    'b',
  );
});

test('withValidActiveFolder leaves a valid workspace untouched', () => {
  const ws = workspace([folder('a'), folder('b')], 'b');
  assert.equal(withValidActiveFolder(ws), ws);
});

test('withValidActiveFolder gives null when no folder is visible', () => {
  const ws = workspace([folder('a', { hidden: true })], 'a');
  assert.equal(withValidActiveFolder(ws).activeFolderId, null);
});

test('setActiveFolder ignores hidden and unknown folders', () => {
  const ws = workspace([
    folder('a'),
    folder('b', { hidden: true }),
    folder('c'),
  ]);
  assert.equal(setActiveFolder(ws, 'c').activeFolderId, 'c');
  assert.equal(setActiveFolder(ws, 'b'), ws);
  assert.equal(setActiveFolder(ws, 'zz'), ws);
});

// ── Folders ─────────────────────────────────────────────────────

test('addFolder appends an active folder with a fresh name and two panels', () => {
  const ws = workspace([folder('a'), folder('b')]);
  const next = addFolder(ws);
  assert.equal(next.folders.length, 3);
  const added = next.folders[2];
  assert.equal(next.activeFolderId, added.id);
  assert.ok(added.name.length > 0);
  assert.ok(!['a', 'b'].includes(added.name));
  assert.deepEqual(
    added.panels.map((p) => p.title),
    ['Notes', 'Action Items'],
  );
  assert.equal(added.hidden, false);
  assertWidths(panelWidths(added), [50, 50]);
});

test('deleting the active folder activates the first visible folder', () => {
  const ws = workspace(
    [folder('a', { hidden: true }), folder('b'), folder('c'), folder('d')],
    'd',
  );
  const next = deleteFolder(ws, 'd');
  assert.deepEqual(folderIds(next), ['a', 'b', 'c']);
  assert.equal(next.activeFolderId, 'b');
});

test('deleting another folder keeps the active one', () => {
  const next = deleteFolder(workspace([folder('a'), folder('b')], 'b'), 'a');
  assert.equal(next.activeFolderId, 'b');
});

test('deleting the last folder leaves nothing active', () => {
  const next = deleteFolder(workspace([folder('a')]), 'a');
  assert.deepEqual(next, { folders: [], activeFolderId: null });
});

test('hiding the active folder activates the first visible folder', () => {
  const ws = workspace([folder('a'), folder('b'), folder('c')], 'c');
  const next = hideFolder(ws, 'c');
  assert.equal(next.folders[2].hidden, true);
  assert.equal(next.activeFolderId, 'a');
});

test('showing a hidden folder makes it active', () => {
  const ws = workspace([folder('a'), folder('b', { hidden: true })], 'a');
  const next = showFolder(ws, 'b');
  assert.equal(next.folders[1].hidden, false);
  assert.equal(next.activeFolderId, 'b');
});

test('renameFolder changes only that name', () => {
  const next = renameFolder(
    workspace([folder('a'), folder('b')]),
    'b',
    'Ideas',
  );
  assert.deepEqual(
    next.folders.map((f) => f.name),
    ['a', 'Ideas'],
  );
});

test('folder transitions with an unknown id return the same workspace', () => {
  const ws = workspace([folder('a')]);
  assert.equal(deleteFolder(ws, 'zz'), ws);
  assert.equal(hideFolder(ws, 'zz'), ws);
  assert.equal(showFolder(ws, 'zz'), ws);
  assert.equal(renameFolder(ws, 'zz', 'x'), ws);
  assert.equal(moveFolder(ws, 'a', 'zz'), ws);
});

// ── Folder reorder ──────────────────────────────────────────────

test('moving a folder right lands it after the target', () => {
  const ws = workspace([folder('a'), folder('b'), folder('c')]);
  assert.deepEqual(folderIds(moveFolder(ws, 'a', 'c')), ['b', 'c', 'a']);
});

test('moving a folder left lands it before the target', () => {
  const ws = workspace([folder('a'), folder('b'), folder('c')]);
  assert.deepEqual(folderIds(moveFolder(ws, 'c', 'a')), ['c', 'a', 'b']);
});

test('reordering is correct when a hidden folder sits before the tabs', () => {
  // Tabs shown: b, c, d. Dragging b onto d must give c, d, b.
  // (Passing tab positions to an index splice used to move the hidden one.)
  const ws = workspace(
    [folder('h', { hidden: true }), folder('b'), folder('c'), folder('d')],
    'b',
  );
  const next = moveFolder(ws, 'b', 'd');
  assert.deepEqual(
    visibleFolders(next).map((f) => f.id),
    ['c', 'd', 'b'],
  );
  assert.equal(next.folders[0].id, 'h');
  assert.equal(next.activeFolderId, 'b');
});

test('moving a folder onto itself changes nothing', () => {
  const ws = workspace([folder('a'), folder('b')]);
  assert.equal(moveFolder(ws, 'a', 'a'), ws);
});

// ── Panels and the visible limit ────────────────────────────────

test('addPanel appends "New Panel" and resets widths to equal', () => {
  const ws = workspace([folder('a', { panelWidths: [70, 30] })]);
  const next = addPanel(ws, 'a');
  const f = next.folders[0];
  assert.equal(f.panels.length, 3);
  assert.equal(f.panels[2].title, 'New Panel');
  assert.equal(f.panels[2].hidden, false);
  assertWidths(panelWidths(f), [100 / 3, 100 / 3, 100 / 3]);
});

test('addPanel does nothing once the visible limit is reached', () => {
  const full = folder('a', { panels: [panel('1'), panel('2'), panel('3')] });
  const ws = workspace([full]);
  assert.equal(MAX_VISIBLE_PANELS, 3);
  assert.equal(canShowAnotherPanel(full), false);
  assert.equal(addPanel(ws, 'a'), ws);
});

test('hidden panels do not count toward the limit', () => {
  const f = folder('a', {
    panels: [panel('1'), panel('2'), panel('3', { hidden: true }), panel('4')],
  });
  assert.equal(canShowAnotherPanel(f), false);
  const roomy = folder('b', {
    panels: [panel('1'), panel('2'), panel('3', { hidden: true })],
  });
  assert.equal(canShowAnotherPanel(roomy), true);
  assert.equal(addPanel(workspace([roomy]), 'b').folders[0].panels.length, 4);
});

test('showPanel is blocked at the limit and works below it', () => {
  const panels = [
    panel('1'),
    panel('2'),
    panel('3'),
    panel('4', { hidden: true }),
  ];
  const ws = workspace([folder('a', { panels })]);
  assert.equal(showPanel(ws, 'a', '4'), ws);

  const freed = hidePanel(ws, 'a', '1');
  const next = showPanel(freed, 'a', '4');
  assert.deepEqual(
    visiblePanels(next.folders[0]).map((p) => p.id),
    ['2', '3', '4'],
  );
});

test('showPanel on a panel that is already visible changes nothing', () => {
  const ws = workspace([folder('a')]);
  assert.equal(showPanel(ws, 'a', 'a-1'), ws);
});

test('hiding a panel keeps its content and resets widths', () => {
  const panels = [
    panel('1', { content: '<p>keep</p>' }),
    panel('2'),
    panel('3'),
  ];
  const ws = workspace([folder('a', { panels, panelWidths: [20, 30, 50] })]);
  const next = hidePanel(ws, 'a', '1');
  const f = next.folders[0];
  assert.equal(f.panels[0].hidden, true);
  assert.equal(f.panels[0].content, '<p>keep</p>');
  assertWidths(panelWidths(f), [50, 50]);
});

test('the last visible panel can be hidden or deleted', () => {
  const ws = workspace([
    folder('a', { panels: [panel('1')], panelWidths: [100] }),
  ]);
  const hidden = hidePanel(ws, 'a', '1');
  assert.equal(visiblePanels(hidden.folders[0]).length, 0);
  assert.deepEqual(panelWidths(hidden.folders[0]), []);
  const deleted = deletePanel(ws, 'a', '1');
  assert.equal(deleted.folders[0].panels.length, 0);
  assert.deepEqual(panelWidths(deleted.folders[0]), []);
});

test('deleting a visible panel resets widths; deleting a hidden one does not', () => {
  const panels = [panel('1'), panel('2'), panel('3', { hidden: true })];
  const ws = workspace([folder('a', { panels, panelWidths: [70, 30] })]);
  assertWidths(widthsOf(deletePanel(ws, 'a', '3'), 'a'), [70, 30]);
  assertWidths(widthsOf(deletePanel(ws, 'a', '1'), 'a'), [100]);
});

test('renaming and editing a panel leave order and widths alone', () => {
  const ws = workspace([folder('a', { panelWidths: [70, 30] })]);
  const next = setPanelContent(
    renamePanel(ws, 'a', 'a-2', 'Todo'),
    'a',
    'a-2',
    '<p>x</p>',
  );
  const f = next.folders[0];
  assert.equal(f.panels[1].title, 'Todo');
  assert.equal(f.panels[1].content, '<p>x</p>');
  assert.equal(f.panels[0].title, 'a-1');
  assertWidths(panelWidths(f), [70, 30]);
});

test('panel transitions only touch the named folder', () => {
  const ws = workspace([folder('a'), folder('b')]);
  const next = addPanel(ws, 'b');
  assert.equal(next.folders[0], ws.folders[0]);
  assert.equal(addPanel(ws, 'zz'), ws);
});

// ── Panel reorder ───────────────────────────────────────────────

test('moving a panel carries its width with it', () => {
  const panels = [panel('1'), panel('2'), panel('3')];
  const ws = workspace([folder('a', { panels, panelWidths: [20, 30, 50] })]);
  const next = movePanel(ws, 'a', '1', '3');
  assert.deepEqual(panelIds(next, 'a'), ['2', '3', '1']);
  assertWidths(widthsOf(next, 'a'), [30, 50, 20]);
});

test('moving a panel past a hidden one keeps the hidden one out of the widths', () => {
  const panels = [panel('1'), panel('h', { hidden: true }), panel('2')];
  const ws = workspace([folder('a', { panels, panelWidths: [25, 75] })]);
  const next = movePanel(ws, 'a', '2', '1');
  assert.deepEqual(
    visiblePanels(next.folders[0]).map((p) => p.id),
    ['2', '1'],
  );
  assertWidths(widthsOf(next, 'a'), [75, 25]);
});

// ── Widths ──────────────────────────────────────────────────────

test('panelWidths falls back to equal when stored widths do not fit', () => {
  const three = [panel('1'), panel('2'), panel('3')];
  assertWidths(
    panelWidths(folder('a', { panels: three, panelWidths: [50, 50] })),
    [100 / 3, 100 / 3, 100 / 3],
  );
  assertWidths(panelWidths(folder('a', { panelWidths: [0, 100] })), [50, 50]);
  assertWidths(panelWidths(folder('a', { panelWidths: [NaN, 50] })), [50, 50]);
  assertWidths(
    panelWidths(folder('a', { panelWidths: undefined as unknown as number[] })),
    [50, 50],
  );
});

test('panelWidths always sums to 100', () => {
  const three = [panel('1'), panel('2'), panel('3')];
  const stale = folder('a', { panels: three, panelWidths: [33, 33, 33] });
  assert.ok(Math.abs(sum(panelWidths(stale)) - 100) < 1e-9);
  assertWidths(panelWidths(stale), [100 / 3, 100 / 3, 100 / 3]);
});

test('equalizePanels resets custom widths', () => {
  const ws = workspace([folder('a', { panelWidths: [80, 20] })]);
  assertWidths(widthsOf(equalizePanels(ws, 'a'), 'a'), [50, 50]);
});

test('resizePanels moves the divider by the delta from the start widths', () => {
  const ws = workspace([folder('a')]);
  assertWidths(widthsOf(resizePanels(ws, 'a', 0, [50, 50], 10), 'a'), [60, 40]);
  assertWidths(
    widthsOf(resizePanels(ws, 'a', 0, [50, 50], -10), 'a'),
    [40, 60],
  );
});

test('resizePanels stops exactly at the minimum width', () => {
  const ws = workspace([folder('a')]);
  const min = MIN_PANEL_WIDTH;
  assertWidths(widthsOf(resizePanels(ws, 'a', 0, [50, 50], 90), 'a'), [
    100 - min,
    min,
  ]);
  assertWidths(widthsOf(resizePanels(ws, 'a', 0, [50, 50], -90), 'a'), [
    min,
    100 - min,
  ]);
});

test('resizePanels only changes the two panels beside the divider', () => {
  const panels = [panel('1'), panel('2'), panel('3')];
  const ws = workspace([folder('a', { panels, panelWidths: [30, 30, 40] })]);
  const next = resizePanels(ws, 'a', 1, [30, 30, 40], 5);
  assertWidths(widthsOf(next, 'a'), [30, 35, 35]);
});

test('resizePanels never widens a panel that starts below the minimum', () => {
  const ws = workspace([folder('a', { panelWidths: [10, 90] })]);
  assertWidths(widthsOf(resizePanels(ws, 'a', 0, [10, 90], -5), 'a'), [10, 90]);
  assertWidths(widthsOf(resizePanels(ws, 'a', 0, [10, 90], 5), 'a'), [15, 85]);
});

test('resizePanels ignores a bad divider or stale start widths', () => {
  const ws = workspace([folder('a')]);
  assert.equal(resizePanels(ws, 'a', 1, [50, 50], 5), ws);
  assert.equal(resizePanels(ws, 'a', -1, [50, 50], 5), ws);
  assert.equal(resizePanels(ws, 'a', 0, [30, 30, 40], 5), ws);
});

// ── Purity ──────────────────────────────────────────────────────

test('transitions do not mutate their input', () => {
  const ws = workspace([folder('a'), folder('b')]);
  const snapshot = structuredClone(ws);
  addFolder(ws);
  deleteFolder(ws, 'a');
  hideFolder(ws, 'a');
  moveFolder(ws, 'a', 'b');
  addPanel(ws, 'a');
  hidePanel(ws, 'a', 'a-1');
  deletePanel(ws, 'a', 'a-1');
  movePanel(ws, 'a', 'a-1', 'a-2');
  resizePanels(ws, 'a', 0, [50, 50], 10);
  equalizePanels(ws, 'a');
  assert.deepEqual(ws, snapshot);
});

test('activeFolder returns the active folder, or undefined when none', () => {
  assert.equal(
    activeFolder(workspace([folder('a'), folder('b')], 'b'))?.id,
    'b',
  );
  assert.equal(activeFolder(workspace([], null)), undefined);
});
