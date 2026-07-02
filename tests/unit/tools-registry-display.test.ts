import { describe, expect, it } from 'vitest';
import {
  FREE_TOOLS_DISPLAY_COUNT_LABEL,
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
    const persianDigits: Record<string, string> = {
      '0': '۰',
      '1': '۱',
      '2': '۲',
      '3': '۳',
      '4': '۴',
      '5': '۵',
      '6': '۶',
      '7': '۷',
      '8': '۸',
      '9': '۹',
    };
    expect(FREE_TOOLS_DISPLAY_COUNT_LABEL).toBe(
      String(canonicalCount).replace(/\d/g, (digit) => persianDigits[digit] ?? digit),
    );
  });
});
