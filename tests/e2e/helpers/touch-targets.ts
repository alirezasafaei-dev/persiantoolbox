import { expect, type Page } from '@playwright/test';

export async function getVisibleTouchTargets(page: Page) {
  // Keep selection, geometry and diagnostics in one DOM task. A live nth()
  // locator can change identity or disappear while a lazy component hydrates.
  return page
    .locator(
      'button:visible, a[role="button"]:visible, input[type="button"]:visible, input[type="submit"]:visible',
    )
    .evaluateAll((elements) =>
      elements.map((element) => {
        const { width, height } = element.getBoundingClientRect();
        return {
          width,
          height,
          tag: element.tagName.toLowerCase(),
          text: (element.textContent ?? '').trim().replace(/\s+/g, ' ').slice(0, 60),
          ariaLabel: element.getAttribute('aria-label'),
        };
      }),
    );
}

export function expectMinimumTouchTargetSize(
  targets: Awaited<ReturnType<typeof getVisibleTouchTargets>>,
) {
  expect(targets.length).toBeGreaterThan(0);
  for (const target of targets) {
    expect(
      Math.min(target.width, target.height),
      `Touch target is too small: ${JSON.stringify(target)}`,
    ).toBeGreaterThanOrEqual(24);
  }
}
