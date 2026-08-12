import type { Page } from '@playwright/test';

export async function ensureServiceWorkerReady(page: Page) {
  await page.waitForFunction(() => 'serviceWorker' in navigator);
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      await page.evaluate(async () => {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          updateViaCache: 'none',
        });

        const activateWaitingWorker = () => {
          registration.waiting?.postMessage({ type: 'SKIP_WAITING' });
        };

        activateWaitingWorker();
        registration.addEventListener('updatefound', () => {
          const installing = registration.installing;
          installing?.addEventListener('statechange', activateWaitingWorker);
        });
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
  await page.waitForFunction(async () => {
    const registration = await navigator.serviceWorker.getRegistration('/sw.js');
    registration?.waiting?.postMessage({ type: 'SKIP_WAITING' });
    return (
      Boolean(registration?.active) &&
      registration?.waiting === null &&
      navigator.serviceWorker.controller !== null
    );
  });
}
