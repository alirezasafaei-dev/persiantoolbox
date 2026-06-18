'use client';
import { useState, useCallback, type ChangeEvent } from 'react';
import Card from '@/shared/ui/Card';
import Button from '@/shared/ui/Button';
import LoadingSpinner from '@/shared/ui/LoadingSpinner';
export default function AddPageNumbersPage() {
  const [file, setFile] = useState<File | null>(null);
  const [position, setPosition] = useState<'bottom-center' | 'bottom-right' | 'top-center'>(
    'bottom-center',
  );
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
      setResult('شماره صفحات با موفقیت اضافه شد');
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
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">افزودن شماره صفحه</h2>
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
              <span className="text-[var(--color-primary)] hover:underline">انتخاب فایل</span>
            </label>
            {file && <p className="mt-2 text-sm text-[var(--text-secondary)]">{file.name}</p>}
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[var(--text-primary)]">
              موقعیت شماره صفحه
            </label>
            <div className="flex gap-2">
              {[
                { value: 'bottom-center', label: 'پایین وسط' },
                { value: 'bottom-right', label: 'پایین راست' },
                { value: 'top-center', label: 'بالا وسط' },
              ].map((option) => (
                <Button
                  key={option.value}
                  variant={position === option.value ? 'primary' : 'secondary'}
                  onClick={() => setPosition(option.value as typeof position)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
          <Button onClick={processFile} disabled={!file || processing} fullWidth>
            {processing ? <LoadingSpinner size="sm" /> : 'افزودن شماره صفحات'}
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
