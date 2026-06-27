'use client';

import { useState } from 'react';
import { type SubscriptionPlan } from '@/lib/subscriptionPlans';
import { Card } from '@/components/ui';
import Button from '@/shared/ui/Button';

function formatPrice(price: number): string {
  return new Intl.NumberFormat('fa-IR').format(price);
}

type Props = {
  plans: SubscriptionPlan[];
};

export default function PremiumPageClient({ plans }: Props) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async (planId: string) => {
    setError(null);
    setLoading(planId);
    try {
      const res = await fetch('/api/subscription/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      });
      const data = await res.json();
      if (data.ok && data.payUrl) {
        window.location.href = data.payUrl;
      } else {
        setError(data.error ?? 'خطا در پردازش پرداخت');
      }
    } catch {
      setError('خطای شبکه. لطفاً دوباره تلاش کنید.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-10">
      <section className="section-surface relative overflow-hidden p-6 md:p-10 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgb(var(--color-primary-rgb)/0.15),_transparent_55%)]" />
        <div className="relative space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)]">
            ارتقا به اشتراک ویژه
          </h1>
          <p className="text-base md:text-lg text-[var(--text-muted)]">
            دسترسی نامحدود به تمام ابزارها بدون محدودیت
          </p>
        </div>
      </section>

      <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={`relative p-6 space-y-4 ${
              plan.tier === 'pro' ? 'border-2 border-[var(--color-primary)]' : ''
            }`}
          >
            {plan.tier === 'pro' && (
              <div className="absolute -top-3 right-4 bg-[var(--color-primary)] text-[var(--text-inverted)] px-3 py-1 rounded-full text-xs font-bold">
                حرفه‌ای
              </div>
            )}
            <div>
              <h3 className="text-lg font-bold text-[var(--text-primary)]">{plan.title}</h3>
              <div className="text-3xl font-black text-[var(--color-primary)] mt-2">
                {formatPrice(plan.price)}{' '}
                <span className="text-sm text-[var(--text-muted)]">تومان</span>
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                {plan.periodDays <= 30 ? 'ماهانه' : 'سالانه'}
              </p>
            </div>
            <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
              <li>{plan.monthlyCredits} خروجی تمیز در ماه</li>
              <li>حداکثر {plan.dailyLimit} خروجی در روز</li>
            </ul>
            <Button
              onClick={() => void handleCheckout(plan.id)}
              disabled={loading === plan.id}
              className="w-full"
            >
              {loading === plan.id ? 'در حال پردازش...' : 'خرید اشتراک'}
            </Button>
          </Card>
        ))}
      </div>

      {error && (
        <div
          role="alert"
          aria-live="polite"
          className="max-w-4xl mx-auto rounded-[var(--radius-md)] bg-[var(--color-danger)]/10 border border-[var(--color-danger)]/20 p-4 text-sm text-[var(--color-danger)] text-center"
        >
          {error}
        </div>
      )}

      <div className="text-center text-sm text-[var(--text-muted)]">
        <p>لغو در هر زمان • ضمانت بازگشت وجه ۷ روزه • پشتیبانی ۲۴/۷</p>
      </div>
    </div>
  );
}
