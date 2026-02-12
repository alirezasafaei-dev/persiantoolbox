import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import RecentHistoryCard from '@/components/features/history/RecentHistoryCard';

function setSessionCookie() {
  document.cookie = 'pt_session=test-token; path=/';
}

function clearSessionCookie() {
  document.cookie = 'pt_session=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
}

describe('RecentHistoryCard', () => {
  beforeEach(() => {
    clearSessionCookie();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('shows unauthorized state without session cookie', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    render(<RecentHistoryCard title="آخرین عملیات" />);

    expect(
      await screen.findByText('تاریخچه حساب کاربری در نسخه ۱.۱.۱ غیرفعال شده است.'),
    ).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('shows error state and retries successfully', async () => {
    setSessionCookie();
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 500 })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          entries: [
            {
              id: 'h1',
              tool: 'date-tools',
              inputSummary: '1404/01/01',
              outputSummary: '2025/03/21',
              createdAt: Date.now(),
            },
          ],
        }),
      });

    vi.stubGlobal('fetch', fetchMock);

    render(<RecentHistoryCard title="آخرین عملیات" />);

    expect(await screen.findByRole('alert')).toHaveTextContent('دریافت تاریخچه با خطا مواجه شد');

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'تلاش مجدد' }));

    await waitFor(() => {
      expect(screen.getByText('date-tools')).toBeInTheDocument();
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('shows unauthorized state when API returns 401', async () => {
    setSessionCookie();
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
    });
    vi.stubGlobal('fetch', fetchMock);

    render(<RecentHistoryCard title="آخرین عملیات" />);

    expect(
      await screen.findByText('تاریخچه حساب کاربری در نسخه ۱.۱.۱ غیرفعال شده است.'),
    ).toBeInTheDocument();
  });

  it('shows unauthorized state when API returns 402', async () => {
    setSessionCookie();
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 402,
    });
    vi.stubGlobal('fetch', fetchMock);

    render(<RecentHistoryCard title="آخرین عملیات" />);

    expect(
      await screen.findByText('تاریخچه حساب کاربری در نسخه ۱.۱.۱ غیرفعال شده است.'),
    ).toBeInTheDocument();
  });

  it('shows error state when history request times out', async () => {
    vi.useFakeTimers();
    setSessionCookie();
    const fetchMock = vi.fn().mockImplementation((_url: string, init?: RequestInit) => {
      const signal = init?.signal;
      return new Promise((_resolve, reject) => {
        signal?.addEventListener('abort', () => {
          reject(new DOMException('Aborted', 'AbortError'));
        });
      });
    });
    vi.stubGlobal('fetch', fetchMock);

    render(<RecentHistoryCard title="آخرین عملیات" />);

    await act(async () => {
      vi.advanceTimersByTime(8500);
    });
    vi.useRealTimers();

    expect(await screen.findByRole('alert')).toHaveTextContent('دریافت تاریخچه با خطا مواجه شد');
  });

  it('shows empty state when no history entries exist', async () => {
    setSessionCookie();
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ entries: [] }),
    });
    vi.stubGlobal('fetch', fetchMock);

    render(<RecentHistoryCard title="آخرین عملیات" />);

    expect(await screen.findByText('تاریخچه خالی است')).toBeInTheDocument();
  });
});
