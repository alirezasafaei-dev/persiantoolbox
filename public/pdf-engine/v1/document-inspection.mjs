import { run } from './runtime/index.js';

export class PdfSignatureError extends Error {
  constructor() {
    super('برای حفظ اعتبار امضای دیجیتال، این فایل بازنویسی نمی‌شود.');
  }
}

function rejectSignedDocument(objects) {
  const lookup = (reference) => objects[`obj:${reference}`]?.value;
  const catalog = lookup(objects.trailer.value['/Root']);
  if (catalog && Object.hasOwn(catalog, '/Perms')) {
    throw new PdfSignatureError();
  }

  // Object references are strings in the JSON. Each indirect object is already
  // in this list, so the traversal only descends into inline dictionaries and arrays.
  const pending = Object.values(objects);
  while (pending.length > 0) {
    const item = pending.pop();
    if (!item || typeof item !== 'object') {
      continue;
    }
    if (
      item['/FT'] === '/Sig' ||
      (typeof item['/FT'] === 'string' && lookup(item['/FT']) === '/Sig') ||
      Object.hasOwn(item, '/ByteRange')
    ) {
      throw new PdfSignatureError();
    }
    for (const value of Object.values(item)) {
      if (value && typeof value === 'object') {
        pending.push(value);
      }
    }
  }
}

export async function inspectPageGraph(bytes, { rejectSignatureMarkers = false } = {}) {
  const result = await run(
    ['--json=2', '--json-stream-data=none', '--json-key=qpdf', '--json-key=pages', 'input.pdf'],
    { 'input.pdf': bytes },
  );
  if (result.exitCode !== 0) {
    throw new Error('بررسی ساختار PDF ناموفق بود.');
  }

  const { pages, qpdf } = JSON.parse(result.stdout);
  const objects = qpdf[1];
  if (rejectSignatureMarkers) {
    rejectSignedDocument(objects);
  }
  return { objects, pages };
}
