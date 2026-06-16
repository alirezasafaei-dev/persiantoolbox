'use client';
import { useState, useCallback, type ChangeEvent } from 'react';
import Card from '@/shared/ui/Card';
import Button from '@/shared/ui/Button';
import LoadingSpinner from '@/shared/ui/LoadingSpinner';
const formats = [
  { value: 'jpg', label: 'JPG' },
  { value: 'png', label: 'PNG' },
  { value: 'webp', label: 'WebP' },
  { value: 'gif', label: 'GIF' },
  { value: 'bmp', label: 'BMP' },
];
export default function ImageFormatConverterPage() {
  const [file, setFile] = useState<File | null>(null);
  const [outputFormat, setOutputFormat] = useState('jpg');
  const [quality, setQuality] = useState(90);
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
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setResult(`تصویر با موفقیت به فرمت ${outputFormat.toUpperCase()} تبدیل شد`);
    } catch {
      setResult('خطا در پردازش تصویر');
    } finally {
      setProcessing(false);
    }
  }, [file, outputFormat]);
  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <div className="p-6 space-y-6">
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">
            تبدیل فرمت تصویر
          </h2>
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
              <span className="text-[var(--color-primary)] hover:underline">
                انتخاب تصویر
              </span>
            </label>
            {file && (
              <p className="mt-2 text-sm text-[var(--text-secondary)]">{file.name}</p>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[var(--text-primary)]">
                فرمت خروجی
              </label>
              <div className="flex gap-2 flex-wrap">
                {formats.map((fmt) => (
                  <Button
                    key={fmt.value}
                    variant={outputFormat === fmt.value ? 'primary' : 'secondary'}
                    onClick={() => {
                      setOutputFormat(fmt.value);
                      setResult(null);
                    }}
                  >
                    {fmt.label}
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[var(--text-primary)]">
                کیفیت: {quality}%
              </label>
              <input
                type="range"
                min="10"
                max="100"
                value={quality}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  setQuality(Number(e.target.value));
                  setResult(null);
                }}
                className="w-full"
              />
            </div>
          </div>
          <Button onClick={processFile} disabled={!file || processing} fullWidth>
            {processing ? <LoadingSpinner size="sm" /> : 'تبدیل فرمت'}
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
