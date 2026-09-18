'use client';

import Link from 'next/link';

const QUICK_ACCESS_ITEMS = [
  { href: '/dashboard', icon: '📊', label: 'داشبورد' },
  { href: '/topics/financial-tools', icon: '🧰', label: 'ابزارهای مالی' },
  { href: '/history', icon: '📜', label: 'تاریخچه استفاده' },
  { href: '/favorites', icon: '❤️', label: 'علاقه‌مندی‌ها' },
  { href: '/subscription', icon: '⭐', label: 'اشتراک' },
  { href: '/blog', icon: '✍️', label: 'بلاگ' },
];

type QuickAccessGridProps = {
  userRole?: string | undefined;
};

export default function QuickAccessGrid({ userRole }: QuickAccessGridProps) {
  const isAdmin = userRole === 'admin' || userRole === 'editor';
  const items = isAdmin
    ? [...QUICK_ACCESS_ITEMS, { href: '/admin', icon: '⚙️', label: 'پنل مدیریت' }]
    : QUICK_ACCESS_ITEMS;

  return (
    <section>
      <h2 className="text-lg font-bold text-(--text-primary) mb-4">دسترسی سریع</h2>
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 rounded-lg border border-(--border-light) bg-(--surface-1) px-5 py-4 text-(--text-primary) hover:bg-(--surface-2) hover:border-primary/30 transition-all duration-(--motion-normal)"
          >
            <span className="text-xl shrink-0" aria-hidden="true">
              {item.icon}
            </span>
            <span className="font-semibold text-sm">{item.label}</span>
            <svg
              className="me-auto w-4 h-4 text-(--text-muted)"
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
