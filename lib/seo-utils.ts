// lib/seo-utils.ts
// Pure functions for SEO tools. All local processing. No side effects.

import { normalizeArabicToPersian } from '@/lib/persian-writing/normalizeCharacters';

// Common Persian stopwords for density analysis (small curated list)
export const PERSIAN_STOPWORDS = new Set([
  'و',
  'در',
  'به',
  'از',
  'که',
  'این',
  'است',
  'را',
  'با',
  'های',
  'برای',
  'شد',
  'شدند',
  'می',
  'کرد',
  'کند',
  'بود',
  'باشد',
  'شد',
  'شده',
  'آن',
  'های',
  'یک',
  'دو',
  'سه',
  'چهار',
  'پنج',
  'شش',
  'هفت',
  'هشت',
  'نه',
  'ده',
  'یا',
  'هم',
  'نیز',
  'اما',
  'اگر',
  'تا',
  'هر',
  'همه',
  'ما',
  'شما',
  'آنها',
  'من',
  'تو',
  'او',
  'آن',
  'اینها',
  'مثل',
  'مانند',
  'بین',
  'روی',
  'زیر',
  'بالا',
  'پیش',
  'پس',
  'کنید',
  'کنم',
  'کردن',
  'دادن',
  'گرفتن',
  'آمدن',
  'رفتن',
  'شدن',
  'بودن',
  'داشتن',
  'کرد',
  'شد',
  'می‌شود',
  'می‌کند',
  'می‌باشد',
  'نیست',
  'نیستند',
]);

export function normalizePersianText(text: string): string {
  let t = text || '';
  t = normalizeArabicToPersian(t);
  // Normalize various spaces and remove control chars
  t = t.replace(/[\u200c\u200b\ufeff]/g, ' '); // ZWNJ etc to space for word split
  t = t.replace(/[\s]+/g, ' ').trim();
  return t;
}

