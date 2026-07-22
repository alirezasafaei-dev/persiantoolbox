/**
 * Usage Tracking API Route
 * Records tool usage
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/server/auth';
import { trackUsage } from '@/lib/usage-tracking';
import { rateLimit, makeRateLimitKey } from '@/lib/server/rateLimit';
import { UnauthorizedError, BadRequestError, RateLimitError } from '@/lib/server/api-errors';
import { handleApiError } from '@/lib/server/api-error-handler';

export async function POST(request: NextRequest) {
  try {
    const rateLimitKey = makeRateLimitKey('usage:track', request);
    const rateLimitResult = await rateLimit(rateLimitKey, { limit: 60, windowMs: 60_000 });
    if (!rateLimitResult.allowed) {
      throw new RateLimitError();
    }

    const user = await getUserFromRequest(request);
    if (!user?.id) {
      throw new UnauthorizedError('برای ثبت استفاده باید وارد شوید.');
    }

    const body = await request.json();
    const { toolId } = body;

    if (!toolId) {
      throw new BadRequestError('شناسه ابزار الزامی است.');
    }

    const result = await trackUsage(user.id, toolId);

    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    return handleApiError(error, '/api/usage/track');
  }
}
