import { test, expect } from '@playwright/test';

test.describe('API health and utility endpoints', () => {
  test('health endpoint returns runtime and dependency status', async ({ request }) => {
    const response = await request.get('/api/health');
    expect([200, 503]).toContain(response.status());

    const data = await response.json();
    expect(data.status).toBe(response.status() === 200 ? 'ok' : 'degraded');
    expect(data.ready).toBe(response.status() === 200);
    expect(data.version).toBeTruthy();
    expect(data.timestamp).toBeTruthy();
    expect(typeof data.uptime).toBe('number');
    expect(typeof data.memory.rss).toBe('number');
    expect(typeof data.memory.heapUsed).toBe('number');
    expect(typeof data.dependencies.database.ok).toBe('boolean');
    expect(typeof data.dependencies.redis.ok).toBe('boolean');
    expect(typeof data.dependencies.paymentGateway.ok).toBe('boolean');
  });

  test('health endpoint has no-store cache even when degraded', async ({ request }) => {
    const response = await request.get('/api/health');
    expect([200, 503]).toContain(response.status());
    const cacheControl = response.headers()['cache-control'] ?? '';
    expect(cacheControl).toContain('no-store');
  });

  test('security.txt is accessible', async ({ request }) => {
    const response = await request.get('/.well-known/security.txt');
    expect(response.ok()).toBeTruthy();
    const body = await response.text();
    expect(body).toContain('Contact:');
    expect(body).toContain('persiantoolbox.ir');
  });

  test('enamad verification file is accessible', async ({ request }) => {
    const response = await request.get('/34914740.txt');
    expect(response.ok()).toBeTruthy();
  });
});

test.describe('New tool pages render', () => {
  const toolPages = [
    { path: '/tools/json-formatter', heading: 'فرمت‌بندی JSON' },
    { path: '/tools/hash-generator', heading: 'تولید هش' },
    { path: '/tools/base64-tool', heading: 'Base64' },
    { path: '/validation-tools/persian-password', heading: 'تولید رمز عبور' },
    { path: '/tools/persian-ocr', heading: 'OCR' },
    { path: '/pdf-tools/security/encrypt-pdf', heading: 'رمزگذاری PDF' },
  ];

  for (const tool of toolPages) {
    test(`${tool.path} renders with correct heading`, async ({ page }) => {
      await page.goto(tool.path);
      const heading = page.locator('h1, h2').filter({ hasText: tool.heading }).first();
      await expect(heading).toBeVisible({ timeout: 10000 });
    });
  }
});

test.describe('Cache headers for static assets', () => {
  test.skip(!process.env['CI'], 'Cache headers only apply in production builds');

  test('served Vazirmatn font has immutable cache', async ({ request }) => {
    const response = await request.get('/fonts/Vazirmatn-Regular.woff2');
    expect(response.ok()).toBeTruthy();
    const cacheControl = response.headers()['cache-control'] ?? '';
    expect(cacheControl).toContain('max-age=31536000');
    expect(cacheControl).toContain('immutable');
  });

  test('icon.svg has immutable cache', async ({ request }) => {
    const response = await request.get('/icon.svg');
    expect(response.ok()).toBeTruthy();
    const cacheControl = response.headers()['cache-control'] ?? '';
    expect(cacheControl).toContain('max-age=31536000');
    expect(cacheControl).toContain('immutable');
  });
});

test.describe('PWA manifest', () => {
  test('manifest is accessible', async ({ request }) => {
    const response = await request.get('/manifest.webmanifest');
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.name).toBeTruthy();
    expect(data.display).toBe('standalone');
    expect(data.icons).toBeTruthy();
    expect(data.icons.length).toBeGreaterThan(0);
  });
});
