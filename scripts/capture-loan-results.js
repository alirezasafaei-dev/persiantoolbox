const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const SITE_URL = 'https://persiantoolbox.ir';
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'images', 'blog');

async function captureLoanResults() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1400, height: 900 },
    locale: 'fa-IR',
    deviceScaleFactor: 1,
  });

  const dir = path.join(OUTPUT_DIR, 'loan-calculation-visual-guide');
  fs.mkdirSync(dir, { recursive: true });

  // Step 1: Fill in the loan calculator form
  const page = await context.newPage();
  try {
    await page.goto(`${SITE_URL}/loan`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(4000);

    // Try to fill in form fields - look for input fields
    const inputs = await page.$$('input[type="number"], input[type="text"], input:not([type])');
    console.log(`Found ${inputs.length} input fields`);

    // Fill in loan amount (200 million)
    for (const input of inputs) {
      const placeholder = await input.getAttribute('placeholder');
      const label = await input.evaluate((el) => {
        const labelEl = el.closest('label') || el.parentElement?.querySelector('label');
        return labelEl?.textContent || '';
      });
      console.log(`Input: placeholder="${placeholder}", label="${label}"`);
    }

    // Take screenshot of filled form
    await page.screenshot({
      path: path.join(dir, 'result.webp'),
      type: 'jpeg',
      quality: 85,
      fullPage: false,
    });
    console.log('✓ result.webp');

    // Take full page screenshot for repayment table
    await page.screenshot({
      path: path.join(dir, 'repayment-table.webp'),
      type: 'jpeg',
      quality: 85,
      fullPage: true,
    });
    console.log('✓ repayment-table.webp');
  } catch (e) {
    console.error(`✗ Error: ${e.message.split('\n')[0]}`);
  }

  // Compare scenarios - take screenshot of interest calculator
  const page2 = await context.newPage();
  try {
    await page2.goto(`${SITE_URL}/interest`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page2.waitForTimeout(4000);
    await page2.screenshot({
      path: path.join(dir, 'compare-scenarios.webp'),
      type: 'jpeg',
      quality: 85,
      fullPage: false,
    });
    console.log('✓ compare-scenarios.webp');
  } catch (e) {
    console.error(`✗ compare-scenarios: ${e.message.split('\n')[0]}`);
  }

  await browser.close();
  console.log('\nDone!');
}

captureLoanResults().catch(console.error);
