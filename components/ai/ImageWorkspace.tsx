'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';

type Pending = { controller: AbortController; timeout: ReturnType<typeof setTimeout> };
const MAX_PROMPT = 2048;
const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const REQUEST_TIMEOUT_MS = 45_000;

/**
 * Image is held as a short-lived object URL only: no localStorage, cookies,
 * analytics payloads, prompt/history or file persistence in the client.
 */
export default function ImageWorkspace({ enabled }: { enabled: boolean }) {
  const [prompt, setPrompt] = useState('');
  const [consent, setConsent] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [error, setError] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const pending = useRef<Pending | null>(null);
  const currentImage = useRef<string | null>(null);

  useEffect(
    () => () => {
      if (pending.current) {
        clearTimeout(pending.current.timeout);
        pending.current.controller.abort();
        pending.current = null;
      }
      if (currentImage.current) {
        URL.revokeObjectURL(currentImage.current);
        currentImage.current = null;
      }
    },
    [],
  );

  function stop() {
    if (!pending.current) {
      return;
    }
    clearTimeout(pending.current.timeout);
    pending.current.controller.abort();
    pending.current = null;
    setWaiting(false);
    setError('درخواست متوقف شد. ممکن است سهمیه رایگان مصرف شده باشد؛ ارسال دوباره خودکار نیست.');
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalized = prompt.trim();
    if (!enabled || pending.current || !consent || !normalized || normalized.length > MAX_PROMPT) {
      return;
    }
    setError('');
    if (currentImage.current) {
      URL.revokeObjectURL(currentImage.current);
      currentImage.current = null;
      setImageUrl(null);
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => {
      if (pending.current?.controller === controller) {
        stop();
        setError('زمان انتظار تمام شد. ممکن است سهمیه مصرف شده باشد؛ متن شما حفظ شد.');
      }
    }, REQUEST_TIMEOUT_MS);
    pending.current = { controller, timeout };
    setWaiting(true);

    try {
      const response = await fetch('/api/ai/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        cache: 'no-store',
        body: JSON.stringify({ prompt: normalized, consent: true }),
        signal: controller.signal,
      });
      if (pending.current?.controller !== controller) {
        return; // User stopped the request: a late result must never reappear.
      }
      if (!response.ok) {
        setError(
          response.status === 429
            ? 'سهمیه یا ظرفیت ساخت تصویر تکمیل شده است. بعداً دوباره امتحان کن.'
            : 'سرویس تولید تصویر فعلاً در دسترس نیست. متن شما حفظ شد.',
        );
        return;
      }
      const mediaType = response.headers.get('content-type')?.split(';')[0]?.trim().toLowerCase();
      const declaredLength = Number(response.headers.get('content-length') || '0');
      if (
        mediaType !== 'image/jpeg' ||
        !Number.isFinite(declaredLength) ||
        declaredLength > MAX_IMAGE_BYTES
      ) {
        setError('فایل تصویر دریافتی معتبر نیست؛ دوباره امتحان نکن مگر سهمیه کافی داشته باشی.');
        return;
      }
      const blob = await response.blob();
      if (pending.current?.controller !== controller) {
        return;
      }
      if (blob.size === 0 || blob.size > MAX_IMAGE_BYTES) {
        setError('فایل تصویر دریافتی معتبر نیست؛ دوباره امتحان نکن مگر سهمیه کافی داشته باشی.');
        return;
      }
      const objectUrl = URL.createObjectURL(blob);
      currentImage.current = objectUrl;
      setImageUrl(objectUrl);
    } catch {
      if (pending.current?.controller === controller) {
        setError('ارتباط با سرویس تصویر برقرار نشد. متن شما حفظ شد؛ درخواست خودکار تکرار نمی‌شود.');
      }
    } finally {
      if (pending.current?.controller === controller) {
        clearTimeout(timeout);
        pending.current = null;
        setWaiting(false);
      }
    }
  }

  const canSubmit =
    enabled &&
    !waiting &&
    consent &&
    prompt.trim().length > 0 &&
    prompt.trim().length <= MAX_PROMPT;

  return (
    <section
      aria-label="ساخت تصویر با هوش مصنوعی"
      dir="rtl"
      className="mx-auto w-full max-w-5xl px-4 py-8 text-(--text-primary) sm:py-12"
    >
      <nav aria-label="مسیر صفحه" className="mb-8 text-sm text-(--text-muted)">
        <Link href="/ai" className="hover:text-primary hover:underline">
          هوش مصنوعی
        </Link>
        <span aria-hidden="true" className="mx-2">
          ←
        </span>
        <span>ساخت تصویر</span>
      </nav>
      <header className="mb-8 space-y-3">
        <p className="text-xs font-bold tracking-wide text-primary">جعبه ابزار فارسی · ASDEV</p>
        <h1 className="text-3xl font-black leading-relaxed sm:text-4xl">
          ساخت تصویر با هوش مصنوعی
        </h1>
        <p className="max-w-2xl text-sm leading-8 text-(--text-secondary)">
          تصویر دلخواهت را به فارسی توضیح بده. هر درخواست از سهمیه محدود رایگان کم می‌کند؛ نتیجه فقط
          در همین صفحه نمایش داده می‌شود و می‌توانی آن را دانلود کنی.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <form
          onSubmit={(event) => {
            void submit(event);
          }}
          className="min-w-0 space-y-5 rounded-3xl border border-(--border-light) bg-(--surface-1) p-5 shadow-subtle sm:p-7"
        >
          {!enabled && (
            <p
              role="status"
              className="rounded-xl border border-(--border-medium) bg-(--surface-2) p-4 text-sm leading-7"
            >
              تولید تصویر فعلاً فعال نیست. پس از تأیید رایگان‌بودن سرویس و آزمایش‌های امنیتی در
              دسترس قرار می‌گیرد.
            </p>
          )}
          <div className="space-y-2">
            <label htmlFor="ai-image-prompt" className="block text-sm font-bold">
              توضیح تصویر
            </label>
            <textarea
              id="ai-image-prompt"
              rows={6}
              maxLength={MAX_PROMPT}
              value={prompt}
              disabled={!enabled || waiting}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="مثلاً: یک کلبه چوبی کنار دریاچه، صبح پاییزی، نور طبیعی و جزئیات واقعی"
              aria-describedby="ai-image-prompt-hint"
              className="w-full resize-y rounded-2xl border border-(--border-medium) bg-(--surface-2) p-4 text-base leading-8 outline-hidden focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-60"
            />
            <p id="ai-image-prompt-hint" className="text-xs leading-6 text-(--text-muted)">
              {prompt.length.toLocaleString('fa-IR')} از {MAX_PROMPT.toLocaleString('fa-IR')} نویسه.
              اطلاعات شخصی یا محرمانه وارد نکن.
            </p>
          </div>
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-(--border-medium) p-4 text-sm leading-7 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary">
            <input
              type="checkbox"
              checked={consent}
              onChange={(event) => setConsent(event.target.checked)}
              disabled={!enabled || waiting}
              className="mt-1 size-5 shrink-0 accent-primary disabled:opacity-60"
            />
            <span>
              اجازه می‌دهم متن توضیح تصویر برای پردازش به سرویس خارجی Cloudflare Workers AI ارسال
              شود. می‌دانم درخواست ممکن است از سهمیه محدود رایگان کم کند و تاریخچه تصاویر در این
              صفحه ذخیره نمی‌شود.
            </span>
          </label>
          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={!canSubmit}
              className="min-h-12 rounded-2xl bg-primary px-6 py-3 text-sm font-bold text-white transition enabled:hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              ساخت تصویر
            </button>
            {waiting && (
              <button
                type="button"
                onClick={stop}
                className="min-h-12 rounded-2xl border border-(--border-medium) px-5 py-3 text-sm font-bold focus-visible:outline-2 focus-visible:outline-primary"
              >
                توقف درخواست
              </button>
            )}
          </div>
          {error && (
            <p
              role="alert"
              className="rounded-xl border border-(--border-medium) p-3 text-sm leading-7 text-(--text-primary)"
            >
              {error}
            </p>
          )}
          <p aria-live="polite" aria-atomic="true" className="text-sm text-(--text-secondary)">
            {waiting
              ? 'در حال ساخت تصویر… این درخواست ممکن است از سهمیه شما کم کند.'
              : imageUrl
                ? 'تصویر آماده شد.'
                : ''}
          </p>
        </form>

        <div className="flex min-h-72 min-w-0 flex-col items-center justify-center gap-5 rounded-3xl border border-(--border-light) bg-(--surface-2) p-5 sm:p-7">
          {imageUrl ? (
            <>
              {/* Blob URLs are already sanitized JPEGs and cannot use the Next image optimizer. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt="پیش‌نمایش تصویر ساخته‌شده با هوش مصنوعی"
                className="max-h-[28rem] w-full rounded-2xl object-contain"
              />
              <a
                href={imageUrl}
                download="persiantoolbox-ai-image.jpg"
                className="rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                دانلود تصویر
              </a>
            </>
          ) : (
            <div className="space-y-3 text-center text-(--text-muted)">
              <div
                aria-hidden="true"
                className="mx-auto grid size-20 place-items-center rounded-3xl border border-dashed border-(--border-medium) text-4xl"
              >
                ✦
              </div>
              <p className="text-sm leading-7">
                پیش‌نمایش تصویر پس از ساخت در اینجا نمایش داده می‌شود.
              </p>
            </div>
          )}
        </div>
      </div>
      <p className="mt-6 text-xs leading-7 text-(--text-muted)">
        سرویس آزمایشی است و خروجی آن ممکن است دقیق نباشد. ارسال مجدد، حتی بعد از قطع ارتباط، ممکن
        است از سهمیه کم کند. هیچ تصویر یا متنی در تاریخچه این ابزار ذخیره نمی‌شود.
      </p>
    </section>
  );
}
