import { describe, it, expect } from 'vitest';
import {
  analyzeSeoTitle,
  generateMetaDescriptions,
  analyzeHeadingStructure,
  analyzeCanonical,
  analyzeRobotsTxt,
  analyzeSitemapXml,
  computePersianKeywordDensity,
  buildFaqJsonLd,
  buildHowToJsonLd,
  buildLocalBusinessJsonLd,
  normalizePersianText,
} from '@/lib/seo-utils';

describe('seo-utils', () => {
  it('analyzeSeoTitle scores and recommends', () => {
    const r = analyzeSeoTitle('خرید گوشی موبایل سامسونگ | فروشگاه آنلاین', 'گوشی موبایل');
    expect(r.score).toBeGreaterThan(60);
    expect(r.lengthStatus).toBe('good');
    expect(r.hasPrimaryKeyword).toBe(true);
  });

  it('generateMetaDescriptions returns 3 suggestions around length', () => {
    const res = generateMetaDescriptions('راهنمای کامل محاسبه وام', 'وام');
    expect(res.length).toBe(3);
    res.forEach((s) => {
      expect(s.length).toBeGreaterThan(90);
      expect(s.length).toBeLessThan(170);
    });
  });

  it('analyzeHeadingStructure detects missing H1 and multiples', () => {
    const html = '<h2>sec</h2><h1>main</h1><h1>dup</h1>';
    const r = analyzeHeadingStructure(html);
    expect(r.missingH1).toBe(false);
    expect(r.multipleH1).toBe(true);
    expect(r.counts['H1']).toBe(2);
  });

  it('analyzeCanonical flags missing and relative', () => {
    const html = '<html><head></head></html>';
    const r = analyzeCanonical(html);
    expect(r.missing).toBe(true);
    const rel = analyzeCanonical('<link rel="canonical" href="/foo">');
    expect(rel.isRelative).toBe(true);
  });

  it('analyzeRobotsTxt detects common mistakes', () => {
    const bad = 'Disallow: /\nSitemap: https://ex.com/s.xml';
    const r = analyzeRobotsTxt(bad);
    expect(r.hasUserAgent).toBe(false);
    expect(r.issues.some((i) => i.includes('User-agent'))).toBe(true);
  });

  it('analyzeSitemapXml counts and finds dups', () => {
    const xml =
      '<?xml><urlset><url><loc>https://a.com/1</loc></url><url><loc>https://a.com/1</loc></url></urlset>';
    const r = analyzeSitemapXml(xml);
    expect(r.urlCount).toBe(2);
    expect(r.duplicates.length).toBe(1);
  });

  it('computePersianKeywordDensity normalizes and filters', () => {
    const text = 'سلام دنیا دنیا دنیا این یک تست است برای بررسی چگالی کلمات فارسی';
    const r = computePersianKeywordDensity(text, 'دنیا');
    expect(r.totalWords).toBeGreaterThan(5);
    expect(r.keywordDensity).toBeGreaterThan(0);
    expect(r.topTerms.some((t) => t.term.includes('دنیا'))).toBe(true);
  });

  it('buildFaqJsonLd produces valid structure', () => {
    const j = buildFaqJsonLd([{ q: 'سوال؟', a: 'جواب.' }]) as any;
    expect(j['@type']).toBe('FAQPage');
    expect(j.mainEntity.length).toBe(1);
  });

  it('buildHowToJsonLd requires steps', () => {
    const j = buildHowToJsonLd('عنوان', 'توضیح', ['گام۱', 'گام۲']);
    expect((j as any)['@type']).toBe('HowTo');
  });

  it('buildLocalBusinessJsonLd includes address when provided', () => {
    const j = buildLocalBusinessJsonLd({ name: 'فروشگاه', city: 'تهران' }) as any;
    expect(j['@type']).toBe('LocalBusiness');
    expect(j.address).toBeTruthy();
  });

  it('normalizePersianText converts ي ك', () => {
    expect(normalizePersianText('كتاب يزد')).toContain('کتاب یزد');
  });
});
