import { test, expect } from '@playwright/test';

const paths = ['/', '/pdf-tools', '/offline'];

test.describe('security headers', () => {
  for (const path of paths) {
    test(`returns security headers for ${path}`, async ({ request }) => {
      const response = await request.get(path);
      expect(response.ok()).toBeTruthy();

      const csp = response.headers()['content-security-policy'];
      expect(csp).toBeTruthy();
      expect(csp).toContain("default-src 'self'");
      expect(csp).toContain("script-src 'self' 'unsafe-inline'");
      expect(csp).toContain("style-src 'self' 'unsafe-inline'");
      expect(csp).not.toContain('style-src-attr');

      expect(response.headers()['x-content-type-options']).toBe('nosniff');
      expect(response.headers()['x-frame-options']).toBe('DENY');
      expect(response.headers()['referrer-policy']).toBe('strict-origin-when-cross-origin');
    });
  }

  test('response html keeps same-origin script policy compatible with rendered app shell', async ({
    request,
  }) => {
    const response = await request.get('/');
    expect(response.ok()).toBeTruthy();

    const csp = response.headers()['content-security-policy'];
    expect(csp).toBeTruthy();
    const html = await response.text();
    expect(csp).toContain("script-src 'self' 'unsafe-inline'");
    expect(html).toContain('/_next/static/');
  });

  test('does not send hsts in non-production test server', async ({ request }) => {
    const response = await request.get('/');
    expect(response.ok()).toBeTruthy();
    expect(response.headers()['strict-transport-security']).toBeUndefined();
  });
});
