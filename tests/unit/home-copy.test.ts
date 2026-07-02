import { describe, expect, it } from 'vitest';
import {
  getFooterBrandCopy,
  getHomeAudienceTracks,
  getHomeHeroCopy,
  getHomeMetaDescription,
  getHomeMetaTitle,
  getHomeSearchIntents,
  getHomeSectionCopy,
  getHomeValueProofs,
} from '@/lib/home-copy';

describe('home copy', () => {
  it('uses the core positioning line in hero', () => {
    const hero = getHomeHeroCopy(86);
    expect(hero.title).toContain('بیشتر از ۱۰۰ ابزار رایگان فارسی');
    expect(hero.title).not.toContain('+');
    expect(hero.subtitle).toContain('بدون حساب کاربری');
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

  it('provides homepage value proofs for free and private positioning', () => {
    const proofs = getHomeValueProofs();
    expect(proofs).toHaveLength(3);
    expect(proofs.map((item) => item.title).join(' ')).toContain('رایگان');
    expect(proofs.map((item) => item.description).join(' ')).toContain('پردازش');
  });

  it('provides SEO search intent links for common free tools', () => {
    const intents = getHomeSearchIntents();
    expect(intents.length).toBeGreaterThanOrEqual(8);
    expect(intents.map((item) => item.label)).toContain('فشرده‌سازی PDF آنلاین');
    expect(intents.every((item) => item.href.startsWith('/'))).toBe(true);
  });

  it('provides audience tracks with direct tool links', () => {
    const tracks = getHomeAudienceTracks();
    expect(tracks).toHaveLength(4);
    expect(tracks.map((item) => item.title).join(' ')).toContain('کسب‌وکار');
    expect(tracks.flatMap((item) => item.links).length).toBeGreaterThanOrEqual(12);
  });
});
