import Script from 'next/script';
import dynamic from 'next/dynamic';
import ToolSeoContent from '@/components/seo/ToolSeoContent';
import { buildMetadata, siteUrl } from '@/lib/seo';
import BreadcrumbSchema from '@/components/seo/BreadcrumbSchema';
import Link from 'next/link';
import { getCategoryContent, getIndexableTools, getToolByPathOrThrow } from '@/lib/tools-registry';

const ToolsDashboardPage = dynamic(
  () => import('@/components/features/tools-dashboard/ToolsDashboardPage').then((m) => m.default),
  {
    loading: () => (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-8 w-48 rounded-[var(--radius-lg)] bg-[var(--surface-2)]" />
        <div className="h-64 rounded-[var(--radius-lg)] bg-[var(--surface-2)]" />
      </div>
    ),
  },
);

const ToolTrustBlock = dynamic(
  () => import('@/components/ui/ToolTrustBlock').then((m) => m.default),
  {
    loading: () => null,
  },
);

const RelatedFinanceTools = dynamic(
  () => import('@/components/features/finance/RelatedFinanceTools').then((m) => m.default),
  {
    loading: () => null,
  },
);

const CategoryGuideSection = dynamic(
  () => import('@/components/ui/CategoryGuideSection').then((m) => m.default),
  {
    loading: () => null,
  },
);

const tool = getToolByPathOrThrow('/tools');
const categoryContent = getCategoryContent('finance-tools');
const specializedTools = getIndexableTools()
  .filter((entry) => entry.kind === 'tool')
  .slice(0, 16);

export const metadata = buildMetadata({
  title: 'ابزار آنلاین رایگان فارسی | محاسبه، PDF، متن، تصویر - جعبه ابزار فارسی',
  description:
    'ابزار آنلاین رایگان فارسی: محاسبه مالی، مدیریت PDF، ویرایش تصویر، ابزارهای متنی و اعتبارسنجی. تمام پردازش‌ها در مرورگر انجام می‌شود.',
  keywords: [
    'ابزار آنلاین',
    'ابزار رایگان',
    'جعبه ابزار فارسی',
    'محاسبه وام',
    'محاسبه حقوق',
    'فشرده‌سازی PDF',
    'تبدیل تاریخ',
    'OCR فارسی',
  ],
  path: tool.path,
});

const toolsFaq = [
  {
    question: 'ابزارهای جعبه ابزار فارسی چیستند؟',
    answer:
      'مجموعه‌ای از ابزارهای آنلاین رایگان فارسی شامل محاسبه مالی، مدیریت PDF، ویرایش تصویر، ابزارهای متنی و اعتبارسنجی.',
  },
  {
    question: 'آیا استفاده از ابزارها رایگان است؟',
    answer: 'بله، تمام ابزارهای پایه رایگان هستند و پردازش کاملاً در مرورگر انجام می‌شود.',
  },
  {
    question: 'آیا اطلاعات من ذخیره می‌شود؟',
    answer: 'خیر، تمام پردازش‌ها در مرورگر شما انجام می‌شود و هیچ اطلاعاتی به سرور ارسال نمی‌شود.',
  },
  {
    question: 'آیا ثبت‌نام لازم است؟',
    answer: 'خیر، تمام ابزارها بدون نیاز به ثبت‌نام و ورود قابل استفاده هستند.',
  },
  {
    question: 'ابزارهای مالی شامل چه مواردی هستند؟',
    answer:
      'محاسبه حقوق، مالیات بر درآمد، بیمه، وام مسکن، سود سپرده، نرخ ارز و بسیاری ابزارهای دیگر.',
  },
];

export default function ToolsDashboardRoute() {
  return (
    <div className="space-y-10">
      <BreadcrumbSchema
        items={[
          { name: 'خانه', url: siteUrl },
          { name: 'ابزارهای آنلاین', url: `${siteUrl}/tools` },
        ]}
      />
      <Script
        id="tools-faq-json-ld"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: toolsFaq.map((item) => ({
              '@type': 'Question',
              name: item.question,
              acceptedAnswer: {
                '@type': 'Answer',
                text: item.answer,
              },
            })),
          }),
        }}
      />
      <ToolsDashboardPage />
      <ToolTrustBlock
        category={{ id: 'all-tools', name: 'ابزارهای آنلاین', path: '/tools' }}
        compact
      />
      <RelatedFinanceTools current="hub" />
      <section id="specialized-tools" className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-[var(--text-primary)]">ابزارهای تخصصی</h2>
          <p className="text-sm text-[var(--text-muted)]">
            لیست کامل مسیرهای تخصصی قابل استفاده در نسخه فعلی.
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {specializedTools.map((entry) => (
            <Link
              key={entry.path}
              href={entry.path}
              className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] px-4 py-3 transition-colors hover:border-[var(--border-strong)] hover:bg-[var(--surface-2)]"
            >
              <div className="text-sm font-bold text-[var(--text-primary)]">
                {entry.title.replace(' - جعبه ابزار فارسی', '')}
              </div>
              <div className="mt-1 text-xs text-[var(--text-muted)]">
                {entry.category?.name ?? 'ابزار'}
              </div>
            </Link>
          ))}
        </div>
      </section>
      {categoryContent ? (
        <CategoryGuideSection categoryContent={categoryContent} guideTitle="راهنمای موضوعی مالی" />
      ) : null}
      <ToolSeoContent tool={tool} />
    </div>
  );
}
