import { NextResponse } from 'next/server';
import { requireAdminFromRequest } from '@/lib/server/adminAuth';
import { logApiEvent } from '@/lib/server/request-observability';
import { query } from '@/lib/server/db';
import { isSameOrigin } from '@/lib/server/csrf';
import { execSync, execFileSync } from 'node:child_process';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type ActionResponse = { ok: true; data: unknown } | { ok: false; reason: string };

async function getDBStats() {
  const tables = await query<{
    table_name: string;
    row_estimate: string;
    total_size: string;
    table_size: string;
    index_size: string;
  }>(`
    SELECT
      relname AS table_name,
      n_live_tup AS row_estimate,
      pg_size_pretty(pg_total_relation_size(c.oid)) AS total_size,
      pg_size_pretty(pg_table_size(c.oid)) AS table_size,
      pg_size_pretty(pg_indexes_size(c.oid)) AS index_size
    FROM pg_stat_user_tables
    JOIN pg_class c ON c.oid = pg_stat_user_tables.relid
    ORDER BY pg_total_relation_size(c.oid) DESC
  `);

  const pool = await query<{ count: string }>(`
    SELECT count(*) AS count
    FROM pg_stat_activity
    WHERE state = 'active' AND datname = current_database()
  `);

  const dbSize = await query<{ size: string }>(`
    SELECT pg_size_pretty(pg_database_size(current_database())) AS size
  `);

  return {
    tables: tables.rows,
    activeConnections: Number(pool.rows[0]?.count ?? 0),
    totalSize: dbSize.rows[0]?.size ?? 'نامشخص',
  };
}

function getCacheStats() {
  let nextCacheSize = 0;
  try {
    const { readdirSync, statSync } = require('node:fs');
    const { join } = require('node:path');
    const cacheDir = join(process.cwd(), '.next', 'cache');
    const walk = (dir: string) => {
      try {
        readdirSync(dir);
      } catch {
        return;
      }
      for (const f of readdirSync(dir)) {
        const fp = join(dir, f);
        const s = statSync(fp);
        if (s.isDirectory()) {
          walk(fp);
        } else {
          nextCacheSize += s.size;
        }
      }
    };
    walk(cacheDir);
  } catch {
    /* no cache dir */
  }

  return {
    nextCacheMB: Math.round((nextCacheSize / 1024 / 1024) * 10) / 10,
  };
}

function getProcessList() {
  try {
    const output = execSync('pm2 jlist 2>/dev/null || echo "[]"', {
      encoding: 'utf-8',
      timeout: 5000,
    });
    const procs = JSON.parse(output) as Array<{
      name: string;
      pm_id: number;
      pm2_env: {
        status: string;
        pm_uptime: number;
        restart_time: number;
        node_version: string;
        exec_mode: string;
      };
      monit: { cpu: number; memory: number };
    }>;
    return procs.map((p) => ({
      name: p.name,
      id: p.pm_id,
      status: p.pm2_env.status,
      cpu: p.monit.cpu,
      memoryMB: Math.round(p.monit.memory / 1024 / 1024),
      uptime: p.pm2_env.pm_uptime,
      restarts: p.pm2_env.restart_time,
      nodeVersion: p.pm2_env.node_version,
      mode: p.pm2_env.exec_mode,
    }));
  } catch {
    return [];
  }
}

function getSafeEnvVars() {
  const result: Record<string, { status: string }> = {};
  const requiredVars = [
    'DATABASE_URL',
    'NEXTAUTH_SECRET',
    'OPS_DASHBOARD_TOKEN',
    'POSTGRES_PASSWORD',
    'ADMIN_EMAIL_ALLOWLIST',
    'ZARINPAL_MERCHANT_ID',
    'ANALYTICS_INGEST_SECRET',
    'SESSION_TTL_DAYS',
    'FEATURE_ACCOUNT_ENABLED',
    'FEATURE_DASHBOARD_ENABLED',
    'FEATURE_CHECKOUT_ENABLED',
    'FEATURE_ADMIN_SITE_SETTINGS_ENABLED',
    'FEATURE_ADMIN_MONETIZATION_ENABLED',
    'NEXT_PUBLIC_SITE_URL',
    'NEXT_PUBLIC_GA4_ID',
    'NEXT_PUBLIC_GTM_ID',
    'NEXT_PUBLIC_ANALYTICS_ID',
    'NODE_ENV',
    'PORT',
  ];
  for (const key of requiredVars) {
    const val = process.env[key];
    if (val === undefined) {
      result[key] = { status: 'missing' };
    } else if (val === '') {
      result[key] = { status: 'empty' };
    } else {
      result[key] = { status: 'configured' };
    }
  }
  return result;
}

