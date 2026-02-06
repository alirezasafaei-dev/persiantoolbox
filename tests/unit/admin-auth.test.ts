import { afterEach, describe, expect, it } from 'vitest';
import { isAdminUser, isAdminUserEmail } from '@/lib/server/adminAuth';

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
});
