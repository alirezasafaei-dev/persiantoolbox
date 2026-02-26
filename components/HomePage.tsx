import Script from 'next/script';
import Link from 'next/link';
import ButtonLink from '@/shared/ui/ButtonLink';
import ToolCard from '@/shared/ui/ToolCard';
import { siteUrl } from '@/lib/seo';
import {
  getCategoryDisplayCount,
  getCategories,
  getCategoryDisplayEntries,
  getDisplayToolsCount,
} from '@/lib/tools-registry';
import { getCspNonce } from '@/lib/csp';
import PopularTools from '@/components/home/PopularTools';
import RecentTools from '@/components/home/RecentTools';
import TrustStats from '@/components/home/TrustStats';
import { toPersianNumbers } from '@/shared/utils/localization/persian';
import {
  IconCalculator,
  IconCalendar,
  IconImage,
  IconMoney,
  IconPdf,
  IconZap,
} from '@/shared/ui/icons';

export default async function HomePage() {
  const categories = getCategories();
  const totalToolsCount = getDisplayToolsCount();
  const pdfToolsCount = getCategoryDisplayCount('pdf-tools');
  const imageToolsCount = getCategoryDisplayCount('image-tools');
  const dateToolsCount = getCategoryDisplayCount('date-tools');
  const textToolsCount = getCategoryDisplayCount('text-tools');
  const formatCountMeta = (count: number) =>
    count > 0 ? `${toPersianNumbers(count)} ابزار` : 'در حال تکمیل';
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

  const quickTasks = [
    {
      title: 'ادغام PDF',
      description: 'چند فایل را در یک خروجی منسجم ترکیب کنید.',
      href: '/pdf-tools/merge/merge-pdf',
      icon: <IconPdf className="h-5 w-5 text-[var(--color-danger)]" />,
      tone: 'bg-[rgb(var(--color-danger-rgb)/0.12)]',
    },
    {
      title: 'فشرده‌سازی تصویر',
      description: 'حجم کمتر با کیفیت قابل کنترل.',
      href: '/image-tools',
      icon: <IconImage className="h-5 w-5 text-[var(--color-info)]" />,
      tone: 'bg-[rgb(var(--color-info-rgb)/0.12)]',
    },
    {
      title: 'محاسبه اقساط وام',
      description: 'اقساط ماهانه و سود کل را ببینید.',
      href: '/loan',
      icon: <IconCalculator className="h-5 w-5 text-[var(--color-primary)]" />,
      tone: 'bg-[rgb(var(--color-primary-rgb)/0.12)]',
    },
    {
      title: 'تبدیل آدرس فارسی',
      description: 'آدرس را سریع به فرمت انگلیسی استاندارد تبدیل کنید.',
      href: '/text-tools/address-fa-to-en',
      icon: <IconZap className="h-5 w-5 text-[var(--color-info)]" />,
      tone: 'bg-[rgb(var(--color-info-rgb)/0.12)]',
    },
  ];

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
            <ButtonLink href="/pdf-tools" variant="tertiary" size="lg" className="px-8">
              ابزارهای پی‌دی‌اف
            </ButtonLink>
            <ButtonLink
              href="/tools#specialized-tools"
              variant="secondary"
              size="lg"
              className="px-8"
            >
              ابزارهای تخصصی
            </ButtonLink>
            <ButtonLink href="/text-tools" variant="tertiary" size="lg" className="px-8">
              ابزارهای متنی
            </ButtonLink>
            <ButtonLink href="/tools" size="lg" className="px-8">
              همه ابزارها
            </ButtonLink>
          </div>
        </div>
      </section>

      <section className="section-surface p-6 md:p-8" aria-labelledby="quick-start-heading">
        <div className="space-y-4">
          <h2 id="quick-start-heading" className="text-2xl font-black text-[var(--text-primary)]">
            شروع سریع با پرکاربردها
          </h2>
          <p className="text-sm text-[var(--text-muted)]">
            مسیرهای سریع برای کارهای روزمره با متن‌های فارسی واضح و خروجی فوری.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {quickTasks.map((task) => (
              <Link
                key={task.title}
                href={task.href}
                className="group rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)]/85 p-4 transition-all duration-[var(--motion-fast)] hover:border-[var(--color-primary)] hover:shadow-[var(--shadow-strong)]"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] ${task.tone}`}
                  >
                    {task.icon}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-[var(--text-primary)]">{task.title}</div>
                    <div className="text-xs text-[var(--text-muted)]">{task.description}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <RecentTools />

      <PopularTools />

      <section className="space-y-8" aria-labelledby="tools-heading">
        <div className="flex flex-col gap-2 text-center">
          <h2 id="tools-heading" className="text-3xl font-black text-[var(--text-primary)]">
            دسته‌بندی ابزارها
          </h2>
          <p className="text-base text-[var(--text-muted)]">مسیر مستقیم به ابزار موردنیاز شما.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <ToolCard
            href="/pdf-tools"
            title="ابزارهای PDF"
            meta={formatCountMeta(pdfToolsCount)}
            description="تبدیل، فشرده‌سازی، ادغام، تقسیم، رمزگذاری و واترمارک"
            icon={<IconPdf className="h-7 w-7 text-[var(--color-danger)]" />}
            iconWrapClassName="bg-[rgb(var(--color-danger-rgb)/0.1)]"
          />
          <ToolCard
            href="/image-tools"
            title="ابزارهای تصویر"
            meta={formatCountMeta(imageToolsCount)}
            description="فشرده‌سازی و بهینه‌سازی تصاویر با کنترل کیفیت و ابعاد"
            icon={<IconImage className="h-7 w-7 text-[var(--color-info)]" />}
            iconWrapClassName="bg-[rgb(var(--color-info-rgb)/0.12)]"
          />
          <ToolCard
            href="/loan"
            title="محاسبه‌گر وام"
            meta="محبوب"
            description="محاسبه اقساط ماهانه، سود کل و برنامه بازپرداخت"
            icon={<IconCalculator className="h-7 w-7 text-[var(--color-primary)]" />}
            iconWrapClassName="bg-[rgb(var(--color-primary-rgb)/0.12)]"
          />
          <ToolCard
            href="/salary"
            title="محاسبه‌گر حقوق"
            meta="جدید"
            description="حقوق خالص، بیمه و مالیات را سریع محاسبه کنید"
            icon={<IconMoney className="h-7 w-7 text-[var(--color-success)]" />}
            iconWrapClassName="bg-[rgb(var(--color-success-rgb)/0.12)]"
          />
          <ToolCard
            href="/date-tools"
            title="ابزارهای تاریخ"
            meta={formatCountMeta(dateToolsCount)}
            description="تبدیل شمسی/میلادی، محاسبه سن و اختلاف تاریخ"
            icon={<IconCalendar className="h-7 w-7 text-[var(--color-warning)]" />}
            iconWrapClassName="bg-[rgb(var(--color-warning-rgb)/0.14)]"
          />
          <ToolCard
            href="/text-tools"
            title="ابزارهای متنی"
            meta={formatCountMeta(textToolsCount)}
            description="تبدیل عدد به حروف، شمارش کلمات، اسلاگ و تبدیل آدرس"
            icon={<IconZap className="h-7 w-7 text-[var(--color-info)]" />}
            iconWrapClassName="bg-[rgb(var(--color-info-rgb)/0.14)]"
          />
        </div>
      </section>

      <TrustStats />

      <section className="section-surface p-6 md:p-8 lg:p-10" aria-labelledby="home-faq-heading">
        <h2 id="home-faq-heading" className="text-2xl font-black text-[var(--text-primary)]">
          سوالات متداول
        </h2>
        <div className="mt-4 space-y-3">
          {homeFaq.map((item) => (
            <details
              key={item.question}
              className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] px-4 py-3"
            >
              <summary className="cursor-pointer font-semibold text-[var(--text-primary)]">
                {item.question}
              </summary>
              <p className="mt-2 leading-7 text-[var(--text-secondary)]">{item.answer}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
