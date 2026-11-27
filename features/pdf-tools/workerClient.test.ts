import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createPdfWorkerClient } from './workerClient';

type MessageHandler = ((event: MessageEvent) => void) | null;

class MockWorker {
  static lastInstance: MockWorker | null = null;
  onmessage: MessageHandler = null;
  onerror: (() => void) | null = null;
  onmessageerror: (() => void) | null = null;
  lastPostMessage: { payload: unknown; transfer?: Transferable[] } | null = null;
  terminated = false;

  constructor() {
    MockWorker.lastInstance = this;
  }

  postMessage(payload: unknown, transfer?: Transferable[]) {
    if (transfer) {
      this.lastPostMessage = { payload, transfer };
      return;
    }
    this.lastPostMessage = { payload };
  }

  terminate() {
    this.terminated = true;
  }

  emit(data: unknown) {
    this.onmessage?.({ data } as MessageEvent);
  }
}

function activeWorker() {
  const worker = MockWorker.lastInstance;
  if (!worker) {
    throw new Error('Worker has not started');
  }
  return worker;
}

describe('pdf worker client', () => {
  const originalWorker = globalThis.Worker;

  beforeEach(() => {
    globalThis.Worker = MockWorker as unknown as typeof Worker;
  });

  afterEach(() => {
    globalThis.Worker = originalWorker;
    MockWorker.lastInstance = null;
  });

  it('resolves request with result and reports progress', async () => {
    const client = createPdfWorkerClient();
    const buffer = new ArrayBuffer(4);
    const progressSpy = vi.fn();

    const promise = client.request({ type: 'merge', files: [buffer] }, progressSpy);
    const worker = MockWorker.lastInstance;
    expect(worker).not.toBeNull();
    const message = worker?.lastPostMessage?.payload as { id: string };
    expect(message?.id).toBeTruthy();

    worker?.emit({ id: message.id, type: 'progress', progress: 0.5 });
    worker?.emit({ id: message.id, type: 'result', buffer });

    await expect(promise).resolves.toEqual({ buffer });
    expect(progressSpy).toHaveBeenCalledWith(0.5);
  });

  it('resolves countPages', async () => {
    const client = createPdfWorkerClient();
    const buffer = new ArrayBuffer(2);

    const promise = client.countPages({ file: buffer });
    const worker = MockWorker.lastInstance;
    const message = worker?.lastPostMessage?.payload as { id: string };

    worker?.emit({ id: message.id, type: 'pages', totalPages: 5 });

    await expect(promise).resolves.toBe(5);
  });

  it('rejects on worker error', async () => {
    const client = createPdfWorkerClient();
    const buffer = new ArrayBuffer(1);

    const promise = client.request({ type: 'compress', file: buffer });
    const worker = MockWorker.lastInstance;
    const message = worker?.lastPostMessage?.payload as { id: string };

    worker?.emit({ id: message.id, type: 'error', message: 'boom' });

    await expect(promise).rejects.toThrow('boom');
  });

  it('does not start a worker when the unused client is terminated', () => {
    const client = createPdfWorkerClient();
    client.terminate();
    expect(MockWorker.lastInstance).toBeNull();
  });

  it.each(['onerror', 'onmessageerror'] as const)(
    'rejects every pending request on %s and retries with a new worker',
    async (event) => {
      const client = createPdfWorkerClient();
      const request = client.request({ type: 'compress', file: new ArrayBuffer(1) });
      const count = client.countPages({ file: new ArrayBuffer(1) });
      const worker = activeWorker();
      const rejected = Promise.allSettled([request, count]);
      worker[event]?.();
      expect(worker.terminated).toBe(true);
      expect((await rejected).map((result) => result.status)).toEqual(['rejected', 'rejected']);

      const retry = client.countPages({ file: new ArrayBuffer(1) });
      const replacement = activeWorker();
      expect(replacement).not.toBe(worker);
      const { id } = replacement.lastPostMessage?.payload as { id: string };
      replacement.emit({ id, type: 'pages', totalPages: 3 });
      await expect(retry).resolves.toBe(3);
    },
  );

  it('rejects an expired request and terminates the stalled worker', async () => {
    vi.useFakeTimers();
    try {
      const client = createPdfWorkerClient({ timeoutMs: 50 });
      const request = client.request({ type: 'compress', file: new ArrayBuffer(1) });
      const rejected = expect(request).rejects.toThrow(/زمان پردازش/);
      await vi.advanceTimersByTimeAsync(50);
      await rejected;
      expect(MockWorker.lastInstance?.terminated).toBe(true);
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });

  it('cancels queued work and accepts a subsequent request', async () => {
    const client = createPdfWorkerClient();
    const request = client.request({ type: 'compress', file: new ArrayBuffer(1) });
    const rejected = expect(request).rejects.toThrow(/لغو/);
    client.cancel();
    expect(MockWorker.lastInstance?.terminated).toBe(true);
    await rejected;
    const retry = client.countPages({ file: new ArrayBuffer(1) });
    const worker = activeWorker();
    const { id } = worker.lastPostMessage?.payload as { id: string };
    worker.emit({ id, type: 'pages', totalPages: 2 });
    await expect(retry).resolves.toBe(2);
  });

  it('rejects in-flight and future requests after permanent termination', async () => {
    const client = createPdfWorkerClient();
    const request = client.countPages({ file: new ArrayBuffer(1) });
    const rejected = expect(request).rejects.toThrow(/لغو/);
    client.terminate();
    expect(MockWorker.lastInstance?.terminated).toBe(true);
    await rejected;
    await expect(client.countPages({ file: new ArrayBuffer(1) })).rejects.toThrow(/لغو/);
  });

  it('matches concurrent responses by ID even when they arrive out of order', async () => {
    const client = createPdfWorkerClient();
    const result = client.request({ type: 'compress', file: new ArrayBuffer(1) });
    const worker = activeWorker();
    const first = worker.lastPostMessage?.payload as { id: string };
    const count = client.countPages({ file: new ArrayBuffer(1) });
    const second = worker.lastPostMessage?.payload as { id: string };
    worker.emit({ id: second.id, type: 'pages', totalPages: 7 });
    const output = new ArrayBuffer(12);
    worker.emit({ id: first.id, type: 'result', buffer: output });
    await expect(count).resolves.toBe(7);
    await expect(result).resolves.toEqual({ buffer: output });
  });
});
