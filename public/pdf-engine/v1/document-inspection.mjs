import { run } from './runtime/index.js';

export class PdfRewriteError extends Error {}

const SIGNATURE_ERROR = 'برای حفظ اعتبار امضای دیجیتال، این فایل بازنویسی نمی‌شود.';

function rejectSignedDocument(objects, catalog, resolve) {
  if (catalog && Object.hasOwn(catalog, '/Perms')) {
    throw new PdfRewriteError(SIGNATURE_ERROR);
  }

  // Object references are strings in the JSON. Each indirect object is already
  // in this list, so the traversal only descends into inline dictionaries and arrays.
  const pending = Object.values(objects);
  while (pending.length > 0) {
    const item = pending.pop();
    if (!item || typeof item !== 'object') {
      continue;
    }
    if (resolve(item['/FT']) === '/Sig' || Object.hasOwn(item, '/ByteRange')) {
      throw new PdfRewriteError(SIGNATURE_ERROR);
    }
    for (const value of Object.values(item)) {
      if (value && typeof value === 'object') {
        pending.push(value);
      }
    }
  }
}

export async function inspectPageGraph(
  bytes,
  { rejectSignatureMarkers = false, changesPageSet = false, password } = {},
) {
  const result = await run(
    [
      ...(password === undefined ? [] : [`--password=${password}`]),
      '--json=2',
      '--json-stream-data=none',
      '--json-key=qpdf',
      '--json-key=pages',
      'input.pdf',
    ],
    { 'input.pdf': bytes },
  );
  if (result.exitCode !== 0) {
    throw new Error('بررسی ساختار PDF ناموفق بود.');
  }

  const { pages, qpdf } = JSON.parse(result.stdout);
  const objects = qpdf[1];
  const resolve = (value) =>
    typeof value === 'string' && /^\d+ \d+ R$/.test(value) ? objects[`obj:${value}`]?.value : value;
  const catalog = resolve(objects.trailer.value['/Root']);
  if (rejectSignatureMarkers) {
    rejectSignedDocument(objects, catalog, resolve);
  }
  if (changesPageSet && catalog) {
    const form = resolve(catalog['/AcroForm']);
    if (form && Object.hasOwn(form, '/XFA')) {
      throw new PdfRewriteError(
        'این عملیات ممکن است داده‌های فرم XFA را از بین ببرد. فایل بازنویسی نشد.',
      );
    }
    const markInfo = resolve(catalog['/MarkInfo']);
    if (Object.hasOwn(catalog, '/StructTreeRoot') || resolve(markInfo?.['/Marked']) === true) {
      throw new PdfRewriteError(
        'این عملیات ممکن است ساختار دسترس‌پذیری سند را از بین ببرد. فایل برچسب‌دار بازنویسی نشد.',
      );
    }
  }
  return { objects, pages };
}
