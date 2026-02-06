/* eslint-disable spaced-comment */
/// <reference lib="webworker" />
/* eslint-env worker */
/* global DedicatedWorkerGlobalScope */

export {};

type CompressRequest = {
  id: string;
  type: 'compress';
  buffer: ArrayBuffer;
  mimeType: string;
  outputType: string;
  quality: number;
  maxWidth?: number;
  maxHeight?: number;
  backgroundColor?: string;
};

type WorkerRequest = CompressRequest;

type ProgressMessage = {
  id: string;
  type: 'progress';
  progress: number;
};

type ResultMessage = {
  id: string;
  type: 'result';
  buffer: ArrayBuffer;
  mimeType: string;
  width: number;
  height: number;
};

type ErrorMessage = {
  id: string;
  type: 'error';
  message: string;
};

const ctx: DedicatedWorkerGlobalScope = self as DedicatedWorkerGlobalScope;

const postProgress = (id: string, progress: number) => {
  const message: ProgressMessage = { id, type: 'progress', progress };
  ctx.postMessage(message);
};

ctx.onmessage = async (event: MessageEvent<WorkerRequest>) => {
  const payload = event.data;

  if (payload.type !== 'compress') {
    return;
  }

  const { id, buffer, mimeType, outputType, quality, maxWidth, maxHeight, backgroundColor } =
    payload;

  try {
    if (typeof OffscreenCanvas === 'undefined') {
      throw new Error('مرورگر شما از OffscreenCanvas پشتیبانی نمی کند.');
    }

    postProgress(id, 0.15);

    const blob = new Blob([buffer], { type: mimeType });
    const bitmap = await createImageBitmap(blob);

    postProgress(id, 0.4);

    let targetWidth = bitmap.width;
    let targetHeight = bitmap.height;

    if (maxWidth ?? maxHeight) {
      const widthRatio = maxWidth ? maxWidth / bitmap.width : 1;
      const heightRatio = maxHeight ? maxHeight / bitmap.height : 1;
      const ratio = Math.min(widthRatio, heightRatio, 1);
      targetWidth = Math.round(bitmap.width * ratio);
      targetHeight = Math.round(bitmap.height * ratio);
    }

    const canvas = new OffscreenCanvas(targetWidth, targetHeight);
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('امکان ساخت بوم پردازش تصویر وجود ندارد.');
    }

    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';

    if (outputType === 'image/jpeg') {
      context.fillStyle = backgroundColor ?? '#ffffff';
      context.fillRect(0, 0, targetWidth, targetHeight);
    }

    context.drawImage(bitmap, 0, 0, targetWidth, targetHeight);
    postProgress(id, 0.7);

    const normalizedQuality = Math.min(1, Math.max(0.05, quality));
    const options =
      outputType === 'image/png'
        ? { type: outputType }
        : { type: outputType, quality: normalizedQuality };
    const resultBlob = await canvas.convertToBlob(options);

    const resultBuffer = await resultBlob.arrayBuffer();
    postProgress(id, 1);

    const response: ResultMessage = {
      id,
      type: 'result',
      buffer: resultBuffer,
      mimeType: resultBlob.type ?? outputType,
      width: targetWidth,
      height: targetHeight,
    };

    ctx.postMessage(response, [resultBuffer]);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'خطای ناشناخته در پردازش تصویر.';
    const response: ErrorMessage = { id, type: 'error', message };
    ctx.postMessage(response);
  }
};
