// src/components/FormatModal.tsx
import { useEffect } from "react";
import { X } from "lucide-react";
import { useEditorContext } from "../context/EditorContext";
import { FONTS } from "./RichEditor";
import {
  Bold as BoldIcon,
  Italic as ItalicIcon,
  Underline as UnderlineIcon,
  Strikethrough,
  Code as CodeIcon,
  CodeSquare,
  Quote,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Minus,
} from "lucide-react";

interface Props {
  onClose: () => void;
}

function Btn({
  active,
  onClick,
  title,
  children,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      title={title}
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
        active
          ? "bg-[var(--accent)] text-white"
          : "text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--hover)]"
      }`}
    >
      {children}
    </button>
  );
}

export default function FormatModal({ onClose }: Props) {
  const { activeEditor } = useEditorContext();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!activeEditor) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center" style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }} onClick={onClose}>
        <div className="rounded-xl shadow-2xl p-6 max-w-xs text-center" style={{ background: "var(--panel-bg)", border: "1px solid var(--border)" }} onClick={(e) => e.stopPropagation()}>
          <p className="text-sm text-[var(--text-muted)]">Click in a panel first to format text.</p>
          <button onClick={onClose} className="mt-3 text-xs text-[var(--accent)] hover:underline">Close</button>
        </div>
      </div>
    );
  }

  const btn = (active: boolean, onClick: () => void, title: string, children: React.ReactNode) => (
    <Btn active={active} onClick={onClick} title={title}>
      {children}
    </Btn>
  );

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="rounded-xl shadow-2xl max-w-sm overflow-hidden max-h-[85vh] overflow-y-auto"
        style={{ background: "var(--panel-bg)", border: "1px solid var(--border)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b sticky top-0" style={{ borderColor: "var(--border)", background: "var(--panel-bg)" }}>
          <span className="text-sm font-semibold text-[var(--text)]">Format</span>
          <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
            <X size={15} />
          </button>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider block mb-2">Font</label>
            <select
              className="w-full text-sm bg-transparent border border-[var(--border)] rounded-lg px-3 py-2 cursor-pointer"
              onChange={(e) => activeEditor.chain().focus().setFontFamily(e.target.value).run()}
              value={FONTS.find((f) => activeEditor.isActive("textStyle", { fontFamily: f.value }))?.value ?? ""}
            >
              <option value="">Default</option>
              {FONTS.map((f) => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider block mb-2">Headings</label>
            <div className="flex flex-wrap gap-1">
              {btn(activeEditor.isActive("heading", { level: 1 }), () => activeEditor.chain().focus().toggleHeading({ level: 1 }).run(), "H1", <><Heading1 size={14} /> H1</>)}
              {btn(activeEditor.isActive("heading", { level: 2 }), () => activeEditor.chain().focus().toggleHeading({ level: 2 }).run(), "H2", <><Heading2 size={14} /> H2</>)}
              {btn(activeEditor.isActive("heading", { level: 3 }), () => activeEditor.chain().focus().toggleHeading({ level: 3 }).run(), "H3", <><Heading3 size={14} /> H3</>)}
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider block mb-2">Text style</label>
            <div className="flex flex-wrap gap-1">
              {btn(activeEditor.isActive("bold"), () => activeEditor.chain().focus().toggleBold().run(), "Bold", <BoldIcon size={14} />)}
              {btn(activeEditor.isActive("italic"), () => activeEditor.chain().focus().toggleItalic().run(), "Italic", <ItalicIcon size={14} />)}
              {btn(activeEditor.isActive("underline"), () => activeEditor.chain().focus().toggleUnderline().run(), "Underline", <UnderlineIcon size={14} />)}
              {btn(activeEditor.isActive("strike"), () => activeEditor.chain().focus().toggleStrike().run(), "Strike", <Strikethrough size={14} />)}
              {btn(activeEditor.isActive("code"), () => activeEditor.chain().focus().toggleCode().run(), "Code", <CodeIcon size={14} />)}
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider block mb-2">Blocks</label>
            <div className="flex flex-wrap gap-1">
              {btn(activeEditor.isActive("bulletList"), () => activeEditor.chain().focus().toggleBulletList().run(), "Bullet list", <List size={14} />)}
              {btn(activeEditor.isActive("orderedList"), () => activeEditor.chain().focus().toggleOrderedList().run(), "Numbered list", <ListOrdered size={14} />)}
              {btn(activeEditor.isActive("codeBlock"), () => activeEditor.chain().focus().toggleCodeBlock().run(), "Code block", <CodeSquare size={14} />)}
              {btn(activeEditor.isActive("blockquote"), () => activeEditor.chain().focus().toggleBlockquote().run(), "Quote", <Quote size={14} />)}
              <button
                onClick={() => { activeEditor.chain().focus().setHorizontalRule().run(); onClose(); }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--hover)] transition-colors"
                title="Horizontal rule"
              >
                <Minus size={14} /> Rule
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
