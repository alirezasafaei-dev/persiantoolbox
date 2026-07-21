import { test, expect, type Page } from '@playwright/test';

async function firstBlogPostHref(page: Page): Promise<string> {
  await page.goto('/blog');
  const firstPost = page.locator('article a[href^="/blog/"]').first();
  await expect(firstPost).toBeVisible();
  const href = await firstPost.getAttribute('href');
  expect(href).toMatch(/^\/blog\/[A-Za-z0-9-]+$/);
  return href as string;
}

test.describe('Blog System', () => {
  test('blog listing page loads with posts', async ({ page }) => {
    await page.goto('/blog');
    await expect(page.locator('h1')).toContainText('مقاله‌ها');
    const articles = page.locator('article');
    expect(await articles.count()).toBeGreaterThanOrEqual(3);
  });

  test('blog post detail page renders content', async ({ page }) => {
    const href = await firstBlogPostHref(page);
    await page.goto(href);
    await expect(page.locator('h1')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('article')).toBeVisible({ timeout: 15000 });
  });

  test('blog category page filters posts', async ({ page }) => {
    await page.goto('/blog');
    const categoryLink = page.locator('a[href^="/blog/category/"]').first();
    await expect(categoryLink).toBeVisible();
    const href = await categoryLink.getAttribute('href');
    expect(href).toBeTruthy();

    await page.goto(href as string);
    await expect(page.locator('h1')).toBeVisible({ timeout: 15000 });
    expect(await page.locator('article').count()).toBeGreaterThanOrEqual(1);
  });

  test('blog has proper SEO metadata', async ({ page }) => {
    const href = await firstBlogPostHref(page);
    await page.goto(href);
    await expect(page).not.toHaveTitle(/مقاله یافت نشد/);
    expect(await page.title()).toContain('جعبه ابزار فارسی');
    await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'article', {
      timeout: 15000,
    });
  });

  test('blog listing links to detail pages', async ({ page }) => {
    const href = await firstBlogPostHref(page);
    expect(href).toMatch(/^\/blog\/.+/);
  });

  test('blog listing exposes topic categories', async ({ page }) => {
    await page.goto('/blog');
    await expect(page.getByRole('heading', { name: 'موضوعات', exact: true })).toBeVisible();
    expect(await page.locator('a[href^="/blog/category/"]').count()).toBeGreaterThan(0);
  });

  test('blog is mobile responsive', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/blog');
    await expect(page.locator('h1')).toBeVisible();
  });

  test('blog post has back link', async ({ page }) => {
    const href = await firstBlogPostHref(page);
    await page.goto(href);
    await expect(page.getByRole('link', { name: /بازگشت به بلاگ/ })).toBeVisible({
      timeout: 15000,
    });
  });
});

test.describe('Homepage discovery link', () => {
  test('primary free-start link routes to topics', async ({ page }) => {
    await page.goto('/');
    const startLink = page.getByRole('link', { name: 'شروع رایگان', exact: true });
    await expect(startLink).toBeVisible();
    await expect(startLink).toHaveAttribute('href', '/topics');
  });
});
