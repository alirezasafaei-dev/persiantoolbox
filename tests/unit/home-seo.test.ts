import { describe, expect, it } from 'vitest';
import { siteDescription, siteUrl } from '@/lib/seo';
import { getHomeMetaDescription, getHomeMetaTitle } from '@/lib/home-copy';
import { getToolByPathOrThrow } from '@/lib/tools-registry';
import sitemap from '@/app/sitemap';

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

  it('describes local processing without an absolute site-wide claim', () => {
    expect(siteDescription).toContain('بسیاری از ابزارها');
    expect(siteDescription).toContain('صفحه شفافیت فنی');
    expect(siteDescription).not.toContain('تمام پردازش‌ها');
    expect(siteDescription).not.toContain('داده‌ها از دستگاه خارج نمی‌شوند');
  });

  it('keeps high-impression opportunity pages aligned with their queries', () => {
    expect(getToolByPathOrThrow('/tools/check-penalty').description).toContain(
      'محاسبه تأخیر تأدیه',
    );
    expect(getToolByPathOrThrow('/career-tools/work-certificate').description).toContain('PDF');
    expect(getToolByPathOrThrow('/tools/invoice-generator').title).toContain('فاکتور آنلاین');
    expect(getToolByPathOrThrow('/pdf-tools/split/split-pdf').title).toContain('تقسیم PDF آنلاین');
    expect(getToolByPathOrThrow('/validation-tools/national-id').title).toContain('صحت کد ملی');
    expect(getToolByPathOrThrow('/pdf-tools/edit/add-page-numbers').title).toContain(
      'شماره گذاری صفحات PDF آنلاین',
    );
    expect(getToolByPathOrThrow('/validation-tools/postal-code').title).toContain(
      'بررسی صحت کدپستی آنلاین',
    );
  });

  it('dates SEO-updated routes for the next sitemap crawl', () => {
    const changedRoutes = [
      '/tools/check-penalty',
      '/tools/invoice-generator',
      '/pdf-tools/split/split-pdf',
      '/validation-tools/national-id',
      '/pdf-tools/edit/add-page-numbers',
      '/validation-tools/postal-code',
    ];
    for (const route of changedRoutes) {
      expect(getToolByPathOrThrow(route).lastModified).toBe('2026-09-13');
    }
    expect(
      sitemap().find((entry) => entry.url === 'https://persiantoolbox.ir/')?.lastModified,
    ).toBe('2026-09-13');
  });
});
