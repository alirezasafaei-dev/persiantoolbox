import { readFileSync } from 'node:fs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  query: vi.fn(),
  txQuery: vi.fn(),
  withTransaction: vi.fn(),
}));

vi.mock('@/lib/server/db', () => ({
  query: mocks.query,
  withTransaction: mocks.withTransaction,
}));

describe('signup gift credit contract', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.withTransaction.mockImplementation(
      async (callback: (queryFn: typeof mocks.txQuery) => unknown) => callback(mocks.txQuery),
    );
  });

  it('creates the gift idempotently with a PostgreSQL UUID and reports all gift states', async () => {
    const { createSignupGiftInTransaction, getSignupGiftStatus } = await import(
      '@/lib/server/trial'
    );
    mocks.txQuery
      .mockResolvedValueOnce({ rows: [], rowCount: 0 })
      .mockResolvedValueOnce({ rows: [], rowCount: 0 })
      .mockResolvedValueOnce({ rows: [], rowCount: 1 });

    await createSignupGiftInTransaction(mocks.txQuery, '22222222-2222-4222-8222-222222222222');

    const insert = mocks.txQuery.mock.calls.find(([sql]) => String(sql).includes('INSERT INTO subscriptions'));
    expect(insert).toBeDefined();
    expect(insert?.[1]?.[0]).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    expect(String(insert?.[0])).toContain('ON CONFLICT DO NOTHING');

    mocks.query.mockResolvedValueOnce({
      rows: [{ expires_at: Date.now() + 86_400_000, consumed: false }],
      rowCount: 1,
    });
    await expect(getSignupGiftStatus('user-1')).resolves.toMatchObject({ status: 'available' });

    mocks.query.mockResolvedValueOnce({
      rows: [{ expires_at: Date.now() + 86_400_000, consumed: true }],
      rowCount: 1,
    });
    await expect(getSignupGiftStatus('user-1')).resolves.toMatchObject({ status: 'consumed' });

    mocks.query.mockResolvedValueOnce({
      rows: [{ expires_at: Date.now() - 1, consumed: false }],
      rowCount: 1,
    });
    await expect(getSignupGiftStatus('user-1')).resolves.toMatchObject({ status: 'expired' });
  });

  it('keeps user creation and gift creation in the same transaction', () => {
    const source = readFileSync('app/api/auth/register/route.ts', 'utf8');
    expect(source).toContain('createUserWithSignupGift');
    expect(source).not.toContain('await createUser(');
    expect(source).not.toContain('await startTrial(');
  });

  it('has no trial mutation endpoint and uses precise Persian gift copy', () => {
    const route = readFileSync('app/api/trial/route.ts', 'utf8');
    const pricing = readFileSync('components/features/pricing/PricingContent.tsx', 'utf8');
    const authForm = readFileSync('components/features/monetization/AuthForms.tsx', 'utf8');

    expect(route).not.toMatch(/export async function POST/);
    expect(pricing).not.toContain("fetch('/api/trial', { method: 'POST'");
    expect(pricing).not.toContain('دسترسی کامل رایگان');
    expect(pricing).not.toContain('نامحدود');
    expect(pricing).not.toContain('تأیید ایمیل');
    expect(authForm).toContain('یک خروجی حرفه‌ای هدیه');
    expect(authForm).toContain('۷ روز');
  });
});
