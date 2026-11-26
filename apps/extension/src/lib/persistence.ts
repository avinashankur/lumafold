// Everything about getting AppState in and out of storage and files:
// defaults, the one normaliser (used by load and import alike), the storage
// adapters, and save timing. No React.

import type {
  AccentColor,
  AIProvider,
  AISettings,
  AppState,
  Folder,
  Panel,
  PreferencesSettingTypes,
  ThemeSettings,
} from '../types.ts';
import {
  generateId,
  initialWorkspace,
  withValidActiveFolder,
} from './workspace.ts';

// ── Defaults ────────────────────────────────────────────────────

export const MIN_FONT_SIZE = 12;
export const MAX_FONT_SIZE = 18;
export const DEFAULT_FONT_SIZE = 13;
export const DEFAULT_ACCENT_COLOR: AccentColor = 'amber';

const ACCENT_COLORS: readonly AccentColor[] = [
  'amber',
  'iris',
  'emerald',
  'sapphire',
  'rose',
  'monochrome',
];
const AI_PROVIDERS: readonly AIProvider[] = ['gemini', 'openai', 'custom'];

const DEFAULT_PREFERENCES: PreferencesSettingTypes = {
  showPanelHeaders: true,
  showTabBarScrollBar: false,
  showPanelScrollBar: true,
};

export function defaultState(): AppState {
  return {
    ...initialWorkspace(),
    theme: { fontSize: DEFAULT_FONT_SIZE, accentColor: DEFAULT_ACCENT_COLOR },
    preferences: { ...DEFAULT_PREFERENCES },
    ai: { provider: '', apiKey: '', model: '', customBaseURL: '' },
  };
}

// ── Normalise ───────────────────────────────────────────────────

type Rec = Record<string, unknown>;

function rec(value: unknown): Rec {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Rec)
    : {};
}

function str(value: unknown, fallback: string): string {
  return typeof value === 'string' ? value : fallback;
}

function bool(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

// Keeps a usable id; replaces a missing, empty or already-seen one.
function uniqueId(value: unknown, seen: Set<string>): string {
  let id =
    typeof value === 'string' || typeof value === 'number' ? String(value) : '';
  while (!id || seen.has(id)) id = generateId();
  seen.add(id);
  return id;
}

function normalisePanel(value: unknown, seen: Set<string>): Panel {
  const p = rec(value);
  return {
    id: uniqueId(p.id, seen),
    title: str(p.title, 'Notes'),
    content: str(p.content, ''),
    hidden: p.hidden === true,
  };
}

function normaliseFolder(
  value: unknown,
  seenFolders: Set<string>,
  seenPanels: Set<string>,
): Folder {
  const f = rec(value);
  const widths = Array.isArray(f.panelWidths) ? f.panelWidths : [];
  return {
    id: uniqueId(f.id, seenFolders),
    name: str(f.name, 'Folder'),
    hidden: f.hidden === true,
    panels: (Array.isArray(f.panels) ? f.panels : []).map((p) =>
      normalisePanel(p, seenPanels),
    ),
    // Whether these fit the visible panels is workspace.panelWidths' job.
    panelWidths: widths.every(
      (w) => typeof w === 'number' && Number.isFinite(w),
    )
      ? (widths as number[])
      : [],
  };
}

function normaliseTheme(value: unknown): ThemeSettings {
  const t = rec(value);
  const size = typeof t.fontSize === 'string' ? Number(t.fontSize) : t.fontSize;
  return {
    fontSize:
      typeof size === 'number' &&
      Number.isInteger(size) &&
      size >= MIN_FONT_SIZE &&
      size <= MAX_FONT_SIZE
        ? size
        : DEFAULT_FONT_SIZE,
    accentColor: ACCENT_COLORS.includes(t.accentColor as AccentColor)
      ? (t.accentColor as AccentColor)
      : DEFAULT_ACCENT_COLOR,
  };
}

function normalisePreferences(
  value: unknown,
  legacyTheme: unknown,
): PreferencesSettingTypes {
  const p = rec(value);
  return {
    // showPanelHeaders used to live on the theme.
    showPanelHeaders: bool(
      p.showPanelHeaders,
      bool(
        rec(legacyTheme).showPanelHeaders,
        DEFAULT_PREFERENCES.showPanelHeaders,
      ),
    ),
    showTabBarScrollBar: bool(
      p.showTabBarScrollBar,
      DEFAULT_PREFERENCES.showTabBarScrollBar,
    ),
    showPanelScrollBar: bool(
      p.showPanelScrollBar,
      DEFAULT_PREFERENCES.showPanelScrollBar,
    ),
  };
}

function normaliseAI(value: unknown): AISettings {
  const a = rec(value);
  return {
    provider: AI_PROVIDERS.includes(a.provider as AIProvider)
      ? (a.provider as AIProvider)
      : '',
    apiKey: str(a.apiKey, ''),
    model: str(a.model, ''),
    customBaseURL: str(a.customBaseURL, ''),
  };
}

// Turns anything that was once a Lumafold state (stored or exported, any
// past shape) into a valid AppState. Returns null only when the input is
// not an object with a `folders` array.
export function normalise(raw: unknown): AppState | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const d = raw as Rec;
  if (!Array.isArray(d.folders)) return null;

  const seenFolders = new Set<string>();
  const seenPanels = new Set<string>();
  const folders = d.folders.map((f) =>
    normaliseFolder(f, seenFolders, seenPanels),
  );

  return {
    ...withValidActiveFolder({
      folders,
      activeFolderId:
        typeof d.activeFolderId === 'string' ? d.activeFolderId : null,
    }),
    theme: normaliseTheme(d.theme),
    preferences: normalisePreferences(d.preferences, d.theme),
    ai: normaliseAI(d.ai),
  };
}

