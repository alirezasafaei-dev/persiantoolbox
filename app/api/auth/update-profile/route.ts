import { NextResponse } from 'next/server';
import { isFeatureEnabled } from '@/lib/features/availability';
import { disabledApiResponse } from '@/lib/server/feature-flags';
import { isSameOrigin } from '@/lib/server/csrf';
import { getUserFromRequest } from '@/lib/server/auth';
import { query } from '@/lib/server/db';
import { rateLimit, makeRateLimitKey } from '@/lib/server/rateLimit';
import { logger } from '@/lib/server/logger';
import { logApiEvent } from '@/lib/server/request-observability';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function PUT(request: Request) {
  if (!isFeatureEnabled('auth')) {
    return disabledApiResponse('auth');
  }
  logApiEvent(request, { route: '/api/auth/update-profile', event: 'request' });

  if (!isSameOrigin(request)) {
    return NextResponse.json({ ok: false, error: 'درخواست از مبدأ نامعتبر است.' }, { status: 403 });
  }

  const user = await getUserFromRequest(request);
  if (!user?.id) {
    return NextResponse.json(
      { ok: false, error: 'برای بروزرسانی پروفایل باید وارد شوید.' },
      { status: 401 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'بدنه درخواست نامعتبر است.' }, { status: 400 });
  }

  const { email } = body as { email?: string };

  if (!email || typeof email !== 'string') {
    return NextResponse.json({ ok: false, error: 'ایمیل وارد نشده است.' }, { status: 400 });
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail.includes('@') || !normalizedEmail.includes('.')) {
    return NextResponse.json({ ok: false, error: 'فرمت ایمیل نامعتبر است.' }, { status: 400 });
  }

  if (normalizedEmail === user.email) {
    return NextResponse.json({ ok: true, message: 'تغییری اعمال نشد.' });
  }

  const rateLimitKey = makeRateLimitKey('auth:update-profile', request, user.id);
  const rateLimitResult = await rateLimit(rateLimitKey, {
    limit: 5,
    windowMs: 60 * 60 * 1000,
  });

  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { ok: false, error: 'تعداد درخواست‌ها بیش از حد مجاز است.' },
      { status: 429 },
    );
  }

  try {
    // Check if email is already taken
    const existing = await query('SELECT id FROM users WHERE email = $1 AND id != $2 LIMIT 1', [
      normalizedEmail,
      user.id,
    ]);

    if ((existing.rowCount ?? 0) > 0) {
      return NextResponse.json(
        { ok: false, error: 'ایمیل وارد شده قبلاً استفاده شده است.' },
        { status: 409 },
      );
    }

    await query('UPDATE users SET email = $1 WHERE id = $2', [normalizedEmail, user.id]);

    logger.info('Profile updated', { userId: user.id, newEmail: normalizedEmail });

    return NextResponse.json({
      ok: true,
      message: 'پروفایل با موفقیت بروزرسانی شد.',
      email: normalizedEmail,
    });
  } catch (error) {
    logger.error('Update profile error', {
      error: error instanceof Error ? error.message : String(error),
      userId: user.id,
    });
    return NextResponse.json({ ok: false, error: 'خطا در بروزرسانی پروفایل.' }, { status: 500 });
  }
}
