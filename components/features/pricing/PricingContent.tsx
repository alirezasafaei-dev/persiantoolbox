'use client';

import { useState } from 'react';
import { isFeatureEnabled } from '@/lib/features/availability';
import { CREDIT_PLANS, TOP_UP_PACKS, formatPrice } from '@/lib/pricing/exportCredits';

type BillingPeriod = 'monthly' | 'yearly';

function getPricingPlans(period: BillingPeriod) {
  if (period === 'monthly') {
    return [
      { ...CREDIT_PLANS.find((p) => p.id === 'basic')!, priceLabel: `${formatPrice(99000)} تومان` },
      {
        ...CREDIT_PLANS.find((p) => p.id === 'standard')!,
        priceLabel: `${formatPrice(199000)} تومان`,
        recommended: true,
      },
      { ...CREDIT_PLANS.find((p) => p.id === 'pro')!, priceLabel: `${formatPrice(399000)} تومان` },
    ];
  }
  return [
    {
      ...CREDIT_PLANS.find((p) => p.id === 'basic')!,
      priceLabel: `${formatPrice(890000)} تومان / سالانه`,
      monthlyCredits: 10,
    },
    {
      ...CREDIT_PLANS.find((p) => p.id === 'standard')!,
      priceLabel: `${formatPrice(1790000)} تومان / سالانه`,
      monthlyCredits: 120,
      recommended: true,
    },
    {
      ...CREDIT_PLANS.find((p) => p.id === 'pro')!,
      priceLabel: `${formatPrice(3590000)} تومان / سالانه`,
      monthlyCredits: 500,
    },
  ];
}

