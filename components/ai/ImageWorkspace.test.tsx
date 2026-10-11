import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ImageWorkspace from './ImageWorkspace';

const objectUrl = 'blob:fake-image-url';
const createObjectURL = vi.fn(() => objectUrl);
const revokeObjectURL = vi.fn();

beforeEach(() => {
  Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: createObjectURL });
  Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: revokeObjectURL });
  createObjectURL.mockClear();
  revokeObjectURL.mockClear();
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('ImageWorkspace privacy-first journey', () => {
  it('keeps disabled experience accessible and never sends requests', () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    render(<ImageWorkspace enabled={false} />);
    expect(screen.getByRole('region', { name: 'ساخت تصویر با هوش مصنوعی' })).toBeInTheDocument();
    expect(screen.getByLabelText('توضیح تصویر')).toBeDisabled();
    expect(screen.getByRole('checkbox', { name: /اجازه می‌دهم/ })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'ساخت تصویر' })).toBeDisabled();
    expect(screen.getByText(/فعلاً فعال نیست/)).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('requires a fresh consent and a non-empty prompt before any request', () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    render(<ImageWorkspace enabled />);
    const prompt = screen.getByLabelText('توضیح تصویر');
    const submit = screen.getByRole('button', { name: 'ساخت تصویر' });
    const consent = screen.getByRole('checkbox', { name: /اجازه می‌دهم/ });
    expect(submit).toBeDisabled();
    fireEvent.change(prompt, { target: { value: 'یک گل سرخ در نور روز' } });
    expect(submit).toBeDisabled();
    fireEvent.click(consent);
    expect(submit).toBeEnabled();
    fireEvent.change(prompt, { target: { value: '   ' } });
    expect(submit).toBeDisabled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('sends one JSON request only after consent; previews and downloads JPEG, clears old image', async () => {
    const fetchMock = vi.fn(
      async () =>
        new Response(new Uint8Array([255, 216, 255, 217]), {
          status: 200,
          headers: { 'content-type': 'image/jpeg' },
        }),
    );
    vi.stubGlobal('fetch', fetchMock);
    const { unmount } = render(<ImageWorkspace enabled />);
    fireEvent.change(screen.getByLabelText('توضیح تصویر'), { target: { value: '  آسمان آبی  ' } });
    fireEvent.click(screen.getByRole('checkbox', { name: /اجازه می‌دهم/ }));
    fireEvent.click(screen.getByRole('button', { name: 'ساخت تصویر' }));
    await waitFor(() =>
      expect(screen.getByRole('img', { name: /پیش‌نمایش تصویر ساخته‌شده/ })).toBeInTheDocument(),
    );
    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('/api/ai/image');
    expect(init.method).toBe('POST');
    expect(init.credentials).toBe('same-origin');
    expect(init.cache).toBe('no-store');
    expect(JSON.parse(String(init.body))).toEqual({ prompt: 'آسمان آبی', consent: true });
    expect(screen.getByRole('link', { name: 'دانلود تصویر' })).toHaveAttribute('href', objectUrl);
    expect(screen.getByRole('link', { name: 'دانلود تصویر' })).toHaveAttribute(
      'download',
      'persiantoolbox-ai-image.jpg',
    );
    unmount();
    expect(revokeObjectURL).toHaveBeenCalledWith(objectUrl);
  });

  it('does not retry or leak private upstream errors; retains prompt and consent', async () => {
    const fetchMock = vi.fn(
      async () =>
        new Response(JSON.stringify({ error: 'SECRET provider hostname and token' }), {
          status: 503,
          headers: { 'content-type': 'application/json' },
        }),
    );
    vi.stubGlobal('fetch', fetchMock);
    render(<ImageWorkspace enabled />);
    fireEvent.change(screen.getByLabelText('توضیح تصویر'), { target: { value: 'تصویر جنگل' } });
    fireEvent.click(screen.getByRole('checkbox', { name: /اجازه می‌دهم/ }));
    fireEvent.click(screen.getByRole('button', { name: 'ساخت تصویر' }));
    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
    expect(screen.getByRole('alert')).toHaveTextContent('در دسترس نیست');
    expect(screen.getByRole('alert')).not.toHaveTextContent('SECRET');
    expect(screen.getByLabelText('توضیح تصویر')).toHaveValue('تصویر جنگل');
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it('rejects bogus success payload, retaining prompt without image preview', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response('not an image', { status: 200, headers: { 'content-type': 'text/html' } }),
      ),
    );
    render(<ImageWorkspace enabled />);
    fireEvent.change(screen.getByLabelText('توضیح تصویر'), { target: { value: 'گل' } });
    fireEvent.click(screen.getByRole('checkbox', { name: /اجازه می‌دهم/ }));
    fireEvent.click(screen.getByRole('button', { name: 'ساخت تصویر' }));
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('معتبر'));
    expect(screen.queryByRole('img', { name: /پیش‌نمایش/ })).not.toBeInTheDocument();
    expect(createObjectURL).not.toHaveBeenCalled();
  });

  it('stops a pending request without retry and prevents late image display', async () => {
    let resolveResponse!: (response: Response) => void;
    const fetchMock = vi.fn(
      () =>
        new Promise<Response>((resolve) => {
          resolveResponse = resolve;
        }),
    );
    vi.stubGlobal('fetch', fetchMock);
    render(<ImageWorkspace enabled />);
    fireEvent.change(screen.getByLabelText('توضیح تصویر'), { target: { value: 'متن ذخیره نشود' } });
    fireEvent.click(screen.getByRole('checkbox', { name: /اجازه می‌دهم/ }));
    fireEvent.click(screen.getByRole('button', { name: 'ساخت تصویر' }));
    fireEvent.click(screen.getByRole('button', { name: 'توقف درخواست' }));
    expect(screen.getByRole('alert')).toHaveTextContent('ممکن است سهمیه');
    await act(async () => {
      resolveResponse(
        new Response(new Uint8Array([255, 216, 255, 217]), {
          status: 200,
          headers: { 'content-type': 'image/jpeg' },
        }),
      );
    });
    expect(screen.queryByRole('img', { name: /پیش‌نمایش/ })).not.toBeInTheDocument();
    expect(screen.getByLabelText('توضیح تصویر')).toHaveValue('متن ذخیره نشود');
    expect(fetchMock).toHaveBeenCalledOnce();
  });
});
