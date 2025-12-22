import React, { createContext, useContext, useState, useCallback } from "react";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";

// Types
export type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  addToast: (message: string, type?: ToastType) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Hook personnalisé
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

// Provider
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback((message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      
      {/* Container des Toasts */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`
              pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border backdrop-blur-md transition-all duration-300 animate-slide-in
              ${
                toast.type === "success"
                  ? "bg-green-900/80 border-green-500/30 text-green-100"
                  : toast.type === "error"
                  ? "bg-red-900/80 border-red-500/30 text-red-100"
                  : toast.type === "warning"
                  ? "bg-yellow-900/80 border-yellow-500/30 text-yellow-100"
                  : "bg-blue-900/80 border-blue-500/30 text-blue-100"
              }
            `}
          >
            {/* Icone */}
            <span className="shrink-0">
              {toast.type === "success" && <CheckCircle size={18} />}
              {toast.type === "error" && <AlertCircle size={18} />}
              {toast.type === "warning" && <AlertCircle size={18} />}
              {toast.type === "info" && <Info size={18} />}
            </span>

            {/* Message */}
            <p className="text-sm font-medium">{toast.message}</p>

            {/* Bouton fermer */}
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-2 p-1 hover:bg-white/10 rounded-full transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
