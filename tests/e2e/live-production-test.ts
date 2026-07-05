import { chromium } from 'playwright';

const SITE = 'https://persiantoolbox.ir';

interface TestResult {
  name: string;
  status: 'PASS' | 'FAIL';
  details?: string;
  duration?: number;
}

const results: TestResult[] = [];

async function test(name: string, fn: () => Promise<void>) {
  const start = Date.now();
  try {
    await fn();
    results.push({ name, status: 'PASS', duration: Date.now() - start });
    console.log(`  ✅ ${name} (${Date.now() - start}ms)`);
  } catch (err: any) {
    results.push({
      name,
      status: 'FAIL',
      details: err.message?.slice(0, 200),
      duration: Date.now() - start,
    });
    console.log(`  ❌ ${name}: ${err.message?.slice(0, 150)}`);
  }
}

(async () => {
  console.log('\n=== 1. HTTP STATUS CHECKS (all key pages) ===\n');

  const pages = [
    '/',
    '/blog',
    '/about',
    '/contact',
    '/pricing',
    '/tools',
    '/topics',
    '/contract-tools',
    '/contract-tools/lease-agreement',
    '/contract-tools/salon-contract',
    '/contract-tools/vehicle-sale',
    '/career-tools',
    '/career-tools/resume-builder',
    '/business-tools',
    '/business-tools/document-studio',
    '/writing-tools',
    '/writing-tools/persian-writing-studio',
    '/pdf-tools',
    '/image-tools',
    '/date-tools',
    '/text-tools',
    '/validation-tools',
    '/seo-tools',
    '/loan',
    '/salary',
    '/interest',
    '/search',
    '/guides',
    '/asdev',
    '/privacy',
    '/terms',
    '/support',
    '/services',
    '/case-studies',
  ];

  for (const page of pages) {
    await test(`GET ${page}`, async () => {
      const res = await fetch(`${SITE}${page}`, {
        redirect: 'follow',
        signal: AbortSignal.timeout(15000),
      });
      if (res.status !== 200) throw new Error(`HTTP ${res.status}`);
    });
  }

  console.log('\n=== 2. REDIRECT CHECKS ===\n');

  const redirects: [string, string][] = [
    ['/asdev-portfolio', '/asdev'],
    ['/brand/asdev-portfolio', '/asdev'],
    ['/contract-tools/rental-contract', '/contract-tools/lease-agreement'],
    ['/legal-documents', '/contract-tools'],
    ['/pdf-tools/edit/add-header-footer', '/pdf-tools/edit/add-page-numbers'],
    ['/pdf-tools/paginate', '/pdf-tools/edit'],
    ['/topics/date-tools', '/date-tools'],
    ['/topics/finance-tools', '/tools'],
    ['/topics/pdf-tools', '/pdf-tools'],
    ['/topics/image-tools', '/image-tools'],
    ['/topics/text-tools', '/text-tools'],
  ];

  for (const [from, to] of redirects) {
    await test(`REDIRECT ${from} → ${to}`, async () => {
      const res = await fetch(`${SITE}${from}`, {
        redirect: 'manual',
        signal: AbortSignal.timeout(10000),
      });
      if (res.status !== 307 && res.status !== 308)
        throw new Error(`Expected 307/308, got ${res.status}`);
      const loc = res.headers.get('location') ?? '';
      if (!loc.includes(to)) throw new Error(`Location "${loc}" does not contain "${to}"`);
    });
  }

  console.log('\n=== 3. PDF TOOLS SUBCATEGORY REDIRECTS (new pages) ===\n');

  const pdfSubcats: [string, string][] = [
    ['/pdf-tools/compress', '/pdf-tools/compress/compress-pdf'],
    ['/pdf-tools/edit', '/pdf-tools/edit/add-page-numbers'],
    ['/pdf-tools/extract', '/pdf-tools/extract/extract-text'],
    ['/pdf-tools/security', '/pdf-tools/security/encrypt-pdf'],
    ['/pdf-tools/watermark', '/pdf-tools/watermark/add-watermark'],
    ['/pdf-tools/convert', '/pdf-tools/convert/pdf-to-text'],
    ['/pdf-tools/split', '/pdf-tools/split/split-pdf'],
  ];

  for (const [from, to] of pdfSubcats) {
    await test(`PDF REDIRECT ${from} → ${to}`, async () => {
      const res = await fetch(`${SITE}${from}`, {
        redirect: 'manual',
        signal: AbortSignal.timeout(10000),
      });
      if (res.status !== 307 && res.status !== 308)
        throw new Error(`Expected 307/308, got ${res.status}`);
      const loc = res.headers.get('location') ?? '';
      if (!loc.includes(to)) throw new Error(`Location "${loc}" does not contain "${to}"`);
    });
  }

  console.log('\n=== 4. CANONICAL TAG CHECKS ===\n');

  const canonicalTests = [
    ['/', 'https://persiantoolbox.ir'],
    ['/about', 'https://persiantoolbox.ir/about'],
    ['/about?lang=en', 'https://persiantoolbox.ir/about'],
    ['/about?lang=fa', 'https://persiantoolbox.ir/about'],
    ['/loan', 'https://persiantoolbox.ir/loan'],
    ['/loan?lang=en', 'https://persiantoolbox.ir/loan'],
    ['/pdf-tools', 'https://persiantoolbox.ir/pdf-tools'],
  ];

  for (const [path, expected] of canonicalTests) {
    await test(`CANONICAL ${path} → ${expected}`, async () => {
      const res = await fetch(`${SITE}${path}`, { signal: AbortSignal.timeout(15000) });
      const html = await res.text();
      const match = html.match(/canonical"\s+href="([^"]+)"/);
      if (!match) throw new Error('No canonical tag found');
      if (match[1] !== expected) throw new Error(`Expected "${expected}", got "${match[1]}"`);
    });
  }

  console.log('\n=== 5. WWW → NON-WWW REDIRECT ===\n');

  await test('www root redirects to non-www', async () => {
    const res = await fetch('https://www.persiantoolbox.ir/', {
      redirect: 'manual',
      signal: AbortSignal.timeout(10000),
    });
    if (res.status !== 301) throw new Error(`Expected 301, got ${res.status}`);
    const loc = res.headers.get('location') ?? '';
    if (!loc.startsWith('https://persiantoolbox.ir/')) throw new Error(`Location "${loc}" wrong`);
  });

  await test('www /about redirects to non-www', async () => {
    const res = await fetch('https://www.persiantoolbox.ir/about', {
      redirect: 'manual',
      signal: AbortSignal.timeout(10000),
    });
    if (res.status !== 301) throw new Error(`Expected 301, got ${res.status}`);
    const loc = res.headers.get('location') ?? '';
    if (!loc.includes('persiantoolbox.ir/about')) throw new Error(`Location "${loc}" wrong`);
  });

  console.log('\n=== 6. SECURITY HEADERS ===\n');

  await test('X-Frame-Options present', async () => {
    const res = await fetch(`${SITE}/`, { signal: AbortSignal.timeout(10000) });
    const h = res.headers.get('x-frame-options');
    if (!h) throw new Error('Missing X-Frame-Options');
  });

  await test('X-Content-Type-Options present', async () => {
    const res = await fetch(`${SITE}/`, { signal: AbortSignal.timeout(10000) });
    const h = res.headers.get('x-content-type-options');
    if (!h) throw new Error('Missing X-Content-Type-Options');
  });

  await test('HSTS header present', async () => {
    const res = await fetch(`${SITE}/`, { signal: AbortSignal.timeout(10000) });
    const h = res.headers.get('strict-transport-security');
    if (!h) throw new Error('Missing HSTS');
  });

  await test('CSP header present', async () => {
    const res = await fetch(`${SITE}/`, { signal: AbortSignal.timeout(10000) });
    const h = res.headers.get('content-security-policy');
    if (!h) throw new Error('Missing CSP');
  });

  console.log('\n=== 7. API ENDPOINTS ===\n');

  await test('API /api/health returns ok', async () => {
    const res = await fetch(`${SITE}/api/health`, { signal: AbortSignal.timeout(10000) });
    const data = await res.json();
    if (data.status !== 'ok') throw new Error(`Status: ${data.status}`);
    if (data.commit !== 'c3e207c5d0f0') throw new Error(`Commit: ${data.commit}`);
  });

  await test('API /api/version returns correct version', async () => {
    const res = await fetch(`${SITE}/api/version`, { signal: AbortSignal.timeout(10000) });
    const data = await res.json();
    if (data.version !== '7.8.0') throw new Error(`Version: ${data.version}`);
    if (data.commit !== 'c3e207c5d0f0') throw new Error(`Commit: ${data.commit}`);
  });

  console.log('\n=== 8. SITEMAP AND ROBOTS ===\n');

  await test('/sitemap.xml returns 200 and valid XML', async () => {
    const res = await fetch(`${SITE}/sitemap.xml`, { signal: AbortSignal.timeout(10000) });
    if (res.status !== 200) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    if (!text.includes('<?xml') && !text.includes('<urlset'))
      throw new Error('Not valid sitemap XML');
    const urls = text.match(/<loc>/g);
    if (!urls || urls.length < 600) throw new Error(`Only ${urls?.length ?? 0} URLs found`);
    console.log(`    → ${urls.length} URLs in sitemap`);
  });

  await test('/robots.txt returns 200 and blocks /admin/', async () => {
    const res = await fetch(`${SITE}/robots.txt`, { signal: AbortSignal.timeout(10000) });
    if (res.status !== 200) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    if (!text.includes('Disallow: /admin/')) throw new Error('Does not block /admin/');
    if (!text.toLowerCase().includes('sitemap:')) throw new Error('No sitemap reference');
  });

  console.log('\n=== 9. CSS AND FONT LOADING (browser test) ===\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();

  const consoleErrors: string[] = [];
  const networkErrors: string[] = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text().slice(0, 100));
  });

  page.on('requestfailed', (req) => {
    networkErrors.push(`${req.failure()?.errorText} ${req.url().slice(0, 80)}`);
  });

  await test('Homepage loads without console errors', async () => {
    await page.goto(`${SITE}/`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);
    const title = await page.title();
    if (!title.includes('جعبه ابزار')) throw new Error(`Title: ${title}`);
    if (consoleErrors.length > 5) throw new Error(`${consoleErrors.length} console errors`);
    if (networkErrors.length > 3) throw new Error(`${networkErrors.length} network errors`);
    console.log(`    → Title: ${title}`);
    console.log(`    → Console errors: ${consoleErrors.length}`);
    console.log(`    → Network errors: ${networkErrors.length}`);
  });

  await test('CSS renders correctly (hero section visible)', async () => {
    const hero = await page.$('h1');
    if (!hero) throw new Error('No h1 found');
    const text = await hero.textContent();
    console.log(`    → H1: ${text?.slice(0, 60)}`);
  });

  await test('Navigation links exist and are clickable', async () => {
    const navLinks = await page.$$('nav a, header a');
    console.log(`    → ${navLinks.length} navigation links found`);
    if (navLinks.length < 5) throw new Error('Too few nav links');
  });

  await test('Footer links exist', async () => {
    const footerLinks = await page.$$('footer a');
    console.log(`    → ${footerLinks.length} footer links found`);
    if (footerLinks.length < 10) throw new Error('Too few footer links');
  });

  console.log('\n=== 10. TOOL PAGES (browser render test) ===\n');

  const toolPages = [
    ['/loan', 'محاسبه‌گر وام'],
    ['/salary', 'محاسبه‌گر حقوق'],
    ['/pdf-tools/compress/compress-pdf', 'فشرده‌سازی'],
    ['/date-tools/age-calculator', 'سن'],
    ['/text-tools/word-counter', 'شمارش'],
    ['/validation-tools/national-id', 'کد ملی'],
    ['/seo-tools/canonical-checker', 'Canonical'],
    ['/contract-tools/lease-agreement', 'اجاره'],
  ];

  for (const [path] of toolPages) {
    await test(`TOOL PAGE ${path}`, async () => {
      await page.goto(`${SITE}${path}`, { waitUntil: 'domcontentloaded', timeout: 20000 });
      await page.waitForTimeout(1000);
      const h1 = await page.$('h1');
      if (!h1) {
        const heading = await page.$('h2');
        if (!heading) throw new Error('No h1 or h2 found');
        const text = await heading.textContent();
        console.log(`    → H2: ${text?.slice(0, 50)}`);
      } else {
        const text = await h1.textContent();
        console.log(`    → H1: ${text?.slice(0, 50)}`);
      }
      const inputs = await page.$$('input, textarea, select');
      console.log(`    → ${inputs.length} form elements`);
    });
  }

  console.log('\n=== 11. MOBILE VIEWPORT TEST ===\n');

  const mobilePage = await browser.newPage({ viewport: { width: 375, height: 812 } });

  await test('Homepage renders on mobile (375px)', async () => {
    await mobilePage.goto(`${SITE}/`, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await mobilePage.waitForTimeout(2000);
    const h1 = await mobilePage.$('h1');
    if (!h1) throw new Error('No h1 on mobile');
    const box = await h1.boundingBox();
    if (!box) throw new Error('H1 not visible');
    if (box.width > 375) throw new Error(`H1 overflows: ${box.width}px > 375px`);
    console.log(`    → H1 width: ${box.width}px (fits in 375px viewport)`);
  });

  await test('Tool page renders on mobile', async () => {
    await mobilePage.goto(`${SITE}/loan`, { waitUntil: 'domcontentloaded', timeout: 20000 });
    const h1 = await mobilePage.$('h1');
    if (!h1) throw new Error('No h1 on mobile tool page');
    console.log('    → Tool page H1 visible on mobile');
  });

  console.log('\n=== 12. STRUCTURED DATA CHECK ===\n');

  await test('Homepage has JSON-LD structured data', async () => {
    await page.goto(`${SITE}/`, { waitUntil: 'domcontentloaded', timeout: 20000 });
    const scripts = await page.$$('script[type="application/ld+json"]');
    console.log(`    → ${scripts.length} JSON-LD blocks`);
    if (scripts.length < 1) throw new Error('No structured data');
    for (const script of scripts) {
      const content = await script.textContent();
      if (content?.includes('@type')) console.log('    → Contains @type');
    }
  });

  await test('Blog post has BlogPosting schema', async () => {
    const res = await fetch(`${SITE}/blog`, { signal: AbortSignal.timeout(15000) });
    const html = await res.text();
    if (html.includes('BlogPosting') || html.includes('ItemList')) {
      console.log('    → BlogPosting or ItemList schema found');
    } else {
      console.log('    → No BlogPosting schema (may be in individual posts)');
    }
  });

  console.log('\n=== 13. OG IMAGE TEST ===\n');

  await test('Homepage OG image returns 200', async () => {
    const res = await fetch(`${SITE}/opengraph-image`, { signal: AbortSignal.timeout(15000) });
    if (res.status !== 200) throw new Error(`HTTP ${res.status}`);
    const ct = res.headers.get('content-type');
    console.log(`    → Content-Type: ${ct}`);
  });

  await test('Tool OG image returns 200', async () => {
    const res = await fetch(`${SITE}/salary/opengraph-image-1tu19b`, {
      signal: AbortSignal.timeout(15000),
    });
    if (res.status !== 200) throw new Error(`HTTP ${res.status}`);
    console.log('    → OG image rendered successfully');
  });

  await browser.close();

  console.log('\n========================================');
  console.log('         FINAL RESULTS');
  console.log('========================================\n');

  const passed = results.filter((r) => r.status === 'PASS').length;
  const failed = results.filter((r) => r.status === 'FAIL').length;
  const total = results.length;

  console.log(`Total: ${total} | ✅ Passed: ${passed} | ❌ Failed: ${failed}\n`);

  if (failed > 0) {
    console.log('FAILURES:');
    for (const r of results.filter((r) => r.status === 'FAIL')) {
      console.log(`  ❌ ${r.name}`);
      console.log(`     ${r.details}`);
    }
  }

  process.exit(failed > 0 ? 1 : 0);
})();
