import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { Document, Footer, Packer, PageNumber, Paragraph, TextRun } from 'docx';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

const viewerPath = process.argv[2];
if (!viewerPath) {
  throw new Error('Pass the path to a verified OpenDoc Viewer package directory.');
}

const { openDocument } = await import(pathToFileURL(resolve(viewerPath, 'src/node.js')).href);
const font = await readFile(new URL('../../public/fonts/Vazirmatn-Regular.ttf', import.meta.url));

const marker = 'PT FOOTER MARKER';
const cases = [
  { name: 'Latin footer with PAGE', persian: false, pageNumber: true },
  { name: 'Mixed footer without PAGE', persian: true, pageNumber: false },
  { name: 'Mixed footer with trailing PAGE', persian: true, pageNumber: true },
];

for (const fixture of cases) {
  const document = new Document({
    sections: [
      {
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                children: [
                  ...(fixture.persian ? [new TextRun('صفحه ')] : []),
                  new TextRun(marker + ' '),
                  ...(fixture.pageNumber ? [new TextRun({ children: [PageNumber.CURRENT] })] : []),
                ],
              }),
            ],
          }),
        },
        children: [new Paragraph('PT DOCUMENT BODY')],
      },
    ],
  });
  const viewer = await openDocument(await Packer.toBuffer(document), { fontProvider: null });
  try {
    viewer.registerFallbackFont(font, ['Arabic']);
    const pdf = getDocument({ data: Uint8Array.from(viewer.toPdf()), isEvalSupported: false });
    try {
      const page = await (await pdf.promise).getPage(1);
      const { items } = await page.getTextContent();
      const text = items.map((item) => ('str' in item ? item.str : '')).join(' ');
      const footer = text.slice(text.indexOf(marker));
      const passed =
        text.includes('PT DOCUMENT BODY') &&
        text.includes(marker) &&
        (!fixture.persian || text.normalize('NFKC').includes('صفحه')) &&
        (!fixture.pageNumber || /\b1\b/.test(footer));
      console.log(`${passed ? 'PASS' : 'FAIL'} ${fixture.name}`);
      if (!passed) {
        process.exitCode = 1;
      }
    } finally {
      await pdf.destroy();
    }
  } finally {
    viewer.free();
  }
}