export default function PricingContent() {
  const billingActive = isFeatureEnabled('checkout');
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('monthly');

  const plans = getPricingPlans(billingPeriod);

  const handleCheckout = async (planId: string) => {
    setError(null);
    setLoading(planId);
    try {
      const meRes = await fetch('/api/auth/me');
      if (!meRes.ok) {
        window.location.href = '/account';
        return;
      }

      const res = await fetch('/api/subscription/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      });

      const data = await res.json();
      if (data.ok && data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        setError(data.error || 'خطا در ایجاد درخواست پرداخت.');
        setLoading(null);
      }
    } catch {
      setError('خطا در اتصال به سرور پرداخت.');
      setLoading(null);
    }
  };

  return (
    <div className="space-y-10">
      <section className="text-center space-y-3">
        <h1 className="text-3xl md:text-4xl font-black text-[var(--text-primary)]">
          قیمت‌گذاری ساده و شفاف
        </h1>
        <p className="mx-auto max-w-2xl text-[var(--text-secondary)]">
          خروجی تمیز با اعتبار خروجی. هر خروجی بدون واترمارک = ۱ اعتبار.
        </p>
        {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}
      </section>

      <section className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-6 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">نحوه عملکرد اعتبار خروجی</h2>
        <div className="grid gap-4 md:grid-cols-3 text-sm">
          <div className="flex items-start gap-2">
            <span className="text-[var(--color-success)]">✓</span>
            <span>
              خروجی با واترمارک = <strong>رایگان</strong>
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-[var(--color-primary)]">✦</span>
            <span>
              خروجی تمیز = <strong>۱ اعتبار</strong>
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-[var(--color-warning)]">↻</span>
            <span>
              دانلود مجدد ظرف ۳۰ دقیقه = <strong>بدون هزینه اضافه</strong>
            </span>
          </div>
        </div>
      </section>

      <section className="text-center">
        <div className="inline-flex rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-1">
          <button
            type="button"
            onClick={() => setBillingPeriod('monthly')}
            className={`rounded-[var(--radius-sm)] px-6 py-2 text-sm font-bold transition-all ${
              billingPeriod === 'monthly'
                ? 'bg-[var(--color-primary)] text-[var(--text-inverted)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            ماهانه
          </button>
          <button
            type="button"
            onClick={() => setBillingPeriod('yearly')}
            className={`rounded-[var(--radius-sm)] px-6 py-2 text-sm font-bold transition-all ${
              billingPeriod === 'yearly'
                ? 'bg-[var(--color-primary)] text-[var(--text-inverted)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            سالانه
            <span className="mr-1 inline-flex items-center rounded-full bg-[var(--color-success)]/10 px-1.5 py-0.5 text-[10px] font-bold text-[var(--color-success)]">
              صرفه‌جویی
            </span>
          </button>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`card rounded-[var(--radius-lg)] border p-6 space-y-5 relative ${
              plan.recommended
                ? 'border-[var(--color-primary)] shadow-[var(--shadow-strong)]'
                : 'border-[var(--border-light)]'
            }`}
          >
            {plan.recommended && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[var(--color-primary)] px-3 py-1 text-xs font-bold text-[var(--text-inverted)]">
                پیشنهادی
              </div>
            )}
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-[var(--text-primary)]">{plan.title}</h2>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-[var(--text-primary)]">
                  {plan.priceLabel}
                </span>
              </div>
              <p className="text-xs text-[var(--text-muted)]">
                {plan.monthlyCredits} خروجی تمیز در ماه • حداکثر {plan.dailyLimit} در روز
              </p>
            </div>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-[var(--color-success)]">✓</span>
                <span>{plan.monthlyCredits} اعتبار خروجی ماهانه</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[var(--color-success)]">✓</span>
                <span>حداکثر {plan.dailyLimit} خروجی در روز</span>
              </li>
              {plan.topUpsAllowed && (
                <li className="flex items-start gap-2">
                  <span className="text-[var(--color-success)]">✓</span>
                  <span>امکان خرید اعتبار اضافه</span>
                </li>
              )}
              <li className="flex items-start gap-2">
                <span className="text-[var(--color-success)]">✓</span>
                <span>پردازش محلی در مرورگر</span>
              </li>
            </ul>
            <button
              type="button"
              onClick={() => handleCheckout(plan.id)}
              disabled={!billingActive || loading === plan.id}
              className={`inline-flex w-full items-center justify-center rounded-[var(--radius-md)] px-4 py-2.5 text-sm font-bold transition-all border ${
                plan.recommended
                  ? 'bg-[var(--color-primary)] text-[var(--text-inverted)] border-[var(--color-primary)]'
                  : 'border-[var(--border-light)] bg-[var(--surface-1)] text-[var(--text-primary)] hover:border-[var(--color-primary)]'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {!billingActive
                ? 'به‌زودی فعال می‌شود'
                : loading === plan.id
                  ? 'در حال اتصال...'
                  : 'خرید اشتراک'}
            </button>
          </div>
        ))}
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-[var(--text-primary)] text-center">
          بسته‌های اضافه (تکمیلی)
        </h2>
        <p className="text-sm text-[var(--text-secondary)] text-center">
          اعتبار کم آمد؟ بسته اضافه بخرید بدون تغییر اشتراک.
        </p>
        <div className="grid gap-4 md:grid-cols-3">
          {TOP_UP_PACKS.map((pack) => (
            <div
              key={pack.id}
              className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-4 text-center space-y-2"
            >
              <p className="text-lg font-bold text-[var(--text-primary)]">{pack.credits} خروجی</p>
              <p className="text-sm text-[var(--text-secondary)]">
                {formatPrice(pack.price)} تومان
              </p>
              <p className="text-xs text-[var(--text-muted)]">{pack.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-6 space-y-4">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">سؤالات متداول</h2>
        <div className="space-y-3 text-sm text-[var(--text-secondary)]">
          <div>
            <p className="font-bold text-[var(--text-primary)]">
              آیا استفاده پایه واقعاً رایگان است؟
            </p>
            <p>بله، تمام ابزارهای پایه رایگان هستند. خروجی با واترمارک همیشه رایگان است.</p>
          </div>
          <div>
            <p className="font-bold text-[var(--text-primary)]">
              هر خروجی تمیز چقدر اعتبار مصرف می‌کند؟
            </p>
            <p>هر خروجی تمیز (بدون واترمارک) = ۱ اعتبار. دانلود مجدد ظرف ۳۰ دقیقه رایگان است.</p>
          </div>
          <div>
            <p className="font-bold text-[var(--text-primary)]">آیا اطلاعات من ذخیره می‌شود؟</p>
            <p>خیر، تمام پردازش‌ها در مرورگر شما انجام می‌شود. اطلاعات شخصی هرگز ارسال نمی‌شود.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
