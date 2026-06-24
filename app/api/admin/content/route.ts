import { NextResponse } from 'next/server';
import { requireAdminFromRequest } from '@/lib/server/adminAuth';
import { logApiEvent } from '@/lib/server/request-observability';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type PostMeta = {
  slug: string;
  title: string;
  date: string;
  category: string;
  tags: string[];
  description: string;
  published: boolean;
  author: string;
  coverImage: string;
};

async function readPostMeta(contentDir: string, file: string): Promise<PostMeta | null> {
  const fs = await import('node:fs/promises');
  const path = await import('node:path');
  try {
    const content = await fs.readFile(path.join(contentDir, file), 'utf-8');
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
    if (!frontmatterMatch?.[1]) {
      return null;
    }
    const fm = frontmatterMatch[1];
    const title = fm.match(/title:\s*"?([^"\n]+)"?/)?.[1] ?? file.replace('.md', '');
    const date = fm.match(/date:\s*"?([^"\n]+)"?/)?.[1] ?? '';
    const category = fm.match(/category:\s*"?([^"\n]+)"?/)?.[1] ?? 'عمومی';
    const author = fm.match(/author:\s*"?([^"\n]+)"?/)?.[1] ?? '';
    const description = fm.match(/description:\s*"?([^"\n]+)"?/)?.[1] ?? '';
    const coverImage = fm.match(/coverImage:\s*"?([^"\n]+)"?/)?.[1] ?? '';
    const published = fm.includes('published: true');
    const tagsMatch = fm.match(/tags:\s*\[([^\]]*)\]/);
    const tags = tagsMatch?.[1]
      ? tagsMatch[1].split(',').map((t) => t.trim().replace(/['"]/g, ''))
      : [];
    return {
      slug: file.replace('.md', ''),
      title,
      date,
      category,
      tags,
      description,
      published,
      author,
      coverImage,
    };
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const adminError = await requireAdminFromRequest(request);
  if (adminError) {
    return adminError;
  }

  logApiEvent(request, { route: 'admin.content.get', event: 'request' });

  try {
    const fs = await import('node:fs/promises');
    const path = await import('node:path');
    const contentDir = path.join(process.cwd(), 'content', 'blog');

    let posts: PostMeta[] = [];
    try {
      await fs.access(contentDir);
      const files = await fs.readdir(contentDir);
      const mdFiles = files.filter((f) => f.endsWith('.md') && !f.startsWith('_'));
      const metas = await Promise.all(mdFiles.map((f) => readPostMeta(contentDir, f)));
      posts = metas.filter((m): m is PostMeta => m !== null);
    } catch {
      posts = [];
    }

    const categories = [...new Set(posts.map((p) => p.category))];
    const tags = [...new Set(posts.flatMap((p) => p.tags))];

    return NextResponse.json({ posts, categories, tags });
  } catch {
    return NextResponse.json({ posts: [], categories: [], tags: [] });
  }
}

export async function POST(request: Request) {
  const adminError = await requireAdminFromRequest(request);
  if (adminError) {
    return adminError;
  }

  logApiEvent(request, { route: 'admin.content.post', event: 'request' });

  try {
    const body = await request.json();
    const { title, slug, category, tags, description, content, published } = body;

    if (!title || !slug) {
      return NextResponse.json({ error: 'Title and slug are required' }, { status: 400 });
    }

    const fs = await import('node:fs/promises');
    const pathMod = await import('node:path');
    const contentDir = pathMod.join(process.cwd(), 'content', 'blog');
    await fs.mkdir(contentDir, { recursive: true });

    const frontmatter = [
      '---',
      `title: "${title}"`,
      `slug: "${slug}"`,
      `date: "${new Date().toISOString().split('T')[0]}"`,
      `category: "${category ?? 'عمومی'}"`,
      `tags: [${(tags ?? []).map((t: string) => `"${t}"`).join(', ')}]`,
      `description: "${description ?? ''}"`,
      `published: ${published ?? false}`,
      '---',
      '',
      content ?? '',
    ].join('\n');

    await fs.writeFile(pathMod.join(contentDir, `${slug}.md`), frontmatter, 'utf-8');

    return NextResponse.json({ ok: true, slug });
  } catch {
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const adminError = await requireAdminFromRequest(request);
  if (adminError) {
    return adminError;
  }

  logApiEvent(request, { route: 'admin.content.put', event: 'request' });

  try {
    const body = await request.json();
    const { slug, title, category, tags, description, content, published } = body;

    if (!slug) {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
    }

    const fs = await import('node:fs/promises');
    const pathMod = await import('node:path');
    const contentDir = pathMod.join(process.cwd(), 'content', 'blog');
    const filePath = pathMod.join(contentDir, `${slug}.md`);

    let existingContent = '';
    try {
      existingContent = await fs.readFile(filePath, 'utf-8');
    } catch {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const frontmatterMatch = existingContent.match(/^---\n([\s\S]*?)\n---/);
    const bodyMatch = existingContent.match(/^---\n[\s\S]*?\n---\n([\s\S]*)$/);
    const existingBody = bodyMatch?.[1]?.trim() ?? '';
    const fm = frontmatterMatch?.[1] ?? '';

    const date = fm.match(/date:\s*"?([^"\n]+)"?/)?.[1] ?? new Date().toISOString().split('T')[0];
    const author = fm.match(/author:\s*"?([^"\n]+)"?/)?.[1] ?? '';
    const coverImage = fm.match(/coverImage:\s*"?([^"\n]+)"?/)?.[1] ?? '';

    const newFm = [
      '---',
      `title: "${title ?? fm.match(/title:\s*"?([^"\n]+)"?/)?.[1] ?? slug}"`,
      `slug: "${slug}"`,
      `date: "${date}"`,
      `author: "${author}"`,
      `category: "${category ?? fm.match(/category:\s*"?([^"\n]+)"?/)?.[1] ?? 'عمومی'}"`,
      `tags: [${(tags ?? []).map((t: string) => `"${t}"`).join(', ')}]`,
      `description: "${description ?? fm.match(/description:\s*"?([^"\n]+)"?/)?.[1] ?? ''}"`,
      `coverImage: "${coverImage}"`,
      `published: ${published ?? fm.includes('published: true')}`,
      '---',
      '',
      content ?? existingBody,
    ].join('\n');

    await fs.writeFile(filePath, newFm, 'utf-8');

    return NextResponse.json({ ok: true, slug });
  } catch {
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const adminError = await requireAdminFromRequest(request);
  if (adminError) {
    return adminError;
  }

  logApiEvent(request, { route: 'admin.content.patch', event: 'request' });

  try {
    const body = await request.json();
    const { action, slugs } = body;

    if (!action || !Array.isArray(slugs) || slugs.length === 0) {
      return NextResponse.json({ error: 'Action and slugs are required' }, { status: 400 });
    }

    const fs = await import('node:fs/promises');
    const pathMod = await import('node:path');
    const contentDir = pathMod.join(process.cwd(), 'content', 'blog');

    let processed = 0;
    for (const slug of slugs) {
      const filePath = pathMod.join(contentDir, `${slug}.md`);
      try {
        let content = await fs.readFile(filePath, 'utf-8');

        if (action === 'publish') {
          content = content.replace('published: false', 'published: true');
          await fs.writeFile(filePath, content, 'utf-8');
          processed++;
        } else if (action === 'unpublish') {
          content = content.replace('published: true', 'published: false');
          await fs.writeFile(filePath, content, 'utf-8');
          processed++;
        } else if (action === 'delete') {
          await fs.unlink(filePath);
          processed++;
        }
      } catch {
        continue;
      }
    }

    return NextResponse.json({ ok: true, processed });
  } catch {
    return NextResponse.json({ error: 'Bulk action failed' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const adminError = await requireAdminFromRequest(request);
  if (adminError) {
    return adminError;
  }

  logApiEvent(request, { route: 'admin.content.delete', event: 'request' });

  try {
    const body = await request.json();
    const { slug } = body;

    if (!slug) {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
    }

    const fs = await import('node:fs/promises');
    const path = await import('node:path');
    const filePath = path.join(process.cwd(), 'content', 'blog', `${slug}.md`);

    await fs.unlink(filePath);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
  }
}
