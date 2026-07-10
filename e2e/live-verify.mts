import { chromium } from 'playwright';

const SITE = 'https://persiantoolbox.ir';

async function run() {
  const browser = await chromium.launch({ headless: true });
  const results: string[] = [];
  let pass = 0;
  let fail = 0;

  function ok(label: string) { pass++; results.push(`✅ ${label}`); }
  function fail_(label: string, detail: string) { fail++; results.push(`❌ ${label}: ${detail}`); }

  // === Desktop test ===
  console.log('--- DESKTOP (1280x800) ---');
  const desktopCtx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const dPage = await desktopCtx.newPage();

  const consoleErrors: string[] = [];
  const networkErrors: string[] = [];
  dPage.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
  dPage.on('requestfailed', req => networkErrors.push(`${req.url()} — ${req.failure()?.errorText}`));

  // Test homepage
  try {
    const r = await dPage.goto(SITE, { waitUntil: 'networkidle', timeout: 30000 });
    if (r?.ok()) ok('Homepage loads (200)');
    else fail_('Homepage', `HTTP ${r?.status()}`);

    // Check title
    const title = await dPage.title();
    if (title.includes('جعبه ابزار')) ok(`Homepage title: ${title}`);
    else fail_('Homepage title', title);

    // Check RTL
    const dir = await dPage.getAttribute('html', 'dir');
    if (dir === 'rtl') ok('RTL direction set');
    else fail_('RTL', `dir="${dir}"`);

    // Check lang
    const lang = await dPage.getAttribute('html', 'lang');
    if (lang === 'fa') ok('Language set to fa');
    else fail_('Lang', `lang="${lang}"`);

    // Check navbar links exist
    const navLinks = await dPage.$$('nav a, header a');
    if (navLinks.length > 5) ok(`Navigation links: ${navLinks.length}`);
    else fail_('Nav links', `Only ${navLinks.length} links`);

    // Check hero/main content
    const h1 = await dPage.$('h1');
    if (h1) ok('H1 heading present');
    else fail_('H1', 'No h1 found');

    // Check footer
    const footer = await dPage.$('footer');
    if (footer) ok('Footer present');
    else fail_('Footer', 'No footer');

    // Check cookie consent
    const consent = await dPage.$('[role="dialog"][aria-label="cookie consent"]');
    if (consent) ok('Cookie consent banner visible');
    else fail_('Cookie consent', 'Not found');

    // Dismiss consent
    if (consent) {
      const rejectBtn = await dPage.$('button[aria-label="رد همه کوکی‌ها"]');
      if (rejectBtn) { await rejectBtn.click(); await dPage.waitForTimeout(500); ok('Cookie consent dismissed'); }
    }
  } catch (e) { fail_('Homepage', String(e)); }

  // Test /pricing
  try {
    const r = await dPage.goto(`${SITE}/pricing`, { waitUntil: 'networkidle', timeout: 30000 });
    if (r?.ok()) ok('Pricing page loads');
    else fail_('Pricing', `HTTP ${r?.status()}`);
    const buyBtns = await dPage.$$('button, a[href*="premium"], a[href*="pricing"]');
    if (buyBtns.length > 0) ok(`Pricing page has ${buyBtns.length} interactive elements`);
    else fail_('Pricing', 'No interactive elements');
  } catch (e) { fail_('Pricing', String(e)); }

  // Test /tools
  try {
    const r = await dPage.goto(`${SITE}/tools`, { waitUntil: 'networkidle', timeout: 30000 });
    if (r?.ok()) ok('Tools page loads');
    else fail_('Tools', `HTTP ${r?.status()}`);
    const toolCards = await dPage.$$('a[href*="/tools/"], a[href*="/salary"], a[href*="/loan"], a[href*="/pdf"], a[href*="/date-tools"], a[href*="/text-tools"], a[href*="/image-tools"], a[href*="/validation-tools"], a[href*="/seo-tools"], a[href*="/contract-tools"], a[href*="/writing-tools"], a[href*="/business-tools"], a[href*="/career-tools"]');
    if (toolCards.length > 10) ok(`Tools page shows ${toolCards.length} tool links`);
    else fail_('Tools', `Only ${toolCards.length} tool links`);
  } catch (e) { fail_('Tools', String(e)); }

  // Test /blog
  try {
    const r = await dPage.goto(`${SITE}/blog`, { waitUntil: 'networkidle', timeout: 30000 });
    if (r?.ok()) ok('Blog page loads');
    else fail_('Blog', `HTTP ${r?.status()}`);
    const articles = await dPage.$$('article, a[href*="/blog/"]');
    if (articles.length > 10) ok(`Blog page shows ${articles.length} articles`);
    else fail_('Blog', `Only ${articles.length} articles`);
  } catch (e) { fail_('Blog', String(e)); }

  // Test /salary tool
  try {
    const r = await dPage.goto(`${SITE}/salary`, { waitUntil: 'networkidle', timeout: 30000 });
    if (r?.ok()) ok('Salary tool loads');
    else fail_('Salary', `HTTP ${r?.status()}`);
    const inputs = await dPage.$$('input');
    if (inputs.length > 0) ok(`Salary tool has ${inputs.length} input fields`);
    else fail_('Salary', 'No input fields');
  } catch (e) { fail_('Salary', String(e)); }

  // Test /account
  try {
    const r = await dPage.goto(`${SITE}/account`, { waitUntil: 'networkidle', timeout: 30000 });
    if (r?.ok()) ok('Account page loads');
    else fail_('Account', `HTTP ${r?.status()}`);
  } catch (e) { fail_('Account', String(e)); }

  // Test /about
  try {
    const r = await dPage.goto(`${SITE}/about`, { waitUntil: 'networkidle', timeout: 30000 });
    if (r?.ok()) ok('About page loads');
    else fail_('About', `HTTP ${r?.status()}`);
  } catch (e) { fail_('About', String(e)); }

  // Test /premium
  try {
    const r = await dPage.goto(`${SITE}/premium`, { waitUntil: 'networkidle', timeout: 30000 });
    if (r?.ok()) ok('Premium page loads');
    else fail_('Premium', `HTTP ${r?.status()}`);
  } catch (e) { fail_('Premium', String(e)); }

  // Test /pdf-tools
  try {
    const r = await dPage.goto(`${SITE}/pdf-tools`, { waitUntil: 'networkidle', timeout: 30000 });
    if (r?.ok()) ok('PDF tools page loads');
    else fail_('PDF tools', `HTTP ${r?.status()}`);
  } catch (e) { fail_('PDF tools', String(e)); }

  // Test /date-tools/shamsi-gregorian
  try {
    const r = await dPage.goto(`${SITE}/date-tools/shamsi-gregorian`, { waitUntil: 'networkidle', timeout: 30000 });
    if (r?.ok()) ok('Date converter tool loads');
    else fail_('Date converter', `HTTP ${r?.status()}`);
    const inputs = await dPage.$$('input');
    if (inputs.length > 0) ok(`Date converter has ${inputs.length} input fields`);
    else fail_('Date converter', 'No input fields');
  } catch (e) { fail_('Date converter', String(e)); }

  // Test /tools/json-formatter
  try {
    const r = await dPage.goto(`${SITE}/tools/json-formatter`, { waitUntil: 'networkidle', timeout: 30000 });
    if (r?.ok()) ok('JSON formatter loads');
    else fail_('JSON formatter', `HTTP ${r?.status()}`);
    const textareas = await dPage.$$('textarea');
    if (textareas.length > 0) ok(`JSON formatter has ${textareas.length} textarea(s)`);
    else fail_('JSON formatter', 'No textarea');
  } catch (e) { fail_('JSON formatter', String(e)); }

  // Test API health
  try {
    const r = await dPage.goto(`${SITE}/api/health`, { waitUntil: 'networkidle', timeout: 15000 });
    if (r?.ok()) {
      const json = await r.json();
      if (json.status === 'ok') ok('API health: status ok');
      else fail_('API health', `status=${json.status}`);
      if (json.dependencies?.paymentGateway?.configured === true) ok('Payment gateway: configured');
      else fail_('Payment gateway', `configured=${json.dependencies?.paymentGateway?.configured}`);
      if (json.dependencies?.database?.ok === true) ok('Database: connected');
      else fail_('Database', `ok=${json.dependencies?.database?.ok}`);
      if (json.dependencies?.redis?.ok === true) ok('Redis: connected');
      else fail_('Redis', `ok=${json.dependencies?.redis?.ok}`);
    } else fail_('API health', `HTTP ${r?.status()}`);
  } catch (e) { fail_('API health', String(e)); }

  await desktopCtx.close();

  // === Mobile test ===
  console.log('\n--- MOBILE (375x812, iPhone) ---');
  const mobileCtx = await browser.newContext({
    viewport: { width: 375, height: 812 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15',
  });
  const mPage = await mobileCtx.newPage();

  try {
    const r = await mPage.goto(SITE, { waitUntil: 'networkidle', timeout: 30000 });
    if (r?.ok()) ok('Mobile: Homepage loads');
    else fail_('Mobile Homepage', `HTTP ${r?.status()}`);

    // Check mobile menu button
    const menuBtn = await mPage.$('button[aria-label*="منو"], button[aria-label*="menu"], button[aria-label*="نوار"]');
    if (menuBtn) ok('Mobile: Menu button present');
    else fail_('Mobile Menu', 'No menu button');

    // Check no horizontal overflow
    const bodyWidth = await mPage.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await mPage.evaluate(() => window.innerWidth);
    if (bodyWidth <= viewportWidth + 5) ok(`Mobile: No horizontal overflow (${bodyWidth}px <= ${viewportWidth}px)`);
    else fail_('Mobile overflow', `${bodyWidth}px > ${viewportWidth}px`);

    // Test mobile tool page
    const r2 = await mPage.goto(`${SITE}/salary`, { waitUntil: 'networkidle', timeout: 30000 });
    if (r2?.ok()) ok('Mobile: Salary tool loads');
    else fail_('Mobile Salary', `HTTP ${r2?.status()}`);
  } catch (e) { fail_('Mobile test', String(e)); }

  await mobileCtx.close();
  await browser.close();

  // Report console errors
  if (consoleErrors.length > 0) {
    results.push(`\n⚠️ Console errors (${consoleErrors.length}):`);
    consoleErrors.slice(0, 10).forEach(e => results.push(`   ${e.substring(0, 120)}`));
  } else {
    ok('No console errors');
  }

  if (networkErrors.length > 0) {
    results.push(`\n⚠️ Network errors (${networkErrors.length}):`);
    networkErrors.slice(0, 10).forEach(e => results.push(`   ${e.substring(0, 120)}`));
  } else {
    ok('No network failures');
  }

  // Final
  console.log('\n=== RESULTS ===');
  results.forEach(r => console.log(r));
  console.log(`\n=== TOTAL: ${pass} passed, ${fail} failed ===`);
  if (fail === 0) console.log('🎉 LIVE_VERIFICATION_PASS');
  else console.log(`⚠️ LIVE_VERIFICATION_WITH_${fail}_FAILURES`);

  process.exit(fail > 0 ? 1 : 0);
}

run().catch(e => { console.error('FATAL:', e); process.exit(1); });
