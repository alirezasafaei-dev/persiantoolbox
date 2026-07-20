/**
 * Payment Integration - PersianToolbox
 *
 * Handles payment processing and integration with database persistence.
 * Application prices are Toman; the Zarinpal boundary uses IRR.
 *
 * Source of truth: the payment row in the database. Client-supplied amounts
 * from callback payloads are NEVER trusted — the amount is re-derived from
 * the persisted payment record.
 */

import { randomUUID } from 'node:crypto';
import { query, withTransaction } from '@/lib/server/db';
import type { QueryResult, QueryResultRow } from 'pg';
import { agentLogger } from '@/lib/agent-logger';
import {
  createPaymentGatewayAdapter,
  type PaymentGatewayAdapter,
  type PaymentConfig,
} from '@shared/payments';
import { resolvePaymentsCallbackUrl } from '@/lib/payments/payment-urls';

export type PaymentStatus =
  | 'pending'
  | 'completed'
  | 'failed'
  | 'reconciliation_required'
  | 'refunded';
export type PaymentMethod = 'zarinpal' | 'idpay' | 'nextpay' | 'wallet';

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
  gatewayAmountIrr: number | undefined;
  gatewayAuthority: string | undefined;
  gatewayRefId: string | undefined;
  gatewayName: string | undefined;
  failureCode: string | undefined;
  failureMessage: string | undefined;
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
  gateway_amount_irr: number | null;
  gateway_authority: string | null;
  gateway_ref_id: string | null;
  gateway_name: string | null;
  failure_code: string | null;
  failure_message: string | null;
};

const PAYMENT_SELECT =
  'id, user_id, amount, currency, method, status, description, metadata, created_at, completed_at, ' +
  'gateway_amount_irr, gateway_authority, gateway_ref_id, gateway_name, failure_code, failure_message';

function parseMetadata(value: PaymentRow['metadata']): Record<string, unknown> | undefined {
  if (!value) {
    return undefined;
  }
  if (typeof value === 'string') {
    return JSON.parse(value) as Record<string, unknown>;
  }
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
    gatewayAmountIrr: row.gateway_amount_irr != null ? Number(row.gateway_amount_irr) : undefined,
    gatewayAuthority: row.gateway_authority ?? undefined,
    gatewayRefId: row.gateway_ref_id ?? undefined,
    gatewayName: row.gateway_name ?? undefined,
    failureCode: row.failure_code ?? undefined,
    failureMessage: row.failure_message ?? undefined,
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
    [
      id,
      userId,
      amount,
      'TOMAN',
      method,
      'pending',
      description,
      metadata ? JSON.stringify(metadata) : null,
      now,
    ],
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
    gatewayAmountIrr: undefined,
    gatewayAuthority: undefined,
    gatewayRefId: undefined,
    gatewayName: undefined,
    failureCode: undefined,
    failureMessage: undefined,
  };
}

export async function getPaymentById(paymentId: string): Promise<Payment | undefined> {
  const result = await query<PaymentRow>(
    `SELECT ${PAYMENT_SELECT} FROM payments WHERE id = $1 LIMIT 1`,
    [paymentId],
  );
  const row = result.rows[0];
  return row ? mapPayment(row) : undefined;
}

export async function getPaymentByAuthority(authority: string): Promise<Payment | undefined> {
  const rawAuthority = normalizeZarinpalAuthority(authority);
  const result = await query<PaymentRow>(
    `SELECT ${PAYMENT_SELECT} FROM payments
     WHERE gateway_authority = $1
        OR metadata->>'gatewayAuthority' = $1
        OR metadata->>'gatewayRef' = $1
        OR metadata->>'gatewayRef' = $2
     LIMIT 1`,
    [rawAuthority, `zarinpal_${rawAuthority}`],
  );
  const row = result.rows[0];
  return row ? mapPayment(row) : undefined;
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
    await query(
      `UPDATE payments
       SET metadata = $1,
           gateway_authority = $2,
           gateway_amount_irr = $3,
           gateway_name = $4
       WHERE id = $5`,
      [
        JSON.stringify({
          ...metadata,
          amountToman: amount,
          gatewayAmountRial,
          gatewayAuthority,
          gatewayRef: checkout.gatewayRef,
        }),
        gatewayAuthority,
        gatewayAmountRial,
        'zarinpal',
        payment.id,
      ],
    );

    return {
      payment: {
        ...payment,
        gatewayAuthority,
        gatewayAmountIrr: gatewayAmountRial,
        gatewayName: 'zarinpal',
        metadata: {
          ...metadata,
          amountToman: amount,
          gatewayAmountRial,
          gatewayAuthority,
          gatewayRef: checkout.gatewayRef,
        },
      },
      checkoutUrl: checkout.redirectUrl,
    };
  } catch (error) {
    const errorCode = error instanceof Error ? error.message : 'UNKNOWN';
    await query(
      `UPDATE payments SET status = $1, failure_code = $2, failure_message = $3
       WHERE id = $4 AND status = $5`,
      ['failed', 'CHECKOUT_FAILED', String(errorCode).slice(0, 200), payment.id, 'pending'],
    );
    agentLogger.error('payments', 'checkout_failed', `Payment checkout failed: ${payment.id}`, {
      error: errorCode,
      method,
      amount,
    });
    throw error;
  }
}

