/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, Sparkles, X, ArrowRight } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning' | 'feedback';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  action?: ToastAction;
}

export type ToastInput = Omit<ToastItem, 'id'> | string;

interface ToastContextType {
  toasts: ToastItem[];
  addToast: (
    input: ToastInput,
    type?: ToastType,
    message?: string,
    action?: ToastAction
  ) => string;
  showToast: (
    input: ToastInput,
    type?: ToastType,
    message?: string,
    action?: ToastAction
  ) => string;
  removeToast: (id: string) => void;
  success: (title: string, message?: string, action?: ToastAction) => string;
  error: (title: string, message?: string, action?: ToastAction) => string;
  info: (title: string, message?: string, action?: ToastAction) => string;
  warning: (title: string, message?: string, action?: ToastAction) => string;
  feedback: (title: string, message?: string, action?: ToastAction) => string;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (
      input: ToastInput,
      type: ToastType = 'info',
      message?: string,
      action?: ToastAction
    ): string => {
      const id = 'toast_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();

      let normalizedToast: Omit<ToastItem, 'id'>;

      if (typeof input === 'string') {
        normalizedToast = {
          title: input,
          type: type || 'info',
          message: message,
          action: action,
        };
      } else {
        normalizedToast = {
          title: input.title || (input as any).message || 'Notification',
          type: input.type || 'info',
          message: input.message,
          duration: input.duration,
          action: input.action,
        };
      }

      const duration =
        normalizedToast.duration ?? (normalizedToast.type === 'feedback' ? 8000 : 4500);

      const newToast: ToastItem = { ...normalizedToast, id, duration };
      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }

      return id;
    },
    [removeToast]
  );

  const success = useCallback((title: string, message?: string, action?: ToastAction) => {
    return addToast({ type: 'success', title, message, action });
  }, [addToast]);

  const error = useCallback((title: string, message?: string, action?: ToastAction) => {
    return addToast({ type: 'error', title, message, action });
  }, [addToast]);

  const info = useCallback((title: string, message?: string, action?: ToastAction) => {
    return addToast({ type: 'info', title, message, action });
  }, [addToast]);

  const warning = useCallback((title: string, message?: string, action?: ToastAction) => {
    return addToast({ type: 'warning', title, message, action });
  }, [addToast]);

  const feedback = useCallback((title: string, message?: string, action?: ToastAction) => {
    return addToast({ type: 'feedback', title, message, action });
  }, [addToast]);

  return (
    <ToastContext.Provider
      value={{
        toasts,
        addToast,
        showToast: addToast,
        removeToast,
        success,
        error,
        info,
        warning,
        feedback,
      }}
    >
      {children}
      
      {/* Fixed Toast Container */}
      <div 
        id="toast-notifications-container"
        className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-3 max-w-sm sm:max-w-md w-full pointer-events-none px-4 sm:px-0"
        aria-live="polite"
        aria-atomic="true"
      >
        <AnimatePresence>
          {toasts.map((t) => (
            <ToastCard key={t.id} toast={t} onClose={() => removeToast(t.id)} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

const ToastCard: React.FC<{ toast: ToastItem; onClose: () => void }> = ({ toast, onClose }) => {
  const getStyles = () => {
    switch (toast.type) {
      case 'success':
        return {
          icon: <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />,
          borderColor: 'border-emerald-500/40 shadow-emerald-950/40',
          bgColor: 'bg-zinc-900',
          accentBadge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
          titleColor: 'text-emerald-300',
        };
      case 'error':
        return {
          icon: <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />,
          borderColor: 'border-red-500/40 shadow-red-950/40',
          bgColor: 'bg-zinc-900',
          accentBadge: 'bg-red-500/15 text-red-300 border-red-500/30',
          titleColor: 'text-red-300',
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />,
          borderColor: 'border-amber-500/40 shadow-amber-950/40',
          bgColor: 'bg-zinc-900',
          accentBadge: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
          titleColor: 'text-amber-300',
        };
      case 'feedback':
        return {
          icon: <Sparkles className="h-5 w-5 text-green-400 shrink-0 mt-0.5 animate-pulse" />,
          borderColor: 'border-green-500/50 ring-1 ring-green-500/30 shadow-green-950/40',
          bgColor: 'bg-zinc-900',
          accentBadge: 'bg-green-500/20 text-green-300 border-green-500/40',
          titleColor: 'text-green-300 font-bold',
        };
      case 'info':
      default:
        return {
          icon: <Info className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />,
          borderColor: 'border-blue-500/40 shadow-blue-950/40',
          bgColor: 'bg-zinc-900',
          accentBadge: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
          titleColor: 'text-blue-300',
        };
    }
  };

  const styles = getStyles();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
      className={`pointer-events-auto rounded-2xl border ${styles.borderColor} ${styles.bgColor} shadow-2xl p-4 text-zinc-100 flex flex-col gap-2.5 transition-all overflow-hidden ring-1 ring-white/10`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          {styles.icon}
          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className={`text-sm font-semibold leading-snug break-words ${styles.titleColor}`}>
                {toast.title}
              </h4>
              {toast.type === 'feedback' && (
                <span className={`text-[10px] uppercase font-mono px-1.5 py-0.5 rounded border ${styles.accentBadge}`}>
                  Mentor Review
                </span>
              )}
            </div>
            {toast.message && (
              <p className="text-xs text-zinc-300 leading-relaxed max-w-xs sm:max-w-sm break-words">
                {toast.message}
              </p>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition-colors shrink-0 cursor-pointer"
          aria-label="Close notification"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {toast.action && (
        <div className="flex justify-end pt-1">
          <button
            type="button"
            onClick={() => {
              toast.action?.onClick();
              onClose();
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500 hover:bg-green-400 text-zinc-950 text-xs font-bold transition-all shadow-md shadow-green-500/20 cursor-pointer active:scale-95"
          >
            <span>{toast.action.label}</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      )}
    </motion.div>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
