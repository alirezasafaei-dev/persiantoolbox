import Script from 'next/script';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import ButtonLink from '@/shared/ui/ButtonLink';
import FAQSection from '@/shared/ui/FAQSection';
import NewsletterSignup from '@/components/home/NewsletterSignup';
import HomeHero from '@/components/home/HomeHero';
import { siteUrl } from '@/lib/seo';
import {
  FREE_TOOLS_DISPLAY_LABEL,
  getCategories,
  getCategoryDisplayEntries,
  getToolCountForDisplay,
} from '@/lib/tools-registry';
import { getCspNonce } from '@/lib/csp';
import CategoryGrid from '@/components/home/CategoryGrid';
import BlogPreviewSection from '@/components/home/BlogPreviewSection';
import SocialProofStats from '@/components/home/SocialProofStats';
import SiteAdBanner from '@/components/ui/SiteAdBanner';
import { isFeatureEnabled } from '@/lib/features/availability';
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
import {
  getHomeFlagshipProducts,
  getHomeHowItWorksSteps,
  getHomeSectionCopy,
  getHomeTrustCards,
  getHomeUseCases,
} from '@/lib/home-copy';
import { getPack3HeroCtaLabel, getHomePack3FaqAnswer } from '@/lib/pricing/pricingSnippets';

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

const flagshipIcons = [IconPdf, IconCode, IconCalculator] as const;

