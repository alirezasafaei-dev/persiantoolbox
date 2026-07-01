import Link from 'next/link';
import SiteShell from '@/components/ui/SiteShell';
import { buildMetadata } from '@/lib/seo';
import { getCategories, getToolsByCategory } from '@/lib/tools-registry';
import { toPersianNumbers } from '@/shared/utils/localization/persian';

export const metadata = buildMetadata({
  title: 'نمونه کارها - جعبه ابزار فارسی',
  description: 'نمونه کارها و پروژه‌های موفق جعبه ابزار فارسی با معیارهای واقعی و معماری فنی.',
  path: '/case-studies',
  robots: { index: true, follow: true },
});

const pdfToolsCount = getToolsByCategory('pdf-tools').length;
const categoriesCount = getCategories().length;

const caseStudies = [
  {
    id: 'salary-calculator',
    title: 'محاسبه‌گر حقوق ۱۴۰۵',
    category: 'ابزار مالی',
    metrics: [
      { label: 'تعداد ابزار', value: '۳ حالت محاسبه' },
      { label: 'پوشش قانونی', value: 'بیمه + مالیات + معافیت' },
      { label: 'خروجی', value: 'CSV + PDF + کلیپبورد' },
      { label: 'پردازش', value: '۱۰۰٪ محلی' },
    ],
    description: 'محاسبه دقیق حقوق خالص با اعمال بیمه، مالیات و معافیت‌های قانونی سال ۱۴۰۵.',
    architecture: {
      stack: ['React', 'TypeScript', 'Client-side'],
      flow: 'ورودی → محاسبه → خروجی (بدون سرور)',
      data: 'قوانین حقوق در JSON محلی ذخیره می‌شوند',
    },
    features: [
      'پشتیبانی از حالت ناخالص به خالص',
      'محاسبه حداقل حقوق با تمام مزایا',
      'جدول بیمه و مالیات پلکانی',
      'خروجی CSV سازگار با اکسل',
      'چاپ/PDF از مرورگر',
    ],
    result: 'ابزار پرکاربردترین ماشین‌حساب حقوق فارسی با دقت ۱۰۰٪ در محاسبات قانونی.',
    path: '/salary',
  },
  {
    id: 'loan-calculator',
    title: 'محاسبه‌گر اقساط وام',
    category: 'ابزار مالی',
    metrics: [
      { label: 'حالت محاسبه', value: 'اقساط مساوی + پلکانی' },
      { label: 'جدول بازپرداخت', value: 'کامل با جزئیات' },
      { label: 'مقایسه', value: 'چند سناریو همزمان' },
      { label: 'خروجی', value: 'CSV + PDF + کپی' },
    ],
    description: 'محاسبه جزئیات اقساط وام با جدول بازپرداخت کامل و مقایسه حالت‌های مختلف.',
    architecture: {
      stack: ['React', 'TypeScript', 'Web Worker'],
      flow: 'ورودی → محاسبه اقساط → جدول + نمودار',
      data: 'فرمول‌های بانک مرکزی به صورت static',
    },
    features: [
      'اقساط مساوی و پلکانی',
      'جدول بازپرداخت کامل',
      'محاسبه سود کل و نرخ موثر',
      'مقایسه چند سناریو',
      'خروجی CSV سازگار با اکسل',
    ],
    result: 'بهترین ابزار محاسبه وام برای تصمیم‌گیری مالی شخصی.',
    path: '/loan',
  },
  {
    id: 'pdf-tools',
    title: 'مجموعه ابزارهای PDF',
    category: 'ابزار فایل',
    metrics: [
      { label: 'تعداد ابزار', value: `${toPersianNumbers(pdfToolsCount)}+ ابزار` },
      { label: 'دسته‌بندی', value: `${toPersianNumbers(categoriesCount)} دسته اصلی` },
      { label: 'پردازش', value: 'Web Worker' },
      { label: 'امنیت', value: 'بدون آپلود فایل' },
    ],
    description: `بیش از ${toPersianNumbers(pdfToolsCount)} ابزار رایگان PDF برای ادغام، تقسیم، فشرده‌سازی، تبدیل فرمت و مدیریت صفحات.`,
    architecture: {
      stack: ['React', 'pdf-lib', 'pdfjs-dist', 'Web Worker'],
      flow: 'فایل → Worker → پردازش → دانلود',
      data: 'تمام پردازش در مرورگر بدون سرور',
    },
    features: [
      'ادغام، تقسیم، فشرده‌سازی PDF',
      'تبدیل فرمت (تصویر↔PDF, Word→PDF)',
      'افزودن واترمارک و شماره صفحه',
      'حذف رمز و مدیریت امنیت',
      'پشتیبانی از فایل‌های بزرگ',
    ],
    result: 'مجموعه کامل‌ترین ابزارهای PDF فارسی با پردازش محلی.',
    path: '/pdf-tools',
  },
  {
    id: 'hr-tools',
    title: 'ابزارهای منابع انسانی',
    category: 'ابزار اداری',
    metrics: [
      { label: 'تعداد ابزار', value: '۴ ابزار جدید' },
      { label: 'پوشش قانونی', value: 'بیمه + سنوات + مرخصی' },
      { label: 'خروجی', value: 'جدول + PDF' },
      { label: 'دقت', value: 'بر اساس قوانین کار' },
    ],
    description: 'ابزارهای تخصصی HR شامل بیمه، عیدانه، سنوات و مرخصی.',
    architecture: {
      stack: ['React', 'TypeScript', 'Client-side'],
      flow: 'ورودی → محاسبه → جدول نتایج',
      data: 'نرخ‌های رسمی بیمه و قوانین کار',
    },
    features: [
      'محاسبه سهم بیمه کارگر و کارفرما',
      'عیدانه و پاداش نوروزی',
      'حق سنوات و مرخصی استفاده نشده',
      'ارزش مالی مرخصی باقیمانده',
    ],
    result: 'اولین مجموعه ابزارهای HR فارسی با محاسبات دقیق قانونی.',
    path: '/tools/insurance-calculator',
  },
];

