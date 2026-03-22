// src/components/TabBar.tsx
import { useState, useRef } from "react";
import { Plus, X, EyeOff } from "lucide-react";
import { Folder } from "../types";
import { useModal } from "../context/ModalContext";

interface Props {
  folders: Folder[];
  activeFolderId: string | null;
  onSelect: (id: string) => void;
  onAdd: () => void;
  onDelete: (id: string) => void;
  onRename: (id: string, name: string) => void;
  onHide: (id: string) => void;
  onReorder: (from: number, to: number) => void;
}

export default function TabBar({
  folders,
  activeFolderId,
  onSelect,
  onAdd,
  onDelete,
  onRename,
  onHide,
  onReorder,
}: Props) {
  const { showConfirm } = useModal();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const dragFrom = useRef<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  const startEdit = (folder: Folder) => {
    setEditingId(folder.id);
    setDraft(folder.name);
    setTimeout(() => inputRef.current?.select(), 0);
  };

  const commitEdit = (id: string) => {
    setEditingId(null);
    if (draft.trim()) onRename(id, draft.trim());
  };

  // Only show visible folders in the tab bar
  const visibleFolders = folders.filter((f) => !f.hidden);

  return (
    <div
      className="flex items-center gap-0.5 overflow-x-hidden"
      style={{ minHeight: 36 }}
    >
      {visibleFolders.map((folder, idx) => {
        const isActive = folder.id === activeFolderId;
        return (
          <div
            key={folder.id}
            draggable
            onDragStart={() => { dragFrom.current = idx; }}
            onDragOver={(e) => { e.preventDefault(); setDragOverIdx(idx); }}
            onDragEnd={() => { dragFrom.current = null; setDragOverIdx(null); }}
            onDrop={() => {
              if (dragFrom.current !== null && dragFrom.current !== idx) {
                onReorder(dragFrom.current, idx);
              }
              dragFrom.current = null;
              setDragOverIdx(null);
            }}
            onClick={() => onSelect(folder.id)}
            className={`
              group relative flex items-center gap-1 px-3 py-1.5 text-xs font-medium
              transition-colors duration-100 cursor-pointer select-none whitespace-nowrap flex-shrink-0
              rounded-md
              ${isActive
                ? "text-white"
                : "text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--hover)]"
              }
              ${dragOverIdx === idx ? "ring-1 ring-[var(--accent)]" : ""}
            `}
            style={isActive ? { background: "var(--accent)" } : {}}
          >
            {editingId === folder.id ? (
              <input
                ref={inputRef}
                value={draft}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={() => commitEdit(folder.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitEdit(folder.id);
                  if (e.key === "Escape") setEditingId(null);
                }}
                className="w-20 bg-transparent outline-none border-b border-[var(--accent)] text-[var(--text)]"
              />
            ) : (
              <span onDoubleClick={(e) => { e.stopPropagation(); startEdit(folder); }}>
                {folder.name}
              </span>
            )}

            {/* Hover actions — hide and delete */}
            <span className={`flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity ml-0.5 ${isActive ? "text-white/80 hover:text-white" : "text-[var(--text-muted)] hover:text-[var(--text)]"}`}>
              <button
                onClick={(e) => { e.stopPropagation(); onHide(folder.id); }}
                className="p-0.5 rounded text-inherit hover:text-inherit"
                title="Hide folder"
              >
                <EyeOff size={10} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const hasContent = folder.panels.some(
                    (p) => p.content && p.content.replace(/<[^>]*>/g, "").trim() !== ""
                  );
                  if (hasContent) {
                    showConfirm(
                      `Permanently delete "${folder.name}" and all its content?`,
                      () => onDelete(folder.id),
                      { confirmLabel: "Delete", danger: true }
                    );
                  } else {
                    onDelete(folder.id);
                  }
                }}
                className={`p-0.5 rounded ${isActive ? "text-inherit hover:text-red-200" : "text-[var(--text-muted)] hover:text-red-400"}`}
                title="Delete folder permanently"
              >
                <X size={10} />
              </button>
            </span>
          </div>
        );
      })}

      {/* Add folder button */}
      <button
        onClick={onAdd}
        className="flex items-center gap-1 px-2 py-1.5 rounded-md text-xs text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--hover)] transition-colors flex-shrink-0 ml-0.5"
        title="New Folder (Ctrl+T)"
      >
        <Plus size={12} />
        <span>New</span>
      </button>
    </div>
  );
}
