import { afterEach, describe, expect, it, vi } from 'vitest';

const { transactionMock } = vi.hoisted(() => ({ transactionMock: vi.fn() }));

vi.mock('@/lib/server/db', () => ({
  withTransaction: transactionMock,
}));

import {
  AiQuotaExceeded,
  aiFeatureEnabled,
  consumeAiQuota,
  getOrCreateAiVisitor,
} from '@/lib/ai/quota';

afterEach(() => {
  transactionMock.mockReset();
  vi.unstubAllEnvs();
});

describe('AI quota', () => {
  it('requires both rollout gates', () => {
    vi.stubEnv('FEATURE_AI_CHAT_ENABLED', 'true');
    vi.stubEnv('AI_CLOUDFLARE_FREE_PLAN_CONFIRMED', 'false');
    expect(aiFeatureEnabled()).toBe(false);
    vi.stubEnv('AI_CLOUDFLARE_FREE_PLAN_CONFIRMED', 'true');
    expect(aiFeatureEnabled()).toBe(true);
  });

  it('signs anonymous visitor cookies and rejects tampering', () => {
    vi.stubEnv('AI_VISITOR_SECRET', 'unit-test-secret-with-at-least-32-characters');
    const created = getOrCreateAiVisitor(undefined);
    expect(created.renewed).toBe(true);
    expect(getOrCreateAiVisitor(created.cookie)).toEqual({
      visitor: created.visitor,
      cookie: created.cookie,
      renewed: false,
    });
    expect(getOrCreateAiVisitor(`${created.visitor}.${'0'.repeat(64)}`).visitor).not.toBe(
      created.visitor,
    );
  });

  it('consumes all four limits in one database transaction', async () => {
    vi.stubEnv('AI_VISITOR_SECRET', 'unit-test-secret-with-at-least-32-characters');
    const query = vi.fn(async () => ({ rowCount: 1, rows: [{ hits: 1 }] }));
    transactionMock.mockImplementation(async (operation) => operation(query));

    await consumeAiQuota('visitor-id-for-test');

    expect(transactionMock).toHaveBeenCalledOnce();
    expect(query).toHaveBeenCalledTimes(4);
    expect(
      query.mock.calls.map((call) => (call as unknown as [string, [string, Date, number]])[1][2]),
    ).toEqual([5, 2, 40, 5]);
  });

  it('fails closed when a concurrent database increment reaches a cap', async () => {
    vi.stubEnv('AI_VISITOR_SECRET', 'unit-test-secret-with-at-least-32-characters');
    const query = vi
      .fn()
      .mockResolvedValueOnce({ rowCount: 1, rows: [{ hits: 5 }] })
      .mockResolvedValueOnce({ rowCount: 0, rows: [] });
    transactionMock.mockImplementation(async (operation) => operation(query));

    await expect(consumeAiQuota('visitor-id-for-test')).rejects.toBeInstanceOf(AiQuotaExceeded);
    expect(query).toHaveBeenCalledTimes(2);
  });

  it('propagates database outages instead of allowing inference', async () => {
    vi.stubEnv('AI_VISITOR_SECRET', 'unit-test-secret-with-at-least-32-characters');
    transactionMock.mockRejectedValue(new Error('database unavailable'));

    await expect(consumeAiQuota('visitor-id-for-test')).rejects.toThrow('database unavailable');
  });
});
