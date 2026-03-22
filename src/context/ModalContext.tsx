import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";

type AlertModal = { type: "alert"; message: string };
type ConfirmModal = {
  type: "confirm";
  message: string;
  onConfirm: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
};
type ModalState = AlertModal | ConfirmModal | null;

interface ModalContextValue {
  showAlert: (message: string) => void;
  showConfirm: (
    message: string,
    onConfirm: () => void,
    options?: { confirmLabel?: string; cancelLabel?: string; danger?: boolean }
  ) => void;
}

const ModalContext = createContext<ModalContextValue | null>(null);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [modal, setModal] = useState<ModalState>(null);

  const showAlert = useCallback((message: string) => {
    setModal({ type: "alert", message });
  }, []);

  const showConfirm = useCallback(
    (
      message: string,
      onConfirm: () => void,
      options?: { confirmLabel?: string; cancelLabel?: string; danger?: boolean }
    ) => {
      setModal({
        type: "confirm",
        message,
        onConfirm,
        confirmLabel: options?.confirmLabel,
        cancelLabel: options?.cancelLabel,
        danger: options?.danger,
      });
    },
    []
  );

  const close = useCallback(() => setModal(null), []);

  useEffect(() => {
    if (!modal) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [modal, close]);

  const handleConfirm = useCallback(() => {
    if (modal?.type === "confirm") {
      modal.onConfirm();
      close();
    }
  }, [modal, close]);

  return (
    <ModalContext.Provider value={{ showAlert, showConfirm }}>
      {children}
      {modal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}
          onClick={close}
        >
          <div
            className="rounded-xl shadow-2xl max-w-sm mx-4 overflow-hidden"
            style={{
              background: "var(--panel-bg)",
              border: "1px solid var(--border)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-3 text-sm text-[var(--text)]">{modal.message}</div>
            <div className="flex justify-end gap-2 px-4 py-3 border-t" style={{ borderColor: "var(--border)" }}>
              {modal.type === "confirm" && (
                <button
                  onClick={close}
                  className="px-3 py-1.5 rounded text-xs font-medium transition-colors"
                  style={{ color: "var(--text-muted)", background: "var(--hover)" }}
                >
                  {modal.cancelLabel ?? "Cancel"}
                </button>
              )}
              <button
                onClick={modal.type === "alert" ? close : handleConfirm}
                className="px-3 py-1.5 rounded text-xs font-medium text-white transition-colors"
                style={{
                  background: modal.type === "confirm" && modal.danger ? "#ef4444" : "var(--accent)",
                }}
              >
                {modal.type === "alert" ? "OK" : modal.confirmLabel ?? "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error("useModal must be used within ModalProvider");
  return ctx;
}
