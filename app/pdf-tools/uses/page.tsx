import Link from 'next/link';
import SiteShell from '@/components/ui/SiteShell';
import { buildMetadata } from '@/lib/seo';
import { getToolsByCategory } from '@/lib/tools-registry';
import { toPersianNumbers } from '@/shared/utils/localization/persian';

export const metadata = buildMetadata({
  title: 'ابزارهای PDF اداری و استخدامی - جعبه ابزار فارسی',
  description:
    'ابزارهای PDF برای کارهای اداری و استخدامی: ادغام مدارک، تقسیم فایل، فشرده‌سازی و تبدیل فرمت.',
  path: '/pdf-tools/uses',
  robots: { index: true, follow: true },
});

const useCases = [
  {
    title: 'مدارک استخدامی',
    description: 'ادغام رزومه، نامه پوششی و مدارک تحصیلی در یک فایل PDF واحد',
    tools: [
      { name: 'ادغام PDF', path: '/pdf-tools/merge/merge-pdf' },
      { name: 'افزودن هدر/فوتر', path: '/pdf-tools/edit/add-header-footer' },
      { name: 'افزودن شماره صفحه', path: '/pdf-tools/edit/add-page-numbers' },
    ],
    icon: '📄',
  },
  {
    title: 'قراردادها و مدارک قانونی',
    description: 'تقسیم قراردادهای طولانی، حذف صفحات اضافی و فشرده‌سازی برای ارسال',
    tools: [
      { name: 'تقسیم PDF', path: '/pdf-tools/split/split-pdf' },
      { name: 'حذف صفحات', path: '/pdf-tools/edit/delete-pdf-pages' },
      { name: 'فشرده‌سازی PDF', path: '/pdf-tools/compress/compress-pdf' },
    ],
    icon: '📋',
  },
  {
    title: 'صورتحساب و فاکتور',
    description: 'تبدیل صورتحساب‌های Excel به PDF، برش صفحات اضافی و مرتب‌سازی',
    tools: [
      { name: 'تبدیل Excel به PDF', path: '/pdf-tools/convert/pdf-to-excel' },
      { name: 'برش PDF', path: '/pdf-tools/edit/crop-pdf' },
      { name: 'مرتب‌سازی صفحات', path: '/pdf-tools/edit/reorder-pdf' },
    ],
    icon: '💰',
  },
  {
    title: 'مدارک دولتی',
    description: 'تبدیل اسناد اسکن‌شده به PDF متنی، افزودن واترمارک و مدیریت صفحات',
    tools: [
      { name: 'تبدیل تصویر به PDF', path: '/pdf-tools/convert/image-to-pdf' },
      { name: 'افزودن واترمارک', path: '/pdf-tools/watermark/add-watermark' },
      { name: 'استخراج متن', path: '/pdf-tools/extract/extract-text' },
    ],
    icon: '🏛️',
  },
];

export default function PdfUseCasesPage() {
  const pdfToolsCount = getToolsByCategory('pdf-tools').length;

  return (
    <SiteShell containerClassName="py-10">
      <div className="space-y-10">
        <section className="section-surface p-6 md:p-8">
          <div className="flex flex-col gap-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-light)] bg-[var(--surface-1)] px-4 py-2 text-xs font-semibold text-[var(--text-muted)]">
              <span className="h-2 w-2 rounded-full bg-[var(--color-primary)]" />
              ابزارهای PDF اداری
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-[var(--text-primary)]">
              ابزارهای PDF برای کارهای اداری و استخدامی
            </h1>
            <p className="text-[var(--text-secondary)] leading-7 max-w-3xl">
              مدارک استخدامی، قراردادها، صورتحساب‌ها و اسناد دولتی خود را با ابزارهای رایگان PDF
              مدیریت کنید. تمام پردازش‌ها در مرورگر انجام می‌شود.
            </p>
          </div>
        </section>

        <section className="space-y-6">
          {useCases.map((useCase) => (
            <div
              key={useCase.title}
              className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-6 space-y-4"
            >
              <div className="flex items-start gap-4">
                <span className="text-3xl">{useCase.icon}</span>
                <div>
                  <h2 className="text-xl font-black text-[var(--text-primary)]">{useCase.title}</h2>
                  <p className="text-sm text-[var(--text-muted)] leading-6 mt-1">
                    {useCase.description}
                  </p>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {useCase.tools.map((tool) => (
                  <Link
                    key={tool.path}
                    href={tool.path}
                    className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-2)] p-4 hover:border-[var(--color-primary)] transition-colors"
                  >
                    <div className="text-sm font-bold text-[var(--text-primary)]">{tool.name}</div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </section>

        <section className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-6 space-y-4">
          <h2 className="text-lg font-black text-[var(--text-primary)]">تمام ابزارهای PDF</h2>
          <p className="text-sm text-[var(--text-muted)] leading-7">
            بیش از {toPersianNumbers(pdfToolsCount)} ابزار PDF رایگان برای کارهای اداری، استخدامی و
            شخصی.
          </p>
          <Link
            href="/pdf-tools"
            className="inline-flex items-center gap-2 rounded-full bg-[var(--color-primary)] px-4 py-2 text-sm font-bold text-[var(--text-inverted)] hover:opacity-90 transition-opacity"
          >
            مشاهده تمام ابزارهای PDF
          </Link>
        </section>
      </div>
    </SiteShell>
  );
}
