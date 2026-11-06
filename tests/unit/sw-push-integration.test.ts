import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createContext, runInContext } from 'node:vm';
import { describe, expect, it, vi } from 'vitest';

function loadApplicationWorker() {
  const handlers = new Map<string, Array<(event: unknown) => void>>();
  const showNotification = vi.fn().mockResolvedValue(undefined);
  const openWindow = vi.fn().mockResolvedValue(undefined);
  const context = createContext({
    self: {
      addEventListener: (type: string, handler: (event: unknown) => void) => {
        handlers.set(type, [...(handlers.get(type) ?? []), handler]);
      },
      registration: { showNotification },
      location: { origin: 'https://example.test' },
      clients: { matchAll: vi.fn().mockResolvedValue([]), openWindow },
    },
  });
  runInContext(readFileSync(resolve(process.cwd(), 'public/sw.js'), 'utf8'), context);
  return { handlers, showNotification, openWindow };
}

describe('combined application worker event behavior', () => {
  it('retains offline/cache handlers and displays an incoming push once', async () => {
    const { handlers, showNotification } = loadApplicationWorker();
    expect(handlers.get('fetch')).toHaveLength(1);
    expect(handlers.get('message')).toHaveLength(1);
    expect(handlers.get('push')).toHaveLength(1);
    const pending: Promise<unknown>[] = [];
    handlers.get('push')?.[0]?.({
      data: { json: () => ({ title: 'Synthetic notice', body: 'Test message', url: '/tools' }) },
      waitUntil: (promise: Promise<unknown>) => pending.push(promise),
    });
    await Promise.all(pending);
    expect(showNotification).toHaveBeenCalledTimes(1);
    expect(showNotification).toHaveBeenCalledWith(
      'Synthetic notice',
      expect.objectContaining({
        body: 'Test message',
        data: expect.objectContaining({ url: '/tools' }),
      }),
    );
  });

  it('keeps notification click navigation attached to the same worker', async () => {
    const { handlers, openWindow } = loadApplicationWorker();
    expect(handlers.get('notificationclick')).toHaveLength(1);
    const close = vi.fn();
    const pending: Promise<unknown>[] = [];
    handlers.get('notificationclick')?.[0]?.({
      notification: { close, data: { url: '/tools' } },
      waitUntil: (promise: Promise<unknown>) => pending.push(promise),
    });
    await Promise.all(pending);
    expect(close).toHaveBeenCalledTimes(1);
    expect(openWindow).toHaveBeenCalledWith('/tools');
  });
});
