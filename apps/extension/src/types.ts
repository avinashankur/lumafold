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
  panelWidths: number[]; // percentages, one per visible panel; read via panelWidths()
}

export type AccentColor =
  'amber' | 'iris' | 'emerald' | 'sapphire' | 'rose' | 'monochrome';

export interface ThemeSettings {
  fontSize: number; // px, applies to all editors (12–18)
  accentColor: AccentColor;
}

export interface PreferencesSettingTypes {
  showPanelHeaders: boolean;
  showTabBarScrollBar: boolean;
  showPanelScrollBar: boolean;
}

export type AIProvider = 'gemini' | 'openai' | 'custom';

export interface AISettings {
  provider: AIProvider | '';
  apiKey: string;
  model: string;
  customBaseURL: string;
}

// All folders plus which one is active. Rules live in lib/workspace.ts.
export interface Workspace {
  folders: Folder[];
  activeFolderId: string | null; // always a visible folder, or null
}

export interface AppState extends Workspace {
  theme: ThemeSettings;
  preferences: PreferencesSettingTypes;
  ai: AISettings;
}
