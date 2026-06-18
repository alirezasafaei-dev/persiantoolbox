import { describe, expect, it } from 'vitest';
import type { ToolEntry } from '@/lib/tools-registry';
import { normalizeToolSearchText, searchTools } from '@/lib/tool-search';

const tool: ToolEntry = {
  id: 'date-converter',
  path: '/date-tools/converter',
  title: 'تبدیل تاریخ',
  description: 'تبدیل تاریخ شمسی و میلادی',
  keywords: ['تقویم'],
  indexable: true,
  kind: 'tool',
  category: {
    id: 'date-tools',
    name: 'ابزارهای تاریخ',
    path: '/date-tools',
  },
  tier: 'Offline-Guaranteed',
};

describe('tool search', () => {
  it('normalizes Arabic keyboard variants and diacritics', () => {
    expect(normalizeToolSearchText('  تَاريخ  ')).toBe('تاریخ');
  });

  it.each(['تاريخ', 'شمسی', 'تقويم', 'ابزارهای تاريخ'])(
    'matches all searchable fields for %s',
    (query) => {
      expect(searchTools([tool], query)).toEqual([tool]);
    },
  );

  it('returns no tools for a blank query', () => {
    expect(searchTools([tool], '   ')).toEqual([]);
  });
});
