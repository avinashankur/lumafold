// src/components/Panel.tsx
import { useState, useRef } from "react";
import { EyeOff, GripVertical } from "lucide-react";
import RichEditor from "./RichEditor";
import { Panel as PanelType } from "../types";

interface Props {
  panel: PanelType;
  onHide: () => void;
  onRename: (title: string) => void;
  onContentChange: (content: string) => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  isDragOver: boolean;
}

export default function Panel({
  panel,
  onHide,
  onRename,
  onContentChange,
  onDragStart,
  onDragOver,
  onDrop,
  isDragOver,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(panel.title);
  const inputRef = useRef<HTMLInputElement>(null);

  const startEdit = () => {
    setDraft(panel.title);
    setEditing(true);
    setTimeout(() => inputRef.current?.select(), 0);
  };

  const commitEdit = () => {
    setEditing(false);
    if (draft.trim()) onRename(draft.trim());
  };

  return (
    <div
      className={`flex flex-col h-full min-w-0 rounded-lg overflow-hidden transition-all duration-100 ${
        isDragOver ? "ring-2 ring-[var(--accent)]" : ""
      }`}
      style={{
        background: "var(--panel-bg)",
        border: "1px solid var(--border)",
      }}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      {/* Panel header */}
      <div
        className="flex items-center gap-1.5 px-2.5 py-1.5 flex-shrink-0 group"
        style={{
          background: "var(--panel-header-bg)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        {/* Drag handle */}
        <div
          draggable
          onDragStart={onDragStart}
          className="cursor-grab text-[var(--text-muted)] opacity-0 group-hover:opacity-40 transition-opacity active:cursor-grabbing flex-shrink-0"
        >
          <GripVertical size={13} />
        </div>

        {/* Title */}
        {editing ? (
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitEdit();
              if (e.key === "Escape") setEditing(false);
            }}
            className="flex-1 text-xs font-medium bg-transparent outline-none border-b border-[var(--accent)] text-[var(--text)]"
          />
        ) : (
          <span
            className="flex-1 text-xs font-medium text-[var(--text-muted)] cursor-pointer select-none truncate"
            onDoubleClick={startEdit}
            title="Double-click to rename"
          >
            {panel.title}
          </span>
        )}

        {/* Hide button — always present on hover, hides panel (data preserved) */}
        <button
          onClick={onHide}
          className="opacity-0 group-hover:opacity-60 hover:!opacity-100 text-[var(--text-muted)] hover:text-[var(--text)] transition-all flex-shrink-0"
          title="Hide panel (data is preserved)"
        >
          <EyeOff size={12} />
        </button>
      </div>

      {/* Editor — fills remaining space */}
      <div className="flex-1 overflow-hidden min-h-0">
        <RichEditor content={panel.content} onChange={onContentChange} />
      </div>
    </div>
  );
}