export function tokenizePersian(text: string): string[] {
  const normalized = normalizePersianText(text);
  // Remove punctuation but keep persian letters, numbers, basic
  const cleaned = normalized.replace(/[،؛؟!.,:;()[\]{}"“”'«»/\\\-–—]/g, ' ');
  return cleaned
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w.length > 0);
}

export function filterStopwords(words: string[]): string[] {
  return words.filter((w) => !PERSIAN_STOPWORDS.has(w) && w.length > 1);
}

export type KeywordDensityResult = {
  totalWords: number;
  totalChars: number;
  uniqueWords: number;
  topTerms: Array<{ term: string; count: number; density: number }>;
  keyword?: string;
  keywordCount?: number;
  keywordDensity?: number;
};

export function computePersianKeywordDensity(
  text: string,
  customKeyword?: string,
): KeywordDensityResult {
  const words = tokenizePersian(text);
  const filtered = filterStopwords(words);
  const totalWords = words.length;
  const totalChars = text.replace(/\s/g, '').length;

  const freq = new Map<string, number>();
  for (const w of filtered) {
    freq.set(w, (freq.get(w) ?? 0) + 1);
  }

  const topTerms = Array.from(freq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([term, count]) => ({
      term,
      count,
      density: totalWords > 0 ? Math.round((count / totalWords) * 1000) / 10 : 0,
    }));

  let result: KeywordDensityResult = {
    totalWords,
    totalChars,
    uniqueWords: freq.size,
    topTerms,
  };

  if (customKeyword?.trim()) {
    const kwNorm = normalizePersianText(customKeyword).toLowerCase().trim();
    const kwWords = tokenizePersian(kwNorm);
    let count = 0;
    // Count occurrences of the phrase or words
    const joined = words.map((w) => w.toLowerCase());
    if (kwWords.length === 1) {
      count = joined.filter((w) => w === kwWords[0]).length;
    } else {
      // simple phrase match in sequence rough
      const textLower = joined.join(' ');
      count = (textLower.match(new RegExp(kwNorm.replace(/\s+/g, '\\s+'), 'g')) ?? []).length;
      // fallback count individual if phrase not found much
      if (count === 0) {
        count = kwWords.reduce((acc, w) => acc + joined.filter((x) => x === w).length, 0);
      }
    }
    const density = totalWords > 0 ? Math.round((count / totalWords) * 1000) / 10 : 0;
    result = {
      ...result,
      keyword: customKeyword.trim(),
      keywordCount: count,
      keywordDensity: density,
    };
  }

  return result;
}

// Title analyzer
export type TitleAnalysis = {
  score: number;
  length: number;
  lengthStatus: 'short' | 'good' | 'long';
  hasPrimaryKeyword: boolean;
  hasBrandSeparator: boolean;
  duplicateSeparators: boolean;
  recommendations: string[];
};

export function analyzeSeoTitle(title: string, primaryKeyword?: string): TitleAnalysis {
  const t = (title || '').trim();
  const len = t.length;
  let lengthStatus: TitleAnalysis['lengthStatus'] = 'good';
  let score = 70;

  if (len < 30) {
    lengthStatus = 'short';
    score -= 15;
  } else if (len > 70) {
    lengthStatus = 'long';
    score -= 10;
  } else if (len < 40 || len > 60) {
    score -= 5;
  }

  const hasPrimaryKeyword = !!(
    primaryKeyword?.trim() && t.toLowerCase().includes(primaryKeyword.toLowerCase().trim())
  );
  if (primaryKeyword?.trim()) {
    if (hasPrimaryKeyword) {
      score += 10;
    } else {
      score -= 10;
    }
  }

  const separators = (t.match(/[|–—-]/g) ?? []).length;
  const hasBrandSeparator = separators > 0;
  const duplicateSeparators = separators > 1;

  if (duplicateSeparators) {
    score -= 8;
  }
  if (hasBrandSeparator && !duplicateSeparators) {
    score += 5;
  }

  const recs: string[] = [];
  if (lengthStatus === 'short') {
    recs.push('عنوان کوتاه است. آن را به حدود ۵۰-۶۰ کاراکتر برسانید.');
  }
  if (lengthStatus === 'long') {
    recs.push('عنوان طولانی است. گوگل ممکن است آن را کوتاه کند. به زیر ۶۰ کاراکتر نگه دارید.');
  }
  if (primaryKeyword && !hasPrimaryKeyword) {
    recs.push('کلمه کلیدی اصلی را در عنوان بگنجانید (ترجیحاً نزدیک ابتدا).');
  }
  if (duplicateSeparators) {
    recs.push('از تکرار جداکننده‌ها (| یا -) اجتناب کنید.');
  }
  if (!hasBrandSeparator && len > 40) {
    recs.push('برای برند از جداکننده مثل | یا - استفاده کنید.');
  }
  if (recs.length === 0) {
    recs.push('عنوان خوب به نظر می‌رسد.');
  }

  score = Math.max(0, Math.min(100, Math.round(score)));

  return {
    score,
    length: len,
    lengthStatus,
    hasPrimaryKeyword,
    hasBrandSeparator,
    duplicateSeparators,
    recommendations: recs,
  };
}

// Meta description generator (rule-based, template)
export function generateMetaDescriptions(topic: string, keyword?: string): string[] {
  const t = topic.trim();
  if (!t) {
    return [];
  }
  const kw = (keyword ?? '').trim();
  const base = t.length > 80 ? `${t.slice(0, 77)}...` : t;
  const suggestions: string[] = [];

  const templates = [
    `${base} — راهنمای کامل و کاربردی. ${kw ? `با تمرکز بر ${kw} ` : ''}اطلاعات به‌روز و عملی.`,
    `${kw ? `${kw} | ` : ''}${base}. نکات مهم، مثال‌ها و راهکارهای عملی را اینجا بخوانید.`,
    `همه چیز درباره ${base} ${kw ? `و ${kw}` : ''}. راهنمای فارسی و کاربردی برای استفاده روزمره.`,
  ];

  for (let s of templates) {
    if (s.length > 165) {
      s = `${s.slice(0, 162)}...`;
    }
    if (s.length < 110) {
      s = `${s} برای اطلاعات بیشتر کلیک کنید.`;
    }
    suggestions.push(s);
  }
  return suggestions.slice(0, 3);
}

// HTML parsers - safe client DOMParser
export function parseHeadingsFromHtml(html: string): { tag: string; text: string }[] {
  if (typeof window === 'undefined') {
    return [];
  } // server guard, use in client
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const headings: { tag: string; text: string }[] = [];
    const els = doc.querySelectorAll('h1,h2,h3,h4,h5,h6');
    els.forEach((el) => {
      const tag = (el.tagName || '').toUpperCase();
      const text = (el.textContent ?? '').trim().replace(/\s+/g, ' ');
      if (
        text &&
        (tag === 'H1' ||
          tag === 'H2' ||
          tag === 'H3' ||
          tag === 'H4' ||
          tag === 'H5' ||
          tag === 'H6')
      ) {
        headings.push({ tag, text });
      }
    });
    return headings;
  } catch {
    return [];
  }
}

