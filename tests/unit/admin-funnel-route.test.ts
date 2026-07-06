import { beforeEach, describe, expect, it, vi } from 'vitest';

const requireAdminFromRequest = vi.fn();
const logApiEvent = vi.fn();
const getLatestFunnelSnapshot = vi.fn();
const getFunnelHistory = vi.fn();
const saveFunnelSnapshot = vi.fn();
const query = vi.fn();

vi.mock('@/lib/server/adminAuth', () => ({
  requireAdminFromRequest,
}));

vi.mock('@/lib/server/request-observability', () => ({
  logApiEvent,
}));

vi.mock('@/lib/server/funnelStorage', () => ({
  getLatestFunnelSnapshot,
  getFunnelHistory,
  saveFunnelSnapshot,
}));

vi.mock('@/lib/server/db', () => ({
  query,
}));

describe('admin funnel route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireAdminFromRequest.mockResolvedValue({ ok: true, status: 200 });
    getLatestFunnelSnapshot.mockResolvedValue(null);
    getFunnelHistory.mockResolvedValue([]);
    query.mockImplementation(async (sql: string) => {
      if (sql.includes("kind = 'path'")) {
        return {
          rows: [
            { key: '/', count: '100' },
            { key: '/business-tools/document-studio', count: '40' },
            { key: '/writing-tools/persian-writing-studio', count: '25' },
          ],
        };
      }
      if (sql.includes("kind = 'event'")) {
        return {
          rows: [
            { key: 'role_path_click', count: '18' },
            { key: 'upgrade_prompt_view', count: '7' },
            { key: 'checkout_start', count: '5' },
            { key: 'checkout_complete', count: '2' },
          ],
        };
      }
      return { rows: [] };
    });
    saveFunnelSnapshot.mockImplementation(async (snapshot) => ({
      id: 'snapshot-1',
      recordedAt: 1_720_000_000_000,
      ...snapshot,
    }));
  });

  it('computes funnel stages from lowercase analytics event names', async () => {
    const { GET } = await import('@/app/api/admin/funnel/route');
    const response = await GET(new Request('https://persiantoolbox.ir/api/admin/funnel'));
    const json = (await response.json()) as {
      ok: boolean;
      data: {
        snapshot: {
          totalVisits: number;
          totalConversions: number;
          stages: Array<{ stage: string; users: number }>;
          cohorts: Array<{ month: string; users: number; retention90: number }>;
          monthlyVisits: Array<{ label: string; value: number }>;
        };
      };
    };

    expect(response.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(json.data.snapshot.totalVisits).toBe(165);
    expect(json.data.snapshot.totalConversions).toBe(2);
    expect(json.data.snapshot.stages).toEqual([
      { stage: 'بازدید', users: 165 },
      { stage: 'استفاده از ابزار', users: 65 },
      { stage: 'بررسی ارتقا', users: 30 },
      { stage: 'شروع پرداخت', users: 5 },
      { stage: 'تکمیل پرداخت', users: 2 },
    ]);
    expect(json.data.snapshot.cohorts[0]).toMatchObject({
      month: 'همه‌زمان',
      users: 18,
      retention90: 27.8,
    });
    expect(json.data.snapshot.monthlyVisits).toEqual([
      { label: 'بازدید', value: 165 },
      { label: 'مسیر نقش‌محور', value: 18 },
      { label: 'شروع پرداخت', value: 5 },
      { label: 'پرداخت موفق', value: 2 },
    ]);
  });
});