// ── Export / import ─────────────────────────────────────────────

// What goes into a backup file: everything except the AI key.
export function toExport(state: AppState): unknown {
  const { provider, model, customBaseURL } = state.ai;
  return { ...state, ai: { provider, model, customBaseURL } };
}

// The state after restoring `raw`, or null if it is not a Lumafold file.
// A file with no AI key (every export made by toExport) leaves this
// device's AI settings as they are; a file with one brings its own.
export function fromImport(raw: unknown, current: AppState): AppState | null {
  const next = normalise(raw);
  if (!next) return null;
  if (next.ai.apiKey || !current.ai.apiKey) return next;
  return { ...next, ai: current.ai };
}

// ── Storage adapters ────────────────────────────────────────────

export const STATE_KEY = 'appState';
export const UNREADABLE_KEY = 'appState_unreadable';

export interface StorageAdapter {
  // Resolves undefined when nothing is stored under the key.
  read(key: string): Promise<unknown>;
  write(key: string, value: unknown): Promise<void>;
}

export function chromeStorageAdapter(): StorageAdapter {
  return {
    read: (key) =>
      new Promise((resolve, reject) => {
        chrome.storage.local.get(key, (result: Rec) => {
          const error = chrome.runtime.lastError;
          if (error) reject(new Error(error.message));
          else resolve(result[key]);
        });
      }),
    write: (key, value) =>
      new Promise((resolve, reject) => {
        chrome.storage.local.set({ [key]: value }, () => {
          const error = chrome.runtime.lastError;
          if (error) reject(new Error(error.message));
          else resolve();
        });
      }),
  };
}

// Used when running outside the extension (plain `vite dev`). The item
// names predate the rename to Lumafold and are kept so data stays put.
export function localStorageAdapter(): StorageAdapter {
  const itemName = (key: string) =>
    key === STATE_KEY ? 'ultrafold_state' : `ultrafold_${key}`;
  return {
    read: async (key) => {
      const text = localStorage.getItem(itemName(key));
      if (text === null) return undefined;
      try {
        return JSON.parse(text);
      } catch {
        return text; // not JSON: hand back the raw text so load can keep it
      }
    },
    write: async (key, value) => {
      localStorage.setItem(itemName(key), JSON.stringify(value));
    },
  };
}

export function memoryAdapter(
  initial: Record<string, unknown> = {},
): StorageAdapter & { data: Map<string, unknown>; writes: number } {
  const data = new Map(Object.entries(initial));
  const adapter = {
    data,
    writes: 0,
    read: async (key: string) => data.get(key),
    write: async (key: string, value: unknown) => {
      adapter.writes += 1;
      data.set(key, structuredClone(value));
    },
  };
  return adapter;
}

export function browserStorage(): StorageAdapter {
  return typeof chrome !== 'undefined' && !!chrome.storage
    ? chromeStorageAdapter()
    : localStorageAdapter();
}

// ── Load ────────────────────────────────────────────────────────

// Never rejects. Stored data that cannot be understood is copied to
// UNREADABLE_KEY before the defaults take its place, so the next save
// does not destroy the only copy.
export async function load(adapter: StorageAdapter): Promise<AppState> {
  let raw: unknown;
  try {
    raw = await adapter.read(STATE_KEY);
  } catch (error) {
    console.error('Lumafold: could not read saved state', error);
    return defaultState();
  }
  if (raw === undefined || raw === null) return defaultState();

  const state = normalise(raw);
  if (state) return state;

  try {
    await adapter.write(UNREADABLE_KEY, raw);
  } catch (error) {
    console.error('Lumafold: could not back up unreadable state', error);
  }
  return defaultState();
}

// ── Save ────────────────────────────────────────────────────────

export interface Saver {
  // Saves `state` after a quiet period; a later call replaces an earlier one.
  schedule(state: AppState): void;
  // Saves anything still waiting, right now. Safe to call at any time.
  flush(): Promise<void>;
}

export function createSaver(adapter: StorageAdapter, delayMs = 400): Saver {
  let pending: AppState | null = null;
  let timer: ReturnType<typeof setTimeout> | null = null;

  const flush = async () => {
    if (timer !== null) clearTimeout(timer);
    timer = null;
    if (!pending) return;
    const state = pending;
    pending = null;
    try {
      await adapter.write(STATE_KEY, state);
    } catch (error) {
      console.error('Lumafold: could not save state', error);
    }
  };

  return {
    schedule(state) {
      pending = state;
      if (timer !== null) clearTimeout(timer);
      timer = setTimeout(flush, delayMs);
    },
    flush,
  };
}
