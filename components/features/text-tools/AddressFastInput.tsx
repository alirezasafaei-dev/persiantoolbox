'use client';

import { useState } from 'react';
import type { PersianAddressInput } from '@/features/text-tools/address-fa-to-en';

type AddressFastInputProps = {
  onParsed: (fields: PersianAddressInput) => void;
};

type InputMode = 'fast' | 'accurate';

const modeLabels: Record<InputMode, string> = {
  fast: 'ورود سریع',
  accurate: 'ورود دقیق',
};

const fieldKeywords: Array<{ pattern: RegExp; key: keyof PersianAddressInput }> = [
  { pattern: /استان\s*:?\s*(.+)/, key: 'province' },
  { pattern: /شهر\s*:?\s*(.+)/, key: 'city' },
  { pattern: /محله\s*:?\s*(.+)/, key: 'district' },
  { pattern: /خیابان\s*:?\s*(.+)/, key: 'street' },
  { pattern: /کوچه\s*:?\s*(.+)/, key: 'alley' },
  { pattern: /پلاک\s*:?\s*(.+)/, key: 'plaqueNo' },
  { pattern: /واحد\s*:?\s*(.+)/, key: 'unit' },
  { pattern: /طبقه\s*:?\s*(.+)/, key: 'floor' },
  { pattern: /کدپستی\s*:?\s*(.+)/, key: 'postalCode' },
  { pattern: /کد\s*پستی\s*:?\s*(.+)/, key: 'postalCode' },
  { pattern: /نشانه\s*:?\s*(.+)/, key: 'landmark' },
];

function parseAddressText(text: string): PersianAddressInput {
  const lines = text
    .split(/[\n,؛،]+/)
    .map((line) => line.trim())
    .filter(Boolean);

  const result: PersianAddressInput = {
    country: 'ایران',
    province: '',
    city: '',
    district: '',
    street: '',
    alley: '',
    plaqueNo: '',
    unit: '',
    floor: '',
    postalCode: '',
    landmark: '',
  };

  const usedKeys = new Set<string>();

  for (const line of lines) {
    for (const { pattern, key } of fieldKeywords) {
      if (usedKeys.has(key)) {
        continue;
      }
      const match = line.match(pattern);
      if (match?.[1]) {
        const value = match[1].trim();
        if (value) {
          result[key] = value;
          usedKeys.add(key);
        }
      }
    }
  }

  const unusedLines = lines.filter(
    (line) => !fieldKeywords.some(({ pattern }) => pattern.test(line)),
  );

  if (!result.province && unusedLines[0]) {
    result.province = unusedLines[0];
  }
  if (!result.city && unusedLines[1]) {
    result.city = unusedLines[1];
  }
  if (!result.street && unusedLines[2]) {
    result.street = unusedLines[2];
  }

  const postalMatch = text.match(/(\d{10})/);
  if (!result.postalCode && postalMatch?.[1]) {
    result.postalCode = postalMatch[1];
  }

  return result;
}

export default function AddressFastInput({ onParsed }: AddressFastInputProps) {
  const [mode, setMode] = useState<InputMode>('fast');
  const [text, setText] = useState('');
  const [preview, setPreview] = useState<PersianAddressInput | null>(null);

  const handleParse = () => {
    if (!text.trim()) {
      return;
    }
    setPreview(parseAddressText(text));
  };

  const handleConfirm = () => {
    if (!preview) {
      return;
    }
    onParsed(preview);
    setText('');
    setPreview(null);
  };

  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-[var(--text-primary)]">ورود آدرس</h3>
        <div className="flex gap-1.5">
          {(Object.keys(modeLabels) as InputMode[]).map((inputMode) => (
            <button
              key={inputMode}
              type="button"
              className={`btn btn-sm text-[11px] ${mode === inputMode ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setMode(inputMode)}
            >
              {modeLabels[inputMode]}
            </button>
          ))}
        </div>
      </div>

      {mode === 'fast' ? (
        <>
          <p className="text-xs text-[var(--text-muted)]">
            آدرس کامل فارسی خود را اینجا بچسبانید. فیلدها به صورت خودکار استخراج می‌شوند.
          </p>
          <textarea
            className="w-full min-h-32 rounded-[var(--radius-sm)] border border-[var(--border-light)] bg-[var(--surface-2)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] resize-y"
            placeholder={'مثال:\nاستان: تهران\nشهر: تهران\nمحله: ونک\nخیابان: ولیعصر\nپلاک: 12\nکدپستی: 1234567890'}
            value={text}
            onChange={(event) => setText(event.target.value)}
            dir="rtl"
            aria-label="آدرس فارسی"
          />
          <div className="flex gap-2">
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleParse}
              disabled={!text.trim()}
            >
              استخراج فیلدها
            </button>
            {text.trim() ? (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setText('');
                  setPreview(null);
                }}
              >
                پاک کردن
              </button>
            ) : null}
          </div>
        </>
      ) : (
        <p className="text-xs text-[var(--text-muted)]">
          از فرم زیر برای ورود دقیق هر فیلد استفاده کنید.
        </p>
      )}

      {preview ? (
        <div className="space-y-2">
          <div className="text-xs font-semibold text-[var(--text-muted)]">
            فیلدهای استخراج‌شده — بررسی و تأیید کنید:
          </div>
          <div className="grid gap-2 text-sm">
            {(
              [
                ['province', 'استان'],
                ['city', 'شهر'],
                ['district', 'محله'],
                ['street', 'خیابان'],
                ['alley', 'کوچه'],
                ['plaqueNo', 'پلاک'],
                ['unit', 'واحد'],
                ['floor', 'طبقه'],
                ['postalCode', 'کدپستی'],
                ['landmark', 'نشانه'],
              ] as const
            ).map(([key, label]) => {
              const value = preview[key];
              return value ? (
                <div
                  key={key}
                  className="flex items-center gap-2 rounded-[var(--radius-sm)] bg-[var(--surface-2)] px-3 py-1.5"
                >
                  <span className="text-xs text-[var(--text-muted)] w-16 shrink-0">{label}:</span>
                  <span className="text-[var(--text-primary)]">{value}</span>
                </div>
              ) : null;
            })}
          </div>
          <button type="button" className="btn btn-primary btn-sm" onClick={handleConfirm}>
            استفاده از فیلدهای استخراج‌شده
          </button>
        </div>
      ) : null}
    </div>
  );
}
