const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const SITE_URL = 'https://persiantoolbox.ir';
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'images', 'blog');
const DRY_RUN = process.argv.includes('--dry-run');

if (DRY_RUN) console.log('DRY RUN mode - no screenshots taken');

const screenshots = [
  // Loan calculator
  {
    slug: 'loan-calculation-visual-guide',
    pages: [{ url: '/loan', name: 'step-1', wait: 3000 }],
    cover: { url: '/loan', name: 'cover', wait: 3000 },
  },
  // Salary calculator
  {
    slug: 'salary-guide-1405',
    pages: [{ url: '/salary', name: 'step-1', wait: 3000 }],
    cover: { url: '/salary', name: 'cover', wait: 3000 },
  },
  // PDF tools
  {
    slug: 'pdf-compression-workflow-guide',
    pages: [
      { url: '/pdf-tools/compress/compress-pdf', name: 'step-1', wait: 3000 },
      { url: '/pdf-tools/merge/merge-pdf', name: 'split-tool', wait: 3000 },
    ],
    cover: { url: '/pdf-tools', name: 'cover', wait: 3000 },
  },
  // Persian writing
  {
    slug: 'persian-writing-studio-guide',
    pages: [{ url: '/writing-tools/persian-writing-studio', name: 'step-1', wait: 3000 }],
    cover: { url: '/writing-tools', name: 'cover', wait: 3000 },
  },
  // Resume builder
  {
    slug: 'resume-builder-guide',
    pages: [{ url: '/career-tools/resume-builder', name: 'step-1', wait: 3000 }],
    cover: { url: '/career-tools', name: 'cover', wait: 3000 },
  },
];

async function takeScreenshots() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1400, height: 900 },
    locale: 'fa-IR',
    deviceScaleFactor: 1,
  });

  for (const config of screenshots) {
    const dir = path.join(OUTPUT_DIR, config.slug);
    fs.mkdirSync(dir, { recursive: true });

    // Take cover image (1200x630 for OG)
    if (config.cover) {
      const page = await context.newPage();
      try {
        await page.goto(`${SITE_URL}${config.cover.url}`, {
          waitUntil: 'networkidle',
          timeout: 15000,
        });
        await page.waitForTimeout(config.cover.wait);
        const coverPath = path.join(dir, `${config.cover.name}.jpg`);
        await page.screenshot({
          path: coverPath,
          type: 'jpeg',
          quality: 85,
          clip: { x: 0, y: 0, width: 1200, height: 630 },
        });
        console.log(`✓ ${config.slug}/${config.cover.name}.jpg (jpeg)`);
      } catch (e) {
        console.error(`✗ ${config.slug}/${config.cover.name}: ${e.message}`);
      }
      await page.close();
    }

    // Take page screenshots
    for (const pg of config.pages) {
      const page = await context.newPage();
      try {
        await page.goto(`${SITE_URL}${pg.url}`, { waitUntil: 'networkidle', timeout: 15000 });
        await page.waitForTimeout(pg.wait);
        const pagePath = path.join(dir, `${pg.name}.jpg`);
        await page.screenshot({
          path: pagePath,
          type: 'jpeg',
          quality: 85,
          fullPage: false,
        });
        console.log(`✓ ${config.slug}/${pg.name}.jpg (jpeg)`);
      } catch (e) {
        console.error(`✗ ${config.slug}/${pg.name}: ${e.message}`);
      }
      await page.close();
    }
  }

  await browser.close();
  console.log('\nDone! Screenshots saved.');
}

takeScreenshots().catch(console.error);
