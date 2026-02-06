'use client';

import type { ReactNode } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import ToolCard from '@/shared/ui/ToolCard';
import { EmptyState } from '@/components/ui';
import PopularTools from '@/components/home/PopularTools';
import { clearUsage } from '@/shared/analytics/localUsage';
import {
  IconPdf,
  IconImage,
  IconCalendar,
  IconZap,
  IconShield,
  IconCalculator,
  IconMoney,
} from '@/shared/ui/icons';

type ToolCategory = 'all' | 'pdf' | 'image' | 'date' | 'text' | 'validation' | 'finance';

type ToolItem = {
  id: string;
  title: string;
  description: string;
  path: string;
  category: ToolCategory;
  meta?: string;
  icon: ReactNode;
  iconWrapClassName?: string;
};

const tools: ToolItem[] = [
  {
    id: 'pdf',
    title: 'ابزارهای PDF',
    description: 'تبدیل، فشرده‌سازی، ادغام، استخراج و ویرایش صفحات',
    path: '/pdf-tools',
    category: 'pdf',
    meta: '۱۲ ابزار',
    icon: <IconPdf className="h-7 w-7 text-[var(--color-danger)]" />,
    iconWrapClassName: 'bg-[rgb(var(--color-danger-rgb)/0.12)]',
  },
  {
    id: 'image',
    title: 'ابزارهای تصویر',
    description: 'فشرده‌سازی و تبدیل تصاویر با کنترل کیفیت',
    path: '/image-tools',
    category: 'image',
    meta: '۳ ابزار',
    icon: <IconImage className="h-7 w-7 text-[var(--color-info)]" />,
    iconWrapClassName: 'bg-[rgb(var(--color-info-rgb)/0.12)]',
  },
  {
    id: 'date',
    title: 'ابزارهای تاریخ',
    description: 'تبدیل شمسی/میلادی/قمری، سن و اختلاف تاریخ',
    path: '/date-tools',
    category: 'date',
    meta: '۵ ابزار',
    icon: <IconCalendar className="h-7 w-7 text-[var(--color-warning)]" />,
    iconWrapClassName: 'bg-[rgb(var(--color-warning-rgb)/0.14)]',
  },
  {
    id: 'text',
    title: 'ابزارهای متنی',
    description: 'عدد به حروف، شمارش کلمات، نرمال‌سازی و اسلاگ',
    path: '/text-tools',
    category: 'text',
    meta: '۴ ابزار',
    icon: <IconZap className="h-7 w-7 text-[var(--color-info)]" />,
    iconWrapClassName: 'bg-[rgb(var(--color-info-rgb)/0.14)]',
  },
  {
    id: 'validation',
    title: 'اعتبارسنجی داده‌ها',
    description: 'کد ملی، موبایل، کارت بانکی، شبا، کدپستی و پلاک',
    path: '/validation-tools',
    category: 'validation',
    meta: '۶ ابزار',
    icon: <IconShield className="h-7 w-7 text-[var(--color-success)]" />,
    iconWrapClassName: 'bg-[rgb(var(--color-success-rgb)/0.12)]',
  },
  {
    id: 'loan',
    title: 'محاسبه‌گر وام',
    description: 'محاسبه اقساط ماهانه، سود کل و برنامه بازپرداخت',
    path: '/loan',
    category: 'finance',
    meta: 'پرکاربرد',
    icon: <IconCalculator className="h-7 w-7 text-[var(--color-primary)]" />,
    iconWrapClassName: 'bg-[rgb(var(--color-primary-rgb)/0.12)]',
  },
  {
    id: 'salary',
    title: 'محاسبه‌گر حقوق',
    description: 'حقوق خالص، بیمه و مالیات را سریع محاسبه کنید',
    path: '/salary',
    category: 'finance',
    meta: 'جدید',
    icon: <IconMoney className="h-7 w-7 text-[var(--color-success)]" />,
    iconWrapClassName: 'bg-[rgb(var(--color-success-rgb)/0.12)]',
  },
];

