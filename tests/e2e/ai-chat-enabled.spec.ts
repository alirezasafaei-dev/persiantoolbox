import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

// This suite uses only browser-level mocked responses. It must never call a real
// Cloudflare endpoint or require an AI secret in the test runner.
test.describe('Persian AI chat with rollout flag enabled (mock provider)', () => {
  test.skip(
    process.env['AI_E2E_ENABLED_MOCK'] !== 'true',
    'Only run in isolated local test with mock provider and feature flags enabled.',
  );
  test.use({ viewport: { width: 375, height: 667 }, serviceWorkers: 'block' });

  test('submits Persian messages, displays replies, handles quota and resets', async ({ page }) => {
    const seen: Array<Array<{ role: string; content: string }>> = [];
    let count = 0;
    await page.route('**/api/ai/chat', async (route) => {
      const body = route.request().postDataJSON() as {
        messages: Array<{ role: string; content: string }>;
      };
      seen.push(body.messages);
      count += 1;
      await route.fulfill({
        status: count === 1 ? 200 : 429,
        contentType: 'application/json',
        body:
          count === 1
            ? JSON.stringify({ reply: 'سلام! می‌توانم به سؤال‌هایت به فارسی پاسخ بدهم.' })
            : JSON.stringify({ error: 'سهمیه رایگان فعلاً تمام شده است.' }),
      });
    });

    await page.goto('/ai/chat', { waitUntil: 'networkidle' });
    const input = page.getByLabel('پیام شما');
    await expect(input).toBeEnabled();
    await input.fill('سلام، می‌توانی فارسی پاسخ بدهی؟');
    await expect(page.getByRole('button', { name: 'ارسال پیام' })).toBeEnabled();
    await page.getByRole('button', { name: 'ارسال پیام' }).click();
    await expect(page.getByText('سلام! می‌توانم به سؤال‌هایت به فارسی پاسخ بدهم.')).toBeVisible();

    await input.fill('ممنون؛ یک مثال بزن');
    await page.getByRole('button', { name: 'ارسال پیام' }).click();
    await expect(page.locator('form [role="alert"]')).toContainText('سهمیه رایگان');
    await expect(input).toHaveValue('ممنون؛ یک مثال بزن');

    expect(seen).toHaveLength(2);
    expect(seen[0]?.[0]?.role).toBe('user');
    expect(seen[1]?.map((message) => message.role)).toEqual(['user', 'assistant', 'user']);

    await page.getByRole('button', { name: 'گفت‌وگوی جدید' }).click();
    await expect(page.getByText('چه کمکی از دستم برمیاد؟')).toBeVisible();
    await expect(input).toHaveValue('');

    const overflow = await page.evaluate(() => document.body.scrollWidth - innerWidth);
    expect(overflow).toBeLessThanOrEqual(1);
    const audit = await new AxeBuilder({ page }).analyze();
    expect(
      audit.violations.filter((v) => ['serious', 'critical'].includes(v.impact ?? '')),
    ).toHaveLength(0);
  });
});
