import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeHighlight from 'rehype-highlight';
import rehypeStringify from 'rehype-stringify';
import { normalizeCategoryLabel } from '@/lib/blog-normalize';
import { isBlogPostVisible } from '@/lib/blog-publication';

export {
  getCategoryRoute,
  normalizeCategoryLabel,
  normalizeSeriesLabel,
} from '@/lib/blog-normalize';
export {
  BLOG_PUBLICATION_TIME_ZONE,
  getBlogPublicationStatus,
  getDateInTimeZone,
  isBlogPostVisible,
  isValidBlogPublicationDate,
} from '@/lib/blog-publication';

const postsDirectory = path.join(process.cwd(), 'content/blog');
const CACHE_DIR = path.join(process.cwd(), '.next', 'cache');
const CACHE_FILE = path.join(CACHE_DIR, 'blog-posts.json');

// In standalone mode, process.cwd() is .next/standalone/.
const PROJECT_ROOT = process.cwd().endsWith('.next/standalone')
  ? path.join(process.cwd(), '..', '..')
  : process.cwd();
const STANDALONE_POSTS_DIR = path.join(PROJECT_ROOT, 'content/blog');
const STANDALONE_CACHE_FILE = path.join(PROJECT_ROOT, '.next', 'cache', 'blog-posts.json');

type Difficulty = 'مبتدی' | 'متوسط' | 'پیشرفته';