export default function CaseStudiesPage() {
  return (
    <SiteShell containerClassName="py-10">
      <div className="space-y-10">
        <section className="section-surface p-6 md:p-8">
          <div className="flex flex-col gap-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-light)] bg-[var(--surface-1)] px-4 py-2 text-xs font-semibold text-[var(--text-muted)]">
              <span className="h-2 w-2 rounded-full bg-[var(--color-primary)]" />
              نمونه کارها
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-[var(--text-primary)]">
              نمونه کارها و پروژه‌های موفق
            </h1>
            <p className="text-[var(--text-secondary)] leading-7 max-w-3xl">
              نگاهی به ابزارهایی که ساخته‌ایم، معماری فنی آن‌ها، و نتایجی که به دست آورده‌ایم.
            </p>
          </div>
        </section>

        {/* Architecture Overview */}
        <section className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-6 space-y-4">
          <h2 className="text-xl font-black text-[var(--text-primary)]">معماری کلی سیستم</h2>
          <div className="rounded-[var(--radius-md)] bg-[var(--surface-2)] p-4 font-mono text-xs text-[var(--text-secondary)] leading-6 overflow-x-auto">
            <pre>{`┌─────────────────────────────────────────────────────────┐
│                    PersianToolbox                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │ PDF Tools│  │  Finance │  │   HR     │             │
│  │ (20+)    │  │ (10+)    │  │  (4)     │             │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘             │
│       │              │              │                   │
│       └──────────────┼──────────────┘                   │
│                      │                                  │
│              ┌───────▼───────┐                          │
│              │  Web Worker   │  ← پردازش محلی          │
│              │  (pdf-lib,    │                          │
│              │   pdfjs-dist) │                          │
│              └───────┬───────┘                          │
│                      │                                  │
│              ┌───────▼───────┐                          │
│              │  CTA Registry │  ← هدایت کاربر          │
│              └───────┬───────┘                          │
└──────────────────────┼──────────────────────────────────┘
                       │
         ┌─────────────┼─────────────┐
         │             │             │
   ┌─────▼─────┐ ┌─────▼─────┐ ┌─────▼─────┐
   │ Portfolio │ │   Audit   │ │  Toolbox  │
   │ (اعتماد)  │ │ (ارزیابی) │ │ (ابزارها) │
   └───────────┘ └───────────┘ └───────────┘`}</pre>
          </div>
        </section>

        {/* Case Studies */}
        <section className="space-y-6">
          {caseStudies.map((study) => (
            <div
              key={study.id}
              className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-6 space-y-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <span className="inline-flex rounded-full bg-[rgb(var(--color-primary-rgb)/0.12)] px-3 py-1 text-xs font-bold text-[var(--color-primary)]">
                    {study.category}
                  </span>
                  <h2 className="text-xl font-black text-[var(--text-primary)] mt-2">
                    {study.title}
                  </h2>
                  <p className="text-sm text-[var(--text-muted)] leading-6 mt-1">
                    {study.description}
                  </p>
                </div>
              </div>

              {/* Metrics */}
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
                {study.metrics.map((m) => (
                  <div
                    key={m.label}
                    className="rounded-[var(--radius-md)] bg-[var(--surface-2)] p-3 text-center"
                  >
                    <div className="text-xs text-[var(--text-muted)]">{m.label}</div>
                    <div className="text-sm font-bold text-[var(--text-primary)] mt-1">
                      {m.value}
                    </div>
                  </div>
                ))}
              </div>

              {/* Architecture */}
              <div className="rounded-[var(--radius-md)] bg-[var(--surface-2)] p-4 space-y-2">
                <div className="text-xs font-bold text-[var(--text-primary)]">معماری فنی</div>
                <div className="flex flex-wrap gap-2">
                  {study.architecture.stack.map((s) => (
                    <span
                      key={s}
                      className="inline-flex rounded-full bg-[var(--color-primary)]/10 px-2 py-0.5 text-xs font-semibold text-[var(--color-primary)]"
                    >
                      {s}
                    </span>
                  ))}
                </div>
                <div className="text-xs text-[var(--text-muted)]">{study.architecture.flow}</div>
                <div className="text-xs text-[var(--text-muted)]">{study.architecture.data}</div>
              </div>

              {/* Features */}
              <div className="grid gap-2 sm:grid-cols-2">
                {study.features.map((feature) => (
                  <div
                    key={feature}
                    className="flex items-center gap-2 text-sm text-[var(--text-secondary)]"
                  >
                    <span aria-hidden="true" className="text-[var(--color-success)]">
                      ✓
                    </span>
                    {feature}
                  </div>
                ))}
              </div>

              {/* Result */}
              <div className="rounded-[var(--radius-md)] bg-[rgb(var(--color-success-rgb)/0.1)] p-4 text-sm text-[var(--text-secondary)]">
                <strong className="text-[var(--color-success)]">نتیجه:</strong> {study.result}
              </div>

              <Link
                href={study.path}
                className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-primary)] hover:underline"
              >
                مشاهده ابزار →
              </Link>
            </div>
          ))}
        </section>

        {/* CTA */}
        <section className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-6 text-center space-y-4">
          <h2 className="text-lg font-black text-[var(--text-primary)]">آماده شروع هستید؟</h2>
          <p className="text-sm text-[var(--text-muted)]">
            تمام ابزارها رایگان و بدون ثبت‌نام قابل استفاده هستند. هیچ داده‌ای به سرور ارسال
            نمی‌شود.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/tools"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--color-primary)] px-4 py-2 text-sm font-bold text-[var(--text-inverted)] hover:opacity-90 transition-opacity"
            >
              مشاهده تمام ابزارها
            </Link>
            <Link
              href="/trust"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--border-light)] px-4 py-2 text-sm font-bold text-[var(--text-primary)] hover:bg-[var(--surface-2)] transition-colors"
            >
              شفافیت فنی
            </Link>
          </div>
        </section>
      </div>
    </SiteShell>
  );
}
