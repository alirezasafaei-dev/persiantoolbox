import { decrypt, inspect, run } from './runtime/index.js';

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
    inputs[name] = bytes;
    if (index > 0) {
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

  const result = await run(['input.pdf', '--split-pages=' + pagesPerPart, 'output.pdf'], {
    'input.pdf': input,
  });
  const parts = Object.entries(result.files)
    .filter(([name]) => /^output-[\d-]+\.pdf$/.test(name))
    .sort(([a], [b]) => a.localeCompare(b, 'en', { numeric: true }))
    .map(([, bytes]) => bytes.buffer);
  const totalBytes = parts.reduce((sum, part) => sum + part.byteLength, 0);
  if (
    result.exitCode !== 0 ||
    parts.length !== Math.ceil(info.pageCount / pagesPerPart) ||
    totalBytes > 100 * 1024 * 1024
  ) {
    self.postMessage({
      id,
      type: 'error',
      message: 'ساخت فایل‌های تقسیم‌شده ناموفق بود یا حجم خروجی بیش از ۱۰۰ مگابایت است.',
    });
    return;
  }
  self.postMessage({ id, type: 'parts', parts }, parts);
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
  const result = await run([...source, order, '--', 'output.pdf'], {
    'input.pdf': input,
  });
  if (result.exitCode !== 0 || !result.files['output.pdf']) {
    self.postMessage({
      id,
      type: 'error',
      message: 'ساخت فایل PDF با صفحات انتخاب‌شده ناموفق بود.',
    });
    return;
  }
  respondWithFile(id, result.files['output.pdf']);
}

self.onmessage = async ({
  data: { id, type, file, buffer, password, pages, files, pagesPerPart },
}) => {
  try {
    if (type === 'merge') {
      await merge(id, files);
      return;
    }
    const input = new Uint8Array(file ?? buffer);
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
