import { NextResponse } from 'next/server';
import { requireAdminFromRequest } from '@/lib/server/adminAuth';
import { logApiEvent } from '@/lib/server/request-observability';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type CategoryMeta = { id: string; name: string; path: string };

type CounterRow = { key: string; count: string | number };

const CATEGORIES: CategoryMeta[] = [
  { id: 'pdf-tools', name: 'ابزارهای PDF', path: '/pdf-tools' },
  { id: 'image-tools', name: 'ابزارهای تصویر', path: '/image-tools' },
  { id: 'date-tools', name: 'ابزارهای تاریخ', path: '/date-tools' },
  { id: 'text-tools', name: 'ابزارهای متنی', path: '/text-tools' },
  { id: 'finance-tools', name: 'ابزارهای مالی', path: '/tools' },
  { id: 'validation-tools', name: 'ابزارهای اعتبارسنجی', path: '/validation-tools' },
];

export async function GET(request: Request) {
  const admin = await requireAdminFromRequest(request);
  if (!admin.ok) {
    return NextResponse.json({ ok: false }, { status: admin.status });
  }

  logApiEvent(request, { route: 'admin.analytics.get', event: 'request' });

  const url = new URL(request.url);
  const range = url.searchParams.get('range') ?? 'all';

  try {
    const summary = await getAnalyticsSummary(range);
    return NextResponse.json(summary);
  } catch {
    return NextResponse.json({
      totalEvents: 0,
      topPaths: [],
      topEvents: [],
      dailyViews: [],
      categoryBreakdown: [],
      lastUpdated: new Date().toISOString(),
    });
  }
}

async function getAnalyticsSummary(range: string) {
  try {
    const { query } = await import('@/lib/server/db');
    const summaryResult = await query<{
      total_events: string | number;
      last_updated: string | number | null;
    }>('SELECT total_events, last_updated FROM analytics_summary WHERE id = 1');
    const topPathsResult = await query<CounterRow>(
      "SELECT key, count FROM analytics_counters WHERE kind = 'path' ORDER BY count DESC LIMIT 10",
    );
    const topPaths = topPathsResult.rows.map((r: Record<string, unknown>) => ({
      path: r['key'],
      views: Number(r['count']),
    }));

    const topEventsResult = await query<CounterRow>(
      "SELECT key, count FROM analytics_counters WHERE kind = 'event' ORDER BY count DESC LIMIT 10",
    );
    const topEvents = topEventsResult.rows.map((r: Record<string, unknown>) => ({
      event: r['key'],
      count: Number(r['count']),
    }));

    const roleTrackResult = await query<CounterRow>(
      "SELECT key, count FROM analytics_counters WHERE kind = 'role_track' ORDER BY count DESC LIMIT 10",
    );
    const roleDestinationResult = await query<CounterRow>(
      "SELECT key, count FROM analytics_counters WHERE kind = 'role_destination' ORDER BY count DESC LIMIT 10",
    );

    const categoryBreakdown: Array<{ category: string; views: number }> = [];
    for (const cat of CATEGORIES) {
      const catResult = await query(
        "SELECT SUM(count) as total FROM analytics_counters WHERE kind = 'path' AND key LIKE $1",
        [`${cat.path}%`],
      );
      const catTotal = Number(catResult.rows[0]?.['total'] ?? 0);
      if (catTotal > 0) {
        categoryBreakdown.push({ category: cat.name, views: catTotal });
      }
    }
    const otherResult = await query(
      `SELECT SUM(count) as total FROM analytics_counters
       WHERE kind = 'path'
       AND key NOT LIKE '/tools%'
       AND key NOT LIKE '/pdf-tools%'
       AND key NOT LIKE '/image-tools%'
       AND key NOT LIKE '/date-tools%'
       AND key NOT LIKE '/text-tools%'
       AND key NOT LIKE '/validation-tools%'
      `,
    );
    const otherTotal = Number(otherResult.rows[0]?.['total'] ?? 0);
    if (otherTotal > 0) {
      categoryBreakdown.push({ category: 'سایر', views: otherTotal });
    }

    const summaryRow = summaryResult.rows[0] ?? null;
    const lastUpdatedAt =
      summaryRow && summaryRow.last_updated !== null
        ? new Date(Number(summaryRow.last_updated)).toISOString()
        : new Date().toISOString();

    return {
      totalEvents: summaryRow ? Number(summaryRow.total_events) : 0,
      topPaths,
      topEvents,
      dailyViews: [],
      categoryBreakdown,
      rolePathBreakdown: {
        tracks: roleTrackResult.rows.map((row) => ({
          label: row.key,
          count: Number(row.count),
        })),
        destinations: roleDestinationResult.rows.map((row) => ({
          label: row.key,
          count: Number(row.count),
        })),
      },
      range,
      rangeSupported: range === 'all',
      lastUpdated: lastUpdatedAt,
    };
  } catch {
    return {
      totalEvents: 0,
      topPaths: [],
      topEvents: [],
      dailyViews: [],
      categoryBreakdown: [],
      rolePathBreakdown: {
        tracks: [],
        destinations: [],
      },
      range,
      rangeSupported: range === 'all',
      lastUpdated: new Date().toISOString(),
    };
  }
}
