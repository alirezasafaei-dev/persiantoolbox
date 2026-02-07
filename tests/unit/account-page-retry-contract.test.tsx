import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import AccountPage from '@/components/features/monetization/AccountPage';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

function activeSubscriptionPayload() {
  return {
    user: { id: 'u-1', email: 'user@example.com', createdAt: Date.now() - 1000 },
    subscription: {
      id: 'sub-1',
      planId: 'basic_monthly',
      status: 'active',
      startedAt: Date.now() - 86_400_000,
      expiresAt: Date.now() + 86_400_000,
    },
  };
}

describe('AccountPage retry/state contract', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('shows login section when /api/auth/me returns 401', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: false, status: 401 });
    vi.stubGlobal('fetch', fetchMock);

    render(<AccountPage />);

    expect(await screen.findByRole('heading', { name: 'ورود یا ثبت‌نام' })).toBeInTheDocument();
  });

  it('shows account load error when /api/auth/me returns 500', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: false, status: 500 });
    vi.stubGlobal('fetch', fetchMock);

    render(<AccountPage />);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'بارگذاری اطلاعات حساب با خطا مواجه شد.',
    );
  });

  it('shows account recovery notice after retrying transient /api/auth/me failure', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 500 })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => activeSubscriptionPayload(),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ entries: [] }),
      });

    vi.stubGlobal('fetch', fetchMock);

    render(<AccountPage />);

    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: 'تلاش مجدد' }));

    expect(
      await screen.findByText('ارتباط مجدد برقرار شد و اطلاعات حساب بازیابی شد.'),
    ).toBeInTheDocument();
  });

  it('shows account load error when /api/auth/me request times out', async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn().mockImplementation((_url: string, init?: RequestInit) => {
      const signal = init?.signal;
      return new Promise((_resolve, reject) => {
        signal?.addEventListener('abort', () => {
          reject(new DOMException('Aborted', 'AbortError'));
        });
      });
    });
    vi.stubGlobal('fetch', fetchMock);

    render(<AccountPage />);

    await act(async () => {
      vi.advanceTimersByTime(8500);
    });
    vi.useRealTimers();

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'بارگذاری اطلاعات حساب با خطا مواجه شد.',
    );
  });

  it('shows history error when /api/history returns 402 for active subscription', async () => {
    const fetchMock = vi.fn().mockImplementation(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('/api/auth/me')) {
        return {
          ok: true,
          status: 200,
          json: async () => activeSubscriptionPayload(),
        };
      }
      if (url.includes('/api/history')) {
        return {
          ok: false,
          status: 402,
        };
      }
      return {
        ok: false,
        status: 500,
      };
    });

    vi.stubGlobal('fetch', fetchMock);

    render(<AccountPage />);

    expect(await screen.findByRole('alert')).toHaveTextContent('دریافت تاریخچه با خطا مواجه شد.');
  });
});
