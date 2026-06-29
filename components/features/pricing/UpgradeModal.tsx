'use client';

import { useState } from 'react';
import { useSubscriptionStatus } from '@/shared/hooks/useSubscriptionStatus';
import { CREDIT_PLANS, formatPrice } from '@/lib/pricing/exportCredits';
import type { ExportProduct } from '@/lib/export-products';
import { getExportProductConfig } from '@/lib/export-products';

type UpgradeModalProps = {
  product: ExportProduct;
  onClose: () => void;
  onUpgradeSuccess: () => void;
};

export default function UpgradeModal({ product, onClose, onUpgradeSuccess }: UpgradeModalProps) {
  const { isPremium } = useSubscriptionStatus();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const productConfig = getExportProductConfig(product);
  const productLabel = productConfig.label;
  const pack3 = CREDIT_PLANS.find((p) => p.id === 'pack-3');
  const basic = CREDIT_PLANS.find((p) => p.id === 'basic');

  async function handleCheckout(planId: string) {
    setLoading(true);
    setError(null);

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
            هر خروجی تمیز = {productConfig.cleanExportCredits.toLocaleString('fa-IR')} اعتبار • برای{' '}
            {productLabel}
          </p>
          {productConfig.legalDisclaimerRequired ? (
            <p className="text-[11px] leading-6 text-[var(--text-muted)]">
              این خروجی پیش‌نویس قابل ویرایش است و جایگزین مشاوره حقوقی نیست.
            </p>
          ) : null}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleCheckout('pack-3')}
              disabled={loading}
              className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-3 text-center space-y-1 hover:border-[var(--color-primary)] transition-all"
            >
              <p className="text-sm font-bold text-[var(--text-primary)]">بسته ۳ خروجی</p>
              <p className="text-xs text-[var(--text-secondary)]">
                {formatPrice(pack3?.price ?? 49000)} تومان
              </p>
              <p className="text-[10px] text-[var(--text-muted)]">بدون اشتراک ماهانه</p>
            </button>
            <button
              type="button"
              onClick={() => handleCheckout('basic')}
              disabled={loading}
              className="rounded-[var(--radius-md)] border border-[var(--color-primary)] bg-[var(--color-primary)]/5 p-3 text-center space-y-1 transition-all"
            >
              <p className="text-sm font-bold text-[var(--color-primary)]">اشتراک پایه</p>
              <p className="text-xs text-[var(--text-secondary)]">
                {formatPrice(basic?.price ?? 99000)} تومان / ماه
              </p>
              <p className="text-[10px] text-[var(--text-muted)]">۱۰ خروجی در ماه</p>
            </button>
          </div>
        </div>

        {error ? <p className="text-xs text-[var(--color-danger)] text-center">{error}</p> : null}

        <div className="space-y-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-[var(--radius-md)] border border-[var(--border-light)] px-4 py-2.5 text-sm font-medium text-[var(--text-secondary)] transition-all hover:bg-[var(--surface-2)]"
          >
            ادامه با خروجی رایگان (واترمارک)
          </button>
        </div>

        <p className="text-[10px] text-[var(--text-muted)] text-center">
          پرداخت از طریق درگاه زرین‌پال. پردازش کاملاً محلی در مرورگر.
        </p>
      </div>
    </div>
  );
}
