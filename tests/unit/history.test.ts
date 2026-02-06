import { describe, it, expect } from 'vitest';
import { buildHistoryQuery, normalizeHistoryOutputUrl } from '@/shared/history/recordHistory';

describe('History Query Builder', () => {
  it('should include limit by default', () => {
    expect(buildHistoryQuery(undefined, 50)).toBe('?limit=50');
  });

  it('should include search and tool filters', () => {
    const query = buildHistoryQuery({ search: 'merge', tool: 'pdf-merge' }, 100);
    expect(query).toBe('?limit=100&search=merge&tool=pdf-merge');
  });

  it('should include date range when provided', () => {
    const query = buildHistoryQuery({ dateRange: 'week' }, 25);
    expect(query).toBe('?limit=25&dateRange=week');
  });

  it('should ignore empty filters', () => {
    const query = buildHistoryQuery({ search: '   ', tool: '' }, 10);
    expect(query).toBe('?limit=10');
  });
});

describe('History Output Url', () => {
  it('should return undefined for empty values', () => {
    expect(normalizeHistoryOutputUrl()).toBeUndefined();
    expect(normalizeHistoryOutputUrl('   ')).toBeUndefined();
  });

  it('should drop blob and data urls', () => {
    expect(normalizeHistoryOutputUrl('blob:123')).toBeUndefined();
    expect(normalizeHistoryOutputUrl('data:application/pdf;base64,abc')).toBeUndefined();
  });

  it('should keep relative or absolute urls', () => {
    expect(normalizeHistoryOutputUrl('/api/files/123')).toBe('/api/files/123');
    expect(normalizeHistoryOutputUrl('https://persian-tools.ir/file.pdf')).toBe(
      'https://persian-tools.ir/file.pdf',
    );
  });
});
