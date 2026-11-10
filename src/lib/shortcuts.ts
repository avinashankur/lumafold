// The app's keyboard shortcuts, in one table. The key listener, the list in
// Settings and every tooltip read from here, so they cannot disagree.
// (Editor shortcuts such as Ctrl+B belong to the editor, not this table.)

export type ShortcutId =
  | 'newFolder'
  | 'addPanel'
  | 'switchFolder'
  | 'aiMenu'
  | 'toggleTheme'
  | 'settings';

export interface Shortcut {
  id: ShortcutId;
  description: string;
  keys: string[]; // as shown to the user, e.g. ['Ctrl', 'Shift', ']']
  shift: boolean;
  // Any of these `event.key` values (compared lower-case) triggers it…
  key: string[];
  // …or this physical key, for keys whose character changes with Shift.
  code?: string;
}

export const SHORTCUTS: readonly Shortcut[] = [
  {
    id: 'newFolder',
    description: 'New folder',
    keys: ['Ctrl', 'T'],
    shift: false,
    key: ['t'],
  },
  {
    id: 'addPanel',
    description: 'Add panel',
    keys: ['Ctrl', 'Shift', ']'],
    shift: true,
    key: [']', '}'],
    code: 'BracketRight',
  },
  {
    id: 'switchFolder',
    description: 'Switch to folder 1–9',
    keys: ['Ctrl', '1–9'],
    shift: false,
    key: ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
  },
  {
    id: 'aiMenu',
    description: 'AI actions (in a focused panel)',
    keys: ['Ctrl', 'Shift', 'A'],
    shift: true,
    key: ['a'],
  },
  {
    id: 'toggleTheme',
    description: 'Toggle light / dark',
    keys: ['Ctrl', 'Shift', 'L'],
    shift: true,
    key: ['l'],
  },
  {
    id: 'settings',
    description: 'Settings',
    keys: ['Ctrl', ','],
    shift: false,
    key: [','],
  },
];

// "Ctrl+Shift+]" — for tooltips and inline hints.
export function shortcutLabel(id: ShortcutId): string {
  const shortcut = SHORTCUTS.find((s) => s.id === id);
  return shortcut ? shortcut.keys.join('+') : '';
}

export interface KeyPress {
  key: string;
  code?: string;
  ctrlKey: boolean;
  metaKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
}

export interface ShortcutMatch {
  id: ShortcutId;
  index?: number; // switchFolder only: 0 for "1" … 8 for "9"
}

// Which shortcut, if any, a key press is. Ctrl or Cmd is always required,
// Shift must match exactly, and Alt must be up (Ctrl+Alt+1 is the editor's
// Heading 1, not "switch to folder 1").
export function matchShortcut(e: KeyPress): ShortcutMatch | null {
  if (!(e.ctrlKey || e.metaKey) || e.altKey) return null;
  const key = e.key.toLowerCase();
  const shortcut = SHORTCUTS.find(
    (s) =>
      s.shift === e.shiftKey &&
      (s.key.includes(key) || (s.code !== undefined && s.code === e.code)),
  );
  if (!shortcut) return null;
  if (shortcut.id === 'switchFolder') {
    return { id: shortcut.id, index: Number(key) - 1 };
  }
  return { id: shortcut.id };
}
