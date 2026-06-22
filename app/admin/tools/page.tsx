'use client';

import { useState } from 'react';
import Card from '@/shared/ui/Card';
import SearchInput from '@/shared/ui/SearchInput';
import Tag from '@/shared/ui/Tag';
import Toggle from '@/shared/ui/Toggle';

type Tool = {
  id: string;
  title: string;
  path: string;
  category: string;
  enabled: boolean;
};

const defaultTools: Tool[] = [
  {
    id: 'merge-pdf',
    title: 'ادغام PDF',
    path: '/pdf-tools/merge/merge-pdf',
    category: 'PDF',
    enabled: true,
  },
  {
    id: 'split-pdf',
    title: 'تقسیم PDF',
    path: '/pdf-tools/split/split-pdf',
    category: 'PDF',
    enabled: true,
  },
  {
    id: 'compress-pdf',
    title: 'فشرده‌سازی PDF',
    path: '/pdf-tools/compress/compress-pdf',
    category: 'PDF',
    enabled: true,
  },
  {
    id: 'encrypt-pdf',
    title: 'رمزگذاری PDF',
    path: '/pdf-tools/security/encrypt-pdf',
    category: 'PDF',
    enabled: true,
  },
  {
    id: 'decrypt-pdf',
    title: 'حذف رمز PDF',
    path: '/pdf-tools/security/decrypt-pdf',
    category: 'PDF',
    enabled: true,
  },
  {
    id: 'image-to-pdf',
    title: 'تصویر به PDF',
    path: '/pdf-tools/convert/image-to-pdf',
    category: 'PDF',
    enabled: true,
  },
  {
    id: 'word-to-pdf',
    title: 'Word به PDF',
    path: '/pdf-tools/convert/word-to-pdf',
    category: 'PDF',
    enabled: true,
  },
  {
    id: 'pdf-to-image',
    title: 'PDF به تصویر',
    path: '/pdf-tools/convert/pdf-to-image',
    category: 'PDF',
    enabled: true,
  },
  {
    id: 'pdf-to-text',
    title: 'PDF به متن',
    path: '/pdf-tools/convert/pdf-to-text',
    category: 'PDF',
    enabled: true,
  },
  {
    id: 'extract-text',
    title: 'استخراج متن',
    path: '/pdf-tools/extract/extract-text',
    category: 'PDF',
    enabled: true,
  },
  {
    id: 'extract-pages',
    title: 'استخراج صفحات',
    path: '/pdf-tools/extract/extract-pages',
    category: 'PDF',
    enabled: true,
  },
  {
    id: 'rotate-pages',
    title: 'چرخش صفحات',
    path: '/pdf-tools/edit/rotate-pages',
    category: 'PDF',
    enabled: true,
  },
  {
    id: 'reorder-pages',
    title: 'جابجایی صفحات',
    path: '/pdf-tools/edit/reorder-pages',
    category: 'PDF',
    enabled: true,
  },
  {
    id: 'delete-pages',
    title: 'حذف صفحات',
    path: '/pdf-tools/edit/delete-pages',
    category: 'PDF',
    enabled: true,
  },
  {
    id: 'add-page-numbers',
    title: 'افزودن شماره صفحه',
    path: '/pdf-tools/paginate/add-page-numbers',
    category: 'PDF',
    enabled: true,
  },
  {
    id: 'add-watermark',
    title: 'واترمارک',
    path: '/pdf-tools/watermark/add-watermark',
    category: 'PDF',
    enabled: true,
  },
  {
    id: 'resize-image',
    title: 'تغییر اندازه تصویر',
    path: '/image-tools/resize-image',
    category: 'تصویر',
    enabled: true,
  },
  {
    id: 'rotate-image',
    title: 'چرخش تصویر',
    path: '/image-tools/rotate-image',
    category: 'تصویر',
    enabled: true,
  },
  {
    id: 'text-on-image',
    title: 'افزودن متن به تصویر',
    path: '/image-tools/text-on-image',
    category: 'تصویر',
    enabled: true,
  },
  {
    id: 'image-format-converter',
    title: 'تبدیل فرمت تصویر',
    path: '/image-tools/image-format-converter',
    category: 'تصویر',
    enabled: true,
  },
  {
    id: 'image-background-remover',
    title: 'برش تصویر',
    path: '/image-tools/image-background-remover',
    category: 'تصویر',
    enabled: true,
  },
  {
    id: 'shamsi-gregorian',
    title: 'تبدیل تاریخ',
    path: '/date-tools/shamsi-gregorian',
    category: 'تاریخ',
    enabled: true,
  },
  {
    id: 'date-difference',
    title: 'اختلاف تاریخ',
    path: '/date-tools/date-difference',
    category: 'تاریخ',
    enabled: true,
  },
  {
    id: 'persian-calendar',
    title: 'تقویم فارسی',
    path: '/date-tools/persian-calendar',
    category: 'تاریخ',
    enabled: true,
  },
  {
    id: 'event-reminder',
    title: 'یادآوری رویدادها',
    path: '/date-tools/event-reminder',
    category: 'تاریخ',
    enabled: true,
  },
  {
    id: 'word-counter',
    title: 'شمارنده کلمات',
    path: '/text-tools/word-counter',
    category: 'متنی',
    enabled: true,
  },
  {
    id: 'number-converter',
    title: 'تبدیل اعداد',
    path: '/text-tools/number-converter',
    category: 'متنی',
    enabled: true,
  },
  {
    id: 'remove-spaces',
    title: 'حذف فاصله',
    path: '/text-tools/remove-spaces',
    category: 'متنی',
    enabled: true,
  },
  {
    id: 'case-converter',
    title: 'تبدیل حروف',
    path: '/text-tools/case-converter',
    category: 'متنی',
    enabled: true,
  },
  {
    id: 'extract-info',
    title: 'استخراج اطلاعات',
    path: '/text-tools/extract-info',
    category: 'متنی',
    enabled: true,
  },
  {
    id: 'address-fa-to-en',
    title: 'تبدیل آدرس',
    path: '/text-tools/address-fa-to-en',
    category: 'متنی',
    enabled: true,
  },
  {
    id: 'json-formatter',
    title: 'فرمت‌بندی JSON',
    path: '/tools/json-formatter',
    category: 'توسعه',
    enabled: true,
  },
  {
    id: 'hash-generator',
    title: 'تولید هش',
    path: '/tools/hash-generator',
    category: 'توسعه',
    enabled: true,
  },
  {
    id: 'base64-tool',
    title: 'Base64',
    path: '/tools/base64-tool',
    category: 'توسعه',
    enabled: true,
  },
  {
    id: 'persian-ocr',
    title: 'OCR فارسی',
    path: '/tools/persian-ocr',
    category: 'تصویر',
    enabled: true,
  },
  {
    id: 'image-to-qr',
    title: 'تولید QR Code',
    path: '/validation-tools/image-to-qr',
    category: 'اعتبارسنجی',
    enabled: true,
  },
  {
    id: 'persian-password',
    title: 'تولید رمز عبور',
    path: '/validation-tools/persian-password',
    category: 'اعتبارسنجی',
    enabled: true,
  },
  { id: 'salary', title: 'محاسبه حقوق', path: '/salary', category: 'مالی', enabled: true },
  { id: 'loan', title: 'محاسبه وام', path: '/loan', category: 'مالی', enabled: true },
  { id: 'interest', title: 'محاسبه سود', path: '/interest', category: 'مالی', enabled: true },
  {
    id: 'currency-converter',
    title: 'مبدل ارز',
    path: '/tools/currency-converter',
    category: 'مالی',
    enabled: true,
  },
  {
    id: 'inflation-calculator',
    title: 'محاسبه تورم',
    path: '/tools/inflation-calculator',
    category: 'مالی',
    enabled: true,
  },
  {
    id: 'investment-calculator',
    title: 'محاسبه سرمایه‌گذاری',
    path: '/tools/investment-calculator',
    category: 'مالی',
    enabled: true,
  },
  {
    id: 'tax-calculator',
    title: 'محاسبه مالیات',
    path: '/tools/tax-calculator',
    category: 'مالی',
    enabled: true,
  },
  {
    id: 'bank-rate-comparator',
    title: 'مقایسه نرخ بانک‌ها',
    path: '/tools/bank-rate-comparator',
    category: 'مالی',
    enabled: true,
  },
  {
    id: 'living-cost',
    title: 'هزینه زندگی',
    path: '/tools/living-cost',
    category: 'مالی',
    enabled: true,
  },
  {
    id: 'insurance-calculator',
    title: 'محاسبه بیمه',
    path: '/tools/insurance-calculator',
    category: 'مالی',
    enabled: true,
  },
  {
    id: 'bonus-calculator',
    title: 'محاسبه عیدانه',
    path: '/tools/bonus-calculator',
    category: 'مالی',
    enabled: true,
  },
  {
    id: 'severance-calculator',
    title: 'محاسبه سنوات',
    path: '/tools/severance-calculator',
    category: 'مالی',
    enabled: true,
  },
  {
    id: 'leave-calculator',
    title: 'محاسبه مرخصی',
    path: '/tools/leave-calculator',
    category: 'مالی',
    enabled: true,
  },
  {
    id: 'real-purchasing-power',
    title: 'قدرت خرید',
    path: '/tools/real-purchasing-power',
    category: 'مالی',
    enabled: true,
  },
  {
    id: 'overtime-calculator',
    title: 'محاسبه اضافه‌کاری',
    path: '/tools/overtime-calculator',
    category: 'مالی',
    enabled: true,
  },
  {
    id: 'rent-vs-buy',
    title: 'اجاره در مقابل خرید',
    path: '/tools/rent-vs-buy',
    category: 'مالی',
    enabled: true,
  },
  {
    id: 'loan-vs-investment',
    title: 'وام در مقابل سرمایه‌گذاری',
    path: '/tools/loan-vs-investment',
    category: 'مالی',
    enabled: true,
  },
  {
    id: 'retirement-calculator',
    title: 'بازنشستگی',
    path: '/tools/retirement-calculator',
    category: 'مالی',
    enabled: true,
  },
];

