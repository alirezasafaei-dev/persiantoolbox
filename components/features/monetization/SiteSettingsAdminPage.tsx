'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Card } from '@/components/ui';
import Input from '@/shared/ui/Input';
import type { PublicSiteSettings } from '@/lib/siteSettings';

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

const INITIAL_SETTINGS: PublicSiteSettings = {
  developerName: 'علیرضا صفایی',
  developerBrandText: 'این وب‌سایت توسط علیرضا صفایی توسعه داده شده است.',
  orderUrl: null,
  portfolioUrl: null,
};

function openLink(url: string | null) {
  if (!url) {
    return;
  }
  window.open(url, '_blank', 'noopener,noreferrer');
}

export default function SiteSettingsAdminPage() {
  const [settings, setSettings] = useState<PublicSiteSettings>(INITIAL_SETTINGS);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [state, setState] = useState<SaveState>('idle');

  const loadSettings = useCallback(async () => {
    setLoadError(null);
    const response = await fetch('/api/admin/site-settings', { cache: 'no-store' });
    const payload = (await response.json()) as {
      ok?: boolean;
      settings?: PublicSiteSettings;
      errors?: string[];
    };
    if (!response.ok || !payload.ok || !payload.settings) {
      setLoadError(payload.errors?.[0] ?? 'بارگذاری تنظیمات با خطا مواجه شد.');
      return;
    }
    setSettings(payload.settings);
  }, []);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  const portfolioHint = useMemo(() => {
    return settings.portfolioUrl ? 'لینک فعال است.' : 'هنوز لینک نمونه‌کارها ثبت نشده (به‌زودی).';
  }, [settings.portfolioUrl]);

  const handleSave = async () => {
    setState('saving');
    setSaveError(null);
    const response = await fetch('/api/admin/site-settings', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(settings),
    });
    const payload = (await response.json()) as {
      ok?: boolean;
      settings?: PublicSiteSettings;
      errors?: string[];
    };
    if (!response.ok || !payload.ok || !payload.settings) {
      setState('error');
      setSaveError(payload.errors?.[0] ?? 'ذخیره تنظیمات انجام نشد.');
      return;
    }
    setSettings(payload.settings);
    setState('saved');
  };

  return (
    <div className="space-y-8">
      <section className="section-surface p-6 md:p-8">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-light)] bg-[var(--surface-1)] px-4 py-2 text-xs font-semibold text-[var(--text-muted)]">
            تنظیمات معرفی توسعه‌دهنده
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-[var(--text-primary)]">
            مدیریت لینک ثبت سفارش و نمونه‌کارها
          </h1>
          <p className="text-[var(--text-secondary)] leading-7">
            این بخش برای نمایش پویا در فوتر استفاده می‌شود. با تغییر این مقادیر نیازی به تغییر کد UI
            ندارید.
          </p>
          {loadError && (
            <p className="text-sm text-[var(--color-danger)] bg-[rgb(var(--color-danger-rgb)/0.12)] rounded-[var(--radius-md)] px-4 py-3">
              {loadError}
            </p>
          )}
        </div>
      </section>

      <Card className="p-6 space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="نام توسعه‌دهنده"
            value={settings.developerName}
            onChange={(event) =>
              setSettings((prev) => ({ ...prev, developerName: event.target.value }))
            }
            placeholder="علیرضا صفایی"
          />
          <Input
            label="متن برند"
            value={settings.developerBrandText}
            onChange={(event) =>
              setSettings((prev) => ({ ...prev, developerBrandText: event.target.value }))
            }
            placeholder="این وب‌سایت توسط ..."
          />
          <Input
            label="لینک ثبت سفارش"
            value={settings.orderUrl ?? ''}
            onChange={(event) => setSettings((prev) => ({ ...prev, orderUrl: event.target.value }))}
            placeholder="https://..."
          />
          <Input
            label="لینک نمونه‌کارها / سایت شخصی"
            value={settings.portfolioUrl ?? ''}
            onChange={(event) =>
              setSettings((prev) => ({ ...prev, portfolioUrl: event.target.value }))
            }
            placeholder="https://..."
          />
        </div>

        <p className="text-xs text-[var(--text-muted)]">{portfolioHint}</p>

        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" onClick={handleSave} disabled={state === 'saving'}>
            {state === 'saving' ? 'در حال ذخیره...' : 'ذخیره تنظیمات'}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => openLink(settings.orderUrl)}
            disabled={!settings.orderUrl}
          >
            تست لینک سفارش
          </Button>
          <Button
            type="button"
            variant="tertiary"
            onClick={() => openLink(settings.portfolioUrl)}
            disabled={!settings.portfolioUrl}
          >
            تست لینک نمونه‌کارها
          </Button>
        </div>

        {state === 'saved' && (
          <p className="text-sm text-[var(--color-success)]">تنظیمات با موفقیت ذخیره شد.</p>
        )}
        {saveError && <p className="text-sm text-[var(--color-danger)]">{saveError}</p>}
      </Card>
    </div>
  );
}
