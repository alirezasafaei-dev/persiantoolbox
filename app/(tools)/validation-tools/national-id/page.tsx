import Script from 'next/script';
import dynamic from 'next/dynamic';
import { buildMetadata, siteUrl } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';
import ToolPageShell from '@/components/ui/ToolPageShell';
import BreadcrumbSchema from '@/components/seo/BreadcrumbSchema';

const NationalIdValidator = dynamic(
  () => import('@/components/features/validation-tools/NationalIdValidator').then((m) => m.default),
  {
    loading: () => (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-8 w-48 rounded-[var(--radius-lg)] bg-[var(--surface-2)]" />
        <div className="h-64 rounded-[var(--radius-lg)] bg-[var(--surface-2)]" />
      </div>
    ),
  },
);

const tool = getToolByPathOrThrow('/validation-tools/national-id');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  keywords: tool.keywords,
  path: tool.path,
});

export default function NationalIdValidatorRoute() {
  return (
    <ToolPageShell tool={tool}>
      <BreadcrumbSchema
        items={[
          { name: 'خانه', url: siteUrl },
          { name: 'ابزارهای اعتبارسنجی', url: `${siteUrl}/validation-tools` },
          { name: 'اعتبارسنجی کد ملی' },
        ]}
      />
      <Script
        id="national-id-howto"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'HowTo',
            name: 'نحوه اعتبارسنجی کد ملی ایران',
            description: 'بررسی صحت کد ملی ۱۰ رقمی با الگوریتم استاندارد',
            step: [
              {
                '@type': 'HowToStep',
                name: 'کد ملی را وارد کنید',
                text: 'کد ملی ۱۰ رقمی خود را در فیلد مربوطه وارد کنید',
              },
              {
                '@type': 'HowToStep',
                name: 'نتیجه را مشاهده کنید',
                text: 'در صورت معتبر بودن، نشان «معتبر» و در غیر این صورت «نامعتبر» نمایش داده می‌شود',
              },
            ],
          }),
        }}
      />
      <NationalIdValidator />
    </ToolPageShell>
  );
}
