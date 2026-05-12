type UsageStore = {
  lastUpdated: number;
  totalViews: number;
  paths: Record<string, number>;
};

const STORAGE_KEY = 'persian-tools.usage.v1';
const PATH_VIEW_WINDOW_KEY = 'persian-tools.usage.path-views.v1';
const PATH_VIEW_MIN_INTERVAL_MS = 24 * 60 * 60 * 1000;

const emptyStore: UsageStore = {
  lastUpdated: Date.now(),
  totalViews: 0,
  paths: {},
};

function readStore(): UsageStore {
  if (typeof window === 'undefined') {
    return emptyStore;
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { ...emptyStore };
    }
    const parsed = JSON.parse(raw) as UsageStore;
    return {
      ...emptyStore,
      ...parsed,
      paths: { ...emptyStore.paths, ...(parsed.paths ?? {}) },
    };
  } catch {
    return { ...emptyStore };
  }
}

function writeStore(store: UsageStore) {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

function readPathViewWindow(): Record<string, number> {
  if (typeof window === 'undefined') {
    return {};
  }
  try {
    const raw = window.localStorage.getItem(PATH_VIEW_WINDOW_KEY);
    if (!raw) {
      return {};
    }
    const parsed = JSON.parse(raw) as Record<string, number>;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function isPathInWindow(path: string, now = Date.now()): boolean {
  if (typeof path !== 'string' || !path) {
    return false;
  }
  const windowMap = readPathViewWindow();
  const lastViewTs = windowMap[path];
  if (typeof lastViewTs !== 'number' || Number.isNaN(lastViewTs)) {
    return false;
  }
  return now - lastViewTs < PATH_VIEW_MIN_INTERVAL_MS;
}

function updatePathViewWindow(path: string, now = Date.now()) {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    const windowMap = readPathViewWindow();
    windowMap[path] = now;
    window.localStorage.setItem(PATH_VIEW_WINDOW_KEY, JSON.stringify(windowMap));
  } catch {
    window.localStorage.setItem(PATH_VIEW_WINDOW_KEY, JSON.stringify({ [path]: now }));
  }
}

export function recordPageView(path: string) {
  if (typeof window === 'undefined') {
    return;
  }
  const now = Date.now();
  if (!path || isPathInWindow(path, now)) {
    return;
  }
  const store = readStore();
  store.totalViews += 1;
  store.lastUpdated = Date.now();
  store.paths[path] = (store.paths[path] ?? 0) + 1;
  writeStore(store);
  updatePathViewWindow(path, now);
}

export function getUsageSnapshot(): UsageStore {
  return readStore();
}

export function clearUsage() {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.removeItem(STORAGE_KEY);
}
