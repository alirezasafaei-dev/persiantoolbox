import { test, expect } from '@playwright/test';

const paths = ['/', '/pdf-tools', '/offline'];

test.describe('security headers and nonce contracts', () => {
  for (const path of paths) {
    test(`returns security headers for ${path}`, async ({ request }) => {
      const response = await request.get(path);
      expect(response.ok()).toBeTruthy();

      const csp = response.headers()['content-security-policy'];
      expect(csp).toBeTruthy();
      expect(csp).toContain("default-src 'self'");
      expect(csp).toContain("script-src 'self' 'nonce-");

      expect(response.headers()['x-content-type-options']).toBe('nosniff');
      expect(response.headers()['x-frame-options']).toBe('DENY');
      expect(response.headers()['referrer-policy']).toBe('strict-origin-when-cross-origin');
    });
  }

  test('response html script nonce matches nonce token in csp', async ({ request }) => {
    const response = await request.get('/');
    expect(response.ok()).toBeTruthy();

    const csp = response.headers()['content-security-policy'];
    expect(csp).toBeTruthy();
    if (!csp) {
      throw new Error('missing content-security-policy header');
    }

    const cspNonceMatch = csp.match(/'nonce-([^']+)'/);
    expect(cspNonceMatch?.[1]).toBeTruthy();
    const cspNonce = cspNonceMatch?.[1] ?? '';

    const html = await response.text();
    expect(html).toContain(`nonce="${cspNonce}"`);
  });

  test('does not send hsts in non-production test server', async ({ request }) => {
    const response = await request.get('/');
    expect(response.ok()).toBeTruthy();
    expect(response.headers()['strict-transport-security']).toBeUndefined();
  });
});
