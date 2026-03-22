// src/hooks/useStorage.ts
import { useState, useEffect, useCallback } from "react";
import { AppState, Folder, Panel, ThemeSettings } from "../types";

const isExtension = typeof chrome !== "undefined" && !!chrome.storage;

function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}

function makePanel(title = "Notes"): Panel {
  return { id: generateId(), title, content: "", hidden: false };
}

function makeFolder(name = "Folder"): Folder {
  return {
    id: generateId(),
    name,
    hidden: false,
    panels: [makePanel("Notes"), makePanel("Tasks")],
    panelWidths: [50, 50],
  };
}

const DEFAULT_STATE: AppState = {
  folders: [makeFolder("Personal"), makeFolder("Work")],
  activeFolderId: null,
  theme: {
    mode:
      window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light",
    accent: "#6366f1",
    fontSize: 13,
  },
};

async function loadState(): Promise<AppState> {
  if (isExtension) {
    return new Promise((resolve) => {
      chrome.storage.local.get("appState", (result: { appState?: AppState }) => {
        if (result.appState) resolve(result.appState);
        else resolve(DEFAULT_STATE);
      });
    });
  } else {
    const raw = localStorage.getItem("ultrafold_state");
    return raw ? JSON.parse(raw) : DEFAULT_STATE;
  }
}

async function saveState(state: AppState): Promise<void> {
  if (isExtension) {
    return new Promise((resolve) => {
      chrome.storage.local.set({ appState: state }, resolve);
    });
  } else {
    localStorage.setItem("ultrafold_state", JSON.stringify(state));
  }
}

