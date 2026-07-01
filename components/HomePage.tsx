import Script from 'next/script';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import ButtonLink from '@/shared/ui/ButtonLink';
import FAQSection from '@/shared/ui/FAQSection';
import NewsletterSignup from '@/components/home/NewsletterSignup';
import { siteUrl } from '@/lib/seo';
import {
  getCategories,
  getCategoryDisplayEntries,
  getToolCountForDisplay,
} from '@/lib/tools-registry';
import { getCspNonce } from '@/lib/csp';
import CategoryCard from '@/components/home/CategoryCard';
import BlogPreviewSection from '@/components/home/BlogPreviewSection';
import SocialProofStats from '@/components/home/SocialProofStats';
import SiteAdBanner from '@/components/ui/SiteAdBanner';
import { isFeatureEnabled } from '@/lib/features/availability';
import { toPersianNumbers } from '@/shared/utils/localization/persian';
import {
  IconLock,
  IconShield,
  IconZap,
  IconGlobe,
  IconCheck,
  IconPdf,
  IconCode,
  IconCalculator,
} from '@/shared/ui/icons';
import HeroQuickLinks from '@/components/home/HeroQuickLinks';
import { getPack3HeroCtaLabel, getHomePack3FaqAnswer } from '@/lib/pricing/pricingSnippets';

const LazyToolSearch = dynamic(() => import('@/components/home/ToolSearch'), {
  loading: () => (
    <div className="mx-auto h-12 max-w-xl animate-pulse rounded-full bg-[var(--surface-1)]" />
  ),
});

const LazyTestimonials = dynamic(() => import('@/components/home/TestimonialsSection'), {
  loading: () => (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-32 animate-pulse rounded-[var(--radius-lg)] bg-[var(--surface-1)]"
        />
      ))}
    </div>
  ),
});

const LazyPopularTools = dynamic(() => import('@/components/home/PopularToolsSection'), {
  loading: () => (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="h-20 animate-pulse rounded-[var(--radius-lg)] bg-[var(--surface-1)]"
        />
      ))}
    </div>
  ),
});

const LazyNewTools = dynamic(() => import('@/components/home/NewToolsSection'), {
  loading: () => (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-20 animate-pulse rounded-[var(--radius-lg)] bg-[var(--surface-1)]"
        />
      ))}
    </div>
  ),
});

