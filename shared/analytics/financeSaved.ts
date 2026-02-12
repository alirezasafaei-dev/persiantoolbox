export type FinanceToolId = 'loan' | 'salary' | 'interest';

export type SavedFinanceCalculation = {
  id: string;
  tool: FinanceToolId;
  title: string;
  summary: string;
  createdAt: number;
};

const STORAGE_KEY = 'persiantoolbox.finance.saved.v1';
const MAX_ITEMS = 30;
const UPDATE_EVENT = 'finance-saved-updated';

function readStore(): SavedFinanceCalculation[] {
  if (typeof window === 'undefined') {
    return [];
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as SavedFinanceCalculation[];
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter(
      (item) =>
        typeof item?.id === 'string' &&
        typeof item?.tool === 'string' &&
        typeof item?.title === 'string' &&
        typeof item?.summary === 'string' &&
        typeof item?.createdAt === 'number',
    );
  } catch {
    return [];
  }
}

function writeStore(items: SavedFinanceCalculation[]) {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent(UPDATE_EVENT));
}

export function getSavedFinanceCalculations(): SavedFinanceCalculation[] {
  return readStore();
}

export function saveFinanceCalculation(input: Omit<SavedFinanceCalculation, 'id' | 'createdAt'>) {
  const current = readStore();
  const next: SavedFinanceCalculation = {
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    ...input,
  };
  writeStore([next, ...current].slice(0, MAX_ITEMS));
}

export function removeSavedFinanceCalculation(id: string) {
  writeStore(readStore().filter((item) => item.id !== id));
}

export function clearSavedFinanceCalculations() {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new CustomEvent(UPDATE_EVENT));
}

export function onFinanceSavedUpdate(listener: () => void): () => void {
  if (typeof window === 'undefined') {
    return () => undefined;
  }
  window.addEventListener(UPDATE_EVENT, listener);
  window.addEventListener('storage', listener);
  return () => {
    window.removeEventListener(UPDATE_EVENT, listener);
    window.removeEventListener('storage', listener);
  };
}
