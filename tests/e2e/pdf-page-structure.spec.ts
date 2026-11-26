import { getDocument, OPS, Util } from 'pdfjs-dist/legacy/build/pdf.mjs';
import JSZip from 'jszip';
import { readFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';
import {
  degrees,
  PDFArray,
  PDFDict,
  PDFDocument,
  PDFHexString,
  PDFName,
  PDFNumber,
  PDFOperator,
  PDFOperatorNames,
  PDFRawStream,
  PDFString,
  decodePDFRawStream,
  endMarkedContent,
} from 'pdf-lib';

function addTagTree(document: PDFDocument) {
  const context = document.context;
  const root = context.nextRef();
  const entries = document.getPages().map((page, index) => {
    page.node.set(PDFName.of('StructParents'), PDFNumber.of(index));
    page.pushOperators(
      PDFOperator.of(PDFOperatorNames.BeginMarkedContentSequence, [PDFName.of('P'), '<</MCID 0>>']),
    );
    page.drawText(`Tagged paragraph ${index + 1}`, { x: 25, y: 80 });
    page.pushOperators(endMarkedContent());
    return context.register(
      context.obj({ Type: 'StructElem', S: 'P', P: root, Pg: page.ref, K: 0 }),
    );
  });
  const parents = context.register(
    context.obj({ Nums: entries.flatMap((entry, index) => [index, [entry]]) }),
  );
  context.assign(root, context.obj({ Type: 'StructTreeRoot', K: entries, ParentTree: parents }));
  document.catalog.set(PDFName.of('StructTreeRoot'), root);
  document.catalog.set(PDFName.of('MarkInfo'), context.obj({ Marked: true }));
}

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
  addTagTree(document);

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
  const bytes = await readFile(path);
  const output = await PDFDocument.load(bytes);
  expect(output.getPages().map((item) => item.getWidth())).toEqual([280, 200]);
  const structure = output.catalog.lookup(PDFName.of('StructTreeRoot'), PDFDict);
  const tags = structure.lookup(PDFName.of('K'), PDFArray);
  expect(tags.lookup(0, PDFDict).get(PDFName.of('Pg'))).toBe(output.getPage(1).ref);
  expect(tags.lookup(1, PDFDict).get(PDFName.of('Pg'))).toBe(output.getPage(0).ref);
  const parentTree = structure.lookup(PDFName.of('ParentTree'), PDFDict);
  const parentEntries = parentTree.lookup(PDFName.of('Nums'), PDFArray);
  expect(parentEntries.lookup(1, PDFArray).get(0)).toBe(tags.get(0));
  expect(parentEntries.lookup(3, PDFArray).get(0)).toBe(tags.get(1));
  const loading = getDocument({ data: Uint8Array.from(bytes), isEvalSupported: false });
  try {
    const readPdf = await loading.promise;
    const firstPage = await readPdf.getPage(1);
    expect(await firstPage.getStructTree()).toMatchObject({
      children: [{ role: 'P', children: [{ type: 'content' }] }],
    });
    const text = await firstPage.getTextContent();
    expect(text.items).toEqual(
      expect.arrayContaining([expect.objectContaining({ str: 'Tagged paragraph 2' })]),
    );
  } finally {
    await loading.destroy();
  }
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

test('merge rejects a zero-byte selection before adding it to the list', async ({ page }) => {
  await page.goto('/pdf-tools/merge/merge-pdf');
  const main = page.getByRole('main');
  const input = main.getByLabel('انتخاب فایل PDF');
  await input.setInputFiles({
    name: 'zero-byte.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.alloc(0),
  });
  await expect(main.getByRole('alert').filter({ hasText: 'zero-byte.pdf' })).toContainText('خالی');
  await expect(main.getByRole('button', { name: 'حذف', exact: true })).toHaveCount(0);

  const document = await PDFDocument.create();
  document.addPage([245, 170]);
  await input.setInputFiles({
    name: 'valid.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from(await document.save()),
  });
  await expect(main.getByText('valid.pdf', { exact: false })).toBeVisible();
  await expect(main.getByRole('alert').filter({ hasText: 'zero-byte.pdf' })).toHaveCount(0);
});

test('merging PDFs preserves colliding form names, file attachments and internal links', async ({
  page,
}) => {
  async function makeSource(title: string, width: number) {
    const pdf = await PDFDocument.create();
    pdf.setTitle(title);
    const sourcePage = pdf.addPage([width, 170]);
    const destinationPage = pdf.addPage([width + 1, 170]);
    const destinationName = PDFString.of('chapter');
    const firstOnlyName = PDFString.of('only-in-first');
    const destinations = [destinationName, [destinationPage.ref, 'Fit']];
    if (title === 'First') {
      destinations.push(firstOnlyName, [destinationPage.ref, 'Fit']);
    }
    pdf.catalog.set(PDFName.of('Names'), pdf.context.obj({ Dests: { Names: destinations } }));
    if (title === 'Second') {
      sourcePage.node.addAnnot(
        pdf.context.register(
          pdf.context.obj({
            Subtype: 'Link',
            Rect: [20, 110, 120, 130],
            A: {
              S: 'URI',
              URI: PDFString.of('https://example.com/'),
              Next: [
                { S: 'GoTo', D: firstOnlyName },
                { S: 'GoTo', D: destinationName },
              ],
            },
          }),
        ),
      );
    }
    sourcePage.node.addAnnot(
      pdf.context.register(
        pdf.context.obj({
          Subtype: 'Link',
          Rect: [20, 80, 120, 100],
          A: { S: 'GoTo', D: destinationName },
        }),
      ),
    );
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
  const bytes = await readFile(file);
  const output = await PDFDocument.load(bytes);
  expect(output.getPages().map((item) => item.getWidth())).toEqual([181, 182, 192, 193]);
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
  const secondPageAnnotations = output.getPage(2).node.Annots()?.asArray() ?? [];
  const webAction = secondPageAnnotations
    .map((ref) => output.context.lookup(ref, PDFDict).lookupMaybe(PDFName.of('A'), PDFDict))
    .find((action) => action?.get(PDFName.of('S')) === PDFName.of('URI'));
  const followUps = webAction?.lookup(PDFName.of('Next'), PDFArray);
  expect(followUps?.size()).toBe(1);
  expect(followUps?.lookup(0, PDFDict).lookup(PDFName.of('D'), PDFArray).get(0)).toBe(
    output.getPage(3).ref,
  );

  const loadingTask = getDocument({ data: new Uint8Array(bytes) });
  try {
    const rendered = await loadingTask.promise;
    for (const pageNumber of [1, 3]) {
      const sourcePage = await rendered.getPage(pageNumber);
      const annotations = await sourcePage.getAnnotations();
      const internalLinks = annotations.filter(
        (annotation) =>
          annotation.subtype === 'Link' &&
          (typeof annotation.dest === 'string' || Array.isArray(annotation.dest)),
      );
      expect(internalLinks).toHaveLength(1);
      const [link] = internalLinks;
      const destination =
        typeof link?.dest === 'string' ? await rendered.getDestination(link.dest) : link?.dest;
      expect(destination).toBeTruthy();
      expect(await rendered.getPageIndex(destination[0])).toBe(pageNumber);
    }
  } finally {
    await loadingTask.destroy();
  }
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
    for (const [index, target] of [retained, discarded].entries()) {
      retained.node.addAnnot(
        document.context.register(
          document.context.obj({
            Type: 'Annot',
            Subtype: 'Link',
            Rect: [20, 55 + index * 20, 100, 70 + index * 20],
            ...(index === 0
              ? { Dest: [target.ref, 'Fit'] }
              : { A: { S: 'GoTo', D: [target.ref, 'Fit'] } }),
          }),
        ),
      );
    }
    retained.node.addAnnot(
      document.context.register(
        document.context.obj({
          Subtype: 'Link',
          Rect: [20, 95, 100, 110],
          A: {
            S: 'URI',
            URI: PDFHexString.fromText('https://example.com/'),
            Next: [
              { S: 'GoTo', D: [discarded.ref, 'Fit'] },
              { S: 'GoTo', D: [retained.ref, 'Fit'] },
            ],
          },
        }),
      ),
    );
    const outline = document.context.nextRef();
    const parent = document.context.nextRef();
    const child = document.context.nextRef();
    document.context.assign(
      outline,
      document.context.obj({ Type: 'Outlines', First: parent, Last: parent }),
    );
    document.context.assign(
      parent,
      document.context.obj({
        Title: PDFHexString.fromText('Group with an excluded destination'),
        Parent: outline,
        Dest: [discarded.ref, 'Fit'],
        First: child,
        Last: child,
        Count: 1,
      }),
    );
    document.context.assign(
      child,
      document.context.obj({
        Title: PDFHexString.fromText('Retained chapter'),
        Parent: parent,
        Dest: [retained.ref, 'Fit'],
      }),
    );
    document.catalog.set(PDFName.of('Outlines'), outline);
    const retainedName = PDFHexString.fromText('فصل باقی‌مانده');
    const discardedName = PDFName.of('discarded-chapter');
    const nameTreeLeaf = document.context.register(
      document.context.obj({
        Limits: [retainedName, retainedName],
        Names: [retainedName, { D: [retained.ref, 'FitH', 120] }],
      }),
    );
    const discardedString = PDFString.of('discarded-tree-destination');
    const retainedString = PDFString.of('retained-tree-destination');
    const discardedLeaf = document.context.register(
      document.context.obj({
        Limits: [discardedString, discardedString],
        Names: [discardedString, [discarded.ref, 'Fit']],
      }),
    );
    const retainedLeaf = document.context.register(
      document.context.obj({
        Limits: [retainedString, retainedString],
        Names: [retainedString, [retained.ref, 'Fit']],
      }),
    );
    document.catalog.set(
      PDFName.of('Names'),
      document.context.obj({
        Dests: { Kids: [discardedLeaf, retainedLeaf, nameTreeLeaf] },
      }),
    );
    document.catalog.set(
      PDFName.of('Dests'),
      document.context.obj({
        'discarded-chapter': [discarded.ref, 'Fit'],
        'retained-chapter': [retained.ref, 'Fit'],
      }),
    );
    document.catalog.set(
      PDFName.of('OpenAction'),
      document.context.register(document.context.obj({ S: 'GoTo', D: discardedName })),
    );
    for (const [index, target] of [retainedName, discardedName].entries()) {
      retained.node.addAnnot(
        document.context.register(
          document.context.obj({
            Subtype: 'Link',
            Rect: [20, 120 + index * 15, 100, 133 + index * 15],
            A: { S: 'GoTo', D: target },
          }),
        ),
      );
    }
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
    const bytes = await readFile(file);
    const output = await PDFDocument.load(bytes);
    expect(output.getPages().map((item) => item.getWidth())).toEqual([181]);
    expect(output.catalog.has(PDFName.of('OpenAction'))).toBe(false);
    expect(
      output
        .getForm()
        .getFields()
        .map((field) => field.getName()),
    ).toEqual(['retained']);
    expect(output.getForm().getTextField('retained').getText()).toBe('retained');
    const keptPage = output.getPage(0);
    const annotations = keptPage.node.Annots()?.asArray() ?? [];
    const links = annotations
      .map((ref) => output.context.lookup(ref, PDFDict))
      .filter((annotation) => annotation.get(PDFName.of('Subtype')) === PDFName.of('Link'));
    expect(links).toHaveLength(3);
    expect(links[0]?.lookup(PDFName.of('Dest'), PDFArray).get(0)).toBe(keptPage.ref);
    expect(links[1]?.lookup(PDFName.of('A'), PDFDict).get(PDFName.of('S'))).toBe(PDFName.of('URI'));
    const webAction = links[1]?.lookup(PDFName.of('A'), PDFDict);
    const followUps = webAction?.lookup(PDFName.of('Next'), PDFArray);
    expect(followUps?.size()).toBe(1);
    expect(followUps?.lookup(0, PDFDict).lookup(PDFName.of('D'), PDFArray).get(0)).toBe(
      keptPage.ref,
    );
    const resolved = links[2]?.lookup(PDFName.of('A'), PDFDict).lookup(PDFName.of('D'), PDFArray);
    expect(resolved?.get(0)).toBe(keptPage.ref);
    expect(resolved?.get(1)).toBe(PDFName.of('FitH'));
    const outlines = output.catalog.lookupMaybe(PDFName.of('Outlines'), PDFDict);
    if (mode === 'delete') {
      const legacy = output.catalog.lookup(PDFName.of('Dests'), PDFDict);
      expect(legacy.has(discardedName)).toBe(false);
      expect(legacy.lookup(PDFName.of('retained-chapter'), PDFArray).get(0)).toBe(keptPage.ref);
      const loadingTask = getDocument({ data: new Uint8Array(bytes) });
      try {
        const reader = await loadingTask.promise;
        expect(await reader.getDestination(discardedString.decodeText())).toBeNull();
        const retainedDestination = await reader.getDestination(retainedName.decodeText());
        expect(retainedDestination).toBeTruthy();
        expect(await reader.getPageIndex(retainedDestination?.[0])).toBe(0);
        const retainedAsciiDestination = await reader.getDestination(retainedString.decodeText());
        expect(await reader.getPageIndex(retainedAsciiDestination?.[0])).toBe(0);
      } finally {
        await loadingTask.destroy();
      }
      const heading = outlines?.lookup(PDFName.of('First'), PDFDict);
      expect(heading?.has(PDFName.of('Dest'))).toBe(false);
      const bookmark = heading?.lookup(PDFName.of('First'), PDFDict);
      expect(bookmark?.lookup(PDFName.of('Dest'), PDFArray).get(0)).toBe(keptPage.ref);
    } else {
      expect(outlines).toBeUndefined();
    }
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
  const [first, samePart, otherPart] = pdf.getPages();
  if (!first || !samePart || !otherPart) {
    throw new Error('Missing split fixture pages');
  }
  const label = PDFHexString.fromText('same-part');
  pdf.catalog.set(
    PDFName.of('Names'),
    pdf.context.obj({ Dests: { Names: [label, [samePart.ref, 'Fit']] } }),
  );
  for (const destination of [label, pdf.context.obj([otherPart.ref, 'Fit'])]) {
    first.node.addAnnot(
      pdf.context.register(
        pdf.context.obj({
          Subtype: 'Link',
          Rect: [20, 60, 110, 90],
          Dest: destination,
        }),
      ),
    );
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
  const [firstPart] = outputs;
  const partLinks = firstPart
    ?.getPage(0)
    .node.Annots()
    ?.asArray()
    .flatMap((entry) => {
      const annotation = firstPart.context.lookup(entry, PDFDict);
      return annotation.get(PDFName.of('Subtype')) === PDFName.of('Link') ? [annotation] : [];
    });
  expect(partLinks).toHaveLength(1);
  expect(partLinks?.[0]?.lookup(PDFName.of('Dest'), PDFArray).get(0)).toBe(
    firstPart?.getPage(1).ref,
  );
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

for (const tool of [
  {
    path: 'edit/delete-pages',
    field: '#delete-pages-input',
    value: '2',
    button: 'حذف صفحات',
    output: 'cleaned.pdf',
    marker: 'field',
  },
  {
    path: 'extract/extract-pages',
    field: '#extract-pages-input',
    value: '1',
    button: 'استخراج صفحات',
    output: 'extracted.pdf',
    marker: 'byte-range',
  },
  {
    path: 'edit/reorder-pages',
    field: '#reorder-pages-input',
    value: '2,1',
    button: 'جابجایی صفحات',
    output: 'reordered.pdf',
    marker: 'field',
  },
  {
    path: 'split/split-pdf',
    field: '#split-pdf-pages',
    value: '1',
    button: 'تقسیم صفحات',
    output: 'split.zip',
    marker: 'permissions',
  },
  { path: 'merge/merge-pdf', button: 'ادغام PDF', output: 'merged.pdf', marker: 'byte-range' },
] as const) {
  for (const protection of tool.path === 'edit/reorder-pages'
    ? (['signature'] as const)
    : (['signature', 'tag-tree', 'xfa'] as const)) {
    test(`${tool.path} refuses to rewrite an input with ${protection}`, async ({ page }) => {
      const pdf = await PDFDocument.create();
      const retained = pdf.addPage();
      const omitted = pdf.addPage();
      if (protection === 'tag-tree') {
        addTagTree(pdf);
      } else if (protection === 'xfa') {
        const field = pdf.getForm().createTextField('synthetic-acroform');
        field.addToPage(retained);
        const xml = pdf.context.flateStream('<xfa><data>Synthetic form</data></xfa>');
        pdf.catalog
          .lookup(PDFName.of('AcroForm'), PDFDict)
          .set(PDFName.of('XFA'), pdf.context.register(xml));
      } else if (tool.marker === 'field') {
        const field = pdf.getForm().createTextField('synthetic-signature-marker');
        field.addToPage(omitted);
        field.acroField.dict.set(PDFName.of('FT'), PDFName.of('Sig'));
      } else if (tool.marker === 'permissions') {
        pdf.catalog.set(PDFName.of('Perms'), pdf.context.obj({}));
      } else {
        retained.node.set(PDFName.of('Fixture'), pdf.context.obj({ ByteRange: [0, 10, 20, 30] }));
      }
      const filename = 'marker-fixture.pdf';
      const fixtures = [
        {
          name: filename,
          mimeType: 'application/pdf',
          buffer: Buffer.from(await pdf.save({ updateFieldAppearances: false })),
        },
      ];
      if (tool.path === 'merge/merge-pdf') {
        const other = await PDFDocument.create();
        other.addPage();
        fixtures.unshift({
          name: 'ordinary.pdf',
          mimeType: 'application/pdf',
          buffer: Buffer.from(await other.save()),
        });
      }
      await page.goto(`/pdf-tools/${tool.path}`);
      const input = page.getByLabel('انتخاب فایل PDF');
      await expect(async () => {
        await input.setInputFiles([]);
        await input.setInputFiles(fixtures);
        await expect(page.getByText(filename, { exact: false })).toBeVisible({ timeout: 1_000 });
      }).toPass({ timeout: 10_000 });
      if (tool.field && tool.value) {
        await page.locator(tool.field).fill(tool.value);
      }
      await page.getByRole('button', { name: tool.button, exact: true }).click();
      const messages = {
        xfa: 'فرم XFA',
        'tag-tree':
          'این عملیات ممکن است ساختار دسترس‌پذیری سند را از بین ببرد. فایل برچسب‌دار بازنویسی نشد.',
        signature: 'برای حفظ اعتبار امضای دیجیتال، این فایل بازنویسی نمی‌شود.',
      };
      await expect(
        page.getByRole('main').getByRole('alert').filter({
          hasText: messages[protection],
        }),
      ).toBeVisible();
      await expect(page.locator(`a[download="${tool.output}"]`)).toHaveCount(0);
    });
  }
}

test.describe('watermark font loading', () => {
  test.use({ serviceWorkers: 'block' });
  test('mixed Persian watermark is embedded in a cropped and rotated PDF', async ({ page }) => {
    const pdf = await PDFDocument.create();
    const source = pdf.addPage([450, 320]);
    source.setRotation(degrees(90));
    source.setCropBox(20, 30, 300, 230);
    addTagTree(pdf);
    const fixture = {
      name: 'watermark-fixture.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from(await pdf.save()),
    };
    await page.goto('/pdf-tools/watermark/add-watermark');
    await page.route('**/api/history', (route) => route.fulfill({ json: {} }));
    await page
      .context()
      .addCookies([
        { name: 'pt_session', value: 'synthetic-history-fixture', url: new URL(page.url()).origin },
      ]);
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
    const [download, historyRequest] = await Promise.all([
      page.waitForEvent('download'),
      page.waitForRequest(
        (request) =>
          request.method() === 'POST' && new URL(request.url()).pathname === '/api/history',
      ),
      link.click(),
    ]);
    expect(historyRequest.postDataJSON()).toEqual({
      tool: 'pdf-watermark',
      inputSummary: 'افزودن واترمارک به PDF',
      outputSummary: expect.stringMatching(/^دانلود فایل با حجم /),
    });
    const path = await download.path();
    if (!path) throw new Error('The downloaded PDF has no local path.');
    const bytes = await readFile(path);
    const output = await PDFDocument.load(bytes);
    const marked = output.getPage(0);
    expect(
      output.catalog
        .lookup(PDFName.of('StructTreeRoot'), PDFDict)
        .lookup(PDFName.of('K'), PDFArray)
        .lookup(0, PDFDict)
        .get(PDFName.of('Pg')),
    ).toBe(marked.ref);
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
      const artifactStart = operators.fnArray.findIndex(
        (op, index) =>
          op === OPS.beginMarkedContent && operators.argsArray[index]?.[0]?.name === 'Artifact',
      );
      expect(artifactStart).toBeGreaterThanOrEqual(0);
      const artifactEnd = operators.fnArray.indexOf(OPS.endMarkedContent, artifactStart);
      const image = operators.fnArray.indexOf(OPS.paintImageXObject, artifactStart);
      expect(image).toBeGreaterThan(artifactStart);
      expect(artifactEnd).toBeGreaterThan(image);
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
