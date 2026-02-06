import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createPdfWorkerClient } from './workerClient';

type MessageHandler = ((event: MessageEvent) => void) | null;

class MockWorker {
  static lastInstance: MockWorker | null = null;
  onmessage: MessageHandler = null;
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

  it('terminates worker', () => {
    const client = createPdfWorkerClient();
    const worker = MockWorker.lastInstance;
    client.terminate();
    expect(worker?.terminated).toBe(true);
  });
});
