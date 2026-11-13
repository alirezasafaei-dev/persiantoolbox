import { PDFDocument, rgb } from 'pdf-lib';
import { createInvoiceFont, finishInvoiceFonts } from '@/lib/invoice-tools/rtl-pdf';

const margin = 48;
const width = 595;
const height = 842;

export async function createDocumentPdf(html: string): Promise<Uint8Array> {
  // Template contents are inert. Render only text and explicitly embedded images.
  const template = document.createElement('template');
  template.innerHTML = html;
  const content = template.content.querySelector('.container');
  if (!content) {
    throw new Error('Document content unavailable');
  }
  const isLetter = content.querySelector('.letterhead') !== null;
  const doc = await PDFDocument.create();
  const loadFont = async (weight: 'Regular' | 'Bold') => {
    const response = await fetch(`/fonts/Vazirmatn-${weight}.ttf`);
    if (!response.ok) {
      throw new Error('Document font unavailable');
    }
    return createInvoiceFont(doc, new Uint8Array(await response.arrayBuffer()), () => {
      throw new Error('Document contains unsupported characters');
    });
  };
  const regular = await loadFont('Regular');
  const bold = await loadFont('Bold');
  const watermark = template.content.querySelector('.watermark')?.textContent?.trim();
  let page = doc.addPage([width, height]);
  let y = height - margin;
  const decorate = () => {
    if (watermark) {
      regular.draw(page, watermark, {
        right: width - margin,
        y: 25,
        size: 9,
        color: rgb(0.4, 0.4, 0.4),
      });
    }
  };
  const ensure = (space: number) => {
    if (y - space < margin) {
      decorate();
      page = doc.addPage([width, height]);
      y = height - margin;
    }
  };
  const write = (text: string, size: number, strong = false) => {
    const font = strong ? bold : regular;
    for (const line of font.wrap(text, width - margin * 2, size)) {
      ensure(size + 7);
      if (line) {
        font.draw(page, line, { right: width - margin, y, size });
      }
      y -= size + 7;
    }
  };
  const image = async (element: HTMLImageElement) => {
    const src = element.getAttribute('src') ?? '';
    if (
      !/^data:image\/(?:png|jpe?g|gif|webp|bmp|avif|svg\+xml|x-icon|vnd\.microsoft\.icon);base64,/i.test(
        src,
      )
    ) {
      throw new Error('Unsupported document image');
    }
    const [header, encoded] = src.split(',', 2);
    const mime = header?.slice(5, -7);
    const bytes = Uint8Array.from(atob(encoded ?? ''), (character) => character.charCodeAt(0));
    const url = URL.createObjectURL(new Blob([bytes], { type: mime ?? '' }));
    try {
      const bitmap = new Image();
      bitmap.src = url;
      await bitmap.decode();
      const scale = Math.min(1, 360 / bitmap.naturalWidth, 180 / bitmap.naturalHeight);
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(bitmap.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(bitmap.naturalHeight * scale));
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Document image could not be decoded');
      }
      ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      const embedded = await doc.embedPng(canvas.toDataURL('image/png'));
      const dimensions = embedded.scale(0.5);
      ensure(dimensions.height + 12);
      page.drawImage(embedded, {
        ...dimensions,
        x: width - margin - dimensions.width,
        y: y - dimensions.height,
      });
      y -= dimensions.height + 12;
    } finally {
      URL.revokeObjectURL(url);
    }
  };
  const visit = async (element: Element): Promise<void> => {
    if (element.matches('script, style, .seal, .signature-line')) {
      return;
    }
    if (element instanceof HTMLImageElement) {
      await image(element);
      return;
    }
    if (element.matches('tr')) {
      write(Array.from(element.children, (cell) => cell.textContent?.trim()).join(' '), 11);
      return;
    }
    if (element.matches('h1, h2, p') || !element.children.length) {
      const value = element.textContent?.trim();
      if (value) {
        const heading = element.matches('h1, h2');
        // Line breaks in the certificate's English issuer block are explicit.
        const text = element.querySelector('br')
          ? Array.from(element.childNodes, (node) =>
              node.nodeName === 'BR' ? '\n' : node.textContent?.replace(/\s+/g, ' '),
            ).join('')
          : isLetter && element.closest('.body-text')
            ? value
            : value.replace(/\s+/g, ' ');
        write(text, heading ? 17 : 11, heading || element.matches('.subject-line'));
      }
      return;
    }
    for (const child of element.children) {
      await visit(child);
    }
  };
  await visit(content);
  decorate();
  await finishInvoiceFonts(doc, [regular, bold]);
  return doc.save();
}

export async function downloadDocumentPdf(html: string, filename: string): Promise<void> {
  const bytes = await createDocumentPdf(html);
  const url = URL.createObjectURL(new Blob([new Uint8Array(bytes)], { type: 'application/pdf' }));
  const link = document.createElement('a');
  try {
    link.href = url;
    link.download = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
    document.body.appendChild(link);
    link.click();
  } finally {
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}
