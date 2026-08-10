import { useState, useRef } from 'react';
import { Plus, EyeOff, Trash2, Pencil } from 'lucide-react';
import { Folder } from '../types';
import { cn } from '../lib/utils';
import { useModal } from '../context/ModalContext';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';

interface Props {
  folders: Folder[];
  activeFolderId: string | null;
  onSelect: (id: string) => void;
  onAdd: () => void;
  onDelete: (id: string) => void;
  onRename: (id: string, name: string) => void;
  onHide: (id: string) => void;
  onReorder: (from: number, to: number) => void;
  showScrollBar: boolean;
}

function folderHasContent(folder: Folder): boolean {
  return folder.panels.some(
    (p) => p.content && p.content.replace(/<[^>]*>/g, '').trim() !== '',
  );
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
  showScrollBar,
}: Props) {
  const { showConfirm } = useModal();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
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

  const handleDelete = (folder: Folder) => {
    if (folderHasContent(folder)) {
      showConfirm(
        `Permanently delete "${folder.name}" and all its content?`,
        () => onDelete(folder.id),
        { confirmLabel: 'Delete', danger: true },
      );
    } else {
      onDelete(folder.id);
    }
  };

  // Only show visible folders in the tab bar
  const visibleFolders = folders.filter((f) => !f.hidden);

  return (
    <div
      className={cn(
        'flex items-center gap-x-1 overflow-x-auto overflow-y-hidden',
        !showScrollBar && 'scrollbar-none',
      )}
      style={{ minHeight: 36 }}
    >
      <div
        className={cn(
          'flex items-center gap-x-1 overflow-x-auto overflow-y-hidden',
          !showScrollBar && 'scrollbar-none',
        )}
      >
        {visibleFolders.map((folder, idx) => {
          const isActive = folder.id === activeFolderId;
          return (
            <ContextMenu key={folder.id}>
              <ContextMenuTrigger>
                <div
                  draggable
                  onDragStart={() => {
                    dragFrom.current = idx;
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOverIdx(idx);
                  }}
                  onDragEnd={() => {
                    dragFrom.current = null;
                    setDragOverIdx(null);
                  }}
                  onDrop={() => {
                    if (dragFrom.current !== null && dragFrom.current !== idx) {
                      onReorder(dragFrom.current, idx);
                    }
                    dragFrom.current = null;
                    setDragOverIdx(null);
                  }}
                  onClick={() => onSelect(folder.id)}
                  className={cn(
                    'group relative flex min-w-[100px] flex-shrink-0 cursor-pointer items-center justify-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors duration-100 select-none',
                    isActive
                      ? 'text-white'
                      : 'text-[var(--text-muted)] hover:bg-[var(--hover)] hover:text-[var(--text)]',
                    dragOverIdx === idx && 'ring-1 ring-[var(--primary)]',
                  )}
                  style={
                    isActive
                      ? {
                          background: 'var(--primary)',
                          color: 'var(--primary-foreground)',
                        }
                      : {}
                  }
                >
                  {editingId === folder.id ? (
                    <input
                      ref={inputRef}
                      value={draft}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => setDraft(e.target.value)}
                      onBlur={() => commitEdit(folder.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') commitEdit(folder.id);
                        if (e.key === 'Escape') setEditingId(null);
                      }}
                      className="w-20 border-b border-[var(--primary)] bg-transparent text-[var(--text)] outline-none"
                    />
                  ) : (
                    <span
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        startEdit(folder);
                      }}
                    >
                      {folder.name}
                    </span>
                  )}
                </div>
              </ContextMenuTrigger>
              <ContextMenuContent>
                <ContextMenuItem onClick={() => startEdit(folder)}>
                  <Pencil className="size-4" />
                  <span>Rename</span>
                </ContextMenuItem>
                <ContextMenuItem onClick={() => onHide(folder.id)}>
                  <EyeOff className="size-4" />
                  <span>Hide</span>
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem
                  variant="destructive"
                  onClick={() => handleDelete(folder)}
                >
                  <Trash2 className="size-4" />
                  <span>Delete</span>
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          );
        })}
      </div>

      {/* Add folder button */}
      <button
        onClick={onAdd}
        className="ml-0.5 flex flex-shrink-0 items-center gap-1 rounded-md px-2 py-1.5 text-xs text-[var(--text-muted)] transition-colors hover:bg-[var(--hover)] hover:text-[var(--primary)]"
        title="New Folder (Ctrl+T)"
      >
        <Plus size={12} />
        <span>New</span>
      </button>
    </div>
  );
}
