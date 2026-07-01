'use client';

import { useState } from 'react';
import { useSubscriptionStatus } from '@/shared/hooks/useSubscriptionStatus';
import { formatPrice } from '@/lib/pricing/exportCredits';
import type { ExportProduct } from '@/lib/export-products';
import { getExportProductConfig } from '@/lib/export-products';
import { trackExportFunnel, ANALYTICS_EVENTS } from '@/shared/analytics/events';
import { usePricingConfig } from '@/shared/hooks/usePricingConfig';

type UpgradeModalProps = {
  product: ExportProduct;
  onClose: () => void;
  onUpgradeSuccess: () => void;
};

export default function UpgradeModal({ product, onClose, onUpgradeSuccess }: UpgradeModalProps) {
  const { isPremium } = useSubscriptionStatus();
  const { pricing } = usePricingConfig();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const productConfig = getExportProductConfig(product);
  const productLabel = productConfig.label;
  const pack3 = pricing.plans.find((plan) => plan.id === 'pack-3');
  const basic = pricing.plans.find((plan) => plan.id === 'basic');

  async function handleCheckout(planId: string) {
    setLoading(true);
    setError(null);
    trackExportFunnel(ANALYTICS_EVENTS.CHECKOUT_START, {
      product,
      format: 'pdf',
      source: 'upgrade-modal',
      planId,
    });

    try {
      const meRes = await fetch('/api/auth/me', { credentials: 'same-origin' });
      if (!meRes.ok) {
        window.location.href = '/account';
        return;
      }

      const res = await fetch('/api/subscription/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ planId }),
      });

      const data = await res.json();
      const redirectUrl = data.payUrl ?? data.checkoutUrl;
      if (data.ok && redirectUrl) {
        window.location.href = redirectUrl;
      } else {
        setError(data.error || 'خطا در ایجاد درخواست پرداخت.');
        setLoading(false);
      }
    } catch {
      setError('خطا در اتصال به سرور پرداخت.');
      setLoading(false);
    }
  }

  if (isPremium) {
    onUpgradeSuccess();
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-6 space-y-4">
        <div className="space-y-2">
          <h2 className="text-lg font-black text-[var(--text-primary)]">خروجی حرفه‌ای</h2>
          <p className="text-sm text-[var(--text-secondary)]">
            خروجی بدون واترمارک با اعتبار خروجی فعال می‌شود.
          </p>
        </div>

        <div className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-2)] p-4 space-y-3">
          <p className="text-xs text-[var(--text-muted)]">
            محصول: <span className="font-semibold text-[var(--text-primary)]">{productLabel}</span>
          </p>
          <p className="text-xs text-[var(--text-muted)]">
            هزینه خروجی تمیز:{' '}
            <span className="font-semibold text-[var(--text-primary)]">
              {productConfig.cleanExportCredits} اعتبار
            </span>
          </p>
        </div>

        <div className="space-y-3">
          <button
            type="button"
            onClick={() => handleCheckout('pack-3')}
            disabled={loading}
            className="w-full rounded-[var(--radius-md)] border-2 border-[var(--color-primary)] bg-[var(--color-primary)] px-4 py-3 text-sm font-bold text-[var(--text-inverted)] transition-all hover:opacity-90 disabled:opacity-50"
          >
            {loading ? 'در حال اتصال...' : 'بسته ۳ خروجی'}
            <span className="block text-xs font-normal opacity-90 mt-0.5">
              {formatPrice(pack3?.price ?? pricing.pack3Price)} تومان
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleCheckout('basic')}
            disabled={loading}
            className="w-full rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] px-4 py-3 text-sm font-bold text-[var(--text-primary)] transition-all hover:border-[var(--color-primary)] disabled:opacity-50"
          >
            اشتراک پایه
            <span className="block text-xs font-normal text-[var(--text-muted)] mt-0.5">
              {formatPrice(basic?.price ?? 99_000)} تومان / ماه
            </span>
          </button>
        </div>

        {error ? <p className="text-sm text-[var(--color-danger)]">{error}</p> : null}

        <button
          type="button"
          onClick={onClose}
          className="w-full text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)]"
        >
          بستن
        </button>
      </div>
    </div>
  );
}
