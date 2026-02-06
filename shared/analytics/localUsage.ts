type UsageStore = {
  lastUpdated: number;
  totalViews: number;
  paths: Record<string, number>;
};

const STORAGE_KEY = 'persian-tools.usage.v1';

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

export function recordPageView(path: string) {
  if (typeof window === 'undefined') {
    return;
  }
  const store = readStore();
  store.totalViews += 1;
  store.lastUpdated = Date.now();
  store.paths[path] = (store.paths[path] ?? 0) + 1;
  writeStore(store);
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
