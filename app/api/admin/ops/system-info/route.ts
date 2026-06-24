import { NextResponse } from 'next/server';
import { requireAdminFromRequest } from '@/lib/server/adminAuth';
import { logApiEvent } from '@/lib/server/request-observability';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type SystemInfo = {
  cpu: { model: string; cores: number; usagePercent: number; loadAvg: number[] };
  memory: { totalMB: number; usedMB: number; freeMB: number; usagePercent: number };
  disk: { totalGB: number; usedGB: number; freeGB: number; usagePercent: number };
  node: { version: string; uptime: number; pid: number };
  os: { platform: string; arch: string; hostname: string; release: string };
};

function getCPUUsage(): number {
  const cpus = require('node:os').cpus();
  let totalIdle = 0;
  let totalTick = 0;
  for (const cpu of cpus) {
    for (const type in cpu.times) {
      totalTick += cpu.times[type as keyof typeof cpu.times];
    }
    totalIdle += cpu.times.idle;
  }
  return Math.round((1 - totalIdle / totalTick) * 100);
}

export async function GET(request: Request) {
  logApiEvent(request, { route: '/api/admin/ops/system-info', event: 'request' });

  try {
    const admin = await requireAdminFromRequest(request);
    if (!admin.ok) {
      return NextResponse.json(
        { ok: false, reason: `ADMIN_AUTH:${admin.status}` },
        { status: admin.status },
      );
    }

    const os = require('node:os');
    const { execSync } = require('node:child_process');

    const totalMem = Math.round(os.totalmem() / 1024 / 1024);
    const freeMem = Math.round(os.freemem() / 1024 / 1024);
    const usedMem = totalMem - freeMem;

    let diskInfo = { totalGB: 0, usedGB: 0, freeGB: 0, usagePercent: 0 };
    try {
      const dfOutput = execSync('df -B1 / | tail -1', { encoding: 'utf-8', timeout: 5000 });
      const parts = dfOutput.trim().split(/\s+/);
      if (parts.length >= 4) {
        const total = Math.round(Number(parts[1]) / 1024 / 1024 / 1024);
        const used = Math.round(Number(parts[2]) / 1024 / 1024 / 1024);
        const free = Math.round(Number(parts[3]) / 1024 / 1024 / 1024);
        diskInfo = {
          totalGB: total,
          usedGB: used,
          freeGB: free,
          usagePercent: total > 0 ? Math.round((used / total) * 100) : 0,
        };
      }
    } catch {
      // disk info unavailable
    }

    const systemInfo: SystemInfo = {
      cpu: {
        model: os.cpus()[0]?.model ?? 'نامشخص',
        cores: os.cpus().length,
        usagePercent: getCPUUsage(),
        loadAvg: os.loadavg().map((l: number) => Math.round(l * 100) / 100),
      },
      memory: {
        totalMB: totalMem,
        usedMB: usedMem,
        freeMB: freeMem,
        usagePercent: Math.round((usedMem / totalMem) * 100),
      },
      disk: diskInfo,
      node: { version: process.version, uptime: Math.floor(process.uptime()), pid: process.pid },
      os: {
        platform: os.platform(),
        arch: os.arch(),
        hostname: os.hostname(),
        release: os.release(),
      },
    };

    logApiEvent(request, { route: '/api/admin/ops/system-info', event: 'response', status: 200 });
    return NextResponse.json({ ok: true, system: systemInfo });
  } catch (error) {
    return NextResponse.json(
      { ok: false, reason: error instanceof Error ? error.message : 'INTERNAL_ERROR' },
      { status: 500 },
    );
  }
}
