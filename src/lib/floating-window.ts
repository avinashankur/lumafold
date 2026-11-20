export type DisplayMode = 'popup' | 'floating';

export interface WindowBounds {
  width: number;
  height: number;
  left?: number;
  top?: number;
}

export const DEFAULT_DISPLAY_MODE: DisplayMode = 'popup';
export const DEFAULT_FLOATING_BOUNDS: WindowBounds = {
  width: 380,
  height: 540,
};

export const MIN_FLOATING_WIDTH = 280;
export const MIN_FLOATING_HEIGHT = 300;

export const STORAGE_KEY_DISPLAY_MODE = 'displayMode';
export const STORAGE_KEY_BOUNDS = 'floatingBounds';
export const SESSION_KEY_WINDOW_ID = 'windowId';

export interface WindowArea {
  left?: number;
  top?: number;
  width?: number;
  height?: number;
}

/**
 * Validates and sanitizes window bounds.
 * If left or top are off-screen (e.g. unplugged monitor) or invalid,
 * they are omitted so Chrome places the window on the primary display.
 */
export function sanitizeBounds(
  bounds?: Partial<WindowBounds> | null,
  existingWindows?: WindowArea[],
): WindowBounds {
  const width =
    typeof bounds?.width === 'number' &&
    Number.isFinite(bounds.width) &&
    bounds.width >= MIN_FLOATING_WIDTH
      ? Math.round(bounds.width)
      : DEFAULT_FLOATING_BOUNDS.width;

  const height =
    typeof bounds?.height === 'number' &&
    Number.isFinite(bounds.height) &&
    bounds.height >= MIN_FLOATING_HEIGHT
      ? Math.round(bounds.height)
      : DEFAULT_FLOATING_BOUNDS.height;

  const left = bounds?.left;
  const top = bounds?.top;

  if (
    typeof left !== 'number' ||
    !Number.isFinite(left) ||
    typeof top !== 'number' ||
    !Number.isFinite(top)
  ) {
    return { width, height };
  }

  const roundedLeft = Math.round(left);
  const roundedTop = Math.round(top);

  // Validate coordinates against existing windows if available
  if (existingWindows && existingWindows.length > 0) {
    const validWindows = existingWindows.filter(
      (w): w is { left: number; top: number; width: number; height: number } =>
        typeof w.left === 'number' &&
        Number.isFinite(w.left) &&
        typeof w.top === 'number' &&
        Number.isFinite(w.top) &&
        typeof w.width === 'number' &&
        Number.isFinite(w.width) &&
        typeof w.height === 'number' &&
        Number.isFinite(w.height),
    );

    if (validWindows.length > 0) {
      // Find overall boundary of active displays spanned by open windows
      const minLeft = Math.min(...validWindows.map((w) => w.left));
      const maxRight = Math.max(...validWindows.map((w) => w.left + w.width));
      const minTop = Math.min(...validWindows.map((w) => w.top));
      const maxBottom = Math.max(...validWindows.map((w) => w.top + w.height));

      // Allow a reasonable margin for window chrome and position near screen edges
      const margin = 100;
      const isHorizontallyOnScreen =
        roundedLeft + width >= minLeft - margin &&
        roundedLeft <= maxRight + margin;
      const isVerticallyOnScreen =
        roundedTop + height >= minTop - margin &&
        roundedTop <= maxBottom + margin;

      if (!isHorizontallyOnScreen || !isVerticallyOnScreen) {
        return { width, height };
      }
    }
  } else {
    // Basic sanity checks when no window reference is available
    if (
      roundedLeft < -1000 ||
      roundedLeft > 10000 ||
      roundedTop < -500 ||
      roundedTop > 10000
    ) {
      return { width, height };
    }
  }

  return { width, height, left: roundedLeft, top: roundedTop };
}

export async function getDisplayMode(): Promise<DisplayMode> {
  if (typeof chrome !== 'undefined' && chrome.storage?.local) {
    try {
      const data = await chrome.storage.local.get(STORAGE_KEY_DISPLAY_MODE);
      return data[STORAGE_KEY_DISPLAY_MODE] === 'floating'
        ? 'floating'
        : 'popup';
    } catch {
      return DEFAULT_DISPLAY_MODE;
    }
  }
  return DEFAULT_DISPLAY_MODE;
}

export async function setDisplayMode(mode: DisplayMode): Promise<void> {
  if (typeof chrome !== 'undefined' && chrome.storage?.local) {
    await chrome.storage.local.set({ [STORAGE_KEY_DISPLAY_MODE]: mode });
  }
}

export async function getFloatingBounds(): Promise<WindowBounds> {
  if (typeof chrome !== 'undefined' && chrome.storage?.local) {
    try {
      const data = await chrome.storage.local.get(STORAGE_KEY_BOUNDS);
      const saved = data[STORAGE_KEY_BOUNDS];
      if (saved && typeof saved === 'object') {
        return sanitizeBounds(saved as Partial<WindowBounds>);
      }
    } catch {
      return DEFAULT_FLOATING_BOUNDS;
    }
  }
  return DEFAULT_FLOATING_BOUNDS;
}

export async function setFloatingBounds(bounds: WindowBounds): Promise<void> {
  if (typeof chrome !== 'undefined' && chrome.storage?.local) {
    await chrome.storage.local.set({ [STORAGE_KEY_BOUNDS]: bounds });
  }
}

export async function getSessionWindowId(): Promise<number | null> {
  if (typeof chrome !== 'undefined' && chrome.storage?.session) {
    try {
      const data = await chrome.storage.session.get(SESSION_KEY_WINDOW_ID);
      return typeof data[SESSION_KEY_WINDOW_ID] === 'number'
        ? data[SESSION_KEY_WINDOW_ID]
        : null;
    } catch {
      return null;
    }
  }
  return null;
}

export async function setSessionWindowId(
  windowId: number | null,
): Promise<void> {
  if (typeof chrome !== 'undefined' && chrome.storage?.session) {
    try {
      if (windowId === null) {
        await chrome.storage.session.remove(SESSION_KEY_WINDOW_ID);
      } else {
        await chrome.storage.session.set({
          [SESSION_KEY_WINDOW_ID]: windowId,
        });
      }
    } catch {
      // ignore
    }
  }
}
