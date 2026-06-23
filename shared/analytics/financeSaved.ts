export type FinanceToolId =
  | 'loan'
  | 'salary'
  | 'interest'
  | 'currency-converter'
  | 'inflation-calculator'
  | 'investment-calculator'
  | 'tax-calculator'
  | 'bank-rate-comparator'
  | 'living-cost'
  | 'insurance-calculator'
  | 'bonus-calculator'
  | 'severance-calculator'
  | 'leave-calculator'
  | 'real-purchasing-power'
  | 'overtime-calculator'
  | 'rent-vs-buy'
  | 'loan-vs-investment'
  | 'retirement-calculator';

export type SavedFinanceCalculation = {
  id: string;
  tool: FinanceToolId;
  title: string;
  summary: string;
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
  createdAt: number;
};

const STORAGE_KEY = 'persiantoolbox.finance.saved.v1';
const MAX_ITEMS = 50;
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

function writeStore(items: SavedFinanceCalculation[]): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    const trimmed = items.slice(0, MAX_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    window.dispatchEvent(new Event(UPDATE_EVENT));
  } catch {
    // ignore quota errors
  }
}

export function saveFinanceCalculation(
  calc: Omit<SavedFinanceCalculation, 'id' | 'createdAt'>,
): SavedFinanceCalculation {
  const entry: SavedFinanceCalculation = {
    ...calc,
    id: `fin_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: Date.now(),
  };
  const store = readStore();
  writeStore([entry, ...store]);
  return entry;
}

export function getSavedFinanceCalculations(tool?: FinanceToolId): SavedFinanceCalculation[] {
  const store = readStore();
  if (tool) {
    return store.filter((item) => item.tool === tool);
  }
  return store;
}

export function deleteSavedFinanceCalculation(id: string): void {
  const store = readStore();
  writeStore(store.filter((item) => item.id !== id));
}

export function clearSavedFinanceCalculations(): void {
  writeStore([]);
}

export function onFinanceSavedUpdate(callback: () => void): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }
  window.addEventListener(UPDATE_EVENT, callback);
  return () => window.removeEventListener(UPDATE_EVENT, callback);
}

export function exportSavedCalculations(format: 'json' | 'csv' = 'json'): void {
  const items = readStore();
  if (items.length === 0) {
    return;
  }

  if (format === 'json') {
    const blob = new Blob([JSON.stringify(items, null, 2)], { type: 'application/json' });
    downloadBlob(blob, 'persiantoolbox-scenarios.json');
    return;
  }

  const headers = ['عنوان', 'ابزار', 'خلاصه', 'تاریخ'];
  const rows = items.map((item) => [
    item.title,
    item.tool,
    item.summary,
    new Date(item.createdAt).toLocaleString('fa-IR'),
  ]);
  const csv = [headers, ...rows].map((row) => row.map((c) => `"${c}"`).join(',')).join('\n');
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' });
  downloadBlob(blob, 'persiantoolbox-scenarios.csv');
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
