const CACHE_VERSION = 'v8-2026-02-12';
const SHELL_CACHE = `persian-tools-shell-${CACHE_VERSION}`;
const RUNTIME_CACHE = `persian-tools-runtime-${CACHE_VERSION}`;

const OFFLINE_URL = '/offline';
const SHELL_ASSETS = [
  '/',
  OFFLINE_URL,
  '/manifest.webmanifest',
  '/tools',
  '/pdf-tools',
  '/image-tools',
  '/date-tools',
  '/text-tools',
  '/validation-tools',
  '/loan',
  '/salary',
];
const STATIC_CACHE_PATHS = ['/_next/static/', '/icons/', '/images/', '/fonts/'];
const STATIC_FILE_EXTENSIONS = [
  '.css',
  '.js',
  '.woff2',
  '.woff',
  '.ttf',
  '.png',
  '.jpg',
  '.jpeg',
  '.svg',
  '.webp',
  '.ico',
];

const UPDATE_CHECK_INTERVAL = 60 * 60 * 1000; // 1 hour

let updatePending = false;
let hasActiveControllerOnInstall = false;

const isStaticAsset = (url) => {
  if (STATIC_CACHE_PATHS.some((path) => url.pathname.startsWith(path))) {
    return true;
  }
  return STATIC_FILE_EXTENSIONS.some((ext) => url.pathname.endsWith(ext));
};

const notifyClients = async (type, payload = {}) => {
  const clients = await self.clients.matchAll({ type: 'window' });
  clients.forEach((client) => {
    client.postMessage({ type, ...payload });
  });
};

self.addEventListener('message', (event) => {
  if (!event.data?.type) {
    return;
  }

  switch (event.data.type) {
    case 'SKIP_WAITING': {
      self.skipWaiting();
      break;
    }
    case 'CLEAR_CACHES': {
      event.waitUntil(
        caches
          .keys()
          .then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
          .then(() => notifyClients('CACHES_CLEARED')),
      );
      break;
    }
    case 'CHECK_UPDATE': {
      event.waitUntil(checkForUpdates());
      break;
    }
    case 'DEBUG_FORCE_UPDATE': {
      const isLocalhost = ['localhost', '127.0.0.1'].includes(self.location.hostname);
      if (isLocalhost) {
        updatePending = true;
        event.waitUntil(notifyClients('UPDATE_AVAILABLE', { version: CACHE_VERSION }));
      }
      break;
    }
    default:
      break;
  }
});

const checkForUpdates = async () => {
  try {
    const response = await fetch('/manifest.webmanifest', { cache: 'no-store' });
    if (response.ok) {
      // Version changed detection handled by cache busting
      const hasUpdate = updatePending;
      await notifyClients('UPDATE_STATUS', { hasUpdate, pending: updatePending });
    }
  } catch {
    // Ignore network errors during update check
  }
};

setInterval(() => {
  checkForUpdates();
}, UPDATE_CHECK_INTERVAL);

self.addEventListener('install', (event) => {
  hasActiveControllerOnInstall = !!self.registration.active;
  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(SHELL_CACHE);
        await cache.addAll(SHELL_ASSETS);
      } catch {
        // Ignore cache failures to avoid blocking install.
      }

      // برای نصب اولیه سریع فعال شویم، اما در آپدیت‌ها منتظر تعامل کاربر بمانیم.
      if (!hasActiveControllerOnInstall) {
        self.skipWaiting();
      } else {
        updatePending = true;
        await notifyClients('UPDATE_AVAILABLE', { version: CACHE_VERSION });
      }
    })(),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      const obsolete = keys.filter((key) => ![SHELL_CACHE, RUNTIME_CACHE].includes(key));
      await Promise.all(obsolete.map((key) => caches.delete(key)));

      updatePending = false;
      await self.clients.claim();

      // اگر به عنوان آپدیت فعال شده‌ایم، به کلاینت‌ها اطلاع بدهیم.
      if (hasActiveControllerOnInstall) {
        await notifyClients('UPDATED', { version: CACHE_VERSION });
      }
    })(),
  );
});

// Cache strategies
const cacheFirst = async (request) => {
  const cached = await caches.match(request);
  if (cached) {
    // Stale-while-revalidate: return cached but update in background
    fetch(request)
      .then((response) => {
        if (response.ok) {
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, response.clone()));
        }
      })
      .catch(() => {});
    return cached;
  }
  const response = await fetch(request);
  if (response.ok) {
    const clone = response.clone();
    caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, clone));
  }
  return response;
};

const networkFirst = async (request) => {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const clone = response.clone();
      caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, clone));
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }
    throw new Error('Network error and no cache available');
  }
};

self.addEventListener('fetch', (event) => {
  const request = event.request;

  if (request.method !== 'GET') {
    return;
  }

  const url = new URL(request.url);

  // Skip non-same-origin requests
  if (url.origin !== self.location.origin) {
    return;
  }

  // Navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(
      networkFirst(request).catch(() => {
        return caches.match(request).then((cached) => {
          if (cached) {
            return cached;
          }
          return caches.match(OFFLINE_URL);
        });
      }),
    );
    return;
  }

  // Static assets: Cache First
  if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // API/other requests: Network First with fallback
  event.respondWith(networkFirst(request).catch(() => caches.match(request) || Promise.reject()));
});
