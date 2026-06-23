'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button, Card } from '@/components/ui';
import Input from '@/shared/ui/Input';
import type { PublicSiteSettings } from '@/lib/siteSettings';

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

type ExtendedSettings = PublicSiteSettings & {
  telegramUrl: string;
  instagramUrl: string;
  twitterUrl: string;
  whatsappNumber: string;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  googleSearchConsole: string;
  zarinpalMerchantId: string;
  siteDescription: string;
  siteKeywords: string;
};

const INITIAL_SETTINGS: ExtendedSettings = {
  developerName: 'تیم جعبه ابزار فارسی',
  developerBrandText: 'طراحی و نگهداری این سرویس توسط تیم جعبه ابزار فارسی انجام می‌شود.',
  orderUrl: null,
  portfolioUrl: null,
  telegramUrl: '',
  instagramUrl: '',
  twitterUrl: '',
  whatsappNumber: '',
  contactEmail: '',
  contactPhone: '',
  contactAddress: '',
  googleSearchConsole: '',
  zarinpalMerchantId: '',
  siteDescription: '',
  siteKeywords: '',
};

export default function SiteSettingsAdminPage() {
  const [settings, setSettings] = useState<ExtendedSettings>(INITIAL_SETTINGS);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [storageUnavailable, setStorageUnavailable] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [state, setState] = useState<SaveState>('idle');
  const [activeSection, setActiveSection] = useState<
    'general' | 'social' | 'contact' | 'seo' | 'api'
  >('general');

  const handleFailure = useCallback(
    (responseStatus: number, payload: { errors?: string[] }, target: 'load' | 'save') => {
      const message = payload.errors?.[0] ?? 'درخواست تنظیمات با خطا مواجه شد.';
      const unavailable = responseStatus === 503 || message.includes('DATABASE_URL');
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
      setSettings((prev) => ({ ...prev, ...payload.settings }));
    } catch {
      setLoadError('بارگذاری تنظیمات با خطا مواجه شد.');
    } finally {
      setIsLoading(false);
    }
  }, [handleFailure]);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

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
    setState('saved');
  };

  const update = (field: keyof ExtendedSettings, value: string) =>
    setSettings((prev) => ({ ...prev, [field]: value }));

  const sections = [
    { id: 'general' as const, label: 'عمومی', icon: '⚙️' },
    { id: 'social' as const, label: 'شبکه‌های اجتماعی', icon: '📱' },
    { id: 'contact' as const, label: 'اطلاعات تماس', icon: '📞' },
    { id: 'seo' as const, label: 'SEO و گوگل', icon: '🔍' },
    { id: 'api' as const, label: 'کلیدهای API', icon: '🔑' },
  ];

  return (
    <div className="space-y-6">
      <section className="section-surface p-6 md:p-8">
        <h1 className="text-3xl md:text-4xl font-black text-[var(--text-primary)] mb-2">
          تنظیمات سایت
        </h1>
        <p className="text-[var(--text-secondary)]">
          مدیریت شبکه‌های اجتماعی، اطلاعات تماس، SEO و کلیدهای API
        </p>
        {isLoading && (
          <p className="text-sm text-[var(--text-muted)] mt-2" role="status">
            در حال بارگذاری...
          </p>
        )}
        {loadError && (
          <p className="text-sm text-[var(--color-danger)] bg-[rgb(var(--color-danger-rgb)/0.12)] rounded-[var(--radius-md)] px-4 py-3 mt-2">
            {loadError}
          </p>
        )}
      </section>

      <Card className="p-2">
        <div className="flex flex-wrap gap-1" role="tablist">
          {sections.map((s) => (
            <button
              key={s.id}
              role="tab"
              aria-selected={activeSection === s.id}
              onClick={() => setActiveSection(s.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-[var(--radius-md)] text-sm font-semibold transition-all ${
                activeSection === s.id
                  ? 'bg-[var(--color-primary)] text-[var(--text-inverted)] shadow-[var(--shadow-medium)]'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--surface-2)]'
              }`}
            >
              <span>{s.icon}</span>
              <span>{s.label}</span>
            </button>
          ))}
        </div>
      </Card>

      <Card className="p-6 space-y-4">
        {activeSection === 'general' && (
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="نام توسعه‌دهنده"
              value={settings.developerName}
              onChange={(e) => update('developerName', e.target.value)}
              placeholder="تیم جعبه ابزار فارسی"
              disabled={isLoading || storageUnavailable}
            />
            <Input
              label="متن برند"
              value={settings.developerBrandText}
              onChange={(e) => update('developerBrandText', e.target.value)}
              placeholder="این وب‌سایت توسط ..."
              disabled={isLoading || storageUnavailable}
            />
            <Input
              label="لینک ثبت سفارش"
              value={settings.orderUrl ?? ''}
              onChange={(e) => update('orderUrl', e.target.value)}
              placeholder="https://..."
              disabled={isLoading || storageUnavailable}
            />
            <Input
              label="لینک نمونه‌کارها / سایت شخصی"
              value={settings.portfolioUrl ?? ''}
              onChange={(e) => update('portfolioUrl', e.target.value)}
              placeholder="https://..."
              disabled={isLoading || storageUnavailable}
            />
          </div>
        )}

        {activeSection === 'social' && (
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="تلگرام"
              value={settings.telegramUrl}
              onChange={(e) => update('telegramUrl', e.target.value)}
              placeholder="https://t.me/..."
              disabled={isLoading || storageUnavailable}
            />
            <Input
              label="اینستاگرام"
              value={settings.instagramUrl}
              onChange={(e) => update('instagramUrl', e.target.value)}
              placeholder="https://instagram.com/..."
              disabled={isLoading || storageUnavailable}
            />
            <Input
              label="توییتر / X"
              value={settings.twitterUrl}
              onChange={(e) => update('twitterUrl', e.target.value)}
              placeholder="https://x.com/..."
              disabled={isLoading || storageUnavailable}
            />
            <Input
              label="واتساپ"
              value={settings.whatsappNumber}
              onChange={(e) => update('whatsappNumber', e.target.value)}
              placeholder="98912..."
              disabled={isLoading || storageUnavailable}
            />
          </div>
        )}

        {activeSection === 'contact' && (
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="ایمیل"
              value={settings.contactEmail}
              onChange={(e) => update('contactEmail', e.target.value)}
              placeholder="info@..."
              disabled={isLoading || storageUnavailable}
            />
            <Input
              label="تلفن"
              value={settings.contactPhone}
              onChange={(e) => update('contactPhone', e.target.value)}
              placeholder="021-..."
              disabled={isLoading || storageUnavailable}
            />
            <div className="md:col-span-2">
              <Input
                label="آدرس"
                value={settings.contactAddress}
                onChange={(e) => update('contactAddress', e.target.value)}
                placeholder="آدرس دفتر..."
                disabled={isLoading || storageUnavailable}
              />
            </div>
          </div>
        )}

        {activeSection === 'seo' && (
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="توضیحات سایت"
              value={settings.siteDescription}
              onChange={(e) => update('siteDescription', e.target.value)}
              placeholder="توضیحات برای موتورهای جستجو"
              disabled={isLoading || storageUnavailable}
            />
            <Input
              label="کلمات کلیدی"
              value={settings.siteKeywords}
              onChange={(e) => update('siteKeywords', e.target.value)}
              placeholder="ابزار فارسی, تبدیل PDF, ..."
              disabled={isLoading || storageUnavailable}
            />
            <Input
              label="Google Search Console Verification"
              value={settings.googleSearchConsole}
              onChange={(e) => update('googleSearchConsole', e.target.value)}
              placeholder="کد تأیید گوگل"
              disabled={isLoading || storageUnavailable}
            />
          </div>
        )}

        {activeSection === 'api' && (
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="زرین‌پال Merchant ID"
              value={settings.zarinpalMerchantId}
              onChange={(e) => update('zarinpalMerchantId', e.target.value)}
              placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              disabled={isLoading || storageUnavailable}
            />
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2 pt-2">
          <Button
            onClick={handleSave}
            disabled={isLoading || state === 'saving' || storageUnavailable}
          >
            {state === 'saving' ? 'در حال ذخیره...' : 'ذخیره تنظیمات'}
          </Button>
          {state === 'saved' && <p className="text-sm text-[var(--color-success)]">ذخیره شد.</p>}
          {saveError && <p className="text-sm text-[var(--color-danger)]">{saveError}</p>}
        </div>
      </Card>
    </div>
  );
}
