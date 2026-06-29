'use client';

import { useEffect, useState } from 'react';

export type SubscriptionStatus = {
  isPremium: boolean;
  planId: string | null;
  expiresAt: string | null;
};

export type SubscriptionStatusResponse = {
  subscription?: {
    active?: boolean;
    planId?: string;
    id?: string;
    expiresAt?: string | number | null;
  } | null;
  usage?: {
    isPremium?: boolean;
  };
};

export function normalizeSubscriptionStatus(data: SubscriptionStatusResponse): SubscriptionStatus {
  const subscription = data.subscription ?? null;
  const expiresAt = subscription?.expiresAt;
  return {
    isPremium: Boolean(subscription?.active ?? data.usage?.isPremium ?? subscription),
    planId: subscription?.planId ?? subscription?.id ?? null,
    expiresAt: expiresAt === null || expiresAt === undefined ? null : String(expiresAt),
  };
}

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
        const data = (await res.json()) as SubscriptionStatusResponse;
        if (cancelled) {
          return;
        }
        setStatus(normalizeSubscriptionStatus(data));
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
