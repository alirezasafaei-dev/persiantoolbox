import { afterEach, describe, expect, it, vi } from 'vitest';
import { scheduleDeferredTask } from '@/shared/utils/runtime/scheduleDeferredTask';

type IdleDeadlineLike = {
  didTimeout: boolean;
  timeRemaining: () => number;
};

describe('scheduleDeferredTask', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();

    if (typeof window !== 'undefined') {
      Object.defineProperty(window, 'requestIdleCallback', {
        configurable: true,
        value: undefined,
      });
      Object.defineProperty(window, 'cancelIdleCallback', {
        configurable: true,
        value: undefined,
      });
    }
  });

  it('runs exactly once when idle callback succeeds before max wait', () => {
    vi.useFakeTimers();

    const requestIdleCallback = vi.fn(
      (_callback: (deadline: IdleDeadlineLike) => void, options?: { timeout: number }) => {
        expect(options?.timeout).toBe(120);
        return 13;
      },
    );
    const cancelIdleCallback = vi.fn();

    Object.defineProperty(window, 'requestIdleCallback', {
      configurable: true,
      value: requestIdleCallback,
    });
    Object.defineProperty(window, 'cancelIdleCallback', {
      configurable: true,
      value: cancelIdleCallback,
    });

    const task = vi.fn();
    scheduleDeferredTask(task, {
      idleTimeoutMs: 120,
      maxWaitMs: 300,
      fallbackDelayMs: 20,
    });

    expect(requestIdleCallback).toHaveBeenCalledTimes(1);
    expect(task).not.toHaveBeenCalled();

    const idleCallback = requestIdleCallback.mock.calls[0]?.[0] as
      | ((deadline: IdleDeadlineLike) => void)
      | undefined;
    idleCallback?.({ didTimeout: false, timeRemaining: () => 16 });
    expect(task).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(400);
    expect(task).toHaveBeenCalledTimes(1);
    expect(cancelIdleCallback).toHaveBeenCalledWith(13);
  });

  it('waits for load when document is still loading', () => {
    vi.useFakeTimers();
    vi.spyOn(document, 'readyState', 'get').mockReturnValue('loading');

    const task = vi.fn();
    scheduleDeferredTask(task, {
      fallbackDelayMs: 40,
      maxWaitMs: 300,
    });

    window.dispatchEvent(new Event('load'));
    vi.advanceTimersByTime(39);
    expect(task).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(task).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(400);
    expect(task).toHaveBeenCalledTimes(1);
  });

  it('runs at max wait when load never fires', () => {
    vi.useFakeTimers();
    vi.spyOn(document, 'readyState', 'get').mockReturnValue('loading');

    const task = vi.fn();
    scheduleDeferredTask(task, {
      fallbackDelayMs: 500,
      maxWaitMs: 120,
    });

    vi.advanceTimersByTime(119);
    expect(task).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(task).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(1000);
    expect(task).toHaveBeenCalledTimes(1);
  });

  it('cancels pending work and prevents execution', () => {
    vi.useFakeTimers();

    const requestIdleCallback = vi.fn((callback: (deadline: IdleDeadlineLike) => void) => {
      void callback;
      return 99;
    });
    const cancelIdleCallback = vi.fn();

    Object.defineProperty(window, 'requestIdleCallback', {
      configurable: true,
      value: requestIdleCallback,
    });
    Object.defineProperty(window, 'cancelIdleCallback', {
      configurable: true,
      value: cancelIdleCallback,
    });

    const task = vi.fn();
    const cancel = scheduleDeferredTask(task, {
      maxWaitMs: 150,
    });

    cancel();
    const idleCallback = requestIdleCallback.mock.calls[0]?.[0] as
      | ((deadline: IdleDeadlineLike) => void)
      | undefined;
    idleCallback?.({ didTimeout: true, timeRemaining: () => 0 });
    vi.advanceTimersByTime(500);

    expect(task).not.toHaveBeenCalled();
    expect(cancelIdleCallback).toHaveBeenCalledWith(99);
  });
});
