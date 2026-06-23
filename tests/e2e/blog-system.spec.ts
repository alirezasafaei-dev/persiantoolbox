import { test, expect } from '@playwright/test';

test.describe('Blog System', () => {
  test('blog listing page loads with posts', async ({ page }) => {
    await page.goto('/blog');
    const h1 = page.locator('h1');
    await expect(h1).toContainText('مقاله‌ها');
    const articles = page.locator('article');
    const count = await articles.count();
    expect(count).toBeGreaterThanOrEqual(3);
  });

  test('blog post detail page renders content', async ({ page }) => {
    await page.goto('/blog/getting-started');
    const h1 = page.locator('h1');
    await expect(h1).toContainText('راهنمای شروع کار');
    const article = page.locator('article');
    await expect(article).toBeVisible();
  });

  test('blog category page filters posts', async ({ page }) => {
    await page.goto('/blog/category/آموزشی');
    const h1 = page.locator('h1');
    await expect(h1).toContainText('آموزشی');
    const articles = page.locator('article');
    const count = await articles.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('blog has proper SEO metadata', async ({ page }) => {
    await page.goto('/blog/getting-started');
    const title = await page.title();
    expect(title).toContain('جعبه ابزار فارسی');
    const ogType = page.locator('meta[property="og:type"]');
    await expect(ogType).toHaveAttribute('content', 'website');
  });

  test('blog listing links to detail pages', async ({ page }) => {
    await page.goto('/blog');
    const firstPost = page.locator('article a[href^="/blog/"]').first();
    await expect(firstPost).toBeVisible();
    const href = await firstPost.getAttribute('href');
    expect(href).toMatch(/^\/blog\/.+/);
  });

  test('blog sidebar shows categories and tags', async ({ page }) => {
    await page.goto('/blog');
    const sidebar = page.locator('aside');
    await expect(sidebar).toBeVisible();
    await expect(sidebar).toContainText('دسته‌بندی‌ها');
    await expect(sidebar).toContainText('تگ‌ها');
  });

  test('blog is mobile responsive', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/blog');
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
  });

  test('blog post has back link', async ({ page }) => {
    await page.goto('/blog/getting-started');
    const backLink = page.locator('a[href="/blog"]');
    await expect(backLink).toContainText('بازگشت به بلاگ');
  });
});

test.describe('Homepage Link Fix', () => {
  test('all tools button links to /topics not /tools', async ({ page }) => {
    await page.goto('/');
    const allToolsBtn = page.locator('a[href="/topics"]').first();
    await expect(allToolsBtn).toBeVisible();
    await expect(allToolsBtn).toContainText('همه ابزارها');
  });
});
