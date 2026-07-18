import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeHighlight from 'rehype-highlight';
import rehypeStringify from 'rehype-stringify';
import { normalizeCategoryLabel } from '@/lib/blog-normalize';
export {
  getCategoryRoute,
  normalizeCategoryLabel,
  normalizeSeriesLabel,
} from '@/lib/blog-normalize';

const postsDirectory = path.join(process.cwd(), 'content/blog');
const CACHE_DIR = path.join(process.cwd(), '.next', 'cache');
const CACHE_FILE = path.join(CACHE_DIR, 'blog-posts.json');

// In standalone mode, process.cwd() is .next/standalone/
// We need to find content/blog relative to the project root
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
  const fileNames = fs.readdirSync(dir).filter((name) => name.endsWith('.md'));
  return fileNames.map((name) => name.replace(/\.md$/, ''));
}

function getRawPostBySlug(slug: string): RawPostRecord {
  ensurePostsDirectory();
  const dir = getPostsDir();
  const fullPath = path.join(dir, `${slug}.md`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);
  return {
    data: data as Record<string, unknown>,
    content,
  };
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

  const contentHtml = String(processedContent);
  return mapPostRecord(slug, data, content, contentHtml);
}

let _allPostsCache: BlogPostMeta[] | null = null;
let _homepagePreviewPostsCache: BlogPostMeta[] | null = null;

function isCacheValid(): boolean {
  try {
    const cachePath = getCachePath();
    if (!fs.existsSync(cachePath)) {
      return false;
    }
    const stat = fs.statSync(cachePath);
    const cacheAge = Date.now() - stat.mtimeMs;
    if (cacheAge > 3600000) {
      return false;
    }
    const dir = getPostsDir();
    const files = fs.readdirSync(dir).filter((f) => f.endsWith('.md'));
    const newestFile = files.reduce((newest, f) => {
      const fStat = fs.statSync(path.join(dir, f));
      return fStat.mtimeMs > newest ? fStat.mtimeMs : newest;
    }, 0);
    return newestFile < stat.mtimeMs;
  } catch {
    return false;
  }
}

export function getAllPosts(): BlogPostMeta[] {
  if (_allPostsCache) {
    return _allPostsCache;
  }

  if (isCacheValid()) {
    try {
      const cachePath = getCachePath();
      const cached = JSON.parse(fs.readFileSync(cachePath, 'utf-8'));
      _allPostsCache = cached;
      return cached;
    } catch {
      // cache invalid, rebuild
    }
  }

  const slugs = getAllPostSlugs();
  const posts = slugs
    .map((slug) => {
      const { data, content } = getRawPostBySlug(slug);
      const post = mapPostRecord(slug, data, content, '');
      const wordCount = content.split(/\s+/).filter(Boolean).length;
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
        wordCount,
        series: post.series,
        seriesOrder: post.seriesOrder,
        difficulty: post.difficulty,
        featured: post.featured,
        featuredRank: post.featuredRank,
      };
    })
    .filter((post) => post.published)
    .sort((post1, post2) => (post1.date > post2.date ? -1 : 1));

  _allPostsCache = posts;

  try {
    const cachePath = getCachePath();
    fs.mkdirSync(path.dirname(cachePath), { recursive: true });
    fs.writeFileSync(cachePath, JSON.stringify(posts), 'utf-8');
  } catch {
    // silently fail
  }

  return posts;
}

export function getPublishedPostsByCategory(category: string): BlogPostMeta[] {
  const visibleCategory = normalizeCategoryLabel(category);
  return getAllPosts().filter(
    (post) =>
      post.category === category || normalizeCategoryLabel(post.category) === visibleCategory,
  );
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

export const MIN_INDEXABLE_TAG_POSTS = 2;

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
  const normalizedTag = tag.trim();
  return getAllPosts().filter((post) => post.tags.includes(normalizedTag));
}

export function getAllTagsForStaticParams(): string[] {
  return getTagsWithCount().map((t) => t.tag);
}

export function getIndexableTagsForStaticParams(minPosts = MIN_INDEXABLE_TAG_POSTS): string[] {
  return getTagsWithCount()
    .filter(({ count }) => count >= minPosts)
    .map((t) => t.tag);
}

export function getPopularPosts(limit = 5): BlogPostMeta[] {
  return getRecommendedPosts(limit);
}

export function getRecommendedPosts(limit = 5): BlogPostMeta[] {
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

export function getHomepagePreviewPosts(limit = 3): BlogPostMeta[] {
  if (!_homepagePreviewPostsCache) {
    const now = new Date();
    const pillarCategories = ['مالی', 'ابزار', 'آموزشی', 'حقوقی'];

    _homepagePreviewPostsCache = getAllPosts()
      .filter((post) => new Date(post.date) <= now)
      .slice()
      .sort((a, b) => {
        const coverDiff = Number(Boolean(b.coverImage)) - Number(Boolean(a.coverImage));
        if (coverDiff !== 0) {
          return coverDiff;
        }

        const pillarDiff =
          Number(pillarCategories.includes(b.category)) -
          Number(pillarCategories.includes(a.category));
        if (pillarDiff !== 0) {
          return pillarDiff;
        }

        return a.date > b.date ? -1 : 1;
      });
  }

  return _homepagePreviewPostsCache.slice(0, limit);
}

export function getFeaturedPost(): BlogPostMeta | null {
  const posts = getEditorialPosts();
  return posts.length > 0 ? (posts[0] as BlogPostMeta) : null;
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
        const rankDiff =
          (a.featuredRank ?? Number.MAX_SAFE_INTEGER) - (b.featuredRank ?? Number.MAX_SAFE_INTEGER);
        if (rankDiff !== 0) {
          return rankDiff;
        }
      }
      return a.date > b.date ? -1 : 1;
    });
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
      return a.date > b.date ? -1 : 1;
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
