import PricingContent from '@/components/features/pricing/PricingContent';
import SiteShell from '@/components/ui/SiteShell';
import BreadcrumbSchema from '@/components/seo/BreadcrumbSchema';
import { buildMetadata, siteUrl } from '@/lib/seo';
import { getResolvedPricing } from '@/lib/server/pricingStorage';
import { formatPack3Snippet } from '@/lib/pricing/pricingConfig';

export const revalidate = 3600;

export async function generateMetadata() {
  const pricing = await getResolvedPricing();
  return buildMetadata({
    title: 'قیمت‌گذاری و خرید خروجی حرفه‌ای — جعبه ابزار فارسی',
    description: `خرید ${formatPack3Snippet(pricing.pack3PriceFormatted)} یا اشتراک ماهانه. پرداخت امن زرین‌پال. خروجی بدون واترمارک برای فاکتور، رزومه و قرارداد.`,
    path: '/pricing',
    keywords: [
      'قیمت اشتراک',
      'خرید خروجی حرفه‌ای',
      'بسته ۳ خروجی',
      'پلن رایگان',
      'پرداخت زرین‌پال',
      'ابزار آنلاین فارسی',
    ],
  });
}

export default async function PricingRoute() {
  const pricing = await getResolvedPricing();

  const pricingFaqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'آیا استفاده از ابزارهای پایه واقعاً رایگان است؟',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'بله، تمام ابزارهای پایه برای همیشه رایگان هستند و بدون ثبت‌نام قابل استفاده‌اند.',
        },
      },
      {
        '@type': 'Question',
        name: 'آیا بدون اشتراک هم می‌توانم خروجی حرفه‌ای بگیرم؟',
        acceptedAnswer: {
          '@type': 'Answer',
          text: `بله! بسته ۳ خروجی فقط ${pricing.pack3PriceFormatted} تومان است و نیازی به اشتراک ماهانه ندارد.`,
        },
      },
      {
        '@type': 'Question',
        name: 'پرداخت از چه درگاهی انجام می‌شود؟',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'پرداخت از درگاه امن زرین‌پال انجام می‌شود. اطلاعات کارت بانکی در سرور ما ذخیره نمی‌شود.',
        },
      },
    ],
  };

  return (
    <SiteShell containerClassName="py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pricingFaqSchema) }}
      />
      <BreadcrumbSchema
        items={[
          { name: 'خانه', url: siteUrl },
          { name: 'قیمت‌گذاری', url: `${siteUrl}/pricing` },
        ]}
      />
      <PricingContent initialPricing={pricing} />
    </SiteShell>
  );
}
