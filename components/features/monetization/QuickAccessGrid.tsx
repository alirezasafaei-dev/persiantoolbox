'use client';

import Link from 'next/link';

const QUICK_ACCESS_ITEMS = [
  { href: '/dashboard/financial', icon: '📊', label: 'داشبورد مالی' },
  { href: '/tools', icon: '🧰', label: 'ابزارهای مالی' },
  { href: '/history', icon: '📜', label: 'تاریخچه استفاده' },
  { href: '/favorites', icon: '❤️', label: 'علاقه‌مندی‌ها' },
  { href: '/subscription', icon: '⭐', label: 'اشتراک' },
  { href: '/blog', icon: '✍️', label: 'بلاگ' },
];

export default function QuickAccessGrid() {
  return (
    <section>
      <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">دسترسی سریع</h2>
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
        {QUICK_ACCESS_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] px-5 py-4 text-[var(--text-primary)] hover:bg-[var(--surface-2)] hover:border-[var(--color-primary)]/30 transition-all duration-[var(--motion-normal)]"
          >
            <span className="text-xl flex-shrink-0" aria-hidden="true">
              {item.icon}
            </span>
            <span className="font-semibold text-sm">{item.label}</span>
            <svg
              className="me-auto w-4 h-4 text-[var(--text-muted)]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </Link>
        ))}
      </div>
    </section>
  );
}
