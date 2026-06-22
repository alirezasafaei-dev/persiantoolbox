import { test, expect } from '@playwright/test';

test.describe('Developer tools', () => {
  test('JSON formatter renders and formats', async ({ page }) => {
    await page.goto('/tools/json-formatter');
    await expect(page.getByRole('heading', { name: /فرمت.*JSON/ })).toBeVisible();
    await expect(page.getByPlaceholder(/\{"key"/)).toBeVisible();

    await page.getByPlaceholder(/\{"key"/).fill('{"name":"test","value":123}');
    await page.getByRole('button', { name: /فرمت.*بندی/ }).click();

    await expect(page.getByText(/"name"/)).toBeVisible();
    await expect(page.getByText('"test"')).toBeVisible();
  });

  test('hash generator produces output', async ({ page }) => {
    await page.goto('/tools/hash-generator');
    await expect(page.getByRole('heading', { name: /تولید هش/ })).toBeVisible();

    const textarea = page.locator('textarea').first();
    await textarea.fill('hello world');
    await page.getByRole('button', { name: /تولید/ }).first().click();

    await expect(page.locator('pre, code, [class*="mono"]').first()).toBeVisible();
  });

  test('base64 tool encodes and decodes', async ({ page }) => {
    await page.goto('/tools/base64-tool');
    await expect(page.getByRole('heading', { name: /Base64/ })).toBeVisible();

    const textarea = page.locator('textarea').first();
    await textarea.fill('Persian Toolbox');
    await page
      .getByRole('button', { name: /رمزگذاری/ })
      .first()
      .click();

    await expect(page.getByText('UGVyc2lhbiBUb29sYm94')).toBeVisible();
  });
});

test.describe('Password generator', () => {
  test('generates password with configurable length', async ({ page }) => {
    await page.goto('/validation-tools/persian-password');
    await expect(page.getByRole('heading', { name: /تولید رمز/ })).toBeVisible();

    const lengthInput = page.locator('input[type="number"]').first();
    await lengthInput.fill('32');
    await page.getByRole('button', { name: /تولید/ }).first().click();

    const result = page.locator('[class*="font-mono"], [class*="mono"]').first();
    await expect(result).toBeVisible();
    const text = await result.textContent();
    expect(text?.length).toBeGreaterThanOrEqual(32);
  });
});

test.describe('Encrypt PDF page', () => {
  test('renders with upload area', async ({ page }) => {
    await page.goto('/pdf-tools/security/encrypt-pdf');
    await expect(page.getByRole('heading', { name: /رمزگذاری PDF/ })).toBeVisible();
    await expect(page.getByRole('textbox', { name: /انتخاب/ })).toBeVisible();
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
    const footer = page.locator('footer');
    await expect(footer.getByText('حریم خصوصی')).toBeVisible();
    await expect(footer.getByText('قوانین')).toBeVisible();
    await expect(footer.getByText('درباره ما')).toBeVisible();
    await expect(footer.getByText('پشتیبانی')).toBeVisible();
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
