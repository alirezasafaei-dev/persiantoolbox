import { NextResponse } from 'next/server';
import { isFeatureEnabled } from '@/lib/features/availability';
import { disabledApiResponse } from '@/lib/server/feature-flags';
import { logApiEvent } from '@/lib/server/request-observability';
import { getUserByEmail, createUser, validateUser, type User } from '@/lib/server/users';
import { createSessionResponse } from '@/lib/server/auth';
import {
  validateObject,
  commonSchemas,
  Schema,
  type ValidationError,
} from '@/lib/server/validation';
import { logger } from '@/lib/server/logger';
import { rateLimit, makeRateLimitKey } from '@/lib/server/rateLimit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  if (!isFeatureEnabled('auth')) {
    return disabledApiResponse('auth');
  }
  logApiEvent(request, { route: '/api/auth/login', event: 'request' });

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
    isAdmin: Schema.create<boolean>()
      .optional()
      .custom(
        (value) => typeof value === 'boolean' || value === undefined,
        'isAdmin must be a boolean',
      ),
  };

  const validation = validateObject(loginSchema, body);
  if (!validation.success) {
    const errors = validation.errors.map((e: ValidationError) => e.message);
    logger.debug('Login validation failed', { errors: validation.errors });
    return NextResponse.json({ ok: false, errors }, { status: 400 });
  }

  const { email, password, isAdmin } = validation.data;

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
    let user: User | null = await getUserByEmail(email);

    if (!user) {
      // ایجاد کاربر جدید برای تست (در production باید منطق مناسب اضافه شود)
      const created = await createUser(email, password, {
        role: isAdmin ? 'admin' : 'user',
      });
      user = created;
    } else {
      // در production باید password validation انجام شود
      // فعلاً برای MVP اجازه می‌دهیم بدون password validation
      const validated = await validateUser(email, password);
      if (!validated) {
        return NextResponse.json(
          { ok: false, errors: ['ایمیل یا پسورد اشتباه است.'] },
          { status: 401 },
        );
      }
      user = validated;
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
