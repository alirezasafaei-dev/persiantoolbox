import { isFeatureEnabled } from '@/lib/features/availability';
import { disabledApiResponse } from '@/lib/server/feature-flags';
import { logApiEvent } from '@/lib/server/request-observability';
import { clearSessionResponse } from '@/lib/server/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  if (!isFeatureEnabled('auth')) {
    return disabledApiResponse('auth');
  }
  logApiEvent(request, { route: '/api/auth/logout', event: 'request' });

  try {
    const response = await clearSessionResponse(request);
    logApiEvent(request, { route: '/api/auth/logout', event: 'response', status: 200 });
    return response;
  } catch (error) {
    logApiEvent(request, {
      route: '/api/auth/logout',
      event: 'error',
      status: 500,
      details: { message: error instanceof Error ? error.message : 'UNKNOWN' },
    });
    return Response.json({ ok: false, errors: ['خطا در خروج از سیستم.'] }, { status: 500 });
  }
}
