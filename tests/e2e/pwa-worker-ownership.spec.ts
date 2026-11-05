import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

test('application boot keeps one root service-worker script for offline and push', async ({
  page,
}) => {
  await page.addInitScript(() => {
    const attempts: Array<{ script: string; scope: string }> = [];
    Object.defineProperty(window, '__pwaRegistrationAttempts', { value: attempts });
    const register = navigator.serviceWorker.register.bind(navigator.serviceWorker);
    navigator.serviceWorker.register = (scriptURL, options) => {
      const script = new URL(scriptURL, document.baseURI);
      const scope = new URL(options?.scope ?? './', script);
      attempts.push({ script: script.pathname, scope: scope.pathname });
      return register(scriptURL, options);
    };
  });
  await page.goto('/');
  await page.waitForFunction(
    () => (Reflect.get(window, '__pwaRegistrationAttempts') as unknown[]).length > 0,
  );
  const state = await page.evaluate(async () => {
    const attempts = Reflect.get(window, '__pwaRegistrationAttempts') as Array<{
      script: string;
      scope: string;
    }>;
    const registration = await navigator.serviceWorker.ready;
    return {
      attempts,
      scope: registration?.scope,
      active: registration?.active?.scriptURL,
      waiting: registration?.waiting?.scriptURL,
      controller: navigator.serviceWorker.controller?.scriptURL,
    };
  });
  await test.info().attach('worker-ownership', {
    body: JSON.stringify(state, null, 2),
    contentType: 'application/json',
  });
  const rootScripts = [
    ...new Set(state.attempts.filter((item) => item.scope === '/').map((item) => item.script)),
  ];
  expect(rootScripts).toEqual(['/sw.js']);
  await page.waitForFunction(
    () => navigator.serviceWorker.controller?.scriptURL === new URL('/sw.js', location.href).href,
  );
  expect(new URL(state.active ?? '').pathname).toBe('/sw.js');
});

test('a legacy push-only root worker upgrades in place and replies with cache information', async ({
  page,
  context,
}) => {
  const legacySource = readFileSync(
    resolve(process.cwd(), 'tests/e2e/fixtures/legacy-push-worker.js.txt'),
    'utf8',
  );
  let fixtureRequests = 0;
  await context.route('**/sw-push.js', async (route) => {
    fixtureRequests += 1;
    await route.fulfill({ contentType: 'application/javascript', body: legacySource });
  });
  await page.goto('/manifest.webmanifest');
  await page.evaluate(async () => {
    await navigator.serviceWorker.register('/sw-push.js');
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  expect(await page.evaluate(() => navigator.serviceWorker.controller?.scriptURL)).toContain(
    '/sw-push.js',
  );
  expect(fixtureRequests).toBeGreaterThan(0);
  await context.unroute('**/sw-push.js');

  await page.goto('/');
  await page.waitForFunction(
    () => navigator.serviceWorker.controller?.scriptURL === new URL('/sw.js', location.href).href,
  );
  const result = await page.evaluate(async () => {
    const registrations = await navigator.serviceWorker.getRegistrations();
    const roots = registrations.filter(
      (registration) => registration.scope === new URL('/', location.href).href,
    );
    const cacheInfo = await new Promise<{ type: string; version?: string }>((resolve, reject) => {
      const onMessage = (event: MessageEvent) => {
        if (event.data?.type !== 'CACHE_INFO') return;
        clearTimeout(timeout);
        navigator.serviceWorker.removeEventListener('message', onMessage);
        resolve(event.data);
      };
      const timeout = setTimeout(() => {
        navigator.serviceWorker.removeEventListener('message', onMessage);
        reject(new Error('Migrated worker did not reply to GET_CACHE_INFO'));
      }, 8000);
      navigator.serviceWorker.addEventListener('message', onMessage);
      navigator.serviceWorker.controller?.postMessage({ type: 'GET_CACHE_INFO' });
    });
    return { roots: roots.length, active: roots[0]?.active?.scriptURL, cacheInfo };
  });
  expect(result.roots).toBe(1);
  expect(new URL(result.active ?? '').pathname).toBe('/sw.js');
  expect(result.cacheInfo).toEqual({ type: 'CACHE_INFO', version: 'v14-2026-11-05' });
  expect((await page.request.get('/sw-push.js')).status()).toBe(404);
  const staleTabAttempt = await page.evaluate(async () => {
    let rejected = false;
    try {
      await navigator.serviceWorker.register('/sw-push.js');
    } catch {
      rejected = true;
    }
    const registration = await navigator.serviceWorker.getRegistration('/');
    return {
      rejected,
      active: registration?.active?.scriptURL,
      waiting: registration?.waiting?.scriptURL ?? null,
    };
  });
  expect(staleTabAttempt.rejected).toBe(true);
  expect(new URL(staleTabAttempt.active ?? '').pathname).toBe('/sw.js');
  expect(staleTabAttempt.waiting).toBeNull();
});
