'use client';

import { useState, type FormEvent } from 'react';

export default function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email.trim()) {
      return;
    }

    setStatus('loading');
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (data.ok) {
        setStatus('success');
        setEmail('');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <section className="rounded-lg border border-(--border-light) bg-(--surface-1) p-6 space-y-4">
      <div className="space-y-2">
        <h3 className="text-lg font-bold text-(--text-primary)">خبرنامه جعبه ابزار فارسی</h3>
        <p className="text-sm text-(--text-muted)">
          هفته‌ای یکبار نکات کاربردی، ابزارهای جدید و به‌روزرسانی‌ها را دریافت کنید.
        </p>
      </div>

      {(() => {
        if (status === 'success') {
          return (
            <div className="rounded-md bg-[rgb(var(--color-success-rgb)/0.1)] p-4 text-center">
              <p className="flex items-center justify-center gap-2 text-sm font-semibold text-success">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                با موفقیت ثبت‌نام شدید!
              </p>
            </div>
          );
        }
        if (status === 'error') {
          return (
            <div className="rounded-md bg-[rgb(var(--color-error-rgb)/0.1)] p-4 text-center">
              <p className="text-sm font-semibold text-(--color-error)">
                خطا در ثبت‌نام. لطفاً دوباره تلاش کنید.
              </p>
            </div>
          );
        }
        return (
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ایمیل خود را وارد کنید"
              aria-label="ایمیل خبرنامه"
              required
              className="flex-1 rounded-md border border-(--border-medium) bg-(--surface-1) px-4 py-2.5 text-sm text-(--text-primary) placeholder:text-(--text-muted) focus:outline-hidden focus:ring-2 focus:ring-primary focus:border-primary"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="rounded-md bg-primary px-5 py-2.5 text-sm font-bold text-(--text-inverted) hover:opacity-90 transition-opacity disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              {status === 'loading' ? 'در حال ثبت...' : 'عضویت'}
            </button>
          </form>
        );
      })()}
    </section>
  );
}
