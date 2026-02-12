'use client';

import { createContext, useContext } from 'react';

export type ToastContextValue = {
  showToast: (message: string, tone?: 'success' | 'error' | 'info') => void;
};

export const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return ctx;
}