export default async function HomePage() {
  const categories = getCategories();
  const totalToolsCount = getToolCountForDisplay();
  const sections = getHomeSectionCopy();
  const trustCards = getHomeTrustCards();
  const howItWorksSteps = getHomeHowItWorksSteps();
  const flagshipProducts = getHomeFlagshipProducts();
  const useCases = getHomeUseCases();
  const nonce = await getCspNonce();
  const [pack3HeroCta, pack3FaqAnswer] = await Promise.all([
    getPack3HeroCtaLabel(),
    getHomePack3FaqAnswer(),
  ]);

  const homeFaq = [
    {
      question: 'آیا داده‌ها به سرور ارسال می‌شوند؟',
      answer:
        'خیر. محاسبات، ویرایش فایل و تولید سند در مرورگر شما انجام می‌شود و فایل‌ها یا متن‌های حساس ارسال نمی‌شوند.',
    },
    {
      question: 'آیا خروجی‌ها رسمی یا تضمینی هستند؟',
      answer:
        'خروجی‌ها برای استفاده روزمره و اداری مناسب‌اند، اما جایگزین مشاوره حقوقی، مالیاتی یا منابع رسمی نیستند.',
    },
    {
      question: 'تفاوت نسخه رایگان و حرفه‌ای چیست؟',
      answer:
        'ابزارهای پایه همیشه رایگان‌اند. نسخه حرفه‌ای خروجی بدون واترمارک، قالب‌های حرفه‌ای و خروجی Word ارائه می‌دهد.',
    },
    {
      question: 'آیا برای استفاده باید ثبت‌نام کنم؟',
      answer:
        'خیر. می‌توانید بلافاصله از ابزارها استفاده کنید؛ ثبت‌نام فقط برای ذخیره تاریخچه و مزایای حساب است.',
    },
    {
      question: 'آیا ابزارها روی موبایل کار می‌کنند؟',
      answer: 'بله. رابط واکنش‌گراست و بیشتر ابزارها روی موبایل و تبلت به‌خوبی کار می‌کنند.',
    },
    {
      question: 'چطور ابزار مناسب خودم را پیدا کنم؟',
      answer:
        'از جستجوی بالای صفحه، دسته‌بندی‌ها یا صفحه «همه ابزارها» استفاده کنید. لینک‌های «شروع سریع» هم پرکاربردترین مسیرها را نشان می‌دهند.',
    },
    {
      question: 'چطور خروجی حرفه‌ای بدون واترمارک بگیرم؟',
      answer: pack3FaqAnswer,
    },
  ];

  const collectionPageDescription =
    `بیش از ${totalToolsCount} ابزار آنلاین رایگان فارسی برای کار روزمره: محاسبه وام و حقوق، ` +
    'تبدیل تاریخ، PDF و تصویر، قرارداد، فاکتور، رزومه و ویرایش متن. ' +
    'تمام پردازش‌ها در مرورگر انجام می‌شود.';

  const homeJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        name: 'جعبه ابزار فارسی — مجموعه ابزارهای آنلاین رایگان',
        description: collectionPageDescription,
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

  const trustIcons = [IconLock, IconShield, IconZap, IconGlobe] as const;
  const useCaseIcons = [IconCalculator, IconCode, IconPdf, IconGlobe] as const;

  return (
    <div className="space-y-14">
      <Script
        id="home-json-ld"
        type="application/ld+json"
        strategy="afterInteractive"
        nonce={nonce ?? undefined}
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd) }}
      />

      <HomeHero toolCount={totalToolsCount} pack3HeroCta={pack3HeroCta} />

      <section className="space-y-6" aria-labelledby="use-cases-heading">
        <div className="flex flex-col gap-2 text-center">
          <h2 id="use-cases-heading" className="text-3xl font-black text-[var(--text-primary)]">
            {sections.useCases.title}
          </h2>
          <p className="text-sm text-[var(--text-muted)]">{sections.useCases.subtitle}</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {useCases.map((item, index) => {
            const Icon = useCaseIcons[index] ?? IconCalculator;
            return (
              <article
                key={item.title}
                className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-5"
              >
                <div className="flex items-start gap-4">
                  <span
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[rgb(var(--color-primary-rgb)/0.1)] text-[var(--color-primary)]"
                    aria-hidden="true"
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-black text-[var(--text-primary)]">
                      <Link href={item.href} className="hover:text-[var(--color-primary)]">
                        {item.title}
                      </Link>
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
                      {item.description}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    href={item.primaryHref}
                    className="inline-flex items-center rounded-full bg-[var(--color-primary)] px-3 py-1.5 text-xs font-bold text-white transition-opacity hover:opacity-90"
                  >
                    {item.primaryLabel} ←
                  </Link>
                  {item.links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="inline-flex items-center rounded-full border border-[var(--border-light)] bg-[var(--surface-2)] px-3 py-1.5 text-xs font-semibold text-[var(--text-secondary)] transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <CategoryGrid />

      {isFeatureEnabled('ads') && <SiteAdBanner placement="homepage-categories" />}

      <LazyPopularTools />

      <section
        className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-6 md:p-8 space-y-6"
        aria-labelledby="howit-heading"
      >
        <div className="text-center">
          <h2 id="howit-heading" className="text-2xl font-black text-[var(--text-primary)]">
            {sections.howItWorks.title}
          </h2>
          <p className="mt-2 text-sm text-[var(--text-muted)]">{sections.howItWorks.subtitle}</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {howItWorksSteps.map((item, index) => {
            const colors = ['var(--color-primary)', 'var(--color-success)', 'var(--color-warning)'];
            return (
              <div key={item.step} className="flex items-start gap-4">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-black text-white"
                  style={{ backgroundColor: colors[index] }}
                >
                  {item.step}
                </div>
                <div>
                  <div className="text-sm font-bold text-[var(--text-primary)]">{item.title}</div>
                  <div className="mt-1 text-xs text-[var(--text-muted)] leading-5">{item.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <LazyNewTools />

      <section
        className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-6 md:p-8"
        aria-labelledby="flagship-heading"
      >
        <div className="mb-5 flex flex-col gap-2 text-center">
          <h2 id="flagship-heading" className="text-2xl font-black text-[var(--text-primary)]">
            {sections.flagship.title}
          </h2>
          <p className="mx-auto max-w-2xl text-sm leading-6 text-[var(--text-muted)]">
            {sections.flagship.subtitle}
          </p>
        </div>
        <div className="mb-5 flex justify-center">
          <ButtonLink href="/pricing" variant="secondary" size="sm">
            {sections.flagship.cta}
          </ButtonLink>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {flagshipProducts.map((product, index) => {
            const Icon = flagshipIcons[index] ?? IconPdf;
            return (
              <Link
                key={product.href}
                href={product.href}
                className="group flex flex-col gap-3 rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-2)] p-4 transition-all duration-200 hover:border-[var(--color-primary)]"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[rgb(var(--color-primary-rgb)/0.12)] text-[var(--color-primary)]"
                    aria-hidden="true"
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--color-primary)] transition-colors">
                      {product.title}
                    </div>
                  </div>
                </div>
                <p className="text-xs leading-5 text-[var(--text-muted)]">{product.description}</p>
                <span className="text-xs font-semibold text-[var(--color-primary)]">
                  {product.cta} ←
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <SocialProofStats />

      <section className="space-y-6" aria-labelledby="trust-heading">
        <div className="flex flex-col gap-2 text-center">
          <h2 id="trust-heading" className="text-3xl font-black text-[var(--text-primary)]">
            {sections.trust.title}
          </h2>
          <p className="text-sm text-[var(--text-muted)]">{sections.trust.subtitle}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {trustCards.map((item, index) => {
            const Icon = trustIcons[index] ?? IconLock;
            return (
              <div
                key={item.title}
                className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-5 text-center"
              >
                <div className="mx-auto h-8 w-8 text-[var(--color-primary)]">
                  <Icon className="h-8 w-8" />
                </div>
                <div className="mt-3 text-sm font-bold text-[var(--text-primary)]">
                  {item.title}
                </div>
                <div className="mt-2 text-xs text-[var(--text-muted)] leading-5">{item.desc}</div>
              </div>
            );
          })}
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-[var(--text-muted)]">
          <span className="flex items-center gap-1">
            <IconCheck className="h-3.5 w-3.5 text-[var(--color-success)]" />
            دارای نماد اعتماد الکترونیکی
          </span>
          <span className="flex items-center gap-1">
            <IconCheck className="h-3.5 w-3.5 text-[var(--color-success)]" />
            {FREE_TOOLS_DISPLAY_LABEL}
          </span>
          <span className="flex items-center gap-1">
            <IconCheck className="h-3.5 w-3.5 text-[var(--color-success)]" />
            متن‌باز در GitHub
          </span>
        </div>
      </section>

      <LazyTestimonials />
      <BlogPreviewSection />
      <NewsletterSignup />
      <FAQSection items={homeFaq} />
    </div>
  );
}
