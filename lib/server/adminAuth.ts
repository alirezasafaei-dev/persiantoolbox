import type { User } from './users';
import { getUserFromRequest } from './auth';

export const ADMIN_EMAIL_ALLOWLIST_ENV = 'ADMIN_EMAIL_ALLOWLIST';

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

function getAdminAllowlist(): Set<string> {
  const raw = process.env[ADMIN_EMAIL_ALLOWLIST_ENV] ?? '';
  const emails = raw
    .split(',')
    .map((item) => normalizeEmail(item))
    .filter((item) => item.length > 0);
  return new Set(emails);
}

export function isAdminUserEmail(email: string): boolean {
  const normalized = normalizeEmail(email);
  if (!normalized) {
    return false;
  }
  return getAdminAllowlist().has(normalized);
}

export function isAdminUser(user: Pick<User, 'email'> | null | undefined): boolean {
  if (!user) {
    return false;
  }
  return isAdminUserEmail(user.email);
}

export async function requireAdminFromRequest(
  request: Request,
): Promise<{ ok: true; user: User } | { ok: false; status: 401 | 403 }> {
  const user = await getUserFromRequest(request);
  if (!user) {
    return { ok: false, status: 401 };
  }
  if (!isAdminUser(user)) {
    return { ok: false, status: 403 };
  }
  return { ok: true, user };
}
