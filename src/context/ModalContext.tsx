import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type AlertModal = { type: 'alert'; message: string; title?: string };
type ConfirmModal = {
  type: 'confirm';
  message: string;
  title?: string;
  onConfirm: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
};
type ModalState = AlertModal | ConfirmModal | null;

interface ModalContextValue {
  showAlert: (message: string, title?: string) => void;
  showConfirm: (
    message: string,
    onConfirm: () => void,
    options?: {
      title?: string;
      confirmLabel?: string;
      cancelLabel?: string;
      danger?: boolean;
    },
  ) => void;
}

const ModalContext = createContext<ModalContextValue | null>(null);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [modal, setModal] = useState<ModalState>(null);

  const showAlert = useCallback((message: string, title?: string) => {
    setModal({ type: 'alert', message, title });
  }, []);

  const showConfirm = useCallback(
    (
      message: string,
      onConfirm: () => void,
      options?: {
        title?: string;
        confirmLabel?: string;
        cancelLabel?: string;
        danger?: boolean;
      },
    ) => {
      setModal({
        type: 'confirm',
        message,
        title: options?.title,
        onConfirm,
        confirmLabel: options?.confirmLabel,
        cancelLabel: options?.cancelLabel,
        danger: options?.danger,
      });
    },
    [],
  );

  const close = useCallback(() => setModal(null), []);

  const handleConfirm = useCallback(() => {
    if (modal?.type === 'confirm') {
      modal.onConfirm();
      close();
    }
  }, [modal, close]);

  return (
    <ModalContext.Provider value={{ showAlert, showConfirm }}>
      {children}
      <AlertDialog open={!!modal} onOpenChange={(open) => !open && close()}>
        {modal && (
          <AlertDialogContent size="sm">
            <AlertDialogHeader>
              <AlertDialogTitle>
                {modal.title ??
                  (modal.type === 'confirm' ? 'Confirm' : 'Notice')}
              </AlertDialogTitle>
              <AlertDialogDescription>{modal.message}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              {modal.type === 'confirm' && (
                <AlertDialogCancel onClick={close}>
                  {modal.cancelLabel ?? 'Cancel'}
                </AlertDialogCancel>
              )}
              <AlertDialogAction
                onClick={modal.type === 'alert' ? close : handleConfirm}
                variant={
                  modal.type === 'confirm' && modal.danger
                    ? 'destructive'
                    : 'default'
                }
              >
                {modal.type === 'alert'
                  ? 'OK'
                  : (modal.confirmLabel ?? 'Confirm')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        )}
      </AlertDialog>
    </ModalContext.Provider>
  );
}

export function useModal() {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error('useModal must be used within ModalProvider');
  return ctx;
}
