export const SITE_CONFIG = {
  name: 'Lumafold',
  tagline: 'Multi-panel browser notes with built-in AI',
  repoUrl: 'https://github.com/avinashankur/lumafold',
  issuesUrl: 'https://github.com/avinashankur/lumafold/issues',
  releasesUrl: 'https://github.com/avinashankur/lumafold/releases',
  // Set these URLs once your extension listings are published.
  chromeWebStoreUrl: null as string | null,
  firefoxAddonsUrl: null as string | null,
  // Replace with your preferred contact email before store submission.
  supportEmail: 'support@lumafold.app',
  privacyUpdatedAt: 'November 26, 2026',
} as const;

export interface ShortcutItem {
  keys: string[];
  action: string;
  scope: 'In-app' | 'Browser';
}

export const SHORTCUTS: readonly ShortcutItem[] = [
  {
    keys: ['Alt', 'X'],
    action: 'Open Lumafold toolbar popup (customizable)',
    scope: 'Browser',
  },
  {
    keys: ['Alt', 'Shift', 'X'],
    action: 'Open Lumafold in a full tab (customizable)',
    scope: 'Browser',
  },
  { keys: ['Ctrl', 'T'], action: 'Create a new folder', scope: 'In-app' },
  {
    keys: ['Ctrl', '1–9'],
    action: 'Switch to visible folder by index',
    scope: 'In-app',
  },
  {
    keys: ['Ctrl', 'Shift', ']'],
    action: 'Add a panel to the active folder',
    scope: 'In-app',
  },
  {
    keys: ['Ctrl', 'Shift', 'A'],
    action: 'Open AI actions in focused panel',
    scope: 'In-app',
  },
  {
    keys: ['Ctrl', 'Shift', 'L'],
    action: 'Toggle light and dark mode',
    scope: 'In-app',
  },
  { keys: ['Ctrl', ','], action: 'Open or close Settings', scope: 'In-app' },
];

export interface AIActionSummary {
  id: 'rewrite' | 'organize' | 'format' | 'summarize' | 'title';
  label: string;
  description: string;
}

export const AI_ACTIONS: readonly AIActionSummary[] = [
  {
    id: 'rewrite',
    label: 'Rewrite',
    description: 'Fix grammar and improve clarity',
  },
  {
    id: 'organize',
    label: 'Organize',
    description: 'Sort and group bullet points',
  },
  { id: 'format', label: 'Format', description: 'Add headings and hierarchy' },
  {
    id: 'summarize',
    label: 'Summarize',
    description: 'Condense to key bullet points',
  },
  {
    id: 'title',
    label: 'Generate Title',
    description: 'Suggest a title for the panel',
  },
];
