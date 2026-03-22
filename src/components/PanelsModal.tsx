// src/components/PanelsModal.tsx
import { useEffect } from "react";
import { X, Plus, Eye, EyeOff } from "lucide-react";
import type { Panel } from "../types";
import { useModal } from "../context/ModalContext";

interface Props {
  canAddPanel: boolean;
  canUnhide: boolean;
  onAddPanel: () => void;
  panels: Panel[];
  onHidePanel: (panelId: string) => void;
  onUnhidePanel: (panelId: string) => void;
  onClose: () => void;
}

export default function PanelsModal({
  canAddPanel,
  canUnhide,
  onAddPanel,
  panels,
  onHidePanel,
  onUnhidePanel,
  onClose,
}: Props) {
  const { showAlert } = useModal();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleUnhide = (panelId: string) => {
    if (!canUnhide) {
      showAlert("Hide another panel first — max 3 visible panels.");
      return;
    }
    onUnhidePanel(panelId);
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="rounded-xl shadow-2xl w-72 overflow-hidden"
        style={{ background: "var(--panel-bg)", border: "1px solid var(--border)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "var(--border)" }}>
          <span className="text-sm font-semibold text-[var(--text)]">Panels</span>
          <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
            <X size={15} />
          </button>
        </div>
        <div className="p-4 space-y-4">
          {canAddPanel && (
            <button
              onClick={() => { onAddPanel(); onClose(); }}
              className="flex items-center gap-2 w-full px-3 py-2 rounded-lg border border-dashed text-sm transition-colors"
              style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
            >
              <Plus size={14} />
              Add panel (max 3)
            </button>
          )}
          {panels.length > 0 && (
            <div>
              <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider block mb-2">
                Panels
              </span>
              <div className="flex flex-col gap-1">
                {panels.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg select-none"
                    style={{ background: "var(--hover)" }}
                  >
                    <span className={`text-sm truncate pointer-events-none flex-1 ${p.hidden ? "text-[var(--text-muted)]" : "text-[var(--text)]"}`}>
                      {p.title}
                    </span>
                    {p.hidden ? (
                      <button
                        onClick={() => handleUnhide(p.id)}
                        className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors shrink-0 text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white"
                        title="Unhide this panel"
                      >
                        <Eye size={12} />
                        Unhide
                      </button>
                    ) : (
                      <button
                        onClick={() => onHidePanel(p.id)}
                        className="flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors shrink-0 text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--border)]"
                        title="Hide this panel"
                      >
                        <EyeOff size={12} />
                        Hide
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          {panels.length === 0 && !canAddPanel && (
            <p className="text-sm text-[var(--text-muted)]">No panel actions available.</p>
          )}
        </div>
      </div>
    </div>
  );
}
