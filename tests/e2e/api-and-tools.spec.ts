import { test, expect } from '@playwright/test';

test.describe('API health and utility endpoints', () => {
  test('health endpoint returns version and status', async ({ request }) => {
    const response = await request.get('/api/health');
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.status).toBe('ok');
    expect(data.version).toBeTruthy();
    expect(data.timestamp).toBeTruthy();
    expect(typeof data.uptime).toBe('number');
    expect(typeof data.memory.rss).toBe('number');
    expect(typeof data.memory.heapUsed).toBe('number');
  });

  test('health endpoint has no-store cache', async ({ request }) => {
    const response = await request.get('/api/health');
    expect(response.ok()).toBeTruthy();
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
  test('fonts have immutable cache', async ({ request }) => {
    const response = await request.get('/fonts/Vazirmatn-Regular.ttf');
    expect(response.ok()).toBeTruthy();
    const cacheControl = response.headers()['cache-control'] ?? '';
    expect(cacheControl).toContain('immutable');
  });

  test('icon.svg has immutable cache', async ({ request }) => {
    const response = await request.get('/icon.svg');
    expect(response.ok()).toBeTruthy();
    const cacheControl = response.headers()['cache-control'] ?? '';
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
