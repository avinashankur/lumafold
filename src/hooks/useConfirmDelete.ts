import { useCallback } from 'react';
import { useModal } from '@/context/ModalContext';

// Deleting something that holds text asks first; deleting something empty
// just happens. Used for both folders and panels, from every place that
// offers Delete.
export function useConfirmDelete() {
  const { showConfirm } = useModal();
  return useCallback(
    (name: string, hasContent: boolean, onDelete: () => void) => {
      if (!hasContent) {
        onDelete();
        return;
      }
      showConfirm(
        `Permanently delete "${name}" and all its content?`,
        onDelete,
        { confirmLabel: 'Delete', danger: true },
      );
    },
    [showConfirm],
  );
}
