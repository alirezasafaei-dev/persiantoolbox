import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export interface PdfOptions {
  includeWatermark: boolean;
  accentColor?: { r: number; g: number; b: number };
}

const FONT_SIZE = 11;
const LINE_HEIGHT = 16;
const PAGE_MARGIN = 60;
const PAGE_WIDTH = 595;
const PAGE_HEIGHT = 842;

function sanitizeForPdf(text: string): string {
  return text.replace(
    /[^\x20-\x7E\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g,
    '?',
  );
}

export async function generatePdf(renderedText: string, options: PdfOptions): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - PAGE_MARGIN;
  const accent = options.accentColor ?? { r: 0.1, g: 0.2, b: 0.35 };

  const lines = renderedText.split('\n');

  for (const line of lines) {
    if (y < PAGE_MARGIN + 50) {
      page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      y = PAGE_HEIGHT - PAGE_MARGIN;
    }

    const trimmed = line.trim();
    if (!trimmed) {
      y -= LINE_HEIGHT / 2;
      continue;
    }

    const safeText = sanitizeForPdf(trimmed);

    const isTitle =
      safeText.includes('قرارداد') &&
      (safeText.includes('اجاره') || safeText.includes('پیمانکاری'));
    const isSeparator = /^[\u2500\u2550\u2551]/.test(safeText) || /^[-=]{3,}/.test(safeText);
    const isWatermark = /^[\u26A0]/.test(safeText) || safeText.includes('پیش‌نویس');
    const isDisclaimer = safeText.includes('مشاوره حقوقی');
    const isHeading =
      /^(موجر|مستأجر|کارفرما|پیمانکار|شاهدان|امضاها|تعهدات|بندها|مشخصات|موضوع|تاریخ|مدت)/.test(
        safeText,
      );

    let fontSize = FONT_SIZE;
    let useBold = false;
    let color = rgb(0.1, 0.1, 0.1);

    if (isTitle) {
      fontSize = 16;
      useBold = true;
      color = rgb(accent.r, accent.g, accent.b);
    } else if (isHeading) {
      fontSize = 13;
      useBold = true;
      color = rgb(accent.r, accent.g, accent.b);
    } else if (isWatermark) {
      fontSize = 12;
      useBold = true;
      color = rgb(0.8, 0, 0);
    } else if (isSeparator) {
      fontSize = 8;
      color = rgb(0.7, 0.7, 0.7);
    } else if (isDisclaimer) {
      fontSize = 8;
      color = rgb(0.4, 0.4, 0.4);
    }

    const currentFont = useBold ? fontBold : font;
    const x = PAGE_MARGIN;

    try {
      page.drawText(safeText, {
        x,
        y,
        size: fontSize,
        font: currentFont,
        color,
      });
    } catch {
      page.drawText('[text rendering skipped]', {
        x,
        y,
        size: fontSize,
        font,
        color: rgb(0.5, 0.5, 0.5),
      });
    }

    y -= fontSize + 4;
  }

  return pdfDoc.save();
}
