# Lumafold

Lumafold is a Chrome extension for structured note-taking. It organizes notes into folders, supports multiple panels per folder, and uses a rich text editor for long-form writing and quick capture.

It runs as the browser extension popup and can also open in a full-size tab for a larger workspace.

## Features

- Folder-based organization with drag-and-drop tab reordering.
- Up to 3 visible panels per folder, with hide and unhide features.
- Rich text editing powered by Tiptap, including headings, lists, code, blockquotes, and font family controls.
- Light and dark appearance settings, font size controls, and panel/tab-bar preferences.
- Automatic persistence to Chrome storage, with a localStorage fallback when the extension APIs are unavailable.
- Import and export of the full app state from the Settings screen.
- Keyboard shortcuts for common actions and a browser command to open the app in a full tab.

## Requirements

- Node.js 18 or newer is recommended.
- Google Chrome or another Chromium-based browser with Manifest V3 support.

## Setup

Install dependencies:

```bash
npm install
```

Build the extension:

```bash
npm run build
```

Load it in Chrome:

1. Open `chrome://extensions`.
2. Enable Developer mode.
3. Click Load unpacked.
4. Select the `dist` folder.

## Development

Run the Vite dev server:

```bash
npm run dev
```

For browser-only development, open `http://localhost:5173/`.

If you want to test the extension in Chrome, build first and load the generated `dist` folder as an unpacked extension.

## Scripts

- `npm run dev` - start the Vite dev server
- `npm run build` - type-check with `tsc` and build production assets with Vite
- `npm run preview` - preview the production build locally
- `npm run lint` - run ESLint
- `npm run lint:fix` - run ESLint with autofix
- `npm run type-check` - run TypeScript without emitting files
- `npm run format` - format the codebase with Prettier
- `npm run format:check` - verify formatting without writing files
- `npm run check` - run linting and type-checking

## Keyboard Shortcuts

### In-app shortcuts

| Shortcut                  | Action                              |
| ------------------------- | ----------------------------------- |
| `Ctrl+T`                  | Create a new folder                 |
| `Ctrl+1` through `Ctrl+9` | Switch to a visible folder by index |
| `Ctrl+Shift+]`            | Add a panel to the active folder    |
| `Ctrl+Shift+L`            | Toggle light and dark mode          |
| `Ctrl+,`                  | Open or close Settings              |

### Chrome command

| Shortcut      | Action                      |
| ------------- | --------------------------- |
| `Alt+Shift+N` | Open Lumafold in a full tab |

You can change the Chrome command at `chrome://extensions/shortcuts`.

## Data Model

Lumafold stores a single `appState` object in `chrome.storage.local` when running as an extension. In web fallback mode, it uses `localStorage` with the key `ultrafold_state`.

The stored state includes folders, panels, theme settings, and preferences. Panel content is saved as Tiptap HTML.

Important behavior:

- Hidden folders and panels are preserved and can be restored later.
- Deleting a folder removes it permanently.
- Imported JSON is validated and migrated before it replaces the current state.
- Legacy data is migrated on load so older saved states continue to work.

## App Layout

Lumafold supports two display modes:

- Popup mode: the default extension popup layout.
- Tab mode: a full-page editor opened from the toolbar or the browser command.

`public/init.js` sets the mode early to reduce layout flashes before React mounts.

## Project Structure

```text
lumafold/
├─ manifest.json        # MV3 manifest, permissions, and command bindings
├─ background.js        # Service worker for the fullscreen command
├─ index.html           # Extension entry page
├─ public/
│  └─ init.js           # Early bootstrap script
├─ src/
│  ├─ App.tsx           # App provider wrapper
│  ├─ main.tsx          # React entry point
│  ├─ types.ts          # Shared app state types
│  ├─ hooks/
│  │  └─ useStorage.ts  # Load, save, migrate, and update state
│  ├─ components/
│  │  ├─ LumafoldApp.tsx
│  │  ├─ TabBar.tsx
│  │  ├─ Panel.tsx
│  │  ├─ RichEditor.tsx
│  │  ├─ Settings.tsx
│  │  ├─ FoldersModal.tsx
│  │  ├─ PanelsModal.tsx
│  │  ├─ FormatModal.tsx
│  │  └─ BottomToolbar.tsx
│  ├─ context/
│  ├─ providers/
│  └─ lib/
├─ icons/
├─ dist/                # Production build output
└─ package.json
```

## Permissions

From `manifest.json`:

- `storage` - persist notes and settings
- `tabs` - open Lumafold in a full tab

## Troubleshooting

- If changes do not show up in Chrome, rebuild the project and reload the unpacked extension.
- If a shortcut conflicts with the browser or OS, change it in `chrome://extensions/shortcuts`.
- If imported data is rejected, make sure it was exported from Lumafold and still contains a `folders` array.

## License

No explicit license file is included in this repository.
