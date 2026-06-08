import { NextResponse } from 'next/server';
import { isFeatureEnabled } from '@/lib/features/availability';
import { disabledApiResponse } from '@/lib/server/feature-flags';
import { logApiEvent } from '@/lib/server/request-observability';
import { getUserByEmail, createUser, validateUser, type User } from '@/lib/server/users';
import { createSessionResponse } from '@/lib/server/auth';

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

  if (!body || typeof body !== 'object') {
    return NextResponse.json({ ok: false, errors: ['بدنه درخواست نامعتبر است.'] }, { status: 400 });
  }

  const { email, password, isAdmin } = body as {
    email?: string;
    password?: string;
    isAdmin?: boolean;
  };

  if (!email || !password) {
    return NextResponse.json({ ok: false, errors: ['ایمیل و پسورد الزامی است.'] }, { status: 400 });
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
    logApiEvent(request, {
      route: '/api/auth/login',
      event: 'error',
      status: 500,
      details: { message: error instanceof Error ? error.message : 'UNKNOWN' },
    });
    return NextResponse.json({ ok: false, errors: ['خطا در ورود به سیستم.'] }, { status: 500 });
  }
}
