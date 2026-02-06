/* eslint-disable spaced-comment */
/// <reference lib="webworker" />
/* eslint-env worker */
/* global DedicatedWorkerGlobalScope */

export {};

import { PDFDocument, rgb, degrees } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';

type MergeRequest = {
  id: string;
  type: 'merge';
  files: ArrayBuffer[];
};

type SplitRequest = {
  id: string;
  type: 'split';
  file: ArrayBuffer;
  pages: number[];
};

type ReorderRequest = {
  id: string;
  type: 'reorder';
  file: ArrayBuffer;
  pages: number[];
};

type RotateRequest = {
  id: string;
  type: 'rotate';
  file: ArrayBuffer;
  pages: number[];
  rotation: number;
};

type CompressRequest = {
  id: string;
  type: 'compress';
  file: ArrayBuffer;
};

type WatermarkRequest = {
  id: string;
  type: 'watermark';
  file: ArrayBuffer;
  text: string;
  fontSize: number;
  opacity: number;
  rotation: number;
  position: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
};

type CountPagesRequest = {
  id: string;
  type: 'count-pages';
  file: ArrayBuffer;
};

type WorkerRequest =
  | MergeRequest
  | SplitRequest
  | ReorderRequest
  | RotateRequest
  | CompressRequest
  | WatermarkRequest
  | CountPagesRequest;

type WorkerResponse =
  | { id: string; type: 'progress'; progress: number }
  | { id: string; type: 'result'; buffer: ArrayBuffer }
  | { id: string; type: 'pages'; totalPages: number }
  | { id: string; type: 'error'; message: string };

const ctx: DedicatedWorkerGlobalScope = self as DedicatedWorkerGlobalScope;
const fontBytesCache: { promise?: Promise<Uint8Array> } = {};

const loadPersianFontBytes = async () => {
  if (!fontBytesCache.promise) {
    const fontUrl = new URL('/fonts/fonnts.com-IRANSansXRegular.ttf', ctx.location.href);
    fontBytesCache.promise = fetch(fontUrl).then(async (response) => {
      if (!response.ok) {
        throw new Error('دانلود فونت فارسی ناموفق بود.');
      }
      const buffer = await response.arrayBuffer();
      return new Uint8Array(buffer);
    });
  }
  return fontBytesCache.promise;
};

const postProgress = (id: string, progress: number) => {
  const message: WorkerResponse = { id, type: 'progress', progress };
  ctx.postMessage(message);
};

const toArrayBuffer = (bytes: Uint8Array) =>
  bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);

const resolvePosition = (
  position: WatermarkRequest['position'],
  pageWidth: number,
  pageHeight: number,
  textWidth: number,
  textHeight: number,
) => {
  const margin = 32;
  switch (position) {
    case 'top-left':
      return { x: margin, y: pageHeight - textHeight - margin };
    case 'top-right':
      return { x: pageWidth - textWidth - margin, y: pageHeight - textHeight - margin };
    case 'bottom-left':
      return { x: margin, y: margin };
    case 'bottom-right':
      return { x: pageWidth - textWidth - margin, y: margin };
    case 'center':
    default:
      return { x: (pageWidth - textWidth) / 2, y: (pageHeight - textHeight) / 2 };
  }
};

