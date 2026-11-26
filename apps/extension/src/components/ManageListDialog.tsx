import { Plus, Eye, EyeOff, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useConfirmDelete } from '@/hooks/useConfirmDelete';

export interface ManageListItem {
  id: string;
  label: string;
  hidden: boolean;
  hasContent: boolean;
}

interface Props {
  open?: boolean;
  title: string;
  description: string; // for screen readers
  listLabel: string;
  noun: string; // "folder" / "panel", used in button titles
  items: ManageListItem[];
  addLabel?: string; // omit to offer no Add button
  onAdd: () => void;
  onHide: (id: string) => void;
  onShow: (id: string) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

// The add / hide / unhide / delete list shared by Manage Folders and
// Manage Panels.
export default function ManageListDialog({
  open = true,
  title,
  description,
  listLabel,
  noun,
  items,
  addLabel,
  onAdd,
  onHide,
  onShow,
  onDelete,
  onClose,
}: Props) {
  const confirmDelete = useConfirmDelete();

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="border-border bg-card flex max-h-[85vh] w-80 flex-col overflow-hidden rounded-lg border p-0 shadow-2xl">
        <DialogHeader className="border-border border-b px-4 py-3">
          <DialogTitle className="text-foreground text-sm font-semibold">
            {title}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 overflow-hidden p-4">
          {addLabel && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onAdd();
                onClose();
              }}
              className="text-muted-foreground hover:text-foreground w-full justify-start border-dashed text-xs"
            >
              <Plus data-icon="inline-start" className="size-3.5" />
              {addLabel}
            </Button>
          )}

          {items.length > 0 && (
            <div className="flex min-h-0 flex-col overflow-hidden">
              <span className="text-muted-foreground mb-1.5 text-[11px] font-semibold tracking-wider uppercase">
                {listLabel}
              </span>
              <div className="thin-scrollbar flex max-h-[50vh] flex-col gap-1 overflow-y-auto pr-0.5">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="bg-muted/40 hover:bg-muted/70 flex items-center justify-between gap-2 rounded-md px-2 py-1 transition-colors select-none"
                  >
                    <span
                      className={`pointer-events-none flex-1 truncate text-xs font-medium ${
                        item.hidden
                          ? 'text-muted-foreground line-through opacity-60'
                          : 'text-foreground'
                      }`}
                    >
                      {item.label}
                    </span>
                    <div className="flex shrink-0 items-center gap-1">
                      {item.hidden ? (
                        <button
                          type="button"
                          onClick={() => onShow(item.id)}
                          className="text-primary hover:bg-primary/10 flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-medium transition-colors"
                          title={`Unhide this ${noun}`}
                        >
                          <Eye size={12} />
                          Unhide
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onHide(item.id)}
                          className="text-muted-foreground hover:text-foreground hover:bg-muted flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] transition-colors"
                          title={`Hide this ${noun}`}
                        >
                          <EyeOff size={12} />
                          Hide
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() =>
                          confirmDelete(item.label, item.hasContent, () =>
                            onDelete(item.id),
                          )
                        }
                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 flex items-center gap-1 rounded p-1 transition-colors"
                        title={`Delete ${noun}`}
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
