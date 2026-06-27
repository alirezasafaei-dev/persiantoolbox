import Script from 'next/script';
import Link from 'next/link';
import ButtonLink from '@/shared/ui/ButtonLink';
import FAQSection from '@/shared/ui/FAQSection';
import { siteUrl } from '@/lib/seo';
import {
  getCategories,
  getCategoryDisplayEntries,
  getDisplayToolsCount,
} from '@/lib/tools-registry';
import { getCspNonce } from '@/lib/csp';
import BlogPreviewSection from '@/components/home/BlogPreviewSection';
import SiteAdBanner from '@/components/ui/SiteAdBanner';
import { isFeatureEnabled } from '@/lib/features/availability';
import { toPersianNumbers } from '@/shared/utils/localization/persian';

export default async function HomePage() {
  const categories = getCategories();
  const totalToolsCount = getDisplayToolsCount();
  const nonce = await getCspNonce();

  const flagshipProducts = [
    {
      title: 'فاکتورساز و رسیدساز',
      description: 'ساخت فاکتور و رسید حرفه‌ای با قالب‌های آماده، بدون نیاز به نرم‌افزار جانبی.',
      href: '/business-tools/document-studio?type=invoice',
      cta: 'ساخت فاکتور',
      icon: '📄',
    },
    {
      title: 'رزومه‌ساز حرفه‌ای',
      description: 'رزومه فارسی و انگلیسی با قالب‌های حرفه‌ای، خروجی HTML آماده ارسال.',
      href: '/career-tools/resume-builder?type=persian-resume',
      cta: 'ساخت رزومه',
      icon: '📝',
    },
    {
      title: 'ویرایشگر فارسی',
      description: 'پاک‌سازی نگارشی، اصلاح حروف عربی، حذف فاصله‌های اضافی و آمار متن.',
      href: '/writing-tools/persian-writing-studio',
      cta: 'ویرایش متن',
      icon: '✏️',
    },
  ];

  const quickToolCategories = [
    { id: 'pdf-tools', name: 'PDF', icon: '📄', path: '/pdf-tools' },
    { id: 'image-tools', name: 'تصویر', icon: '🖼️', path: '/image-tools' },
    { id: 'finance-tools', name: 'مالی', icon: '💰', path: '/tools' },
    { id: 'date-tools', name: 'تاریخ', icon: '📅', path: '/date-tools' },
    { id: 'text-tools', name: 'متنی', icon: '✏️', path: '/text-tools' },
    { id: 'validation-tools', name: 'اعتبارسنجی', icon: '🔐', path: '/validation-tools' },
    { id: 'contract-tools', name: 'قرارداد', icon: '📋', path: '/contract-tools' },
    { id: 'business-tools', name: 'کسب‌وکار', icon: '💼', path: '/business-tools' },
    { id: 'career-tools', name: 'شغلی', icon: '🎯', path: '/career-tools' },
    { id: 'writing-tools', name: 'نگارش', icon: '✍️', path: '/writing-tools' },
  ];

  const homeFaq = [
    {
      question: 'آیا داده‌ها به سرور ارسال می‌شوند؟',
      answer:
        'خیر، تمام پردازش‌ها در مرورگر شما انجام می‌شود. فایل‌ها و متن‌هایی که وارد می‌کنید هرگز از دستگاه خارج نمی‌شوند.',
    },
    {
      question: 'آیا خروجی‌ها رسمی یا تضمینی هستند؟',
      answer:
        'خروجی‌ها برای استفاده عمومی و اداری مناسب هستند، اما جایگزین مشاوره حرفه‌ای یا مراجع رسمی نیستند.',
    },
    {
      question: 'تفاوت نسخه رایگان و حرفه‌ای چیست؟',
      answer:
        'نسخه رایگان شامل ابزارهای پایه است. نسخه حرفه‌ای قالب‌های بیشتر، خروجی DOCX و امکانات پیشرفته‌تری ارائه می‌دهد.',
    },
    {
      question: 'آیا برای استفاده باید ثبت‌نام کنم؟',
      answer: 'خیر، همه ابزارها بدون ثبت‌نام و ورود قابل استفاده هستند.',
    },
    {
      question: 'آیا ابزارها روی موبایل کار می‌کنند؟',
      answer: 'بله، رابط کاربری واکنش‌گراست و روی موبایل و تبلت به خوبی کار می‌کند.',
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
      {
        '@type': 'WebSite',
        name: 'جعبه ابزار فارسی',
        url: siteUrl,
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${siteUrl}/?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'Organization',
        name: 'جعبه ابزار فارسی',
        url: siteUrl,
        logo: `${siteUrl}/logo.png`,
        sameAs: [
          'https://t.me/persiantoolbox',
          'https://github.com/parsairaniiidev/persiantoolbox',
        ],
      },
    ],
  };

  return (
    <div className="space-y-14">
      <Script
        id="home-json-ld"
        type="application/ld+json"
        strategy="afterInteractive"
        nonce={nonce ?? undefined}
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd) }}
      />

      {/* Hero Section */}
      <section
        className="section-surface relative overflow-hidden p-6 md:p-10 lg:p-12"
        aria-labelledby="hero-heading"
      >
        <div className="pointer-events-none absolute -top-36 right-1/2 h-72 w-72 translate-x-1/2 rounded-full bg-[rgb(var(--color-primary-rgb)/0.2)] blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-10 h-60 w-60 rounded-full bg-[rgb(var(--color-success-rgb)/0.16)] blur-3xl" />

        <div className="relative space-y-6 text-center">
          <h1 id="hero-heading" className="text-4xl font-black leading-tight md:text-5xl">
            بیش از {toPersianNumbers(totalToolsCount)} ابزار رایگان فارسی — سریع، امن، بدون ثبت‌نام
          </h1>
          <p className="mx-auto max-w-3xl text-base leading-8 text-[var(--text-secondary)] md:text-lg">
            تبدیل PDF، محاسبه وام، فشرده‌سازی تصویر و ده‌ها ابزار کاربردی دیگر. تمام پردازش‌ها در
            مرورگر شما انجام می‌شود.
          </p>

          <div className="mx-auto max-w-xl">
            <a
              href="/search"
              className="flex items-center gap-3 rounded-full border border-[var(--border-light)] bg-[var(--surface-1)] px-5 py-3 text-sm text-[var(--text-muted)] shadow-[var(--shadow-subtle)] transition-all hover:border-[var(--color-primary)] hover:shadow-[var(--shadow-medium)]"
            >
              <svg
                className="h-5 w-5 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              ابزار مورد نظر خود را جستجو کنید...
            </a>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            <ButtonLink href="/tools" size="lg" className="px-8">
              شروع رایگان ←
            </ButtonLink>
            <ButtonLink href="/topics" variant="secondary" size="lg" className="px-8">
              مشاهده همه ابزارها
            </ButtonLink>
          </div>

          <div className="flex items-center justify-center gap-2 text-xs text-[var(--text-muted)]">
            <span>🔒</span>
            <span>پردازش محلی — داده‌های شما ارسال نمی‌شوند</span>
          </div>
        </div>
      </section>

      {isFeatureEnabled('ads') && <SiteAdBanner placement="homepage-hero" />}

      {/* Flagship Products */}
      <section className="space-y-6" aria-labelledby="flagship-heading">
        <div className="flex flex-col gap-2 text-center">
          <h2 id="flagship-heading" className="text-3xl font-black text-[var(--text-primary)]">
            محصولات حرفه‌ای
          </h2>
          <p className="text-sm text-[var(--text-muted)]">
            ابزارهای ویژه برای سندسازی و ویرایش، آماده استفاده
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {flagshipProducts.map((product) => (
            <Link
              key={product.href}
              href={product.href}
              className="group rounded-[var(--radius-lg)] border border-[var(--color-primary)]/20 bg-[var(--surface-1)] p-6 transition-all duration-200 hover:border-[var(--color-primary)] hover:shadow-[var(--shadow-medium)]"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-md)] bg-[rgb(var(--color-primary-rgb)/0.08)] text-2xl">
                {product.icon}
              </div>
              <div className="mt-4 text-lg font-bold text-[var(--text-primary)] group-hover:text-[var(--color-primary)] transition-colors">
                {product.title}
              </div>
              <div className="mt-2 text-sm text-[var(--text-muted)] leading-6">
                {product.description}
              </div>
              <div className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[var(--color-primary)]">
                {product.cta}
                <span aria-hidden="true">←</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Quick Tool Categories */}
      <section className="space-y-6" aria-labelledby="quick-tools-heading">
        <div className="flex flex-col gap-2 text-center">
          <h2 id="quick-tools-heading" className="text-3xl font-black text-[var(--text-primary)]">
            دسته‌بندی ابزارها
          </h2>
          <p className="text-sm text-[var(--text-muted)]">
            {toPersianNumbers(totalToolsCount)} ابزار در {toPersianNumbers(categories.length)}{' '}
            دسته‌بندی مختلف
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {quickToolCategories.map((cat) => (
            <Link
              key={cat.id}
              href={cat.path}
              className="group flex flex-col items-center gap-2 rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-4 text-center transition-all duration-200 hover:border-[var(--color-primary)] hover:shadow-[var(--shadow-medium)]"
            >
              <div className="text-2xl">{cat.icon}</div>
              <div className="text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--color-primary)] transition-colors">
                {cat.name}
              </div>
              <div className="text-xs text-[var(--text-muted)]">
                {toPersianNumbers(getCategoryDisplayEntries(cat.id).length)} ابزار
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Search */}
      <section className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-6 text-center">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">دنبال ابزار خاصی هستید؟</h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          از صفحه جستجو برای پیدا کردن دقیق ابزار مورد نظر استفاده کنید
        </p>
        <div className="mt-4">
          <ButtonLink href="/search" size="lg">
            جستجوی ابزارها
          </ButtonLink>
        </div>
      </section>

      {/* Trust Section */}
      <section className="space-y-6" aria-labelledby="trust-heading">
        <div className="flex flex-col gap-2 text-center">
          <h2 id="trust-heading" className="text-3xl font-black text-[var(--text-primary)]">
            چرا از ابزارهای فارسی استفاده کنیم؟
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: '🔒',
              title: 'پردازش محلی',
              desc: 'تمام پردازش‌ها در مرورگر شما انجام می‌شود.',
            },
            {
              icon: '🛡️',
              title: 'بدون ارسال فایل یا متن',
              desc: 'داده‌های شما هرگز از دستگاه خارج نمی‌شوند.',
            },
            {
              icon: '⚡',
              title: 'بدون نیاز به نصب',
              desc: 'مرورگر کافی است، نرم‌افزاری نصب نمی‌شود.',
            },
            {
              icon: '🇮🇷',
              title: 'فارسی و راست‌چین',
              desc: 'رابط کاربری کاملاً فارسی با پشتیبانی RTL.',
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-5 text-center"
            >
              <div className="text-3xl">{item.icon}</div>
              <div className="mt-3 text-sm font-bold text-[var(--text-primary)]">{item.title}</div>
              <div className="mt-2 text-xs text-[var(--text-muted)] leading-5">{item.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Blog Preview */}
      <BlogPreviewSection />

      {/* FAQ */}
      <FAQSection items={homeFaq} />
    </div>
  );
}
