const CACHE_VERSION = 'v13-2026-07-22';
const SHELL_CACHE = `persian-tools-shell-${CACHE_VERSION}`;
const RUNTIME_CACHE = `persian-tools-runtime-${CACHE_VERSION}`;
const OFFLINE_URL = '/offline';

const SHELL_ASSETS = [
  /* GENERATED_SHELL_ASSETS_START */
  '/offline',
  '/manifest.webmanifest',
  /* GENERATED_SHELL_ASSETS_END */
];
const ONLINE_REQUIRED_PATHS = ['/pro', '/account', '/dashboard', '/subscription', '/checkout'];
const ONLINE_REQUIRED_PREFIXES = ['/pro/', '/checkout/', '/admin/'];

const isSameOrigin = (url) => url.origin === self.location.origin;
const isRscRequest = (url) => url.searchParams.has('_rsc');
const isOnlineRequiredRoute = (url) =>
  ONLINE_REQUIRED_PATHS.includes(url.pathname) ||
  ONLINE_REQUIRED_PREFIXES.some((prefix) => url.pathname.startsWith(prefix));

const isImmutableStaticAsset = (url) =>
  url.pathname.startsWith('/_next/static/') ||
  url.pathname.startsWith('/fonts/') ||
  url.pathname.startsWith('/icons/') ||
  url.pathname.startsWith('/images/');

const notifyClients = async (type, payload = {}) => {
  const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
  for (const client of clients) {
    client.postMessage({ type, ...payload });
  }
};

const clearPersianToolboxCaches = async () => {
  const keys = await caches.keys();
  await Promise.all(
    keys.filter((key) => key.startsWith('persian-tools-')).map((key) => caches.delete(key)),
  );
};

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(SHELL_CACHE);
        await cache.addAll(SHELL_ASSETS);
      } finally {
        await self.skipWaiting();
      }
    })(),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      const allowed = new Set([SHELL_CACHE, RUNTIME_CACHE]);
      await Promise.all(
        keys
          .filter((key) => key.startsWith('persian-tools-') && !allowed.has(key))
          .map((key) => caches.delete(key)),
      );
      await self.clients.claim();
      await notifyClients('UPDATED', { version: CACHE_VERSION });
    })(),
  );
});

self.addEventListener('message', (event) => {
  const type = event.data?.type;
  if (!type) {
    return;
  }

  if (type === 'SKIP_WAITING') {
    event.waitUntil(self.skipWaiting());
    return;
  }

  if (type === 'CLEAR_CACHES') {
    event.waitUntil(clearPersianToolboxCaches().then(() => notifyClients('CACHES_CLEARED')));
    return;
  }

  if (type === 'GET_CACHE_INFO') {
    event.waitUntil(notifyClients('CACHE_INFO', { version: CACHE_VERSION }));
    return;
  }

  if (type === 'CHECK_UPDATE') {
    event.waitUntil(notifyClients('UPDATE_STATUS', { hasUpdate: false, pending: false }));
  }
});

const immutableCacheFirst = async (request) => {
  const cache = await caches.open(RUNTIME_CACHE);
  const cached = await cache.match(request);
  if (cached) {
    return cached;
  }

  const response = await fetch(request);
  if (response.ok) {
    await cache.put(request, response.clone());
  }
  return response;
};

const navigationNetworkOnly = async (request) => {
  return fetch(request, { cache: 'no-store' });
};

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') {
    return;
  }

  const url = new URL(request.url);
  if (!isSameOrigin(url)) {
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      navigationNetworkOnly(request).catch(async () => {
        const offline = await caches.match(OFFLINE_URL);
        return offline ?? Response.error();
      }),
    );
    return;
  }

  if (isRscRequest(url)) {
    event.respondWith(fetch(request, { cache: 'no-store' }));
    return;
  }

  if (url.pathname.startsWith('/api/') || isOnlineRequiredRoute(url)) {
    event.respondWith(fetch(request, { cache: 'no-store' }));
    return;
  }

  if (isImmutableStaticAsset(url)) {
    event.respondWith(immutableCacheFirst(request));
    return;
  }

  event.respondWith(fetch(request));
});
