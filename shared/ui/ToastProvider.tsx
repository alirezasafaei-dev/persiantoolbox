'use client';

import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { ToastContext } from '@/shared/ui/toast-context';

type Toast = {
  id: string;
  message: string;
  tone?: 'success' | 'error' | 'info';
};

export default function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, tone: Toast['tone'] = 'success') => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setToasts((prev) => [...prev, { id, message, tone }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 2500);
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed top-4 left-0 right-0 z-[80] flex flex-col items-center gap-3 px-4">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={[
              'pointer-events-auto w-full max-w-md rounded-[var(--radius-lg)] border px-4 py-3 text-sm font-semibold shadow-[var(--shadow-strong)] backdrop-blur',
              toast.tone === 'error'
                ? 'border-[rgb(var(--color-danger-rgb)/0.4)] bg-[rgb(var(--color-danger-rgb)/0.18)] text-[var(--color-danger)]'
                : toast.tone === 'info'
                  ? 'border-[rgb(var(--color-info-rgb)/0.4)] bg-[rgb(var(--color-info-rgb)/0.18)] text-[var(--color-info)]'
                  : 'border-[rgb(var(--color-success-rgb)/0.4)] bg-[rgb(var(--color-success-rgb)/0.18)] text-[var(--color-success)]',
            ].join(' ')}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
