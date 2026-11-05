import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { usePushNotifications } from '@/shared/hooks/usePushNotifications';

describe('push subscription worker ownership', () => {
  const original = Object.getOwnPropertyDescriptor(navigator, 'serviceWorker');

  beforeEach(() => {
    vi.stubGlobal('PushManager', class {});
    vi.stubGlobal('Notification', { permission: 'granted', requestPermission: vi.fn() });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    if (original) {
      Object.defineProperty(navigator, 'serviceWorker', original);
    } else {
      Reflect.deleteProperty(navigator, 'serviceWorker');
    }
  });

  it('reads the existing subscription from the shared root registration without prompting', async () => {
    const subscription = { unsubscribe: vi.fn() };
    const registration = {
      pushManager: { getSubscription: vi.fn().mockResolvedValue(subscription) },
    };
    const register = vi.fn().mockResolvedValue(registration);
    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: { register, ready: Promise.resolve(registration) },
    });
    const { result } = renderHook(() => usePushNotifications());
    await waitFor(() => expect(result.current.isSubscribed).toBe(true));
    expect(register).toHaveBeenCalledWith('/sw.js');
    expect(registration.pushManager.getSubscription).toHaveBeenCalledTimes(1);
    expect(subscription.unsubscribe).not.toHaveBeenCalled();
    expect(Notification.requestPermission).not.toHaveBeenCalled();
  });
});
