'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

type SidebarLink = {
  href: string;
  label: string;
  icon: string;
};

const links: SidebarLink[] = [
  { href: '/admin', label: 'داشبورد', icon: '📊' },
  { href: '/admin/analytics', label: 'آمار و تحلیل', icon: '📈' },
  { href: '/admin/content', label: 'مدیریت محتوا', icon: '📝' },
  { href: '/admin/tools', label: 'مدیریت ابزارها', icon: '🛠️' },
  { href: '/admin/users', label: 'مدیریت کاربران', icon: '👥' },
  { href: '/admin/site-settings', label: 'تنظیمات سایت', icon: '⚙️' },
  { href: '/admin/monetization', label: 'درآمدزایی', icon: '💰' },
  { href: '/admin/ops', label: 'عملیات سرور', icon: '🖥️' },
  { href: '/admin/audit', label: 'گزارش عملیات', icon: '📋' },
  { href: '/admin/google-search-console', label: 'Google Search Console', icon: '🔍' },
];

type AdminSidebarProps = {
  userName?: string | undefined;
  userEmail?: string | undefined;
  userRole?: string | undefined;
  onLogout?: () => void;
};

const adminOnlyLinks = [
  '/admin/users',
  '/admin/site-settings',
  '/admin/monetization',
  '/admin/ops',
  '/admin/audit',
];

export default function AdminSidebar({
  userName,
  userEmail,
  userRole,
  onLogout,
}: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-l border-[var(--border-light)] bg-[var(--surface-1)]">
      {/* Header */}
      <div className="border-b border-[var(--border-light)] p-4">
        <Link href="/admin" className="text-lg font-black text-[var(--text-primary)]">
          پنل مدیریت
        </Link>
        <p className="mt-1 text-xs text-[var(--text-muted)]">جعبه ابزار فارسی</p>
      </div>

      {/* User Info */}
      {userName && (
        <div className="border-b border-[var(--border-light)] p-4">
          <p className="text-sm font-semibold text-[var(--text-primary)]">{userName}</p>
          {userEmail && (
            <p className="mt-0.5 truncate text-xs text-[var(--text-muted)]">{userEmail}</p>
          )}
          {userRole && (
            <span className="mt-1 inline-block rounded-full bg-[var(--color-primary)]/10 px-2 py-0.5 text-[10px] font-semibold text-[var(--color-primary)]">
              {userRole === 'admin' ? 'مدیر' : userRole === 'editor' ? 'ویرایشگر' : 'کاربر'}
            </span>
          )}
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-3">
        {links
          .filter((link) => userRole === 'admin' || !adminOnlyLinks.includes(link.href))
          .map((link) => {
            const isActive =
              link.href === '/admin' ? pathname === '/admin' : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-sm transition-colors ${
                  isActive
                    ? 'bg-[var(--color-primary)]/10 font-semibold text-[var(--color-primary)]'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)]'
                }`}
              >
                <span className="text-base">{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            );
          })}
      </nav>

      {/* Footer */}
      <div className="border-t border-[var(--border-light)] p-3">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-sm text-[var(--text-secondary)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)]"
        >
          <span className="text-base">🏠</span>
          <span>بازگشت به سایت</span>
        </Link>
        {onLogout && (
          <button
            onClick={onLogout}
            className="flex w-full items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-sm text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10"
          >
            <span className="text-base">🚪</span>
            <span>خروج</span>
          </button>
        )}
      </div>
    </aside>
  );
}
