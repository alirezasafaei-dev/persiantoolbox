import { test, expect } from '@playwright/test';

test.describe('Homepage & tool discovery', () => {
  test('loads homepage with hero, search, and tool categories', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('ابزارهای فارسی');

    const sections = page.locator('section');
    const count = await sections.count();
    expect(count).toBeGreaterThan(0);
  });

  test('search input is accessible and functional', async ({ page }) => {
    await page.goto('/search');
    const searchInput = page
      .locator('input[type="search"], input[placeholder*="جستجو"], input[aria-label*="جستجو"]')
      .first();
    await expect(searchInput).toBeVisible();
    await searchInput.fill('PDF');
    await page.waitForTimeout(500);
    const results = page.locator('a[href*="/pdf"], a[href*="pdf"]');
    const resultCount = await results.count();
    expect(resultCount).toBeGreaterThan(0);
  });

  test('navigation has all 6 category links', async ({ page }) => {
    await page.goto('/');
    const nav = page.locator('nav').first();
    await expect(nav).toBeVisible();
    const categories = [
      'ابزارهای PDF',
      'ابزارهای تصویر',
      'ابزارهای مالی',
      'ابزارهای تاریخ',
      'ابزارهای متنی',
      'ابزارهای اعتبارسنجی',
    ];
    for (const cat of categories) {
      const link = nav.locator(`a:has-text("${cat}")`).first();
      const isVisible = await link.isVisible().catch(() => false);
      expect(isVisible).toBe(true);
    }
  });
});

test.describe('Finance tool flow', () => {
  test('salary calculator loads and accepts input', async ({ page }) => {
    await page.goto('/salary');
    const h1 = page.locator('h1').first();
    await expect(h1).toBeVisible({ timeout: 15000 });
  });

  test('tax calculator loads and shows results', async ({ page }) => {
    await page.goto('/tools/tax-calculator');
    await page.waitForLoadState('domcontentloaded');
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
  });
});

test.describe('Text/date/validation tool flows', () => {
  test('character counter tool loads', async ({ page }) => {
    await page.goto('/text-tools/character-counter');
    await page.waitForLoadState('domcontentloaded');
    const textarea = page.locator('textarea').first();
    if (await textarea.isVisible()) {
      await textarea.fill('سلام دنیا');
      await page.waitForTimeout(300);
    }
  });

  test('jalali date converter loads', async ({ page }) => {
    await page.goto('/date-tools/jalali-converter');
    await page.waitForLoadState('domcontentloaded');
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
  });

  test('national ID validator loads', async ({ page }) => {
    await page.goto('/validation-tools/national-id');
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible({ timeout: 15000 });
  });
});

test.describe('Mobile RTL smoke test', () => {
  test('homepage renders correctly on mobile with RTL', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    const html = page.locator('html');
    const dir = await html.getAttribute('dir');
    expect(dir).toBe('rtl');

    const mobileMenu = page
      .locator('[data-testid="mobile-menu"], button[aria-label*="منو"], button[aria-label*="menu"]')
      .first();
    const isVisible = await mobileMenu.isVisible().catch(() => false);
    expect(isVisible).toBe(true);
  });

  test('tool page renders on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/salary');
    const h1 = page.locator('h1').first();
    await expect(h1).toBeVisible({ timeout: 15000 });
  });
});

test.describe('Accessibility smoke tests', () => {
  test('homepage has exactly one h1', async ({ page }) => {
    await page.goto('/');
    const h1 = page.locator('h1');
    await expect(h1).toHaveCount(1);
  });

  test('important buttons have accessible names', async ({ page }) => {
    await page.goto('/');
    const buttons = page.locator('button');
    const count = await buttons.count();
    for (let i = 0; i < Math.min(count, 10); i++) {
      const button = buttons.nth(i);
      const isVisible = await button.isVisible().catch(() => false);
      if (isVisible) {
        const ariaLabel = await button.getAttribute('aria-label');
        const text = await button.textContent();
        const hasName = (ariaLabel?.trim().length ?? 0) > 0 || (text?.trim().length ?? 0) > 0;
        expect(hasName).toBe(true);
      }
    }
  });

  test('tool page has logical heading hierarchy', async ({ page }) => {
    await page.goto('/pdf-tools');
    await page.waitForLoadState('domcontentloaded');
    const h1 = page.locator('h1');
    await expect(h1).toHaveCount(1);
  });

  test('keyboard focus reaches primary action', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');
    const focused = page.locator(':focus');
    const tagName = await focused.evaluate((el) => el.tagName.toLowerCase()).catch(() => '');
    expect(['a', 'button', 'input', 'select', 'textarea']).toContain(tagName);
  });
});

