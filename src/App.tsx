// src/App.tsx
import { useEffect, useState, useRef } from "react";
import { Settings as SettingsIcon, Maximize2, Plus, LayoutGrid, Type, FolderOpen } from "lucide-react";
import { useStorage } from "./hooks/useStorage";
import TabBar from "./components/TabBar";
import Panel from "./components/Panel";
import Settings from "./components/Settings";
import PanelsModal from "./components/PanelsModal";
import FoldersModal from "./components/FoldersModal";
import FormatModal from "./components/FormatModal";
import BottomToolbar from "./components/BottomToolbar";
import { EditorProvider } from "./context/EditorContext";
import { ModalProvider } from "./context/ModalContext";

// Apply theme vars synchronously before first paint to kill the flicker
function applyThemeVars(mode: "light" | "dark", accent: string, fontSize: number = 13) {
  const root = document.documentElement;
  root.classList.toggle("dark", mode === "dark");
  const vars: Record<string, string> =
    mode === "dark"
      ? {
          "--bg": "#111113",
          "--panel-bg": "#18181b",
          "--panel-header-bg": "#1c1c20",
          "--toolbar-bg": "#1c1c20",
          "--tab-bar-bg": "#111113",
          "--border": "#2a2a30",
          "--text": "#e4e4e7",
          "--text-muted": "#71717a",
          "--hover": "#27272a",
          "--accent": accent,
          "--editor-font-size": `${fontSize}px`,
        }
      : {
          "--bg": "#f4f4f5",
          "--panel-bg": "#ffffff",
          "--panel-header-bg": "#fafafa",
          "--toolbar-bg": "#f9f9fb",
          "--tab-bar-bg": "#f4f4f5",
          "--border": "#e4e4e7",
          "--text": "#18181b",
          "--text-muted": "#71717a",
          "--hover": "#f1f1f3",
          "--accent": accent,
          "--editor-font-size": `${fontSize}px`,
        };
  Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v));
}

// Run immediately on script load — before React renders — to prevent flicker
;(() => {
  try {
    const raw = localStorage.getItem("ultrafold_state");
    if (raw) {
      const s = JSON.parse(raw);
      if (s?.theme) applyThemeVars(s.theme.mode, s.theme.accent, s.theme.fontSize ?? 13);
      return;
    }
  } catch {}
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  applyThemeVars(prefersDark ? "dark" : "light", "#6366f1");
})();

