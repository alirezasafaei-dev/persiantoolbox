'use client';

import { useState } from 'react';
import { Card } from '@/components/ui';

export default function GoogleSnippetPreviewPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('https://example.com/page');

  const titleLen = title.length;
  const descLen = description.length;
  const titleWarn = titleLen < 30 || titleLen > 65;
  const descWarn = descLen < 80 || descLen > 165;

  const displayTitle = title || 'عنوان صفحه شما اینجا نمایش داده می‌شود';
  const displayDesc =
    description || 'توضیحات متا در اینجا ظاهر می‌شود. گوگل ممکن است آن را کوتاه یا بازنویسی کند.';
  const displayUrl = (url || 'https://example.com').replace(/^https?:\/\//, '');

  const reset = () => {
    setTitle('');
    setDescription('');
    setUrl('https://example.com/page');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-8" dir="rtl">
      <div>
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
          پیش‌نمایش اسنیپت گوگل
        </h1>
        <p className="text-[var(--text-muted)]">
          عنوان، توضیحات متا و URL را وارد کنید و پیش‌نمایش تقریبی ظاهر در نتایج گوگل (دسکتاپ و
          موبایل) را ببینید.
        </p>
        <div className="mt-2 text-xs text-[var(--text-muted)]">
          پردازش کاملاً محلی • بدون ارسال داده
        </div>
      </div>

      <Card className="p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1">عنوان صفحه (Title)</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="عنوان جذاب و دقیق صفحه"
              className="w-full rounded border border-[var(--border-light)] bg-[var(--surface-1)] p-3 text-sm focus:outline-none focus:ring-1"
              aria-label="عنوان"
            />
            <div className="text-xs mt-1 text-[var(--text-muted)]">
              طول: {titleLen} کاراکتر {titleWarn ? '⚠️' : null}
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">آدرس (URL)</label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full rounded border border-[var(--border-light)] bg-[var(--surface-1)] p-3 text-sm focus:outline-none focus:ring-1"
              aria-label="URL"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">توضیحات متا (Meta Description)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="توضیح کوتاه و جذاب برای نمایش در نتایج جستجو"
            className="w-full rounded border border-[var(--border-light)] bg-[var(--surface-1)] p-3 text-sm focus:outline-none focus:ring-1"
            aria-label="توضیحات متا"
          />
          <div className="text-xs mt-1 text-[var(--text-muted)]">
            طول: {descLen} کاراکتر {descWarn ? '⚠️' : null}
          </div>
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={reset} className="px-4 py-2 rounded border text-sm">
            پاک کردن
          </button>
        </div>
      </Card>

      <div>
        <h2 className="font-semibold mb-3">پیش‌نمایش دسکتاپ (تقریبی)</h2>
        <div className="border border-[var(--border-light)] rounded p-4 bg-[var(--surface-1)] text-[var(--text-primary)] max-w-[600px]">
          <div className="text-[#1a0dab] text-xl leading-tight hover:underline cursor-pointer">
            {displayTitle}
          </div>
          <div className="text-[#006621] text-sm mt-0.5">{displayUrl}</div>
          <div className="text-[#545454] text-sm mt-0.5 line-clamp-2">{displayDesc}</div>
        </div>
      </div>

      <div>
        <h2 className="font-semibold mb-3">پیش‌نمایش موبایل (تقریبی)</h2>
        <div className="border border-[var(--border-light)] rounded p-3 bg-[var(--surface-1)] text-[var(--text-primary)] max-w-[360px]">
          <div className="text-[#1a0dab] text-base leading-snug hover:underline cursor-pointer">
            {displayTitle}
          </div>
          <div className="text-[#006621] text-xs mt-0.5 truncate">{displayUrl}</div>
          <div className="text-[#545454] text-xs mt-0.5 line-clamp-3">{displayDesc}</div>
        </div>
      </div>

      <Card className="p-4 text-sm">
        <div className="font-semibold mb-1">راهنما</div>
        <ul className="list-disc pr-5 space-y-1 text-[var(--text-secondary)]">
          <li>عنوان ایده‌آل: ۵۰–۶۰ کاراکتر</li>
          <li>توضیحات: ۱۲۰–۱۶۰ کاراکتر</li>
          <li>این پیش‌نمایش تقریبی است. گوگل ممکن است عنوان یا توضیح را تغییر دهد.</li>
        </ul>
      </Card>

      <div className="text-xs text-[var(--text-muted)]">
        تمام پردازش‌ها در مرورگر شما انجام می‌شود. حریم خصوصی حفظ شده است.
      </div>
    </div>
  );
}
