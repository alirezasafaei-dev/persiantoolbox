import Script from 'next/script';
import Link from 'next/link';
import ButtonLink from '@/shared/ui/ButtonLink';
import FAQSection from '@/shared/ui/FAQSection';
import { siteUrl } from '@/lib/seo';
import {
  getCategories,
  getCategoryDisplayEntries,
  getDisplayToolsCount,
  getIndexableTools,
} from '@/lib/tools-registry';
import { getAllPostSlugs } from '@/lib/blog';
import { getCspNonce } from '@/lib/csp';
import ToolShowcase from '@/components/home/ToolShowcase';
import TrustStats from '@/components/home/TrustStats';
import ToolSearch from '@/components/home/ToolSearch';
import BlogPreviewSection from '@/components/home/BlogPreviewSection';
import SiteAdBanner from '@/components/ui/SiteAdBanner';
import { isFeatureEnabled } from '@/lib/features/availability';
import { toPersianNumbers } from '@/shared/utils/localization/persian';

export default async function HomePage() {
  const categories = getCategories();
  const totalToolsCount = getDisplayToolsCount();
  const postsCount = getAllPostSlugs().length;
  const nonce = await getCspNonce();
  const allTools = getIndexableTools();
  const newestToolsByCategory = (() => {
    const all = [...allTools]
      .filter((t) => t.kind === 'tool' && t.lastModified)
      .sort((a, b) => (b.lastModified ?? '').localeCompare(a.lastModified ?? ''));
    const picked: typeof all = [];
    const seenCategories = new Set<string>();
    for (const tool of all) {
      const catId = tool.category?.id ?? '';
      if (seenCategories.has(catId)) {
        continue;
      }
      seenCategories.add(catId);
      picked.push(tool);
      if (picked.length >= 6) {
        break;
      }
    }
    if (picked.length < 6) {
      for (const tool of all) {
        if (!picked.includes(tool)) {
          picked.push(tool);
          if (picked.length >= 6) {
            break;
          }
        }
      }
    }
    return picked;
  })();

  const specializedToolPaths = [
    '/pdf-tools/convert/pdf-to-word',
    '/pdf-tools/convert/word-to-pdf',
    '/pdf-tools/compress/compress-pdf',
    '/pdf-tools/merge/merge-pdf',
    '/pdf-tools/security/encrypt-pdf',
    '/pdf-tools/extract/extract-text',
    '/image-tools/image-format-converter',
    '/tools/invoice-generator',
    '/tools/mahr-calculator',
    '/tools/check-penalty',
    '/tools/hiring-cost',
    '/text-tools/address-fa-to-en',
  ];
  const specializedTools = specializedToolPaths
    .map((path) => allTools.find((t) => t.path === path && t.kind === 'tool'))
    .filter((t): t is NonNullable<typeof t> => t !== null && t !== undefined)
    .slice(0, 12);

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
    {
      question: 'محاسبات مالی دقیق هستند؟',
      answer:
        'بله، محاسبات بر اساس قوانین مصوب و فرمول‌های استاندارد انجام می‌شود. خروجی‌ها برای تصمیم‌گیری اولیه مناسب هستند.',
    },
    {
      question: 'آیا ابزارهای PersianToolbox رایگان هستند؟',
      answer: 'بله، تمام ابزارهای پایه رایگان هستند و پردازش کاملاً در مرورگر شما انجام می‌شود.',
    },
    {
      question: 'آیا اطلاعات من ذخیره می‌شود؟',
      answer: 'خیر، محاسبات در مرورگر انجام شده و هیچ اطلاعات شخصی ارسال نمی‌شود.',
    },
    {
      question: 'چطور می‌توانم ابزار مورد نظرم را پیدا کنم؟',
      answer:
        'از صفحه جستجو یا دسته‌بندی‌ها استفاده کنید. همچنین در صفحه اصلی ابزارهای محبوب نمایش داده می‌شوند.',
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

  const categoryIcons: Record<string, string> = {
    'pdf-tools': '📄',
    'image-tools': '🖼️',
    'finance-tools': '💰',
    'date-tools': '📅',
    'text-tools': '✏️',
    'validation-tools': '🔐',
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

          {/* Social Proof Counter */}
          <div className="inline-flex items-center gap-3 rounded-full border border-[rgb(var(--color-success-rgb)/0.3)] bg-[rgb(var(--color-success-rgb)/0.08)] px-5 py-2.5 text-sm text-[var(--color-success)]">
            <span className="h-2 w-2 rounded-full bg-[var(--color-success)] animate-pulse" />
            بیش از {toPersianNumbers(totalToolsCount)} ابزار و {toPersianNumbers(postsCount)} مقاله
            آموزشی
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
            <ButtonLink href="/salary" size="lg" className="px-8">
              شروع با محاسبه حقوق
            </ButtonLink>
            <ButtonLink href="/topics" variant="secondary" size="lg" className="px-8">
              همه ابزارها
            </ButtonLink>
          </div>
        </div>
      </section>

      {isFeatureEnabled('ads') && <SiteAdBanner placement="homepage-hero" />}

      {/* Curated Top Tools */}
      <ToolShowcase mode="popular" />

      {/* Category Cards - Improved Design */}
      <section className="space-y-6" aria-labelledby="categories-heading">
        <div className="flex flex-col gap-2 text-center">
          <h2 id="categories-heading" className="text-3xl font-black text-[var(--text-primary)]">
            دسته‌بندی ابزارها
          </h2>
          <p className="text-sm text-[var(--text-muted)]">
            {toPersianNumbers(totalToolsCount)} ابزار در {toPersianNumbers(categories.length)}{' '}
            دسته‌بندی مختلف
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => {
            const tools = getCategoryDisplayEntries(category.id).slice(0, 3);
            const icon = categoryIcons[category.id] ?? '🔧';
            return (
              <div
                key={category.id}
                className="group rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-5 transition-all duration-200 hover:border-[var(--color-primary)] hover:shadow-[var(--shadow-medium)]"
              >
                <Link href={category.path} className="flex items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[rgb(var(--color-primary-rgb)/0.08)] text-2xl">
                    {icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-base font-bold text-[var(--text-primary)] group-hover:text-[var(--color-primary)] transition-colors">
                      {category.name}
                    </div>
                    <div className="mt-1 text-xs text-[var(--text-muted)]">
                      {toPersianNumbers(getCategoryDisplayEntries(category.id).length)} ابزار
                    </div>
                  </div>
                </Link>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {tools.map((tool) => (
                    <Link
                      key={tool.id}
                      href={tool.path}
                      className="rounded-full bg-[var(--surface-2)] px-2.5 py-1 text-xs font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--color-primary)]/10 hover:text-[var(--color-primary)]"
                    >
                      {tool.title.replace(' - جعبه ابزار فارسی', '')}
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Role-Based Paths */}
      <section className="space-y-6" aria-labelledby="roles-heading">
        <div className="flex flex-col gap-2 text-center">
          <h2 id="roles-heading" className="text-3xl font-black text-[var(--text-primary)]">
            مسیر شما کجاست؟
          </h2>
          <p className="text-sm text-[var(--text-muted)]">
            بر اساس نقش و نیاز خود، سریع‌تر به ابزار مناسب برسید
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: '💼',
              title: 'کارمند و HR',
              desc: 'محاسبه حقوق، بیمه، سنوات، مرخصی و فیش حقوقی',
              href: '/salary',
            },
            {
              icon: '📊',
              title: 'حسابدار و SME',
              desc: 'فاکتور، گزارش مالی، VAT، حاشیه سود و سندساز',
              href: '/tools/invoice-generator',
            },
            {
              icon: '🖼️',
              title: 'تولیدکننده محتوا',
              desc: 'OCR فارسی، حذف پس‌زمینه، تبدیل فرمت تصویر',
              href: '/image-tools/image-background-remover',
            },
            {
              icon: '📝',
              title: 'دانشجو و نویسنده',
              desc: 'شمارش کلمات، تبدیل تاریخ، تقویم و استخراج متن',
              href: '/text-tools/word-counter',
            },
            {
              icon: '🔧',
              title: 'توسعه‌دهنده',
              desc: 'فرمت JSON، هش، Base64، اعتبارسنجی و API',
              href: '/developers',
            },
            {
              icon: '📄',
              title: 'پردازش PDF',
              desc: 'ادغام، تقسیم، فشرده‌سازی، تبدیل و امنیت PDF',
              href: '/pdf-tools',
            },
          ].map((role) => (
            <Link
              key={role.title}
              href={role.href}
              className="group rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-5 transition-all duration-200 hover:border-[var(--color-primary)] hover:shadow-[var(--shadow-medium)]"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[rgb(var(--color-primary-rgb)/0.08)] text-xl">
                  {role.icon}
                </div>
                <div>
                  <div className="text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--color-primary)] transition-colors">
                    {role.title}
                  </div>
                  <div className="mt-1 text-xs text-[var(--text-muted)] leading-5">{role.desc}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Newest Tools */}
      <section className="space-y-6" aria-labelledby="newest-heading">
        <div className="flex flex-col gap-2 text-center">
          <h2 id="newest-heading" className="text-3xl font-black text-[var(--text-primary)]">
            جدیدترین ابزارها
          </h2>
          <p className="text-sm text-[var(--text-muted)]">
            ابزارهایی که اخیراً به مجموعه اضافه شده‌اند
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {newestToolsByCategory.map((tool) => (
            <Link
              key={tool.path}
              href={tool.path}
              className="group rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-4 transition-all duration-200 hover:border-[var(--color-primary)] hover:shadow-[var(--shadow-medium)]"
            >
              <div className="text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--color-primary)] transition-colors">
                {tool.title.split(' - ')[0]}
              </div>
              <div className="mt-1 text-xs text-[var(--text-muted)] line-clamp-2">
                {tool.description}
              </div>
              <div className="mt-2 text-xs text-[var(--color-primary)] font-semibold">
                {tool.category?.name ?? ''}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Specialized Tools */}
      {specializedTools.length > 0 && (
        <section className="space-y-6" aria-labelledby="specialized-heading">
          <div className="flex flex-col gap-2 text-center">
            <h2 id="specialized-heading" className="text-3xl font-black text-[var(--text-primary)]">
              ابزارهای تخصصی
            </h2>
            <p className="text-sm text-[var(--text-muted)]">
              ابزارهای حرفه‌ای مالی، حقوقی و ساخت سند
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {specializedTools.map((tool) => (
              <Link
                key={tool.path}
                href={tool.path}
                className="group rounded-[var(--radius-lg)] border border-[var(--color-primary)]/20 bg-[var(--surface-1)] p-4 transition-all duration-200 hover:border-[var(--color-primary)] hover:shadow-[var(--shadow-medium)]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-primary)]/10 text-base">
                    ✨
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--color-primary)] transition-colors line-clamp-1">
                      {tool.title.split(' - ')[0]}
                    </div>
                    <div className="text-xs text-[var(--text-muted)] line-clamp-1">
                      {tool.description}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center">
            <Link
              href="/tools/specialized"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-hover)]"
            >
              مشاهده همه ابزارهای تخصصی
              <span aria-hidden="true">←</span>
            </Link>
          </div>
        </section>
      )}

      {/* Trust & Stats */}
      <TrustStats toolsCount={totalToolsCount} />

      {/* Trust Proof */}
      <section className="space-y-6" aria-labelledby="trust-heading">
        <div className="flex flex-col gap-2 text-center">
          <h2 id="trust-heading" className="text-3xl font-black text-[var(--text-primary)]">
            چرا به این سایت اعتماد کنم؟
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              icon: '🔒',
              title: 'پردازش ۱۰۰٪ محلی',
              desc: 'فایل‌ها و داده‌های شما هرگز از مرورگر خارج نمی‌شوند. تمام پردازش‌ها روی دستگاه شما انجام می‌شود.',
            },
            {
              icon: '🛡️',
              title: 'بدون ثبت‌نام اجباری',
              desc: 'بدون نیاز به ایجاد حساب کاربری از تمام ابزارها استفاده کنید. حریم خصوصی شما حفظ می‌شود.',
            },
            {
              icon: '✅',
              title: 'شفافیت کامل',
              desc: 'صفحه شفافیت فنی، سیاست حریم خصوصی و نماد اعتماد الکترونیکی. همه چیز قابل بررسی است.',
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

      {/* Find the right tool */}
      <section className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-6 text-center">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">
          ابزار مناسب خودتان را پیدا کنید
        </h2>
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

      {/* Blog Preview */}
      <BlogPreviewSection />

      {/* FAQ */}
      <FAQSection items={homeFaq} />
    </div>
  );
}
