import { expect, type Page } from '@playwright/test';

const DEFAULT_ADMIN_EMAIL = 'admin-e2e@persian-tools.local';
const DEFAULT_ADMIN_PASSWORD = 'AdminPass123!';

export const isAdminBackendEnabled = process.env['E2E_ADMIN_BACKEND'] === '1';
export const adminEmail = process.env['E2E_ADMIN_EMAIL'] ?? DEFAULT_ADMIN_EMAIL;
export const adminPassword = process.env['E2E_ADMIN_PASSWORD'] ?? DEFAULT_ADMIN_PASSWORD;

export async function ensureAdminSession(page: Page) {
  const registerResponse = await page.request.post('/api/auth/register', {
    data: { email: adminEmail, password: adminPassword },
  });

  if (registerResponse.status() === 200) {
    return;
  }

  expect(registerResponse.status()).toBe(409);

  const loginResponse = await page.request.post('/api/auth/login', {
    data: { email: adminEmail, password: adminPassword },
  });
  expect(loginResponse.status()).toBe(200);
}
