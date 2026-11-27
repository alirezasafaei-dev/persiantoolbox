'use client';

import { useEffect, useRef, useState } from 'react';
import { Button, Card } from '@/components/ui';

const MAX_INPUT_BYTES = 8 * 1024 * 1024;
const TIMEOUT_MS = 30_000;
const CONVERSION_ERROR = 'تبدیل این سند انجام نشد. یک فایل DOCX دیگر را امتحان کنید.';
const workerErrors: Record<string, string> = {
  limit: 'سند یا خروجی از محدودیت تبدیل بیشتر است.',
  unsupported: 'این سند دارای نویسه‌های پشتیبانی‌نشده است.',
};

type Operation = { worker: Worker; timer: ReturnType<typeof setTimeout> };
type Result = { url: string; name: string };

function dispose(operation: Operation) {
  clearTimeout(operation.timer);
  operation.worker.terminate();
}

export default function WordToPdfPreview() {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<Result | null>(null);
  const operationRef = useRef<Operation | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const convertButtonRef = useRef<HTMLButtonElement>(null);
  const restoreFocusRef = useRef(false);

  useEffect(() => {
    if (!busy && restoreFocusRef.current) {
      restoreFocusRef.current = false;
      convertButtonRef.current?.focus();
    }
  }, [busy]);

  useEffect(() => {
    return () => {
      const operation = operationRef.current;
      operationRef.current = null;
      if (operation) {
        dispose(operation);
      }
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  function clearResult() {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
    }
    objectUrlRef.current = null;
    setResult(null);
  }

  function cancel() {
    const operation = operationRef.current;
    operationRef.current = null;
    if (operation) {
      dispose(operation);
    }
    setBusy(false);
  }

  async function convert() {
    if (!file || operationRef.current) {
      return;
    }
    clearResult();
    setError('');

    let worker: Worker;
    try {
      worker = new Worker('/word-pdf/v1/worker.mjs', { type: 'module' });
    } catch {
      setError(CONVERSION_ERROR);
      return;
    }

    const finish = (message?: string) => {
      if (operationRef.current !== operation) {
        return false;
      }
      cancel();
      if (message) {
        setError(message);
      }
      return true;
    };
    const operation = {
      worker,
      timer: setTimeout(
        () => finish('زمان تبدیل به پایان رسید. سند کوچک‌تری را امتحان کنید.'),
        TIMEOUT_MS,
      ),
    };
    operationRef.current = operation;
    setBusy(true);

    worker.onerror = () => finish(CONVERSION_ERROR);
    worker.onmessageerror = () => finish(CONVERSION_ERROR);
    worker.onmessage = ({ data }) => {
      if (!(data?.output instanceof ArrayBuffer)) {
        const message =
          data?.error === 'page-limit' && Number.isSafeInteger(data.maxPages)
            ? `سند بیش از ${Number(data.maxPages).toLocaleString('fa-IR')} صفحه دارد. سند کوتاه‌تری انتخاب کنید.`
            : (workerErrors[data?.error] ?? CONVERSION_ERROR);
        finish(message);
        return;
      }
      if (!finish()) {
        return;
      }
      const url = URL.createObjectURL(new Blob([data.output], { type: 'application/pdf' }));
      objectUrlRef.current = url;
      setResult({ url, name: file.name.replace(/\.docx$/i, '.pdf') });
    };

    try {
      const bytes = await file.arrayBuffer();
      if (operationRef.current === operation) {
        worker.postMessage(bytes, [bytes]);
      }
    } catch {
      finish(CONVERSION_ERROR);
    }
  }

  return (
    <Card className="space-y-4 p-5" aria-labelledby="word-pdf-preview-title">
      <h2 id="word-pdf-preview-title" className="text-xl font-semibold text-(--text-primary)">
        تبدیل آزمایشی DOCX به PDF
      </h2>
      <p id="word-pdf-preview-help" className="leading-7 text-(--text-secondary)">
        فایل روی همین دستگاه پردازش می‌شود. قالب‌بندی سند در خروجی ممکن است متفاوت باشد. حداکثر حجم
        فایل ۸ مگابایت و حداکثر تعداد صفحهٔ خروجی ۱۰۰ است.
      </p>
      <label htmlFor="word-pdf-file">انتخاب فایل DOCX</label>
      <input
        id="word-pdf-file"
        className="block max-w-full"
        type="file"
        accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        aria-describedby="word-pdf-preview-help"
        onChange={(event) => {
          const next = event.target.files?.[0];
          if (!next) {
            return;
          }
          cancel();
          clearResult();
          const valid = /\.docx$/i.test(next.name) && next.size > 0 && next.size <= MAX_INPUT_BYTES;
          setFile(valid ? next : null);
          setError(valid ? '' : 'یک فایل DOCX با حجم حداکثر ۸ مگابایت انتخاب کنید.');
          event.target.value = '';
        }}
      />
      {file ? <bdi className="block break-all">{file.name}</bdi> : null}
      <div className="flex flex-wrap gap-2">
        <Button
          ref={convertButtonRef}
          type="button"
          disabled={!file || busy}
          onClick={() => void convert()}
        >
          تبدیل به PDF
        </Button>
        {busy ? (
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              restoreFocusRef.current = true;
              cancel();
            }}
          >
            لغو تبدیل
          </Button>
        ) : null}
      </div>
      <p role="status">
        {busy ? 'در حال تبدیل…' : null}
        {result ? 'فایل PDF آماده است.' : null}
      </p>
      {error ? <p role="alert">{error}</p> : null}
      {result ? (
        <a href={result.url} download={result.name} className="underline">
          دانلود PDF
        </a>
      ) : null}
    </Card>
  );
}
