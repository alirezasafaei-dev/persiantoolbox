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

const formatDate = (value: number) =>
  new Intl.DateTimeFormat('fa-IR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));

export default function SubscriptionPage() {
  const [subscription, setSubscription] = useState<SubscriptionStatus>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<PlanId>('basic_monthly');
  const [purchasing, setPurchasing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const loadStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/subscription/status', { cache: 'no-store' });
      if (res.ok) {
        const data = (await res.json()) as { ok: boolean; subscription?: SubscriptionStatus };
        if (data.ok && data.subscription) {
          setSubscription(data.subscription);
        } else {
          setSubscription(null);
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

  const handleCheckout = async () => {
    setPurchasing(true);
    setMessage(null);
    try {
      const res = await fetch('/api/subscription/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: selectedPlan }),
      });
      const data = (await res.json()) as { ok: boolean; payUrl?: string; error?: string };
      if (data.ok && data.payUrl) {
        window.location.href = data.payUrl;
        return;
      }
      setMessage(data.error ?? 'خطا در ایجاد درخواست پرداخت.');
    } catch {
      setMessage('خطا در ارتباط با سرور.');
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <div className="section-surface p-6 md:p-8">
        <div className="text-center text-[var(--text-muted)] py-8">در حال بارگذاری...</div>
      </div>
    );
  }

  return (
    <div className="section-surface p-6 md:p-8 space-y-6">
      <h1 className="text-2xl font-bold text-[var(--text-primary)]">مدیریت اشتراک</h1>

      {subscription ? (
        <Card className="p-6">
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">اشتراک فعلی</h2>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">طرح:</span>
              <span className="font-medium text-[var(--text-primary)]">
                {SUBSCRIPTION_PLANS.find((p) => p.id === subscription.planId)?.title ??
                  subscription.planId}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">وضعیت:</span>
              <span
                className={`font-medium ${
                  subscription.status === 'active'
                    ? 'text-[var(--color-success)]'
                    : 'text-[var(--text-muted)]'
                }`}
              >
                {subscription.status === 'active'
                  ? 'فعال'
                  : subscription.status === 'canceled'
                    ? 'لغو شده'
                    : 'منقضی شده'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">تاریخ شروع:</span>
              <span className="font-medium text-[var(--text-primary)]">
                {formatDate(subscription.startedAt)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">تاریخ انقضا:</span>
              <span className="font-medium text-[var(--text-primary)]">
                {formatDate(subscription.expiresAt)}
              </span>
            </div>
          </div>
        </Card>
      ) : (
        <Alert variant="info" title="اشتراک فعالی ندارید">
          برای دسترسی به ابزارهای پریمیوم، یکی از طرح‌های زیر را انتخاب کنید.
        </Alert>
      )}

      {message && <Alert variant="warning">{message}</Alert>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {SUBSCRIPTION_PLANS.map((plan) => (
          <Card
            key={plan.id}
            className={`p-6 ${
              selectedPlan === plan.id ? 'border-2 border-[var(--color-primary)]' : ''
            }`}
          >
            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">{plan.title}</h3>
            <div className="mb-4">
              <span className="text-2xl font-bold text-[var(--color-primary)]">
                {plan.price.toLocaleString('fa-IR')}
              </span>
              <span className="text-[var(--text-secondary)]"> تومان</span>
            </div>
            <ul className="space-y-2 mb-4 text-sm text-[var(--text-muted)]">
              <li>مدت: {plan.periodDays} روز</li>
              <li>حافظه: {plan.storageMb} مگابایت</li>
              <li>نگهداری فایل: {plan.retentionDays} روز</li>
              <li>سطح: {plan.tier === 'pro' ? 'حرفه‌ای' : 'پایه'}</li>
            </ul>
            <Button
              variant={selectedPlan === plan.id ? 'primary' : 'secondary'}
              fullWidth
              onClick={() => setSelectedPlan(plan.id)}
            >
              {selectedPlan === plan.id ? 'انتخاب شده' : 'انتخاب طرح'}
            </Button>
          </Card>
        ))}
      </div>

      <div className="text-center">
        <Button onClick={handleCheckout} disabled={purchasing}>
          {purchasing ? 'در حال پردازش...' : 'پرداخت و فعال‌سازی'}
        </Button>
      </div>
    </div>
  );
}