const categories: Array<{ id: ToolCategory; label: string }> = [
  { id: 'all', label: 'همه ابزارها' },
  { id: 'pdf', label: 'PDF' },
  { id: 'image', label: 'تصویر' },
  { id: 'date', label: 'تاریخ' },
  { id: 'text', label: 'متن' },
  { id: 'validation', label: 'اعتبارسنجی' },
  { id: 'finance', label: 'محاسبات مالی' },
];

const SEARCH_DEBOUNCE_MS = 300;

const quickSearches: Array<{ label: string; query: string; category: ToolCategory }> = [
  { label: 'ادغام PDF', query: 'ادغام', category: 'pdf' },
  { label: 'فشرده‌سازی', query: 'فشرده', category: 'pdf' },
  { label: 'کد ملی', query: 'کد ملی', category: 'validation' },
  { label: 'اقساط وام', query: 'اقساط', category: 'finance' },
  { label: 'تبدیل تاریخ', query: 'تبدیل تاریخ', category: 'date' },
];

const flows = [
  {
    title: 'PDF → استخراج صفحات',
    description: 'صفحات دلخواه را جدا کنید و خروجی آماده بگیرید.',
    path: '/pdf-tools/extract/extract-pages',
  },
  {
    title: 'PDF → چرخش صفحات',
    description: 'چرخاندن صفحات انتخابی برای خوانایی بهتر.',
    path: '/pdf-tools/edit/rotate-pages',
  },
  {
    title: 'متن → نرمال‌سازی → اسلاگ',
    description: 'اصلاح نگارشی و تولید اسلاگ سازگار با URL.',
    path: '/text-tools',
  },
  {
    title: 'اعتبارسنجی فرم',
    description: 'کد ملی، موبایل و کارت بانکی را یکجا بررسی کنید.',
    path: '/validation-tools',
  },
];