ctx.onmessage = async (event: MessageEvent<WorkerRequest>) => {
  const payload = event.data;

  try {
    switch (payload.type) {
      case 'count-pages': {
        const doc = await PDFDocument.load(payload.file);
        const response: WorkerResponse = {
          id: payload.id,
          type: 'pages',
          totalPages: doc.getPageCount(),
        };
        ctx.postMessage(response);
        return;
      }
      case 'merge': {
        const mergedPdf = await PDFDocument.create();
        let index = 0;
        for (const file of payload.files) {
          const pdf = await PDFDocument.load(file);
          const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
          copiedPages.forEach((page) => mergedPdf.addPage(page));
          index += 1;
          postProgress(payload.id, index / payload.files.length);
        }
        const bytes = await mergedPdf.save();
        const buffer = toArrayBuffer(bytes);
        const response: WorkerResponse = { id: payload.id, type: 'result', buffer };
        ctx.postMessage(response, [buffer]);
        return;
      }
      case 'split': {
        postProgress(payload.id, 0.2);
        const sourcePdf = await PDFDocument.load(payload.file);
        const resultPdf = await PDFDocument.create();
        const copiedPages = await resultPdf.copyPages(sourcePdf, payload.pages);
        copiedPages.forEach((page) => resultPdf.addPage(page));
        const bytes = await resultPdf.save();
        const buffer = toArrayBuffer(bytes);
        postProgress(payload.id, 1);
        const response: WorkerResponse = { id: payload.id, type: 'result', buffer };
        ctx.postMessage(response, [buffer]);
        return;
      }
      case 'reorder': {
        postProgress(payload.id, 0.1);
        const sourcePdf = await PDFDocument.load(payload.file);
        const resultPdf = await PDFDocument.create();
        const copiedPages = await resultPdf.copyPages(sourcePdf, payload.pages);
        if (copiedPages.length === 0) {
          throw new Error('هیچ صفحه ای برای جابجایی ارسال نشده است.');
        }
        copiedPages.forEach((page, index) => {
          resultPdf.addPage(page);
          postProgress(payload.id, (index + 1) / copiedPages.length);
        });
        const bytes = await resultPdf.save();
        const buffer = toArrayBuffer(bytes);
        const response: WorkerResponse = { id: payload.id, type: 'result', buffer };
        ctx.postMessage(response, [buffer]);
        return;
      }
      case 'rotate': {
        postProgress(payload.id, 0.1);
        const pdfDoc = await PDFDocument.load(payload.file);
        const total = payload.pages.length;
        if (total === 0) {
          throw new Error('هیچ صفحه ای برای چرخش ارسال نشده است.');
        }
        payload.pages.forEach((index, idx) => {
          const page = pdfDoc.getPage(index);
          page.setRotation(degrees(payload.rotation));
          postProgress(payload.id, (idx + 1) / total);
        });
        const bytes = await pdfDoc.save();
        const buffer = toArrayBuffer(bytes);
        const response: WorkerResponse = { id: payload.id, type: 'result', buffer };
        ctx.postMessage(response, [buffer]);
        return;
      }
      case 'compress': {
        postProgress(payload.id, 0.2);
        const sourcePdf = await PDFDocument.load(payload.file);
        const compressedPdf = await PDFDocument.create();
        const copiedPages = await compressedPdf.copyPages(sourcePdf, sourcePdf.getPageIndices());
        copiedPages.forEach((page) => compressedPdf.addPage(page));
        const bytes = await compressedPdf.save({ useObjectStreams: true, addDefaultPage: false });
        const buffer = toArrayBuffer(bytes);
        postProgress(payload.id, 1);
        const response: WorkerResponse = { id: payload.id, type: 'result', buffer };
        ctx.postMessage(response, [buffer]);
        return;
      }
      case 'watermark': {
        postProgress(payload.id, 0.2);
        const pdfDoc = await PDFDocument.load(payload.file, { ignoreEncryption: false });
        pdfDoc.registerFontkit(fontkit);
        const fontBytes = await loadPersianFontBytes();
        const font = await pdfDoc.embedFont(fontBytes, { subset: true });
        const pages = pdfDoc.getPages();
        pages.forEach((page) => {
          const { width, height } = page.getSize();
          const textWidth = font.widthOfTextAtSize(payload.text, payload.fontSize);
          const textHeight = payload.fontSize;
          const { x, y } = resolvePosition(payload.position, width, height, textWidth, textHeight);
          page.drawText(payload.text, {
            x,
            y,
            size: payload.fontSize,
            font,
            color: rgb(0, 0, 0),
            opacity: payload.opacity,
            rotate: degrees(payload.rotation),
          });
        });
        const bytes = await pdfDoc.save();
        const buffer = toArrayBuffer(bytes);
        postProgress(payload.id, 1);
        const response: WorkerResponse = { id: payload.id, type: 'result', buffer };
        ctx.postMessage(response, [buffer]);
        return;
      }
      default:
        return;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'خطای نامشخص در پردازش PDF.';
    const response: WorkerResponse = { id: payload.id, type: 'error', message };
    ctx.postMessage(response);
  }
};
