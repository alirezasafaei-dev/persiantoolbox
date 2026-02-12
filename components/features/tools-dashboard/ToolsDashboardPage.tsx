'use client';

import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';
import ToolCard from '@/shared/ui/ToolCard';
import { EmptyState } from '@/components/ui';
import {
  IconPdf,
  IconImage,
  IconCalendar,
  IconZap,
  IconShield,
  IconCalculator,
  IconMoney,
} from '@/shared/ui/icons';

type ToolCategory = 'all' | 'pdf' | 'image' | 'date' | 'text' | 'validation' | 'finance';

type ToolItem = {
  id: string;
  title: string;
  description: string;
  path: string;
  category: ToolCategory;
  meta?: string;
  icon: ReactNode;
  iconWrapClassName?: string;
};

const tools: ToolItem[] = [
  {
    id: 'pdf',
    title: 'ابزارهای PDF',
    description: 'تبدیل، فشرده‌سازی، ادغام، استخراج و ویرایش صفحات',
    path: '/pdf-tools',
    category: 'pdf',
    meta: '۱۲ ابزار',
    icon: <IconPdf className="h-7 w-7 text-[var(--color-danger)]" />,
    iconWrapClassName: 'bg-[rgb(var(--color-danger-rgb)/0.12)]',
  },
  {
    id: 'image',
    title: 'ابزارهای تصویر',
    description: 'فشرده‌سازی و تبدیل تصاویر با کنترل کیفیت',
    path: '/image-tools',
    category: 'image',
    meta: '۳ ابزار',
    icon: <IconImage className="h-7 w-7 text-[var(--color-info)]" />,
    iconWrapClassName: 'bg-[rgb(var(--color-info-rgb)/0.12)]',
  },
  {
    id: 'date',
    title: 'ابزارهای تاریخ',
    description: 'تبدیل شمسی/میلادی/قمری، سن و اختلاف تاریخ',
    path: '/date-tools',
    category: 'date',
    meta: '۵ ابزار',
    icon: <IconCalendar className="h-7 w-7 text-[var(--color-warning)]" />,
    iconWrapClassName: 'bg-[rgb(var(--color-warning-rgb)/0.14)]',
  },
  {
    id: 'text',
    title: 'ابزارهای متنی',
    description: 'عدد به حروف، شمارش کلمات، نرمال‌سازی، اسلاگ و تبدیل آدرس',
    path: '/text-tools',
    category: 'text',
    meta: '۵ ابزار',
    icon: <IconZap className="h-7 w-7 text-[var(--color-info)]" />,
    iconWrapClassName: 'bg-[rgb(var(--color-info-rgb)/0.14)]',
  },
  {
    id: 'validation',
    title: 'اعتبارسنجی داده‌ها',
    description: 'کد ملی، موبایل، کارت بانکی، شبا، کدپستی و پلاک',
    path: '/validation-tools',
    category: 'validation',
    meta: '۶ ابزار',
    icon: <IconShield className="h-7 w-7 text-[var(--color-success)]" />,
    iconWrapClassName: 'bg-[rgb(var(--color-success-rgb)/0.12)]',
  },
  {
    id: 'loan',
    title: 'محاسبه‌گر وام',
    description: 'محاسبه اقساط ماهانه، سود کل و برنامه بازپرداخت',
    path: '/loan',
    category: 'finance',
    meta: 'پرکاربرد',
    icon: <IconCalculator className="h-7 w-7 text-[var(--color-primary)]" />,
    iconWrapClassName: 'bg-[rgb(var(--color-primary-rgb)/0.12)]',
  },
  {
    id: 'salary',
    title: 'محاسبه‌گر حقوق',
    description: 'حقوق خالص، بیمه و مالیات را سریع محاسبه کنید',
    path: '/salary',
    category: 'finance',
    meta: 'جدید',
    icon: <IconMoney className="h-7 w-7 text-[var(--color-success)]" />,
    iconWrapClassName: 'bg-[rgb(var(--color-success-rgb)/0.12)]',
  },
];

