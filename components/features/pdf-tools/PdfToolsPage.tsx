'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Card, EmptyState } from '@/components/ui';
import PageHero from '@/shared/ui/PageHero';
import { getToolsByCategory } from '@/lib/tools-registry';

const categories = [
  { id: 'all', name: 'همه ابزارها', icon: '🛠️' },
  { id: 'convert', name: 'تبدیل', icon: '🔄' },
  { id: 'compress', name: 'فشرده‌سازی', icon: '🗜️' },
  { id: 'merge', name: 'ادغام', icon: '➕' },
  { id: 'split', name: 'تقسیم', icon: '✂️' },
  { id: 'edit', name: 'ویرایش و مرتب‌سازی', icon: '🧩' },
  { id: 'security', name: 'امنیت', icon: '🔒' },
  { id: 'watermark', name: 'واترمارک', icon: '🖋️' },
  { id: 'extract', name: 'استخراج', icon: '📤' },
] as const;

type PdfCategory = (typeof categories)[number]['id'];

const iconByPath: Record<string, string> = {
  '/pdf-tools/convert/image-to-pdf': '🖼️',
  '/pdf-tools/convert/pdf-to-image': '📷',
  '/pdf-tools/convert/pdf-to-text': '📝',
  '/pdf-tools/convert/word-to-pdf': '📄',
  '/pdf-tools/convert/pdf-to-word': '📝',
  '/pdf-tools/compress/compress-pdf': '🗜️',
  '/pdf-tools/merge/merge-pdf': '➕',
  '/pdf-tools/split/split-pdf': '✂️',
  '/pdf-tools/edit/rotate-pages': '🔄',
  '/pdf-tools/edit/reorder-pages': '↔️',
  '/pdf-tools/edit/delete-pages': '🧹',
  '/pdf-tools/edit/add-page-numbers': '🔢',
  '/pdf-tools/security/encrypt-pdf': '🔐',
  '/pdf-tools/security/decrypt-pdf': '🔓',
  '/pdf-tools/watermark/add-watermark': '🖋️',
  '/pdf-tools/extract/extract-pages': '📑',
  '/pdf-tools/extract/extract-text': '📋',
};

function getCategory(path: string): Exclude<PdfCategory, 'all'> {
  if (path.includes('/convert/')) {
    return 'convert';
  }
  if (path.includes('/compress/')) {
    return 'compress';
  }
  if (path.includes('/merge/')) {
    return 'merge';
  }
  if (path.includes('/split/')) {
    return 'split';
  }
  if (path.includes('/security/')) {
    return 'security';
  }
  if (path.includes('/watermark/')) {
    return 'watermark';
  }
  if (path.includes('/extract/')) {
    return 'extract';
  }
  return 'edit';
}

const pdfTools = getToolsByCategory('pdf-tools')
  .filter((tool) => tool.kind === 'tool' && tool.indexable)
  .map((tool) => ({
    id: tool.id,
    title: tool.title.replace(' - جعبه ابزار فارسی', ''),
    description: tool.description,
    path: tool.path,
    icon: iconByPath[tool.path] ?? '📄',
    category: getCategory(tool.path),
  }));

export default function PdfToolsPage() {
  const [selectedCategory, setSelectedCategory] = useState<PdfCategory>('all');

  const filteredTools = useMemo(
    () =>
      pdfTools.filter((tool) => selectedCategory === 'all' || tool.category === selectedCategory),
    [selectedCategory],
  );

  return (
    <div className="space-y-10">
      <PageHero
        title="ابزارهای PDF آنلاین رایگان"
        description="تبدیل، فشرده‌سازی، ادغام، تقسیم، ویرایش و ایمن‌سازی PDF با پردازش محلی در مرورگر."
        gradient="danger"
        badges={[
          { text: 'پردازش محلی فایل', color: 'success' },
          { text: 'بدون ثبت‌نام', color: 'primary' },
          { text: 'مناسب موبایل و دسکتاپ', color: 'info' },
        ]}
      />

      <Card className="p-6">
        <p className="text-sm leading-7 text-[var(--text-muted)]">
          ابزار موردنظر را بر اساس نوع عملیات انتخاب کنید. فایل‌ها در ابزارهای محلی از دستگاه شما
          خارج نمی‌شوند؛ ظرفیت پردازش به حافظه مرورگر، دستگاه و ساختار فایل بستگی دارد.
        </p>
      </Card>

      <nav aria-label="فیلتر ابزارهای PDF" className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            type="button"
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            aria-pressed={selectedCategory === category.id}
            aria-label={`نمایش دسته ${category.name}`}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-all duration-[var(--motion-fast)] ${
              selectedCategory === category.id
                ? 'bg-[var(--color-primary)] text-[var(--text-inverted)] shadow-[var(--shadow-medium)]'
                : 'border border-[var(--border-light)] bg-[var(--surface-1)] text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]'
            }`}
          >
            <span className="ms-2" aria-hidden="true">
              {category.icon}
            </span>
            {category.name}
          </button>
        ))}
      </nav>

      {filteredTools.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredTools.map((tool) => (
            <Card
              key={tool.id}
              className="group transition-all duration-[var(--motion-medium)] hover:-translate-y-1 hover:shadow-[var(--shadow-strong)]"
            >
              <Link href={tool.path} className="block p-6 text-center" aria-label={`شروع ${tool.title}`}>
                <div
                  className="mb-4 text-4xl transition-transform duration-[var(--motion-fast)] group-hover:scale-110"
                  aria-hidden="true"
                >
                  {tool.icon}
                </div>
                <h2 className="mb-2 text-lg font-bold text-[var(--text-primary)] transition-colors duration-[var(--motion-fast)] group-hover:text-[var(--color-primary)]">
                  {tool.title}
                </h2>
                <p className="text-sm leading-relaxed text-[var(--text-muted)]">{tool.description}</p>
                <span className="mt-4 inline-flex items-center text-sm font-semibold text-[var(--color-primary)]">
                  استفاده از ابزار
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
              </Link>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon="🔍"
          title="ابزاری در این دسته یافت نشد"
          description="فهرست همه ابزارهای PDF را نمایش دهید."
          action={{ label: 'نمایش همه ابزارها', onClick: () => setSelectedCategory('all') }}
        />
      )}

      <section className="section-surface p-8">
        <h2 className="mb-8 text-center text-2xl font-black text-[var(--text-primary)]">
          چرا ابزارهای PDF جعبه ابزار فارسی؟
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              icon: '🔒',
              title: 'حریم خصوصی محلی',
              desc: 'در ابزارهای محلی، فایل داخل مرورگر پردازش می‌شود و برای انجام عملیات آپلود نمی‌شود.',
            },
            {
              icon: '⚡',
              title: 'شروع سریع',
              desc: 'بدون نصب نرم‌افزار و ثبت‌نام، مستقیماً عملیات موردنظر را روی فایل انجام دهید.',
            },
            {
              icon: '📱',
              title: 'سازگار با دستگاه شما',
              desc: 'رابط واکنش‌گرا برای استفاده در موبایل و دسکتاپ، متناسب با توان حافظه دستگاه.',
            },
          ].map((item) => (
            <Card key={item.title} className="p-6 text-center">
              <div className="mb-4 text-3xl" aria-hidden="true">
                {item.icon}
              </div>
              <h3 className="mb-2 text-lg font-bold text-[var(--text-primary)]">{item.title}</h3>
              <p className="text-sm leading-7 text-[var(--text-muted)]">{item.desc}</p>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
