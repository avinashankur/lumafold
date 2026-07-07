// src/components/Settings.tsx
import { useRef, useState } from "react";
import { Database, Download, Keyboard, Palette, Settings2, Upload, X } from "lucide-react";
import { PreferencesSettings, ThemeSettings } from "../types";
import type { AppState } from "../types";
import { useModal } from "../context/ModalContext";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTheme } from "@/providers/theme-provider";
import type { Theme } from "@/providers/theme-provider";

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
  preferences: PreferencesSettings;
  onPreferencesChange: (preferences: Partial<PreferencesSettings>) => void;
  onClose: () => void;
  state: AppState;
  onImportState: (data: unknown) => boolean;
}

export default function Settings({
  theme,
  onThemeChange,
  preferences,
  onPreferencesChange,
  onClose,
  state,
  onImportState,
}: Props) {
  const { showAlert } = useModal();
  const { theme: colorTheme, setTheme: setColorTheme } = useTheme();
  const importInputRef = useRef<HTMLInputElement>(null);
  const [activeSection, setActiveSection] = useState<"appearance" | "preferences" | "data" | "shortcuts">(
    "appearance"
  );

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
  const sections = [
    { id: "appearance" as const, label: "Appearance", icon: Palette },
    { id: "preferences" as const, label: "Preferences", icon: Settings2 },
    { id: "data" as const, label: "Data", icon: Database },
    { id: "shortcuts" as const, label: "Shortcuts", icon: Keyboard },
  ];

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-3"
      style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(4px)" }}
    >
      <div
        className="flex h-[420px] max-h-full w-[min(640px,100%)] overflow-hidden rounded-xl shadow-2xl"
        style={{ background: "var(--panel-bg)", border: "1px solid var(--border)" }}
      >
        <aside
          className="w-36 flex-shrink-0 border-r p-2"
          style={{ background: "var(--tab-bar-bg)", borderColor: "var(--border)" }}
        >
          <div className="px-2 pb-3 pt-1 text-sm font-semibold text-[var(--text)]">
            Settings
          </div>
          <nav className="space-y-0.5" aria-label="Settings sections">
            {sections.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveSection(id)}
                className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-colors ${
                  activeSection === id
                    ? "bg-[var(--hover)] font-medium text-[var(--text)]"
                    : "text-[var(--text-muted)] hover:bg-[var(--hover)] hover:text-[var(--text)]"
                }`}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
          </nav>
        </aside>

        <section className="min-w-0 flex-1 overflow-y-auto">
          <header
            className="sticky top-0 z-10 flex items-center justify-between border-b px-5 py-3"
            style={{ background: "var(--panel-bg)", borderColor: "var(--border)" }}
          >
            <span className="text-sm font-semibold text-[var(--text)]">
              {sections.find((section) => section.id === activeSection)?.label}
            </span>
            <button
              onClick={onClose}
              className="rounded p-1 text-[var(--text-muted)] transition-colors hover:bg-[var(--hover)] hover:text-[var(--text)]"
              aria-label="Close settings"
            >
              <X size={15} />
            </button>
          </header>

          <div className="space-y-6 p-5">
            {activeSection === "appearance" && (
              <>
                <div>
                  <label className="text-xs font-medium text-[var(--text)]">Theme</label>
                  <Select
                    value={colorTheme}
                    onValueChange={(mode) => setColorTheme(mode as Theme)}
                  >
                    <SelectTrigger className="mt-2 w-full border-[var(--border)] bg-[var(--hover)] text-xs text-[var(--text)]">
                      <SelectValue placeholder="Select theme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="system">System</SelectItem>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-xs font-medium text-[var(--text)]">Font size</label>
                  <div className="mt-2 flex items-center gap-1">
                    {[12, 13, 14, 15, 16].map((size) => (
                      <button
                        key={size}
                        onClick={() => onThemeChange({ fontSize: size })}
                        className={`flex-1 rounded-lg py-2 text-xs font-medium transition-all ${
                          (theme.fontSize ?? 13) === size
                            ? "bg-[var(--accent)] text-white"
                            : "bg-[var(--hover)] text-[var(--text-muted)] hover:text-[var(--text)]"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-[var(--text)]">Accent color</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {ACCENTS.map((color) => (
                      <button
                        key={color}
                        onClick={() => onThemeChange({ accent: color })}
                        className={`h-7 w-7 rounded-full transition-transform hover:scale-110 ${
                          theme.accent === color
                            ? "scale-110 ring-2 ring-[var(--accent)] ring-offset-2"
                            : ""
                        }`}
                        style={
                          { background: color, ringOffsetColor: "var(--panel-bg)" } as React.CSSProperties
                        }
                        title={color}
                      />
                    ))}
                    <label
                      className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border-2 border-dashed border-[var(--border)] transition-colors hover:border-[var(--accent)]"
                      title="Custom color"
                    >
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
              </>
            )}

            {activeSection === "preferences" && (
              <div className="space-y-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-xs font-medium text-[var(--text)]">Panel headers</div>
                    <div className="mt-0.5 text-[11px] text-[var(--text-muted)]">
                      Show titles and panel controls above editors.
                    </div>
                  </div>
                  <Switch
                    checked={preferences.showPanelHeaders}
                    onCheckedChange={(checked) =>
                      onPreferencesChange({ showPanelHeaders: checked })
                    }
                    aria-label="Toggle panel headers"
                  />
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-xs font-medium text-[var(--text)]">Tab bar scrollbar</div>
                    <div className="mt-0.5 text-[11px] text-[var(--text-muted)]">
                      Show the horizontal scrollbar under folder tabs.
                    </div>
                  </div>
                  <Switch
                    checked={preferences.showTabBarScrollBar}
                    onCheckedChange={(checked) =>
                      onPreferencesChange({ showTabBarScrollBar: checked })
                    }
                    aria-label="Toggle tab bar scrollbar"
                  />
                </div>
              </div>
            )}

            {activeSection === "data" && (
              <div>
                <p className="mb-4 text-xs leading-5 text-[var(--text-muted)]">
                  Export a backup of your folders and notes, or restore a previous Lumafold export.
                </p>
                <input
                  ref={importInputRef}
                  type="file"
                  accept=".json,application/json"
                  onChange={handleImportFile}
                  className="hidden"
                />
                <div className="flex gap-2">
                  <button
                    onClick={exportNotes}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[var(--hover)] py-2 text-xs font-medium text-[var(--text-muted)] transition-colors hover:text-[var(--text)]"
                  >
                    <Download size={14} /> Export
                  </button>
                  <button
                    onClick={() => importInputRef.current?.click()}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[var(--hover)] py-2 text-xs font-medium text-[var(--text-muted)] transition-colors hover:text-[var(--text)]"
                  >
                    <Upload size={14} /> Import
                  </button>
                </div>
              </div>
            )}

            {activeSection === "shortcuts" && (
              <div className="divide-y divide-[var(--border)]">
                {[
                  ["Ctrl+T", "New folder"],
                  ["Ctrl+Shift+]", "Add panel"],
                  ["Ctrl+Shift+L", "Toggle theme"],
                  ["Ctrl+,", "Settings"],
                ].map(([key, description]) => (
                  <div key={key} className="flex items-center justify-between py-2.5 text-xs">
                    <span className="text-[var(--text-muted)]">{description}</span>
                    <code className="rounded bg-[var(--hover)] px-1.5 py-0.5 font-mono text-[var(--text)]">
                      {key}
                    </code>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
