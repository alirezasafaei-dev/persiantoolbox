import { NextResponse } from 'next/server';
import { requireAdminFromRequest } from '@/lib/server/adminAuth';
import { logApiEvent } from '@/lib/server/request-observability';
import { isSameOrigin } from '@/lib/server/csrf';
import { makeRateLimitKey, rateLimit } from '@/lib/server/rateLimit';
import { rateLimitPolicies } from '@/lib/server/rateLimitPolicies';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const SLUG_REGEX = /^[a-zA-Z0-9_-]+$/;
const CONTENT_DIR = 'content/blog';

function safeSlug(slug: string): string | null {
  if (!slug || !SLUG_REGEX.test(slug)) {
    return null;
  }
  return slug;
}

function getContentDir() {
  const pathMod = require('node:path');
  return pathMod.join(process.cwd(), CONTENT_DIR);
}

async function enforceContentRateLimit(
  request: Request,
  userId: string,
): Promise<NextResponse | null> {
  if (!process.env['DATABASE_URL']?.trim()) {
    return null;
  }
  const { limit, windowMs, keyPrefix } = rateLimitPolicies.adminSiteSettings;
  if (!Number.isFinite(limit) || limit <= 0 || !Number.isFinite(windowMs) || windowMs <= 0) {
    return null;
  }
  try {
    const key = makeRateLimitKey(keyPrefix, request, userId);
    const result = await rateLimit(key, { limit, windowMs });
    if (!result.allowed) {
      return NextResponse.json(
        { ok: false, reason: 'RATE_LIMITED', resetAt: result.resetAt },
        { status: 429 },
      );
    }
    return null;
  } catch {
    return null;
  }
}

