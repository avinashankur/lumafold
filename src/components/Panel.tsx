import { useState, useRef } from 'react';
import { EyeOff, GripVertical, Trash2 } from 'lucide-react';
import RichEditor from './RichEditor';
import { Panel as PanelType } from '../types';
import { cn } from '@/lib/utils';
import { useScrolling } from '@/hooks/useScrolling';
import { useModal } from '../context/ModalContext';

interface Props {
  panel: PanelType;
  onHide: () => void;
  onDelete: () => void;
  onRename: (title: string) => void;
  onContentChange: (content: string) => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  isDragOver: boolean;
  showHeader: boolean;
  showPanelScrollBar: boolean;
}

export default function Panel({
  panel,
  onHide,
  onDelete,
  onRename,
  onContentChange,
  onDragStart,
  onDragOver,
  onDrop,
  isDragOver,
  showHeader,
  showPanelScrollBar,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(panel.title);
  const inputRef = useRef<HTMLInputElement>(null);
  const { showConfirm } = useModal();

  const handleDelete = () => {
    const hasContent =
      panel.content && panel.content.replace(/<[^>]*>/g, '').trim() !== '';
    if (hasContent) {
      showConfirm(
        `Permanently delete "${panel.title}" and its content?`,
        onDelete,
        { confirmLabel: 'Delete', danger: true },
      );
    } else {
      onDelete();
    }
  };

  const startEdit = () => {
    setDraft(panel.title);
    setEditing(true);
    setTimeout(() => inputRef.current?.select(), 0);
  };

  const commitEdit = () => {
    setEditing(false);
    if (draft.trim()) onRename(draft.trim());
  };

  const isScrolling = useScrolling();

  return (
    <div
      className={cn(
        `flex h-full min-w-0 flex-col overflow-hidden rounded-lg transition-all duration-100`,
        isDragOver ? 'ring-primary ring-2' : '',
        !isScrolling && 'scrollbar-thumb-transparent',
        !showPanelScrollBar && 'scrollbar-thumb-transparent',
      )}
      style={{
        background: 'var(--panel-bg)',
        border: '1px solid var(--border)',
      }}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      {showHeader && (
        <div
          className="group flex shrink-0 items-center gap-1.5 px-2.5 py-1.5"
          style={{
            background: 'var(--panel-header-bg)',
            borderBottom: '1px solid var(--border)',
          }}
        >
          {/* Drag handle */}
          <div
            draggable
            onDragStart={onDragStart}
            className="shrink-0 cursor-grab text-(--text-muted) opacity-0 transition-opacity group-hover:opacity-40 active:cursor-grabbing"
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
                if (e.key === 'Enter') commitEdit();
                if (e.key === 'Escape') setEditing(false);
              }}
              className="border-primary flex-1 border-b bg-transparent text-xs font-medium text-(--text) outline-none"
            />
          ) : (
            <span
              className="flex-1 cursor-pointer truncate text-xs font-medium text-(--text-muted) select-none"
              onDoubleClick={startEdit}
              title="Double-click to rename"
            >
              {panel.title}
            </span>
          )}

          {/* Hide button — always present on hover, hides panel (data preserved) */}
          <button
            onClick={onHide}
            className="shrink-0 text-(--text-muted) opacity-0 transition-all group-hover:opacity-60 hover:text-(--text) hover:opacity-100!"
            title="Hide panel (data is preserved)"
          >
            <EyeOff size={12} />
          </button>

          {/* Delete button — permanently deletes panel */}
          <button
            onClick={handleDelete}
            className="shrink-0 text-(--text-muted) opacity-0 transition-all group-hover:opacity-60 hover:text-red-400 hover:opacity-100!"
            title="Delete panel"
          >
            <Trash2 size={12} />
          </button>
        </div>
      )}

      {/* Editor — fills remaining space */}
      <div className="min-h-0 flex-1 overflow-hidden">
        <RichEditor content={panel.content} onChange={onContentChange} />
      </div>
    </div>
  );
}
