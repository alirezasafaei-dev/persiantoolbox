'use client';

import { Button } from '@/components/ui';
import { SUBSCRIPTION_PLANS } from '@/lib/subscriptionPlans';
import type { UserInfo, SubscriptionInfo } from './account-utils';
import { formatDateShort } from './account-utils';

interface ProfileHeaderProps {
  user: UserInfo;
  subscription: SubscriptionInfo | null;
  uniqueToolsUsed: number;
  accountRecoveryNotice: string | null;
  handleLogout: () => Promise<void>;
}

export default function ProfileHeader({
  user,
  subscription,
  uniqueToolsUsed,
  accountRecoveryNotice,
  handleLogout,
}: ProfileHeaderProps) {
  return (
    <section className="section-surface p-6 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-[var(--text-primary)]">
            حساب کاربری
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-[var(--text-secondary)]">{user.email}</p>
            {subscription && subscription.status === 'active' ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-[rgb(var(--color-primary-rgb)/0.12)] px-2.5 py-0.5 text-xs font-bold text-[var(--color-primary)]">
                ⭐ پریمیوم
              </span>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-[var(--text-muted)]">
            <span className="inline-flex items-center gap-1 rounded-full bg-[var(--surface-2)] px-2.5 py-1">
              📅 عضویت از {formatDateShort(user.createdAt)}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-[var(--surface-2)] px-2.5 py-1">
              🔧 {uniqueToolsUsed.toLocaleString('fa-IR')} ابزار استفاده‌شده
            </span>
            {subscription && subscription.status === 'active' ? (
              <>
                <span className="rounded-full bg-[var(--surface-2)] px-2.5 py-1">
                  پلن:{' '}
                  {SUBSCRIPTION_PLANS.find((p) => p.id === subscription.planId)?.title ??
                    subscription.planId}
                </span>
                <span className="rounded-full bg-[var(--surface-2)] px-2.5 py-1">
                  انقضا: {formatDateShort(subscription.expiresAt)}
                </span>
              </>
            ) : null}
          </div>
          {accountRecoveryNotice ? (
            <p role="status" className="mt-2 text-sm font-semibold text-[var(--color-success)]">
              {accountRecoveryNotice}
            </p>
          ) : null}
        </div>
        <Button type="button" variant="tertiary" onClick={handleLogout}>
          خروج
        </Button>
      </div>
    </section>
  );
}
