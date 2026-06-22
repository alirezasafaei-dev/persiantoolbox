import { NextResponse } from 'next/server';
import { requireAdminFromRequest } from '@/lib/server/adminAuth';
import { logApiEvent } from '@/lib/server/request-observability';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: Request) {
  const adminError = await requireAdminFromRequest(request);
  if (adminError) {
    return adminError;
  }

  logApiEvent(request, { route: 'admin.analytics.get', event: 'request' });

  try {
    const summary = await getAnalyticsSummary();
    return NextResponse.json(summary);
  } catch {
    return NextResponse.json({
      totalEvents: 0,
      topPaths: [],
      topEvents: [],
      dailyViews: [],
    });
  }
}

async function getAnalyticsSummary() {
  try {
    const { query } = await import('@/lib/server/db');
    const eventsResult = await query('SELECT SUM(count) as total FROM analytics_counters', []);
    const totalEvents = Number(eventsResult.rows[0]?.['total'] ?? 0);

    const topPathsResult = await query(
      "SELECT key as path, count FROM analytics_counters WHERE kind = 'path' ORDER BY count DESC LIMIT 10",
      [],
    );
    const topPaths = topPathsResult.rows.map((r: Record<string, unknown>) => ({
      path: r['path'],
      views: Number(r['count']),
    }));

    const topEventsResult = await query(
      "SELECT key as event, count FROM analytics_counters WHERE kind = 'event' ORDER BY count DESC LIMIT 10",
      [],
    );
    const topEvents = topEventsResult.rows.map((r: Record<string, unknown>) => ({
      event: r['event'],
      count: Number(r['count']),
    }));

    return { totalEvents, topPaths, topEvents, dailyViews: [] };
  } catch {
    return { totalEvents: 0, topPaths: [], topEvents: [], dailyViews: [] };
  }
}
