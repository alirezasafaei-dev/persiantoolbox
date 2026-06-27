'use client';

import { useState } from 'react';
import { useSubscriptionStatus } from '@/shared/hooks/useSubscriptionStatus';

type UpgradeModalProps = {
  product: 'business' | 'career';
  onClose: () => void;
  onUpgradeSuccess: () => void;
};

export default function UpgradeModal({ product, onClose, onUpgradeSuccess }: UpgradeModalProps) {
  const { isPremium } = useSubscriptionStatus();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const productLabel = product === 'business' ? 'فاکتورساز' : 'رزومه‌ساز';
  const price = '۹۹٬۰۰۰';

  async function handleCheckout() {
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
        body: JSON.stringify({
          planId: 'basic-monthly',
        }),
      });

      const data = await res.json();
      if (data.ok && data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
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
            خروجی PDF و Word بدون واترمارک با اشتراک پایه فعال می‌شود.
          </p>
        </div>

        <div className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-2)] p-4 space-y-2">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-[var(--text-primary)]">{price}</span>
            <span className="text-sm text-[var(--text-muted)]">تومان / ماهانه</span>
          </div>
          <p className="text-xs text-[var(--text-muted)]">
            پلن پایه شامل خروجی PDF، Word و بدون واترمارک برای {productLabel}.
          </p>
        </div>

        {error && <p className="text-xs text-[var(--color-danger)] text-center">{error}</p>}

        <div className="space-y-2">
          <button
            type="button"
            onClick={handleCheckout}
            disabled={loading}
            className="w-full rounded-[var(--radius-md)] bg-[var(--color-primary)] px-4 py-3 text-sm font-bold text-[var(--text-inverted)] transition-all hover:opacity-90 disabled:opacity-50"
          >
            {loading ? 'در حال اتصال...' : 'خرید اشتراک'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-[var(--radius-md)] border border-[var(--border-light)] px-4 py-2.5 text-sm font-medium text-[var(--text-secondary)] transition-all hover:bg-[var(--surface-2)]"
          >
            ادامه با خروجی رایگان
          </button>
        </div>

        <p className="text-[10px] text-[var(--text-muted)] text-center">
          پرداخت از طریق درگاه زرین‌پال. پردازش کاملاً محلی در مرورگر.
        </p>
      </div>
    </div>
  );
}
