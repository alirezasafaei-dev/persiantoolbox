import { randomUUID } from 'node:crypto';
import type { QueryResult, QueryResultRow } from 'pg';
import { agentLogger } from '@/lib/agent-logger';
import { normalizeZarinpalAuthority, tomanToRial, type PaymentStatus } from '@/lib/payments/payment-integration';
import { resolvePaymentsCallbackUrl } from '@/lib/payments/payment-urls';
import { query, withTransaction } from '@/lib/server/db';
import {
  createPaymentGatewayAdapter,
  type CallbackResult,
  type PaymentConfig,
  type PaymentGatewayAdapter,
} from '@shared/payments';

export type VerifiedPayment = {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  metadata: Record<string, unknown> | undefined;
  completedAt: string | undefined;
  gatewayAmountIrr: number | undefined;
  gatewayAuthority: string | undefined;
  gatewayRefId: string | undefined;
  failureCode: string | undefined;
  failureMessage: string | undefined;
};

export type PaymentVerificationResponse = {
  success: boolean;
  payment?: VerifiedPayment;
  error?: string;
};

type PaymentRow = {
  id: string;
  user_id: string;
  amount: number | string;
  currency: string;
  status: string;
  metadata: string | Record<string, unknown> | null;
  completed_at: number | string | null;
  gateway_amount_irr: number | string | null;
  gateway_authority: string | null;
  gateway_ref_id: string | null;
  gateway_name: string | null;
  failure_code: string | null;
  failure_message: string | null;
};

type TransactionQueryFn = <R extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: Array<unknown>,
) => Promise<QueryResult<R>>;

const PAYMENT_SELECT =
  'id, user_id, amount, currency, status, metadata, completed_at, gateway_amount_irr, ' +
  'gateway_authority, gateway_ref_id, gateway_name, failure_code, failure_message';

function parseMetadata(value: PaymentRow['metadata']): Record<string, unknown> | undefined {
  if (!value) return undefined;
  if (typeof value !== 'string') return value;
  try {
    return JSON.parse(value) as Record<string, unknown>;
  } catch {
    return undefined;
  }
}

function mapPayment(row: PaymentRow): VerifiedPayment {
  return {
    id: row.id,
    userId: row.user_id,
    amount: Number(row.amount),
    currency: row.currency,
    status: row.status as PaymentStatus,
    metadata: parseMetadata(row.metadata),
    completedAt: row.completed_at ? new Date(Number(row.completed_at)).toISOString() : undefined,
    gatewayAmountIrr:
      row.gateway_amount_irr !== null ? Number(row.gateway_amount_irr) : undefined,
    gatewayAuthority: row.gateway_authority ?? undefined,
    gatewayRefId: row.gateway_ref_id ?? undefined,
    failureCode: row.failure_code ?? undefined,
    failureMessage: row.failure_message ?? undefined,
  };
}

function getPaymentAdapter(): PaymentGatewayAdapter {
  const merchantId = process.env['ZARINPAL_MERCHANT_ID']?.trim() ?? '';
  if (!merchantId && process.env['NODE_ENV'] === 'production') {
    throw new Error('PAYMENT_GATEWAY_NOT_CONFIGURED');
  }

  const config: PaymentConfig = {
    merchantId,
    callbackUrl: resolvePaymentsCallbackUrl(),
    sandbox: process.env['ZARINPAL_MODE'] === 'sandbox',
  };
  return createPaymentGatewayAdapter(config, merchantId ? 'zarinpal' : 'mock');
}

function rowAuthority(row: PaymentRow): string | undefined {
  const metadata = parseMetadata(row.metadata);
  const candidate =
    row.gateway_authority ??
    (metadata?.['gatewayAuthority'] as string | undefined) ??
    (metadata?.['gatewayRef'] as string | undefined);
  return candidate ? normalizeZarinpalAuthority(candidate) : undefined;
}

function resolveGatewayAmountIrr(row: PaymentRow): number {
  const derivedAmount = tomanToRial(Number(row.amount));
  if (row.gateway_amount_irr === null) return derivedAmount;

  const storedAmount = Number(row.gateway_amount_irr);
  if (!Number.isSafeInteger(storedAmount) || storedAmount <= 0) {
    throw new Error('PAYMENT_GATEWAY_AMOUNT_INVALID');
  }
  if (storedAmount !== derivedAmount) {
    throw new Error('PAYMENT_AMOUNT_MISMATCH');
  }
  return storedAmount;
}

