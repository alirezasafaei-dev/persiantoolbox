import Script from 'next/script';
import dynamic from 'next/dynamic';
import { buildMetadata, siteUrl } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';
import ToolPageShell from '@/components/ui/ToolPageShell';
import BreadcrumbSchema from '@/components/seo/BreadcrumbSchema';

const PlateValidator = dynamic(
  () => import('@/components/features/validation-tools/PlateValidator').then((m) => m.default),
  {
    loading: () => (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-8 w-48 rounded-[var(--radius-lg)] bg-[var(--surface-2)]" />
        <div className="h-64 rounded-[var(--radius-lg)] bg-[var(--surface-2)]" />
      </div>
    ),
  },
);

const tool = getToolByPathOrThrow('/validation-tools/plate');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  keywords: tool.keywords,
  path: tool.path,
});

export default function PlateValidatorRoute() {
  return (
    <ToolPageShell tool={tool}>
      <BreadcrumbSchema
        items={[
          { name: 'خانه', url: siteUrl },
          { name: 'ابزارهای اعتبارسنجی', url: `${siteUrl}/validation-tools` },
          { name: 'اعتبارسنجی پلاک خودرو' },
        ]}
      />
      <Script
        id="plate-howto"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'HowTo',
            name: 'نحوه اعتبارسنجی پلاک خودروی ایران',
            description: 'بررسی صحت فرمت پلاک خودروی ایران',
            step: [
              {
                '@type': 'HowToStep',
                name: 'شماره پلاک را وارد کنید',
                text: 'شماره پلاک خودرو را در فیلد مربوطه وارد کنید',
              },
              {
                '@type': 'HowToStep',
                name: 'نتیجه را مشاهده کنید',
                text: 'صحت فرمت پلاک بررسی و نتیجه نمایش داده می‌شود',
              },
            ],
          }),
        }}
      />
      <PlateValidator />
    </ToolPageShell>
  );
}