function denyIfNotAdmin(request: Request): NextResponse | null {
  if (!isSameOrigin(request)) {
    return NextResponse.json(
      { ok: false, errors: ['درخواست از مبدأ نامعتبر است.'] },
      { status: 403 },
    );
  }
  return null;
}

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
  const fs = require('node:fs/promises');
  const pathMod = require('node:path');
  try {
    const content = await fs.readFile(pathMod.join(contentDir, file), 'utf-8');
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
      ? tagsMatch[1].split(',').map((t: string) => t.trim().replace(/['"]/g, ''))
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
  try {
    const admin = await requireAdminFromRequest(request);
    if (!admin.ok) {
      return NextResponse.json({ ok: false }, { status: admin.status });
    }

    logApiEvent(request, { route: 'admin.content.get', event: 'request' });

    const fs = require('node:fs/promises');
    const pathMod = require('node:path');
    const contentDir = pathMod.join(process.cwd(), CONTENT_DIR);

    let posts: PostMeta[] = [];
    try {
      await fs.access(contentDir);
      const files = await fs.readdir(contentDir);
      const mdFiles = files.filter((f: string) => f.endsWith('.md') && !f.startsWith('_'));
      const metas = await Promise.all(mdFiles.map((f: string) => readPostMeta(contentDir, f)));
      posts = metas.filter((m): m is PostMeta => m !== null);
    } catch {
      posts = [];
    }

    const categories = [...new Set(posts.map((p) => p.category))];
    const tags = [...new Set(posts.flatMap((p) => p.tags))];

    return NextResponse.json({ ok: true, posts, categories, tags });
  } catch {
    return NextResponse.json({ ok: true, posts: [], categories: [], tags: [] });
  }
}

export async function POST(request: Request) {
  const corsError = denyIfNotAdmin(request);
  if (corsError) {
    return corsError;
  }

  const admin = await requireAdminFromRequest(request);
  if (!admin.ok) {
    return NextResponse.json({ ok: false }, { status: admin.status });
  }

  const limited = await enforceContentRateLimit(request, admin.user.id);
  if (limited) {
    return limited;
  }

  logApiEvent(request, { route: 'admin.content.post', event: 'request' });

  try {
    const body = await request.json();
    const { title, slug, category, tags, description, content, published } = body;

    if (!title || !slug) {
      return NextResponse.json({ ok: false, error: 'عنوان و نامک الزامی هستند.' }, { status: 400 });
    }

    const validSlug = safeSlug(slug);
    if (!validSlug) {
      return NextResponse.json(
        { ok: false, error: 'نامک فقط شامل حروف، اعداد، خط تیره و زیرخط باشد.' },
        { status: 400 },
      );
    }

    const contentDir = getContentDir();
    const fs = require('node:fs/promises');
    const pathMod = require('node:path');
    await fs.mkdir(contentDir, { recursive: true });

    const filePath = pathMod.join(contentDir, `${validSlug}.md`);
    const resolvedDir = pathMod.resolve(contentDir);
    if (!pathMod.resolve(filePath).startsWith(resolvedDir)) {
      return NextResponse.json({ ok: false, error: 'مسیر نامعتبر است.' }, { status: 400 });
    }

    const frontmatter = [
      '---',
      `title: "${title.replace(/"/g, '\\"')}"`,
      `slug: "${validSlug}"`,
      `date: "${new Date().toISOString().split('T')[0]}"`,
      `category: "${(category ?? 'عمومی').replace(/"/g, '\\"')}"`,
      `tags: [${(tags ?? []).map((t: string) => `"${String(t).replace(/"/g, '\\"')}"`).join(', ')}]`,
      `description: "${(description ?? '').replace(/"/g, '\\"')}"`,
      `published: ${published ?? false}`,
      '---',
      '',
      content ?? '',
    ].join('\n');

    await fs.writeFile(filePath, frontmatter, 'utf-8');

    try {
      const { query } = await import('@/lib/server/db');
      await query(
        'INSERT INTO admin_audit_log (action, user_id, user_name, details) VALUES ($1, $2, $3, $4)',
        ['content_update', admin.user.id, admin.user.email, `محتوای جدید ایجاد شد: ${validSlug}`],
      );
    } catch {
      // audit log is best-effort
    }

    if (published) {
      try {
        const { broadcastPushNotification } = await import('@/lib/server/push');
        await broadcastPushNotification(
          JSON.stringify({
            title: 'مطلب جدید در جعبه ابزار فارسی',
            body: title,
            url: `/blog/${validSlug}`,
            icon: '/icons/icon-192.png',
            badge: '/icons/badge-72.png',
            timestamp: Date.now(),
          }),
        );
      } catch {
        // push is best-effort
      }
    }

    return NextResponse.json({ ok: true, slug: validSlug });
  } catch {
    return NextResponse.json({ ok: false, error: 'خطا در ایجاد پست.' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const corsError = denyIfNotAdmin(request);
  if (corsError) {
    return corsError;
  }

  const admin = await requireAdminFromRequest(request);
  if (!admin.ok) {
    return NextResponse.json({ ok: false }, { status: admin.status });
  }

  const limited = await enforceContentRateLimit(request, admin.user.id);
  if (limited) {
    return limited;
  }

  logApiEvent(request, { route: 'admin.content.put', event: 'request' });

  try {
    const body = await request.json();
    const { slug, title, category, tags, description, content, published } = body;

    if (!slug) {
      return NextResponse.json({ ok: false, error: 'نامک الزامی است.' }, { status: 400 });
    }

    const validSlug = safeSlug(slug);
    if (!validSlug) {
      return NextResponse.json(
        { ok: false, error: 'نامک فقط شامل حروف، اعداد، خط تیره و زیرخط باشد.' },
        { status: 400 },
      );
    }

    const contentDir = getContentDir();
    const fs = require('node:fs/promises');
    const pathMod = require('node:path');
    const filePath = pathMod.join(contentDir, `${validSlug}.md`);

    const resolvedDir = pathMod.resolve(contentDir);
    if (!pathMod.resolve(filePath).startsWith(resolvedDir)) {
      return NextResponse.json({ ok: false, error: 'مسیر نامعتبر است.' }, { status: 400 });
    }

    let existingContent = '';
    try {
      existingContent = await fs.readFile(filePath, 'utf-8');
    } catch {
      return NextResponse.json({ ok: false, error: 'پست یافت نشد.' }, { status: 404 });
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
      `title: "${(title ?? fm.match(/title:\s*"?([^"\n]+)"?/)?.[1] ?? validSlug).replace(/"/g, '\\"')}"`,
      `slug: "${validSlug}"`,
      `date: "${date}"`,
      `author: "${author}"`,
      `category: "${(category ?? fm.match(/category:\s*"?([^"\n]+)"?/)?.[1] ?? 'عمومی').replace(/"/g, '\\"')}"`,
      `tags: [${(tags ?? []).map((t: string) => `"${String(t).replace(/"/g, '\\"')}"`).join(', ')}]`,
      `description: "${(description ?? fm.match(/description:\s*"?([^"\n]+)"?/)?.[1] ?? '').replace(/"/g, '\\"')}"`,
      `coverImage: "${coverImage}"`,
      `published: ${published ?? fm.includes('published: true')}`,
      '---',
      '',
      content ?? existingBody,
    ].join('\n');

    const willBePublished = published ?? fm.includes('published: true');

    await fs.writeFile(filePath, newFm, 'utf-8');

    try {
      const { query } = await import('@/lib/server/db');
      await query(
        'INSERT INTO admin_audit_log (action, user_id, user_name, details) VALUES ($1, $2, $3, $4)',
        ['content_update', admin.user.id, admin.user.email, `محتوا بروزرسانی شد: ${validSlug}`],
      );
    } catch {
      // audit log is best-effort
    }

    if (willBePublished) {
      try {
        const { broadcastPushNotification } = await import('@/lib/server/push');
        await broadcastPushNotification(
          JSON.stringify({
            title: 'مطلب جدید در جعبه ابزار فارسی',
            body: title ?? fm.match(/title:\s*"?([^"\n]+)"?/)?.[1] ?? validSlug,
            url: `/blog/${validSlug}`,
            icon: '/icons/icon-192.png',
            badge: '/icons/badge-72.png',
            timestamp: Date.now(),
          }),
        );
      } catch {
        // push is best-effort
      }
    }

    return NextResponse.json({ ok: true, slug: validSlug });
  } catch {
    return NextResponse.json({ ok: false, error: 'خطا در بروزرسانی پست.' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const corsError = denyIfNotAdmin(request);
  if (corsError) {
    return corsError;
  }

  const admin = await requireAdminFromRequest(request);
  if (!admin.ok) {
    return NextResponse.json({ ok: false }, { status: admin.status });
  }

  const limited = await enforceContentRateLimit(request, admin.user.id);
  if (limited) {
    return limited;
  }

  logApiEvent(request, { route: 'admin.content.patch', event: 'request' });

  try {
    const body = await request.json();
    const { action, slugs } = body;

    if (!action || !Array.isArray(slugs) || slugs.length === 0) {
      return NextResponse.json(
        { ok: false, error: 'اکشن و نامک‌ها الزامی هستند.' },
        { status: 400 },
      );
    }

    if (!['publish', 'unpublish', 'delete'].includes(action)) {
      return NextResponse.json({ ok: false, error: 'اکشن نامعتبر است.' }, { status: 400 });
    }

    const contentDir = getContentDir();
    const fs = require('node:fs/promises');
    const pathMod = require('node:path');
    const resolvedDir = pathMod.resolve(contentDir);

    let processed = 0;
    for (const slug of slugs) {
      const validSlug = safeSlug(slug);
      if (!validSlug) {
        continue;
      }
      const filePath = pathMod.join(contentDir, `${validSlug}.md`);
      if (!pathMod.resolve(filePath).startsWith(resolvedDir)) {
        continue;
      }
      try {
        let content = await fs.readFile(filePath, 'utf-8');

        if (action === 'publish') {
          content = content.replace('published: false', 'published: true');
          await fs.writeFile(filePath, content, 'utf-8');
          processed++;
          try {
            const { broadcastPushNotification } = await import('@/lib/server/push');
            const titleMatch = content.match(/title:\s*"?([^"\n]+)"?/);
            await broadcastPushNotification(
              JSON.stringify({
                title: 'مطلب جدید در جعبه ابزار فارسی',
                body: titleMatch?.[1] ?? validSlug,
                url: `/blog/${validSlug}`,
                icon: '/icons/icon-192.png',
                badge: '/icons/badge-72.png',
                timestamp: Date.now(),
              }),
            );
          } catch {
            // push is best-effort
          }
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

    try {
      const { query } = await import('@/lib/server/db');
      await query(
        'INSERT INTO admin_audit_log (action, user_id, user_name, details) VALUES ($1, $2, $3, $4)',
        [
          'content_update',
          admin.user.id,
          admin.user.email,
          `${action} روی ${processed} پست اعمال شد`,
        ],
      );
    } catch {
      // audit log is best-effort
    }

    return NextResponse.json({ ok: true, processed });
  } catch {
    return NextResponse.json({ ok: false, error: 'خطا در عملیات انبوه.' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const corsError = denyIfNotAdmin(request);
  if (corsError) {
    return corsError;
  }

  const admin = await requireAdminFromRequest(request);
  if (!admin.ok) {
    return NextResponse.json({ ok: false }, { status: admin.status });
  }

  const limited = await enforceContentRateLimit(request, admin.user.id);
  if (limited) {
    return limited;
  }

  logApiEvent(request, { route: 'admin.content.delete', event: 'request' });

  try {
    const body = await request.json();
    const { slug } = body;

    if (!slug) {
      return NextResponse.json({ ok: false, error: 'نامک الزامی است.' }, { status: 400 });
    }

    const validSlug = safeSlug(slug);
    if (!validSlug) {
      return NextResponse.json(
        { ok: false, error: 'نامک فقط شامل حروف، اعداد، خط تیره و زیرخط باشد.' },
        { status: 400 },
      );
    }

    const contentDir = getContentDir();
    const fs = require('node:fs/promises');
    const pathMod = require('node:path');
    const filePath = pathMod.join(contentDir, `${validSlug}.md`);

    const resolvedDir = pathMod.resolve(contentDir);
    if (!pathMod.resolve(filePath).startsWith(resolvedDir)) {
      return NextResponse.json({ ok: false, error: 'مسیر نامعتبر است.' }, { status: 400 });
    }

    await fs.unlink(filePath);

    try {
      const { query } = await import('@/lib/server/db');
      await query(
        'INSERT INTO admin_audit_log (action, user_id, user_name, details) VALUES ($1, $2, $3, $4)',
        ['content_update', admin.user.id, admin.user.email, `پست حذف شد: ${validSlug}`],
      );
    } catch {
      // audit log is best-effort
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: 'خطا در حذف پست.' }, { status: 500 });
  }
}
