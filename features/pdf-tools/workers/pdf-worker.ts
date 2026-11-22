/* eslint-disable spaced-comment */
/// <reference lib="webworker" />
/* eslint-env worker */
/* global DedicatedWorkerGlobalScope */

import { PDFDict, PDFDocument, PDFName, degrees, type PDFPage } from 'pdf-lib';

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
  png: ArrayBuffer;
  width: number;
  height: number;
  opacity: number;
  rotation: number;
  position: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
};

type CountPagesRequest = {
  id: string;
  type: 'count-pages';
  file: ArrayBuffer;
};

type WorkerRequest = RotateRequest | CompressRequest | WatermarkRequest | CountPagesRequest;

type WorkerResponse =
  | { id: string; type: 'progress'; progress: number }
  | { id: string; type: 'result'; buffer: ArrayBuffer }
  | { id: string; type: 'pages'; totalPages: number }
  | { id: string; type: 'error'; message: string };

const ctx: DedicatedWorkerGlobalScope = self as DedicatedWorkerGlobalScope;
const postProgress = (id: string, progress: number) => {
  const message: WorkerResponse = { id, type: 'progress', progress };
  ctx.postMessage(message);
};

const toArrayBuffer = (bytes: Uint8Array) =>
  bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);

function rejectSignatureRewrite(document: PDFDocument) {
  const hasSignature = document.context
    .enumerateIndirectObjects()
    .some(
      ([, object]) =>
        object instanceof PDFDict &&
        (object.lookup(PDFName.of('FT')) === PDFName.of('Sig') ||
          object.has(PDFName.of('ByteRange'))),
    );
  if (hasSignature || document.catalog.has(PDFName.of('Perms'))) {
    throw new Error('برای حفظ اعتبار امضای دیجیتال، این فایل بازنویسی نمی‌شود.');
  }
}

function watermarkPlacement(page: PDFPage, options: WatermarkRequest) {
  const crop = page.getCropBox();
  const pageAngle = ((page.getRotation().angle % 360) + 360) % 360;
  const sideways = pageAngle === 90 || pageAngle === 270;
  const viewWidth = sideways ? crop.height : crop.width;
  const viewHeight = sideways ? crop.width : crop.height;
  const radians = (options.rotation * Math.PI) / 180;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  const boundsWidth = options.width * Math.abs(cos) + options.height * Math.abs(sin);
  const boundsHeight = options.width * Math.abs(sin) + options.height * Math.abs(cos);
  const margin = Math.min(24, viewWidth / 8, viewHeight / 8);
  const scale = Math.min(
    1,
    (viewWidth - 2 * margin) / boundsWidth,
    (viewHeight - 2 * margin) / boundsHeight,
  );
  const width = options.width * scale;
  const height = options.height * scale;
  const horizontal = (boundsWidth * scale) / 2 + margin;
  const vertical = (boundsHeight * scale) / 2 + margin;
  let centerX = viewWidth / 2;
  let centerY = viewHeight / 2;
  if (options.position.endsWith('-left')) {
    centerX = horizontal;
  }
  if (options.position.endsWith('-right')) {
    centerX = viewWidth - horizontal;
  }
  if (options.position.startsWith('top-')) {
    centerY = viewHeight - vertical;
  }
  if (options.position.startsWith('bottom-')) {
    centerY = vertical;
  }
  const u = centerX - (width * cos - height * sin) / 2;
  const v = centerY - (width * sin + height * cos) / 2;

  const origins: Record<number, [number, number]> = {
    0: [u, v],
    90: [crop.width - v, u],
    180: [crop.width - u, crop.height - v],
    270: [v, crop.height - u],
  };
  const [x, y] = origins[pageAngle] ?? [u, v];
  return {
    x: crop.x + x,
    y: crop.y + y,
    width,
    height,
    rotate: degrees(pageAngle + options.rotation),
  };
}

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
      case 'rotate': {
        postProgress(payload.id, 0.1);
        const pdfDoc = await PDFDocument.load(payload.file, { updateMetadata: false });
        rejectSignatureRewrite(pdfDoc);
        const total = payload.pages.length;
        if (total === 0) {
          throw new Error('هیچ صفحه ای برای چرخش ارسال نشده است.');
        }
        payload.pages.forEach((index, idx) => {
          const page = pdfDoc.getPage(index);
          const angle = page.getRotation().angle + payload.rotation;
          page.setRotation(degrees(((angle % 360) + 360) % 360));
          postProgress(payload.id, (idx + 1) / total);
        });
        const bytes = await pdfDoc.save({ addDefaultPage: false, updateFieldAppearances: false });
        const buffer = toArrayBuffer(bytes);
        const response: WorkerResponse = { id: payload.id, type: 'result', buffer };
        ctx.postMessage(response, [buffer]);
        return;
      }
      case 'compress': {
        postProgress(payload.id, 0.2);
        const sourcePdf = await PDFDocument.load(payload.file, { updateMetadata: false });
        rejectSignatureRewrite(sourcePdf);
        const bytes = await sourcePdf.save({
          useObjectStreams: true,
          addDefaultPage: false,
          updateFieldAppearances: false,
        });
        const buffer =
          bytes.byteLength < payload.file.byteLength ? toArrayBuffer(bytes) : payload.file;
        postProgress(payload.id, 1);
        const response: WorkerResponse = { id: payload.id, type: 'result', buffer };
        ctx.postMessage(response, [buffer]);
        return;
      }
      case 'watermark': {
        postProgress(payload.id, 0.2);
        const pdfDoc = await PDFDocument.load(payload.file, { updateMetadata: false });
        rejectSignatureRewrite(pdfDoc);
        const watermark = await pdfDoc.embedPng(payload.png);
        pdfDoc.getPages().forEach((page) => {
          page.drawImage(watermark, {
            ...watermarkPlacement(page, payload),
            opacity: payload.opacity,
          });
        });
        const bytes = await pdfDoc.save({ updateFieldAppearances: false });
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
