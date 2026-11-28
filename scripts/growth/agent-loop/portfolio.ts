import { createHash, randomUUID } from 'node:crypto';
import {
  linkSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  renameSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs';
import { join } from 'node:path';

export interface PortfolioPaths {
  backlog: string;
  state: string;
  runtime: string;
}

interface Task {
  task_id: string;
  project: string;
  status: string;
  priority: string;
  dependencies: string[];
  duplicate_fingerprint: string;
  approval_required: boolean;
  deployment_required: boolean;
}

type Mode = 'RUNNING' | 'PAUSED' | 'STOPPED' | 'EMERGENCY_STOP';
type Control = 'pause' | 'resume' | 'stop' | 'emergency-stop' | 'clear-emergency';

const pilotTask = 'OPS-002';
const idPattern = /^[A-Z0-9]+(?:-[A-Z0-9]+)+$/;

function missing(error: unknown, code: string): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === code;
}

function readJson(path: string): unknown {
  const stat = lstatSync(path);
  if (!stat.isFile() || stat.size > 2_000_000) throw new Error('Invalid portfolio file');
  return JSON.parse(readFileSync(path, 'utf8').replace(/^\uFEFF/, '')) as unknown;
}

function object(value: unknown): Record<string, unknown> {
  if (value === null || typeof value !== 'object' || Array.isArray(value))
    throw new Error('Invalid portfolio object');
  return value as Record<string, unknown>;
}

function strings(value: unknown): string[] {
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string'))
    throw new Error('Invalid portfolio list');
  return value as string[];
}

function taskFrom(value: unknown): Task {
  const raw = object(value);
  const {
    task_id,
    project,
    status,
    priority,
    duplicate_fingerprint,
    approval_required,
    deployment_required,
  } = raw;
  if (
    typeof task_id !== 'string' ||
    !idPattern.test(task_id) ||
    task_id.length > 80 ||
    typeof project !== 'string' ||
    !/^[a-z0-9-]{1,80}$/.test(project) ||
    typeof status !== 'string' ||
    !/^[A-Z_]{1,32}$/.test(status) ||
    typeof priority !== 'string' ||
    !/^(P[0-3]|HOLD)$/.test(priority) ||
    typeof duplicate_fingerprint !== 'string' ||
    duplicate_fingerprint.length === 0 ||
    duplicate_fingerprint.length > 200 ||
    typeof approval_required !== 'boolean' ||
    typeof deployment_required !== 'boolean'
  ) {
    throw new Error('Invalid task fields');
  }
  return {
    task_id,
    project,
    status,
    priority,
    duplicate_fingerprint,
    approval_required,
    deployment_required,
    dependencies: strings(raw['dependencies']),
  };
}

function readInputs(paths: PortfolioPaths) {
  const source = object(readJson(paths.backlog));
  const state = object(readJson(paths.state));
  if (!Array.isArray(source['tasks']) || source['tasks'].length > 500)
    throw new Error('Invalid portfolio task list');
  const tasks = source['tasks'].map(taskFrom);
  const byId = new Map(tasks.map((task) => [task.task_id, task]));
  if (
    byId.size !== tasks.length ||
    new Set(tasks.map((task) => task.duplicate_fingerprint)).size !== tasks.length
  ) {
    throw new Error('Duplicate portfolio task');
  }
  const done = new Set<string>();
  const visiting = new Set<string>();
  function visit(id: string) {
    if (done.has(id)) return;
    const task = byId.get(id);
    if (!task || visiting.has(id)) throw new Error('Invalid portfolio dependency graph');
    visiting.add(id);
    task.dependencies.forEach(visit);
    visiting.delete(id);
    done.add(id);
  }
  tasks.forEach((task) => visit(task.task_id));
  const order = strings(state['preferred_order']);
  if (new Set(order).size !== order.length || order.some((id) => !byId.has(id)))
    throw new Error('Invalid portfolio ordering');
  const paused = new Set(strings(state['paused_projects'] ?? []));
  if (!Array.isArray(state['claims'] ?? [])) throw new Error('Invalid portfolio claims');
  const claims = new Set(
    ((state['claims'] ?? []) as unknown[]).map((claim) => {
      const id = object(claim)['task_id'];
      if (typeof id !== 'string' || !byId.has(id)) throw new Error('Invalid portfolio claim');
      return id;
    }),
  );
  return { tasks, byId, paused, order, claims };
}

function controlFile(paths: PortfolioPaths) {
  return join(paths.runtime, 'control.json');
}

function mode(paths: PortfolioPaths): Mode {
  try {
    const raw = object(readJson(controlFile(paths)))['mode'];
    if (raw === 'RUNNING' || raw === 'PAUSED' || raw === 'STOPPED' || raw === 'EMERGENCY_STOP')
      return raw;
    throw new Error('Invalid portfolio control state');
  } catch (error) {
    if (missing(error, 'ENOENT')) return 'RUNNING';
    throw error;
  }
}

