import { NextResponse } from 'next/server';
import { requireAdminFromRequest } from '@/lib/server/adminAuth';
import { logApiEvent } from '@/lib/server/request-observability';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type CategoryMeta = { id: string; name: string; path: string };

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

    let dateFilter = '';
    const params: unknown[] = [];
    if (range === 'today') {
      dateFilter = ' AND recorded_at >= CURRENT_DATE';
    } else if (range === '7d') {
      dateFilter = " AND recorded_at >= NOW() - INTERVAL '7 days'";
    } else if (range === '30d') {
      dateFilter = " AND recorded_at >= NOW() - INTERVAL '30 days'";
    }

    const eventsResult = await query(
      `SELECT SUM(count) as total FROM analytics_counters WHERE 1=1${dateFilter.replace(/ AND/g, ' AND')}`,
      params,
    );
    const totalEvents = Number(eventsResult.rows[0]?.['total'] ?? 0);

    const topPathsResult = await query(
      `SELECT key as path, count FROM analytics_counters WHERE kind = 'path'${dateFilter} ORDER BY count DESC LIMIT 10`,
      params,
    );
    const topPaths = topPathsResult.rows.map((r: Record<string, unknown>) => ({
      path: r['path'],
      views: Number(r['count']),
    }));

    const topEventsResult = await query(
      `SELECT key as event, count FROM analytics_counters WHERE kind = 'event'${dateFilter} ORDER BY count DESC LIMIT 10`,
      params,
    );
    const topEvents = topEventsResult.rows.map((r: Record<string, unknown>) => ({
      event: r['event'],
      count: Number(r['count']),
    }));

    let dailyViews: Array<{ date: string; views: number }> = [];
    try {
      const dailyResult = await query(
        `SELECT date_trunc('day', recorded_at) as day, SUM(count) as views
         FROM analytics_counters
         WHERE kind = 'path'${dateFilter}
         GROUP BY day ORDER BY day DESC LIMIT 7`,
        params,
      );
      dailyViews = dailyResult.rows.map((r: Record<string, unknown>) => ({
        date: new Date(r['day'] as string).toLocaleDateString('fa-IR'),
        views: Number(r['views']),
      }));
    } catch {
      dailyViews = [];
    }

    const categoryBreakdown: Array<{ category: string; views: number }> = [];
    for (const cat of CATEGORIES) {
      const catResult = await query(
        `SELECT SUM(count) as total FROM analytics_counters WHERE kind = 'path' AND key LIKE $1${dateFilter.replace(/AND /, 'AND ')}`,
        [`${cat.path}%`, ...params],
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
       ${dateFilter}`,
      params,
    );
    const otherTotal = Number(otherResult.rows[0]?.['total'] ?? 0);
    if (otherTotal > 0) {
      categoryBreakdown.push({ category: 'سایر', views: otherTotal });
    }

    return {
      totalEvents,
      topPaths,
      topEvents,
      dailyViews,
      categoryBreakdown,
      lastUpdated: new Date().toISOString(),
    };
  } catch {
    return {
      totalEvents: 0,
      topPaths: [],
      topEvents: [],
      dailyViews: [],
      categoryBreakdown: [],
      lastUpdated: new Date().toISOString(),
    };
  }
}
