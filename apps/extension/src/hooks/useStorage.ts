import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  AISettings,
  AppState,
  PreferencesSettingTypes,
  ThemeSettings,
  Workspace,
} from '../types';
import * as workspace from '../lib/workspace';
import {
  browserStorage,
  createSaver,
  fromImport,
  load,
} from '../lib/persistence';

export function useStorage() {
  const [state, setState] = useState<AppState | null>(null);
  const [loaded, setLoaded] = useState(false);
  const saver = useMemo(() => createSaver(browserStorage()), []);

  // What loading, normalising and saving mean lives in lib/persistence.
  useEffect(() => {
    let cancelled = false;
    load(browserStorage()).then((s) => {
      if (cancelled) return;
      setState(s);
      setLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (state) saver.schedule(state);
  }, [state, saver]);

  // Don't lose the last edit when the popup or tab goes away.
  useEffect(() => {
    const flush = () => void saver.flush();
    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') flush();
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('pagehide', flush);
    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('pagehide', flush);
      flush();
    };
  }, [saver]);

  // For callbacks that need the latest state without re-subscribing.
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const update = useCallback((updater: (prev: AppState) => AppState) => {
    setState((prev) => (prev ? updater(prev) : prev));
  }, []);

  // Folder and Panel rules live in lib/workspace; this only applies them.
  const apply = useCallback(
    (change: (current: Workspace) => Workspace) => {
      update((s) => {
        const next = change(s);
        return next === s ? s : { ...s, ...next };
      });
    },
    [update],
  );

  // ── Folder actions ──────────────────────────────────────────────
  const addFolder = useCallback(() => apply(workspace.addFolder), [apply]);

  const deleteFolder = useCallback(
    (id: string) => apply((w) => workspace.deleteFolder(w, id)),
    [apply],
  );

  const renameFolder = useCallback(
    (id: string, name: string) =>
      apply((w) => workspace.renameFolder(w, id, name)),
    [apply],
  );

  const hideFolderById = useCallback(
    (id: string) => apply((w) => workspace.hideFolder(w, id)),
    [apply],
  );

  const unhideFolderById = useCallback(
    (id: string) => apply((w) => workspace.showFolder(w, id)),
    [apply],
  );

  const setActiveFolder = useCallback(
    (id: string) => apply((w) => workspace.setActiveFolder(w, id)),
    [apply],
  );

  const reorderFolders = useCallback(
    (id: string, targetId: string) =>
      apply((w) => workspace.moveFolder(w, id, targetId)),
    [apply],
  );

  // ── Panel actions ───────────────────────────────────────────────
  const addPanel = useCallback(
    (folderId: string) => apply((w) => workspace.addPanel(w, folderId)),
    [apply],
  );

  const hidePanelById = useCallback(
    (folderId: string, panelId: string) =>
      apply((w) => workspace.hidePanel(w, folderId, panelId)),
    [apply],
  );

  const unhidePanelById = useCallback(
    (folderId: string, panelId: string) =>
      apply((w) => workspace.showPanel(w, folderId, panelId)),
    [apply],
  );

  const deletePanel = useCallback(
    (folderId: string, panelId: string) =>
      apply((w) => workspace.deletePanel(w, folderId, panelId)),
    [apply],
  );

  const renamePanel = useCallback(
    (folderId: string, panelId: string, title: string) =>
      apply((w) => workspace.renamePanel(w, folderId, panelId, title)),
    [apply],
  );

  const updatePanelContent = useCallback(
    (folderId: string, panelId: string, content: string) =>
      apply((w) => workspace.setPanelContent(w, folderId, panelId, content)),
    [apply],
  );

  const reorderPanels = useCallback(
    (folderId: string, panelId: string, targetPanelId: string) =>
      apply((w) => workspace.movePanel(w, folderId, panelId, targetPanelId)),
    [apply],
  );

  const resizePanels = useCallback(
    (
      folderId: string,
      dividerIndex: number,
      startWidths: number[],
      deltaPercent: number,
    ) =>
      apply((w) =>
        workspace.resizePanels(
          w,
          folderId,
          dividerIndex,
          startWidths,
          deltaPercent,
        ),
      ),
    [apply],
  );

  const equalizePanels = useCallback(
    (folderId: string) => apply((w) => workspace.equalizePanels(w, folderId)),
    [apply],
  );

  // ── Theme actions ───────────────────────────────────────────────
  const setTheme = useCallback(
    (theme: Partial<ThemeSettings>) => {
      update((s) => ({ ...s, theme: { ...s.theme, ...theme } }));
    },
    [update],
  );

  const setAISettings = useCallback(
    (ai: Partial<AISettings>) => {
      update((s) => ({
        ...s,
        ai: { ...s.ai, ...ai },
      }));
    },
    [update],
  );

  const setPreferences = useCallback(
    (preferences: Partial<PreferencesSettingTypes>) => {
      update((s) => ({
        ...s,
        preferences: { ...s.preferences, ...preferences },
      }));
    },
    [update],
  );

  // Import: replace state with a backup file's contents. False if the
  // file is not a Lumafold export.
  const importState = useCallback((data: unknown) => {
    const current = stateRef.current;
    if (!current) return false;
    const next = fromImport(data, current);
    if (!next) return false;
    setState(next);
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
    deletePanel,
    renamePanel,
    updatePanelContent,
    reorderPanels,
    resizePanels,
    equalizePanels,
    setTheme,
    setPreferences,
    setAISettings,
    importState,
  };
}
