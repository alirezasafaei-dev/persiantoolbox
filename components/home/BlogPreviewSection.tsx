import Link from 'next/link';
import Image from 'next/image';
import { getAllPosts, getHomepagePreviewPosts } from '@/lib/blog';
import { toPersianNumbers } from '@/shared/utils/localization/persian';

export default function BlogPreviewSection() {
  const posts = getHomepagePreviewPosts(3);
  const totalPosts = getAllPosts().length;

  if (posts.length === 0) {
    return null;
  }

  return (
    <section className="space-y-6" aria-labelledby="blog-heading">
      <div className="flex flex-col items-center gap-2 text-center">
        <h2 id="blog-heading" className="text-3xl font-black text-[var(--text-primary)]">
          از بلاگ ما
        </h2>
        <p className="text-sm text-[var(--text-muted)]">
          مقاله‌های آموزشی، راهنماها و نکات کاربردی
        </p>
        <Link
          href="/blog"
          className="text-sm font-semibold text-[var(--color-primary)] transition-opacity hover:opacity-80"
        >
          مشاهده همه {toPersianNumbers(totalPosts)} مقاله ←
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post, index) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group flex flex-col rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-5 transition-all duration-200 hover:-translate-y-1 hover:border-[var(--color-primary)] hover:shadow-[var(--shadow-medium)]"
          >
            {post.coverImage ? (
              <div className="relative mb-3 h-40 w-full overflow-hidden rounded-[var(--radius-md)]">
                <Image
                  src={post.coverImage}
                  alt={post.coverAlt || post.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
            ) : null}
            {index === 0 && (
              <span className="mb-3 inline-flex w-fit items-center rounded-full bg-[var(--color-primary)]/10 px-2.5 py-0.5 text-xs font-bold text-[var(--color-primary)]">
                جدیدترین
              </span>
            )}
            <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-muted)]">
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
            <h3 className="mt-3 text-base font-bold text-[var(--text-primary)] group-hover:text-[var(--color-primary)] transition-colors line-clamp-2">
              {post.title}
            </h3>
            <p className="mt-2 flex-1 text-sm leading-7 text-[var(--text-secondary)] line-clamp-3">
              {post.description}
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {post.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-[var(--surface-2)] px-2 py-0.5 text-[10px] text-[var(--text-muted)]"
                >
                  {tag}
                </span>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-[var(--border-light)] pt-3">
              <span className="text-xs text-[var(--text-muted)]">
                {toPersianNumbers(Math.max(1, Math.round(post.wordCount / 200)))} دقیقه مطالعه
              </span>
              <span className="text-sm font-semibold text-[var(--color-primary)] group-hover:text-[var(--color-primary-hover)] transition-colors">
                مطالعه ←
              </span>
            </div>
          </Link>
        ))}
      </div>

      <div className="flex justify-center">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 rounded-full border border-[var(--border-light)] bg-[var(--surface-1)] px-6 py-2.5 text-sm font-semibold text-[var(--text-primary)] transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
        >
          همه مقاله‌ها
        </Link>
      </div>
    </section>
  );
}
