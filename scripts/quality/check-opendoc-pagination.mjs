import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import {
  Document,
  Packer,
  PageBreak,
  Paragraph,
  Table,
  TableCell,
  TableLayoutType,
  TableRow,
  WidthType,
} from 'docx';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

const viewerPath = process.argv[2];
assert(viewerPath, 'Pass the path to a verified OpenDoc Viewer package directory.');
const { openDocument } = await import(pathToFileURL(resolve(viewerPath, 'src/node.js')).href);
const font = await readFile(new URL('../../public/fonts/Vazirmatn-Regular.ttf', import.meta.url));
const expected = Array.from({ length: 42 }, (_, index) => (index + 1) * 125_000);

for (const layout of [TableLayoutType.AUTOFIT, TableLayoutType.FIXED]) {
  const rows = expected.map(
    (value, index) =>
      new TableRow({
        children: [
          `ردیف ${index + 1}`,
          `Mixed English ${index + 1} — متن فارسی`,
          String(value),
        ].map((text) => new TableCell({ children: [new Paragraph(text)] })),
      }),
  );
  const table = new Table({
    rows,
    layout,
    ...(layout === TableLayoutType.FIXED
      ? { width: { size: 9000, type: WidthType.DXA }, columnWidths: [1400, 5300, 2300] }
      : {}),
  });
  const document = new Document({
    sections: [
      {
        children: [
          new Paragraph('آزمون فارسی و English'),
          table,
          new Paragraph({ children: [new PageBreak()] }),
          new Paragraph('PT AFTER PAGE BREAK'),
        ],
      },
    ],
  });
  const viewer = await openDocument(await Packer.toBuffer(document), { fontProvider: null });
  try {
    viewer.registerFallbackFont(font, ['Arabic']);
    assert.deepEqual(viewer.missingCodePoints(), [], `${layout} is missing glyphs`);
    const loading = getDocument({ data: Uint8Array.from(viewer.toPdf()), isEvalSupported: false });
    try {
      const pdf = await loading.promise;
      assert.equal(pdf.numPages, 2, `${layout} differs from the two-page Word reference`);
      const first = await (await pdf.getPage(1)).getTextContent();
      const second = await (await pdf.getPage(2)).getTextContent();
      const extract = ({ items }) => items.flatMap((item) => ('str' in item ? [item.str] : []));
      const values = extract(first)
        .filter((text) => /^\d+$/.test(text) && Number(text) >= expected[0])
        .map(Number);
      assert.deepEqual(
        values,
        expected,
        `${layout} must keep the complete ordered table on page one`,
      );
      assert(
        extract(second).join(' ').includes('PT AFTER PAGE BREAK'),
        `${layout} lost the page break`,
      );
      console.log(`PASS ${layout}: 42 ordered rows and the explicit page break`);
    } finally {
      await loading.destroy();
    }
  } finally {
    viewer.free();
  }
}
