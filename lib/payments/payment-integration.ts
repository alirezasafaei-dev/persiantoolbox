/**
 * Payment Integration - PersianToolbox
 *
 * Handles payment processing and integration with database persistence
 * Now uses shared payment library for gateway adapters
 */

import { randomUUID } from 'node:crypto';
import { query } from '@/lib/server/db';
import { agentLogger } from '@/lib/agent-logger';
import {
  createPaymentGatewayAdapter,
  type PaymentGatewayAdapter,
  type PaymentConfig,
} from '@shared/payments';

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

export async function createPayment(
  userId: string,
  amount: number,
  method: PaymentMethod,
  description: string,
  metadata?: Record<string, unknown>,
): Promise<Payment> {
  const id = `pay_${randomUUID()}`;
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

export async function getPaymentByAuthority(authority: string): Promise<Payment | undefined> {
  const result = await query<PaymentRow>(
    `SELECT id, user_id, amount, currency, method, status, description, metadata, created_at, completed_at
     FROM payments WHERE metadata->>'gatewayRef' IN ($1, $2) LIMIT 1`,
    [`zarinpal_${authority}`, authority],
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

export async function verifyZarinpalPayment(
  authority: string,
  amount: number,
): Promise<{ success: boolean; refId?: string; error?: string }> {
  const adapter = getPaymentAdapter('zarinpal');
  const gatewayRef = `zarinpal_${authority}`;
  const result = await adapter.verifyCallback({
    gatewayRef,
    payload: { Status: 'OK', Amount: String(amount) },
  });

  if (result.result === 'succeeded') {
    const raw = result.raw as Record<string, unknown> | undefined;
    const refId = raw?.['ref_id'] as string | undefined;
    return { success: true, ...(refId !== undefined ? { refId } : {}) };
  }
  return {
    success: false,
    error:
      ((result.raw as Record<string, unknown>)?.['error'] as string | undefined) ??
      'Zarinpal verification failed',
  };
}

export function generatePaymentLink(paymentId: string, callbackUrl: string): string {
  const baseUrl = process.env['PAYMENT_BASE_URL'] ?? 'https://payment.persiantoolbox.ir';
  return `${baseUrl}/verify?id=${paymentId}&callback=${encodeURIComponent(callbackUrl)}`;
}

/**
 * Initialize payment gateway adapter
 */
function getPaymentAdapter(method: PaymentMethod): PaymentGatewayAdapter {
  const config: PaymentConfig = {
    gatewayId: method === 'zarinpal' ? 'zarinpal' : 'mock',
    baseUrl: process.env['PAYMENT_BASE_URL'] ?? 'https://payment.persiantoolbox.ir',
    merchantId: process.env['ZARINPAL_MERCHANT_ID'] ?? '',
    webhookSecret: process.env['PAYMENT_WEBHOOK_SECRET'] ?? '',
  };

  return createPaymentGatewayAdapter(config);
}

/**
 * Create payment checkout using gateway adapter
 */
export async function createPaymentCheckout(
  userId: string,
  amount: number,
  method: PaymentMethod,
  description: string,
  callbackUrl: string,
  metadata?: Record<string, unknown>,
): Promise<{ payment: Payment; checkoutUrl: string }> {
  const payment = await createPayment(userId, amount, method, description, metadata);

  try {
    const adapter = getPaymentAdapter(method);
    const checkout = await adapter.createCheckout({
      paymentId: payment.id,
      amount,
      currency: 'IRR',
      callbackUrl,
      description,
    });

    // Update payment with gateway reference
    await query('UPDATE payments SET metadata = $1 WHERE id = $2', [
      JSON.stringify({ ...metadata, gatewayRef: checkout.gatewayRef }),
      payment.id,
    ]);

    return {
      payment,
      checkoutUrl: checkout.redirectUrl,
    };
  } catch (error) {
    agentLogger.error('payments', 'checkout_failed', `Payment checkout failed: ${payment.id}`, {
      error: error instanceof Error ? error.message : String(error),
      method,
      amount,
    });
    throw error;
  }
}

/**
 * Verify payment callback from gateway
 */
export async function verifyPaymentCallback(
  gatewayRef: string,
  payload: Record<string, string | undefined>,
  headers?: Record<string, string | undefined>,
): Promise<{ success: boolean; payment?: Payment; error?: string }> {
  try {
    // Find payment by gateway reference
    const result = await query(
      "SELECT * FROM payments WHERE metadata->>'gatewayRef' = $1 LIMIT 1",
      [gatewayRef],
    );

    if (result.rowCount === 0) {
      return { success: false, error: 'Payment not found' };
    }

    const paymentRow = result.rows[0] as PaymentRow;
    if (!paymentRow) {
      return { success: false, error: 'Payment not found' };
    }

    const payment = mapPayment(paymentRow);
    const adapter = getPaymentAdapter(payment.method);

    const verification = await adapter.verifyCallback({
      gatewayRef,
      payload,
      headers: headers ?? {},
    });

    if (verification.result === 'succeeded') {
      await completePayment(payment.id);
      return {
        success: true,
        payment: { ...payment, status: 'completed', completedAt: verification.paidAt },
      };
    } else if (verification.result === 'failed') {
      await query('UPDATE payments SET status = $1 WHERE id = $2', ['failed', payment.id]);
      return { success: false, error: 'Payment failed' };
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