function paymentPlan(row: PaymentRow): { planId?: string; periodDays: number } {
  const metadata = parseMetadata(row.metadata);
  const planId = typeof metadata?.['planId'] === 'string' ? metadata['planId'] : undefined;
  const rawPeriodDays = Number(metadata?.['periodDays'] ?? 30);
  const periodDays =
    Number.isSafeInteger(rawPeriodDays) && rawPeriodDays > 0 && rawPeriodDays <= 366
      ? rawPeriodDays
      : 30;
  return { ...(planId ? { planId } : {}), periodDays };
}

function callbackRefId(verification: CallbackResult): string | undefined {
  const value = verification.raw?.['ref_id'];
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  return undefined;
}

function callbackError(verification: CallbackResult): string {
  const value = verification.raw?.['error'];
  return typeof value === 'string' ? value.slice(0, 500) : 'Payment gateway rejected verification';
}

async function findPaymentByAuthority(authority: string): Promise<PaymentRow | undefined> {
  const result = await query<PaymentRow>(
    `SELECT ${PAYMENT_SELECT}
     FROM payments
     WHERE gateway_authority = $1
        OR metadata->>'gatewayAuthority' = $1
        OR metadata->>'gatewayRef' = $1
        OR metadata->>'gatewayRef' = $2
     LIMIT 1`,
    [authority, `zarinpal_${authority}`],
  );
  return result.rows[0];
}

async function markReconciliationRequired(
  txQuery: TransactionQueryFn,
  paymentId: string,
  code: string,
  message: string,
): Promise<void> {
  await txQuery(
    `UPDATE payments
     SET status = 'reconciliation_required', failure_code = $1, failure_message = $2
     WHERE id = $3 AND status IN ('pending', 'completed', 'reconciliation_required')`,
    [code, message.slice(0, 500), paymentId],
  );
}

async function createSubscriptionInTransaction(
  txQuery: TransactionQueryFn,
  row: PaymentRow,
): Promise<void> {
  const { planId, periodDays } = paymentPlan(row);
  if (!planId) return;

  const alreadyFulfilled = await txQuery<{ id: string }>(
    'SELECT id FROM subscriptions WHERE payment_id = $1 LIMIT 1',
    [row.id],
  );
  if (alreadyFulfilled.rows.length > 0) return;

  const now = Date.now();
  const durationMs = periodDays * 24 * 60 * 60 * 1000;
  const existingResult = await txQuery<{
    id: string;
    plan_id: string;
    expires_at: number | string;
  }>(
    `SELECT id, plan_id, expires_at
     FROM subscriptions
     WHERE user_id = $1 AND status = 'active' AND expires_at > $2
     ORDER BY expires_at DESC
     LIMIT 1
     FOR UPDATE`,
    [row.user_id, now],
  );

  const existing = existingResult.rows[0];
  if (existing?.plan_id === planId) {
    const currentExpiry = Number(existing.expires_at);
    const newExpiry = Math.max(currentExpiry, now) + durationMs;
    await txQuery(
      'UPDATE subscriptions SET expires_at = $1, payment_id = $2 WHERE id = $3',
      [newExpiry, row.id, existing.id],
    );
    return;
  }

  if (existing) {
    await txQuery(
      "UPDATE subscriptions SET status = 'canceled' WHERE user_id = $1 AND status = 'active'",
      [row.user_id],
    );
  }

  await txQuery(
    `INSERT INTO subscriptions (id, user_id, plan_id, status, started_at, expires_at, payment_id)
     VALUES ($1, $2, $3, 'active', $4, $5, $6)`,
    [randomUUID(), row.user_id, planId, now, now + durationMs, row.id],
  );
}