function ensureRuntime(paths: PortfolioPaths) {
  mkdirSync(paths.runtime, { recursive: true });
  if (!lstatSync(paths.runtime).isDirectory())
    throw new Error('Invalid portfolio runtime directory');
}

function publish(path: string, value: unknown, replace: boolean): boolean {
  const temporary = `${path}.${randomUUID()}.tmp`;
  writeFileSync(temporary, JSON.stringify(value) + '\n', { flag: 'wx', flush: true, mode: 0o600 });
  try {
    if (replace) renameSync(temporary, path);
    else linkSync(temporary, path);
    return true;
  } catch (error) {
    if (!replace && missing(error, 'EEXIST')) return false;
    throw error;
  } finally {
    try {
      unlinkSync(temporary);
    } catch (error) {
      if (!missing(error, 'ENOENT')) throw error;
    }
  }
}

export function controlPortfolio(paths: PortfolioPaths, action: Control): Mode {
  const current = mode(paths);
  if (current === 'EMERGENCY_STOP' && action !== 'clear-emergency' && action !== 'emergency-stop') {
    throw new Error('Emergency stop must be explicitly cleared first');
  }
  const next = {
    pause: 'PAUSED',
    stop: 'STOPPED',
    resume: 'RUNNING',
    'emergency-stop': 'EMERGENCY_STOP',
    'clear-emergency': 'STOPPED',
  } as const;
  ensureRuntime(paths);
  publish(controlFile(paths), { mode: next[action] }, true);
  return next[action];
}

function receiptPath(paths: PortfolioPaths, task: Task): string {
  const key = createHash('sha256')
    .update('portfolio-contract/v1\0')
    .update(JSON.stringify([task.task_id, task.project, task.duplicate_fingerprint]))
    .digest('hex');
  return join(paths.runtime, `receipt-${key}.json`);
}

function hasReceipt(paths: PortfolioPaths, task: Task): boolean {
  try {
    const receipt = object(readJson(receiptPath(paths, task)));
    if (
      receipt['taskId'] !== task.task_id ||
      receipt['status'] !== 'COMPLETED' ||
      receipt['provider'] !== 'local' ||
      receipt['costUsd'] !== 0 ||
      typeof receipt['completedAt'] !== 'string' ||
      !Number.isFinite(Date.parse(receipt['completedAt']))
    ) {
      throw new Error('Invalid portfolio receipt');
    }
    return true;
  } catch (error) {
    if (missing(error, 'ENOENT')) return false;
    throw error;
  }
}

function route(paths: PortfolioPaths, input: ReturnType<typeof readInputs>, task: Task) {
  if (
    task.status !== 'READY_FOR_REVIEW' ||
    task.priority === 'HOLD' ||
    input.paused.has(task.project) ||
    !input.order.includes(task.task_id)
  )
    return 'SKIPPED';
  if (task.approval_required || task.deployment_required) return 'WAITING_FOR_OWNER';
  if (input.claims.has(task.task_id)) return 'CLAIMED';
  if (task.dependencies.some((id) => input.byId.get(id)?.status !== 'DONE_VERIFIED'))
    return 'BLOCKED';
  if (task.task_id !== pilotTask || task.project !== 'persiantoolbox') return 'BLOCKED';
  return hasReceipt(paths, task) ? 'RECORDED' : 'READY';
}

export function inspectPortfolio(paths: PortfolioPaths) {
  const input = readInputs(paths);
  return {
    mode: mode(paths),
    tasks: input.tasks.map((task) => ({ id: task.task_id, status: route(paths, input, task) })),
    adapters: {
      local: 'READY',
      codex: 'MANUAL_ONLY',
      gemini: 'BILLING_UNVERIFIED',
      opencode: 'ISOLATION_REQUIRED',
    },
    costLimitUsd: 0,
  };
}

export function runPortfolioCycle(paths: PortfolioPaths) {
  const current = mode(paths);
  if (current !== 'RUNNING') return { status: current };
  const input = readInputs(paths);
  // Validation itself is deterministic and has no side effect. The receipt is
  // published exclusively, so interrupted or concurrent probes cannot publish twice.
  const task = input.order
    .map((id) => input.byId.get(id))
    .find((candidate) => candidate && route(paths, input, candidate) === 'READY');
  if (!task) return { status: 'IDLE' };
  ensureRuntime(paths);
  const updatedMode = mode(paths);
  if (updatedMode !== 'RUNNING') return { status: updatedMode };
  const receipt = {
    status: 'COMPLETED',
    taskId: task.task_id,
    provider: 'local',
    costUsd: 0,
    completedAt: new Date().toISOString(),
  } as const;
  if (!publish(receiptPath(paths, task), receipt, false)) return { status: 'IDLE' };
  return receipt;
}
