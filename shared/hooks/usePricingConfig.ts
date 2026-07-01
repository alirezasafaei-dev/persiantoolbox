'use client';

import { useEffect, useState } from 'react';
import { mergePricingConfig, type PublicPricingConfig } from '@/lib/pricing/pricingConfig';

type PricingState = {
  pricing: PublicPricingConfig;
  loading: boolean;
  error: string | null;
};

export function usePricingConfig(initialPricing?: PublicPricingConfig): PricingState {
  const [pricing, setPricing] = useState<PublicPricingConfig>(
    initialPricing ?? mergePricingConfig({ plans: {}, topUps: {}, updatedAt: null }),
  );
  const [loading, setLoading] = useState(!initialPricing);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialPricing) {
      return;
    }

    let cancelled = false;
    const load = async () => {
      try {
        const response = await fetch('/api/pricing', { cache: 'no-store' });
        const payload = (await response.json()) as {
          ok?: boolean;
          pricing?: PublicPricingConfig;
        };
        if (!response.ok || !payload.ok || !payload.pricing) {
          if (!cancelled) {
            setError('بارگذاری قیمت‌ها با خطا مواجه شد.');
            setLoading(false);
          }
          return;
        }
        if (!cancelled) {
          setPricing(payload.pricing);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setError('بارگذاری قیمت‌ها با خطا مواجه شد.');
          setLoading(false);
        }
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [initialPricing]);

  return { pricing, loading, error };
}
