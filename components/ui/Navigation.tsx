'use client';

import { useEffect, useRef, useState } from 'react';
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
} from '@/shared/ui/icons';

const isV3NavEnabled = process.env['NEXT_PUBLIC_FEATURE_V3_NAV'] === '1';

const v2ProductNavItems = [
  { label: 'ابزارهای PDF', href: '/pdf-tools', icon: IconPdf },
  { label: 'ابزارهای تصویر', href: '/image-tools', icon: IconImage },
  { label: 'ابزارهای مالی', href: '/tools', icon: IconCalculator },
  { label: 'ابزارهای تاریخ', href: '/date-tools', icon: IconCalendar },
  { label: 'ابزارهای متنی', href: '/text-tools', icon: IconZap },
  { label: 'علاقه‌مندی‌ها', href: '/favorites', icon: IconZap },
  { label: 'تاریخچه', href: '/history', icon: IconZap },
  { label: 'جستجو', href: '/search', icon: IconZap },
  { label: 'راهنماها', href: '/guides', icon: IconCalendar },
];

const v3ProductNavItems = [
  { label: 'همه ابزارها', href: '/topics', icon: IconCalculator },
  { label: 'موضوعات', href: '/topics', icon: IconCalendar },
  { label: 'راهنماها', href: '/guides', icon: IconCalendar },
  { label: 'جستجو', href: '/search', icon: IconZap },
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
  const [isDark, setIsDark] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const firstFocusableRef = useRef<HTMLAnchorElement>(null);
  const lastFocusableRef = useRef<HTMLAnchorElement>(null);
  const pathname = usePathname() ?? '';

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const stored = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = stored === 'dark' || (!stored && prefersDark);
    setIsDark(shouldBeDark);
    document.documentElement.classList.toggle('dark', shouldBeDark);
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };

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

  useEffect(() => {
    if (!isMobileMenuOpen || !mobileMenuRef.current) {
      return;
    }

    const focusableElements = mobileMenuRef.current.querySelectorAll(
      'a[href], button:not([disabled])',
    );
    const firstElement = focusableElements[0] as HTMLAnchorElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLAnchorElement;

    firstFocusableRef.current = firstElement;
    lastFocusableRef.current = lastElement;

    const handleTab = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') {
        return;
      }

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleTab);
    firstElement?.focus();

    return () => {
      document.removeEventListener('keydown', handleTab);
    };
  }, [isMobileMenuOpen]);

  return (
    <header
      className="sticky top-0 z-50 border-b border-[var(--border-light)] bg-[var(--surface-1)]/85 backdrop-blur-xl shadow-[var(--shadow-subtle)]"
      role="banner"
    >
      <Container className="flex items-center justify-between gap-3 py-4">
        <Link
          href="/"
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

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? 'حالت روشن' : 'حالت تاریک'}
            className="flex items-center gap-2 rounded-full p-2.5 text-[var(--text-primary)] transition-all duration-[var(--motion-fast)] hover:bg-[var(--surface-2)]"
          >
            {isDark ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </svg>
            )}
          </button>

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
        </div>
      </Container>

      {isMobileMenuOpen ? (
        <div
          ref={mobileMenuRef}
          id="mobile-menu-panel"
          className="lg:hidden border-t border-[var(--border-light)] bg-[var(--surface-1)]/95 backdrop-blur-xl"
        >
          <Container className="space-y-2 py-4">
            <div className="px-2 text-xs font-bold text-[var(--text-muted)]">محصول</div>
            {productNavItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
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
          </Container>
        </div>
      ) : null}
    </header>
  );
}
