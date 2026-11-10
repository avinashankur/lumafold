import test from 'node:test';
import assert from 'node:assert/strict';
import {
  SHORTCUTS,
  type KeyPress,
  matchShortcut,
  shortcutLabel,
} from './shortcuts.ts';

function press(key: string, mods: Partial<KeyPress> = {}): KeyPress {
  return {
    key,
    ctrlKey: true,
    metaKey: false,
    shiftKey: false,
    altKey: false,
    ...mods,
  };
}

test('every shortcut has a unique id, a description and keys to show', () => {
  const ids = SHORTCUTS.map((s) => s.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const s of SHORTCUTS) {
    assert.ok(s.description);
    assert.equal(s.keys[0], 'Ctrl');
    assert.equal(s.keys.includes('Shift'), s.shift);
  }
});

test('no two shortcuts answer to the same key press', () => {
  const seen = new Set<string>();
  for (const s of SHORTCUTS) {
    for (const key of s.key) {
      const combo = `${s.shift}:${key}`;
      assert.ok(!seen.has(combo), `duplicate combo ${combo}`);
      seen.add(combo);
    }
  }
});

test('shortcutLabel joins the keys', () => {
  assert.equal(shortcutLabel('newFolder'), 'Ctrl+T');
  assert.equal(shortcutLabel('addPanel'), 'Ctrl+Shift+]');
  assert.equal(shortcutLabel('settings'), 'Ctrl+,');
  assert.equal(shortcutLabel('aiMenu'), 'Ctrl+Shift+A');
});

test('each shortcut matches its own key press', () => {
  assert.deepEqual(matchShortcut(press('t')), { id: 'newFolder' });
  assert.deepEqual(matchShortcut(press(',')), { id: 'settings' });
  assert.deepEqual(matchShortcut(press('L', { shiftKey: true })), {
    id: 'toggleTheme',
  });
  assert.deepEqual(matchShortcut(press('A', { shiftKey: true })), {
    id: 'aiMenu',
  });
});

test('Cmd works in place of Ctrl', () => {
  assert.deepEqual(
    matchShortcut(press('t', { ctrlKey: false, metaKey: true })),
    { id: 'newFolder' },
  );
});

test('nothing matches without Ctrl or Cmd', () => {
  assert.equal(matchShortcut(press('t', { ctrlKey: false })), null);
  assert.equal(matchShortcut(press(',', { ctrlKey: false })), null);
});

test('Shift must match exactly', () => {
  assert.equal(matchShortcut(press('T', { shiftKey: true })), null);
  assert.equal(matchShortcut(press('l')), null);
  assert.equal(matchShortcut(press('a')), null);
});

test('add panel matches whatever character Shift+] produces', () => {
  const shift = { shiftKey: true };
  assert.deepEqual(matchShortcut(press(']', shift)), { id: 'addPanel' });
  assert.deepEqual(matchShortcut(press('}', shift)), { id: 'addPanel' });
  assert.deepEqual(
    matchShortcut(press('*', { ...shift, code: 'BracketRight' })),
    { id: 'addPanel' },
  );
  assert.equal(matchShortcut(press(']')), null);
});

test('Ctrl+1 to Ctrl+9 switch folder, by zero-based index', () => {
  assert.deepEqual(matchShortcut(press('1')), { id: 'switchFolder', index: 0 });
  assert.deepEqual(matchShortcut(press('9')), { id: 'switchFolder', index: 8 });
  assert.equal(matchShortcut(press('0')), null);
});

test('Ctrl+Alt+digit is left to the editor', () => {
  assert.equal(matchShortcut(press('1', { altKey: true })), null);
  assert.equal(matchShortcut(press('3', { altKey: true })), null);
});

test('editor shortcuts are not claimed', () => {
  for (const key of ['b', 'i', 'u', 'z', 'c', 'v', 'e']) {
    assert.equal(matchShortcut(press(key)), null);
  }
  assert.equal(matchShortcut(press('S', { shiftKey: true })), null);
  assert.equal(matchShortcut(press('7', { shiftKey: true })), null);
});
