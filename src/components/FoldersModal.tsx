// src/components/FoldersModal.tsx
import { useEffect } from "react";
import { X, Plus, Eye, EyeOff, Trash2 } from "lucide-react";
import type { Folder } from "../types";
import { useModal } from "../context/ModalContext";

interface Props {
  folders: Folder[];
  onAddFolder: () => void;
  onHideFolder: (id: string) => void;
  onUnhideFolder: (id: string) => void;
  onDeleteFolder: (id: string) => void;
  onClose: () => void;
}

function folderHasContent(folder: Folder): boolean {
  return folder.panels.some(
    (p) => p.content && p.content.replace(/<[^>]*>/g, "").trim() !== ""
  );
}

export default function FoldersModal({
  folders,
  onAddFolder,
  onHideFolder,
  onUnhideFolder,
  onDeleteFolder,
  onClose,
}: Props) {
  const { showConfirm } = useModal();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleDelete = (folder: Folder) => {
    if (folderHasContent(folder)) {
      showConfirm(
        `Permanently delete "${folder.name}" and all its content?`,
        () => onDeleteFolder(folder.id),
        { confirmLabel: "Delete", danger: true }
      );
    } else {
      onDeleteFolder(folder.id);
    }
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
          <span className="text-sm font-semibold text-[var(--text)]">Folders</span>
          <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
            <X size={15} />
          </button>
        </div>
        <div className="p-4 space-y-4">
          <button
            onClick={() => {
              onAddFolder();
              onClose();
            }}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg border border-dashed text-sm transition-colors"
            style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
          >
            <Plus size={14} />
            Add folder
          </button>
          {folders.length > 0 && (
            <div>
              <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider block mb-2">
                Folders
              </span>
              <div className="flex flex-col gap-1">
                {folders.map((f) => (
                  <div
                    key={f.id}
                    className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg select-none"
                    style={{ background: "var(--hover)" }}
                  >
                    <span
                      className={`text-sm truncate pointer-events-none flex-1 ${
                        f.hidden ? "text-[var(--text-muted)]" : "text-[var(--text)]"
                      }`}
                    >
                      {f.name}
                    </span>
                    <div className="flex items-center gap-1 shrink-0">
                      {f.hidden ? (
                        <button
                          onClick={() => onUnhideFolder(f.id)}
                          className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white"
                          title="Unhide this folder"
                        >
                          <Eye size={12} />
                          Unhide
                        </button>
                      ) : (
                        <button
                          onClick={() => onHideFolder(f.id)}
                          className="flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--border)]"
                          title="Hide this folder"
                        >
                          <EyeOff size={12} />
                          Hide
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(f)}
                        className="flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors text-[var(--text-muted)] hover:text-red-400 hover:bg-red-400/10"
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
      </div>
    </div>
  );
}
