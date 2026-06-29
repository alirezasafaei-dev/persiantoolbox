import { describe, it, expect, beforeEach, vi } from 'vitest';
import { errorTracker } from '@/lib/client/errorTracking';

describe('ErrorTracker', () => {
  beforeEach(() => {
    // Reset queue state
    vi.restoreAllMocks();
  });

  it('captures Error instances', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const error = new Error('test error');
    errorTracker.capture(error, { component: 'test' });
    expect(consoleSpy).toHaveBeenCalledWith('[ErrorTracker]', error, { component: 'test' });
    consoleSpy.mockRestore();
  });

  it('captures non-Error exceptions by wrapping in Error', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    errorTracker.captureException('string error', { action: 'test' });
    expect(consoleSpy).toHaveBeenCalledWith('[ErrorTracker]', expect.any(Error), {
      action: 'test',
    });
    consoleSpy.mockRestore();
  });

  it('captures Error exceptions directly', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const error = new Error('direct error');
    errorTracker.captureException(error, { action: 'direct' });
    expect(consoleSpy).toHaveBeenCalledWith('[ErrorTracker]', error, { action: 'direct' });
    consoleSpy.mockRestore();
  });

  it('captures messages via captureMessage', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    errorTracker.captureMessage('user message', { route: '/test' });
    expect(consoleSpy).toHaveBeenCalledWith(
      '[ErrorTracker]',
      expect.objectContaining({ message: 'user message' }),
      { route: '/test' },
    );
    consoleSpy.mockRestore();
  });
});
