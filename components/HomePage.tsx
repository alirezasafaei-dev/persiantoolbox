import type { ComponentType } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import ButtonLink from '@/shared/ui/ButtonLink';
import HomeHero from '@/components/home/HomeHero';
import RolePathLink from '@/components/home/RolePathLink';
import { siteUrl } from '@/lib/seo';
import {
  FREE_TOOLS_DISPLAY_LABEL,
  getCategories,
  getCategoryDisplayEntries,
  getToolCountForDisplay,
} from '@/lib/tools-registry';
import { getCspNonce } from '@/lib/csp';
import {
  IconLock,
  IconShield,
  IconZap,
  IconGlobe,
  IconCheck,
  IconPdf,
  IconCode,
  IconCalculator,
  IconMoney,
  IconCalendar,
} from '@/shared/ui/icons';
import {
  getHomeAudienceTracks,
  getHomeFlagshipProducts,
  getHomeHowItWorksSteps,
  getHomeSearchIntents,
  getHomeSectionCopy,
  getHomeTrustCards,
  getHomeUseCases,
  getHomeValueProofs,
} from '@/lib/home-copy';
import { getHomePack3FaqAnswer } from '@/lib/pricing/pricingSnippets';

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

const LazyCategoryGrid = dynamic(() => import('@/components/home/CategoryGrid'), {
  loading: () => (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((j) => (
            <div
              key={j}
              className="h-48 animate-pulse rounded-[var(--radius-lg)] bg-[var(--surface-1)]"
            />
          ))}
        </div>
      ))}
    </div>
  ),
});

const LazyBlogPreview = dynamic(() => import('@/components/home/BlogPreviewSection'), {
  loading: () => (
    <div className="h-64 animate-pulse rounded-[var(--radius-lg)] bg-[var(--surface-1)]" />
  ),
});

const LazyNewsletter = dynamic(() => import('@/components/home/NewsletterSignup'), {
  loading: () => (
    <div className="h-24 animate-pulse rounded-[var(--radius-lg)] bg-[var(--surface-1)]" />
  ),
});

const LazyFAQ = dynamic(
  () => import('@/shared/ui/FAQSection').then((m) => ({ default: m.default })),
  {
    loading: () => (
      <div className="h-48 animate-pulse rounded-[var(--radius-lg)] bg-[var(--surface-1)]" />
    ),
  },
);

const LazySocialProof = dynamic(() => import('@/components/home/SocialProofStats'), {
  loading: () => (
    <div className="h-32 animate-pulse rounded-[var(--radius-lg)] bg-[var(--surface-1)]" />
  ),
});

