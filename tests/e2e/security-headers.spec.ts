import { test, expect } from '@playwright/test';

const paths = ['/', '/pdf-tools', '/offline'];
test.describe('security headers', () => {
  for (const path of paths) {
    test(`returns security headers for ${path}`, async ({ request }) => {
      const response = await request.get(path);
      expect(response.ok()).toBeTruthy();

      const csp = response.headers()['content-security-policy'];
      const reportOnlyCsp = response.headers()['content-security-policy-report-only'];
      expect(csp).toBeTruthy();
      expect(reportOnlyCsp).toBeTruthy();
      expect(csp).toContain("default-src 'self'");
      expect(csp).toContain("script-src 'self' 'nonce-");
      expect(csp).toContain("style-src 'self' 'unsafe-inline'");
      expect(csp).toContain('upgrade-insecure-requests');
      expect(csp).not.toContain("script-src 'self' 'unsafe-inline'");
      expect(csp).not.toContain('style-src-attr');
      expect(reportOnlyCsp).toContain("script-src 'self' 'nonce-");
      expect(reportOnlyCsp).toContain("style-src 'self' 'unsafe-inline'");
      expect(reportOnlyCsp).not.toContain('upgrade-insecure-requests');

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
    const reportOnlyCsp = response.headers()['content-security-policy-report-only'];
    expect(csp).toBeTruthy();
    expect(reportOnlyCsp).toBeTruthy();
    const html = await response.text();
    expect(csp).toContain("script-src 'self' 'nonce-");
    expect(reportOnlyCsp).toContain("script-src 'self' 'nonce-");
    expect(reportOnlyCsp).not.toContain('upgrade-insecure-requests');
    expect(html).toContain('/_next/static/');
  });

  test('HSTS matches the server execution mode', async ({ request }) => {
    const response = await request.get('/');
    expect(response.ok()).toBeTruthy();
    const hsts = response.headers()['strict-transport-security'];

    if (process.env['PLAYWRIGHT_PRODUCTION'] === '1') {
      expect(hsts).toContain('max-age=63072000');
      expect(hsts).toContain('includeSubDomains');
      expect(hsts).toContain('preload');
    } else {
      expect(hsts).toBeUndefined();
    }
  });
});