export default async function HomePage() {
  const categories = getCategories();
  const totalToolsCount = getToolCountForDisplay();
  const nonce = await getCspNonce();
  const [pack3HeroCta, pack3FaqAnswer] = await Promise.all([
    getPack3HeroCtaLabel(),
    getHomePack3FaqAnswer(),
  ]);

  const flagshipProducts = [
    {
      title: 'فاکتورساز و رسیدساز',
      description: 'ساخت فاکتور و رسید حرفه‌ای با قالب‌های آماده، بدون نیاز به نرم‌افزار جانبی.',
      href: '/business-tools/document-studio?type=invoice',
      cta: 'ساخت فاکتور',
      icon: IconPdf,
    },
    {
      title: 'رزومه‌ساز حرفه‌ای',
      description: 'رزومه فارسی و انگلیسی با قالب‌های حرفه‌ای، خروجی HTML آماده ارسال.',
      href: '/career-tools/resume-builder?type=persian-resume',
      cta: 'ساخت رزومه',
      icon: IconCode,
    },
    {
      title: 'ویرایشگر فارسی',
      description: 'پاک‌سازی نگارشی، اصلاح حروف عربی، حذف فاصله‌های اضافی و آمار متن.',
      href: '/writing-tools/persian-writing-studio',
      cta: 'ویرایش متن',
      icon: IconCalculator,
    },
  ];

  const categoryIds = [
    'pdf-tools',
    'image-tools',
    'finance-tools',
    'date-tools',
    'text-tools',
    'validation-tools',
    'contract-tools',
    'business-tools',
    'career-tools',
    'writing-tools',
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
    {
      question: 'چطور خروجی حرفه‌ای بدون واترمارک بگیرم؟',
      answer: pack3FaqAnswer,
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
            urlTemplate: `${siteUrl}/search?q={search_term_string}`,
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
            <LazyToolSearch />
          </div>

          <HeroQuickLinks />

          <div className="flex flex-wrap justify-center gap-3">
            <ButtonLink href="/topics" size="lg" className="px-8">
              {toPersianNumbers(totalToolsCount)}+ ابزار رایگان را ببینید ←
            </ButtonLink>
            <ButtonLink href="/pricing" variant="secondary" size="lg" className="px-8">
              {pack3HeroCta}
            </ButtonLink>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-[var(--text-muted)]">
            <span
              className="inline-flex items-center gap-1.5 rounded-full border border-[rgb(var(--color-success-rgb)/0.3)] bg-[rgb(var(--color-success-rgb)/0.1)] px-3 py-1 text-[var(--color-success)] font-semibold"
              title="دارای نماد اعتماد الکترونیکی"
            >
              <IconShield className="h-3.5 w-3.5" aria-hidden="true" />
              دارای نماد اعتماد الکترونیکی
            </span>
            <span className="inline-flex items-center gap-1.5">
              <IconCheck className="h-3.5 w-3.5 text-[var(--color-success)]" aria-hidden="true" />
              پردازش محلی — داده‌های شما ارسال نمی‌شوند
            </span>
            <span className="inline-flex items-center gap-1.5">
              <IconCheck className="h-3.5 w-3.5 text-[var(--color-success)]" aria-hidden="true" />
              {toPersianNumbers(1199)}+ تست
            </span>
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

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categoryIds.map((id) => (
            <CategoryCard key={id} categoryId={id} />
          ))}
        </div>
      </section>

      {/* Popular Tools */}
      <LazyPopularTools />

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
      <LazyNewTools />

      {/* Professional Tools - subtle section */}
      <section
        className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-6"
        aria-labelledby="flagship-heading"
      >
        <div className="flex flex-col gap-2 text-center mb-4">
          <h2 id="flagship-heading" className="text-lg font-bold text-[var(--text-primary)]">
            محصولات حرفه‌ای
          </h2>
          <p className="text-xs text-[var(--text-muted)]">
            ابزارهای پایه همیشه رایگان هستند. این ابزارها برای خروجی حرفه‌ای بدون واترمارک هستند.
          </p>
        </div>
        <div className="mb-4 flex justify-center">
          <ButtonLink href="/pricing" variant="secondary" size="sm">
            مشاهده قیمت خروجی حرفه‌ای
          </ButtonLink>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {flagshipProducts.map((product) => (
            <Link
              key={product.href}
              href={product.href}
              className="group flex items-center gap-3 rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-2)] p-3 transition-all duration-200 hover:border-[var(--color-primary)]"
            >
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[rgb(var(--color-primary-rgb)/0.12)] text-[var(--color-primary)]"
                aria-hidden="true"
              >
                <product.icon className="h-5 w-5" />
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

      <SocialProofStats />

      {/* Trust Section */}
      <section className="space-y-6" aria-labelledby="trust-heading">
        <div className="flex flex-col gap-2 text-center">
          <h2 id="trust-heading" className="text-3xl font-black text-[var(--text-primary)]">
            چرا کاربران به ما اعتماد دارند؟
          </h2>
          <p className="text-sm text-[var(--text-muted)]">
            پردازش کاملاً محلی — بدون ثبت‌نام — بدون ارسال داده
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: IconLock,
              title: 'پردازش ۱۰۰٪ محلی',
              desc: 'فایل‌ها و داده‌ها از دستگاه شما خارج نمی‌شوند؛ پردازش کاملاً در مرورگر انجام می‌شود.',
            },
            {
              icon: IconShield,
              title: '۰ داده ارسال شده',
              desc: 'هیچ فایل، متن یا اطلاعاتی به سرور ارسال نمی‌شود. حریم خصوصی شما حفظ می‌شود.',
            },
            {
              icon: IconZap,
              title: 'بدون نیاز به ثبت‌نام',
              desc: 'فوراً شروع کنید. بدون ایمیل، بدون رمز عبور، بدون پیچیدگی.',
            },
            {
              icon: IconGlobe,
              title: 'فارسی و راست‌چین',
              desc: 'رابط کاربری کاملاً فارسی با پشتیبانی کامل RTL و اعداد فارسی.',
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-5 text-center"
            >
              <div className="mx-auto h-8 w-8 text-[var(--color-primary)]">
                <item.icon className="h-8 w-8" />
              </div>
              <div className="mt-3 text-sm font-bold text-[var(--text-primary)]">{item.title}</div>
              <div className="mt-2 text-xs text-[var(--text-muted)] leading-5">{item.desc}</div>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-[var(--text-muted)]">
          <span className="flex items-center gap-1">
            <IconCheck className="h-3.5 w-3.5 text-[var(--color-success)]" />
            دارای نماد اعتماد الکترونیکی
          </span>
          <span className="flex items-center gap-1">
            <IconCheck className="h-3.5 w-3.5 text-[var(--color-success)]" />
            {toPersianNumbers(1199)}+ تست گذرنده
          </span>
          <span className="flex items-center gap-1">
            <IconCheck className="h-3.5 w-3.5 text-[var(--color-success)]" />
            {toPersianNumbers(totalToolsCount)}+ ابزار رایگان
          </span>
          <span className="flex items-center gap-1">
            <IconCheck className="h-3.5 w-3.5 text-[var(--color-success)]" />
            متن‌باز در GitHub
          </span>
        </div>
      </section>

      {/* Testimonials */}
      <LazyTestimonials />

      {/* Blog Preview */}
      <BlogPreviewSection />

      {/* Newsletter */}
      <NewsletterSignup />

      {/* FAQ */}
      <FAQSection items={homeFaq} />
    </div>
  );
}
