'use client';

import { Card, Button } from '@/components/ui';
import { SUBSCRIPTION_PLANS, type PlanId } from '@/lib/subscriptionPlans';
import type { SubscriptionInfo } from './account-utils';
import { formatDate } from './account-utils';

interface SubscriptionSectionProps {
  subscription: SubscriptionInfo | null;
  planId: PlanId;
  setPlanId: (id: PlanId) => void;
  handleCheckout: () => Promise<void>;
  checkoutLoading?: boolean;
}

export default function SubscriptionSection({
  subscription,
  planId,
  setPlanId,
  handleCheckout,
  checkoutLoading = false,
}: SubscriptionSectionProps) {
  return (
    <section className="grid gap-4 md:grid-cols-2">
      <Card className="p-6 space-y-3">
        <div className="text-lg font-bold text-[var(--text-primary)]">وضعیت اشتراک</div>
        {subscription ? (
          <div className="text-sm text-[var(--text-muted)] space-y-1">
            <div>پلن: {subscription.planId}</div>
            <div>وضعیت: {subscription.status}</div>
            <div>انقضا: {formatDate(subscription.expiresAt)}</div>
          </div>
        ) : (
          <div className="text-sm text-[var(--text-muted)]">اشتراکی فعال نیست.</div>
        )}
      </Card>

      <Card className="p-6 space-y-3">
        <div className="text-lg font-bold text-[var(--text-primary)]">شروع اشتراک</div>
        <label htmlFor="plan-select" className="space-y-2 text-sm text-[var(--text-primary)]">
          انتخاب پلن
          <select
            id="plan-select"
            className="input w-full px-4 py-3 bg-[var(--surface-1)] border border-[var(--border-light)] rounded-[var(--radius-md)]"
            value={planId}
            onChange={(event) => setPlanId(event.target.value as PlanId)}
          >
            {SUBSCRIPTION_PLANS.map((plan) => (
              <option key={plan.id} value={plan.id}>
                {plan.title} - {plan.price.toLocaleString('fa-IR')} تومان
              </option>
            ))}
          </select>
        </label>
        <Button type="button" onClick={handleCheckout} disabled={checkoutLoading}>
          {checkoutLoading ? 'در حال پردازش...' : 'پرداخت و فعال‌سازی'}
        </Button>
      </Card>
    </section>
  );
}
