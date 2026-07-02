import { test, expect } from '@playwright/test';

const paths = ['/', '/pdf-tools', '/offline'];
const noncePattern = /'nonce-([^']+)'/;

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
      expect(csp).toContain("script-src 'self' 'unsafe-inline'");
      expect(csp).toContain("style-src 'self' 'unsafe-inline'");
      expect(csp).not.toContain('style-src-attr');
      const nonce = reportOnlyCsp?.match(noncePattern)?.[1];
      expect(nonce).toBeTruthy();
      expect(reportOnlyCsp).toContain(`script-src 'self' 'nonce-${nonce}'`);
      expect(reportOnlyCsp).toContain(`style-src 'self' 'nonce-${nonce}'`);
      expect(reportOnlyCsp).not.toContain("script-src 'self' 'unsafe-inline'");
      expect(reportOnlyCsp).not.toContain("style-src 'self' 'unsafe-inline'");
      expect(reportOnlyCsp).toContain("style-src-attr 'unsafe-inline'");

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
    const nonce = reportOnlyCsp?.match(noncePattern)?.[1];
    expect(nonce).toBeTruthy();
    expect(csp).toContain("script-src 'self' 'unsafe-inline'");
    expect(reportOnlyCsp).toContain(`script-src 'self' 'nonce-${nonce}'`);
    expect(html).toContain('/_next/static/');
  });

  test('does not send hsts in non-production test server', async ({ request }) => {
    const response = await request.get('/');
    expect(response.ok()).toBeTruthy();
    expect(response.headers()['strict-transport-security']).toBeUndefined();
  });
});
