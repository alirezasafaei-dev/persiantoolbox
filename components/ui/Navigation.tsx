'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Container from '@/shared/ui/Container';
import {
  IconPdf,
  IconImage,
  IconCalculator,
  IconMenu,
  IconX,
  IconCalendar,
  IconZap,
  IconChevronDown,
} from '@/shared/ui/icons';

const isV3NavEnabled = process.env['NEXT_PUBLIC_FEATURE_V3_NAV'] === '1';

const v2ProductNavItems = [
  { label: 'ابزارهای PDF', href: '/pdf-tools', icon: IconPdf },
  { label: 'ابزارهای تصویر', href: '/image-tools', icon: IconImage },
  { label: 'ابزارهای مالی', href: '/tools', icon: IconCalculator },
  { label: 'ابزارهای تاریخ', href: '/date-tools', icon: IconCalendar },
  { label: 'ابزارهای متنی', href: '/text-tools', icon: IconZap },
  { label: 'راهنماها', href: '/guides', icon: IconCalendar },
];

const v3ProductNavItems = [
  { label: 'همه ابزارها', href: '/tools', icon: IconCalculator },
  { label: 'موضوعات', href: '/topics', icon: IconCalendar },
  { label: 'راهنماها', href: '/guides', icon: IconCalendar },
  { label: 'PDF', href: '/pdf-tools', icon: IconPdf },
  { label: 'تصویر', href: '/image-tools', icon: IconImage },
  { label: 'متنی', href: '/text-tools', icon: IconZap },
];

const productNavItems = isV3NavEnabled ? v3ProductNavItems : v2ProductNavItems;
const navLinkBaseClasses =
  'flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-bold transition-all duration-[var(--motion-fast)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-primary)]';
const mobileNavLinkBaseClasses =
  'flex items-center gap-3 rounded-full border px-4 py-3 text-sm font-semibold transition-all duration-[var(--motion-fast)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-primary)]';

function isPathActive(pathname: string, href: string): boolean {
  if (href.startsWith('http')) {
    return false;
  }
  if (href === '/') {
    return pathname === '/';
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname() ?? '';
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isMobileMenuOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isMobileMenuOpen]);

  return (
    <header
      className="sticky top-0 z-50 border-b border-[var(--border-light)] bg-[var(--surface-1)]/85 backdrop-blur-xl shadow-[var(--shadow-subtle)]"
      role="banner"
    >
      <Container className="flex items-center justify-between gap-3 py-4">
        <Link
          href="/"
          prefetch={false}
          className="flex items-center gap-3 rounded-lg p-2 text-[var(--text-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-primary)] text-[var(--text-inverted)] shadow-[var(--shadow-subtle)]">
            <span className="text-sm font-bold">P</span>
          </span>
          <span className="text-xl font-black">جعبه ابزار فارسی</span>
        </Link>

        <div className="hidden lg:flex items-center gap-3">
          <nav className="flex items-center gap-2" aria-label="ناوبری اصلی">
            {productNavItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                prefetch={false}
                className={`${navLinkBaseClasses} ${
                  isPathActive(pathname, item.href)
                    ? 'border-[rgb(var(--color-primary-rgb)/0.35)] bg-[rgb(var(--color-primary-rgb)/0.1)] text-[var(--color-primary)]'
                    : 'border-transparent text-[var(--text-primary)] hover:border-[var(--border-light)] hover:bg-[var(--surface-2)]'
                }`}
              >
                <item.icon className="h-4 w-4" aria-hidden="true" />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="hidden lg:flex items-center">
          <Link
            href="/tools"
            prefetch={false}
            className="btn btn-primary btn-md px-5"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <IconChevronDown className="h-4 w-4 rotate-90" />
            شروع ابزارها
          </Link>
        </div>

        <button
          type="button"
          data-testid="mobile-menu"
          aria-label={isMobileMenuOpen ? 'بستن منوی ناوبری' : 'باز کردن منوی ناوبری'}
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-menu-panel"
          className="lg:hidden flex items-center gap-2 rounded-full p-2.5 text-[var(--text-primary)] transition-all duration-[var(--motion-fast)] hover:bg-[var(--surface-2)]"
          onClick={() => setIsMobileMenuOpen((value) => !value)}
        >
          <span className="inline-flex transition-transform duration-[var(--motion-fast)]">
            {isMobileMenuOpen ? <IconX className="h-6 w-6" /> : <IconMenu className="h-6 w-6" />}
          </span>
        </button>
      </Container>

      {isMobileMenuOpen ? (
        <div
          id="mobile-menu-panel"
          className="lg:hidden border-t border-[var(--border-light)] bg-[var(--surface-1)]/95 backdrop-blur-xl"
        >
          <Container className="space-y-2 py-4">
            <div className="px-2 text-xs font-bold text-[var(--text-muted)]">محصول</div>
            {productNavItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                prefetch={false}
                className={`${mobileNavLinkBaseClasses} ${
                  isPathActive(pathname, item.href)
                    ? 'border-[rgb(var(--color-primary-rgb)/0.35)] bg-[rgb(var(--color-primary-rgb)/0.1)] text-[var(--color-primary)]'
                    : 'border-transparent text-[var(--text-primary)] hover:bg-[var(--surface-2)]'
                }`}
              >
                <item.icon className="h-4 w-4" aria-hidden="true" />
                {item.label}
              </Link>
            ))}
            <div className="pt-1">
              <Link
                href="/tools"
                prefetch={false}
                className="btn btn-primary btn-md w-full justify-center"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                شروع ابزارها
              </Link>
            </div>
          </Container>
        </div>
      ) : null}
    </header>
  );
}
