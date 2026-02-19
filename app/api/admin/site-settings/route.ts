import { NextResponse } from 'next/server';
import { isFeatureEnabled } from '@/lib/features/availability';
import { requireAdminFromRequest } from '@/lib/server/adminAuth';
import { validateSiteSettingsPatch } from '@/lib/siteSettings';
import { disabledApiResponse } from '@/lib/server/feature-flags';
import { logApiEvent } from '@/lib/server/request-observability';
import { makeRateLimitKey, rateLimit } from '@/lib/server/rateLimit';
import { rateLimitPolicies } from '@/lib/server/rateLimitPolicies';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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
  logApiEvent(request, { route: '/api/admin/site-settings', event: 'request' });

  const admin = await requireAdminFromRequest(request);
  if (!admin.ok) {
    logApiEvent(request, {
      route: '/api/admin/site-settings',
      event: 'response',
      status: admin.status,
      details: { reason: 'ADMIN_AUTH' },
    });
    return NextResponse.json({ ok: false }, { status: admin.status });
  }

  const limited = await enforceAdminRateLimit(request, admin.user.id);
  if (limited) {
    logApiEvent(request, {
      route: '/api/admin/site-settings',
      event: 'response',
      status: limited.status,
      details: { reason: 'RATE_LIMITED' },
    });
    return limited;
  }

  try {
    const { getPublicSiteSettings } = await import('@/lib/server/siteSettings');
    const settings = await getPublicSiteSettings();
    logApiEvent(request, { route: '/api/admin/site-settings', event: 'response', status: 200 });
    return NextResponse.json({ ok: true, settings }, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.name === 'SiteSettingsStorageUnavailableError') {
      return NextResponse.json(
        { ok: false, errors: ['DATABASE_URL or site_settings storage unavailable'] },
        { status: 503 },
      );
    }
    logApiEvent(request, {
      route: '/api/admin/site-settings',
      event: 'error',
      status: 500,
      details: { message: error instanceof Error ? error.message : 'UNKNOWN' },
    });
    return NextResponse.json({ ok: false, errors: ['INTERNAL_ERROR'] }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  if (!isFeatureEnabled('admin-site-settings')) {
    return disabledApiResponse('admin-site-settings');
  }
  logApiEvent(request, { route: '/api/admin/site-settings', event: 'request' });

  const admin = await requireAdminFromRequest(request);
  if (!admin.ok) {
    return NextResponse.json({ ok: false }, { status: admin.status });
  }

  const limited = await enforceAdminRateLimit(request, admin.user.id);
  if (limited) {
    return limited;
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, errors: ['بدنه درخواست نامعتبر است.'] }, { status: 400 });
  }

  const validation = validateSiteSettingsPatch(body);
  if (!validation.ok) {
    return NextResponse.json({ ok: false, errors: validation.errors }, { status: 400 });
  }

  try {
    const { updateSiteSettings } = await import('@/lib/server/siteSettings');
    const settings = await updateSiteSettings(validation.value);
    logApiEvent(request, { route: '/api/admin/site-settings', event: 'response', status: 200 });
    return NextResponse.json({ ok: true, settings }, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.name === 'SiteSettingsStorageUnavailableError') {
      return NextResponse.json(
        { ok: false, errors: ['DATABASE_URL or site_settings storage unavailable'] },
        { status: 503 },
      );
    }
    logApiEvent(request, {
      route: '/api/admin/site-settings',
      event: 'error',
      status: 500,
      details: { message: error instanceof Error ? error.message : 'UNKNOWN' },
    });
    return NextResponse.json({ ok: false, errors: ['INTERNAL_ERROR'] }, { status: 500 });
  }
}
