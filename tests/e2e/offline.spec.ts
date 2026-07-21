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

async function expectOfflineShell(page: Page) {
  await expect(
    page.getByRole('heading', {
      level: 1,
      name: 'در حال حاضر آفلاین هستید',
    }),
  ).toBeVisible();
}

async function navigateOffline(page: Page, path: string) {
  try {
    await page.goto(path, { waitUntil: 'domcontentloaded' });
  } catch {
    // Chromium can reject an offline navigation while the service worker response is rendering.
  }
  await expectOfflineShell(page);
}

test.describe('PWA offline', () => {
  test('should show offline fallback when offline', async ({ page, context }) => {
    await page.goto('/offline');
    await ensureServiceWorkerReady(page);

    await context.setOffline(true);
    try {
      await page.reload({ waitUntil: 'domcontentloaded' });
    } catch {
      // Chromium may reject while the cached offline shell remains visible.
    }

    await expectOfflineShell(page);
    await expect(page.getByRole('button', { name: 'پاک‌سازی کش' })).toBeVisible();
    await context.setOffline(false);
  });

  test('should cache immutable assets without caching application HTML', async ({ page, context }) => {
    await page.goto('/date-tools');
    await ensureServiceWorkerReady(page);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('ابزارهای تاریخ');

    const asset = await page.evaluate(async () => {
      const element =
        document.querySelector<HTMLLinkElement>('link[rel="stylesheet"][href^="/_next/static/"]') ??
        document.querySelector<HTMLScriptElement>('script[src^="/_next/static/"]');
      const path =
        element instanceof HTMLLinkElement ? element.getAttribute('href') : element?.getAttribute('src');
      if (!path) {
        throw new Error('No immutable Next.js asset found');
      }

      const response = await fetch(path, { cache: 'reload' });
      if (!response.ok) {
        throw new Error(`Asset warmup failed: ${response.status}`);
      }
      await response.arrayBuffer();

      for (let attempt = 0; attempt < 20; attempt += 1) {
        const cached = await caches.match(path);
        if (cached) {
          return { path, cached: true };
        }
        await new Promise((resolve) => window.setTimeout(resolve, 100));
      }
      return { path, cached: false };
    });

    expect(asset.path).toMatch(/^\/_next\/static\/.+\.(css|js)(\?.*)?$/);
    expect(asset.cached).toBe(true);

    await context.setOffline(true);
    const offlineAsset = await page.evaluate(async (path) => {
      const response = await fetch(path);
      return { ok: response.ok, bytes: (await response.arrayBuffer()).byteLength };
    }, asset.path);
    expect(offlineAsset.ok).toBe(true);
    expect(offlineAsset.bytes).toBeGreaterThan(0);

    await navigateOffline(page, '/date-tools');
    await context.setOffline(false);
  });

  test('should never serve warmed deep-route HTML while offline', async ({ page, context }) => {
    await page.goto('/pdf-tools/merge/merge-pdf');
    await ensureServiceWorkerReady(page);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('ادغام PDF');

    await context.setOffline(true);
    await navigateOffline(page, '/pdf-tools/merge/merge-pdf');
    await context.setOffline(false);
  });

  test('should activate the service worker without a waiting release', async ({ page }) => {
    await page.goto('/');
    await ensureServiceWorkerReady(page);

    const swState = await page.evaluate(async () => {
      const registration = await navigator.serviceWorker.ready;
      return {
        active: Boolean(registration.active),
        waiting: Boolean(registration.waiting),
        controlled: navigator.serviceWorker.controller !== null,
      };
    });

    expect(swState).toEqual({ active: true, waiting: false, controlled: true });
  });

  test('should show offline page for uncached routes', async ({ page, context }) => {
    await page.goto('/');
    await ensureServiceWorkerReady(page);

    await context.setOffline(true);
    await navigateOffline(page, '/subscription-roadmap');
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
    await navigateOffline(page, '/pro');
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

  test('should report the active service worker version', async ({ page }) => {
    await page.goto('/');
    await ensureServiceWorkerReady(page);
    const cacheInfo = await page.evaluate(async () => {
      return await new Promise<{ type: string; version?: string }>((resolve, reject) => {
        const timeout = window.setTimeout(() => {
          navigator.serviceWorker.removeEventListener('message', onMessage);
          reject(new Error('service worker cache-info timeout'));
        }, 8_000);

        const onMessage = (event: MessageEvent) => {
          if (event.data?.type === 'CACHE_INFO') {
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
          registration.active?.postMessage({ type: 'GET_CACHE_INFO' });
        });
      });
    });

    expect(cacheInfo.type).toBe('CACHE_INFO');
    expect(cacheInfo.version).toMatch(/^v\d{1,3}-\d{4}-\d{2}-\d{2}$/);
  });
});
