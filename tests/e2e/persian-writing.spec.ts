import { test, expect } from '@playwright/test';

const SAMPLE_TEXT =
  'سلام يك متن تستي است  كه  داراي  مشكلات  نگارشي  است. آيا  مي‌توانيد  آن  را  اصلاح  كنيد؟';

test.describe('Persian Writing Studio - Full User Flow', () => {
  test('paste text → analyze → verify cleaned output', async ({ page }) => {
    await page.goto('/writing-tools/persian-writing-studio');
    await expect(page.getByText('ویرایشگر فارسی پیشرفته')).toBeVisible({ timeout: 10000 });

    const textarea = page.locator('#persian-input');
    await expect(textarea).toBeVisible();
    await textarea.fill(SAMPLE_TEXT);

    const analyzeBtn = page.getByRole('button', { name: /تحلیل و پاک‌سازی/ });
    await expect(analyzeBtn).toBeEnabled();
    await analyzeBtn.click();

    await expect(page.getByText('متن پاک‌سازی‌شده')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('موارد شناسایی‌شده')).toBeVisible();

    const cleanedArea = page.locator('.whitespace-pre-wrap');
    await expect(cleanedArea).toBeVisible();
    const cleanedText = await cleanedArea.textContent();
    expect(cleanedText).toContain('ی');
    expect(cleanedText).toContain('ک');
  });

  test('issue counts appear after analysis', async ({ page }) => {
    await page.goto('/writing-tools/persian-writing-studio');
    await page.locator('#persian-input').fill(SAMPLE_TEXT);
    await page.getByRole('button', { name: /تحلیل و پاک‌سازی/ }).click();
    await expect(page.getByText('موارد شناسایی‌شده')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('حروف عربی').first()).toBeVisible();
  });

  test('cleaned text has Persian ی instead of Arabic ي', async ({ page }) => {
    await page.goto('/writing-tools/persian-writing-studio');
    await page.locator('#persian-input').fill(SAMPLE_TEXT);
    await page.getByRole('button', { name: /تحلیل و پاک‌سازی/ }).click();
    await expect(page.getByText('متن پاک‌سازی‌شده')).toBeVisible({ timeout: 10000 });

    const cleanedArea = page.locator('.whitespace-pre-wrap');
    const cleanedText = await cleanedArea.textContent();
    expect(cleanedText).not.toContain('ي');
    expect(cleanedText).toContain('ی');
  });

  test('extra spaces are removed in output', async ({ page }) => {
    await page.goto('/writing-tools/persian-writing-studio');
    await page.locator('#persian-input').fill(SAMPLE_TEXT);
    await page.getByRole('button', { name: /تحلیل و پاک‌سازی/ }).click();
    await expect(page.getByText('متن پاک‌سازی‌شده')).toBeVisible({ timeout: 10000 });

    const cleanedArea = page.locator('.whitespace-pre-wrap');
    const cleanedText = await cleanedArea.textContent();
    expect(cleanedText).not.toMatch(/ {2}/);
  });

  test('URLs remain unchanged in output', async ({ page }) => {
    await page.goto('/writing-tools/persian-writing-studio');
    await page
      .locator('#persian-input')
      .fill('متن test يك سايت است https://example.com لطفا بازديد كنيد.');
    await page.getByRole('button', { name: /تحلیل و پاک‌سازی/ }).click();
    await expect(page.getByText('متن پاک‌سازی‌شده')).toBeVisible({ timeout: 10000 });

    const cleanedArea = page.locator('.whitespace-pre-wrap');
    const cleanedText = await cleanedArea.textContent();
    expect(cleanedText).toContain('https://example.com');
  });

  test('emails remain unchanged in output', async ({ page }) => {
    await page.goto('/writing-tools/persian-writing-studio');
    await page.locator('#persian-input').fill('ايميل من test@example.com است لطفا تماس بگيريد.');
    await page.getByRole('button', { name: /تحلیل و پاک‌سازی/ }).click();
    await expect(page.getByText('متن پاک‌سازی‌شده')).toBeVisible({ timeout: 10000 });

    const cleanedArea = page.locator('.whitespace-pre-wrap');
    const cleanedText = await cleanedArea.textContent();
    expect(cleanedText).toContain('test@example.com');
  });

  test('copy output button works', async ({ page }) => {
    await page.goto('/writing-tools/persian-writing-studio');
    await page.locator('#persian-input').fill(SAMPLE_TEXT);
    await page.getByRole('button', { name: /تحلیل و پاک‌سازی/ }).click();
    await expect(page.getByText('متن پاک‌سازی‌شده')).toBeVisible({ timeout: 10000 });

    const copyBtn = page.getByRole('button', { name: 'کپی' });
    await expect(copyBtn).toBeVisible();
    await copyBtn.click();
    await expect(page.getByRole('button', { name: /کپی شد/ })).toBeVisible({ timeout: 5000 });
  });

  test('TXT download button exists', async ({ page }) => {
    await page.goto('/writing-tools/persian-writing-studio');
    await page.locator('#persian-input').fill(SAMPLE_TEXT);
    await page.getByRole('button', { name: /تحلیل و پاک‌سازی/ }).click();
    await expect(page.getByText('متن پاک‌سازی‌شده')).toBeVisible({ timeout: 10000 });

    await expect(page.getByRole('button', { name: /دانلود TXT/ })).toBeVisible();
  });

  test('draft is restored after refresh', async ({ page }) => {
    await page.goto('/writing-tools/persian-writing-studio');
    await expect(page.locator('#persian-input')).toBeVisible({ timeout: 10000 });
    await page.locator('#persian-input').fill(SAMPLE_TEXT);
    await page.waitForTimeout(3000);

    await page.reload();
    await expect(page.locator('#persian-input')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('#persian-input')).toHaveValue(SAMPLE_TEXT);
  });

  test('mobile viewport (375px) renders correctly', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/writing-tools/persian-writing-studio');
    await expect(page.getByText('ویرایشگر فارسی پیشرفته')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('#persian-input')).toBeVisible();
  });

  test('RTL layout is applied', async ({ page }) => {
    await page.goto('/writing-tools/persian-writing-studio');
    const html = page.locator('html');
    await expect(html).toHaveAttribute('dir', 'rtl');
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

    await page.goto('/writing-tools/persian-writing-studio');
    await page.locator('#persian-input').fill(SAMPLE_TEXT);
    await page.getByRole('button', { name: /تحلیل و پاک‌سازی/ }).click();
    await expect(page.getByText('متن پاک‌سازی‌شده')).toBeVisible({ timeout: 10000 });

    expect(externalRequests).toHaveLength(0);
  });

  test('analyze button is disabled when input is empty', async ({ page }) => {
    await page.goto('/writing-tools/persian-writing-studio');
    const analyzeBtn = page.getByRole('button', { name: /تحلیل و پاک‌سازی/ });
    await expect(analyzeBtn).toBeVisible({ timeout: 10000 });
    await expect(analyzeBtn).toBeDisabled();
  });

  test('stats section shows character and word counts', async ({ page }) => {
    await page.goto('/writing-tools/persian-writing-studio');
    await page.locator('#persian-input').fill(SAMPLE_TEXT);
    await page.getByRole('button', { name: /تحلیل و پاک‌سازی/ }).click();
    await expect(page.getByText('آمار متن')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('کاراکتر:').first()).toBeVisible();
    await expect(page.getByText('کلمه:').first()).toBeVisible();
    await expect(page.getByText('جمله:').first()).toBeVisible();
  });

  test('reset button clears input', async ({ page }) => {
    await page.goto('/writing-tools/persian-writing-studio');
    await page.locator('#persian-input').fill(SAMPLE_TEXT);
    const resetBtn = page.getByRole('button', { name: /بازنشانی/ });
    await expect(resetBtn).toBeVisible({ timeout: 10000 });
    await resetBtn.click();
    await expect(page.locator('#persian-input')).toHaveValue('');
  });
});
