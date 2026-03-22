# Lumafold

Lumafold is a Chrome extension for structured note-taking with folders, multi-panel layouts, and a rich text editor.

It runs as a popup and can also open in a full browser tab for a larger workspace.

## Highlights

- Folder-based organization with drag-to-reorder tabs.
- 1 to 3 visible panels per folder (hide/unhide without losing data).
- Rich text editing powered by Tiptap (headings, lists, code, quotes, hr, font family).
- Light/Dark mode, accent color selection, and adjustable editor font size.
- Auto-save to `chrome.storage.local` (or `localStorage` when running outside extension context).
- Import/export full app state as JSON.
- Fullscreen tab support from toolbar button and keyboard command.

## Tech Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS
- Chrome Extension Manifest V3
- Tiptap editor extensions

## Quick Start

### 1) Install dependencies

```bash
npm install
```

### 2) Build the extension

```bash
npm run build
```

### 3) Load in Chrome

1. Open `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select the `dist` folder

## Development

Start Vite dev server:

```bash
npm run dev
```

Then either:

- Open `http://localhost:5173/popup.html` in the browser, or
- Load the project root as unpacked extension for development workflows.

## Scripts

- `npm run dev` — start dev server
- `npm run build` — type-check (`tsc`) and production build via Vite
- `npm run preview` — preview production build

## Keyboard Shortcuts

### App shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl+T` | Create new folder |
| `Ctrl+1...9` | Switch to visible folder by index |
| `Ctrl+Shift+]` | Add panel in active folder |
| `Ctrl+Shift+L` | Toggle light/dark mode |
| `Ctrl+,` | Open/close settings |

### Chrome command

| Shortcut | Action |
|---|---|
| `Alt+Shift+N` | Open Lumafold in a full tab (`open-fullscreen`) |

You can customize extension commands at `chrome://extensions/shortcuts`.

## How Data Works

Lumafold stores one state object (`appState`) with folders, panels, and theme settings.

- In extension mode: persisted via `chrome.storage.local`.
- In web/dev fallback mode: persisted via `localStorage` key `ultrafold_state`.

`Panel.content` is stored as Tiptap HTML.

### State shape

```ts
interface AppState {
  folders: Folder[];
  activeFolderId: string | null;
  theme: {
    mode: "light" | "dark";
    accent: string;
    fontSize: number;
  };
}
```

### Important behavior

- Hiding folders/panels preserves content; it does not delete.
- Deleting a folder is permanent and can trigger a confirmation when content exists.
- Max visible panels per folder is 3.
- Imported JSON is validated/migrated before replacing current state.

## UX Modes

Lumafold adapts to two display modes:

- **Popup mode**: constrained extension window (targeted to 800x600 layout).
- **Tab mode**: full viewport editor with bottom formatting toolbar.

`public/init.js` sets mode early to reduce layout flashes before React mounts.

## Project Structure

```text
lumafold/
├─ manifest.json                 # MV3 manifest, permissions, command bindings
├─ background.js                 # Service worker (handles open-fullscreen command)
├─ popup.html                    # Extension entry HTML
├─ public/
│  └─ init.js                    # Early mode/bootstrap script
├─ src/
│  ├─ App.tsx                    # Main shell, top bar, modals, keyboard handlers
│  ├─ main.tsx                   # React entrypoint
│  ├─ types.ts                   # AppState / Folder / Panel / Theme types
│  ├─ hooks/
│  │  └─ useStorage.ts           # Load/save/migrations + all state actions
│  ├─ components/
│  │  ├─ TabBar.tsx              # Folder tabs + rename/hide/delete/reorder
│  │  ├─ Panel.tsx               # Panel wrapper + title edit + hide + drag target
│  │  ├─ RichEditor.tsx          # Tiptap editor instance
│  │  ├─ Settings.tsx            # Theme + import/export controls
│  │  ├─ FoldersModal.tsx        # Folder manager
│  │  ├─ PanelsModal.tsx         # Panel manager
│  │  ├─ FormatModal.tsx         # Formatting controls modal
│  │  └─ BottomToolbar.tsx       # Fullscreen toolbar
│  └─ context/                   # Modal + active editor context
├─ vite.config.ts
└─ package.json
```

## Permissions

From `manifest.json`:

- `storage` — persist notes/settings
- `tabs` — open Lumafold in full tab

## Troubleshooting

- If updates do not appear, rebuild (`npm run build`) and re-load the extension in `chrome://extensions`.
- If keyboard command conflicts with OS/browser bindings, change it in `chrome://extensions/shortcuts`.
- If imported data seems invalid, verify the JSON came from Lumafold export and includes `folders` array.

## License

No explicit license file is currently included in this repository.
