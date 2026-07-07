/// <reference types="chrome" />

import { useEffect, useRef, useState } from 'react';
import {
  FolderOpen,
  LayoutGrid,
  Maximize2,
  Plus,
  Settings as SettingsIcon,
  Type,
} from 'lucide-react';
import { useStorage } from '@/hooks/useStorage';
import TabBar from '@/components/TabBar';
import Panel from '@/components/Panel';
import Settings from '@/components/Settings';
import PanelsModal from '@/components/PanelsModal';
import FoldersModal from '@/components/FoldersModal';
import FormatModal from '@/components/FormatModal';
import BottomToolbar from '@/components/BottomToolbar';
import { useTheme } from '@/components/theme-provider';
import { LumafoldThemeVars } from '@/providers/lumafold-theme-vars';

export default function LumafoldApp() {
  const store = useStorage();
  const { theme: colorTheme, setTheme: setColorTheme } = useTheme();
  const [showSettings, setShowSettings] = useState(false);
  const [showPanelsModal, setShowPanelsModal] = useState(false);
  const [showFoldersModal, setShowFoldersModal] = useState(false);
  const [showFormatModal, setShowFormatModal] = useState(false);
  const dragPanelFrom = useRef<number | null>(null);
  const [dragOverPanel, setDragOverPanel] = useState<number | null>(null);

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

  if (!loaded || !state) {
    return (
      <div
        className="flex h-full w-full items-center justify-center"
        style={{ background: 'var(--bg)' }}
      >
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent" />
      </div>
    );
  }

  const activeFolder = state.folders.find((f) => f.id === state.activeFolderId);
  const visiblePanels = activeFolder
    ? activeFolder.panels.filter((p) => !p.hidden)
    : [];
  const isFullscreen =
    document.documentElement.getAttribute('data-mode') === 'tab';

  return (
    <>
      <LumafoldThemeVars fontSize={state.theme.fontSize ?? 13} />
      <div
        className="flex h-full w-full flex-col overflow-hidden font-sans"
        style={{ background: 'var(--bg)' }}
      >
        <div
          className="flex flex-shrink-0 items-center gap-2 px-2 py-1"
          style={{ background: 'var(--tab-bar-bg)' }}
        >
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

          <div className="flex flex-shrink-0 items-center gap-0.5">
            <button
              onClick={() => setShowFoldersModal(true)}
              className="rounded p-1.5 text-[var(--text-muted)] transition-colors hover:bg-[var(--hover)] hover:text-[var(--text)]"
              title="Manage folders"
            >
              <FolderOpen size={13} />
            </button>

            {activeFolder && (
              <button
                onClick={() => setShowPanelsModal(true)}
                className="rounded p-1.5 text-[var(--text-muted)] transition-colors hover:bg-[var(--hover)] hover:text-[var(--text)]"
                title="Panels (add, unhide)"
              >
                <LayoutGrid size={13} />
              </button>
            )}

            <button
              onClick={() => setShowFormatModal(true)}
              className="rounded p-1.5 text-[var(--text-muted)] transition-colors hover:bg-[var(--hover)] hover:text-[var(--text)]"
              title="Format (bold, headings, etc.)"
            >
              <Type size={13} />
            </button>

            {!isFullscreen && (
              <button
                onClick={() => {
                  if (typeof chrome !== 'undefined' && chrome.tabs) {
                    chrome.tabs.create({
                      url: chrome.runtime.getURL('popup.html'),
                    });
                  } else {
                    const w = window.open(window.location.href, '_blank', '');
                    if (w) w.resizeTo(screen.availWidth, screen.availHeight);
                  }
                }}
                className="rounded p-1.5 text-[var(--text-muted)] transition-colors hover:bg-[var(--hover)] hover:text-[var(--text)]"
                title="Open fullscreen tab"
              >
                <Maximize2 size={13} />
              </button>
            )}

            <button
              onClick={() => setShowSettings(true)}
              className="rounded p-1.5 text-[var(--text-muted)] transition-colors hover:bg-[var(--hover)] hover:text-[var(--text)]"
              title="Settings (Ctrl+,)"
            >
              <SettingsIcon size={13} />
            </button>
          </div>
        </div>

        <div className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          {!activeFolder ? (
            <div className="flex h-full flex-col items-center justify-center gap-3">
              <p className="text-sm text-[var(--text-muted)]">
                No folder selected
              </p>
              <button
                onClick={store.addFolder}
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-white transition-colors"
                style={{
                  background: 'var(--primary)',
                  color: 'var(--primary-foreground)',
                }}
              >
                <Plus size={14} /> New Folder
              </button>
            </div>
          ) : (
            <div className="flex flex-1 gap-2 overflow-hidden p-2 pt-0">
              {visiblePanels.map((panel, idx) => {
                const realIdx = activeFolder.panels.indexOf(panel);
                return (
                  <div
                    key={panel.id}
                    className="h-full min-w-0"
                    style={{ flex: '1 1 0' }}
                  >
                    <Panel
                      panel={panel}
                      onHide={() =>
                        store.hidePanelById(activeFolder.id, panel.id)
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
                    />
                  </div>
                );
              })}
            </div>
          )}

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
              onClose={() => setShowPanelsModal(false)}
            />
          )}
          {showFormatModal && (
            <FormatModal onClose={() => setShowFormatModal(false)} />
          )}
        </div>

        {isFullscreen && activeFolder && (
          <BottomToolbar
            canAddPanel={activeFolder.panels.length < 3}
            canUnhide={visiblePanels.length < 3}
            onAddPanel={() => store.addPanel(activeFolder.id)}
            panels={activeFolder.panels}
            onUnhidePanel={(panelId) =>
              store.unhidePanelById(activeFolder.id, panelId)
            }
          />
        )}

        {showSettings && (
          <Settings
            theme={state.theme}
            onThemeChange={store.setTheme}
            preferences={state.preferences}
            onPreferencesChange={store.setPreferences}
            onClose={() => setShowSettings(false)}
            state={state}
            onImportState={store.importState}
          />
        )}
      </div>
    </>
  );
}
