import { NextResponse } from 'next/server';
import { isFeatureEnabled } from '@/lib/features/availability';
import { disabledApiResponse } from '@/lib/server/feature-flags';
import { isSameOrigin } from '@/lib/server/csrf';
import { findUserByEmail } from '@/lib/server/users';
import { createPasswordResetToken } from '@/lib/server/password-reset';
import { rateLimit, makeRateLimitKey } from '@/lib/server/rateLimit';
import { logger } from '@/lib/server/logger';
import { logApiEvent } from '@/lib/server/request-observability';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  if (!isFeatureEnabled('auth')) {
    return disabledApiResponse('auth');
  }
  logApiEvent(request, { route: '/api/auth/forgot-password', event: 'request' });

  if (!isSameOrigin(request)) {
    return NextResponse.json({ ok: false, error: 'درخواست از مبدأ نامعتبر است.' }, { status: 403 });
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

  const rateLimitKey = makeRateLimitKey('auth:forgot-password', request, email);
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

  const user = await findUserByEmail(email);

  // Always return success to prevent email enumeration
  if (!user) {
    return NextResponse.json({
      ok: true,
      message: 'اگر ایمیل شما در سیستم ثبت شده باشد، لینک بازیابی رمز عبور ارسال خواهد شد.',
    });
  }

  try {
    const resetToken = await createPasswordResetToken(user.id);

    // In production, send email with reset link
    // For now, log the token for testing
    logger.info('Password reset token created', {
      userId: user.id,
      email: user.email,
      token: resetToken,
    });

    return NextResponse.json({
      ok: true,
      message: 'اگر ایمیل شما در سیستم ثبت شده باشد، لینک بازیابی رمز عبور ارسال خواهد شد.',
    });
  } catch (error) {
    logger.error('Forgot password error', {
      error: error instanceof Error ? error.message : String(error),
      email,
    });
    return NextResponse.json({ ok: false, error: 'خطا در پردازش درخواست.' }, { status: 500 });
  }
}
