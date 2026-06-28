import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/server/auth';
import { getDailyUsage } from '@/lib/server/entitlements';
import { logger } from '@/lib/server/logger';

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user?.id) {
      return NextResponse.json({ ok: false, used: 0, limit: 10, percentage: 0, isPremium: false });
    }

    const { used, limit, isPremium } = await getDailyUsage(user.id);
    const percentage = isPremium ? 0 : Math.round((used / limit) * 100);

    return NextResponse.json({ ok: true, used, limit, percentage, isPremium });
  } catch (error) {
    logger.error('Usage status error', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      {
        ok: false,
        error: 'خطا در دریافت وضعیت استفاده.',
        used: 0,
        limit: 10,
        percentage: 0,
        isPremium: false,
      },
      { status: 500 },
    );
  }
}
