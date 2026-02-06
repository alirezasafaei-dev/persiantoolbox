import { useEffect, useState } from 'react';

export type SubscriptionStatus = {
  id: string;
  planId: string;
  status: 'active' | 'canceled' | 'expired';
  startedAt: number;
  expiresAt: number;
};

type SubscriptionResponse = {
  ok: boolean;
  subscription?: SubscriptionStatus | null;
};

export function useSubscriptionStatus() {
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const response = await fetch('/api/subscription/status', { cache: 'no-store' });
        if (!response.ok) {
          if (!cancelled) {
            setSubscription(null);
          }
          return;
        }
        const data = (await response.json()) as SubscriptionResponse;
        if (!cancelled) {
          setSubscription(data.subscription ?? null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  return { subscription, loading };
}
