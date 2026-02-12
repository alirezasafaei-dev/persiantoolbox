import { test, expect } from '@playwright/test';

test.describe('Tool flows', () => {
  test('salary calculator should render form and calculate action', async ({ page }) => {
    await page.goto('/salary');

    await expect(
      page.getByRole('heading', { name: 'محاسبه‌گر حقوق و دستمزد پیشرفته' }),
    ).toBeVisible();
    await expect(page.getByRole('button', { name: 'محاسبه مجدد' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'حقوق پایه (تومان)' })).toBeVisible();
  });

  test('date tools conversion should update Gregorian output', async ({ page }) => {
    await page.goto('/date-tools');
    await page.waitForLoadState('networkidle');

    const day = page.getByRole('combobox', { name: 'تاریخ ورودی - روز' }).first();
    const month = page.getByRole('combobox', { name: 'تاریخ ورودی - ماه' }).first();
    const year = page.getByRole('textbox', { name: 'تاریخ ورودی - سال' }).first();
    const gregOutput = page.getByRole('textbox', { name: 'خروجی میلادی' }).first();

    await day.selectOption('1');
    await month.selectOption('1');
    await year.fill('1403');

    await expect(gregOutput).toHaveValue(/\d{4}\/\d{2}\/\d{2}/);
  });

  test('pdf compress page should render primary action', async ({ page }) => {
    await page.goto('/pdf-tools/compress/compress-pdf');
    await expect(page.getByRole('button', { name: 'فشرده سازی PDF' })).toBeVisible();
    await expect(page.locator('#compress-pdf-file')).toBeVisible();
  });

  test('pdf split page should render primary action', async ({ page }) => {
    await page.goto('/pdf-tools/split/split-pdf');
    await expect(page.getByRole('button', { name: 'تقسیم صفحات' })).toBeVisible();
    await expect(page.locator('#split-pdf-file')).toBeVisible();
  });

  test('pdf extract pages page should render primary action', async ({ page }) => {
    await page.goto('/pdf-tools/extract/extract-pages');
    await expect(page.getByRole('button', { name: 'استخراج صفحات' })).toBeVisible();
    await expect(page.locator('#extract-pages-file')).toBeVisible();
  });

  test('pdf delete pages page should render primary action', async ({ page }) => {
    await page.goto('/pdf-tools/edit/delete-pages');
    await expect(page.getByRole('button', { name: 'حذف صفحات' })).toBeVisible();
    await expect(page.locator('#delete-pages-file')).toBeVisible();
  });

  test('pdf rotate pages page should render primary action', async ({ page }) => {
    await page.goto('/pdf-tools/edit/rotate-pages');
    await expect(page.getByRole('button', { name: 'چرخش صفحات' })).toBeVisible();
    await expect(page.locator('#rotate-pages-file')).toBeVisible();
  });

  test('pdf reorder pages page should render primary action', async ({ page }) => {
    await page.goto('/pdf-tools/edit/reorder-pages');
    await expect(page.getByRole('button', { name: 'جابجایی صفحات' })).toBeVisible();
    await expect(page.locator('#reorder-pages-file')).toBeVisible();
  });

  test('pdf merge page should render primary action', async ({ page }) => {
    await page.goto('/pdf-tools/merge/merge-pdf');
    await expect(page.getByRole('button', { name: 'ادغام PDF' })).toBeVisible();
    await expect(page.locator('#merge-pdf-files')).toBeVisible();
  });

  test('pdf to image page should render primary action', async ({ page }) => {
    await page.goto('/pdf-tools/convert/pdf-to-image');
    await expect(page.getByRole('button', { name: 'تبدیل به تصویر' })).toBeVisible();
    await expect(page.locator('#pdf-to-image-file')).toBeVisible();
  });

  test('image to pdf page should render primary action', async ({ page }) => {
    await page.goto('/pdf-tools/convert/image-to-pdf');
    await expect(page.getByRole('button', { name: 'تبدیل به PDF' })).toBeVisible();
    await expect(page.locator('#image-to-pdf-files')).toBeVisible();
  });
});
