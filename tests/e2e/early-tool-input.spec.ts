import { expect, test } from '@playwright/test';

for (const width of [390, 1440]) {
  test(`preserves early Base64 input at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    let release = () => {};
    const scripts = new Promise<void>((resolve) => {
      release = resolve;
    });
    await page.route(/\/_next\/static\/.*\.js(?:\?.*)?$/, async (route) => {
      await scripts;
      await route.continue();
    });
    try {
      await page.goto('/tools/base64-tool', { waitUntil: 'commit' });
      const input = page.getByLabel('متن مورد نظر برای رمزگذاری', { exact: true });
      const text = 'سلام React 19';
      await input.fill(text);
      release();
      const encode = page.getByRole('button', { name: 'رمزگذاری', exact: true }).last();
      await expect(encode).toBeEnabled();
      await encode.click();
      await expect(input).toHaveValue(text);
      await expect(page.locator('pre')).toHaveText(Buffer.from(text).toString('base64'));
    } finally {
      release();
    }
  });

  test(`preserves early salary values including clearing a default at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    let release = () => {};
    const scripts = new Promise<void>((resolve) => {
      release = resolve;
    });
    await page.route(/\/_next\/static\/.*\.js(?:\?.*)?$/, async (route) => {
      await scripts;
      await route.continue();
    });
    try {
      await page.goto('/salary', { waitUntil: 'commit' });
      const salary = page.getByRole('textbox', { name: 'حقوق پایه (تومان)', exact: true });
      const days = page.getByRole('textbox', { name: 'روزهای کاری', exact: true });
      const otherValues = [
        ['salary-experience', '۲.۵', '2.5'],
        ['salary-overtime', '۳.۵', '3.5'],
        ['salary-night-overtime', '۴.۵', '4.5'],
        ['salary-holiday-overtime', '۵.۵', '5.5'],
        ['salary-mission-days', '۱.۵', '1.5'],
        ['salary-children', '۲.۵', '25'],
        ['salary-insured-days', '۷۲۰.۵', '7205'],
      ] as const;
      await salary.fill('۲۰۰۰۰۰۰۰');
      await days.fill('');
      for (const [id, entered] of otherValues) {
        await page.locator(`#${id}`).fill(entered);
      }
      release();
      await expect(page.getByTestId('salary-mode-switcher')).toHaveAttribute(
        'data-client-ready',
        'true',
      );
      await expect(salary).toHaveValue('20000000');
      await expect(days).toHaveValue('');
      for (const [id, , normalized] of otherValues) {
        await expect(page.locator(`#${id}`)).toHaveValue(normalized);
      }
      // The decimal/integer normalization cases above are deliberately not all
      // valid payroll inputs. Restore ordinary values before testing calculation.
      for (const [id] of otherValues) {
        await page.locator(`#${id}`).fill('0');
      }
      await days.fill('30');
      await page.getByRole('button', { name: 'محاسبه مجدد', exact: true }).click();
      await expect(salary).toHaveValue('20000000');
      await expect(
        page.getByRole('button', { name: 'کپی حقوق ناخالص', exact: true }),
      ).toBeVisible();
      await page.getByRole('button', { name: 'بازنشانی فرم', exact: true }).click();
      await expect(salary).toHaveValue('15000000');
      await expect(days).toHaveValue('30');
    } finally {
      release();
    }
  });
}
