import { NextResponse } from 'next/server';
import { isFeatureEnabled } from '@/lib/features/availability';
import { requireAdminFromRequest } from '@/lib/server/adminAuth';
import { makeRateLimitKey, rateLimit } from '@/lib/server/rateLimit';
import { rateLimitPolicies } from '@/lib/server/rateLimitPolicies';
import { disabledApiResponse } from '@/lib/server/feature-flags';
import { getOpsDashboardSnapshot, type OpsDashboardSnapshot } from '@/lib/admin/opsDashboard';
import { logApiEvent } from '@/lib/server/request-observability';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type OpsResponse = { ok: true; snapshot: OpsDashboardSnapshot } | { ok: false; reason: string };

function isAuthorizedByToken(request: Request): boolean {
  const envToken = process.env['OPS_DASHBOARD_TOKEN']?.trim();
  if (!envToken) {
    return false;
  }
  const headerToken =
    request.headers.get('x-ops-dashboard-token') ??
    request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');

  return Boolean(headerToken && headerToken === envToken);
}

async function enforceOpsRateLimit(request: Request): Promise<NextResponse | null> {
  if (!process.env['DATABASE_URL']?.trim()) {
    return null;
  }

  const policy = rateLimitPolicies.adminSiteSettings;
  const { limit, windowMs, keyPrefix } = policy;
  if (!Number.isFinite(limit) || limit <= 0 || !Number.isFinite(windowMs) || windowMs <= 0) {
    return null;
  }

  try {
    const key = makeRateLimitKey(keyPrefix, request);
    const result = await rateLimit(key, { limit, windowMs });
    if (!result.allowed) {
      return NextResponse.json(
        { ok: false, reason: 'RATE_LIMITED', resetAt: result.resetAt },
        { status: 429 },
      );
    }
    return null;
  } catch {
    return null;
  }
}

async function authorize(request: Request): Promise<OpsResponse | null> {
  if (isAuthorizedByToken(request)) {
    return null;
  }

  try {
    const admin = await requireAdminFromRequest(request);
    if (!admin.ok) {
      return { ok: false, reason: `ADMIN_AUTH:${admin.status}` };
    }
    return null;
  } catch {
    return { ok: false, reason: 'ADMIN_AUTH_UNAVAILABLE' };
  }
}

export async function GET(request: Request) {
  if (!isFeatureEnabled('dashboard')) {
    return disabledApiResponse('dashboard');
  }

  logApiEvent(request, { route: '/api/admin/ops', event: 'request' });

  const rateLimited = await enforceOpsRateLimit(request);
  if (rateLimited) {
    return rateLimited;
  }

  const auth = await authorize(request);
  if (auth && !auth.ok) {
    return NextResponse.json(auth, {
      status: auth.reason.startsWith('ADMIN_AUTH:')
        ? Number(auth.reason.split(':')[1] ?? 401)
        : 503,
    });
  }

  try {
    const snapshot = await getOpsDashboardSnapshot();
    logApiEvent(request, { route: '/api/admin/ops', event: 'response', status: 200 });
    return NextResponse.json({ ok: true, snapshot } satisfies OpsResponse);
  } catch (error) {
    return NextResponse.json(
      { ok: false, reason: error instanceof Error ? error.message : 'INTERNAL_ERROR' },
      { status: 500 },
    );
  }
}
