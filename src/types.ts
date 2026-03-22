// src/types.ts

export interface Panel {
  id: string;
  title: string;
  content: string; // TipTap HTML content
  hidden: boolean; // panels are hidden, never deleted
}

export interface Folder {
  id: string;
  name: string;
  hidden: boolean; // folders are hidden, removed from tab bar
  panels: Panel[];
  panelWidths: number[]; // percentages, e.g. [33, 33, 34]
}

export interface ThemeSettings {
  mode: "light" | "dark";
  accent: string; // hex color
  fontSize: number; // px, applies to all editors (12–16)
}

export interface AppState {
  folders: Folder[];
  activeFolderId: string | null;
  theme: ThemeSettings;
}
