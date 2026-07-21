import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  query: vi.fn(),
  withTransaction: vi.fn(),
  txQuery: vi.fn(),
  verifyCallback: vi.fn(),
  events: [] as string[],
}));

vi.mock('@/lib/server/db', () => ({ query: mocks.query, withTransaction: mocks.withTransaction }));
vi.mock('@/lib/agent-logger', () => ({
  agentLogger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));
vi.mock('@/lib/payments/payment-urls', () => ({
  resolvePaymentsCallbackUrl: () => 'https://example.test/api/payments/callback',
}));
vi.mock('@/lib/payments/payment-integration', () => ({
  normalizeZarinpalAuthority: (authority: string) => authority.replace(/^zarinpal_/, ''),
  tomanToRial: (amount: number) => {
    if (!Number.isSafeInteger(amount) || amount <= 0) throw new Error('invalid amount');
    return amount * 10;
  },
}));
vi.mock('@shared/payments', () => ({
  createPaymentGatewayAdapter: () => ({ verifyCallback: mocks.verifyCallback }),
}));

import { verifyPaymentCallback } from '@/lib/payments/payment-verification';

const authority = 'A000000000000000000000000000001';
const paymentId = '11111111-1111-4111-8111-111111111111';
const userId = '22222222-2222-4222-8222-222222222222';
const subscriptionId = '33333333-3333-4333-8333-333333333333';

function paymentRow(overrides: Record<string, unknown> = {}) {
  return {
    id: paymentId,
    user_id: userId,
    amount: 49_000,
    currency: 'TOMAN',
    status: 'pending',
    metadata: { planId: 'pack-3', periodDays: 30 },
    completed_at: null,
    gateway_amount_irr: 490_000,
    gateway_authority: authority,
    gateway_ref_id: null,
    gateway_name: 'zarinpal',
    failure_code: null,
    failure_message: null,
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.events.length = 0;
  mocks.query.mockImplementation(async () => {
    mocks.events.push('read');
    return { rows: [paymentRow()], rowCount: 1 };
  });
  mocks.txQuery.mockImplementation(async (sql: string) => {
    if (sql.includes('FROM payment_fulfillments')) return { rows: [], rowCount: 0 };
    if (sql.includes('FROM subscriptions')) return { rows: [], rowCount: 0 };
    if (sql.includes('SELECT')) return { rows: [paymentRow()], rowCount: 1 };
    return { rows: [], rowCount: 1 };
  });
  mocks.withTransaction.mockImplementation(
    async (callback: (queryFn: typeof mocks.txQuery) => unknown) => {
      mocks.events.push('transaction');
      return callback(mocks.txQuery);
    },
  );
  mocks.verifyCallback.mockImplementation(async () => {
    mocks.events.push('verify');
    return { result: 'succeeded', raw: { ref_id: '123456' } };
  });
});

describe('lock-safe payment verification', () => {
  it('calls the gateway before opening the fulfillment transaction', async () => {
    const result = await verifyPaymentCallback(authority, { Authority: authority, Status: 'OK' });
    expect(result.success).toBe(true);
    expect(mocks.events).toEqual(['read', 'verify', 'transaction']);
    expect(mocks.txQuery).toHaveBeenCalledWith(expect.stringContaining('FOR UPDATE'), [paymentId]);
    expect(mocks.txQuery).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO payment_fulfillments'),
      expect.arrayContaining([paymentId]),
    );
  });

  it('is idempotent when another callback completes and records fulfillment first', async () => {
    mocks.txQuery.mockImplementation(async (sql: string) => {
      if (sql.includes('FROM payment_fulfillments')) {
        return { rows: [{ subscription_id: subscriptionId }], rowCount: 1 };
      }
      if (sql.includes('SELECT')) {
        return {
          rows: [
            paymentRow({
              status: 'completed',
              completed_at: Date.now(),
              gateway_ref_id: '123456',
            }),
          ],
          rowCount: 1,
        };
      }
      return { rows: [], rowCount: 1 };
    });

    const result = await verifyPaymentCallback(authority, { Authority: authority, Status: 'OK' });
    expect(result.success).toBe(true);
    expect(result.payment?.status).toBe('completed');
    expect(mocks.events).toEqual(['read', 'verify', 'transaction']);
  });

  it('marks a completed subscription payment without ledger for reconciliation', async () => {
    mocks.query.mockResolvedValueOnce({
      rows: [paymentRow({ status: 'completed', completed_at: Date.now() })],
      rowCount: 1,
    });

    const result = await verifyPaymentCallback(authority, { Authority: authority, Status: 'OK' });
    expect(result.success).toBe(false);
    expect(result.payment?.status).toBe('reconciliation_required');
    expect(result.error).toContain('reconciliation');
    expect(mocks.verifyCallback).not.toHaveBeenCalled();
  });

  it('does not call the gateway when the persisted amount contract is inconsistent', async () => {
    mocks.query.mockResolvedValueOnce({
      rows: [paymentRow({ gateway_amount_irr: 49_000 })],
      rowCount: 1,
    });
    const result = await verifyPaymentCallback(authority, { Authority: authority, Status: 'OK' });
    expect(result.success).toBe(false);
    expect(result.error).toContain('reconciliation');
    expect(mocks.verifyCallback).not.toHaveBeenCalled();
    expect(mocks.withTransaction).toHaveBeenCalledTimes(1);
  });

  it('rejects a payment associated with another gateway', async () => {
    mocks.query.mockResolvedValueOnce({
      rows: [paymentRow({ gateway_name: 'internal' })],
      rowCount: 1,
    });
    const result = await verifyPaymentCallback(authority, { Authority: authority, Status: 'OK' });
    expect(result.success).toBe(false);
    expect(result.error).toBe('Payment gateway mismatch');
    expect(mocks.verifyCallback).not.toHaveBeenCalled();
  });
});
