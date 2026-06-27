import { SUBSCRIPTION_PLANS, type PlanId } from '@/lib/subscriptionPlans';

export const COUPONS_KEY = 'persian-tools.coupons.v1';
export const SUBSCRIPTIONS_KEY = 'persian-tools.admin-subscriptions.v1';
export const PAYMENTS_KEY = 'persian-tools.admin-payments.v1';

export type Coupon = {
  id: string;
  code: string;
  percent: number;
  maxUses: number;
  usedCount: number;
  expiresAt: number;
  createdAt: number;
  active: boolean;
};

export type AdminSubscription = {
  id: string;
  userId: string;
  planId: PlanId;
  status: 'active' | 'canceled' | 'expired';
  startedAt: number;
  expiresAt: number;
  amount: number;
};

export type Payment = {
  id: string;
  userId: string;
  planId: PlanId;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  createdAt: number;
  couponCode?: string | undefined;
};

export function loadCoupons(): Coupon[] {
  if (typeof window === 'undefined') {
    return [];
  }
  try {
    return JSON.parse(localStorage.getItem(COUPONS_KEY) ?? '[]');
  } catch {
    return [];
  }
}

export function saveCoupons(coupons: Coupon[]): void {
  localStorage.setItem(COUPONS_KEY, JSON.stringify(coupons));
}

export function loadSubscriptions(): AdminSubscription[] {
  if (typeof window === 'undefined') {
    return [];
  }
  try {
    return JSON.parse(localStorage.getItem(SUBSCRIPTIONS_KEY) ?? '[]');
  } catch {
    return [];
  }
}

export function saveSubscriptions(subs: AdminSubscription[]): void {
  localStorage.setItem(SUBSCRIPTIONS_KEY, JSON.stringify(subs));
}

export function loadPayments(): Payment[] {
  if (typeof window === 'undefined') {
    return [];
  }
  try {
    return JSON.parse(localStorage.getItem(PAYMENTS_KEY) ?? '[]');
  } catch {
    return [];
  }
}

export function savePayments(payments: Payment[]): void {
  localStorage.setItem(PAYMENTS_KEY, JSON.stringify(payments));
}

export function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `id_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export function seedDemoData(
  subs: AdminSubscription[],
  payments: Payment[],
): { subs: AdminSubscription[]; payments: Payment[] } {
  if (subs.length > 0 || payments.length > 0) {
    return { subs, payments };
  }
  const now = Date.now();
  const DAY = 86400000;
  const planIds: PlanId[] = ['pack-3', 'basic', 'standard', 'pro'];
  const newSubs: AdminSubscription[] = [];
  const newPayments: Payment[] = [];
  for (let i = 0; i < 20; i++) {
    const planId = planIds[i % planIds.length]!;
    const plan = SUBSCRIPTION_PLANS.find((p) => p.id === planId)!;
    const startedAt = now - (20 - i) * DAY * 3;
    const status: AdminSubscription['status'] = i < 12 ? 'active' : i < 16 ? 'expired' : 'canceled';
    newSubs.push({
      id: generateId(),
      userId: `user_${(i + 1).toString().padStart(3, '0')}`,
      planId,
      status,
      startedAt,
      expiresAt: startedAt + plan.periodDays * DAY,
      amount: plan.price,
    });
    newPayments.push({
      id: generateId(),
      userId: `user_${(i + 1).toString().padStart(3, '0')}`,
      planId,
      amount: plan.price,
      status: i < 18 ? 'completed' : i === 18 ? 'pending' : 'failed',
      createdAt: startedAt,
      couponCode: i % 5 === 0 ? 'NOWRUZ' : undefined,
    });
  }
  return { subs: newSubs, payments: newPayments };
}