function performPM2Action(action: string, target: string) {
  const allowed = ['restart', 'stop', 'delete', 'start', 'reload', 'describe'];
  if (!allowed.includes(action)) {
    throw new Error('عملیات PM2 مجاز نیست');
  }
  const safeTarget = target.replace(/[^a-zA-Z0-9_.-]/g, '');
  if (!safeTarget) {
    throw new Error('نام process نامعتبر است');
  }
  const output = execFileSync('pm2', [action, safeTarget], {
    encoding: 'utf-8',
    timeout: 15000,
  });
  return output;
}

export async function GET(request: Request) {
  logApiEvent(request, { route: '/api/admin/ops/actions', event: 'request' });

  try {
    const admin = await requireAdminFromRequest(request);
    if (!admin.ok) {
      return NextResponse.json(
        { ok: false, reason: `ADMIN_AUTH:${admin.status}` },
        { status: admin.status },
      );
    }

    const url = new URL(request.url);
    const section = url.searchParams.get('section') ?? 'all';

    const data: Record<string, unknown> = {};

    if (section === 'all' || section === 'db') {
      try {
        data['db'] = await getDBStats();
      } catch (e) {
        data['db'] = { error: e instanceof Error ? e.message : 'خطا' };
      }
    }
    if (section === 'all' || section === 'cache') {
      data['cache'] = getCacheStats();
    }
    if (section === 'all' || section === 'processes') {
      data['processes'] = getProcessList();
    }
    if (section === 'all' || section === 'env') {
      data['env'] = getSafeEnvVars();
    }

    logApiEvent(request, { route: '/api/admin/ops/actions', event: 'response', status: 200 });
    return NextResponse.json({ ok: true, data } satisfies ActionResponse);
  } catch (error) {
    return NextResponse.json(
      { ok: false, reason: error instanceof Error ? error.message : 'INTERNAL_ERROR' },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  logApiEvent(request, { route: '/api/admin/ops/actions', event: 'request' });

  if (!isSameOrigin(request)) {
    return NextResponse.json(
      { ok: false, reason: 'درخواست از مبدأ نامعتبر است.' },
      { status: 403 },
    );
  }

  try {
    const admin = await requireAdminFromRequest(request);
    if (!admin.ok) {
      return NextResponse.json(
        { ok: false, reason: `ADMIN_AUTH:${admin.status}` },
        { status: admin.status },
      );
    }

    const body = (await request.json()) as { action: string; target?: string };

    if (body.action === 'clear-cache') {
      try {
        execSync('rm -rf .next/cache', { timeout: 10000 });
        return NextResponse.json({ ok: true, data: { message: 'کش با موفقیت پاک شد' } });
      } catch (e) {
        return NextResponse.json(
          { ok: false, reason: e instanceof Error ? e.message : 'خطا در پاکسازی کش' },
          { status: 500 },
        );
      }
    }

    if (body.action === 'test-email') {
      return NextResponse.json(
        {
          ok: false,
          reason:
            'ارسال ایمیل آزمایشی نیاز به پیکربندی SMTP دارد. لطفاً SMTP را در تنظیمات سایت پیکربندی کنید.',
        },
        { status: 501 },
      );
    }

    if (body.action === 'pm2-action') {
      if (!body.target) {
        return NextResponse.json({ ok: false, reason: 'target الزامی است' }, { status: 400 });
      }
      try {
        const parts = body.target.split(' ');
        const actionName = parts[0] ?? '';
        const targetName = parts.slice(1).join(' ');
        const result = performPM2Action(actionName, targetName);
        return NextResponse.json({ ok: true, data: { output: result } });
      } catch (e) {
        return NextResponse.json(
          { ok: false, reason: e instanceof Error ? e.message : 'خطا در عملیات PM2' },
          { status: 500 },
        );
      }
    }

    return NextResponse.json({ ok: false, reason: 'عملیات نامعتبر' }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { ok: false, reason: error instanceof Error ? error.message : 'INTERNAL_ERROR' },
      { status: 500 },
    );
  }
}
