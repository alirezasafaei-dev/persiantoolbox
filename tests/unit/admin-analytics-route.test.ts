import { beforeEach, describe, expect, it, vi } from 'vitest';

const requireAdminFromRequest = vi.fn();
const logApiEvent = vi.fn();
const query = vi.fn();

vi.mock('@/lib/server/adminAuth', () => ({
  requireAdminFromRequest,
}));

vi.mock('@/lib/server/request-observability', () => ({
  logApiEvent,
}));

vi.mock('@/lib/server/db', () => ({
  query,
}));

describe('admin analytics route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireAdminFromRequest.mockResolvedValue({ ok: true, status: 200 });
    query.mockImplementation(async (sql: string, params?: unknown[]) => {
      if (sql.includes('FROM analytics_summary')) {
        return { rows: [{ total_events: 42, last_updated: 1_720_000_000_000 }] };
      }
      if (sql.includes("kind = 'path' ORDER BY count DESC LIMIT 10")) {
        return { rows: [{ key: '/writing-tools/persian-writing-studio', count: 12 }] };
      }
      if (sql.includes("kind = 'event' ORDER BY count DESC LIMIT 10")) {
        return { rows: [{ key: 'role_path_click', count: 5 }] };
      }
      if (sql.includes("kind = 'role_track'")) {
        return { rows: [{ key: 'حسابدار', count: 3 }] };
      }
      if (sql.includes("kind = 'role_destination'")) {
        return { rows: [{ key: '/business-tools/document-studio?type=invoice', count: 2 }] };
      }
      if (sql.includes("kind = 'path' AND key LIKE $1")) {
        const prefix = String(params?.[0] ?? '');
        if (prefix === '/tools%') {
          return { rows: [{ total: 7 }] };
        }
        if (prefix === '/text-tools%') {
          return { rows: [{ total: 4 }] };
        }
        return { rows: [{ total: 0 }] };
      }
      if (sql.includes("AND key NOT LIKE '/tools%'")) {
        return { rows: [{ total: 9 }] };
      }
      return { rows: [] };
    });
  });

  it('returns aggregate analytics without invalid recorded_at filters', async () => {
    const { GET } = await import('@/app/api/admin/analytics/route');
    const response = await GET(
      new Request('https://persiantoolbox.ir/api/admin/analytics?range=7d'),
    );
    const json = (await response.json()) as {
      totalEvents: number;
      rolePathBreakdown: {
        tracks: Array<{ label: string; count: number }>;
        destinations: Array<{ label: string; count: number }>;
      };
      rangeSupported: boolean;
    };

    expect(response.status).toBe(200);
    expect(json.totalEvents).toBe(42);
    expect(json.rangeSupported).toBe(false);
    expect(json.rolePathBreakdown.tracks).toEqual([{ label: 'حسابدار', count: 3 }]);
    expect(json.rolePathBreakdown.destinations).toEqual([
      { label: '/business-tools/document-studio?type=invoice', count: 2 },
    ]);
    expect(query.mock.calls.every(([sql]) => !String(sql).includes('recorded_at'))).toBe(true);
  });
});
