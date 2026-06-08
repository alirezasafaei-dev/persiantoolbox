import { NextResponse } from 'next/server';
import { isFeatureEnabled } from '@/lib/features/availability';
import { disabledApiResponse } from '@/lib/server/feature-flags';
import { logApiEvent } from '@/lib/server/request-observability';
import { createUser, getUserByEmail } from '@/lib/server/users';
import { createSessionResponse } from '@/lib/server/auth';
import { validateObject, commonSchemas, type ValidationError } from '@/lib/server/validation';
import { logger } from '@/lib/server/logger';
import { rateLimit, makeRateLimitKey } from '@/lib/server/rateLimit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  if (!isFeatureEnabled('auth')) {
    return disabledApiResponse('auth');
  }
  logApiEvent(request, { route: '/api/auth/register', event: 'request' });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, errors: ['بدنه درخواست نامعتبر است.'] }, { status: 400 });
  }

  // Validate input using schema
  const registerSchema = {
    email: commonSchemas.email,
    password: commonSchemas.password,
  };

  const validation = validateObject(registerSchema, body);
  if (!validation.success) {
    const errors = validation.errors.map((e: ValidationError) => e.message);
    logger.debug('Registration validation failed', { errors: validation.errors });
    return NextResponse.json({ ok: false, errors }, { status: 400 });
  }

  const { email, password } = validation.data;

  // Apply rate limiting for registration attempts
  const rateLimitKey = makeRateLimitKey('auth:register', request, email);
  const rateLimitResult = await rateLimit(rateLimitKey, {
    limit: 3, // 3 attempts per window
    windowMs: 60 * 60 * 1000, // 1 hour
  });

  if (!rateLimitResult.allowed) {
    logger.warn('Registration rate limit exceeded', {
      email,
      rateLimitKey,
      resetAt: rateLimitResult.resetAt,
    });
    return NextResponse.json(
      {
        ok: false,
        errors: [
          'تعداد تلاش‌های ثبت‌نام بیش از حد مجاز است. لطفاً بعد از ۱ ساعت دوباره تلاش کنید.',
        ],
        retryAfter: Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000),
      },
      {
        status: 429,
        headers: {
          'Retry-After': Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000).toString(),
          'X-RateLimit-Limit': '3',
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': rateLimitResult.resetAt.toString(),
        },
      },
    );
  }

  try {
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { ok: false, errors: ['این ایمیل قبلاً ثبت شده است.'] },
        { status: 409 },
      );
    }

    const user = await createUser(email, password);

    const response = await createSessionResponse(user.id);
    logApiEvent(request, {
      route: '/api/auth/register',
      event: 'response',
      status: 201,
      details: { userId: user.id },
    });
    return response;
  } catch (error) {
    logger.error('Registration failed', {
      error: error instanceof Error ? error.message : String(error),
      email,
    });
    logApiEvent(request, {
      route: '/api/auth/register',
      event: 'error',
      status: 500,
      details: { message: error instanceof Error ? error.message : 'UNKNOWN' },
    });
    return NextResponse.json({ ok: false, errors: ['خطا در ثبت‌نام.'] }, { status: 500 });
  }
}
