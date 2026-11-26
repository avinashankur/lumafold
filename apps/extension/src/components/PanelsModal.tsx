import type { Panel } from '../types';
import { useModal } from '../context/ModalContext';
import { MAX_VISIBLE_PANELS, panelHasContent } from '../lib/workspace';
import ManageListDialog from './ManageListDialog';

interface Props {
  open?: boolean;
  canAddPanel: boolean;
  canUnhide: boolean;
  onAddPanel: () => void;
  panels: Panel[];
  onHidePanel: (panelId: string) => void;
  onUnhidePanel: (panelId: string) => void;
  onDeletePanel: (panelId: string) => void;
  onClose: () => void;
}

export default function PanelsModal({
  open,
  canAddPanel,
  canUnhide,
  onAddPanel,
  panels,
  onHidePanel,
  onUnhidePanel,
  onDeletePanel,
  onClose,
}: Props) {
  const { showAlert } = useModal();

  const handleUnhide = (panelId: string) => {
    if (!canUnhide) {
      showAlert(
        `Hide another panel first — max ${MAX_VISIBLE_PANELS} visible panels.`,
      );
      return;
    }
    onUnhidePanel(panelId);
  };

  return (
    <ManageListDialog
      open={open}
      title="Manage Panels"
      description="Add, hide, or delete panels in this folder"
      listLabel="Folder panels"
      noun="panel"
      items={panels.map((p) => ({
        id: p.id,
        label: p.title,
        hidden: p.hidden,
        hasContent: panelHasContent(p),
      }))}
      addLabel={
        canAddPanel ? `Add panel (max ${MAX_VISIBLE_PANELS})` : undefined
      }
      onAdd={onAddPanel}
      onHide={onHidePanel}
      onShow={handleUnhide}
      onDelete={onDeletePanel}
      onClose={onClose}
    />
  );
}
