import dynamic from 'next/dynamic';
import Link from 'next/link';
import ToolSeoContent from '@/components/seo/ToolSeoContent';
import ToolsHubStructuredData from '@/components/seo/ToolsHubStructuredData';
import ToolTrustBlock from '@/components/ui/ToolTrustBlock';
import { buildMetadata } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';

const ToolsDashboardPage = dynamic(
  () => import('@/components/features/tools-dashboard/ToolsDashboardPage').then((module) => module.default),
  {
    loading: () => (
      <div className="flex flex-col gap-6 animate-pulse" aria-label="در حال آماده‌سازی فهرست ابزارها">
        <div className="h-8 w-56 rounded-[var(--radius-lg)] bg-[var(--surface-2)]" />
        <div className="h-64 rounded-[var(--radius-lg)] bg-[var(--surface-2)]" />
      </div>
    ),
  },
);

const tool = getToolByPathOrThrow('/tools');

export const metadata = buildMetadata({
  title: 'ابزار آنلاین رایگان فارسی | PDF، متن، تصویر، تاریخ و محاسبه',
  description:
    'فهرست کامل ابزارهای آنلاین رایگان فارسی برای PDF، متن، تصویر، تاریخ، محاسبات مالی، اعتبارسنجی و اسناد؛ بدون نصب نرم‌افزار.',
  keywords: [
    'ابزار آنلاین رایگان',
    'ابزار فارسی',
    'ابزار PDF آنلاین',
    'ابزار متن فارسی',
    'تبدیل تاریخ',
    'محاسبه حقوق',
    'اعتبارسنجی کد ملی',
  ],
  path: tool.path,
});

const categoryLinks = [
  { href: '/pdf-tools', title: 'ابزارهای PDF', description: 'تبدیل، ویرایش، ادغام، تقسیم و امنیت PDF', icon: '📄' },
  { href: '/text-tools', title: 'ابزارهای متن فارسی', description: 'نرمال‌سازی، شمارش، تبدیل و پردازش متن', icon: '✍️' },
  { href: '/image-tools', title: 'ابزارهای تصویر', description: 'فشرده‌سازی، تغییر اندازه و ویرایش تصویر', icon: '🖼️' },
  { href: '/date-tools', title: 'ابزارهای تاریخ', description: 'تبدیل تاریخ، محاسبه سن و اختلاف دو تاریخ', icon: '📅' },
  { href: '/validation-tools', title: 'اعتبارسنجی ایرانی', description: 'کد ملی، کارت بانکی، شبا، موبایل و پلاک', icon: '✅' },
  { href: '/developers', title: 'ابزارهای توسعه‌دهندگان', description: 'API عمومی، OpenAPI، JSON و Base64', icon: '💻' },
];

export default function ToolsDashboardRoute() {
  return (
    <div className="space-y-12">
      <ToolsHubStructuredData tool={tool} />
      <ToolsDashboardPage />

      <section className="mx-auto max-w-6xl space-y-5 px-4">
        <div>
          <h2 className="text-2xl font-black text-[var(--text-primary)]">دسترسی سریع به دسته‌های اصلی</h2>
          <p className="mt-2 text-sm leading-7 text-[var(--text-muted)]">
            برای مشاهده راهنماها و ابزارهای مرتبط هر موضوع، وارد هاب تخصصی همان دسته شوید.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {categoryLinks.map((category) => (
            <Link
              key={category.href}
              href={category.href}
              className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-5 transition-all hover:-translate-y-1 hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-medium)]"
            >
              <span className="text-3xl" aria-hidden="true">
                {category.icon}
              </span>
              <h3 className="mt-3 text-lg font-black text-[var(--text-primary)]">{category.title}</h3>
              <p className="mt-2 text-sm leading-7 text-[var(--text-muted)]">{category.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <div className="mx-auto max-w-4xl space-y-10 px-4">
        <ToolTrustBlock
          category={{ id: 'all-tools', name: 'همه ابزارهای آنلاین', path: '/tools' }}
          compact
        />
        <ToolSeoContent tool={tool} />
      </div>
    </div>
  );
}
