const CACHE_VERSION = 'v10-2026-06-17';
const SHELL_CACHE = `persian-tools-shell-${CACHE_VERSION}`;
const RUNTIME_CACHE = `persian-tools-runtime-${CACHE_VERSION}`;
const API_CACHE = `persian-tools-api-${CACHE_VERSION}`;

const OFFLINE_URL = '/offline';
const ONLINE_REQUIRED_PATHS = ['/pro', '/account', '/dashboard', '/subscription', '/checkout'];
const ONLINE_REQUIRED_PREFIXES = ['/pro/', '/checkout/', '/admin/'];
const SHELL_ASSETS = [
  /* GENERATED_SHELL_ASSETS_START */
  '/',
  '/offline',
  '/manifest.webmanifest',
  '/business-tools',
  '/business-tools/document-studio',
  '/career-tools',
  '/career-tools/resume-builder',
  '/contract-tools',
  '/contract-tools/construction-contractor',
  '/contract-tools/rental-lease',
  '/date-tools',
  '/date-tools/age-calculator',
  '/date-tools/date-difference',
  '/date-tools/event-reminder',
  '/date-tools/holiday-checker',
  '/date-tools/persian-calendar',
  '/date-tools/shamsi-gregorian',
  '/date-tools/weekday-finder',
  '/image-tools',
  '/image-tools/image-background-remover',
  '/image-tools/image-format-converter',
  '/image-tools/resize-image',
  '/image-tools/rotate-image',
  '/image-tools/text-on-image',
  '/interest',
  '/loan',
  '/pdf-tools',
  '/pdf-tools/compress/compress-pdf',
  '/pdf-tools/convert/image-to-pdf',
  '/pdf-tools/convert/pdf-to-image',
  '/pdf-tools/convert/pdf-to-text',
  '/pdf-tools/convert/pdf-to-word',
  '/pdf-tools/convert/word-to-pdf',
  '/pdf-tools/edit/add-page-numbers',
  '/pdf-tools/edit/delete-pages',
  '/pdf-tools/edit/reorder-pages',
  '/pdf-tools/edit/rotate-pages',
  '/pdf-tools/extract/extract-pages',
  '/pdf-tools/extract/extract-text',
  '/pdf-tools/merge/merge-pdf',
  '/pdf-tools/security/decrypt-pdf',
  '/pdf-tools/security/encrypt-pdf',
  '/pdf-tools/split/split-pdf',
  '/pdf-tools/watermark/add-watermark',
  '/salary',
  '/text-tools',
  '/text-tools/address-fa-to-en',
  '/text-tools/case-converter',
  '/text-tools/extract-info',
  '/text-tools/number-converter',
  '/text-tools/remove-spaces',
  '/text-tools/signature',
  '/text-tools/word-counter',
  '/tools',
  '/tools/bank-rate-comparator',
  '/tools/base64-tool',
  '/tools/bonus-calculator',
  '/tools/check-penalty',
  '/tools/currency-converter',
  '/tools/hash-generator',
  '/tools/hiring-cost',
  '/tools/inflation-calculator',
  '/tools/insurance-calculator',
  '/tools/investment-calculator',
  '/tools/invoice-generator',
  '/tools/json-formatter',
  '/tools/leave-calculator',
  '/tools/legal-document-generator',
  '/tools/living-cost',
  '/tools/loan-vs-investment',
  '/tools/mahr-calculator',
  '/tools/overtime-calculator',
  '/tools/persian-ocr',
  '/tools/profit-margin',
  '/tools/real-purchasing-power',
  '/tools/rent-vs-buy',
  '/tools/report-generator',
  '/tools/retirement-calculator',
  '/tools/severance-calculator',
  '/tools/tax-calculator',
  '/tools/vat-calculator',
  '/validation-tools',
  '/validation-tools/bank-card',
  '/validation-tools/image-to-qr',
  '/validation-tools/mobile',
  '/validation-tools/national-id',
  '/validation-tools/persian-password',
  '/validation-tools/plate',
  '/validation-tools/postal-code',
  '/validation-tools/sheba',
  '/writing-tools',
  '/writing-tools/persian-writing-studio',
  /* GENERATED_SHELL_ASSETS_END */
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

const API_CACHE_MAX = 50;
const API_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

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
    case 'GET_CACHE_INFO': {
      event.waitUntil(notifyClients('CACHE_INFO', { version: CACHE_VERSION }));
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
        await notifyClients('OFFLINE_READY', { version: CACHE_VERSION });
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
      const obsolete = keys.filter((key) => ![SHELL_CACHE, RUNTIME_CACHE, API_CACHE].includes(key));
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

const isApiRequest = (request) => {
  const accept = request.headers.get('accept') || '';
  return accept.includes('application/json') || accept.includes('text/html');
};

const pruneApiCache = async () => {
  const cache = await caches.open(API_CACHE);
  const keys = await cache.keys();
  if (keys.length <= API_CACHE_MAX) {
    return;
  }

  const entries = await Promise.all(
    keys.map(async (req) => {
      const res = await cache.match(req);
      const date = res?.headers.get('sw-cache-date');
      return { req, date: date ? new Date(date).getTime() : 0 };
    }),
  );
  entries.sort((a, b) => a.date - b.date);
  const toDelete = entries.slice(0, keys.length - API_CACHE_MAX);
  await Promise.all(toDelete.map((e) => cache.delete(e.req)));
};

const networkFirstApi = async (request) => {
  const cache = await caches.open(API_CACHE);
  try {
    const response = await fetch(request);
    if (response.ok) {
      const headers = new Headers(response.headers);
      headers.set('sw-cache-date', new Date().toISOString());
      const body = await response.arrayBuffer();
      const stored = new Response(body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
      await cache.put(request, stored);
      pruneApiCache();
      return new Response(body, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      });
    }
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) {
      const cacheDate = cached.headers.get('sw-cache-date');
      if (cacheDate && Date.now() - new Date(cacheDate).getTime() < API_CACHE_TTL) {
        return cached;
      }
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

  const isProRoute =
    ONLINE_REQUIRED_PATHS.includes(url.pathname) ||
    ONLINE_REQUIRED_PREFIXES.some((prefix) => url.pathname.startsWith(prefix));

  if (isProRoute) {
    event.respondWith(fetch(request, { cache: 'no-store' }));
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
  if (isApiRequest(request)) {
    event.respondWith(
      networkFirstApi(request).catch(() => caches.match(request) || Promise.reject()),
    );
    return;
  }
  event.respondWith(networkFirst(request).catch(() => caches.match(request) || Promise.reject()));
});
