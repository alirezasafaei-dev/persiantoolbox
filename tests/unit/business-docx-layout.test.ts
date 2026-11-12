import { afterEach, expect, it, vi } from 'vitest';
import JSZip from 'jszip';
import type * as Docx from 'docx';
import type { BusinessDocumentDraft } from '@/lib/business-documents/types';

const captured = vi.hoisted(() => ({ archive: Buffer.alloc(0) }));
vi.mock('docx', async (importOriginal) => {
  const actual = await importOriginal<typeof Docx>();
  return {
    ...actual,
    Packer: {
      toBlob: async (doc: InstanceType<typeof actual.Document>) => {
        captured.archive = await actual.Packer.toBuffer(doc);
        return new Blob([new Uint8Array(captured.archive)]);
      },
    },
  };
});
import { downloadDocx } from '@/lib/business-documents/export';

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

it('serializes RTL defaults and matching header/body widths in the Word archive', async () => {
  vi.stubGlobal('URL', { createObjectURL: () => 'blob:test', revokeObjectURL: vi.fn() });
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
  const draft: BusinessDocumentDraft = {
    id: 'test',
    documentType: 'invoice',
    createdAt: '2026-11-12',
    updatedAt: '2026-11-12',
    documentDate: '2026-11-12',
    templateId: 'invoice',
    seller: { name: 'فروشنده آزمایشی' },
    buyer: { name: 'خریدار آزمایشی' },
    items: [{ id: 'i', description: 'آزمون React 19', quantity: 1, unitPrice: 100000 }],
    notes: 'صرفاً آزمون فنی؛ سند فروش واقعی نیست.',
  };
  await downloadDocx(
    draft,
    { subtotal: 100000, discountAmount: 0, taxAmount: 0, grandTotal: 100000 },
    'test.docx',
  );
  const zip = await JSZip.loadAsync(captured.archive);
  const documentXml = zip.file('word/document.xml');
  const stylesXml = zip.file('word/styles.xml');
  if (!documentXml || !stylesXml) throw new Error('Missing Word XML parts');
  const xml = new DOMParser().parseFromString(await documentXml.async('string'), 'application/xml');
  const styles = new DOMParser().parseFromString(
    await stylesXml.async('string'),
    'application/xml',
  );
  for (const paragraph of xml.querySelectorAll('p')) {
    expect(paragraph.querySelector('pPr bidi')).not.toBeNull();
  }
  expect(styles.querySelector('pPrDefault jc')?.getAttribute('w:val')).toBe('start');
  expect(xml.querySelector('tblPr bidiVisual')).not.toBeNull();
  expect(xml.querySelector('tblLayout')?.getAttribute('w:type')).toBe('fixed');
  const widths = [600, 2400, 800, 700, 1550, 1550].map(String);
  expect(Array.from(xml.querySelectorAll('gridCol'), (cell) => cell.getAttribute('w:w'))).toEqual(
    widths,
  );
  for (const row of xml.querySelectorAll('tr')) {
    expect(Array.from(row.querySelectorAll('tcW'), (cell) => cell.getAttribute('w:w'))).toEqual(
      widths,
    );
  }
  expect(xml.documentElement.textContent).toContain('آزمون React 19');
  const latinRun = Array.from(xml.querySelectorAll('r')).find(
    (run) => run.querySelector('t')?.textContent === 'React 19',
  );
  expect(latinRun?.querySelector('rtl')?.getAttribute('w:val')).toBe('false');
});
