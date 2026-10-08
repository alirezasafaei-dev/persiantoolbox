'use client';

import { useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { useToast } from '@/shared/ui/toast-context';
import type { ChatTurn } from '@/lib/ai/contracts';
import { boundedChatHistory } from '@/lib/ai/chat-history';

const suggestions = [
  'یک برنامه ساده برای یادگیری زبان انگلیسی بده',
  'این مفهوم را خیلی ساده و با مثال توضیح بده: هوش مصنوعی',
  'یک متن مودبانه برای درخواست مرخصی بنویس',
];

export default function ChatWorkspace({ enabled }: { enabled: boolean }) {
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [draft, setDraft] = useState('');
  const [waiting, setWaiting] = useState(false);
  const [error, setError] = useState('');
  const pending = useRef<AbortController | null>(null);
  const { showToast } = useToast();

  async function submit(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    const content = draft.trim();
    if (!enabled || waiting || !content) {
      return;
    }
    const sent: ChatTurn = { role: 'user', content };
    const history = boundedChatHistory(turns, sent);
    const controller = new AbortController();
    pending.current = controller;
    setWaiting(true);
    setError('');
    setDraft('');
    setTurns((previous) => [...previous, sent]);
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        cache: 'no-store',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
        signal: controller.signal,
      });
      const body = (await response.json()) as { reply?: unknown; error?: unknown };
      if (!response.ok || typeof body.reply !== 'string' || !body.reply.trim()) {
        throw new Error(typeof body.error === 'string' ? body.error : 'پاسخ دریافت نشد.');
      }
      setTurns((previous) => [...previous, { role: 'assistant', content: body.reply as string }]);
    } catch (failure) {
      if (!controller.signal.aborted) {
        setTurns(turns);
        setDraft(content);
        setError(failure instanceof Error ? failure.message : 'ارتباط برقرار نشد.');
      }
    } finally {
      pending.current = null;
      setWaiting(false);
    }
  }

  function reset() {
    pending.current?.abort();
    pending.current = null;
    setTurns([]);
    setDraft('');
    setError('');
    setWaiting(false);
  }

  function keyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      void submit();
    }
  }

  async function copyAnswer(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      showToast('کپی شد');
    } catch {
      showToast('کپی انجام نشد.', 'error');
    }
  }

  return (
    <section
      aria-label="گفت‌وگو با دستیار هوش مصنوعی"
      className="overflow-hidden rounded-3xl border border-(--border-light) bg-(--surface-1) shadow-subtle"
    >
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-(--border-light) px-5 py-4 sm:px-7">
        <div>
          <h2 className="font-bold text-(--text-primary)">دستیار فارسی</h2>
          <p className="mt-1 text-xs text-(--text-muted)">
            {enabled ? 'گفت‌وگوی آنلاین؛ سهمیه محدود رایگان' : 'در حال آماده‌سازی نسخه آزمایشی'}
          </p>
        </div>
        <button
          type="button"
          onClick={reset}
          disabled={turns.length === 0 && !waiting}
          className="rounded-lg border border-(--border-light) px-3 py-2 text-xs font-semibold text-(--text-secondary) transition hover:bg-(--surface-2) disabled:opacity-40"
        >
          گفت‌وگوی جدید
        </button>
      </header>

      <div
        className="min-h-80 space-y-4 px-4 py-6 sm:px-7"
        aria-live="polite"
        aria-relevant="additions"
      >
        {turns.length === 0 ? (
          <div className="mx-auto flex max-w-lg flex-col items-center gap-4 py-8 text-center">
            <span
              aria-hidden
              className="flex size-14 items-center justify-center rounded-2xl bg-[rgb(var(--color-primary-rgb)/0.09)] text-3xl"
            >
              ✦
            </span>
            <p className="text-lg font-bold text-(--text-primary)">چه کمکی از دستم برمیاد؟</p>
            <p className="text-sm leading-7 text-(--text-secondary)">
              سؤال بپرس، برای نوشتن کمک بگیر یا درباره موضوعی توضیح بخواه.
            </p>
            {enabled ? (
              <div className="flex flex-wrap justify-center gap-2">
                {suggestions.map((suggestion) => (
                  <button
                    type="button"
                    key={suggestion}
                    onClick={() => setDraft(suggestion)}
                    className="rounded-full border border-(--border-light) px-4 py-2 text-xs text-(--text-secondary) hover:border-primary"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        ) : (
          <ol className="space-y-5">
            {turns.map((turn, index) => (
              <li
                key={index}
                className={turn.role === 'user' ? 'flex justify-start' : 'flex justify-end'}
              >
                <div
                  className={
                    turn.role === 'user'
                      ? 'max-w-[88%] whitespace-pre-wrap rounded-2xl rounded-tr-sm bg-[rgb(var(--color-primary-rgb)/0.10)] px-4 py-3 text-sm leading-8 text-(--text-primary)'
                      : 'max-w-[94%] whitespace-pre-wrap rounded-2xl border border-(--border-light) bg-(--surface-2) px-4 py-3 text-sm leading-8 text-(--text-primary)'
                  }
                >
                  <div dir="auto">{turn.content}</div>
                  {turn.role === 'assistant' && (
                    <button
                      type="button"
                      onClick={() => void copyAnswer(turn.content)}
                      className="mt-3 rounded-md border border-(--border-light) px-3 py-1 text-xs hover:bg-(--surface-1)"
                    >
                      کپی پاسخ
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ol>
        )}
        {waiting ? (
          <p role="status" className="text-sm text-(--text-secondary)">
            در حال آماده‌کردن پاسخ…
          </p>
        ) : null}
      </div>

      <form
        onSubmit={(event) => void submit(event)}
        className="space-y-3 border-t border-(--border-light) p-4 sm:p-6"
      >
        {error ? (
          <p
            role="alert"
            className="rounded-lg bg-[rgb(var(--color-danger-rgb)/0.08)] px-4 py-3 text-sm text-(--color-danger)"
          >
            {error}
          </p>
        ) : null}
        <label htmlFor="ai-chat-input" className="sr-only">
          پیام شما
        </label>
        <textarea
          id="ai-chat-input"
          rows={3}
          maxLength={1800}
          dir="auto"
          disabled={!enabled || waiting}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={keyDown}
          placeholder={enabled ? 'پیامت رو اینجا بنویس…' : 'چت هنوز فعال نشده است'}
          className="w-full resize-y rounded-xl border border-(--border-light) bg-(--surface-2) p-4 text-sm leading-7 text-(--text-primary) outline-hidden focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-60"
        />
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs leading-5 text-(--text-muted)">
            متن پیام به ارائه‌دهنده هوش مصنوعی ارسال می‌شود. اطلاعات محرمانه نفرست.
          </p>
          <button
            type="submit"
            disabled={!enabled || waiting || !draft.trim()}
            className="shrink-0 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {waiting ? 'در حال پاسخ…' : 'ارسال پیام'}
          </button>
        </div>
      </form>
    </section>
  );
}
