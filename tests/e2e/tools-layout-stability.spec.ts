import { expect, test } from '@playwright/test';

for (const viewport of [
  { width: 390, height: 844 },
  { width: 1440, height: 900 },
]) {
  test(`keeps initial tool-list layout stable and search functional at ${viewport.width}px`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await page.addInitScript(() => {
      const state = window as Window & { toolsLayoutShift?: number };
      state.toolsLayoutShift = 0;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const shift = entry as PerformanceEntry & { hadRecentInput: boolean; value: number };
          if (!shift.hadRecentInput)
            state.toolsLayoutShift = (state.toolsLayoutShift ?? 0) + shift.value;
        }
      }).observe({ type: 'layout-shift', buffered: true });
    });
    await page.goto('/tools', { waitUntil: 'networkidle' });
    const search = page.getByLabel('جست‌وجوی ابزار', { exact: true });
    await expect(search).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    const cls = await page.evaluate(
      () => (window as Window & { toolsLayoutShift?: number }).toolsLayoutShift,
    );
    console.log(`TOOLS_INITIAL_CLS ${viewport.width} ${cls}`);
    if (cls === undefined) throw new Error('Layout-shift observer did not initialize');
    expect(cls).toBeLessThanOrEqual(0.1);
    await search.fill('JSON');
    await expect(page.locator('main a[href="/tools/json-formatter"]').first()).toBeVisible();
  });
}
