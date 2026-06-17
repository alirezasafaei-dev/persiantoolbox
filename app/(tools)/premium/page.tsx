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

export default function PremiumPage() {
  const [subscription, setSubscription] = useState<UserSubscription>(null);
  const [loading, setLoading] = useState(true);

  const loadStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/subscription/status', { cache: 'no-store' });
      if (res.ok) {
        const data = (await res.json()) as { ok: boolean; subscription?: UserSubscription };
        if (data.ok && data.subscription) {
          setSubscription(data.subscription);
        }
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStatus();
  }, [loadStatus]);

  if (loading) {
    return (
      <div className="section-surface p-6 md:p-8">
        <div className="text-center text-[var(--text-muted)] py-8">در حال بارگذاری...</div>
      </div>
    );
  }

  const premiumPlans = [
    {
      id: 'basic_monthly' as PlanId,
      name: 'پایه',
      price: '۴۹,۰۰۰',
      period: 'ماهانه',
      features: [
        'دسترسی به ابزارهای PDF',
        'دسترسی به ابزارهای تصویر',
        'حذف تبلیغات',
        '۵۰ استفاده روزانه',
      ],
    },
    {
      id: 'pro_monthly' as PlanId,
      name: 'حرفه‌ای',
      price: '۹۹,۰۰۰',
      period: 'ماهانه',
      popular: true,
      features: [
        'دسترسی به تمام ابزارها',
        'استفاده نامحدود',
        'خروجی در فرمت‌های مختلف',
        'اولویت پشتیبانی',
        'حذف تبلیغات',
      ],
    },
    {
      id: 'pro_yearly' as PlanId,
      name: 'حرفه‌ای سالانه',
      price: '۹۹۰,۰۰۰',
      period: 'سالانه',
      features: [
        'تمام امکانات حرفه‌ای',
        '۲۰٪ تخفیف نسبت به ماهانه',
        'پشتیبانی اختصاصی',
        'گزارش‌های تحلیلی',
      ],
    },
  ];

  return (
    <div className="section-surface p-6 md:p-8 space-y-8">
      {subscription && (
        <Alert variant="info" title="اشتراک فعال">
          شما در حال حاضر اشتراک{' '}
          {SUBSCRIPTION_PLANS.find((p) => p.id === subscription.planId)?.title ?? ''} فعال دارید.
        </Alert>
      )}

      <div className="text-center">
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-4">اشتراک حرفه‌ای</h1>
        <p className="text-[var(--text-secondary)] max-w-2xl mx-auto">
          با اشتراک حرفه‌ای به تمام ابزارها دسترسی نامحدود داشته باشید
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {premiumPlans.map((plan) => (
          <Card
            key={plan.id}
            className={`relative ${plan.popular ? 'border-2 border-[var(--color-primary)]' : ''}`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[var(--color-primary)] text-[var(--text-inverted)] px-4 py-1 rounded-full text-sm font-medium">
                محبوب‌ترین
              </div>
            )}
            <div className="p-6">
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">{plan.name}</h3>
              <div className="mb-6">
                <span className="text-3xl font-bold text-[var(--color-primary)]">{plan.price}</span>
                <span className="text-[var(--text-secondary)]"> تومان/{plan.period}</span>
              </div>
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-[var(--text-primary)]">
                    <span className="text-[var(--color-success)]">&#10003;</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <Button
                variant={plan.popular ? 'primary' : 'secondary'}
                fullWidth
                onClick={() => {
                  window.location.href = `/subscription?plan=${plan.id}`;
                }}
              >
                {subscription?.planId === plan.id ? 'اشتراک فعلی' : 'انتخاب طرح'}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
