'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { ToastContext } from '@/shared/ui/toast-context';

type Toast = {
  id: string;
  message: string;
  tone?: 'success' | 'error' | 'info';
  visible: boolean;
};

export default function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, visible: false } : t)));
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 300);
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const showToast = useCallback(
    (message: string, tone: Toast['tone'] = 'success') => {
      const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      setToasts((prev) => {
        const limited = prev.length >= 3 ? prev.slice(1) : prev;
        return [...limited, { id, message, tone, visible: true }];
      });
      const timer = setTimeout(() => {
        removeToast(id);
      }, 3000);
      timersRef.current.set(id, timer);
    },
    [removeToast],
  );

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed bottom-4 left-0 right-0 z-[80] flex flex-col items-center gap-2 px-4 sm:bottom-6"
        role="status"
        aria-live="polite"
        aria-label="اعلان‌ها"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="button"
            tabIndex={0}
            onClick={() => removeToast(toast.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                removeToast(toast.id);
              }
            }}
            className={[
              'pointer-events-auto w-full max-w-sm cursor-pointer rounded-[var(--radius-lg)] border px-4 py-3 text-sm font-semibold shadow-[var(--shadow-strong)] backdrop-blur transition-all duration-300',
              toast.visible
                ? 'translate-y-0 opacity-100 scale-100'
                : 'translate-y-2 opacity-0 scale-95',
              toast.tone === 'error'
                ? 'border-[rgb(var(--color-danger-rgb)/0.4)] bg-[rgb(var(--color-danger-rgb)/0.18)] text-[var(--color-danger)]'
                : toast.tone === 'info'
                  ? 'border-[rgb(var(--color-info-rgb)/0.4)] bg-[rgb(var(--color-info-rgb)/0.18)] text-[var(--color-info)]'
                  : 'border-[rgb(var(--color-success-rgb)/0.4)] bg-[rgb(var(--color-success-rgb)/0.18)] text-[var(--color-success)]',
            ].join(' ')}
          >
            <span className="flex items-center gap-2">
              <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-current/10">
                {toast.tone === 'error' ? (
                  <svg
                    className="h-3 w-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : toast.tone === 'info' ? (
                  <svg
                    className="h-3 w-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-3 w-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </span>
              {toast.message}
            </span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
