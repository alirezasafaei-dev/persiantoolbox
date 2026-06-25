import Script from 'next/script';
import dynamic from 'next/dynamic';
import { buildMetadata, siteUrl } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';
import ToolPageShell from '@/components/ui/ToolPageShell';
import BreadcrumbSchema from '@/components/seo/BreadcrumbSchema';

const PersianPasswordGenerator = dynamic(
  () =>
    import('@/components/features/validation-tools/PersianPasswordGenerator').then(
      (m) => m.default,
    ),
  {
    loading: () => (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-8 w-48 rounded-[var(--radius-lg)] bg-[var(--surface-2)]" />
        <div className="h-64 rounded-[var(--radius-lg)] bg-[var(--surface-2)]" />
      </div>
    ),
  },
);

const tool = getToolByPathOrThrow('/validation-tools/persian-password');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  keywords: tool.keywords,
  path: tool.path,
});

export default function PersianPasswordRoute() {
  return (
    <ToolPageShell tool={tool}>
      <BreadcrumbSchema
        items={[
          { name: 'خانه', url: siteUrl },
          { name: 'ابزارهای اعتبارسنجی', url: `${siteUrl}/validation-tools` },
          { name: 'تولید رمز عبور قوی' },
        ]}
      />
      <Script
        id="persian-password-howto"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'HowTo',
            name: 'نحوه تولید رمز عبور قوی با کاراکترهای فارسی',
            description: 'راهنمای گام به گام تولید رمز عبور امن و قوی با حروف فارسی و انگلیسی',
            step: [
              {
                '@type': 'HowToStep',
                name: 'طول رمز عبور را تنظیم کنید',
                text: 'تعداد کاراکترهای رمز عبور مورد نظر خود را انتخاب کنید',
              },
              {
                '@type': 'HowToStep',
                name: 'نوع کاراکترها را انتخاب کنید',
                text: 'حروف فارسی، حروف انگلیسی، اعداد و نمادها را فعال یا غیرفعال کنید',
              },
              {
                '@type': 'HowToStep',
                name: 'رمز عبور تولید شده را کپی کنید',
                text: 'رمز عبور قوی تولید شده را کپی و در جای امن ذخیره کنید',
              },
            ],
          }),
        }}
      />
      <PersianPasswordGenerator />
    </ToolPageShell>
  );
}
