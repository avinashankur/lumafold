// Every Folder and Panel rule lives here: state in, state out.
// No React and no storage, so it runs under `node --test` as-is.
//
// Transitions return the same object when nothing changes (unknown id,
// blocked by a rule), so callers can compare by identity.

import type { Folder, Panel, Workspace } from '../types.ts';
import { generateFolderName } from './folderNames.ts';

export const MAX_VISIBLE_PANELS = 3;
export const MIN_PANEL_WIDTH = 15; // percent

// ── Construction ────────────────────────────────────────────────

export function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}

function makePanel(title: string, content = ''): Panel {
  return { id: generateId(), title, content, hidden: false };
}

function makeFolder(
  name: string,
  panels: Panel[] = [makePanel('Notes'), makePanel('Action Items')],
): Folder {
  return {
    id: generateId(),
    name,
    hidden: false,
    panels,
    panelWidths: equalWidths(panels.length),
  };
}

export function initialWorkspace(): Workspace {
  const folders = [
    makeFolder('Workspace', [
      makePanel(
        'Overview',
        '<p>Summarize the current focus, key context, and important decisions here.</p>',
      ),
      makePanel(
        'Action Items',
        '<p>Track next steps, owners, and follow-up items here.</p>',
      ),
    ]),
    makeFolder('Reference', [
      makePanel(
        'Resources',
        '<p>Store useful links, supporting notes, and source material here.</p>',
      ),
      makePanel(
        'Notes',
        '<p>Capture relevant observations and details for later review.</p>',
      ),
    ]),
  ];
  return { folders, activeFolderId: folders[0].id };
}

// ── Queries ─────────────────────────────────────────────────────

export function plainText(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
}

export function panelHasContent(panel: Panel): boolean {
  return !!panel.content && plainText(panel.content) !== '';
}

export function folderHasContent(folder: Folder): boolean {
  return folder.panels.some(panelHasContent);
}

export function visibleFolders(
  workspace: Pick<Workspace, 'folders'>,
): Folder[] {
  return workspace.folders.filter((f) => !f.hidden);
}

export function visiblePanels(folder: Folder): Panel[] {
  return folder.panels.filter((p) => !p.hidden);
}

export function activeFolder(workspace: Workspace): Folder | undefined {
  return workspace.folders.find((f) => f.id === workspace.activeFolderId);
}

export function canShowAnotherPanel(folder: Folder): boolean {
  return visiblePanels(folder).length < MAX_VISIBLE_PANELS;
}

// Widths of the visible panels, in order. Always one per visible panel and
// summing to 100, whatever is stored (older data can be stale or short).
export function panelWidths(folder: Folder): number[] {
  const count = visiblePanels(folder).length;
  const stored = folder.panelWidths;
  if (
    !Array.isArray(stored) ||
    stored.length !== count ||
    !stored.every((w) => Number.isFinite(w) && w > 0)
  ) {
    return equalWidths(count);
  }
  const total = stored.reduce((sum, w) => sum + w, 0);
  return stored.map((w) => (w * 100) / total);
}

// ── Folder transitions ──────────────────────────────────────────

// Points activeFolderId at the first visible folder if it is missing,
// hidden, or unset.
export function withValidActiveFolder(workspace: Workspace): Workspace {
  const visible = visibleFolders(workspace);
  if (visible.some((f) => f.id === workspace.activeFolderId)) return workspace;
  const activeFolderId = visible[0]?.id ?? null;
  if (activeFolderId === workspace.activeFolderId) return workspace;
  return { folders: workspace.folders, activeFolderId };
}

export function addFolder(workspace: Workspace): Workspace {
  const name = generateFolderName(workspace.folders.map((f) => f.name));
  const folder = makeFolder(name);
  return {
    folders: [...workspace.folders, folder],
    activeFolderId: folder.id,
  };
}

export function deleteFolder(workspace: Workspace, id: string): Workspace {
  if (!workspace.folders.some((f) => f.id === id)) return workspace;
  return withValidActiveFolder({
    folders: workspace.folders.filter((f) => f.id !== id),
    activeFolderId: workspace.activeFolderId,
  });
}

export function renameFolder(
  workspace: Workspace,
  id: string,
  name: string,
): Workspace {
  return updateFolder(workspace, id, (f) => ({ ...f, name }));
}

export function hideFolder(workspace: Workspace, id: string): Workspace {
  return withValidActiveFolder(
    updateFolder(workspace, id, (f) => (f.hidden ? f : { ...f, hidden: true })),
  );
}

// Showing a folder also makes it the active one.
export function showFolder(workspace: Workspace, id: string): Workspace {
  if (!workspace.folders.some((f) => f.id === id)) return workspace;
  return {
    folders: workspace.folders.map((f) =>
      f.id === id ? { ...f, hidden: false } : f,
    ),
    activeFolderId: id,
  };
}

export function setActiveFolder(workspace: Workspace, id: string): Workspace {
  if (workspace.activeFolderId === id) return workspace;
  if (!visibleFolders(workspace).some((f) => f.id === id)) return workspace;
  return { folders: workspace.folders, activeFolderId: id };
}

// The moved folder takes the target's position; the target shifts toward
// where the moved one came from.
export function moveFolder(
  workspace: Workspace,
  id: string,
  targetId: string,
): Workspace {
  const folders = moveOnto(workspace.folders, id, targetId);
  if (folders === workspace.folders) return workspace;
  return { folders, activeFolderId: workspace.activeFolderId };
}

// ── Panel transitions ───────────────────────────────────────────

