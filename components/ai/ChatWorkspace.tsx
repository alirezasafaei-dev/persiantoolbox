'use client';

import Link from 'next/link';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from 'react';
import { useToast } from '@/shared/ui/toast-context';
import type { ChatTurn } from '@/lib/ai/contracts';
import { boundedChatHistory } from '@/lib/ai/chat-history';
import ChatMarkdown from './ChatMarkdown';
import { useConversations } from './useConversations';
import './chat-workspace.css';

const suggestions = [
  'یک برنامه ساده برای یادگیری زبان انگلیسی بده',
  'این مفهوم را خیلی ساده و با مثال توضیح بده: هوش مصنوعی',
  'یک متن مودبانه برای درخواست مرخصی بنویس',
];
type Pending = {
  controller: AbortController;
  id: string;
  content: string;
  previous: ChatTurn[];
  timer: ReturnType<typeof setTimeout>;
};

export default function ChatWorkspace({ enabled }: { enabled: boolean }) {
  const sessions = useConversations();
  const { active, update } = sessions;
  const [waiting, setWaiting] = useState(false);
  const [error, setError] = useState('');
  const [announcement, setAnnouncement] = useState('');
  const [isDark, setIsDark] = useState(false);
  const [rename, setRename] = useState(false);
  const [confirmation, setConfirmation] = useState<{ label: string; action: () => void } | null>(
    null,
  );
  const confirmDialog = useRef<HTMLDialogElement>(null);
  const pending = useRef<Pending | null>(null);
  const input = useRef<HTMLTextAreaElement>(null);
  const transcript = useRef<HTMLDivElement>(null);
  const drawer = useRef<HTMLDialogElement>(null);
  const menu = useRef<HTMLButtonElement>(null);
  const { showToast } = useToast();
  const app = useRef<HTMLElement>(null);
  useEffect(() => {
    const viewport = window.visualViewport;
    const resize = () => {
      if (viewport?.scale === 1) {
        app.current?.style.setProperty('--ai-viewport-height', `${viewport.height}px`);
      } else {
        app.current?.style.removeProperty('--ai-viewport-height');
      }
    };
    resize();
    viewport?.addEventListener('resize', resize);
    return () => viewport?.removeEventListener('resize', resize);
  }, []);
  useEffect(() => {
    if (confirmation) {
      confirmDialog.current?.showModal();
    } else if (confirmDialog.current?.open) {
      confirmDialog.current.close();
    }
  }, [confirmation]);

  useEffect(() => {
    let dark = document.documentElement.classList.contains('dark');
    try {
      const stored = localStorage.getItem('theme');
      dark =
        stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches);
    } catch {
      /* memory-only theme */
    }
    document.documentElement.classList.toggle('dark', dark);
    document.documentElement.classList.toggle('light', !dark);
    setIsDark(dark);
    return () => {
      if (pending.current) {
        pending.current.controller.abort();
        clearTimeout(pending.current.timer);
        pending.current = null;
      }
    };
  }, []);
  useEffect(() => {
    if (input.current) {
      input.current.style.height = 'auto';
      input.current.style.height = `${Math.min(180, input.current.scrollHeight)}px`;
    }
  }, [active.draft]);
  useEffect(() => {
    if (transcript.current) {
      transcript.current.scrollTop = transcript.current.scrollHeight;
    }
  }, [active.id, active.turns.length, waiting]);
  const copy = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        showToast('کپی شد');
      } catch {
        showToast('کپی انجام نشد.', 'error');
      }
    },
    [showToast],
  );

  function stop(message = 'دریافت پاسخ متوقف شد؛ ممکن است سهمیه مصرف شده باشد.') {
    const request = pending.current;
    if (!request) {
      return false;
    }
    pending.current = null;
    clearTimeout(request.timer);
    request.controller.abort();
    update(request.id, (c) => ({ ...c, turns: request.previous, draft: request.content }));
    setWaiting(false);
    setError(message);
    return true;
  }
  async function submit(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    const content = active.draft.trim();
    if (
      !enabled ||
      !sessions.ready ||
      pending.current !== null ||
      !content ||
      content.length > 1800 ||
      active.turns.length >= sessions.maxTurns
    ) {
      return;
    }
    const sent: ChatTurn = { role: 'user', content };
    const controller = new AbortController();
    const request: Pending = {
      controller,
      id: active.id,
      content,
      previous: active.turns,
      timer: setTimeout(
        () => stop('زمان انتظار تمام شد. متن حفظ شد؛ ارسال دوباره ممکن است از سهمیه کم کند.'),
        35_000,
      ),
    };
    pending.current = request;
    setWaiting(true);
    setAnnouncement('');
    setError('');
    update(active.id, (c) => ({
      ...c,
      title: c.turns.length === 0 && c.title === 'گفت‌وگوی تازه' ? content.slice(0, 48) : c.title,
      draft: '',
      turns: [...c.turns, sent],
    }));
    let failureMessage = 'ارتباط برقرار نشد. متن حفظ شد؛ ارسال دوباره ممکن است از سهمیه کم کند.';
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        cache: 'no-store',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: boundedChatHistory(request.previous, sent) }),
        signal: controller.signal,
      });
      if (!response.ok) {
        failureMessage =
          response.status === 429
            ? 'سهمیه یا ظرفیت سرویس فعلاً تکمیل است. بعداً امتحان کن.'
            : response.status === 400
              ? 'متن درخواست معتبر نیست. آن را کوتاه‌تر کن و دوباره بفرست.'
              : response.status === 403
                ? 'درخواست مجاز نیست. صفحه را دوباره باز کن.'
                : 'سرویس فعلاً پاسخ نمی‌دهد. متن حفظ شد؛ ارسال دوباره ممکن است از سهمیه کم کند.';
        throw new Error('http failure');
      }
      const body = (await response.json()) as { reply?: unknown };
      if (typeof body?.reply !== 'string' || !body.reply.trim() || body.reply.length > 20_000) {
        throw new Error('invalid reply');
      }
      if (pending.current !== request || controller.signal.aborted) {
        return;
      }
      const reply = body.reply;
      setAnnouncement(`پاسخ دستیار: ${reply}`);
      update(request.id, (c) => ({
        ...c,
        turns: [...c.turns, { role: 'assistant', content: reply }],
      }));
    } catch {
      if (pending.current === request && !controller.signal.aborted) {
        update(request.id, (c) => ({ ...c, turns: request.previous, draft: content }));
        setError(failureMessage);
      }
    } finally {
      clearTimeout(request.timer);
      if (pending.current === request) {
        pending.current = null;
        setWaiting(false);
        input.current?.focus();
      }
    }
  }
  function keyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (
      event.key === 'Enter' &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing &&
      event.keyCode !== 229
    ) {
      event.preventDefault();
      void submit();
    }
  }
  function closeDrawer() {
    if (drawer.current?.open) {
      drawer.current.close();
      menu.current?.focus();
    }
  }
  function navigate(action: () => void) {
    const cancelled = stop();
    action();
    if (!cancelled) {
      setError('');
    }
    setAnnouncement('');
    setRename(false);
    closeDrawer();
    input.current?.focus();
  }
  function toggleTheme() {
    const dark = !isDark;
    setIsDark(dark);
    document.documentElement.classList.toggle('dark', dark);
    document.documentElement.classList.toggle('light', !dark);
    try {
      localStorage.setItem('theme', dark ? 'dark' : 'light');
    } catch {
      /* theme works without storage */
    }
  }

  const sidebar = (
    <>
      <Link href="/ai" className="ai-brand">
        <span className="ai-monogram" aria-hidden="true">
          PT
        </span>
        <span>
          هوش مصنوعی فارسی<small>جعبه ابزار فارسی</small>
        </span>
      </Link>
      <button type="button" className="ai-new" onClick={() => navigate(sessions.newConversation)}>
        گفت‌وگوی جدید
      </button>
      <p className="ai-label">گفت‌وگوهای این مرورگر</p>
      <nav aria-label="گفت‌وگوها" className="ai-session-list">
        {sessions.conversations.map((c) => (
          <button
            type="button"
            key={c.id}
            aria-current={c.id === active.id ? 'page' : undefined}
            onClick={() => navigate(() => sessions.setActiveId(c.id))}
          >
            {c.title}
          </button>
        ))}
      </nav>
      <div className="ai-sidebar-bottom">
        <label className="ai-persistence">
          <input
            type="checkbox"
            checked={sessions.persistent}
            disabled={!sessions.ready}
            onChange={(event) => sessions.setPersistence(event.target.checked)}
          />
          ذخیره تاریخچه در این مرورگر
        </label>
        <p>
          اختیاری و بدون همگام‌سازی. روی دستگاه مشترک فعال نکن. با خاموش‌کردن، نسخه ذخیره‌شده پاک
          می‌شود.
        </p>
        <button
          type="button"
          onClick={() => {
            setConfirmation({
              label: 'همه گفت‌وگوها و پیش‌نویس‌ها پاک شوند؟',
              action: sessions.clearAll,
            });
          }}
        >
          پاک‌کردن تاریخچه
        </button>
        <button type="button" onClick={toggleTheme}>
          {isDark ? 'تم روشن' : 'تم تیره'}
        </button>
        <Link href="/">بازگشت به جعبه ابزار فارسی</Link>
      </div>
    </>
  );
  return (
    <section ref={app} className="ai-app" dir="rtl" aria-label="گفت‌وگو با دستیار هوش مصنوعی">
      <dialog
        ref={confirmDialog}
        className="ai-confirm"
        aria-label="تأیید حذف"
        onClose={() => setConfirmation(null)}
      >
        <p>{confirmation?.label}</p>
        <button type="button" onClick={() => setConfirmation(null)}>
          انصراف
        </button>
        <button
          type="button"
          onClick={() => {
            if (confirmation) {
              navigate(confirmation.action);
            }
            setConfirmation(null);
          }}
        >
          بله، پاک شود
        </button>
      </dialog>
      <aside className="ai-sidebar">{sidebar}</aside>
      <dialog
        ref={drawer}
        className="ai-drawer"
        aria-label="فهرست گفت‌وگوها"
        onClose={() => menu.current?.focus()}
      >
        <button type="button" className="ai-close" onClick={closeDrawer}>
          بستن فهرست
        </button>
        {sidebar}
      </dialog>
      <div className="ai-main">
        <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
          {announcement}
        </div>
        <header className="ai-header">
          <button
            ref={menu}
            type="button"
            className="ai-menu"
            aria-haspopup="dialog"
            onClick={() => drawer.current?.showModal()}
          >
            گفت‌وگوها
          </button>
          <div className="ai-header-title">
            <h1>دستیار فارسی</h1>
            <p>
              {enabled ? 'نسخه آزمایشی · رایگان با سهمیه محدود' : 'گفت‌وگو فعلاً در دسترس نیست'}
            </p>
          </div>
          <div className="ai-header-actions">
            <button type="button" onClick={() => setRename(!rename)}>
              تغییر نام
            </button>
            <button
              type="button"
              onClick={() => {
                setConfirmation({
                  label: 'این گفت‌وگو پاک شود؟',
                  action: () => sessions.removeConversation(active.id),
                });
              }}
            >
              حذف گفت‌وگو
            </button>
          </div>
        </header>
        {rename ? (
          <form
            className="ai-rename"
            onSubmit={(event) => {
              event.preventDefault();
              const title = new FormData(event.currentTarget).get('title');
              if (typeof title === 'string' && title.trim()) {
                update(active.id, (c) => ({ ...c, title: title.trim().slice(0, 80) }));
              }
              setRename(false);
            }}
          >
            <label htmlFor="conversation-title">نام گفت‌وگو</label>
            <input
              id="conversation-title"
              name="title"
              defaultValue={active.title}
              maxLength={80}
              required
            />
            <button type="submit">ذخیره نام</button>
          </form>
        ) : null}
        <div ref={transcript} className="ai-transcript" tabIndex={0} aria-label="پیام‌های گفت‌وگو">
          {active.turns.length === 0 ? (
            <div className="ai-empty">
              <span className="ai-empty-mark" aria-hidden="true">
                PT
              </span>
              <p className="ai-eyebrow">فضایی برای فکرکردن، نوشتن و یادگرفتن</p>
              <h2>چه کمکی از دستم برمیاد؟</h2>
              <p>سؤال بپرس، برای نوشتن کمک بگیر یا درباره موضوعی توضیح بخواه.</p>
              {enabled ? (
                <div className="ai-suggestions">
                  {suggestions.map((suggestion) => (
                    <button
                      type="button"
                      key={suggestion}
                      onClick={() => {
                        update(active.id, (c) => ({ ...c, draft: suggestion }));
                        input.current?.focus();
                      }}
                    >
                      {suggestion}
                      <span aria-hidden="true">←</span>
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          ) : (
            <ol className="ai-turns" aria-label="پیام‌ها">
              {active.turns.map((turn, index) => (
                <li key={index} className={`ai-turn ai-${turn.role}`}>
                  <p className="ai-role">{turn.role === 'user' ? 'شما' : 'دستیار فارسی'}</p>
                  {turn.role === 'assistant' ? (
                    <>
                      <ChatMarkdown text={turn.content} onCopy={(text) => void copy(text)} />
                      <button
                        type="button"
                        className="ai-copy"
                        onClick={() => void copy(turn.content)}
                      >
                        کپی پاسخ
                      </button>
                    </>
                  ) : (
                    <div dir="auto" className="ai-user-content">
                      {turn.content}
                    </div>
                  )}
                </li>
              ))}
            </ol>
          )}
          <p role="status" className="ai-status">
            {waiting ? 'در حال آماده‌کردن پاسخ…' : active.turns.length ? 'پاسخ آماده است.' : ''}
          </p>
        </div>
        <form className="ai-composer" onSubmit={(event) => void submit(event)}>
          {sessions.storageNotice ? (
            <p role="status" className="ai-notice">
              {sessions.storageNotice}
            </p>
          ) : null}
          {error ? (
            <p role="alert" className="ai-error">
              {error}
            </p>
          ) : null}
          {active.turns.length >= sessions.maxTurns && (
            <p role="status">ظرفیت این گفت‌وگو تکمیل شد. گفت‌وگوی تازه شروع کن.</p>
          )}
          <div className="ai-input-box">
            <label htmlFor="ai-chat-input" className="sr-only">
              پیام شما
            </label>
            <textarea
              ref={input}
              id="ai-chat-input"
              rows={2}
              maxLength={1800}
              dir="auto"
              disabled={
                !enabled || waiting || !sessions.ready || active.turns.length >= sessions.maxTurns
              }
              value={active.draft}
              onChange={(event) => update(active.id, (c) => ({ ...c, draft: event.target.value }))}
              onKeyDown={keyDown}
              placeholder={enabled ? 'پیامت رو اینجا بنویس…' : 'چت فعلاً در دسترس نیست'}
              aria-describedby="ai-chat-guidance"
            />
            <div className="ai-composer-actions">
              <span className="ai-length">
                {active.draft.length.toLocaleString('fa-IR')} / ۱٬۸۰۰
              </span>
              {waiting ? (
                <button
                  key="stop"
                  type="button"
                  onClick={(event) => {
                    event.preventDefault();
                    stop();
                  }}
                >
                  توقف پاسخ
                </button>
              ) : (
                <button
                  key="send"
                  type="submit"
                  disabled={
                    !enabled ||
                    !sessions.ready ||
                    !active.draft.trim() ||
                    active.turns.length >= sessions.maxTurns
                  }
                >
                  ارسال پیام
                </button>
              )}
            </div>
          </div>
          <p id="ai-chat-guidance" className="ai-guidance">
            پیام به سرویس ابری ارسال می‌شود؛ اطلاعات محرمانه نفرست. پاسخ ممکن است اشتباه باشد.
          </p>
          <p className="ai-guidance">
            فقط دو پرسش‌وپاسخ اخیر، هر پیام تا ۴۰۰ نویسه، برای زمینه ارسال می‌شود.{' '}
            {sessions.persistent
              ? 'تاریخچه فقط در همین مرورگر ذخیره می‌شود.'
              : 'تاریخچه با بستن یا بارگذاری دوباره صفحه از بین می‌رود.'}
          </p>
        </form>
      </div>
    </section>
  );
}
