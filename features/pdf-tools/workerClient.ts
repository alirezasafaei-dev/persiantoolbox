export type PdfWorkerResult = {
  buffer: ArrayBuffer;
};

type PdfWorkerProgress = (progress: number) => void;

type PendingRequest = {
  resolve: (value: PdfWorkerResult) => void;
  reject: (reason?: unknown) => void;
  onProgress?: PdfWorkerProgress;
};

type PdfWorkerMessage = {
  id: string;
  type: 'progress' | 'result' | 'error' | 'pages';
  progress?: number;
  buffer?: ArrayBuffer;
  totalPages?: number;
  message?: string;
};

export type PdfWorkerRequest =
  | { type: 'merge'; files: ArrayBuffer[] }
  | { type: 'split'; file: ArrayBuffer; pages: number[] }
  | { type: 'reorder'; file: ArrayBuffer; pages: number[] }
  | { type: 'rotate'; file: ArrayBuffer; pages: number[]; rotation: number }
  | { type: 'compress'; file: ArrayBuffer }
  | {
      type: 'watermark';
      file: ArrayBuffer;
      text: string;
      fontSize: number;
      opacity: number;
      rotation: number;
      position: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    }
  | { type: 'count-pages'; file: ArrayBuffer };

export type PdfWorkerClient = {
  request: (payload: PdfWorkerRequest, onProgress?: PdfWorkerProgress) => Promise<PdfWorkerResult>;
  countPages: (payload: { file: ArrayBuffer }) => Promise<number>;
  terminate: () => void;
};

const createRequestId = () => `${Date.now()}-${Math.random().toString(36).slice(2)}`;

export const createPdfWorkerClient = (): PdfWorkerClient => {
  const worker = new Worker(new URL('./workers/pdf-worker.ts', import.meta.url), {
    type: 'module',
  });
  const pending = new Map<string, PendingRequest>();
  const pendingPages = new Map<
    string,
    { resolve: (value: number) => void; reject: (reason?: unknown) => void }
  >();

  worker.onmessage = (event: MessageEvent<PdfWorkerMessage>) => {
    const message = event.data;

    if (message.type === 'progress' && typeof message.progress === 'number') {
      const entry = pending.get(message.id);
      entry?.onProgress?.(message.progress);
      return;
    }

    if (message.type === 'pages') {
      const entry = pendingPages.get(message.id);
      if (entry) {
        pendingPages.delete(message.id);
        entry.resolve(message.totalPages ?? 0);
      }
      return;
    }

    if (message.type === 'error') {
      const entry = pending.get(message.id);
      if (entry) {
        pending.delete(message.id);
        entry.reject(new Error(message.message ?? 'خطای نامشخص رخ داد.'));
      }
      const pagesEntry = pendingPages.get(message.id);
      if (pagesEntry) {
        pendingPages.delete(message.id);
        pagesEntry.reject(new Error(message.message ?? 'خطای نامشخص رخ داد.'));
      }
      return;
    }

    if (message.type === 'result' && message.buffer) {
      const entry = pending.get(message.id);
      if (entry) {
        pending.delete(message.id);
        entry.resolve({ buffer: message.buffer });
      }
    }
  };

  const request = (payload: PdfWorkerRequest, onProgress?: PdfWorkerProgress) => {
    const id = createRequestId();
    return new Promise<PdfWorkerResult>((resolve, reject) => {
      const entry: PendingRequest = { resolve, reject };
      if (onProgress) {
        entry.onProgress = onProgress;
      }
      pending.set(id, entry);
      if ('files' in payload) {
        worker.postMessage({ id, ...payload }, payload.files);
        return;
      }
      if ('file' in payload) {
        worker.postMessage({ id, ...payload }, [payload.file]);
        return;
      }
    });
  };

  const countPages = (payload: { file: ArrayBuffer }) => {
    const id = createRequestId();
    return new Promise<number>((resolve, reject) => {
      pendingPages.set(id, { resolve, reject });
      worker.postMessage({ id, type: 'count-pages', file: payload.file }, [payload.file]);
    });
  };

  return {
    request,
    countPages,
    terminate: () => worker.terminate(),
  };
};
