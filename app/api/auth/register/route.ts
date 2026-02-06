import { NextResponse } from 'next/server';
import { createSessionResponse } from '@/lib/server/auth';
import { createUser } from '@/lib/server/users';

export async function POST(request: Request) {
  let body: { email?: string; password?: string };
  try {
    body = (await request.json()) as { email?: string; password?: string };
  } catch {
    return NextResponse.json({ ok: false, error: 'INVALID_BODY' }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  const password = body.password?.trim();

  if (!email || !password || password.length < 6) {
    return NextResponse.json({ ok: false, error: 'INVALID_INPUT' }, { status: 422 });
  }

  try {
    const user = await createUser(email, password);
    const response = await createSessionResponse(user.id);
    response.headers.set('x-user-id', user.id);
    return response;
  } catch (error) {
    if (error instanceof Error && error.message === 'USER_EXISTS') {
      return NextResponse.json({ ok: false, error: 'USER_EXISTS' }, { status: 409 });
    }
    return NextResponse.json({ ok: false, error: 'UNKNOWN_ERROR' }, { status: 500 });
  }
}
