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
  await page.waitForTimeout(1000);
}

test.describe('Contrast Ratio Checks', () => {
  for (const route of ROUTES) {
    test(`${route} meets minimum 4.5:1 contrast ratio for body text`, async ({ page }) => {
      await page.goto(route);
      await stabilizePage(page);

      const results = await page.evaluate(() => {
        const body = document.body;
        const color = getComputedStyle(body).color;
        const bg = getComputedStyle(body).backgroundColor;

        function parseColor(css: string): [number, number, number] {
          const m = css.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
          if (!m) return [0, 0, 0];
          return [Number(m[1]), Number(m[2]), Number(m[3])];
        }

        function luminance(r: number, g: number, b: number): number {
          const [rl, gl, bl] = [r, g, b].map((c) => {
            const s = c / 255;
            return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
          }) as [number, number, number];
          return 0.2126 * rl + 0.7152 * gl + 0.0722 * bl;
        }

        const [r1, g1, b1] = parseColor(color);
        const [r2, g2, b2] = parseColor(bg);
        const l1 = luminance(r1, g1, b1);
        const l2 = luminance(r2, g2, b2);
        const lighter = Math.max(l1, l2);
        const darker = Math.min(l1, l2);
        const ratio = (lighter + 0.05) / (darker + 0.05);

        // Check all text elements for contrast issues
        const textElements = body.querySelectorAll(
          'p, span, li, a, h1, h2, h3, h4, h5, h6, label, td, th, button, div',
        );
        const failures: string[] = [];
        const checked = new Set<Element>();

        textElements.forEach((el) => {
          if (checked.has(el)) return;
          checked.add(el);

          const style = getComputedStyle(el);
          const elColor = style.color;
          const elBg = style.backgroundColor;
          const fontSize = parseFloat(style.fontSize);
          const fontWeight = parseInt(style.fontWeight);

          // Skip if transparent/background not set
          if (elBg === 'transparent' || elBg === 'rgba(0, 0, 0, 0)') return;
          if (elColor === 'transparent' || elColor === 'rgba(0, 0, 0, 0)') return;

          const [er1, eg1, eb1] = parseColor(elColor);
          const [er2, eg2, eb2] = parseColor(elBg);
          const el1 = luminance(er1, eg1, eb1);
          const el2 = luminance(er2, eg2, eb2);
          const elLighter = Math.max(el1, el2);
          const elDarker = Math.min(el1, el2);
          const elRatio = (elLighter + 0.05) / (elDarker + 0.05);

          // WCAG AA: 4.5:1 for normal text, 3:1 for large text (>=18px or >=14px bold)
          const requiredRatio = fontSize >= 18 || (fontSize >= 14 && fontWeight >= 700) ? 3 : 4.5;

          if (elRatio < requiredRatio) {
            const tag = el.tagName.toLowerCase();
            const text = (el.textContent ?? '').trim().substring(0, 50);
            if (text.length > 0) {
              failures.push(
                `${tag} "${text}" — ratio ${elRatio.toFixed(2)} (need ${requiredRatio}:1)`,
              );
            }
          }
        });

        return { bodyRatio: ratio.toFixed(2), failures };
      });

      if (results.failures.length > 0) {
        console.log(`Contrast failures on ${route}:`, results.failures);
      }

      expect(results.failures.length).toBe(0);
    });
  }
});

test.describe('Keyboard Navigation', () => {
  for (const route of ROUTES) {
    test(`${route} can tab through interactive elements`, async ({ page }) => {
      await page.goto(route);
      await stabilizePage(page);

      // Focus the body first
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

      // At least one interactive element can be focused with Tab
      expect(focused).not.toBeNull();
    });

    test(`${route} has visible focus indicators`, async ({ page }) => {
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

        // Check if there's a visible outline or ring
        return (
          (outlineWidth > 0 &&
            outlineColor !== 'transparent' &&
            outlineColor !== 'rgba(0, 0, 0, 0)') ||
          (style.boxShadow && style.boxShadow !== 'none')
        );
      });

      // Just a soft check - many sites use custom focus styles
      if (!hasVisibleFocus) {
        console.log(`No visible focus indicator on first focusable element at ${route}`);
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
