'use client';

import { useCallback, useEffect, useState } from 'react';
import Card from '@/shared/ui/Card';
import Button from '@/shared/ui/Button';
import Alert from '@/shared/ui/Alert';
import { SUBSCRIPTION_PLANS, type PlanId } from '@/lib/subscriptionPlans';

type SubscriptionStatus = {
  id: string;
  planId: PlanId;
  status: 'active' | 'canceled' | 'expired';
  startedAt: number;
  expiresAt: number;
} | null;

export default function SubscriptionContent() {
  const [status, setStatus] = useState<SubscriptionStatus>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/subscription/status');
      if (res.ok) {
        const data = await res.json();
        setStatus(data.subscription ?? null);
      }
    } catch {
      setError('خطا در دریافت وضعیت اشتراک');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchStatus();
  }, [fetchStatus]);

  const handleCheckout = async (planId: PlanId) => {
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
        setError(data.errors?.[0] ?? 'خطا در ایجاد درخواست پرداخت.');
      }
    } catch {
      setError('خطا در ارتباط با سرور.');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 py-8">
        <div className="text-center text-[var(--text-muted)] py-8">در حال بارگذاری...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="section-surface rounded-[var(--radius-lg)] border border-[var(--border-light)] p-6 md:p-8">
        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-4">مدیریت اشتراک</h1>
        {status ? (
          <div className="space-y-3">
            <p className="text-[var(--text-secondary)]">
              طرح فعلی:{' '}
              <span className="font-semibold text-[var(--text-primary)]">
                {SUBSCRIPTION_PLANS.find((p) => p.id === status.planId)?.title ?? status.planId}
              </span>
            </p>
            <p className="text-[var(--text-secondary)]">
              وضعیت:{' '}
              <span
                className={`font-semibold ${status.status === 'active' ? 'text-[var(--color-success)]' : 'text-[var(--text-muted)]'}`}
              >
                {status.status === 'active'
                  ? 'فعال'
                  : status.status === 'canceled'
                    ? 'لغو شده'
                    : 'منقضی شده'}
              </span>
            </p>
            <p className="text-sm text-[var(--text-muted)]">
              تاریخ شروع: {new Intl.DateTimeFormat('fa-IR').format(new Date(status.startedAt))}
            </p>
            <p className="text-sm text-[var(--text-muted)]">
              تاریخ انقضا: {new Intl.DateTimeFormat('fa-IR').format(new Date(status.expiresAt))}
            </p>
          </div>
        ) : (
          <p className="text-[var(--text-secondary)]">شما هیچ اشتراک فعالی ندارید.</p>
        )}
      </section>

      {error && (
        <Alert variant="danger" title="خطا">
          {error}
        </Alert>
      )}

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">انتخاب طرح</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {SUBSCRIPTION_PLANS.map((plan) => (
            <Card key={plan.id} className="p-6 space-y-4">
              <div>
                <h3 className="text-lg font-bold text-[var(--text-primary)]">{plan.title}</h3>
                <p className="text-2xl font-black text-[var(--color-primary)] mt-2">
                  {new Intl.NumberFormat('fa-IR').format(plan.price)} تومان
                </p>
                <p className="text-sm text-[var(--text-muted)] mt-1">
                  {plan.periodDays <= 30 ? 'ماهانه' : 'سالانه'}
                </p>
              </div>
              <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
                <li>ذخیره‌سازی: {plan.storageMb} MB</li>
                <li>نگهداری تاریخچه: {plan.retentionDays} روز</li>
              </ul>
              <Button onClick={() => void handleCheckout(plan.id)} className="w-full">
                خرید اشتراک
              </Button>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
