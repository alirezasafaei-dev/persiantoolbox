import Script from 'next/script';
import Link from 'next/link';
import ButtonLink from '@/shared/ui/ButtonLink';
import FAQSection from '@/shared/ui/FAQSection';
import { siteUrl } from '@/lib/seo';
import {
  getCategories,
  getCategoryDisplayEntries,
  getDisplayToolsCount,
  getNewestTools,
} from '@/lib/tools-registry';
import { getCspNonce } from '@/lib/csp';
import BlogPreviewSection from '@/components/home/BlogPreviewSection';
import SiteAdBanner from '@/components/ui/SiteAdBanner';
import { isFeatureEnabled } from '@/lib/features/availability';
import { toPersianNumbers } from '@/shared/utils/localization/persian';

export default async function HomePage() {
  const categories = getCategories();
  const totalToolsCount = getDisplayToolsCount();
  const newestTools = getNewestTools(6);
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
        'ابزارهای پایه همیشه رایگان هستند. نسخه حرفه‌ای خروجی بدون واترمارک، قالب‌های حرفه‌ای و خروجی Word ارائه می‌دهد.',
    },
    {
      question: 'آیا برای استفاده باید ثبت‌نام کنم؟',
      answer: 'خیر، همه ابزارهای پایه بدون ثبت‌نام و ورود قابل استفاده هستند.',
    },
    {
      question: 'آیا ابزارها روی موبایل کار می‌کنند؟',
      answer: 'بله، رابط کاربری واکنش‌گراست و روی موبایل و تبلت به خوبی کار می‌کند.',
    },
    {
      question: 'آیا می‌توانم نتیجه را ذخیره کنم؟',
      answer: 'بله، تاریخچه استفاده در مرورگر شما ذخیره می‌شود و قابل بازیابی است.',
    },
  ];

  const homeJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        name: 'جعبه ابزار فارسی — مجموعه ابزارهای آنلاین رایگان',
        description:
          'بیش از ۸۰ ابزار آنلاین رایگان فارسی شامل: محاسبه وام و حقوق، تبدیل تاریخ شمسی به میلادی، فشرده‌سازی و تبدیل PDF، OCR فارسی، ساخت فاکتور و رسید، رزومه‌ساز، ویرایشگر متن فارسی، اعتبارسنجی کد ملی و شماره کارت بانکی. تمام پردازش‌ها در مرورگر انجام می‌شود.',
        url: siteUrl,
        inLanguage: 'fa-IR',
        about: {
          '@type': 'Thing',
          name: 'ابزارهای آنلاین فارسی',
        },
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
            جعبه ابزار فارسی — بیش از {toPersianNumbers(totalToolsCount)} ابزار آنلاین رایگان
          </h1>
          <p className="mx-auto max-w-3xl text-base leading-8 text-[var(--text-secondary)] md:text-lg">
            محاسبه وام و حقوق، تبدیل تاریخ شمسی، فشرده‌سازی PDF، OCR فارسی، ساخت فاکتور و رزومه —
            تمام پردازش‌ها در مرورگر شما انجام می‌شود و داده‌هایتان ارسال نمی‌شود.
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
              <div className="text-2xl" aria-hidden="true">
                {cat.icon}
              </div>
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

      {/* How it Works */}
      <section
        className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-6 md:p-8 space-y-6"
        aria-labelledby="howit-heading"
      >
        <div className="text-center">
          <h2 id="howit-heading" className="text-2xl font-black text-[var(--text-primary)]">
            چطور کار می‌کند؟
          </h2>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            در ۳ مرحله ساده ابزار مورد نظر خود را استفاده کنید
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              step: '۱',
              title: 'ابزار را انتخاب کنید',
              desc: 'از دسته‌بندی‌ها یا جستجو، ابزار مورد نظر خود را پیدا کنید.',
              color: 'var(--color-primary)',
            },
            {
              step: '۲',
              title: 'اطلاعات را وارد کنید',
              desc: 'فایل، متن یا مقادیر مورد نیاز را در فرم وارد کنید.',
              color: 'var(--color-success)',
            },
            {
              step: '۳',
              title: 'نتیجه را دریافت کنید',
              desc: 'خروجی را دانلود یا کپی کنید. همه چیز در مرورگر انجام شد.',
              color: 'var(--color-warning)',
            },
          ].map((item) => (
            <div key={item.step} className="flex items-start gap-4">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-black text-white"
                style={{ backgroundColor: item.color }}
              >
                {item.step}
              </div>
              <div>
                <div className="text-sm font-bold text-[var(--text-primary)]">{item.title}</div>
                <div className="mt-1 text-xs text-[var(--text-muted)] leading-5">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Newest Tools */}
      <section className="space-y-6" aria-labelledby="newest-heading">
        <div className="flex flex-col gap-2 text-center">
          <h2 id="newest-heading" className="text-2xl font-black text-[var(--text-primary)]">
            ابزارهای جدید
          </h2>
          <p className="text-sm text-[var(--text-muted)]">
            جدیدترین ابزارهای اضافه‌شده به جعبه ابزار فارسی
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {newestTools.map((tool) => (
            <Link
              key={tool.path}
              href={tool.path}
              className="group flex items-center gap-4 rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-4 transition-all duration-200 hover:border-[var(--color-primary)] hover:shadow-[var(--shadow-medium)]"
            >
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[rgb(var(--color-primary-rgb)/0.08)] text-xl"
                aria-hidden="true"
              >
                {tool.category?.id === 'pdf-tools'
                  ? '📄'
                  : tool.category?.id === 'image-tools'
                    ? '🖼️'
                    : tool.category?.id === 'finance-tools'
                      ? '💰'
                      : tool.category?.id === 'date-tools'
                        ? '📅'
                        : tool.category?.id === 'text-tools'
                          ? '✏️'
                          : tool.category?.id === 'validation-tools'
                            ? '🔐'
                            : '🔧'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--color-primary)] transition-colors">
                  {tool.title.split(' - ')[0]}
                </div>
                <div className="mt-0.5 text-xs text-[var(--text-muted)] line-clamp-1">
                  {tool.description}
                </div>
              </div>
              <span className="text-[var(--color-primary)] shrink-0" aria-hidden="true">
                ←
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Professional Tools - subtle section */}
      <section
        className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-6"
        aria-labelledby="flagship-heading"
      >
        <div className="flex flex-col gap-2 text-center mb-4">
          <h2 id="flagship-heading" className="text-lg font-bold text-[var(--text-primary)]">
            ابزارهای حرفه‌ای (اختیاری)
          </h2>
          <p className="text-xs text-[var(--text-muted)]">
            ابزارهای پایه همیشه رایگان هستند. این ابزارها برای خروجی حرفه‌ای بدون واترمارک هستند.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {flagshipProducts.map((product) => (
            <Link
              key={product.href}
              href={product.href}
              className="group flex items-center gap-3 rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-2)] p-3 transition-all duration-200 hover:border-[var(--color-primary)]"
            >
              <span className="text-xl" aria-hidden="true">
                {product.icon}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--color-primary)] transition-colors">
                  {product.title}
                </div>
                <div className="text-xs text-[var(--text-muted)] line-clamp-1">
                  {product.description}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Trust Section */}
      <section className="space-y-6" aria-labelledby="trust-heading">
        <div className="flex flex-col gap-2 text-center">
          <h2 id="trust-heading" className="text-3xl font-black text-[var(--text-primary)]">
            چرا بیش از هزاران کاربر به ما اعتماد دارند؟
          </h2>
          <p className="text-sm text-[var(--text-muted)]">
            پردازش کاملاً محلی — بدون ثبت‌نام — بدون ارسال داده
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: '🔒',
              title: 'پردازش ۱۰۰٪ محلی',
              desc: 'تمام پردازش‌ها در مرورگر شما انجام می‌شود. فایل‌های شما هرگز سرور را ترک نمی‌کنند.',
            },
            {
              icon: '🛡️',
              title: '۰ داده ارسال شده',
              desc: 'هیچ فایل، متن یا اطلاعاتی به سرور ارسال نمی‌شود. حریم خصوصی شما حفظ می‌شود.',
            },
            {
              icon: '⚡',
              title: 'بدون نیاز به ثبت‌نام',
              desc: 'فوراً شروع کنید. بدون ایمیل، بدون رمز عبور، بدون پیچیدگی.',
            },
            {
              icon: '🇮🇷',
              title: 'فارسی و راست‌چین',
              desc: 'رابط کاربری کاملاً فارسی با پشتیبانی کامل RTL و اعداد فارسی.',
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-5 text-center"
            >
              <div className="text-3xl" aria-hidden="true">
                {item.icon}
              </div>
              <div className="mt-3 text-sm font-bold text-[var(--text-primary)]">{item.title}</div>
              <div className="mt-2 text-xs text-[var(--text-muted)] leading-5">{item.desc}</div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center gap-6 text-xs text-[var(--text-muted)]">
          <span className="flex items-center gap-1">
            <span className="text-[var(--color-success)]">✓</span>
            دارای نماد اعتماد الکترونیکی
          </span>
          <span className="flex items-center gap-1">
            <span className="text-[var(--color-success)]">✓</span>
            {toPersianNumbers(915)}+ تست گذرنده
          </span>
          <span className="flex items-center gap-1">
            <span className="text-[var(--color-success)]">✓</span>
            متن‌باز در GitHub
          </span>
        </div>
      </section>

      {/* Blog Preview */}
      <BlogPreviewSection />

      {/* FAQ */}
      <FAQSection items={homeFaq} />
    </div>
  );
}