export type HeadingReport = {
  headings: { tag: string; text: string }[];
  counts: Record<string, number>;
  missingH1: boolean;
  multipleH1: boolean;
  skippedLevels: string[];
  orderIssues: string[];
};

export function analyzeHeadingStructure(html: string): HeadingReport {
  const headings = parseHeadingsFromHtml(html);
  const counts: Record<string, number> = { H1: 0, H2: 0, H3: 0, H4: 0, H5: 0, H6: 0 };
  headings.forEach((h) => {
    counts[h.tag] = (counts[h.tag] ?? 0) + 1;
  });

  const missingH1 = (counts['H1'] ?? 0) === 0;
  const multipleH1 = (counts['H1'] ?? 0) > 1;

  // Detect skipped levels
  const present = [1, 2, 3, 4, 5, 6].filter((n) => (counts[`H${n}`] ?? 0) > 0);
  const skippedLevels: string[] = [];
  for (let i = 0; i < present.length - 1; i++) {
    const curr = present[i] ?? 0;
    const next = present[i + 1] ?? 0;
    if (next > curr + 1) {
      for (let s = curr + 1; s < next; s++) {
        skippedLevels.push(`H${s}`);
      }
    }
  }

  // Simple order check: H numbers non-decreasing in sequence
  const orderIssues: string[] = [];
  let prev = 0;
  headings.forEach((h, idx) => {
    const num = parseInt(h.tag.slice(1), 10);
    if (num < prev - 1 && idx > 0) {
      // allow some but flag big drops
      orderIssues.push(`پرش نامنظم بعد از ${h.tag}`);
    }
    prev = num;
  });

  return {
    headings,
    counts,
    missingH1,
    multipleH1,
    skippedLevels: [...new Set(skippedLevels)],
    orderIssues,
  };
}

