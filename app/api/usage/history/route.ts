import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/server/auth';
import { query } from '@/lib/server/db';
import { logger } from '@/lib/server/logger';

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user?.id) {
      return NextResponse.json({ days: [], isPremium: false });
    }

    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - 6);
    const startDate = daysAgo.toISOString().split('T')[0];

    const result = await query<{ date: string; count: string }>(
      `SELECT date, COALESCE(SUM(count), 0)::text AS count
       FROM usage_tracking
       WHERE user_id = $1 AND date >= $2
       GROUP BY date
       ORDER BY date ASC`,
      [user.id, startDate],
    );

    const allDays: { date: string; count: number }[] = [];
    const usageMap = new Map<string, number>();
    for (const row of result.rows) {
      usageMap.set(row.date, parseInt(row.count, 10));
    }

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      allDays.push({ date: dateStr, count: usageMap.get(dateStr) ?? 0 });
    }

    const { getActiveSubscription } = await import('@/lib/subscriptions/subscription-manager');
    const subscription = await getActiveSubscription(user.id);

    return NextResponse.json({ days: allDays, isPremium: !!subscription });
  } catch (error) {
    logger.error('Usage history error', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ days: [], isPremium: false });
  }
}
