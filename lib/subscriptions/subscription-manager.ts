/**
 * Subscription Manager - PersianToolbox
 *
 * Manages user subscriptions and billing
 */

import {agentLogger} from '@/lib/agent-logger';

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

const subscriptions = new Map<string, Subscription>();

export function getSubscriptionPlans(): SubscriptionPlan[] {
  return subscriptionPlans;
}

export function getPlanById(planId: string): SubscriptionPlan | undefined {
  return subscriptionPlans.find((p) => p.id === planId);
}

export function createSubscription(
  userId: string,
  planId: string,
  paymentId?: string,
): Subscription {
  const plan = getPlanById(planId);
  if (!plan) {
    throw new Error(`Plan not found: ${planId}`);
  }

  const now = new Date();
  const endDate = new Date(now.getTime() + plan.duration * 24 * 60 * 60 * 1000);

  const subscription: Subscription = {
    id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    userId,
    planId,
    status: 'active',
    startDate: now.toISOString(),
    endDate: endDate.toISOString(),
    autoRenew: true,
    ...(paymentId && {paymentId}),
  };

  subscriptions.set(subscription.id, subscription);
  agentLogger.info('subscriptions', 'create', `Subscription created for ${userId}`, {
    planId,
    endDate: subscription.endDate,
  });

  return subscription;
}

export function cancelSubscription(subscriptionId: string): boolean {
  const subscription = subscriptions.get(subscriptionId);
  if (!subscription) {
    return false;
  }

  subscription.status = 'cancelled';
  subscription.autoRenew = false;
  subscriptions.set(subscriptionId, subscription);

  agentLogger.info('subscriptions', 'cancel', `Subscription cancelled: ${subscriptionId}`);
  return true;
}

export function getUserSubscriptions(userId: string): Subscription[] {
  return Array.from(subscriptions.values()).filter((s) => s.userId === userId);
}

export function getActiveSubscription(userId: string): Subscription | undefined {
  return Array.from(subscriptions.values()).find(
    (s) => s.userId === userId && s.status === 'active' && new Date(s.endDate) > new Date(),
  );
}

export function checkSubscriptionStatus(userId: string): SubscriptionStatus {
  const subscription = getActiveSubscription(userId);
  if (!subscription) {
    return 'expired';
  }
  return subscription.status;
}

export function renewSubscription(subscriptionId: string): boolean {
  const subscription = subscriptions.get(subscriptionId);
  if (!subscription || subscription.status !== 'active') {
    return false;
  }

  const plan = getPlanById(subscription.planId);
  if (!plan) {
    return false;
  }

  const currentEnd = new Date(subscription.endDate);
  const newEnd = new Date(currentEnd.getTime() + plan.duration * 24 * 60 * 60 * 1000);

  subscription.endDate = newEnd.toISOString();
  subscriptions.set(subscriptionId, subscription);

  agentLogger.info('subscriptions', 'renew', `Subscription renewed: ${subscriptionId}`, {
    newEndDate: subscription.endDate,
  });

  return true;
}