export function extractCanonicalFromHtml(html: string): string[] {
  const results: string[] = [];
  // DOMParser path (browser + jsdom)
  try {
    if (typeof window !== 'undefined' && window.DOMParser) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const links = Array.from(doc.querySelectorAll('link[rel="canonical"]'));
      links.forEach((l) => {
        const href = l.getAttribute('href') ?? (l as HTMLLinkElement).href;
        if (href) {
          results.push(href);
        }
      });
    }
  } catch {
    // Fall back to regex parsing below.
  }
  if (results.length === 0) {
    // regex fallback
    const matches = html.match(/<link[^>]*rel=["']canonical["'][^>]*>/gi) ?? [];
    matches.forEach((m) => {
      const h = m.match(/href=["']([^"']+)["']/i);
      if (h?.[1]) {
        results.push(h[1]);
      }
    });
  }
  return results;
}

export type CanonicalReport = {
  canonicals: string[];
  missing: boolean;
  multiple: boolean;
  isRelative: boolean;
  selfRefMatch?: boolean | undefined;
};

export function analyzeCanonical(html: string, pageUrl?: string): CanonicalReport {
  const canonicals = extractCanonicalFromHtml(html);
  const missing = canonicals.length === 0;
  const multiple = canonicals.length > 1;
  const first = canonicals[0] ?? '';
  const isRelative = !!first && !/^https?:\/\//i.test(first);
  let selfRefMatch: boolean | undefined;
  if (pageUrl && first) {
    try {
      const normFirst = new URL(first, pageUrl).toString().replace(/\/$/, '');
      const normPage = new URL(pageUrl).toString().replace(/\/$/, '');
      selfRefMatch = normFirst === normPage;
    } catch {
      selfRefMatch = false;
    }
  }
  return { canonicals, missing, multiple, isRelative, selfRefMatch };
}

export type OgTag = { property?: string | undefined; name?: string | undefined; content: string };

export function extractOgTags(html: string): OgTag[] {
  if (typeof window === 'undefined') {
    return [];
  }
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const metas = Array.from(
      doc.querySelectorAll(
        'meta[property^="og:"], meta[name^="og:"], meta[property^="twitter:"], meta[name^="twitter:"]',
      ),
    );
    return metas
      .map((m) => {
        const el = m as HTMLMetaElement;
        return {
          property: el.getAttribute('property') ?? undefined,
          name: el.getAttribute('name') ?? undefined,
          content: el.getAttribute('content') ?? '',
        } as OgTag;
      })
      .filter((t) => t.content);
  } catch {
    return [];
  }
}

export type OgReport = {
  tags: OgTag[];
  hasOgTitle: boolean;
  hasOgDesc: boolean;
  hasOgImage: boolean;
  hasOgUrl: boolean;
  hasTwitterTitle: boolean;
  hasTwitterDesc: boolean;
  hasTwitterImage: boolean;
  missingRequired: string[];
};

export function analyzeOpenGraph(html: string): OgReport {
  const tags = extractOgTags(html);
  const get = (p: string) =>
    tags.find((t) => (t.property ?? t.name ?? '').toLowerCase() === p.toLowerCase())?.content;
  const hasOgTitle = !!get('og:title');
  const hasOgDesc = !!get('og:description');
  const hasOgImage = !!get('og:image');
  const hasOgUrl = !!get('og:url');
  const hasTwitterTitle = !!get('twitter:title');
  const hasTwitterDesc = !!get('twitter:description');
  const hasTwitterImage = !!get('twitter:image');

  const missingRequired: string[] = [];
  if (!hasOgTitle) {
    missingRequired.push('og:title');
  }
  if (!hasOgDesc) {
    missingRequired.push('og:description');
  }
  if (!hasOgImage) {
    missingRequired.push('og:image');
  }

  return {
    tags,
    hasOgTitle,
    hasOgDesc,
    hasOgImage,
    hasOgUrl,
    hasTwitterTitle,
    hasTwitterDesc,
    hasTwitterImage,
    missingRequired,
  };
}

// Robots.txt parser
export type RobotsReport = {
  lines: string[];
  hasUserAgent: boolean;
  sitemaps: string[];
  disallows: string[];
  allows: string[];
  hasCrawlDelay: boolean;
  issues: string[];
  recommendations: string[];
};

