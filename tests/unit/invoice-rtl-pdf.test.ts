import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PDFDocument, PDFRawStream, PDFDict, PDFArray, PDFName, decodePDFRawStream } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { createInvoiceFont, finishInvoiceFonts } from '@/lib/invoice-tools/rtl-pdf';
import { createInvoicePdfBytes } from '@/lib/invoice-tools/pdf';
import { createCompositeInvoiceFont } from '@/lib/invoice-tools/composite-pdf-font';
import { InvoicePdfInputError } from '@/lib/invoice-tools/export-error';

afterEach(() => vi.unstubAllGlobals());

describe('searchable Persian invoice PDF text', () => {
  it('rejects aggregate resource exhaustion across font faces instead of returning defective text', async () => {
    const pdf = await PDFDocument.create();
    // Cheap outlines isolate the document-wide guard from per-run outline limits.
    const glyph = {
      id: 1,
      cbox: { minX: 0, minY: 0, maxX: 500, maxY: 700 },
      path: {
        toFunction:
          () =>
          (pen: {
            moveTo: (x: number, y: number) => void;
            lineTo: (x: number, y: number) => void;
            closePath: () => void;
          }) => {
            pen.moveTo(0, 0);
            pen.lineTo(500, 0);
            pen.lineTo(500, 700);
            pen.closePath();
          },
      },
    };
    const face = {
      unitsPerEm: 1000,
      getGlyph: () => glyph,
      glyphForCodePoint: () => glyph,
    } as unknown as Parameters<typeof createCompositeInvoiceFont>[1];
    const regular = createCompositeInvoiceFont(pdf, face);
    const bold = createCompositeInvoiceFont(pdf, face);
    const page = pdf.addPage();
    const draw = (index: number) =>
      (index % 2 ? bold : regular).draw(
        page,
        [{ id: 1, unicode: String(index).padStart(5, '0'), x: 0, y: 0, advance: 500 }],
        { left: 50, y: 700, size: 10, color: { red: 0, green: 0, blue: 0 } },
      );
    for (let index = 0; index < 4096; index++) expect(draw(index)).toBe(true);
    expect(() => draw(4096)).toThrow(InvoicePdfInputError);
    // Existing cached glyphs do not consume more resources.
    expect(draw(0)).toBe(true);
  });
  it('keeps ordinary identifiers and long URLs as individual glyphs for precise text selection', async () => {
    const pdf = await PDFDocument.create();
    const font = await createInvoiceFont(
      pdf,
      Uint8Array.from(readFileSync('public/fonts/Vazirmatn-Regular.ttf')),
    );
    const page = pdf.addPage();
    font.draw(page, 'https://PersianToolbox.ir/tools/invoice-generator', {
      right: 540,
      y: 760,
      size: 10,
    });
    font.draw(page, 'INV-0001', { right: 540, y: 730, size: 10 });
    await finishInvoiceFonts(pdf, [font]);
    expect(
      pdf.context
        .enumerateIndirectObjects()
        .some(
          ([, object]) =>
            object instanceof PDFDict && object.get(PDFName.of('Subtype')) === PDFName.of('Type3'),
        ),
    ).toBe(false);
  });

  it.each([
    `(${'W'.repeat(200)})`,
    '\u06f1\u06f2\u06f3\u06f4\u06f5\u06f6\u06f7\u06f8\u06f9\u06f0'.repeat(26).slice(0, 256),
  ])('keeps cached-vector runs within the full supported Unicode limit: %s', async (value) => {
    const pdf = await PDFDocument.create();
    const font = await createInvoiceFont(
      pdf,
      Uint8Array.from(readFileSync('public/fonts/Vazirmatn-Regular.ttf')),
    );
    font.draw(pdf.addPage([5000, 842]), value, { right: 4500, y: 760, size: 10 });
    await finishInvoiceFonts(pdf, [font]);
    expect(
      pdf.context
        .enumerateIndirectObjects()
        .some(
          ([, object]) =>
            object instanceof PDFDict && object.get(PDFName.of('Subtype')) === PDFName.of('Type3'),
        ),
    ).toBe(true);
    const { getDocument } = await import('pdfjs-dist/legacy/build/pdf.mjs');
    const reader = await getDocument({ data: await pdf.save(), useSystemFonts: false }).promise;
    try {
      const content = await (await reader.getPage(1)).getTextContent();
      expect(content.items.flatMap((item) => ('str' in item ? [item.str] : [])).join('')).toBe(
        value,
      );
    } finally {
      await reader.destroy();
    }
  });
  it('reuses a composite glyph across pages and sizes without duplicating outlines', async () => {
    const pdf = await PDFDocument.create();
    const font = await createInvoiceFont(
      pdf,
      Uint8Array.from(readFileSync('public/fonts/Vazirmatn-Regular.ttf')),
    );
    font.draw(pdf.addPage(), '(React 19)', { right: 540, y: 760, size: 12 });
    font.draw(pdf.addPage(), '(React 19)', { right: 500, y: 700, size: 16 });
    await finishInvoiceFonts(pdf, [font]);
    const saved = await PDFDocument.load(await pdf.save());
    const composites = saved.context
      .enumerateIndirectObjects()
      .flatMap(([, object]) =>
        object instanceof PDFDict && object.get(PDFName.of('Subtype')) === PDFName.of('Type3')
          ? [object]
          : [],
      );
    expect(composites).toHaveLength(1);
    expect(composites[0]?.lookup(PDFName.of('CharProcs'), PDFDict).keys()).toHaveLength(1);
  });

  it('keeps distinct runs searchable across the single-byte font-code boundary', async () => {
    const pdf = await PDFDocument.create();
    const font = await createInvoiceFont(
      pdf,
      Uint8Array.from(readFileSync('public/fonts/Vazirmatn-Regular.ttf')),
    );
    const page = pdf.addPage();
    const values = Array.from({ length: 260 }, (_, i) => `(REF-${String(i).padStart(4, '0')})`);
    for (const [i, value] of values.entries())
      font.draw(page, value, {
        right: 150 + (i % 4) * 130,
        y: 780 - Math.floor(i / 4) * 10,
        size: 8,
      });
    await finishInvoiceFonts(pdf, [font]);
    const bytes = await pdf.save();
    const saved = await PDFDocument.load(bytes);
    const composites = saved.context
      .enumerateIndirectObjects()
      .flatMap(([, object]) =>
        object instanceof PDFDict && object.get(PDFName.of('Subtype')) === PDFName.of('Type3')
          ? [object]
          : [],
      );
    expect(composites).toHaveLength(2);
    expect(
      composites.map((font) => font.lookup(PDFName.of('CharProcs'), PDFDict).keys().length),
    ).toEqual([255, 5]);
    const { getDocument } = await import('pdfjs-dist/legacy/build/pdf.mjs');
    const reader = await getDocument({ data: bytes.slice(), useSystemFonts: false }).promise;
    try {
      const content = await (await reader.getPage(1)).getTextContent();
      const text = content.items.flatMap((item) => ('str' in item ? [item.str] : [])).join('\n');
      for (const value of values) expect(text).toContain(value);
    } finally {
      await reader.destroy();
    }
  });

  it('retains full text through the original font path when a run exceeds the Unicode-map limit', async () => {
    const pdf = await PDFDocument.create();
    const font = await createInvoiceFont(
      pdf,
      Uint8Array.from(readFileSync('public/fonts/Vazirmatn-Regular.ttf')),
    );
    const value = 'i'.repeat(257);
    font.draw(pdf.addPage([2000, 842]), value, { right: 1750, y: 760, size: 10 });
    await finishInvoiceFonts(pdf, [font]);
    const bytes = await pdf.save();
    const saved = await PDFDocument.load(bytes);
    expect(
      saved.context
        .enumerateIndirectObjects()
        .some(
          ([, object]) =>
            object instanceof PDFDict && object.get(PDFName.of('Subtype')) === PDFName.of('Type3'),
        ),
    ).toBe(false);
    const { getDocument } = await import('pdfjs-dist/legacy/build/pdf.mjs');
    const reader = await getDocument({ data: bytes.slice(), useSystemFonts: false }).promise;
    try {
      const content = await (await reader.getPage(1)).getTextContent();
      expect(content.items.flatMap((item) => ('str' in item ? [item.str] : [])).join('')).toBe(
        value,
      );
    } finally {
      await reader.destroy();
    }
  });
  it('encodes a visible numeric composite with the exact full Unicode value and real outlines', async () => {
    const pdf = await PDFDocument.create();
    const font = await createInvoiceFont(
      pdf,
      Uint8Array.from(readFileSync('public/fonts/Vazirmatn-Regular.ttf')),
    );
    const page = pdf.addPage();
    font.draw(page, 'مبلغ قابل پرداخت: ۱۶۰٬۰۰۰ تومان', { right: 540, y: 760, size: 12 });
    await finishInvoiceFonts(pdf, [font]);
    const saved = await PDFDocument.load(await pdf.save());
    const fonts = saved.context
      .enumerateIndirectObjects()
      .flatMap(([, object]) =>
        object instanceof PDFDict && object.get(PDFName.of('Subtype')) === PDFName.of('Type3')
          ? [object]
          : [],
      );
    expect(fonts.length).toBeGreaterThan(0);
    const numeric = fonts.find((dictionary) => {
      const cmap = dictionary.lookup(PDFName.of('ToUnicode'));
      if (!(cmap instanceof PDFRawStream)) throw new Error('Composite Unicode stream missing');
      return new TextDecoder()
        .decode(decodePDFRawStream(cmap).decode())
        .toLowerCase()
        .includes('06f106f606f0066c06f006f006f0');
    });
    expect(numeric).toBeDefined();
    if (!numeric) throw new Error('Full numeric Unicode mapping missing');
    const procedures = numeric.lookup(PDFName.of('CharProcs'), PDFDict);
    const outline = procedures
      .values()
      .map((ref) => {
        const stream = saved.context.lookup(ref);
        if (!(stream instanceof PDFRawStream)) throw new Error('Composite outline stream missing');
        return new TextDecoder().decode(decodePDFRawStream(stream).decode());
      })
      .join('\n');
    expect(outline).toMatch(/\bd1\b/);
    expect(outline).toMatch(/\bDo\b/);
    expect(outline).not.toMatch(/\b(?:Tj|TJ|BT)\b|ActualText/);
    const vectors = numeric
      .lookup(PDFName.of('Resources'), PDFDict)
      .lookup(PDFName.of('XObject'), PDFDict);
    const paths = vectors
      .values()
      .map((ref) => {
        const stream = saved.context.lookup(ref);
        if (!(stream instanceof PDFRawStream)) throw new Error('Vector outline stream missing');
        expect(stream.dict.get(PDFName.of('Subtype'))).toBe(PDFName.of('Form'));
        return new TextDecoder().decode(decodePDFRawStream(stream).decode());
      })
      .join('\n');
    expect(paths).toMatch(/\bm\b/);
    expect(paths).toMatch(/\bc\b/);
    expect(paths).not.toMatch(/\b(?:Tj|TJ|Do|BT)\b|ActualText/);
    const { getDocument } = await import('pdfjs-dist/legacy/build/pdf.mjs');
    const reader = await getDocument({ data: await pdf.save(), useSystemFonts: false }).promise;
    try {
      const content = await (await reader.getPage(1)).getTextContent();
      expect(
        content.items.flatMap((item) => ('str' in item ? [item.str] : [])).join(' '),
      ).toContain('۱۶۰٬۰۰۰');
    } finally {
      await reader.destroy();
    }
  });
  it('rejects excessively fragmented or oversized fields before generating thousands of lines', async () => {
    const pdf = await PDFDocument.create();
    const font = await createInvoiceFont(
      pdf,
      Uint8Array.from(readFileSync('public/fonts/Vazirmatn-Regular.ttf')),
    );
    expect(() => font.wrap('اA'.repeat(500), 180, 10)).toThrow('INVOICE_INPUT_TOO_COMPLEX');
    expect(() => font.wrap('ا'.repeat(10_001), 180, 10)).toThrow('INVOICE_INPUT_TOO_COMPLEX');
    expect(() => font.wrap('خدمت\n'.repeat(201), 180, 10)).toThrow('INVOICE_INPUT_TOO_COMPLEX');
  });

  it.each([
    ['"', '"'],
    ['“', '”'],
    ['‹', '›'],
    ['<', '>'],
    ["'", "'"],
  ])('keeps paired %s %s quotes with their Latin phrase', async (opening, closing) => {
    const pdf = await PDFDocument.create();
    const font = await createInvoiceFont(
      pdf,
      Uint8Array.from(readFileSync('public/fonts/Vazirmatn-Regular.ttf')),
    );
    expect(font.wrap(`نسخه ${opening}React 19${closing} آماده است`, 495, 11)).toEqual([
      'نسخه',
      `${opening}React 19${closing}`,
      'آماده است',
    ]);
    expect(font.wrap("نسخه O'Reilly 19 آماده است", 495, 11)).toEqual([
      'نسخه',
      "O'Reilly 19",
      'آماده است',
    ]);
  });
  it('reflows mixed text into searchable direction-homogeneous lines without losing punctuation', async () => {
    const pdf = await PDFDocument.create();
    const font = await createInvoiceFont(
      pdf,
      Uint8Array.from(readFileSync('public/fonts/Vazirmatn-Regular.ttf')),
    );
    const mixedDescription = 'طراحی سایت (React 19) و پشتیبانی';
    const cases = [
      mixedDescription,
      'شرکت ASDEV Studio 19 و همکاران',
      'نسخه React 19 ',
      'نشانی https://PersianToolbox.ir/tools و پشتیبانی',
      'نسخه [React 19] آماده است',
      'نسخه ((React 19)) آماده است',
      'پشتیبانی (نسخه React 19) انجام شد',
    ];
    for (const input of cases) {
      const lines = font.wrap(input, 495, 11);
      expect(lines.length).toBeGreaterThan(1);
      expect(lines.join('').replace(/\s/g, '')).toBe(input.replace(/\s/g, ''));
      for (const line of lines) {
        const arabicLetter = Array.from(line).some(
          (character) => /\p{Script=Arabic}/u.test(character) && /\p{Letter}/u.test(character),
        );
        expect(/[A-Za-z]/.test(line) && arabicLetter).toBe(false);
        expect(font.measure(line, 11)).toBeLessThanOrEqual(495);
      }
    }
    expect(font.wrap(mixedDescription, 495, 11)).toEqual([
      'طراحی سایت',
      '(React 19)',
      'و پشتیبانی',
    ]);
    expect(font.wrap('مبلغ ۱۶۰٬۰۰۰ تومان', 495, 11)).toEqual(['مبلغ ۱۶۰٬۰۰۰ تومان']);
  });

  it('preserves parentheses and Latin order when shaping an isolated Latin line', async () => {
    const pdf = await PDFDocument.create();
    const font = await createInvoiceFont(
      pdf,
      Uint8Array.from(readFileSync('public/fonts/Vazirmatn-Regular.ttf')),
    );
    font.draw(pdf.addPage(), '(React 19)', { right: 540, y: 760, size: 12 });
    await finishInvoiceFonts(pdf, [font]);
    const { getDocument } = await import('pdfjs-dist/legacy/build/pdf.mjs');
    const reader = await getDocument({ data: await pdf.save(), useSystemFonts: false }).promise;
    try {
      const content = await (await reader.getPage(1)).getTextContent();
      const text = content.items.flatMap((item) => ('str' in item ? [item.str] : [])).join('');
      expect(text).toBe('(React 19)');
    } finally {
      await reader.destroy();
    }
  });
  it('retains complete horizontal text objects for readers that infer page writing direction', async () => {
    const pdf = await PDFDocument.create();
    const font = await createInvoiceFont(
      pdf,
      Uint8Array.from(readFileSync('public/fonts/Vazirmatn-Regular.ttf')),
    );
    font.draw(pdf.addPage(), 'پشتیبانی نرم‌افزار', { right: 540, y: 760, size: 12 });
    await finishInvoiceFonts(pdf, [font]);
    const loaded = await PDFDocument.load(await pdf.save());
    const contents = loaded.getPage(0).node.Contents();
    if (!(contents instanceof PDFArray)) throw new Error('Missing PDF page contents');
    const stream = contents.lookup(0, PDFRawStream);
    const operators = new TextDecoder().decode(decodePDFRawStream(stream).decode());
    // Keep text in the page stream: pypdf layout extraction does not recurse Forms.
    expect(operators).not.toMatch(/\bDo\b/);
    const horizontalRuns = [...operators.matchAll(/\[([^\]]+)\]\s*TJ/g)];
    expect(horizontalRuns).toHaveLength(1);
    expect(horizontalRuns[0]?.[1]?.match(/<[0-9a-f]{4}>/g)?.length).toBeGreaterThan(8);
    expect(operators).not.toMatch(/\bTj\b/);
  });
  it('keeps the generated invoice identifier and site address on lines separate from Persian labels', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) => ({
        ok: true,
        arrayBuffer: async () => Uint8Array.from(readFileSync(`public${url}`)).buffer,
      })),
    );
    const bytes = await createInvoicePdfBytes({
      clientName: '',
      invoiceNumber: 'INV-0003',
      taxRate: '',
      discount: '',
      paymentTerms: '',
      items: [],
    });
    const { getDocument } = await import('pdfjs-dist/legacy/build/pdf.mjs');
    const reader = await getDocument({ data: bytes.slice(), useSystemFonts: false }).promise;
    try {
      const content = await (await reader.getPage(1)).getTextContent();
      const items = content.items.flatMap((item) =>
        'str' in item && item.str.trim() ? [item] : [],
      );
      const identifier = items.find((item) => item.str.includes('INV-0003'));
      const address = items.find((item) => item.str.includes('PersianToolbox.ir'));
      expect(identifier).toBeDefined();
      expect(address).toBeDefined();
      if (!identifier || !address) throw new Error('Invoice metadata is missing');
      for (const field of [identifier, address]) {
        expect(field.str).not.toMatch(/[\u0600-\u06ff]/);
        const otherTextOnLine = items.filter(
          (item) => item !== field && Math.abs(item.transform[5] - field.transform[5]) < 8,
        );
        expect(otherTextOnLine.map((item) => item.str).join('')).not.toMatch(/[\u0600-\u06ff]/);
      }
      expect(items.some((item) => /[\u0600-\u06ff]/.test(item.str))).toBe(true);
    } finally {
      await reader.destroy();
    }
  });
  it('preserves variation selectors after supported characters already cached by earlier fields', async () => {
    const pdf = await PDFDocument.create();
    const missing = vi.fn();
    const font = await createInvoiceFont(
      pdf,
      Uint8Array.from(readFileSync('public/fonts/Vazirmatn-Regular.ttf')),
      missing,
    );
    const page = pdf.addPage();
    font.draw(page, '1 A س', { right: 540, y: 760, size: 12 });
    font.draw(page, '1\ufe0f A\ufe0f س\ufe0f', { right: 540, y: 730, size: 12 });
    await finishInvoiceFonts(pdf, [font]);
    const saved = await pdf.save();
    expect(saved.length).toBeGreaterThan(1000);
    expect(missing).not.toHaveBeenCalled();
    const { getDocument } = await import('pdfjs-dist/legacy/build/pdf.mjs');
    const reader = await getDocument({ data: saved.slice(), useSystemFonts: false }).promise;
    try {
      const content = await (await reader.getPage(1)).getTextContent();
      const text = content.items.flatMap((item) => ('str' in item ? [item.str] : [])).join('');
      for (const base of ['1', 'A', 'س']) expect(text.split(base).length - 1).toBe(2);
    } finally {
      await reader.destroy();
    }
  });
  it.each(['😀❤️', '❤️😀'])(
    'exports mixed unsupported graphemes %s with visible replacements',
    async (input) => {
      const pdf = await PDFDocument.create();
      const missing = vi.fn();
      const font = await createInvoiceFont(
        pdf,
        Uint8Array.from(readFileSync('public/fonts/Vazirmatn-Regular.ttf')),
        missing,
      );
      font.draw(pdf.addPage(), input, { right: 540, y: 760, size: 12 });
      await finishInvoiceFonts(pdf, [font]);
      const bytes = await pdf.save();
      expect(missing).toHaveBeenCalledWith('😀');
      expect(missing).toHaveBeenCalledWith('❤️');
      const { getDocument } = await import('pdfjs-dist/legacy/build/pdf.mjs');
      const document = await getDocument({ data: bytes.slice(), useSystemFonts: false }).promise;
      try {
        const content = await (await document.getPage(1)).getTextContent();
        const text = content.items.flatMap((item) => ('str' in item ? [item.str] : [])).join('');
        expect(text).toContain('😀');
        expect(text).toContain('❤');
      } finally {
        await document.destroy();
      }
    },
  );
  it('preserves mixed text and logical Persian Unicode in a real PDF reader', async () => {
    const pdf = await PDFDocument.create();
    const font = await createInvoiceFont(
      pdf,
      Uint8Array.from(readFileSync('public/fonts/Vazirmatn-Regular.ttf')),
    );
    const page = pdf.addPage();
    const samples = [
      'شماره فاکتور: INV-0003',
      'تاریخ: 2026/10/30',
      'قیمت: ۱۰۰٬۰۰۰ تومان',
      'شرایط پرداخت: می‌رود',
      'شرح: طراحی سایت (React 19) و پشتیبانی',
      'فَاکتور لا می‍رود 😀',
      'امن\u202EINV-001\u202C',
    ];
    samples.forEach((text, i) => font.draw(page, text, { right: 540, y: 760 - i * 30, size: 12 }));
    await finishInvoiceFonts(pdf, [font]);
    const bytes = await pdf.save();
    const { getDocument } = await import('pdfjs-dist/legacy/build/pdf.mjs');
    const document = await getDocument({ data: bytes.slice(), useSystemFonts: false }).promise;
    try {
      const content = await (await document.getPage(1)).getTextContent();
      const lines = content.items.flatMap((item) => ('str' in item ? [item.str] : []));
      // PDF.js chooses its own paragraph direction and removes joining controls during extraction.
      // Field values must remain intact, and Persian text must use logical Unicode, not presentation forms.
      const extracted = lines.join('\n');
      expect(extracted).toContain('INV-0003');
      expect(extracted).toContain('شماره فاکتور:');
      expect(extracted).toContain('2026/10/30');
      expect(extracted).toContain('تاریخ');
      expect(extracted).toContain('۱۰۰٬۰۰۰');
      expect(extracted).toContain('تومان');
      expect(extracted).toContain('قیمت:');
      expect(extracted).toContain('شرایط پرداخت: میرود');
      expect(extracted).toContain('شرح: طراحی سایت (');
      expect(extracted).toContain('React 19');
      expect(extracted).toContain(') و پشتیبانی');
      expect(extracted).toContain('فَاکتور');
      expect(extracted).toContain('لا');
      expect(extracted).toContain('😀');
      expect(extracted).toContain('INV-001');
      expect(extracted).not.toContain('100-VNI');
      expect(extracted).not.toMatch(/[\ufb50-\ufdff\ufe70-\ufeff]/);
      // Preserve the joining character in the PDF's Unicode map even when a reader omits it.
      const loaded = await PDFDocument.load(bytes);
      const streams = loaded.context
        .enumerateIndirectObjects()
        .flatMap(([, object]) =>
          object instanceof PDFRawStream
            ? [new TextDecoder().decode(decodePDFRawStream(object).decode())]
            : [],
        );
      expect(
        streams.some(
          (stream) => stream.includes('beginbfchar') && stream.toLowerCase().includes('200c'),
        ),
      ).toBe(true);
    } finally {
      await document.destroy();
    }
  });

  it('paginates actual multi-row invoices with intact totals and bounded text', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) => ({
        ok: true,
        arrayBuffer: async () => Uint8Array.from(readFileSync(`public${url}`)).buffer,
      })),
    );
    const bytes = await createInvoicePdfBytes({
      clientName: 'شرکت نمونه ASDEV',
      invoiceNumber: 'INV-0007',
      taxRate: '10',
      discount: '5,000',
      paymentTerms: 'واریز به حساب ۱۲۳۴۵۶\nپرداخت پس از تحویل (React 19)',
      items: Array.from({ length: 45 }, (_, i) => ({
        description: `خدمت ${i + 1} طراحی و توسعه سایت React و پشتیبانی طولانی برای آزمون سطربندی و صفحه‌بندی`,
        quantity: i === 0 ? '' : '1.5',
        unitPrice: '100,000',
      })),
    });
    const { getDocument } = await import('pdfjs-dist/legacy/build/pdf.mjs');
    const document = await getDocument({ data: bytes.slice(), useSystemFonts: false }).promise;
    try {
      expect(document.numPages).toBeGreaterThan(2);
      const all: string[] = [];
      const pageTexts: string[] = [];
      for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber++) {
        const page = await document.getPage(pageNumber);
        const content = await page.getTextContent();
        pageTexts.push(
          content.items.flatMap((item) => ('str' in item ? [item.str] : [])).join('\n'),
        );
        for (const item of content.items) {
          if (!('str' in item) || !item.str) continue;
          all.push(item.str);
          expect(item.transform[4]).toBeGreaterThanOrEqual(45);
          expect(item.transform[4] + item.width).toBeLessThanOrEqual(550);
          expect(item.transform[5]).toBeGreaterThanOrEqual(30);
          expect(item.transform[5]).toBeLessThanOrEqual(785);
        }
      }
      const extracted = all.join('\n');
      expect(pageTexts.find((value) => value.includes('(React 19)'))).toContain('شرایط پرداخت:');
      expect(pageTexts.find((value) => value.includes('(React 19)'))).toContain(
        'مبلغ قابل پرداخت:',
      );
      expect(extracted).toContain('INV-0007');
      expect(extracted).toContain('ASDEV');
      expect(extracted).toContain('۶٬۶۰۰٬۰۰۰');
      expect(extracted).toContain('۷٬۲۵۵٬۰۰۰');
      expect(extracted).toContain('۱۲۳۴۵۶');
      expect(extracted).not.toMatch(/[\ufb50-\ufdff\ufe70-\ufeff]/);
    } finally {
      await document.destroy();
    }
  });

  it('wraps paragraphs without splitting combining marks, joiners or surrogate pairs', async () => {
    const pdf = await PDFDocument.create();
    const font = await createInvoiceFont(
      pdf,
      Uint8Array.from(readFileSync('public/fonts/Vazirmatn-Regular.ttf')),
    );
    const input = 'فَاکتور می‌رود React😀\nشرح طولانی '.repeat(3);
    const lines = font.wrap(input, 90, 12);
    expect(lines.length).toBeGreaterThan(3);
    for (const line of lines) {
      expect(font.measure(line, 12)).toBeLessThanOrEqual(90);
      expect(line).not.toMatch(/^[\u064b-\u065f\u200c\u200d]|^[\udc00-\udfff]|[\ud800-\udbff]$/);
    }
    expect(lines.join('')).toContain('React😀');
  });

  it('draws a visible replacement for missing glyphs and reports the original symbol', async () => {
    const bytes = Uint8Array.from(readFileSync('public/fonts/Vazirmatn-Regular.ttf'));
    const pdf = await PDFDocument.create();
    const missing = vi.fn();
    const font = await createInvoiceFont(pdf, bytes, missing);
    font.draw(pdf.addPage(), 'مشتری 😀', { right: 540, y: 760, size: 12 });
    await finishInvoiceFonts(pdf, [font]);
    expect(missing).toHaveBeenCalledWith('😀');
    const replacement = fontkit.create(bytes).glyphForCodePoint(0xfffd);
    expect(replacement.id).toBeGreaterThan(0);
    expect(replacement.path.toSVG().length).toBeGreaterThan(0);
    const maps: number[][] = [];
    for (const [, object] of pdf.context.enumerateIndirectObjects()) {
      if (!(object instanceof PDFDict) || object.get(PDFName.of('Subtype')) !== PDFName.of('Type0'))
        continue;
      const descendant = object.lookup(PDFName.of('DescendantFonts'), PDFArray).lookup(0, PDFDict);
      const mapping = descendant.lookup(PDFName.of('CIDToGIDMap'));
      if (!(mapping instanceof PDFRawStream)) continue;
      const decoded = decodePDFRawStream(mapping).decode();
      const ids: number[] = [];
      for (let i = 2; i < decoded.length; i += 2)
        ids.push(((decoded[i] ?? 0) << 8) | (decoded[i + 1] ?? 0));
      maps.push(ids);
    }
    expect(maps.flat()).toContain(replacement.id);
    expect(maps.flat()).not.toContain(0);
  });
});
