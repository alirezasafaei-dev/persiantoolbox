import Script from 'next/script';
import Link from 'next/link';
import ButtonLink from '@/shared/ui/ButtonLink';
import ToolCard from '@/shared/ui/ToolCard';
import { siteUrl } from '@/lib/seo';
import { getCategories, getToolsByCategory } from '@/lib/tools-registry';
import { getCspNonce } from '@/lib/csp';
import {
  IconCalculator,
  IconCalendar,
  IconImage,
  IconMoney,
  IconPdf,
  IconShield,
  IconZap,
} from '@/shared/ui/icons';

export default async function HomePage() {
  const categories = getCategories();
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
            itemListElement: getToolsByCategory(category.id).map((tool, toolIndex) => ({
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
      title: 'اعتبارسنجی سریع',
      description: 'کد ملی، موبایل و کارت بانکی را بررسی کنید.',
      href: '/validation-tools',
      icon: <IconShield className="h-5 w-5 text-[var(--color-success)]" />,
      tone: 'bg-[rgb(var(--color-success-rgb)/0.12)]',
    },
  ];

  return (
    <div className="space-y-12">
      <Script
        id="home-json-ld"
        type="application/ld+json"
        strategy="afterInteractive"
        nonce={nonce ?? undefined}
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd) }}
      />

      <section className="section-surface p-6 md:p-10 lg:p-12" aria-labelledby="hero-heading">
        <div className="space-y-7 text-center">
          <div className="inline-flex flex-wrap items-center justify-center gap-2 rounded-full border border-[var(--border-light)] bg-[var(--surface-1)] px-4 py-2 text-xs font-semibold text-[var(--text-muted)]">
            <span className="h-2 w-2 rounded-full bg-[var(--color-success)]"></span>
            پردازش کاملاً محلی
            <span className="h-2 w-2 rounded-full bg-[var(--color-info)]"></span>
            بدون ثبت‌نام
            <span className="h-2 w-2 rounded-full bg-[var(--color-warning)]"></span>
            کاملاً رایگان
          </div>

          <div className="space-y-3">
            <h1 id="hero-heading" className="text-4xl font-black leading-tight md:text-5xl">
              ابزارهای فارسی بدون شلوغی و حواس‌پرتی
            </h1>
            <p className="mx-auto max-w-3xl text-base text-[var(--text-secondary)] md:text-lg">
              سریع ابزار موردنیازتان را انتخاب کنید و همان‌جا خروجی بگیرید؛ ساده، امن و قابل اتکا.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            <ButtonLink href="/tools" size="lg" className="px-8">
              همه ابزارها
            </ButtonLink>
            <ButtonLink href="/pdf-tools" variant="tertiary" size="lg" className="px-8">
              ابزارهای PDF
            </ButtonLink>
            <ButtonLink href="/text-tools" variant="tertiary" size="lg" className="px-8">
              ابزارهای متنی
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
            چهار مسیر سریع برای کارهای روزمره و پرتکرار.
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
            meta="۷ ابزار"
            description="تبدیل، فشرده‌سازی، ادغام، تقسیم، رمزگذاری و واترمارک"
            icon={<IconPdf className="h-7 w-7 text-[var(--color-danger)]" />}
            iconWrapClassName="bg-[rgb(var(--color-danger-rgb)/0.1)]"
          />
          <ToolCard
            href="/image-tools"
            title="ابزارهای تصویر"
            meta="۳ ابزار"
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
            meta="۴ ابزار"
            description="تبدیل شمسی/میلادی، محاسبه سن و اختلاف تاریخ"
            icon={<IconCalendar className="h-7 w-7 text-[var(--color-warning)]" />}
            iconWrapClassName="bg-[rgb(var(--color-warning-rgb)/0.14)]"
          />
          <ToolCard
            href="/text-tools"
            title="ابزارهای متنی"
            meta="۵ ابزار"
            description="تبدیل تاریخ، عدد به حروف، اسلاگ و تبدیل آدرس"
            icon={<IconZap className="h-7 w-7 text-[var(--color-info)]" />}
            iconWrapClassName="bg-[rgb(var(--color-info-rgb)/0.14)]"
          />
          <ToolCard
            href="/validation-tools"
            title="اعتبارسنجی داده‌ها"
            meta="۶ ابزار"
            description="کد ملی، موبایل، کارت بانکی، شبا، کدپستی و پلاک"
            icon={<IconShield className="h-7 w-7 text-[var(--color-success)]" />}
            iconWrapClassName="bg-[rgb(var(--color-success-rgb)/0.12)]"
          />
        </div>
      </section>

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
