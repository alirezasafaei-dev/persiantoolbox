import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ query: vi.fn(), plan: vi.fn() }));
vi.mock('@/lib/server/db', () => ({ query: mocks.query }));
vi.mock('@/lib/server/subscriptionPlans', () => ({ getPlanByIdAsync: mocks.plan }));
vi.mock('@/lib/agent-logger', () => ({ agentLogger: { info: vi.fn() } }));
import {
  getActiveSubscription,
  createSubscription,
} from '@/lib/subscriptions/subscription-manager';
const start = 1794000000000;
const expiry = 1797000000000;
const row = {
  id: 'synthetic-subscription',
  user_id: 'synthetic-user',
  plan_id: 'pack-3',
  status: 'active',
  started_at: String(start),
  expires_at: String(expiry),
  payment_id: 'synthetic-payment',
};
describe('PostgreSQL bigint subscription timestamps', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(start);
    mocks.plan.mockResolvedValue({ periodDays: 30 });
  });
  afterEach(() => vi.useRealTimers());
  it.each(['string', 'number'])('reads %s epoch milliseconds as ISO dates', async (kind) => {
    mocks.query.mockResolvedValue({
      rowCount: 1,
      rows: [
        {
          ...row,
          started_at: kind === 'string' ? String(start) : start,
          expires_at: kind === 'string' ? String(expiry) : expiry,
        },
      ],
    });
    await expect(getActiveSubscription('synthetic-user')).resolves.toMatchObject({
      startDate: new Date(start).toISOString(),
      endDate: new Date(expiry).toISOString(),
      planId: 'pack-3',
    });
  });
  it('extends an existing string expiry arithmetically rather than concatenating', async () => {
    mocks.query
      .mockResolvedValueOnce({ rowCount: 1, rows: [row] })
      .mockResolvedValue({ rowCount: 1, rows: [] });
    const result = await createSubscription('synthetic-user', 'pack-3');
    const expected = expiry + 30 * 86400000;
    expect(mocks.query).toHaveBeenNthCalledWith(
      2,
      'UPDATE subscriptions SET expires_at = $1 WHERE id = $2',
      [expected, row.id],
    );
    expect(result.endDate).toBe(new Date(expected).toISOString());
  });
});
