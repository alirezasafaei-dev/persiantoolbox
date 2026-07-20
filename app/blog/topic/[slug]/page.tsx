import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import SiteShell from '@/components/ui/SiteShell';
import { buildMetadata } from '@/lib/seo';
import { getAllPosts, type BlogPostMeta } from '@/lib/blog';

export const revalidate = 300;

type TopicConfig = {
  title: string;
  description: string;
  icon: string;
  toolUrl: string;
  toolName: string;
};

const TOPICS: Record<string, TopicConfig> = {
  finance: {
    title: 'ابزارهای مالی',
    description: 'محاسبه وام، حقوق، مالیات، سود و سایر ابزارهای مالی',
    icon: '💰',
    toolUrl: '/salary',
    toolName: 'محاسبه حقوق و مزایا',
  },
  pdf: {
    title: 'ابزارهای PDF',
    description: 'کاهش حجم، ترکیب، جداسازی و تبدیل فایل‌های PDF',
    icon: '📄',
    toolUrl: '/pdf-tools',
    toolName: 'ابزارهای PDF',
  },
  writing: {
    title: 'ابزارهای متنی',
    description: 'ویرایش فارسی، نیم‌فاصله، تبدیل حروف و پاک‌سازی متن',
    icon: '✍️',
    toolUrl: '/writing-tools/persian-writing-studio',
    toolName: 'ویرایشگر فارسی',
  },
  contracts: {
    title: 'قراردادها',
    description: 'قرارداد اجاره، مبایعه، پیمانکاری و سایر قراردادها',
    icon: '📋',
    toolUrl: '/contract-tools',
    toolName: 'ابزارهای قرارداد',
  },
  career: {
    title: 'ابزارهای شغلی',
    description: 'رزومه‌ساز، گواهی سابقه، قرارداد اشتغال',
    icon: '💼',
    toolUrl: '/career-tools/resume-builder',
    toolName: 'رزومه‌ساز حرفه‌ای',
  },
  images: {
    title: 'ابزارهای تصویر',
    description: 'تبدیل فرمت، تغییر سایز، حذف پس‌زمینه',
    icon: '🖼️',
    toolUrl: '/image-tools',
    toolName: 'ابزارهای ویرایش تصویر',
  },
};

const TOPIC_KEYWORDS: Record<string, string[]> = {
  finance: [
    'وام',
    'حقوق',
    'بیمه',
    'مالیات',
    'سود',
    'سپرده',
    'تورم',
    'بازنشستگی',
    'سنوات',
    'مرخصی',
    'اضافه‌کاری',
    'عیدی',
    'طلا',
    'ارز',
  ],
  pdf: ['PDF', 'فشرده‌سازی', 'ترکیب', 'جداسازی', 'تبدیل PDF'],
  writing: ['نیم‌فاصله', 'متن فارسی', 'تبدیل حروف', 'پاک‌سازی', 'ZWNJ'],
  contracts: ['قرارداد', 'اجاره', 'مبایعه', 'پیمانکاری', 'سالن', 'خودرو'],
  career: ['رزومه', 'CV', 'بازار کار', 'سابقه', 'اشتغال'],
  images: ['تصویر', 'عکس', 'پس‌زمینه', 'تبدیل فرمت', 'تغییر سایز'],
};

function getTopicPosts(topic: string): BlogPostMeta[] {
  const keywords = TOPIC_KEYWORDS[topic] ?? [];
  return getAllPosts().filter((post) => {
    const allText = [...post.tags, post.category, post.title, post.description].join(' ');
    return keywords.some((keyword) => allText.includes(keyword));
  });
}

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return Object.keys(TOPICS).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const topic = TOPICS[slug];
  if (!topic) {
    return {};
  }

  return buildMetadata({
    title: `${topic.title} - جعبه ابزار فارسی`,
    description: topic.description,
    path: `/blog/topic/${slug}`,
  });
}

export default async function TopicHubPage({ params }: PageProps) {
  const { slug } = await params;
  const topic = TOPICS[slug];
  if (!topic) {
    notFound();
  }

  const posts = getTopicPosts(slug);

  return (
    <SiteShell containerClassName="py-10">
      <nav
        aria-label="مسیر"
        className="mb-4 flex flex-wrap items-center gap-1.5 text-xs text-[var(--text-muted)]"
      >
        <Link href="/" className="hover:text-[var(--color-primary)]">
          خانه
        </Link>
        <span aria-hidden="true">/</span>
        <Link href="/blog" className="hover:text-[var(--color-primary)]">
          بلاگ
        </Link>
        <span aria-hidden="true">/</span>
        <span className="text-[var(--text-secondary)]">{topic.title}</span>
      </nav>

      <section className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--color-primary)]/10 text-3xl">
            {topic.icon}
          </div>
          <div>
            <h1 className="text-3xl font-black text-[var(--text-primary)]">{topic.title}</h1>
            <p className="text-sm text-[var(--text-secondary)]">{topic.description}</p>
          </div>
        </div>

        <Link
          href={topic.toolUrl}
          className="inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-primary)] px-5 py-2.5 text-sm font-bold text-[var(--text-inverted)] hover:bg-[var(--color-primary-hover)] transition-colors"
        >
          {topic.toolName}
          <span aria-hidden="true">←</span>
        </Link>
      </section>

      {posts.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">
            مقاله‌ها ({posts.length})
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, index) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group flex flex-col rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:border-[var(--color-primary)]"
              >
                {post.coverImage ? (
                  <div className="relative aspect-[1200/630] w-full overflow-hidden">
                    <Image
                      src={post.coverImage}
                      alt={post.coverAlt || post.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      loading={index < 3 ? 'eager' : 'lazy'}
                    />
                  </div>
                ) : (
                  <div className="aspect-[1200/630] w-full bg-gradient-to-br from-[var(--surface-2)] to-[var(--surface-1)] flex items-center justify-center">
                    <span className="text-4xl opacity-30">📄</span>
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                    <span className="rounded-full border border-[var(--border-light)] px-2 py-0.5 font-semibold text-[var(--text-secondary)]">
                      {post.category}
                    </span>
                    <time dateTime={post.date}>
                      {new Date(post.date).toLocaleDateString('fa-IR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </time>
                  </div>
                  <h3 className="mt-2 text-base font-bold text-[var(--text-primary)] group-hover:text-[var(--color-primary)] line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="mt-1.5 text-sm text-[var(--text-secondary)] line-clamp-2">
                    {post.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {posts.length === 0 && (
        <div className="mt-8 rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-8 text-center">
          <p className="text-sm text-[var(--text-muted)]">
            هنوز مقاله‌ای در این موضوع منتشر نشده است.
          </p>
        </div>
      )}
    </SiteShell>
  );
}
