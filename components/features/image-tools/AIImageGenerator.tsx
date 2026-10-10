'use client';
import { useEffect, useRef, useState } from 'react';
import type { ImageJob } from '@/services/image-generation/core.mjs';

const endpoint = '/api/image-generation';
const messages: Record<string, string> = {
  disabled: 'تصویرساز هنوز فعال نشده است.',
  unavailable: 'تصویرساز موقتاً در دسترس نیست؛ بعداً دوباره امتحان کنید.',
  not_configured: 'تصویرساز هنوز آماده نشده است.',
  queue_full: 'صف تصویرساز پر است؛ کمی بعد دوباره امتحان کنید.',
  already_running: 'یک درخواست در حال انجام دارید.',
  quota_reached: 'سقف استفادهٔ رایگان رسیده است؛ بعداً دوباره امتحان کنید.',
  invalid_prompt: 'توضیح تصویر باید بین ۸ و ۲۰۰۰ نویسه باشد.',
  not_found: 'این درخواست دیگر در دسترس نیست یا زمان نگهداری آن تمام شده است.',
  signup_required: 'سرویس تصویرساز دسترسی آزاد را متوقف کرده است.',
  captcha_required: 'تصویرساز به بررسی انسانی نیاز دارد؛ تولید متوقف شد.',
  provider_timeout: 'زمان انتظار تمام شد؛ تصویر دریافت نشد.',
  worker_interrupted: 'پردازش قطع شد؛ درخواست خودکار دوباره ارسال نشد.',
  consent_required: 'برای ارسال توضیح تصویر، رضایت خود را تأیید کنید.',
  provider_error: 'تصویرساز خروجی قابل دریافت برنگرداند.',
};
class RequestError extends Error {
  constructor(public code: string) {
    super(code);
  }
}
async function request(path: string, options: RequestInit = {}): Promise<{ job: ImageJob | null }> {
  const res = await fetch(path, {
    ...options,
    cache: 'no-store',
    signal: AbortSignal.timeout(15000),
  });
  const data = (await res.json()) as { job: ImageJob | null; code?: string };
  if (!res.ok) {
    throw new RequestError(data.code ?? 'unavailable');
  }
  return data;
}
export default function AIImageGenerator() {
  const [prompt, setPrompt] = useState(''),
    [consent, setConsent] = useState(false),
    [job, setJob] = useState<ImageJob | null>(null);
  const [notice, setNotice] = useState('در حال بررسی درخواست‌های قبلی…'),
    [busy, setBusy] = useState(true),
    [image, setImage] = useState('');
  const [now, setNow] = useState(Date.now());
  const [imageFilename, setImageFilename] = useState('persiantoolbox-image.jpg');
  const objectUrl = useRef(''),
    alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    void request(endpoint)
      .then((data) => {
        if (alive.current) {
          setJob(data.job);
          setBusy(false);
          setNotice('آمادهٔ دریافت درخواست');
        }
      })
      .catch((error) => {
        if (alive.current) {
          setBusy(false);
          setNotice(messages[error.code] ?? messages['unavailable'] ?? 'ارتباط برقرار نشد.');
        }
      });
    return () => {
      alive.current = false;
      if (objectUrl.current) {
        URL.revokeObjectURL(objectUrl.current);
      }
    };
  }, []);
  useEffect(() => {
    if (!job || !['queued', 'running'].includes(job.status)) {
      return;
    }
    let stopped = false;
    let timer: ReturnType<typeof setTimeout>;
    const poll = async () => {
      try {
        const data = await request(`${endpoint}?id=${job.id}`);
        if (!stopped) {
          setJob(data.job);
        }
      } catch (error) {
        if (!stopped) {
          const code = error instanceof RequestError ? error.code : '';
          setNotice(messages[code] ?? 'ارتباط قطع شد؛ فقط وضعیت را دوباره بررسی می‌کنیم.');
          if (['not_found', 'forbidden', 'disabled'].includes(code)) {
            setJob(null);
            return;
          }
        }
      }
      if (!stopped) {
        setNow(Date.now());
        timer = setTimeout(poll, 3000);
      }
    };
    timer = setTimeout(poll, 3000);
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, [job]);
  useEffect(() => {
    if (!job || job.status !== 'ready') {
      return;
    }
    let stopped = false;
    void fetch(`${endpoint}?id=${job.id}&image=1`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(15000),
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new RequestError('not_found');
        }
        const blob = await res.blob();
        if (
          !['image/jpeg', 'image/png', 'image/webp'].includes(blob.type) ||
          blob.size > 5 * 1024 * 1024
        ) {
          throw new RequestError('provider_error');
        }
        if (stopped) {
          return;
        }
        if (objectUrl.current) {
          URL.revokeObjectURL(objectUrl.current);
        }
        objectUrl.current = URL.createObjectURL(blob);
        const extension =
          { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }[blob.type] ?? 'jpg';
        setImageFilename(`persiantoolbox-image.${extension}`);
        setImage(objectUrl.current);
      })
      .catch((error) => {
        if (!stopped) {
          setNotice(messages[error.code] ?? 'دریافت تصویر ممکن نشد؛ صفحه را دوباره بارگذاری کنید.');
        }
      });
    return () => {
      stopped = true;
    };
  }, [job]);
  const running = job !== null && ['queued', 'running'].includes(job.status);
  const submit = async () => {
    setBusy(true);
    setImage('');
    setNotice('در حال ثبت درخواست…');
    try {
      const data = await request(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create', prompt, consent, requestId: crypto.randomUUID() }),
      });
      setJob(data.job);
      setNow(Date.now());
      setNotice('درخواست ثبت شد.');
    } catch (error) {
      setNotice(
        messages[error instanceof RequestError ? error.code : ''] ??
          'ثبت درخواست تأیید نشد؛ برای بررسی وضعیت، صفحه را دوباره بارگذاری کنید.',
      );
    } finally {
      setBusy(false);
    }
  };
  const cancel = async () => {
    if (!job) {
      return;
    }
    setBusy(true);
    try {
      const data = await request(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel', id: job.id }),
      });
      setJob(data.job);
    } catch {
      setNotice('لغو تأیید نشد؛ بررسی وضعیت ادامه دارد.');
    } finally {
      setBusy(false);
    }
  };
  const elapsed = job ? Math.max(0, Math.floor((now - job.createdAt) / 1000)) : 0;
  let status = notice;
  if (running) {
    const stage = job?.stage === 'queued' ? 'در صف تصویرساز' : 'در انتظار آماده شدن تصویر';
    status = `${stage} — ${new Intl.NumberFormat('fa-IR').format(elapsed)} ثانیه`;
  } else if (job?.status === 'ready') {
    status = 'تصویر آماده است.';
  } else if (job?.status === 'cancelled') {
    status = 'انتظار شما لغو شد؛ ممکن است سرویس خارجی همچنان پردازش کند.';
  } else if (job?.status === 'error') {
    status = messages[job.code ?? ''] ?? 'ساخت تصویر متوقف شد.';
  }
  return (
    <div className="mx-auto max-w-3xl space-y-6" dir="rtl">
      <form
        className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6"
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
      >
        <label className="block font-bold" htmlFor="ai-image-prompt">
          توضیح تصویر
        </label>
        <textarea
          id="ai-image-prompt"
          className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4"
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          minLength={8}
          maxLength={2000}
          rows={5}
          required
          disabled={busy || running}
          placeholder="مثلاً: یک قوری فیروزه‌ای کنار پنجره، نقاشی آبرنگ"
        />
        <p className="text-sm">
          فارسی یا انگلیسی بنویسید؛ متن فارسی برای تولید تصویر آماده می‌شود.
        </p>
        <label className="flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            checked={consent}
            onChange={(event) => setConsent(event.target.checked)}
            required
            disabled={busy || running}
          />
          با ارسال توضیح به سرویس خارجی FlatAI برای ساخت تصویر موافقم. اطلاعات محرمانه وارد نمی‌کنم.
        </label>
        <p className="text-sm">این سرویس برای افراد ۱۸ سال و بالاتر است.</p>
        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={busy || running || !consent}
            className="rounded-xl bg-teal-700 px-6 py-3 text-white disabled:opacity-50"
          >
            ساخت تصویر
          </button>
          {running ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => void cancel()}
              className="rounded-xl border px-4 py-3"
            >
              لغو انتظار
            </button>
          ) : null}
        </div>
        <p role="status" aria-live="polite">
          {status}
        </p>
        <p className="text-sm">
          تولید ممکن است چند دقیقه طول بکشد. تصویر را تا ۳۰ دقیقه دانلود کنید؛ درخواست پس از
          بارگذاری دوبارهٔ صفحه بازیابی می‌شود.
        </p>
        {!running && notice !== 'آمادهٔ دریافت درخواست' && <p className="text-sm">{notice}</p>}
      </form>
      {image ? (
        <section className="space-y-4 rounded-2xl border p-6">
          <h2 className="text-xl font-bold">تصویر شما</h2>
          {/* Blob comes only from the same-origin session-owned image endpoint. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image}
            alt="تصویر ساخته‌شده از توضیح شما"
            width={832}
            height={832}
            className="h-auto w-full rounded-xl"
          />
          <a
            href={image}
            download={imageFilename}
            className="inline-block rounded-xl bg-teal-700 px-6 py-3 text-white"
          >
            دانلود تصویر
          </a>
        </section>
      ) : null}
    </div>
  );
}
