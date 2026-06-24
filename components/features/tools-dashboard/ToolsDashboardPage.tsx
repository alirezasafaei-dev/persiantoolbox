'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, EmptyState } from '@/components/ui';
import PageHero from '@/shared/ui/PageHero';
import { getToolsByCategory } from '@/lib/tools-registry';

const financeTools = getToolsByCategory('finance-tools').map((tool) => {
  const path = tool.path;
  const title = tool.title.replace(' - جعبه ابزار فارسی', '');

  const iconMap: Record<string, { emoji: string; category: string }> = {
    '/salary': { emoji: '💰', category: 'rights' },
    '/loan': { emoji: '🏦', category: 'loan' },
    '/interest': { emoji: '📈', category: 'savings' },
    '/tools/tax-calculator': { emoji: '🧾', category: 'rights' },
    '/tools/insurance-calculator': { emoji: '🛡️', category: 'rights' },
    '/tools/overtime-calculator': { emoji: '⏰', category: 'rights' },
    '/tools/bonus-calculator': { emoji: '🎁', category: 'rights' },
    '/tools/severance-calculator': { emoji: '📋', category: 'rights' },
    '/tools/leave-calculator': { emoji: '🏖️', category: 'rights' },
    '/tools/retirement-calculator': { emoji: '👴', category: 'rights' },
    '/tools/real-purchasing-power': { emoji: '📊', category: 'savings' },
    '/tools/currency-converter': { emoji: '💱', category: 'market' },
    '/tools/inflation-calculator': { emoji: '📉', category: 'market' },
    '/tools/investment-calculator': { emoji: '💼', category: 'savings' },
  };

  const config = iconMap[path] ?? { emoji: '🧮', category: 'other' };

  return {
    id: tool.id,
    title,
    description: tool.description,
    path,
    emoji: config.emoji,
    category: config.category,
  };
});

const categories = [
  { id: 'all', name: 'همه ابزارها', icon: '🧮' },
  { id: 'rights', name: 'حقوق و کسورات', icon: '💰' },
  { id: 'loan', name: 'وام و اقساط', icon: '🏦' },
  { id: 'savings', name: 'سرمایه‌گذاری', icon: '📈' },
  { id: 'market', name: 'بازار و اقتصاد', icon: '📊' },
];

export default function ToolsDashboardPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredTools = financeTools.filter(
    (tool) => selectedCategory === 'all' || tool.category === selectedCategory,
  );

  return (
    <div className="space-y-10">
      <PageHero
        title="ابزارهای مالی آنلاین"
        description="محاسبه حقوق، وام، سود بانکی و مالیات را در یک مکان انجام دهید. تمام محاسبات محلی و با واحد تومان."
        gradient="success"
        badges={[
          { text: 'محاسبه محلی', color: 'success' },
          { text: 'واحد تومان', color: 'primary' },
          { text: 'بدون ثبت‌نام', color: 'info' },
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
                  {tool.emoji}
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
          چرا ابزارهای مالی ما؟
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              icon: '🔒',
              title: 'محاسبات محلی',
              desc: 'تمام محاسبات در مرورگر شما انجام می‌شود و اطلاعات مالی خارج نمی‌شود',
            },
            {
              icon: '📐',
              title: 'دقیق و به‌روز',
              desc: 'بر اساس قوانین مصوب و فرمول‌های استاندارد محاسبه می‌شود',
            },
            {
              icon: '🆓',
              title: 'رایگان و نامحدود',
              desc: 'بدون ثبت‌نام و بدون محدودیت در تعداد محاسبات',
            },
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
