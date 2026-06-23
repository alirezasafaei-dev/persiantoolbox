import type { Metadata } from 'next';
import Link from 'next/link';
import SiteShell from '@/components/ui/SiteShell';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'کاربردها و مثال‌ها - جعبه ابزار فارسی',
  description:
    'نحوه استفاده از ابزارهای آنلاین در موقعیت‌های واقعی. مثال‌های عملی برای هر ابزار.',
  path: '/use-cases',
  keywords: ['کاربرد ابزار', 'مثال عملی', 'آموزش ابزار', 'نحوه استفاده'],
});

type UseCase = {
  slug: string;
  title: string;
  description: string;
  icon: string;
  tools: Array<{ name: string; path: string }>;
  scenario: string;
};

const useCases: UseCase[] = [
  {
    slug: 'freelancer-invoice',
    title: 'صورتحساب فریلنسری',
    description: 'صدور و مدیریت صورتحساب برای پروژه‌های فریلنسری',
    icon: '💼',
    tools: [
      { name: 'محاسبه حقوق', path: '/salary' },
      { name: 'محاسبه مالیات', path: '/tools/tax-calculator' },
      { name: 'تبدیل اعداد', path: '/text-tools/number-converter' },
    ],
    scenario: 'شما یک فریلنسر هستید و می‌خواهید صورتحساب حرفه‌ای صادر کنید. ابتدا مالیات را محاسبه کنید، سپس اعداد را به فرمت انگلیسی تبدیل کنید.',
  },
  {
    slug: 'student-report',
    title: 'گزارش دانشگاهی',
    description: 'آماده‌سازی گزارش و مقاله دانشگاهی',
    icon: '📚',
    tools: [
      { name: 'شمارش کلمات', path: '/text-tools/word-counter' },
      { name: 'OCR فارسی', path: '/tools/persian-ocr' },
      { name: 'تبدیل PDF', path: '/pdf-tools/convert/word-to-pdf' },
    ],
    scenario: 'دانشجویی هستید که باید گزارش خود را تحویل دهید. ابتدا متن را شمارش کنید، تصاویر را OCR کنید، سپس PDF خروجی بگیرید.',
  },
  {
    slug: 'real-estate',
    title: 'مشاور املاک',
    description: 'محاسبه اقساط وام مسکن برای مشتریان',
    icon: '🏠',
    tools: [
      { name: 'محاسبه وام', path: '/loan' },
      { name: 'مقایسه وام و سپرده', path: '/tools/loan-vs-investment' },
      { name: 'تورم و قدرت خرید', path: '/tools/inflation-calculator' },
    ],
    scenario: 'مشاور املاک هستید و مشتری می‌خواهد اقساط وام را بداند. وام را محاسبه کنید، با سپرده مقایسه کنید و اثر تورم را نشان دهید.',
  },
  {
    slug: 'content-creator',
    title: 'تولید محتوا',
    description: 'آماده‌سازی تصاویر و متن برای شبکه‌های اجتماعی',
    icon: '📱',
    tools: [
      { name: 'تغییر اندازه تصویر', path: '/image-tools/resize-image' },
      { name: 'تبدیل فرمت', path: '/image-tools/image-format-converter' },
      { name: 'متن روی تصویر', path: '/image-tools/text-on-image' },
    ],
    scenario: 'تولیدکننده محتوا هستید و باید تصاویر را برای اینستاگرام آماده کنید. اندازه را تغییر دهید، فرمت را تبدیل کنید و متن اضافه کنید.',
  },
  {
    slug: 'hr-department',
    title: 'واحد منابع انسانی',
    description: 'مدیریت اطلاعات کارکنان و محاسبه حقوق',
    icon: '👥',
    tools: [
      { name: 'محاسبه حقوق', path: '/salary' },
      { name: 'اضافه‌کاری', path: '/tools/overtime-calculator' },
      { name: 'بیمه', path: '/tools/insurance-calculator' },
      { name: 'سنوات', path: '/tools/severance-calculator' },
    ],
    scenario: 'واحد HR هستید و باید حقوق ماهانه کارکنان را محاسبه کنید. اضافه‌کاری، بیمه و سنوات را در نظر بگیرید.',
  },
  {
    slug: 'developer-tools',
    title: 'ابزارهای توسعه‌دهنده',
    description: 'تبدیل کد و مدیریت داده‌ها',
    icon: '💻',
    tools: [
      { name: 'JSON Formatter', path: '/tools/json-formatter' },
      { name: 'Base64', path: '/tools/base64-tool' },
      { name: 'Hash', path: '/tools/hash-generator' },
    ],
    scenario: 'توسعه‌دهنده هستید و باید JSON را فرمت کنید، داده‌ها را Base64 رمزگذاری کنید یا Hash تولید کنید.',
  },
];

export default function UseCasesPage() {
  return (
    <SiteShell containerClassName="py-10">
      <section className="space-y-3">
        <p className="inline-flex items-center rounded-full border border-[var(--border-light)] bg-[var(--surface-1)] px-4 py-2 text-xs font-semibold text-[var(--text-muted)]">
          کاربردها
        </p>
        <h1 className="text-3xl font-black text-[var(--text-primary)]">کاربردها و مثال‌ها</h1>
        <p className="max-w-3xl text-sm text-[var(--text-secondary)]">
          نحوه استفاده از ابزارها در موقعیت‌های واقعی و روزمره.
        </p>
      </section>

      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {useCases.map((uc) => (
          <article
            key={uc.slug}
            className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-5 shadow-[var(--shadow-subtle)] transition-all duration-[var(--motion-fast)] hover:border-[var(--border-strong)]"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{uc.icon}</span>
              <h2 className="text-lg font-bold text-[var(--text-primary)]">{uc.title}</h2>
            </div>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">{uc.description}</p>
            <p className="mt-3 text-xs leading-6 text-[var(--text-muted)]">{uc.scenario}</p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {uc.tools.map((tool) => (
                <Link
                  key={tool.path}
                  href={tool.path}
                  className="inline-flex items-center rounded-full bg-[var(--color-primary)]/10 px-2.5 py-0.5 text-xs font-semibold text-[var(--color-primary)] hover:bg-[var(--color-primary)]/20"
                >
                  {tool.name}
                </Link>
              ))}
            </div>
          </article>
        ))}
      </div>
    </SiteShell>
  );
}
