import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.use({ colorScheme: 'light' });

function isContextRaceError(message: string): boolean {
  return (
    message.includes('Execution context was destroyed') ||
    message.includes('frame.evaluate: Test ended') ||
    message.includes('page.waitForLoadState: Test ended')
  );
}

async function stabilizePage(page: Page) {
  await page.waitForLoadState('domcontentloaded');
  await page.waitForFunction(() => {
    const state = document.readyState;
    return state === 'interactive' || state === 'complete';
  });
  await page.waitForTimeout(1200);
}

async function disableAnimations(page: Page) {
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation: none !important;
        transition: none !important;
        caret-color: auto !important;
      }
    `,
  });
  await page.waitForFunction(() => document.fonts?.status === 'loaded');
  await page.waitForTimeout(100);
}

async function analyzeA11yWithRetry(page: Page, route: string, attempts = 3) {
  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      await page.goto(route, { waitUntil: 'domcontentloaded' });
      await stabilizePage(page);
      await disableAnimations(page);
      return await new AxeBuilder({ page }).analyze();
    } catch (error) {
      lastError = error;
      const message = error instanceof Error ? error.message : String(error);
      const isNavigationRace = isContextRaceError(message);

      if (!isNavigationRace || attempt === attempts) {
        throw error;
      }

      await page.waitForTimeout(350);
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
    const results = await analyzeA11yWithRetry(page, route);
    const serious = results.violations.filter((v) =>
      ['serious', 'critical'].includes((v.impact ?? '').toLowerCase()),
    );

    expect(serious, `Serious/critical a11y issues on ${route}`).toHaveLength(0);
  });
});
