const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const SITE_URL = 'https://persiantoolbox.ir';
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'images', 'blog');

async function captureWithFormData() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1400, height: 900 },
    locale: 'fa-IR',
    deviceScaleFactor: 1,
  });

  // Loan calculator with filled data
  const loanDir = path.join(OUTPUT_DIR, 'loan-calculation-visual-guide');
  const p1 = await context.newPage();
  try {
    await p1.goto(`${SITE_URL}/loan`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await p1.waitForTimeout(3000);

    // Fill loan amount
    const inputs = await p1.$$('input');
    if (inputs.length >= 3) {
      await inputs[0].click();
      await inputs[0].fill('200000000');
      await inputs[1].click();
      await inputs[1].fill('20');
      await inputs[2].click();
      await inputs[2].fill('60');
      await p1.waitForTimeout(1000);

      // Try to click calculate button
      const buttons = await p1.$$('button');
      for (const btn of buttons) {
        const text = await btn.textContent();
        if (
          text &&
          (text.includes('محاسبه') || text.includes('محاسبه کن') || text.includes('Calculate'))
        ) {
          await btn.click();
          break;
        }
      }
      await p1.waitForTimeout(2000);
    }

    await p1.screenshot({ path: path.join(loanDir, 'step-1.webp'), type: 'jpeg', quality: 85 });
    console.log('✓ loan step-1 (filled)');

    // Scroll down for result
    await p1.evaluate(() => window.scrollTo(0, 500));
    await p1.waitForTimeout(1000);
    await p1.screenshot({ path: path.join(loanDir, 'result.webp'), type: 'jpeg', quality: 85 });
    console.log('✓ loan result (scrolled)');

    // Full page for repayment table
    await p1.screenshot({
      path: path.join(loanDir, 'repayment-table.webp'),
      type: 'jpeg',
      quality: 85,
      fullPage: true,
    });
    console.log('✓ loan repayment-table (full)');
  } catch (e) {
    console.error(`✗ loan: ${e.message.split('\n')[0]}`);
  }
  await p1.close();

  // Salary calculator with filled data
  const salaryDir = path.join(OUTPUT_DIR, 'salary-guide-1405');
  const p2 = await context.newPage();
  try {
    await p2.goto(`${SITE_URL}/salary`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await p2.waitForTimeout(3000);

    const inputs2 = await p2.$$('input');
    if (inputs2.length >= 1) {
      await inputs2[0].click();
      await inputs2[0].fill('10000000');
      await p2.waitForTimeout(500);

      const buttons2 = await p2.$$('button');
      for (const btn of buttons2) {
        const text = await btn.textContent();
        if (text && (text.includes('محاسبه') || text.includes('محاسبه کن'))) {
          await btn.click();
          break;
        }
      }
      await p2.waitForTimeout(2000);
    }

    await p2.screenshot({ path: path.join(salaryDir, 'step-1.webp'), type: 'jpeg', quality: 85 });
    console.log('✓ salary step-1 (filled)');

    await p2.evaluate(() => window.scrollTo(0, 400));
    await p2.waitForTimeout(1000);
    await p2.screenshot({ path: path.join(salaryDir, 'result.webp'), type: 'jpeg', quality: 85 });
    console.log('✓ salary result');
  } catch (e) {
    console.error(`✗ salary: ${e.message.split('\n')[0]}`);
  }
  await p2.close();

  // Persian writing studio with sample text
  const writingDir = path.join(OUTPUT_DIR, 'persian-writing-studio-guide');
  const p3 = await context.newPage();
  try {
    await p3.goto(`${SITE_URL}/writing-tools/persian-writing-studio`, {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });
    await p3.waitForTimeout(3000);

    // Find textarea and type sample Persian text with common errors
    const textarea = await p3.$('textarea');
    if (textarea) {
      await textarea.click();
      await textarea.fill(
        'می خواهم متن فارسي خود را پاك سازي كنم. اين متن داراي اشتباهات رايج فارسي است.',
      );
      await p3.waitForTimeout(1000);

      // Click clean button
      const buttons3 = await p3.$$('button');
      for (const btn of buttons3) {
        const text = await btn.textContent();
        if (
          text &&
          (text.includes('پاک‌سازی') || text.includes('پاکسازی') || text.includes('پاک کردن'))
        ) {
          await btn.click();
          break;
        }
      }
      await p3.waitForTimeout(2000);
    }

    await p3.screenshot({ path: path.join(writingDir, 'step-1.webp'), type: 'jpeg', quality: 85 });
    console.log('✓ writing step-1');

    await p3.screenshot({
      path: path.join(writingDir, 'result.webp'),
      type: 'jpeg',
      quality: 85,
      fullPage: true,
    });
    console.log('✓ writing result (full)');
  } catch (e) {
    console.error(`✗ writing: ${e.message.split('\n')[0]}`);
  }
  await p3.close();

  // Resume builder
  const resumeDir = path.join(OUTPUT_DIR, 'resume-builder-guide');
  const p4 = await context.newPage();
  try {
    await p4.goto(`${SITE_URL}/career-tools/resume-builder`, {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });
    await p4.waitForTimeout(4000);
    await p4.screenshot({ path: path.join(resumeDir, 'step-1.webp'), type: 'jpeg', quality: 85 });
    console.log('✓ resume step-1');

    // Try to navigate to preview
    const links = await p4.$$('a, button');
    for (const link of links) {
      const text = await link.textContent();
      if (
        text &&
        (text.includes('پیش‌نمایش') || text.includes('Preview') || text.includes('مشاهده'))
      ) {
        await link.click();
        await p4.waitForTimeout(2000);
        break;
      }
    }
    await p4.screenshot({ path: path.join(resumeDir, 'result.webp'), type: 'jpeg', quality: 85 });
    console.log('✓ resume result');
  } catch (e) {
    console.error(`✗ resume: ${e.message.split('\n')[0]}`);
  }
  await p4.close();

  // PDF tools
  const pdfDir = path.join(OUTPUT_DIR, 'pdf-compression-workflow-guide');
  const p5 = await context.newPage();
  try {
    await p5.goto(`${SITE_URL}/pdf-tools/compress/compress-pdf`, {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });
    await p5.waitForTimeout(3000);
    await p5.screenshot({ path: path.join(pdfDir, 'step-1.webp'), type: 'jpeg', quality: 85 });
    console.log('✓ pdf step-1');
  } catch (e) {
    console.error(`✗ pdf: ${e.message.split('\n')[0]}`);
  }
  await p5.close();

  await browser.close();
  console.log('\nAll enhanced screenshots done!');
}

captureWithFormData().catch(console.error);
