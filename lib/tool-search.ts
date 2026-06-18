import type { ToolEntry } from '@/lib/tools-registry';
import { normalizePersianChars, stripPersianDiacritics } from '@/shared/utils/localization/persian';

export function normalizeToolSearchText(value: string): string {
  return stripPersianDiacritics(normalizePersianChars(value))
    .replace(/\u200c/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLocaleLowerCase('fa-IR');
}

export function searchTools(tools: readonly ToolEntry[], query: string): ToolEntry[] {
  const normalizedQuery = normalizeToolSearchText(query);
  if (!normalizedQuery) {
    return [];
  }

  return tools.filter((tool) => {
    const searchableText = [
      tool.title,
      tool.description,
      tool.category?.name,
      ...(tool.keywords ?? []),
    ]
      .filter((value): value is string => Boolean(value))
      .map(normalizeToolSearchText)
      .join(' ');

    return searchableText.includes(normalizedQuery);
  });
}
