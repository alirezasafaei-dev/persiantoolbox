import { describe, expect, it } from 'vitest';
import {
  getFooterBrandCopy,
  getHomeHeroCopy,
  getHomeMetaDescription,
  getHomeMetaTitle,
  getHomeSectionCopy,
} from '@/lib/home-copy';

describe('home copy', () => {
  it('uses the core positioning line in hero', () => {
    const hero = getHomeHeroCopy(86);
    expect(hero.title).toContain('بدون شلوغی');
    expect(hero.titleAccent).toContain('۸۶');
  });

  it('provides section titles for homepage blocks', () => {
    const sections = getHomeSectionCopy();
    expect(sections.categories.title.length).toBeGreaterThan(0);
    expect(sections.popular.title).toContain('محبوب');
  });

  it('builds dynamic metadata strings', () => {
    expect(getHomeMetaTitle()).toContain('جعبه ابزار فارسی');
    expect(getHomeMetaDescription()).toContain('محلی');
  });

  it('includes brand description in footer copy', () => {
    const brand = getFooterBrandCopy();
    expect(brand.description).toContain('ابزار');
  });
});
