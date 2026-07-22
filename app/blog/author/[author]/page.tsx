import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import SiteShell from '@/components/ui/SiteShell';
import { buildMetadata } from '@/lib/seo';
import { getAllPosts, type BlogPostMeta } from '@/lib/blog';
import { BLOG_AUTHORS, getAuthorById } from '@/lib/blog-authors';
import { siteUrl } from '@/lib/seo';

export const revalidate = 300;

export async function generateStaticParams() {
  return Object.values(BLOG_AUTHORS).map((author) => ({ author: author.id }));
}

function getAuthorPosts(authorName: string): BlogPostMeta[] {
  return getAllPosts().filter((post) => post.author === authorName);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ author: string }>;
}): Promise<Metadata> {
  const { author: authorId } = await params;
  const author = getAuthorById(authorId);
  if (!author) {
    return { title: 'نویسنده یافت نشد', robots: { index: false, follow: false } };
  }

  return buildMetadata({
    title: `${author.name} - جعبه ابزار فارسی`,
    description: author.bio,
    path: `/blog/author/${author.id}`,
  });
}

export default async function AuthorPage({ params }: { params: Promise<{ author: string }> }) {
  const { author: authorId } = await params;
  const author = getAuthorById(authorId);
  if (!author) {
    notFound();
  }

  const posts = getAuthorPosts(author.name);

  const authorJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: author.name,
    description: author.bio,
    url: `${siteUrl}/blog/author/${author.id}`,
    worksFor: {
      '@type': 'Organization',
      name: 'جعبه ابزار فارسی',
      url: siteUrl,
    },
  };

  return (
    <SiteShell containerClassName="py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(authorJsonLd) }}
      />
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
        <Link href="/blog/author" className="hover:text-[var(--color-primary)]">
          نویسندگان
        </Link>
        <span aria-hidden="true">/</span>
        <span className="text-[var(--text-secondary)]">{author.name}</span>
      </nav>

      <div className="flex items-center gap-4 mb-8">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-primary)]/10 text-3xl font-bold text-[var(--color-primary)]">
          {author.avatarInitials}
        </div>
        <div>
          <h1 className="text-3xl font-black text-[var(--text-primary)]">{author.name}</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">{author.bio}</p>
          <p className="text-xs text-[var(--text-muted)] mt-2">{posts.length} مقاله</p>
        </div>
      </div>

      {posts.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-5 transition-all hover:border-[var(--color-primary)]/30 hover:shadow-[var(--shadow-medium)]"
            >
              <h2 className="text-base font-bold text-[var(--text-primary)] group-hover:text-[var(--color-primary)] transition-colors line-clamp-2">
                {post.title}
              </h2>
              <p className="mt-2 text-xs text-[var(--text-muted)] line-clamp-2">
                {post.description}
              </p>
              <div className="mt-3 flex items-center gap-2 text-xs text-[var(--text-muted)]">
                <span>{post.date}</span>
                <span aria-hidden="true">·</span>
                <span>{post.category}</span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-sm text-[var(--text-muted)]">هنوز مقاله‌ای منتشر نشده است.</p>
      )}
    </SiteShell>
  );
}