export function analyzeRobotsTxt(content: string): RobotsReport {
  const lines = content
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  const lower = lines.map((l) => l.toLowerCase());
  const hasUserAgent = lower.some((l) => l.startsWith('user-agent:'));
  const sitemaps = lines
    .filter((l) => /^sitemap:/i.test(l))
    .map((l) => l.replace(/^sitemap:\s*/i, ''));
  const disallows = lines.filter((l) => /^disallow:/i.test(l));
  const allows = lines.filter((l) => /^allow:/i.test(l));
  const hasCrawlDelay = lower.some((l) => l.startsWith('crawl-delay:'));

  const issues: string[] = [];
  const recommendations: string[] = [];

  if (!hasUserAgent && lines.length > 0) {
    issues.push('User-agent مشخص نشده است.');
  }
  if (lines.length === 0) {
    issues.push('فایل خالی است.');
  }
  if (disallows.some((d) => d.toLowerCase().includes('disallow: /') && !d.includes('/specific'))) {
    // crude
    if (disallows.length > 2) {
      issues.push('ممکن است بخش‌های زیادی بلاک شده باشد.');
    }
  }
  if (disallows.some((d) => d.toLowerCase().trim() === 'disallow: /')) {
    issues.push('Disallow: / کل سایت را بلاک می‌کند.');
  }
  if (sitemaps.length === 0) {
    recommendations.push('خط Sitemap اضافه کنید.');
  }
  if (lower.some((l) => l.includes('host: http'))) {
    issues.push('Host نباید پروتکل داشته باشد (فقط دامنه).');
  }
  if (!hasUserAgent) {
    recommendations.push('حداقل یک User-agent: * اضافه کنید.');
  }

  if (issues.length === 0 && recommendations.length === 0) {
    recommendations.push('robots.txt به نظر سالم می‌رسد.');
  }

  return {
    lines,
    hasUserAgent,
    sitemaps,
    disallows,
    allows,
    hasCrawlDelay,
    issues,
    recommendations,
  };
}

// Sitemap parser (simple, no external dep)
export type SitemapReport = {
  urlCount: number;
  locs: string[];
  duplicates: string[];
  invalidLocs: string[];
  badLastmod: string[];
  warnings: string[];
  isValidXml: boolean;
};

export function analyzeSitemapXml(xml: string): SitemapReport {
  const locs: string[] = [];
  const warnings: string[] = [];
  let isValidXml = true;
  try {
    if (typeof window !== 'undefined' && window.DOMParser) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(xml, 'text/xml');
      if (doc.querySelector('parsererror')) {
        isValidXml = false;
      }
      const locEls = doc.querySelectorAll('loc');
      locEls.forEach((el) => {
        const v = (el.textContent ?? '').trim();
        if (v) {
          locs.push(v);
        }
      });
    }
  } catch {
    isValidXml = false;
  }
  if (locs.length === 0) {
    // regex fallback always
    const matches = xml.match(/<loc>([^<]+)<\/loc>/gi) ?? [];
    matches.forEach((m) => {
      const v = m.replace(/<\/?loc>/gi, '').trim();
      if (v) {
        locs.push(v);
      }
    });
  }

  const seen = new Map<string, number>();
  locs.forEach((l) => seen.set(l, (seen.get(l) ?? 0) + 1));
  const duplicates = Array.from(seen.entries())
    .filter(([, c]) => c > 1)
    .map(([l]) => l);

  const invalidLocs = locs.filter((l) => !/^https?:\/\//i.test(l));
  const badLastmod: string[] = [];
  // crude lastmod check via regex
  const lastmods = (xml.match(/<lastmod>([^<]+)<\/lastmod>/gi) ?? []).map((m) =>
    m.replace(/<\/?lastmod>/gi, '').trim(),
  );
  lastmods.forEach((lm) => {
    if (!/^\d{4}-\d{2}-\d{2}/.test(lm)) {
      badLastmod.push(lm);
    }
  });

  if (locs.length > 50000) {
    warnings.push('تعداد URL بیش از ۵۰٬۰۰۰ است. از sitemap index استفاده کنید.');
  }
  if (invalidLocs.length > 0) {
    warnings.push('بعضی loc مطلق نیستند.');
  }
  if (!isValidXml) {
    warnings.push('XML ممکن است معتبر نباشد.');
  }

  return { urlCount: locs.length, locs, duplicates, invalidLocs, badLastmod, warnings, isValidXml };
}

