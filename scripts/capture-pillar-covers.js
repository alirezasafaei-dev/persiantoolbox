const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const SITE_URL = 'https://persiantoolbox.ir';
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'images', 'blog');

const covers = [
  { slug: 'financial-tools-pillar', url: '/tools', name: 'cover' },
  { slug: 'pdf-tools-pillar', url: '/pdf-tools', name: 'cover' },
  { slug: 'date-tools-pillar', url: '/date-tools', name: 'cover' },
  { slug: 'image-tools-pillar', url: '/image-tools', name: 'cover' },
  { slug: 'text-tools-pillar', url: '/text-tools', name: 'cover' },
  { slug: 'business-tools-pillar', url: '/business-tools', name: 'cover' },
  { slug: 'career-tools-pillar', url: '/career-tools', name: 'cover' },
  { slug: 'contract-tools-pillar', url: '/contract-tools', name: 'cover' },
  { slug: 'loan-calculator-guide', url: '/loan', name: 'cover' },
  { slug: 'resume-template-guide', url: '/career-tools/resume-builder', name: 'cover' },
];

async function captureCovers() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1200, height: 630 },
    locale: 'fa-IR',
    deviceScaleFactor: 1,
  });

  for (const config of covers) {
    const dir = path.join(OUTPUT_DIR, config.slug);
    fs.mkdirSync(dir, { recursive: true });

    const page = await context.newPage();
    try {
      await page.goto(`${SITE_URL}${config.url}`, {
        waitUntil: 'domcontentloaded',
        timeout: 30000,
      });
      await page.waitForTimeout(3000);
      await page.screenshot({
        path: path.join(dir, `${config.name}.webp`),
        type: 'jpeg',
        quality: 85,
        clip: { x: 0, y: 0, width: 1200, height: 630 },
      });
      console.log(`✓ ${config.slug}/${config.name}.webp`);
    } catch (e) {
      console.error(`✗ ${config.slug}: ${e.message.split('\n')[0]}`);
    }
    await page.close();
  }

  await browser.close();
  console.log('\nAll covers captured!');
}

captureCovers().catch(console.error);
