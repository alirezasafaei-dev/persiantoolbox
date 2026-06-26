/**
 * Usage Tracking API Route
 * Records tool usage
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/server/auth';
import { trackUsage } from '@/lib/usage-tracking';
import { logger } from '@/lib/server/logger';

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user?.id) {
      return NextResponse.json(
        { ok: false, error: 'برای ثبت استفاده باید وارد شوید.' },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { toolId } = body;

    if (!toolId) {
      return NextResponse.json({ ok: false, error: 'شناسه ابزار الزامی است.' }, { status: 400 });
    }

    const result = await trackUsage(user.id, toolId);

    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    logger.error('Usage tracking error', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'خطا در ثبت استفاده.' },
      { status: 500 },
    );
  }
}
