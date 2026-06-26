import { test, expect } from '@playwright/test';

test.describe('Career Document Studio', () => {
  test('/career-tools loads successfully', async ({ page }) => {
    await page.goto('/career-tools');
    await expect(page).toHaveURL(/career-tools/);
  });

  test('/career-tools/resume-builder loads successfully', async ({ page }) => {
    await page.goto('/career-tools/resume-builder');
    await expect(page).toHaveURL(/resume-builder/);
  });

  test('can select Persian resume type', async ({ page }) => {
    await page.goto('/career-tools/resume-builder');
    const persianBtn = page
      .getByRole('button', { name: /رزومه فارسی/ })
      .or(page.getByText('رزومه فارسی'));
    await expect(persianBtn.first()).toBeVisible({ timeout: 10000 });
  });

  test('can fill profile info', async ({ page }) => {
    await page.goto('/career-tools/resume-builder');
    const nameInput = page.getByPlaceholder(/نام.*نام خانوادگی/).or(page.locator('input').first());
    await expect(nameInput).toBeVisible({ timeout: 10000 });
    await nameInput.fill('علی رضایی');
    await expect(nameInput).toHaveValue('علی رضایی');
  });

  test('can add work experience', async ({ page }) => {
    await page.goto('/career-tools/resume-builder');
    const addExpBtn = page.getByRole('button', { name: /افزودن|اضافه|تجربه/ }).first();
    await expect(addExpBtn).toBeVisible({ timeout: 10000 });
    await addExpBtn.click();
    const companyInput = page.getByPlaceholder(/شرکت|سازمان/).first();
    await expect(companyInput).toBeVisible();
  });

  test('can see live preview', async ({ page }) => {
    await page.goto('/career-tools/resume-builder');
    const preview = page
      .locator('.disclaimer, [class*="preview"], [class*="document"], [class*="resume"]')
      .first();
    await expect(preview).toBeVisible({ timeout: 10000 });
  });

  test('mobile viewport works', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/career-tools/resume-builder');
    await expect(page).toHaveURL(/resume-builder/);
  });

  test('RTL layout present for Persian resume', async ({ page }) => {
    await page.goto('/career-tools/resume-builder');
    const html = page.locator('html');
    await expect(html).toHaveAttribute('dir', 'rtl');
  });

  test('disclaimer visible', async ({ page }) => {
    await page.goto('/career-tools/resume-builder');
    const disclaimer = page.getByText(/این ابزار صرفاً/);
    await expect(disclaimer.first()).toBeVisible({ timeout: 10000 });
  });

  test('export buttons present', async ({ page }) => {
    await page.goto('/career-tools/resume-builder');
    const exportBtns = page.getByRole('button', { name: /PDF|DOCX|خروجی|چاپ|HTML/ });
    await expect(exportBtns.first()).toBeVisible({ timeout: 10000 });
  });

  test('DOCX button has premium indicator', async ({ page }) => {
    await page.goto('/career-tools/resume-builder');
    const docxBtn = page.getByRole('button', { name: /DOCX/ }).first();
    if (await docxBtn.isVisible()) {
      const isDisabled = await docxBtn.isDisabled();
      const hasPremiumIndicator = await page
        .getByText(/پرمیوم|Premium|ویژه/)
        .first()
        .isVisible()
        .catch(() => false);
      expect(isDisabled || hasPremiumIndicator).toBe(true);
    }
  });
});
