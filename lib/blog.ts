import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeHighlight from 'rehype-highlight';
import rehypeStringify from 'rehype-stringify';

const postsDirectory = path.join(process.cwd(), 'content/blog');

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
};

export type BlogPostMeta = Omit<BlogPost, 'content' | 'contentHtml'>;

function ensurePostsDirectory(): void {
  if (!fs.existsSync(postsDirectory)) {
    fs.mkdirSync(postsDirectory, { recursive: true });
  }
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

  return {
    slug,
    title: String(data['title'] ?? ''),
    date: String(data['date'] ?? ''),
    author: String(data['author'] ?? ''),
    category: String(data['category'] ?? ''),
    tags: (data['tags'] as string[]) ?? [],
    description: String(data['description'] ?? ''),
    coverImage: String(data['coverImage'] ?? ''),
    published: Boolean(data['published'] ?? false),
    content,
    contentHtml,
  };
}

export function getAllPosts(): BlogPostMeta[] {
  const slugs = getAllPostSlugs();
  const posts = slugs
    .map((slug) => {
      const post = getPostBySlug(slug);
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
      };
    })
    .filter((post) => post.published)
    .sort((post1, post2) => (post1.date > post2.date ? -1 : 1));
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
