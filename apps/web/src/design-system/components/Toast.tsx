'use client';

import { useState, useCallback, useEffect, createContext, useContext, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '../primitives/Button';
import { XIcon, CheckCircleIcon, AlertCircleIcon, InfoIcon, AlertTriangleIcon } from '@/components/icons';

export type ToastType = 'default' | 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  action?: ReactNode;
  duration?: number;
  dismissible?: boolean;
}

interface ToastContextValue {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => string;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

const toastIcons: Record<ToastType, ReactNode> = {
  default: <AlertCircleIcon className="h-5 w-5" />,
  success: <CheckCircleIcon className="h-5 w-5" />,
  error: <AlertCircleIcon className="h-5 w-5" />,
  warning: <AlertTriangleIcon className="h-5 w-5" />,
  info: <InfoIcon className="h-5 w-5" />,
};

const toastStyles: Record<ToastType, string> = {
  default: 'bg-surface-level1 dark:bg-surface-level1Dark border-border-light dark:border-neutral-700',
  success: 'bg-success-light dark:bg-success-dark/30 border-success dark:border-success/30',
  error: 'bg-error-light dark:bg-error-dark/30 border-error dark:border-error/30',
  warning: 'bg-warning-light dark:bg-warning-dark/30 border-warning dark:border-warning/30',
  info: 'bg-info-light dark:bg-info-dark/30 border-info dark:border-info/30',
};

const toastIconColors: Record<ToastType, string> = {
  default: 'text-text-secondary',
  success: 'text-success',
  error: 'text-error',
  warning: 'text-warning',
  info: 'text-info',
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast = { ...toast, id } as Toast;
    setToasts((prev) => [...prev, newToast]);
    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: string) => void }) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && toasts.length > 0) {
        onRemove(toasts[toasts.length - 1].id);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [toasts, onRemove]);

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full"
      role="region"
      aria-label="Notificações"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  useEffect(() => {
    if (toast.duration !== 0 && toast.duration !== Infinity) {
      const timer = setTimeout(() => onRemove(toast.id), toast.duration ?? 5000);
      return () => clearTimeout(timer);
    }
  }, [toast, onRemove]);

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-xl shadow-level3',
        'animate-slide-up',
        'border',
        toastStyles[toast.type],
        toast.dismissible !== false && 'cursor-pointer',
      )}
      role="alert"
      aria-live="assertive"
      onClick={toast.dismissible !== false ? () => onRemove(toast.id) : undefined}
    >
      <div className={cn('flex-shrink-0 mt-0.5', toastIconColors[toast.type])}>
        {toastIcons[toast.type]}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-text-primary">{toast.title}</p>
        {toast.description && (
          <p className="mt-1 text-sm text-text-secondary">{toast.description}</p>
        )}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {toast.action}
        {toast.dismissible !== false && (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onRemove(toast.id);
            }}
            aria-label="Dismiss notification"
            className="text-text-tertiary hover:text-text-secondary"
          >
            <XIcon className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

export function useToastHelpers() {
  const { addToast } = useToast();

  const toast = useCallback(
    (options: Omit<Toast, 'id'>) => addToast(options),
    [addToast],
  );

  const success = useCallback(
    (title: string, description?: string, options?: Partial<Toast>) =>
      addToast({ type: 'success', title, description, ...options }),
    [addToast],
  );

  const error = useCallback(
    (title: string, description?: string, options?: Partial<Toast>) =>
      addToast({ type: 'error', title, description, ...options }),
    [addToast],
  );

  const warning = useCallback(
    (title: string, description?: string, options?: Partial<Toast>) =>
      addToast({ type: 'warning', title, description, ...options }),
    [addToast],
  );

  const info = useCallback(
    (title: string, description?: string, options?: Partial<Toast>) =>
      addToast({ type: 'info', title, description, ...options }),
    [addToast],
  );

  return { toast, success, error, warning, info };
}