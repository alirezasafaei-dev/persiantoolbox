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
import { categoryNavItems } from '@/lib/navigation';

const isV3NavEnabled = process.env['NEXT_PUBLIC_FEATURE_V3_NAV'] === '1';
const isAccountEnabled =
  process.env['NEXT_PUBLIC_FEATURE_ACCOUNT_ENABLED'] !== '0' &&
  process.env['NEXT_PUBLIC_FEATURE_ACCOUNT_ENABLED'] !== 'false';

const navIconMap: Record<string, typeof IconPdf> = {
  pdf: IconPdf,
  image: IconImage,
  calculator: IconCalculator,
  calendar: IconCalendar,
  zap: IconZap,
  lock: IconCalculator,
};

const v2ProductNavItems = categoryNavItems.map((item) => ({
  ...item,
  icon: navIconMap[item.icon ?? 'calculator'] ?? IconCalculator,
}));

const v3ProductNavItems = [
  { label: 'هاب ابزارها', href: '/tools', icon: IconCalculator, role: 'discover' as const },
  { label: 'موضوعات', href: '/topics', icon: IconCalendar, role: 'discover' as const },
  { label: 'بازار', href: '/market', icon: IconCalculator, role: 'discover' as const },
  { label: 'راهنماها', href: '/guides', icon: IconCalendar, role: 'learn' as const },
  { label: 'PDF', href: '/pdf-tools', icon: IconPdf, role: 'category' as const },
  { label: 'تصویر', href: '/image-tools', icon: IconImage, role: 'category' as const },
  { label: 'متنی', href: '/text-tools', icon: IconZap, role: 'category' as const },
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
    document.documentElement.classList.toggle('light', !shouldBeDark);
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle('dark', next);
    document.documentElement.classList.toggle('light', !next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onSearchShortcut = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        window.location.href = '/search';
      }
    };
    document.addEventListener('keydown', onSearchShortcut);
    return () => document.removeEventListener('keydown', onSearchShortcut);
  }, []);

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
    if (isMobileMenuOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
    } else {
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      if (scrollY) {
        window.scrollTo(0, -parseInt(scrollY, 10));
      }
    }
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
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-primary)] shadow-[var(--shadow-subtle)] overflow-hidden">
            <img src="/icon.svg" alt="" className="h-8 w-8" aria-hidden="true" />
          </span>
          <span className="text-xl font-black">جعبه ابزار فارسی</span>
        </Link>

        <div className="hidden lg:flex items-center gap-3">
          <Link
            href="/search"
            className="flex items-center gap-2 rounded-full border border-[var(--border-light)] px-4 py-2 text-sm font-medium text-[var(--text-muted)] transition-all duration-[var(--motion-fast)] hover:border-[var(--color-primary)] hover:bg-[rgb(var(--color-primary-rgb)/0.1)] hover:text-[var(--color-primary)]"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            جستجو
            <kbd className="hidden xl:inline-flex items-center gap-0.5 rounded border border-[var(--border-light)] bg-[var(--surface-2)] px-1.5 py-0.5 text-[10px] font-mono text-[var(--text-muted)]">
              <span className="text-[11px]">⌘</span>K
            </kbd>
          </Link>
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
          {isAccountEnabled ? (
            <Link
              href="/account"
              className="flex items-center gap-2 rounded-full border border-[var(--border-light)] px-4 py-2.5 text-sm font-bold text-[var(--text-primary)] transition-all duration-[var(--motion-fast)] hover:border-[var(--color-primary)] hover:bg-[rgb(var(--color-primary-rgb)/0.1)] hover:text-[var(--color-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-primary)]"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              حساب کاربری
            </Link>
          ) : null}

          <button
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? 'حالت روشن' : 'حالت تاریک'}
            className="flex items-center justify-center rounded-full p-2.5 text-[var(--text-primary)] transition-all duration-300 hover:bg-[var(--surface-2)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-primary)]"
          >
            <span
              className="inline-block transition-transform duration-300"
              style={{ transform: isDark ? 'rotate(180deg)' : 'rotate(0deg)' }}
            >
              {isDark ? (
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              ) : (
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
              )}
            </span>
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

      <div
        ref={mobileMenuRef}
        id="mobile-menu-panel"
        role="dialog"
        aria-label="منوی ناوبری"
        aria-hidden={!isMobileMenuOpen}
        className={`lg:hidden border-t border-[var(--border-light)] bg-[var(--surface-1)]/95 backdrop-blur-xl overflow-hidden transition-[max-height,opacity,transform] duration-300 ease-in-out ${
          isMobileMenuOpen
            ? 'max-h-[80vh] opacity-100 translate-y-0'
            : 'max-h-0 opacity-0 translate-y-2 border-t-0 pointer-events-none'
        }`}
      >
        <Container className="space-y-2 py-4">
          <Link
            href="/search"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center gap-3 rounded-[var(--radius-md)] border border-[var(--color-primary-rgb)/0.35] bg-[rgb(var(--color-primary-rgb)/0.08)] px-4 py-3 text-sm font-bold text-[var(--color-primary)] transition-all duration-[var(--motion-fast)]"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            جستجوی ابزارها
          </Link>
          <div className="px-2 text-xs font-bold text-[var(--text-muted)]">محصول</div>
          {productNavItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setIsMobileMenuOpen(false)}
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
          {isAccountEnabled && (
            <>
              <div className="px-2 pt-2 text-xs font-bold text-[var(--text-muted)]">
                حساب کاربری
              </div>
              <Link
                href="/account"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`${mobileNavLinkBaseClasses} ${
                  isPathActive(pathname, '/account')
                    ? 'border-[rgb(var(--color-primary-rgb)/0.35)] bg-[rgb(var(--color-primary-rgb)/0.1)] text-[var(--color-primary)]'
                    : 'border-transparent text-[var(--text-primary)] hover:bg-[var(--surface-2)]'
                }`}
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                حساب کاربری
              </Link>
            </>
          )}
        </Container>
      </div>
    </header>
  );
}