const categoryColors: Record<string, 'primary' | 'success' | 'warning' | 'danger' | 'default'> = {
  PDF: 'primary',
  تصویر: 'success',
  تاریخ: 'warning',
  متنی: 'default',
  توسعه: 'danger',
  اعتبارسنجی: 'primary',
  مالی: 'success',
};

export default function ToolsPage() {
  const [tools, setTools] = useState<Tool[]>(defaultTools);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const categories = ['all', ...new Set(tools.map((t) => t.category))];

  const filtered = tools.filter((t) => {
    const matchSearch = t.title.includes(search) || t.id.includes(search);
    const matchCategory = filterCategory === 'all' || t.category === filterCategory;
    return matchSearch && matchCategory;
  });

  const toggleTool = (id: string) => {
    setTools((prev) => prev.map((t) => (t.id === id ? { ...t, enabled: !t.enabled } : t)));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[var(--text-primary)]">مدیریت ابزارها</h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          {tools.filter((t) => t.enabled).length} از {tools.length} ابزار فعال است
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="جستجوی ابزارها..."
          className="max-w-xs"
        />
        <div className="flex gap-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                filterCategory === cat
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'bg-[var(--surface-2)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              {cat === 'all' ? 'همه' : cat}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {filtered.map((tool) => (
          <Card key={tool.id} className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Tag variant={categoryColors[tool.category] ?? 'default'}>{tool.category}</Tag>
              <div>
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">{tool.title}</h3>
                <p className="font-mono text-xs text-[var(--text-muted)]" dir="ltr">
                  {tool.path}
                </p>
              </div>
            </div>
            <Toggle checked={tool.enabled} onChange={() => toggleTool(tool.id)} />
          </Card>
        ))}
      </div>
    </div>
  );
}
