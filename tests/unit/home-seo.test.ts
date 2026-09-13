import { describe, expect, it } from 'vitest';
import { siteUrl } from '@/lib/seo';
import { getHomeMetaDescription, getHomeMetaTitle } from '@/lib/home-copy';
import { getToolByPathOrThrow } from '@/lib/tools-registry';

describe('homepage SEO helpers', () => {
  it('search action URL points to /search route', () => {
    const searchTemplate = `${siteUrl}/search?q={search_term_string}`;
    expect(searchTemplate).toContain('/search?q=');
    expect(searchTemplate).not.toContain('/?q=');
  });

  it('targets the homepage query shown in Search Console without keyword stuffing', () => {
    expect(getHomeMetaTitle()).toContain('جعبه ابزار آنلاین فارسی');
    expect(getHomeMetaDescription()).toContain('جعبه ابزار آنلاین');
    expect(getHomeMetaDescription()).toContain('رایگان');
  });

  it('keeps high-impression opportunity pages aligned with their queries', () => {
    expect(getToolByPathOrThrow('/tools/check-penalty').description).toContain('محاسبه تأخیر تأدیه');
    expect(getToolByPathOrThrow('/career-tools/work-certificate').description).toContain('PDF');
    expect(getToolByPathOrThrow('/tools/invoice-generator').title).toContain('فاکتور آنلاین');
    expect(getToolByPathOrThrow('/pdf-tools/split/split-pdf').title).toContain('تقسیم PDF آنلاین');
    expect(getToolByPathOrThrow('/validation-tools/national-id').title).toContain('صحت کد ملی');
  });
});
