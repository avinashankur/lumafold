# UltraFold Notes — Chrome Extension

A minimal, powerful notes app with folders, panels, and rich text editing.

## Setup

```bash
npm install
npm run build
```

Then in Chrome:
1. Go to `chrome://extensions`
2. Enable **Developer mode** (top right)
3. Click **Load unpacked**
4. Select the `dist/` folder

For development with hot reload:
```bash
npm run dev
```
Then load the project root (not dist) as an unpacked extension, or open `http://localhost:5173/popup.html`.

---

## Features

- **Folders** — unlimited, reorderable tabs with show/hide
- **Panels** — 1–3 per folder, drag to reorder
- **Rich text** — Tiptap editor with full formatting toolbar
- **Fonts** — 8 font options per panel
- **Dark/Light mode** — auto-detects OS preference
- **Accent colors** — 8 presets + custom picker
- **Auto-save** — debounced, stored in `chrome.storage.local`

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl+T` | New folder |
| `Ctrl+1-9` | Switch folder |
| `Ctrl+Shift+]` | Add panel |
| `Ctrl+Shift+L` | Toggle dark/light |
| `Ctrl+,` | Settings |
| `Ctrl+B/I/U` | Bold/Italic/Underline |
| `Ctrl+E` | Inline code |
| `Alt+Shift+N` | Open fullscreen tab |

## Project Structure

```
ultrafold-notes/
├── manifest.json          # Chrome MV3 manifest
├── background.js          # Service worker (fullscreen shortcut)
├── popup.html             # Extension popup entry point
├── src/
│   ├── main.tsx           # React entry
│   ├── App.tsx            # Root component + layout
│   ├── index.css          # Global styles + Tiptap prose
│   ├── types.ts           # TypeScript types
│   ├── hooks/
│   │   └── useStorage.ts  # All state + chrome.storage.local
│   └── components/
│       ├── TabBar.tsx     # Folder tabs
│       ├── Panel.tsx      # Single panel wrapper
│       ├── RichEditor.tsx # Tiptap editor + toolbar
│       └── Settings.tsx   # Theme settings overlay
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

## Iterating

All state lives in `useStorage.ts`. The data schema is:

```ts
{
  folders: [{ id, name, hidden, panels: [{ id, title, content }], panelWidths }],
  activeFolderId: string,
  theme: { mode: 'light'|'dark', accent: string }
}
```

Next steps you might want to add:
- Drag handles between panels for resizing width
- Export/import JSON backup
- Focus/distraction-free mode
- Markdown paste support
