import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  convertInchesToTwip,
} from 'docx';
import { DISCLAIMER } from '../types';

export interface BrandingConfig {
  companyName?: string;
  logoBase64?: string;
  headerText?: string;
  footerText?: string;
  accentColor?: string;
}

function parseContractLines(text: string): Array<{ type: string; text: string }> {
  const lines = text.split('\n');
  const result: Array<{ type: string; text: string }> = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      result.push({ type: 'empty', text: '' });
    } else if (/^═/.test(trimmed) || /^─/.test(trimmed)) {
      result.push({ type: 'separator', text: trimmed });
    } else if (/^⚠/.test(trimmed)) {
      result.push({ type: 'watermark', text: trimmed });
    } else if (
      trimmed === 'قرارداد اجاره مسکونی' ||
      trimmed === 'قرارداد پیمانکاری / معماری ساختمان'
    ) {
      result.push({ type: 'title', text: trimmed });
    } else if (
      /^(موجر|مستأجر|کارفرما|پیمانکار|شاهدان|امضاها|تعهدات|بندها|مشخصات|موضوع|تاریخ|مدت)/.test(
        trimmed,
      )
    ) {
      result.push({ type: 'heading', text: trimmed });
    } else if (/^ماده/.test(trimmed)) {
      result.push({ type: 'clause', text: trimmed });
    } else if (/^امضای/.test(trimmed)) {
      result.push({ type: 'signature', text: trimmed });
    } else if (trimmed === DISCLAIMER) {
      result.push({ type: 'disclaimer', text: trimmed });
    } else {
      result.push({ type: 'body', text: trimmed });
    }
  }

  return result;
}

export async function generateDocx(renderedText: string, branding?: BrandingConfig): Promise<Blob> {
  const parsed = parseContractLines(renderedText);
  const paragraphs: Paragraph[] = [];

  if (branding?.companyName) {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: branding.companyName,
            bold: true,
            size: 28,
            color: branding.accentColor ?? '1a365d',
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
      }),
    );
  }

  if (branding?.headerText) {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: branding.headerText,
            size: 18,
            color: '666666',
            italics: true,
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 300 },
      }),
    );
  }

  for (const item of parsed) {
    switch (item.type) {
      case 'title':
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: item.text,
                bold: true,
                size: 32,
              }),
            ],
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: { before: 400, after: 200 },
          }),
        );
        break;

      case 'heading':
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: item.text,
                bold: true,
                size: 24,
              }),
            ],
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300, after: 100 },
          }),
        );
        break;

      case 'clause':
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: item.text,
                bold: true,
                size: 22,
              }),
            ],
            spacing: { before: 200, after: 100 },
          }),
        );
        break;

      case 'separator':
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: '────────────────────────────────────────────',
                color: 'CCCCCC',
                size: 16,
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { before: 100, after: 100 },
          }),
        );
        break;

      case 'watermark':
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: item.text,
                bold: true,
                size: 20,
                color: 'CC0000',
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
          }),
        );
        break;

      case 'signature':
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: item.text,
                size: 20,
              }),
            ],
            spacing: { before: 200, after: 50 },
          }),
        );
        break;

      case 'disclaimer':
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: item.text,
                size: 16,
                color: '666666',
                italics: true,
              }),
            ],
            spacing: { before: 400, after: 200 },
          }),
        );
        break;

      case 'body':
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: item.text,
                size: 20,
              }),
            ],
            spacing: { after: 100 },
          }),
        );
        break;

      case 'empty':
        paragraphs.push(
          new Paragraph({
            children: [new TextRun({ text: '' })],
            spacing: { after: 50 },
          }),
        );
        break;
    }
  }

  if (branding?.footerText) {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: branding.footerText,
            size: 16,
            color: '999999',
            italics: true,
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { before: 400 },
      }),
    );
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(1),
              bottom: convertInchesToTwip(1),
              left: convertInchesToTwip(1.25),
              right: convertInchesToTwip(1.25),
            },
          },
        },
        children: paragraphs,
      },
    ],
    styles: {
      default: {
        document: {
          run: {
            font: 'Arial',
            size: 20,
          },
        },
      },
    },
  });

  return Packer.toBlob(doc);
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
