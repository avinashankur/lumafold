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

export type ScreenArea = WindowArea;

/**
 * Retrieves bounds for all connected and enabled displays.
 */
export async function getConnectedDisplays(): Promise<WindowArea[]> {
  if (typeof chrome !== 'undefined' && chrome.system?.display?.getInfo) {
    try {
      const displays = await chrome.system.display.getInfo();
      return displays
        .filter((d) => d && d.bounds && d.isEnabled !== false)
        .map((d) => ({
          left: d.bounds.left,
          top: d.bounds.top,
          width: d.bounds.width,
          height: d.bounds.height,
        }));
    } catch {
      return [];
    }
  }
  return [];
}

/**
 * Validates and sanitizes window bounds against connected screens.
 * If left or top are off-screen (e.g. unplugged monitor) or invalid,
 * they are omitted so Chrome places the window on the primary display.
 */
export function sanitizeBounds(
  bounds?: Partial<WindowBounds> | null,
  screens?: WindowArea[],
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

  // Validate coordinates against connected screens if available
  if (screens && screens.length > 0) {
    const validScreens = screens.filter(
      (s): s is { left: number; top: number; width: number; height: number } =>
        typeof s.left === 'number' &&
        Number.isFinite(s.left) &&
        typeof s.top === 'number' &&
        Number.isFinite(s.top) &&
        typeof s.width === 'number' &&
        Number.isFinite(s.width) &&
        s.width > 0 &&
        typeof s.height === 'number' &&
        Number.isFinite(s.height) &&
        s.height > 0,
    );

    if (validScreens.length > 0) {
      const margin = 100;
      const isOnScreen = validScreens.some((s) => {
        const isHorizontallyOnScreen =
          roundedLeft + width >= s.left - margin &&
          roundedLeft <= s.left + s.width + margin;
        const isVerticallyOnScreen =
          roundedTop + height >= s.top - margin &&
          roundedTop <= s.top + s.height + margin;
        return isHorizontallyOnScreen && isVerticallyOnScreen;
      });

      if (!isOnScreen) {
        return { width, height };
      }
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

export async function getFloatingBounds(
  screens?: WindowArea[],
): Promise<WindowBounds> {
  if (typeof chrome !== 'undefined' && chrome.storage?.local) {
    try {
      const data = await chrome.storage.local.get(STORAGE_KEY_BOUNDS);
      const saved = data[STORAGE_KEY_BOUNDS];
      if (saved && typeof saved === 'object') {
        const availableScreens = screens ?? (await getConnectedDisplays());
        return sanitizeBounds(
          saved as Partial<WindowBounds>,
          availableScreens.length > 0 ? availableScreens : undefined,
        );
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
