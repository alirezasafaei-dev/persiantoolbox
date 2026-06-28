/**
 * Usage Check API Route
 * Checks if user can use a tool
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/server/auth';
import { checkUsageLimit, getUsageStatus } from '@/lib/usage-tracking';
import { logger } from '@/lib/server/logger';

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user?.id) {
      return NextResponse.json(
        { ok: false, error: 'برای بررسی سقف استفاده باید وارد شوید.' },
        { status: 401 },
      );
    }

    const toolId = request.nextUrl.searchParams.get('toolId');
    if (!toolId) {
      return NextResponse.json({ ok: false, error: 'شناسه ابزار الزامی است.' }, { status: 400 });
    }

    const canUse = await checkUsageLimit(user.id, toolId);
    const status = await getUsageStatus(user.id, toolId);

    return NextResponse.json({
      ok: true,
      canUse,
      ...status,
    });
  } catch (error) {
    logger.error('Usage check error', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'خطا در بررسی سقف استفاده.' },
      { status: 500 },
    );
  }
}
