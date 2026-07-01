import { NextResponse } from 'next/server';
import { isFeatureEnabled } from '@/lib/features/availability';
import { requireAdminFromRequest } from '@/lib/server/adminAuth';
import { disabledApiResponse } from '@/lib/server/feature-flags';
import { logApiEvent } from '@/lib/server/request-observability';
import { makeRateLimitKey, rateLimit } from '@/lib/server/rateLimit';
import { rateLimitPolicies } from '@/lib/server/rateLimitPolicies';
import { isSameOrigin } from '@/lib/server/csrf';
import { validatePricingPatch } from '@/lib/pricing/pricingConfig';
import {
  getPricingOverrides,
  getResolvedPricing,
  updatePricingOverrides,
  PricingStorageUnavailableError,
} from '@/lib/server/pricingStorage';

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
  if (!isFeatureEnabled('admin-monetization')) {
    return disabledApiResponse('admin-monetization');
  }
  logApiEvent(request, { route: '/api/admin/pricing', event: 'request' });

  const admin = await requireAdminFromRequest(request);
  if (!admin.ok) {
    return NextResponse.json({ ok: false }, { status: admin.status });
  }

  const limited = await enforceAdminRateLimit(request, admin.user.id);
  if (limited) {
    return limited;
  }

  try {
    const [overrides, pricing] = await Promise.all([getPricingOverrides(), getResolvedPricing()]);
    return NextResponse.json({ ok: true, overrides, pricing }, { status: 200 });
  } catch (error) {
    if (error instanceof PricingStorageUnavailableError) {
      return NextResponse.json(
        { ok: false, errors: ['PRICING_STORAGE_UNAVAILABLE'] },
        { status: 503 },
      );
    }
    return NextResponse.json({ ok: false, errors: ['INTERNAL_ERROR'] }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!isFeatureEnabled('admin-monetization')) {
    return disabledApiResponse('admin-monetization');
  }
  logApiEvent(request, { route: '/api/admin/pricing', event: 'request' });

  if (!isSameOrigin(request)) {
    return NextResponse.json(
      { ok: false, errors: ['درخواست از مبدأ نامعتبر است.'] },
      { status: 403 },
    );
  }

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

  const validation = validatePricingPatch(body);
  if (!validation.ok) {
    return NextResponse.json({ ok: false, errors: validation.errors }, { status: 400 });
  }

  try {
    const pricing = await updatePricingOverrides(validation.value);
    return NextResponse.json({ ok: true, pricing }, { status: 200 });
  } catch (error) {
    if (error instanceof PricingStorageUnavailableError) {
      return NextResponse.json(
        { ok: false, errors: ['PRICING_STORAGE_UNAVAILABLE'] },
        { status: 503 },
      );
    }
    return NextResponse.json({ ok: false, errors: ['INTERNAL_ERROR'] }, { status: 500 });
  }
}
