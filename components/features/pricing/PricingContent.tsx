'use client';

import { useEffect, useMemo, useState } from 'react';
import { isFeatureEnabled } from '@/lib/features/availability';
import { formatPrice } from '@/lib/pricing/exportCredits';
import { getYearlyMonthlyEquivalent, type PublicPricingConfig } from '@/lib/pricing/pricingConfig';
import { usePricingConfig } from '@/shared/hooks/usePricingConfig';
import type { CreditPlanId } from '@/lib/pricing/exportCredits';

type BillingPeriod = 'monthly' | 'yearly';

type TrialStatus = {
  active: boolean;
  remainingDays: number;
  hasEverUsedTrial: boolean;
  logged: boolean;
};

type PricingContentProps = {
  initialPricing?: PublicPricingConfig;
};

type DisplayPlan = {
  id: CreditPlanId;
  title: string;
  price: number;
  periodDays: number;
  monthlyCredits: number;
  dailyLimit: number;
  maxUsers: number;
  topUpsAllowed: boolean;
  tier: string;
  recommended?: boolean;
  priceLabel: string;
  monthlyLabel?: string;
};

function buildSubscriptionPlans(
  pricing: PublicPricingConfig,
  period: BillingPeriod,
): DisplayPlan[] {
  const planIds: CreditPlanId[] = ['basic', 'standard', 'pro'];
  const plans: DisplayPlan[] = [];
  for (const planId of planIds) {
    const plan = pricing.plans.find((entry) => entry.id === planId);
    if (!plan) {
      continue;
    }
    if (period === 'monthly') {
      plans.push({
        ...plan,
        priceLabel: `${formatPrice(plan.price)} تومان`,
        monthlyLabel: `${formatPrice(plan.price)} تومان / ماه`,
        recommended: plan.recommended ?? planId === 'standard',
      });
      continue;
    }
    const yearlyPrice = pricing.yearlyPrices[planId] ?? plan.price * 12;
    plans.push({
      ...plan,
      priceLabel: `${formatPrice(yearlyPrice)} تومان / سالانه`,
      monthlyLabel: `${formatPrice(getYearlyMonthlyEquivalent(yearlyPrice))} تومان / ماه`,
      recommended: plan.recommended ?? planId === 'standard',
    });
  }
  return plans;
}

