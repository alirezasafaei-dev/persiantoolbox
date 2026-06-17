import QrCodeGenerator from '@/components/features/validation-tools/QrCodeGenerator';
import PasswordGenerator from '@/components/features/validation-tools/PasswordGenerator';
import { buildMetadata, generateBreadcrumbSchema, generateFAQSchema } from '@/lib/seo';
import PageHero from '@/shared/ui/PageHero';
import FAQSection from '@/shared/ui/FAQSection';
import Script from 'next/script';

export const metadata = buildMetadata({
  title: 'ابزارهای اعتبارسنجی - جعبه ابزار فارسی',
  description:
    'ابزارهای اعتبارسنجی و تولید QR Code برای کاربران فارسی‌زبان. تولید رمز عبور قوی، QR Code رایگان و ابزارهای امنیتی آنلاین.',
  path: '/validation-tools',
});

const breadcrumbItems = [
  { name: 'ابزارها', item: 'https://persiantoolbox.com/tools' },
  { name: 'ابزارهای اعتبارسنجی', item: 'https://persiantoolbox.com/validation-tools' },
];

const faqItems = [
  {
    question: 'چگونه از QR Code Generator استفاده کنم؟',
    answer:
      'کافیست متن یا URL مورد نظر را وارد کنید، اندازه QR Code را انتخاب کنید و روی دکمه "تولید QR Code" کلیک کنید. سپس می‌توانید آن را دانلود کنید.',
  },
  {
    question: 'رمز عبور تولید شده امن است؟',
    answer:
      'بله، رمز عبور تولید شده به صورت محلی در مرورگر شما ساخته می‌شود و به سرور ارسال نمی‌شود. با ترکیب حروف بزرگ، کوچک، اعداد و نمادها، رمز عبور بسیار امن تولید می‌شود.',
  },
  {
    question: 'آیا این ابزارها رایگان هستند؟',
    answer:
      'بله، تمام ابزارهای جعبه ابزار فارسی کاملاً رایگان هستند و بدون نیاز به ثبت‌نام می‌توانید از آنها استفاده کنید.',
  },
];

export default function ValidationToolsPage() {
  return (
    <div className="space-y-8">
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateBreadcrumbSchema(breadcrumbItems)),
        }}
      />
      <Script
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateFAQSchema(faqItems)),
        }}
      />

      <PageHero
        title="ابزارهای اعتبارسنجی"
        description="ابزارهای حرفه‌ای برای اعتبارسنجی، تولید رمز عبور و QR Code. کاملاً رایگان و آفلاین."
        gradient="success"
        badges={[{ text: 'ابزارهای امنیتی', color: 'success' }]}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <QrCodeGenerator />
        <PasswordGenerator />
      </div>

      <div className="section-surface p-6 rounded-[var(--radius-lg)] border border-[var(--border-light)]">
        <h3 className="text-lg font-black text-[var(--text-primary)] mb-4">ابزارهای بیشتر</h3>
        <ul className="space-y-3 text-sm text-[var(--text-muted)]">
          <li>🔍 اعتبارسنجی کد ملی</li>
          <li>📱 اعتبارسنجی شماره موبایل</li>
          <li>💳 اعتبارسنجی شماره کارت</li>
          <li>🏦 اعتبارسنجی شماره شبا</li>
          <li>📍 اعتبارسنجی کد پستی</li>
          <li>✉️ اعتبارسنجی ایمیل</li>
        </ul>
      </div>

      <FAQSection items={faqItems} />
    </div>
  );
}
