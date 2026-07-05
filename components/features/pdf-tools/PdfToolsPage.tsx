'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, EmptyState } from '@/components/ui';
import type { PdfToolItem } from '@/features/pdf-tools/types';
import PageHero from '@/shared/ui/PageHero';

const pdfTools: PdfToolItem[] = [
  // Convert tools
  {
    id: 'image-to-pdf',
    title: 'تبدیل عکس به PDF',
    description: 'چندین تصویر را به یک فایل PDF تبدیل کنید',
    icon: '🖼️',
    path: '/pdf-tools/convert/image-to-pdf',
    category: 'convert',
  },
  {
    id: 'pdf-to-image',
    title: 'تبدیل PDF به عکس',
    description: 'صفحات PDF را به تصاویر JPG یا PNG تبدیل کنید',
    icon: '📷',
    path: '/pdf-tools/convert/pdf-to-image',
    category: 'convert',
  },
  {
    id: 'pdf-to-text',
    title: 'استخراج متن از PDF',
    description: 'متن را از فایل PDF استخراج کنید',
    icon: '📝',
    path: '/pdf-tools/convert/pdf-to-text',
    category: 'convert',
  },
  {
    id: 'word-to-pdf',
    title: 'تبدیل Word به PDF',
    description: 'فایل‌های Word را به PDF تبدیل کنید',
    icon: '📄',
    path: '/pdf-tools/convert/word-to-pdf',
    category: 'convert',
  },
  {
    id: 'pdf-to-word',
    title: 'تبدیل PDF به Word',
    description: 'فایل PDF را به سند Word تبدیل کنید',
    icon: '📝',
    path: '/pdf-tools/convert/pdf-to-word',
    category: 'convert',
  },

  // Compress tools
  {
    id: 'compress-pdf',
    title: 'فشرده‌سازی PDF',
    description: 'حجم فایل PDF را بدون افت کیفیت کاهش دهید',
    icon: '🗜️',
    path: '/pdf-tools/compress/compress-pdf',
    category: 'compress',
  },

  // Merge tools
  {
    id: 'merge-pdf',
    title: 'ادغام PDF',
    description: 'چندین فایل PDF را در یک فایل واحد ادغام کنید',
    icon: '➕',
    path: '/pdf-tools/merge/merge-pdf',
    category: 'merge',
  },

  // Split tools
  {
    id: 'split-pdf',
    title: 'تقسیم PDF',
    description: 'فایل PDF را به صفحات جداگانه تقسیم کنید',
    icon: '✂️',
    path: '/pdf-tools/split/split-pdf',
    category: 'split',
  },
  {
    id: 'rotate-pages',
    title: 'چرخش صفحات',
    description: 'چرخاندن صفحات انتخابی در PDF',
    icon: '🔄',
    path: '/pdf-tools/edit/rotate-pages',
    category: 'edit',
  },
  {
    id: 'reorder-pages',
    title: 'جابجایی صفحات',
    description: 'تغییر ترتیب صفحات PDF',
    icon: '↔️',
    path: '/pdf-tools/edit/reorder-pages',
    category: 'edit',
  },
  {
    id: 'delete-pages',
    title: 'حذف صفحات PDF',
    description: 'صفحات انتخابی را از فایل PDF حذف کنید',
    icon: '🧹',
    path: '/pdf-tools/edit/delete-pages',
    category: 'edit',
  },

  // Security tools
  {
    id: 'decrypt-pdf',
    title: 'حذف رمز PDF',
    description: 'رمز عبور فایل PDF را حذف کنید',
    icon: '🔓',
    path: '/pdf-tools/security/decrypt-pdf',
    category: 'security',
  },

  // Watermark tools
  {
    id: 'add-watermark',
    title: 'افزودن واترمارک',
    description: 'متن یا لوگو به صفحات PDF اضافه کنید',
    icon: '🖋️',
    path: '/pdf-tools/watermark/add-watermark',
    category: 'watermark',
  },

  // Paginate tools
  {
    id: 'add-page-numbers',
    title: 'شماره صفحه',
    description: 'به صفحات PDF شماره اضافه کنید',
    icon: '🔢',
    path: '/pdf-tools/edit/add-page-numbers',
    category: 'edit',
  },

  // Extract tools
  {
    id: 'extract-pages',
    title: 'استخراج صفحات',
    description: 'صفحات خاصی را از PDF استخراج کنید',
    icon: '📑',
    path: '/pdf-tools/extract/extract-pages',
    category: 'extract',
  },
  {
    id: 'extract-text',
    title: 'استخراج متن',
    description: 'متن کامل را از PDF استخراج کنید',
    icon: '📋',
    path: '/pdf-tools/extract/extract-text',
    category: 'extract',
  },
];

