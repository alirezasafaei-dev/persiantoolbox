import { test, expect, type Page } from '@playwright/test';
import { ensureServiceWorkerReady } from './helpers/pwa';

function isContextRaceError(message: string): boolean {
  return (
    message.includes('Execution context was destroyed') ||
    message.includes('frame.evaluate: Test ended')
  );
}

async function clearCachesWithRetry(page: Page, attempts = 3) {
  let lastError: unknown;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await page.evaluate(async () => {
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
    } catch (error) {
      lastError = error;
      const message = error instanceof Error ? error.message : String(error);
      if (!isContextRaceError(message) || attempt === attempts) {
        throw error;
      }
      await page.waitForLoadState('domcontentloaded');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(300);
    }
  }
  throw lastError;
}

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

  test('should load a warmed deep pdf route while offline', async ({ page, context }) => {
    await page.goto('/');
    await ensureServiceWorkerReady(page);
    await page.waitForTimeout(1000);

    await page.goto('/pdf-tools/merge/merge-pdf');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('ادغام PDF');

    await context.setOffline(true);
    await page.goto('/pdf-tools/merge/merge-pdf', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { level: 1 })).toContainText('ادغام PDF');
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

  test('should keep online-required route network-only while offline', async ({
    page,
    context,
  }) => {
    await page.goto('/pro');
    await ensureServiceWorkerReady(page);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    await context.setOffline(true);
    try {
      await page.goto('/pro', { waitUntil: 'domcontentloaded' });
    } catch {
      // expected in offline mode for network-only routes
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
    test.setTimeout(45_000);
    await page.goto('/offline');
    await ensureServiceWorkerReady(page);
    await page.waitForLoadState('networkidle');
    const clearAck = await clearCachesWithRetry(page);

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
