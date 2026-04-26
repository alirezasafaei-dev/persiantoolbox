import { test, expect, type Page } from '@playwright/test';

async function waitForSalaryPageReady(page: Page) {
  const salaryStatus = page.getByTestId('salary-laws-status');
  await expect(salaryStatus).toBeVisible();
  const modeSwitcher = page.getByTestId('salary-mode-switcher');
  await expect(modeSwitcher).toBeVisible();
  await expect(modeSwitcher).toHaveAttribute('data-client-ready', 'true');
  await page.waitForTimeout(300);
}

function salaryResultRow(page: Page, label: string) {
  return page
    .locator('div')
    .filter({ hasText: new RegExp(`^${label}:`) })
    .first();
}

test.describe('Tool flows', () => {
  test('salary calculator should render form and calculate action', async ({ page }) => {
    await page.goto('/salary');

    await expect(
      page.getByRole('heading', { name: 'محاسبه‌گر حقوق و دستمزد پیشرفته' }),
    ).toBeVisible();
    await expect(page.getByRole('button', { name: 'محاسبه مجدد' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'حقوق پایه (تومان)' })).toBeVisible();
  });

  test('salary minimum wage flow should reflect 1405 baseline values', async ({ page }) => {
    await page.goto('/salary?mode=minimum-wage');
    await waitForSalaryPageReady(page);

    await expect(page.getByText(/قوانین سال/)).toContainText('۱٬۴۰۵');
    await expect(page.locator('[data-mode="minimum-wage"]')).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await expect(page.getByRole('textbox', { name: 'حقوق پایه (تومان)' })).toBeHidden();

    await expect(page.getByRole('heading', { name: 'نتیجه محاسبه حداقل دستمزد' })).toBeVisible();
    await expect(salaryResultRow(page, 'حقوق پایه')).toContainText('۱۵٬۰۶۶٬۹۰۴');
    await expect(salaryResultRow(page, 'کمک هزینه مسکن')).toContainText('۳٬۰۰۰٬۰۰۰');
    await expect(salaryResultRow(page, 'کمک هزینه غذا')).toContainText('۲٬۲۰۰٬۰۰۰');
    await expect(salaryResultRow(page, 'حق اولاد')).toContainText('۰');
    await expect(salaryResultRow(page, 'حق تاهل')).toContainText('۰');
    await expect(salaryResultRow(page, 'پایه سنوات')).toContainText('۰');
    await expect(salaryResultRow(page, 'مجموع حقوق ناخالص')).toContainText('۲۰٬۲۶۶٬۹۰۴');
    await expect(salaryResultRow(page, 'بیمه')).toContainText('۱٬۴۱۸٬۶۸۳');
    await expect(salaryResultRow(page, 'حقوق خالص')).toContainText('۱۸٬۸۴۸٬۲۲۱');
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
