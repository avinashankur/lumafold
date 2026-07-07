import { useRef, useState } from "react";
import {
  Database,
  Download,
  Keyboard,
  Palette,
  Settings2,
  X,
} from "lucide-react";
import { PreferencesSettingTypes, ThemeSettings } from "../types";
import type { AppState } from "../types";
import { useModal } from "../context/ModalContext";
import { cn } from "../lib/utils";
import { AppearanceSettings } from "./settings/appearance/main";
import { PreferencesSettings } from "./settings/preferences";
import { DataSettings } from "./settings/data";
import { ShortcutsSettings } from "./settings/shortcuts";

interface Props {
  theme: ThemeSettings;
  onThemeChange: (t: Partial<ThemeSettings>) => void;
  preferences: PreferencesSettingTypes;
  onPreferencesChange: (preferences: Partial<PreferencesSettingTypes>) => void;
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
  const importInputRef = useRef<HTMLInputElement>(null);
  const [activeSection, setActiveSection] = useState<
    "appearance" | "preferences" | "data" | "shortcuts"
  >("appearance");

  const exportNotes = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], {
      type: "application/json",
    });
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
      showAlert(
        "Could not read file. Please choose a valid Lumafold export (.json) file.",
      );
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
        style={{
          background: "var(--panel-bg)",
          border: "1px solid var(--border)",
        }}
      >
        <aside
          className="w-36 flex-shrink-0 border-r p-2"
          style={{
            background: "var(--tab-bar-bg)",
            borderColor: "var(--border)",
          }}
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
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-colors",
                  activeSection === id
                    ? "bg-[var(--hover)] font-medium text-[var(--text)]"
                    : "text-[var(--text-muted)] hover:bg-[var(--hover)] hover:text-[var(--text)]",
                )}
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
            style={{
              background: "var(--panel-bg)",
              borderColor: "var(--border)",
            }}
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
              <AppearanceSettings
                fontSize={theme.fontSize}
                onFontSizeChange={(fontSize) => onThemeChange({ fontSize })}
              />
            )}

            {activeSection === "preferences" && (
              <PreferencesSettings
                preferences={preferences}
                onPreferencesChange={onPreferencesChange}
              />
            )}

            {activeSection === "data" && (
              <DataSettings state={state} onImportState={onImportState} />
            )}

            {activeSection === "shortcuts" && <ShortcutsSettings />}
          </div>
        </section>
      </div>
    </div>
  );
}
