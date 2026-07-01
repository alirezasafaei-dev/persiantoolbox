const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const SITE = 'https://persiantoolbox.ir';
const OUT = path.join(__dirname, '..', 'tmp', 'audit');

async function audit() {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1400, height: 900 }, locale: 'fa-IR' });
  const issues = [];

  // 1. Homepage
  console.log('=== صفحه اصلی ===');
  const p1 = await ctx.newPage();
  await p1.goto(SITE, { waitUntil: 'networkidle', timeout: 30000 });
  await p1.waitForTimeout(2000);
  await p1.screenshot({ path: path.join(OUT, '01-homepage.png'), fullPage: false });

  // Check hero section
  const heroText = await p1.$eval('#hero-heading', (el) => el.textContent).catch(() => null);
  console.log('Hero heading:', heroText?.substring(0, 80));

  // Check search bar
  const searchLink = await p1.$('a[href="/search"]');
  console.log('Search link exists:', !!searchLink);

  // Check images on homepage
  const homeImages = await p1.$$eval('img', (imgs) =>
    imgs.map((i) => ({ src: i.src, loaded: i.naturalWidth > 0, alt: i.alt })),
  );
  console.log('Homepage images:', homeImages.length);
  for (const img of homeImages) {
    if (!img.loaded) {
      issues.push(`Homepage broken image: ${img.src}`);
      console.log('  BROKEN:', img.src);
    }
  }

  // Check trust section
  const trustText = await p1.$$eval('[aria-labelledby="trust-heading"] span', (spans) =>
    spans.map((s) => s.textContent),
  );
  console.log(
    'Trust items:',
    trustText.filter((t) => t.includes('محلی') || t.includes('داده')).length > 0 ? '✓' : '✗',
  );

  // Check blog preview on homepage
  const blogPreview = await p1.$('[aria-labelledby="blog-heading"]');
  console.log('Blog preview section:', !!blogPreview ? '✓ exists' : '✗ missing');

  // Check blog preview images
  if (blogPreview) {
    const blogImages = await blogPreview.$$eval('img', (imgs) =>
      imgs.map((i) => ({ src: i.src, loaded: i.naturalWidth > 0 })),
    );
    console.log('Blog preview images:', blogImages.length);
    for (const img of blogImages) {
      if (!img.loaded) {
        issues.push(`Blog preview broken image: ${img.src}`);
        console.log('  BROKEN:', img.src);
      }
    }
  }

  await p1.close();

  // 2. Blog page
  console.log('\n=== صفحه بلاگ ===');
  const p2 = await ctx.newPage();
  await p2.goto(`${SITE}/blog`, { waitUntil: 'networkidle', timeout: 30000 });
  await p2.waitForTimeout(2000);
  await p2.screenshot({ path: path.join(OUT, '02-blog.png'), fullPage: false });

  const blogImages = await p2.$$eval('img', (imgs) =>
    imgs.map((i) => ({ src: i.src, loaded: i.naturalWidth > 0, alt: i.alt })),
  );
  console.log('Blog page images:', blogImages.length);
  for (const img of blogImages) {
    if (!img.loaded) {
      issues.push(`Blog page broken image: ${img.src}`);
      console.log('  BROKEN:', img.src);
    }
  }

  // Check if editorial section exists
  const editorial = await p2.$('text=مقاله ویژه');
  console.log('Editorial featured section:', !!editorial ? '✓' : '✗');

  const topicHubs = await p2.$('text=موضوعات');
  console.log('Topic hubs section:', !!topicHubs ? '✓' : '✗');

  await p2.close();

  // 3. Article with cover image
  console.log('\n=== مقاله با تصویر ===');
  const p3 = await ctx.newPage();
  await p3.goto(`${SITE}/blog/2026-06-02-financial-tools-pillar`, {
    waitUntil: 'networkidle',
    timeout: 30000,
  });
  await p3.waitForTimeout(2000);
  await p3.screenshot({ path: path.join(OUT, '03-article-with-cover.png'), fullPage: false });

  const articleImages = await p3.$$eval('img', (imgs) =>
    imgs.map((i) => ({ src: i.src, loaded: i.naturalWidth > 0, alt: i.alt })),
  );
  console.log('Article images:', articleImages.length);
  for (const img of articleImages) {
    if (!img.loaded) {
      issues.push(`Article broken image: ${img.src}`);
      console.log('  BROKEN:', img.src);
    } else {
      console.log('  OK:', img.alt?.substring(0, 50), `(${img.src.substring(0, 60)}...)`);
    }
  }

  // Check hero image specifically
  const heroImg = await p3.$('figure img');
  console.log('Hero image (figure):', !!heroImg ? '✓' : '✗ missing');

  await p3.close();

  // 4. Article without cover image
  console.log('\n=== مقاله بدون تصویر ===');
  const p4 = await ctx.newPage();
  await p4.goto(`${SITE}/blog/2026-06-01-case-converter-guide`, {
    waitUntil: 'networkidle',
    timeout: 30000,
  });
  await p4.waitForTimeout(2000);
  await p4.screenshot({ path: path.join(OUT, '04-article-no-cover.png'), fullPage: false });

  const heroImg2 = await p4.$('figure img');
  console.log(
    'Hero image (should be absent):',
    !!heroImg2 ? '✗ PRESENT (unexpected)' : '✓ absent (correct)',
  );

  await p4.close();

  // 5. Technical transparency page
  console.log('\n=== صفحه شفافیت فنی ===');
  const p5 = await ctx.newPage();
  const resp5 = await p5.goto(`${SITE}/technical-transparency`, {
    waitUntil: 'networkidle',
    timeout: 30000,
  });
  console.log('Status:', resp5.status());
  await p5.screenshot({ path: path.join(OUT, '05-technical-transparency.png'), fullPage: false });
  await p5.close();

  // 6. Blog author page
  console.log('\n=== صفحه نویسنده ===');
  const p6 = await ctx.newPage();
  const resp6 = await p6.goto(`${SITE}/blog/author`, { waitUntil: 'networkidle', timeout: 30000 });
  console.log('Status:', resp6.status());
  await p6.screenshot({ path: path.join(OUT, '06-blog-author.png'), fullPage: false });
  await p6.close();

  // 7. Blog topic page
  console.log('\n=== صفحه موضوع ===');
  const p7 = await ctx.newPage();
  const resp7 = await p7.goto(`${SITE}/blog/topic/finance`, {
    waitUntil: 'networkidle',
    timeout: 30000,
  });
  console.log('Status:', resp7.status());
  await p7.screenshot({ path: path.join(OUT, '07-blog-topic.png'), fullPage: false });

  const topicImages = await p7.$$eval('img', (imgs) =>
    imgs.map((i) => ({ src: i.src, loaded: i.naturalWidth > 0 })),
  );
  console.log('Topic page images:', topicImages.length);
  for (const img of topicImages) {
    if (!img.loaded) {
      issues.push(`Topic page broken image: ${img.src}`);
      console.log('  BROKEN:', img.src);
    }
  }
  await p7.close();

  // 8. /tools page
  console.log('\n=== صفحه /tools ===');
  const p8 = await ctx.newPage();
  const resp8 = await p8.goto(`${SITE}/tools`, { waitUntil: 'networkidle', timeout: 30000 });
  console.log('Status:', resp8.status());
  const toolsTitle = await p8.title();
  console.log('Title:', toolsTitle);
  await p8.screenshot({ path: path.join(OUT, '08-tools.png'), fullPage: false });
  await p8.close();

  // 9. Check CSS loaded
  console.log('\n=== بررسی CSS ===');
  const p9 = await ctx.newPage();
  await p9.goto(SITE, { waitUntil: 'networkidle', timeout: 30000 });
  const cssLinks = await p9.$$eval('link[rel="stylesheet"]', (links) => links.map((l) => l.href));
  console.log('CSS files:', cssLinks.length);
  const cssStatuses = await Promise.all(
    cssLinks.map(async (url) => {
      const resp = await p9.context().request.get(url);
      return { url: url.substring(url.length - 30), status: resp.status() };
    }),
  );
  for (const s of cssStatuses) {
    if (s.status !== 200) {
      issues.push(`CSS ${s.status}: ${s.url}`);
      console.log('  BROKEN CSS:', s.url, s.status);
    }
  }
  console.log('All CSS OK:', cssStatuses.every((s) => s.status === 200) ? '✓' : '✗');
  await p9.close();

  // 10. Mobile viewport
  console.log('\n=== موبایل ===');
  const mobile = await browser.newContext({
    viewport: { width: 375, height: 812 },
    locale: 'fa-IR',
  });
  const pm = await mobile.newPage();
  await pm.goto(SITE, { waitUntil: 'networkidle', timeout: 30000 });
  await pm.waitForTimeout(2000);
  await pm.screenshot({ path: path.join(OUT, '09-mobile-homepage.png'), fullPage: false });

  // Check for horizontal overflow
  const hasOverflow = await pm.evaluate(() => {
    return document.documentElement.scrollWidth > document.documentElement.clientWidth;
  });
  console.log('Mobile horizontal overflow:', hasOverflow ? '✗ YES (problem)' : '✓ no');
  if (hasOverflow) issues.push('Mobile horizontal overflow detected');
  await pm.close();

  await browser.close();

  // Summary
  console.log('\n=== خلاصه مشکلات ===');
  if (issues.length === 0) {
    console.log('هیچ مشکلی پیدا نشد! ✓');
  } else {
    for (const issue of issues) {
      console.log('  ✗', issue);
    }
  }
  console.log(`\nTotal issues: ${issues.length}`);
}

audit().catch(console.error);
