import { NextResponse } from 'next/server';
import { requireAdminFromRequest } from '@/lib/server/adminAuth';
import { logApiEvent } from '@/lib/server/request-observability';
import { toolsRegistry } from '@/lib/tools-registry';
import { getToolFlags, setToolFlag, bulkSetToolFlags } from '@/lib/server/toolFlagsStorage';
import { isSameOrigin } from '@/lib/server/csrf';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    const adminError = await requireAdminFromRequest(request);
    if (!adminError.ok) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: adminError.status });
    }

    logApiEvent(request, { route: 'admin.tools.get', event: 'request' });

    const onlyTools = toolsRegistry.filter((t) => t.kind === 'tool');
    const flags = await getToolFlags();

    let usageMap: Record<string, number> = {};
    try {
      const { query } = await import('@/lib/server/db');
      const paths = onlyTools.map((t) => t.path);
      if (paths.length > 0) {
        const placeholders = paths.map((_, i) => `$${i + 1}`).join(',');
        const result = await query(
          `SELECT key as path, count FROM analytics_counters WHERE kind = 'path' AND key IN (${placeholders})`,
          paths,
        );
        for (const row of result.rows as Record<string, unknown>[]) {
          usageMap[row['path'] as string] = Number(row['count'] ?? 0);
        }
      }
    } catch {
      usageMap = {};
    }

    const tools = onlyTools.map((tool) => ({
      id: tool.id,
      title: tool.title.split(' - ')[0],
      path: tool.path,
      category: tool.category?.name ?? 'نامشخص',
      categoryId: tool.category?.id ?? '',
      description: tool.description,
      enabled: flags.get(tool.id) ?? true,
      tier: tool.tier,
      indexable: tool.indexable,
      lastModified: tool.lastModified,
      usage: usageMap[tool.path] ?? 0,
    }));

    return NextResponse.json({ tools });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'خطای داخلی' },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const adminError = await requireAdminFromRequest(request);
  if (!adminError.ok) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: adminError.status });
  }

  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  const { action, toolId, toolIds, enabled } = body as {
    action?: string;
    toolId?: string;
    toolIds?: string[];
    enabled?: boolean;
  };

  if (action === 'toggle' && toolId && typeof enabled === 'boolean') {
    const success = await setToolFlag(toolId, enabled);
    if (!success) {
      return NextResponse.json({ error: 'Failed to update tool flag' }, { status: 500 });
    }
    logApiEvent(request, {
      route: 'admin.tools.post',
      event: 'response',
      status: 200,
      details: { action: 'toggle', toolId, enabled },
    });
    return NextResponse.json({ ok: true });
  }

  if (action === 'bulk' && Array.isArray(toolIds) && typeof enabled === 'boolean') {
    const success = await bulkSetToolFlags(toolIds, enabled);
    if (!success) {
      return NextResponse.json({ error: 'Failed to bulk update tool flags' }, { status: 500 });
    }
    logApiEvent(request, {
      route: 'admin.tools.post',
      event: 'response',
      status: 200,
      details: { action: 'bulk', count: toolIds.length, enabled },
    });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
