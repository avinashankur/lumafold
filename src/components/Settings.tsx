// src/components/Settings.tsx
import { useRef } from "react";
import { X, Download, Upload } from "lucide-react";
import { ThemeSettings } from "../types";
import type { AppState } from "../types";
import { useModal } from "../context/ModalContext";

const ACCENTS = [
  // Vibrant
  "#6366f1", // indigo
  "#8b5cf6", // violet
  "#a855f7", // purple
  "#ec4899", // pink
  "#f43f5e", // rose
  "#f97316", // orange
  "#f59e0b", // amber
  "#eab308", // yellow
  "#84cc16", // lime
  "#22c55e", // green
  "#10b981", // emerald
  "#3b82f6", // blue
  "#0ea5e9", // sky
  // Neutrals
  "#171717", // blackish
  "#404040", // dark gray
  "#525252", // neutral gray
  "#737373", // medium gray
  "#a3a3a3", // light gray
  "#d4d4d4", // whitish
  "#f5f5f5", // off-white
];

interface Props {
  theme: ThemeSettings;
  onThemeChange: (t: Partial<ThemeSettings>) => void;
  onClose: () => void;
  state: AppState;
  onImportState: (data: unknown) => boolean;
}

export default function Settings({ theme, onThemeChange, onClose, state, onImportState }: Props) {
  const { showAlert } = useModal();
  const importInputRef = useRef<HTMLInputElement>(null);

  const exportNotes = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lumafold-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      if (onImportState(data)) {
        showAlert("Notes imported successfully.");
      } else {
        showAlert("Invalid file format. Expected Lumafold export JSON.");
      }
    } catch {
      showAlert("Could not read file. Please choose a valid Lumafold export (.json) file.");
    }
  };
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(4px)" }}>
      <div className="rounded-xl shadow-2xl w-72 overflow-hidden" style={{ background: "var(--panel-bg)", border: "1px solid var(--border)" }}>
        <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "var(--border)" }}>
          <span className="text-sm font-semibold text-[var(--text)]">Settings</span>
          <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
            <X size={15} />
          </button>
        </div>

        <div className="p-4 space-y-5">
          {/* Dark mode toggle */}
          <div>
            <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Appearance</label>
            <div className="mt-2 flex items-center gap-2">
              {(["light", "dark"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => onThemeChange({ mode: m })}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    theme.mode === m
                      ? "bg-[var(--accent)] text-white"
                      : "bg-[var(--hover)] text-[var(--text-muted)] hover:text-[var(--text)]"
                  }`}
                >
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Font size */}
          <div>
            <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Font Size</label>
            <div className="mt-2 flex items-center gap-1">
              {[12, 13, 14, 15, 16].map((size) => (
                <button
                  key={size}
                  onClick={() => onThemeChange({ fontSize: size })}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    (theme.fontSize ?? 13) === size
                      ? "bg-[var(--accent)] text-white"
                      : "bg-[var(--hover)] text-[var(--text-muted)] hover:text-[var(--text)]"
                  }`}
                  title={`${size}px`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Accent color */}
          <div>
            <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Accent Color</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {ACCENTS.map((color) => (
                <button
                  key={color}
                  onClick={() => onThemeChange({ accent: color })}
                  className={`w-7 h-7 rounded-full transition-transform hover:scale-110 ${
                    theme.accent === color ? "ring-2 ring-offset-2 ring-[var(--accent)] scale-110" : ""
                  }`}
                  style={{ background: color, ringOffsetColor: "var(--panel-bg)" } as React.CSSProperties}
                  title={color}
                />
              ))}
              {/* Custom color */}
              <label className="w-7 h-7 rounded-full border-2 border-dashed border-[var(--border)] flex items-center justify-center cursor-pointer hover:border-[var(--accent)] transition-colors" title="Custom color">
                <span className="text-xs text-[var(--text-muted)]">+</span>
                <input
                  type="color"
                  value={theme.accent}
                  onChange={(e) => onThemeChange({ accent: e.target.value })}
                  className="sr-only"
                />
              </label>
            </div>
          </div>

          {/* Export / Import */}
          <div>
            <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Data</label>
            <div className="mt-2 flex gap-2">
              <input
                ref={importInputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleImportFile}
                className="hidden"
              />
              <button
                onClick={exportNotes}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium transition-colors bg-[var(--hover)] text-[var(--text-muted)] hover:text-[var(--text)]"
              >
                <Download size={14} /> Export
              </button>
              <button
                onClick={() => importInputRef.current?.click()}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium transition-colors bg-[var(--hover)] text-[var(--text-muted)] hover:text-[var(--text)]"
              >
                <Upload size={14} /> Import
              </button>
            </div>
          </div>

          {/* Shortcuts hint */}
          <div>
            <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Shortcuts</label>
            <div className="mt-2 space-y-1">
              {[
                ["Ctrl+T", "New folder"],
                ["Ctrl+Shift+]", "Add panel"],
                ["Ctrl+Shift+L", "Toggle theme"],
                ["Ctrl+,", "Settings"],
              ].map(([key, desc]) => (
                <div key={key} className="flex justify-between text-xs">
                  <code className="font-mono text-[var(--accent)]">{key}</code>
                  <span className="text-[var(--text-muted)]">{desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
