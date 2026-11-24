import { afterEach, expect, it, vi } from 'vitest';

const { inspect, run, preparePageDestinations, postMessage } = vi.hoisted(() => ({
  inspect: vi.fn(),
  run: vi.fn(),
  preparePageDestinations: vi.fn(),
  postMessage: vi.fn(),
}));

vi.mock('../../public/pdf-engine/v1/runtime/index.js', () => ({ inspect, run }));
vi.mock('../../public/pdf-engine/v1/page-destinations.mjs', () => ({ preparePageDestinations }));

afterEach(() => vi.unstubAllGlobals());

it('stops building split parts as soon as their cumulative size exceeds the budget', async () => {
  const worker: {
    postMessage: typeof postMessage;
    onmessage?: (message: {
      data: { id: number; type: string; file: ArrayBuffer; pagesPerPart: number };
    }) => Promise<void>;
  } = { postMessage };
  vi.stubGlobal('self', worker);
  const file = new Uint8Array([1, 2, 3]).buffer;
  const bytes = new Uint8Array(file);
  inspect.mockResolvedValue({ encrypted: false, warnings: [], pageCount: 4 });
  preparePageDestinations.mockResolvedValue({ bytes, hasPageDestinations: false });
  const part = { byteLength: 60 * 1024 * 1024, buffer: new ArrayBuffer(8) };
  run.mockResolvedValue({ exitCode: 0, files: { 'output.pdf': part } });

  await import('../../public/pdf-engine/v1/document-worker.mjs');
  expect(worker.onmessage).toBeDefined();
  await worker.onmessage?.({ data: { id: 1, type: 'split', file, pagesPerPart: 1 } });

  expect(run.mock.calls.map(([args]) => args)).toEqual([
    ['--empty', '--pages', 'input.pdf', '1-1', '--', 'output.pdf'],
    ['--empty', '--pages', 'input.pdf', '2-2', '--', 'output.pdf'],
  ]);
  expect(postMessage).toHaveBeenCalledTimes(2);
  expect(postMessage).toHaveBeenNthCalledWith(1, { id: 1, type: 'progress', progress: 0.25 });
  expect(postMessage).toHaveBeenNthCalledWith(2, {
    id: 1,
    type: 'error',
    message: expect.stringContaining('حجم'),
  });
});
