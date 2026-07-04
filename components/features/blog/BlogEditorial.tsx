import Link from 'next/link';
import Image from 'next/image';
import {
  getCategoryRoute,
  getEditorialPosts,
  normalizeCategoryLabel,
  normalizeSeriesLabel,
  type BlogPostMeta,
} from '@/lib/blog';

function FeaturedPost({ post }: { post: BlogPostMeta }) {
  const formattedDate = new Date(post.date).toLocaleDateString('fa-IR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const readingTime = Math.max(1, Math.ceil(post.wordCount / 200));

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group relative overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border-light)] bg-[var(--surface-1)] shadow-[var(--shadow-subtle)] transition-all duration-300 hover:shadow-[var(--shadow-strong)] hover:border-[var(--border-medium)]"
    >
      {post.coverImage ? (
        <div className="relative aspect-[1200/630] w-full overflow-hidden">
          <Image
            src={post.coverImage}
            alt={post.coverAlt || post.title}
            fill
            sizes="(max-width: 768px) 100vw, 800px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        </div>
      ) : (
        <div className="aspect-[1200/630] w-full bg-gradient-to-br from-[var(--color-primary)]/20 via-[var(--color-primary)]/10 to-transparent flex flex-col items-center justify-center gap-3 p-6">
          <span className="text-6xl opacity-40">📚</span>
          <span className="text-sm font-bold text-[var(--text-secondary)] opacity-50 line-clamp-2 max-w-md text-center">
            {post.title}
          </span>
        </div>
      )}
      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
        <div className="flex items-center gap-2 mb-2">
          <span className="rounded-full bg-[var(--color-primary)] px-2.5 py-0.5 text-xs font-bold">
            {normalizeCategoryLabel(post.category)}
          </span>
          <span className="text-xs opacity-80">{formattedDate}</span>
          <span className="text-xs opacity-60">· {readingTime} دقیقه مطالعه</span>
        </div>
        <h2 className="text-xl font-bold leading-tight group-hover:text-white/90">{post.title}</h2>
        <p className="mt-2 text-sm opacity-80 line-clamp-2">{post.description}</p>
        {post.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {post.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] text-white/90"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}

function PostCard({ post, index }: { post: BlogPostMeta; index: number }) {
  const formattedDate = new Date(post.date).toLocaleDateString('fa-IR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const readingTime = Math.max(1, Math.ceil(post.wordCount / 200));

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:border-[var(--color-primary)] hover:shadow-[var(--shadow-medium)]"
    >
      {post.coverImage ? (
        <div className="relative aspect-[1200/630] w-full overflow-hidden">
          <Image
            src={post.coverImage}
            alt={post.coverAlt || post.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            loading={index < 3 ? 'eager' : 'lazy'}
          />
        </div>
      ) : (
        <div className="aspect-[1200/630] w-full bg-gradient-to-br from-[var(--surface-2)] to-[var(--surface-1)] flex flex-col items-center justify-center gap-2 p-4">
          <span className="text-4xl opacity-30">📄</span>
          <span className="text-xs font-bold text-[var(--text-muted)] opacity-60 line-clamp-2 max-w-[250px] text-center">
            {post.title}
          </span>
        </div>
      )}
      <div className="p-4">
        {index === 0 && (
          <span className="mb-2 inline-flex w-fit items-center rounded-full bg-[var(--color-primary)]/10 px-2 py-0.5 text-xs font-bold text-[var(--color-primary)]">
            جدیدترین
          </span>
        )}
        <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
          <span className="rounded-full border border-[var(--border-light)] px-2 py-0.5 font-semibold text-[var(--text-secondary)]">
            {normalizeCategoryLabel(post.category)}
          </span>
          <time dateTime={post.date}>{formattedDate}</time>
          <span className="text-[var(--text-muted)]">· {readingTime} دقیقه</span>
        </div>
        <h3 className="mt-2 text-base font-bold text-[var(--text-primary)] group-hover:text-[var(--color-primary)] transition-colors line-clamp-2">
          {post.title}
        </h3>
        <p className="mt-1.5 text-sm text-[var(--text-secondary)] line-clamp-2">
          {post.description}
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {post.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-[var(--surface-2)] px-2 py-0.5 text-[10px] text-[var(--text-muted)]"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}

function TopicHub({
  title,
  icon,
  href,
  description,
}: {
  title: string;
  icon: string;
  href: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-start gap-3 rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-4 transition-all duration-200 hover:border-[var(--color-primary)] hover:shadow-[var(--shadow-subtle)]"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-primary)]/10 text-xl">
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--color-primary)] transition-colors">
          {title}
        </h3>
        <p className="mt-0.5 text-xs text-[var(--text-muted)] line-clamp-2">{description}</p>
      </div>
    </Link>
  );
}

function ToolCTA({
  title,
  href,
  description,
}: {
  title: string;
  href: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-3 transition-all duration-200 hover:border-[var(--color-primary)] hover:bg-[rgb(var(--color-primary-rgb)/0.05)]"
    >
      <div className="flex-1 min-w-0">
        <div className="text-sm font-bold text-[var(--color-primary)]">{title}</div>
        <div className="text-xs text-[var(--text-muted)] mt-0.5 line-clamp-1">{description}</div>
      </div>
      <span className="text-[var(--color-primary)] shrink-0" aria-hidden="true">
        ←
      </span>
    </Link>
  );
}

export default function BlogEditorial() {
  const allPosts = getEditorialPosts();
  const featured = allPosts[0] ?? null;
  const secondary = allPosts.slice(1, 3);
  const latest = allPosts.slice(3, 9);
  const series = allPosts.filter((p) => p.series).slice(0, 4);

  const topicHubs = [
    {
      title: 'ابزارهای مالی',
      icon: '💰',
      href: '/blog/category/مالی',
      description: 'محاسبه وام، حقوق، مالیات، سود و سرمایه‌گذاری',
    },
    {
      title: 'ابزارهای متنی و ویرایش',
      icon: '✍️',
      href: getCategoryRoute('متنی'),
      description: 'ویرایش فارسی، نیم‌فاصله، تبدیل حروف',
    },
    {
      title: 'ابزارهای PDF و تصویر',
      icon: '📄',
      href: getCategoryRoute('ابزار'),
      description: 'کاهش حجم، ترکیب، جداسازی و تبدیل',
    },
    {
      title: 'قراردادها و حقوقی',
      icon: '📋',
      href: '/blog/category/حقوقی',
      description: 'اجاره، مبایعه، پیمانکاری',
    },
    {
      title: 'ابزارهای شغلی',
      icon: '💼',
      href: '/blog/category/شغلی',
      description: 'رزومه، گواهی سابقه، قرارداد اشتغال',
    },
    {
      title: 'تاریخ و تقویم',
      icon: '📅',
      href: '/blog/category/تاریخ',
      description: 'تبدیل تاریخ، تقویم شمسی، مناسبت‌ها',
    },
  ];

  const relatedTools = [
    { title: 'محاسبه قسط وام', href: '/loan', description: 'محاسبه آنلاین اقساط ماهانه' },
    { title: 'محاسبه حقوق و مزایا', href: '/salary', description: 'محاسبه خالص دریافتی' },
    {
      title: 'کاهش حجم PDF',
      href: '/pdf-tools/compress/compress-pdf',
      description: 'فشرده‌سازی رایگان فایل PDF',
    },
    {
      title: 'رزومه‌ساز حرفه‌ای',
      href: '/career-tools/resume-builder',
      description: 'ساخت رزومه با قالب‌های حرفه‌ای',
    },
  ];

  return (
    <div className="space-y-10">
      {/* Featured Article */}
      {featured ? (
        <section>
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">مقاله ویژه</h2>
          <FeaturedPost post={featured} />
        </section>
      ) : null}

      {secondary.length > 0 ? (
        <section>
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">گزیده تحریریه</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {secondary.map((post, index) => (
              <PostCard key={post.slug} post={post} index={index + 1} />
            ))}
          </div>
        </section>
      ) : null}

      {/* Topic Hubs */}
      <section>
        <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">موضوعات</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {topicHubs.map((hub) => (
            <TopicHub key={hub.href} {...hub} />
          ))}
        </div>
      </section>

      {/* Latest Articles */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-[var(--text-primary)]">جدیدترین مقاله‌ها</h2>
          <Link
            href="/blog"
            className="text-sm font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-hover)]"
          >
            همه مقاله‌ها ←
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {latest.map((post, index) => (
            <PostCard key={post.slug} post={post} index={index} />
          ))}
        </div>
      </section>

      {/* Series */}
      {series.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">سری‌های آموزشی</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {series.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group flex items-center gap-3 rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-4 transition-all duration-200 hover:border-[var(--color-primary)]"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)]/10 text-sm font-bold text-[var(--color-primary)]">
                  {post.seriesOrder ?? '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--color-primary)] truncate">
                    {post.title}
                  </div>
                  <div className="text-xs text-[var(--text-muted)] mt-0.5">
                    مجموعه: {normalizeSeriesLabel(post.series) ?? 'مجموعه'}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Related Tools */}
      <section className="rounded-[var(--radius-lg)] border border-[rgb(var(--color-primary-rgb)/0.2)] bg-[rgb(var(--color-primary-rgb)/0.05)] p-5">
        <h2 className="text-lg font-bold text-[var(--text-primary)] mb-3">
          ابزارهای مرتبط با مقالات
        </h2>
        <p className="text-sm text-[var(--text-muted)] mb-4">
          ابزارهای آنلاین رایگان جعبه ابزار فارسی که در مقالات معرفی شده‌اند:
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {relatedTools.map((tool) => (
            <ToolCTA key={tool.href} {...tool} />
          ))}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-6 text-center">
        <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-full bg-[rgb(var(--color-primary-rgb)/0.1)] mb-3">
          <span className="text-2xl">📬</span>
        </div>
        <h3 className="text-lg font-bold text-[var(--text-primary)]">
          از جدیدترین مقالات باخبر شوید
        </h3>
        <p className="text-sm text-[var(--text-muted)] mt-1 max-w-md mx-auto">
          با عضویت در کانال تلگرام، هر هفته مقالات آموزشی و ابزارهای جدید را دریافت کنید.
        </p>
        <a
          href="https://t.me/persiantoolbox"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-primary)] px-5 py-2.5 text-sm font-bold text-white hover:bg-[var(--color-primary-hover)] transition-colors"
        >
          <span>عضویت در تلگرام</span>
          <span aria-hidden="true">←</span>
        </a>
      </section>
    </div>
  );
}
