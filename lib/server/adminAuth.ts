import type { User, UserRole } from './users';
import { getUserFromRequest } from './auth';

const ADMIN_EMAIL_ALLOWLIST_ENV = 'ADMIN_EMAIL_ALLOWLIST';

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

export function isAdminUser(user: Pick<User, 'email' | 'role'> | null | undefined): boolean {
  if (!user) {
    return false;
  }
  if (user.role === 'admin') {
    return true;
  }
  return isAdminUserEmail(user.email);
}

export function hasEditorAccess(user: Pick<User, 'email' | 'role'> | null | undefined): boolean {
  if (!user) {
    return false;
  }
  if (user.role === 'admin' || user.role === 'editor') {
    return true;
  }
  return isAdminUserEmail(user.email);
}

const ROLE_HIERARCHY: Record<UserRole, number> = {
  admin: 3,
  editor: 2,
  user: 1,
};

export function hasRole(
  user: Pick<User, 'role'> | null | undefined,
  requiredRole: UserRole,
): boolean {
  if (!user?.role) {
    return false;
  }
  const userLevel = ROLE_HIERARCHY[user.role] ?? 0;
  const requiredLevel = ROLE_HIERARCHY[requiredRole] ?? 0;
  return userLevel >= requiredLevel;
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
