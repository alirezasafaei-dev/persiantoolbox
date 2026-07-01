import type { CareerDocumentType } from '@/lib/career-documents/types';
import dynamic from 'next/dynamic';
import Script from 'next/script';
import SiteShell from '@/components/ui/SiteShell';
import BreadcrumbSchema from '@/components/seo/BreadcrumbSchema';
import { buildMetadata, siteUrl } from '@/lib/seo';
import { getPack3FaqAnswer } from '@/lib/pricing/pricingSnippets';

export const revalidate = 3600;

const CareerWizard = dynamic(() => import('@/components/features/career-documents/CareerWizard'), {
  loading: () => (
    <div className="flex items-center justify-center py-20">
      <div className="animate-pulse text-[var(--text-muted)] text-sm">در حال بارگذاری...</div>
    </div>
  ),
});

export const metadata = buildMetadata({
  title: 'رزومه ساز حرفه‌ای رایگان | ساخت رزومه فارسی و انگلیسی',
  description:
    'ساخت رزومه فارسی و انگلیسی به صورت آنلاین و رایگان. کاورلتر ساز حرفه‌ای با خروجی PDF و Word.',
  path: '/career-tools/resume-builder',
  keywords: ['ساخت رزومه', 'رزومه آنلاین', 'رزومه فارسی', 'ساخت CV', 'رزومه PDF', 'کاورلتر ساز'],
});

const TYPE_MAP: Record<string, CareerDocumentType> = {
  'persian-resume': 'resume-fa',
  'english-resume': 'resume-en',
  'cover-letter': 'cover-letter',
};

export default async function ResumeBuilderPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const params = await searchParams;
  const pack3PricingFaq = await getPack3FaqAnswer(
    ' و نیازی به اشتراک ماهانه ندارد. هر خروجی PDF یا Word تمیز ۱ اعتبار مصرف می‌کند.',
  );
  const initialDocumentType = params.type ? TYPE_MAP[params.type] : undefined;

  return (
    <SiteShell containerClassName="py-10">
      <Script
        id="resume-builder-breadcrumb"
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
                name: 'ابزارهای شغلی',
                item: `${siteUrl}/career-tools`,
              },
              { '@type': 'ListItem', position: 3, name: 'رزومه ساز' },
            ],
          }),
        }}
      />
      <BreadcrumbSchema
        items={[
          { name: 'خانه', url: siteUrl },
          { name: 'ابزارهای شغلی', url: `${siteUrl}/career-tools` },
          { name: 'رزومه ساز', url: `${siteUrl}/career-tools/resume-builder` },
        ]}
      />
      <Script
        id="resume-builder-faq"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: [
              {
                '@type': 'Question',
                name: 'آیا ساخت رزومه رایگان است؟',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'بله، ساخت رزومه کاملاً رایگان است. خروجی HTML و چاپ رایگان است. خروجی PDF و Word در نسخه پریمیوم فعال است.',
                },
              },
              {
                '@type': 'Question',
                name: 'آیا اطلاعات رزومه به سرور ارسال می‌شود؟',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'خیر، تمام پردازش‌ها در مرورگر شما انجام می‌شود. اطلاعات رزومه هرگز از دستگاه خارج نمی‌شود.',
                },
              },
              {
                '@type': 'Question',
                name: 'آیا رزومه ساخته شده فارسی و انگلیسی پشتیبانی می‌کند؟',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'بله، هم رزومه فارسی (RTL) و هم رزومه انگلیسی (LTR) با قالب‌های حرفه‌ای پشتیبانی می‌شوند.',
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
        <CareerWizard {...(initialDocumentType ? { initialDocumentType } : {})} />
      </div>
    </SiteShell>
  );
}
