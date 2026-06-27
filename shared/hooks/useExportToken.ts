'use client';

import { useState, useCallback } from 'react';

type ExportTokenResult = {
  token: string | null;
  expiresAt: string | null;
  error: string | null;
  loading: boolean;
  creditsRemaining: number | null;
  reservationId: string | null;
  retry: boolean;
};

export function useExportToken() {
  const [state, setState] = useState<ExportTokenResult>({
    token: null,
    expiresAt: null,
    error: null,
    loading: false,
    creditsRemaining: null,
    reservationId: null,
    retry: false,
  });

  const requestToken = useCallback(async (product: 'business' | 'career' | 'writing') => {
    setState({
      token: null,
      expiresAt: null,
      error: null,
      loading: false,
      creditsRemaining: null,
      reservationId: null,
      retry: false,
    });
    setState((prev) => ({ ...prev, loading: true }));

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
          creditsRemaining: data.creditsRemaining ?? null,
          reservationId: null,
          retry: false,
        });
        return null;
      }

      setState({
        token: data.token,
        expiresAt: data.expiresAt,
        error: null,
        loading: false,
        creditsRemaining: data.creditsRemaining ?? null,
        reservationId: data.reservationId ?? null,
        retry: data.retry ?? false,
      });
      return { token: data.token, reservationId: data.reservationId ?? null };
    } catch {
      setState({
        token: null,
        expiresAt: null,
        error: 'خطا در اتصال به سرور.',
        loading: false,
        creditsRemaining: null,
        reservationId: null,
        retry: false,
      });
      return null;
    }
  }, []);

  const confirmExport = useCallback(async (reservationId: string) => {
    try {
      await fetch('/api/export/token', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ reservationId, action: 'confirm' }),
      });
    } catch {
      // Best effort — credit is already consumed
    }
  }, []);

  const cancelReservation = useCallback(async (reservationId: string) => {
    try {
      await fetch('/api/export/token', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ reservationId, action: 'cancel' }),
      });
    } catch {
      // Best effort — reservation may already have expired
    }
  }, []);

  const reset = useCallback(() => {
    setState({
      token: null,
      expiresAt: null,
      error: null,
      loading: false,
      creditsRemaining: null,
      reservationId: null,
      retry: false,
    });
  }, []);

  return { ...state, requestToken, confirmExport, cancelReservation, reset };
}
