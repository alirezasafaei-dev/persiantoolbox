import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const routes = [
  '/',
  '/loan',
  '/salary',
  '/date-tools',
  '/pdf-tools/merge/merge-pdf',
  '/image-tools',
  '/offline',
];

routes.forEach((route) => {
  test(`a11y serious/critical violations: ${route}`, async ({ page }) => {
    await page.goto(route);
    await page.waitForLoadState('networkidle');

    const results = await new AxeBuilder({ page }).analyze();
    const serious = results.violations.filter((v) =>
      ['serious', 'critical'].includes((v.impact ?? '').toLowerCase()),
    );

    expect(serious, `Serious/critical a11y issues on ${route}`).toHaveLength(0);
  });
});