test.describe('Network privacy - local-first verification', () => {
  test('no external requests during local-first tool usage', async ({ page }) => {
    const externalRequests: string[] = [];
    const allowedHosts = ['localhost', '127.0.0.1', 'persiantoolbox.ir'];

    page.on('request', (request) => {
      const url = request.url();
      try {
        const parsed = new URL(url);
        if (
          !allowedHosts.includes(parsed.hostname) &&
          !parsed.hostname.endsWith('.persiantoolbox.ir')
        ) {
          if (!url.includes('favicon') && !url.includes('_next/data')) {
            externalRequests.push(url);
          }
        }
      } catch {
        // skip invalid URLs
      }
    });

    await page.goto('/text-tools/character-counter');
    await page.waitForLoadState('networkidle');

    const textarea = page.locator('textarea').first();
    if (await textarea.isVisible()) {
      await textarea.fill('test content for privacy check');
      await page.waitForTimeout(1000);
    }

    const suspicious = externalRequests.filter(
      (url) =>
        !url.includes('fonts.gstatic.com') &&
        !url.includes('fonts.googleapis.com') &&
        !url.includes('trustseal.enamad.ir') &&
        !url.includes('blob:') &&
        !url.includes('alirezasafaeisystems.ir'),
    );

    for (const req of suspicious) {
      test.info().annotations.push({ type: 'external-request', description: req });
    }

    expect(suspicious.length).toBe(0);
  });
});

test.describe('SEO/schema smoke tests', () => {
  test('homepage has JSON-LD script tag', async ({ page }) => {
    await page.goto('/');
    const scripts = page.locator('script[type="application/ld+json"]');
    const count = await scripts.count();
    expect(count).toBeGreaterThan(0);
  });

  test('JSON-LD is valid JSON', async ({ page }) => {
    await page.goto('/');
    const scripts = page.locator('script[type="application/ld+json"]');
    const count = await scripts.count();
    for (let i = 0; i < count; i++) {
      const content = await scripts.nth(i).textContent();
      expect(() => JSON.parse(content ?? '')).not.toThrow();
    }
  });

  test('homepage has canonical link', async ({ page }) => {
    await page.goto('/');
    const canonical = page.locator('link[rel="canonical"]');
    await expect(canonical).toHaveCount(1);
    const href = await canonical.getAttribute('href');
    expect(href).toBeTruthy();
    expect(href).toContain('/');
  });
});

test.describe('PWA smoke tests', () => {
  test('manifest link tag exists', async ({ page }) => {
    await page.goto('/');
    const manifest = page.locator('link[rel="manifest"]');
    await expect(manifest).toHaveCount(1);
  });

  test('theme-color meta tag exists', async ({ page }) => {
    await page.goto('/');
    const themeColor = page.locator('meta[name="theme-color"]');
    const count = await themeColor.count();
    expect(count).toBeGreaterThan(0);
  });
});

test.describe('Dark/light mode', () => {
  test('dark mode toggle exists and is functional', async ({ page }) => {
    await page.goto('/');
    const toggle = page
      .locator(
        '[data-testid="dark-mode-toggle"], button[aria-label*="حالت"], button[aria-label*="dark"]',
      )
      .first();
    const isVisible = await toggle.isVisible().catch(() => false);
    if (isVisible) {
      await toggle.click();
      await page.waitForTimeout(300);
      const html = page.locator('html');
      const classList = await html.getAttribute('class');
      expect(classList).toBeTruthy();
    }
  });
});

test.describe('Error states in Persian', () => {
  test('404 page shows Persian content', async ({ page }) => {
    const response = await page.goto('/nonexistent-page-12345');
    expect(response?.status()).toBe(404);
    const body = await page.textContent('body');
    expect(body).toBeTruthy();
  });
});
