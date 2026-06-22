import { NextResponse } from 'next/server';
import { requireAdminFromRequest } from '@/lib/server/adminAuth';
import { logApiEvent } from '@/lib/server/request-observability';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

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

    let posts: Array<{
      slug: string;
      title: string;
      date: string;
      category: string;
      published: boolean;
    }> = [];

    try {
      await fs.access(contentDir);
      const files = await fs.readdir(contentDir);
      const mdFiles = files.filter((f) => f.endsWith('.md') && !f.startsWith('_'));

      for (const file of mdFiles) {
        const content = await fs.readFile(path.join(contentDir, file), 'utf-8');
        const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
        if (frontmatterMatch?.[1]) {
          const fm = frontmatterMatch[1] as string;
          const title = fm.match(/title:\s*"?([^"\n]+)"?/)?.[1] ?? file.replace('.md', '');
          const date = fm.match(/date:\s*"?([^"\n]+)"?/)?.[1] ?? '';
          const category = fm.match(/category:\s*"?([^"\n]+)"?/)?.[1] ?? 'عمومی';
          const published = fm.includes('published: true');
          posts.push({ slug: file.replace('.md', ''), title, date, category, published });
        }
      }
    } catch {
      posts = [];
    }

    return NextResponse.json({ posts });
  } catch {
    return NextResponse.json({ posts: [] });
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
    const { title, slug, category, content } = body;

    if (!title || !slug) {
      return NextResponse.json({ error: 'Title and slug are required' }, { status: 400 });
    }

    const fs = await import('node:fs/promises');
    const path = await import('node:path');
    const contentDir = path.join(process.cwd(), 'content', 'blog');
    await fs.mkdir(contentDir, { recursive: true });

    const frontmatter = [
      '---',
      `title: "${title}"`,
      `slug: "${slug}"`,
      `date: "${new Date().toISOString().split('T')[0]}"`,
      `category: "${category ?? 'عمومی'}"`,
      'published: false',
      '---',
      '',
      content ?? '',
    ].join('\n');

    await fs.writeFile(path.join(contentDir, `${slug}.md`), frontmatter, 'utf-8');

    return NextResponse.json({ ok: true, slug });
  } catch {
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
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
