import { NextResponse } from 'next/server';
import { isFeatureEnabled } from '@/lib/features/availability';
import { disabledApiResponse } from '@/lib/server/feature-flags';
import { isSameOrigin } from '@/lib/server/csrf';
import { resetPassword } from '@/lib/server/password-reset';
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
  logApiEvent(request, { route: '/api/auth/reset-password', event: 'request' });

  if (!isSameOrigin(request)) {
    return NextResponse.json({ ok: false, error: 'درخواست از مبدأ نامعتبر است.' }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'بدنه درخواست نامعتبر است.' }, { status: 400 });
  }

  const { token, password } = body as { token?: string; password?: string };

  if (!token || !password) {
    return NextResponse.json(
      { ok: false, error: 'توکن و رمز عبور جدید الزامی هستند.' },
      { status: 400 },
    );
  }

  const passwordError = validatePassword(password);
  if (passwordError) {
    return NextResponse.json({ ok: false, error: passwordError }, { status: 400 });
  }

  const rateLimitKey = makeRateLimitKey('auth:reset-password', request);
  const rateLimitResult = await rateLimit(rateLimitKey, {
    limit: 5,
    windowMs: 15 * 60 * 1000,
  });

  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { ok: false, error: 'تعداد درخواست‌ها بیش از حد مجاز است.' },
      { status: 429 },
    );
  }

  try {
    const result = await resetPassword(token, password);

    if (result.success) {
      return NextResponse.json({
        ok: true,
        message: 'رمز عبور با موفقیت تغییر کرد. لطفاً دوباره وارد شوید.',
      });
    }

    return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
  } catch (error) {
    logger.error('Reset password error', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ ok: false, error: 'خطا در پردازش درخواست.' }, { status: 500 });
  }
}
