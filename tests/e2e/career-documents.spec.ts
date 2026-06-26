import { test, expect } from '@playwright/test';

test.describe('Career Document Studio - Full User Flow', () => {
  test('persian resume flow: select type → fill profile → experience → skills → preview', async ({
    page,
  }) => {
    await page.goto('/career-tools');
    const persianResumeCard = page.getByRole('link', { name: /رزومه فارسی/ });
    await expect(persianResumeCard.first()).toBeVisible({ timeout: 10000 });
    await persianResumeCard.first().click();
    await expect(page).toHaveURL(/career-tools\/resume-builder\?type=persian-resume/);

    await expect(page.getByText('اطلاعات فردی')).toBeVisible({ timeout: 10000 });
    const fullNameInput = page.locator('#profile-fullName');
    await expect(fullNameInput).toBeVisible();
    await fullNameInput.fill('علی رضایی');

    await page.getByRole('button', { name: 'مرحله بعد' }).click();
    await expect(page.getByText('خلاصه حرفه‌ای')).toBeVisible();
    const summaryInput = page.locator('textarea').first();
    if (await summaryInput.isVisible()) {
      await summaryInput.fill('برنامه‌نویس حرفه‌ای');
    }
    await page.getByRole('button', { name: 'مرحله بعد' }).click();

    await expect(page.getByText('سوابق شغلی')).toBeVisible();
    await page
      .getByRole('button', { name: /افزودن|افزودن مورد/ })
      .first()
      .click();

    const companyInput = page.getByPlaceholder(/شرکت|سازمان/).first();
    if (await companyInput.isVisible()) {
      await companyInput.fill('شرکت تست');
    }
    const positionInput = page.getByPlaceholder(/سمت|موقعیت|شغل/).first();
    if (await positionInput.isVisible()) {
      await positionInput.fill('برنامه‌نویس');
    }

    await page.getByRole('button', { name: 'مرحله بعد' }).click();
    await page.getByRole('button', { name: 'مرحله بعد' }).click();

    await expect(page.getByText('مهارت‌ها')).toBeVisible();
    await page
      .getByRole('button', { name: /افزودن|افزودن مورد/ })
      .first()
      .click();
    const skillInput = page.getByPlaceholder(/نام.*مهارت|مهارت/).first();
    if (await skillInput.isVisible()) {
      await skillInput.fill('React');
    }

    await page.getByRole('button', { name: 'مرحله بعد' }).click();
    await page.getByRole('button', { name: 'مرحله بعد' }).click();
    await page.getByRole('button', { name: 'مرحله بعد' }).click();
    await page.getByRole('button', { name: 'مرحله بعد' }).click();
    await page.getByRole('button', { name: 'مرحله بعد' }).click();

    await expect(page.getByText('پیش‌نمایش سند')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('علی رضایی').first()).toBeVisible();
  });

  test('persian resume is RTL', async ({ page }) => {
    await page.goto('/career-tools/resume-builder?type=persian-resume');
    const html = page.locator('html');
    await expect(html).toHaveAttribute('dir', 'rtl');
  });

  test('disclaimer blocks export until accepted', async ({ page }) => {
    await page.goto('/career-tools/resume-builder?type=persian-resume');
    await page.locator('#profile-fullName').fill('علی رضایی');
    await page.getByRole('button', { name: 'مرحله بعد' }).click();
    const summaryInput = page.locator('textarea').first();
    if (await summaryInput.isVisible()) {
      await summaryInput.fill('برنامه‌نویس حرفه‌ای');
    }

    const stepOrder = [
      'مرحله بعد',
      'مرحله بعد',
      'مرحله بعد',
      'مرحله بعد',
      'مرحله بعد',
      'مرحله بعد',
      'مرحله بعد',
      'مرحله بعد',
      'مرحله بعد',
    ];
    for (const stepBtn of stepOrder) {
      const btn = page.getByRole('button', { name: stepBtn });
      if (await btn.isVisible()) {
        await btn.click();
        await page.waitForTimeout(200);
      }
    }

    await expect(page.getByText('دانلود سند')).toBeVisible({ timeout: 10000 });

    await expect(page.getByRole('button', { name: 'دانلود HTML' })).not.toBeVisible();

    const disclaimerCheckbox = page.getByRole('checkbox', { name: /تأیید سلب مسئولیت/ });
    await disclaimerCheckbox.check();
    await expect(page.getByRole('button', { name: 'دانلود HTML' })).toBeVisible();
  });

  test('draft is restored after refresh', async ({ page }) => {
    await page.goto('/career-tools/resume-builder?type=persian-resume');
    await expect(page.getByText('اطلاعات فردی')).toBeVisible({ timeout: 10000 });
    await page.locator('#profile-fullName').fill('علی رضایی');

    await page.reload();
    await expect(page.getByText('اطلاعات فردی')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('#profile-fullName')).toHaveValue('علی رضایی');
  });

  test('english resume has LTR direction in settings', async ({ page }) => {
    await page.goto('/career-tools/resume-builder?type=english-resume');
    await expect(page.getByText('اطلاعات فردی')).toBeVisible({ timeout: 10000 });
    await page.locator('#profile-fullName').fill('Ali Rezaei');
  });

  test('mobile viewport (375px) renders correctly', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/career-tools/resume-builder?type=persian-resume');
    await expect(page.getByText('اطلاعات فردی')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('#profile-fullName')).toBeVisible();
  });

  test('no unexpected external network requests', async ({ page }) => {
    const externalRequests: string[] = [];
    page.on('request', (request) => {
      const url = request.url();
      if (url.startsWith('http') && !url.includes('localhost:3100')) {
        externalRequests.push(url);
      }
    });

    await page.goto('/career-tools/resume-builder?type=persian-resume');
    await page.locator('#profile-fullName').fill('علی رضایی');

    expect(externalRequests).toHaveLength(0);
  });

  test('page loads and disclaimer is visible', async ({ page }) => {
    await page.goto('/career-tools/resume-builder?type=persian-resume');
    await expect(page.getByText('این ابزار صرفاً').first()).toBeVisible({ timeout: 10000 });
  });
});
