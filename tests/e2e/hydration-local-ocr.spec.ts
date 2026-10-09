import { expect, test } from '@playwright/test';

test.use({ timezoneId: 'America/New_York' });

test('keeps blog publication dates stable after western-browser hydration', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const response = await page.goto('/blog/json-formatter-for-api-debugging', { waitUntil: 'load' });
  if (!response) throw new Error('Blog navigation returned no response');
  const html = await response.text();
  const serverTime = html.match(/<time\b[^>]*>(.*?)<\/time>/)?.[1];
  expect(serverTime).toBeTruthy();
  if (!serverTime) throw new Error('Publication time missing from server HTML');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByTestId('mobile-menu').click();
  await expect(page.getByTestId('mobile-menu')).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('article time').first()).toHaveText(serverTime);
  expect(errors.filter((error) => /hydration|#418/i.test(error))).toEqual([]);
});

test('hydrates tool sharing when the browser supports native share', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'share', { configurable: true, value: async () => {} });
  });
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/text-tools/address-fa-to-en', { waitUntil: 'load' });
  await expect(
    page.getByRole('button', { name: 'اشتراک‌گذاری', exact: true }).first(),
  ).toBeVisible();
  for (const [name, value] of [
    ['استان', 'تهران'],
    ['شهر', 'تهران'],
    ['خیابان', 'ولیعصر'],
    ['پلاک', '12'],
  ] as const) {
    await page.getByRole('textbox', { name, exact: true }).fill(value);
  }
  await expect(page.getByRole('textbox', { name: 'خروجی تک‌خطی', exact: true })).toHaveValue(
    /Tehran/i,
  );
  expect(errors.filter((error) => /hydration|#418/i.test(error))).toEqual([]);
});

test('extracts synthetic image text with a same-origin OCR worker under strict CSP', async ({
  page,
  context,
  request,
}) => {
  test.setTimeout(120000);
  const fixture = await context.newPage();
  await fixture.setContent(
    '<div style="width:700px;height:150px;background:white;color:black;font:40px Arial;display:flex;align-items:center;justify-content:center">PERSIAN TOOLBOX TEST 123</div>',
  );
  const image = await fixture.locator('div').screenshot();
  await fixture.close();
  const assets: string[] = [];
  const errors: string[] = [];
  page.on('request', (entry) => {
    if (/tesseract|traineddata|\.wasm|worker\.min\.js/.test(entry.url())) assets.push(entry.url());
  });
  page.on('pageerror', (error) => errors.push(error.message));
  const response = await page.goto('/tools/persian-ocr', { waitUntil: 'load' });
  if (!response) throw new Error('OCR navigation returned no response');
  expect(response.headers()['content-security-policy']).not.toContain('wasm-unsafe-eval');
  const worker = await request.get('/ocr/v7/worker.min.js');
  expect(worker.status()).toBe(200);
  expect(worker.headers()['content-security-policy']).toContain(
    "script-src 'self' 'wasm-unsafe-eval'",
  );
  await page.getByLabel('انتخاب فایل تصویری', { exact: true }).setInputFiles({
    name: 'release-test.png',
    mimeType: 'image/png',
    buffer: image,
  });
  await expect(page.getByText('release-test.png', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'استخراج متن', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'متن استخراج شده', exact: true })).toBeVisible({
    timeout: 90000,
  });
  await expect(page.locator('pre')).toContainText('TOOLBOX');
  const origin = new URL(page.url()).origin;
  expect(assets.length).toBeGreaterThan(0);
  expect(assets.every((asset) => new URL(asset).origin === origin)).toBe(true);
  expect(errors).toEqual([]);
});
