import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

async function openSessions(page: Page) {
  if ((page.viewportSize()?.width ?? 0) < 768)
    await page.getByRole('button', { name: 'گفت‌وگوها', exact: true }).click();
}
const markdownReply = `## پاسخ فارسی\n\nیک توضیح با **متن پررنگ** و English.\n\n- مورد اول\n- مورد دوم\n\n\`\`\`js\nconst message = "${'long-code-'.repeat(60)}";\n\`\`\`\n\n[لینک امن](https://example.com) [لینک ناامن](javascript:alert%281%29)`;

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
    await page.getByRole('button', { name: 'رد همه کوکی‌ها', exact: true }).click();
    const input = page.getByLabel('پیام شما');
    await expect(input).toBeEnabled();
    await expect(page.getByRole('button', { name: 'ارسال پیام' })).toBeDisabled();
    await input.press('Enter');
    expect(seen).toHaveLength(0);
    await input.fill('آ'.repeat(1801));
    await expect(input).toHaveValue('آ'.repeat(1800));
    await expect(page.getByRole('button', { name: 'ارسال پیام' })).toBeEnabled();
    await page.getByRole('button', { name: 'ارسال پیام' }).click();
    await expect(
      page
        .locator('.ai-transcript')
        .getByText('سلام! می‌توانم به سؤال‌هایت به فارسی پاسخ بدهم.', { exact: true }),
    ).toBeVisible();

    await input.fill('ممنون؛ یک مثال بزن');
    await page.getByRole('button', { name: 'ارسال پیام' }).click();
    await expect(page.locator('form [role="alert"]')).toContainText('سهمیه یا ظرفیت سرویس');
    await expect(input).toHaveValue('ممنون؛ یک مثال بزن');

    expect(seen).toHaveLength(2);
    expect(seen[0]?.[0]?.role).toBe('user');
    expect(seen[0]?.[0]?.content).toHaveLength(1800);
    expect(seen[1]?.map((message) => message.role)).toEqual(['user', 'assistant', 'user']);

    await openSessions(page);
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

  test('organizes opt-in local history, rename, reload and deletion', async ({ page }) => {
    await page.route('**/api/ai/chat', (route) =>
      route.fulfill({ json: { reply: 'پاسخ آزمون محلی' } }),
    );
    await page.goto('/ai/chat');
    await page.getByRole('button', { name: 'رد همه کوکی‌ها', exact: true }).click();
    const input = page.getByLabel('پیام شما');
    await expect(input).toBeEnabled();
    await input.fill('گفت‌وگوی اول');
    await input.press('Enter');
    await expect(
      page.locator('.ai-transcript').getByText('پاسخ آزمون محلی', { exact: true }),
    ).toBeVisible();
    expect(await page.evaluate(() => localStorage.getItem('pt-ai-conversations-v1'))).toBeNull();
    await openSessions(page);
    await page.getByRole('checkbox', { name: 'ذخیره تاریخچه در این مرورگر' }).check();
    await page.getByRole('button', { name: 'گفت‌وگوی جدید' }).click();
    await input.fill('پیش‌نویس دوم');
    await page.reload();
    await expect(input).toHaveValue('پیش‌نویس دوم');
    await openSessions(page);
    await page.getByRole('button', { name: 'گفت‌وگوی اول', exact: true }).click();
    await expect(
      page.locator('.ai-transcript').getByText('پاسخ آزمون محلی', { exact: true }),
    ).toBeVisible();
    await page.getByRole('button', { name: 'تغییر نام' }).click();
    await page.getByLabel('نام گفت‌وگو').fill('نام دلخواه');
    await page.getByRole('button', { name: 'ذخیره نام' }).click();
    await page.getByRole('button', { name: 'حذف گفت‌وگو' }).click();
    await page.getByRole('button', { name: 'بله، پاک شود' }).click();
    await expect(input).toHaveValue('پیش‌نویس دوم');
    await openSessions(page);
    await page.getByRole('button', { name: 'پاک‌کردن تاریخچه' }).click();
    await page.getByRole('button', { name: 'بله، پاک شود' }).click();
    await expect(input).toHaveValue('');
    expect(await page.evaluate(() => localStorage.getItem('pt-ai-conversations-v1'))).toBeNull();
  });

  test('supports Markdown, clipboard, failure recovery and explicit stop', async ({
    page,
    context,
  }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    let calls = 0;
    let release: (() => void) | undefined;
    const delayed = new Promise<void>((resolve) => {
      release = resolve;
    });
    await page.route('**/api/ai/chat', async (route) => {
      calls++;
      if (calls === 1) await route.fulfill({ json: { reply: markdownReply } });
      else if (calls === 2)
        await route.fulfill({ status: 503, json: { error: 'private upstream detail' } });
      else
        await delayed
          .then(() => route.fulfill({ json: { reply: 'late response' } }))
          .catch(() => {});
    });
    await page.goto('/ai/chat');
    await page.getByRole('button', { name: 'رد همه کوکی‌ها', exact: true }).click();
    const input = page.getByLabel('پیام شما');
    await expect(input).toBeEnabled();
    await input.fill('فارسی English');
    await input.press('Enter');
    await expect(page.getByRole('heading', { name: 'پاسخ فارسی' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'لینک ناامن' })).toHaveCount(0);
    await page.getByRole('button', { name: 'کپی پاسخ' }).click();
    await expect
      .poll(() =>
        page.evaluate(() =>
          navigator.clipboard.readText().then((text) => text.replace(/\r\n/g, '\n')),
        ),
      )
      .toBe(markdownReply);
    await page.getByRole('button', { name: 'کپی کد' }).click();
    await expect
      .poll(() =>
        page.evaluate(() =>
          navigator.clipboard.readText().then((text) => text.replace(/\r\n/g, '\n')),
        ),
      )
      .toContain('const message');
    await input.fill('خطای آزمایشی');
    await input.press('Enter');
    await expect(page.locator('.ai-app').getByRole('alert')).toBeVisible();
    await expect(input).toHaveValue('خطای آزمایشی');
    await expect(page.getByText('private upstream detail')).toHaveCount(0);
    await input.press('Enter');
    await expect(page.getByRole('button', { name: 'توقف پاسخ' })).toBeVisible();
    await page.getByRole('button', { name: 'توقف پاسخ' }).click();
    await expect(input).toHaveValue('خطای آزمایشی');
    release?.();
    await page.waitForTimeout(200);
    await expect(page.getByText('late response')).toHaveCount(0);
    expect(calls).toBe(3);
    await page.screenshot({
      style: 'nextjs-portal { display: none; }',
      path: 'tmp/ai-evidence/candidate-mobile-response.png',
    });
  });

  for (const theme of ['light', 'dark']) {
    test(`width matrix, long code and accessibility in ${theme}`, async ({ page }) => {
      test.setTimeout(180_000);
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      await page.addInitScript((value) => localStorage.setItem('theme', value), theme);
      await page.route('**/api/ai/chat', (route) =>
        route.fulfill({ json: { reply: markdownReply } }),
      );
      await page.goto('/ai/chat');
      await page.getByRole('button', { name: 'رد همه کوکی‌ها', exact: true }).click();
      const input = page.getByLabel('پیام شما');
      await expect(input).toBeEnabled();
      await input.fill('نمونه فارسی و کد');
      await input.press('Enter');
      await expect(page.getByRole('heading', { name: 'پاسخ فارسی' })).toBeVisible();
      for (const width of [320, 360, 375, 390, 430, 768, 1024, 1280, 1440, 1920]) {
        await page.setViewportSize({ width, height: width < 768 ? 844 : 900 });
        await expect
          .poll(() => page.evaluate(() => document.body.scrollWidth - innerWidth))
          .toBeLessThanOrEqual(1);
        await expect(page.getByRole('button', { name: 'ارسال پیام' })).toBeVisible();
        const composer = await page.locator('.ai-composer').boundingBox();
        expect((composer?.y ?? 0) + (composer?.height ?? 0)).toBeLessThanOrEqual(
          page.viewportSize()!.height + 1,
        );
      }
      await page.screenshot({
        style: 'nextjs-portal { display: none; }',
        path: `tmp/ai-evidence/candidate-desktop-${theme}.png`,
      });
      const audit = await new AxeBuilder({ page }).analyze();
      expect(
        audit.violations.filter((v) => ['serious', 'critical'].includes(v.impact ?? '')),
      ).toEqual([]);
      await page.setViewportSize({ width: 390, height: 500 });
      await openSessions(page);
      const dialog = page.getByRole('dialog', { name: 'فهرست گفت‌وگوها' });
      await expect(dialog).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(dialog).not.toBeVisible();
      await expect(page.getByRole('button', { name: 'گفت‌وگوها', exact: true })).toBeFocused();
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await expect(page.getByRole('button', { name: 'ارسال پیام' })).toBeVisible();
      await page.setViewportSize({ width: 390, height: 844 });
      await page.screenshot({
        style: 'nextjs-portal { display: none; }',
        path: `tmp/ai-evidence/candidate-mobile-${theme}.png`,
      });
      expect(errors).toEqual([]);
    });
  }
});
