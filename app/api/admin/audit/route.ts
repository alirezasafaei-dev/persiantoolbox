import { NextResponse } from 'next/server';
import { requireAdminFromRequest } from '@/lib/server/adminAuth';
import { disabledApiResponse } from '@/lib/server/feature-flags';
import { logApiEvent } from '@/lib/server/request-observability';
import { makeRateLimitKey, rateLimit } from '@/lib/server/rateLimit';
import { rateLimitPolicies } from '@/lib/server/rateLimitPolicies';
import { isSameOrigin } from '@/lib/server/csrf';
import { isFeatureEnabled } from '@/lib/features/availability';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const VALID_ACTIONS = [
  'login',
  'logout',
  'settings_change',
  'tool_toggle',
  'user_update',
  'content_update',
  'system_action',
  'other',
];

async function enforceAdminRateLimit(
  request: Request,
  userId: string,
): Promise<NextResponse | null> {
  if (!process.env['DATABASE_URL']?.trim()) {
    return null;
  }

  const { limit, windowMs, keyPrefix } = rateLimitPolicies.adminSiteSettings;
  if (!Number.isFinite(limit) || limit <= 0 || !Number.isFinite(windowMs) || windowMs <= 0) {
    return null;
  }

  try {
    const key = makeRateLimitKey(keyPrefix, request, userId);
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

export async function GET(request: Request) {
  if (!isFeatureEnabled('admin-site-settings')) {
    return disabledApiResponse('admin-site-settings');
  }
  logApiEvent(request, { route: '/api/admin/audit', event: 'request' });

  if (!isSameOrigin(request)) {
    return NextResponse.json(
      { ok: false, errors: ['درخواست از مبدأ نامعتبر است.'] },
      { status: 403 },
    );
  }

  const admin = await requireAdminFromRequest(request);
  if (!admin.ok) {
    logApiEvent(request, {
      route: '/api/admin/audit',
      event: 'response',
      status: admin.status,
      details: { reason: 'ADMIN_AUTH' },
    });
    return NextResponse.json({ ok: false }, { status: admin.status });
  }

  const limited = await enforceAdminRateLimit(request, admin.user.id);
  if (limited) {
    logApiEvent(request, {
      route: '/api/admin/audit',
      event: 'response',
      status: limited.status,
      details: { reason: 'RATE_LIMITED' },
    });
    return limited;
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get('page') ?? '1') || 1);
    const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit') ?? '50') || 50));
    const actionParam = searchParams.get('action') ?? undefined;
    const userRaw = searchParams.get('user')?.trim();
    const userParam = userRaw && userRaw.length > 0 ? userRaw : undefined;

    if (actionParam && !VALID_ACTIONS.includes(actionParam)) {
      return NextResponse.json({ ok: false, errors: ['نوع عملیات نامعتبر است.'] }, { status: 400 });
    }

    const { queryAuditLog } = await import('@/lib/server/auditLog');
    const result = await queryAuditLog({ page, limit, action: actionParam, user: userParam });

    logApiEvent(request, { route: '/api/admin/audit', event: 'response', status: 200 });
    return NextResponse.json({ ok: true, ...result }, { status: 200 });
  } catch (error) {
    logApiEvent(request, {
      route: '/api/admin/audit',
      event: 'error',
      status: 500,
      details: { message: error instanceof Error ? error.message : 'UNKNOWN' },
    });
    return NextResponse.json({ ok: false, errors: ['خطای داخلی سرور'] }, { status: 500 });
  }
}
