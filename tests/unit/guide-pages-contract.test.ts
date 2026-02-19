import { describe, expect, it } from 'vitest';
import { guidePages } from '@/lib/guide-pages';

describe('guide pages editorial contract', () => {
  it('keeps at least 10 guides', () => {
    expect(guidePages.length).toBeGreaterThanOrEqual(10);
  });

  it('ensures required editorial fields exist', () => {
    for (const guide of guidePages) {
      expect(guide.slug.length).toBeGreaterThan(3);
      expect(guide.title.length).toBeGreaterThan(6);
      expect(guide.summary.length).toBeGreaterThan(20);
      expect(guide.body.split(/\s+/).length).toBeGreaterThanOrEqual(60);
      expect(guide.faq.length).toBeGreaterThanOrEqual(2);
      expect(guide.internalLinks.length).toBeGreaterThanOrEqual(2);
    }
  });
});
