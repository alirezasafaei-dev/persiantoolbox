export type AdminSubscriptionData = {
  id: string;
  userId: string;
  planId: string;
  status: 'active' | 'canceled' | 'expired';
  startedAt: number;
  expiresAt: number;
  amount: number;
  paymentId?: string;
};

export type AdminPaymentData = {
  id: string;
  userId: string;
  planId: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed' | 'reconciliation_required' | 'refunded';
  createdAt: number;
  completedAt?: number;
  couponCode?: string;
  gateway?: string;
  authority?: string;
  referenceId?: string;
  failureCode?: string;
  failureMessage?: string;
  fulfilled: boolean;
};

const subscriptions: AdminSubscriptionData[] = [];
const payments: AdminPaymentData[] = [];

export function getCachedSubscriptions(): AdminSubscriptionData[] {
  return subscriptions;
}

export function getCachedPayments(): AdminPaymentData[] {
  return payments;
}

export function replaceCachedFinancialData(input: {
  subscriptions: AdminSubscriptionData[];
  payments: AdminPaymentData[];
}): void {
  subscriptions.splice(0, subscriptions.length, ...input.subscriptions);
  payments.splice(0, payments.length, ...input.payments);
}

export function clearCachedFinancialData(): void {
  subscriptions.splice(0, subscriptions.length);
  payments.splice(0, payments.length);
}
