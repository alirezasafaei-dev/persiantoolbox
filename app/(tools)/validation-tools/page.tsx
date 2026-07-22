import Link from 'next/link';
import ToolCard from '@/shared/ui/ToolCard';
import PageHero from '@/shared/ui/PageHero';
import ToolSeoContent from '@/components/seo/ToolSeoContent';
import BreadcrumbSchema from '@/components/seo/BreadcrumbSchema';
import CategoryGuideSection from '@/components/ui/CategoryGuideSection';
import { buildMetadata, siteUrl } from '@/lib/seo';
import { getCategoryContent, getToolByPathOrThrow } from '@/lib/tools-registry';

const tool = getToolByPathOrThrow('/validation-tools');
const categoryContent = getCategoryContent('validation-tools');

const validatorTools = [
  {
    id: 'national-id-validator',
    title: 'اعتبارسنجی کد ملی',
    description: 'بررسی صحت کد ملی ۱۰ رقمی ایران با الگوریتم استاندارد',
    path: '/validation-tools/national-id',
    icon: (
      <svg
        className="h-7 w-7"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z"
        />
      </svg>
    ),
  },
  {
    id: 'mobile-validator',
    title: 'اعتبارسنجی موبایل',
    description: 'بررسی صحت شماره موبایل ایران و نرمال‌سازی فرمت',
    path: '/validation-tools/mobile',
    icon: (
      <svg
        className="h-7 w-7"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3"
        />
      </svg>
    ),
  },
  {
    id: 'bank-card-validator',
    title: 'اعتبارسنجی کارت بانکی',
    description: 'بررسی صحت شماره کارت بانکی ۱۶ رقمی با الگوریتم Luhn',
    path: '/validation-tools/bank-card',
    icon: (
      <svg
        className="h-7 w-7"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"
        />
      </svg>
    ),
  },
  {
    id: 'sheba-validator',
    title: 'اعتبارسنجی شبا',
    description: 'بررسی صحت شماره شبا (IBAN) ایران',
    path: '/validation-tools/sheba',
    icon: (
      <svg
        className="h-7 w-7"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
  {
    id: 'postal-code-validator',
    title: 'اعتبارسنجی کدپستی',
    description: 'بررسی صحت کدپستی ۱۰ رقمی ایران',
    path: '/validation-tools/postal-code',
    icon: (
      <svg
        className="h-7 w-7"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
        />
      </svg>
    ),
  },
  {
    id: 'plate-validator',
    title: 'اعتبارسنجی پلاک خودرو',
    description: 'بررسی صحت فرمت پلاک خودروی ایران',
    path: '/validation-tools/plate',
    icon: (
      <svg
        className="h-7 w-7"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H18.75m-7.5-2.25h7.5m-7.5 0H3.375m0 0h17.25M6 18.75h.008v.008H6v-.008zm0-3.75h.008v.008H6v-.008zm0-3.75h.008v.008H6v-.008zm0-3.75h.008v.008H6V7.5z"
        />
      </svg>
    ),
  },
];

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  keywords: categoryContent?.keywords ?? tool.keywords,
  path: tool.path,
});

export default function ValidationToolsRoute() {
  return (
    <div className="space-y-10">
      <BreadcrumbSchema
        items={[
          { name: 'خانه', url: siteUrl },
          { name: 'ابزارهای اعتبارسنجی', url: `${siteUrl}/validation-tools` },
        ]}
      />
      <PageHero
        title="ابزارهای اعتبارسنجی"
        description="کد ملی، موبایل، کارت بانکی، شبا، کدپستی و پلاک خودرو را سریع بررسی کنید."
        badges={[
          { text: 'کاملاً آفلاین', color: 'success' },
          { text: 'رایگان', color: 'info' },
        ]}
      />
      <div className="max-w-6xl mx-auto px-4">
        <Link
          href="/tools"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition-colors"
        >
          <svg
            className="h-4 w-4 rotate-180"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          بازگشت به همه ابزارها
        </Link>
      </div>
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {validatorTools.map((validator) => (
            <ToolCard
              key={validator.id}
              href={validator.path}
              title={validator.title}
              description={validator.description}
              icon={validator.icon}
            />
          ))}
        </div>
      </div>
      {categoryContent ? (
        <CategoryGuideSection
          categoryContent={categoryContent}
          guideTitle="راهنمای موضوعی اعتبارسنجی"
        />
      ) : null}
      <ToolSeoContent tool={tool} />
    </div>
  );
}
