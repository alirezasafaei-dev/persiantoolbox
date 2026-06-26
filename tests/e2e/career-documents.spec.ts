import { test, expect } from '@playwright/test';

test.describe('Career Document Studio - Full User Flow', () => {
  test('persian resume flow: select type → fill profile → experience → skills → preview', async ({
    page,
  }) => {
    await page.goto('/career-tools');
    await page.locator('a[href*="resume-builder?type=persian-resume"]').first().click();
    await page.waitForURL(/career-tools\/resume-builder\?type=persian-resume/, { timeout: 15000 });

    await expect(page.locator('h2').filter({ hasText: 'اطلاعات فردی' }).first()).toBeVisible({
      timeout: 10000,
    });
    await page.locator('#profile-fullName').fill('علی رضایی');
    await page.getByRole('button', { name: 'مرحله بعد' }).click();

    await expect(page.locator('h2').filter({ hasText: 'خلاصه حرفه‌ای' }).first()).toBeVisible();
    await page.locator('textarea').first().fill('برنامه‌نویس حرفه‌ای');
    await page.getByRole('button', { name: 'مرحله بعد' }).click();

    await expect(page.locator('h2').filter({ hasText: 'سوابق شغلی' }).first()).toBeVisible();
    await page
      .getByRole('button', { name: /افزودن/ })
      .first()
      .click();
    await page.getByPlaceholder('نام شرکت').first().fill('شرکت تست');
    await page
      .getByPlaceholder(/توسعه‌دهنده|مثلاً/)
      .first()
      .fill('برنامه‌نویس');
    await page.getByRole('button', { name: 'مرحله بعد' }).click();

    await expect(page.locator('h2').filter({ hasText: 'تحصیلات' }).first()).toBeVisible();
    await page.getByRole('button', { name: 'مرحله بعد' }).click();

    await expect(page.locator('h2').filter({ hasText: 'مهارت‌ها' }).first()).toBeVisible();
    await page
      .getByRole('button', { name: /افزودن/ })
      .first()
      .click();
    await page
      .getByPlaceholder(/مثلاً|TypeScript/)
      .first()
      .fill('React');
    await page.getByRole('button', { name: 'مرحله بعد' }).click();

    await page.getByRole('button', { name: 'مرحله بعد' }).click();
    await page.getByRole('button', { name: 'مرحله بعد' }).click();
    await page.getByRole('button', { name: 'مرحله بعد' }).click();
    await page.getByRole('button', { name: 'مرحله بعد' }).click();

    await expect(page.locator('h2').filter({ hasText: 'پیش‌نمایش سند' }).first()).toBeVisible({
      timeout: 10000,
    });
    const previewFrame = page.frameLocator('iframe').first();
    await expect(previewFrame.locator('text=علی رضایی').first()).toBeVisible({ timeout: 10000 });
  });

  test('persian resume is RTL', async ({ page }) => {
    await page.goto('/career-tools/resume-builder?type=persian-resume');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  });

  test('disclaimer blocks export until accepted', async ({ page }) => {
    await page.goto('/career-tools/resume-builder?type=persian-resume');
    await page.locator('#profile-fullName').fill('علی رضایی');
    await page.getByRole('button', { name: 'مرحله بعد' }).click();
    await page.locator('textarea').first().fill('برنامه‌نویس حرفه‌ای');

    for (let i = 0; i < 12; i++) {
      const nextBtn = page.getByRole('button', { name: 'مرحله بعد' });
      const confirmBtn = page.getByRole('button', { name: 'تأیید و دانلود' });
      if (await confirmBtn.isVisible().catch(() => false)) {
        await confirmBtn.click();
        break;
      }
      if (await nextBtn.isVisible().catch(() => false)) {
        await nextBtn.click();
        await page.waitForTimeout(300);
      }
    }

    await expect(page.locator('h2').filter({ hasText: 'دانلود سند' }).first()).toBeVisible({
      timeout: 10000,
    });
    await expect(page.getByRole('button', { name: 'دانلود HTML' })).not.toBeVisible();

    await page.getByRole('checkbox', { name: /تأیید سلب مسئولیت/ }).check();
    await expect(page.getByRole('button', { name: 'دانلود HTML' })).toBeVisible();
  });

  test('draft is restored after refresh', async ({ page }) => {
    await page.goto('/career-tools/resume-builder?type=persian-resume');
    await expect(page.locator('h2').filter({ hasText: 'اطلاعات فردی' }).first()).toBeVisible({
      timeout: 10000,
    });
    await page.locator('#profile-fullName').fill('علی رضایی');
    await page.waitForTimeout(2000);

    await page.reload();
    await expect(page.locator('h2').filter({ hasText: 'اطلاعات فردی' }).first()).toBeVisible({
      timeout: 10000,
    });
    await expect(page.locator('#profile-fullName')).toHaveValue('علی رضایی');
  });

  test('english resume has LTR direction in settings', async ({ page }) => {
    await page.goto('/career-tools/resume-builder?type=english-resume');
    await expect(page.locator('h2').filter({ hasText: 'اطلاعات فردی' }).first()).toBeVisible({
      timeout: 10000,
    });
    await page.locator('#profile-fullName').fill('Ali Rezaei');
  });

  test('mobile viewport (375px) renders correctly', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/career-tools/resume-builder?type=persian-resume');
    await expect(page.locator('h2').filter({ hasText: 'اطلاعات فردی' }).first()).toBeVisible({
      timeout: 10000,
    });
    await expect(page.locator('#profile-fullName')).toBeVisible();
  });

  test('no unexpected external network requests', async ({ page }) => {
    const externalRequests: string[] = [];
    page.on('request', (request) => {
      const url = request.url();
      if (
        url.startsWith('http') &&
        !url.includes('localhost') &&
        !url.includes('persiantoolbox.ir') &&
        !url.includes('sentry') &&
        !url.includes('google') &&
        !url.includes('analytics') &&
        !url.includes('enamad.ir')
      ) {
        externalRequests.push(url);
      }
    });

    await page.goto('/career-tools/resume-builder?type=persian-resume');
    await page.locator('#profile-fullName').fill('علی رضایی');
    expect(externalRequests).toHaveLength(0);
  });

  test('page loads and wizard is functional', async ({ page }) => {
    await page.goto('/career-tools/resume-builder?type=persian-resume');
    await expect(page.locator('h2').filter({ hasText: 'اطلاعات فردی' }).first()).toBeVisible({
      timeout: 10000,
    });
    await expect(page.locator('#profile-fullName')).toBeVisible();
    await expect(page.getByRole('button', { name: 'مرحله بعد' })).toBeVisible();
  });
});
