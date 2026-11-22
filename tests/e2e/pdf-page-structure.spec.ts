import { getDocument, OPS, Util } from 'pdfjs-dist/legacy/build/pdf.mjs';
import JSZip from 'jszip';
import { readFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';
import {
  degrees,
  PDFArray,
  PDFDict,
  PDFDocument,
  PDFName,
  PDFRawStream,
  decodePDFRawStream,
} from 'pdf-lib';

test('reordering real pages keeps the same document form, metadata and attachment', async ({
  page,
}) => {
  const document = await PDFDocument.create();
  document.setTitle('Synthetic reorder fixture');
  const first = document.addPage([200, 170]);
  const second = document.addPage([280, 230]);
  second.setRotation(degrees(90));
  const field = document.getForm().createTextField('reference');
  field.addToPage(first, { x: 20, y: 30, width: 100, height: 20 });
  field.setText('Example 42');
  await document.attach(new Uint8Array([1, 3, 7]), 'fixture.bin');

  await page.goto('/pdf-tools/edit/reorder-pages');
  const input = page.getByLabel('انتخاب فایل PDF');
  const fixture = {
    name: 'reorder-fixture.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from(await document.save()),
  };
  await expect(async () => {
    await input.setInputFiles([]);
    await input.setInputFiles(fixture);
    await expect(
      page.getByText(fixture.name, { exact: false }).or(page.getByText('در حال شمارش صفحه‌ها…')),
    ).toBeVisible({ timeout: 1_500 });
  }).toPass({ timeout: 10_000 });
  await expect(page.getByText(fixture.name, { exact: false })).toBeVisible({ timeout: 20_000 });
  await page.getByLabel('ترتیب جدید صفحات').fill('2,1');
  await page.getByRole('button', { name: 'جابجایی صفحات', exact: true }).click();

  const link = page.getByRole('link', { name: 'دانلود فایل', exact: true });
  const [download] = await Promise.all([page.waitForEvent('download'), link.click()]);
  const path = await download.path();
  if (!path) {
    throw new Error('The downloaded PDF has no local path.');
  }
  const output = await PDFDocument.load(await readFile(path));
  expect(output.getPages().map((item) => item.getWidth())).toEqual([280, 200]);
  expect(output.getPage(0).getRotation().angle).toBe(90);
  expect(output.getForm().getTextField('reference').getText()).toBe('Example 42');
  expect(output.getTitle()).toBe('Synthetic reorder fixture');
  const names = output.catalog.lookup(PDFName.of('Names'), PDFDict);
  const attachments = names.lookup(PDFName.of('EmbeddedFiles'), PDFDict);
  expect(attachments.lookup(PDFName.of('Names'), PDFArray).size()).toBe(2);
});

test('an earlier file read cannot overwrite the latest reorder selection', async ({ page }) => {
  await page.addInitScript(() => {
    const original = File.prototype.arrayBuffer;
    File.prototype.arrayBuffer = async function () {
      if (this.name === 'reorder-slow.pdf') {
        document.documentElement.dataset['pdfReadWaiting'] = 'true';
        await new Promise<void>((resolve) => {
          document.addEventListener('release-pdf-read', () => resolve(), { once: true });
        });
      }
      return original.call(this);
    };
  });
  const first = await PDFDocument.create();
  first.addPage([100, 100]);
  const second = await PDFDocument.create();
  second.addPage([200, 200]);
  second.addPage([300, 300]);

  await page.goto('/pdf-tools/edit/reorder-pages');
  const input = page.getByLabel('انتخاب فایل PDF');
  const slow = Buffer.from(await first.save());
  const fast = Buffer.from(await second.save());
  await expect(async () => {
    await input.setInputFiles([]);
    await input.setInputFiles({
      name: 'reorder-slow.pdf',
      mimeType: 'application/pdf',
      buffer: slow,
    });
    await expect(page.locator('html')).toHaveAttribute('data-pdf-read-waiting', 'true', {
      timeout: 1_000,
    });
  }).toPass({ timeout: 10_000 });

  await input.setInputFiles({
    name: 'reorder-fast.pdf',
    mimeType: 'application/pdf',
    buffer: fast,
  });
  await expect(page.getByText('reorder-fast.pdf', { exact: false })).toBeVisible();
  const order = page.getByLabel('ترتیب جدید صفحات');
  await order.fill('2,1');
  await page.evaluate(() => document.dispatchEvent(new Event('release-pdf-read')));
  await page.getByRole('button', { name: 'جابجایی صفحات', exact: true }).click();
  const link = page.getByRole('link', { name: 'دانلود فایل', exact: true });
  const [download] = await Promise.all([page.waitForEvent('download'), link.click()]);
  const result = await PDFDocument.load(await readFile(await download.path()));
  expect(result.getPages().map((pdfPage) => pdfPage.getWidth())).toEqual([300, 200]);
});

test('merging PDFs preserves both same-named form values and file attachments', async ({
  page,
}) => {
  async function makeSource(title: string, width: number) {
    const pdf = await PDFDocument.create();
    pdf.setTitle(title);
    const sourcePage = pdf.addPage([width, 170]);
    const field = pdf.getForm().createTextField('reference');
    field.addToPage(sourcePage, { x: 20, y: 30, width: 100, height: 20 });
    field.setText(title);
    await pdf.attach(Uint8Array.of(width), 'fixture.bin');
    return {
      name: `${title}.pdf`,
      mimeType: 'application/pdf',
      buffer: Buffer.from(await pdf.save()),
    };
  }
  const inputs = [await makeSource('First', 181), await makeSource('Second', 192)];
  await page.goto('/pdf-tools/merge/merge-pdf');
  const fileInput = page.getByLabel('انتخاب فایل PDF');
  await expect(async () => {
    await fileInput.setInputFiles([]);
    await fileInput.setInputFiles(inputs);
    await expect(page.getByText('Second.pdf', { exact: false })).toBeVisible({ timeout: 1_000 });
  }).toPass({ timeout: 10_000 });
  await page.getByRole('button', { name: 'ادغام PDF', exact: true }).click();

  const link = page.getByRole('link', { name: 'دانلود فایل', exact: true });
  const [download] = await Promise.all([page.waitForEvent('download'), link.click()]);
  const file = await download.path();
  if (!file) {
    throw new Error('The downloaded PDF has no local path.');
  }
  const output = await PDFDocument.load(await readFile(file));
  expect(output.getPages().map((item) => item.getWidth())).toEqual([181, 192]);
  expect(output.getTitle()).toBe('First');
  const fields = output
    .getForm()
    .getFields()
    .map((item) => item.getName());
  expect(fields).toHaveLength(2);
  expect(new Set(fields).size).toBe(2);
  expect(fields.map((name) => output.getForm().getTextField(name).getText())).toEqual([
    'First',
    'Second',
  ]);
  const attachments = output.catalog
    .lookup(PDFName.of('Names'), PDFDict)
    .lookup(PDFName.of('EmbeddedFiles'), PDFDict);
  expect(attachments.lookup(PDFName.of('Names'), PDFArray).size()).toBe(4);
});

for (const mode of ['delete', 'extract'] as const) {
  test(`${mode} keeps remaining form data and excludes the discarded page stream`, async ({
    page,
  }) => {
    const document = await PDFDocument.create();
    document.setTitle('Subset fixture');
    const retained = document.addPage([181, 170]);
    const discarded = document.addPage([243, 160]);
    retained.drawText('Synthetic kept content', { x: 20, y: 140 });
    const discardedText = 'SYNTHETIC_DISCARDED_PAGE';
    discarded.drawText(discardedText, { x: 20, y: 130 });
    for (const [source, name] of [
      [retained, 'retained'],
      [discarded, 'discarded'],
    ] as const) {
      const field = document.getForm().createTextField(name);
      field.addToPage(source, { x: 20, y: 30, width: 100, height: 20 });
      field.setText(name);
    }
    await document.attach(Uint8Array.of(4, 7), 'fixture.bin');
    const fixture = {
      name: 'subset-fixture.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from(await document.save()),
    };
    await page.goto(
      mode === 'delete' ? '/pdf-tools/edit/delete-pages' : '/pdf-tools/extract/extract-pages',
    );
    const input = page.getByLabel('انتخاب فایل PDF');
    await expect(async () => {
      await input.setInputFiles([]);
      await input.setInputFiles(fixture);
      await expect(page.getByText(fixture.name, { exact: false })).toBeVisible({ timeout: 1_000 });
    }).toPass({ timeout: 10_000 });
    await page
      .locator(mode === 'delete' ? '#delete-pages-input' : '#extract-pages-input')
      .fill(mode === 'delete' ? '2' : '1');
    const button = mode === 'delete' ? 'حذف صفحات' : 'استخراج صفحات';
    await page.getByRole('button', { name: button, exact: true }).click();
    const link = page.locator(
      mode === 'delete' ? 'a[download="cleaned.pdf"]' : 'a[download="extracted.pdf"]',
    );
    const [download] = await Promise.all([page.waitForEvent('download'), link.click()]);
    const file = await download.path();
    if (!file) throw new Error('The downloaded PDF has no local path.');
    const output = await PDFDocument.load(await readFile(file));
    expect(output.getPages().map((item) => item.getWidth())).toEqual([181]);
    expect(
      output
        .getForm()
        .getFields()
        .map((field) => field.getName()),
    ).toEqual(['retained']);
    expect(output.getForm().getTextField('retained').getText()).toBe('retained');
    const hasAttachment =
      output.catalog.lookupMaybe(PDFName.of('Names'), PDFDict)?.has(PDFName.of('EmbeddedFiles')) ??
      false;
    expect(hasAttachment).toBe(mode === 'delete');

    const encoded = Buffer.from(discardedText).toString('hex').toUpperCase();
    const streams = output.context.enumerateIndirectObjects().flatMap(([, object]) => {
      return object instanceof PDFRawStream &&
        object.dict.get(PDFName.of('Filter')) === PDFName.of('FlateDecode')
        ? [Buffer.from(decodePDFRawStream(object).decode()).toString('latin1').toUpperCase()]
        : [];
    });
    expect(streams.some((stream) => stream.includes(encoded))).toBe(false);
  });
}

test('splitting a PDF downloads the actual document parts in order', async ({ page }) => {
  const pdf = await PDFDocument.create();
  for (const width of [180, 190, 210, 260, 290]) {
    const source = pdf.addPage([width, 170]);
    const field = pdf.getForm().createTextField(`page${width}`);
    field.addToPage(source, { x: 20, y: 30, width: 70, height: 20 });
    field.setText(String(width));
  }
  const fixture = {
    name: 'split-fixture.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from(await pdf.save()),
  };
  await page.goto('/pdf-tools/split/split-pdf');
  const input = page.getByLabel('انتخاب فایل PDF');
  await expect(async () => {
    await input.setInputFiles([]);
    await input.setInputFiles(fixture);
    await expect(page.getByText(fixture.name, { exact: false })).toBeVisible({ timeout: 1_000 });
  }).toPass({ timeout: 10_000 });
  await page.locator('#split-pdf-pages').fill('۲');
  await page.getByRole('button', { name: 'تقسیم صفحات', exact: true }).click();
  const link = page.locator('a[download="split.zip"]');
  const [download] = await Promise.all([
    page.waitForEvent('download', { timeout: 10_000 }),
    link.click({ timeout: 10_000 }),
  ]);
  const path = await download.path();
  if (!path) throw new Error('The archive has no local path.');
  const archive = await JSZip.loadAsync(await readFile(path));
  const names = Object.keys(archive.files);
  expect(names).toEqual(['part-1.pdf', 'part-2.pdf', 'part-3.pdf']);
  const outputs = await Promise.all(
    names.map(async (name) => {
      const entry = archive.file(name);
      if (!entry) throw new Error('Missing PDF part');
      return PDFDocument.load(await entry.async('uint8array'));
    }),
  );
  expect(outputs.map((output) => output.getPages().map((item) => item.getWidth()))).toEqual([
    [180, 190],
    [210, 260],
    [290],
  ]);
  expect(outputs[1]?.getForm().getTextField('page260').getText()).toBe('260');
});

test('page rotation is relative and leaves unselected pages unchanged', async ({ page }) => {
  const pdf = await PDFDocument.create();
  pdf.setTitle('Rotation fixture');
  const first = pdf.addPage([200, 170]);
  first.setRotation(degrees(270));
  const field = pdf.getForm().createTextField('reference');
  field.addToPage(first, { x: 15, y: 30, width: 100, height: 20 });
  field.setText('Example 42');
  pdf.addPage([280, 230]).setRotation(degrees(180));
  const fixture = {
    name: 'rotation-fixture.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from(await pdf.save()),
  };
  await page.goto('/pdf-tools/edit/rotate-pages');
  const input = page.getByLabel('انتخاب فایل PDF');
  await expect(async () => {
    await input.setInputFiles([]);
    await input.setInputFiles(fixture);
    await expect(page.getByText(fixture.name, { exact: false })).toBeVisible({ timeout: 1_000 });
  }).toPass({ timeout: 10_000 });
  await page.getByPlaceholder('مثال: 1-3,5,8').fill('۱');
  await page.getByRole('button', { name: 'چرخش صفحات', exact: true }).click();
  const link = page.locator('a[download="rotated.pdf"]');
  const [download] = await Promise.all([page.waitForEvent('download'), link.click()]);
  const path = await download.path();
  if (!path) throw new Error('The downloaded PDF has no local path.');
  const output = await PDFDocument.load(await readFile(path));
  expect(output.getPages().map((p) => p.getRotation().angle)).toEqual([0, 180]);
  expect(output.getTitle()).toBe('Rotation fixture');
  expect(output.getForm().getTextField('reference').getText()).toBe('Example 42');
});

for (const operation of ['rotation', 'watermark'] as const) {
  test(`${operation} refuses to rewrite a PDF with a signature field`, async ({ page }) => {
    const pdf = await PDFDocument.create();
    const source = pdf.addPage();
    const field = pdf.getForm().createTextField('synthetic-signature-field');
    field.addToPage(source);
    field.acroField.dict.set(PDFName.of('FT'), PDFName.of('Sig'));
    const fixture = {
      name: 'rotation-signature-field.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from(await pdf.save({ updateFieldAppearances: false })),
    };
    const rotation = operation === 'rotation';
    await page.goto(
      rotation ? '/pdf-tools/edit/rotate-pages' : '/pdf-tools/watermark/add-watermark',
    );
    const input = page.getByLabel('انتخاب فایل PDF');
    await expect(async () => {
      await input.setInputFiles([]);
      await input.setInputFiles(fixture);
      await expect(page.getByText(fixture.name)).toBeVisible({ timeout: 1_500 });
    }).toPass({ timeout: 10_000 });
    if (rotation) {
      await page.getByPlaceholder('مثال: 1-3,5,8').fill('1');
    } else {
      await page.locator('#watermark-text').fill('نسخه آزمایشی');
    }
    await page
      .getByRole('button', { name: rotation ? 'چرخش صفحات' : 'اعمال واترمارک', exact: true })
      .click();
    await expect(
      page.getByRole('main').getByRole('alert').filter({ hasText: 'امضای دیجیتال' }),
    ).toBeVisible();
    await expect(
      page.locator(rotation ? 'a[download="rotated.pdf"]' : 'a[download="watermarked.pdf"]'),
    ).toHaveCount(0);
  });
}

test.describe('watermark font loading', () => {
  test.use({ serviceWorkers: 'block' });
  test('mixed Persian watermark is embedded in a cropped and rotated PDF', async ({ page }) => {
    const pdf = await PDFDocument.create();
    const source = pdf.addPage([450, 320]);
    source.setRotation(degrees(90));
    source.setCropBox(20, 30, 300, 230);
    source.drawText('Original document', { x: 50, y: 60 });
    const fixture = {
      name: 'watermark-fixture.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from(await pdf.save()),
    };
    await page.goto('/pdf-tools/watermark/add-watermark');
    const input = page.getByLabel('انتخاب فایل PDF');
    await expect(async () => {
      await input.setInputFiles([]);
      await input.setInputFiles(fixture);
      await expect(page.getByText(fixture.name, { exact: false })).toBeVisible({ timeout: 1_000 });
    }).toPass({ timeout: 10_000 });
    await page.locator('#watermark-text').fill('گزارش Test ۱۲۳');
    await page.locator('#watermark-rotation').fill('25');
    await page.locator('#watermark-position').selectOption('top-right');
    const apply = page.getByRole('button', { name: 'اعمال واترمارک', exact: true });
    const font = '**/fonts/Vazirmatn-Regular.ttf';
    await page.route(font, (route) => route.abort(), { times: 1 });
    await apply.click();
    await expect(
      page.getByRole('alert').filter({ hasText: 'بارگیری فونت واترمارک ناموفق بود' }),
    ).toBeVisible();
    await apply.click();
    const link = page.locator('a[download="watermarked.pdf"]');
    await expect(link).toBeVisible({ timeout: 10_000 });
    const [download] = await Promise.all([page.waitForEvent('download'), link.click()]);
    const path = await download.path();
    if (!path) throw new Error('The downloaded PDF has no local path.');
    const bytes = await readFile(path);
    const output = await PDFDocument.load(bytes);
    const marked = output.getPage(0);
    expect(marked.getRotation().angle).toBe(90);
    expect(marked.getCropBox()).toEqual({ x: 20, y: 30, width: 300, height: 230 });
    const resources = marked.node.Resources();
    const objects = resources?.lookupMaybe(PDFName.of('XObject'), PDFDict);
    expect(objects?.keys()).toHaveLength(1);

    const loading = getDocument({ data: Uint8Array.from(bytes), isEvalSupported: false });
    try {
      const pageProxy = await (await loading.promise).getPage(1);
      const viewport = pageProxy.getViewport({ scale: 1 });
      const operators = await pageProxy.getOperatorList();
      const positions = [viewport.transform];
      let matrix = viewport.transform;
      let foundImage = false;
      let opacity: number | undefined;
      for (const [index, operator] of operators.fnArray.entries()) {
        const args = operators.argsArray[index];
        switch (operator) {
          case OPS.save:
            positions.push(matrix);
            break;
          case OPS.restore:
            matrix = positions.pop() ?? viewport.transform;
            break;
          case OPS.transform:
            matrix = Util.transform(matrix, args);
            break;
          case OPS.setGState: {
            const params = args?.[0] as [string, number][] | undefined;
            opacity = params?.find(([key]) => key === 'ca')?.[1] ?? opacity;
            break;
          }
          case OPS.paintImageXObject:
            foundImage = true;
            break;
        }
        if (foundImage) break;
      }
      expect(foundImage).toBe(true);
      expect(opacity).toBeCloseTo(0.2);
      const corners = [
        [0, 0],
        [1, 0],
        [0, 1],
        [1, 1],
      ].map((point) => Util.applyTransform(point, matrix));
      const xs = corners.map((point) => point[0] ?? 0);
      const ys = corners.map((point) => point[1] ?? 0);
      expect(viewport.width - Math.max(...xs)).toBeCloseTo(24, 1);
      expect(Math.min(...ys)).toBeCloseTo(24, 1);
      expect(Math.min(...xs)).toBeGreaterThan(0);
      expect(Math.max(...ys)).toBeLessThan(viewport.height);
      expect((Math.atan2(-(matrix[1] ?? 0), matrix[0] ?? 0) * 180) / Math.PI).toBeCloseTo(25, 1);
    } finally {
      await loading.destroy();
    }
  });
});
