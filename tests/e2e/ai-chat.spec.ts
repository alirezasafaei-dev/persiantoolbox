import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.describe('Persian AI chat', () => {
  test.use({ viewport: { width: 375, height: 667 }, serviceWorkers: 'block' });

  test('renders the disabled rollout gate in RTL on mobile without serious accessibility violations', async ({
    page,
  }) => {
    await page.goto('/ai/chat', { waitUntil: 'domcontentloaded' });

    await expect(page.locator('main [dir="rtl"]').first()).toBeVisible();
    const input = page.getByLabel('پیام شما');
    await expect(input).toBeDisabled();
    await expect(input).toHaveAttribute('dir', 'auto');
    await expect(page.getByRole('button', { name: 'ارسال پیام' })).toBeDisabled();

    const overflow = await page.evaluate(() => document.body.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(1);

    const results = await new AxeBuilder({ page }).analyze();
    const serious = results.violations.filter((violation) =>
      ['serious', 'critical'].includes((violation.impact ?? '').toLowerCase()),
    );
    expect(serious).toHaveLength(0);
  });
});
