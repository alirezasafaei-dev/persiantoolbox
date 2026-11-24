export type PdfWorkerResult = {
  buffer: ArrayBuffer;
};

type PdfWorkerProgress = (progress: number) => void;

type PdfWorkerMessage = {
  id: string;
  type: 'progress' | 'result' | 'error' | 'pages' | 'parts';
  progress?: number;
  parts?: ArrayBuffer[];
  buffer?: ArrayBuffer;
  totalPages?: number;
  message?: string;
};

export type PdfWorkerRequest =
  | { type: 'merge'; files: ArrayBuffer[] }
  | { type: 'split'; file: ArrayBuffer; pagesPerPart: number }
  | { type: 'extract' | 'delete'; file: ArrayBuffer; pages: number[] }
  | { type: 'reorder'; file: ArrayBuffer; pages: number[] }
  | { type: 'rotate'; file: ArrayBuffer; pages: number[]; rotation: number }
  | { type: 'compress'; file: ArrayBuffer }
  | { type: 'encrypt'; file: ArrayBuffer; password: string; ownerPassword: string }
  | {
      type: 'watermark';
      file: ArrayBuffer;
      png: ArrayBuffer;
      width: number;
      height: number;
      opacity: number;
      rotation: number;
      position: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    }
  | { type: 'count-pages'; file: ArrayBuffer };

export type PdfWorkerClient = {
  request: (payload: PdfWorkerRequest, onProgress?: PdfWorkerProgress) => Promise<PdfWorkerResult>;
  split: (
    file: ArrayBuffer,
    pagesPerPart: number,
    onProgress?: PdfWorkerProgress,
  ) => Promise<ArrayBuffer[]>;
  countPages: (payload: { file: ArrayBuffer }) => Promise<number>;
  cancel: () => void;
  terminate: () => void;
};

type PendingRequest = {
  onResponse: (message: PdfWorkerMessage) => void;
  reject: (reason: Error) => void;
  timeout: ReturnType<typeof setTimeout>;
};

const CANCELLED = 'پردازش PDF لغو شد.';
const WORKER_FAILED = 'پردازشگر PDF با خطا روبه‌رو شد. دوباره تلاش کنید.';
const INVALID_RESPONSE = 'پاسخ پردازشگر PDF نامعتبر است.';

export const createPdfWorkerClient = ({
  timeoutMs = 120_000,
  preserveDocument = false,
} = {}): PdfWorkerClient => {
  const pending = new Map<string, PendingRequest>();
  let worker: Worker | undefined;
  let nextId = 0;
  let closed = false;

  const takeRequest = (id: string) => {
    const entry = pending.get(id);
    if (entry) {
      clearTimeout(entry.timeout);
      pending.delete(id);
    }
    return entry;
  };

  const stopWorker = (message: string) => {
    if (worker) {
      worker.onmessage = null;
      worker.onerror = null;
      worker.onmessageerror = null;
      worker.terminate();
      worker = undefined;
    }
    for (const id of pending.keys()) {
      takeRequest(id)?.reject(new Error(message));
    }
  };

  const getWorker = () => {
    if (worker) {
      return worker;
    }
    const instance = preserveDocument
      ? new Worker('/pdf-engine/v1/document-worker.mjs', { type: 'module' })
      : new Worker(new URL('./workers/pdf-worker.ts', import.meta.url), { type: 'module' });
    worker = instance;
    const onFailure = () => {
      if (worker === instance) {
        stopWorker(WORKER_FAILED);
      }
    };
    instance.onerror = onFailure;
    instance.onmessageerror = onFailure;
    instance.onmessage = ({ data }: MessageEvent<PdfWorkerMessage>) => {
      if (!data || typeof data.id !== 'string') {
        onFailure();
        return;
      }
      const entry = data.type === 'progress' ? pending.get(data.id) : takeRequest(data.id);
      entry?.onResponse(data);
    };
    return instance;
  };

  const dispatch = <T>(
    payload: PdfWorkerRequest,
    readResult: (response: PdfWorkerMessage) => T | undefined,
    onProgress?: PdfWorkerProgress,
  ) =>
    new Promise<T>((resolve, reject) => {
      if (closed) {
        reject(new Error(CANCELLED));
        return;
      }
      const id = String(nextId++);
      try {
        const instance = getWorker();
        pending.set(id, {
          reject,
          timeout: setTimeout(() => stopWorker('زمان پردازش PDF به پایان رسید.'), timeoutMs),
          onResponse(message) {
            if (message.type === 'progress') {
              if (typeof message.progress === 'number') {
                onProgress?.(message.progress);
              }
              return;
            }
            if (message.type === 'error') {
              reject(new Error(message.message ?? WORKER_FAILED));
              return;
            }
            const result = readResult(message);
            if (result === undefined) {
              reject(new Error(INVALID_RESPONSE));
            } else {
              resolve(result);
            }
          },
        });
        const buffers = 'files' in payload ? payload.files : [payload.file];
        if (payload.type === 'watermark') {
          buffers.push(payload.png);
        }
        instance.postMessage({ id, ...payload }, buffers);
      } catch {
        takeRequest(id);
        reject(new Error(WORKER_FAILED));
      }
    });

  return {
    request: (payload, onProgress) =>
      dispatch(
        payload,
        (message) =>
          message.type === 'result' && message.buffer instanceof ArrayBuffer
            ? { buffer: message.buffer }
            : undefined,
        onProgress,
      ),
    split: (file, pagesPerPart, onProgress) =>
      dispatch(
        { type: 'split', file, pagesPerPart },
        (message) => (message.type === 'parts' ? message.parts : undefined),
        onProgress,
      ),
    countPages: ({ file }) =>
      dispatch({ type: 'count-pages', file }, (message) =>
        message.type === 'pages' ? message.totalPages : undefined,
      ),
    cancel: () => stopWorker(CANCELLED),
    terminate() {
      closed = true;
      stopWorker(CANCELLED);
    },
  };
};
