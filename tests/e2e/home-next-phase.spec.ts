import { expect, test } from '@playwright/test';

type Rgb = { r: number; g: number; b: number };

const mobileViewports = [
  { width: 360, height: 800 },
  { width: 390, height: 844 },
] as const;

function parseRgb(value: string): Rgb {
  const channels = value
    .match(/[\d.]+/g)
    ?.slice(0, 3)
    .map(Number);
  if (!channels || channels.length !== 3 || channels.some((channel) => Number.isNaN(channel))) {
    throw new Error(`Unsupported computed color: ${value}`);
  }
  const [r, g, b] = channels;
  if (r === undefined || g === undefined || b === undefined) {
    throw new Error(`Unsupported computed color: ${value}`);
  }
  return { r, g, b };
}

function composite(foreground: Rgb, background: Rgb, alpha: number): Rgb {
  return {
    r: foreground.r * alpha + background.r * (1 - alpha),
    g: foreground.g * alpha + background.g * (1 - alpha),
    b: foreground.b * alpha + background.b * (1 - alpha),
  };
}

function luminance(color: Rgb): number {
  const linearize = (channel: number) => {
    const value = channel / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * linearize(color.r) + 0.7152 * linearize(color.g) + 0.0722 * linearize(color.b);
}

function contrastRatio(foreground: Rgb, background: Rgb): number {
  const foregroundLuminance = luminance(foreground);
  const backgroundLuminance = luminance(background);
  const lighter = Math.max(foregroundLuminance, backgroundLuminance);
  const darker = Math.min(foregroundLuminance, backgroundLuminance);
  return (lighter + 0.05) / (darker + 0.05);
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem(
      'pt-consent',
      JSON.stringify({
        ad_storage: false,
        ad_user_data: false,
        ad_personalization: false,
        analytics_storage: false,
        version: 'v2',
      }),
    );
  });
});

test('task routes precede value proof cards at approved mobile widths', async ({ page }) => {
  for (const viewport of mobileViewports) {
    await page.setViewportSize(viewport);
    await page.goto('/');

    const metrics = await page.evaluate(() => {
      const taskHeading = document.querySelector('#task-heading');
      const taskSection = taskHeading?.closest('section');
      const firstTask = taskSection?.querySelector('a');
      const firstValueProof = document.querySelector(
        'section[aria-label="مزیت‌های شروع رایگان"] article',
      );
      if (!taskHeading || !taskSection || !firstTask || !firstValueProof) {
        throw new Error('Required homepage task/value-proof elements were not found');
      }
      const documentTop = (element: Element) =>
        Math.round(element.getBoundingClientRect().top + window.scrollY);
      return {
        width: window.innerWidth,
        taskHeadingTop: documentTop(taskHeading),
        firstTaskTop: documentTop(firstTask),
        firstValueProofTop: documentTop(firstValueProof),
        taskBeforeValueProof: Boolean(
          taskSection.compareDocumentPosition(firstValueProof) & Node.DOCUMENT_POSITION_FOLLOWING,
        ),
        hasHorizontalOverflow: document.documentElement.scrollWidth > window.innerWidth,
      };
    });

    console.log(`HOME_NEXT_PHASE_MOBILE ${JSON.stringify(metrics)}`);
    expect.soft(metrics.taskBeforeValueProof, `${viewport.width}px DOM order`).toBe(true);
    expect
      .soft(metrics.firstTaskTop, `${viewport.width}px first-task offset`)
      .toBeLessThan(metrics.firstValueProofTop);
    expect.soft(metrics.hasHorizontalOverflow, `${viewport.width}px overflow`).toBe(false);
  }
});