// Indexability
export type IndexabilityReport = {
  status: 'قابل ایندکس' | 'احتمالاً مشکل دارد' | 'غیرقابل ایندکس';
  reasons: string[];
  metaRobots: string[];
  hasNoindex: boolean;
  hasNofollow: boolean;
  canonical: CanonicalReport;
};

export function analyzeIndexability(
  html: string,
  httpStatus?: string,
  xRobots?: string,
): IndexabilityReport {
  const reasons: string[] = [];
  const metaRobots: string[] = [];
  let hasNoindex = false;
  let hasNofollow = false;

  if (typeof window !== 'undefined') {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const robotsMetas = doc.querySelectorAll('meta[name="robots"], meta[name="googlebot"]');
      robotsMetas.forEach((m) => {
        const c = ((m as HTMLMetaElement).content ?? '').toLowerCase();
        metaRobots.push(c);
        if (c.includes('noindex')) {
          hasNoindex = true;
        }
        if (c.includes('nofollow')) {
          hasNofollow = true;
        }
      });
    } catch {
      // Keep paste-only analysis resilient for malformed HTML.
    }
  }

  const x = (xRobots ?? '').toLowerCase();
  if (x.includes('noindex')) {
    hasNoindex = true;
  }
  if (x.includes('nofollow')) {
    hasNofollow = true;
  }

  const canonical = analyzeCanonical(html);

  const statusNum = parseInt(httpStatus ?? '200', 10);
  if (statusNum >= 400) {
    reasons.push(`وضعیت HTTP ${statusNum} است.`);
  }
  if (hasNoindex) {
    reasons.push('meta robots یا X-Robots-Tag حاوی noindex است.');
  }
  if (canonical.missing) {
    reasons.push('canonical گمشده است.');
  }
  if (canonical.isRelative) {
    reasons.push('canonical نسبی است.');
  }
  if (
    canonical.canonicals.length > 0 &&
    canonical.selfRefMatch === false &&
    canonical.canonicals[0]
  ) {
    reasons.push('canonical به صفحه دیگری اشاره دارد.');
  }

  let status: IndexabilityReport['status'] = 'قابل ایندکس';
  if (hasNoindex || statusNum >= 400) {
    status = 'غیرقابل ایندکس';
  } else if (reasons.length > 0 || canonical.missing || canonical.isRelative) {
    status = 'احتمالاً مشکل دارد';
  }

  if (reasons.length === 0 && status === 'قابل ایندکس') {
    reasons.push('سیگنال‌های اصلی اجازه ایندکس می‌دهند.');
  }

  return { status, reasons, metaRobots, hasNoindex, hasNofollow, canonical };
}

// Redirect manual chain
export type RedirectHop = { url: string; status: number };
export type RedirectReport = {
  hops: RedirectHop[];
  finalStatus: number;
  tooManyHops: boolean;
  hasErrorFinal: boolean;
  mixedProtocol: boolean;
  recommendations: string[];
};

export function analyzeRedirectChain(hops: RedirectHop[]): RedirectReport {
  const finalStatus = hops.length > 0 ? (hops[hops.length - 1]?.status ?? 0) : 0;
  const tooManyHops = hops.length > 3;
  const hasErrorFinal = finalStatus >= 400;
  const protocols = hops.map((h) => {
    try {
      return new URL(h.url).protocol;
    } catch {
      return '';
    }
  });
  const mixedProtocol = protocols.some((p, i) => i > 0 && p !== protocols[i - 1] && !!p);

  const recs: string[] = [];
  if (tooManyHops) {
    recs.push('زنجیره بیش از ۳ پرش است. آن را کوتاه کنید.');
  }
  if (hasErrorFinal) {
    recs.push('وضعیت نهایی خطا است (۴xx/۵xx).');
  }
  if (mixedProtocol) {
    recs.push('پروتکل در زنجیره مخلوط است (http/https).');
  }
  if (recs.length === 0) {
    recs.push('زنجیره به نظر مناسب است.');
  }

  return { hops, finalStatus, tooManyHops, hasErrorFinal, mixedProtocol, recommendations: recs };
}

