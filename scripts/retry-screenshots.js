const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const SITE_URL = 'https://persiantoolbox.ir';
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'images', 'blog');

const retries = [
  { slug: 'loan-calculation-visual-guide', url: '/loan', name: 'step-1' },
  { slug: 'pdf-compression-workflow-guide', url: '/pdf-tools', name: 'cover' },
  {
    slug: 'pdf-compression-workflow-guide',
    url: '/pdf-tools/compress/compress-pdf',
    name: 'step-1',
  },
  { slug: 'pdf-compression-workflow-guide', url: '/pdf-tools/merge/merge-pdf', name: 'split-tool' },
  { slug: 'resume-builder-guide', url: '/career-tools/resume-builder', name: 'step-1' },
];

async function retryScreenshots() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1400, height: 900 },
    locale: 'fa-IR',
    deviceScaleFactor: 1,
  });

  for (const config of retries) {
    const dir = path.join(OUTPUT_DIR, config.slug);
    fs.mkdirSync(dir, { recursive: true });

    const page = await context.newPage();
    try {
      await page.goto(`${SITE_URL}${config.url}`, {
        waitUntil: 'domcontentloaded',
        timeout: 30000,
      });
      await page.waitForTimeout(5000);
      await page.screenshot({
        path: path.join(dir, `${config.name}.webp`),
        type: 'jpeg',
        quality: 85,
        fullPage: false,
      });
      console.log(`✓ ${config.slug}/${config.name}.webp`);
    } catch (e) {
      console.error(`✗ ${config.slug}/${config.name}: ${e.message.split('\n')[0]}`);
    }
    await page.close();
  }

  await browser.close();
  console.log('\nRetry done!');
}

retryScreenshots().catch(console.error);
