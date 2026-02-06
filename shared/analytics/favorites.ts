type FavoritesStore = {
  updatedAt: number;
  items: string[];
};

const STORAGE_KEY = 'persian-tools.favorites.v1';

const emptyStore: FavoritesStore = {
  updatedAt: Date.now(),
  items: [],
};

function readStore(): FavoritesStore {
  if (typeof window === 'undefined') {
    return emptyStore;
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { ...emptyStore };
    }
    const parsed = JSON.parse(raw) as FavoritesStore;
    return {
      ...emptyStore,
      ...parsed,
      items: Array.isArray(parsed.items) ? parsed.items : [],
    };
  } catch {
    return { ...emptyStore };
  }
}

function writeStore(store: FavoritesStore) {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function getFavorites(): string[] {
  return readStore().items;
}

export function toggleFavorite(path: string): string[] {
  const store = readStore();
  const nextItems = store.items.includes(path)
    ? store.items.filter((item) => item !== path)
    : [path, ...store.items];
  const nextStore = {
    updatedAt: Date.now(),
    items: nextItems,
  };
  writeStore(nextStore);
  return nextItems;
}

export function clearFavorites() {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.removeItem(STORAGE_KEY);
}
