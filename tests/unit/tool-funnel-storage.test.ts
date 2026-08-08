import { beforeEach, describe, expect, it, vi } from 'vitest';

const query = vi.fn();
const txQuery = vi.fn();
const withTransaction = vi.fn(async (callback: (queryFn: typeof txQuery) => Promise<unknown>) =>
  callback(txQuery),
);

vi.mock('@/lib/server/db', () => ({ query, withTransaction }));

describe('tool funnel aggregate storage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env['ANALYTICS_STORAGE'] = 'postgres';
    query.mockResolvedValue({ rows: [], rowCount: 0 });
    txQuery.mockResolvedValue({ rows: [], rowCount: 1 });
  });

  it('stores only a safe per-tool daily counter for start and completion', async () => {
    const { ingestAnalyticsEvents } = await import('@/lib/analyticsStore');

    await ingestAnalyticsEvents([
      {
        event: 'tool_start',
        timestamp: Date.now(),
        path: '/text-tools/address-fa-to-en?utm_campaign=test',
        metadata: {
          consentGranted: true,
          tool_id: 'address-fa-to-en',
          category: 'text-tools',
          address: 'خیابان خصوصی کاربر',
        },
      },
    ]);

    const calls = JSON.stringify(txQuery.mock.calls);
    expect(calls).toContain('tool_event');
    expect(calls).toContain('address-fa-to-en:tool_start');
    expect(calls).not.toContain('خیابان خصوصی کاربر');
    expect(calls).not.toContain('utm_campaign=test');
  });
});
