import AxeBuilder from '@axe-core/playwright';
import sharp from 'sharp';
import { expect, test } from '@playwright/test';

test.describe('AI image page: default-off safety', () => {
  test.skip(
    process.env['AI_IMAGE_E2E_ENABLED_MOCK'] === 'true',
    'Isolated enabled mock server is checked in the next suite.',
  );
  test.use({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block' });

  test('is accessible and cannot submit while the image feature is disabled', async ({ page }) => {
    let requests = 0;
    await page.route('**/api/ai/image', async (route) => {
      requests += 1;
      await route.abort();
    });
    await page.goto('/ai/image', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: 'ساخت تصویر با هوش مصنوعی' })).toBeVisible();
    await expect(page.getByLabel('توضیح تصویر')).toBeDisabled();
    await expect(page.getByRole('button', { name: 'ساخت تصویر' })).toBeDisabled();
    await expect(page.getByRole('checkbox', { name: /اجازه می‌دهم/ })).toBeDisabled();
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
    expect(requests).toBe(0);

    await page.goto('/ai', { waitUntil: 'domcontentloaded' });
    await expect(page.getByText('هنوز در دسترس نیست')).toBeVisible();
    await expect(page.getByRole('link', { name: 'ورود به تصویرساز' })).toHaveCount(0);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });
});

test.describe('AI image page: isolated mock response (never calls the real provider)', () => {
  test.skip(
    process.env['AI_IMAGE_E2E_ENABLED_MOCK'] !== 'true',
    'Requires a local, isolated server with explicitly synthetic image-account flags.',
  );
  test.use({ viewport: { width: 375, height: 667 }, serviceWorkers: 'block' });

  test('requires consent, displays a JPEG blob, downloads and handles a quota response', async ({
    page,
  }) => {
    const bodies: unknown[] = [];
    const syntheticJpeg = await sharp({
      create: { width: 8, height: 8, channels: 3, background: '#9abedb' },
    })
      .jpeg()
      .toBuffer();
    await page.route('**/api/ai/image', async (route) => {
      bodies.push(route.request().postDataJSON());
      if (bodies.length === 1) {
        await route.fulfill({
          status: 200,
          headers: { 'content-type': 'image/jpeg', 'cache-control': 'no-store' },
          body: syntheticJpeg,
        });
      } else {
        await route.fulfill({
          status: 429,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Private upstream error must not appear' }),
        });
      }
    });
    await page.goto('/ai/image', { waitUntil: 'domcontentloaded' });
    const consent = page.getByRole('checkbox', { name: /اجازه می‌دهم/ });
    const prompt = page.getByLabel('توضیح تصویر');
    const submit = page.getByRole('button', { name: 'ساخت تصویر' });
    await expect(prompt).toBeEnabled();
    await prompt.fill('کوهستان آرام');
    await expect(submit).toBeDisabled();
    expect(bodies).toHaveLength(0);
    await consent.check();
    await submit.click();
    const image = page.getByRole('img', { name: /پیش‌نمایش تصویر ساخته‌شده/ });
    await expect(image).toBeVisible();
    await expect
      .poll(() => image.evaluate((element) => (element as HTMLImageElement).naturalWidth))
      .toBe(8);
    const downloadLink = page.getByRole('link', { name: 'دانلود تصویر' });
    await expect(downloadLink).toHaveAttribute('download', 'persiantoolbox-ai-image.jpg');
    const downloadPromise = page.waitForEvent('download');
    await downloadLink.click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('persiantoolbox-ai-image.jpg');
    expect(bodies).toEqual([{ prompt: 'کوهستان آرام', consent: true }]);

    await prompt.fill('گل سرخ');
    await submit.click();
    await expect(page.getByRole('alert')).toContainText('سهمیه');
    await expect(page.getByRole('alert')).not.toContainText('Private upstream');
    await expect(prompt).toHaveValue('گل سرخ');
    expect(bodies).toHaveLength(2);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth - innerWidth),
    ).toBeLessThanOrEqual(1);
    const audit = await new AxeBuilder({ page }).analyze();
    expect(
      audit.violations.filter((v) => ['serious', 'critical'].includes(v.impact ?? '')),
    ).toHaveLength(0);
  });
});
