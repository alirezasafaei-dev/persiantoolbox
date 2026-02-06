'use client';

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FocusEvent,
  type ReactNode,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Container from '@/shared/ui/Container';
import ButtonLink from '@/shared/ui/ButtonLink';
import { tokens, withAlpha } from '@/shared/constants/tokens';
import { getUsageSnapshot } from '@/shared/analytics/localUsage';
import { clearFavorites, getFavorites, toggleFavorite } from '@/shared/analytics/favorites';
import {
  IconPdf,
  IconImage,
  IconCalculator,
  IconMoney,
  IconChevronDown,
  IconMenu,
  IconX,
  IconCalendar,
  IconZap,
  IconShield,
  IconStar,
} from '@/shared/ui/icons';

export default function Navigation() {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [favoritePaths, setFavoritePaths] = useState<string[]>([]);
  const [recentPaths, setRecentPaths] = useState<string[]>([]);
  const [usageCounts, setUsageCounts] = useState<Record<string, number>>({});
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const searchDialogRef = useRef<HTMLDivElement | null>(null);
  const searchCloseRef = useRef<HTMLButtonElement | null>(null);
  const hasQuery = searchQuery.trim().length > 0;

  const searchItems = useMemo(
    () => [
      {
        title: 'همه ابزارها',
        description: 'داشبورد کامل ابزارها',
        href: '/tools',
        category: 'عمومی',
        icon: <IconChevronDown className="h-4 w-4 rotate-90 text-[var(--color-primary)]" />,
      },
      {
        title: 'ابزارهای PDF',
        description: 'ادغام، تقسیم و تبدیل PDF',
        href: '/pdf-tools',
        category: 'PDF',
        icon: <IconPdf className="h-4 w-4 text-[var(--color-danger)]" />,
      },
      {
        title: 'ادغام PDF',
        description: 'چند فایل را ترکیب کنید',
        href: '/pdf-tools/merge/merge-pdf',
        category: 'PDF',
        icon: <IconPdf className="h-4 w-4 text-[var(--color-danger)]" />,
      },
      {
        title: 'فشرده‌سازی PDF',
        description: 'کاهش حجم فایل‌های PDF',
        href: '/pdf-tools/compress/compress-pdf',
        category: 'PDF',
        icon: <IconPdf className="h-4 w-4 text-[var(--color-danger)]" />,
      },
      {
        title: 'ابزارهای تصویر',
        description: 'فشرده‌سازی و تبدیل تصویر',
        href: '/image-tools',
        category: 'تصویر',
        icon: <IconImage className="h-4 w-4 text-[var(--color-info)]" />,
      },
      {
        title: 'ابزارهای تاریخ',
        description: 'تبدیل تاریخ و محاسبات شمسی',
        href: '/date-tools',
        category: 'تاریخ',
        icon: <IconCalendar className="h-4 w-4 text-[var(--color-warning)]" />,
      },
      {
        title: 'ابزارهای متنی',
        description: 'نرمال‌سازی و تبدیل متن',
        href: '/text-tools',
        category: 'متن',
        icon: <IconZap className="h-4 w-4 text-[var(--color-info)]" />,
      },
      {
        title: 'اعتبارسنجی داده‌ها',
        description: 'کد ملی، موبایل و شبا',
        href: '/validation-tools',
        category: 'اعتبارسنجی',
        icon: <IconShield className="h-4 w-4 text-[var(--color-success)]" />,
      },
      {
        title: 'محاسبه‌گر وام',
        description: 'اقساط ماهانه و سود کل',
        href: '/loan',
        category: 'مالی',
        icon: <IconCalculator className="h-4 w-4 text-[var(--color-primary)]" />,
      },
      {
        title: 'محاسبه‌گر حقوق',
        description: 'حقوق خالص و کسورات',
        href: '/salary',
        category: 'مالی',
        icon: <IconMoney className="h-4 w-4 text-[var(--color-success)]" />,
      },
    ],
    [],
  );

  const filteredSearchItems = useMemo(() => {
    const term = searchQuery.trim();
    if (!term) {
      return searchItems;
    }
    return searchItems.filter(
      (item) => item.title.includes(term) || item.description.includes(term),
    );
  }, [searchItems, searchQuery]);

  const groupedSearchItems = useMemo(() => {
    return filteredSearchItems.reduce<Record<string, typeof filteredSearchItems>>((acc, item) => {
      const key = item.category;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item);
      return acc;
    }, {});
  }, [filteredSearchItems]);

  const favoriteItems = useMemo(() => {
    if (!favoritePaths.length) {
      return [];
    }
    return favoritePaths
      .map((path) => searchItems.find((item) => item.href === path))
      .filter(Boolean) as typeof searchItems;
  }, [favoritePaths, searchItems]);

  const recentItems = useMemo(() => {
    if (!recentPaths.length) {
      return [];
    }
    return recentPaths
      .map((path) => searchItems.find((item) => item.href === path))
      .filter(Boolean) as typeof searchItems;
  }, [recentPaths, searchItems]);

  const orderedSearchItems = useMemo(() => {
    if (searchQuery.trim()) {
      return filteredSearchItems;
    }
    const favoriteSet = new Set(favoriteItems.map((item) => item.href));
    const recentSet = new Set(recentItems.map((item) => item.href));
    const rest = searchItems.filter(
      (item) => !favoriteSet.has(item.href) && !recentSet.has(item.href),
    );
    return [...favoriteItems, ...recentItems, ...rest];
  }, [favoriteItems, filteredSearchItems, recentItems, searchItems, searchQuery]);

  useEffect(() => {
    setActiveIndex(0);
  }, [searchQuery]);

  useEffect(() => {
    if (!orderedSearchItems.length) {
      setActiveIndex(0);
      return;
    }
    setActiveIndex((prev) => Math.min(prev, orderedSearchItems.length - 1));
  }, [orderedSearchItems.length]);

  const groupedRestItems = useMemo(() => {
    const favoriteSet = new Set(favoriteItems.map((item) => item.href));
    const recentSet = new Set(recentItems.map((item) => item.href));
    const rest = searchItems.filter(
      (item) => !favoriteSet.has(item.href) && !recentSet.has(item.href),
    );
    return rest.reduce<Record<string, typeof rest>>((acc, item) => {
      const key = item.category;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item);
      return acc;
    }, {});
  }, [favoriteItems, recentItems, searchItems]);

  const renderSearchItem = (item: {
    title: string;
    description: string;
    href: string;
    category: string;
    icon: ReactNode;
  }) => {
    const index = orderedSearchItems.findIndex((searchItem) => searchItem.href === item.href);
    const isActive = index === activeIndex;
    const isFavorite = favoritePaths.includes(item.href);

    return (
      <Link
        key={item.href}
        href={item.href}
        className={[
          'flex items-center gap-3 rounded-[var(--radius-md)] border px-4 py-3 text-right transition-all duration-[var(--motion-fast)]',
          isActive
            ? 'border-[var(--color-primary)] bg-[var(--bg-subtle)]'
            : 'border-transparent hover:border-[var(--border-light)] hover:bg-[var(--bg-subtle)]',
        ].join(' ')}
        onClick={() => setIsSearchOpen(false)}
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] bg-[var(--bg-subtle)]">
          {item.icon}
        </div>
        <div className="flex flex-1 flex-col gap-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-bold text-[var(--text-primary)]">{item.title}</span>
            {(() => {
              const count = usageCounts[item.href];
              return count ? (
                <span className="text-[10px] font-semibold text-[var(--text-muted)]">
                  {count.toLocaleString('fa-IR')} بازدید
                </span>
              ) : null;
            })()}
          </div>
          <span className="text-xs text-[var(--text-muted)]">{item.description}</span>
        </div>
        <button
          type="button"
          className={[
            'rounded-full border px-2 py-1 text-xs transition-all duration-[var(--motion-fast)]',
            isFavorite
              ? 'border-[var(--color-warning)] text-[var(--color-warning)]'
              : 'border-[var(--border-light)] text-[var(--text-muted)] hover:text-[var(--color-warning)]',
          ].join(' ')}
          aria-label={isFavorite ? 'حذف از علاقه‌مندی‌ها' : 'افزودن به علاقه‌مندی‌ها'}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            const updated = toggleFavorite(item.href);
            setFavoritePaths(updated);
          }}
        >
          <IconStar className="h-4 w-4" filled={isFavorite} />
        </button>
        <span className="text-xs text-[var(--text-muted)]">↵</span>
      </Link>
    );
  };

  const toggleDropdown = (menu: string) => {
    setOpenDropdown(openDropdown === menu ? null : menu);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    setOpenDropdown(null);
  };

  const handleMenuBlur = (menu: string) => (event: FocusEvent<HTMLElement>) => {
    if (openDropdown !== menu) {
      return;
    }
    if (event.currentTarget.contains(event.relatedTarget as Node | null)) {
      return;
    }
    setOpenDropdown(null);
  };

  const handleMenuKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (event.key === 'Escape') {
      setOpenDropdown(null);
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setIsSearchOpen(true);
      }
      if (event.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown as EventListener);
    return () => document.removeEventListener('keydown', handleKeyDown as EventListener);
  }, []);

  useEffect(() => {
    if (!isSearchOpen) {
      return;
    }
    setActiveIndex(0);
    const snapshot = getUsageSnapshot();
    setFavoritePaths(getFavorites());
    setUsageCounts(snapshot.paths ?? {});
    const sortedRecent = Object.entries(snapshot.paths ?? {})
      .sort((a, b) => b[1] - a[1])
      .map(([path]) => path)
      .filter((path) => searchItems.some((item) => item.href === path))
      .slice(0, 5);
    setRecentPaths(sortedRecent);
    const previousActive = document.activeElement as HTMLElement | null;
    const timer = setTimeout(() => {
      searchInputRef.current?.focus();
    }, 0);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') {
        return;
      }
      const container = searchDialogRef.current;
      if (!container) {
        return;
      }
      const focusables = Array.from(
        container.querySelectorAll<HTMLElement>(
          'a[href],button:not([disabled]),input:not([disabled]),[tabindex="0"]',
        ),
      );
      if (!focusables.length) {
        return;
      }
      const first = focusables[0];
      if (!first) {
        return;
      }
      const last = focusables[focusables.length - 1];
      if (!last) {
        return;
      }
      if (!first || !last) {
        return;
      }
      if (event.shiftKey && document.activeElement === first) {
        last.focus();
        event.preventDefault();
      } else if (!event.shiftKey && document.activeElement === last) {
        first.focus();
        event.preventDefault();
      }
    };

    document.addEventListener('keydown', handleKeyDown as EventListener);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('keydown', handleKeyDown as EventListener);
      previousActive?.focus();
    };
  }, [isSearchOpen, searchItems]);

  const dropdownVariants = {
    hidden: {
      opacity: 0,
      y: -10,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.2,
        ease: [0.25, 0.1, 0.25, 1.0] as const,
      },
    },
    exit: {
      opacity: 0,
      y: -10,
      scale: 0.95,
      transition: {
        duration: 0.15,
      },
    },
  };

  const mobileMenuVariants = {
    hidden: {
      opacity: 0,
      height: 0,
      y: -20,
    },
    visible: {
      opacity: 1,
      height: 'auto',
      y: 0,
      transition: {
        duration: 0.3,
        ease: [0.25, 0.1, 0.25, 1.0] as const,
      },
    },
    exit: {
      opacity: 0,
      height: 0,
      y: -20,
      transition: {
        duration: 0.2,
      },
    },
  };

  return (
    <>
      <header
        className="sticky top-0 z-50 border-b border-[var(--border-light)] bg-[var(--surface-1)]/85 backdrop-blur-2xl shadow-[var(--shadow-medium)]"
        role="banner"
      >
        <Container className="flex flex-wrap items-center justify-between gap-3 py-4">
          {/* Logo */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              href="/"
              className={[
                'flex items-center gap-3 text-[var(--text-primary)] group',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]',
                'focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-primary)] rounded-lg p-2',
              ].join(' ')}
            >
              <motion.span
                className="inline-flex h-10 w-10 items-center justify-center rounded-full shadow-[var(--shadow-medium)]"
                style={{
                  backgroundColor: tokens.color.primary.DEFAULT,
                  color: tokens.color.text.inverted,
                }}
                animate={{
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                aria-hidden="true"
              >
                <span className="text-sm font-bold">P</span>
              </motion.span>
              <span className="text-xl font-black text-[var(--text-primary)]">
                جعبه ابزار فارسی
              </span>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <nav
            className="hidden lg:flex items-center gap-2"
            role="navigation"
            aria-label="Main navigation"
          >
            {/* PDF Tools Dropdown */}
            <div
              className="relative group"
              onFocusCapture={() => setOpenDropdown('pdf')}
              onBlurCapture={handleMenuBlur('pdf')}
            >
              <motion.button
                className="flex items-center gap-2 rounded-full border border-transparent px-4 py-2.5 text-sm font-bold text-[var(--text-primary)] transition-all duration-[var(--motion-medium)] hover:border-[var(--border-light)] hover:bg-[var(--surface-1)]/85 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-primary)]"
                onMouseEnter={() => setOpenDropdown('pdf')}
                onMouseLeave={() => setOpenDropdown(null)}
                onKeyDown={handleMenuKeyDown}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-expanded={openDropdown === 'pdf'}
                aria-haspopup="true"
                aria-controls="pdf-dropdown-menu"
                id="pdf-dropdown-button"
              >
                <IconPdf className="h-4 w-4" />
                ابزارهای PDF
                <motion.div
                  animate={{ rotate: openDropdown === 'pdf' ? 180 : 0 }}
                  transition={{ duration: parseFloat(tokens.motion.duration.fast) }}
                >
                  <IconChevronDown className="h-3 w-3" />
                </motion.div>
              </motion.button>

              <AnimatePresence>
                {openDropdown === 'pdf' && (
                  <motion.div
                    variants={dropdownVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="absolute top-full left-0 mt-2 w-80 rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)]/96 shadow-[var(--shadow-strong)] backdrop-blur-xl py-4 overflow-hidden"
                    onMouseEnter={() => setOpenDropdown('pdf')}
                    onMouseLeave={() => setOpenDropdown(null)}
                    role="menu"
                    aria-labelledby="pdf-dropdown-button"
                    id="pdf-dropdown-menu"
                  >
                    <Link
                      href="/pdf-tools"
                      className="mx-2 flex items-center gap-3 rounded-lg px-4 py-3 text-sm transition-all duration-[var(--motion-fast)] text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--color-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-primary)]"
                      onClick={closeMobileMenu}
                      role="menuitem"
                    >
                      <motion.div
                        className="flex items-center justify-center w-8 h-8 rounded-full transition-colors"
                        style={{ backgroundColor: withAlpha(tokens.color.statusRgb.danger, 0.2) }}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = withAlpha(
                            tokens.color.statusRgb.danger,
                            0.3,
                          );
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = withAlpha(
                            tokens.color.statusRgb.danger,
                            0.2,
                          );
                        }}
                      >
                        <IconPdf className="h-4 w-4" />
                      </motion.div>
                      <div className="flex-1">
                        <div className="font-bold">همه ابزارهای PDF</div>
                        <div className="text-xs" style={{ color: tokens.color.text.muted }}>
                          تبدیل، فشرده‌سازی، ادغام و...
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Image Tools Dropdown */}
            <div
              className="relative group"
              onFocusCapture={() => setOpenDropdown('image')}
              onBlurCapture={handleMenuBlur('image')}
            >
              <motion.button
                className="flex items-center gap-2 rounded-full border border-transparent px-4 py-2.5 text-sm font-bold text-[var(--text-primary)] transition-all duration-[var(--motion-medium)] hover:border-[var(--border-light)] hover:bg-[var(--surface-1)]/85 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-primary)]"
                onMouseEnter={() => setOpenDropdown('image')}
                onMouseLeave={() => setOpenDropdown(null)}
                onKeyDown={handleMenuKeyDown}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-expanded={openDropdown === 'image'}
                aria-haspopup="true"
                aria-controls="image-dropdown-menu"
                id="image-dropdown-button"
              >
                <IconImage className="h-4 w-4" />
                ابزارهای تصویر
                <motion.div
                  animate={{ rotate: openDropdown === 'image' ? 180 : 0 }}
                  transition={{ duration: parseFloat(tokens.motion.duration.fast) }}
                >
                  <IconChevronDown className="h-3 w-3" />
                </motion.div>
              </motion.button>

              <AnimatePresence>
                {openDropdown === 'image' && (
                  <motion.div
                    variants={dropdownVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="absolute top-full left-0 mt-2 w-80 rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)]/96 shadow-[var(--shadow-strong)] backdrop-blur-xl py-4 overflow-hidden"
                    onMouseEnter={() => setOpenDropdown('image')}
                    onMouseLeave={() => setOpenDropdown(null)}
                    role="menu"
                    aria-labelledby="image-dropdown-button"
                    id="image-dropdown-menu"
                  >
                    <Link
                      href="/image-tools"
                      className="mx-2 flex items-center gap-3 rounded-lg px-4 py-3 text-sm transition-all duration-[var(--motion-fast)] text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--color-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-primary)]"
                      onClick={closeMobileMenu}
                      role="menuitem"
                    >
                      <motion.div
                        className="flex items-center justify-center w-8 h-8 rounded-full transition-colors"
                        style={{ backgroundColor: withAlpha(tokens.color.statusRgb.info, 0.2) }}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = withAlpha(
                            tokens.color.statusRgb.info,
                            0.3,
                          );
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = withAlpha(
                            tokens.color.statusRgb.info,
                            0.2,
                          );
                        }}
                      >
                        <IconImage className="h-4 w-4" />
                      </motion.div>
                      <div className="flex-1">
                        <div className="font-bold">ابزارهای تصویر</div>
                        <div className="text-xs" style={{ color: tokens.color.text.muted }}>
                          فشرده‌سازی و بهینه‌سازی تصویر
                        </div>
                      </div>
                    </Link>
                    <div className="border-t border-[var(--border-light)]/50 my-2"></div>
                    <div
                      className="px-4 py-2 text-xs font-bold uppercase tracking-wider"
                      style={{ color: tokens.color.text.muted }}
                    >
                      ابزارهای دیگر
                    </div>
                    <button
                      type="button"
                      className="flex items-center gap-3 px-4 py-3 text-sm transition-colors group cursor-not-allowed"
                      style={{ color: tokens.color.text.muted }}
                      disabled
                      aria-disabled="true"
                      role="menuitem"
                    >
                      <motion.div
                        className="flex items-center justify-center w-8 h-8 rounded-full"
                        style={{ backgroundColor: tokens.color.border.DEFAULT }}
                        whileHover={{ scale: 1.1 }}
                      >
                        <IconImage className="h-4 w-4" />
                      </motion.div>
                      <div className="flex-1">
                        <div className="font-bold">افزودن عکس به PDF</div>
                        <div className="text-xs" style={{ color: tokens.color.text.muted }}>
                          به زودی
                        </div>
                      </div>
                    </button>
                    <button
                      type="button"
                      className="flex items-center gap-3 px-4 py-3 text-sm transition-colors group cursor-not-allowed"
                      style={{ color: tokens.color.text.muted }}
                      disabled
                      aria-disabled="true"
                      role="menuitem"
                    >
                      <motion.div
                        className="flex items-center justify-center w-8 h-8 rounded-full"
                        style={{ backgroundColor: tokens.color.border.DEFAULT }}
                        whileHover={{ scale: 1.1 }}
                      >
                        <IconImage className="h-4 w-4" />
                      </motion.div>
                      <div className="flex-1">
                        <div className="font-bold">تبدیل PDF به عکس</div>
                        <div className="text-xs" style={{ color: tokens.color.text.muted }}>
                          به زودی
                        </div>
                      </div>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Financial Tools */}
            <div
              className="relative group"
              onFocusCapture={() => setOpenDropdown('financial')}
              onBlurCapture={handleMenuBlur('financial')}
            >
              <motion.button
                className="flex items-center gap-2 rounded-full border border-transparent px-4 py-2.5 text-sm font-bold text-[var(--text-primary)] transition-all duration-[var(--motion-medium)] hover:border-[var(--border-light)] hover:bg-[var(--surface-1)]/85"
                onMouseEnter={() => setOpenDropdown('financial')}
                onMouseLeave={() => setOpenDropdown(null)}
                onKeyDown={handleMenuKeyDown}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-expanded={openDropdown === 'financial'}
                aria-haspopup="true"
                aria-controls="financial-dropdown-menu"
                id="financial-dropdown-button"
              >
                <IconCalculator className="h-4 w-4" />
                ابزارهای مالی
                <motion.div
                  animate={{ rotate: openDropdown === 'financial' ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <IconChevronDown className="h-3 w-3" />
                </motion.div>
              </motion.button>

              <AnimatePresence>
                {openDropdown === 'financial' && (
                  <motion.div
                    variants={dropdownVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="absolute top-full left-0 mt-2 w-80 rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)]/96 shadow-[var(--shadow-strong)] backdrop-blur-xl py-4 overflow-hidden"
                    onMouseEnter={() => setOpenDropdown('financial')}
                    onMouseLeave={() => setOpenDropdown(null)}
                    role="menu"
                    aria-labelledby="financial-dropdown-button"
                    id="financial-dropdown-menu"
                  >
                    <Link
                      href="/loan"
                      className="flex items-center gap-3 px-4 py-3 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--color-primary)] transition-all duration-[var(--motion-fast)] group"
                      onClick={closeMobileMenu}
                      role="menuitem"
                    >
                      <motion.div
                        className="flex items-center justify-center w-8 h-8 rounded-full transition-colors"
                        style={{ backgroundColor: withAlpha(tokens.color.primaryRgb, 0.18) }}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                      >
                        <IconCalculator className="h-4 w-4 text-[var(--color-primary)]" />
                      </motion.div>
                      <div className="flex-1">
                        <div className="font-bold">محاسبه‌گر وام</div>
                        <div className="text-xs text-[var(--text-muted)]">محاسبه قسط و سود وام</div>
                      </div>
                    </Link>
                    <Link
                      href="/salary"
                      className="flex items-center gap-3 px-4 py-3 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--color-primary)] transition-all duration-[var(--motion-fast)] group"
                      onClick={closeMobileMenu}
                      role="menuitem"
                    >
                      <motion.div
                        className="flex items-center justify-center w-8 h-8 rounded-full transition-colors"
                        style={{ backgroundColor: withAlpha(tokens.color.statusRgb.success, 0.18) }}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                      >
                        <IconMoney className="h-4 w-4 text-[var(--color-success)]" />
                      </motion.div>
                      <div className="flex-1">
                        <div className="font-bold">محاسبه‌گر حقوق</div>
                        <div className="text-xs text-[var(--text-muted)]">محاسبه حقوق و بیمه</div>
                      </div>
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Tools Dashboard */}
            <div className="relative group">
              <Link
                href="/tools"
                className="flex items-center gap-2 rounded-full border border-transparent px-4 py-2.5 text-sm font-bold text-[var(--text-primary)] transition-all duration-[var(--motion-medium)] hover:border-[var(--border-light)] hover:bg-[var(--surface-1)]/85"
              >
                <IconChevronDown className="h-4 w-4 rotate-90" />
                همه ابزارها
              </Link>
            </div>

            {/* Date Tools */}
            <div className="relative group">
              <Link
                href="/date-tools"
                className="flex items-center gap-2 rounded-full border border-transparent px-4 py-2.5 text-sm font-bold text-[var(--text-primary)] transition-all duration-[var(--motion-medium)] hover:border-[var(--border-light)] hover:bg-[var(--surface-1)]/85"
              >
                <IconCalendar className="h-4 w-4" />
                ابزارهای تاریخ
              </Link>
            </div>

            {/* Text Tools */}
            <div className="relative group">
              <Link
                href="/text-tools"
                className="flex items-center gap-2 rounded-full border border-transparent px-4 py-2.5 text-sm font-bold text-[var(--text-primary)] transition-all duration-[var(--motion-medium)] hover:border-[var(--border-light)] hover:bg-[var(--surface-1)]/85"
              >
                <IconZap className="h-4 w-4" />
                ابزارهای متنی
              </Link>
            </div>

            {/* Validation Tools */}
            <div className="relative group">
              <Link
                href="/validation-tools"
                className="flex items-center gap-2 rounded-full border border-transparent px-4 py-2.5 text-sm font-bold text-[var(--text-primary)] transition-all duration-[var(--motion-medium)] hover:border-[var(--border-light)] hover:bg-[var(--surface-1)]/85"
              >
                <IconShield className="h-4 w-4" />
                ابزارهای اعتبارسنجی
              </Link>
            </div>

            {/* Developers */}
            <div className="relative group">
              <Link
                href="/developers"
                className="flex items-center gap-2 rounded-full border border-transparent px-4 py-2.5 text-sm font-bold text-[var(--text-primary)] transition-all duration-[var(--motion-medium)] hover:border-[var(--border-light)] hover:bg-[var(--surface-1)]/85"
              >
                <IconZap className="h-4 w-4" />
                توسعه‌دهندگان
              </Link>
            </div>
          </nav>

          <form
            action="/tools"
            method="get"
            className="hidden lg:flex items-center gap-2 rounded-full border border-[var(--border-light)] bg-[var(--surface-1)]/80 px-3 py-2 shadow-[var(--shadow-subtle)]"
          >
            <input
              type="search"
              name="query"
              placeholder="جستجوی ابزار..."
              className="w-44 bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none"
              aria-label="جستجوی ابزارها"
            />
            <button type="submit" className="text-xs font-semibold text-[var(--color-primary)]">
              جستجو
            </button>
          </form>

          <div className="hidden lg:flex items-center gap-3">
            <ButtonLink href="/tools" size="sm" variant="secondary" className="px-4">
              همه ابزارها
            </ButtonLink>
            <ButtonLink href="/pdf-tools" size="sm" className="px-4">
              شروع سریع
            </ButtonLink>
            <ButtonLink href="/date-tools" size="sm" variant="secondary" className="px-4">
              ابزارهای تاریخ
            </ButtonLink>
            <ButtonLink href="/text-tools" size="sm" variant="tertiary" className="px-4">
              ابزارهای متنی
            </ButtonLink>
            <ButtonLink href="/validation-tools" size="sm" variant="tertiary" className="px-4">
              اعتبارسنجی
            </ButtonLink>
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            data-testid="mobile-menu"
            aria-label={isMobileMenuOpen ? 'بستن منوی ناوبری' : 'باز کردن منوی ناوبری'}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu-panel"
            className="lg:hidden flex items-center gap-2 text-[var(--text-primary)] p-2.5 rounded-full hover:bg-[var(--surface-1)]/85 transition-all duration-[var(--motion-fast)]"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
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

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              variants={mobileMenuVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              id="mobile-menu-panel"
              className="lg:hidden border-t border-[var(--border-light)] bg-[var(--surface-1)]/85 backdrop-blur-xl"
            >
              <Container className="py-4 space-y-2">
                <form action="/tools" method="get" className="px-2">
                  <label htmlFor="mobile-tools-search" className="sr-only">
                    جستجوی ابزارها
                  </label>
                  <div className="flex items-center gap-2 rounded-full border border-[var(--border-light)] bg-[var(--surface-1)]/90 px-4 py-2">
                    <input
                      id="mobile-tools-search"
                      type="search"
                      name="query"
                      placeholder="جستجوی ابزار..."
                      className="w-full bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="text-xs font-semibold text-[var(--color-primary)]"
                    >
                      جستجو
                    </button>
                  </div>
                </form>
                {/* PDF Tools */}
                <div>
                  <motion.button
                    className="flex items-center gap-3 w-full px-4 py-3 text-sm font-bold text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] rounded-full transition-all duration-[var(--motion-fast)]"
                    onClick={() => toggleDropdown('pdf')}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <IconPdf className="h-4 w-4" />
                    ابزارهای PDF
                    <motion.div
                      animate={{ rotate: openDropdown === 'pdf' ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="mr-auto"
                    >
                      <IconChevronDown className="h-3 w-3" />
                    </motion.div>
                  </motion.button>

                  <AnimatePresence>
                    {openDropdown === 'pdf' && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mr-4 mt-2 space-y-1 overflow-hidden"
                      >
                        <Link
                          href="/pdf-tools"
                          className="flex items-center gap-3 px-4 py-3 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] rounded-full transition-all duration-[var(--motion-fast)]"
                          onClick={closeMobileMenu}
                        >
                          <motion.div
                            className="flex items-center justify-center w-8 h-8 rounded-full"
                            style={{
                              backgroundColor: withAlpha(tokens.color.statusRgb.danger, 0.18),
                            }}
                            whileHover={{ scale: 1.1 }}
                          >
                            <IconPdf className="h-4 w-4 text-[var(--color-danger)]" />
                          </motion.div>
                          <div className="flex-1">
                            <div className="font-bold">همه ابزارهای PDF</div>
                            <div className="text-xs text-[var(--text-muted)]">
                              تبدیل، فشرده‌سازی، ادغام و...
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Image Tools */}
                <div>
                  <motion.button
                    className="flex items-center gap-3 w-full px-4 py-3 text-sm font-bold text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] rounded-full transition-all duration-[var(--motion-fast)]"
                    onClick={() => toggleDropdown('image')}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <IconImage className="h-4 w-4" />
                    ابزارهای تصویر
                    <motion.div
                      animate={{ rotate: openDropdown === 'image' ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="mr-auto"
                    >
                      <IconChevronDown className="h-3 w-3" />
                    </motion.div>
                  </motion.button>

                  <AnimatePresence>
                    {openDropdown === 'image' && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mr-4 mt-2 space-y-1 overflow-hidden"
                      >
                        <Link
                          href="/image-tools"
                          className="flex items-center gap-3 px-4 py-3 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] rounded-full transition-all duration-[var(--motion-fast)]"
                          onClick={closeMobileMenu}
                        >
                          <motion.div
                            className="flex items-center justify-center w-8 h-8 rounded-full"
                            style={{
                              backgroundColor: withAlpha(tokens.color.statusRgb.info, 0.18),
                            }}
                            whileHover={{ scale: 1.1 }}
                          >
                            <IconImage className="h-4 w-4 text-[var(--color-info)]" />
                          </motion.div>
                          <div className="flex-1">
                            <div className="font-bold">ابزارهای تصویر</div>
                            <div className="text-xs text-[var(--text-muted)]">
                              فشرده‌سازی و بهینه‌سازی
                            </div>
                          </div>
                        </Link>
                        <div className="flex items-center gap-3 px-4 py-3 text-sm text-[var(--text-muted)] rounded-full">
                          <motion.div
                            className="flex items-center justify-center w-8 h-8 rounded-full bg-[var(--bg-subtle)]"
                            whileHover={{ scale: 1.1 }}
                          >
                            <IconImage className="h-4 w-4 text-[var(--text-muted)]" />
                          </motion.div>
                          <div className="flex-1">
                            <div className="font-bold">تغییر اندازه عکس</div>
                            <div className="text-xs text-[var(--text-muted)]">به زودی</div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Financial Tools */}
                <div>
                  <motion.button
                    className="flex items-center gap-3 w-full px-4 py-3 text-sm font-bold text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] rounded-full transition-all duration-[var(--motion-fast)]"
                    onClick={() => toggleDropdown('financial')}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <IconCalculator className="h-4 w-4" />
                    ابزارهای مالی
                    <motion.div
                      animate={{ rotate: openDropdown === 'financial' ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="mr-auto"
                    >
                      <IconChevronDown className="h-3 w-3" />
                    </motion.div>
                  </motion.button>

                  <AnimatePresence>
                    {openDropdown === 'financial' && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mr-4 mt-2 space-y-1 overflow-hidden"
                      >
                        <Link
                          href="/loan"
                          className="flex items-center gap-3 px-4 py-3 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] rounded-full transition-all duration-[var(--motion-fast)]"
                          onClick={closeMobileMenu}
                        >
                          <motion.div
                            className="flex items-center justify-center w-8 h-8 rounded-full"
                            style={{ backgroundColor: withAlpha(tokens.color.primaryRgb, 0.18) }}
                            whileHover={{ scale: 1.1 }}
                          >
                            <IconCalculator className="h-4 w-4 text-[var(--color-primary)]" />
                          </motion.div>
                          <div className="flex-1">
                            <div className="font-bold">محاسبه‌گر وام</div>
                            <div className="text-xs text-[var(--text-muted)]">
                              محاسبه قسط و سود وام
                            </div>
                          </div>
                        </Link>
                        <Link
                          href="/salary"
                          className="flex items-center gap-3 px-4 py-3 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] rounded-full transition-all duration-[var(--motion-fast)]"
                          onClick={closeMobileMenu}
                        >
                          <motion.div
                            className="flex items-center justify-center w-8 h-8 rounded-full"
                            style={{
                              backgroundColor: withAlpha(tokens.color.statusRgb.success, 0.18),
                            }}
                            whileHover={{ scale: 1.1 }}
                          >
                            <IconMoney className="h-4 w-4 text-[var(--color-success)]" />
                          </motion.div>
                          <div className="flex-1">
                            <div className="font-bold">محاسبه‌گر حقوق</div>
                            <div className="text-xs text-[var(--text-muted)]">
                              محاسبه حقوق و بیمه
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Tools Dashboard */}
                <div>
                  <Link
                    href="/tools"
                    className="flex items-center gap-3 w-full px-4 py-3 text-sm font-bold text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] rounded-full transition-all duration-[var(--motion-fast)]"
                    onClick={closeMobileMenu}
                  >
                    <motion.div
                      className="flex items-center justify-center w-8 h-8 rounded-full"
                      style={{ backgroundColor: withAlpha(tokens.color.statusRgb.info, 0.16) }}
                      whileHover={{ scale: 1.1 }}
                    >
                      <IconChevronDown className="h-4 w-4 text-[var(--color-primary)] rotate-90" />
                    </motion.div>
                    <div className="flex-1">
                      <div className="font-bold">همه ابزارها</div>
                      <div className="text-xs text-[var(--text-muted)]">
                        جست‌وجو و مسیرهای پیشنهادی
                      </div>
                    </div>
                  </Link>
                </div>

                {/* Date Tools */}
                <div>
                  <Link
                    href="/date-tools"
                    className="flex items-center gap-3 w-full px-4 py-3 text-sm font-bold text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] rounded-full transition-all duration-[var(--motion-fast)]"
                    onClick={closeMobileMenu}
                  >
                    <motion.div
                      className="flex items-center justify-center w-8 h-8 rounded-full"
                      style={{ backgroundColor: withAlpha(tokens.color.statusRgb.warning, 0.18) }}
                      whileHover={{ scale: 1.1 }}
                    >
                      <IconCalendar className="h-4 w-4 text-[var(--color-warning)]" />
                    </motion.div>
                    <div className="flex-1">
                      <div className="font-bold">ابزارهای تاریخ</div>
                      <div className="text-xs text-[var(--text-muted)]">
                        تبدیل تاریخ، سن، اختلاف
                      </div>
                    </div>
                  </Link>
                </div>

                {/* Text Tools */}
                <div>
                  <Link
                    href="/text-tools"
                    className="flex items-center gap-3 w-full px-4 py-3 text-sm font-bold text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] rounded-full transition-all duration-[var(--motion-fast)]"
                    onClick={closeMobileMenu}
                  >
                    <motion.div
                      className="flex items-center justify-center w-8 h-8 rounded-full"
                      style={{ backgroundColor: withAlpha(tokens.color.statusRgb.info, 0.16) }}
                      whileHover={{ scale: 1.1 }}
                    >
                      <IconZap className="h-4 w-4 text-[var(--color-info)]" />
                    </motion.div>
                    <div className="flex-1">
                      <div className="font-bold">ابزارهای متنی</div>
                      <div className="text-xs text-[var(--text-muted)]">
                        تبدیل عدد، تاریخ و شمارش کلمات
                      </div>
                    </div>
                  </Link>
                </div>

                {/* Validation Tools */}
                <div>
                  <Link
                    href="/validation-tools"
                    className="flex items-center gap-3 w-full px-4 py-3 text-sm font-bold text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] rounded-full transition-all duration-[var(--motion-fast)]"
                    onClick={closeMobileMenu}
                  >
                    <motion.div
                      className="flex items-center justify-center w-8 h-8 rounded-full"
                      style={{ backgroundColor: withAlpha(tokens.color.statusRgb.success, 0.16) }}
                      whileHover={{ scale: 1.1 }}
                    >
                      <IconShield className="h-4 w-4 text-[var(--color-success)]" />
                    </motion.div>
                    <div className="flex-1">
                      <div className="font-bold">اعتبارسنجی داده‌ها</div>
                      <div className="text-xs text-[var(--text-muted)]">
                        کد ملی، موبایل، شبا و پلاک
                      </div>
                    </div>
                  </Link>
                </div>

                {/* Developers */}
                <div>
                  <Link
                    href="/developers"
                    className="flex items-center gap-3 w-full px-4 py-3 text-sm font-bold text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] rounded-full transition-all duration-[var(--motion-fast)]"
                    onClick={closeMobileMenu}
                  >
                    <motion.div
                      className="flex items-center justify-center w-8 h-8 rounded-full"
                      style={{ backgroundColor: withAlpha(tokens.color.statusRgb.info, 0.16) }}
                      whileHover={{ scale: 1.1 }}
                    >
                      <IconZap className="h-4 w-4 text-[var(--color-info)]" />
                    </motion.div>
                    <div className="flex-1">
                      <div className="font-bold">توسعه‌دهندگان</div>
                      <div className="text-xs text-[var(--text-muted)]">
                        راهنمای استفاده از کتابخانه
                      </div>
                    </div>
                  </Link>
                </div>
              </Container>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isSearchOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[70] flex items-start justify-center bg-black/40 px-4 pt-24"
              role="dialog"
              aria-modal="true"
              aria-labelledby="global-search-title"
              onClick={() => setIsSearchOpen(false)}
            >
              <motion.div
                initial={{ opacity: 0, y: -12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -12, scale: 0.98 }}
                className="w-full max-w-2xl rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-6 shadow-[var(--shadow-strong)]"
                ref={searchDialogRef}
                onClick={(event) => event.stopPropagation()}
              >
                <div className="flex items-center justify-between gap-4">
                  <h2
                    id="global-search-title"
                    className="text-lg font-black text-[var(--text-primary)]"
                  >
                    جستجوی سریع ابزارها
                  </h2>
                  <button
                    type="button"
                    className="text-xs font-semibold text-[var(--text-muted)]"
                    ref={searchCloseRef}
                    onClick={() => setIsSearchOpen(false)}
                  >
                    ESC
                  </button>
                </div>
                <div className="mt-4 flex items-center gap-3 rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--bg-subtle)] px-4 py-3">
                  <input
                    ref={searchInputRef}
                    type="search"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'ArrowDown') {
                        event.preventDefault();
                        setActiveIndex((prev) => Math.min(prev + 1, orderedSearchItems.length - 1));
                      }
                      if (event.key === 'ArrowUp') {
                        event.preventDefault();
                        setActiveIndex((prev) => Math.max(prev - 1, 0));
                      }
                      if (event.key === 'Enter' && orderedSearchItems[activeIndex]) {
                        event.preventDefault();
                        router.push(orderedSearchItems[activeIndex].href);
                        setIsSearchOpen(false);
                      }
                    }}
                    placeholder="نام ابزار یا نیازتان را بنویسید..."
                    className="w-full bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none"
                    aria-label="جستجوی سریع ابزارها"
                  />
                  <span className="text-xs font-semibold text-[var(--text-muted)]">⌘K</span>
                </div>
                <div className="mt-4 max-h-72 overflow-auto">
                  {orderedSearchItems.length ? (
                    <div className="space-y-4">
                      {!hasQuery && favoriteItems.length ? (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs font-semibold text-[var(--text-muted)]">
                            <span>علاقه‌مندی‌ها</span>
                            <button
                              type="button"
                              className="text-[var(--color-primary)]"
                              onClick={() => {
                                clearFavorites();
                                setFavoritePaths([]);
                              }}
                            >
                              پاک‌سازی
                            </button>
                          </div>
                          <div className="space-y-2">{favoriteItems.map(renderSearchItem)}</div>
                        </div>
                      ) : null}

                      {!hasQuery && recentItems.length ? (
                        <div className="space-y-2">
                          <div className="text-xs font-semibold text-[var(--text-muted)]">
                            اخیراً استفاده‌شده
                          </div>
                          <div className="space-y-2">{recentItems.map(renderSearchItem)}</div>
                        </div>
                      ) : null}

                      <div className="space-y-2">
                        <div className="text-xs font-semibold text-[var(--text-muted)]">
                          {hasQuery ? 'نتایج جست‌وجو' : 'سایر ابزارها'}
                        </div>
                        <div className="space-y-4">
                          {Object.entries(hasQuery ? groupedSearchItems : groupedRestItems).map(
                            ([category, items]) => (
                              <div key={category} className="space-y-2">
                                <div className="text-xs font-semibold text-[var(--text-muted)]">
                                  {category}
                                </div>
                                <div className="space-y-2">{items.map(renderSearchItem)}</div>
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-[var(--radius-md)] border border-dashed border-[var(--border-light)] bg-[var(--surface-1)]/90 px-4 py-6 text-center text-sm text-[var(--text-muted)]">
                      نتیجه‌ای پیدا نشد. عبارت دیگری امتحان کنید.
                    </div>
                  )}
                </div>
                <div className="mt-4 flex items-center justify-between text-xs text-[var(--text-muted)]">
                  <span>جستجو با Ctrl + K</span>
                  <Link href="/tools" className="font-semibold text-[var(--color-primary)]">
                    مشاهده همه ابزارها
                  </Link>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
      <button
        type="button"
        onClick={() => setIsSearchOpen(true)}
        className="lg:hidden fixed bottom-6 right-4 z-50 rounded-full border border-[var(--border-light)] bg-[var(--surface-1)]/90 px-4 py-3 text-sm font-semibold text-[var(--text-primary)] shadow-[var(--shadow-strong)] backdrop-blur"
      >
        جست‌وجو
      </button>
    </>
  );
}
