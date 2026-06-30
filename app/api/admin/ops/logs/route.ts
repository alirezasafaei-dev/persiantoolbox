import { NextResponse } from 'next/server';
import { requireAdminFromRequest } from '@/lib/server/adminAuth';
import { logApiEvent } from '@/lib/server/request-observability';
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type LogEntry = { timestamp: string; level: string; message: string; source: string };

function findLogFiles(): string[] {
  const cwd = process.cwd();
  const home = process.env['HOME'] ?? '/root';
  const candidates = [
    /* turbopackIgnore: true */ join(cwd, 'logs'),
    /* turbopackIgnore: true */ join(cwd, '.next', 'logs'),
    /* turbopackIgnore: true */ join('/var/log/pm2'),
    /* turbopackIgnore: true */ join(home, '.pm2', 'logs'),
  ];
  const found: string[] = [];
  for (const dir of candidates) {
    if (!existsSync(dir)) {
      continue;
    }
    try {
      const files = readdirSync(dir).filter(
        (f) => f.endsWith('.log') || f.endsWith('.out') || f.endsWith('.err'),
      );
      for (const f of files) {
        const fp = join(dir, f);
        try {
          if (statSync(fp).isFile()) {
            found.push(fp);
          }
        } catch {
          /* skip */
        }
      }
    } catch {
      /* skip */
    }
  }
  return found;
}

function parseLogLine(line: string, source: string): LogEntry | null {
  const trimmed = line.trim();
  if (!trimmed) {
    return null;
  }

  try {
    const parsed = JSON.parse(trimmed) as Record<string, unknown>;
    if (parsed['timestamp'] && parsed['level']) {
      return {
        timestamp: String(parsed['timestamp']),
        level: String(parsed['level']),
        message: (parsed['message'] as string) ?? trimmed,
        source,
      };
    }
  } catch {
    /* not JSON */
  }

  const tsMatch = trimmed.match(/^(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2})/);
  if (tsMatch) {
    const ts = tsMatch[1];
    if (!ts) {
      return null;
    }
    const levelMatch = trimmed.match(/\b(ERROR|WARN|INFO|DEBUG)\b/i);
    return {
      timestamp: ts,
      level: levelMatch?.[1]?.toUpperCase() ?? 'INFO',
      message: trimmed.slice(ts.length).trim(),
      source,
    };
  }

  return { timestamp: new Date().toISOString(), level: 'INFO', message: trimmed, source };
}

export async function GET(request: Request) {
  logApiEvent(request, { route: '/api/admin/ops/logs', event: 'request' });

  try {
    const admin = await requireAdminFromRequest(request);
    if (!admin.ok) {
      return NextResponse.json(
        { ok: false, reason: `ADMIN_AUTH:${admin.status}` },
        { status: admin.status },
      );
    }

    const url = new URL(request.url);
    const level = url.searchParams.get('level')?.toUpperCase() ?? 'ALL';
    const source = url.searchParams.get('source') ?? 'all';
    const limit = Math.min(Number(url.searchParams.get('limit') ?? '100'), 500);

    const logFiles = findLogFiles();
    const entries: LogEntry[] = [];

    for (const fp of logFiles) {
      const baseName = fp.split('/').pop() ?? fp;
      if (source !== 'all' && !baseName.toLowerCase().includes(source.toLowerCase())) {
        continue;
      }

      try {
        const content = readFileSync(fp, 'utf-8');
        const lines = content.split('\n').slice(-200);
        for (const line of lines) {
          const entry = parseLogLine(line, baseName);
          if (!entry) {
            continue;
          }
          if (level !== 'ALL' && entry.level !== level) {
            continue;
          }
          entries.push(entry);
        }
      } catch {
        /* skip unreadable files */
      }
    }

    entries.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
    const sliced = entries.slice(0, limit);

    logApiEvent(request, { route: '/api/admin/ops/logs', event: 'response', status: 200 });
    return NextResponse.json({
      ok: true,
      entries: sliced,
      sources: logFiles.map((f) => f.split('/').pop() ?? f),
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, reason: error instanceof Error ? error.message : 'INTERNAL_ERROR' },
      { status: 500 },
    );
  }
}
