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
  const label =
    typeof category === 'string'
      ? category.trim()
      : category && typeof category === 'object' && 'name' in category
        ? String((category as { name?: unknown }).name ?? '').trim()
        : String(category ?? '').trim();
  return CATEGORY_LABEL_MAP[label] ?? label;
}

export function normalizeSeriesLabel(series: unknown): string | null {
  if (!series) {
    return null;
  }
  const label =
    typeof series === 'string'
      ? series.trim()
      : typeof series === 'object' && 'name' in series
        ? String((series as { name?: unknown }).name ?? '').trim()
        : String(series).trim();
  return label || null;
}

export function getCategoryRoute(category: string): string {
  return `/blog/category/${encodeURIComponent(category)}`;
}
