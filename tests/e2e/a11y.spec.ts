import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.use({ colorScheme: 'light' });

function isContextRaceError(message: string): boolean {
  return (
    message.includes('Execution context was destroyed') ||
    message.includes('frame.evaluate: Test ended')
  );
}

async function analyzeA11yWithRetry(page: Page, attempts = 3) {
  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      await page.waitForLoadState('domcontentloaded');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(250);
      return await new AxeBuilder({ page }).analyze();
    } catch (error) {
      lastError = error;
      const message = error instanceof Error ? error.message : String(error);
      const isNavigationRace = isContextRaceError(message);

      if (!isNavigationRace || attempt === attempts) {
        throw error;
      }

      await page.waitForLoadState('domcontentloaded');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(200);
    }
  }

  throw lastError;
}

const routes = [
  '/',
  '/loan',
  '/salary',
  '/date-tools',
  '/pdf-tools/merge/merge-pdf',
  '/image-tools',
  '/offline',
];

routes.forEach((route) => {
  test(`a11y serious/critical violations: ${route}`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' });
    await page.goto(route);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1200);

    const results = await analyzeA11yWithRetry(page);
    const serious = results.violations.filter((v) =>
      ['serious', 'critical'].includes((v.impact ?? '').toLowerCase()),
    );

    expect(serious, `Serious/critical a11y issues on ${route}`).toHaveLength(0);
  });
});