export default function ToolsDashboardPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [usageClearedAt, setUsageClearedAt] = useState<number | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);
  const hasHydratedRef = useRef(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const confirmButtonRef = useRef<HTMLButtonElement | null>(null);
  const cancelButtonRef = useRef<HTMLButtonElement | null>(null);
  const prevStateRef = useRef<{ searchTerm: string; category: ToolCategory }>({
    searchTerm: '',
    category: 'all',
  });

  useEffect(() => {
    const queryParam = searchParams.get('query');
    const categoryParam = searchParams.get('category') as ToolCategory | null;
    if (queryParam !== null) {
      setSearchTerm(queryParam);
    } else {
      setSearchTerm('');
    }
    if (categoryParam && categories.some((category) => category.id === categoryParam)) {
      setSelectedCategory(categoryParam);
    } else {
      setSelectedCategory('all');
    }
    hasHydratedRef.current = true;
  }, [searchParams]);

  useEffect(() => {
    if (!hasHydratedRef.current) {
      return;
    }
    const prev = prevStateRef.current;
    const searchChanged = prev.searchTerm !== searchTerm;
    const delay = searchChanged ? SEARCH_DEBOUNCE_MS : 0;

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    setIsFiltering(true);
    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      const trimmedSearch = searchTerm.trim();
      if (trimmedSearch) {
        params.set('query', trimmedSearch);
      } else {
        params.delete('query');
      }
      if (selectedCategory !== 'all') {
        params.set('category', selectedCategory);
      } else {
        params.delete('category');
      }
      const nextQuery = params.toString();
      const currentQuery = searchParams.toString();
      if (nextQuery !== currentQuery) {
        router.replace(`${pathname}${nextQuery ? `?${nextQuery}` : ''}`, { scroll: false });
      }
      prevStateRef.current = { searchTerm, category: selectedCategory };
      setIsFiltering(false);
    }, delay);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [pathname, router, searchParams, searchTerm, selectedCategory]);

  useEffect(() => {
    if (!isConfirmOpen) {
      return;
    }
    const previousActive = document.activeElement as HTMLElement | null;
    confirmButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setIsConfirmOpen(false);
        return;
      }
      if (event.key === 'Tab') {
        const focusables = [confirmButtonRef.current, cancelButtonRef.current].filter(
          Boolean,
        ) as HTMLElement[];
        if (focusables.length === 0) {
          return;
        }
        const currentIndex = focusables.indexOf(document.activeElement as HTMLElement);
        if (event.shiftKey) {
          const nextIndex = currentIndex <= 0 ? focusables.length - 1 : currentIndex - 1;
          focusables[nextIndex]?.focus();
        } else {
          const nextIndex = currentIndex === focusables.length - 1 ? 0 : currentIndex + 1;
          focusables[nextIndex]?.focus();
        }
        event.preventDefault();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previousActive?.focus();
    };
  }, [isConfirmOpen]);

  const filteredTools = useMemo(() => {
    const term = searchTerm.trim();
    return tools.filter((tool) => {
      const inCategory = selectedCategory === 'all' || tool.category === selectedCategory;
      if (!inCategory) {
        return false;
      }
      if (!term) {
        return true;
      }
      return tool.title.includes(term) || tool.description.includes(term);
    });
  }, [searchTerm, selectedCategory]);

  const hasResults = filteredTools.length > 0;
  const resultsStatusText = isFiltering
    ? 'در حال به‌روزرسانی نتایج ابزارها...'
    : `تعداد ${filteredTools.length} ابزار نمایش داده می‌شود.`;

  return (
    <div className="space-y-10">
      <PopularTools />

      <section className="section-surface p-6 md:p-8 rounded-[var(--radius-lg)] border border-[var(--border-light)]">
        <div className="flex flex-col gap-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-light)] bg-[var(--surface-1)] px-4 py-2 text-xs font-semibold text-[var(--text-muted)]">
            <span className="h-2 w-2 rounded-full bg-[var(--color-info)]"></span>
            داشبورد ابزارها
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-[var(--text-primary)]">
            همه ابزارها در یک صفحه
          </h1>
          <p className="text-[var(--text-secondary)]">
            جست‌وجو، فیلتر و مسیرهای پیشنهادی را یکجا ببینید و سریع به ابزار مناسب برسید.
          </p>
        </div>
      </section>

      <CardPanel>
        <div className="space-y-2">
          <label htmlFor="tools-search" className="sr-only">
            جستجوی ابزارها
          </label>
          <input
            id="tools-search"
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="جستجوی ابزار..."
            className="input-field"
            aria-describedby="tools-search-hint tools-results-status"
          />
          <p id="tools-search-hint" className="text-xs text-[var(--text-muted)]">
            می‌توانید بر اساس عنوان یا توضیح ابزار جست‌وجو کنید.
          </p>
          <p id="tools-results-status" className="sr-only" role="status" aria-live="polite">
            {resultsStatusText}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {quickSearches.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => {
                setSearchTerm(item.query);
                setSelectedCategory(item.category);
              }}
              className="rounded-full border border-[var(--border-light)] bg-[var(--surface-1)]/80 px-3 py-1 text-xs font-semibold text-[var(--text-secondary)] transition-all duration-[var(--motion-fast)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => setSelectedCategory(category.id)}
              aria-pressed={selectedCategory === category.id}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-[var(--motion-fast)] ${
                selectedCategory === category.id
                  ? 'bg-[var(--color-primary)] text-[var(--text-inverted)] shadow-[var(--shadow-medium)]'
                  : 'bg-[var(--surface-1)] text-[var(--text-primary)] border border-[var(--border-light)] hover:bg-[var(--bg-subtle)]'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[var(--text-muted)]">
          <div className="flex flex-wrap items-center gap-2">
            <span>نمایش {filteredTools.length} ابزار</span>
            {selectedCategory !== 'all' ? (
              <span className="rounded-full border border-[var(--border-light)] bg-[var(--surface-1)]/80 px-2 py-0.5 text-[10px] font-semibold text-[var(--text-secondary)]">
                {categories.find((item) => item.id === selectedCategory)?.label}
              </span>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {searchTerm ? <span>نتایج برای «{searchTerm}»</span> : <span>همه نتایج</span>}
            <button
              type="button"
              onClick={() => {
                setIsConfirmOpen(true);
              }}
              className="rounded-full border border-[var(--border-light)] bg-[var(--surface-1)]/80 px-3 py-1 font-semibold text-[var(--text-secondary)] transition-all duration-[var(--motion-fast)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
            >
              پاک‌سازی تاریخچه محبوب‌ها
            </button>
            {(searchTerm || selectedCategory !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                }}
                className="rounded-full border border-[var(--border-light)] bg-[var(--surface-1)]/80 px-3 py-1 font-semibold text-[var(--text-secondary)] transition-all duration-[var(--motion-fast)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
              >
                پاک‌سازی فیلترها
              </button>
            )}
            {usageClearedAt ? <span className="text-[var(--color-success)]">پاک شد</span> : null}
          </div>
        </div>
      </CardPanel>

      <section className="space-y-4">
        <h2 className="text-xl font-black text-[var(--text-primary)]">مسیرهای پیشنهادی</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {flows.map((flow) => (
            <a
              key={flow.title}
              href={flow.path}
              className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)]/85 p-5 transition-all duration-[var(--motion-fast)] hover:border-[var(--color-primary)] hover:shadow-[var(--shadow-strong)]"
            >
              <div className="text-sm font-bold text-[var(--text-primary)]">{flow.title}</div>
              <div className="mt-2 text-sm text-[var(--text-muted)]">{flow.description}</div>
              <div className="mt-3 text-xs font-semibold text-[var(--color-primary)]">
                شروع مسیر
              </div>
            </a>
          ))}
        </div>
      </section>

      {hasResults ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3" aria-busy={isFiltering}>
          {isFiltering
            ? Array.from({ length: 6 }).map((_, index) => (
              <div
                key={`skeleton-${index}`}
                className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)]/85 p-6 shadow-[var(--shadow-medium)] animate-pulse"
              >
                <div className="h-12 w-12 rounded-[var(--radius-md)] bg-[var(--bg-subtle)]"></div>
                <div className="mt-4 h-4 w-3/5 rounded bg-[var(--bg-subtle)]"></div>
                <div className="mt-3 h-3 w-full rounded bg-[var(--bg-subtle)]"></div>
                <div className="mt-2 h-3 w-4/5 rounded bg-[var(--bg-subtle)]"></div>
                <div className="mt-6 h-3 w-20 rounded bg-[var(--bg-subtle)]"></div>
              </div>
            ))
            : filteredTools.map((tool) => (
              <ToolCard
                key={tool.id}
                href={tool.path}
                title={tool.title}
                description={tool.description}
                icon={tool.icon}
                {...(tool.meta ? { meta: tool.meta } : {})}
                {...(tool.iconWrapClassName ? { iconWrapClassName: tool.iconWrapClassName } : {})}
              />
            ))}
        </div>
      ) : (
        <EmptyState
          icon="🔎"
          title="ابزاری پیدا نشد"
          description="عبارت جستجو یا دسته‌بندی را تغییر دهید تا ابزارهای بیشتری نمایش داده شود."
          action={{
            label: 'بازنشانی فیلترها',
            onClick: () => {
              setSearchTerm('');
              setSelectedCategory('all');
            },
          }}
        />
      )}

      {isConfirmOpen ? (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-clear-title"
        >
          <button
            type="button"
            aria-label="بستن پنجره"
            className="absolute inset-0"
            onClick={() => setIsConfirmOpen(false)}
          />
          <div className="relative z-10 w-full max-w-sm rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-6 shadow-[var(--shadow-strong)]">
            <h3 id="confirm-clear-title" className="text-lg font-black text-[var(--text-primary)]">
              پاک‌سازی تاریخچه محبوب‌ها؟
            </h3>
            <p className="mt-2 text-sm text-[var(--text-muted)]">
              این کار داده‌های استفادهٔ محلی را پاک می‌کند و پیشنهادهای محبوب‌ها دوباره از نو ساخته
              می‌شوند.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                className="btn btn-primary btn-md"
                ref={confirmButtonRef}
                onClick={() => {
                  clearUsage();
                  setUsageClearedAt(Date.now());
                  setTimeout(() => setUsageClearedAt(null), 2500);
                  setIsConfirmOpen(false);
                }}
              >
                بله، پاک کن
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-md"
                ref={cancelButtonRef}
                onClick={() => setIsConfirmOpen(false)}
              >
                انصراف
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function CardPanel({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)]/92 p-5 space-y-4 shadow-[var(--shadow-medium)] backdrop-blur">
      {children}
    </div>
  );
}
