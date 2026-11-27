import { readFile } from 'node:fs/promises';
import { expect, test, type Page } from '@playwright/test';
import fontkit from '@pdf-lib/fontkit';
import { PDFDocument } from 'pdf-lib';

async function chooseFixture(page: Page, path: string, source: PDFDocument | Uint8Array) {
  const fixture = {
    name: 'text-fixture.PDF',
    mimeType: 'application/pdf',
    buffer: Buffer.from(source instanceof Uint8Array ? source : await source.save()),
  };
  await page.goto(path);
  const consent = page.getByRole('dialog', { name: 'cookie consent' });
  await consent.getByRole('button', { name: 'رد همه کوکی‌ها', exact: true }).click();
  await expect(consent).toBeHidden();
  const input = page.getByLabel('انتخاب فایل', { exact: true });
  await expect(async () => {
    if (await input.count()) {
      await input.setInputFiles(fixture);
    }
    await expect(page.getByText(fixture.name, { exact: true })).toBeVisible({ timeout: 1_000 });
  }).toPass({ timeout: 10_000 });
}

for (const tool of [
  {
    path: '/pdf-tools/extract/extract-text',
    action: 'استخراج متن',
    output: 'text-fixture_text.txt',
  },
  { path: '/pdf-tools/convert/pdf-to-text', action: 'تبدیل به متن', output: 'text-fixture.txt' },
]) {
  test(`${tool.action} preserves Persian and Latin lines in the downloaded TXT`, async ({
    page,
  }) => {
    const source = await PDFDocument.create();
    source.registerFontkit(fontkit);
    const font = await source.embedFont(await readFile('public/fonts/Vazirmatn-Regular.ttf'), {
      subset: true,
    });
    const sample = source.addPage([400, 300]);
    sample.drawText('گزارش نمونه', { x: 180, y: 250, size: 16, font });
    sample.drawText('English test 42', { x: 20, y: 200, size: 16, font });
    source.addPage().drawText('Second page', { x: 20, y: 200, size: 16, font });

    await chooseFixture(page, tool.path, source);
    await page.getByRole('button', { name: tool.action, exact: true }).click();
    const downloadAction = page.getByRole('link', { name: 'دانلود TXT', exact: true });
    await expect(downloadAction).toBeVisible({ timeout: 15_000 });
    const [download] = await Promise.all([page.waitForEvent('download'), downloadAction.click()]);
    expect(download.suggestedFilename()).toBe(tool.output);
    const output = await readFile(await download.path(), 'utf8');
    expect(output).toMatch(/گزارش نمونه\r?\nEnglish test 42[\s\S]*Second page/);
    if (tool.path.includes('/extract/')) {
      expect(output).toContain('--- صفحه 2 ---');
    } else {
      expect(output).not.toContain('--- صفحه');
    }
  });

  test(`${tool.action} reports a document without selectable text and can accept another PDF`, async ({
    page,
  }) => {
    const source = await PDFDocument.create();
    source.addPage().drawRectangle({ x: 20, y: 20, width: 120, height: 70 });
    source.addPage();

    await chooseFixture(page, tool.path, source);
    await page.getByRole('button', { name: tool.action, exact: true }).click();
    const error = page.getByRole('main').getByRole('alert');
    await expect(error).toContainText('متن قابل انتخاب');
    await expect(page.getByText('دانلود TXT', { exact: true })).toHaveCount(0);
    await page.getByRole('button', { name: 'فایل جدید', exact: true }).click();
    await expect(page.getByLabel('انتخاب فایل', { exact: true })).toBeVisible();
  });

  test(`${tool.action} preserves text that uses a predefined Japanese CMap`, async ({ page }) => {
    // Synthetic ReportLab sample with Helvetica and HeiseiMin-W3 (UniJIS-UCS2-H).
    const source = await readFile('tests/e2e/fixtures/predefined-japanese-cmap.pdf');
    await chooseFixture(page, tool.path, source);
    await page.getByRole('button', { name: tool.action, exact: true }).click();
    const link = page.locator(`a[download="${tool.output}"]`);
    await expect(link).toBeVisible();
    await link.evaluate((element) =>
      element.scrollIntoView({ block: 'center', behavior: 'instant' }),
    );
    const [download] = await Promise.all([page.waitForEvent('download'), link.click()]);
    const output = await readFile(await download.path(), 'utf8');
    expect(output).toContain('Latin reference');
    expect(output).toContain('日本語のテスト');
  });
}
