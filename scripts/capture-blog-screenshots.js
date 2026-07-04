const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

const SITE_URL = 'https://persiantoolbox.ir';
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'images', 'blog');
const DRY_RUN = process.argv.includes('--dry-run');
const IMAGE_CONFIG = {
  outputFormat: 'webp',
  quality: 85,
  width: 1200,
  height: 630,
};

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

function outputPath(dir, name) {
  return path.join(dir, `${name}.${IMAGE_CONFIG.outputFormat}`);
}

function assertToolPath(url) {
  const allowedPaths = [
    '/loan',
    '/salary',
    '/pdf-tools',
    '/pdf-tools/compress/compress-pdf',
    '/pdf-tools/merge/merge-pdf',
    '/writing-tools',
    '/writing-tools/persian-writing-studio',
    '/career-tools',
    '/career-tools/resume-builder',
  ];
  if (!allowedPaths.includes(url)) {
    throw new Error(`Refusing to capture non-tool page: ${url}`);
  }
}

async function captureWebp(page, targetPath, screenshotOptions = {}) {
  const pngBuffer = await page.screenshot({
    type: 'png',
    ...screenshotOptions,
  });

  try {
    await sharp(pngBuffer).webp({ quality: IMAGE_CONFIG.quality }).toFile(targetPath);
  } catch (error) {
    throw new Error(
      `Failed to convert screenshot to ${IMAGE_CONFIG.outputFormat}: ${error.message}`,
    );
  }
}

function logPlannedOutput(slug, name, targetPath) {
  const relative = path.relative(process.cwd(), targetPath);
  console.log(
    `${DRY_RUN ? '[dry-run] ' : ''}${slug}/${name}.${IMAGE_CONFIG.outputFormat} -> ${relative}`,
  );
}

async function takeScreenshots() {
  for (const config of screenshots) {
    if (config.cover) {
      assertToolPath(config.cover.url);
    }
    for (const pg of config.pages) {
      assertToolPath(pg.url);
    }
  }

  if (DRY_RUN) {
    console.log(
      `[dry-run] format=${IMAGE_CONFIG.outputFormat} quality=${IMAGE_CONFIG.quality} width=${IMAGE_CONFIG.width} height=${IMAGE_CONFIG.height}`,
    );
    for (const config of screenshots) {
      const dir = path.join(OUTPUT_DIR, config.slug);
      if (config.cover) {
        logPlannedOutput(config.slug, config.cover.name, outputPath(dir, config.cover.name));
      }
      for (const pg of config.pages) {
        logPlannedOutput(config.slug, pg.name, outputPath(dir, pg.name));
      }
    }
    return;
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: IMAGE_CONFIG.width, height: IMAGE_CONFIG.height },
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
        await captureWebp(page, outputPath(dir, config.cover.name), {
          clip: { x: 0, y: 0, width: 1200, height: 630 },
        });
        console.log(`✓ ${config.slug}/${config.cover.name}.${IMAGE_CONFIG.outputFormat}`);
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
        await captureWebp(page, outputPath(dir, pg.name), {
          clip: { x: 0, y: 0, width: IMAGE_CONFIG.width, height: IMAGE_CONFIG.height },
        });
        console.log(`✓ ${config.slug}/${pg.name}.${IMAGE_CONFIG.outputFormat}`);
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
