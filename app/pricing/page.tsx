import PricingContent from '@/components/features/pricing/PricingContent';
import SiteShell from '@/components/ui/SiteShell';
import BreadcrumbSchema from '@/components/seo/BreadcrumbSchema';
import { buildMetadata, siteUrl } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'قیمت‌گذاری — PersianToolbox',
  description:
    'مقایسه پلن‌های رایگان، پایه و حرفه‌ای PersianToolbox. ابزارهای آنلاین فارسی با پردازش محلی و حفظ حریم خصوصی.',
  path: '/pricing',
  keywords: ['قیمت اشتراک', 'پلن رایگان', 'پریمیوم', 'ابزار آنلاین فارسی'],
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