export function addPanel(workspace: Workspace, folderId: string): Workspace {
  return updateFolder(workspace, folderId, (f) =>
    canShowAnotherPanel(f)
      ? withPanels(f, [...f.panels, makePanel('New Panel')])
      : f,
  );
}

export function hidePanel(
  workspace: Workspace,
  folderId: string,
  panelId: string,
): Workspace {
  return updateFolder(workspace, folderId, (f) =>
    withPanels(
      f,
      f.panels.map((p) => (p.id === panelId ? { ...p, hidden: true } : p)),
    ),
  );
}

export function showPanel(
  workspace: Workspace,
  folderId: string,
  panelId: string,
): Workspace {
  return updateFolder(workspace, folderId, (f) => {
    const panel = f.panels.find((p) => p.id === panelId);
    if (!panel?.hidden || !canShowAnotherPanel(f)) return f;
    return withPanels(
      f,
      f.panels.map((p) => (p.id === panelId ? { ...p, hidden: false } : p)),
    );
  });
}

export function deletePanel(
  workspace: Workspace,
  folderId: string,
  panelId: string,
): Workspace {
  return updateFolder(workspace, folderId, (f) =>
    f.panels.some((p) => p.id === panelId)
      ? withPanels(
          f,
          f.panels.filter((p) => p.id !== panelId),
        )
      : f,
  );
}

export function renamePanel(
  workspace: Workspace,
  folderId: string,
  panelId: string,
  title: string,
): Workspace {
  return updateFolder(workspace, folderId, (f) =>
    withPanels(
      f,
      f.panels.map((p) => (p.id === panelId ? { ...p, title } : p)),
    ),
  );
}

export function setPanelContent(
  workspace: Workspace,
  folderId: string,
  panelId: string,
  content: string,
): Workspace {
  return updateFolder(workspace, folderId, (f) =>
    withPanels(
      f,
      f.panels.map((p) => (p.id === panelId ? { ...p, content } : p)),
    ),
  );
}

// Same landing rule as moveFolder. Each visible panel keeps its width.
export function movePanel(
  workspace: Workspace,
  folderId: string,
  panelId: string,
  targetPanelId: string,
): Workspace {
  return updateFolder(workspace, folderId, (f) => {
    const panels = moveOnto(f.panels, panelId, targetPanelId);
    if (panels === f.panels) return f;
    const widths = panelWidths(f);
    const widthById = new Map(
      visiblePanels(f).map((p, i) => [p.id, widths[i]]),
    );
    return {
      ...f,
      panels,
      panelWidths: panels
        .filter((p) => !p.hidden)
        .map((p) => widthById.get(p.id) as number),
    };
  });
}

// ── Width transitions ───────────────────────────────────────────

// Moves the divider after visible panel `dividerIndex` by `deltaPercent`,
// measured from `startWidths` (the widths when the drag began). Stops at
// MIN_PANEL_WIDTH on either side.
export function resizePanels(
  workspace: Workspace,
  folderId: string,
  dividerIndex: number,
  startWidths: number[],
  deltaPercent: number,
): Workspace {
  return updateFolder(workspace, folderId, (f) => {
    const count = visiblePanels(f).length;
    if (
      startWidths.length !== count ||
      !Number.isInteger(dividerIndex) ||
      dividerIndex < 0 ||
      dividerIndex >= count - 1
    ) {
      return f;
    }
    const left = startWidths[dividerIndex];
    const right = startWidths[dividerIndex + 1];
    const delta = Math.min(
      Math.max(deltaPercent, -Math.max(0, left - MIN_PANEL_WIDTH)),
      Math.max(0, right - MIN_PANEL_WIDTH),
    );
    const next = [...startWidths];
    next[dividerIndex] = left + delta;
    next[dividerIndex + 1] = right - delta;
    return { ...f, panelWidths: next };
  });
}

export function equalizePanels(
  workspace: Workspace,
  folderId: string,
): Workspace {
  return updateFolder(workspace, folderId, (f) => ({
    ...f,
    panelWidths: equalWidths(visiblePanels(f).length),
  }));
}

// ── Internals ───────────────────────────────────────────────────

function equalWidths(count: number): number[] {
  return Array.from({ length: count }, () => 100 / count);
}

function updateFolder(
  workspace: Workspace,
  folderId: string,
  change: (folder: Folder) => Folder,
): Workspace {
  const folder = workspace.folders.find((f) => f.id === folderId);
  if (!folder) return workspace;
  const next = change(folder);
  if (next === folder) return workspace;
  return {
    folders: workspace.folders.map((f) => (f === folder ? next : f)),
    activeFolderId: workspace.activeFolderId,
  };
}

// Replaces a folder's panels. Widths reset to equal whenever the set or
// order of visible panels changes; otherwise they are left alone.
function withPanels(folder: Folder, panels: Panel[]): Folder {
  const before = visiblePanels(folder).map((p) => p.id);
  const after = panels.filter((p) => !p.hidden).map((p) => p.id);
  const sameVisible =
    before.length === after.length && before.every((id, i) => id === after[i]);
  return {
    ...folder,
    panels,
    panelWidths: sameVisible ? folder.panelWidths : equalWidths(after.length),
  };
}

function moveOnto<T extends { id: string }>(
  items: T[],
  id: string,
  targetId: string,
): T[] {
  const from = items.findIndex((item) => item.id === id);
  const to = items.findIndex((item) => item.id === targetId);
  if (from === -1 || to === -1 || from === to) return items;
  const next = [...items];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}