export default function App() {
  const store = useStorage();
  const [showSettings, setShowSettings] = useState(false);
  const [showPanelsModal, setShowPanelsModal] = useState(false);
  const [showFoldersModal, setShowFoldersModal] = useState(false);
  const [showFormatModal, setShowFormatModal] = useState(false);
  const dragPanelFrom = useRef<number | null>(null);
  const [dragOverPanel, setDragOverPanel] = useState<number | null>(null);

  const { state, loaded } = store;

  // Keep CSS vars in sync with theme state changes
  useEffect(() => {
    if (!state) return;
    applyThemeVars(state.theme.mode, state.theme.accent, state.theme.fontSize ?? 13);
  }, [state?.theme]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!state) return;
    const handler = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey;
      if (ctrl && e.key === "t") { e.preventDefault(); store.addFolder(); }
      if (ctrl && e.key === ",") { e.preventDefault(); setShowSettings((s) => !s); }
      if (ctrl && e.shiftKey && e.key === "L") {
        e.preventDefault();
        store.setTheme({ mode: state.theme.mode === "dark" ? "light" : "dark" });
      }
      if (ctrl && e.shiftKey && e.key === "]") {
        e.preventDefault();
        if (state.activeFolderId) store.addPanel(state.activeFolderId);
      }
      if (ctrl && !e.shiftKey && /^[1-9]$/.test(e.key)) {
        const idx = parseInt(e.key) - 1;
        const visible = state.folders.filter((f) => !f.hidden);
        const folder = visible[idx];
        if (folder) { e.preventDefault(); store.setActiveFolder(folder.id); }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [state, store]);

  if (!loaded || !state) {
    return (
      <div
        className="w-full h-full flex items-center justify-center"
        style={{ background: "var(--bg)" }}
      >
        <div className="w-4 h-4 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
      </div>
    );
  }

  const activeFolder = state.folders.find((f) => f.id === state.activeFolderId);
  const visiblePanels = activeFolder ? activeFolder.panels.filter((p) => !p.hidden) : [];
  const isFullscreen = document.documentElement.getAttribute("data-mode") === "tab";

  return (
    <ModalProvider>
    <EditorProvider>
    <div
      className="flex flex-col w-full h-full font-sans overflow-hidden"
      style={{ background: "var(--bg)" }}
    >
      {/* ── Top bar ── */}
      <div
        className="flex items-center gap-2 px-2 py-1 flex-shrink-0"
        style={{
          background: "var(--tab-bar-bg)",
          // borderBottom: "1px solid var(--border)",
        }}
      >
        {/* Tab bar — takes all available space */}
        <div className="flex-1 overflow-hidden min-w-0">
          <TabBar
            folders={state.folders}
            activeFolderId={state.activeFolderId}
            onSelect={store.setActiveFolder}
            onAdd={store.addFolder}
            onDelete={store.deleteFolder}
            onRename={store.renameFolder}
            onHide={store.hideFolderById}
            onReorder={store.reorderFolders}
          />
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-0.5 flex-shrink-0">
          {/* Folders modal trigger */}
          <button
            onClick={() => setShowFoldersModal(true)}
            className="p-1.5 rounded text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--hover)] transition-colors"
            title="Manage folders"
          >
            <FolderOpen size={13} />
          </button>
          {/* Panels modal trigger — when folder selected */}
          {activeFolder && (
            <button
              onClick={() => setShowPanelsModal(true)}
              className="p-1.5 rounded text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--hover)] transition-colors"
              title="Panels (add, unhide)"
            >
              <LayoutGrid size={13} />
            </button>
          )}
          {/* Format modal trigger */}
          <button
            onClick={() => setShowFormatModal(true)}
            className="p-1.5 rounded text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--hover)] transition-colors"
            title="Format (bold, headings, etc.)"
          >
            <Type size={13} />
          </button>
          {/* <button
            onClick={() => store.setTheme({ mode: state.theme.mode === "dark" ? "light" : "dark" })}
            className="p-1.5 rounded text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--hover)] transition-colors"
            title="Toggle theme (Ctrl+Shift+L)"
          >
            {state.theme.mode === "dark" ? <Sun size={13} /> : <Moon size={13} />}
          </button> */}

          {!isFullscreen && (
            <button
              onClick={() => {
                if (typeof chrome !== "undefined" && chrome.tabs) {
                  chrome.tabs.create({ url: chrome.runtime.getURL("popup.html") });
                } else {
                  const w = window.open(window.location.href, "_blank", "");
                  if (w) w.resizeTo(screen.availWidth, screen.availHeight);
                }
              }}
              className="p-1.5 rounded text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--hover)] transition-colors"
              title="Open fullscreen tab"
            >
              <Maximize2 size={13} />
            </button>
          )}

          <button
            onClick={() => setShowSettings(true)}
            className="p-1.5 rounded text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--hover)] transition-colors"
            title="Settings (Ctrl+,)"
          >
            <SettingsIcon size={13} />
          </button>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col overflow-hidden relative min-h-0 min-w-0">
        {!activeFolder ? (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <p className="text-sm text-[var(--text-muted)]">No folder selected</p>
            <button
              onClick={store.addFolder}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-white transition-colors"
              style={{ background: "var(--accent)" }}
            >
              <Plus size={14} /> New Folder
            </button>
          </div>
        ) : (
          <div className="flex flex-1 min-h-0 overflow-hidden p-2 gap-2 min-w-0">
            {/* Visible panels — each takes equal share of full width */}
            {visiblePanels.map((panel, idx) => {
              // Find real index in all panels for drag ops
              const realIdx = activeFolder.panels.indexOf(panel);
              return (
                <div
                  key={panel.id}
                  className="min-w-0 h-full"
                  style={{ flex: "1 1 0" }}
                >
                  <Panel
                    panel={panel}
                    onHide={() => store.hidePanelById(activeFolder.id, panel.id)}
                    onRename={(title) => store.renamePanel(activeFolder.id, panel.id, title)}
                    onContentChange={(content) => store.updatePanelContent(activeFolder.id, panel.id, content)}
                    onDragStart={() => { dragPanelFrom.current = realIdx; }}
                    onDragOver={(e) => { e.preventDefault(); setDragOverPanel(idx); }}
                    onDrop={() => {
                      if (dragPanelFrom.current !== null && dragPanelFrom.current !== realIdx) {
                        store.reorderPanels(activeFolder.id, dragPanelFrom.current, realIdx);
                      }
                      dragPanelFrom.current = null;
                      setDragOverPanel(null);
                    }}
                    isDragOver={dragOverPanel === idx}
                  />
                </div>
              );
            })}
          </div>
        )}

        {/* Modals */}
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
            onHidePanel={(panelId) => store.hidePanelById(activeFolder.id, panelId)}
            onUnhidePanel={(panelId) => store.unhidePanelById(activeFolder.id, panelId)}
            onClose={() => setShowPanelsModal(false)}
          />
        )}
        {showFormatModal && (
          <FormatModal onClose={() => setShowFormatModal(false)} />
        )}
        {/* Settings overlay */}
        {showSettings && (
          <Settings
            theme={state.theme}
            onThemeChange={store.setTheme}
            onClose={() => setShowSettings(false)}
            state={state}
            onImportState={store.importState}
          />
        )}
      </div>

      {/* Bottom bar: panel controls + format tools — fullscreen only */}
      {isFullscreen && activeFolder && (
        <BottomToolbar
          canAddPanel={activeFolder.panels.length < 3}
          canUnhide={visiblePanels.length < 3}
          onAddPanel={() => store.addPanel(activeFolder.id)}
          panels={activeFolder.panels}
          onUnhidePanel={(panelId) => store.unhidePanelById(activeFolder.id, panelId)}
        />
      )}
    </div>
    </EditorProvider>
    </ModalProvider>
  );
}
