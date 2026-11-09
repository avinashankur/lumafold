import { Plus, Eye, EyeOff, Trash2 } from 'lucide-react';
import type { Panel } from '../types';
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
  canAddPanel: boolean;
  canUnhide: boolean;
  onAddPanel: () => void;
  panels: Panel[];
  onHidePanel: (panelId: string) => void;
  onUnhidePanel: (panelId: string) => void;
  onDeletePanel: (panelId: string) => void;
  onClose: () => void;
}

export default function PanelsModal({
  open = true,
  canAddPanel,
  canUnhide,
  onAddPanel,
  panels,
  onHidePanel,
  onUnhidePanel,
  onDeletePanel,
  onClose,
}: Props) {
  const { showAlert, showConfirm } = useModal();

  const handleUnhide = (panelId: string) => {
    if (!canUnhide) {
      showAlert('Hide another panel first — max 3 visible panels.');
      return;
    }
    onUnhidePanel(panelId);
  };

  const handleDelete = (panel: Panel) => {
    const hasContent =
      panel.content && panel.content.replace(/<[^>]*>/g, '').trim() !== '';
    if (hasContent) {
      showConfirm(
        `Permanently delete "${panel.title}" and all its content?`,
        () => onDeletePanel(panel.id),
        { confirmLabel: 'Delete', danger: true },
      );
    } else {
      onDeletePanel(panel.id);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="border-border bg-card flex max-h-[85vh] w-80 flex-col overflow-hidden rounded-lg border p-0 shadow-2xl">
        <DialogHeader className="border-border border-b px-4 py-3">
          <DialogTitle className="text-foreground text-sm font-semibold">
            Manage Panels
          </DialogTitle>
          <DialogDescription className="sr-only">
            Add, hide, or delete panels in this folder
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 overflow-hidden p-4">
          {canAddPanel && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onAddPanel();
                onClose();
              }}
              className="text-muted-foreground hover:text-foreground w-full justify-start border-dashed text-xs"
            >
              <Plus data-icon="inline-start" className="size-3.5" />
              Add panel (max 3)
            </Button>
          )}

          {panels.length > 0 && (
            <div className="flex min-h-0 flex-col overflow-hidden">
              <span className="text-muted-foreground mb-1.5 text-[11px] font-semibold tracking-wider uppercase">
                Folder panels
              </span>
              <div className="thin-scrollbar flex max-h-[50vh] flex-col gap-1 overflow-y-auto pr-0.5">
                {panels.map((p) => (
                  <div
                    key={p.id}
                    className="bg-muted/40 hover:bg-muted/70 flex items-center justify-between gap-2 rounded-md px-2.5 py-1.5 transition-colors select-none"
                  >
                    <span
                      className={`pointer-events-none flex-1 truncate text-xs font-medium ${
                        p.hidden
                          ? 'text-muted-foreground line-through opacity-60'
                          : 'text-foreground'
                      }`}
                    >
                      {p.title}
                    </span>
                    <div className="flex shrink-0 items-center gap-1">
                      {p.hidden ? (
                        <button
                          type="button"
                          onClick={() => handleUnhide(p.id)}
                          className="text-primary hover:bg-primary/10 flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-medium transition-colors"
                          title="Unhide this panel"
                        >
                          <Eye size={12} />
                          Unhide
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onHidePanel(p.id)}
                          className="text-muted-foreground hover:text-foreground hover:bg-muted flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] transition-colors"
                          title="Hide this panel"
                        >
                          <EyeOff size={12} />
                          Hide
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDelete(p)}
                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 flex items-center gap-1 rounded p-1 transition-colors"
                        title="Delete panel"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {panels.length === 0 && !canAddPanel && (
            <p className="text-muted-foreground text-xs">
              No panel actions available.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
