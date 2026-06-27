'use client';

import { useState } from 'react';
import { isFeatureEnabled } from '@/lib/features/availability';
import { CREDIT_PLANS, TOP_UP_PACKS, formatPrice } from '@/lib/pricing/exportCredits';

type BillingPeriod = 'monthly' | 'yearly';

const freeTier = {
  id: 'free',
  title: 'رایگان',
  description: 'برای شروع و استفاده روزمره',
  priceLabel: 'رایگان',
  monthlyCredits: 0,
  dailyLimit: 0,
  topUpsAllowed: false,
  recommended: false,
  features: ['ابزارهای پایه', 'خروجی با واترمارک', 'بدون ثبت‌نام', 'پردازش محلی'],
} as const;

function getPricingPlans(period: BillingPeriod) {
  if (period === 'monthly') {
    return [
      freeTier,
      {
        ...CREDIT_PLANS.find((p) => p.id === 'basic')!,
        priceLabel: `${formatPrice(99000)} تومان`,
        monthlyLabel: `${formatPrice(99000)} تومان / ماه`,
      },
      {
        ...CREDIT_PLANS.find((p) => p.id === 'standard')!,
        priceLabel: `${formatPrice(199000)} تومان`,
        monthlyLabel: `${formatPrice(199000)} تومان / ماه`,
        recommended: true,
      },
      {
        ...CREDIT_PLANS.find((p) => p.id === 'pro')!,
        priceLabel: `${formatPrice(399000)} تومان`,
        monthlyLabel: `${formatPrice(399000)} تومان / ماه`,
      },
    ];
  }
  return [
    freeTier,
    {
      ...CREDIT_PLANS.find((p) => p.id === 'basic')!,
      priceLabel: `${formatPrice(890000)} تومان / سالانه`,
      monthlyLabel: `${formatPrice(74000)} تومان / ماه`,
      monthlyCredits: 10,
    },
    {
      ...CREDIT_PLANS.find((p) => p.id === 'standard')!,
      priceLabel: `${formatPrice(1790000)} تومان / سالانه`,
      monthlyLabel: `${formatPrice(149000)} تومان / ماه`,
      monthlyCredits: 120,
      recommended: true,
    },
    {
      ...CREDIT_PLANS.find((p) => p.id === 'pro')!,
      priceLabel: `${formatPrice(3590000)} تومان / سالانه`,
      monthlyLabel: `${formatPrice(299000)} تومان / ماه`,
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
      const redirectUrl = data.payUrl ?? data.checkoutUrl;
      if (data.ok && redirectUrl) {
        window.location.href = redirectUrl;
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
          ابزارهای پایه همیشه رایگان هستند. برای خروجی بدون واترمارک، اشتراک بخرید.
        </p>
        {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}
      </section>

      <section className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-6 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">
          مقایسه نسخه رایگان و حرفه‌ای
        </h2>
        <div className="grid gap-4 md:grid-cols-2 text-sm">
          <div className="space-y-2">
            <div className="font-bold text-[var(--text-primary)]">نسخه رایگان</div>
            <div className="flex items-start gap-2">
              <span className="text-[var(--color-success)]">✓</span>
              <span>تمام ابزارهای پایه</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[var(--color-success)]">✓</span>
              <span>خروجی با واترمارک</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[var(--color-success)]">✓</span>
              <span>بدون ثبت‌نام</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="font-bold text-[var(--color-primary)]">نسخه حرفه‌ای</div>
            <div className="flex items-start gap-2">
              <span className="text-[var(--color-primary)]">✦</span>
              <span>خروجی بدون واترمارک</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[var(--color-primary)]">✦</span>
              <span>قالب‌های حرفه‌ای</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[var(--color-primary)]">✦</span>
              <span>خروجی Word</span>
            </div>
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

      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {plans.map((plan) =>
          plan.id === 'free' ? (
            <div
              key={plan.id}
              className="card rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-6 space-y-5"
            >
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-[var(--text-primary)]">{plan.title}</h2>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-[var(--color-success)]">
                    {plan.priceLabel}
                  </span>
                </div>
                <p className="text-xs text-[var(--text-muted)]">
                  بدون محدودیت زمانی • بدون نیاز به ثبت‌نام
                </p>
              </div>
              <ul className="space-y-2 text-sm">
                {'features' in plan &&
                  plan.features?.map((f: string) => (
                    <li key={f} className="flex items-start gap-2">
                      <span className="text-[var(--color-success)]">✓</span>
                      <span>{f}</span>
                    </li>
                  ))}
              </ul>
              <a
                href="/tools"
                className="inline-flex w-full items-center justify-center rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] px-4 py-2.5 text-sm font-bold text-[var(--text-primary)] transition-all hover:border-[var(--color-primary)]"
              >
                شروع کنید — بدون ثبت‌نام
              </a>
            </div>
          ) : (
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
                {'monthlyLabel' in plan && plan.monthlyLabel && (
                  <p className="text-xs text-[var(--color-success)] font-semibold">
                    {plan.monthlyLabel}
                  </p>
                )}
                <p className="text-xs text-[var(--text-muted)]">
                  {plan.monthlyCredits} خروجی تمیز در ماه • حداکثر {plan.dailyLimit} در روز
                </p>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-[var(--color-success)]">✓</span>
                  <span>{plan.monthlyCredits} خروجی تمیز در ماه</span>
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
          ),
        )}
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
            <p>
              بله، تمام ابزارهای پایه رایگان هستند. فقط خروجی بدون واترمارک نیاز به اشتراک دارد.
            </p>
          </div>
          <div>
            <p className="font-bold text-[var(--text-primary)]">چه زمانی به اشتراک نیاز دارم؟</p>
            <p>
              وقتی می‌خواهید فاکتور، رسید یا رزومه بدون واترمارک خروجی بگیرید. ابزارهای محاسباتی و
              متنی همیشه رایگان هستند.
            </p>
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
