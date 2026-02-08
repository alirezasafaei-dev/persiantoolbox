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
  const [storageUnavailable, setStorageUnavailable] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [state, setState] = useState<SaveState>('idle');

  const handleFailure = useCallback(
    (
      responseStatus: number,
      payload: {
        errors?: string[];
      },
      target: 'load' | 'save',
    ) => {
      const message = payload.errors?.[0] ?? 'درخواست تنظیمات با خطا مواجه شد.';
      const unavailable =
        responseStatus === 503 ||
        message.includes('DATABASE_URL') ||
        message.includes('site_settings');

      setStorageUnavailable(unavailable);
      if (target === 'load') {
        setLoadError(message);
      } else {
        setState('error');
        setSaveError(message);
      }
    },
    [],
  );

  const loadSettings = useCallback(async () => {
    setLoadError(null);
    setStorageUnavailable(false);
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/site-settings', { cache: 'no-store' });
      const payload = (await response.json()) as {
        ok?: boolean;
        settings?: PublicSiteSettings;
        errors?: string[];
      };
      if (!response.ok || !payload.ok || !payload.settings) {
        handleFailure(response.status, payload, 'load');
        return;
      }
      setSettings(payload.settings);
    } catch {
      setLoadError('بارگذاری تنظیمات با خطا مواجه شد.');
    } finally {
      setIsLoading(false);
    }
  }, [handleFailure]);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  const portfolioHint = useMemo(() => {
    return settings.portfolioUrl ? 'لینک فعال است.' : 'هنوز لینک نمونه‌کارها ثبت نشده (به‌زودی).';
  }, [settings.portfolioUrl]);

  const handleSave = async () => {
    if (isLoading || storageUnavailable) {
      return;
    }
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
      handleFailure(response.status, payload, 'save');
      return;
    }
    setStorageUnavailable(false);
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
          {isLoading && (
            <p className="text-sm text-[var(--text-muted)]" role="status">
              در حال بارگذاری تنظیمات...
            </p>
          )}
          {loadError && (
            <p className="text-sm text-[var(--color-danger)] bg-[rgb(var(--color-danger-rgb)/0.12)] rounded-[var(--radius-md)] px-4 py-3">
              {loadError}
            </p>
          )}
          {storageUnavailable && (
            <div
              className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] px-4 py-3 text-sm text-[var(--text-secondary)]"
              role="status"
            >
              ذخیره‌سازی دیتابیسی در دسترس نیست. برای نمایش لینک‌ها در فوتر از ENVها استفاده کنید:
              <span className="mt-2 block font-mono text-xs text-[var(--text-muted)]">
                DEVELOPER_NAME / DEVELOPER_BRAND_TEXT / ORDER_URL / PORTFOLIO_URL
              </span>
            </div>
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
            disabled={isLoading || storageUnavailable}
          />
          <Input
            label="متن برند"
            value={settings.developerBrandText}
            onChange={(event) =>
              setSettings((prev) => ({ ...prev, developerBrandText: event.target.value }))
            }
            placeholder="این وب‌سایت توسط ..."
            disabled={isLoading || storageUnavailable}
          />
          <Input
            label="لینک ثبت سفارش"
            value={settings.orderUrl ?? ''}
            onChange={(event) => setSettings((prev) => ({ ...prev, orderUrl: event.target.value }))}
            placeholder="https://..."
            disabled={isLoading || storageUnavailable}
          />
          <Input
            label="لینک نمونه‌کارها / سایت شخصی"
            value={settings.portfolioUrl ?? ''}
            onChange={(event) =>
              setSettings((prev) => ({ ...prev, portfolioUrl: event.target.value }))
            }
            placeholder="https://..."
            disabled={isLoading || storageUnavailable}
          />
        </div>

        <p className="text-xs text-[var(--text-muted)]">{portfolioHint}</p>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            onClick={handleSave}
            disabled={isLoading || state === 'saving' || storageUnavailable}
          >
            {state === 'saving' ? 'در حال ذخیره...' : 'ذخیره تنظیمات'}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => openLink(settings.orderUrl)}
            disabled={isLoading || !settings.orderUrl}
          >
            تست لینک سفارش
          </Button>
          <Button
            type="button"
            variant="tertiary"
            onClick={() => openLink(settings.portfolioUrl)}
            disabled={isLoading || !settings.portfolioUrl}
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
