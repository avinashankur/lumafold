# Lumafold

Lumafold combines multi-panel note-taking with built-in AI directly in your browser. Organize ideas across folders, write side by side, and let AI instantly summarize, rewrite, and structure your messy thoughts.

From quick popup captures to a full-screen workspace, clarity is always one shortcut away.

## Features

- Folder-based organization with drag-and-drop tab reordering.
- Up to 3 visible panels per folder, with hide and unhide features.
- Built-in AI assistant to rewrite, format, organize, summarize, and generate panel titles.
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
npm run build:ext
```

Load it in Chrome:

1. Open `chrome://extensions`.
2. Enable Developer mode.
3. Click Load unpacked.
4. Select the `apps/extension/dist` folder.

## Development

Run the extension Vite dev server:

```bash
npm run dev:ext
```

Run the landing site Vite dev server:

```bash
npm run dev:landing
```

For browser-only development, open `http://localhost:5173/`.

If you want to test the extension in Chrome, build first and load the generated `apps/extension/dist` folder as an unpacked extension.

## Scripts

- `npm run dev` / `npm run dev:ext` - start the extension Vite dev server
- `npm run dev:landing` - start the landing site Vite dev server
- `npm run build` - build both the extension and landing site
- `npm run build:ext` - type-check and build the extension into `apps/extension/dist`
- `npm run build:landing` - type-check and build the landing site into `apps/landing/dist`
- `npm run preview:ext` / `npm run preview:landing` - preview production builds locally
- `npm run lint` - run ESLint across all workspaces
- `npm run lint:fix` - run ESLint with autofix
- `npm run type-check` - run TypeScript without emitting files across all workspaces
- `npm test` - run extension unit tests
- `npm run format` - format the codebase with Prettier
- `npm run format:check` - verify formatting without writing files
- `npm run check` - run linting and type-checking across all workspaces

## Keyboard Shortcuts

### In-app shortcuts

| Shortcut                  | Action                              |
| ------------------------- | ----------------------------------- |
| `Ctrl+T`                  | Create a new folder                 |
| `Ctrl+1` through `Ctrl+9` | Switch to a visible folder by index |
| `Ctrl+Shift+]`            | Add a panel to the active folder    |
| `Ctrl+Shift+L`            | Toggle light and dark mode          |
| `Ctrl+,`                  | Open or close Settings              |

### Browser commands

| Shortcut      | Action                      |
| ------------- | --------------------------- |
| `Alt+X`       | Open Lumafold toolbar popup |
| `Alt+Shift+X` | Open Lumafold in a full tab |

You can customize these shortcuts at `chrome://extensions/shortcuts` (or `about:addons` in Firefox).

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
├─ package.json            # npm workspaces coordinator & shared lint/format scripts
└─ apps/
   ├─ extension/
   │  ├─ manifest.json     # MV3 manifest, permissions, and command bindings
   │  ├─ index.html        # Extension entry page
   │  ├─ public/
   │  │  └─ init.js        # Early bootstrap script
   │  ├─ src/
   │  │  ├─ App.tsx        # App provider wrapper
   │  │  ├─ main.tsx       # React entry point
   │  │  ├─ background.ts  # Service worker for the fullscreen command
   │  │  ├─ types.ts       # Shared app state types
   │  │  ├─ hooks/
   │  │  │  └─ useStorage.ts
   │  │  ├─ components/
   │  │  ├─ context/
   │  │  ├─ providers/
   │  │  └─ lib/
   │  ├─ tests/
   │  ├─ icons/
   │  └─ dist/             # Extension production build output
   └─ landing/
      ├─ index.html        # Website entry page
      ├─ public/           # Static icons & SPA redirects
      ├─ src/              # Landing, Privacy, Terms, Support pages
      └─ dist/             # Website production build output
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