/**
 * Transactional payment verification and fulfillment.
 *
 * Flow:
 *   BEGIN
 *   SELECT payment FOR UPDATE
 *   validate ownership, gateway, pending state
 *   verify with gateway (using server-side amount)
 *   re-lock payment, ensure still pending
 *   mark completed + persist gateway_ref_id
 *   create or extend subscription (if applicable)
 *   COMMIT
 *
 * Duplicate callbacks: idempotent — returns existing completed payment.
 * Concurrent callbacks: serialized by FOR UPDATE — at most one succeeds.
 * Entitlement failure: transaction rolls back — payment stays pending.
 */
export async function verifyPaymentCallback(
  gatewayRef: string,
  payload: Record<string, string | undefined>,
  headers?: Record<string, string | undefined>,
): Promise<{ success: boolean; payment?: Payment; error?: string }> {
  try {
    const rawAuthority = normalizeZarinpalAuthority(gatewayRef);

    const result = await withTransaction(async (txQuery) => {
      // 1. Lock the payment row
      const lockResult = await txQuery<PaymentRow>(
        `SELECT ${PAYMENT_SELECT} FROM payments
         WHERE gateway_authority = $1
            OR metadata->>'gatewayAuthority' = $1
            OR metadata->>'gatewayRef' = $1
            OR metadata->>'gatewayRef' = $2
         FOR UPDATE
         LIMIT 1`,
        [rawAuthority, `zarinpal_${rawAuthority}`],
      );

      if (lockResult.rows.length === 0) {
        return { success: false as const, error: 'Payment not found' };
      }

      const row = lockResult.rows[0]!;
      const payment = mapPayment(row);

      // 2. Idempotent: already completed with entitlement
      if (payment.status === 'completed') {
        return { success: true as const, payment };
      }

      // 3. Reject non-pending states
      if (payment.status !== 'pending') {
        return { success: false as const, error: `Payment is ${payment.status}` };
      }

      // 4. Verify with gateway using server-side amount (never trust callback Amount)
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

      const refId =
        verification.result === 'succeeded'
          ? (verification.raw?.['ref_id'] as string | undefined)
          : undefined;

      if (verification.result === 'succeeded') {
        // 5. Mark completed + persist gateway ref_id
        const now = Date.now();
        const completeResult = await txQuery(
          `UPDATE payments
           SET status = 'completed',
               completed_at = $1,
               gateway_ref_id = COALESCE($2, gateway_ref_id),
               gateway_amount_irr = COALESCE($3, gateway_amount_irr)
           WHERE id = $4 AND status = 'pending'`,
          [now, refId ?? null, amountRial, payment.id],
        );

        if (completeResult.rowCount === 0) {
          // Race: another callback won. Re-read.
          const reRead = await txQuery<PaymentRow>(
            `SELECT ${PAYMENT_SELECT} FROM payments WHERE id = $1`,
            [payment.id],
          );
          const latest = reRead.rows[0];
          if (latest && latest.status === 'completed') {
            return { success: true as const, payment: mapPayment(latest) };
          }
          return { success: false as const, error: 'Payment completion conflict' };
        }

        // 6. Check if this payment is linked to a subscription checkout
        const meta = parseMetadata(row.metadata) as Record<string, unknown> | undefined;
        const planId = meta?.['planId'] as string | undefined;
        const userId = row.user_id;

        if (planId) {
          // Create or extend subscription within the same transaction
          try {
            await createSubscriptionInTransaction(txQuery, userId, planId, payment.id);
          } catch (subError) {
            // Subscription creation failed — mark for reconciliation
            await txQuery(
              `UPDATE payments SET status = 'reconciliation_required', failure_code = $1, failure_message = $2
               WHERE id = $3 AND status = 'completed'`,
              [
                'SUBSCRIPTION_FAILED',
                subError instanceof Error ? subError.message : 'Unknown subscription error',
                payment.id,
              ],
            );
            agentLogger.error(
              'payments',
              'subscription_failed',
              `Reconciliation required: ${payment.id}`,
              {
                error: subError instanceof Error ? subError.message : String(subError),
              },
            );
            return {
              success: false as const,
              payment: { ...payment, status: 'reconciliation_required' as const },
              error:
                'Payment completed but subscription activation failed — reconciliation required',
            };
          }
        }

        const completedPayment = {
          ...payment,
          status: 'completed' as const,
          completedAt: new Date(now).toISOString(),
          gatewayRefId: refId,
        };
        return { success: true as const, payment: completedPayment, refId };
      }

      if (verification.result === 'failed') {
        const rawError = (verification.raw as Record<string, unknown>)?.['error'];
        await txQuery(
          `UPDATE payments SET status = 'failed', failure_code = $1, failure_message = $2
           WHERE id = $3 AND status = 'pending'`,
          [
            'GATEWAY_FAILED',
            typeof rawError === 'string' ? rawError : 'Payment failed',
            payment.id,
          ],
        );
        return {
          success: false as const,
          error: typeof rawError === 'string' ? rawError : 'Payment failed',
        };
      }

      return { success: false as const, error: 'Payment pending' };
    });

    if (result.success) {
      agentLogger.info('payments', 'verify_success', `Payment verified: ${result.payment?.id}`, {
        gatewayRef: rawAuthority,
      });
    } else if (result.error) {
      agentLogger.warn(
        'payments',
        'verify_failed',
        `Payment verification failed: ${result.error}`,
        {
          gatewayRef: rawAuthority,
        },
      );
    }

    return result;
  } catch (error) {
    agentLogger.error('payments', 'callback_failed', 'Payment callback verification failed', {
      error: error instanceof Error ? error.message : String(error),
      gatewayRef,
    });
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

type TransactionQueryFn = <R extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: Array<unknown>,
) => Promise<QueryResult<R>>;

/**
 * Create or extend a subscription within an existing transaction.
 * Called from verifyPaymentCallback inside withTransaction.
 */
async function createSubscriptionInTransaction(
  txQuery: TransactionQueryFn,
  userId: string,
  planId: string,
  paymentId: string,
): Promise<void> {
  const now = Date.now();

  // Check for existing active subscription
  const existingResult = await txQuery<{ id: string; plan_id: string; expires_at: number }>(
    `SELECT id, plan_id, expires_at FROM subscriptions
     WHERE user_id = $1 AND status = 'active' AND expires_at > $2
     ORDER BY expires_at DESC LIMIT 1`,
    [userId, now],
  );

  if (existingResult.rows.length > 0) {
    const existing = existingResult.rows[0]!;

    if (existing.plan_id === planId) {
      // Same plan: extend
      const periodDays = 30;
      const durationMs = periodDays * 24 * 60 * 60 * 1000;
      const newEndDate = existing.expires_at + durationMs;
      await txQuery('UPDATE subscriptions SET expires_at = $1, payment_id = $2 WHERE id = $3', [
        newEndDate,
        paymentId,
        existing.id,
      ]);
      return;
    }

    // Different plan: cancel old, create new
    await txQuery(
      "UPDATE subscriptions SET status = 'cancelled' WHERE user_id = $1 AND status = 'active'",
      [userId],
    );
  }

  // Create new subscription
  const subId = `sub_${randomUUID()}`;
  const periodDays = 30;
  const durationMs = periodDays * 24 * 60 * 60 * 1000;
  const endDate = now + durationMs;

  await txQuery(
    `INSERT INTO subscriptions (id, user_id, plan_id, status, started_at, expires_at, payment_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [subId, userId, planId, 'active', now, endDate, paymentId],
  );
}

/**
 * Legacy non-transactional complete (kept for backward compatibility).
 * New code should use verifyPaymentCallback which is transactional.
 */
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
