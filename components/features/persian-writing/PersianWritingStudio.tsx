'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Card, Button } from '@/components/ui';
import { useToast } from '@/shared/ui/toast-context';
import UpgradeModal from '@/components/features/pricing/UpgradeModal';
import { useSubscriptionStatus } from '@/shared/hooks/useSubscriptionStatus';
import type { PersianWritingConfig, CleanupResult } from '@/lib/persian-writing/types';
import {
  DEFAULT_CONFIG,
  DISCLAIMER,
  PRIVACY_TEXT,
  FREE_MAX_LENGTH,
  WATERMARK_TEXT,
} from '@/lib/persian-writing/types';
import { applyFixes } from '@/lib/persian-writing/applyFixes';
import {
  saveDraft,
  loadDrafts,
  createDraftId,
  canSaveDraft,
} from '@/lib/persian-writing/draft-storage';

export default function PersianWritingStudio() {
  const { isPremium } = useSubscriptionStatus();
  const [inputText, setInputText] = useState('');
  const [config, setConfig] = useState<PersianWritingConfig>(DEFAULT_CONFIG);
  const [result, setResult] = useState<CleanupResult | null>(null);
  const [draftId] = useState(() => createDraftId());
  const [showConfig, setShowConfig] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const { showToast } = useToast();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const drafts = loadDrafts();
    const latest = drafts[drafts.length - 1];
    if (latest) {
      setInputText(latest.originalText);
      setConfig(latest.config);
    }
  }, []);

  useEffect(() => {
    if (autosaveTimer.current) {
      clearTimeout(autosaveTimer.current);
    }
    if (inputText.trim()) {
      autosaveTimer.current = setTimeout(() => {
        if (canSaveDraft()) {
          saveDraft({
            id: draftId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            originalText: inputText,
            config,
          });
        }
      }, 2000);
    }
    return () => {
      if (autosaveTimer.current) {
        clearTimeout(autosaveTimer.current);
      }
    };
  }, [inputText, config, draftId]);

  const isOverLimit = !isPremium && inputText.length > FREE_MAX_LENGTH;
  const charCount = inputText.length;

  const handleAnalyze = useCallback(() => {
    if (!inputText.trim() || isOverLimit) {
      return;
    }
    const r = applyFixes(inputText, config);
    setResult(r);
  }, [inputText, config, isOverLimit]);

  const handleReset = useCallback(() => {
    setInputText('');
    setResult(null);
    setConfig(DEFAULT_CONFIG);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleCopy = useCallback(async () => {
    if (!result) {
      return;
    }
    const output = !isPremium ? `${result.cleanedText}\n\n---\n${WATERMARK_TEXT}` : result.cleanedText;
    try {
      await navigator.clipboard.writeText(output);
      showToast('متن پاک‌سازی‌شده کپی شد', 'success');
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = output;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      showToast('متن پاک‌سازی‌شده کپی شد', 'success');
    }
  }, [result, isPremium, showToast]);

  const handleDownload = useCallback(() => {
    if (!result) {
      return;
    }
    const output = !isPremium ? `${result.cleanedText}\n\n---\n${WATERMARK_TEXT}` : result.cleanedText;
    const blob = new Blob([output], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'persian-text-cleaned.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [result, isPremium]);

  const toggleConfig = useCallback((key: keyof PersianWritingConfig) => {
    setConfig((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const setMode = useCallback((mode: PersianWritingConfig['mode']) => {
    setConfig((prev) => ({ ...prev, mode }));
  }, []);

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)]">
            ویرایشگر فارسی پیشرفته
          </h1>
        </div>
        <p className="text-sm text-[var(--text-muted)]">
          پاک‌سازی، استانداردسازی و بهبود نگارش متن فارسی — بدون نیاز به سرور
        </p>
      </div>

      <Card className="p-6 space-y-6">
        <div className="space-y-2">
          <label
            htmlFor="persian-input"
            className="block text-sm font-medium text-[var(--text-primary)]"
          >
            متن اصلی
          </label>
          <textarea
            ref={inputRef}
            id="persian-input"
            dir="rtl"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="متن فارسی خود را اینجا وارد کنید..."
            rows={10}
            className="w-full rounded-[var(--radius-md)] border border-[var(--border-medium)] bg-[var(--surface-1)] px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] resize-y"
          />
          <div className="flex items-center justify-between">
            <span
              className={`text-xs ${isOverLimit ? 'text-[var(--color-danger)] font-bold' : 'text-[var(--text-muted)]'}`}
            >
              {charCount.toLocaleString('fa-IR')} کاراکتر
              {!isPremium && <span> / {FREE_MAX_LENGTH.toLocaleString('fa-IR')} (رایگان)</span>}
            </span>
            {isOverLimit ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-[var(--color-danger)]">از حد مجاز رد شده‌اید.</span>
                <button
                  type="button"
                  onClick={() => setShowUpgradeModal(true)}
                  className="text-xs font-bold text-[var(--color-primary)] hover:underline"
                >
                  🎯 ارتقا به نسخه حرفه‌ای
                </button>
              </div>
            ) : null}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[var(--text-primary)]">تنظیمات پاک‌سازی</h2>
            <button
              type="button"
              onClick={() => setShowConfig(!showConfig)}
              className="text-xs text-[var(--color-primary)] hover:underline"
            >
              {showConfig ? 'بستن' : 'تنظیمات بیشتر'}
            </button>
          </div>

          <div className="flex gap-2 flex-wrap items-center">
            {(['safe', 'standard', 'strict'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setMode(mode)}
                disabled={mode === 'strict' && !isPremium}
                className={`px-3 py-1.5 rounded-[var(--radius-md)] text-xs font-medium border transition-all ${
                  config.mode === mode
                    ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                    : 'bg-[var(--surface-1)] text-[var(--text-secondary)] border-[var(--border-medium)] hover:border-[var(--color-primary)]'
                } ${mode === 'strict' && !isPremium ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {mode === 'safe' && 'ایمن'}
                {mode === 'standard' && 'استاندارد'}
                {mode === 'strict' && 'سخت‌گیرانه'}
                {mode === 'strict' && !isPremium && ' 🔒'}
              </button>
            ))}
            {config.mode === 'strict' && !isPremium && (
              <button
                type="button"
                onClick={() => setShowUpgradeModal(true)}
                className="text-xs font-bold text-[var(--color-primary)] hover:underline"
              >
                🎯 ارتقا
              </button>
            )}
          </div>

          {showConfig ? (
            <div className="grid gap-2 md:grid-cols-2 rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-4">
              {(
                [
                  ['normalizeArabicLetters', 'تبدیل حروف عربی'],
                  ['normalizeDigits', 'تبدیل اعداد'],
                  ['removeExtraSpaces', 'حذف فضاهای اضافی'],
                  ['normalizeLineBreaks', 'نرمال‌سازی خط جدید'],
                  ['fixPunctuationSpacing', 'اصلاح فاصله علائم'],
                  ['normalizePunctuation', 'نرمال‌سازی علائم'],
                  ['detectRepeatedWords', 'شناسایی کلمات تکراری'],
                  ['normalizeZwnj', 'نیم‌فاصله خودکار'],
                ] as const
              ).map(([key, label]) => (
                <label
                  key={key}
                  className="flex items-center gap-2 cursor-pointer text-sm text-[var(--text-secondary)]"
                >
                  <input
                    type="checkbox"
                    checked={config[key]}
                    onChange={() => toggleConfig(key)}
                    className="h-4 w-4 rounded border-[var(--border-light)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                  />
                  {label}
                </label>
              ))}
            </div>
          ) : null}
        </div>

        <div className="flex gap-3">
          <Button onClick={handleAnalyze} disabled={!inputText.trim() || isOverLimit}>
            تحلیل و پاک‌سازی
          </Button>
          <Button onClick={handleReset} variant="tertiary">
            بازنشانی
          </Button>
        </div>
      </Card>

      {result ? (
        <Card className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[var(--text-primary)]">متن پاک‌سازی‌شده</h2>
            <div className="flex gap-2 items-center">
              {!isPremium && (
                <span className="text-[10px] text-[var(--text-muted)] bg-[var(--surface-1)] border border-[var(--border-light)] rounded-full px-2 py-0.5">
                  واترمارک روی خروجی
                </span>
              )}
              <Button onClick={handleCopy} variant="secondary" className="text-xs">
                کپی
              </Button>
              <Button onClick={handleDownload} variant="secondary" className="text-xs">
                دانلود TXT
              </Button>
            </div>
          </div>

          <div
            dir="rtl"
            className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-4 text-sm text-[var(--text-primary)] leading-7 whitespace-pre-wrap max-h-96 overflow-y-auto"
          >
            {result.cleanedText}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-4 space-y-2">
              <h3 className="text-sm font-bold text-[var(--text-primary)]">آمار متن</h3>
              <div className="grid grid-cols-2 gap-2 text-xs text-[var(--text-secondary)]">
                <div>
                  کاراکتر:{' '}
                  <span className="font-bold">
                    {result.stats.characters.toLocaleString('fa-IR')}
                  </span>
                </div>
                <div>
                  کلمه:{' '}
                  <span className="font-bold">{result.stats.words.toLocaleString('fa-IR')}</span>
                </div>
                <div>
                  جمله:{' '}
                  <span className="font-bold">
                    {result.stats.sentences.toLocaleString('fa-IR')}
                  </span>
                </div>
                <div>
                  پاراگراف:{' '}
                  <span className="font-bold">
                    {result.stats.paragraphs.toLocaleString('fa-IR')}
                  </span>
                </div>
                <div className="col-span-2">
                  زمان مطالعه:{' '}
                  <span className="font-bold">
                    {result.stats.readingTimeMinutes.toLocaleString('fa-IR')} دقیقه
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-4 space-y-2">
              <h3 className="text-sm font-bold text-[var(--text-primary)]">موارد شناسایی‌شده</h3>
              {result.issues.length === 0 ? (
                <p className="text-xs text-[var(--text-muted)]">مشکلی شناسایی نشد.</p>
              ) : (
                <div className="space-y-1">
                  {result.issues.map((issue, i) => (
                    <div key={i} className="text-xs text-[var(--text-secondary)]">
                      <span className="font-bold">{issue.category}:</span> {issue.description}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Card>
      ) : null}

      <div className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-5 text-center space-y-2">
        <p className="text-xs text-[var(--text-muted)] leading-5">{PRIVACY_TEXT}</p>
      </div>

      <div className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-5 text-center space-y-2">
        <p className="text-xs text-[var(--text-muted)] leading-5">{DISCLAIMER}</p>
      </div>

      {showUpgradeModal ? (
        <UpgradeModal
          product="writing"
          onClose={() => setShowUpgradeModal(false)}
          onUpgradeSuccess={() => {
            setShowUpgradeModal(false);
            window.location.reload();
          }}
        />
      ) : null}
    </div>
  );
}
