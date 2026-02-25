import { describe, expect, it } from 'vitest';
import {
  getActiveToolsCount,
  getCategories,
  getCategoryDisplayCount,
  getCategoryDisplayEntries,
  getToolsByCategory,
} from '@/lib/tools-registry';

describe('tools registry display entries', () => {
  it('falls back to category root entry for categories without child tool routes', () => {
    expect(getToolsByCategory('image-tools')).toHaveLength(0);
    expect(getToolsByCategory('date-tools')).toHaveLength(0);

    const imageEntries = getCategoryDisplayEntries('image-tools');
    const dateEntries = getCategoryDisplayEntries('date-tools');

    expect(imageEntries.map((entry) => entry.path)).toEqual(['/image-tools']);
    expect(dateEntries.map((entry) => entry.path)).toEqual(['/date-tools']);
    expect(getCategoryDisplayCount('image-tools')).toBe(1);
    expect(getCategoryDisplayCount('date-tools')).toBe(1);
  });

  it('keeps category counts based on direct tools when tool pages exist', () => {
    const financeTools = getToolsByCategory('finance-tools');
    const financeEntries = getCategoryDisplayEntries('finance-tools');

    expect(financeTools.length).toBeGreaterThan(0);
    expect(financeEntries).toHaveLength(financeTools.length);
    expect(financeEntries.every((entry) => entry.kind === 'tool')).toBe(true);
  });

  it('reports active tools based only on direct tool routes', () => {
    const activeTools = getActiveToolsCount();
    const sumOfDirectTools = getCategories().reduce(
      (sum, category) => sum + getToolsByCategory(category.id).length,
      0,
    );
    const sumOfDisplayEntries = getCategories().reduce(
      (sum, category) => sum + getCategoryDisplayCount(category.id),
      0,
    );

    expect(activeTools).toBe(sumOfDirectTools);
    expect(sumOfDisplayEntries).toBeGreaterThan(activeTools);
  });
});
