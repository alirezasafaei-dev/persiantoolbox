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

function parseExpiry(expiresAt: string | number | null | undefined): number | null {
  if (expiresAt === null || expiresAt === undefined) {
    return null;
  }

  if (typeof expiresAt === 'number') {
    return Number.isFinite(expiresAt) ? expiresAt : null;
  }

  const direct = Number(expiresAt);
  if (Number.isFinite(direct) && expiresAt.trim() !== '') {
    return direct;
  }

  const parsed = Date.parse(expiresAt);
  return Number.isFinite(parsed) ? parsed : null;
}

export function normalizeSubscriptionStatus(data: SubscriptionStatusResponse): SubscriptionStatus {
  const subscription = data.subscription ?? null;
  const expiresAt = subscription?.expiresAt;
  const planId = subscription?.planId ?? subscription?.id ?? null;
  const expiryMs = parseExpiry(expiresAt);
  const hasFutureExpiry = expiryMs !== null && expiryMs > Date.now();
  const isPremium =
    subscription?.active === true ||
    data.usage?.isPremium === true ||
    (planId !== null && hasFutureExpiry);

  return {
    isPremium,
    planId,
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
