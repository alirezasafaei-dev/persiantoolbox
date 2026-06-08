import { NextResponse } from 'next/server';
import { isFeatureEnabled } from '@/lib/features/availability';
import { disabledApiResponse } from '@/lib/server/feature-flags';
import { logApiEvent } from '@/lib/server/request-observability';
import { createUser, getUserByEmail } from '@/lib/server/users';
import { createSessionResponse } from '@/lib/server/auth';

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

  if (!body || typeof body !== 'object') {
    return NextResponse.json({ ok: false, errors: ['بدنه درخواست نامعتبر است.'] }, { status: 400 });
  }

  const { email, password } = body as {
    email?: string;
    password?: string;
    name?: string;
  };

  if (!email || !password) {
    return NextResponse.json({ ok: false, errors: ['ایمیل و پسورد الزامی است.'] }, { status: 400 });
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
    logApiEvent(request, {
      route: '/api/auth/register',
      event: 'error',
      status: 500,
      details: { message: error instanceof Error ? error.message : 'UNKNOWN' },
    });
    return NextResponse.json({ ok: false, errors: ['خطا در ثبت‌نام.'] }, { status: 500 });
  }
}
