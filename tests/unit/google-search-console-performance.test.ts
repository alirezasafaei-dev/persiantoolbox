import { afterEach, describe, expect, it } from 'vitest';
import { __testing } from '@/lib/server/google-search-console';

const originalSite = process.env['GOOGLE_SEARCH_CONSOLE_SITE_URL'];

afterEach(() => {
  if (originalSite === undefined) {
    delete process.env['GOOGLE_SEARCH_CONSOLE_SITE_URL'];
  } else {
    process.env['GOOGLE_SEARCH_CONSOLE_SITE_URL'] = originalSite;
  }
});

describe('Google Search Console performance normalization', () => {
  it('builds adjacent 28-day comparison windows with a two-day reporting lag', () => {
    const windows = __testing.getComparisonWindows(new Date('2026-07-18T12:00:00.000Z'));

    expect(windows.current).toEqual({ startDate: '2026-06-19', endDate: '2026-07-16' });
    expect(windows.previous).toEqual({ startDate: '2026-05-22', endDate: '2026-06-18' });
  });

  it('normalizes aggregate metrics and comparison deltas', () => {
    const current = __testing.normalizeTotals([
      { clicks: 30, impressions: 300, ctr: 0.1, position: 8 },
    ]);
    const previous = __testing.normalizeTotals([
      { clicks: 10, impressions: 200, ctr: 0.05, position: 9 },
    ]);

    expect(__testing.buildComparison(current, previous)).toEqual({
      clicks: 2,
      impressions: 0.5,
      ctr: 0.05,
      position: -1,
    });
  });

  it('clamps public row limits', () => {
    expect(__testing.clampRowLimit(undefined)).toBe(100);
    expect(__testing.clampRowLimit(0)).toBe(1);
    expect(__testing.clampRowLimit(5000)).toBe(1000);
    expect(__testing.clampRowLimit(55.9)).toBe(55);
  });

  it('accepts only page filters belonging to the configured site', () => {
    expect(__testing.normalizePageFilter('/salary')).toContain('/salary');
    expect(__testing.normalizePageFilter('https://www.persiantoolbox.ir/loan')).toContain('/loan');
    expect(() => __testing.normalizePageFilter('https://example.com/')).toThrow(
      'Page filter must belong to the configured site',
    );
  });

  it('prioritizes high-impression, low-CTR query opportunities', () => {
    const opportunities = __testing.buildOpportunities([
      { key: 'high opportunity', clicks: 1, impressions: 200, ctr: 0.005, position: 8 },
      { key: 'healthy ctr', clicks: 40, impressions: 200, ctr: 0.2, position: 5 },
      { key: 'too few impressions', clicks: 0, impressions: 5, ctr: 0, position: 7 },
    ]);

    expect(opportunities).toHaveLength(1);
    expect(opportunities[0]?.key).toBe('high opportunity');
    expect(opportunities[0]?.score).toBeGreaterThan(0);
  });
});