export function useStorage() {
  const [state, setState] = useState<AppState | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadState().then((s) => {
      // Migrate: add hidden:false only for panels missing the property (legacy data)
      s.folders = s.folders.map((f) => ({
        ...f,
        panels: f.panels.map((p) => ({ ...p, hidden: p.hidden ?? false })),
      }));
      // Ensure activeFolderId points to a visible folder
      const visibleFolders = s.folders.filter((f) => !f.hidden);
      if (!s.activeFolderId || !visibleFolders.find((f) => f.id === s.activeFolderId)) {
        s.activeFolderId = visibleFolders[0]?.id ?? null;
      }
      // Migrate: add fontSize for legacy theme
      if (s.theme && typeof s.theme.fontSize !== "number") {
        s.theme = { ...s.theme, fontSize: 13 };
      }
      setState(s);
      setLoaded(true);
    });
  }, []);

  // Debounced save
  useEffect(() => {
    if (!state) return;
    const t = setTimeout(() => saveState(state), 400);
    return () => clearTimeout(t);
  }, [state]);

  const update = useCallback((updater: (prev: AppState) => AppState) => {
    setState((prev) => (prev ? updater(prev) : prev));
  }, []);

  // ── Folder actions ──────────────────────────────────────────────
  const addFolder = useCallback(() => {
    const folder = makeFolder("New Folder");
    update((s) => ({
      ...s,
      folders: [...s.folders, folder],
      activeFolderId: folder.id,
    }));
  }, [update]);

  const deleteFolder = useCallback(
    (id: string) => {
      update((s) => {
        const folders = s.folders.filter((f) => f.id !== id);
        const visibleFolders = folders.filter((f) => !f.hidden);
        const activeFolderId =
          s.activeFolderId === id
            ? (visibleFolders[0]?.id ?? null)
            : s.activeFolderId;
        return { ...s, folders, activeFolderId };
      });
    },
    [update]
  );

  const renameFolder = useCallback(
    (id: string, name: string) => {
      update((s) => ({
        ...s,
        folders: s.folders.map((f) => (f.id === id ? { ...f, name } : f)),
      }));
    },
    [update]
  );

  // Hide folder: removes from tab bar, switches to next visible folder
  const hideFolderById = useCallback(
    (id: string) => {
      update((s) => {
        const folders = s.folders.map((f) =>
          f.id === id ? { ...f, hidden: true } : f
        );
        const visibleFolders = folders.filter((f) => !f.hidden);
        const activeFolderId =
          s.activeFolderId === id
            ? (visibleFolders[0]?.id ?? null)
            : s.activeFolderId;
        return { ...s, folders, activeFolderId };
      });
    },
    [update]
  );

  // Unhide folder (called from hidden folders panel)
  const unhideFolderById = useCallback(
    (id: string) => {
      update((s) => ({
        ...s,
        folders: s.folders.map((f) => (f.id === id ? { ...f, hidden: false } : f)),
        activeFolderId: id,
      }));
    },
    [update]
  );

  const setActiveFolder = useCallback(
    (id: string) => {
      update((s) => ({ ...s, activeFolderId: id }));
    },
    [update]
  );

  const reorderFolders = useCallback(
    (from: number, to: number) => {
      update((s) => {
        const folders = [...s.folders];
        const [moved] = folders.splice(from, 1);
        folders.splice(to, 0, moved);
        return { ...s, folders };
      });
    },
    [update]
  );

  // ── Panel actions ───────────────────────────────────────────────
  const addPanel = useCallback(
    (folderId: string) => {
      update((s) => ({
        ...s,
        folders: s.folders.map((f) => {
          if (f.id !== folderId) return f;
          // Count visible panels — max 3 visible
          const visibleCount = f.panels.filter((p) => !p.hidden).length;
          if (visibleCount >= 3) return f;
          const panels = [...f.panels, makePanel("New Panel")];
          return { ...f, panels };
        }),
      }));
    },
    [update]
  );

  // Hide panel instead of deleting — data preserved
  const hidePanelById = useCallback(
    (folderId: string, panelId: string) => {
      update((s) => ({
        ...s,
        folders: s.folders.map((f) => {
          if (f.id !== folderId) return f;
          return {
            ...f,
            panels: f.panels.map((p) =>
              p.id === panelId ? { ...p, hidden: true } : p
            ),
          };
        }),
      }));
    },
    [update]
  );

  // Unhide panel
  const unhidePanelById = useCallback(
    (folderId: string, panelId: string) => {
      update((s) => ({
        ...s,
        folders: s.folders.map((f) => {
          if (f.id !== folderId) return f;
          const visibleCount = f.panels.filter(
            (p) => !p.hidden || p.id === panelId
          ).length;
          // Don't exceed 3 visible — caller should show modal if blocked
          if (
            f.panels.filter((p) => !p.hidden).length >= 3 &&
            f.panels.find((p) => p.id === panelId)?.hidden
          ) {
            return f;
          }
          return {
            ...f,
            panels: f.panels.map((p) =>
              p.id === panelId ? { ...p, hidden: false } : p
            ),
          };
        }),
      }));
    },
    [update]
  );

  const renamePanel = useCallback(
    (folderId: string, panelId: string, title: string) => {
      update((s) => ({
        ...s,
        folders: s.folders.map((f) =>
          f.id !== folderId
            ? f
            : {
                ...f,
                panels: f.panels.map((p) =>
                  p.id === panelId ? { ...p, title } : p
                ),
              }
        ),
      }));
    },
    [update]
  );

  const updatePanelContent = useCallback(
    (folderId: string, panelId: string, content: string) => {
      update((s) => ({
        ...s,
        folders: s.folders.map((f) =>
          f.id !== folderId
            ? f
            : {
                ...f,
                panels: f.panels.map((p) =>
                  p.id === panelId ? { ...p, content } : p
                ),
              }
        ),
      }));
    },
    [update]
  );

  const reorderPanels = useCallback(
    (folderId: string, from: number, to: number) => {
      update((s) => ({
        ...s,
        folders: s.folders.map((f) => {
          if (f.id !== folderId) return f;
          const panels = [...f.panels];
          const [moved] = panels.splice(from, 1);
          panels.splice(to, 0, moved);
          return { ...f, panels };
        }),
      }));
    },
    [update]
  );

  // ── Theme actions ───────────────────────────────────────────────
  const setTheme = useCallback(
    (theme: Partial<ThemeSettings>) => {
      update((s) => ({ ...s, theme: { ...s.theme, ...theme } }));
    },
    [update]
  );

  // Import: replace state with imported data (validated, migrated)
  const importState = useCallback((data: unknown) => {
    if (!data || typeof data !== "object") return false;
    const d = data as Record<string, unknown>;
    if (!Array.isArray(d.folders)) return false;
    const s: AppState = {
      folders: d.folders.map((f: unknown) => {
        const fd = (f as Record<string, unknown>) ?? {};
        const panels = (Array.isArray(fd.panels) ? fd.panels : []).map((p: unknown) => {
          const pp = (p as Record<string, unknown>) ?? {};
          return {
            id: String(pp.id ?? generateId()),
            title: String(pp.title ?? "Notes"),
            content: String(pp.content ?? ""),
            hidden: Boolean(pp.hidden ?? false),
          };
        });
        return {
          id: String(fd.id ?? generateId()),
          name: String(fd.name ?? "Folder"),
          hidden: Boolean(fd.hidden ?? false),
          panels,
          panelWidths: (Array.isArray(fd.panelWidths) ? fd.panelWidths : [50, 50]) as number[],
        };
      }) as Folder[],
      activeFolderId: typeof d.activeFolderId === "string" ? d.activeFolderId : null,
      theme: {
        mode: d.theme && typeof d.theme === "object" && (d.theme as Record<string, unknown>).mode === "light" ? "light" : "dark",
        accent: String((d.theme as Record<string, unknown>)?.accent ?? "#6366f1"),
        fontSize: Number((d.theme as Record<string, unknown>)?.fontSize) || 13,
      },
    };
    const visibleFolders = s.folders.filter((f) => !f.hidden);
    if (!s.activeFolderId || !visibleFolders.find((f) => f.id === s.activeFolderId)) {
      s.activeFolderId = visibleFolders[0]?.id ?? null;
    }
    setState(s);
    return true;
  }, []);

  return {
    state,
    loaded,
    addFolder,
    deleteFolder,
    renameFolder,
    hideFolderById,
    unhideFolderById,
    setActiveFolder,
    reorderFolders,
    addPanel,
    hidePanelById,
    unhidePanelById,
    renamePanel,
    updatePanelContent,
    reorderPanels,
    setTheme,
    importState,
  };
}
