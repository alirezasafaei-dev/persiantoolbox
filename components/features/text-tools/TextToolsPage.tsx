'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, EmptyState } from '@/components/ui';
import PageHero from '@/shared/ui/PageHero';

const textTools = [
  {
    id: 'word-counter',
    title: 'شمارشگر کلمات',
    description: 'شمارش آنی کلمات، کاراکترها، جملات و پاراگراف‌ها',
    icon: '🔢',
    path: '/text-tools/word-counter',
    category: 'edit',
  },
  {
    id: 'number-converter',
    title: 'تبدیل اعداد',
    description: 'تبدیل اعداد فارسی به انگلیسی و بالعکس',
    icon: '🔢',
    path: '/text-tools/number-converter',
    category: 'convert',
  },
  {
    id: 'remove-spaces',
    title: 'حذف فاصله‌های اضافی',
    description: 'حذف آنی فاصله‌های اضافی، Tab و فاصله‌های انتهایی',
    icon: '✂️',
    path: '/text-tools/remove-spaces',
    category: 'edit',
  },
  {
    id: 'case-converter',
    title: 'تبدیل حروف',
    description: 'تبدیل متن به حروف بزرگ، کوچک، عنوانی یا جمله‌ای',
    icon: '🔤',
    path: '/text-tools/case-converter',
    category: 'edit',
  },
  {
    id: 'extract-info',
    title: 'استخراج اطلاعات',
    description: 'استخراج خودکار ایمیل، شماره تلفن، URL و اعداد',
    icon: '🔍',
    path: '/text-tools/extract-info',
    category: 'extract',
  },
  {
    id: 'address-fa-to-en',
    title: 'ترجمه آدرس فارسی',
    description: 'تبدیل آدرس فارسی به فرمت انگلیسی استاندارد',
    icon: '🌍',
    path: '/text-tools/address-fa-to-en',
    category: 'convert',
  },
  {
    id: 'resume-builder',
    title: 'ساخت رزومه',
    description: 'ساخت رزومه حرفه‌ای فارسی با پیش‌نمایش زنده و خروجی PDF',
    icon: '📄',
    path: '/text-tools/resume-builder',
    category: 'professional',
  },
  {
    id: 'signature',
    title: 'امضای دیجیتال',
    description: 'امضای دیجیتال خود را بکشید و دانلود کنید',
    icon: '✍️',
    path: '/text-tools/signature',
    category: 'professional',
  },
];

const categories = [
  { id: 'all', name: 'همه ابزارها', icon: '🛠️' },
  { id: 'edit', name: 'ویرایش متن', icon: '✂️' },
  { id: 'convert', name: 'تبدیل', icon: '🔄' },
  { id: 'extract', name: 'استخراج', icon: '🔍' },
  { id: 'professional', name: 'حرفه‌ای', icon: '💼' },
];

export default function TextToolsPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredTools = textTools.filter((tool) => {
    return selectedCategory === 'all' || tool.category === selectedCategory;
  });

  return (
    <div className="space-y-10">
      <PageHero
        title="ابزارهای متنی آنلاین"
        description="مجموعه ابزارهای کاربردی برای ویرایش، تبدیل و استخراج اطلاعات از متن فارسی و انگلیسی."
        gradient="info"
        badges={[
          { text: 'شمارش و ویرایش', color: 'info' },
          { text: 'تبدیل و استخراج', color: 'primary' },
          { text: 'رزومه و امضا', color: 'success' },
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
          {filteredTools.map((tool) => (
            <Card
              key={tool.id}
              className="group transition-all duration-[var(--motion-medium)] hover:shadow-[var(--shadow-strong)] hover:-translate-y-1"
            >
              <Link
                href={tool.path}
                className="block p-6 text-center"
                aria-label={`شروع ${tool.title}`}
              >
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
              </Link>
            </Card>
          ))}
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
          چرا ابزارهای متنی ما؟
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              icon: '🚀',
              title: 'سریع و کارآمد',
              desc: 'پردازش فوری متن بدون نیاز به آپلود فایل',
            },
            {
              icon: '🔒',
              title: 'امن و محرمانه',
              desc: 'تمام پردازش‌ها در مرورگر شما انجام می‌شود',
            },
            { icon: '💎', title: 'رایگان و نامحدود', desc: 'بدون محدودیت در تعداد و حجم متن‌ها' },
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
