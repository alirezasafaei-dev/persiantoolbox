import { describe, it, expect, beforeEach } from 'vitest';
import { agentLogger } from '@/lib/agent-logger';

describe('AgentLogger', () => {
  beforeEach(() => {
    agentLogger.clearLogs();
  });

  it('starts with empty logs', () => {
    expect(agentLogger.getLogs()).toHaveLength(0);
  });

  it('logs info entries', () => {
    agentLogger.info('test-agent', 'test-op', 'test message');
    const logs = agentLogger.getLogs();
    expect(logs).toHaveLength(1);
    expect(logs[0]?.level).toBe('info');
    expect(logs[0]?.agent).toBe('test-agent');
    expect(logs[0]?.operation).toBe('test-op');
    expect(logs[0]?.message).toBe('test message');
  });

  it('logs warn entries', () => {
    agentLogger.warn('test-agent', 'test-op', 'warning message');
    const logs = agentLogger.getLogs();
    expect(logs[0]?.level).toBe('warn');
  });

  it('logs error entries', () => {
    agentLogger.error('test-agent', 'test-op', 'error message');
    const logs = agentLogger.getLogs();
    expect(logs[0]?.level).toBe('error');
  });

  it('logs debug entries', () => {
    agentLogger.debug('test-agent', 'test-op', 'debug message');
    const logs = agentLogger.getLogs();
    expect(logs[0]?.level).toBe('debug');
  });

  it('filters logs by level', () => {
    agentLogger.info('a', 'op', 'msg1');
    agentLogger.error('a', 'op', 'msg2');
    agentLogger.warn('a', 'op', 'msg3');
    agentLogger.info('a', 'op', 'msg4');

    const infoLogs = agentLogger.getLogs('info');
    expect(infoLogs).toHaveLength(2);
    expect(infoLogs.every((l) => l.level === 'info')).toBe(true);
  });

  it('supports details and duration', () => {
    agentLogger.log('info', 'agent', 'op', 'msg', { key: 'value' }, 42);
    const logs = agentLogger.getLogs();
    expect(logs[0]?.details).toEqual({ key: 'value' });
    expect(logs[0]?.duration).toBe(42);
  });

  it('provides correct metrics', () => {
    agentLogger.info('a', 'op', 'i1');
    agentLogger.error('a', 'op', 'e1');
    agentLogger.error('a', 'op', 'e2');
    agentLogger.warn('a', 'op', 'w1');
    agentLogger.debug('a', 'op', 'd1');

    const metrics = agentLogger.getMetrics();
    expect(metrics.total).toBe(5);
    expect(metrics.errors).toBe(2);
    expect(metrics.warnings).toBe(1);
    expect(metrics.info).toBe(1);
    expect(metrics.debug).toBe(1);
  });

  it('returns error logs via getErrorLogs', () => {
    agentLogger.info('a', 'op', 'msg');
    agentLogger.error('a', 'op', 'err');
    const errors = agentLogger.getErrorLogs();
    expect(errors).toHaveLength(1);
    expect(errors[0]?.level).toBe('error');
  });

  it('returns recent logs limited by count', () => {
    for (let i = 0; i < 10; i++) {
      agentLogger.info('a', 'op', `msg${i}`);
    }
    const recent = agentLogger.getRecentLogs(3);
    expect(recent).toHaveLength(3);
    expect(recent[0]?.message).toBe('msg7');
    expect(recent[2]?.message).toBe('msg9');
  });

  it('enforces max log limit', () => {
    for (let i = 0; i < 1100; i++) {
      agentLogger.info('a', 'op', `msg${i}`);
    }
    expect(agentLogger.getLogs().length).toBeLessThanOrEqual(1000);
  });

  it('clears logs', () => {
    agentLogger.info('a', 'op', 'msg');
    agentLogger.clearLogs();
    expect(agentLogger.getLogs()).toHaveLength(0);
  });
});
