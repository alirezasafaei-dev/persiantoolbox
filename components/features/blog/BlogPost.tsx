'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Tag from '@/shared/ui/Tag';
import { useToast } from '@/shared/ui/toast-context';
import type { BlogPost as BlogPostType, BlogPostMeta } from '@/lib/blog';
import { BRAND } from '@/lib/brand';
import BlogToolCTA from './BlogToolCTA';
import BlogBookmarks from './BlogBookmarks';
import BlogReactions from './BlogReactions';
import BlogSeries from './BlogSeries';
import SiteAdBanner from '@/components/ui/SiteAdBanner';

type SeriesInfo = {
  name: string;
  posts: BlogPostMeta[];
  currentIndex: number;
  totalPosts: number;
  nextPost: BlogPostMeta | null;
  prevPost: BlogPostMeta | null;
} | null;

type Props = {
  post: BlogPostType;
  relatedPosts: BlogPostMeta[];
  seriesInfo: SeriesInfo;
  adsEnabled?: boolean;
};

type TocItem = {
  id: string;
  text: string;
  level: number;
};

function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 400);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-6 left-6 z-40 flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-primary)] text-white shadow-lg transition-all duration-200 hover:scale-110 hover:shadow-xl print:hidden"
      aria-label="بازگشت به بالا"
    >
      <svg
        className="h-5 w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M18 15l-6-6-6 6" />
      </svg>
    </button>
  );
}

function ReadingProgressBar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function onScroll() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        setProgress(Math.min((scrollTop / docHeight) * 100, 100));
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-[3px] bg-transparent">
      <div
        className="h-full bg-[var(--color-primary)] transition-[width] duration-150"
        style={{ width: `${progress}%` }}
        role="progressbar"
        aria-valuenow={Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="پیشرفت مطالعه"
      />
    </div>
  );
}

function TableOfContents({ items, activeId }: { items: TocItem[]; activeId: string }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  if (items.length === 0) {
    return null;
  }

  const content = (
    <nav aria-label="فهرست مطالب">
      <h2 className="mb-3 text-sm font-bold text-[var(--text-primary)]">فهرست مطالب</h2>
      <ul className="space-y-1.5">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className={`block rounded-md px-2 py-1 text-xs transition-colors ${
                item.level === 3 ? 'ps-5' : ''
              } ${
                activeId === item.id
                  ? 'bg-[rgb(var(--color-primary-rgb)/0.1)] text-[var(--color-primary)] font-semibold'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-2)]'
              }`}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setMobileOpen(!mobileOpen)}
        className="flex items-center justify-between w-full rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-3 text-sm font-bold text-[var(--text-primary)] lg:hidden"
        aria-expanded={mobileOpen}
      >
        <span>فهرست مطالب</span>
        <span className={`text-xs transition-transform ${mobileOpen ? 'rotate-90' : ''}`}>◀</span>
      </button>
      <div className={`${mobileOpen ? 'block' : 'hidden'} lg:block`}>
        <div className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-4">
          {content}
        </div>
      </div>
    </>
  );
}

function ShareButtons({ title, slug }: { title: string; slug: string }) {
  const { showToast } = useToast();
  const url = `${BRAND.baseUrl}/blog/${slug}`;

  const shareText = `${title} | ${BRAND.siteName}`;

  const copyLink = useCallback(() => {
    navigator.clipboard.writeText(url).then(() => {
      showToast('لینک مقاله کپی شد', 'success');
    });
  }, [url, showToast]);

  return (
    <div className="flex items-center gap-2">
      <a
        href={`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(shareText)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border-light)] bg-[var(--surface-2)] text-[var(--text-muted)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors"
        aria-label="اشتراک‌گذاری در تلگرام"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.95 7.44l-1.96 9.26c-.15.67-.54.83-1.09.52l-3.01-2.22-1.45 1.39c-.16.16-.3.3-.62.3l.22-3.05 5.56-5.02c.24-.21-.05-.33-.37-.14L8.38 13.5l-2.96-.92c-.64-.2-.66-.64.13-.95l11.57-4.46c.54-.2 1.01.13.83.95l-.01-.01z" />
        </svg>
      </a>
      <a
        href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(shareText)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border-light)] bg-[var(--surface-2)] text-[var(--text-muted)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors"
        aria-label="اشتراک‌گذاری در توییتر"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </a>
      <a
        href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText} ${url}`)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border-light)] bg-[var(--surface-2)] text-[var(--text-muted)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors"
        aria-label="اشتراک‌گذاری در واتساپ"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </a>
      <button
        type="button"
        onClick={copyLink}
        className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border-light)] bg-[var(--surface-2)] text-[var(--text-muted)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors"
        aria-label="کپی لینک"
      >
        <svg
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
        </svg>
      </button>
    </div>
  );
}

