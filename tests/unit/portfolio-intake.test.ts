import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  controlPortfolio,
  runPortfolioCycle,
  inspectPortfolio,
} from '../../scripts/growth/agent-loop/portfolio.js';

const roots: string[] = [];
const task = (task_id: string, extra = {}) => ({
  task_id,
  status: 'READY_FOR_REVIEW',
  priority: 'P1',
  project: 'persiantoolbox',
  duplicate_fingerprint: task_id,
  dependencies: [],
  approval_required: false,
  deployment_required: false,
  ...extra,
});
function fixture(tasks = [task('OPS-002')], paused_projects: string[] = []) {
  const root = mkdtempSync(join(tmpdir(), 'asdev-portfolio-'));
  roots.push(root);
  const backlog = join(root, 'MASTER_BACKLOG.json');
  const state = join(root, 'ACTIVE_STATE.json');
  const runtime = join(root, 'runtime');
  writeFileSync(backlog, JSON.stringify({ tasks }));
  writeFileSync(
    state,
    JSON.stringify({ preferred_order: tasks.map((x) => x.task_id), paused_projects }),
  );
  return { backlog, state, runtime };
}
afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});

describe('zero-spend portfolio intake', () => {
  it('runs a fixed validation once and leaves the canonical input unchanged', () => {
    const f = fixture();
    const original = readFileSync(f.backlog, 'utf8');
    expect(runPortfolioCycle(f)).toMatchObject({
      status: 'COMPLETED',
      taskId: 'OPS-002',
      provider: 'local',
      costUsd: 0,
    });
    expect(runPortfolioCycle(f)).toMatchObject({ status: 'IDLE' });
    expect(readFileSync(f.backlog, 'utf8')).toBe(original);
  });
  it('continues past approval gates and rejects unrecognized execution requests', () => {
    const f = fixture([
      task('EXTERNAL-001', { approval_required: true }),
      task('UNKNOWN-002', { command: 'deploy' }),
      task('OPS-002', { command: 'deploy' }),
    ]);
    expect(inspectPortfolio(f).tasks.map((t) => t.status)).toEqual([
      'WAITING_FOR_OWNER',
      'BLOCKED',
      'READY',
    ]);
    expect(runPortfolioCycle(f)).toMatchObject({ status: 'COMPLETED', provider: 'local' });
  });
  it('avoids dependencies, deployment and paused projects', () => {
    const f = fixture([
      task('FINISHED-1', { status: 'DONE_VERIFIED' }),
      task('OPS-002', { dependencies: ['FINISHED-1'], deployment_required: true }),
    ]);
    expect(inspectPortfolio(f).tasks[1]?.status).toBe('WAITING_FOR_OWNER');
    expect(runPortfolioCycle(fixture([task('OPS-002')], ['persiantoolbox'])).status).toBe('IDLE');
  });
  it('persists pause, stop and emergency stop with explicit emergency reset', () => {
    const f = fixture();
    controlPortfolio(f, 'pause');
    expect(runPortfolioCycle(f).status).toBe('PAUSED');
    controlPortfolio(f, 'stop');
    expect(runPortfolioCycle(f).status).toBe('STOPPED');
    controlPortfolio(f, 'emergency-stop');
    expect(() => controlPortfolio(f, 'resume')).toThrow();
    expect(runPortfolioCycle(f).status).toBe('EMERGENCY_STOP');
    controlPortfolio(f, 'clear-emergency');
    expect(runPortfolioCycle(f).status).toBe('STOPPED');
    controlPortfolio(f, 'resume');
    expect(runPortfolioCycle(f).status).toBe('COMPLETED');
  });
  it('rejects malformed JSON, duplicate fingerprints and dependency cycles', () => {
    const f = fixture();
    writeFileSync(f.backlog, 'invalid');
    expect(() => runPortfolioCycle(f)).toThrow();
    expect(() =>
      inspectPortfolio(
        fixture([task('OPS-002'), task('X-001', { duplicate_fingerprint: 'OPS-002' })]),
      ),
    ).toThrow();
    expect(() =>
      inspectPortfolio(
        fixture([
          task('OPS-002', { dependencies: ['X-001'] }),
          task('X-001', { dependencies: ['OPS-002'] }),
        ]),
      ),
    ).toThrow();
  });
  it('excludes worker content from projection and stops on corrupt control state', () => {
    const f = fixture([task('OPS-002', { next_action: 'secret-marker-should-not-leak' })]);
    expect(JSON.stringify(inspectPortfolio(f))).not.toContain('secret-marker');
    controlPortfolio(f, 'pause');
    writeFileSync(join(f.runtime, 'control.json'), 'invalid');
    expect(() => runPortfolioCycle(f)).toThrow();
  });
});
