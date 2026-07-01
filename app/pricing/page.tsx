import PricingContent from '@/components/features/pricing/PricingContent';
import SiteShell from '@/components/ui/SiteShell';
import BreadcrumbSchema from '@/components/seo/BreadcrumbSchema';
import { buildMetadata, siteUrl } from '@/lib/seo';

export const revalidate = 3600;

export const metadata = buildMetadata({
  title: 'قیمت‌گذاری و خرید خروجی حرفه‌ای — جعبه ابزار فارسی',
  description:
    'خرید بسته ۳ خروجی از ۴۹,۰۰۰ تومان یا اشتراک ماهانه. پرداخت امن از درگاه زرین‌پال. ابزارهای فارسی رایگان با پردازش محلی — خروجی بدون واترمارک برای فاکتور، رزومه و قرارداد.',
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
      name: 'تفاوت پلن پایه و حرفه‌ای چیست؟',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'پلن پایه شامل پردازش چندفایلی، OCR پیشرفته و خروجی HD است. پلن حرفه‌ای علاوه بر اینها، داشبورد مالی، گزارش PDF سفارشی و پشتیبانی اختصاصی دارد.',
      },
    },
    {
      '@type': 'Question',
      name: 'آیا اطلاعات من ذخیره می‌شود؟',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'خیر، تمام پردازش‌های ابزارهای پایه در مرورگر شما انجام می‌شود و هیچ داده‌ای به سرور ارسال نمی‌شود.',
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

export default function PricingRoute() {
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
      <PricingContent />
    </SiteShell>
  );
}
