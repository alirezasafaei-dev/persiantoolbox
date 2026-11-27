import { afterAll, beforeAll, expect, it, vi } from 'vitest';
import { decodePDFRawStream, PDFDict, PDFDocument, PDFName, PDFRawStream } from 'pdf-lib';

const xml = '<xfa><data>Synthetic form</data></xfa>';
const png = Uint8Array.from(
  Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLznQAAAABJRU5ErkJggg==',
    'base64',
  ),
).buffer;

const operations = [
  { type: 'rotate', pages: [0], rotation: 90 },
  { type: 'compress' },
  { type: 'watermark', png, width: 25, height: 25, opacity: 0.5, rotation: 0, position: 'center' },
] as const;

type Request = (typeof operations)[number] & { id: string; file: ArrayBuffer };
type Response = { type: 'result'; buffer: ArrayBuffer } | { type: 'progress' } | { type: 'error' };
const postMessage = vi.fn<(message: Response) => void>();
const worker: {
  postMessage: typeof postMessage;
  onmessage?: (message: { data: Request }) => Promise<void>;
} = { postMessage };
let bytes: ArrayBuffer;

beforeAll(async () => {
  vi.stubGlobal('self', worker);
  await import('@/features/pdf-tools/workers/pdf-worker');
  const source = await PDFDocument.create({ updateMetadata: false });
  source.setTitle('Preserve XFA fixture');
  source.addPage([320, 240]).drawText('Document appearance');
  const xfa = source.context.register(source.context.flateStream(xml));
  source.catalog.set(PDFName.of('AcroForm'), source.context.obj({ Fields: [], XFA: xfa }));
  bytes = Uint8Array.from(
    await source.save({ updateFieldAppearances: false, useObjectStreams: false }),
  ).buffer;
});

afterAll(() => vi.unstubAllGlobals());

it.each(operations)('preserves the XFA XML in an actual $type rewrite', async (request) => {
  postMessage.mockClear();
  await worker.onmessage?.({ data: { ...request, id: request.type, file: bytes.slice(0) } });
  const result = postMessage.mock.lastCall?.[0];
  if (result?.type !== 'result') throw new Error('The worker did not return a PDF');
  expect(Buffer.from(result.buffer).equals(Buffer.from(bytes))).toBe(false);
  if (request.type === 'compress') {
    expect(result.buffer.byteLength).toBeLessThan(bytes.byteLength);
  }
  const output = await PDFDocument.load(result.buffer, { updateMetadata: false });
  expect(output.getTitle()).toBe('Preserve XFA fixture');
  expect(output.getPage(0).getRotation().angle).toBe(request.type === 'rotate' ? 90 : 0);
  const form = output.catalog.lookup(PDFName.of('AcroForm'), PDFDict);
  const stream = form.lookup(PDFName.of('XFA'));
  if (!(stream instanceof PDFRawStream)) throw new Error('The XFA stream was not preserved');
  expect(new TextDecoder().decode(decodePDFRawStream(stream).decode())).toBe(xml);
});