const categories: Array<{ id: ToolCategory; label: string }> = [
  { id: 'all', label: 'همه ابزارها' },
  { id: 'pdf', label: 'PDF' },
  { id: 'image', label: 'تصویر' },
  { id: 'date', label: 'تاریخ' },
  { id: 'text', label: 'متن' },
  { id: 'validation', label: 'اعتبارسنجی' },
  { id: 'finance', label: 'محاسبات مالی' },
];

const flows = [
  {
    title: 'PDF → استخراج صفحات',
    description: 'صفحات دلخواه را جدا کنید و خروجی آماده بگیرید.',
    path: '/pdf-tools/extract/extract-pages',
  },
  {
    title: 'PDF → چرخش صفحات',
    description: 'چرخاندن صفحات انتخابی برای خوانایی بهتر.',
    path: '/pdf-tools/edit/rotate-pages',
  },
  {
    title: 'متن → تبدیل آدرس',
    description: 'آدرس فارسی را به قالب انگلیسی قابل ارسال تبدیل کنید.',
    path: '/text-tools/address-fa-to-en',
  },
  {
    title: 'اعتبارسنجی فرم',
    description: 'کد ملی، موبایل و کارت بانکی را یکجا بررسی کنید.',
    path: '/validation-tools',
  },
];

export default function ToolsDashboardPage() {
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory>('all');

  const filteredTools = useMemo(
    () => tools.filter((tool) => selectedCategory === 'all' || tool.category === selectedCategory),
    [selectedCategory],
  );

  return (
    <div className="space-y-10">
      <section className="section-surface rounded-[var(--radius-lg)] border border-[var(--border-light)] p-6 md:p-8">
        <div className="flex flex-col gap-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-light)] bg-[var(--surface-1)] px-4 py-2 text-xs font-semibold text-[var(--text-muted)]">
            <span className="h-2 w-2 rounded-full bg-[var(--color-info)]"></span>
            داشبورد ابزارها
          </div>
          <h1 className="text-3xl font-black text-[var(--text-primary)] md:text-4xl">
            همه ابزارها در یک صفحه
          </h1>
          <p className="text-[var(--text-secondary)]">
            بدون جستجو و بدون شلوغی، دسته موردنظر را انتخاب کنید و مستقیم وارد ابزار شوید.
          </p>
        </div>
      </section>

      <div className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)]/92 p-5 shadow-[var(--shadow-medium)]">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => setSelectedCategory(category.id)}
              aria-pressed={selectedCategory === category.id}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-all duration-[var(--motion-fast)] ${
                selectedCategory === category.id
                  ? 'bg-[var(--color-primary)] text-[var(--text-inverted)] shadow-[var(--shadow-medium)]'
                  : 'border border-[var(--border-light)] bg-[var(--surface-1)] text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-black text-[var(--text-primary)]">مسیرهای پیشنهادی</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {flows.map((flow) => (
            <a
              key={flow.title}
              href={flow.path}
              className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)]/85 p-5 transition-all duration-[var(--motion-fast)] hover:border-[var(--color-primary)] hover:shadow-[var(--shadow-strong)]"
            >
              <div className="text-sm font-bold text-[var(--text-primary)]">{flow.title}</div>
              <div className="mt-2 text-sm text-[var(--text-muted)]">{flow.description}</div>
              <div className="mt-3 text-xs font-semibold text-[var(--color-primary)]">
                شروع مسیر
              </div>
            </a>
          ))}
        </div>
      </section>

      {filteredTools.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredTools.map((tool) => (
            <ToolCard
              key={tool.id}
              href={tool.path}
              title={tool.title}
              description={tool.description}
              icon={tool.icon}
              {...(tool.meta ? { meta: tool.meta } : {})}
              {...(tool.iconWrapClassName ? { iconWrapClassName: tool.iconWrapClassName } : {})}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon="🧰"
          title="ابزاری در این دسته نیست"
          description="دسته دیگری را انتخاب کنید."
          action={{
            label: 'نمایش همه ابزارها',
            onClick: () => setSelectedCategory('all'),
          }}
        />
      )}
    </div>
  );
}
