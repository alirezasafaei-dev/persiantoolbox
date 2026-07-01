import { describe, expect, it } from 'vitest';
import {
  categoryGroups,
  getCategoriesByGroup,
  getCategoryCatalogEntries,
  getCategoryCatalogEntry,
  getCategoryLandingPath,
} from '@/lib/category-catalog';
import { getCategories } from '@/lib/tools-registry';

describe('category catalog', () => {
  it('covers every registry category', () => {
    const registryIds = getCategories().map((category) => category.id);
    const catalogIds = getCategoryCatalogEntries().map((entry) => entry.id);
    expect(catalogIds.sort()).toEqual(registryIds.sort());
  });

  it('groups all categories without overlap', () => {
    const grouped = categoryGroups.flatMap((group) => getCategoriesByGroup(group.id));
    expect(grouped).toHaveLength(getCategories().length);
    expect(new Set(grouped.map((entry) => entry.id)).size).toBe(grouped.length);
  });

  it('returns metadata for flagship categories', () => {
    const business = getCategoryCatalogEntry('business-tools');
    expect(business?.flagship).toBe(true);
    expect(business?.icon).toBeTruthy();
    expect(business?.description).toBeTruthy();
  });

  it('resolves landing paths from registry', () => {
    expect(getCategoryLandingPath('pdf-tools')).toBe('/pdf-tools');
    expect(getCategoryLandingPath('finance-tools')).toBe('/tools');
  });
});
