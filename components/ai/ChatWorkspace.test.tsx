import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ChatWorkspace from '@/components/ai/ChatWorkspace';

const showToast = vi.fn();

vi.mock('@/shared/ui/toast-context', () => ({
  useToast: () => ({ showToast }),
}));

afterEach(() => {
  showToast.mockReset();
  vi.unstubAllGlobals();
});

describe('ChatWorkspace', () => {
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
