'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import Container from '@/shared/ui/Container';
import {
  IconPdf,
  IconImage,
  IconCalculator,
  IconMenu,
  IconX,
  IconCalendar,
  IconZap,
  IconShield,
  IconChevronDown,
} from '@/shared/ui/icons';

const isV3NavEnabled = process.env['NEXT_PUBLIC_FEATURE_V3_NAV'] === '1';

const v2NavItems = [
  { label: 'ابزارهای PDF', href: '/pdf-tools', icon: IconPdf },
  { label: 'ابزارهای تصویر', href: '/image-tools', icon: IconImage },
  { label: 'ابزارهای مالی', href: '/tools', icon: IconCalculator },
  { label: 'ابزارهای تاریخ', href: '/date-tools', icon: IconCalendar },
  { label: 'ابزارهای متنی', href: '/text-tools', icon: IconZap },
  { label: 'ابزارهای اعتبارسنجی', href: '/validation-tools', icon: IconShield },
];

const v3NavItems = [
  { label: 'همه ابزارها', href: '/tools', icon: IconCalculator },
  { label: 'موضوعات', href: '/topics', icon: IconCalendar },
  { label: 'PDF', href: '/pdf-tools', icon: IconPdf },
  { label: 'تصویر', href: '/image-tools', icon: IconImage },
];

const authorityItems = [
  { label: 'درباره ما', href: '/about' },
  { label: 'نحوه کار', href: '/how-it-works' },
  { label: 'حریم خصوصی', href: '/privacy' },
];

const navItems = isV3NavEnabled ? v3NavItems : v2NavItems;

export default function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header
      className="sticky top-0 z-50 border-b border-[var(--border-light)] bg-[var(--surface-1)]/90 backdrop-blur-xl shadow-[var(--shadow-subtle)]"
      role="banner"
    >
      <Container className="flex items-center justify-between gap-3 py-4">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-lg p-2 text-[var(--text-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
        >
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-primary)] text-[var(--text-inverted)] shadow-[var(--shadow-subtle)]">
            <span className="text-sm font-bold">P</span>
          </span>
          <span className="text-xl font-black">جعبه ابزار فارسی</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-2" aria-label="Main navigation">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center gap-2 rounded-full border border-transparent px-4 py-2.5 text-sm font-bold text-[var(--text-primary)] transition-all duration-[var(--motion-fast)] hover:border-[var(--border-light)] hover:bg-[var(--surface-2)]"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        <nav className="hidden lg:flex items-center gap-2" aria-label="Trust navigation">
          {authorityItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full border border-[var(--border-light)] px-3 py-2 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex items-center">
          <Link href="/tools" className="btn btn-primary btn-md px-5">
            <IconChevronDown className="h-4 w-4 rotate-90" />
            همه ابزارها
          </Link>
        </div>

        <motion.button
          data-testid="mobile-menu"
          aria-label={isMobileMenuOpen ? 'بستن منوی ناوبری' : 'باز کردن منوی ناوبری'}
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-menu-panel"
          className="lg:hidden flex items-center gap-2 rounded-full p-2.5 text-[var(--text-primary)] transition-all duration-[var(--motion-fast)] hover:bg-[var(--surface-2)]"
          onClick={() => setIsMobileMenuOpen((value) => !value)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <AnimatePresence mode="wait">
            {isMobileMenuOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <IconX className="h-6 w-6" />
              </motion.div>
            ) : (
              <motion.div
                key="menu"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <IconMenu className="h-6 w-6" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </Container>

      <AnimatePresence>
        {isMobileMenuOpen ? (
          <motion.div
            id="mobile-menu-panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden border-t border-[var(--border-light)] bg-[var(--surface-1)]/95 backdrop-blur-xl"
          >
            <Container className="space-y-2 py-4">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex items-center gap-3 rounded-full px-4 py-3 text-sm font-semibold text-[var(--text-primary)] transition-all duration-[var(--motion-fast)] hover:bg-[var(--surface-2)]"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
              {authorityItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 rounded-full px-4 py-3 text-sm font-semibold text-[var(--text-primary)] transition-all duration-[var(--motion-fast)] hover:bg-[var(--surface-2)]"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <div className="pt-1">
                <Link
                  href="/tools"
                  className="btn btn-primary btn-md w-full justify-center"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  همه ابزارها
                </Link>
              </div>
            </Container>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
