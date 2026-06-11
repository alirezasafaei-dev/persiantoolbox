import { NextResponse } from 'next/server';
import { isFeatureEnabled } from '@/lib/features/availability';
import { disabledApiResponse } from '@/lib/server/feature-flags';
import { logApiEvent } from '@/lib/server/request-observability';
import { getUserByEmail, validateUser } from '@/lib/server/users';
import { createSessionResponse } from '@/lib/server/auth';
import { validateObject, commonSchemas, type ValidationError } from '@/lib/server/validation';
import { logger } from '@/lib/server/logger';
import { rateLimit, makeRateLimitKey } from '@/lib/server/rateLimit';
import { isSameOrigin } from '@/lib/server/csrf';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  if (!isFeatureEnabled('auth')) {
    return disabledApiResponse('auth');
  }
  logApiEvent(request, { route: '/api/auth/login', event: 'request' });

  if (!isSameOrigin(request)) {
    return NextResponse.json(
      { ok: false, errors: ['درخواست از مبدأ نامعتبر است.'] },
      { status: 403 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, errors: ['بدنه درخواست نامعتبر است.'] }, { status: 400 });
  }

  // Validate input using schema
  const loginSchema = {
    email: commonSchemas.email,
    password: commonSchemas.password,
  };

  const validation = validateObject(loginSchema, body);
  if (!validation.success) {
    const errors = validation.errors.map((e: ValidationError) => e.message);
    logger.debug('Login validation failed', { errors: validation.errors });
    return NextResponse.json({ ok: false, errors }, { status: 400 });
  }

  const { email, password } = validation.data;

  // Apply rate limiting for login attempts
  const rateLimitKey = makeRateLimitKey('auth:login', request, email);
  const rateLimitResult = await rateLimit(rateLimitKey, {
    limit: 5, // 5 attempts per window
    windowMs: 15 * 60 * 1000, // 15 minutes
  });

  if (!rateLimitResult.allowed) {
    logger.warn('Login rate limit exceeded', {
      email,
      rateLimitKey,
      resetAt: rateLimitResult.resetAt,
    });
    return NextResponse.json(
      {
        ok: false,
        errors: ['تعداد تلاش‌های ورود بیش از حد مجاز است. لطفاً بعد از ۱۵ دقیقه دوباره تلاش کنید.'],
        retryAfter: Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000),
      },
      {
        status: 429,
        headers: {
          'Retry-After': Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000).toString(),
          'X-RateLimit-Limit': '5',
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': rateLimitResult.resetAt.toString(),
        },
      },
    );
  }

  try {
    const existingUser = await getUserByEmail(email);
    if (!existingUser) {
      return NextResponse.json(
        { ok: false, errors: ['ایمیل یا پسورد اشتباه است.'] },
        { status: 401 },
      );
    }

    const user = await validateUser(email, password);
    if (!user) {
      return NextResponse.json(
        { ok: false, errors: ['ایمیل یا پسورد اشتباه است.'] },
        { status: 401 },
      );
    }

    const response = await createSessionResponse(user.id);
    logApiEvent(request, {
      route: '/api/auth/login',
      event: 'response',
      status: 200,
      details: { userId: user.id },
    });
    return response;
  } catch (error) {
    logger.error('Login failed', {
      error: error instanceof Error ? error.message : String(error),
      email,
    });
    logApiEvent(request, {
      route: '/api/auth/login',
      event: 'error',
      status: 500,
      details: { message: error instanceof Error ? error.message : 'UNKNOWN' },
    });
    return NextResponse.json({ ok: false, errors: ['خطا در ورود به سیستم.'] }, { status: 500 });
  }
}
