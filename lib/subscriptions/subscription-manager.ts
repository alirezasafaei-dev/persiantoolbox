/**
 * Subscription Manager - PersianToolbox
 *
 * Manages user subscriptions and billing with database persistence
 */

import { randomUUID } from 'node:crypto';
import { query } from '@/lib/server/db';
import { agentLogger } from '@/lib/agent-logger';

export type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'trial';

export interface SubscriptionPlan {
  id: string;
  name: string;
  namePersian: string;
  price: number;
  currency: string;
  duration: number;
  features: string[];
  popular?: boolean;
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: SubscriptionStatus;
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  paymentId?: string;
  trialEnd?: string;
}

const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'basic-monthly',
    name: 'Basic Monthly',
    namePersian: 'پایه ماهانه',
    price: 99000,
    currency: 'IRR',
    duration: 30,
    features: [
      'دسترسی به ابزارهای PDF',
      'دسترسی به ابزارهای تصویر',
      'حذف تبلیغات',
      '50 استفاده روزانه',
    ],
  },
  {
    id: 'basic-yearly',
    name: 'Basic Yearly',
    namePersian: 'پایه سالانه',
    price: 890000,
    currency: 'IRR',
    duration: 365,
    features: [
      'دسترسی به ابزارهای PDF',
      'دسترسی به ابزارهای تصویر',
      'حذف تبلیغات',
      '50 استفاده روزانه',
      '20% تخفیف',
    ],
  },
  {
    id: 'pro-monthly',
    name: 'Pro Monthly',
    namePersian: 'حرفه‌ای ماهانه',
    price: 199000,
    currency: 'IRR',
    duration: 30,
    features: [
      'دسترسی به تمام ابزارها',
      'استفاده نامحدود',
      'خروجی در فرمت‌های مختلف',
      'اولویت پشتیبانی',
      'حذف تبلیغات',
    ],
    popular: true,
  },
  {
    id: 'pro-yearly',
    name: 'Pro Yearly',
    namePersian: 'حرفه‌ای سالانه',
    price: 1790000,
    currency: 'IRR',
    duration: 365,
    features: [
      'دسترسی به تمام ابزارها',
      'استفاده نامحدود',
      'خروجی در فرمت‌های مختلف',
      'اولویت پشتیبانی',
      'حذف تبلیغات',
      '20% تخفیف',
    ],
    popular: true,
  },
  {
    id: 'enterprise-monthly',
    name: 'Enterprise Monthly',
    namePersian: 'سازمانی ماهانه',
    price: 499000,
    currency: 'IRR',
    duration: 30,
    features: [
      'تمام امکانات Pro',
      'API اختصاصی',
      'پشتیبانی اختصاصی',
      'گزارش‌های تحلیلی',
      'تعداد کاربران نامحدود',
      'SLA 99.9%',
    ],
  },
];

type SubscriptionRow = {
  id: string;
  user_id: string;
  plan_id: string;
  status: string;
  started_at: number;
  expires_at: number;
  payment_id: string | null;
};

function mapSubscription(row: SubscriptionRow): Subscription {
  return {
    id: row.id,
    userId: row.user_id,
    planId: row.plan_id,
    status: row.status as SubscriptionStatus,
    startDate: new Date(row.started_at).toISOString(),
    endDate: new Date(row.expires_at).toISOString(),
    autoRenew: true,
    ...(row.payment_id && { paymentId: row.payment_id }),
  };
}

export function getSubscriptionPlans(): SubscriptionPlan[] {
  return subscriptionPlans;
}

export function getPlanById(planId: string): SubscriptionPlan | undefined {
  return subscriptionPlans.find((p) => p.id === planId);
}

export async function createSubscription(
  userId: string,
  planId: string,
  paymentId?: string,
): Promise<Subscription> {
  const plan = getPlanById(planId);
  if (!plan) {
    throw new Error(`Plan not found: ${planId}`);
  }

  const now = Date.now();
  const endDate = now + plan.duration * 24 * 60 * 60 * 1000;
  const id = `sub_${randomUUID()}`;

  await query(
    `INSERT INTO subscriptions (id, user_id, plan_id, status, started_at, expires_at)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [id, userId, planId, 'active', now, endDate],
  );

  agentLogger.info('subscriptions', 'create', `Subscription created for ${userId}`, {
    planId,
    endDate: new Date(endDate).toISOString(),
  });

  return {
    id,
    userId,
    planId,
    status: 'active',
    startDate: new Date(now).toISOString(),
    endDate: new Date(endDate).toISOString(),
    autoRenew: true,
    ...(paymentId && { paymentId }),
  };
}

export async function cancelSubscription(subscriptionId: string): Promise<boolean> {
  const result = await query('UPDATE subscriptions SET status = $1 WHERE id = $2 AND status = $3', [
    'cancelled',
    subscriptionId,
    'active',
  ]);

  if (result.rowCount === 0) {
    return false;
  }

  agentLogger.info('subscriptions', 'cancel', `Subscription cancelled: ${subscriptionId}`);
  return true;
}

export async function getUserSubscriptions(userId: string): Promise<Subscription[]> {
  const result = await query<SubscriptionRow>(
    `SELECT id, user_id, plan_id, status, started_at, expires_at, payment_id
     FROM subscriptions WHERE user_id = $1 ORDER BY started_at DESC`,
    [userId],
  );

  return result.rows.map(mapSubscription);
}

export async function getActiveSubscription(userId: string): Promise<Subscription | undefined> {
  const now = Date.now();
  const result = await query<SubscriptionRow>(
    `SELECT id, user_id, plan_id, status, started_at, expires_at, payment_id
     FROM subscriptions WHERE user_id = $1 AND status = $2 AND expires_at > $3
     ORDER BY expires_at DESC LIMIT 1`,
    [userId, 'active', now],
  );

  if (result.rowCount === 0) {
    return undefined;
  }

  const row = result.rows[0];
  if (!row) {
    return undefined;
  }

  return mapSubscription(row);
}

export async function checkSubscriptionStatus(userId: string): Promise<SubscriptionStatus> {
  const subscription = await getActiveSubscription(userId);
  if (!subscription) {
    return 'expired';
  }
  return subscription.status;
}

export async function renewSubscription(subscriptionId: string): Promise<boolean> {
  const result = await query<SubscriptionRow>(
    'SELECT id, plan_id, status, expires_at FROM subscriptions WHERE id = $1 LIMIT 1',
    [subscriptionId],
  );

  if (result.rowCount === 0) {
    return false;
  }

  const row = result.rows[0];
  if (!row || row.status !== 'active') {
    return false;
  }

  const plan = getPlanById(row.plan_id);
  if (!plan) {
    return false;
  }

  const currentEnd = row.expires_at;
  const newEnd = currentEnd + plan.duration * 24 * 60 * 60 * 1000;

  await query('UPDATE subscriptions SET expires_at = $1 WHERE id = $2', [newEnd, subscriptionId]);

  agentLogger.info('subscriptions', 'renew', `Subscription renewed: ${subscriptionId}`, {
    newEndDate: new Date(newEnd).toISOString(),
  });

  return true;
}