async function recoverFulfillment(row: PaymentRow): Promise<PaymentVerificationResponse> {
  const { planId } = paymentPlan(row);
  if (!planId) {
    if (row.status === 'completed') return { success: true, payment: mapPayment(row) };
    return { success: false, payment: mapPayment(row), error: `Payment is ${row.status}` };
  }

  return withTransaction(async (txQuery) => {
    const lockResult = await txQuery<PaymentRow>(
      `SELECT ${PAYMENT_SELECT} FROM payments WHERE id = $1 FOR UPDATE`,
      [row.id],
    );
    const lockedRow = lockResult.rows[0];
    if (!lockedRow) return { success: false, error: 'Payment not found' };
    if (!['completed', 'reconciliation_required'].includes(lockedRow.status)) {
      return { success: false, payment: mapPayment(lockedRow), error: `Payment is ${lockedRow.status}` };
    }

    try {
      await createSubscriptionInTransaction(txQuery, lockedRow);
      if (lockedRow.status === 'reconciliation_required') {
        await txQuery(
          `UPDATE payments
           SET status = 'completed', failure_code = NULL, failure_message = NULL
           WHERE id = $1 AND status = 'reconciliation_required'`,
          [lockedRow.id],
        );
      }
      return {
        success: true,
        payment: {
          ...mapPayment(lockedRow),
          status: 'completed',
          failureCode: undefined,
          failureMessage: undefined,
        },
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown fulfillment error';
      await markReconciliationRequired(txQuery, lockedRow.id, 'SUBSCRIPTION_FAILED', message);
      return {
        success: false,
        payment: { ...mapPayment(lockedRow), status: 'reconciliation_required' },
        error: 'Payment verified but entitlement activation requires reconciliation',
      };
    }
  });
}

async function finalizeSuccessfulVerification(
  initialRow: PaymentRow,
  authority: string,
  amountIrr: number,
  refId: string | undefined,
): Promise<PaymentVerificationResponse> {
  return withTransaction(async (txQuery) => {
    const lockResult = await txQuery<PaymentRow>(
      `SELECT ${PAYMENT_SELECT} FROM payments WHERE id = $1 FOR UPDATE`,
      [initialRow.id],
    );
    const row = lockResult.rows[0];
    if (!row) return { success: false, error: 'Payment not found' };

    if (row.status === 'completed' || row.status === 'reconciliation_required') {
      try {
        await createSubscriptionInTransaction(txQuery, row);
        if (row.status === 'reconciliation_required') {
          await txQuery(
            `UPDATE payments
             SET status = 'completed', failure_code = NULL, failure_message = NULL
             WHERE id = $1`,
            [row.id],
          );
        }
        return {
          success: true,
          payment: {
            ...mapPayment(row),
            status: 'completed',
            failureCode: undefined,
            failureMessage: undefined,
          },
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown fulfillment error';
        await markReconciliationRequired(txQuery, row.id, 'SUBSCRIPTION_FAILED', message);
        return {
          success: false,
          payment: { ...mapPayment(row), status: 'reconciliation_required' },
          error: 'Payment verified but entitlement activation requires reconciliation',
        };
      }
    }

    if (row.status !== 'pending') {
      return { success: false, payment: mapPayment(row), error: `Payment is ${row.status}` };
    }

    if (rowAuthority(row) !== authority) {
      await markReconciliationRequired(
        txQuery,
        row.id,
        'AUTHORITY_CHANGED',
        'Gateway Authority changed between verification phases',
      );
      return { success: false, error: 'Payment Authority changed during verification' };
    }

    let currentAmountIrr: number;
    try {
      currentAmountIrr = resolveGatewayAmountIrr(row);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Payment amount invalid';
      await markReconciliationRequired(txQuery, row.id, 'AMOUNT_INVALID', message);
      return { success: false, error: 'Payment amount requires reconciliation' };
    }

    if (currentAmountIrr !== amountIrr) {
      await markReconciliationRequired(
        txQuery,
        row.id,
        'AMOUNT_CHANGED',
        'Gateway amount changed between verification phases',
      );
      return { success: false, error: 'Payment amount changed during verification' };
    }

    if (row.gateway_ref_id && refId && row.gateway_ref_id !== refId) {
      await markReconciliationRequired(
        txQuery,
        row.id,
        'REFERENCE_CONFLICT',
        'Gateway reference ID conflicts with the persisted payment',
      );
      return { success: false, error: 'Payment reference requires reconciliation' };
    }

    const now = Date.now();
    await txQuery(
      `UPDATE payments
       SET status = 'completed',
           completed_at = $1,
           gateway_ref_id = COALESCE(gateway_ref_id, $2),
           gateway_amount_irr = $3,
           failure_code = NULL,
           failure_message = NULL
       WHERE id = $4 AND status = 'pending'`,
      [now, refId ?? null, amountIrr, row.id],
    );

    try {
      await createSubscriptionInTransaction(txQuery, row);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown fulfillment error';
      await markReconciliationRequired(txQuery, row.id, 'SUBSCRIPTION_FAILED', message);
      return {
        success: false,
        payment: { ...mapPayment(row), status: 'reconciliation_required' },
        error: 'Payment verified but entitlement activation requires reconciliation',
      };
    }

    return {
      success: true,
      payment: {
        ...mapPayment(row),
        status: 'completed',
        completedAt: new Date(now).toISOString(),
        gatewayAmountIrr: amountIrr,
        gatewayRefId: refId ?? row.gateway_ref_id ?? undefined,
        failureCode: undefined,
        failureMessage: undefined,
      },
    };
  });
}

async function finalizeFailedVerification(
  initialRow: PaymentRow,
  errorMessage: string,
): Promise<PaymentVerificationResponse> {
  return withTransaction(async (txQuery) => {
    const lockResult = await txQuery<PaymentRow>(
      `SELECT ${PAYMENT_SELECT} FROM payments WHERE id = $1 FOR UPDATE`,
      [initialRow.id],
    );
    const row = lockResult.rows[0];
    if (!row) return { success: false, error: 'Payment not found' };
    if (row.status === 'completed') return { success: true, payment: mapPayment(row) };
    if (row.status !== 'pending') {
      return { success: false, payment: mapPayment(row), error: `Payment is ${row.status}` };
    }

    await txQuery(
      `UPDATE payments
       SET status = 'failed', failure_code = 'GATEWAY_FAILED', failure_message = $1
       WHERE id = $2 AND status = 'pending'`,
      [errorMessage.slice(0, 500), row.id],
    );
    return {
      success: false,
      payment: {
        ...mapPayment(row),
        status: 'failed',
        failureCode: 'GATEWAY_FAILED',
        failureMessage: errorMessage.slice(0, 500),
      },
      error: errorMessage,
    };
  });
}

/**
 * Verify the provider outside any database transaction, then re-lock and
 * revalidate the persisted payment before atomic completion and fulfillment.
 */
export async function verifyPaymentCallback(
  gatewayRef: string,
  payload: Record<string, string | undefined>,
  headers?: Record<string, string | undefined>,
): Promise<PaymentVerificationResponse> {
  const authority = normalizeZarinpalAuthority(gatewayRef);

  try {
    const initialRow = await findPaymentByAuthority(authority);
    if (!initialRow) return { success: false, error: 'Payment not found' };

    if (initialRow.status === 'completed' || initialRow.status === 'reconciliation_required') {
      return recoverFulfillment(initialRow);
    }
    if (initialRow.status !== 'pending') {
      return {
        success: false,
        payment: mapPayment(initialRow),
        error: `Payment is ${initialRow.status}`,
      };
    }

    if (rowAuthority(initialRow) !== authority) {
      return { success: false, error: 'Payment Authority mismatch' };
    }

    let amountIrr: number;
    try {
      amountIrr = resolveGatewayAmountIrr(initialRow);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Payment amount invalid';
      await withTransaction((txQuery) =>
        markReconciliationRequired(txQuery, initialRow.id, 'AMOUNT_INVALID', message),
      );
      return { success: false, error: 'Payment amount requires reconciliation' };
    }

    const adapter = getPaymentAdapter();
    const verification = await adapter.verifyCallback({
      gatewayRef: authority,
      payload: { ...payload, Authority: authority, Amount: String(amountIrr) },
      ...(headers ? { headers } : {}),
    });

    let result: PaymentVerificationResponse;
    if (verification.result === 'succeeded') {
      result = await finalizeSuccessfulVerification(
        initialRow,
        authority,
        amountIrr,
        callbackRefId(verification),
      );
    } else if (verification.result === 'failed') {
      result = await finalizeFailedVerification(initialRow, callbackError(verification));
    } else {
      result = { success: false, payment: mapPayment(initialRow), error: 'Payment pending' };
    }

    const event = result.success ? 'verify_success' : 'verify_failed';
    const message = result.success
      ? `Payment verified: ${result.payment?.id}`
      : `Payment verification failed: ${result.error ?? 'unknown'}`;
    if (result.success) {
      agentLogger.info('payments', event, message, { gatewayRef: authority });
    } else {
      agentLogger.warn('payments', event, message, { gatewayRef: authority });
    }
    return result;
  } catch (error) {
    const internalMessage = error instanceof Error ? error.message : String(error);
    agentLogger.error('payments', 'callback_failed', 'Payment callback verification failed', {
      error: internalMessage,
      gatewayRef: authority,
    });
    return {
      success: false,
      error:
        internalMessage === 'PAYMENT_GATEWAY_NOT_CONFIGURED'
          ? internalMessage
          : 'Payment verification could not be completed',
    };
  }
}
