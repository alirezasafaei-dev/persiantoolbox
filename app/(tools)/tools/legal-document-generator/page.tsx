import Script from 'next/script';
import dynamic from 'next/dynamic';
import { buildMetadata } from '@/lib/seo';
import { getToolByPathOrThrow } from '@/lib/tools-registry';
import ToolPageShell from '@/components/ui/ToolPageShell';

const LegalDocumentGenerator = dynamic(
  () => import('@/components/features/legal/LegalDocumentGenerator').then((m) => m.default),
  {
    loading: () => (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-8 w-48 rounded-[var(--radius-lg)] bg-[var(--surface-2)]" />
        <div className="h-64 rounded-[var(--radius-lg)] bg-[var(--surface-2)]" />
      </div>
    ),
  },
);

const tool = getToolByPathOrThrow('/tools/legal-document-generator');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  keywords: tool.keywords,
  path: tool.path,
});

export default function LegalDocumentGeneratorPage() {
  return (
    <ToolPageShell tool={tool}>
      <Script
        id="legal-document-generator-howto"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'HowTo',
            name: 'نحوه تولید سند حقوقی و قرارداد',
            description:
              'راهنمای گام به گام تولید اسناد حقوقی و قراردادهای استاندارد به صورت آنلاین',
            step: [
              {
                '@type': 'HowToStep',
                name: 'نوع سند حقوقی را انتخاب کنید',
                text: 'از لیست اسناد موجود، نوع قرارداد یا سند مورد نیاز خود را انتخاب کنید',
              },
              {
                '@type': 'HowToStep',
                name: 'اطلاعات خواسته شده را تکمیل کنید',
                text: 'مشخصات طرفین قرارداد، موضوع و سایر جزئیات مورد نیاز را وارد کنید',
              },
              {
                '@type': 'HowToStep',
                name: 'سند را دانلود کنید',
                text: 'سند حقوقی تولید شده را پیش‌نمایش کنید و به صورت PDF دانلود نمایید',
              },
            ],
          }),
        }}
      />
      <LegalDocumentGenerator />
    </ToolPageShell>
  );
}