// Broken links from pasted HTML
export type LinkInfo = {
  href: string;
  text: string;
  type: 'internal' | 'external' | 'hash' | 'mailto' | 'tel' | 'empty' | 'javascript' | 'other';
};

export function extractAndClassifyLinks(html: string, baseHost?: string): LinkInfo[] {
  if (typeof window === 'undefined') {
    return [];
  }
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const anchors = Array.from(doc.querySelectorAll('a[href]'));
    return anchors.map((a) => {
      const href = (a.getAttribute('href') ?? '').trim();
      const text = (a.textContent ?? '').trim().slice(0, 60);
      let type: LinkInfo['type'] = 'other';
      if (!href) {
        type = 'empty';
      } else if (href.startsWith('#')) {
        type = 'hash';
      } else if (href.toLowerCase().startsWith('mailto:')) {
        type = 'mailto';
      } else if (href.toLowerCase().startsWith('tel:')) {
        type = 'tel';
      } else if (href.toLowerCase().startsWith(`java${'script'}:`)) {
        type = 'javascript';
      } else if (/^https?:\/\//i.test(href)) {
        try {
          const u = new URL(href);
          if (baseHost && u.host === baseHost) {
            type = 'internal';
          } else {
            type = 'external';
          }
        } catch {
          type = 'external';
        }
      } else if (href.startsWith('/')) {
        type = 'internal';
      }
      return { href, text, type };
    });
  } catch {
    return [];
  }
}

// Schema generators - safe JSON
export function buildFaqJsonLd(items: { q: string; a: string }[]): object {
  const valid = items.filter((it) => it.q.trim() && it.a.trim());
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: valid.map((it) => ({
      '@type': 'Question',
      name: it.q.trim(),
      acceptedAnswer: {
        '@type': 'Answer',
        text: it.a.trim(),
      },
    })),
  };
}

export function buildHowToJsonLd(title: string, description: string, steps: string[]): object {
  const cleanSteps = steps.filter((s) => s.trim());
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: title.trim(),
    description: description.trim(),
    step: cleanSteps.map((s, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      text: s.trim(),
    })),
  };
}

export type LocalBusinessSchemaInput = {
  name: string;
  url?: string;
  telephone?: string;
  address?: string;
  city?: string;
  region?: string;
  postalCode?: string;
  country?: string;
  openingHours?: string;
};

type PostalAddressJsonLd = {
  '@type': 'PostalAddress';
  streetAddress?: string;
  addressLocality?: string;
  addressRegion?: string;
  postalCode?: string;
  addressCountry?: string;
};

type LocalBusinessJsonLd = {
  '@context': 'https://schema.org';
  '@type': 'LocalBusiness';
  name: string;
  url?: string;
  telephone?: string;
  address?: PostalAddressJsonLd;
  openingHours?: string;
};

export function buildLocalBusinessJsonLd(data: LocalBusinessSchemaInput): LocalBusinessJsonLd {
  const addr: Partial<PostalAddressJsonLd> = {};
  if (data.address ?? data.city) {
    addr['@type'] = 'PostalAddress';
    if (data.address) {
      addr.streetAddress = data.address;
    }
    if (data.city) {
      addr.addressLocality = data.city;
    }
    if (data.region) {
      addr.addressRegion = data.region;
    }
    if (data.postalCode) {
      addr.postalCode = data.postalCode;
    }
    if (data.country) {
      addr.addressCountry = data.country;
    }
  }
  const obj: LocalBusinessJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: data.name.trim(),
  };
  if (data.url) {
    obj.url = data.url.trim();
  }
  if (data.telephone) {
    obj.telephone = data.telephone.trim();
  }
  if (Object.keys(addr).length > 1) {
    obj.address = addr as PostalAddressJsonLd;
  }
  if (data.openingHours) {
    obj.openingHours = data.openingHours.trim();
  }
  return obj;
}
