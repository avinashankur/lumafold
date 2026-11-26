import { useState, useRef, useMemo } from 'react';
import { EyeOff, GripVertical, Trash2 } from 'lucide-react';
import RichEditor from './RichEditor';
import { Panel as PanelType, AISettings } from '../types';
import type { AIResult } from '@/lib/ai/actions';
import { AICommandMenu } from './ai/AICommandMenu';
import { cn } from '@/lib/utils';
import { panelHasContent, plainText } from '@/lib/workspace';
import { useScrolling } from '@/hooks/useScrolling';
import { useConfirmDelete } from '@/hooks/useConfirmDelete';

interface Props {
  panel: PanelType;
  aiSettings: AISettings;
  onHide: () => void;
  onDelete: () => void;
  onRename: (title: string) => void;
  onContentChange: (content: string) => void;
  onAIAccept: (content: string) => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  isDragOver: boolean;
  showHeader: boolean;
  showPanelScrollBar: boolean;
}

export default function Panel({
  panel,
  aiSettings,
  onHide,
  onDelete,
  onRename,
  onContentChange,
  onAIAccept,
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
  const confirmDelete = useConfirmDelete();

  const wordCount = useMemo(() => {
    const text = plainText(panel.content ?? '');
    if (!text) return 0;
    return text.split(/\s+/).filter(Boolean).length;
  }, [panel.content]);

  const handleDelete = () =>
    confirmDelete(panel.title, panelHasContent(panel), onDelete);

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

  const handleAIAccept = (result: AIResult) => {
    if (result.kind === 'title') onRename(result.text);
    else onAIAccept(result.html);
  };

  return (
    <div
      className={cn(
        'group/panel relative flex h-full min-w-0 flex-1 flex-col overflow-hidden bg-[var(--panel-bg)] transition-all duration-120',
        isDragOver && 'z-10 ring-1 ring-[var(--accent)] ring-inset',
        !isScrolling && 'scrollbar-thumb-transparent',
        !showPanelScrollBar && 'scrollbar-thumb-transparent',
      )}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      {showHeader && (
        <div className="flex h-[34px] shrink-0 items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--panel-bg)] px-3.5">
          {/* Left: Drag grip & title */}
          <div className="flex min-w-0 items-center gap-2">
            <div
              draggable
              onDragStart={onDragStart}
              className="shrink-0 cursor-grab text-[var(--text-tertiary)] opacity-0 transition-opacity group-hover/panel:opacity-50 hover:text-[var(--accent)] hover:!opacity-100 active:cursor-grabbing"
              title="Drag to reorder column"
            >
              <GripVertical size={12} />
            </div>

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
                className="w-28 border-b border-[var(--accent)] bg-transparent text-[11px] font-semibold tracking-wider text-[var(--text-primary)] uppercase outline-none"
              />
            ) : (
              <span
                className="cursor-pointer truncate text-[11px] font-semibold tracking-wider text-[var(--text-secondary)] uppercase transition-colors select-none hover:text-[var(--text-primary)]"
                onDoubleClick={startEdit}
                title="Double-click to rename"
              >
                {panel.title}
              </span>
            )}
          </div>

          {/* Right: Word count & Actions */}
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-[var(--text-tertiary)] select-none">
              {wordCount} {wordCount === 1 ? 'word' : 'words'}
            </span>

            <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover/panel:opacity-100">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onHide();
                }}
                className="flex h-5 w-5 items-center justify-center rounded text-[var(--text-tertiary)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
                title="Hide panel (content is preserved)"
                aria-label="Hide panel"
              >
                <EyeOff size={11} />
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete();
                }}
                className="flex h-5 w-5 items-center justify-center rounded text-[var(--text-tertiary)] transition-colors hover:bg-[var(--surface-hover)] hover:text-red-400"
                title="Delete panel"
                aria-label="Delete panel"
              >
                <Trash2 size={11} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Editor — wrapped in AICommandMenu for right-click AI access */}
      <div className="relative min-h-0 flex-1 overflow-hidden">
        <AICommandMenu
          panelContent={panel.content}
          aiSettings={aiSettings}
          onAccept={handleAIAccept}
        >
          <RichEditor content={panel.content} onChange={onContentChange} />
        </AICommandMenu>
      </div>
    </div>
  );
}
