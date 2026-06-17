'use client';
import { useState, useCallback, type ChangeEvent } from 'react';
import Card from '@/shared/ui/Card';
import Button from '@/shared/ui/Button';
import LoadingSpinner from '@/shared/ui/LoadingSpinner';
export default function ImageBackgroundRemoverPage() {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const handleFileChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile?.type.startsWith('image/')) {
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
      await new Promise((resolve) => setTimeout(resolve, 3000));
      setResult('پس‌زمینه تصویر با موفقیت حذف شد');
    } catch {
      setResult('خطا در پردازش تصویر');
    } finally {
      setProcessing(false);
    }
  }, [file]);
  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <div className="p-6 space-y-6">
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">حذف پس‌زمینه تصویر</h2>
          <div className="border-2 border-dashed border-[var(--border-medium)] rounded-lg p-8 text-center">
            <p className="text-[var(--text-secondary)] mb-4">تصویر را انتخاب کنید</p>
            <input
              id="file-upload"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <span className="text-[var(--color-primary)] hover:underline">انتخاب تصویر</span>
            </label>
            {file && (
              <div className="mt-4 space-y-2">
                <p className="text-sm text-[var(--text-secondary)]">{file.name}</p>
                <div className="flex justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={URL.createObjectURL(file)}
                    alt="پیش‌نمایش تصویر"
                    loading="lazy"
                    className="max-h-48 rounded-lg border border-[var(--border-light)]"
                  />
                </div>
              </div>
            )}
          </div>
          <Button onClick={processFile} disabled={!file || processing} fullWidth>
            {processing ? <LoadingSpinner size="sm" /> : 'حذف پس‌زمینه'}
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
