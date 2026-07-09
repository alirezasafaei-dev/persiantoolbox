'use client';

import { useState } from 'react';
import { Card } from '@/components/ui';
import { useToast } from '@/shared/ui/toast-context';
import { buildLocalBusinessJsonLd } from '@/lib/seo-utils';

export default function LocalBusinessSchema() {
  const [form, setForm] = useState({
    name: '',
    url: '',
    telephone: '',
    address: '',
    city: '',
    region: '',
    postalCode: '',
    country: 'ایران',
    openingHours: '',
  });
  const [json, setJson] = useState('');
  const [error, setError] = useState('');
  const { showToast } = useToast();

  const set = (key: keyof typeof form, value: string) => setForm({ ...form, [key]: value });

  const gen = () => {
    if (!form.name.trim()) {
      setError('نام کسب‌وکار الزامی است.');
      return;
    }
    setError('');
    const j = buildLocalBusinessJsonLd(form);
    setJson(JSON.stringify(j, null, 2));
  };
  const copy = () => {
    navigator.clipboard.writeText(json);
    showToast('کپی شد');
  };
  const reset = () => {
    setForm({
      name: '',
      url: '',
      telephone: '',
      address: '',
      city: '',
      region: '',
      postalCode: '',
      country: 'ایران',
      openingHours: '',
    });
    setJson('');
    setError('');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6" dir="rtl">
      <h1 className="text-3xl font-bold">مولد Schema کسب‌وکار محلی</h1>
      <Card className="p-6 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
        <input
          value={form.name}
          onChange={(e) => set('name', e.target.value)}
          placeholder="نام کسب‌وکار *"
          className="p-2 border rounded col-span-2"
          aria-label="نام کسب‌وکار"
        />
        <input
          value={form.url}
          onChange={(e) => set('url', e.target.value)}
          placeholder="وبسایت"
          className="p-2 border rounded"
          aria-label="آدرس وبسایت"
        />
        <input
          value={form.telephone}
          onChange={(e) => set('telephone', e.target.value)}
          placeholder="تلفن"
          className="p-2 border rounded"
          aria-label="شماره تلفن"
        />
        <input
          value={form.address}
          onChange={(e) => set('address', e.target.value)}
          placeholder="آدرس خیابان"
          className="p-2 border rounded col-span-2"
          aria-label="آدرس خیابان"
        />
        <input
          value={form.city}
          onChange={(e) => set('city', e.target.value)}
          placeholder="شهر"
          className="p-2 border rounded"
          aria-label="شهر"
        />
        <input
          value={form.region}
          onChange={(e) => set('region', e.target.value)}
          placeholder="استان"
          className="p-2 border rounded"
          aria-label="استان"
        />
        <input
          value={form.postalCode}
          onChange={(e) => set('postalCode', e.target.value)}
          placeholder="کد پستی"
          className="p-2 border rounded"
          aria-label="کد پستی"
        />
        <input
          value={form.openingHours}
          onChange={(e) => set('openingHours', e.target.value)}
          placeholder="ساعات کاری (09:00-18:00)"
          className="p-2 border rounded"
          aria-label="ساعات کاری"
        />
        {error ? <div className="col-span-2 text-sm text-red-600">{error}</div> : null}
        <div className="col-span-2 flex gap-2 pt-2">
          <button
            type="button"
            onClick={gen}
            className="px-5 py-2 bg-[var(--color-primary)] text-[var(--text-inverted)] rounded"
          >
            تولید JSON-LD
          </button>
          <button type="button" onClick={reset} className="px-4 border rounded">
            ریست
          </button>
        </div>
      </Card>
      {json ? (
        <Card className="p-4">
          <pre className="text-xs overflow-auto bg-[var(--surface-2)] p-3 rounded">{json}</pre>
          <button type="button" onClick={copy} className="mt-2 px-3 py-1 border rounded text-sm">
            کپی
          </button>
          <div className="text-xs mt-1 text-[var(--text-muted)]">
            اعتبار حقوقی ندارد. فقط پیش‌نویس.
          </div>
        </Card>
      ) : null}
    </div>
  );
}
