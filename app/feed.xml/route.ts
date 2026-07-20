import { getAllPosts } from '@/lib/blog';
import { siteUrl } from '@/lib/seo';
import { BRAND } from '@/lib/brand';

export const revalidate = 300;

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function GET() {
  const posts = getAllPosts().slice(0, 30);
  const buildDate = new Date().toUTCString();

  const items = posts
    .map((post) => {
      const link = `${siteUrl}/blog/${post.slug}`;
      const pubDate = new Date(`${post.date}T00:00:00+03:30`).toUTCString();
      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <description>${escapeXml(post.description)}</description>
      <category>${escapeXml(post.category)}</category>
      <author>${escapeXml(post.author)}</author>
      <pubDate>${pubDate}</pubDate>
    </item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(BRAND.siteName)} - بلاگ</title>
    <link>${siteUrl}/blog</link>
    <atom:link href="${siteUrl}/feed.xml" rel="self" type="application/rss+xml" />
    <description>مقاله‌های آموزشی، راهنماها و نکات کاربردی درباره ابزارهای آنلاین فارسی</description>
    <language>fa-ir</language>
    <lastBuildDate>${buildDate}</lastBuildDate>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=300, s-maxage=300, stale-while-revalidate=60',
    },
  });
}
