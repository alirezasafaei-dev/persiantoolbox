import { expect, test } from '@playwright/test';

test.describe('PDF hub without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('renders the heading and tool links outside the streaming fallback', async ({ page }) => {
    const response = await page.goto('/pdf-tools');
    expect(response?.status()).toBe(200);
    const main = page.getByRole('main');
    await expect(main.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 5000 });
    await expect(
      main.getByRole('link').and(page.locator('a[href="/pdf-tools/merge/merge-pdf"]')),
    ).toBeVisible();
    const collection = main.locator('script[id^="tool-collection-structured-data-"]');
    await expect(collection).toHaveCount(1);
    const graph = JSON.parse((await collection.textContent()) ?? '')['@graph'];
    expect(graph).toEqual(
      expect.arrayContaining([expect.objectContaining({ '@type': 'ItemList' })]),
    );
    const nonce = await collection.evaluate((script: HTMLScriptElement) => script.nonce);
    expect(nonce).toBeTruthy();
    expect(await response?.headerValue('content-security-policy')).toContain(`'nonce-${nonce}'`);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/pdf-tools$/);
    const image = await page.locator('meta[property="og:image"]').first().getAttribute('content');
    expect(image).toBeTruthy();
    const imageUrl = new URL(image ?? '', page.url());
    const imageResponse = await page.request.get(imageUrl.pathname + imageUrl.search);
    expect(imageResponse.status()).toBe(200);
    expect(imageResponse.headers()['content-type']).toContain('image/png');
  });
});

for (const viewport of [
  { width: 390, height: 844 },
  { width: 1350, height: 940 },
]) {
  test(`keeps the PDF hub stable while fonts load at ${viewport.width}px`, async ({
    browserName,
    page,
  }) => {
    test.skip(browserName !== 'chromium', 'LayoutShift is a Chromium performance entry.');
    await page.setViewportSize(viewport);
    await page.route('**/*.woff2', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      await route.continue();
    });
    await page.addInitScript(() => {
      const state = window as Window & { pdfHubLayoutShifts?: number[] };
      state.pdfHubLayoutShifts = [];
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const shift = entry as PerformanceEntry & { hadRecentInput: boolean; value: number };
          if (!shift.hadRecentInput) state.pdfHubLayoutShifts?.push(shift.value);
        }
      }).observe({ type: 'layout-shift', buffered: true });
    });

    await page.goto('/pdf-tools', { waitUntil: 'networkidle' });
    await expect(page.getByRole('main').getByRole('heading', { level: 1 })).toBeVisible();
    await page.evaluate(async () => {
      await document.fonts.ready;
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    });
    const shifts = await page.evaluate(
      () => (window as Window & { pdfHubLayoutShifts?: number[] }).pdfHubLayoutShifts,
    );
    if (!shifts) throw new Error('Layout-shift observer did not initialize');
    const total = shifts.reduce((sum, value) => sum + value, 0);
    console.log(`PDF_HUB_LAYOUT_SHIFT ${viewport.width} ${total}`);
    expect(total).toBeLessThanOrEqual(0.1);

    const mergeLink = page
      .getByRole('main')
      .getByRole('link')
      .and(page.locator('a[href="/pdf-tools/merge/merge-pdf"]'));
    await expect(mergeLink).toBeVisible();
    const filters = page
      .locator('main nav')
      .filter({ has: page.getByRole('button', { pressed: true }) });
    await filters.getByRole('button', { name: /تبدیل/ }).click();
    await expect(mergeLink).toHaveCount(0);
    await filters.getByRole('button', { name: /همه/ }).click();
    await expect(mergeLink).toBeVisible();
  });
}