const categories = [
  { id: 'all', name: 'همه ابزارها', icon: '🛠️' },
  { id: 'convert', name: 'تبدیل', icon: '🔄' },
  { id: 'compress', name: 'فشرده‌سازی', icon: '🗜️' },
  { id: 'merge', name: 'ادغام', icon: '➕' },
  { id: 'split', name: 'تقسیم', icon: '✂️' },
  { id: 'edit', name: 'ویرایش', icon: '🧩' },
  { id: 'security', name: 'امنیت', icon: '🔒' },
  { id: 'watermark', name: 'واترمارک', icon: '🖋️' },
  { id: 'paginate', name: 'صفحه‌بندی', icon: '🔢' },
  { id: 'extract', name: 'استخراج', icon: '📤' },
];

export default function PdfToolsPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredTools = pdfTools.filter((tool) => {
    return selectedCategory === 'all' || tool.category === selectedCategory;
  });

  return (
    <div className="space-y-10">
      <PageHero
        title="ابزارهای PDF آنلاین"
        description="مجموعه کامل ابزارهای کاربردی برای مدیریت فایل‌های PDF با پردازش محلی و سریع."
        gradient="danger"
        badges={[
          { text: 'ادغام، تقسیم و فشرده‌سازی', color: 'danger' },
          { text: 'رمزگذاری و واترمارک', color: 'info' },
          { text: 'تبدیل و استخراج', color: 'primary' },
        ]}
      />

      <Card className="p-6">
        <p className="text-sm text-[var(--text-muted)]">
          دسته موردنظر را انتخاب کنید و مستقیم وارد ابزار شوید.
        </p>
      </Card>

      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            type="button"
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            aria-pressed={selectedCategory === category.id}
            aria-label={`فیلتر بر اساس دسته ${category.name}`}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-[var(--motion-fast)] ${
              selectedCategory === category.id
                ? 'bg-[var(--color-primary)] text-[var(--text-inverted)] shadow-[var(--shadow-medium)]'
                : 'bg-[var(--surface-1)] text-[var(--text-primary)] border border-[var(--border-light)] hover:bg-[var(--bg-subtle)]'
            }`}
          >
            <span className="ms-2">{category.icon}</span>
            {category.name}
          </button>
        ))}
      </div>

      {filteredTools.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredTools.map((tool) => {
            const content = (
              <div className="block p-6 text-center">
                <div className="text-4xl mb-4 transition-transform duration-[var(--motion-fast)] group-hover:scale-110">
                  {tool.icon}
                </div>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <h3 className="text-lg font-bold transition-colors duration-[var(--motion-fast)] text-[var(--text-primary)] group-hover:text-[var(--color-primary)]">
                    {tool.title}
                  </h3>
                </div>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                  {tool.description}
                </p>
                <div className="mt-4">
                  <span className="inline-flex items-center font-semibold text-sm text-[var(--color-primary)]">
                    شروع کنید
                    <svg
                      className="me-2 h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 17l9.2-9.2M17 17V7H7"
                      />
                    </svg>
                  </span>
                </div>
              </div>
            );

            return (
              <Card
                key={tool.id}
                className="group transition-all duration-[var(--motion-medium)] hover:shadow-[var(--shadow-strong)] hover:-translate-y-1"
              >
                <Link href={tool.path} className="block" aria-label={`شروع ${tool.title}`}>
                  {content}
                </Link>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon="🔍"
          title="ابزاری یافت نشد"
          description="دسته‌بندی دیگری را انتخاب کنید."
          action={{
            label: 'بازنشانی فیلترها',
            onClick: () => {
              setSelectedCategory('all');
            },
          }}
        />
      )}

      <section className="section-surface p-8">
        <h2 className="text-2xl font-black text-[var(--text-primary)] text-center mb-8">
          چرا ابزارهای PDF ما؟
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              icon: '🚀',
              title: 'سریع و کارآمد',
              desc: 'پردازش سریع فایل‌ها با بهترین کیفیت ممکن',
            },
            {
              icon: '🔒',
              title: 'امن و محرمانه',
              desc: 'فایل‌های شما به صورت محلی پردازش می‌شوند',
            },
            { icon: '💎', title: 'رایگان و نامحدود', desc: 'بدون محدودیت در تعداد و حجم فایل‌ها' },
          ].map((item) => (
            <Card key={item.title} className="text-center p-6">
              <div className="text-3xl mb-4">{item.icon}</div>
              <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">{item.title}</h3>
              <p className="text-[var(--text-muted)] text-sm">{item.desc}</p>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
