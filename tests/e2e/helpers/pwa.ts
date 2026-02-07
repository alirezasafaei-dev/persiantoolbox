import type { Page } from '@playwright/test';

export async function ensureServiceWorkerReady(page: Page) {
  await page.waitForFunction(() => 'serviceWorker' in navigator);
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      await page.evaluate(async () => {
        await navigator.serviceWorker.register('/sw.js');
        const registration = await navigator.serviceWorker.ready;
        registration.active?.postMessage({ type: 'SKIP_WAITING' });
      });
      break;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const canRetry = message.includes('Execution context was destroyed') && attempt < 2;
      if (!canRetry) {
        throw error;
      }
      await page.waitForLoadState('domcontentloaded');
    }
  }
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null);
}
