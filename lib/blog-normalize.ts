const CATEGORY_LABEL_MAP: Record<string, string> = {
  متن: 'نگارش',
  متنی: 'نگارش',
  نگارش: 'نگارش',
  ابزار: 'ابزارها',
  ابزارها: 'ابزارها',
  راهنما: 'راهنما',
  راهنماها: 'راهنما',
  آموزش: 'آموزشی',
  آموزشی: 'آموزشی',
};

export function normalizeCategoryLabel(category: unknown): string {
  let label: string;
  if (typeof category === 'string') {
    label = category.trim();
  } else if (category && typeof category === 'object' && 'name' in category) {
    label = String((category as { name?: unknown }).name ?? '').trim();
  } else {
    label = String(category ?? '').trim();
  }
  return CATEGORY_LABEL_MAP[label] ?? label;
}

export function normalizeSeriesLabel(series: unknown): string | null {
  if (!series) {
    return null;
  }
  let label: string;
  if (typeof series === 'string') {
    label = series.trim();
  } else if (typeof series === 'object' && 'name' in series) {
    label = String((series as { name?: unknown }).name ?? '').trim();
  } else {
    label = String(series).trim();
  }
  return label || null;
}

export function getCategoryRoute(category: string): string {
  return `/blog/category/${encodeURIComponent(category)}`;
}
