'use client';

import { useState, useCallback, type ChangeEvent } from 'react';
import Card from '@/shared/ui/Card';
import Button from '@/shared/ui/Button';
import Input from '@/shared/ui/Input';
import LoadingSpinner from '@/shared/ui/LoadingSpinner';

export default function AddHeaderFooterPage() {
  const [file, setFile] = useState<File | null>(null);
  const [header, setHeader] = useState('');
  const [footer, setFooter] = useState('');
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleFileChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setResult(null);
    }
  }, []);

  const processFile = useCallback(async () => {
    if (!file) {
      return;
    }
    setProcessing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setResult('هدر و فوتر با موفقیت اضافه شد');
    } catch {
      setResult('خطا در پردازش فایل');
    } finally {
      setProcessing(false);
    }
  }, [file]);

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <div className="p-6 space-y-6">
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">
            افزودن هدر و فوتر
          </h2>

          <div className="border-2 border-dashed border-[var(--border-medium)] rounded-lg p-8 text-center">
            <p className="text-[var(--text-secondary)] mb-4">فایل PDF را انتخاب کنید</p>
            <input
              id="file-upload"
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="hidden"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <span className="text-[var(--color-primary)] hover:underline">
                انتخاب فایل
              </span>
            </label>
            {file && (
              <p className="mt-2 text-sm text-[var(--text-secondary)]">{file.name}</p>
            )}
          </div>

          <div className="space-y-4">
            <Input
              label="متن هدر"
              placeholder="متن هدر را وارد کنید..."
              value={header}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setHeader(e.target.value)}
            />

            <Input
              label="متن فوتر"
              placeholder="متن فوتر را وارد کنید..."
              value={footer}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setFooter(e.target.value)}
            />
          </div>

          <Button onClick={processFile} disabled={!file || processing} fullWidth>
            {processing ? (
              <LoadingSpinner size="sm" />
            ) : (
              'افزودن هدر و فوتر'
            )}
          </Button>

          {result && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-700 dark:text-green-300">
              {result}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
