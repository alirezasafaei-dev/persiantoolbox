import { NextResponse } from 'next/server';
import { isFeatureEnabled } from '@/lib/features/availability';
import { disabledApiResponse } from '@/lib/server/feature-flags';
import { logApiEvent } from '@/lib/server/request-observability';
import { getUserFromRequest } from '@/lib/server/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  if (!isFeatureEnabled('auth')) {
    return disabledApiResponse('auth');
  }
  logApiEvent(request, { route: '/api/auth/me', event: 'request' });

  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ ok: false, error: 'NOT_AUTHENTICATED' }, { status: 401 });
    }
    logApiEvent(request, {
      route: '/api/auth/me',
      event: 'response',
      status: 200,
      details: { userId: user.id },
    });
    const { passwordHash: _pw, ...safeUser } = user;
    void _pw;
    return NextResponse.json({ ok: true, user: safeUser });
  } catch (error) {
    logApiEvent(request, {
      route: '/api/auth/me',
      event: 'error',
      status: 500,
      details: { message: error instanceof Error ? error.message : 'UNKNOWN' },
    });
    return NextResponse.json(
      { ok: false, errors: ['خطا در دریافت اطلاعات کاربر.'] },
      { status: 500 },
    );
  }
}
