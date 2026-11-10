// src/components/RichEditor.tsx
import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
import { EDITOR_EXTENSIONS } from './editor-extensions';
import { useEffect, useRef } from 'react';
import {
  Bold as BoldIcon,
  Italic as ItalicIcon,
  Underline as UnderlineIcon,
  Strikethrough as StrikeIcon,
  Code as CodeIcon,
  Heading1,
  Heading2,
  List as ListIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  content: string;
  onChange: (html: string) => void;
}

export default function RichEditor({ content, onChange }: Props) {
  const suppressRef = useRef(false);

  const editor = useEditor({
    extensions: EDITOR_EXTENSIONS,
    content: content || '<p></p>',
    onUpdate({ editor }) {
      suppressRef.current = true;
      onChange(editor.getHTML());
      setTimeout(() => {
        suppressRef.current = false;
      }, 50);
    },
    editorProps: {
      attributes: {
        class:
          'focus:outline-none min-h-full px-4 py-3 text-[var(--text-primary)]',
      },
    },
  });

  useEffect(() => {
    if (!editor || suppressRef.current) return;
    const current = editor.getHTML();
    if (current !== content) {
      editor.commands.setContent(content || '<p></p>', false);
    }
  }, [content, editor]);

  if (!editor) return null;

  return (
    <div className="flex h-full min-h-0 flex-col">
      {editor && (
        <BubbleMenu
          editor={editor}
          tippyOptions={{ duration: 120 }}
          className="flex items-center gap-0.5 rounded-md border border-[var(--border-active)] bg-[var(--surface-2)] p-1 shadow-xl backdrop-blur-md"
        >
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={cn(
              'flex h-6 w-6 items-center justify-center rounded text-xs transition-colors',
              editor.isActive('bold')
                ? 'bg-[var(--accent-tint)] text-[var(--accent)]'
                : 'text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]',
            )}
            title="Bold (Ctrl+B)"
          >
            <BoldIcon size={12} />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={cn(
              'flex h-6 w-6 items-center justify-center rounded text-xs transition-colors',
              editor.isActive('italic')
                ? 'bg-[var(--accent-tint)] text-[var(--accent)]'
                : 'text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]',
            )}
            title="Italic (Ctrl+I)"
          >
            <ItalicIcon size={12} />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={cn(
              'flex h-6 w-6 items-center justify-center rounded text-xs transition-colors',
              editor.isActive('underline')
                ? 'bg-[var(--accent-tint)] text-[var(--accent)]'
                : 'text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]',
            )}
            title="Underline (Ctrl+U)"
          >
            <UnderlineIcon size={12} />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={cn(
              'flex h-6 w-6 items-center justify-center rounded text-xs transition-colors',
              editor.isActive('strike')
                ? 'bg-[var(--accent-tint)] text-[var(--accent)]'
                : 'text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]',
            )}
            title="Strikethrough"
          >
            <StrikeIcon size={12} />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={cn(
              'flex h-6 w-6 items-center justify-center rounded text-xs transition-colors',
              editor.isActive('code')
                ? 'bg-[var(--accent-tint)] text-[var(--accent)]'
                : 'text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]',
            )}
            title="Inline Code"
          >
            <CodeIcon size={12} />
          </button>

          <div className="mx-0.5 h-3.5 w-px bg-[var(--border-subtle)]" />

          <button
            type="button"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
            className={cn(
              'flex h-6 w-6 items-center justify-center rounded text-xs transition-colors',
              editor.isActive('heading', { level: 1 })
                ? 'bg-[var(--accent-tint)] text-[var(--accent)]'
                : 'text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]',
            )}
            title="Heading 1"
          >
            <Heading1 size={12} />
          </button>

          <button
            type="button"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            className={cn(
              'flex h-6 w-6 items-center justify-center rounded text-xs transition-colors',
              editor.isActive('heading', { level: 2 })
                ? 'bg-[var(--accent-tint)] text-[var(--accent)]'
                : 'text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]',
            )}
            title="Heading 2"
          >
            <Heading2 size={12} />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={cn(
              'flex h-6 w-6 items-center justify-center rounded text-xs transition-colors',
              editor.isActive('bulletList')
                ? 'bg-[var(--accent-tint)] text-[var(--accent)]'
                : 'text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]',
            )}
            title="Bullet List"
          >
            <ListIcon size={12} />
          </button>
        </BubbleMenu>
      )}

      <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto">
        <EditorContent editor={editor} className="h-full" />
      </div>
    </div>
  );
}
