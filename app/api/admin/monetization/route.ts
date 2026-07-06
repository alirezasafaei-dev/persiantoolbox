import { NextResponse } from 'next/server';
import { isFeatureEnabled } from '@/lib/features/availability';
import { requireAdminFromRequest } from '@/lib/server/adminAuth';
import { disabledApiResponse } from '@/lib/server/feature-flags';
import { logApiEvent } from '@/lib/server/request-observability';
import { makeRateLimitKey, rateLimit } from '@/lib/server/rateLimit';
import { rateLimitPolicies } from '@/lib/server/rateLimitPolicies';
import { isSameOrigin } from '@/lib/server/csrf';
import { normalizeOptionalUrl } from '@/lib/siteSettings';
import {
  getMonetizationSlots,
  getMonetizationCampaigns,
  addMonetizationSlot,
  updateMonetizationSlot,
  removeMonetizationSlot,
  addMonetizationCampaign,
  updateMonetizationCampaign,
  removeMonetizationCampaign,
  MonetizationStorageUnavailableError,
} from '@/lib/server/monetizationStorage';
import {
  getAllSubscriptions,
  getAllPayments,
  getAllCoupons,
  addCoupon,
  updateCoupon,
  removeCoupon,
} from '@/lib/server/monetizationDataStorage';

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
  logApiEvent(request, { route: '/api/admin/monetization', event: 'request' });

  const admin = await requireAdminFromRequest(request);
  if (!admin.ok) {
    logApiEvent(request, {
      route: '/api/admin/monetization',
      event: 'response',
      status: admin.status,
      details: { reason: 'ADMIN_AUTH' },
    });
    return NextResponse.json({ ok: false }, { status: admin.status });
  }

  const limited = await enforceAdminRateLimit(request, admin.user.id);
  if (limited) {
    logApiEvent(request, {
      route: '/api/admin/monetization',
      event: 'response',
      status: limited.status,
      details: { reason: 'RATE_LIMITED' },
    });
    return limited;
  }

  try {
    const [slots, campaigns, subscriptions, payments, coupons] = await Promise.all([
      getMonetizationSlots(),
      getMonetizationCampaigns(),
      getAllSubscriptions(),
      getAllPayments(),
      getAllCoupons(),
    ]);
    logApiEvent(request, {
      route: '/api/admin/monetization',
      event: 'response',
      status: 200,
    });
    return NextResponse.json(
      { ok: true, data: { slots, campaigns, subscriptions, payments, coupons } },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof MonetizationStorageUnavailableError) {
      return NextResponse.json(
        { ok: false, errors: ['MONETIZATION_STORAGE_UNAVAILABLE'] },
        { status: 503 },
      );
    }
    logApiEvent(request, {
      route: '/api/admin/monetization',
      event: 'error',
      status: 500,
      details: { message: error instanceof Error ? error.message : 'UNKNOWN' },
    });
    return NextResponse.json({ ok: false, errors: ['INTERNAL_ERROR'] }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!isFeatureEnabled('admin-monetization')) {
    return disabledApiResponse('admin-monetization');
  }
  logApiEvent(request, { route: '/api/admin/monetization', event: 'request' });

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

  if (!body || typeof body !== 'object') {
    return NextResponse.json({ ok: false, errors: ['بدنه درخواست نامعتبر است.'] }, { status: 400 });
  }

  const { action, type } = body as { action?: string; type?: string };

  if (action === 'add' && type === 'slot') {
    try {
      const { name, placement, size, active } = body as {
        name?: string;
        placement?: string;
        size?: string;
        active?: boolean;
      };
      if (!name || !placement) {
        return NextResponse.json(
          { ok: false, errors: ['نام و جایگاه اسلات الزامی است.'] },
          { status: 400 },
        );
      }
      const slot = await addMonetizationSlot({
        name,
        placement,
        size: size ?? 'auto',
        active: active ?? true,
      });
      logApiEvent(request, {
        route: '/api/admin/monetization',
        event: 'response',
        status: 200,
      });
      return NextResponse.json({ ok: true, data: slot }, { status: 200 });
    } catch (error) {
      if (error instanceof MonetizationStorageUnavailableError) {
        return NextResponse.json(
          { ok: false, errors: ['MONETIZATION_STORAGE_UNAVAILABLE'] },
          { status: 503 },
        );
      }
      return NextResponse.json({ ok: false, errors: ['INTERNAL_ERROR'] }, { status: 500 });
    }
  }

  if (action === 'add' && type === 'campaign') {
    try {
      const { name, sponsor, targetUrl, assetUrl, slotId, status } = body as {
        name?: string;
        sponsor?: string;
        targetUrl?: string;
        assetUrl?: string;
        slotId?: string;
        status?: 'active' | 'paused';
      };
      if (!name || !targetUrl) {
        return NextResponse.json(
          { ok: false, errors: ['نام و لینک مقصد کمپین الزامی است.'] },
          { status: 400 },
        );
      }
      const validatedTargetUrl = normalizeOptionalUrl(targetUrl);
      if (!validatedTargetUrl) {
        return NextResponse.json(
          { ok: false, errors: ['لینک مقصد نامعتبر است.'] },
          { status: 400 },
        );
      }
      const validatedAssetUrl = assetUrl ? normalizeOptionalUrl(assetUrl) : null;
      const campaign = await addMonetizationCampaign({
        name,
        sponsor: sponsor ?? 'نامشخص',
        targetUrl: validatedTargetUrl,
        assetUrl: validatedAssetUrl ?? '',
        slotId: slotId ?? null,
        status: status ?? 'active',
      });
      logApiEvent(request, {
        route: '/api/admin/monetization',
        event: 'response',
        status: 200,
      });
      return NextResponse.json({ ok: true, data: campaign }, { status: 200 });
    } catch (error) {
      if (error instanceof MonetizationStorageUnavailableError) {
        return NextResponse.json(
          { ok: false, errors: ['MONETIZATION_STORAGE_UNAVAILABLE'] },
          { status: 503 },
        );
      }
      return NextResponse.json({ ok: false, errors: ['INTERNAL_ERROR'] }, { status: 500 });
    }
  }

  if (action === 'update' && type === 'slot') {
    try {
      const { id: _id, updates } = body as { id?: string; updates?: object };
      if (!_id || !updates) {
        return NextResponse.json(
          { ok: false, errors: ['شناسه و به‌روزرسانی الزامی است.'] },
          { status: 400 },
        );
      }
      const slot = await updateMonetizationSlot(_id, updates);
      if (!slot) {
        return NextResponse.json({ ok: false, errors: ['اسلات یافت نشد.'] }, { status: 404 });
      }
      logApiEvent(request, {
        route: '/api/admin/monetization',
        event: 'response',
        status: 200,
      });
      return NextResponse.json({ ok: true, data: slot }, { status: 200 });
    } catch (error) {
      if (error instanceof MonetizationStorageUnavailableError) {
        return NextResponse.json(
          { ok: false, errors: ['MONETIZATION_STORAGE_UNAVAILABLE'] },
          { status: 503 },
        );
      }
      return NextResponse.json({ ok: false, errors: ['INTERNAL_ERROR'] }, { status: 500 });
    }
  }

  if (action === 'update' && type === 'campaign') {
    try {
      const { id: _id, updates } = body as { id?: string; updates?: object };
      if (!_id || !updates) {
        return NextResponse.json(
          { ok: false, errors: ['شناسه و به‌روزرسانی الزامی است.'] },
          { status: 400 },
        );
      }
      const campaign = await updateMonetizationCampaign(_id, updates);
      if (!campaign) {
        return NextResponse.json({ ok: false, errors: ['کمپین یافت نشد.'] }, { status: 404 });
      }
      logApiEvent(request, {
        route: '/api/admin/monetization',
        event: 'response',
        status: 200,
      });
      return NextResponse.json({ ok: true, data: campaign }, { status: 200 });
    } catch (error) {
      if (error instanceof MonetizationStorageUnavailableError) {
        return NextResponse.json(
          { ok: false, errors: ['MONETIZATION_STORAGE_UNAVAILABLE'] },
          { status: 503 },
        );
      }
      return NextResponse.json({ ok: false, errors: ['INTERNAL_ERROR'] }, { status: 500 });
    }
  }

  if (action === 'remove' && type === 'slot') {
    try {
      const { id: _id } = body as { id?: string };
      if (!_id) {
        return NextResponse.json({ ok: false, errors: ['شناسه الزامی است.'] }, { status: 400 });
      }
      const success = await removeMonetizationSlot(_id);
      if (!success) {
        return NextResponse.json({ ok: false, errors: ['اسلات یافت نشد.'] }, { status: 404 });
      }
      logApiEvent(request, {
        route: '/api/admin/monetization',
        event: 'response',
        status: 200,
      });
      return NextResponse.json({ ok: true }, { status: 200 });
    } catch (error) {
      if (error instanceof MonetizationStorageUnavailableError) {
        return NextResponse.json(
          { ok: false, errors: ['MONETIZATION_STORAGE_UNAVAILABLE'] },
          { status: 503 },
        );
      }
      return NextResponse.json({ ok: false, errors: ['INTERNAL_ERROR'] }, { status: 500 });
    }
  }

  if (action === 'remove' && type === 'campaign') {
    try {
      const { id: _id } = body as { id?: string };
      if (!_id) {
        return NextResponse.json({ ok: false, errors: ['شناسه الزامی است.'] }, { status: 400 });
      }
      const success = await removeMonetizationCampaign(_id);
      if (!success) {
        return NextResponse.json({ ok: false, errors: ['کمپین یافت نشد.'] }, { status: 404 });
      }
      logApiEvent(request, {
        route: '/api/admin/monetization',
        event: 'response',
        status: 200,
      });
      return NextResponse.json({ ok: true }, { status: 200 });
    } catch (error) {
      if (error instanceof MonetizationStorageUnavailableError) {
        return NextResponse.json(
          { ok: false, errors: ['MONETIZATION_STORAGE_UNAVAILABLE'] },
          { status: 503 },
        );
      }
      return NextResponse.json({ ok: false, errors: ['INTERNAL_ERROR'] }, { status: 500 });
    }
  }

  if (action === 'add' && type === 'coupon') {
    try {
      const { code, percent, maxUses, expiresAt } = body as {
        code?: string;
        percent?: number;
        maxUses?: number;
        expiresAt?: number;
      };
      if (!code || percent === undefined || maxUses === undefined || expiresAt === undefined) {
        return NextResponse.json(
          { ok: false, errors: ['کد، درصد، حداکثر استفاده و تاریخ انقضا الزامی است.'] },
          { status: 400 },
        );
      }
      const coupon = await addCoupon({
        code,
        percent,
        maxUses,
        usedCount: 0,
        expiresAt,
        active: true,
      });
      if (!coupon) {
        return NextResponse.json(
          { ok: false, errors: ['کد کوپن تکراری است یا ذخیره با خطا مواجه شد.'] },
          { status: 400 },
        );
      }
      logApiEvent(request, { route: '/api/admin/monetization', event: 'response', status: 200 });
      return NextResponse.json({ ok: true, data: coupon }, { status: 200 });
    } catch {
      return NextResponse.json({ ok: false, errors: ['INTERNAL_ERROR'] }, { status: 500 });
    }
  }

  if (action === 'update' && type === 'coupon') {
    try {
      const { id: _id, updates } = body as {
        id?: string;
        updates?: Partial<{
          code: string;
          percent: number;
          maxUses: number;
          expiresAt: number;
          active: boolean;
        }>;
      };
      if (!_id || !updates) {
        return NextResponse.json(
          { ok: false, errors: ['شناسه و به‌روزرسانی الزامی است.'] },
          { status: 400 },
        );
      }
      const mappedUpdates: Record<string, unknown> = {};
      if (updates['code'] !== undefined) {
        mappedUpdates['code'] = updates['code'];
      }
      if (updates['percent'] !== undefined) {
        mappedUpdates['percent'] = updates['percent'];
      }
      if (updates['maxUses'] !== undefined) {
        mappedUpdates['maxUses'] = updates['maxUses'];
      }
      if (updates['expiresAt'] !== undefined) {
        mappedUpdates['expiresAt'] = updates['expiresAt'];
      }
      if (updates['active'] !== undefined) {
        mappedUpdates['active'] = updates['active'];
      }
      const coupon = await updateCoupon(_id, mappedUpdates);
      if (!coupon) {
        return NextResponse.json({ ok: false, errors: ['کوپن یافت نشد.'] }, { status: 404 });
      }
      logApiEvent(request, { route: '/api/admin/monetization', event: 'response', status: 200 });
      return NextResponse.json({ ok: true, data: coupon }, { status: 200 });
    } catch {
      return NextResponse.json({ ok: false, errors: ['INTERNAL_ERROR'] }, { status: 500 });
    }
  }

  if (action === 'remove' && type === 'coupon') {
    try {
      const { id: _id } = body as { id?: string };
      if (!_id) {
        return NextResponse.json({ ok: false, errors: ['شناسه الزامی است.'] }, { status: 400 });
      }
      const success = await removeCoupon(_id);
      if (!success) {
        return NextResponse.json({ ok: false, errors: ['کوپن یافت نشد.'] }, { status: 404 });
      }
      logApiEvent(request, { route: '/api/admin/monetization', event: 'response', status: 200 });
      return NextResponse.json({ ok: true }, { status: 200 });
    } catch {
      return NextResponse.json({ ok: false, errors: ['INTERNAL_ERROR'] }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: false, errors: ['اکشن نامعتبر است.'] }, { status: 400 });
}
