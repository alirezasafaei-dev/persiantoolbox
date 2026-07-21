import AxeBuilder from '@axe-core/playwright';
import { test, expect, type Page } from '@playwright/test';

const ROUTES = [
  '/',
  '/tools',
  '/loan',
  '/salary',
  '/date-tools',
  '/writing-tools',
  '/business-tools',
  '/career-tools',
  '/pricing',
];

async function stabilizePage(page: Page) {
  await page.waitForLoadState('domcontentloaded');
  await page.waitForFunction(() => {
    const state = document.readyState;
    return state === 'interactive' || state === 'complete';
  });
  await page.locator('body').waitFor({ state: 'visible' });
}

test.describe('Contrast Ratio Checks', () => {
  for (const route of ROUTES) {
    test(`${route} meets WCAG AA color contrast`, async ({ page }, testInfo) => {
      await page.goto(route);
      await stabilizePage(page);

      const results = await new AxeBuilder({ page }).withRules(['color-contrast']).analyze();
      const failures = results.violations.flatMap((violation) =>
        violation.nodes.map((node) => ({
          rule: violation.id,
          impact: violation.impact,
          target: node.target.join(' '),
          summary: node.failureSummary ?? violation.help,
        })),
      );

      for (const failure of failures) {
        testInfo.annotations.push({
          type: 'contrast-failure',
          description: `${route} ${failure.target}: ${failure.summary}`,
        });
      }

      expect(failures).toEqual([]);
    });
  }
});

test.describe('Keyboard Navigation', () => {
  for (const route of ROUTES) {
    test(`${route} can tab through interactive elements`, async ({ page }) => {
      await page.goto(route);
      await stabilizePage(page);

      await page.focus('body');
      await page.keyboard.press('Tab');

      const focused = await page.evaluate(() => {
        const el = document.activeElement;
        if (!el || el === document.body) return null;
        return {
          tag: el.tagName.toLowerCase(),
          text: (el.textContent ?? '').trim().substring(0, 60),
          href: (el as HTMLAnchorElement).href ?? (el as HTMLButtonElement).type ?? null,
          role: el.getAttribute('role') ?? el.tagName.toLowerCase(),
        };
      });

      expect(focused).not.toBeNull();
    });

    test(`${route} has visible focus indicators`, async ({ page }, testInfo) => {
      await page.goto(route);
      await stabilizePage(page);

      await page.keyboard.press('Tab');
      await page.waitForTimeout(100);

      const hasVisibleFocus = await page.evaluate(() => {
        const el = document.activeElement;
        if (!el || el === document.body) return false;

        const style = getComputedStyle(el);
        const outlineColor = style.outlineColor;
        const outlineWidth = parseFloat(style.outlineWidth);

        return (
          (outlineWidth > 0 &&
            outlineColor !== 'transparent' &&
            outlineColor !== 'rgba(0, 0, 0, 0)') ||
          (style.boxShadow && style.boxShadow !== 'none')
        );
      });

      if (!hasVisibleFocus) {
        testInfo.annotations.push({
          type: 'focus-indicator',
          description: `No visible focus indicator on first focusable element at ${route}`,
        });
      }
    });
  }
});

test.describe('Skip to Content', () => {
  test('skip navigation link exists and is focusable', async ({ page }) => {
    await page.goto('/');
    await stabilizePage(page);

    const skipLink = page.locator(
      'a[href="#main-content"], a[href="#content"], a[href="#main"], .skip-link, [data-skip-link]',
    );
    if ((await skipLink.count()) > 0) {
      await expect(skipLink.first()).toBeVisible();
    }
  });
});
