'use client';

import type { NotificationPrefs } from './account-utils';

interface NotificationSettingsProps {
  notifPrefs: NotificationPrefs;
  toggleNotifPref: (key: keyof NotificationPrefs) => Promise<void>;
  pushSupported: boolean;
  pushLoading: boolean;
}

function ToggleSwitch({
  checked,
  onChange,
  disabled,
  label,
  description,
}: {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
  label: string;
  description?: string;
}) {
  return (
    <label className="flex items-center justify-between gap-3 cursor-pointer">
      <div className="flex-1">
        <span className="text-sm text-[var(--text-primary)]">{label}</span>
        {description ? (
          <p className="text-xs text-[var(--text-muted)] mt-0.5">{description}</p>
        ) : null}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        disabled={disabled}
        className={`relative inline-flex h-8 w-14 shrink-0 items-center rounded-full transition-colors duration-[var(--motion-fast)] ${
          checked ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-secondary)]'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <span
          className={`inline-block h-5 w-5 rounded-full bg-white transition-transform duration-[var(--motion-fast)] ${
            checked ? 'translate-x-8 rtl:-translate-x-8' : 'translate-x-1 rtl:-translate-x-1'
          }`}
        />
      </button>
    </label>
  );
}

export default function NotificationSettings({
  notifPrefs,
  toggleNotifPref,
  pushSupported,
  pushLoading,
}: NotificationSettingsProps) {
  return (
    <section className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-5">
      <h3 className="text-lg font-bold text-[var(--text-primary)] mb-3">تنظیمات اعلان‌ها</h3>
      <div className="space-y-3">
        {pushSupported ? (
          <ToggleSwitch
            checked={notifPrefs.pushNotifications}
            onChange={() => void toggleNotifPref('pushNotifications')}
            disabled={pushLoading}
            label="اعلان‌های فشاری (Push)"
            description="دریافت اعلان‌های فوری در مرورگر"
          />
        ) : null}
        {!pushSupported && (
          <div className="text-xs text-[var(--text-muted)] bg-[var(--surface-2)] rounded-[var(--radius-md)] p-3">
            مرورگر شما از اعلان‌های فشاری پشتیبانی نمی‌کند.
          </div>
        )}
        <ToggleSwitch
          checked={notifPrefs.emailNotifications}
          onChange={() => void toggleNotifPref('emailNotifications')}
          label="اعلان‌های ایمیلی"
        />
        <ToggleSwitch
          checked={notifPrefs.historyReminders}
          onChange={() => void toggleNotifPref('historyReminders')}
          label="یادآوری تاریخچه"
        />
      </div>
    </section>
  );
}
