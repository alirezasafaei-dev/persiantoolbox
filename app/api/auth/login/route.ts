import { NextResponse } from 'next/server';
import { createSessionResponse } from '@/lib/server/auth';
import { validateUser } from '@/lib/server/users';

export async function POST(request: Request) {
  let body: { email?: string; password?: string };
  try {
    body = (await request.json()) as { email?: string; password?: string };
  } catch {
    return NextResponse.json({ ok: false, error: 'INVALID_BODY' }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  const password = body.password?.trim();

  if (!email || !password) {
    return NextResponse.json({ ok: false, error: 'INVALID_INPUT' }, { status: 422 });
  }

  const user = await validateUser(email, password);
  if (!user) {
    return NextResponse.json({ ok: false, error: 'INVALID_CREDENTIALS' }, { status: 401 });
  }

  const response = await createSessionResponse(user.id);
  response.headers.set('x-user-id', user.id);
  return response;
}
