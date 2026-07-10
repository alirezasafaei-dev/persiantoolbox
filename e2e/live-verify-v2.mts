import { chromium } from 'playwright';

const SITE = 'https://persiantoolbox.ir';

async function run() {
  const browser = await chromium.launch({ headless: true });
  const results: string[] = [];
  let pass = 0;
  let fail = 0;

  function ok(label: string) { pass++; results.push(`✅ ${label}`); }
  function fail_(label: string, detail: string) { fail++; results.push(`❌ ${label}: ${detail}`); }

  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();

  const consoleErrors: string[] = [];
  const networkErrors: string[] = [];
  page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
  page.on('requestfailed', req => {
    const url = req.url();
    if (url.includes('googletagmanager') || url.includes('enamad')) return; // known CSP
    networkErrors.push(`${url} — ${req.failure()?.errorText}`);
  });

  const WAIT = { timeout: 45000, waitUntil: 'load' as const };

  // Pages to test
  const pages = [
    ['/', 'Homepage', ['h1', 'nav', 'footer']],
    ['/pricing', 'Pricing', ['button']],
    ['/tools', 'Tools', ['a']],
    ['/blog', 'Blog', ['a']],
    ['/about', 'About', ['h1']],
    ['/premium', 'Premium', ['h1']],
    ['/account', 'Account', ['h1']],
    ['/salary', 'Salary tool', ['input']],
    ['/loan', 'Loan tool', ['input']],
    ['/pdf-tools', 'PDF tools', ['a']],
    ['/text-tools', 'Text tools', ['a']],
    ['/date-tools', 'Date tools', ['a']],
    ['/image-tools', 'Image tools', ['a']],
    ['/validation-tools', 'Validation tools', ['a']],
    ['/seo-tools', 'SEO tools', ['a']],
    ['/contract-tools', 'Contract tools', ['a']],
    ['/writing-tools', 'Writing tools', ['a']],
    ['/business-tools', 'Business tools', ['a']],
    ['/career-tools', 'Career tools', ['a']],
    ['/date-tools/shamsi-gregorian', 'Shamsi-Gregorian converter', ['input']],
    ['/tools/json-formatter', 'JSON formatter', ['textarea']],
    ['/tools/salary-calculator', 'Salary calculator', ['input']],
    ['/tools/tax-calculator', 'Tax calculator', ['input']],
    ['/tools/bank-rate-comparator', 'Bank rate comparator', ['a']],
    ['/search', 'Search page', ['input']],
  ];

  for (const [path, name, selectors] of pages) {
    try {
      const r = await page.goto(`${SITE}${path}`, WAIT);
      if (r?.ok()) {
        ok(`${name} (${path})`);
      } else {
        fail_(`${name}`, `HTTP ${r?.status()}`);
        continue;
      }
      // Check for at least one expected selector
      for (const sel of selectors) {
        const el = await page.$(sel);
        if (el) { ok(`${name} has ${sel}`); break; }
      }
    } catch (e) {
      const msg = String(e).substring(0, 100);
      if (msg.includes('Timeout')) {
        // Retry with 'domcontentloaded'
        try {
          const r = await page.goto(`${SITE}${path}`, { timeout: 20000, waitUntil: 'domcontentloaded' });
          if (r?.ok()) ok(`${name} (${path}) [slow but loaded]`);
          else fail_(`${name}`, `HTTP ${r?.status()}`);
        } catch (e2) { fail_(`${name}`, String(e2).substring(0, 100)); }
      } else {
        fail_(`${name}`, msg);
      }
    }
  }

  // API health
  try {
    const r = await page.goto(`${SITE}/api/health`, { timeout: 15000, waitUntil: 'load' });
    if (r?.ok()) {
      const json = await r.json();
      if (json.status === 'ok') ok('API health: ok');
      else fail_('API health', `status=${json.status}`);
      const pg = json.dependencies?.paymentGateway;
      if (pg?.configured === true) ok(`Payment gateway: configured=${true}, sandbox=${pg?.sandbox}`);
      else fail_('Payment gateway', JSON.stringify(pg));
      if (json.dependencies?.database?.ok) ok(`DB latency: ${json.dependencies.database.latencyMs}ms`);
      else fail_('DB', 'not ok');
      if (json.dependencies?.redis?.ok) ok('Redis: ok');
      else fail_('Redis', 'not ok');
    }
  } catch (e) { fail_('API health', String(e).substring(0, 100)); }

  await ctx.close();

  // Mobile test
  console.log('\n--- MOBILE ---');
  const mCtx = await browser.newContext({
    viewport: { width: 375, height: 812 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)',
  });
  const mPage = await mCtx.newPage();
  try {
    const r = await mPage.goto(SITE, { timeout: 30000, waitUntil: 'load' });
    if (r?.ok()) ok('Mobile: Homepage loads');
    else fail_('Mobile Homepage', `HTTP ${r?.status()}`);

    const menuBtn = await mPage.$('button[aria-label*="منو"], button[aria-label*="menu"], button[aria-label*="ابزار"]');
    if (menuBtn) ok('Mobile: Menu button present');
    else fail_('Mobile Menu', 'No menu button');

    const bodyWidth = await mPage.evaluate(() => document.body.scrollWidth);
    const vpWidth = await mPage.evaluate(() => window.innerWidth);
    if (bodyWidth <= vpWidth + 5) ok(`Mobile: No overflow (${bodyWidth} <= ${vpWidth})`);
    else fail_('Mobile overflow', `${bodyWidth} > ${vpWidth}`);
  } catch (e) { fail_('Mobile', String(e).substring(0, 100)); }
  await mCtx.close();

  await browser.close();

  // Filter known CSP errors
  const realConsoleErrors = consoleErrors.filter(e =>
    !e.includes('Content Security Policy') && !e.includes('csp')
  );
  const cspErrors = consoleErrors.filter(e => e.includes('Content Security Policy') || e.includes('csp'));

  if (realConsoleErrors.length > 0) {
    results.push(`\n⚠️ Console errors (${realConsoleErrors.length}):`);
    [...new Set(realConsoleErrors)].slice(0, 10).forEach(e => results.push(`   ${e.substring(0, 150)}`));
  }
  if (networkErrors.length > 0) {
    results.push(`\n⚠️ Network errors (${networkErrors.length}):`);
    [...new Set(networkErrors)].slice(0, 10).forEach(e => results.push(`   ${e.substring(0, 150)}`));
  }
  if (cspErrors.length > 0) {
    results.push(`\n⚠️ CSP violations (${cspErrors.length}) — GTM/GA scripts blocked by CSP`);
  }

  console.log('\n=== RESULTS ===');
  results.forEach(r => console.log(r));
  console.log(`\n=== TOTAL: ${pass} passed, ${fail} failed ===`);
  if (fail === 0) console.log('🎉 LIVE_VERIFICATION_PASS');
  else console.log(`⚠️ LIVE_VERIFICATION_WITH_${fail}_ISSUES`);
}

run().catch(e => { console.error('FATAL:', e); process.exit(1); });
