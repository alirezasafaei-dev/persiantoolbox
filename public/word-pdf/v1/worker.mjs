const MAX_INPUT_BYTES = 8 * 1024 * 1024;
const MAX_OUTPUT_BYTES = 24 * 1024 * 1024;
const MAX_PAGES = 100;

self.onmessage = async ({ data }) => {
  if (!(data instanceof ArrayBuffer) || data.byteLength < 4 || data.byteLength > MAX_INPUT_BYTES) {
    self.postMessage({ error: 'limit' });
    return;
  }
  if (new DataView(data).getUint32(0, true) !== 0x04034b50) {
    self.postMessage({ error: 'invalid' });
    return;
  }

  let doc;
  try {
    const [{ openDocument }, font] = await Promise.all([
      import('./runtime/src/index.js'),
      fetch('/fonts/Vazirmatn-Regular.ttf').then((response) => {
        if (!response.ok) throw new Error('Font unavailable');
        return response.arrayBuffer();
      }),
    ]);
    doc = await openDocument(data, { fontProvider: null });
    doc.registerFallbackFont(font, ['Arabic']);
    if (doc.pageCount > MAX_PAGES) {
      self.postMessage({ error: 'limit' });
      return;
    }
    if (!doc.pageCount || doc.missingCodePoints().length) {
      self.postMessage({ error: 'unsupported' });
      return;
    }
    const pdf = doc.toPdf();
    if (pdf.byteLength > MAX_OUTPUT_BYTES) {
      self.postMessage({ error: 'limit' });
      return;
    }
    const output = Uint8Array.from(pdf).buffer;
    self.postMessage({ output }, [output]);
  } catch {
    self.postMessage({ error: 'conversion' });
  } finally {
    doc?.free();
  }
};
