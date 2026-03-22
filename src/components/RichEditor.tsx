// src/components/RichEditor.tsx
import { useEditor, EditorContent } from "@tiptap/react";
import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import Bold from "@tiptap/extension-bold";
import Italic from "@tiptap/extension-italic";
import Underline from "@tiptap/extension-underline";
import Strike from "@tiptap/extension-strike";
import Code from "@tiptap/extension-code";
import CodeBlock from "@tiptap/extension-code-block";
import Blockquote from "@tiptap/extension-blockquote";
import Heading from "@tiptap/extension-heading";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import ListItem from "@tiptap/extension-list-item";
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import History from "@tiptap/extension-history";
import TextStyle from "@tiptap/extension-text-style";
import FontFamily from "@tiptap/extension-font-family";
import { useEffect, useRef } from "react";
import { useEditorContext } from "../context/EditorContext";

// Re-exported for EditorToolbar
export const FONTS = [
  { label: "DM Sans", value: "DM Sans, sans-serif" },
  { label: "DM Mono", value: "DM Mono, monospace" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Verdana", value: "Verdana, sans-serif" },
  { label: "Courier New", value: "Courier New, monospace" },
  { label: "Palatino", value: "Palatino Linotype, serif" },
  { label: "Trebuchet", value: "Trebuchet MS, sans-serif" },
  { label: "Impact", value: "Impact, fantasy" },
];

interface Props {
  content: string;
  onChange: (html: string) => void;
}

export default function RichEditor({ content, onChange }: Props) {
  const suppressRef = useRef(false);
  const { setActiveEditor } = useEditorContext();

  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      Bold,
      Italic,
      Underline,
      Strike,
      Code,
      CodeBlock,
      Blockquote,
      Heading.configure({ levels: [1, 2, 3] }),
      BulletList,
      OrderedList,
      ListItem,
      HorizontalRule,
      History,
      TextStyle,
      FontFamily,
    ],
    content: content || "<p></p>",
    onUpdate({ editor }) {
      suppressRef.current = true;
      onChange(editor.getHTML());
      setTimeout(() => { suppressRef.current = false; }, 50);
    },
    editorProps: {
      attributes: {
        class: "focus:outline-none min-h-full px-3 py-2.5 text-[var(--text)]",
      },
    },
  });

  useEffect(() => {
    if (!editor || suppressRef.current) return;
    const current = editor.getHTML();
    if (current !== content) {
      editor.commands.setContent(content || "<p></p>", false);
    }
  }, [content, editor]);

  if (!editor) return null;

  return (
    <div
      className="flex flex-col h-full min-h-0"
      onFocusCapture={() => setActiveEditor(editor)}
    >
      <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0">
        <EditorContent editor={editor} className="h-full" />
      </div>
    </div>
  );
}