export type BlogPost = {
  slug: string;
  title: string;
  date: string;
  modifiedDate: string;
  author: string;
  category: string;
  tags: string[];
  description: string;
  coverImage: string;
  coverAlt: string;
  imageCaption: string;
  published: boolean;
  content: string;
  contentHtml: string;
  series: string | null;
  seriesOrder: number | null;
  difficulty: Difficulty | null;
  featured: boolean;
  featuredRank: number | null;
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

type RawPostRecord = {
  data: Record<string, unknown>;
  content: string;
};

function ensurePostsDirectory(): void {
  const dir = fs.existsSync(postsDirectory) ? postsDirectory : STANDALONE_POSTS_DIR;
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function getPostsDir(): string {
  return fs.existsSync(postsDirectory) ? postsDirectory : STANDALONE_POSTS_DIR;
}

function getCachePath(): string {
  return fs.existsSync(path.dirname(CACHE_FILE)) ? CACHE_FILE : STANDALONE_CACHE_FILE;
}

export function getAllPostSlugs(): string[] {
  ensurePostsDirectory();
  const dir = getPostsDir();
  return fs
    .readdirSync(dir)
    .filter((name) => name.endsWith('.md'))
    .map((name) => name.replace(/\.md$/, ''));
}

function getRawPostBySlug(slug: string): RawPostRecord {
  ensurePostsDirectory();
  const fullPath = path.join(getPostsDir(), `${slug}.md`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);
  return { data: data as Record<string, unknown>, content };
}

function mapPostRecord(
  slug: string,
  data: Record<string, unknown>,
  content: string,
  contentHtml: string,
): BlogPost {
  const rawDifficulty = String(data['difficulty'] ?? '');
  const validDifficulties: Difficulty[] = ['مبتدی', 'متوسط', 'پیشرفته'];
  const difficulty = validDifficulties.includes(rawDifficulty as Difficulty)
    ? (rawDifficulty as Difficulty)
    : null;

  return {
    slug,
    title: String(data['title'] ?? ''),
    date: String(data['date'] ?? ''),
    modifiedDate: String(data['modifiedDate'] ?? data['date'] ?? ''),
    author: String(data['author'] ?? ''),
    category: String(data['category'] ?? ''),
    tags: Array.from(
      new Set(((data['tags'] as string[]) ?? []).map((tag) => String(tag).trim()).filter(Boolean)),
    ),
    description: String(data['description'] ?? ''),
    coverImage: String(data['coverImage'] ?? ''),
    coverAlt: String(data['coverAlt'] ?? ''),
    imageCaption: String(data['imageCaption'] ?? ''),
    published: Boolean(data['published'] ?? false),
    content,
    contentHtml,
    series: (() => {
      if (typeof data['series'] === 'object' && data['series'] !== null) {
        return String((data['series'] as Record<string, unknown>)['name'] ?? '');
      }
      return data['series'] ? String(data['series']) : null;
    })(),
    seriesOrder: (() => {
      if (typeof data['series'] === 'object' && data['series'] !== null) {
        return typeof (data['series'] as Record<string, unknown>)['order'] === 'number'
          ? ((data['series'] as Record<string, unknown>)['order'] as number)
          : null;
      }
      return typeof data['seriesOrder'] === 'number' ? data['seriesOrder'] : null;
    })(),
    difficulty,
    featured: Boolean(data['featured'] ?? false),
    featuredRank: typeof data['featuredRank'] === 'number' ? data['featuredRank'] : null,
  };
}

export function getPostBySlug(slug: string): BlogPost {
  const { data, content } = getRawPostBySlug(slug);
  const processedContent = remark()
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeHighlight)
    .use(rehypeStringify)
    .processSync(content);

  return mapPostRecord(slug, data, content, String(processedContent));
}

let _publishedPostIndexCache: BlogPostMeta[] | null = null;

function isDiskCacheValid(): boolean {
  try {
    const cachePath = getCachePath();
    if (!fs.existsSync(cachePath)) {
      return false;
    }
    const stat = fs.statSync(cachePath);
    if (Date.now() - stat.mtimeMs > 3600000) {
      return false;
    }
    const newestPostMtime = fs
      .readdirSync(getPostsDir())
      .filter((file) => file.endsWith('.md'))
      .reduce((newest, file) => Math.max(newest, fs.statSync(path.join(getPostsDir(), file)).mtimeMs), 0);
    return newestPostMtime < stat.mtimeMs;
  } catch {
    return false;
  }
}

function buildPublishedPostIndex(): BlogPostMeta[] {
  return getAllPostSlugs()
    .map((slug) => {
      const { data, content } = getRawPostBySlug(slug);
      const post = mapPostRecord(slug, data, content, '');
      return {
        slug: post.slug,
        title: post.title,
        date: post.date,
        modifiedDate: post.modifiedDate,
        author: post.author,
        category: post.category,
        tags: post.tags,
        description: post.description,
        coverImage: post.coverImage,
        coverAlt: post.coverAlt,
        imageCaption: post.imageCaption,
        published: post.published,
        wordCount: content.split(/\s+/).filter(Boolean).length,
        series: post.series,
        seriesOrder: post.seriesOrder,
        difficulty: post.difficulty,
        featured: post.featured,
        featuredRank: post.featuredRank,
      };
    })
    .filter((post) => post.published)
    .sort((a, b) => (a.date > b.date ? -1 : 1));
}

function getPublishedPostIndex(): BlogPostMeta[] {
  if (_publishedPostIndexCache) {
    return _publishedPostIndexCache;
  }

  if (isDiskCacheValid()) {
    try {
      const cached = JSON.parse(fs.readFileSync(getCachePath(), 'utf8')) as BlogPostMeta[];
      if (Array.isArray(cached)) {
        _publishedPostIndexCache = cached;
        return cached;
      }
    } catch {
      // Rebuild an invalid cache.
    }
  }

  const posts = buildPublishedPostIndex();
  _publishedPostIndexCache = posts;

  try {
    const cachePath = getCachePath();
    fs.mkdirSync(path.dirname(cachePath), { recursive: true });
    fs.writeFileSync(cachePath, JSON.stringify(posts), 'utf8');
  } catch {
    // The cache is an optimization only.
  }

  return posts;
}

export function getAllPosts(now: Date = new Date()): BlogPostMeta[] {
  return getPublishedPostIndex().filter((post) => isBlogPostVisible(post, now));
}

export function getPublishedPostsByCategory(category: string): BlogPostMeta[] {
  const visibleCategory = normalizeCategoryLabel(category);
  return getAllPosts().filter(
    (post) =>
      post.category === category || normalizeCategoryLabel(post.category) === visibleCategory,
  );
}

export function getAllCategories(): string[] {
  return Array.from(new Set(getAllPosts().map((post) => post.category)));
}

export function getAllTags(): string[] {
  return Array.from(new Set(getAllPosts().flatMap((post) => post.tags)));
}

export type TagWithCount = {
  tag: string;
  count: number;
};

export const MIN_INDEXABLE_TAG_POSTS = 2;

export function getTagsWithCount(): TagWithCount[] {
  const counts = new Map<string, number>();
  for (const post of getAllPosts()) {
    for (const tag of post.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return Array.from(counts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

export function getPostsByTag(tag: string): BlogPostMeta[] {
  const normalizedTag = tag.trim();
  return getAllPosts().filter((post) => post.tags.includes(normalizedTag));
}

export function getAllTagsForStaticParams(): string[] {
  return getTagsWithCount().map((item) => item.tag);
}

export function getIndexableTagsForStaticParams(minPosts = MIN_INDEXABLE_TAG_POSTS): string[] {
  return getTagsWithCount()
    .filter(({ count }) => count >= minPosts)
    .map(({ tag }) => tag);
}

export function getPopularPosts(limit = 5): BlogPostMeta[] {
  return getRecommendedPosts(limit);
}

export function getRecommendedPosts(limit = 5): BlogPostMeta[] {
  return getAllPosts()
    .slice()
    .sort((a, b) => {
      const tagDifference = b.tags.length - a.tags.length;
      return tagDifference !== 0 ? tagDifference : a.date > b.date ? -1 : 1;
    })
    .slice(0, limit);
}

export function getHomepagePreviewPosts(limit = 3): BlogPostMeta[] {
  const pillarCategories = ['مالی', 'ابزار', 'آموزشی', 'حقوقی'];
  return getAllPosts()
    .slice()
    .sort((a, b) => {
      const coverDifference = Number(Boolean(b.coverImage)) - Number(Boolean(a.coverImage));
      if (coverDifference !== 0) {
        return coverDifference;
      }
      const pillarDifference =
        Number(pillarCategories.includes(b.category)) -
        Number(pillarCategories.includes(a.category));
      return pillarDifference !== 0 ? pillarDifference : a.date > b.date ? -1 : 1;
    })
    .slice(0, limit);
}

export function getFeaturedPost(): BlogPostMeta | null {
  return getEditorialPosts()[0] ?? null;
}

export function getEditorialPosts(): BlogPostMeta[] {
  return getAllPosts()
    .slice()
    .sort((a, b) => {
      if (a.featured || b.featured) {
        if (a.featured && !b.featured) {
          return -1;
        }
        if (!a.featured && b.featured) {
          return 1;
        }
        const rankDifference =
          (a.featuredRank ?? Number.MAX_SAFE_INTEGER) -
          (b.featuredRank ?? Number.MAX_SAFE_INTEGER);
        if (rankDifference !== 0) {
          return rankDifference;
        }
      }
      return a.date > b.date ? -1 : 1;
    });
}

export function getRelatedPosts(slug: string, limit = 3): BlogPostMeta[] {
  const post = getPostBySlug(slug);
  return getAllPosts()
    .filter((candidate) => candidate.slug !== slug)
    .sort((a, b) => {
      const aCommon = a.tags.filter((tag) => post.tags.includes(tag)).length;
      const bCommon = b.tags.filter((tag) => post.tags.includes(tag)).length;
      return bCommon !== aCommon ? bCommon - aCommon : a.date > b.date ? -1 : 1;
    })
    .slice(0, limit);
}

function getPostsBySeries(series: string): BlogPostMeta[] {
  return getAllPosts()
    .filter((post) => post.series === series)
    .sort((a, b) => (a.seriesOrder ?? 0) - (b.seriesOrder ?? 0));
}

export function getSeriesProgress(slug: string): SeriesInfo | null {
  const currentPost = getAllPosts().find((post) => post.slug === slug);
  if (!currentPost?.series) {
    return null;
  }

  const posts = getPostsBySeries(currentPost.series);
  const currentIndex = posts.findIndex((post) => post.slug === slug);
  if (currentIndex === -1) {
    return null;
  }

  return {
    name: currentPost.series,
    posts,
    currentIndex,
    totalPosts: posts.length,
    nextPost: posts[currentIndex + 1] ?? null,
    prevPost: posts[currentIndex - 1] ?? null,
  };
}
