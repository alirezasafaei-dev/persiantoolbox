'use client';

import { useState, useCallback } from 'react';

type ExportTokenResult = {
  token: string | null;
  expiresAt: string | null;
  error: string | null;
  loading: boolean;
};

export function useExportToken() {
  const [state, setState] = useState<ExportTokenResult>({
    token: null,
    expiresAt: null,
    error: null,
    loading: false,
  });

  const requestToken = useCallback(async (product: 'business' | 'career' | 'writing') => {
    setState({ token: null, expiresAt: null, error: null, loading: true });

    try {
      const res = await fetch('/api/export/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ product }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        setState({
          token: null,
          expiresAt: null,
          error: data.error || 'خطا در دریافت توکن خروجی.',
          loading: false,
        });
        return null;
      }

      setState({
        token: data.token,
        expiresAt: data.expiresAt,
        error: null,
        loading: false,
      });
      return data.token;
    } catch {
      setState({
        token: null,
        expiresAt: null,
        error: 'خطا در اتصال به سرور.',
        loading: false,
      });
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ token: null, expiresAt: null, error: null, loading: false });
  }, []);

  return { ...state, requestToken, reset };
}
