import { existsSync, realpathSync } from 'node:fs';
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { controlPortfolio, inspectPortfolio, runPortfolioCycle } from './portfolio.js';

const controls = ['pause', 'resume', 'stop', 'emergency-stop', 'clear-emergency'] as const;
type Control = (typeof controls)[number];

function paths(directory: string, runtime: string) {
  const base = realpathSync(directory);
  let existing = resolve(runtime);
  const suffix: string[] = [];
  while (!existsSync(existing)) {
    suffix.unshift(basename(existing));
    const parent = dirname(existing);
    if (parent === existing) throw new Error('Runtime root unavailable');
    existing = parent;
  }
  const output = join(realpathSync(existing), ...suffix);
  const difference = relative(base, output);
  if (
    !difference ||
    (!isAbsolute(difference) && difference !== '..' && !difference.startsWith('..' + sep))
  ) {
    throw new Error('Runtime must be outside the canonical portfolio directory');
  }
  return {
    backlog: join(base, 'MASTER_BACKLOG.json'),
    state: join(base, 'ACTIVE_STATE.json'),
    runtime: output,
  };
}

export async function runPortfolioCommand(args: string[]): Promise<void> {
  const [action, directory, runtime, extra] = args;
  if (!action || !directory || !runtime || extra !== undefined)
    throw new Error('Invalid portfolio arguments');
  const input = paths(directory, runtime);
  const emit = (value: unknown) => console.log(JSON.stringify(value));
  if (
    action === 'status' ||
    action === 'queue' ||
    action === 'providers' ||
    action === 'doctor' ||
    action === 'budget' ||
    action === 'approvals'
  ) {
    emit(inspectPortfolio(input));
    return;
  }
  if (controls.includes(action as Control)) {
    emit({ status: controlPortfolio(input, action as Control) });
    return;
  }
  if (action === 'daily' || action === 'weekly') {
    const status = inspectPortfolio(input);
    const byStatus = new Map<string, number>();
    for (const task of status.tasks) {
      byStatus.set(task.status, (byStatus.get(task.status) ?? 0) + 1);
    }
    const labels: Record<string, string> = {
      RECORDED: 'اعتبارسنجی ثبت‌شده',
      READY: 'آماده اعتبارسنجی',
      CLAIMED: 'دارای claim',
      WAITING_FOR_OWNER: 'منتظر تصمیم مالک',
      BLOCKED: 'مسدود',
      SKIPPED: 'خارج از اجرای این چرخه',
    };
    console.log(action === 'daily' ? '# وضعیت روزانه سبد' : '# خلاصه مرور هفتگی سبد');
    console.log('حالت اجرا ' + status.mode);
    for (const [key, count] of byStatus) console.log('- ' + labels[key] + ' · ' + count);
    console.log('- مصرف مدل این مسیر صفر است. KPI، CI و نسخه زنده از پرونده پروژه‌ها بررسی شوند.');
    return;
  }
  if (action === 'run') {
    emit(runPortfolioCycle(input));
    return;
  }
  if (action === 'poll') {
    const stop = new AbortController();
    const interrupt = () => stop.abort();
    process.on('SIGINT', interrupt);
    process.on('SIGTERM', interrupt);
    try {
      for (let cycle = 0; cycle < 20 && !stop.signal.aborted; cycle += 1) {
        const result = runPortfolioCycle(input);
        emit(result);
        if (result.status !== 'COMPLETED' && result.status !== 'IDLE') break;
        if (cycle < 19) await delay(15_000, undefined, { signal: stop.signal });
      }
    } catch (error) {
      if (!stop.signal.aborted) throw error;
    } finally {
      process.off('SIGINT', interrupt);
      process.off('SIGTERM', interrupt);
    }
    return;
  }
  throw new Error('Unknown portfolio action');
}
