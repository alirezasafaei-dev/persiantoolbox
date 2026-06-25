'use client';

import Link from 'next/link';
import { Card } from '@/components/ui';
import { isFeatureEnabled } from '@/lib/features/availability';

const plans = [
  {
    id: 'free',
    name: 'رایگان',
    price: '۰',
    period: 'برای همیشه',
    description: 'شروع سریع با ابزارهای پایه',
    cta: 'شروع کنید',
    ctaHref: '/topics',
    ctaVariant: 'secondary' as const,
    features: [
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
    ],
  },
  {
    id: 'pro',
    name: 'حرفه‌ای',
    price: '۹۹.۰۰۰',
    period: 'ماهانه',
    description: 'برای کاربران حرفه‌ای و SME',
    cta: 'به‌زودی فعال می‌شود',
    ctaHref: '/support',
    ctaVariant: 'primary' as const,
    popular: true,
    features: [
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
    ],
  },
  {
    id: 'business',
    name: 'کسب‌وکار / API',
    price: 'تماس بگیرید',
    period: '',
    description: 'برای توسعه‌دهندگان و تیم‌ها',
    cta: 'تماس با پشتیبانی',
    ctaHref: '/support',
    ctaVariant: 'secondary' as const,
    features: [
      { text: 'تمام امکانات حرفه‌ای', included: true },
      { text: 'دسترسی API', included: true },
      { text: 'Rate Limit بالاتر', included: true },
      { text: 'قالب‌های سازمانی', included: true },
      { text: 'تنظیمات تیم/فضای کاری', included: true },
      { text: 'پشتیبانی اختصاصی', included: true },
      { text: 'گزارش‌های سفارشی', included: true },
      { text: 'یکپارچه‌سازی با سیستم‌ها', included: true },
    ],
  },
];

export default function PricingContent() {
  const billingActive = isFeatureEnabled('checkout');

  return (
    <div className="space-y-10">
      <div className="text-center space-y-3">
        <h1 className="text-3xl md:text-4xl font-black text-[var(--text-primary)]">
          قیمت‌گذاری ساده و شفاف
        </h1>
        <p className="mx-auto max-w-2xl text-[var(--text-secondary)]">
          ابزارهای پایه همیشه رایگان هستند. برای امکانات حرفه‌ای، اشتراک حرفه‌ای به‌زودی فعال
          خواهد شد.
        </p>
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
                <span className="text-3xl font-black text-[var(--text-primary)]">
                  {plan.price}
                </span>
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
          </Card>
        ))}
      </div>

      <section className="space-y-4 text-center">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">سؤالات متداول</h2>
        <div className="mx-auto max-w-2xl space-y-4 text-left">
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
