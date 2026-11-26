import { decrypt, encrypt, inspect, run } from './runtime/index.js';
import { preparePageDestinations, removeDiscardedPageDestinations } from './page-destinations.mjs';
import { inspectPageGraph, PdfRewriteError } from './document-inspection.mjs';

const MAX_SPLIT_BYTES = 100 * 1024 * 1024;

function respondWithFile(id, bytes) {
  self.postMessage({ id, type: 'result', buffer: bytes.buffer }, [bytes.buffer]);
}

async function merge(id, files) {
  const names = files.map((_, index) => 'input-' + (index + 1) + '.pdf');
  const inputs = {};
  const attachmentOptions = [];
  for (const [index, name] of names.entries()) {
    const bytes = new Uint8Array(files[index]);
    const info = await inspect(bytes);
    if (info.encrypted || info.warnings.length || !info.pageCount) {
      self.postMessage({
        id,
        type: 'error',
        message: 'ادغام انجام نشد. فایل شمارهٔ ' + (index + 1) + ' سالم یا بدون رمز نیست.',
      });
      return;
    }
    if (index === 0) {
      await inspectPageGraph(bytes, { rejectSignatureMarkers: true, changesPageSet: true });
      inputs[name] = bytes;
    } else {
      // QPDF keeps the primary document's destination names. Resolve later
      // documents' links against their own pages before combining them.
      const prepared = await preparePageDestinations(bytes, { discardUnresolvedNames: true });
      inputs[name] = prepared.bytes;
      attachmentOptions.push(
        '--copy-attachments-from',
        name,
        '--prefix=' + (index + 1) + '-',
        '--',
      );
    }
  }

  const result = await run(
    [names[0], '--pages', '.', ...names.slice(1), '--', ...attachmentOptions, 'output.pdf'],
    inputs,
  );
  if (result.exitCode !== 0 || !result.files['output.pdf']) {
    self.postMessage({ id, type: 'error', message: 'ساخت PDF ادغام‌شده ناموفق بود.' });
    return;
  }
  respondWithFile(id, result.files['output.pdf']);
}

async function split(id, input, pagesPerPart) {
  const info = await inspect(input);
  if (
    info.encrypted ||
    info.warnings.length ||
    !Number.isSafeInteger(pagesPerPart) ||
    pagesPerPart < 1 ||
    pagesPerPart >= info.pageCount ||
    Math.ceil(info.pageCount / pagesPerPart) > 100
  ) {
    self.postMessage({
      id,
      type: 'error',
      message: 'تقسیم به ۲ تا ۱۰۰ فایل ممکن است. تعداد صفحات هر بخش را بررسی کنید.',
    });
    return;
  }

  const prepared = await preparePageDestinations(input);
  const buffers = [];
  let outputBytes = 0;
  for (let first = 1; first <= info.pageCount; first += pagesPerPart) {
    const last = Math.min(first + pagesPerPart - 1, info.pageCount);
    const result = await run(
      ['--empty', '--pages', 'input.pdf', first + '-' + last, '--', 'output.pdf'],
      { 'input.pdf': prepared.bytes },
    );
    const part = result.files['output.pdf'];
    if (result.exitCode !== 0 || !part) {
      throw new PdfRewriteError('ساخت یکی از بخش‌های PDF ناموفق بود.');
    }
    const output = prepared.hasPageDestinations
      ? await removeDiscardedPageDestinations(part)
      : part;
    outputBytes += output.byteLength;
    if (outputBytes > MAX_SPLIT_BYTES) {
      throw new PdfRewriteError('حجم بخش‌های فایل PDF از حد مجاز بیشتر شد.');
    }
    buffers.push(output.buffer);
    self.postMessage({ id, type: 'progress', progress: last / info.pageCount });
  }
  self.postMessage({ id, type: 'parts', parts: buffers }, buffers);
}

