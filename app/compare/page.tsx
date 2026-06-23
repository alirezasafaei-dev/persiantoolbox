import type { Metadata } from 'next';
import Link from 'next/link';
import SiteShell from '@/components/ui/SiteShell';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'مقایسه ابزارهای آنلاین فارسی - جعبه ابزار فارسی',
  description:
    'مقایسه جامع ابزارهای آنلاین: PDF، مالی، تصویر، متن و تاریخ. بهترین ابزار را برای نیاز خود پیدا کنید.',
  path: '/compare',
  keywords: ['مقایسه ابزار', 'ابزار آنلاین فارسی', 'بهترین ابزار', 'ابزار رایگان'],
});

type Comparison = {
  slug: string;
  title: string;
  description: string;
  toolA: { name: string; path: string; pros: string[] };
  toolB: { name: string; path: string; pros: string[] };
  verdict: string;
};

const comparisons: Comparison[] = [
  {
    slug: 'pdf-merge-vs-split',
    title: 'ادغام PDF در مقابل تقسیم PDF',
    description: 'کدام ابزار برای مدیریت فایل‌های PDF مناسب‌تر است؟',
    toolA: {
      name: 'ادغام PDF',
      path: '/pdf-tools/merge/merge-pdf',
      pros: ['ترکیب چند فایل در یک فایل', 'حفظ ترتیب صفحات', 'سرعت بالا'],
    },
    toolB: {
      name: 'تقسیم PDF',
      path: '/pdf-tools/split/split-pdf',
      pros: ['جدا کردن صفحات', 'استخراج بخش خاص', 'کاهش حجم فایل'],
    },
    verdict: 'اگر فایل‌های جداگانه دارید و می‌خواهید یکی کنید → ادغام. اگر فایل بزرگ دارید و می‌خواهید تقسیم کنید → تقسیم.',
  },
  {
    slug: 'salary-vs-tax',
    title: 'محاسبه حقوق در مقابل مالیات',
    description: 'تفاوت محاسبه خالص دریافتی و مالیات بر درآمد چیست؟',
    toolA: {
      name: 'محاسبه حقوق',
      path: '/salary',
      pros: ['محاسبه خالص دریافتی', 'شامل بیمه و مالیات', 'نمایش جزئیات کسورات'],
    },
    toolB: {
      name: 'محاسبه مالیات',
      path: '/tools/tax-calculator',
      pros: ['تمرکز روی مالیات', 'محاسبه معافیت', 'بر اساس قوانین ۱۴۰۵'],
    },
    verdict: 'برای دیدن کل دریافتی → محاسبه حقوق. برای دانستن دقیق مالیات → محاسبه مالیات.',
  },
  {
    slug: 'image-resize-vs-convert',
    title: 'تغییر اندازه تصویر در مقابل تبدیل فرمت',
    description: 'کدام ابزار تصویر برای بهینه‌سازی وب مناسب‌تر است؟',
    toolA: {
      name: 'تغییر اندازه',
      path: '/image-tools/resize-image',
      pros: ['کاهش ابعاد تصویر', 'کاهش حجم فایل', 'حفظ نسبت تصویر'],
    },
    toolB: {
      name: 'تبدیل فرمت',
      path: '/image-tools/image-format-converter',
      pros: ['تبدیل به WebP', 'تبدیل PNG به JPG', 'تنظیم کیفیت خروجی'],
    },
    verdict: 'برای کاهش حجم → تغییر اندازه. برای تغییر فرمت → تبدیل فرمت. هر دو با هم بهترین نتیجه را می‌دهند.',
  },
  {
    slug: 'ocr-vs-extract-info',
    title: 'OCR در مقابل استخراج اطلاعات',
    description: 'کدام ابزار برای استخراج متن از تصویر مناسب‌تر است؟',
    toolA: {
      name: 'OCR فارسی',
      path: '/tools/persian-ocr',
      pros: ['خواندن متن از تصویر', 'پشتیبانی فارسی و انگلیسی', 'پردازش محلی'],
    },
    toolB: {
      name: 'استخراج اطلاعات',
      path: '/text-tools/extract-info',
      pros: ['استخراج ایمیل و تلفن', 'استخراج URL', 'تحلیل ساختار متن'],
    },
    verdict: 'برای استخراج متن از عکس → OCR. برای پیدا کردن اطلاعات خاص در متن → استخراج اطلاعات.',
  },
  {
    slug: 'loan-vs-investment',
    title: 'وام در مقابل سرمایه‌گذاری',
    description: 'آیا وام بگیریم یا سپرده‌گذاری کنیم؟',
    toolA: {
      name: 'محاسبه وام',
      path: '/loan',
      pros: ['محاسبه اقساط', 'مقایسه نرخ سود', 'برنامه بازپرداخت'],
    },
    toolB: {
      name: 'محاسبه سود سپرده',
      path: '/interest',
      pros: ['پیش‌بینی بازده', 'مقایسه بانک‌ها', 'محاسبه سود مرکب'],
    },
    verdict: 'اگر نرخ سود سپرده > نرخ سود وام → سپرده‌گذاری. اگر نرخ وام < تورم → وام بگیرید.',
  },
];

export default function ComparePage() {
  return (
    <SiteShell containerClassName="py-10">
      <section className="space-y-3">
        <p className="inline-flex items-center rounded-full border border-[var(--border-light)] bg-[var(--surface-1)] px-4 py-2 text-xs font-semibold text-[var(--text-muted)]">
          مقایسه
        </p>
        <h1 className="text-3xl font-black text-[var(--text-primary)]">مقایسه ابزارها</h1>
        <p className="max-w-3xl text-sm text-[var(--text-secondary)]">
          بهترین ابزار را برای نیاز خود پیدا کنید. مقایسه جامع ابزارهای آنلاین فارسی.
        </p>
      </section>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {comparisons.map((comp) => (
          <article
            key={comp.slug}
            className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-5 shadow-[var(--shadow-subtle)] transition-all duration-[var(--motion-fast)] hover:border-[var(--border-strong)]"
          >
            <h2 className="text-lg font-bold text-[var(--text-primary)]">{comp.title}</h2>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">{comp.description}</p>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-md border border-[var(--border-light)] bg-[var(--surface-2)] p-3">
                <h3 className="text-sm font-bold text-[var(--color-primary)]">
                  <Link href={comp.toolA.path}>{comp.toolA.name}</Link>
                </h3>
                <ul className="mt-2 space-y-1">
                  {comp.toolA.pros.map((pro) => (
                    <li key={pro} className="text-xs text-[var(--text-secondary)]">
                      + {pro}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-md border border-[var(--border-light)] bg-[var(--surface-2)] p-3">
                <h3 className="text-sm font-bold text-[var(--color-primary)]">
                  <Link href={comp.toolB.path}>{comp.toolB.name}</Link>
                </h3>
                <ul className="mt-2 space-y-1">
                  {comp.toolB.pros.map((pro) => (
                    <li key={pro} className="text-xs text-[var(--text-secondary)]">
                      + {pro}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-4 rounded-md bg-[var(--color-primary)]/5 p-3">
              <p className="text-xs font-semibold text-[var(--color-primary)]">نتیجه‌گیری:</p>
              <p className="mt-1 text-xs text-[var(--text-secondary)]">{comp.verdict}</p>
            </div>
          </article>
        ))}
      </div>
    </SiteShell>
  );
}
