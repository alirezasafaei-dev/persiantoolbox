'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button, Card } from '@/components/ui';
import Input from '@/shared/ui/Input';
import type { PublicSiteSettings } from '@/lib/siteSettings';

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

type SettingsHistoryEntry = {
  id: string;
  timestamp: string;
  section: string;
  field: string;
  oldValue: string;
  newValue: string;
  adminUser: string;
};

type ExtendedSettings = PublicSiteSettings & {
  telegramUrl: string;
  instagramUrl: string;
  twitterUrl: string;
  whatsappNumber: string;
  googleSearchConsole: string;
  zarinpalMerchantId: string;
  siteDescription: string;
  siteKeywords: string;
  defaultTheme: 'light' | 'dark' | 'auto';
  defaultLanguage: 'fa' | 'en';
  rtlMode: boolean;
  maintenanceMode: boolean;
  maintenanceMessage: string;
  analyticsEnabled: boolean;
  analyticsTrackingId: string;
  smtpHost: string;
  smtpPort: string;
  smtpUser: string;
  smtpPassword: string;
  smtpFromEmail: string;
  smtpFromName: string;
  backupEnabled: boolean;
  backupFrequency: 'daily' | 'weekly' | 'monthly';
  backupRetentionDays: number;
  backupLastRun: string;
};

const INITIAL_SETTINGS: ExtendedSettings = {
  developerName: 'تیم جعبه ابزار فارسی',
  developerBrandText: 'طراحی و نگهداری این سرویس توسط تیم جعبه ابزار فارسی انجام می‌شود.',
  companyName: 'ASDEV',
  orderUrl: null,
  portfolioUrl: null,
  telegramUrl: '',
  instagramUrl: '',
  twitterUrl: '',
  whatsappNumber: '',
  whatsappUrl: '',
  supportPageUrl: '/support',
  contactEmail: '',
  contactPhone: '',
  contactAddress: '',
  googleSearchConsole: '',
  zarinpalMerchantId: '',
  siteDescription: '',
  siteKeywords: '',
  defaultTheme: 'auto',
  defaultLanguage: 'fa',
  rtlMode: true,
  maintenanceMode: false,
  maintenanceMessage: 'سایت در حال به‌روزرسانی است. لطفاً بعداً مراجعه کنید.',
  analyticsEnabled: false,
  analyticsTrackingId: '',
  smtpHost: '',
  smtpPort: '587',
  smtpUser: '',
  smtpPassword: '',
  smtpFromEmail: '',
  smtpFromName: 'پیام خودکار جعبه ابزار فارسی',
  backupEnabled: false,
  backupFrequency: 'daily',
  backupRetentionDays: 30,
  backupLastRun: '',
};

const SETTINGS_HISTORY_KEY = 'admin_settings_history';

