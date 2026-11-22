import { readFile } from 'node:fs/promises';
import { expect, test, type Page } from '@playwright/test';
import fontkit from '@pdf-lib/fontkit';
import { PDFDocument } from 'pdf-lib';

async function chooseFixture(page: Page, path: string, source: PDFDocument) {
  const fixture = {
    name: 'text-fixture.PDF',
    mimeType: 'application/pdf',
    buffer: Buffer.from(await source.save()),
  };
  await page.goto(path);
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
    const downloadAction = page.getByText('دانلود TXT', { exact: true });
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
}
