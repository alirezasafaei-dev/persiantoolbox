import Script from 'next/script';
import dynamic from 'next/dynamic';
import { buildMetadata, siteUrl } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';
import ToolPageShell from '@/components/ui/ToolPageShell';
import BreadcrumbSchema from '@/components/seo/BreadcrumbSchema';

const MobileValidator = dynamic(
  () => import('@/components/features/validation-tools/MobileValidator').then((m) => m.default),
  {
    loading: () => (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-8 w-48 rounded-[var(--radius-lg)] bg-[var(--surface-2)]" />
        <div className="h-64 rounded-[var(--radius-lg)] bg-[var(--surface-2)]" />
      </div>
    ),
  },
);

const tool = getToolByPathOrThrow('/validation-tools/mobile');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  keywords: tool.keywords,
  path: tool.path,
});

export default function MobileValidatorRoute() {
  return (
    <ToolPageShell tool={tool}>
      <BreadcrumbSchema
        items={[
          { name: 'خانه', url: siteUrl },
          { name: 'ابزارهای اعتبارسنجی', url: `${siteUrl}/validation-tools` },
          { name: 'اعتبارسنجی موبایل' },
        ]}
      />
      <Script
        id="mobile-howto"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'HowTo',
            name: 'نحوه اعتبارسنجی شماره موبایل ایران',
            description: 'بررسی صحت شماره موبایل و نرمال‌سازی فرمت',
            step: [
              {
                '@type': 'HowToStep',
                name: 'شماره موبایل را وارد کنید',
                text: 'شماره موبایل ایران را با فرمت ۰۹۱۲۳۴۵۶۷۸۹ وارد کنید',
              },
              {
                '@type': 'HowToStep',
                name: 'نتیجه را مشاهده کنید',
                text: 'صحت شماره و فرمت نرمال‌شده نمایش داده می‌شود',
              },
            ],
          }),
        }}
      />
      <MobileValidator />
    </ToolPageShell>
  );
}
