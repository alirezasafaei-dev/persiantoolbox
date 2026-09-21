import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ServiceWorkerRegistration from '@/components/ui/ServiceWorkerRegistration';
import { POPUP_TIMING } from '@/lib/client/popupEngagement';
import {
  ANALYTICS_CONSENT_EVENT,
  writeAnalyticsConsent,
  type AnalyticsConsentState,
} from '@/shared/consent/analyticsConsent';

const rejectedConsent: AnalyticsConsentState = {
  ad_storage: false,
  ad_user_data: false,
  ad_personalization: false,
  analytics_storage: false,
  version: 'v2',
};

const acceptedConsent: AnalyticsConsentState = {
  ad_storage: true,
  ad_user_data: true,
  ad_personalization: true,
  analytics_storage: true,
  version: 'v2',
};

function dispatchInstallPrompt(outcome: 'accepted' | 'dismissed' = 'dismissed') {
  const event = new Event('beforeinstallprompt', { cancelable: true }) as Event & {
    prompt: ReturnType<typeof vi.fn>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
  };
  event.prompt = vi.fn().mockResolvedValue(undefined);
  event.userChoice = Promise.resolve({ outcome });
  act(() => window.dispatchEvent(event));
  return event;
}

async function passInstallDelay() {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(POPUP_TIMING.PWA_INSTALL_DELAY_MS);
  });
}

describe('ServiceWorkerRegistration consent coordination', () => {
  const originalServiceWorker = Object.getOwnPropertyDescriptor(navigator, 'serviceWorker');

  beforeEach(() => {
    vi.useFakeTimers();
    window.localStorage.clear();
    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: {
        register: vi.fn().mockResolvedValue({ scope: '/' }),
      },
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    window.localStorage.clear();
    if (originalServiceWorker) {
      Object.defineProperty(navigator, 'serviceWorker', originalServiceWorker);
    } else {
      Reflect.deleteProperty(navigator, 'serviceWorker');
    }
  });

  it('keeps install hidden while consent is unknown after the delay', async () => {
    render(<ServiceWorkerRegistration />);
    dispatchInstallPrompt();

    await passInstallDelay();

    expect(screen.queryByText('نصب اپلیکیشن')).not.toBeInTheDocument();
  });

  it.each([
    ['accepted', acceptedConsent],
    ['rejected', rejectedConsent],
  ] as const)('shows install after consent is %s and the delay has passed', async (_, consent) => {
    render(<ServiceWorkerRegistration />);
    dispatchInstallPrompt();
    await passInstallDelay();
    expect(screen.queryByText('نصب اپلیکیشن')).not.toBeInTheDocument();

    act(() => writeAnalyticsConsent(consent));

    expect(screen.getByText('نصب اپلیکیشن')).toBeVisible();
  });

  it('keeps a previously dismissed install invitation hidden', async () => {
    window.localStorage.setItem('pt-consent', JSON.stringify(rejectedConsent));
    window.localStorage.setItem('pwa-install-dismissed', '1');
    render(<ServiceWorkerRegistration />);
    dispatchInstallPrompt();

    await passInstallDelay();

    expect(screen.queryByText('نصب اپلیکیشن')).not.toBeInTheDocument();
  });

  it('cleans up visible install UI after appinstalled', async () => {
    window.localStorage.setItem('pt-consent', JSON.stringify(rejectedConsent));
    render(<ServiceWorkerRegistration />);
    dispatchInstallPrompt('accepted');
    await passInstallDelay();
    expect(screen.getByText('نصب اپلیکیشن')).toBeVisible();

    act(() => window.dispatchEvent(new Event('appinstalled')));

    expect(screen.queryByText('نصب اپلیکیشن')).not.toBeInTheDocument();
    expect(window.localStorage.getItem('pwa-install-dismissed')).toBe('1');
  });

  it('does not crash or show install when storage reads fail', async () => {
    const getItem = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('storage unavailable');
    });
    render(<ServiceWorkerRegistration />);
    dispatchInstallPrompt();

    await passInstallDelay();

    expect(screen.queryByText('نصب اپلیکیشن')).not.toBeInTheDocument();
    getItem.mockRestore();
  });

  it('removes the consent event listener on unmount', () => {
    const addEventListener = vi.spyOn(window, 'addEventListener');
    const removeEventListener = vi.spyOn(window, 'removeEventListener');
    const { unmount } = render(<ServiceWorkerRegistration />);
    const consentListener = addEventListener.mock.calls.find(
      ([eventName]) => String(eventName) === ANALYTICS_CONSENT_EVENT,
    )?.[1];

    expect(consentListener).toBeDefined();
    unmount();
    expect(removeEventListener).toHaveBeenCalledWith(ANALYTICS_CONSENT_EVENT, consentListener);
    addEventListener.mockRestore();
    removeEventListener.mockRestore();
  });
});
