import { NextResponse } from 'next/server';
import type { User } from './users';
import { createSession, deleteSession, getSessionByToken } from './sessions';
import { getUserById } from './users';

const SESSION_COOKIE = 'pt_session';

export function getSessionToken(request: Request): string | null {
  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) {
    return null;
  }
  const cookies = cookieHeader.split(';').map((item) => item.trim());
  const sessionCookie = cookies.find((item) => item.startsWith(`${SESSION_COOKIE}=`));
  if (!sessionCookie) {
    return null;
  }
  return sessionCookie.split('=')[1] ?? null;
}

export async function getUserFromRequest(request: Request): Promise<User | null> {
  const token = getSessionToken(request);
  return getUserFromSessionToken(token);
}

export async function getUserFromSessionToken(token: string | null): Promise<User | null> {
  if (!token) {
    return null;
  }
  const session = await getSessionByToken(token);
  if (!session) {
    return null;
  }
  return (await getUserById(session.userId)) ?? null;
}

export async function createSessionResponse(userId: string) {
  const session = await createSession(userId);
  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: SESSION_COOKIE,
    value: session.token,
    httpOnly: true,
    secure: process.env['NODE_ENV'] === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}

export async function clearSessionResponse(request: Request) {
  const token = getSessionToken(request);
  if (token) {
    await deleteSession(token);
  }
  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: SESSION_COOKIE,
    value: '',
    httpOnly: true,
    secure: process.env['NODE_ENV'] === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  return response;
}
