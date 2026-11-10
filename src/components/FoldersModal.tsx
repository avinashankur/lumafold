import type { Folder } from '../types';
import { folderHasContent } from '../lib/workspace';
import ManageListDialog from './ManageListDialog';

interface Props {
  open?: boolean;
  folders: Folder[];
  onAddFolder: () => void;
  onHideFolder: (id: string) => void;
  onUnhideFolder: (id: string) => void;
  onDeleteFolder: (id: string) => void;
  onClose: () => void;
}

export default function FoldersModal({
  open,
  folders,
  onAddFolder,
  onHideFolder,
  onUnhideFolder,
  onDeleteFolder,
  onClose,
}: Props) {
  return (
    <ManageListDialog
      open={open}
      title="Manage Folders"
      description="Add, hide, or delete folders"
      listLabel="All folders"
      noun="folder"
      items={folders.map((f) => ({
        id: f.id,
        label: f.name,
        hidden: f.hidden,
        hasContent: folderHasContent(f),
      }))}
      addLabel="Add folder"
      onAdd={onAddFolder}
      onHide={onHideFolder}
      onShow={onUnhideFolder}
      onDelete={onDeleteFolder}
      onClose={onClose}
    />
  );
}