const LazyTrustSection = dynamic(
  () =>
    Promise.resolve({
      default: function TrustSection({
        sections,
        trustCards,
        trustIcons,
        IconCheck: IconCheckComponent,
        FREE_TOOLS_DISPLAY_LABEL: toolsLabel,
      }: {
        sections: ReturnType<typeof getHomeSectionCopy>;
        trustCards: ReturnType<typeof getHomeTrustCards>;
        trustIcons: readonly ComponentType<{ className?: string }>[];
        IconCheck: ComponentType<{ className?: string }>;
        FREE_TOOLS_DISPLAY_LABEL: string;
      }) {
        return (
          <section className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-6 md:p-8">
            <div className="flex flex-col gap-2 text-center mb-6">
              <h3 id="trust-heading" className="text-2xl font-black text-[var(--text-primary)]">
                {sections.trust.title}
              </h3>
              <p className="text-sm text-[var(--text-muted)]">{sections.trust.subtitle}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {trustCards.map((item, index) => {
                const Icon = trustIcons[index] ?? IconCheckComponent;
                return (
                  <div
                    key={item.title}
                    className="flex items-start gap-3 rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-2)] p-4"
                  >
                    <span
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--color-primary-rgb)/0.1)] text-[var(--color-primary)]"
                      aria-hidden="true"
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-[var(--text-primary)]">
                        {item.title}
                      </div>
                      <div className="mt-1 text-xs text-[var(--text-muted)] leading-5">
                        {item.desc}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-[var(--text-muted)]">
              <span className="flex items-center gap-1">
                <IconCheckComponent className="h-3.5 w-3.5 text-[var(--color-success)]" />
                دارای نماد اعتماد الکترونیکی
              </span>
              <span className="flex items-center gap-1">
                <IconCheckComponent className="h-3.5 w-3.5 text-[var(--color-success)]" />
                {toolsLabel}
              </span>
              <span className="flex items-center gap-1">
                <IconCheckComponent className="h-3.5 w-3.5 text-[var(--color-success)]" />
                متن‌باز در GitHub
              </span>
            </div>
          </section>
        );
      },
    }),
  {
    loading: () => (
      <div className="h-48 animate-pulse rounded-[var(--radius-lg)] bg-[var(--surface-1)]" />
    ),
  },
);

const flagshipIcons = [IconPdf, IconCode, IconCalculator] as const;

export default async function HomePage() {
  const categories = getCategories();
  const totalToolsCount = getToolCountForDisplay();
  const sections = getHomeSectionCopy();
  const trustCards = getHomeTrustCards();
  const howItWorksSteps = getHomeHowItWorksSteps();
  const flagshipProducts = getHomeFlagshipProducts();
  const useCases = getHomeUseCases();
  const valueProofs = getHomeValueProofs();
  const audienceTracks = getHomeAudienceTracks();
  const searchIntents = getHomeSearchIntents();
  const visibleSearchIntents = searchIntents.slice(0, 8);
  const nonce = await getCspNonce();
  const pack3FaqAnswer = await getHomePack3FaqAnswer();

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
    `${FREE_TOOLS_DISPLAY_LABEL} برای کار روزمره: محاسبه وام و حقوق، ` +
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
        keywords: searchIntents.map((item) => item.label).join('، '),
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
  const audienceIcons = [IconMoney, IconCalculator, IconPdf, IconCalendar] as const;
  const valueProofIcons = [IconZap, IconShield, IconCheck] as const;
  const valueProofAccentClasses = [
    'bg-[rgb(var(--color-success-rgb)/0.1)] text-[var(--color-success)]',
    'bg-[rgb(var(--color-primary-rgb)/0.1)] text-[var(--color-primary)]',
    'bg-[rgb(var(--color-warning-rgb)/0.14)] text-[var(--color-warning)]',
  ] as const;

  return (
    <div className="space-y-14">
      <Script
        id="home-json-ld"
        type="application/ld+json"
        strategy="afterInteractive"
        nonce={nonce ?? undefined}
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd) }}
      />

      <HomeHero toolCount={totalToolsCount} />

      <section className="grid gap-3 md:grid-cols-3" aria-label="مزیت‌های شروع رایگان">
        {valueProofs.map((item, index) => {
          const Icon = valueProofIcons[index] ?? IconCheck;
          const accentClass = valueProofAccentClasses[index] ?? valueProofAccentClasses[0];

          return (
            <article
              key={item.title}
              className="flex h-full gap-4 rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-5"
            >
              <span
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-sm)] ${accentClass}`}
                aria-hidden="true"
              >
                <Icon className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <span className="inline-flex rounded-full bg-[var(--surface-2)] px-2.5 py-1 text-[11px] font-bold text-[var(--text-muted)]">
                  {item.badge}
                </span>
                <h3 className="mt-3 text-base font-black text-[var(--text-primary)]">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
                  {item.description}
                </p>
              </div>
            </article>
          );
        })}
      </section>

      <section className="space-y-6" aria-labelledby="task-heading">
        <div className="flex flex-col gap-2 text-center">
          <h2 id="task-heading" className="text-3xl font-black text-[var(--text-primary)]">
            چه کاری می‌خواهید انجام دهید؟
          </h2>
          <p className="text-sm text-[var(--text-muted)]">
            نیازتان را انتخاب کنید و مستقیم وارد ابزار مناسب شوید
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              label: 'می‌خواهم فایل PDF را کم‌حجم کنم',
              href: '/pdf-tools/compress/compress-pdf',
              icon: '📄',
            },
            { label: 'می‌خواهم حقوقم را حساب کنم', href: '/salary', icon: '💰' },
            {
              label: 'می‌خواهم تاریخ را تبدیل کنم',
              href: '/date-tools/shamsi-gregorian',
              icon: '📅',
            },
            {
              label: 'می‌خواهم متن فارسی را اصلاح کنم',
              href: '/writing-tools/persian-writing-studio',
              icon: '✏️',
            },
            {
              label: 'می‌خواهم فاکتور بسازم',
              href: '/business-tools/document-studio?type=invoice',
              icon: '🧾',
            },
            { label: 'می‌خواهم تصویر را ویرایش کنم', href: '/image-tools', icon: '🖼️' },
          ].map((task) => (
            <Link
              key={task.href}
              href={task.href}
              className="group flex items-center gap-4 rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-4 transition-all duration-200 hover:border-[var(--color-primary)]/40 hover:shadow-[var(--shadow-medium)]"
            >
              <span className="text-2xl" aria-hidden="true">
                {task.icon}
              </span>
              <span className="text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--color-primary)] transition-colors">
                {task.label}
              </span>
              <span className="mr-auto text-xs text-[var(--text-muted)] group-hover:text-[var(--color-primary)] transition-colors">
                ←
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-6" aria-labelledby="use-cases-heading">
        <div className="flex flex-col gap-2 text-center">
          <h3 id="use-cases-heading" className="text-3xl font-black text-[var(--text-primary)]">
            {sections.useCases.title}
          </h3>
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
                    className="inline-flex items-center rounded-full bg-[var(--color-primary)] px-3 py-1.5 text-xs font-bold text-[var(--text-inverted)] transition-opacity hover:opacity-90"
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

      <section className="space-y-6" aria-labelledby="audience-tracks-heading">
        <div className="flex flex-col gap-2 text-center">
          <h2
            id="audience-tracks-heading"
            className="text-3xl font-black text-[var(--text-primary)]"
          >
            {sections.audiences.title}
          </h2>
          <p className="mx-auto max-w-2xl text-sm leading-6 text-[var(--text-muted)]">
            {sections.audiences.subtitle}
          </p>
        </div>
        <div className="grid gap-4 lg:grid-cols-4">
          {audienceTracks.map((track, index) => {
            const Icon = audienceIcons[index] ?? IconCalculator;
            return (
              <article
                key={track.title}
                className="flex h-full flex-col rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-5 transition-colors hover:border-[var(--color-primary)]/35"
              >
                <div className="flex items-start justify-between gap-3">
                  <span
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[rgb(var(--color-primary-rgb)/0.1)] text-[var(--color-primary)]"
                    aria-hidden="true"
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="rounded-full bg-[rgb(var(--color-success-rgb)/0.1)] px-3 py-1 text-[11px] font-bold text-[var(--color-success)]">
                    {track.badge}
                  </span>
                </div>
                <h3 className="mt-4 text-base font-black leading-7 text-[var(--text-primary)]">
                  <RolePathLink
                    href={track.href}
                    className="hover:text-[var(--color-primary)]"
                    roleTrack={track.title}
                    roleBadge={track.badge}
                    linkLabel={track.title}
                    linkType="track"
                    position={index + 1}
                  >
                    {track.title}
                  </RolePathLink>
                </h3>
                <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
                  {track.description}
                </p>
                <div className="mt-4 flex flex-col gap-2">
                  {track.links.map((link) => (
                    <RolePathLink
                      key={link.href}
                      href={link.href}
                      className="flex min-h-9 items-center justify-between gap-3 rounded-[var(--radius-sm)] border border-[var(--border-light)] bg-[var(--surface-2)] px-3 py-2 text-xs font-bold text-[var(--text-secondary)] transition-colors hover:border-[var(--color-primary)]/40 hover:text-[var(--color-primary)]"
                      roleTrack={track.title}
                      roleBadge={track.badge}
                      linkLabel={link.label}
                      linkType="tool"
                      position={index + 1}
                    >
                      <span>{link.label}</span>
                      <span aria-hidden="true">←</span>
                    </RolePathLink>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section
        className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-5 md:p-6"
        aria-labelledby="search-intents-heading"
      >
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="max-w-xl">
            <h3
              id="search-intents-heading"
              className="text-xl font-black text-[var(--text-primary)]"
            >
              جستجوهای پرکاربرد ابزار رایگان
            </h3>
            <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
              مسیرهای پرتکرار گوگل و کاربران فارسی را مستقیم باز کنید؛ هر لینک به ابزار یا دسته
              مرتبط می‌رسد.
            </p>
          </div>
          <Link
            href="/topics"
            className="inline-flex w-fit items-center rounded-full border border-[var(--border-light)] bg-[var(--surface-2)] px-4 py-2 text-xs font-bold text-[var(--color-primary)] transition-colors hover:border-[var(--color-primary)]/40"
          >
            همه ابزارهای رایگان ←
          </Link>
        </div>
        <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {visibleSearchIntents.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-2)] p-3 transition-colors hover:border-[var(--color-primary)]/45"
            >
              <span className="text-sm font-black text-[var(--text-primary)] group-hover:text-[var(--color-primary)]">
                {item.label}
              </span>
              <span className="mt-1 block text-xs leading-5 text-[var(--text-muted)]">
                {item.intent}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <LazyCategoryGrid />

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
          <h3 id="flagship-heading" className="text-2xl font-black text-[var(--text-primary)]">
            {sections.flagship.title}
          </h3>
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

      <LazySocialProof />
      <LazyTrustSection
        sections={sections}
        trustCards={trustCards}
        trustIcons={trustIcons}
        IconCheck={IconCheck}
        FREE_TOOLS_DISPLAY_LABEL={FREE_TOOLS_DISPLAY_LABEL}
      />

      <LazyTestimonials />
      <LazyBlogPreview />
      <LazyNewsletter />
      <LazyFAQ items={homeFaq} />
    </div>
  );
}
