/// <reference types="chrome" />

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  FolderOpen,
  LayoutGrid,
  Maximize2,
  Settings as SettingsIcon,
} from 'lucide-react';
import { useStorage } from '@/hooks/useStorage';
import TabBar from '@/components/TabBar';
import Panel from '@/components/Panel';
import Settings from '@/components/Settings';
import PanelsModal from '@/components/PanelsModal';
import FoldersModal from '@/components/FoldersModal';
import { useTheme } from '@/components/theme-provider';
import { LumafoldThemeVars } from '@/providers/lumafold-theme-vars';

export default function LumafoldApp() {
  const store = useStorage();
  const { theme: colorTheme, setTheme: setColorTheme } = useTheme();
  const [showSettings, setShowSettings] = useState(false);
  const [showPanelsModal, setShowPanelsModal] = useState(false);
  const [showFoldersModal, setShowFoldersModal] = useState(false);
  const dragPanelFrom = useRef<number | null>(null);
  const [dragOverPanel, setDragOverPanel] = useState<number | null>(null);

  // Column resizing state
  const resizeState = useRef<{
    idx: number;
    startX: number;
    startWidths: number[];
    containerWidth: number;
  } | null>(null);
  const workspaceRef = useRef<HTMLDivElement>(null);

  const { state, loaded } = store;

  useEffect(() => {
    if (!state) return;
    const handler = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey;
      if (ctrl && e.key === 't') {
        e.preventDefault();
        store.addFolder();
      }
      if (ctrl && e.key === ',') {
        e.preventDefault();
        setShowSettings((s) => !s);
      }
      if (ctrl && e.shiftKey && e.key === 'L') {
        e.preventDefault();
        setColorTheme(colorTheme === 'dark' ? 'light' : 'dark');
      }
      if (ctrl && e.shiftKey && e.key === ']') {
        e.preventDefault();
        if (state.activeFolderId) store.addPanel(state.activeFolderId);
      }
      if (ctrl && !e.shiftKey && /^[1-9]$/.test(e.key)) {
        const idx = parseInt(e.key) - 1;
        const visible = state.folders.filter((f) => !f.hidden);
        const folder = visible[idx];
        if (folder) {
          e.preventDefault();
          store.setActiveFolder(folder.id);
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [colorTheme, setColorTheme, state, store]);

  // Column divider resize handlers
  const onDividerMouseDown = useCallback(
    (idx: number, e: React.MouseEvent) => {
      if (!workspaceRef.current || !state?.activeFolderId) return;
      const folder = state.folders.find((f) => f.id === state.activeFolderId);
      if (!folder) return;

      const visiblePanels = folder.panels.filter((p) => !p.hidden);
      const defaultWidths = Array(visiblePanels.length).fill(
        100 / visiblePanels.length,
      );
      const currentWidths =
        folder.panelWidths && folder.panelWidths.length === visiblePanels.length
          ? [...folder.panelWidths]
          : defaultWidths;

      resizeState.current = {
        idx,
        startX: e.clientX,
        startWidths: currentWidths,
        containerWidth: workspaceRef.current.clientWidth,
      };

      const onMouseMove = (moveEvent: MouseEvent) => {
        if (!resizeState.current || !state.activeFolderId) return;
        const {
          idx: dividerIdx,
          startX,
          startWidths,
          containerWidth,
        } = resizeState.current;
        const deltaPx = moveEvent.clientX - startX;
        const deltaPercent = (deltaPx / containerWidth) * 100;

        const nextWidths = [...startWidths];
        const minPercent = 15;

        const leftWidth = startWidths[dividerIdx] + deltaPercent;
        const rightWidth = startWidths[dividerIdx + 1] - deltaPercent;

        if (leftWidth >= minPercent && rightWidth >= minPercent) {
          nextWidths[dividerIdx] = leftWidth;
          nextWidths[dividerIdx + 1] = rightWidth;
          store.updateFolderWidths(state.activeFolderId, nextWidths);
        }
      };

      const onMouseUp = () => {
        resizeState.current = null;
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
      };

      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    },
    [state, store],
  );

  if (!loaded || !state) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[var(--surface-0)]">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
      </div>
    );
  }

  const activeFolder = state.folders.find((f) => f.id === state.activeFolderId);
  const visiblePanels = activeFolder
    ? activeFolder.panels.filter((p) => !p.hidden)
    : [];
  const isFullscreen =
    document.documentElement.getAttribute('data-mode') === 'tab';

  const resetEqualWidths = () => {
    if (!activeFolder) return;
    const equal = Array(visiblePanels.length).fill(
      Math.floor(100 / visiblePanels.length),
    );
    store.updateFolderWidths(activeFolder.id, equal);
  };

  return (
    <>
      <LumafoldThemeVars
        fontSize={state.theme.fontSize ?? 13}
        accentColor={state.theme.accentColor ?? 'amber'}
      />
      <div className="flex h-full w-full flex-col overflow-hidden bg-[var(--surface-0)] font-sans text-[var(--text-primary)]">
        {/* ── Unified Top Chrome ── */}
        <header className="flex h-[38px] shrink-0 items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--surface-0)] px-2.5">
          <div className="min-w-0 flex-1 overflow-hidden">
            <TabBar
              folders={state.folders}
              activeFolderId={state.activeFolderId}
              onSelect={store.setActiveFolder}
              onAdd={store.addFolder}
              onDelete={store.deleteFolder}
              onRename={store.renameFolder}
              onHide={store.hideFolderById}
              onReorder={store.reorderFolders}
              showScrollBar={state.preferences.showTabBarScrollBar}
            />
          </div>

          <div className="ml-2 flex shrink-0 items-center gap-1">
            {activeFolder && (
              <button
                onClick={() => store.addPanel(activeFolder.id)}
                className="flex h-6 w-6 items-center justify-center rounded-md text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
                title="Add panel (Ctrl+Shift+])"
              >
                <LayoutGrid size={13} />
              </button>
            )}

            <button
              onClick={() => setShowFoldersModal(true)}
              className="flex h-6 w-6 items-center justify-center rounded-md text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
              title="Manage folders"
            >
              <FolderOpen size={13} />
            </button>

            {!isFullscreen && (
              <button
                onClick={() => {
                  if (typeof chrome !== 'undefined' && chrome.tabs) {
                    chrome.tabs.create({
                      url: chrome.runtime.getURL('index.html'),
                    });
                  } else {
                    const w = window.open(window.location.href, '_blank', '');
                    if (w) w.resizeTo(screen.availWidth, screen.availHeight);
                  }
                }}
                className="flex h-6 w-6 items-center justify-center rounded-md text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
                title="Open fullscreen tab"
              >
                <Maximize2 size={13} />
              </button>
            )}

            <button
              onClick={() => setShowSettings(true)}
              className="flex h-6 w-6 items-center justify-center rounded-md text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
              title="Settings (Ctrl+,)"
            >
              <SettingsIcon size={13} />
            </button>
          </div>
        </header>

        {/* ── Main Multi-Column Workspace ── */}
        <main
          ref={workspaceRef}
          className="relative flex min-h-0 min-w-0 flex-1 overflow-hidden bg-[var(--surface-1)]"
        >
          {!activeFolder ? (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-[var(--text-tertiary)] select-none">
              <p className="text-xs">No folder selected</p>
              <div className="flex items-center gap-1.5 text-xs">
                <span>Press</span>
                <kbd className="rounded border border-[var(--border-subtle)] bg-[var(--surface-2)] px-1.5 py-0.5 font-mono text-[11px] text-[var(--text-secondary)]">
                  Ctrl+T
                </kbd>
                <span>or</span>
                <button
                  onClick={store.addFolder}
                  className="font-medium text-[var(--text-primary)] hover:underline"
                >
                  Create Folder
                </button>
              </div>
            </div>
          ) : activeFolder.panels.length === 0 || visiblePanels.length === 0 ? (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-[var(--text-tertiary)] select-none">
              <p className="text-xs">
                {activeFolder.panels.length === 0
                  ? 'No panels in this folder'
                  : 'All panels in this folder are hidden'}
              </p>
              <div className="flex items-center gap-1.5 text-xs">
                {activeFolder.panels.length === 0 ? (
                  <>
                    <span>Press</span>
                    <kbd className="rounded border border-[var(--border-subtle)] bg-[var(--surface-2)] px-1.5 py-0.5 font-mono text-[11px] text-[var(--text-secondary)]">
                      Ctrl+Shift+]
                    </kbd>
                    <span>or</span>
                    <button
                      onClick={() => store.addPanel(activeFolder.id)}
                      className="font-medium text-[var(--text-primary)] hover:underline"
                    >
                      Add Panel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setShowPanelsModal(true)}
                    className="font-medium text-[var(--text-primary)] hover:underline"
                  >
                    Manage Panels
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex h-full w-full min-w-0 flex-1 overflow-hidden">
              {visiblePanels.map((panel, idx) => {
                const realIdx = activeFolder.panels.indexOf(panel);
                const widthStyle = activeFolder.panelWidths?.[idx]
                  ? { flex: `${activeFolder.panelWidths[idx]} 1 0%` }
                  : { flex: '1 1 0%' };

                return (
                  <React.Fragment key={panel.id}>
                    {idx > 0 && (
                      <div
                        className="group/divider relative z-10 w-px shrink-0 cursor-col-resize bg-[var(--border-subtle)] transition-colors select-none before:absolute before:inset-y-0 before:-right-1.5 before:-left-1.5 hover:bg-[var(--accent)]"
                        title="Drag to resize / Double-click to equalize"
                        onMouseDown={(e) => onDividerMouseDown(idx - 1, e)}
                        onDoubleClick={resetEqualWidths}
                      />
                    )}
                    <div
                      style={widthStyle}
                      className="h-full min-w-[160px] overflow-hidden"
                    >
                      <Panel
                        panel={panel}
                        aiSettings={state.ai}
                        onHide={() =>
                          store.hidePanelById(activeFolder.id, panel.id)
                        }
                        onDelete={() =>
                          store.deletePanel(activeFolder.id, panel.id)
                        }
                        onRename={(title) =>
                          store.renamePanel(activeFolder.id, panel.id, title)
                        }
                        onContentChange={(content) =>
                          store.updatePanelContent(
                            activeFolder.id,
                            panel.id,
                            content,
                          )
                        }
                        onAIAccept={(content) =>
                          store.updatePanelContent(
                            activeFolder.id,
                            panel.id,
                            content,
                          )
                        }
                        onDragStart={() => {
                          dragPanelFrom.current = realIdx;
                        }}
                        onDragOver={(e) => {
                          e.preventDefault();
                          setDragOverPanel(idx);
                        }}
                        onDrop={() => {
                          if (
                            dragPanelFrom.current !== null &&
                            dragPanelFrom.current !== realIdx
                          ) {
                            store.reorderPanels(
                              activeFolder.id,
                              dragPanelFrom.current,
                              realIdx,
                            );
                          }
                          dragPanelFrom.current = null;
                          setDragOverPanel(null);
                        }}
                        isDragOver={dragOverPanel === idx}
                        showHeader={state.preferences.showPanelHeaders}
                        showPanelScrollBar={
                          state.preferences.showPanelScrollBar
                        }
                      />
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          )}
        </main>

        {/* ── Quiet Status Bar ── */}
        <footer className="flex h-6 shrink-0 items-center justify-between border-t border-[var(--border-subtle)] bg-[var(--surface-0)] px-3 text-[11px] text-[var(--text-tertiary)] select-none">
          <span>
            {activeFolder ? `Folder: ${activeFolder.name}` : 'Lumafold'}
          </span>
          <span>
            {visiblePanels.length}{' '}
            {visiblePanels.length === 1 ? 'Column' : 'Columns'} · Auto-saved
          </span>
        </footer>

        {/* ── Modals ── */}
        {showFoldersModal && (
          <FoldersModal
            folders={state.folders}
            onAddFolder={store.addFolder}
            onHideFolder={store.hideFolderById}
            onUnhideFolder={store.unhideFolderById}
            onDeleteFolder={store.deleteFolder}
            onClose={() => setShowFoldersModal(false)}
          />
        )}
        {showPanelsModal && activeFolder && (
          <PanelsModal
            canAddPanel={activeFolder.panels.length < 3}
            canUnhide={visiblePanels.length < 3}
            onAddPanel={() => store.addPanel(activeFolder.id)}
            panels={activeFolder.panels}
            onHidePanel={(panelId) =>
              store.hidePanelById(activeFolder.id, panelId)
            }
            onUnhidePanel={(panelId) =>
              store.unhidePanelById(activeFolder.id, panelId)
            }
            onDeletePanel={(panelId) =>
              store.deletePanel(activeFolder.id, panelId)
            }
            onClose={() => setShowPanelsModal(false)}
          />
        )}

        {showSettings && (
          <Settings
            theme={state.theme}
            onThemeChange={store.setTheme}
            preferences={state.preferences}
            onPreferencesChange={store.setPreferences}
            aiSettings={state.ai}
            onAISettingsChange={store.setAISettings}
            onClose={() => setShowSettings(false)}
            state={state}
            onImportState={store.importState}
          />
        )}
      </div>
    </>
  );
}
