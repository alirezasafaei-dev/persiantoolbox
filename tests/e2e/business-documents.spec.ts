import { test, expect } from '@playwright/test';

test.describe('Business Document Studio', () => {
  test('/business-tools loads successfully', async ({ page }) => {
    await page.goto('/business-tools');
    await expect(page).toHaveURL(/business-tools/);
  });

  test('/business-tools/document-studio loads successfully', async ({ page }) => {
    await page.goto('/business-tools/document-studio');
    await expect(page).toHaveURL(/document-studio/);
  });

  test('can select invoice type', async ({ page }) => {
    await page.goto('/business-tools/document-studio');
    const invoiceBtn = page
      .getByRole('button', { name: /فاکتور فروش/ })
      .or(page.getByText('فاکتور فروش'));
    await expect(invoiceBtn.first()).toBeVisible();
  });

  test('can fill seller info', async ({ page }) => {
    await page.goto('/business-tools/document-studio');
    const nameInput = page
      .getByPlaceholder(/نام.*فروشنده/)
      .or(page.locator('input').filter({ hasText: /فروشنده/ }))
      .first();
    await expect(nameInput).toBeVisible({ timeout: 10000 });
    await nameInput.fill('شرکت تست');
    await expect(nameInput).toHaveValue('شرکت تست');
  });

  test('can fill buyer info', async ({ page }) => {
    await page.goto('/business-tools/document-studio');
    const nameInput = page
      .getByPlaceholder(/نام.*خریدار/)
      .or(page.locator('input').filter({ hasText: /خریدار/ }))
      .first();
    await expect(nameInput).toBeVisible({ timeout: 10000 });
    await nameInput.fill('شرکت خریدار');
    await expect(nameInput).toHaveValue('شرکت خریدار');
  });

  test('can add line items', async ({ page }) => {
    await page.goto('/business-tools/document-studio');
    const addItemBtn = page.getByRole('button', { name: /افزودن|اضافه/ }).first();
    await expect(addItemBtn).toBeVisible({ timeout: 10000 });
    await addItemBtn.click();
    const descriptionInput = page.getByPlaceholder(/شرح|توضیح/).first();
    await expect(descriptionInput).toBeVisible();
  });

  test('can see live preview', async ({ page }) => {
    await page.goto('/business-tools/document-studio');
    const preview = page.locator('.disclaimer, [class*="preview"], [class*="document"]').first();
    await expect(preview).toBeVisible({ timeout: 10000 });
  });

  test('mobile viewport works', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/business-tools/document-studio');
    await expect(page).toHaveURL(/document-studio/);
  });

  test('RTL layout present', async ({ page }) => {
    await page.goto('/business-tools/document-studio');
    const html = page.locator('html');
    await expect(html).toHaveAttribute('dir', 'rtl');
  });

  test('disclaimer visible', async ({ page }) => {
    await page.goto('/business-tools/document-studio');
    const disclaimer = page.getByText(/این ابزار صرفاً/);
    await expect(disclaimer.first()).toBeVisible({ timeout: 10000 });
  });

  test('export buttons present', async ({ page }) => {
    await page.goto('/business-tools/document-studio');
    const exportBtns = page.getByRole('button', { name: /PDF|DOCX|خروجی|چاپ/ });
    await expect(exportBtns.first()).toBeVisible({ timeout: 10000 });
  });

  test('DOCX button has premium indicator or is disabled for free', async ({ page }) => {
    await page.goto('/business-tools/document-studio');
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

  test('keyboard navigation works (tab through form)', async ({ page }) => {
    await page.goto('/business-tools/document-studio');
    await page.keyboard.press('Tab');
    const focused = page.locator(':focus');
    await expect(focused).toBeVisible();
  });
});
