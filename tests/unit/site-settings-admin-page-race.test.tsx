import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import SiteSettingsAdminPage from '@/components/features/monetization/SiteSettingsAdminPage';

type MockResponsePayload = {
  ok?: boolean;
  settings?: {
    developerName: string;
    developerBrandText: string;
    orderUrl: string | null;
    portfolioUrl: string | null;
  };
  errors?: string[];
};

function jsonResponse(payload: MockResponsePayload, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

describe('SiteSettingsAdminPage load-race behavior', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('keeps form locked during load and persists edited developerName after load', async () => {
    let resolveLoad: ((value: Response) => void) | null = null;
    const loadPromise = new Promise<Response>((resolve) => {
      resolveLoad = resolve;
    });

    const fetchMock = vi
      .fn()
      .mockImplementationOnce(async () => loadPromise)
      .mockImplementationOnce(async (_input: RequestInfo | URL, init?: RequestInit) => {
        const body = JSON.parse(String(init?.body ?? '{}')) as {
          developerName?: string;
          developerBrandText?: string;
          orderUrl?: string | null;
          portfolioUrl?: string | null;
        };
        return jsonResponse({
          ok: true,
          settings: {
            developerName: body.developerName ?? 'Missing',
            developerBrandText: body.developerBrandText ?? 'Missing',
            orderUrl: body.orderUrl ?? null,
            portfolioUrl: body.portfolioUrl ?? null,
          },
        });
      });

    vi.stubGlobal('fetch', fetchMock);

    render(<SiteSettingsAdminPage />);

    const saveButton = screen.getByRole('button', { name: 'ذخیره تنظیمات' });
    expect(saveButton).toBeDisabled();
    expect(screen.getByLabelText('نام توسعه‌دهنده')).toBeDisabled();

    if (!resolveLoad) {
      throw new Error('load resolver is not ready');
    }
    (resolveLoad as (value: Response) => void)(
      jsonResponse({
        ok: true,
        settings: {
          developerName: 'Loaded Name',
          developerBrandText: 'Loaded Brand',
          orderUrl: null,
          portfolioUrl: null,
        },
      }),
    );

    await waitFor(() => {
      expect(saveButton).toBeEnabled();
    });

    const user = userEvent.setup();
    await user.clear(screen.getByLabelText('نام توسعه‌دهنده'));
    await user.type(screen.getByLabelText('نام توسعه‌دهنده'), 'Race Safe Name');
    await user.clear(screen.getByLabelText('متن برند'));
    await user.type(screen.getByLabelText('متن برند'), 'Brand after load');
    await user.clear(screen.getByLabelText('لینک ثبت سفارش'));
    await user.type(screen.getByLabelText('لینک ثبت سفارش'), 'https://example.com/order');

    await user.click(saveButton);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    const secondCall = fetchMock.mock.calls[1];
    if (!secondCall) {
      throw new Error('missing save call');
    }
    const putInit = secondCall[1] as RequestInit | undefined;
    const putBody = JSON.parse(String(putInit?.body ?? '{}')) as { developerName?: string };
    expect(putBody.developerName).toBe('Race Safe Name');
  });
});
