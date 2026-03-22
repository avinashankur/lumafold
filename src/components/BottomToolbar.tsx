// src/components/BottomToolbar.tsx
// Shown only in fullscreen (tab) mode: panel controls + editor format tools
import { useState } from "react";
import { useEditorContext } from "../context/EditorContext";
import { FONTS } from "./RichEditor";
import type { Panel } from "../types";
import { useModal } from "../context/ModalContext";
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
  Plus,
  Eye,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

interface Props {
  canAddPanel: boolean;
  canUnhide: boolean;
  onAddPanel: () => void;
  panels: Panel[];
  onUnhidePanel: (panelId: string) => void;
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
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      className={`p-1 rounded transition-colors ${
        active
          ? "bg-[var(--accent)] text-white"
          : "text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--hover)]"
      }`}
    >
      {children}
    </button>
  );
}

export default function BottomToolbar({
  canAddPanel,
  canUnhide,
  onAddPanel,
  panels,
  onUnhidePanel,
}: Props) {
  const { activeEditor } = useEditorContext();
  const { showAlert } = useModal();
  const [formatExpanded, setFormatExpanded] = useState(true);

  const handleUnhide = (panelId: string) => {
    if (!canUnhide) {
      showAlert("Hide another panel first — max 3 visible panels.");
      return;
    }
    onUnhidePanel(panelId);
  };

  const btn = (active: boolean, onClick: () => void, title: string, children: React.ReactNode) => (
    <Btn active={active} onClick={onClick} title={title}>
      {children}
    </Btn>
  );

  const formatTools = activeEditor && (
    <>
      <select
        className="text-xs bg-transparent text-[var(--text-muted)] border border-[var(--border)] rounded px-1 py-0.5 mr-0.5 cursor-pointer hover:border-[var(--accent)] transition-colors"
        onMouseDown={(e) => e.stopPropagation()}
        onChange={(e) => activeEditor.chain().focus().setFontFamily(e.target.value).run()}
        value={FONTS.find((f) => activeEditor.isActive("textStyle", { fontFamily: f.value }))?.value ?? ""}
      >
        <option value="">Default</option>
        {FONTS.map((f) => (
          <option key={f.value} value={f.value}>{f.label}</option>
        ))}
      </select>
      <div className="w-px h-3.5 bg-[var(--border)] mx-0.5" />
      {btn(activeEditor.isActive("heading", { level: 1 }), () => activeEditor.chain().focus().toggleHeading({ level: 1 }).run(), "H1", <Heading1 size={13} />)}
      {btn(activeEditor.isActive("heading", { level: 2 }), () => activeEditor.chain().focus().toggleHeading({ level: 2 }).run(), "H2", <Heading2 size={13} />)}
      {btn(activeEditor.isActive("heading", { level: 3 }), () => activeEditor.chain().focus().toggleHeading({ level: 3 }).run(), "H3", <Heading3 size={13} />)}
      <div className="w-px h-3.5 bg-[var(--border)] mx-0.5" />
      {btn(activeEditor.isActive("bold"), () => activeEditor.chain().focus().toggleBold().run(), "Bold", <BoldIcon size={13} />)}
      {btn(activeEditor.isActive("italic"), () => activeEditor.chain().focus().toggleItalic().run(), "Italic", <ItalicIcon size={13} />)}
      {btn(activeEditor.isActive("underline"), () => activeEditor.chain().focus().toggleUnderline().run(), "Underline", <UnderlineIcon size={13} />)}
      {btn(activeEditor.isActive("strike"), () => activeEditor.chain().focus().toggleStrike().run(), "Strike", <Strikethrough size={13} />)}
      <div className="w-px h-3.5 bg-[var(--border)] mx-0.5" />
      {btn(activeEditor.isActive("bulletList"), () => activeEditor.chain().focus().toggleBulletList().run(), "Bullet list", <List size={13} />)}
      {btn(activeEditor.isActive("orderedList"), () => activeEditor.chain().focus().toggleOrderedList().run(), "Numbered list", <ListOrdered size={13} />)}
      <div className="w-px h-3.5 bg-[var(--border)] mx-0.5" />
      {btn(activeEditor.isActive("code"), () => activeEditor.chain().focus().toggleCode().run(), "Code", <CodeIcon size={13} />)}
      {btn(activeEditor.isActive("codeBlock"), () => activeEditor.chain().focus().toggleCodeBlock().run(), "Code block", <CodeSquare size={13} />)}
      {btn(activeEditor.isActive("blockquote"), () => activeEditor.chain().focus().toggleBlockquote().run(), "Quote", <Quote size={13} />)}
      <div className="w-px h-3.5 bg-[var(--border)] mx-0.5" />
      <button
        title="Horizontal rule"
        onMouseDown={(e) => { e.preventDefault(); activeEditor.chain().focus().setHorizontalRule().run(); }}
        className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--hover)] transition-colors"
      >
        <Minus size={13} />
      </button>
    </>
  );

  return (
    <div
      className="flex-shrink-0 flex items-center gap-1 flex-wrap"
      style={{
        borderTop: "1px solid var(--border)",
        background: "var(--toolbar-bg)",
        padding: "4px 6px",
      }}
    >
      {/* Panel controls */}
      {canAddPanel && (
        <button
          onClick={onAddPanel}
          className="flex items-center gap-1 px-2 py-1 rounded border border-dashed text-xs transition-colors"
          style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
          title="Add panel"
        >
          <Plus size={12} />
          Panel
        </button>
      )}
      {panels.filter((p) => p.hidden).map((p) => (
        <button
          key={p.id}
          onClick={() => handleUnhide(p.id)}
          className="flex items-center gap-1 px-2 py-1 rounded border text-xs transition-colors"
          style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
          title={`Unhide ${p.title}`}
        >
          <Eye size={10} />
          {p.title}
        </button>
      ))}
      {(canAddPanel || panels.some((p) => p.hidden)) && (activeEditor && formatExpanded) && (
        <div className="w-px h-4 bg-[var(--border)]" />
      )}
      {/* Format tools */}
      {formatExpanded && formatTools && (
        <div className="flex-1 flex flex-wrap items-center gap-0.5 min-w-0">
          {formatTools}
        </div>
      )}
      {activeEditor && (
        <button
          onClick={() => setFormatExpanded((s) => !s)}
          className="p-1.5 rounded text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--hover)] transition-colors shrink-0"
          title={formatExpanded ? "Hide format tools" : "Show format tools"}
        >
          {formatExpanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </button>
      )}
    </div>
  );
}
