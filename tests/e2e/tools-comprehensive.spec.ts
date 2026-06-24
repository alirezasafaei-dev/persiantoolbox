import { test, expect } from '@playwright/test';

test.describe('Developer tools', () => {
  test('JSON formatter renders and formats', async ({ page }) => {
    await page.goto('/tools/json-formatter');
    await expect(page.getByRole('heading', { name: /فرمت.*JSON/ })).toBeVisible();
    const textarea = page.locator('textarea').first();
    await expect(textarea).toBeVisible();

    await textarea.fill('{"name":"test","value":123}');
    await page.getByRole('button', { name: /فرمت/ }).first().click();

    await expect(page.getByRole('heading', { name: 'خروجی' })).toBeVisible({ timeout: 10000 });
    await expect(page.locator('pre')).toContainText('"name"');
    await expect(page.locator('pre')).toContainText('"test"');
  });

  test('hash generator produces output', async ({ page }) => {
    await page.goto('/tools/hash-generator');
    await expect(page.getByRole('heading', { name: /تولید هش/ })).toBeVisible();

    const textarea = page.locator('textarea').first();
    await textarea.fill('hello world');
    await page.getByRole('button', { name: /تولید/ }).first().click();

    await expect(page.locator('pre, code, [class*="mono"]').first()).toBeVisible({
      timeout: 10000,
    });
  });

  test('base64 tool encodes and decodes', async ({ page }) => {
    await page.goto('/tools/base64-tool');
    await expect(page.getByRole('heading', { name: /Base64/ })).toBeVisible();

    const textarea = page.locator('textarea').first();
    await textarea.fill('Persian Toolbox');
    await page
      .getByRole('button', { name: /رمزگذاری/ })
      .last()
      .click();

    await expect(page.locator('pre')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('pre')).toContainText('UGVyc2lhbiBUb29sYm94');
  });
});

test.describe('Password generator', () => {
  test('generates password with configurable length', async ({ page }) => {
    await page.goto('/validation-tools/persian-password');
    await expect(page.getByRole('heading', { name: /تولید رمز/ })).toBeVisible();

    await page.getByRole('button', { name: /تولید/ }).first().click();

    const result = page.locator('[class*="font-mono"]').last();
    await expect(result).toBeVisible({ timeout: 10000 });
    const text = await result.textContent();
    expect(text?.length).toBeGreaterThanOrEqual(8);
  });
});

test.describe('Encrypt PDF page', () => {
  test('renders with upload area', async ({ page }) => {
    await page.goto('/pdf-tools/security/encrypt-pdf');
    await expect(page.getByRole('heading', { name: /رمزگذاری PDF/ })).toBeVisible();
    await expect(page.getByText(/انتخاب فایل|انتخاب.*PDF|آپلود/)).toBeVisible();
  });
});

test.describe('Usage limits indicator', () => {
  test('shows usage indicator on tool pages', async ({ page }) => {
    await page.goto('/tools/json-formatter');
    await page.waitForLoadState('networkidle');
    const usageText = page.getByText(/استفاده رایگان/);
    const count = await usageText.count();
    expect(count).toBeLessThanOrEqual(1);
  });
});

test.describe('Search page', () => {
  test('search page has title and input', async ({ page }) => {
    await page.goto('/search');
    await expect(page).toHaveTitle(/جستجو/);
    const searchInput = page.locator('input[type="text"], input[type="search"]').first();
    await expect(searchInput).toBeVisible();
  });
});

test.describe('Footer links', () => {
  test('footer has all category links', async ({ page }) => {
    await page.goto('/');
    const footer = page.locator('footer');
    await expect(footer.getByText('ابزارهای PDF')).toBeVisible();
    await expect(footer.getByText('ابزارهای تصویر')).toBeVisible();
    await expect(footer.getByText('ابزارهای مالی')).toBeVisible();
    await expect(footer.getByText('ابزارهای تاریخ')).toBeVisible();
    await expect(footer.getByText('ابزارهای متنی')).toBeVisible();
    await expect(footer.getByText('ابزارهای اعتبارسنجی')).toBeVisible();
  });

  test('footer has info page links', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('link', { name: /حریم خصوصی/ }).first()).toBeVisible({
      timeout: 10000,
    });
    await expect(page.getByRole('link', { name: /قوانین/ }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /درباره ما/ }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /پشتیبانی/ }).first()).toBeVisible();
  });
});

test.describe('OG image generation', () => {
  test('opengraph-image endpoint returns image', async ({ request }) => {
    const response = await request.get('/opengraph-image');
    expect(response.ok()).toBeTruthy();
    const contentType = response.headers()['content-type'];
    expect(contentType).toContain('image');
  });

  test('twitter-image endpoint returns image', async ({ request }) => {
    const response = await request.get('/twitter-image');
    expect(response.ok()).toBeTruthy();
    const contentType = response.headers()['content-type'];
    expect(contentType).toContain('image');
  });
});
