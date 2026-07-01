import { describe, expect, it } from 'vitest';
import {
  getActiveToolsCount,
  getCategoryDisplayEntries,
  getDisplayToolsCount,
  getToolCountForDisplay,
  getToolsByCategory,
} from '@/lib/tools-registry';

describe('tools registry display entries', () => {
  it('returns direct tools for categories with child tool routes', () => {
    const dateTools = getToolsByCategory('date-tools');
    expect(dateTools.length).toBeGreaterThan(0);

    const dateEntries = getCategoryDisplayEntries('date-tools');
    expect(dateEntries).toHaveLength(dateTools.length);
  });

  it('shows direct tools for categories with child tool routes', () => {
    const imageTools = getToolsByCategory('image-tools');
    const imageEntries = getCategoryDisplayEntries('image-tools');

    expect(imageTools.length).toBeGreaterThan(0);
    expect(imageEntries).toHaveLength(imageTools.length);
  });

  it('keeps category counts based on direct tools when tool pages exist', () => {
    const financeTools = getToolsByCategory('finance-tools');
    const financeEntries = getCategoryDisplayEntries('finance-tools');

    expect(financeTools.length).toBeGreaterThan(0);
    expect(financeEntries).toHaveLength(financeTools.length);
    expect(financeEntries.every((entry) => entry.kind === 'tool')).toBe(true);
  });

  it('uses a single canonical counter for site-wide display totals', () => {
    const activeTools = getActiveToolsCount();
    const displayTools = getDisplayToolsCount();
    const canonicalCount = getToolCountForDisplay();

    expect(displayTools).toBe(canonicalCount);
    expect(activeTools).toBeGreaterThanOrEqual(canonicalCount);
  });
});
