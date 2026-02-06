import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  ImageCompressionRequest,
  ImageCompressionResult,
  WorkerMessage,
  WorkerProgressHandler,
} from '../types/image-tools';

type PendingRequest = {
  resolve: (value: ImageCompressionResult) => void;
  reject: (reason?: unknown) => void;
  onProgress?: WorkerProgressHandler;
};

type DrawableSource = {
  width: number;
  height: number;
  draw: (ctx: CanvasRenderingContext2D, width: number, height: number) => void;
  cleanup?: () => void;
};

const createRequestId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

const canUseWorker = () =>
  typeof window !== 'undefined' &&
  typeof Worker !== 'undefined' &&
  typeof OffscreenCanvas !== 'undefined';

const loadDrawable = async (blob: Blob): Promise<DrawableSource> => {
  if (typeof createImageBitmap === 'function') {
    const bitmap = await createImageBitmap(blob);
    return {
      width: bitmap.width,
      height: bitmap.height,
      draw: (ctx, width, height) => {
        ctx.drawImage(bitmap, 0, 0, width, height);
      },
      cleanup: () => {
        if ('close' in bitmap) {
          bitmap.close();
        }
      },
    };
  }

  const url = URL.createObjectURL(blob);
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('بارگذاری تصویر با خطا مواجه شد.'));
    img.src = url;
  });

  URL.revokeObjectURL(url);

  return {
    width: image.naturalWidth,
    height: image.naturalHeight,
    draw: (ctx, width, height) => {
      ctx.drawImage(image, 0, 0, width, height);
    },
  };
};

const canvasToBlob = (canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob> =>
  new Promise((resolve, reject) => {
    const normalizedQuality = Math.min(1, Math.max(0.05, quality));
    const useQuality = type !== 'image/png';
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('تبدیل تصویر با خطا مواجه شد.'));
          return;
        }
        resolve(blob);
      },
      type,
      useQuality ? normalizedQuality : undefined,
    );
  });

const compressOnMainThread = async (
  payload: Omit<ImageCompressionRequest, 'id' | 'type'>,
  onProgress?: WorkerProgressHandler,
): Promise<ImageCompressionResult> => {
  onProgress?.(0.1);

  const blob = new Blob([payload.buffer], { type: payload.mimeType });
  const source = await loadDrawable(blob);

  onProgress?.(0.4);

  let targetWidth = source.width;
  let targetHeight = source.height;

  if (payload.maxWidth ?? payload.maxHeight) {
    const widthRatio = payload.maxWidth ? payload.maxWidth / source.width : 1;
    const heightRatio = payload.maxHeight ? payload.maxHeight / source.height : 1;
    const ratio = Math.min(widthRatio, heightRatio, 1);
    targetWidth = Math.round(source.width * ratio);
    targetHeight = Math.round(source.height * ratio);
  }

  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, targetWidth);
  canvas.height = Math.max(1, targetHeight);

  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('امکان ساخت بوم پردازش تصویر وجود ندارد.');
  }

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';

  if (payload.outputType === 'image/jpeg') {
    context.fillStyle = payload.backgroundColor ?? '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
  }

  source.draw(context, canvas.width, canvas.height);
  onProgress?.(0.7);

  const resultBlob = await canvasToBlob(canvas, payload.outputType, payload.quality);
  const resultBuffer = await resultBlob.arrayBuffer();

  onProgress?.(1);
  source.cleanup?.();

  return {
    id: 'main',
    type: 'result',
    buffer: resultBuffer,
    mimeType: resultBlob.type ?? payload.outputType,
    width: canvas.width,
    height: canvas.height,
  };
};

export function useImageToolsWorker() {
  const workerRef = useRef<Worker | null>(null);
  const pendingRef = useRef<Map<string, PendingRequest>>(new Map());
  const [useWorker, setUseWorker] = useState(false);

  useEffect(() => {
    setUseWorker(canUseWorker());
  }, []);

  useEffect(() => {
    if (!useWorker) {
      return;
    }

    const worker = new Worker(new URL('../workers/image-tools.worker.ts', import.meta.url), {
      type: 'module',
    });
    workerRef.current = worker;
    const pending = pendingRef.current;

    worker.onmessage = (event: MessageEvent<WorkerMessage>) => {
      const message = event.data;
      const request = pending.get(message.id);
      if (!request) {
        return;
      }

      if (message.type === 'progress' && typeof message.progress === 'number') {
        request.onProgress?.(message.progress);
        return;
      }

      if (message.type === 'error') {
        pending.delete(message.id);
        request.reject(new Error(message.message));
        return;
      }

      if (message.type === 'result') {
        pending.delete(message.id);
        request.resolve(message);
      }
    };

    return () => {
      worker.terminate();
      workerRef.current = null;
      pending.clear();
    };
  }, [useWorker]);

  const compress = useCallback(
    async (
      payload: Omit<ImageCompressionRequest, 'id' | 'type'>,
      onProgress?: WorkerProgressHandler,
    ) => {
      if (!useWorker || !workerRef.current) {
        return compressOnMainThread(payload, onProgress);
      }

      const id = createRequestId();
      return new Promise<ImageCompressionResult>((resolve, reject) => {
        const entry: PendingRequest = { resolve, reject };
        if (onProgress) {
          entry.onProgress = onProgress;
        }
        pendingRef.current.set(id, entry);
        workerRef.current?.postMessage(
          {
            ...payload,
            id,
            type: 'compress',
          },
          [payload.buffer],
        );
      });
    },
    [useWorker],
  );

  return {
    compress,
    mode: useWorker ? 'worker' : 'main',
  } as const;
}
