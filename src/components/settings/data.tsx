import { useRef } from 'react';
import { Download, Upload } from 'lucide-react';
import { useModal } from '@/context/ModalContext';
import type { AppState } from '../../types';
import { Button } from '@/components/ui/button';

export interface DataSettingsProps {
  state: AppState;
  onImportState: (data: unknown) => boolean;
}

export const DataSettings = ({ state, onImportState }: DataSettingsProps) => {
  const { showAlert } = useModal();
  const importInputRef = useRef<HTMLInputElement>(null);

  const exportNotes = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lumafold-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      if (onImportState(data)) {
        showAlert('Notes imported successfully.');
      } else {
        showAlert('Invalid file format. Expected Lumafold export JSON.');
      }
    } catch {
      showAlert(
        'Could not read file. Please choose a valid Lumafold export (.json) file.',
      );
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-muted-foreground text-xs leading-relaxed">
        Export a JSON backup of your folders and notes, or restore a previous
        Lumafold backup file to this device.
      </p>
      <input
        ref={importInputRef}
        type="file"
        accept=".json,application/json"
        onChange={handleImportFile}
        className="hidden"
      />
      <div className="space-y-3">
        <div className="flex items-center justify-between rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-2)]/60 p-3 shadow-xs">
          <div>
            <div className="text-foreground text-xs font-medium">
              Export notes
            </div>
            <div className="text-muted-foreground mt-0.5 text-[11px]">
              Download your full workspace as a JSON backup
            </div>
          </div>
          <Button
            onClick={exportNotes}
            size="sm"
            variant="outline"
            className="border-[var(--border-subtle)] bg-[var(--surface-2)] text-xs shadow-xs hover:bg-[var(--surface-hover)]"
          >
            <Download data-icon="inline-start" className="size-3.5" />
            Export JSON
          </Button>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-2)]/60 p-3 shadow-xs">
          <div>
            <div className="text-foreground text-xs font-medium">
              Restore notes
            </div>
            <div className="text-muted-foreground mt-0.5 text-[11px]">
              Load folders and panels from an existing JSON backup
            </div>
          </div>
          <Button
            onClick={() => importInputRef.current?.click()}
            size="sm"
            variant="outline"
            className="border-[var(--border-subtle)] bg-[var(--surface-2)] text-xs shadow-xs hover:bg-[var(--surface-hover)]"
          >
            <Upload data-icon="inline-start" className="size-3.5" />
            Import JSON
          </Button>
        </div>
      </div>
    </div>
  );
};
