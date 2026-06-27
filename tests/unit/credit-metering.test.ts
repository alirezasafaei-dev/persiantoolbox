import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/server/db', () => ({
  query: vi.fn(),
  withTransaction: vi.fn((fn) => fn(vi.fn())),
}));

vi.mock('@/lib/subscriptions/subscription-manager', () => ({
  getActiveSubscription: vi.fn(),
}));

import { query } from '@/lib/server/db';
import { getActiveSubscription } from '@/lib/subscriptions/subscription-manager';
import { checkCredits, getCreditBalance } from '@/lib/server/credit-metering';

const mockQuery = vi.mocked(query);
const mockGetActiveSubscription = vi.mocked(getActiveSubscription);

function mockSubscription(planId: string) {
  return {
    id: 'sub_1',
    userId: 'user-1',
    planId,
    status: 'active' as const,
    startDate: '2026-01-01T00:00:00Z',
    endDate: '2026-12-31T23:59:59Z',
    autoRenew: true,
  };
}

function mockBalance(
  overrides: Partial<{
    monthly_used: number;
    monthly_limit: number;
    daily_used: number;
    daily_limit: number;
    plan_id: string;
  }> = {},
) {
  return {
    user_id: 'user-1',
    plan_id: 'basic',
    monthly_used: 0,
    monthly_limit: 10,
    daily_used: 0,
    daily_limit: 3,
    monthly_reset_at: Date.now() + 30 * 86400000,
    daily_reset_at: Date.now() + 86400000,
    ...overrides,
  };
}

describe('Credit Metering', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('checkCredits', () => {
    it('denies when no active subscription', async () => {
      mockGetActiveSubscription.mockResolvedValue(undefined);
      const result = await checkCredits('user-1', 'business');
      expect(result.allowed).toBe(false);
      expect(result.error).toContain('اشتراک فعال نیست');
    });

    it('allows when credits available and under daily limit', async () => {
      mockGetActiveSubscription.mockResolvedValue(mockSubscription('basic'));
      mockQuery.mockResolvedValue({ rows: [mockBalance()], rowCount: 1 } as never);

      const result = await checkCredits('user-1', 'business');
      expect(result.allowed).toBe(true);
      expect(result.creditsRemaining).toBe(9);
    });

    it('denies when daily limit exceeded', async () => {
      mockGetActiveSubscription.mockResolvedValue(mockSubscription('basic'));
      mockQuery
        .mockResolvedValueOnce({ rows: [], rowCount: 0 } as never)
        .mockResolvedValueOnce({
          rows: [mockBalance({ daily_used: 3, daily_limit: 3 })],
          rowCount: 1,
        } as never);

      const result = await checkCredits('user-1', 'business');
      expect(result.allowed).toBe(false);
      expect(result.error).toContain('سقف خروجی روزانه');
    });

    it('denies when monthly limit exceeded', async () => {
      mockGetActiveSubscription.mockResolvedValue(mockSubscription('basic'));
      mockQuery
        .mockResolvedValueOnce({ rows: [], rowCount: 0 } as never)
        .mockResolvedValueOnce({
          rows: [mockBalance({ monthly_used: 10, monthly_limit: 10 })],
          rowCount: 1,
        } as never);

      const result = await checkCredits('user-1', 'business');
      expect(result.allowed).toBe(false);
      expect(result.error).toContain('اعتبار خروجی ماهانه');
    });

    it('allows retry within 30 min window', async () => {
      mockGetActiveSubscription.mockResolvedValue(mockSubscription('basic'));
      mockQuery
        .mockResolvedValueOnce({
          rows: [
            {
              id: 'tx-1',
              user_id: 'user-1',
              product: 'business',
              credit_cost: 1,
              status: 'confirmed',
              created_at: Date.now() - 60000,
            },
          ],
          rowCount: 1,
        } as never)
        .mockResolvedValueOnce({ rows: [mockBalance()], rowCount: 1 } as never);

      const result = await checkCredits('user-1', 'business');
      expect(result.allowed).toBe(true);
      expect(result.retryToken).toBe('tx-1');
    });
  });

  describe('getCreditBalance', () => {
    it('returns zero for free user', async () => {
      mockGetActiveSubscription.mockResolvedValue(undefined);
      const result = await getCreditBalance('user-1');
      expect(result.planId).toBe('free');
      expect(result.monthlyLimit).toBe(0);
    });

    it('returns plan limits for subscriber', async () => {
      mockGetActiveSubscription.mockResolvedValue(mockSubscription('basic'));
      mockQuery.mockResolvedValue({
        rows: [mockBalance({ monthly_used: 3 })],
        rowCount: 1,
      } as never);

      const result = await getCreditBalance('user-1');
      expect(result.planId).toBe('basic');
      expect(result.monthlyUsed).toBe(3);
      expect(result.monthlyLimit).toBe(10);
    });
  });

  describe('Privacy', () => {
    it('export_transactions never stores document content', async () => {
      mockGetActiveSubscription.mockResolvedValue(mockSubscription('basic'));
      mockQuery
        .mockResolvedValueOnce({ rows: [], rowCount: 0 } as never)
        .mockResolvedValueOnce({ rows: [mockBalance()], rowCount: 1 } as never);

      const result = await checkCredits('user-1', 'business');
      expect(result.allowed).toBe(true);
      const insertCalls = mockQuery.mock.calls.map((call) => call[0]);
      for (const sql of insertCalls) {
        if (typeof sql === 'string') {
          expect(sql).not.toContain('INSERT INTO export_transactions');
        }
      }
    });
  });
});
