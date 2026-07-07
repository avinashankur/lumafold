import { useRef } from "react";
import { Download, Upload } from "lucide-react";
import { useModal } from "@/context/ModalContext";
import type { AppState } from "../../types";

export interface DataSettingsProps {
  state: AppState;
  onImportState: (data: unknown) => boolean;
}

export const DataSettings = ({ state, onImportState }: DataSettingsProps) => {
  const { showAlert } = useModal();
  const importInputRef = useRef<HTMLInputElement>(null);

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

  return (
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
  );
};