export default function SiteSettingsAdminPage() {
  const [settings, setSettings] = useState<ExtendedSettings>(INITIAL_SETTINGS);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [storageUnavailable, setStorageUnavailable] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [state, setState] = useState<SaveState>('idle');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [activeSection, setActiveSection] = useState<
    | 'general'
    | 'social'
    | 'contact'
    | 'seo'
    | 'api'
    | 'theme'
    | 'language'
    | 'maintenance'
    | 'analytics'
    | 'email'
    | 'backup'
    | 'history'
  >('general');
  const [settingsHistory, setSettingsHistory] = useState<SettingsHistoryEntry[]>([]);

  useEffect(() => {
    if (!hasUnsavedChanges) {
      return;
    }
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [hasUnsavedChanges]);

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

  useEffect(() => {
    try {
      const stored = localStorage.getItem(SETTINGS_HISTORY_KEY);
      if (stored) {
        setSettingsHistory(JSON.parse(stored) as SettingsHistoryEntry[]);
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  const logSettingsChange = useCallback(
    (section: string, field: string, oldValue: string, newValue: string) => {
      if (oldValue === newValue) {
        return;
      }
      const entry: SettingsHistoryEntry = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        timestamp: new Date().toISOString(),
        section,
        field,
        oldValue: oldValue || '(خالی)',
        newValue: newValue || '(خالی)',
        adminUser: 'ادمین',
      };
      setSettingsHistory((prev) => {
        const updated = [entry, ...prev].slice(0, 100);
        try {
          localStorage.setItem(SETTINGS_HISTORY_KEY, JSON.stringify(updated));
        } catch {
          // ignore storage errors
        }
        return updated;
      });
    },
    [],
  );

  const update = useCallback(
    (field: keyof ExtendedSettings, value: string, section: string) => {
      setSettings((prev) => {
        const oldVal = String(prev[field] ?? '');
        logSettingsChange(section, field, oldVal, value);
        return { ...prev, [field]: value };
      });
      setHasUnsavedChanges(true);
    },
    [logSettingsChange],
  );

  const updateBool = useCallback(
    (field: keyof ExtendedSettings, value: boolean, section: string) => {
      setSettings((prev) => {
        const oldVal = String(prev[field] ?? '');
        logSettingsChange(section, field, oldVal, String(value));
        return { ...prev, [field]: value };
      });
      setHasUnsavedChanges(true);
    },
    [logSettingsChange],
  );

  const updateNumber = useCallback(
    (field: keyof ExtendedSettings, value: number, section: string) => {
      setSettings((prev) => {
        const oldVal = String(prev[field] ?? '');
        logSettingsChange(section, field, oldVal, String(value));
        return { ...prev, [field]: value };
      });
      setHasUnsavedChanges(true);
    },
    [logSettingsChange],
  );

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
    setHasUnsavedChanges(false);
  };

  const sections = [
    { id: 'general' as const, label: 'عمومی', icon: '⚙️' },
    { id: 'social' as const, label: 'شبکه‌های اجتماعی', icon: '📱' },
    { id: 'contact' as const, label: 'اطلاعات تماس', icon: '📞' },
    { id: 'seo' as const, label: 'SEO و گوگل', icon: '🔍' },
    { id: 'api' as const, label: 'کلیدهای API', icon: '🔑' },
    { id: 'theme' as const, label: 'پوسته', icon: '🎨' },
    { id: 'language' as const, label: 'زبان و جهت', icon: '🌐' },
    { id: 'maintenance' as const, label: 'تعمیر و نگهداری', icon: '🔧' },
    { id: 'analytics' as const, label: 'آمار و تحلیل', icon: '📊' },
    { id: 'email' as const, label: 'ایمیل و SMTP', icon: '✉️' },
    { id: 'backup' as const, label: 'پشتیبان‌گیری', icon: '💾' },
    { id: 'history' as const, label: 'تاریخچه تغییرات', icon: '📋' },
  ];

  return (
    <div className="space-y-6">
      <section className="section-surface p-6 md:p-8">
        <h1 className="text-3xl md:text-4xl font-black text-[var(--text-primary)] mb-2">
          تنظیمات سایت
        </h1>
        <p className="text-[var(--text-secondary)]">
          مدیریت شبکه‌های اجتماعی، اطلاعات تماس، SEO، پوسته، زبان، تعمیر و نگهداری و کلیدهای API
        </p>
        {isLoading ? (
          <p className="text-sm text-[var(--text-muted)] mt-2" role="status">
            در حال بارگذاری...
          </p>
        ) : null}
        {loadError ? (
          <p className="text-sm text-[var(--color-danger)] bg-[rgb(var(--color-danger-rgb)/0.12)] rounded-[var(--radius-md)] px-4 py-3 mt-2">
            {loadError}
          </p>
        ) : null}
      </section>

      <Card className="p-2">
        <div className="flex flex-wrap gap-1" role="tablist">
          {sections.map((s) => (
            <button
              type="button"
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
              onChange={(e) => update('developerName', e.target.value, 'عمومی')}
              placeholder="تیم جعبه ابزار فارسی"
              disabled={isLoading || storageUnavailable}
            />
            <Input
              label="نام شرکت / برند"
              value={settings.companyName}
              onChange={(e) => update('companyName', e.target.value, 'عمومی')}
              placeholder="ASDEV"
              disabled={isLoading || storageUnavailable}
            />
            <Input
              label="متن برند"
              value={settings.developerBrandText}
              onChange={(e) => update('developerBrandText', e.target.value, 'عمومی')}
              placeholder="این وب‌سایت توسط ..."
              disabled={isLoading || storageUnavailable}
            />
            <Input
              label="لینک ثبت سفارش"
              value={settings.orderUrl ?? ''}
              onChange={(e) => update('orderUrl', e.target.value, 'عمومی')}
              placeholder="https://..."
              disabled={isLoading || storageUnavailable}
            />
            <Input
              label="لینک نمونه‌کارها / سایت شخصی"
              value={settings.portfolioUrl ?? ''}
              onChange={(e) => update('portfolioUrl', e.target.value, 'عمومی')}
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
              onChange={(e) => update('telegramUrl', e.target.value, 'شبکه‌های اجتماعی')}
              placeholder="https://t.me/..."
              disabled={isLoading || storageUnavailable}
            />
            <Input
              label="اینستاگرام"
              value={settings.instagramUrl}
              onChange={(e) => update('instagramUrl', e.target.value, 'شبکه‌های اجتماعی')}
              placeholder="https://instagram.com/..."
              disabled={isLoading || storageUnavailable}
            />
            <Input
              label="توییتر / X"
              value={settings.twitterUrl}
              onChange={(e) => update('twitterUrl', e.target.value, 'شبکه‌های اجتماعی')}
              placeholder="https://x.com/..."
              disabled={isLoading || storageUnavailable}
            />
            <Input
              label="واتساپ"
              value={settings.whatsappNumber}
              onChange={(e) => update('whatsappNumber', e.target.value, 'شبکه‌های اجتماعی')}
              placeholder="98912..."
              disabled={isLoading || storageUnavailable}
            />
            <Input
              label="لینک صفحه پشتیبانی"
              value={settings.supportPageUrl}
              onChange={(e) => update('supportPageUrl', e.target.value, 'شبکه‌های اجتماعی')}
              placeholder="/support"
              disabled={isLoading || storageUnavailable}
            />
          </div>
        )}

        {activeSection === 'contact' && (
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="ایمیل"
              value={settings.contactEmail}
              onChange={(e) => update('contactEmail', e.target.value, 'اطلاعات تماس')}
              placeholder="info@..."
              disabled={isLoading || storageUnavailable}
            />
            <Input
              label="تلفن"
              value={settings.contactPhone}
              onChange={(e) => update('contactPhone', e.target.value, 'اطلاعات تماس')}
              placeholder="021-..."
              disabled={isLoading || storageUnavailable}
            />
            <div className="md:col-span-2">
              <Input
                label="آدرس"
                value={settings.contactAddress}
                onChange={(e) => update('contactAddress', e.target.value, 'اطلاعات تماس')}
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
              onChange={(e) => update('siteDescription', e.target.value, 'SEO')}
              placeholder="توضیحات برای موتورهای جستجو"
              disabled={isLoading || storageUnavailable}
            />
            <Input
              label="کلمات کلیدی"
              value={settings.siteKeywords}
              onChange={(e) => update('siteKeywords', e.target.value, 'SEO')}
              placeholder="ابزار فارسی, تبدیل PDF, ..."
              disabled={isLoading || storageUnavailable}
            />
            <Input
              label="Google Search Console Verification"
              value={settings.googleSearchConsole}
              onChange={(e) => update('googleSearchConsole', e.target.value, 'SEO')}
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
              onChange={(e) => update('zarinpalMerchantId', e.target.value, 'API')}
              placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              disabled={isLoading || storageUnavailable}
            />
          </div>
        )}

        {activeSection === 'theme' && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-[var(--text-primary)]">تنظیمات پوسته</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[var(--text-primary)]">
                  پوسته پیش‌فرض
                </label>
                <select
                  value={settings.defaultTheme}
                  onChange={(e) =>
                    update('defaultTheme', e.target.value as 'light' | 'dark' | 'auto', 'پوسته')
                  }
                  disabled={isLoading || storageUnavailable}
                  className="w-full px-4 py-3 bg-[var(--surface-1)] border border-[var(--border-medium)] rounded-[var(--radius-md)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] transition-all"
                >
                  <option value="light">روشن</option>
                  <option value="dark">تاریک</option>
                  <option value="auto">خودکار (بر اساس سیستم)</option>
                </select>
              </div>
            </div>
            <div className="rounded-[var(--radius-lg)] bg-[var(--surface-2)] p-4">
              <p className="text-sm text-[var(--text-secondary)]">
                پوسته انتخاب شده برای کاربران جدید اعمال می‌شود. کاربران می‌توانند پوسته شخصی خود را
                انتخاب کنند.
              </p>
            </div>
          </div>
        )}

        {activeSection === 'language' && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-[var(--text-primary)]">تنظیمات زبان و جهت</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[var(--text-primary)]">
                  زبان پیش‌فرض
                </label>
                <select
                  value={settings.defaultLanguage}
                  onChange={(e) => update('defaultLanguage', e.target.value as 'fa' | 'en', 'زبان')}
                  disabled={isLoading || storageUnavailable}
                  className="w-full px-4 py-3 bg-[var(--surface-1)] border border-[var(--border-medium)] rounded-[var(--radius-md)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] transition-all"
                >
                  <option value="fa">فارسی</option>
                  <option value="en">انگلیسی</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[var(--text-primary)]">
                  جهت صفحه
                </label>
                <div className="flex items-center gap-4 h-[50px]">
                  <button
                    type="button"
                    onClick={() => updateBool('rtlMode', true, 'زبان')}
                    disabled={isLoading || storageUnavailable}
                    className={`flex-1 px-4 py-3 rounded-[var(--radius-md)] text-sm font-semibold border transition-all ${
                      settings.rtlMode
                        ? 'bg-[var(--color-primary)] text-[var(--text-inverted)] border-[var(--color-primary)]'
                        : 'bg-[var(--surface-1)] text-[var(--text-secondary)] border-[var(--border-medium)] hover:border-[var(--color-primary)]'
                    }`}
                  >
                    راست‌به‌چپ (RTL)
                  </button>
                  <button
                    type="button"
                    onClick={() => updateBool('rtlMode', false, 'زبان')}
                    disabled={isLoading || storageUnavailable}
                    className={`flex-1 px-4 py-3 rounded-[var(--radius-md)] text-sm font-semibold border transition-all ${
                      !settings.rtlMode
                        ? 'bg-[var(--color-primary)] text-[var(--text-inverted)] border-[var(--color-primary)]'
                        : 'bg-[var(--surface-1)] text-[var(--text-secondary)] border-[var(--border-medium)] hover:border-[var(--color-primary)]'
                    }`}
                  >
                    چپ‌به‌راست (LTR)
                  </button>
                </div>
              </div>
            </div>
            <div className="rounded-[var(--radius-lg)] bg-[var(--surface-2)] p-4">
              <p className="text-sm text-[var(--text-secondary)]">
                زبان و جهت پیش‌فرض برای بازدیدکنندگان جدید اعمال می‌شود. فارسی به صورت پیش‌فرض
                راست‌به‌چپ است.
              </p>
            </div>
          </div>
        )}

        {activeSection === 'maintenance' && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-[var(--text-primary)]">حالت تعمیر و نگهداری</h3>
            <div className="flex items-center justify-between p-4 rounded-[var(--radius-lg)] bg-[var(--surface-2)]">
              <div>
                <p className="font-semibold text-[var(--text-primary)]">فعال‌سازی حالت تعمیر</p>
                <p className="text-sm text-[var(--text-secondary)]">
                  با فعال شدن این گزینه، کاربران عادی قادر به مشاهده سایت نخواهند بود
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={settings.maintenanceMode}
                onClick={() =>
                  updateBool('maintenanceMode', !settings.maintenanceMode, 'تعمیر و نگهداری')
                }
                disabled={isLoading || storageUnavailable}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                  settings.maintenanceMode
                    ? 'bg-[var(--color-primary)]'
                    : 'bg-[var(--border-medium)]'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                    settings.maintenanceMode ? 'translate-x-8' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            {settings.maintenanceMode ? (
              <div className="rounded-[var(--radius-lg)] bg-[rgb(var(--color-warning-rgb)/0.1)] border border-[var(--color-warning)] p-4">
                <p className="text-sm font-semibold text-[var(--color-warning)] mb-1">
                  ⚠️ حالت تعمیر فعال است
                </p>
                <p className="text-sm text-[var(--text-secondary)]">
                  فقط کاربران ادمین می‌توانند سایت را مشاهده کنند
                </p>
              </div>
            ) : null}
            <div className="space-y-2">
              <Input
                label="پیام تعمیر و نگهداری"
                value={settings.maintenanceMessage}
                onChange={(e) => update('maintenanceMessage', e.target.value, 'تعمیر و نگهداری')}
                placeholder="سایت در حال به‌روزرسانی است..."
                disabled={isLoading || storageUnavailable}
              />
              <p className="text-sm text-[var(--text-muted)]">
                این پیام به کاربرانی که به سایت دسترسی دارند نمایش داده می‌شود
              </p>
            </div>
          </div>
        )}

        {activeSection === 'analytics' && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-[var(--text-primary)]">تنظیمات آمار و تحلیل</h3>
            <div className="flex items-center justify-between p-4 rounded-[var(--radius-lg)] bg-[var(--surface-2)]">
              <div>
                <p className="font-semibold text-[var(--text-primary)]">فعال‌سازی ردیابی آمار</p>
                <p className="text-sm text-[var(--text-secondary)]">
                  جمع‌آوری آمار بازدید و رفتار کاربران
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={settings.analyticsEnabled}
                onClick={() =>
                  updateBool('analyticsEnabled', !settings.analyticsEnabled, 'آمار و تحلیل')
                }
                disabled={isLoading || storageUnavailable}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                  settings.analyticsEnabled
                    ? 'bg-[var(--color-primary)]'
                    : 'bg-[var(--border-medium)]'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                    settings.analyticsEnabled ? 'translate-x-8' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            {settings.analyticsEnabled ? (
              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  label="Google Analytics Tracking ID"
                  value={settings.analyticsTrackingId}
                  onChange={(e) => update('analyticsTrackingId', e.target.value, 'آمار و تحلیل')}
                  placeholder="G-XXXXXXXXXX"
                  disabled={isLoading || storageUnavailable}
                />
              </div>
            ) : null}
            <div className="rounded-[var(--radius-lg)] bg-[var(--surface-2)] p-4">
              <p className="text-sm text-[var(--text-secondary)]">
                با فعال‌سازی آمار، اطلاعات بازدید صفحات، منابع ترافیک و رفتار کاربران جمع‌آوری
                می‌شود. این اطلاعات به بهبود سرویس کمک می‌کند.
              </p>
            </div>
          </div>
        )}

        {activeSection === 'email' && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-[var(--text-primary)]">تنظیمات ایمیل و SMTP</h3>
            <p className="text-sm text-[var(--text-secondary)]">
              پیکربندی سرور ایمیل برای ارسال نوتیفیکیشن‌ها و ایمیل‌های سیستم
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="آدرس SMTP"
                value={settings.smtpHost}
                onChange={(e) => update('smtpHost', e.target.value, 'ایمیل')}
                placeholder="smtp.example.com"
                disabled={isLoading || storageUnavailable}
              />
              <Input
                label="پورت SMTP"
                value={settings.smtpPort}
                onChange={(e) => update('smtpPort', e.target.value, 'ایمیل')}
                placeholder="587"
                disabled={isLoading || storageUnavailable}
              />
              <Input
                label="نام کاربری SMTP"
                value={settings.smtpUser}
                onChange={(e) => update('smtpUser', e.target.value, 'ایمیل')}
                placeholder="user@example.com"
                disabled={isLoading || storageUnavailable}
              />
              <Input
                label="رمز عبور SMTP"
                type="password"
                value={settings.smtpPassword}
                onChange={(e) => update('smtpPassword', e.target.value, 'ایمیل')}
                placeholder="••••••••"
                disabled={isLoading || storageUnavailable}
              />
              <Input
                label="ایمیل فرستنده"
                value={settings.smtpFromEmail}
                onChange={(e) => update('smtpFromEmail', e.target.value, 'ایمیل')}
                placeholder="noreply@persiantoolbox.ir"
                disabled={isLoading || storageUnavailable}
              />
              <Input
                label="نام فرستنده"
                value={settings.smtpFromName}
                onChange={(e) => update('smtpFromName', e.target.value, 'ایمیل')}
                placeholder="جعبه ابزار فارسی"
                disabled={isLoading || storageUnavailable}
              />
            </div>
            <div className="rounded-[var(--radius-lg)] bg-[var(--surface-2)] p-4">
              <p className="text-sm text-[var(--text-secondary)]">
                تنظیمات SMTP برای ارسال ایمیل‌های خودکار مانند تأیید ثبت‌نام، بازیابی رمز عبور و
                نوتیفیکیشن‌های سیستم استفاده می‌شود.
              </p>
            </div>
          </div>
        )}

        {activeSection === 'backup' && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-[var(--text-primary)]">تنظیمات پشتیبان‌گیری</h3>
            <div className="flex items-center justify-between p-4 rounded-[var(--radius-lg)] bg-[var(--surface-2)]">
              <div>
                <p className="font-semibold text-[var(--text-primary)]">پشتیبان‌گیری خودکار</p>
                <p className="text-sm text-[var(--text-secondary)]">
                  ذخیره خودکار نسخه پشتیبان از داده‌ها
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={settings.backupEnabled}
                onClick={() => updateBool('backupEnabled', !settings.backupEnabled, 'پشتیبان‌گیری')}
                disabled={isLoading || storageUnavailable}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                  settings.backupEnabled ? 'bg-[var(--color-primary)]' : 'bg-[var(--border-medium)]'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                    settings.backupEnabled ? 'translate-x-8' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            {settings.backupEnabled ? (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[var(--text-primary)]">
                    دوره پشتیبان‌گیری
                  </label>
                  <select
                    value={settings.backupFrequency}
                    onChange={(e) =>
                      update(
                        'backupFrequency',
                        e.target.value as 'daily' | 'weekly' | 'monthly',
                        'پشتیبان‌گیری',
                      )
                    }
                    disabled={isLoading || storageUnavailable}
                    className="w-full px-4 py-3 bg-[var(--surface-1)] border border-[var(--border-medium)] rounded-[var(--radius-md)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] transition-all"
                  >
                    <option value="daily">روزانه</option>
                    <option value="weekly">هفتگی</option>
                    <option value="monthly">ماهانه</option>
                  </select>
                </div>
                <Input
                  label="روزهای نگهداری پشتیبان"
                  type="number"
                  value={String(settings.backupRetentionDays)}
                  onChange={(e) =>
                    updateNumber(
                      'backupRetentionDays',
                      Number(e.target.value) || 30,
                      'پشتیبان‌گیری',
                    )
                  }
                  placeholder="30"
                  min={1}
                  max={365}
                  disabled={isLoading || storageUnavailable}
                />
              </div>
            ) : null}
            {settings.backupLastRun ? (
              <div className="rounded-[var(--radius-lg)] bg-[var(--surface-2)] p-4">
                <p className="text-sm text-[var(--text-secondary)]">
                  آخرین پشتیبان‌گیری:{' '}
                  <span className="font-mono text-[var(--text-primary)]">
                    {new Date(settings.backupLastRun).toLocaleDateString('fa-IR')}
                  </span>
                </p>
              </div>
            ) : null}
            <div className="rounded-[var(--radius-lg)] bg-[var(--surface-2)] p-4">
              <p className="text-sm text-[var(--text-secondary)]">
                فایل‌های پشتیبان شامل داده‌های کاربران، تنظیمات و محتوای سایت هستند. فایل‌های قدیمی
                بر اساس مدت نگهداری تعیین شده حذف می‌شوند.
              </p>
            </div>
          </div>
        )}

        {activeSection === 'history' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-[var(--text-primary)]">تاریخچه تغییرات</h3>
              {settingsHistory.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setSettingsHistory([]);
                    try {
                      localStorage.removeItem(SETTINGS_HISTORY_KEY);
                    } catch {
                      // ignore
                    }
                  }}
                  className="text-sm text-[var(--color-danger)] hover:underline"
                >
                  پاک کردن تاریخچه
                </button>
              )}
            </div>
            {settingsHistory.length === 0 ? (
              <div className="text-center py-12 rounded-[var(--radius-lg)] bg-[var(--surface-2)]">
                <p className="text-[var(--text-muted)]">هنوز تغییری ثبت نشده است</p>
                <p className="text-sm text-[var(--text-muted)] mt-1">
                  تغییرات تنظیمات در اینجا نمایش داده می‌شوند
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {settingsHistory.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-start gap-4 p-4 rounded-[var(--radius-md)] bg-[var(--surface-2)] border border-[var(--border-subtle)]"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-[var(--color-primary)] bg-[rgb(var(--color-primary-rgb)/0.1)] px-2 py-0.5 rounded">
                          {entry.section}
                        </span>
                        <span className="text-xs text-[var(--text-muted)]">{entry.field}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-[var(--color-danger)] line-through truncate max-w-[200px]">
                          {entry.oldValue}
                        </span>
                        <span className="text-[var(--text-muted)]">→</span>
                        <span className="text-[var(--color-success)] truncate max-w-[200px]">
                          {entry.newValue}
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-[var(--text-muted)] whitespace-nowrap">
                      {new Date(entry.timestamp).toLocaleDateString('fa-IR', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2 pt-2">
          <Button
            onClick={handleSave}
            disabled={isLoading || state === 'saving' || storageUnavailable}
          >
            {state === 'saving' ? 'در حال ذخیره...' : 'ذخیره تنظیمات'}
          </Button>
          {hasUnsavedChanges && state !== 'saving' ? (
            <span className="text-sm font-semibold text-[var(--color-warning)]">
              تغییرات ذخیره نشده
            </span>
          ) : null}
          {state === 'saved' && <p className="text-sm text-[var(--color-success)]">ذخیره شد.</p>}
          {saveError ? <p className="text-sm text-[var(--color-danger)]">{saveError}</p> : null}
        </div>
      </Card>
    </div>
  );
}
