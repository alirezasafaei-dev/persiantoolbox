'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Container from '@/shared/ui/Container';
import { IconMenu, IconX } from '@/shared/ui/icons';
import {
  flagshipDropdown,
  primaryNavLinks,
  utilityDropdown,
  utilityGroups,
  type NavDropdownGroup,
  type NavItem,
} from '@/lib/navigation';

const isAccountEnabled =
  process.env['NEXT_PUBLIC_FEATURE_ACCOUNT_ENABLED'] !== '0' &&
  process.env['NEXT_PUBLIC_FEATURE_ACCOUNT_ENABLED'] !== 'false';

function isPathActive(pathname: string, href: string): boolean {
  if (href.startsWith('http')) {
    return false;
  }
  if (href === '/') {
    return pathname === '/';
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function DropdownGroup({ group }: { group: NavDropdownGroup }) {
  return (
    <div className="py-1">
      <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
        {group.label}
      </div>
      {group.items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="block px-3 py-2 text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-[rgb(var(--color-primary-rgb)/0.08)] hover:text-[var(--color-primary)] rounded-lg"
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}

function DesktopDropdown({
  label,
  groups,
  extraLinks,
}: {
  label: string;
  groups: NavDropdownGroup[];
  extraLinks?: NavItem[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const open = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    timeoutRef.current = setTimeout(() => setIsOpen(false), 150);
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    document.addEventListener('keydown', onEscape);
    return () => document.removeEventListener('keydown', onEscape);
  }, [isOpen]);

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={open}
      onMouseLeave={close}
      onFocus={open}
      onBlur={(e) => {
        if (!containerRef.current?.contains(e.relatedTarget as Node)) {
          close();
        }
      }}
    >
      <button
        type="button"
        aria-expanded={isOpen}
        aria-haspopup="true"
        className="flex items-center gap-1 rounded-full px-3 py-2 text-sm font-bold text-[var(--text-primary)] transition-all duration-[var(--motion-fast)] hover:bg-[var(--surface-2)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
      >
        {label}
        <svg
          className={`h-3 w-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen ? (
        <div
          role="menu"
          className="absolute top-full right-0 z-50 mt-2 min-w-[240px] rounded-2xl border border-[var(--border-light)] bg-[var(--surface-1)] p-2 shadow-[0_8px_30px_rgb(0,0,0,0.12)]"
        >
          {groups.map((group) => (
            <DropdownGroup key={group.label} group={group} />
          ))}
          {extraLinks && extraLinks.length > 0 ? (
            <div className="border-t border-[var(--border-light)] py-1">
              {extraLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block px-3 py-2 text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-[rgb(var(--color-primary-rgb)/0.08)] hover:text-[var(--color-primary)] rounded-lg"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export default function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<Record<string, boolean>>({});
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

  const toggleMobileSection = (key: string) => {
    setMobileExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <header
      className="sticky top-0 z-50 border-b border-[var(--border-light)] bg-[var(--surface-1)]/85 backdrop-blur-xl shadow-[var(--shadow-subtle)]"
      role="banner"
    >
      <Container className="flex items-center justify-between gap-2 py-3">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-lg p-1.5 text-[var(--text-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-primary)] shadow-[var(--shadow-subtle)] overflow-hidden">
            <Image
              src="/icon-128.png"
              alt=""
              width={28}
              height={28}
              className="h-7 w-7"
              aria-hidden="true"
            />
          </span>
          <span className="hidden flex-col sm:flex">
            <span className="text-lg font-black leading-tight">جعبه ابزار فارسی</span>
            <span className="text-[10px] font-medium text-[var(--text-muted)]">
              ابزارهای آنلاین رایگان
            </span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-0.5" aria-label="ناوبری اصلی">
          <DesktopDropdown
            label={utilityDropdown.label}
            groups={utilityDropdown.groups}
            extraLinks={[{ label: 'همه ابزارهای رایگان', href: '/topics', role: 'discover' }]}
          />

          <DesktopDropdown label={flagshipDropdown.label} groups={flagshipDropdown.groups} />

          {primaryNavLinks.map((item) => {
            const navLinkClass = [
              'rounded-full px-3 py-2 text-sm font-bold transition-all duration-[var(--motion-fast)]',
              'hover:bg-[var(--surface-2)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]',
              isPathActive(pathname, item.href)
                ? 'text-[var(--color-primary)]'
                : 'text-[var(--text-primary)]',
            ].join(' ');
            return (
              <Link key={item.href} href={item.href} className={navLinkClass}>
                {item.label}
              </Link>
            );
          })}

          <Link
            href="/search"
            className="flex items-center gap-1.5 rounded-full border border-[var(--border-light)] px-3 py-2 text-sm font-medium text-[var(--text-muted)] transition-all duration-[var(--motion-fast)] hover:border-[var(--color-primary)] hover:bg-[rgb(var(--color-primary-rgb)/0.1)] hover:text-[var(--color-primary)]"
          >
            <svg
              className="h-3.5 w-3.5"
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
          </Link>
        </nav>

        <div className="flex items-center gap-1.5">
          <Link
            href="/topics"
            className="hidden md:flex items-center rounded-full bg-[var(--color-primary)] px-4 py-2 text-sm font-black text-white transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-1)]"
          >
            شروع رایگان
          </Link>

          {isAccountEnabled ? (
            <Link
              href="/account"
              className="hidden sm:flex items-center gap-1.5 rounded-full border border-[var(--border-light)] px-3 py-2 text-sm font-bold text-[var(--text-primary)] transition-all duration-[var(--motion-fast)] hover:border-[var(--color-primary)] hover:bg-[rgb(var(--color-primary-rgb)/0.1)] hover:text-[var(--color-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
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
              حساب
            </Link>
          ) : null}

          <button
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? 'حالت روشن' : 'حالت تاریک'}
            className="flex items-center justify-center rounded-full p-2 text-[var(--text-primary)] transition-all duration-300 hover:bg-[var(--surface-2)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
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
            className="lg:hidden flex items-center gap-2 rounded-full p-2 text-[var(--text-primary)] transition-all duration-[var(--motion-fast)] hover:bg-[var(--surface-2)]"
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
        <Container className="space-y-1 py-4">
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
            جستجوی ابزارهای رایگان
          </Link>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => toggleMobileSection('utility')}
              className="flex w-full items-center justify-between px-3 py-2 text-sm font-bold text-[var(--text-muted)]"
              aria-expanded={mobileExpanded['utility'] ?? false}
            >
              ابزارهای رایگان
              <svg
                className={`h-4 w-4 transition-transform duration-200 ${mobileExpanded['utility'] ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {(mobileExpanded['utility'] ?? false) ? (
              <div className="space-y-1 ps-2">
                {utilityGroups.map((group) => (
                  <div key={group.label}>
                    <div className="px-3 py-1.5 text-xs font-bold text-[var(--text-muted)]">
                      {group.label}
                    </div>
                    {group.items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center gap-3 rounded-full border px-4 py-3 text-sm font-semibold transition-all duration-[var(--motion-fast)] ${
                          isPathActive(pathname, item.href)
                            ? 'border-[rgb(var(--color-primary-rgb)/0.35)] bg-[rgb(var(--color-primary-rgb)/0.1)] text-[var(--color-primary)]'
                            : 'border-transparent text-[var(--text-primary)] hover:bg-[var(--surface-2)]'
                        }`}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                ))}
                <Link
                  href="/topics"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-full border border-transparent px-4 py-3 text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--surface-2)]"
                >
                  همه ابزارهای رایگان
                </Link>
              </div>
            ) : null}
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => toggleMobileSection('flagship')}
              className="flex w-full items-center justify-between px-3 py-2 text-sm font-bold text-[var(--text-muted)]"
              aria-expanded={mobileExpanded['flagship'] ?? false}
            >
              خروجی حرفه‌ای
              <svg
                className={`h-4 w-4 transition-transform duration-200 ${mobileExpanded['flagship'] ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {(mobileExpanded['flagship'] ?? false) ? (
              <div className="space-y-1 ps-2">
                {flagshipDropdown.groups[0]?.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 rounded-full border px-4 py-3 text-sm font-semibold transition-all duration-[var(--motion-fast)] ${
                      isPathActive(pathname, item.href)
                        ? 'border-[rgb(var(--color-primary-rgb)/0.35)] bg-[rgb(var(--color-primary-rgb)/0.1)] text-[var(--color-primary)]'
                        : 'border-transparent text-[var(--text-primary)] hover:bg-[var(--surface-2)]'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            ) : null}
          </div>

          <div className="pt-1">
            {primaryNavLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 rounded-full border px-4 py-3 text-sm font-semibold transition-all duration-[var(--motion-fast)] ${
                  isPathActive(pathname, item.href)
                    ? 'border-[rgb(var(--color-primary-rgb)/0.35)] bg-[rgb(var(--color-primary-rgb)/0.1)] text-[var(--color-primary)]'
                    : 'border-transparent text-[var(--text-primary)] hover:bg-[var(--surface-2)]'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {isAccountEnabled ? (
            <div className="border-t border-[var(--border-light)] pt-2">
              <Link
                href="/account"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 rounded-full border px-4 py-3 text-sm font-semibold transition-all duration-[var(--motion-fast)] ${isPathActive(pathname, '/account') ? 'border-[rgb(var(--color-primary-rgb)/0.35)] bg-[rgb(var(--color-primary-rgb)/0.1)] text-[var(--color-primary)]' : 'border-transparent text-[var(--text-primary)] hover:bg-[var(--surface-2)]'}`}
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
            </div>
          ) : null}
        </Container>
      </div>
    </header>
  );
}
