/// <reference types="chrome" />

import {
  STORAGE_KEY_DISPLAY_MODE,
  getDisplayMode,
  getFloatingBounds,
  getSessionWindowId,
  sanitizeBounds,
  setFloatingBounds,
  setSessionWindowId,
} from './lib/floating-window';

// ── Open fullscreen tab via keyboard shortcut ───────────────────
chrome.commands.onCommand.addListener((command) => {
  if (command === 'open-fullscreen') {
    chrome.tabs.create({ url: chrome.runtime.getURL('index.html') });
  }
});

// ── Display Mode & Action Popup Synchronization ─────────────────
export async function applyDisplayMode(mode: 'popup' | 'floating') {
  if (mode === 'floating') {
    await chrome.action.setPopup({ popup: '' });
  } else {
    await chrome.action.setPopup({ popup: 'index.html' });
  }
}

async function syncDisplayMode() {
  const mode = await getDisplayMode();
  await applyDisplayMode(mode);
}

chrome.runtime.onInstalled.addListener(() => {
  syncDisplayMode().catch(console.error);
});

chrome.runtime.onStartup.addListener(() => {
  syncDisplayMode().catch(console.error);
});

// Top-level sync in case service worker wakes up
syncDisplayMode().catch(console.error);

// Sync whenever displayMode changes in chrome.storage.local
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local' && changes[STORAGE_KEY_DISPLAY_MODE]) {
    const newMode =
      changes[STORAGE_KEY_DISPLAY_MODE].newValue === 'floating'
        ? 'floating'
        : 'popup';
    applyDisplayMode(newMode).catch(console.error);
  }
});

// ── Floating Window Management ──────────────────────────────────
export async function openOrFocusFloatingWindow(): Promise<number | undefined> {
  const existingWindowId = await getSessionWindowId();

  if (existingWindowId !== null) {
    try {
      const win = await chrome.windows.get(existingWindowId);
      if (win && win.id != null) {
        const updateInfo: chrome.windows.UpdateInfo = { focused: true };
        if (win.state === 'minimized') {
          updateInfo.state = 'normal';
        }
        await chrome.windows.update(win.id, updateInfo);
        return win.id;
      }
    } catch {
      // Window no longer exists
      await setSessionWindowId(null);
    }
  }

  // Retrieve saved bounds and existing windows for validation
  const savedBounds = await getFloatingBounds();
  let existingWindows: chrome.windows.Window[] = [];
  try {
    existingWindows = await chrome.windows.getAll();
  } catch {
    // ignore
  }

  const validBounds = sanitizeBounds(savedBounds, existingWindows);

  const createData: chrome.windows.CreateData = {
    url: chrome.runtime.getURL('index.html?mode=floating'),
    type: 'popup',
    focused: true,
    width: validBounds.width,
    height: validBounds.height,
  };

  if (validBounds.left !== undefined && validBounds.top !== undefined) {
    createData.left = validBounds.left;
    createData.top = validBounds.top;
  }

  try {
    const newWin = await chrome.windows.create(createData);
    if (newWin && newWin.id != null) {
      await setSessionWindowId(newWin.id);
      return newWin.id;
    }
  } catch (err) {
    console.warn(
      'Failed to create window with bounds, falling back to primary display:',
      err,
    );
    if (createData.left !== undefined || createData.top !== undefined) {
      delete createData.left;
      delete createData.top;
      const fallbackWin = await chrome.windows.create(createData);
      if (fallbackWin && fallbackWin.id != null) {
        await setSessionWindowId(fallbackWin.id);
        return fallbackWin.id;
      }
    } else {
      throw err;
    }
  }

  return undefined;
}

// ── Action Click Listener (Fires in floating mode when popup is "") ──
chrome.action.onClicked.addListener(async () => {
  try {
    await openOrFocusFloatingWindow();
  } catch (err) {
    console.error('Error opening floating window:', err);
  }
});

// ── Message Listener for programmatic opening (e.g. from Settings) ──
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === 'OPEN_FLOATING_WINDOW') {
    openOrFocusFloatingWindow()
      .then((windowId) => {
        sendResponse({ success: true, windowId });
      })
      .catch((err) => {
        sendResponse({ success: false, error: String(err) });
      });
    return true; // Keep message channel open for async response
  }
});

// ── Clear Window ID when Floating Window is closed ──────────────
chrome.windows.onRemoved.addListener(async (closedWindowId) => {
  const currentWindowId = await getSessionWindowId();
  if (currentWindowId === closedWindowId) {
    await setSessionWindowId(null);
  }
});

// ── Track Window Size & Position when modified ──────────────────
chrome.windows.onBoundsChanged.addListener(async (win) => {
  const currentWindowId = await getSessionWindowId();
  if (
    win.id === currentWindowId &&
    win.state === 'normal' &&
    typeof win.width === 'number' &&
    typeof win.height === 'number'
  ) {
    await setFloatingBounds({
      width: win.width,
      height: win.height,
      left: win.left,
      top: win.top,
    });
  }
});
