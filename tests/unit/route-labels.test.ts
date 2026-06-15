import { describe, expect, it } from 'vitest';
import { buildToolRouteLabelMap, getStaticRouteLabel } from '@/lib/route-labels';

describe('route labels', () => {
  it('builds Persian labels for indexable tool routes from the registry', () => {
    const labels = buildToolRouteLabelMap();

    expect(labels['/pdf-tools']).toBe('ابزارهای PDF');
    expect(labels['/pdf-tools/merge/merge-pdf']).toContain('ادغام PDF');
    expect(labels['/tools']).toContain('ابزارهای مالی');
  });

  it('falls back to readable labels for structural path segments', () => {
    expect(getStaticRouteLabel('specialized')).toBe('ابزارهای تخصصی');
    expect(getStaticRouteLabel('unknown-segment')).toBe('unknown segment');
  });
});
