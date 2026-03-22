import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import type { Editor } from "@tiptap/core";

interface EditorContextValue {
  activeEditor: Editor | null;
  setActiveEditor: (editor: Editor | null) => void;
}

const EditorContext = createContext<EditorContextValue | null>(null);

export function EditorProvider({ children }: { children: ReactNode }) {
  const [activeEditor, setActiveEditorState] = useState<Editor | null>(null);
  const setActiveEditor = useCallback((editor: Editor | null) => {
    setActiveEditorState(editor);
  }, []);
  return (
    <EditorContext.Provider value={{ activeEditor, setActiveEditor }}>
      {children}
    </EditorContext.Provider>
  );
}

export function useEditorContext() {
  const ctx = useContext(EditorContext);
  if (!ctx) throw new Error("useEditorContext must be used within EditorProvider");
  return ctx;
}
