import dynamic from 'next/dynamic';
import Script from 'next/script';
import SiteShell from '@/components/ui/SiteShell';
import BreadcrumbSchema from '@/components/seo/BreadcrumbSchema';
import { buildMetadata, siteUrl } from '@/lib/seo';
import { getToolWithMetadataOverride } from '@/lib/tool-metadata-overrides';
import { getPack3FaqAnswer } from '@/lib/pricing/pricingSnippets';

export const revalidate = 3600;

const WorkCertificateForm = dynamic(
  () => import('@/components/features/work-certificate/WorkCertificateForm'),
  {
    loading: () => (
      <div className="flex items-center justify-center py-20">
        <div className="animate-pulse text-(--text-muted) text-sm">در حال بارگذاری...</div>
      </div>
    ),
  },
);

const tool = getToolWithMetadataOverride('/career-tools/work-certificate');

export const metadata = buildMetadata({
  title: tool.title,
  description: tool.description,
  path: tool.path,
  keywords: tool.keywords,
});

export default async function WorkCertificatePage() {
  const pack3PricingFaq = await getPack3FaqAnswer(
    ' و نیازی به اشتراک ماهانه ندارد. خروجی رایگان با واترمارک نیز موجود است.',
  );

  return (
    <SiteShell containerClassName="py-10">
      <Script
        id="work-certificate-breadcrumb"
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
              { '@type': 'ListItem', position: 3, name: 'گواهی سابقه کار' },
            ],
          }),
        }}
      />
      <BreadcrumbSchema
        items={[
          { name: 'خانه', url: siteUrl },
          { name: 'ابزارهای شغلی', url: `${siteUrl}/career-tools` },
          { name: 'گواهی سابقه کار', url: `${siteUrl}/career-tools/work-certificate` },
        ]}
      />
      <Script
        id="work-certificate-faq"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: [
              {
                '@type': 'Question',
                name: 'آیا گواهی سابقه کار رسمی است؟',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'این گواهی یک پیش‌نویس بر اساس اطلاعات واردشده توسط شماست و جایگزین گواهی رسمی اداره کار یا سازمان اداری و استخدامی نیست.',
                },
              },
              {
                '@type': 'Question',
                name: 'آیا اطلاعات من به سرور ارسال می‌شود؟',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'خیر، تمام پردازش‌ها در مرورگر شما انجام می‌شود. اطلاعات هرگز از دستگاه شما خارج نمی‌شود.',
                },
              },
              {
                '@type': 'Question',
                name: 'گواهی دو زبانه چیست؟',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'گواهی دو زبانه هم به فارسی و هم به انگلیسی صادر می‌شود که برای ارائه به سفارت‌ها، بانک‌های بین‌المللی و شرکت‌های خارجی مناسب است.',
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
          aria-labelledby="work-certificate-intro"
          className="mb-6 space-y-3 rounded-lg border border-(--border-light) bg-(--surface-1) p-5"
        >
          <h2 id="work-certificate-intro" className="text-xl font-bold text-(--text-primary)">
            ساخت گواهی اشتغال به کار PDF و Word
          </h2>
          <p className="leading-7 text-(--text-secondary)">
            اطلاعات شغلی و مشخصات کارفرما را وارد کنید تا یک پیش‌نویس گواهی سابقه کار قابل ویرایش
            آماده کنید. خروجی برای بررسی و ارائه به بانک، ویزا و شرکت‌ها مناسب است.
          </p>
          <p className="text-sm leading-7 text-(--text-muted)">
            این ابزار سند رسمی صادر نمی‌کند؛ متن نهایی را با اطلاعات واقعی خود و الزامات سازمان
            دریافت‌کننده تطبیق دهید.
          </p>
        </section>
        <WorkCertificateForm />
        <section
          aria-labelledby="work-certificate-examples"
          className="mt-10 space-y-5 rounded-lg border border-(--border-light) bg-(--surface-1) p-5"
        >
          <h2 id="work-certificate-examples" className="text-xl font-bold text-(--text-primary)">
            نمونه متن گواهی اشتغال به کار و سابقه کار
          </h2>
          <p className="leading-7 text-(--text-secondary)">
            عبارت‌های داخل کروشه را با اطلاعات واقعی جایگزین کنید. برای ساخت فایل، همین مشخصات را در
            فرم بالا وارد کنید و پیش‌نمایش را بررسی کنید.
          </p>
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-(--text-primary)">نمونه برای فرد شاغل</h3>
            <blockquote className="rounded-md bg-(--surface-2) p-4 leading-8 text-(--text-secondary)">
              گواهی می‌شود [نام و نام خانوادگی] از تاریخ [تاریخ شروع] تاکنون در شرکت [نام شرکت] با
              سمت [عنوان شغلی] مشغول به کار است. این گواهی به درخواست نامبرده جهت ارائه به [نام
              دریافت‌کننده] تنظیم شده است.
            </blockquote>
            <p className="text-sm leading-7 text-(--text-muted)">
              در فرم، گزینهٔ «هنوز مشغول به کار است» را فعال کنید. تاریخ شروع باید تاریخ واقعی آغاز
              همکاری باشد.
            </p>
          </div>
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-(--text-primary)">
              نمونه برای همکاری پایان‌یافته
            </h3>
            <blockquote className="rounded-md bg-(--surface-2) p-4 leading-8 text-(--text-secondary)">
              گواهی می‌شود [نام و نام خانوادگی] از تاریخ [تاریخ شروع] تا تاریخ [تاریخ پایان] در شرکت
              [نام شرکت] با سمت [عنوان شغلی] همکاری داشته است. این گواهی به درخواست نامبرده جهت
              ارائه به [نام دریافت‌کننده] تنظیم شده است.
            </blockquote>
            <p className="text-sm leading-7 text-(--text-muted)">
              گزینهٔ اشتغال فعلی را غیرفعال و تاریخ پایان همکاری را وارد کنید. تاریخ پایان باید
              برابر یا پس از تاریخ شروع باشد.
            </p>
          </div>
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-(--text-primary)">
              تکمیل گواهی برای ارائه به بانک
            </h3>
            <p className="leading-7 text-(--text-secondary)">
              نام بانک یا شعبه و هدف ارائه را در «توضیحات اضافی» بنویسید. اگر بانک مبلغ حقوق را
              خواسته است، آن را در فیلد «آخرین حقوق (ریال)» وارد کنید. اطلاعات صادرکننده و تاریخ
              صدور را تکمیل و شرایط تأیید، مهر یا امضای موردنیاز را از کارفرما و بانک دریافت‌کننده
              بررسی کنید.
            </p>
            <p className="text-sm leading-7 text-(--text-muted)">
              در پایان، متن و تاریخ‌ها را در پیش‌نمایش بخوانید و سپس از بخش دانلود، خروجی موردنیاز
              را انتخاب کنید. شرایط نسخه و قالب انتخابی در همان بخش نمایش داده می‌شود.
            </p>
          </div>
        </section>
      </div>
    </SiteShell>
  );
}
