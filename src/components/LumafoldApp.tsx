/// <reference types="chrome" />

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  FolderOpen,
  LayoutGrid,
  Maximize2,
  Plus,
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
import { cn } from '@/lib/utils';
import * as workspace from '@/lib/workspace';
import {
  type ShortcutMatch,
  matchShortcut,
  shortcutLabel,
} from '@/lib/shortcuts';

export default function LumafoldApp() {
  const store = useStorage();
  const { theme: colorTheme, setTheme: setColorTheme } = useTheme();
  const [showSettings, setShowSettings] = useState(false);
  const [showPanelsModal, setShowPanelsModal] = useState(false);
  const [showFoldersModal, setShowFoldersModal] = useState(false);
  const [resizingDividerIdx, setResizingDividerIdx] = useState<number | null>(
    null,
  );
  const dragPanelFrom = useRef<string | null>(null);
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
    return () => {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, []);

  // One listener for the app's shortcuts; which keys mean what is decided
  // by lib/shortcuts. The ref keeps it reading the latest state without
  // re-subscribing on every render.
  const onShortcut = useRef<(match: ShortcutMatch) => boolean>(() => false);
  useEffect(() => {
    onShortcut.current = (match) => {
      if (!state) return false;
      switch (match.id) {
        case 'newFolder':
          store.addFolder();
          return true;
        case 'settings':
          setShowSettings((s) => !s);
          return true;
        case 'toggleTheme':
          setColorTheme(colorTheme === 'dark' ? 'light' : 'dark');
          return true;
        case 'addPanel':
          if (state.activeFolderId) store.addPanel(state.activeFolderId);
          return true;
        case 'switchFolder': {
          const folder = workspace.visibleFolders(state)[match.index ?? -1];
          if (folder) store.setActiveFolder(folder.id);
          return !!folder;
        }
        default:
          return false; // aiMenu is handled by the focused panel
      }
    };
  });
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const match = matchShortcut(e);
      if (match && onShortcut.current(match)) e.preventDefault();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Column divider resize handlers
  const onDividerMouseDown = useCallback(
    (idx: number, e: React.MouseEvent) => {
      if (!workspaceRef.current || !state) return;
      const folder = workspace.activeFolder(state);
      if (!folder) return;
      const folderId = folder.id;

      resizeState.current = {
        idx,
        startX: e.clientX,
        startWidths: workspace.panelWidths(folder),
        containerWidth: workspaceRef.current.clientWidth,
      };
      setResizingDividerIdx(idx);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';

      const onMouseMove = (moveEvent: MouseEvent) => {
        if (!resizeState.current) return;
        const {
          idx: dividerIdx,
          startX,
          startWidths,
          containerWidth,
        } = resizeState.current;
        const deltaPercent =
          ((moveEvent.clientX - startX) / containerWidth) * 100;
        store.resizePanels(folderId, dividerIdx, startWidths, deltaPercent);
      };

      const onMouseUp = () => {
        resizeState.current = null;
        setResizingDividerIdx(null);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
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

  const activeFolder = workspace.activeFolder(state);
  const visiblePanels = activeFolder
    ? workspace.visiblePanels(activeFolder)
    : [];
  const panelWidths = activeFolder ? workspace.panelWidths(activeFolder) : [];
  const canShowAnotherPanel =
    !!activeFolder && workspace.canShowAnotherPanel(activeFolder);
  const isFullscreen =
    document.documentElement.getAttribute('data-mode') === 'tab';

  const resetEqualWidths = () => {
    if (activeFolder) store.equalizePanels(activeFolder.id);
  };

  return (
    <>
      <LumafoldThemeVars
        fontSize={state.theme.fontSize}
        accentColor={state.theme.accentColor}
      />
      <div className="flex h-full w-full flex-col overflow-hidden bg-[var(--workspace-bg)] font-sans text-[var(--text-primary)]">
        {/* ── Unified Top Chrome ── */}
        <header className="flex h-8 shrink-0 items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--header-bg)] px-2">
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
              <>
                <button
                  type="button"
                  onClick={() => setShowPanelsModal(true)}
                  className="flex h-6 w-6 items-center justify-center rounded-md text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
                  title="Panels (add, hide, unhide)"
                  aria-label="Manage panels"
                >
                  <LayoutGrid size={13} />
                </button>
                {canShowAnotherPanel && (
                  <button
                    type="button"
                    onClick={() => store.addPanel(activeFolder.id)}
                    className="flex h-6 w-6 items-center justify-center rounded-md text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
                    title={`Add panel (${shortcutLabel('addPanel')})`}
                    aria-label="Add panel"
                  >
                    <Plus size={13} />
                  </button>
                )}
              </>
            )}

            <button
              type="button"
              onClick={() => setShowFoldersModal(true)}
              className="flex h-6 w-6 items-center justify-center rounded-md text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
              title="Manage folders"
              aria-label="Manage folders"
            >
              <FolderOpen size={13} />
            </button>

            {!isFullscreen && (
              <button
                type="button"
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
                aria-label="Open fullscreen tab"
              >
                <Maximize2 size={13} />
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowSettings(true)}
              className="flex h-6 w-6 items-center justify-center rounded-md text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
              title={`Settings (${shortcutLabel('settings')})`}
              aria-label="Settings"
            >
              <SettingsIcon size={13} />
            </button>
          </div>
        </header>

        {/* ── Main Multi-Column Workspace ── */}
        <main
          ref={workspaceRef}
          className="relative flex min-h-0 min-w-0 flex-1 overflow-hidden bg-[var(--workspace-bg)]"
        >
          {!activeFolder ? (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-[var(--text-tertiary)] select-none">
              <p className="text-xs">No folder selected</p>
              <div className="flex items-center gap-1.5 text-xs">
                <span>Press</span>
                <kbd className="rounded border border-[var(--border-subtle)] bg-[var(--surface-2)] px-1.5 py-0.5 font-mono text-[11px] text-[var(--text-secondary)]">
                  {shortcutLabel('newFolder')}
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
                      {shortcutLabel('addPanel')}
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
            <div className="flex h-full w-full min-w-0 flex-1 overflow-hidden bg-[var(--workspace-bg)] p-1">
              {visiblePanels.map((panel, idx) => {
                const widthStyle = { flex: `${panelWidths[idx]} 1 0%` };

                return (
                  <React.Fragment key={panel.id}>
                    {idx > 0 && (
                      <div
                        role="separator"
                        aria-orientation="vertical"
                        aria-label="Resize columns"
                        tabIndex={0}
                        className="group/divider relative z-20 flex w-1 shrink-0 cursor-col-resize items-center justify-center outline-none select-none before:absolute before:inset-y-0 before:-right-1.5 before:-left-1.5 before:z-10 focus-visible:ring-1 focus-visible:ring-[var(--accent)]"
                        title="Drag to resize columns • Double-click to equalize"
                        onMouseDown={(e) => onDividerMouseDown(idx - 1, e)}
                        onDoubleClick={resetEqualWidths}
                        onKeyDown={(e) => {
                          if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                            e.preventDefault();
                            store.resizePanels(
                              activeFolder.id,
                              idx - 1,
                              panelWidths,
                              e.key === 'ArrowLeft' ? -2 : 2,
                            );
                          } else if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            resetEqualWidths();
                          }
                        }}
                      >
                        {/* Hover/Active Resizer Indicator Line */}
                        <div
                          className={cn(
                            'h-full w-full rounded-full transition-colors duration-150',
                            resizingDividerIdx === idx - 1
                              ? 'bg-[var(--accent)]'
                              : 'bg-transparent group-hover/divider:bg-[var(--accent)]/50',
                          )}
                        />
                      </div>
                    )}
                    <div
                      style={widthStyle}
                      className="flex h-full min-w-[160px] flex-col overflow-hidden rounded-md border border-[var(--border-subtle)] bg-[var(--panel-bg)] shadow-xs"
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
                          dragPanelFrom.current = panel.id;
                        }}
                        onDragOver={(e) => {
                          e.preventDefault();
                          setDragOverPanel(idx);
                        }}
                        onDrop={() => {
                          if (
                            dragPanelFrom.current !== null &&
                            dragPanelFrom.current !== panel.id
                          ) {
                            store.reorderPanels(
                              activeFolder.id,
                              dragPanelFrom.current,
                              panel.id,
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

        {/* ── Quiet Status Bar (Hidden in popup mode) ── */}
        {isFullscreen && (
          <footer className="flex h-6 shrink-0 items-center justify-between border-t border-[var(--border-subtle)] bg-[var(--header-bg)] px-3 text-[11px] text-[var(--text-tertiary)] select-none">
            <span>
              {activeFolder ? `Folder: ${activeFolder.name}` : 'Lumafold'}
            </span>
            <span>
              {visiblePanels.length}{' '}
              {visiblePanels.length === 1 ? 'Column' : 'Columns'} · Auto-saved
            </span>
          </footer>
        )}

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
            canAddPanel={canShowAnotherPanel}
            canUnhide={canShowAnotherPanel}
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
