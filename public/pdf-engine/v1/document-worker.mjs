import { decrypt, inspect, run } from './runtime/index.js';

function respondWithFile(id, bytes) {
  self.postMessage({ id, type: 'result', buffer: bytes.buffer }, [bytes.buffer]);
}

async function reorder(id, input, pages) {
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
    pages.length !== info.pageCount ||
    pages.some((page) => page >= info.pageCount)
  ) {
    self.postMessage({
      id,
      type: 'error',
      message: 'تغییر ترتیب صفحات ممکن نیست. فایل و ترتیب صفحات را بررسی کنید.',
    });
    return;
  }
  const order = pages.map((page) => page + 1).join(',');
  const result = await run(['input.pdf', '--pages', '.', order, '--', 'output.pdf'], {
    'input.pdf': input,
  });
  if (result.exitCode !== 0 || !result.files['output.pdf']) {
    self.postMessage({ id, type: 'error', message: 'ساخت PDF با ترتیب جدید ناموفق بود.' });
    return;
  }
  respondWithFile(id, result.files['output.pdf']);
}

self.onmessage = async ({ data: { id, type, file, buffer, password, pages } }) => {
  try {
    const input = new Uint8Array(file ?? buffer);
    if (type === 'reorder') {
      await reorder(id, input, pages);
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

    const result = await decrypt(input, password);
    if (result.warnings.length > 0) {
      self.postMessage({ error: 'PROCESSING' });
      return;
    }
    self.postMessage({ buffer: result.bytes.buffer }, [result.bytes.buffer]);
  } catch (error) {
    if (id !== undefined) {
      self.postMessage({ id, type: 'error', message: 'پردازش فایل PDF ناموفق بود.' });
    } else {
      self.postMessage({
        error: error?.code === 'WRONG_PASSWORD' ? 'WRONG_PASSWORD' : 'PROCESSING',
      });
    }
  }
};
