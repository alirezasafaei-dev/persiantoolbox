import Link from 'next/link';
import SiteShell from '@/components/ui/SiteShell';
import { buildMetadata } from '@/lib/seo';
import { getAllPosts, type BlogPostMeta } from '@/lib/blog';
import { BLOG_AUTHORS } from '@/lib/blog-authors';

export const revalidate = 300;

function getAuthorPosts(author: string): BlogPostMeta[] {
  return getAllPosts().filter((post) => post.author === author);
}

export async function generateMetadata() {
  return buildMetadata({
    title: 'نویسندگان - جعبه ابزار فارسی',
    description: 'آشنایی با نویسندگان مقالات بلاگ جعبه ابزار فارسی',
    path: '/blog/author',
  });
}

export default function AuthorIndexPage() {
  const authors = Object.values(BLOG_AUTHORS);

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
        <span className="text-[var(--text-secondary)]">نویسندگان</span>
      </nav>

      <h1 className="text-3xl font-black text-[var(--text-primary)]">نویسندگان</h1>
      <p className="mt-2 text-sm text-[var(--text-secondary)]">
        آشنایی با نویسندگان مقالات آموزشی جعبه ابزار فارسی
      </p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        {authors.map((author) => {
          const posts = getAuthorPosts(author.name);
          return (
            <div
              key={author.id}
              className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-6"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-primary)]/10 text-2xl font-bold text-[var(--color-primary)]">
                  {author.avatarInitials}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[var(--text-primary)]">
                    <Link
                      href={`/blog/author/${author.id}`}
                      className="hover:text-[var(--color-primary)] transition-colors"
                    >
                      {author.name}
                    </Link>
                  </h2>
                  <p className="text-xs text-[var(--text-muted)]">{posts.length} مقاله</p>
                </div>
              </div>
              <p className="text-sm text-[var(--text-secondary)] mb-4">{author.bio}</p>
              {posts.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">آخرین مقالات:</h3>
                  {posts.slice(0, 3).map((post) => (
                    <Link
                      key={post.slug}
                      href={`/blog/${post.slug}`}
                      className="block rounded-md p-2 text-sm text-[var(--color-primary)] hover:bg-[var(--surface-2)] transition-colors"
                    >
                      {post.title}
                    </Link>
                  ))}
                  {posts.length > 3 && (
                    <Link
                      href={`/blog/author/${author.id}`}
                      className="block rounded-md p-2 text-xs font-semibold text-[var(--color-primary)] hover:bg-[var(--surface-2)] transition-colors"
                    >
                      مشاهده همه مقالات ({posts.length})
                    </Link>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </SiteShell>
  );
}
