import { describe, it, expect } from 'vitest';
import {
  analyzeSeoTitle,
  generateMetaDescriptions,
  analyzeHeadingStructure,
  analyzeCanonical,
  analyzeIndexability,
  analyzeRobotsTxt,
  analyzeSitemapXml,
  analyzeRedirectChain,
  extractAndClassifyLinks,
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

  it('parseHeadingsFromHtml / analyzeHeadingStructure preserves DOM order (H1/H3/H2)', () => {
    const html = '<h1>Main</h1><h3>Skipped</h3><h2>Back</h2>';
    const r = analyzeHeadingStructure(html);
    expect(r.headings.map((h) => h.tag)).toEqual(['H1', 'H3', 'H2']);
    expect(r.headings.map((h) => h.text)).toEqual(['Main', 'Skipped', 'Back']);
  });

  it('analyzeHeadingStructure detects skipped levels correctly', () => {
    const html = '<h1>Main</h1><h3>Sub</h3>';
    const r = analyzeHeadingStructure(html);
    expect(r.skippedLevels).toContain('H2');
    expect(r.missingH1).toBe(false);
  });

  it('analyzeHeadingStructure handles multiple H1', () => {
    const html = '<h1>A</h1><h1>B</h1>';
    const r = analyzeHeadingStructure(html);
    expect(r.multipleH1).toBe(true);
    expect(r.counts['H1']).toBe(2);
  });

  it('analyzeIndexability does not flag cross-page canonical when no pageUrl provided', () => {
    const html = '<link rel="canonical" href="https://example.com/other">';
    const r = analyzeIndexability(html);
    expect(r.reasons.some((reason) => reason.includes('صفحه دیگری'))).toBe(false);
    expect(r.canonical.selfRefMatch).toBeUndefined();
  });

  it('analyzeIndexability accepts matching canonical when pageUrl provided (but note: indexability fn does not forward pageUrl yet)', () => {
    // analyzeIndexability currently calls without pageUrl; test the underlying analyzeCanonical directly
    const html = '<link rel="canonical" href="https://ex.com/page">';
    const c = analyzeCanonical(html, 'https://ex.com/page');
    expect(c.selfRefMatch).toBe(true);
  });

  it('analyzeIndexability / canonical warns on different pageUrl', () => {
    const html = '<link rel="canonical" href="https://ex.com/other">';
    const c = analyzeCanonical(html, 'https://ex.com/page');
    expect(c.selfRefMatch).toBe(false);
  });

  it('analyzeRobotsTxt detects Host with protocol (http or https)', () => {
    const r1 = analyzeRobotsTxt('User-agent: *\nHost: https://ex.com');
    expect(r1.issues.some((i) => i.includes('Host'))).toBe(true);
    const r2 = analyzeRobotsTxt('User-agent: *\nHost: http://ex.com');
    expect(r2.issues.some((i) => i.includes('Host'))).toBe(true);
  });

  it('analyzeSitemapXml detects duplicate loc and invalid non-absolute loc', () => {
    const xml =
      '<urlset><url><loc>https://ex.com/a</loc></url><url><loc>https://ex.com/a</loc></url><url><loc>/relative</loc></url></urlset>';
    const r = analyzeSitemapXml(xml);
    expect(r.duplicates.length).toBe(1);
    expect(r.invalidLocs.length).toBe(1);
    expect(r.urlCount).toBe(3);
  });

  it('build*JsonLd output is valid via JSON.stringify (no manual concat)', () => {
    const faq = buildFaqJsonLd([{ q: 'Q', a: 'A' }]);
    const str = JSON.stringify(faq);
    expect(str).toContain('FAQPage');
    expect(() => JSON.parse(str)).not.toThrow();
    const how = buildHowToJsonLd('T', '', ['s1', 's2']);
    expect(JSON.parse(JSON.stringify(how))['@type']).toBe('HowTo');
  });

  it('computePersianKeywordDensity handles Arabic ي ك normalization', () => {
    const r = computePersianKeywordDensity('ي كتاب ي كتاب', 'کتاب');
    expect(r.keywordDensity).toBeGreaterThan(0);
    expect(r.topTerms.some((t: any) => t.term.includes('کتاب'))).toBe(true);
  });

  it('extractAndClassifyLinks classifies hash/mailto/tel/javascript/empty/internal/external', () => {
    // jsdom available in vitest env
    const html =
      '<a href="#h">h</a><a href="mailto:a@b">m</a><a href="tel:123">t</a><a href="javascript:void(0)">j</a><a href="">e</a><a href="/i">i</a><a href="https://ex.com">e</a><a href="https://other.com">ext</a>';
    const links = extractAndClassifyLinks(html, 'ex.com');
    const types = links.map((l) => l.type).sort();
    expect(types).toEqual([
      'empty',
      'external',
      'hash',
      'internal',
      'internal',
      'javascript',
      'mailto',
      'tel',
    ]);
  });

  it('analyzeRedirectChain flags >3 hops and mixed protocol', () => {
    const hops = [
      { url: 'http://ex.com/1', status: 301 },
      { url: 'https://ex.com/2', status: 302 },
      { url: 'https://ex.com/3', status: 302 },
      { url: 'https://ex.com/4', status: 200 },
    ];
    const r = analyzeRedirectChain(hops);
    expect(r.tooManyHops).toBe(true);
    expect(r.mixedProtocol).toBe(true);
  });
});
