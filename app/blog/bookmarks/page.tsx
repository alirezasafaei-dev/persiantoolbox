import SiteShell from '@/components/ui/SiteShell';
import { getAllPosts } from '@/lib/blog';
import BlogBookmarksContent from './BlogBookmarksContent';

export default function BlogBookmarksPage() {
  const allPosts = getAllPosts();
  return (
    <SiteShell containerClassName="py-10">
      <section className="space-y-3">
        <h1 className="text-3xl font-black text-[var(--text-primary)]">نشان‌شده‌ها</h1>
        <p className="max-w-3xl text-sm text-[var(--text-secondary)]">
          مقاله‌هایی که نشان کرده‌اید در اینجا نمایش داده می‌شوند.
        </p>
      </section>
      <div className="mt-8">
        <BlogBookmarksContent allPosts={allPosts} />
      </div>
    </SiteShell>
  );
}
