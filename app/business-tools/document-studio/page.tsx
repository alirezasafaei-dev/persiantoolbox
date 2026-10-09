import dynamic from 'next/dynamic';
import Script from 'next/script';
import SiteShell from '@/components/ui/SiteShell';
import BreadcrumbSchema from '@/components/seo/BreadcrumbSchema';
import { buildMetadata, siteUrl } from '@/lib/seo';
import { getPack3FaqAnswer } from '@/lib/pricing/pricingSnippets';
import type { BusinessDocumentType } from '@/lib/business-documents/types';

const VALID_TYPES = ['invoice', 'proforma', 'receipt'] as const;

export const revalidate = 3600;

const DocumentStudio = dynamic(
  () => import('@/components/features/business-documents/DocumentStudio'),
  {
    loading: () => (
      <div className="flex items-center justify-center py-20">
        <div className="animate-pulse text-(--text-muted) text-sm">در حال بارگذاری...</div>
      </div>
    ),
  },
);

export const metadata = buildMetadata({
  title: 'فاکتورساز و رسیدساز آنلاین | فاکتور فروش و پیش‌فاکتور رایگان',
  description:
    'فاکتور فروش، پیش‌فاکتور و رسید دریافت وجه را آنلاین بسازید؛ خروجی PDF و Word با قالب حرفه‌ای و استفاده پایه رایگان.',
  path: '/business-tools/document-studio',
  keywords: ['ساخت فاکتور', 'فاکتور آنلاین', 'پیش‌فاکتور', 'رسید دریافت وجه', 'فاکتور PDF'],
});

export default async function DocumentStudioPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const params = await searchParams;
  const pack3PricingFaq = await getPack3FaqAnswer(
    ' و نیازی به اشتراک ماهانه ندارد. پیش‌نمایش و خروجی با واترمارک رایگان است.',
  );
  const typeParam =
    params.type && (VALID_TYPES as readonly string[]).includes(params.type)
      ? (params.type as BusinessDocumentType)
      : undefined;

  return (
    <SiteShell containerClassName="py-10">
      <Script
        id="document-studio-breadcrumb"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'خانه', item: siteUrl },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'ابزارهای کسب‌وکار',
                item: `${siteUrl}/business-tools`,
              },
              { '@type': 'ListItem', position: 3, name: 'فاکتورساز و رسیدساز' },
            ],
          }),
        }}
      />
      <BreadcrumbSchema
        items={[
          { name: 'خانه', url: siteUrl },
          { name: 'ابزارهای کسب‌وکار', url: `${siteUrl}/business-tools` },
          { name: 'فاکتورساز و رسیدساز', url: `${siteUrl}/business-tools/document-studio` },
        ]}
      />
      <Script
        id="document-studio-faq"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: [
              {
                '@type': 'Question',
                name: 'آیا ساخت فاکتور رایگان است؟',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'بله، ساخت فاکتور کاملاً رایگان است. خروجی HTML و چاپ رایگان است. خروجی PDF و Word در نسخه پریمیوم فعال است.',
                },
              },
              {
                '@type': 'Question',
                name: 'آیا اطلاعات فاکتور به سرور ارسال می‌شود؟',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'خیر، تمام پردازش‌ها در مرورگر شما انجام می‌شود. اطلاعات فاکتور هرگز از دستگاه خارج نمی‌شود.',
                },
              },
              {
                '@type': 'Question',
                name: 'آیا فاکتور ساخته شده رسمی است؟',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'خروجی‌ها برای استفاده عمومی و اداری مناسب هستند، اما جایگزین مشاوره حرفه‌ای یا مراجع رسمی نیستند.',
                },
              },
              {
                '@type': 'Question',
                name: 'هزینه خروجی حرفه‌ای چقدر است؟',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: pack3PricingFaq,
                },
              },
            ],
          }),
        }}
      />
      <div className="max-w-3xl mx-auto">
        <section
          aria-labelledby="document-studio-intro"
          className="mb-6 space-y-3 rounded-lg border border-(--border-light) bg-(--surface-1) p-5"
        >
          <h2 id="document-studio-intro" className="text-xl font-bold text-(--text-primary)">
            فاکتور فروش، پیش‌فاکتور و رسید دریافت وجه
          </h2>
          <p className="leading-7 text-(--text-secondary)">
            برای فروش کالا یا خدمات، اطلاعات طرفین و اقلام را وارد کنید و یک پیش‌نویس سند کسب‌وکار
            قابل چاپ آماده کنید. نوع سند را می‌توانید بین فاکتور، پیش‌فاکتور و رسید دریافت وجه
            انتخاب کنید.
          </p>
          <p className="text-sm leading-7 text-(--text-muted)">
            پردازش در مرورگر انجام می‌شود و خروجی ابزار جایگزین نرم‌افزار حسابداری یا تأیید رسمی
            مراجع مالی نیست.
          </p>
        </section>
        <DocumentStudio {...(typeParam ? { initialDocumentType: typeParam } : {})} />
      </div>
    </SiteShell>
  );
}
