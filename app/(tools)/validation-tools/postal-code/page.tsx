import Script from 'next/script';
import dynamic from 'next/dynamic';
import { buildMetadata, siteUrl } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';
import ToolPageShell from '@/components/ui/ToolPageShell';
import BreadcrumbSchema from '@/components/seo/BreadcrumbSchema';

const PostalCodeValidator = dynamic(
  () => import('@/components/features/validation-tools/PostalCodeValidator').then((m) => m.default),
  {
    loading: () => (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-8 w-48 rounded-[var(--radius-lg)] bg-[var(--surface-2)]" />
        <div className="h-64 rounded-[var(--radius-lg)] bg-[var(--surface-2)]" />
      </div>
    ),
  },
);

const tool = getToolByPathOrThrow('/validation-tools/postal-code');

export const metadata = buildMetadata({
  title: 'اعتبارسنجی کد پستی آنلاین رایگان | جعبه ابزار فارسی',
  description:
    'ساختار کد پستی ۱۰ رقمی ایران را آنلاین و رایگان بررسی کنید. اعتبارسنجی در مرورگر انجام می‌شود و جایگزین استعلام رسمی نشانی از شرکت پست نیست.',
  keywords: ['اعتبار سنجی کد پستی', 'اعتبارسنجی کد پستی', 'اعتبارسنجی کدپستی', 'بررسی صحت کد پستی'],
  path: tool.path,
});

export default function PostalCodeValidatorRoute() {
  return (
    <ToolPageShell tool={tool}>
      <BreadcrumbSchema
        items={[
          { name: 'خانه', url: siteUrl },
          { name: 'ابزارهای اعتبارسنجی', url: `${siteUrl}/validation-tools` },
          { name: 'اعتبارسنجی کد پستی' },
        ]}
      />
      <Script
        id="postal-code-howto"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'HowTo',
            name: 'نحوه اعتبارسنجی ساختار کد پستی ایران',
            description: 'بررسی ساختار کد پستی ۱۰ رقمی ایران در مرورگر',
            step: [
              {
                '@type': 'HowToStep',
                name: 'کد پستی را وارد کنید',
                text: 'کد پستی ۱۰ رقمی را در فیلد مربوطه وارد کنید',
              },
              {
                '@type': 'HowToStep',
                name: 'نتیجه را مشاهده کنید',
                text: 'ساختار کد پستی بررسی و نتیجه نمایش داده می‌شود؛ این ابزار جایگزین استعلام رسمی نشانی نیست',
              },
            ],
          }),
        }}
      />
      <PostalCodeValidator />
    </ToolPageShell>
  );
}
