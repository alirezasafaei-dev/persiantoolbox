import { describe, expect, it, vi } from 'vitest';

describe('pdf lazy deps', () => {
  it('memoizes pdfjs import promise', async () => {
    vi.resetModules();
    const { loadPdfJs } = await import('./lazy-deps');

    const first = loadPdfJs();
    const second = loadPdfJs();

    expect(first).toBe(second);
    const mod = await first;
    expect(typeof mod.getDocument).toBe('function');
  });

  it('memoizes pdf-lib import promise', async () => {
    vi.resetModules();
    const { loadPdfLib } = await import('./lazy-deps');

    const first = loadPdfLib();
    const second = loadPdfLib();

    expect(first).toBe(second);
    const mod = await first;
    expect(typeof mod.PDFDocument).toBe('function');
  });

  it('memoizes jszip import promise', async () => {
    vi.resetModules();
    const { loadJsZip } = await import('./lazy-deps');

    const first = loadJsZip();
    const second = loadJsZip();

    expect(first).toBe(second);
    const ctor = await first;
    expect(typeof ctor).toBe('function');
  });
});
