'use client';

import { useCallback, useRef, useState, type ChangeEvent } from 'react';
import { Card, Button } from '@/components/ui';

type State = 'idle' | 'loading' | 'ready' | 'processing' | 'done' | 'error';

export default function PdfToTextPage() {
  const [state, setState] = useState<State>('idle');
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const [extractedText, setExtractedText] = useState('');
  const fileRef = useRef<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    if (file.type !== 'application/pdf') {
      setError('فقط فایل PDF مجاز است.');
      setState('error');
      return;
    }

    fileRef.current = file;
    setFileName(file.name);
    setExtractedText('');
    setState('ready');
    setError('');
  }, []);

  const handleProcess = useCallback(async () => {
    if (!fileRef.current) {
      return;
    }

    setState('processing');
    setError('');

    try {
      const pdfjsLib = await import('pdfjs-dist');
      const workerUrl = new URL(
        'pdfjs-dist/build/pdf.worker.min.mjs',
        import.meta.url,
      ).href;
      const workerResponse = await fetch(workerUrl);
      const workerBlob = await workerResponse.blob();
      pdfjsLib.GlobalWorkerOptions.workerSrc = URL.createObjectURL(workerBlob);

      const arrayBuffer = await fileRef.current.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const totalPages = pdf.numPages;
      const textParts: string[] = [];

      for (let i = 1; i <= totalPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items.map((item) => ('str' in item ? item.str : '')).join(' ');
        if (pageText.trim()) {
          textParts.push(pageText);
        }
      }

      setExtractedText(textParts.join('\n\n'));
      setState('done');
    } catch {
      setError('خطا در تبدیل فایل. ممکن است فایل رمزگذاری شده باشد.');
      setState('error');
    }
  }, []);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(extractedText).catch(() => {
      // ignore
    });
  }, [extractedText]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([extractedText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName.replace('.pdf', '.txt');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [extractedText, fileName]);

  const handleReset = useCallback(() => {
    setState('idle');
    setFileName('');
    setError('');
    setExtractedText('');
    fileRef.current = null;
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }, []);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">تبدیل PDF به متن</h1>
        <p className="text-lg text-[var(--text-secondary)]">فایل PDF را به متن تبدیل کنید</p>
      </div>

      <Card className="p-6 space-y-4">
        {state === 'idle' && (
          <div className="space-y-4">
            <div
              className="relative rounded-[var(--radius-md)] border-2 border-dashed border-[var(--border-medium)] bg-[var(--surface-2)] p-8 text-center transition-colors hover:border-[var(--color-primary)] hover:bg-[rgb(var(--color-primary-rgb)/0.05)]"
              onDragOver={(e) => {
                e.preventDefault();
                e.currentTarget.classList.add(
                  'border-[var(--color-primary)]',
                  'bg-[rgb(var(--color-primary-rgb)/0.05)]',
                );
              }}
              onDragLeave={(e) => {
                e.currentTarget.classList.remove(
                  'border-[var(--color-primary)]',
                  'bg-[rgb(var(--color-primary-rgb)/0.05)]',
                );
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.classList.remove(
                  'border-[var(--color-primary)]',
                  'bg-[rgb(var(--color-primary-rgb)/0.05)]',
                );
                const droppedFile = e.dataTransfer.files[0];
                if (droppedFile && inputRef.current) {
                  const dataTransfer = new DataTransfer();
                  dataTransfer.items.add(droppedFile);
                  inputRef.current.files = dataTransfer.files;
                  inputRef.current.dispatchEvent(new Event('change', { bubbles: true }));
                }
              }}
            >
              <input
                ref={inputRef}
                type="file"
                aria-label="انتخاب فایل"
                accept=".pdf"
                onChange={handleFileSelect}
                className="absolute inset-0 cursor-pointer opacity-0"
              />
              <div className="space-y-2">
                <div className="text-3xl">📄</div>
                <div className="text-sm font-semibold text-[var(--text-primary)]">
                  فایل PDF را اینجا بکشید
                </div>
                <div className="text-xs text-[var(--text-muted)]">
                  یا کلیک کنید تا فایل انتخاب کنید
                </div>
              </div>
            </div>
          </div>
        )}

        {state === 'loading' && (
          <div className="text-center text-[var(--text-muted)] py-4">در حال بارگذاری فایل...</div>
        )}

        {(state === 'ready' || state === 'processing') && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--text-secondary)]">فایل:</span>
              <span className="font-medium text-[var(--text-primary)]">{fileName}</span>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button onClick={handleProcess} disabled={state === 'processing'}>
                {state === 'processing' ? 'در حال تبدیل...' : 'تبدیل به متن'}
              </Button>
              <Button variant="secondary" onClick={handleReset}>
                فایل جدید
              </Button>
            </div>
          </div>
        )}

        {state === 'error' && error ? (
          <div className="p-4 bg-[rgba(239,68,68,0.12)] rounded-[var(--radius-md)] text-[var(--color-danger)] text-sm">
            {error}
          </div>
        ) : null}

        {state === 'done' && extractedText ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--color-success)]">
                تبدیل با موفقیت انجام شد ({extractedText.length.toLocaleString('fa-IR')} کاراکتر)
              </span>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={handleCopy}>
                  کپی
                </Button>
                <Button variant="secondary" onClick={handleDownload}>
                  دانلود TXT
                </Button>
              </div>
            </div>
            <textarea
              readOnly
              value={extractedText}
              className="w-full h-96 px-4 py-3 rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] text-[var(--text-primary)] text-sm font-mono resize-y"
              dir="auto"
            />
          </div>
        ) : null}
      </Card>
    </div>
  );
}
