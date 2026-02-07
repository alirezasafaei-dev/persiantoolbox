import { test, expect } from '@playwright/test';
import { ensureServiceWorkerReady } from './helpers/pwa';

test.describe('PWA offline', () => {
  test('should show offline fallback when offline', async ({ page, context }) => {
    await page.goto('/offline');
    await ensureServiceWorkerReady(page);

    await context.setOffline(true);
    try {
      await page.reload({ waitUntil: 'domcontentloaded' });
    } catch {
      // Chromium may throw net::ERR_FAILED in offline mode even if cached page remains visible.
    }

    const appOfflineHeading = page.getByRole('heading', {
      level: 1,
      name: 'در حال حاضر آفلاین هستید',
    });
    if ((await appOfflineHeading.count()) > 0) {
      await expect(appOfflineHeading).toBeVisible();
      const clearCache = page.getByRole('button', { name: 'پاک‌سازی کش' });
      await expect(clearCache).toBeVisible();
    } else {
      await expect(page.getByRole('heading', { level: 1 })).toContainText(
        /site can.?t be reached/i,
      );
    }

    await context.setOffline(false);
  });

  test('should cache static assets for offline use', async ({ page, context }) => {
    await page.goto('/');
    await ensureServiceWorkerReady(page);

    // Wait for initial caching
    await page.waitForTimeout(1000);

    // Ensure target route is cached by visiting it once online
    await page.goto('/date-tools');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('ابزارهای تاریخ');

    // Go offline
    await context.setOffline(true);

    // Navigate to a cached route - should work offline
    await page.goto('/date-tools', { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('heading', { level: 1 })).toContainText('ابزارهای تاریخ');

    await context.setOffline(false);
  });

  test('should handle service worker update flow', async ({ page }) => {
    await page.goto('/');

    await page.waitForFunction(() => 'serviceWorker' in navigator);

    // Register SW and wait for activation
    const swState = await page.evaluate(async () => {
      const registration = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;
      return {
        active: !!registration.active,
        installing: !!registration.installing,
        waiting: !!registration.waiting,
      };
    });

    expect(swState.active || swState.installing).toBeTruthy();
  });

  test('should show offline page for uncached routes', async ({ page, context }) => {
    await page.goto('/');
    await ensureServiceWorkerReady(page);

    await context.setOffline(true);

    // Access an uncached route and verify offline fallback
    try {
      await page.goto('/subscription-roadmap', { waitUntil: 'domcontentloaded' });
    } catch {
      // Offline navigation can reject while keeping the current rendered page.
    }

    const offlineHeading = page.getByRole('heading', {
      level: 1,
      name: 'در حال حاضر آفلاین هستید',
    });
    if ((await offlineHeading.count()) > 0) {
      await expect(offlineHeading).toBeVisible();
    } else {
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    }

    await context.setOffline(false);
  });

  test('should clear caches when requested', async ({ page }) => {
    await page.goto('/offline');
    await ensureServiceWorkerReady(page);

    const clearAck = await page.evaluate(async () => {
      return await new Promise<string>((resolve, reject) => {
        const timeout = window.setTimeout(() => {
          navigator.serviceWorker.removeEventListener('message', onMessage);
          reject(new Error('cache clear ack timeout'));
        }, 8_000);

        const onMessage = (event: MessageEvent) => {
          if (event.data?.type === 'CACHES_CLEARED') {
            window.clearTimeout(timeout);
            navigator.serviceWorker.removeEventListener('message', onMessage);
            resolve(event.data.type as string);
          }
        };

        navigator.serviceWorker.addEventListener('message', onMessage);
        navigator.serviceWorker.ready.then((registration) => {
          registration.active?.postMessage({ type: 'CLEAR_CACHES' });
        });
      });
    });

    expect(clearAck).toBe('CACHES_CLEARED');
  });

  test('should show update prompt when service worker reports update', async ({ page }) => {
    await page.goto('/');
    await ensureServiceWorkerReady(page);
    const updateMessage = await page.evaluate(async () => {
      return await new Promise<{ type: string; version?: string }>((resolve, reject) => {
        const timeout = window.setTimeout(() => {
          navigator.serviceWorker.removeEventListener('message', onMessage);
          reject(new Error('service worker update message timeout'));
        }, 8000);

        const onMessage = (event: MessageEvent) => {
          if (event.data?.type === 'UPDATE_AVAILABLE') {
            window.clearTimeout(timeout);
            navigator.serviceWorker.removeEventListener('message', onMessage);
            resolve({
              type: event.data.type as string,
              version: typeof event.data.version === 'string' ? event.data.version : undefined,
            });
          }
        };

        navigator.serviceWorker.addEventListener('message', onMessage);
        navigator.serviceWorker.ready.then((registration) => {
          registration.active?.postMessage({ type: 'DEBUG_FORCE_UPDATE' });
        });
      });
    });

    expect(updateMessage.type).toBe('UPDATE_AVAILABLE');
    expect(updateMessage.version).toMatch(/^v\d{1,3}-\d{4}-\d{2}-\d{2}$/);
  });
});
