'use client';

import { useState } from 'react';
import { Button } from '@/components/ui';

export default function ChangePasswordSection() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showForm, setShowForm] = useState(false);

  const handleChangePassword = async () => {
    setMessage(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage({ type: 'error', text: 'تمام فیلدها الزامی هستند.' });
      return;
    }

    if (newPassword.length < 8) {
      setMessage({ type: 'error', text: 'رمز عبور جدید باید حداقل ۸ کاراکتر باشد.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'رمز عبور جدید و تکرار آن مطابقت ندارند.' });
      return;
    }

    if (currentPassword === newPassword) {
      setMessage({ type: 'error', text: 'رمز عبور جدید باید با رمز فعلی متفاوت باشد.' });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = (await response.json()) as { ok?: boolean; error?: string; message?: string };
      if (response.ok && data.ok) {
        setMessage({ type: 'success', text: data.message ?? 'رمز عبور با موفقیت تغییر کرد.' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setShowForm(false);
      } else {
        setMessage({ type: 'error', text: data.error ?? 'خطا در تغییر رمز عبور.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'خطا در ارتباط با سرور.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-[var(--text-primary)]">تغییر رمز عبور</h3>
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="text-sm font-semibold text-[var(--color-primary)] hover:underline"
        >
          {showForm ? 'انصراف' : 'تغییر رمز عبور'}
        </button>
      </div>

      {showForm ? (
        <div className="mt-4 space-y-4">
          <div>
            <label
              htmlFor="current-password"
              className="block mb-1 text-sm font-semibold text-[var(--text-primary)]"
            >
              رمز عبور فعلی
            </label>
            <input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--bg-primary)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50"
              placeholder="رمز عبور فعلی خود را وارد کنید"
            />
          </div>
          <div>
            <label
              htmlFor="new-password"
              className="block mb-1 text-sm font-semibold text-[var(--text-primary)]"
            >
              رمز عبور جدید
            </label>
            <input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--bg-primary)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50"
              placeholder="حداقل ۸ کاراکتر"
            />
          </div>
          <div>
            <label
              htmlFor="confirm-password"
              className="block mb-1 text-sm font-semibold text-[var(--text-primary)]"
            >
              تکرار رمز عبور جدید
            </label>
            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--bg-primary)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50"
              placeholder="رمز عبور جدید را دوباره وارد کنید"
            />
          </div>

          {message ? (
            <p
              role="status"
              className={`text-sm font-semibold ${
                message.type === 'success'
                  ? 'text-[var(--color-success)]'
                  : 'text-[var(--color-danger)]'
              }`}
            >
              {message.text}
            </p>
          ) : null}

          <Button
            type="button"
            onClick={handleChangePassword}
            isLoading={loading}
            className="w-full sm:w-auto"
          >
            {loading ? 'در حال تغییر...' : 'تغییر رمز عبور'}
          </Button>
        </div>
      ) : null}
    </section>
  );
}
