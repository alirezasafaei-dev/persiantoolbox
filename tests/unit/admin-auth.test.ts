import { afterEach, describe, expect, it } from 'vitest';
import { requireAdminFromRequest, isAdminUser, isAdminUserEmail } from '@/lib/server/adminAuth';
import { getUserFromRequest } from '@/lib/server/auth';
import { vi } from 'vitest';

vi.mock('@/lib/server/auth', () => ({
  getUserFromRequest: vi.fn(),
}));

const mockGetUserFromRequest = vi.mocked(getUserFromRequest);

const ORIGINAL_ALLOWLIST = process.env['ADMIN_EMAIL_ALLOWLIST'];

afterEach(() => {
  if (typeof ORIGINAL_ALLOWLIST === 'string') {
    process.env['ADMIN_EMAIL_ALLOWLIST'] = ORIGINAL_ALLOWLIST;
    return;
  }
  delete process.env['ADMIN_EMAIL_ALLOWLIST'];
});

describe('admin auth allowlist', () => {
  it('returns false when allowlist is empty', () => {
    delete process.env['ADMIN_EMAIL_ALLOWLIST'];
    expect(isAdminUserEmail('admin@example.com')).toBe(false);
  });

  it('matches normalized emails from env', () => {
    process.env['ADMIN_EMAIL_ALLOWLIST'] = ' Admin@example.com ,owner@example.com ';
    expect(isAdminUserEmail('admin@example.com')).toBe(true);
    expect(isAdminUserEmail('OWNER@example.com')).toBe(true);
    expect(isAdminUserEmail('user@example.com')).toBe(false);
  });

  it('validates user object by email', () => {
    process.env['ADMIN_EMAIL_ALLOWLIST'] = 'admin@example.com';
    expect(isAdminUser({ email: 'ADMIN@example.com' })).toBe(true);
    expect(isAdminUser({ email: 'other@example.com' })).toBe(false);
    expect(isAdminUser(null)).toBe(false);
  });

  it('requireAdminFromRequest returns 401 when unauthenticated', async () => {
    mockGetUserFromRequest.mockResolvedValueOnce(null);
    const request = new Request('http://localhost/admin');
    const result = await requireAdminFromRequest(request);
    expect(result).toEqual({ ok: false, status: 401 });
  });

  it('requireAdminFromRequest returns 403 for non-admin user', async () => {
    process.env['ADMIN_EMAIL_ALLOWLIST'] = 'admin@example.com';
    mockGetUserFromRequest.mockResolvedValueOnce({
      id: 'u1',
      email: 'user@example.com',
      passwordHash: 'x',
      createdAt: Date.now(),
    });
    const request = new Request('http://localhost/admin');
    const result = await requireAdminFromRequest(request);
    expect(result).toEqual({ ok: false, status: 403 });
  });

  it('requireAdminFromRequest returns user for admin', async () => {
    process.env['ADMIN_EMAIL_ALLOWLIST'] = 'admin@example.com';
    mockGetUserFromRequest.mockResolvedValueOnce({
      id: 'u1',
      email: 'admin@example.com',
      passwordHash: 'x',
      createdAt: Date.now(),
    });
    const request = new Request('http://localhost/admin');
    const result = await requireAdminFromRequest(request);
    expect(result.ok).toBe(true);
  });
});