export default function PricingContent({ initialPricing }: PricingContentProps) {
  const { pricing } = usePricingConfig(initialPricing);
  const billingActive = isFeatureEnabled('checkout');
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('monthly');
  const [trial, setTrial] = useState<TrialStatus | null>(null);
  const [trialLoading, setTrialLoading] = useState(false);

  useEffect(() => {
    fetch('/api/trial', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : { ok: false }))
      .then((d) => {
        if (d.ok)
          setTrial({
            active: d.active,
            remainingDays: d.remainingDays,
            hasEverUsedTrial: d.hasEverUsedTrial,
            logged: true,
          });
        else setTrial({ active: false, remainingDays: 0, hasEverUsedTrial: false, logged: false });
      })
      .catch(() =>
        setTrial({ active: false, remainingDays: 0, hasEverUsedTrial: false, logged: false }),
      );
  }, []);

  const pack3 = pricing.plans.find((plan) => plan.id === 'pack-3');
  const subscriptionPlans = useMemo(
    () => buildSubscriptionPlans(pricing, billingPeriod),
    [pricing, billingPeriod],
  );

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
        setError(data.errors?.[0] || data.error || 'خطا در ایجاد درخواست پرداخت.');
        setLoading(null);
      }
    } catch {
      setError('خطا در اتصال به سرور پرداخت.');
      setLoading(null);
    }
  };

  const handleStartTrial = async () => {
    if (!trial?.logged) {
      window.location.href = '/account';
      return;
    }
    setTrialLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/trial', { method: 'POST', credentials: 'include' });
      const data = await res.json();
      if (data.ok) {
        setTrial({
          active: true,
          remainingDays: data.remainingDays,
          hasEverUsedTrial: true,
          logged: true,
        });
      } else {
        setError(data.error || 'خطا در شروع دوره آزمایشی.');
      }
    } catch {
      setError('خطا در اتصال به سرور.');
    }
    setTrialLoading(false);
  };

  if (!pack3) {
    return null;
  }

  const getCheckoutLabel = (planId: string, defaultLabel: string) => {
    if (!billingActive) {
      return 'به‌زودی فعال می‌شود';
    }
    if (loading === planId) {
      return 'در حال اتصال...';
    }
    return defaultLabel;
  };

  return (
    <div className="space-y-10">
      <section className="text-center space-y-3">
        <h1 className="text-3xl md:text-4xl font-black text-[var(--text-primary)]">
          قیمت‌گذاری ساده و شفاف
        </h1>
        <p className="mx-auto max-w-2xl text-[var(--text-secondary)]">
          ابزارهای پایه همیشه رایگان هستند. خروجی حرفه‌ای را بدون اشتراک ماهانه بخرید.
        </p>
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-3 text-xs text-[var(--text-muted)]">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-light)] bg-[var(--surface-1)] px-3 py-1.5">
            <span className="text-[var(--color-success)]" aria-hidden="true">
              ✓
            </span>
            پرداخت امن زرین‌پال
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-light)] bg-[var(--surface-1)] px-3 py-1.5">
            <span className="text-[var(--color-success)]" aria-hidden="true">
              ✓
            </span>
            پردازش محلی — بدون ارسال سند
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-light)] bg-[var(--surface-1)] px-3 py-1.5">
            <span className="text-[var(--color-success)]" aria-hidden="true">
              ✓
            </span>
            بسته ۳ خروجی از {pricing.pack3PriceFormatted} تومان
          </span>
        </div>
        {error ? <p className="text-sm text-[var(--color-danger)]">{error}</p> : null}
      </section>

      {trial && !trial.active && !trial.hasEverUsedTrial && (
        <section className="rounded-[var(--radius-lg)] border-2 border-[var(--color-success)] bg-[var(--color-success)]/5 p-6 text-center space-y-3">
          <h2 className="text-lg font-bold text-[var(--text-primary)]">
            دوره آزمایشی ۷ روزه رایگان
          </h2>
          <p className="text-sm text-[var(--text-secondary)]">
            ۷ روز دسترسی کامل به تمام امکانات حرفه‌ای — بدون نیاز به پرداخت
          </p>
          <button
            type="button"
            onClick={handleStartTrial}
            disabled={trialLoading}
            className="inline-flex items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-success)] px-6 py-3 text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {trialLoading ? 'در حال فعال‌سازی...' : 'شروع دوره آزمایشی ۷ روزه رایگان'}
          </button>
        </section>
      )}

      {trial?.active && (
        <section className="rounded-[var(--radius-lg)] border border-[var(--color-success)] bg-[var(--color-success)]/5 p-4 text-center">
          <p className="text-sm text-[var(--color-success)] font-semibold">
            دوره آزمایشی شما فعال است — {trial.remainingDays} روز باقی‌مانده
          </p>
        </section>
      )}

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

      <section className="space-y-4">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black text-[var(--text-primary)]">خرید تکی</h2>
          <p className="text-sm text-[var(--text-secondary)]">
            بدون اشتراک ماهانه — فقط ۳ خروجی حرفه‌ای بخرید
          </p>
        </div>
        <div className="rounded-[var(--radius-lg)] border-2 border-[var(--color-primary)] bg-[var(--surface-1)] p-6 space-y-5 relative shadow-[var(--shadow-strong)]">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[var(--color-primary)] px-4 py-1 text-sm font-bold text-[var(--text-inverted)]">
            بهترین شروع
          </div>
          <div className="space-y-2 text-center">
            <h3 className="text-xl font-bold text-[var(--text-primary)]">{pack3.title}</h3>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-3xl font-black text-[var(--color-primary)]">
                {formatPrice(pack3.price)}
              </span>
              <span className="text-sm text-[var(--text-muted)]">تومان</span>
            </div>
            <p className="text-xs text-[var(--color-success)] font-semibold">
              بدون اشتراک ماهانه • بدون تعهد
            </p>
          </div>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-[var(--color-success)]">✓</span>
              <span>۳ خروجی تمیز (PDF یا Word)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--color-success)]">✓</span>
              <span>بدون واترمارک</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--color-success)]">✓</span>
              <span>قابل استفاده در فاکتور، رزومه، نامه و قرارداد</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--color-success)]">✓</span>
              <span>پردازش محلی — اطلاعات ارسال نمی‌شود</span>
            </li>
          </ul>
          <button
            type="button"
            onClick={() => handleCheckout(pack3.id)}
            disabled={!billingActive || loading === pack3.id}
            className="inline-flex w-full items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-primary)] px-4 py-3 text-sm font-bold text-[var(--text-inverted)] transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {getCheckoutLabel(pack3.id, 'خرید بسته ۳ خروجی')}
          </button>
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
            <span className="ms-1 inline-flex items-center rounded-full bg-[var(--color-success)]/10 px-1.5 py-0.5 text-[10px] font-bold text-[var(--color-success)]">
              صرفه‌جویی
            </span>
          </button>
        </div>
      </section>

      <section className="space-y-4">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black text-[var(--text-primary)]">اشتراک ماهانه/سالانه</h2>
          <p className="text-sm text-[var(--text-secondary)]">
            برای استفاده حرفه‌ای مداوم — خروجی بیشتر، قالب‌های ویژه
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {subscriptionPlans.map((plan) => (
            <div
              key={plan.id}
              className={`card rounded-[var(--radius-lg)] border p-6 space-y-5 relative ${
                plan.recommended
                  ? 'border-[var(--color-primary)] shadow-[var(--shadow-strong)]'
                  : 'border-[var(--border-light)]'
              }`}
            >
              {plan.recommended ? (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[var(--color-primary)] px-3 py-1 text-xs font-bold text-[var(--text-inverted)]">
                  پیشنهادی
                </div>
              ) : null}
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-[var(--text-primary)]">{plan.title}</h2>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-[var(--text-primary)]">
                    {plan.priceLabel}
                  </span>
                </div>
                {plan.monthlyLabel ? (
                  <p className="text-xs text-[var(--color-success)] font-semibold">
                    {plan.monthlyLabel}
                  </p>
                ) : null}
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
                {plan.topUpsAllowed ? (
                  <li className="flex items-start gap-2">
                    <span className="text-[var(--color-success)]">✓</span>
                    <span>امکان خرید اعتبار اضافه</span>
                  </li>
                ) : null}
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
                {getCheckoutLabel(plan.id, 'خرید اشتراک')}
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-[var(--text-primary)] text-center">
          بسته‌های اضافه (تکمیلی)
        </h2>
        <p className="text-sm text-[var(--text-secondary)] text-center">
          اعتبار کم آمد؟ بسته اضافه بخرید بدون تغییر اشتراک.
        </p>
        <div className="grid gap-4 md:grid-cols-3">
          {pricing.topUps.map((pack) => (
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
              بله، تمام ابزارهای پایه رایگان هستند. فقط خروجی بدون واترمارک نیاز به خرید اعتبار
              دارد.
            </p>
          </div>
          <div>
            <p className="font-bold text-[var(--text-primary)]">
              آیا بدون اشتراک هم می‌توانم خروجی حرفه‌ای بگیرم؟
            </p>
            <p>
              بله! بسته ۳ خروجی فقط {pricing.pack3PriceFormatted} تومان است و نیازی به اشتراک ماهانه
              ندارد. هر خروجی تمیز ۱ اعتبار مصرف می‌کند.
            </p>
          </div>
          <div>
            <p className="font-bold text-[var(--text-primary)]">چه زمانی به اشتراک نیاز دارم؟</p>
            <p>
              اگر ماهانه بیش از ۳ خروجی حرفه‌ای نیاز دارید، اشتراک مقرون‌به‌صرفه‌تر است. برای
              استفاده کمتر، بسته تکی بهترین گزینه است.
            </p>
          </div>
          <div>
            <p className="font-bold text-[var(--text-primary)]">آیا اطلاعات من ذخیره می‌شود؟</p>
            <p>خیر، تمام پردازش‌ها در مرورگر شما انجام می‌شود. اطلاعات شخصی هرگز ارسال نمی‌شود.</p>
          </div>
          <div>
            <p className="font-bold text-[var(--text-primary)]">پرداخت چگونه انجام می‌شود؟</p>
            <p>
              پرداخت از درگاه امن زرین‌پال انجام می‌شود. پس از تأیید، اعتبار خروجی یا اشتراک شما
              فعال می‌شود.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
