import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

export type ToastType = "success" | "error" | "info";

export interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  pushToast: (type: ToastType, message: string) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const TOAST_DURATION_MS = 4000;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const pushToast = useCallback(
    (type: ToastType, message: string) => {
      if (!message) {
        return;
      }
      idRef.current += 1;
      const id = idRef.current;
      setToasts((current) => [...current, { id, type, message }]);
      window.setTimeout(() => dismiss(id), TOAST_DURATION_MS);
    },
    [dismiss]
  );

  const value = useMemo<ToastContextValue>(
    () => ({
      pushToast,
      success: (message) => pushToast("success", message),
      error: (message) => pushToast("error", message),
      info: (message) => pushToast("info", message)
    }),
    [pushToast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

function ToastViewport({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: number) => void }) {
  return (
    <div className="toast-viewport" aria-live="polite" aria-atomic="true">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

const TOAST_DECORATION: Record<ToastType, { title: string; icon: string }> = {
  success: { title: "Sucesso", icon: "✓" },
  error: { title: "Erro", icon: "!" },
  info: { title: "Informação", icon: "i" }
};

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: number) => void }) {
  const [leaving, setLeaving] = useState(false);
  const decoration = TOAST_DECORATION[toast.type];

  useEffect(() => {
    const timer = window.setTimeout(() => setLeaving(true), TOAST_DURATION_MS - 350);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className={`toast toast-${toast.type} ${leaving ? "toast-leaving" : ""}`} role="status">
      <span className="toast-icon" aria-hidden="true">
        {decoration.icon}
      </span>
      <div className="toast-body">
        <span className="toast-title">{decoration.title}</span>
        <span className="toast-message">{toast.message}</span>
      </div>
      <button
        type="button"
        className="toast-close"
        aria-label="Fechar"
        onClick={() => onDismiss(toast.id)}
      >
        ×
      </button>
    </div>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast precisa estar dentro de um ToastProvider.");
  }
  return context;
}
