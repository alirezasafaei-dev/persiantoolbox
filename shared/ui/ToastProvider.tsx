'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { ToastContext } from '@/shared/ui/toast-context';

const LazyToastDisplay = dynamic(() => import('@/shared/ui/ToastDisplay'), { ssr: false });

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
      <LazyToastDisplay toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}
