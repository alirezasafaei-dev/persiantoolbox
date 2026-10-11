import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useConversations } from './useConversations';
import { LOCAL_CHAT_STORAGE } from '@/lib/ai/local-conversations';

beforeEach(() => {
  vi.restoreAllMocks();
  localStorage.clear();
});
afterEach(() => vi.useRealTimers());
describe('local history privacy', () => {
  it('does not store drafts by default, restores explicit consent, and erases on revocation', async () => {
    const { result, unmount } = renderHook(useConversations);
    act(() =>
      result.current.update(result.current.active.id, (c) => ({ ...c, draft: 'پیش‌نویس خصوصی' })),
    );
    expect(localStorage.getItem(LOCAL_CHAT_STORAGE)).toBeNull();
    act(() => result.current.setPersistence(true));
    await waitFor(() =>
      expect(localStorage.getItem(LOCAL_CHAT_STORAGE)).toContain('پیش‌نویس خصوصی'),
    );
    unmount();
    const restored = renderHook(useConversations);
    expect(restored.result.current.active.draft).toBe('پیش‌نویس خصوصی');
    act(() => restored.result.current.setPersistence(false));
    act(() => window.dispatchEvent(new Event('pagehide')));
    expect(localStorage.getItem(LOCAL_CHAT_STORAGE)).toBeNull();
    expect(restored.result.current.active.draft).toBe('پیش‌نویس خصوصی');
  });
  it('does not resurrect history revoked by another tab', () => {
    const { result } = renderHook(useConversations);
    act(() => result.current.setPersistence(true));
    act(() => {
      localStorage.removeItem(LOCAL_CHAT_STORAGE);
      window.dispatchEvent(
        new StorageEvent('storage', { key: LOCAL_CHAT_STORAGE, newValue: null }),
      );
    });
    act(() =>
      result.current.update(result.current.active.id, (c) => ({ ...c, draft: 'نباید ذخیره شود' })),
    );
    expect(result.current.persistent).toBe(false);
    expect(localStorage.getItem(LOCAL_CHAT_STORAGE)).toBeNull();
  });
  it('retains a pending prompt as draft, never restores a half exchange', () => {
    const { result, unmount } = renderHook(useConversations);
    act(() => result.current.setPersistence(true));
    act(() =>
      result.current.update(result.current.active.id, (c) => ({
        ...c,
        draft: '',
        turns: [{ role: 'user', content: 'در انتظار' }],
      })),
    );
    unmount();
    const restored = renderHook(useConversations);
    expect(restored.result.current.active.turns).toEqual([]);
    expect(restored.result.current.active.draft).toBe('در انتظار');
  });
  it('preserves drafts when switching, renames and deletes only the selected conversation', () => {
    const { result } = renderHook(useConversations);
    const original = result.current.active.id;
    act(() => result.current.update(original, (c) => ({ ...c, draft: 'اول', title: 'نام تازه' })));
    act(() => result.current.newConversation());
    const second = result.current.active.id;
    act(() => result.current.setActiveId(original));
    expect(result.current.active.draft).toBe('اول');
    expect(result.current.active.title).toBe('نام تازه');
    act(() => result.current.removeConversation(second));
    expect(result.current.conversations).toHaveLength(1);
    expect(result.current.active.id).toBe(original);
  });
  it('explicitly reports paused writes without pretending the saved copy was erased', async () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('denied');
    });
    const { result } = renderHook(useConversations);
    act(() => result.current.setPersistence(true));
    await waitFor(() => expect(result.current.storageNotice).toContain('ذخیره تغییرات متوقف'));
    expect(result.current.persistent).toBe(true);
  });
  it('does not clear or claim revocation when removal fails', async () => {
    const { result } = renderHook(useConversations);
    act(() =>
      result.current.update(result.current.active.id, (c) => ({ ...c, draft: 'باید حفظ شود' })),
    );
    act(() => result.current.setPersistence(true));
    await waitFor(() => expect(localStorage.getItem(LOCAL_CHAT_STORAGE)).toContain('باید حفظ شود'));
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new Error('denied');
    });
    act(() => result.current.clearAll());
    expect(result.current.active.draft).toBe('باید حفظ شود');
    expect(result.current.persistent).toBe(true);
    expect(result.current.storageNotice).toContain('حذف داده تأیید نشد');
    expect(localStorage.getItem(LOCAL_CHAT_STORAGE)).toContain('باید حفظ شود');
  });
  it('refuses to overwrite a newer cross-tab snapshot when re-enabled', () => {
    const { result } = renderHook(useConversations);
    act(() => {
      localStorage.setItem(LOCAL_CHAT_STORAGE, 'foreign snapshot');
      window.dispatchEvent(
        new StorageEvent('storage', { key: LOCAL_CHAT_STORAGE, newValue: 'foreign snapshot' }),
      );
    });
    act(() => result.current.setPersistence(true));
    expect(result.current.persistent).toBe(false);
    expect(localStorage.getItem(LOCAL_CHAT_STORAGE)).toBe('foreign snapshot');
  });
  it('coalesces a typing burst and flushes the current draft on pagehide', async () => {
    vi.useFakeTimers();
    const write = vi.spyOn(Storage.prototype, 'setItem');
    const { result } = renderHook(useConversations);
    act(() => result.current.setPersistence(true));
    for (const draft of ['ا', 'اب', 'ابج'])
      act(() => result.current.update(result.current.active.id, (c) => ({ ...c, draft })));
    expect(write).not.toHaveBeenCalled();
    await act(() => vi.advanceTimersByTimeAsync(251));
    expect(write).toHaveBeenCalledOnce();
    act(() =>
      result.current.update(result.current.active.id, (c) => ({ ...c, draft: 'آخرین متن' })),
    );
    act(() => window.dispatchEvent(new Event('pagehide')));
    expect(localStorage.getItem(LOCAL_CHAT_STORAGE)).toContain('آخرین متن');
  });
  it('keeps a valid previous snapshot after cap overflow and allows verified erasure', async () => {
    const { result } = renderHook(useConversations);
    act(() => result.current.setPersistence(true));
    await waitFor(() => expect(localStorage.getItem(LOCAL_CHAT_STORAGE)).not.toBeNull());
    const before = localStorage.getItem(LOCAL_CHAT_STORAGE);
    act(() =>
      result.current.update(result.current.active.id, (c) => ({
        ...c,
        turns: Array.from({ length: 100 }, (_, i) => ({
          role: i % 2 === 0 ? 'user' : 'assistant',
          content: 'x'.repeat(i % 2 === 0 ? 1800 : 20000),
        })),
      })),
    );
    await waitFor(() => expect(result.current.storageNotice).toContain('ذخیره تغییرات متوقف'));
    expect(localStorage.getItem(LOCAL_CHAT_STORAGE)).toBe(before);
    expect(result.current.persistent).toBe(true);
    act(() => result.current.setPersistence(false));
    expect(localStorage.getItem(LOCAL_CHAT_STORAGE)).toBeNull();
  });
});