test('search placeholder contrast meets WCAG AA in light and dark themes', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const input = page.getByRole('combobox', { name: 'جستجوی ابزار' });
  await expect(input).toBeVisible({ timeout: 15_000 });

  for (const theme of ['light', 'dark'] as const) {
    await page.evaluate((nextTheme) => {
      document.documentElement.classList.toggle('dark', nextTheme === 'dark');
      window.localStorage.setItem('theme', nextTheme);
    }, theme);

    const colors = await input.evaluate((element) => {
      const placeholder = getComputedStyle(element, '::placeholder');
      const wrapper = element.parentElement;
      if (!wrapper) {
        throw new Error('Search wrapper is missing');
      }
      return {
        foreground: placeholder.color,
        opacity: Number.parseFloat(placeholder.opacity),
        background: getComputedStyle(wrapper).backgroundColor,
      };
    });
    const background = parseRgb(colors.background);
    const renderedForeground = composite(
      parseRgb(colors.foreground),
      background,
      Number.isFinite(colors.opacity) ? colors.opacity : 1,
    );
    const ratio = contrastRatio(renderedForeground, background);
    const evidence = {
      theme,
      ...colors,
      renderedForeground,
      ratio: Number(ratio.toFixed(2)),
    };

    console.log(`HOME_NEXT_PHASE_CONTRAST ${JSON.stringify(evidence)}`);
    expect
      .soft(ratio, `${theme} placeholder contrast: ${JSON.stringify(evidence)}`)
      .toBeGreaterThanOrEqual(4.5);
  }
});

test('task routes preserve keyboard order, touch targets, and 200% zoom', async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 360, height: 800 },
    deviceScaleFactor: 2,
  });
  await context.addInitScript(() => {
    window.localStorage.setItem(
      'pt-consent',
      JSON.stringify({
        ad_storage: false,
        ad_user_data: false,
        ad_personalization: false,
        analytics_storage: false,
        version: 'v2',
      }),
    );
  });
  const page = await context.newPage();
  await page.goto('/');

  const taskSection = page.locator('section[aria-labelledby="task-heading"]');
  const taskLinks = taskSection.locator('a');
  await expect(taskLinks).toHaveCount(6);

  const lastHeroAction = page.locator('a[href="#popular-tools-heading"]');
  await lastHeroAction.focus();
  await page.keyboard.press('Tab');
  await expect(taskLinks.first()).toBeFocused();

  for (const link of await taskLinks.all()) {
    const box = await link.boundingBox();
    expect(box, 'task link bounding box').not.toBeNull();
    if (!box) {
      throw new Error('Task link bounding box is missing');
    }
    expect(box.height, 'task link touch height').toBeGreaterThanOrEqual(44);
  }

  await expect(page.locator('#task-heading')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  await context.close();
});

test('install invitation waits for either consent decision and preserves cleanup', async ({
  browser,
}) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.clock.install();

  const dispatchInstallPrompt = () =>
    page.evaluate(() => {
      const event = new Event('beforeinstallprompt', { cancelable: true });
      Object.defineProperties(event, {
        prompt: { value: () => Promise.resolve() },
        userChoice: { value: Promise.resolve({ outcome: 'dismissed' }) },
      });
      window.dispatchEvent(event);
    });

  await page.goto('/');
  await expect(page.getByRole('dialog', { name: 'cookie consent' })).toBeVisible();
  await dispatchInstallPrompt();
  await page.clock.fastForward(46_000);
  await expect(page.getByText('نصب اپلیکیشن')).toHaveCount(0);

  await page.getByRole('button', { name: 'رد همه کوکی‌ها' }).click();
  await expect(page.getByText('نصب اپلیکیشن')).toBeVisible();
  await page.getByRole('button', { name: 'نه متشکرم' }).click();
  await expect(page.getByText('نصب اپلیکیشن')).toHaveCount(0);

  await page.evaluate(() => window.localStorage.clear());
  await page.reload();
  await expect(page.getByRole('dialog', { name: 'cookie consent' })).toBeVisible();
  await dispatchInstallPrompt();
  await page.clock.fastForward(46_000);
  await expect(page.getByText('نصب اپلیکیشن')).toHaveCount(0);

  await page.getByRole('button', { name: 'پذیرش همه کوکی‌ها' }).click();
  await expect(page.getByText('نصب اپلیکیشن')).toBeVisible();
  await page.evaluate(() => window.dispatchEvent(new Event('appinstalled')));
  await expect(page.getByText('نصب اپلیکیشن')).toHaveCount(0);
  expect(await page.evaluate(() => window.localStorage.getItem('pwa-install-dismissed'))).toBe('1');

  await context.close();
});
