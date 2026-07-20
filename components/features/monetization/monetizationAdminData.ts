import {
  getCachedPayments,
  getCachedSubscriptions,
  type AdminPaymentData,
  type AdminSubscriptionData,
} from '@/lib/admin/financialDataCache';

export const COUPONS_KEY = 'persian-tools.coupons.v1';

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

export type AdminSubscription = AdminSubscriptionData;
export type Payment = AdminPaymentData;

export function loadCoupons(): Coupon[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(COUPONS_KEY) ?? '[]') as Coupon[];
  } catch {
    return [];
  }
}

export function saveCoupons(coupons: Coupon[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(COUPONS_KEY, JSON.stringify(coupons));
  }
}

export function loadSubscriptions(): AdminSubscription[] {
  return getCachedSubscriptions();
}

export function saveSubscriptions(subscriptions: AdminSubscription[]): void {
  // Financial records are server-owned and must never be persisted to localStorage.
  void subscriptions;
}

export function loadPayments(): Payment[] {
  return getCachedPayments();
}

export function savePayments(payments: Payment[]): void {
  // Financial records are server-owned and must never be persisted to localStorage.
  void payments;
}

export function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `id_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export function seedDemoData(
  subscriptions: AdminSubscription[],
  payments: Payment[],
): { subs: AdminSubscription[]; payments: Payment[] } {
  // Demo financial data is intentionally prohibited in the authenticated admin dashboard.
  return { subs: subscriptions, payments };
}
