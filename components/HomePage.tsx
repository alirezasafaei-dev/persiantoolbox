import Script from 'next/script';
import ButtonLink from '@/shared/ui/ButtonLink';
import FAQSection from '@/shared/ui/FAQSection';
import { siteUrl } from '@/lib/seo';
import {
  getCategories,
  getCategoryDisplayEntries,
  getDisplayToolsCount,
} from '@/lib/tools-registry';
import { getCspNonce } from '@/lib/csp';
import PopularTools from '@/components/home/PopularTools';
import RecentTools from '@/components/home/RecentTools';
import TrustStats from '@/components/home/TrustStats';
import ToolSearch from '@/components/home/ToolSearch';
import { toPersianNumbers } from '@/shared/utils/localization/persian';

export default async function HomePage() {
  const categories = getCategories();
  const totalToolsCount = getDisplayToolsCount();
  const nonce = await getCspNonce();

  const homeFaq = [
    {
      question: 'آیا فایل‌ها و داده‌ها به سرور ارسال می‌شوند؟',
      answer: 'خیر، پردازش‌ها در مرورگر انجام می‌شود و فایل‌ها ارسال نمی‌شوند.',
    },
    {
      question: 'آیا برای استفاده باید ثبت‌نام کنم؟',
      answer: 'خیر، همه ابزارها بدون ثبت‌نام قابل استفاده هستند.',
    },
    {
      question: 'آیا ابزارها روی موبایل هم کار می‌کنند؟',
      answer: 'بله، رابط کاربری واکنش‌گراست و روی موبایل قابل استفاده است.',
    },
  ];

  const homeJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        name: 'جعبه ابزار فارسی - صفحه اصلی',
        description: 'ابزارهای PDF، مالی، تصویر، تاریخ، متن و اعتبارسنجی در یک صفحه خلوت',
        url: siteUrl,
        inLanguage: 'fa-IR',
      },
      {
        '@type': 'ItemList',
        name: 'دسته‌بندی ابزارها',
        itemListOrder: 'https://schema.org/ItemListUnordered',
        itemListElement: categories.map((category, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: category.name,
          url: new URL(category.path, siteUrl).toString(),
          item: {
            '@type': 'ItemList',
            name: category.name,
            itemListOrder: 'https://schema.org/ItemListUnordered',
            itemListElement: getCategoryDisplayEntries(category.id).map((tool, toolIndex) => ({
              '@type': 'ListItem',
              position: toolIndex + 1,
              name: tool.title.replace(' - جعبه ابزار فارسی', ''),
              url: new URL(tool.path, siteUrl).toString(),
            })),
          },
        })),
      },
      {
        '@type': 'FAQPage',
        mainEntity: homeFaq.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: { '@type': 'Answer', text: item.answer },
        })),
      },
    ],
  };

  const heroStats = [
    {
      label: 'ابزار فعال',
      value: toPersianNumbers(totalToolsCount),
      description: 'در دسته‌های مختلف کاربردی',
    },
    {
      label: 'وضعیت پردازش',
      value: '۱۰۰٪ محلی',
      description: 'بدون ارسال فایل به سرویس بیرونی',
    },
    {
      label: 'دسترسی',
      value: '۲۴/۷',
      description: 'رابط سریع روی موبایل و دسکتاپ',
    },
  ];

  return (
    <div className="space-y-14">
      <Script
        id="home-json-ld"
        type="application/ld+json"
        strategy="afterInteractive"
        nonce={nonce ?? undefined}
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd) }}
      />

      <section
        className="section-surface relative overflow-hidden p-6 md:p-10 lg:p-12"
        aria-labelledby="hero-heading"
      >
        <div className="pointer-events-none absolute -top-36 right-1/2 h-72 w-72 translate-x-1/2 rounded-full bg-[rgb(var(--color-primary-rgb)/0.2)] blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-10 h-60 w-60 rounded-full bg-[rgb(var(--color-success-rgb)/0.16)] blur-3xl" />

        <div className="relative space-y-8 text-center">
          <div className="inline-flex flex-wrap items-center justify-center gap-2 rounded-full border border-[var(--border-light)] bg-[var(--surface-1)] px-4 py-2 text-xs font-semibold text-[var(--text-muted)]">
            <span className="h-2 w-2 rounded-full bg-[var(--color-success)]" />
            پردازش محلی و امن
            <span className="h-2 w-2 rounded-full bg-[var(--color-info)]" />
            تجربه یکدست فارسی
            <span className="h-2 w-2 rounded-full bg-[var(--color-warning)]" />
            بدون نیاز به ثبت‌نام
          </div>

          <div className="space-y-3">
            <h1 id="hero-heading" className="text-4xl font-black leading-tight md:text-5xl">
              ابزارهای فارسی بدون شلوغی و حواس‌پرتی
            </h1>
            <p className="mx-auto max-w-3xl text-base leading-8 text-[var(--text-secondary)] md:text-lg">
              یک تجربه حرفه‌ای برای کاربران فارسی: انتخاب سریع ابزار، اجرای دقیق، و خروجی قابل اتکا
              در همان لحظه.
            </p>
          </div>

          <ToolSearch />

          <div className="grid gap-3 sm:grid-cols-3">
            {heroStats.map((item) => (
              <div
                key={item.label}
                className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)]/85 p-4 text-right shadow-[var(--shadow-subtle)]"
              >
                <div className="text-xs font-semibold text-[var(--text-muted)]">{item.label}</div>
                <div className="mt-1 text-2xl font-black text-[var(--text-primary)]">
                  {item.value}
                </div>
                <div className="mt-1 text-xs text-[var(--text-muted)]">{item.description}</div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            <ButtonLink href="/topics" size="lg" className="px-8">
              همه ابزارها
            </ButtonLink>
            <ButtonLink href="/pdf-tools" variant="secondary" size="lg" className="px-8">
              ابزارهای PDF
            </ButtonLink>
            <ButtonLink href="/tools" variant="secondary" size="lg" className="px-8">
              ابزارهای مالی
            </ButtonLink>
            <ButtonLink href="/text-tools" variant="secondary" size="lg" className="px-8">
              ابزارهای متنی
            </ButtonLink>
          </div>
        </div>
      </section>

      <RecentTools />

      <PopularTools />

      <TrustStats />

      <section className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-6 text-center">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">ابزار مناسب خودتان را پیدا کنید</h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          مقایسه ابزارها، کاربردهای عملی و راهنمای استفاده
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/compare" size="lg">
            مقایسه ابزارها
          </ButtonLink>
          <ButtonLink href="/use-cases" variant="secondary" size="lg">
            کاربردها و مثال‌ها
          </ButtonLink>
          <ButtonLink href="/blog" variant="secondary" size="lg">
            بلاگ و راهنماها
          </ButtonLink>
        </div>
      </section>

      <FAQSection items={homeFaq} />
    </div>
  );
}
