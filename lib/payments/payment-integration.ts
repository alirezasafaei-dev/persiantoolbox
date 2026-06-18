/**
 * Payment Integration - PersianToolbox
 *
 * Handles payment processing and integration with database persistence
 */

import { query } from '@/lib/server/db';
import { agentLogger } from '@/lib/agent-logger';

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type PaymentMethod = 'zarinpal' | 'idpay' | 'nextpay' | 'wallet';

export interface Payment {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  description: string;
  metadata: Record<string, unknown> | undefined;
  createdAt: string;
  completedAt: string | undefined;
}

export interface PaymentGateway {
  name: string;
  namePersian: string;
  supported: boolean;
  fees: number;
}

const paymentGateways: PaymentGateway[] = [
  { name: 'zarinpal', namePersian: 'زرین‌پال', supported: true, fees: 0.02 },
  { name: 'idpay', namePersian: 'آیدی‌پی', supported: true, fees: 0.015 },
  { name: 'nextpay', namePersian: 'نکست‌پی', supported: true, fees: 0.018 },
  { name: 'wallet', namePersian: 'کیف پول', supported: true, fees: 0 },
];

type PaymentRow = {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  method: string;
  status: string;
  description: string;
  metadata: string | null;
  created_at: number;
  completed_at: number | null;
};

function mapPayment(row: PaymentRow): Payment {
  return {
    id: row.id,
    userId: row.user_id,
    amount: row.amount,
    currency: row.currency,
    method: row.method as PaymentMethod,
    status: row.status as PaymentStatus,
    description: row.description,
    metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
    createdAt: new Date(row.created_at).toISOString(),
    completedAt: row.completed_at ? new Date(row.completed_at).toISOString() : undefined,
  };
}

export function getPaymentGateways(): PaymentGateway[] {
  return paymentGateways.filter((g) => g.supported);
}

export function getPaymentGateway(method: PaymentMethod): PaymentGateway | undefined {
  return paymentGateways.find((g) => g.name === method);
}

export async function createPayment(
  userId: string,
  amount: number,
  method: PaymentMethod,
  description: string,
  metadata?: Record<string, unknown>,
): Promise<Payment> {
  const id = `pay_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const now = Date.now();

  await query(
    `INSERT INTO payments (id, user_id, amount, currency, method, status, description, metadata, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [
      id,
      userId,
      amount,
      'IRR',
      method,
      'pending',
      description,
      metadata ? JSON.stringify(metadata) : null,
      now,
    ],
  );

  agentLogger.info('payments', 'create', `Payment created: ${id}`, {
    userId,
    amount,
    method,
  });

  return {
    id,
    userId,
    amount,
    currency: 'IRR',
    method,
    status: 'pending',
    description,
    metadata,
    createdAt: new Date(now).toISOString(),
    completedAt: undefined,
  };
}

export async function completePayment(paymentId: string): Promise<boolean> {
  const now = Date.now();
  const result = await query(
    'UPDATE payments SET status = $1, completed_at = $2 WHERE id = $3 AND status = $4',
    ['completed', now, paymentId, 'pending'],
  );

  if (result.rowCount === 0) {
    return false;
  }

  agentLogger.info('payments', 'complete', `Payment completed: ${paymentId}`);
  return true;
}

export async function failPayment(paymentId: string): Promise<boolean> {
  const result = await query('UPDATE payments SET status = $1 WHERE id = $2 AND status = $3', [
    'failed',
    paymentId,
    'pending',
  ]);

  if (result.rowCount === 0) {
    return false;
  }

  agentLogger.info('payments', 'fail', `Payment failed: ${paymentId}`);
  return true;
}

export async function refundPayment(paymentId: string): Promise<boolean> {
  const result = await query('UPDATE payments SET status = $1 WHERE id = $2 AND status = $3', [
    'refunded',
    paymentId,
    'completed',
  ]);

  if (result.rowCount === 0) {
    return false;
  }

  agentLogger.info('payments', 'refund', `Payment refunded: ${paymentId}`);
  return true;
}

export async function getUserPayments(userId: string): Promise<Payment[]> {
  const result = await query<PaymentRow>(
    `SELECT id, user_id, amount, currency, method, status, description, metadata, created_at, completed_at
     FROM payments WHERE user_id = $1 ORDER BY created_at DESC`,
    [userId],
  );

  return result.rows.map(mapPayment);
}

export async function getPaymentById(paymentId: string): Promise<Payment | undefined> {
  const result = await query<PaymentRow>(
    `SELECT id, user_id, amount, currency, method, status, description, metadata, created_at, completed_at
     FROM payments WHERE id = $1 LIMIT 1`,
    [paymentId],
  );

  if (result.rowCount === 0) {
    return undefined;
  }

  const row = result.rows[0];
  if (!row) {
    return undefined;
  }

  return mapPayment(row);
}

export function calculateFees(amount: number, method: PaymentMethod): number {
  const gateway = getPaymentGateway(method);
  if (!gateway) {
    return 0;
  }
  return Math.round(amount * gateway.fees);
}

export function generatePaymentLink(paymentId: string, callbackUrl: string): string {
  return `https://payment.persiantoolbox.ir/verify?id=${paymentId}&callback=${encodeURIComponent(callbackUrl)}`;
}