function AuthorSection({ author }: { author: string }) {
  const initial = author.charAt(0) || 'ن';
  const colors = [
    'bg-blue-500',
    'bg-emerald-500',
    'bg-violet-500',
    'bg-amber-500',
    'bg-rose-500',
    'bg-cyan-500',
  ];
  const colorIndex = author.charCodeAt(0) % colors.length;

  const AUTHOR_BIOS: Record<string, string> = {
    'علیرضا صفایی': 'نویسنده و توسعه‌دهنده ابزارهای آنلاین فارسی',
    'تیم فارسی': 'تیم تولید محتوای جعبه ابزار فارسی',
    'تیم محتوا': 'تیم تولید محتوای جعبه ابزار فارسی',
  };
  const bio = AUTHOR_BIOS[author] ?? 'نویسنده در جعبه ابزار فارسی';

  return (
    <div className="flex items-center gap-3">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white ${colors[colorIndex]}`}
      >
        {initial}
      </div>
      <div>
        <div className="text-sm font-bold text-[var(--text-primary)]">{author}</div>
        <div className="text-xs text-[var(--text-muted)]">{bio}</div>
      </div>
    </div>
  );
}

function NewsletterCTA() {
  return (
    <section className="rounded-[var(--radius-lg)] border border-[rgb(var(--color-primary-rgb)/0.2)] bg-[rgb(var(--color-primary-rgb)/0.05)] p-6">
      <div className="flex flex-col items-center text-center space-y-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[rgb(var(--color-primary-rgb)/0.1)]">
          <svg
            className="h-6 w-6 text-[var(--color-primary)]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="m22 7-8.97 5.7a1.94 1.94 0 01-2.06 0L2 7" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-[var(--text-primary)]">
          از جدیدترین مقالات باخبر شوید
        </h3>
        <p className="text-sm text-[var(--text-muted)] max-w-md">
          هر هفته مقالات آموزشی، نکات کاربردی و ابزارهای جدید را در کانال تلگرام دریافت کنید. بیش از
          ۱۰۰ مقاله رایگان در انتظار شماست.
        </p>
        <a
          href={BRAND.telegramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-primary)] px-5 py-2.5 text-sm font-bold text-white hover:bg-[var(--color-primary-hover)] transition-colors"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.95 7.44l-1.96 9.26c-.15.67-.54.83-1.09.52l-3.01-2.22-1.45 1.39c-.16.16-.3.3-.62.3l.22-3.05 5.56-5.02c.24-.21-.05-.33-.37-.14L8.38 13.5l-2.96-.92c-.64-.2-.66-.64.13-.95l11.57-4.46c.54-.2 1.01.13.83.95l-.01-.01z" />
          </svg>
          عضویت در کانال تلگرام
        </a>
      </div>
    </section>
  );
}

function estimateReadingTime(contentHtml: string): number {
  const text = contentHtml.replace(/<[^>]+>/g, '');
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

export default function BlogPostComponent({ post, relatedPosts, seriesInfo, adsEnabled }: Props) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [tocItems, setTocItems] = useState<TocItem[]>([]);
  const [activeHeading, setActiveHeading] = useState('');
  const readingTime = estimateReadingTime(post.contentHtml);

  const formattedDate = new Date(post.date).toLocaleDateString('fa-IR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const DIFFICULTY_BADGE: Record<string, string> = {
    مبتدی:
      'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
    متوسط:
      'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
    پیشرفته:
      'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800',
  };

  useEffect(() => {
    const el = contentRef.current;
    if (!el) {
      return;
    }

    const headings = el.querySelectorAll('h2, h3');
    const items: TocItem[] = [];
    headings.forEach((heading, i) => {
      const id = heading.id || `heading-${i}`;
      heading.id = id;
      items.push({
        id,
        text: heading.textContent?.trim() ?? '',
        level: heading.tagName === 'H2' ? 2 : 3,
      });
    });
    setTocItems(items);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveHeading(entry.target.id);
          }
        }
      },
      { rootMargin: '-80px 0px -70% 0px', threshold: 0 },
    );

    headings.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, [post.contentHtml]);

  return (
    <>
      <ReadingProgressBar />
      <BackToTop />

      <div className="flex flex-col lg:flex-row gap-8">
        <article className="flex-1 min-w-0 space-y-6">
          <header className="space-y-4">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-hover)]"
            >
              <span aria-hidden="true">→</span>
              بازگشت به بلاگ
            </Link>

            <h1 className="text-3xl font-black leading-tight text-[var(--text-primary)]">
              {post.title}
            </h1>

            <p className="text-sm leading-7 text-[var(--text-secondary)]">{post.description}</p>

            <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--text-muted)]">
              <time dateTime={post.date}>{formattedDate}</time>
              {post.modifiedDate && post.modifiedDate !== post.date ? (
                <>
                  <span aria-hidden="true">·</span>
                  <span>
                    بروزرسانی:{' '}
                    {new Date(post.modifiedDate).toLocaleDateString('fa-IR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </>
              ) : null}
              <span aria-hidden="true">·</span>
              <span>زمان مطالعه: {readingTime} دقیقه</span>
              <span aria-hidden="true">·</span>
              <Tag variant="primary">{post.category}</Tag>
              {post.difficulty ? (
                <span
                  className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${DIFFICULTY_BADGE[post.difficulty]}`}
                >
                  {post.difficulty}
                </span>
              ) : null}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-[var(--border-light)]">
              <AuthorSection author={post.author} />
              <div className="flex items-center gap-2">
                <ShareButtons title={post.title} slug={post.slug} />
                <BlogBookmarks slug={post.slug} />
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {post.tags.map((tag) => (
                <Link key={tag} href={`/blog/tag/${tag}`}>
                  <Tag size="sm">{tag}</Tag>
                </Link>
              ))}
            </div>
          </header>

          {post.coverImage ? (
            <figure className="relative w-full overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-light)]">
              <div className="relative aspect-[1200/630] w-full">
                <Image
                  src={post.coverImage}
                  alt={post.coverAlt || post.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 800px"
                  className="object-cover"
                  priority
                />
              </div>
              {post.imageCaption ? (
                <figcaption className="px-4 py-2.5 text-center text-xs text-[var(--text-muted)] bg-[var(--surface-2)]">
                  {post.imageCaption}
                </figcaption>
              ) : null}
            </figure>
          ) : null}

          {seriesInfo ? <BlogSeries series={seriesInfo} currentSlug={post.slug} /> : null}

          <div
            ref={contentRef}
            className="prose prose-sm prose-headings:text-[var(--text-primary)] prose-p:text-[var(--text-secondary)] prose-a:text-[var(--color-primary)] prose-strong:text-[var(--text-primary)] prose-code:text-[var(--color-primary)] prose-pre:bg-[var(--surface-2)] prose-pre:border prose-pre:border-[var(--border-light)] max-w-none text-[var(--text-secondary)] leading-8 [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-bold [&_h3]:mt-6 [&_h3]:text-lg [&_h3]:font-bold [&_li]:text-[var(--text-secondary)] [&_ol]:space-y-2 [&_img]:max-w-full [&_img]:rounded-[var(--radius-md)] [&_img]:border [&_img]:border-[var(--border-light)] [&_img]:shadow-[var(--shadow-subtle)] [&_img]:my-6 [&_table]:w-full [&_table]:overflow-x-auto [&_th]:border [&_th]:border-[var(--border-light)] [&_th]:bg-[var(--surface-2)] [&_th]:px-3 [&_th]:py-2 [&_th]:text-sm [&_th]:font-semibold [&_th]:text-[var(--text-primary)] [&_td]:border [&_td]:border-[var(--border-light)] [&_td]:px-3 [&_td]:py-2 [&_td]:text-sm [&_td]:text-[var(--text-secondary)] [&_ul]:space-y-2"
            dangerouslySetInnerHTML={{ __html: post.contentHtml }}
          />

          {adsEnabled ? <SiteAdBanner placement="blog-after-content" /> : null}

          <div className="border-t border-[var(--border-light)] pt-6 space-y-4">
            <ShareButtons title={post.title} slug={post.slug} />
            <BlogReactions slug={post.slug} />
          </div>

          <NewsletterCTA />

          {relatedPosts.length > 0 && (
            <section className="space-y-3 rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-5">
              <h2 className="text-lg font-bold text-[var(--text-primary)]">مقاله‌های مرتبط</h2>
              <ul className="space-y-3">
                {relatedPosts.map((rp) => (
                  <li key={rp.slug}>
                    <Link
                      href={`/blog/${rp.slug}`}
                      className="group block rounded-md p-2 transition-colors hover:bg-[var(--surface-2)]"
                    >
                      <span className="text-sm font-semibold text-[var(--color-primary)] group-hover:text-[var(--color-primary-hover)]">
                        {rp.title}
                      </span>
                      <p className="mt-1 text-xs text-[var(--text-muted)] line-clamp-2">
                        {rp.description}
                      </p>
                      <div className="mt-1 flex items-center gap-2 text-[10px] text-[var(--text-muted)]">
                        <span>{rp.category}</span>
                        {rp.difficulty ? (
                          <>
                            <span aria-hidden="true">·</span>
                            <span>{rp.difficulty}</span>
                          </>
                        ) : null}
                        <span aria-hidden="true">·</span>
                        <span>{Math.ceil(rp.wordCount / 200)} دقیقه مطالعه</span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <BlogToolCTA tags={post.tags} />
        </article>

        <aside className="hidden lg:block w-64 shrink-0">
          <div className="sticky top-24">
            <TableOfContents items={tocItems} activeId={activeHeading} />
          </div>
        </aside>

        <div className="lg:hidden">
          <TableOfContents items={tocItems} activeId={activeHeading} />
        </div>
      </div>

      <style>{`
        @media print {
          .reading-progress-bar,
          nav[aria-label="مسیر"],
          aside,
          .lg\\:hidden,
          [role="progressbar"],
          .sticky { display: none !important; }
          article { max-width: 100% !important; padding: 0 !important; }
          .prose { font-size: 12pt !important; }
          body { background: white !important; color: black !important; }
          a { color: black !important; text-decoration: underline !important; }
        }
      `}</style>
    </>
  );
}
