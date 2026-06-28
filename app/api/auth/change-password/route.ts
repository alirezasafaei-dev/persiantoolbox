import { NextResponse } from 'next/server';
import { isFeatureEnabled } from '@/lib/features/availability';
import { disabledApiResponse } from '@/lib/server/feature-flags';
import { isSameOrigin } from '@/lib/server/csrf';
import { getUserFromRequest } from '@/lib/server/auth';
import { verifyPassword, hashPassword } from '@/lib/server/passwords';
import { query } from '@/lib/server/db';
import { validatePassword } from '@/components/features/monetization/account-utils';
import { rateLimit, makeRateLimitKey } from '@/lib/server/rateLimit';
import { logger } from '@/lib/server/logger';
import { logApiEvent } from '@/lib/server/request-observability';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  if (!isFeatureEnabled('auth')) {
    return disabledApiResponse('auth');
  }
  logApiEvent(request, { route: '/api/auth/change-password', event: 'request' });

  if (!isSameOrigin(request)) {
    return NextResponse.json({ ok: false, error: 'درخواست از مبدأ نامعتبر است.' }, { status: 403 });
  }

  const user = await getUserFromRequest(request);
  if (!user?.id) {
    return NextResponse.json(
      { ok: false, error: 'برای تغییر رمز عبور باید وارد شوید.' },
      { status: 401 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'بدنه درخواست نامعتبر است.' }, { status: 400 });
  }

  const { currentPassword, newPassword } = body as {
    currentPassword?: string;
    newPassword?: string;
  };

  if (!currentPassword || !newPassword) {
    return NextResponse.json(
      { ok: false, error: 'رمز عبور فعلی و جدید الزامی هستند.' },
      { status: 400 },
    );
  }

  const passwordError = validatePassword(newPassword);
  if (passwordError) {
    return NextResponse.json({ ok: false, error: passwordError }, { status: 400 });
  }

  if (currentPassword === newPassword) {
    return NextResponse.json(
      { ok: false, error: 'رمز عبور جدید باید با رمز فعلی متفاوت باشد.' },
      { status: 400 },
    );
  }

  const rateLimitKey = makeRateLimitKey('auth:change-password', request, user.id);
  const rateLimitResult = await rateLimit(rateLimitKey, {
    limit: 3,
    windowMs: 15 * 60 * 1000,
  });

  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { ok: false, error: 'تعداد درخواست‌ها بیش از حد مجاز است.' },
      { status: 429 },
    );
  }

  try {
    // Get current password hash
    const result = await query<{ password_hash: string }>(
      'SELECT password_hash FROM users WHERE id = $1 LIMIT 1',
      [user.id],
    );

    if (result.rowCount === 0 || !result.rows[0]) {
      return NextResponse.json({ ok: false, error: 'کاربر یافت نشد.' }, { status: 404 });
    }

    const isValid = await verifyPassword(currentPassword, result.rows[0].password_hash);
    if (!isValid) {
      return NextResponse.json({ ok: false, error: 'رمز عبور فعلی اشتباه است.' }, { status: 401 });
    }

    const newHash = await hashPassword(newPassword);
    await query('UPDATE users SET password_hash = $1 WHERE id = $2', [newHash, user.id]);

    logger.info('Password changed successfully', { userId: user.id });

    return NextResponse.json({
      ok: true,
      message: 'رمز عبور با موفقیت تغییر کرد.',
    });
  } catch (error) {
    logger.error('Change password error', {
      error: error instanceof Error ? error.message : String(error),
      userId: user.id,
    });
    return NextResponse.json({ ok: false, error: 'خطا در تغییر رمز عبور.' }, { status: 500 });
  }
}
