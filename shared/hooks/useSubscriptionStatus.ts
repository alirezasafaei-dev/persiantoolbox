'use client';

import { useEffect, useState } from 'react';

type SubscriptionStatus = {
  isPremium: boolean;
  planId: string | null;
  expiresAt: string | null;
};

export function useSubscriptionStatus(): SubscriptionStatus {
  const [status, setStatus] = useState<SubscriptionStatus>({
    isPremium: false,
    planId: null,
    expiresAt: null,
  });

  useEffect(() => {
    let cancelled = false;

    async function checkStatus() {
      try {
        const res = await fetch('/api/subscription/status', {
          credentials: 'same-origin',
        });
        if (!res.ok) {
          return;
        }
        const data = await res.json();
        if (cancelled) {
          return;
        }
        setStatus({
          isPremium: Boolean(data.subscription?.active),
          planId: data.subscription?.planId ?? null,
          expiresAt: data.subscription?.expiresAt ?? null,
        });
      } catch {
        // Payment not available — stay free tier
      }
    }

    checkStatus();
    return () => {
      cancelled = true;
    };
  }, []);

  return status;
}
