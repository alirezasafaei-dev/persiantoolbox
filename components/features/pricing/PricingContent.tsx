'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui';
import { isFeatureEnabled } from '@/lib/features/availability';

type BillingPeriod = 'monthly' | 'yearly';

const freeFeatures = [
  { text: 'تمام ابزارهای پایه', included: true },
  { text: 'پردازش تک‌فایلی', included: true },
  { text: 'خروجی استاندارد', included: true },
  { text: 'بدون ثبت‌نام', included: true },
  { text: 'پردازش محلی در مرورگر', included: true },
  { text: 'پشتیبانی ایمیلی', included: true },
  { text: 'پردازش چندفایلی (Batch)', included: false },
  { text: 'OCR پیشرفته', included: false },
  { text: 'خروجی HD', included: false },
  { text: 'قالب‌های حرفه‌ای فاکتور و گزارش', included: false },
  { text: 'ذخیره تاریخچه', included: false },
  { text: 'بدون تبلیغات', included: false },
];

const basicFeatures = [
  { text: 'تمام ابزارهای پایه', included: true },
  { text: 'پردازش تک‌فایلی', included: true },
  { text: 'خروجی استاندارد', included: true },
  { text: 'بدون ثبت‌نام', included: true },
  { text: 'پردازش محلی در مرورگر', included: true },
  { text: 'پشتیبانی اولویت‌دار', included: true },
  { text: 'پردازش چندفایلی (Batch)', included: true },
  { text: 'OCR پیشرفته', included: true },
  { text: 'خروجی HD', included: true },
  { text: 'قالب‌های حرفه‌ای فاکتور و گزارش', included: true },
  { text: 'ذخیره تاریخچه', included: true },
  { text: 'بدون تبلیغات', included: true },
];

const proFeatures = [
  { text: 'تمام امکانات پایه', included: true },
  { text: 'پردازش چندفایلی (Batch)', included: true },
  { text: 'OCR پیشرفته', included: true },
  { text: 'خروجی HD', included: true },
  { text: 'قالب‌های حرفه‌ای فاکتور و گزارش', included: true },
  { text: 'ذخیره تاریخچه نامحدود', included: true },
  { text: 'بدون تبلیغات', included: true },
  { text: 'داشبورد مالی پیشرفته', included: true },
  { text: 'گزارش‌های PDF سفارشی', included: true },
  { text: 'پشتیبانی اختصاصی', included: true },
];

function formatPrice(amount: number): string {
  return amount.toLocaleString('fa-IR');
}

function getPlanPrices(period: BillingPeriod) {
  return period === 'monthly' ? { basic: 99000, pro: 199000 } : { basic: 890000, pro: 1790000 };
}

function getPlanCheckoutId(period: BillingPeriod, tier: 'basic' | 'pro'): string {
  return period === 'monthly' ? `${tier}-monthly` : `${tier}-yearly`;
}

