import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeHighlight from 'rehype-highlight';
import rehypeStringify from 'rehype-stringify';

const postsDirectory = path.join(process.cwd(), 'content/blog');
const publicDirectory = path.join(process.cwd(), 'public');

type Difficulty = 'مبتدی' | 'متوسط' | 'پیشرفته';

export type BlogPost = {
  slug: string;
  title: string;
  date: string;
  author: string;
  category: string;
  tags: string[];
  description: string;
  coverImage: string;
  published: boolean;
  content: string;
  contentHtml: string;
  series: string | null;
  seriesOrder: number | null;
  difficulty: Difficulty | null;
};

export type BlogPostMeta = Omit<BlogPost, 'content' | 'contentHtml'> & {
  wordCount: number;
};

export type SeriesInfo = {
  name: string;
  posts: BlogPostMeta[];
  currentIndex: number;
  totalPosts: number;
  nextPost: BlogPostMeta | null;
  prevPost: BlogPostMeta | null;
};

function ensurePostsDirectory(): void {
  if (!fs.existsSync(postsDirectory)) {
    fs.mkdirSync(postsDirectory, { recursive: true });
  }
}

function resolveCoverImage(slug: string, frontmatterCoverImage: unknown): string {
  const explicitCoverImage = String(frontmatterCoverImage ?? '').trim();
  if (explicitCoverImage) {
    return explicitCoverImage;
  }

  const generatedCoverImage = `/images/blog/${slug}.svg`;
  const generatedCoverPath = path.join(publicDirectory, 'images', 'blog', `${slug}.svg`);

  return fs.existsSync(generatedCoverPath) ? generatedCoverImage : '';
}

export function getAllPostSlugs(): string[] {
  ensurePostsDirectory();
  const fileNames = fs.readdirSync(postsDirectory).filter((name) => name.endsWith('.md'));
  return fileNames.map((name) => name.replace(/\.md$/, ''));
}

export function getPostBySlug(slug: string): BlogPost {
  ensurePostsDirectory();
  const fullPath = path.join(postsDirectory, `${slug}.md`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);

  const processedContent = remark()
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeHighlight)
    .use(rehypeStringify)
    .processSync(content);

  const contentHtml = String(processedContent);

  const rawDifficulty = String(data['difficulty'] ?? '') as string;
  const validDifficulties: Difficulty[] = ['مبتدی', 'متوسط', 'پیشرفته'];
  const difficulty = validDifficulties.includes(rawDifficulty as Difficulty)
    ? (rawDifficulty as Difficulty)
    : null;

  return {
    slug,
    title: String(data['title'] ?? ''),
    date: String(data['date'] ?? ''),
    author: String(data['author'] ?? ''),
    category: String(data['category'] ?? ''),
    tags: (data['tags'] as string[]) ?? [],
    description: String(data['description'] ?? ''),
    coverImage: resolveCoverImage(slug, data['coverImage']),
    published: Boolean(data['published'] ?? false),
    content,
    contentHtml,
    series: data['series'] ? String(data['series']) : null,
    seriesOrder: typeof data['seriesOrder'] === 'number' ? data['seriesOrder'] : null,
    difficulty,
  };
}

let _allPostsCache: BlogPostMeta[] | null = null;

export function getAllPosts(): BlogPostMeta[] {
  if (_allPostsCache) {
    return _allPostsCache;
  }

  const slugs = getAllPostSlugs();
  const posts = slugs
    .map((slug) => {
      const post = getPostBySlug(slug);
      const wordCount = post.content.split(/\s+/).filter(Boolean).length;
      return {
        slug: post.slug,
        title: post.title,
        date: post.date,
        author: post.author,
        category: post.category,
        tags: post.tags,
        description: post.description,
        coverImage: post.coverImage,
        published: post.published,
        wordCount,
        series: post.series,
        seriesOrder: post.seriesOrder,
        difficulty: post.difficulty,
      };
    })
    .filter((post) => post.published)
    .sort((post1, post2) => (post1.date > post2.date ? -1 : 1));

  _allPostsCache = posts;
  return posts;
}

export function getPublishedPostsByCategory(category: string): BlogPostMeta[] {
  return getAllPosts().filter((post) => post.category === category);
}

export function getAllCategories(): string[] {
  const posts = getAllPosts();
  const categories = new Set(posts.map((post) => post.category));
  return Array.from(categories);
}

export function getAllTags(): string[] {
  const posts = getAllPosts();
  const tags = new Set(posts.flatMap((post) => post.tags));
  return Array.from(tags);
}

export type TagWithCount = {
  tag: string;
  count: number;
};

export function getTagsWithCount(): TagWithCount[] {
  const posts = getAllPosts();
  const counts = new Map<string, number>();
  for (const post of posts) {
    for (const tag of post.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return Array.from(counts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

export function getPostsByTag(tag: string): BlogPostMeta[] {
  return getAllPosts().filter((post) => post.tags.includes(tag));
}

export function getAllTagsForStaticParams(): string[] {
  return getTagsWithCount().map((t) => t.tag);
}

export function getPopularPosts(limit = 5): BlogPostMeta[] {
  return getAllPosts()
    .slice()
    .sort((a, b) => {
      const aScore = a.tags.length;
      const bScore = b.tags.length;
      if (bScore !== aScore) {
        return bScore - aScore;
      }
      return a.date > b.date ? -1 : 1;
    })
    .slice(0, limit);
}

export function getFeaturedPost(): BlogPostMeta | null {
  const posts = getAllPosts();
  return posts.length > 0 ? posts[0]! : null;
}

export function getRelatedPosts(slug: string, limit = 3): BlogPostMeta[] {
  const post = getPostBySlug(slug);
  const allPosts = getAllPosts();
  return allPosts
    .filter((p) => p.slug !== slug)
    .sort((a, b) => {
      const aCommon = a.tags.filter((t) => post.tags.includes(t)).length;
      const bCommon = b.tags.filter((t) => post.tags.includes(t)).length;
      if (bCommon !== aCommon) {
        return bCommon - aCommon;
      }
      return a.date > post.date ? -1 : 1;
    })
    .slice(0, limit);
}

function getPostsBySeries(series: string): BlogPostMeta[] {
  return getAllPosts()
    .filter((post) => post.series === series)
    .sort((a, b) => (a.seriesOrder ?? 0) - (b.seriesOrder ?? 0));
}

export function getSeriesProgress(slug: string): SeriesInfo | null {
  const allPosts = getAllPosts();
  const currentPost = allPosts.find((p) => p.slug === slug);
  if (!currentPost || !currentPost.series) {
    return null;
  }

  const seriesPosts = getPostsBySeries(currentPost.series);
  const currentIndex = seriesPosts.findIndex((p) => p.slug === slug);
  if (currentIndex === -1) {
    return null;
  }

  return {
    name: currentPost.series,
    posts: seriesPosts,
    currentIndex,
    totalPosts: seriesPosts.length,
    nextPost: (currentIndex < seriesPosts.length - 1
      ? seriesPosts[currentIndex + 1]
      : null) as BlogPostMeta | null,
    prevPost: (currentIndex > 0 ? seriesPosts[currentIndex - 1] : null) as BlogPostMeta | null,
  };
}
