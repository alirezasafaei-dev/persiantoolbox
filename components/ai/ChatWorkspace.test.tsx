import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { act, cleanup } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ChatWorkspace from '@/components/ai/ChatWorkspace';

const showToast = vi.fn();

vi.mock('@/shared/ui/toast-context', () => ({
  useToast: () => ({ showToast }),
}));

beforeEach(() => {
  localStorage.clear();
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  showToast.mockReset();
  vi.unstubAllGlobals();
});

describe('ChatWorkspace', () => {
  it('switches away from a pending request, restores its draft and discards the late reply', async () => {
    let resolve!: (value: Response) => void;
    vi.stubGlobal(
      'fetch',
      vi.fn(
        () =>
          new Promise<Response>((done) => {
            resolve = done;
          }),
      ),
    );
    render(<ChatWorkspace enabled />);
    fireEvent.change(screen.getByLabelText('پیام شما'), { target: { value: 'پیش‌نویس اول' } });
    fireEvent.click(screen.getByRole('button', { name: 'ارسال پیام' }));
    fireEvent.click(screen.getByRole('button', { name: 'گفت‌وگوی جدید' }));
    expect(screen.getByLabelText('پیام شما')).toHaveValue('');
    expect(screen.getByRole('alert')).toHaveTextContent('ممکن است سهمیه مصرف شده باشد');
    await act(async () => {
      resolve(new Response(JSON.stringify({ reply: 'نباید وارد گفت‌وگوی جدید شود' })));
    });
    expect(screen.queryByText('نباید وارد گفت‌وگوی جدید شود')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'پیش‌نویس اول' }));
    expect(screen.getByLabelText('پیام شما')).toHaveValue('پیش‌نویس اول');
  });
  it('honors IME and Shift+Enter and guards rapid duplicate submissions', async () => {
    const fetchMock = vi.fn(() => new Promise<Response>(() => {}));
    vi.stubGlobal('fetch', fetchMock);
    render(<ChatWorkspace enabled />);
    const input = screen.getByLabelText('پیام شما');
    fireEvent.change(input, { target: { value: 'ترکیب فارسی English' } });
    fireEvent.keyDown(input, { key: 'Enter', isComposing: true });
    fireEvent.keyDown(input, { key: 'Enter', shiftKey: true });
    expect(fetchMock).not.toHaveBeenCalled();
    fireEvent.keyDown(input, { key: 'Enter' });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(fetchMock).toHaveBeenCalledOnce();
  });
  it('times out without retrying and restores the prompt', async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn(() => new Promise<Response>(() => {}));
    vi.stubGlobal('fetch', fetchMock);
    render(<ChatWorkspace enabled />);
    fireEvent.change(screen.getByLabelText('پیام شما'), { target: { value: 'منتظر' } });
    fireEvent.click(screen.getByRole('button', { name: 'ارسال پیام' }));
    await act(() => vi.advanceTimersByTimeAsync(35_001));
    expect(screen.getByLabelText('پیام شما')).toHaveValue('منتظر');
    expect(screen.getByRole('alert')).toHaveTextContent('زمان انتظار');
    expect(fetchMock).toHaveBeenCalledOnce();
  });
  it('cancels on unmount', () => {
    let signal: AbortSignal | undefined;
    vi.stubGlobal(
      'fetch',
      vi.fn((_url: string, init: RequestInit) => {
        signal = init.signal as AbortSignal;
        return new Promise<Response>(() => {});
      }),
    );
    const { unmount } = render(<ChatWorkspace enabled />);
    fireEvent.change(screen.getByLabelText('پیام شما'), { target: { value: 'متن' } });
    fireEvent.click(screen.getByRole('button', { name: 'ارسال پیام' }));
    unmount();
    expect(signal?.aborted).toBe(true);
  });
  it('restores a stopped draft and ignores a late response', async () => {
    let resolve!: (value: Response) => void;
    vi.stubGlobal(
      'fetch',
      vi.fn(
        () =>
          new Promise<Response>((done) => {
            resolve = done;
          }),
      ),
    );
    render(<ChatWorkspace enabled />);
    fireEvent.change(screen.getByLabelText('پیام شما'), { target: { value: 'پیام متوقف شده' } });
    fireEvent.click(screen.getByRole('button', { name: 'ارسال پیام' }));
    fireEvent.click(screen.getByRole('button', { name: 'توقف پاسخ' }));
    expect(screen.getByLabelText('پیام شما')).toHaveValue('پیام متوقف شده');
    resolve(new Response(JSON.stringify({ reply: 'پاسخ دیرهنگام' })));
    await waitFor(() => expect(screen.queryByText('پاسخ دیرهنگام')).not.toBeInTheDocument());
  });

  it('does not display arbitrary upstream errors or retry automatically', async () => {
    const fetchMock = vi.fn(
      async () =>
        new Response(JSON.stringify({ error: 'private upstream detail' }), { status: 503 }),
    );
    vi.stubGlobal('fetch', fetchMock);
    render(<ChatWorkspace enabled />);
    fireEvent.change(screen.getByLabelText('پیام شما'), { target: { value: 'متن بازیابی' } });
    fireEvent.click(screen.getByRole('button', { name: 'ارسال پیام' }));
    await screen.findByRole('alert');
    expect(screen.queryByText('private upstream detail')).not.toBeInTheDocument();
    expect(screen.getByLabelText('پیام شما')).toHaveValue('متن بازیابی');
    expect(fetchMock).toHaveBeenCalledOnce();
  });
  it('renders a Persian accessible disabled state without sending requests', () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    render(<ChatWorkspace enabled={false} />);

    expect(
      screen.getByRole('region', { name: 'گفت‌وگو با دستیار هوش مصنوعی' }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('پیام شما')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'ارسال پیام' })).toBeDisabled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('supports keyboard submission, Persian responses, copying and a new conversation', async () => {
    const fetchMock = vi.fn(
      async () =>
        new Response(JSON.stringify({ reply: 'هوش مصنوعی از داده‌ها الگو یاد می‌گیرد.' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
    );
    const writeText = vi.fn(async () => undefined);
    vi.stubGlobal('fetch', fetchMock);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });
    render(<ChatWorkspace enabled />);

    const input = screen.getByLabelText('پیام شما');
    fireEvent.change(input, { target: { value: 'هوش مصنوعی چیست؟' } });
    fireEvent.keyDown(input, { key: 'Enter', shiftKey: false });

    expect(await screen.findByText('هوش مصنوعی از داده‌ها الگو یاد می‌گیرد.')).toHaveAttribute(
      'dir',
      'auto',
    );
    expect(fetchMock).toHaveBeenCalledOnce();
    const [, requestInit] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(JSON.parse(requestInit.body as string)).toEqual({
      messages: [{ role: 'user', content: 'هوش مصنوعی چیست؟' }],
    });

    fireEvent.click(screen.getByRole('button', { name: 'کپی پاسخ' }));
    await waitFor(() =>
      expect(writeText).toHaveBeenCalledWith('هوش مصنوعی از داده‌ها الگو یاد می‌گیرد.'),
    );
    expect(showToast).toHaveBeenCalledWith('کپی شد');

    fireEvent.click(screen.getByRole('button', { name: 'گفت‌وگوی جدید' }));
    expect(screen.queryByText('هوش مصنوعی از داده‌ها الگو یاد می‌گیرد.')).not.toBeInTheDocument();
    expect(screen.getByText('چه کمکی از دستم برمیاد؟')).toBeInTheDocument();
  });
});