async function selectPages(id, input, pages, type) {
  const validOrder =
    pages.length > 0 && pages.every((page) => Number.isSafeInteger(page) && page >= 0);
  if (!validOrder || new Set(pages).size !== pages.length) {
    self.postMessage({ id, type: 'error', message: 'ترتیب صفحات معتبر نیست.' });
    return;
  }
  const info = await inspect(input);
  if (
    info.encrypted ||
    info.warnings.length ||
    (type === 'reorder' && pages.length !== info.pageCount) ||
    pages.some((page) => page >= info.pageCount)
  ) {
    self.postMessage({
      id,
      type: 'error',
      message: 'پردازش صفحات ممکن نیست. فایل و شمارهٔ صفحات را بررسی کنید.',
    });
    return;
  }
  const order = pages.map((page) => page + 1).join(',');
  const source =
    type === 'extract' ? ['--empty', '--pages', 'input.pdf'] : ['input.pdf', '--pages', '.'];
  if (type === 'reorder') {
    await inspectPageGraph(input, { rejectSignatureMarkers: true });
  }
  const prepared = type === 'reorder' ? { bytes: input } : await preparePageDestinations(input);
  const result = await run([...source, order, '--', 'output.pdf'], {
    'input.pdf': prepared.bytes,
  });
  if (result.exitCode !== 0 || !result.files['output.pdf']) {
    self.postMessage({
      id,
      type: 'error',
      message: 'ساخت فایل PDF با صفحات انتخاب‌شده ناموفق بود.',
    });
    return;
  }
  const output = result.files['output.pdf'];
  respondWithFile(
    id,
    prepared.hasPageDestinations ? await removeDiscardedPageDestinations(output) : output,
  );
}

self.onmessage = async ({
  data: { id, type, file, buffer, password, ownerPassword, pages, files, pagesPerPart },
}) => {
  try {
    if (type === 'merge') {
      await merge(id, files);
      return;
    }
    const input = new Uint8Array(file ?? buffer);
    if (type === 'encrypt') {
      const info = await inspect(input);
      if (info.encrypted || info.warnings.length || !info.pageCount) {
        self.postMessage({ id, type: 'error', message: 'یک PDF سالم و بدون رمز انتخاب کنید.' });
        return;
      }
      await inspectPageGraph(input, { rejectSignatureMarkers: true });
      const result = await encrypt(input, { userPassword: password, ownerPassword });
      if (result.warnings.length > 0) {
        self.postMessage({ id, type: 'error', message: 'ساخت PDF رمزگذاری‌شده ناموفق بود.' });
        return;
      }
      respondWithFile(id, result.bytes);
      return;
    }

    if (type === 'split') {
      await split(id, input, pagesPerPart);
      return;
    }
    if (type === 'reorder' || type === 'extract' || type === 'delete') {
      await selectPages(id, input, pages, type);
      return;
    }
    const info = await inspect(input, password);
    if (type === 'count-pages') {
      if (info.encrypted || info.warnings.length || typeof info.pageCount !== 'number') {
        self.postMessage({ id, type: 'error', message: 'خواندن صفحات PDF ناموفق بود.' });
      } else {
        self.postMessage({ id, type: 'pages', totalPages: info.pageCount });
      }
      return;
    }
    if (!info.encrypted) {
      self.postMessage({ error: 'NOT_ENCRYPTED' });
      return;
    }
    if (info.needsPassword) {
      self.postMessage({ error: 'WRONG_PASSWORD' });
      return;
    }

    await inspectPageGraph(input, { password, rejectSignatureMarkers: true });
    const result = await decrypt(input, password);
    if (result.warnings.length > 0) {
      self.postMessage({ error: 'PROCESSING' });
      return;
    }
    self.postMessage({ buffer: result.bytes.buffer }, [result.bytes.buffer]);
  } catch (error) {
    if (id !== undefined) {
      self.postMessage({
        id,
        type: 'error',
        message: error instanceof PdfRewriteError ? error.message : 'پردازش فایل PDF ناموفق بود.',
      });
    } else {
      self.postMessage({
        error:
          error instanceof PdfRewriteError
            ? 'SIGNED_DOCUMENT'
            : error?.code === 'WRONG_PASSWORD'
              ? 'WRONG_PASSWORD'
              : 'PROCESSING',
      });
    }
  }
};
