import { Plus, Eye, EyeOff, Trash2 } from 'lucide-react';
import type { Folder } from '../types';
import { useModal } from '../context/ModalContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface Props {
  open?: boolean;
  folders: Folder[];
  onAddFolder: () => void;
  onHideFolder: (id: string) => void;
  onUnhideFolder: (id: string) => void;
  onDeleteFolder: (id: string) => void;
  onClose: () => void;
}

function folderHasContent(folder: Folder): boolean {
  return folder.panels.some(
    (p) => p.content && p.content.replace(/<[^>]*>/g, '').trim() !== '',
  );
}

export default function FoldersModal({
  open = true,
  folders,
  onAddFolder,
  onHideFolder,
  onUnhideFolder,
  onDeleteFolder,
  onClose,
}: Props) {
  const { showConfirm } = useModal();

  const handleDelete = (folder: Folder) => {
    if (folderHasContent(folder)) {
      showConfirm(
        `Permanently delete "${folder.name}" and all its content?`,
        () => onDeleteFolder(folder.id),
        { confirmLabel: 'Delete', danger: true },
      );
    } else {
      onDeleteFolder(folder.id);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="border-border bg-card flex max-h-[85vh] w-80 flex-col overflow-hidden rounded-lg border p-0 shadow-2xl">
        <DialogHeader className="border-border border-b px-4 py-3">
          <DialogTitle className="text-foreground text-sm font-semibold">
            Manage Folders
          </DialogTitle>
          <DialogDescription className="sr-only">
            Add, hide, or delete folders
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 overflow-hidden p-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              onAddFolder();
              onClose();
            }}
            className="text-muted-foreground hover:text-foreground w-full justify-start border-dashed text-xs"
          >
            <Plus data-icon="inline-start" className="size-3.5" />
            Add folder
          </Button>

          {folders.length > 0 && (
            <div className="flex min-h-0 flex-col overflow-hidden">
              <span className="text-muted-foreground mb-1.5 text-[11px] font-semibold tracking-wider uppercase">
                All folders
              </span>
              <div className="thin-scrollbar flex max-h-[50vh] flex-col gap-1 overflow-y-auto pr-0.5">
                {folders.map((f) => (
                  <div
                    key={f.id}
                    className="bg-muted/40 hover:bg-muted/70 flex items-center justify-between gap-2 rounded-md px-2.5 py-1.5 transition-colors select-none"
                  >
                    <span
                      className={`pointer-events-none flex-1 truncate text-xs font-medium ${
                        f.hidden
                          ? 'text-muted-foreground line-through opacity-60'
                          : 'text-foreground'
                      }`}
                    >
                      {f.name}
                    </span>
                    <div className="flex shrink-0 items-center gap-1">
                      {f.hidden ? (
                        <button
                          type="button"
                          onClick={() => onUnhideFolder(f.id)}
                          className="text-primary hover:bg-primary/10 flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-medium transition-colors"
                          title="Unhide this folder"
                        >
                          <Eye size={12} />
                          Unhide
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onHideFolder(f.id)}
                          className="text-muted-foreground hover:text-foreground hover:bg-muted flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] transition-colors"
                          title="Hide this folder"
                        >
                          <EyeOff size={12} />
                          Hide
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDelete(f)}
                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 flex items-center gap-1 rounded p-1 transition-colors"
                        title="Delete folder"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
