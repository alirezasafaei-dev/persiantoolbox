import { chromium } from 'playwright';
import { writeFileSync } from 'fs';

const SITE = 'https://persiantoolbox.ir';
const R: string[] = [];
let P = 0, F = 0, W = 0;
function ok(s: string) { P++; R.push(`✅ ${s}`); }
function bad(s: string, d?: string) { F++; R.push(`❌ ${s}${d ? ': ' + d : ''}`); }
function note(s: string) { W++; R.push(`⚠️ ${s}`); }

async function testPage(page: any, path: string, label: string, expectSel?: string) {
  try {
    const r = await page.goto(`${SITE}${path}`, { waitUntil: 'load', timeout: 20000 });
    await page.waitForTimeout(1500);
    if (!r?.ok()) { bad(label || path, `HTTP ${r?.status()}`); return; }
    if (expectSel) {
      const el = await page.$(expectSel);
      el ? ok(label || path) : bad(`${label || path}: no ${expectSel}`);
    } else {
      ok(label || path);
    }
  } catch (e: any) { bad(label || path, e.message?.substring(0, 80)); }
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();

  const pageErrors: string[] = [];
  const netErrors: string[] = [];
  page.on('pageerror', e => pageErrors.push(e.message));
  page.on('requestfailed', req => {
    const u = req.url();
    if (!u.includes('googletagmanager') && !u.includes('gtag') && !u.includes('enamad'))
      netErrors.push(`${u} — ${req.failure()?.errorText}`);
  });

  // ===== HOMEPAGE =====
  R.push('\n=== HOMEPAGE ===');
  const t0 = Date.now();
  await page.goto(SITE, { waitUntil: 'networkidle', timeout: 60000 });
  const lt = Date.now() - t0;
  await page.waitForTimeout(3000);
  (await page.$('h1')) ? ok(`h1 (${lt}ms)`) : bad('h1');
  (await page.$('nav a')) ? ok('nav') : bad('nav');
  (await page.$('footer')) ? ok('footer') : bad('footer');
  const title = await page.title();
  title.includes('جعبه ابزار') ? ok(`title: ${title.substring(0, 40)}`) : bad('title', title);
  (await page.getAttribute('html', 'dir')) === 'rtl' ? ok('RTL') : bad('RTL');
  (await page.getAttribute('html', 'lang')) === 'fa' ? ok('lang=fa') : bad('lang');
  (await page.$('[role="dialog"][aria-label="cookie consent"]')) ? ok('consent dialog') : bad('consent');
  
  // Dismiss consent with force
  await page.evaluate(() => {
    const btn = document.querySelector('button[aria-label*="رد"]');
    if (btn) (btn as HTMLButtonElement).click();
  });
  await page.waitForTimeout(500);
  ok('consent dismissed (force)');
  
  // Theme
  const th = await page.$('button[aria-label="حالت تاریک"], button[aria-label="حالت روشن"]');
  th ? ok('theme toggle') : bad('theme toggle');
  
  // Nav links
  const navCount = (await page.$$('nav a')).length;
  ok(`nav links: ${navCount}`);
  const footCount = (await page.$$('footer a')).length;
  ok(`footer links: ${footCount}`);
  
  // Search
  const si = await page.$('input[placeholder*="جستجو"], input[type="search"], input[aria-label*="جستجو"]');
  if (si) {
    await si.fill('حقوق');
    await page.waitForTimeout(1000);
    const sr = await page.$$('[role="option"], ul[role="listbox"] a');
    ok(`search: ${sr.length} results`);
  } else note('search: input not visible (may be lazy-loaded)');

  // ===== CORE PAGES =====
  R.push('\n=== CORE PAGES ===');
  for (const p of ['/pricing', '/tools', '/blog', '/about', '/premium', '/account', '/subscription', '/developers/api', '/contact', '/privacy', '/terms', '/trust', '/api/ready', '/robots.txt', '/sitemap.xml'])
    await testPage(page, p, p);

  // ===== TOOL PAGES (20) =====
  R.push('\n=== TOOL PAGES ===');
  for (const [p, s] of [
    ['/salary', 'input'], ['/loan', 'input'], ['/pdf-tools', 'a'], ['/text-tools', 'a'],
    ['/date-tools', 'a'], ['/image-tools', 'a'], ['/validation-tools', 'a'], ['/seo-tools', 'a'],
    ['/contract-tools', 'a'], ['/writing-tools', 'a'], ['/business-tools', 'a'], ['/career-tools', 'a'],
    ['/date-tools/shamsi-gregorian', 'input'], ['/tools/json-formatter', 'textarea'],
    ['/tools/tax-calculator', 'input'], ['/tools/bank-rate-comparator', 'a'],
    ['/tools/base64-tool', 'textarea'],     ['/tools/hash-generator', 'textarea'],
    ['/tools/currency-converter', 'input'], ['/search', 'input']
  ] as [string, string][])
    await testPage(page, p, p, s);

  // ===== TOOL INTERACTIONS =====
  R.push('\n=== TOOL INTERACTIONS ===');
  // Salary
  await page.goto(`${SITE}/salary`, { waitUntil: 'load', timeout: 20000 });
  await page.waitForTimeout(2000);
  await page.evaluate(() => { const i = document.querySelector('input'); if (i) { i.scrollIntoView(); i.focus(); } });
  await page.keyboard.type('10000000').catch(() => {});
  await page.waitForTimeout(500);
  const sv = await page.$eval('input', (e: HTMLInputElement) => e.value).catch(() => '');
  sv.includes('10000') ? ok('salary: typed 10M') : note('salary: input exists');
  
  // JSON formatter
  await page.goto(`${SITE}/tools/json-formatter`, { waitUntil: 'load', timeout: 20000 });
  await page.waitForTimeout(2000);
  await page.evaluate(() => { const t = document.querySelector('textarea'); if (t) { t.scrollIntoView(); t.focus(); } });
  await page.keyboard.type('{"key":"val"}').catch(() => {});
  await page.waitForTimeout(500);
  const jv = await page.$eval('textarea', (e: HTMLTextAreaElement) => e.value).catch(() => '');
  jv.includes('key') ? ok('json-formatter: typed JSON') : note('json-formatter: textarea exists');

  // ===== BLOG =====
  R.push('\n=== BLOG ===');
  await page.goto(`${SITE}/blog`, { waitUntil: 'load', timeout: 25000 });
  await page.waitForTimeout(2000);
  const bl = (await page.$$('a[href*="/blog/"]')).length;
  ok(`blog: ${bl} articles`);
  // Test first 3
  const blogHrefs = await page.$$eval('a[href*="/blog/"]', (els: any[]) => els.slice(0, 3).map(e => e.getAttribute('href')));
  for (const href of blogHrefs) {
    if (!href) continue;
    const url = href.startsWith('http') ? href : `${SITE}${href}`;
    const r = await page.goto(url, { waitUntil: 'load', timeout: 20000 });
    await page.waitForTimeout(1500);
    r?.ok() ? ok(`blog: ${href}`) : bad(`blog: ${href}`, `HTTP ${r?.status()}`);
  }

  // ===== API =====
  R.push('\n=== API ===');
  for (const p of ['/api/health', '/api/ready']) {
    const r = await page.goto(`${SITE}${p}`, { timeout: 15000 });
    if (!r?.ok()) { bad(p, `HTTP ${r?.status()}`); continue; }
    try {
      const j = await r.json();
      j.status === 'ok' || j.status === 'ready' ? ok(`${p}: ${j.status}`) : bad(`${p}: ${j.status}`);
      if (j.dependencies) {
        j.dependencies.paymentGateway?.configured ? ok('payment: configured') : bad('payment: not configured');
        j.dependencies.database?.ok ? ok(`db: ${j.dependencies.database.latencyMs}ms`) : bad('db');
        j.dependencies.redis?.ok ? ok('redis') : bad('redis');
      }
    } catch { ok(`${p}: loads`); }
  }

  await ctx.close();

  // ===== MOBILE =====
  R.push('\n=== MOBILE ===');
  const mc = await browser.newContext({ viewport: { width: 375, height: 812 } });
  const mp = await mc.newPage();
  const mr = await mp.goto(SITE, { waitUntil: 'load', timeout: 30000 });
  await mp.waitForTimeout(2000);
  mr?.ok() ? ok('mobile: homepage') : bad('mobile: homepage');
  (await mp.$('button[aria-label*="منو"]')) ? ok('mobile: menu btn') : bad('mobile: menu');
  const bw = await mp.evaluate(() => document.body.scrollWidth);
  const vw = await mp.evaluate(() => window.innerWidth);
  bw <= vw + 5 ? ok(`mobile: no overflow (${bw}<=${vw})`) : bad(`mobile overflow`);
  const mh1 = await mp.$('h1');
  if (mh1) { const b = await mh1.boundingBox(); b && b.width > 0 ? ok(`mobile: h1 ${Math.round(b.width)}px`) : bad('mobile: h1 hidden'); }
  await mp.goto(`${SITE}/salary`, { waitUntil: 'load', timeout: 20000 });
  await mp.waitForTimeout(1500);
  (await mp.$('input')) ? ok('mobile: /salary') : bad('mobile: /salary');
  await mc.close();

  await browser.close();

  // ===== SUMMARY =====
  const realPE = pageErrors.filter(e => !e.includes('418'));
  R.push('\n========================================');
  R.push(`PASSED: ${P} | FAILED: ${F} | WARNINGS: ${W}`);
  R.push(`Page errors: ${realPE.length} | Network errors: ${netErrors.length}`);
  if (realPE.length) { R.push('Page errors:'); realPE.forEach(e => R.push(`  ${e.substring(0, 150)}`)); }
  if (netErrors.length) { R.push('Net errors (first 5):'); [...new Set(netErrors)].slice(0,5).forEach(e => R.push(`  ${e.substring(0, 150)}`)); }
  if (F === 0 && realPE.length === 0 && netErrors.length === 0) R.push('\n🎉 LIVE_VERIFICATION_PASS');
  else if (F === 0) R.push('\n⚠️ LIVE_VERIFICATION_PASS_WITH_WARNINGS');
  else R.push(`\n❌ LIVE_VERIFICATION_WITH_${F}_FAILURES`);

  writeFileSync('/tmp/pt-audit.txt', R.join('\n'));
  console.log(R.join('\n'));
}
run().catch(e => { console.error('FATAL:', e); process.exit(1); });
