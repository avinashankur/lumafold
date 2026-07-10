import { useEffect } from 'react';
import { X, Plus, Eye, EyeOff, Trash2 } from 'lucide-react';
import type { Panel } from '../types';
import { useModal } from '../context/ModalContext';

interface Props {
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

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

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
    <div
      className="fixed inset-0 z-60 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="w-72 overflow-hidden rounded-xl shadow-2xl"
        style={{
          background: 'var(--panel-bg)',
          border: '1px solid var(--border)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex items-center justify-between border-b px-4 py-3"
          style={{ borderColor: 'var(--border)' }}
        >
          <span className="text-sm font-semibold text-(--text)">Panels</span>
          <button
            onClick={onClose}
            className="text-(--text-muted) transition-colors hover:text-(--text)"
          >
            <X size={15} />
          </button>
        </div>
        <div className="space-y-4 p-4">
          {canAddPanel && (
            <button
              onClick={() => {
                onAddPanel();
                onClose();
              }}
              className="flex w-full items-center gap-2 rounded-lg border border-dashed px-3 py-2 text-sm transition-colors"
              style={{
                borderColor: 'var(--border)',
                color: 'var(--text-muted)',
              }}
            >
              <Plus size={14} />
              Add panel (max 3)
            </button>
          )}
          {panels.length > 0 && (
            <div>
              <span className="mb-2 block text-xs font-medium tracking-wider text-(--text-muted) uppercase">
                Panels
              </span>
              <div className="flex flex-col gap-1">
                {panels.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between gap-2 rounded-lg px-3 py-2 select-none"
                    style={{ background: 'var(--hover)' }}
                  >
                    <span
                      className={`pointer-events-none flex-1 truncate text-sm ${p.hidden ? 'text-(--text-muted)' : 'text-(--text)'}`}
                    >
                      {p.title}
                    </span>
                    <div className="flex shrink-0 items-center gap-1">
                      {p.hidden ? (
                        <button
                          onClick={() => handleUnhide(p.id)}
                          className="text-primary hover:bg-primary hover:text-primary-foreground flex items-center gap-1 rounded px-2 py-1 text-xs font-medium transition-colors"
                          title="Unhide this panel"
                        >
                          <Eye size={12} />
                          Unhide
                        </button>
                      ) : (
                        <button
                          onClick={() => onHidePanel(p.id)}
                          className="hover:bg-border flex items-center gap-1 rounded px-2 py-1 text-xs text-(--text-muted) transition-colors hover:text-(--text)"
                          title="Hide this panel"
                        >
                          <EyeOff size={12} />
                          Hide
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(p)}
                        className="flex items-center gap-1 rounded px-2 py-1 text-xs text-(--text-muted) transition-colors hover:bg-red-400/10 hover:text-red-400"
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
            <p className="text-sm text-(--text-muted)">
              No panel actions available.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