export default function PricingContent() {
  const billingActive = isFeatureEnabled('checkout');
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('monthly');

  const prices = getPlanPrices(billingPeriod);
  const yearlySavings = Math.round(((prices.basic * 12 - 890000) / (prices.basic * 12)) * 100);

  const handleCheckout = async (planId: string) => {
    setError(null);
    setLoading(planId);
    try {
      const meRes = await fetch('/api/auth/me');
      const meData = await meRes.json();
      if (!meData.ok || !meData.user) {
        router.push('/account?redirect=/pricing');
        return;
      }

      const res = await fetch('/api/subscription/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      });
      const data = await res.json();
      if (data.ok && data.payUrl) {
        window.location.href = data.payUrl;
      } else {
        const msg = data.errors?.[0] ?? 'خطا در ایجاد درخواست پرداخت.';
        setError(msg);
      }
    } catch {
      setError('خطا در اتصال به سرور.');
    } finally {
      setLoading(null);
    }
  };

  const plans = [
    {
      id: 'free',
      name: 'رایگان',
      price: '۰',
      period: 'برای همیشه',
      description: 'شروع سریع با ابزارهای پایه',
      cta: 'شروع کنید',
      ctaHref: '/account',
      ctaVariant: 'secondary' as const,
      checkoutPlanId: null,
      features: freeFeatures,
    },
    {
      id: 'basic',
      name: 'پایه',
      price: formatPrice(prices.basic),
      period: billingPeriod === 'monthly' ? 'ماهانه' : 'سالانه',
      description:
        billingPeriod === 'monthly'
          ? 'برای کاربران منظم'
          : `${yearlySavings}% صرفه‌جویی نسبت به ماهانه`,
      cta: 'خرید اشتراک',
      ctaHref: '',
      ctaVariant: 'secondary' as const,
      checkoutPlanId: getPlanCheckoutId(billingPeriod, 'basic'),
      features: basicFeatures,
    },
    {
      id: 'pro',
      name: 'حرفه‌ای',
      price: formatPrice(prices.pro),
      period: billingPeriod === 'monthly' ? 'ماهانه' : 'سالانه',
      description: 'برای کاربران حرفه‌ای و تیم‌ها',
      cta: 'خرید اشتراک',
      ctaHref: '',
      ctaVariant: 'primary' as const,
      checkoutPlanId: getPlanCheckoutId(billingPeriod, 'pro'),
      popular: true,
      features: proFeatures,
    },
  ];

  return (
    <div className="space-y-10">
      <div className="text-center space-y-3">
        <h1 className="text-3xl md:text-4xl font-black text-[var(--text-primary)]">
          قیمت‌گذاری ساده و شفاف
        </h1>
        <p className="mx-auto max-w-2xl text-[var(--text-secondary)]">
          ابزارهای پایه همیشه رایگان هستند. برای امکانات حرفه‌ای، پلن مناسب خود را انتخاب کنید.
        </p>
      </div>

      <div className="flex justify-center">
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
      </div>

      {!billingActive && (
        <div className="rounded-[var(--radius-lg)] border border-[rgb(var(--color-info-rgb)/0.3)] bg-[rgb(var(--color-info-rgb)/0.08)] p-4 text-center">
          <p className="text-sm text-[var(--color-info)]">
            سیستم پرداخت در حال تکمیل است. برای اطلاع از زمان فعال‌سازی، با ما در تماس باشید.
          </p>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={`p-6 space-y-5 relative ${
              plan.popular
                ? 'border-2 border-[var(--color-primary)] shadow-[var(--shadow-medium)]'
                : ''
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[var(--color-primary)] px-4 py-1 text-xs font-bold text-[var(--text-inverted)]">
                محبوب‌ترین
              </div>
            )}

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-[var(--text-primary)]">{plan.name}</h2>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-[var(--text-primary)]">{plan.price}</span>
                {plan.period && (
                  <span className="text-sm text-[var(--text-muted)]">تومان / {plan.period}</span>
                )}
              </div>
              <p className="text-xs text-[var(--text-muted)]">{plan.description}</p>
            </div>

            <ul className="space-y-2.5">
              {plan.features.map((feature) => (
                <li key={feature.text} className="flex items-start gap-2 text-sm">
                  {feature.included ? (
                    <svg
                      className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-success)]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg
                      className="mt-0.5 h-4 w-4 shrink-0 text-[var(--text-muted)]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                  <span
                    className={
                      feature.included
                        ? 'text-[var(--text-primary)]'
                        : 'text-[var(--text-muted)] line-through'
                    }
                  >
                    {feature.text}
                  </span>
                </li>
              ))}
            </ul>

            {plan.checkoutPlanId && billingActive ? (
              <button
                type="button"
                onClick={() => void handleCheckout(plan.checkoutPlanId!)}
                disabled={loading !== null}
                className={`inline-flex w-full items-center justify-center rounded-[var(--radius-md)] px-4 py-2.5 text-sm font-bold transition-all ${
                  plan.ctaVariant === 'primary'
                    ? 'bg-[var(--color-primary)] text-[var(--text-inverted)] hover:bg-[var(--color-primary-hover)]'
                    : 'border border-[var(--border-light)] bg-[var(--surface-1)] text-[var(--text-primary)] hover:border-[var(--color-primary)] hover:bg-[rgb(var(--color-primary-rgb)/0.05)]'
                } mt-auto disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading === plan.checkoutPlanId ? 'در حال پردازش...' : plan.cta}
              </button>
            ) : plan.checkoutPlanId && !billingActive ? (
              <span className="inline-flex w-full items-center justify-center rounded-[var(--radius-md)] px-4 py-2.5 text-sm font-bold border border-[var(--border-light)] bg-[var(--surface-1)] text-[var(--text-muted)] mt-auto cursor-not-allowed">
                به‌زودی فعال می‌شود
              </span>
            ) : (
              <Link
                href={plan.ctaHref}
                className={`inline-flex w-full items-center justify-center rounded-[var(--radius-md)] px-4 py-2.5 text-sm font-bold transition-all ${
                  plan.ctaVariant === 'primary'
                    ? 'bg-[var(--color-primary)] text-[var(--text-inverted)] hover:bg-[var(--color-primary-hover)]'
                    : 'border border-[var(--border-light)] bg-[var(--surface-1)] text-[var(--text-primary)] hover:border-[var(--color-primary)] hover:bg-[rgb(var(--color-primary-rgb)/0.05)]'
                } mt-auto`}
              >
                {plan.cta}
              </Link>
            )}
          </Card>
        ))}
      </div>

      {error && (
        <div className="rounded-[var(--radius-lg)] border border-[rgb(var(--color-error-rgb)/0.3)] bg-[rgb(var(--color-error-rgb)/0.08)] p-4 text-center">
          <p className="text-sm text-[var(--color-error)]">{error}</p>
        </div>
      )}

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-[var(--text-primary)] text-center">
          مقایسه ویژگی‌ها
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-[var(--border-light)]">
                <th className="px-4 py-3 text-right font-bold text-[var(--text-primary)]">ویژگی</th>
                <th className="px-4 py-3 text-center font-bold text-[var(--text-primary)]">
                  رایگان
                </th>
                <th className="px-4 py-3 text-center font-bold text-[var(--text-primary)]">پایه</th>
                <th className="px-4 py-3 text-center font-bold text-[var(--color-primary)]">
                  حرفه‌ای
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-light)]">
              {[
                { feature: 'ابزارهای پایه', free: '✓', basic: '✓', pro: '✓' },
                { feature: 'پردازش چندفایلی', free: '✗', basic: '✓', pro: '✓' },
                { feature: 'OCR پیشرفته', free: '✗', basic: '✓', pro: '✓' },
                { feature: 'خروجی HD', free: '✗', basic: '✓', pro: '✓' },
                { feature: 'قالب فاکتور و گزارش', free: '✗', basic: '✓', pro: '✓' },
                { feature: 'ذخیره تاریخچه', free: '✗', basic: '✓', pro: 'نامحدود' },
                { feature: 'داشبورد مالی', free: '✗', basic: '✗', pro: '✓' },
                { feature: 'گزارش PDF سفارشی', free: '✗', basic: '✗', pro: '✓' },
                { feature: 'پشتیبانی', free: 'ایمیلی', basic: 'اولویت‌دار', pro: 'اختصاصی' },
              ].map((row) => (
                <tr
                  key={row.feature}
                  className="hover:bg-[rgb(var(--color-primary-rgb)/0.03)] transition-colors"
                >
                  <td className="px-4 py-3 text-[var(--text-primary)] font-medium">
                    {row.feature}
                  </td>
                  {(['free', 'basic', 'pro'] as const).map((col) => (
                    <td
                      key={col}
                      className={`px-4 py-3 text-center ${
                        row[col] === '✓'
                          ? 'text-[var(--color-success)] font-bold'
                          : row[col] === '✗'
                            ? 'text-[var(--text-muted)]'
                            : 'text-[var(--text-primary)]'
                      }`}
                    >
                      {row[col]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-[var(--text-primary)] text-center">
          چرا اعتماد کنید؟
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            { icon: '🔒', title: 'پردازش محلی', desc: 'داده‌ها از مرورگر خارج نمی‌شوند' },
            {
              icon: '👤',
              title: 'بدون نیاز به ثبت‌نام',
              desc: 'برای ابزارهای رایگان نیازی به ثبت‌نام نیست',
            },
            { icon: '🚫', title: 'لغو اشتراک در هر زمان', desc: 'هیچ تعهد بلندمدتی ندارید' },
            { icon: '💬', title: 'پشتیبانی فارسی', desc: 'تیم پشتیبانی به زبان فارسی پاسخ می‌دهد' },
          ].map((item) => (
            <div
              key={item.title}
              className="flex items-start gap-3 rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-4"
            >
              <span className="text-2xl">{item.icon}</span>
              <div>
                <div className="text-sm font-bold text-[var(--text-primary)]">{item.title}</div>
                <div className="text-xs text-[var(--text-muted)] mt-0.5">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4 text-center">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">سؤالات متداول</h2>
        <div className="mx-auto max-w-2xl space-y-4 text-start">
          {[
            {
              q: 'آیا استفاده از ابزارهای پایه واقعاً رایگان است؟',
              a: 'بله، تمام ابزارهای پایه برای همیشه رایگان هستند و بدون ثبت‌نام قابل استفاده‌اند.',
            },
            {
              q: 'چه زمانی اشتراک حرفه‌ای فعال می‌شود؟',
              a: 'سیستم پرداخت در حال تکمیل است. برای اطلاع از زمان فعال‌سازی با ما در تماس باشید.',
            },
            {
              q: 'آیا اطلاعات من ذخیره می‌شود؟',
              a: 'خیر، تمام پردازش‌ها در مرورگر شما انجام می‌شود و هیچ داده‌ای به سرور ارسال نمی‌شود.',
            },
          ].map((item) => (
            <div
              key={item.q}
              className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-4"
            >
              <div className="text-sm font-bold text-[var(--text-primary)]">{item.q}</div>
              <div className="mt-1 text-xs text-[var(--text-muted)] leading-5">{item.a}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
