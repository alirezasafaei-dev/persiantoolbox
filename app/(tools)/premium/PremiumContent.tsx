'use client';

import { useCallback, useEffect, useState } from 'react';
import Card from '@/shared/ui/Card';
import Button from '@/shared/ui/Button';
import Alert from '@/shared/ui/Alert';
import { SUBSCRIPTION_PLANS, type PlanId } from '@/lib/subscriptionPlans';

type UserSubscription = {
  planId: PlanId;
  status: string;
  expiresAt: number;
} | null;

const PREMIUM_PLANS = [
  {
    id: 'basic_monthly' as PlanId,
    title: 'پایه ماهانه',
    price: 49000,
    features: ['ذخیره‌سازی ۵۰۰ مگابایت', 'تاریخچه ۳۰ روز', 'ابزارهای پایه'],
    popular: false,
  },
  {
    id: 'pro_monthly' as PlanId,
    title: 'حرفه‌ای ماهانه',
    price: 99000,
    features: ['ذخیره‌سازی ۲ گیگابایت', 'تاریخچه ۹۰ روز', 'تمام ابزارها', 'اولویت پشتیبانی'],
    popular: true,
  },
  {
    id: 'pro_yearly' as PlanId,
    title: 'حرفه‌ای سالانه',
    price: 990000,
    features: ['ذخیره‌سازی ۵ گیگابایت', 'تاریخچه نامحدود', 'تمام ابزارها', 'اولویت پشتیبانی', 'تخفیف ویژه'],
    popular: false,
  },
];

export default function PremiumContent() {
  const [subscription, setSubscription] = useState<UserSubscription>(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/subscription/status');
      if (res.ok) {
        const data = await res.json();
        setSubscription(data.subscription ?? null);
      }
    } catch (err) {
      console.error('Failed to fetch subscription status:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchStatus();
  }, [fetchStatus]);

  if (loading) {
    return (
      <div className="space-y-6 py-8">
        <div className="text-center text-[var(--text-muted)] py-8">در حال بارگذاری...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="section-surface rounded-[var(--radius-lg)] border border-[var(--border-light)] p-6 md:p-8 text-center">
        <h1 className="text-3xl font-black text-[var(--text-primary)] mb-4">اشتراک حرفه‌ای</h1>
        <p className="text-[var(--text-secondary)] max-w-2xl mx-auto">
          با اشتراک حرفه‌ای به امکانات پیشرفته جعبه ابزار فارسی دسترسی پیدا کنید. تمام پردازش‌ها محلی و امن هستند.
        </p>
      </section>

      {subscription && (
        <Alert
          variant="info"
          title="اشتراک فعال"
        >
          {`شما دارای اشتراک ${SUBSCRIPTION_PLANS.find((p) => p.id === subscription.planId)?.title ?? ''} هستید.`}
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {PREMIUM_PLANS.map((plan) => (
          <Card key={plan.id} className={`p-6 space-y-4 ${plan.popular ? 'border-2 border-[var(--color-primary)]' : ''}`}>
            {plan.popular && (
              <span className="inline-block rounded-full bg-[var(--color-primary)] px-3 py-1 text-xs font-bold text-[var(--text-inverted)]">
                محبوب‌ترین
              </span>
            )}
            <h3 className="text-xl font-bold text-[var(--text-primary)]">{plan.title}</h3>
            <p className="text-3xl font-black text-[var(--color-primary)]">
              {new Intl.NumberFormat('fa-IR').format(plan.price)} <span className="text-sm font-normal text-[var(--text-muted)]">تومان</span>
            </p>
            <ul className="space-y-2">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                  <span className="text-[var(--color-success)]">✓</span>
                  {feature}
                </li>
              ))}
            </ul>
            <Button
              onClick={() => {
                window.location.href = `/subscription?plan=${plan.id}`;
              }}
              className="w-full"
              variant={plan.popular ? 'primary' : 'secondary'}
            >
              انتخاب طرح
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
