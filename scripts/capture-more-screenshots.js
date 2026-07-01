const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const SITE_URL = 'https://persiantoolbox.ir';
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'images', 'blog');

async function captureMore() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1400, height: 900 },
    locale: 'fa-IR',
    deviceScaleFactor: 1,
  });

  // Salary result
  const dir1 = path.join(OUTPUT_DIR, 'salary-guide-1405');
  fs.mkdirSync(dir1, { recursive: true });
  const p1 = await context.newPage();
  try {
    await p1.goto(`${SITE_URL}/salary`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await p1.waitForTimeout(4000);
    await p1.screenshot({
      path: path.join(dir1, 'result.webp'),
      type: 'jpeg',
      quality: 85,
      fullPage: true,
    });
    console.log('✓ salary result.webp');
    await p1.screenshot({
      path: path.join(dir1, 'compare-scenarios.webp'),
      type: 'jpeg',
      quality: 85,
      fullPage: false,
    });
    console.log('✓ salary compare-scenarios.webp');
  } catch (e) {
    console.error(`✗ salary: ${e.message.split('\n')[0]}`);
  }
  await p1.close();

  // Persian writing studio
  const dir2 = path.join(OUTPUT_DIR, 'persian-writing-studio-guide');
  fs.mkdirSync(dir2, { recursive: true });
  const p2 = await context.newPage();
  try {
    await p2.goto(`${SITE_URL}/writing-tools/persian-writing-studio`, {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });
    await p2.waitForTimeout(4000);
    await p2.screenshot({
      path: path.join(dir2, 'result.webp'),
      type: 'jpeg',
      quality: 85,
      fullPage: false,
    });
    console.log('✓ writing result.webp');
    await p2.screenshot({
      path: path.join(dir2, 'compare-scenarios.webp'),
      type: 'jpeg',
      quality: 85,
      fullPage: true,
    });
    console.log('✓ writing compare-scenarios.webp');
  } catch (e) {
    console.error(`✗ writing: ${e.message.split('\n')[0]}`);
  }
  await p2.close();

  // Resume builder
  const dir3 = path.join(OUTPUT_DIR, 'resume-builder-guide');
  fs.mkdirSync(dir3, { recursive: true });
  const p3 = await context.newPage();
  try {
    await p3.goto(`${SITE_URL}/career-tools/resume-builder`, {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });
    await p3.waitForTimeout(4000);
    await p3.screenshot({
      path: path.join(dir3, 'result.webp'),
      type: 'jpeg',
      quality: 85,
      fullPage: false,
    });
    console.log('✓ resume result.webp');
    await p3.screenshot({
      path: path.join(dir3, 'compare-scenarios.webp'),
      type: 'jpeg',
      quality: 85,
      fullPage: true,
    });
    console.log('✓ resume compare-scenarios.webp');
  } catch (e) {
    console.error(`✗ resume: ${e.message.split('\n')[0]}`);
  }
  await p3.close();

  await browser.close();
  console.log('\nAll done!');
}

captureMore().catch(console.error);
