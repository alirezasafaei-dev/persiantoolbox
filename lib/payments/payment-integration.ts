/**
 * Payment Integration - PersianToolbox
 *
 * Handles payment processing and integration with database persistence.
 * Application prices are Toman; the Zarinpal boundary uses IRR.
 */

import { randomUUID } from 'node:crypto';
import { query } from '@/lib/server/db';
import { agentLogger } from '@/lib/agent-logger';
import {
  createPaymentGatewayAdapter,
  type PaymentGatewayAdapter,
  type PaymentConfig,
} from '@shared/payments';
import { resolvePaymentsCallbackUrl } from '@/lib/payments/payment-urls';

type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';
type PaymentMethod = 'zarinpal' | 'idpay' | 'nextpay' | 'wallet';

interface Payment {
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

type PaymentRow = {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  method: string;
  status: string;
  description: string;
  metadata: string | Record<string, unknown> | null;
  created_at: number;
  completed_at: number | null;
};

function parseMetadata(value: PaymentRow['metadata']): Record<string, unknown> | undefined {
  if (!value) return undefined;
  if (typeof value === 'string') return JSON.parse(value) as Record<string, unknown>;
  return value;
}

function mapPayment(row: PaymentRow): Payment {
  return {
    id: row.id,
    userId: row.user_id,
    amount: Number(row.amount),
    currency: row.currency,
    method: row.method as PaymentMethod,
    status: row.status as PaymentStatus,
    description: row.description,
    metadata: parseMetadata(row.metadata),
    createdAt: new Date(Number(row.created_at)).toISOString(),
    completedAt: row.completed_at ? new Date(Number(row.completed_at)).toISOString() : undefined,
  };
}

export function normalizeZarinpalAuthority(authority: string): string {
  return authority.startsWith('zarinpal_') ? authority.slice('zarinpal_'.length) : authority;
}

export function tomanToRial(amountToman: number): number {
  if (!Number.isSafeInteger(amountToman) || amountToman <= 0) {
    throw new Error('Payment amount must be a positive integer in Toman');
  }
  const amountRial = amountToman * 10;
  if (!Number.isSafeInteger(amountRial)) {
    throw new Error('Payment amount exceeds the supported range');
  }
  return amountRial;
}

export async function createPayment(
  userId: string,
  amount: number,
  method: PaymentMethod,
  description: string,
  metadata?: Record<string, unknown>,
): Promise<Payment> {
  const id = randomUUID();
  const now = Date.now();

  await query(
    `INSERT INTO payments (id, user_id, amount, currency, method, status, description, metadata, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [id, userId, amount, 'TOMAN', method, 'pending', description, metadata ? JSON.stringify(metadata) : null, now],
  );

  agentLogger.info('payments', 'create', `Payment created: ${id}`, { userId, amount, method });

  return {
    id,
    userId,
    amount,
    currency: 'TOMAN',
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
  if (result.rowCount === 0) return false;
  agentLogger.info('payments', 'complete', `Payment completed: ${paymentId}`);
  return true;
}

export async function getPaymentById(paymentId: string): Promise<Payment | undefined> {
  const result = await query<PaymentRow>(
    `SELECT id, user_id, amount, currency, method, status, description, metadata, created_at, completed_at
     FROM payments WHERE id = $1 LIMIT 1`,
    [paymentId],
  );
  const row = result.rows[0];
  return row ? mapPayment(row) : undefined;
}

export async function getPaymentByAuthority(authority: string): Promise<Payment | undefined> {
  const rawAuthority = normalizeZarinpalAuthority(authority);
  const result = await query<PaymentRow>(
    `SELECT id, user_id, amount, currency, method, status, description, metadata, created_at, completed_at
     FROM payments
     WHERE metadata->>'gatewayAuthority' = $1
        OR metadata->>'gatewayRef' = $1
        OR metadata->>'gatewayRef' = $2
     LIMIT 1`,
    [rawAuthority, `zarinpal_${rawAuthority}`],
  );
  const row = result.rows[0];
  return row ? mapPayment(row) : undefined;
}

export async function verifyZarinpalPayment(
  authority: string,
  amountToman: number,
): Promise<{ success: boolean; refId?: string; error?: string }> {
  const adapter = getPaymentAdapter();
  const rawAuthority = normalizeZarinpalAuthority(authority);
  const amountRial = tomanToRial(amountToman);
  const result = await adapter.verifyCallback({
    gatewayRef: rawAuthority,
    payload: { Authority: rawAuthority, Status: 'OK', Amount: String(amountRial) },
  });

  if (result.result === 'succeeded') {
    const refId = result.raw?.['ref_id'] as string | undefined;
    return { success: true, ...(refId !== undefined ? { refId } : {}) };
  }
  return {
    success: false,
    error:
      ((result.raw as Record<string, unknown>)?.['error'] as string | undefined) ??
      'Zarinpal verification failed',
  };
}

function getPaymentAdapter(): PaymentGatewayAdapter {
  const merchantId = process.env['ZARINPAL_MERCHANT_ID']?.trim() ?? '';
  const isProduction = process.env['NODE_ENV'] === 'production';
  if (!merchantId && isProduction) {
    throw new Error('PAYMENT_GATEWAY_NOT_CONFIGURED');
  }

  const config: PaymentConfig = {
    merchantId,
    callbackUrl: resolvePaymentsCallbackUrl(),
    sandbox: process.env['ZARINPAL_MODE'] === 'sandbox',
  };
  return createPaymentGatewayAdapter(config, merchantId ? 'zarinpal' : 'mock');
}

export async function createPaymentCheckout(
  userId: string,
  amount: number,
  method: PaymentMethod,
  description: string,
  callbackUrl: string,
  metadata?: Record<string, unknown>,
): Promise<{ payment: Payment; checkoutUrl: string }> {
  const gatewayAmountRial = tomanToRial(amount);
  const payment = await createPayment(userId, amount, method, description, {
    ...metadata,
    amountToman: amount,
    gatewayAmountRial,
  });

  try {
    const adapter = getPaymentAdapter();
    const checkout = await adapter.createCheckout({
      paymentId: payment.id,
      amount: gatewayAmountRial,
      currency: 'IRR',
      callbackUrl,
      description,
    });
    const gatewayAuthority = normalizeZarinpalAuthority(checkout.gatewayRef);
    const persistedMetadata = {
      ...metadata,
      amountToman: amount,
      gatewayAmountRial,
      gatewayAuthority,
      gatewayRef: checkout.gatewayRef,
    };
    await query('UPDATE payments SET metadata = $1 WHERE id = $2', [
      JSON.stringify(persistedMetadata),
      payment.id,
    ]);

    return {
      payment: { ...payment, metadata: persistedMetadata },
      checkoutUrl: checkout.redirectUrl,
    };
  } catch (error) {
    await query('UPDATE payments SET status = $1 WHERE id = $2 AND status = $3', [
      'failed',
      payment.id,
      'pending',
    ]);
    agentLogger.error('payments', 'checkout_failed', `Payment checkout failed: ${payment.id}`, {
      error: error instanceof Error ? error.message : String(error),
      method,
      amount,
    });
    throw error;
  }
}

export async function verifyPaymentCallback(
  gatewayRef: string,
  payload: Record<string, string | undefined>,
  headers?: Record<string, string | undefined>,
): Promise<{ success: boolean; payment?: Payment; error?: string }> {
  try {
    const rawAuthority = normalizeZarinpalAuthority(gatewayRef);
    const payment = await getPaymentByAuthority(rawAuthority);
    if (!payment) return { success: false, error: 'Payment not found' };
    if (payment.status === 'completed') return { success: true, payment };
    if (payment.status !== 'pending') return { success: false, error: `Payment is ${payment.status}` };

    const amountRial = tomanToRial(payment.amount);
    const adapter = getPaymentAdapter();
    const verification = await adapter.verifyCallback({
      gatewayRef: rawAuthority,
      payload: {
        ...payload,
        Authority: rawAuthority,
        Amount: String(amountRial),
      },
      headers: headers ?? {},
    });

    if (verification.result === 'succeeded') {
      const completed = await completePayment(payment.id);
      if (!completed) {
        const latest = await getPaymentById(payment.id);
        if (latest?.status === 'completed') return { success: true, payment: latest };
        return { success: false, error: 'Payment completion conflict' };
      }
      return {
        success: true,
        payment: { ...payment, status: 'completed', completedAt: verification.paidAt },
      };
    }

    if (verification.result === 'failed') {
      await query('UPDATE payments SET status = $1 WHERE id = $2 AND status = $3', [
        'failed',
        payment.id,
        'pending',
      ]);
      const rawError = (verification.raw as Record<string, unknown>)?.['error'];
      return { success: false, error: typeof rawError === 'string' ? rawError : 'Payment failed' };
    }

    return { success: false, error: 'Payment pending' };
  } catch (error) {
    agentLogger.error('payments', 'callback_failed', 'Payment callback verification failed', {
      error: error instanceof Error ? error.message : String(error),
      gatewayRef,
    });
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}
