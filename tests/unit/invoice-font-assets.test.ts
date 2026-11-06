import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';

describe('invoice PDF font assets', () => {
  it.each(['Regular', 'Bold'])(
    'embeds the shipped Vazirmatn %s font in a real Persian PDF',
    async (weight) => {
      const bytes = Uint8Array.from(
        readFileSync(path.join(process.cwd(), 'public/fonts', `Vazirmatn-${weight}.ttf`)),
      );
      const pdf = await PDFDocument.create();
      pdf.registerFontkit(fontkit);
      const font = await pdf.embedFont(bytes, { subset: true });
      pdf.addPage().drawText('فاکتور آزمایشی ۱۲۳', { font, x: 50, y: 750 });
      const saved = await pdf.save();
      expect(saved.byteLength).toBeGreaterThan(1000);
      expect((await PDFDocument.load(saved)).getPageCount()).toBe(1);
    },
  );

  it('ships the upstream font license alongside the fonts', () => {
    const license = readFileSync(
      path.join(process.cwd(), 'public/fonts/OFL-Vazirmatn.txt'),
      'utf8',
    );
    expect(license).toContain('SIL OPEN FONT LICENSE Version 1.1');
  });
});
