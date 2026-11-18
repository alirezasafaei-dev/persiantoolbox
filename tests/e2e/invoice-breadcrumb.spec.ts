import { test, expect } from '@playwright/test';

for (const width of [1440, 390]) {
  test(`invoice navigation has one owner at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/tools/invoice-generator');
    const nav = page.getByRole('navigation', { name: 'مسیر ناوبری' });
    await expect(nav).toHaveCount(1);
    await expect(nav.getByRole('link', { name: 'خانه', exact: true })).toHaveCount(1);
    await expect(nav.getByRole('link', { name: 'ابزارهای مالی', exact: true })).toHaveAttribute(
      'href',
      '/tools',
    );
    await expect(nav.locator('[aria-current="page"]')).toContainText('فاکتور');
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
    const breadcrumbs = await page
      .locator('script[type="application/ld+json"]')
      .evaluateAll((nodes) => {
        const collect = (node: unknown): unknown[] => {
          if (!node || typeof node !== 'object') return [];
          const value = node as Record<string, unknown>;
          return [
            ...(value['@type'] === 'BreadcrumbList' ? [value] : []),
            ...(Array.isArray(value['@graph']) ? value['@graph'].flatMap(collect) : []),
          ];
        };
        return nodes.flatMap((node) => collect(JSON.parse(node.textContent ?? '{}')));
      });
    expect(breadcrumbs).toHaveLength(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)).toBe(
      false,
    );
  });
}
