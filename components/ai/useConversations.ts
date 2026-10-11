'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  createConversation,
  LOCAL_CHAT_STORAGE,
  MAX_CONVERSATIONS,
  MAX_LOCAL_TURNS,
  parseLocalConversations,
  type LocalConversation,
} from '@/lib/ai/local-conversations';

export function useConversations() {
  const [conversations, setConversations] = useState<LocalConversation[]>(() => [
    createConversation(),
  ]);
  const [activeId, setActiveId] = useState('');
  const [persistent, setPersistent] = useState(false);
  const [writesPaused, setWritesPaused] = useState(false);
  const [ready, setReady] = useState(false);
  const [storageNotice, setStorageNotice] = useState('');
  const expectedStorage = useRef<string | null>(null);
  const conflict = useRef(false);
  const allowedWrites = useRef(false);
  const flushRef = useRef<() => void>(() => {});
  const active =
    conversations.find((c) => c.id === activeId) ?? conversations[0] ?? createConversation();

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LOCAL_CHAT_STORAGE);
      expectedStorage.current = raw;
      const snapshot = parseLocalConversations(raw);
      if (snapshot) {
        setConversations(snapshot.conversations);
        setActiveId(snapshot.activeId);
        setPersistent(true);
      } else if (raw) {
        localStorage.removeItem(LOCAL_CHAT_STORAGE);
        expectedStorage.current = null;
        setStorageNotice('داده ذخیره‌شده معتبر نبود و پاک شد. گفت‌وگو در حافظه ادامه دارد.');
      }
    } catch {
      setStorageNotice('دسترسی به ذخیره‌سازی ممکن نیست؛ داده‌های قبلی ممکن است باقی باشند.');
    }
    setReady(true);
    const changed = (event: StorageEvent) => {
      if (event.key === LOCAL_CHAT_STORAGE || event.key === null) {
        conflict.current = true;
        allowedWrites.current = false;
        setPersistent(false);
        setWritesPaused(true);
        flushRef.current = () => {};
        setStorageNotice(
          'تاریخچه در زبانه دیگری تغییر کرد. این زبانه فقط در حافظه ادامه می‌دهد. برای بازیابی نسخه جدید، پیش‌نویس را کپی کن و صفحه را دوباره باز کن.',
        );
      }
    };
    window.addEventListener('storage', changed);
    const flush = () => flushRef.current();
    window.addEventListener('pagehide', flush);
    const hidden = () => {
      if (document.visibilityState === 'hidden') {
        flush();
      }
    };
    document.addEventListener('visibilitychange', hidden);
    return () => {
      flush();
      window.removeEventListener('storage', changed);
      window.removeEventListener('pagehide', flush);
      document.removeEventListener('visibilitychange', hidden);
    };
  }, []);

  useEffect(() => {
    flushRef.current = () => {};
    allowedWrites.current = ready && persistent && !writesPaused && !conflict.current;
    if (!ready || !persistent || writesPaused) {
      return;
    }
    const flush = () => {
      if (!allowedWrites.current) {
        return;
      }
      try {
        if (
          conflict.current ||
          localStorage.getItem(LOCAL_CHAT_STORAGE) !== expectedStorage.current
        ) {
          conflict.current = true;
          allowedWrites.current = false;
          setPersistent(false);
          setWritesPaused(true);
          flushRef.current = () => {};
          setStorageNotice(
            'تاریخچه در زبانه دیگری تغییر کرد؛ ذخیره‌سازی این زبانه متوقف شد. پیش‌نویس را کپی کن و صفحه را دوباره باز کن.',
          );
          return;
        }
        const saved = conversations.map((c) => {
          const unfinished = c.turns.length % 2 === 1;
          return {
            ...c,
            draft: unfinished ? (c.turns[c.turns.length - 1]?.content ?? c.draft) : c.draft,
            turns: unfinished ? c.turns.slice(0, -1) : c.turns,
          };
        });
        const raw = JSON.stringify({
          version: 1,
          consent: true,
          activeId: active.id,
          conversations: saved,
        });
        if (raw.length > 1_000_000) {
          throw new Error('storage cap');
        }
        if (raw !== expectedStorage.current) {
          localStorage.setItem(LOCAL_CHAT_STORAGE, raw);
          expectedStorage.current = raw;
        }
      } catch {
        allowedWrites.current = false;
        setWritesPaused(true);
        flushRef.current = () => {};
        setStorageNotice(
          'ذخیره تغییرات متوقف شد. نسخه قبلی در مرورگر باقی می‌ماند و ممکن است دوباره بازیابی شود؛ برای حذف، ذخیره تاریخچه را خاموش کن.',
        );
      }
    };
    flushRef.current = flush;
    const timer = setTimeout(flush, 250);
    return () => clearTimeout(timer);
  }, [conversations, active.id, persistent, ready, writesPaused]);

  const update = useCallback(
    (id: string, transform: (c: LocalConversation) => LocalConversation) => {
      setConversations((previous) => previous.map((c) => (c.id === id ? transform(c) : c)));
    },
    [],
  );
  function setPersistence(value: boolean): boolean {
    if (!value) {
      allowedWrites.current = false;
      flushRef.current = () => {};
    }
    if (value && conflict.current) {
      setStorageNotice(
        'نسخه زبانه دیگر را بازنویسی نمی‌کنیم. پیش‌نویس را کپی کن و صفحه را دوباره باز کن، یا با تأیید، همه تاریخچه را پاک کن.',
      );
      return false;
    }
    try {
      if (value) {
        if (localStorage.getItem(LOCAL_CHAT_STORAGE) !== expectedStorage.current) {
          conflict.current = true;
          setPersistent(false);
          setWritesPaused(true);
          setStorageNotice('نسخه زبانه دیگر تغییر کرده است؛ برای بازیابی صفحه را دوباره باز کن.');
          return false;
        }
      } else {
        localStorage.removeItem(LOCAL_CHAT_STORAGE);
        if (localStorage.getItem(LOCAL_CHAT_STORAGE) !== null) {
          throw new Error('erase failed');
        }
        expectedStorage.current = null;
        conflict.current = false;
      }
      setPersistent(value);
      setWritesPaused(false);
      setStorageNotice('');
      return true;
    } catch {
      setWritesPaused(true);
      flushRef.current = () => {};
      setStorageNotice(
        'حذف داده تأیید نشد. نسخه ذخیره‌شده ممکن است باقی باشد و پس از بازکردن صفحه بازیابی شود؛ دوباره تلاش کن.',
      );
      return false;
    }
  }
  function newConversation() {
    if (conversations.length >= MAX_CONVERSATIONS) {
      setStorageNotice('حداکثر ۲۰ گفت‌وگو؛ برای شروع تازه یکی را حذف کن.');
      return;
    }
    const next = createConversation();
    setConversations((previous) => [...previous, next]);
    setActiveId(next.id);
  }
  function removeConversation(id: string) {
    const remaining = conversations.filter((c) => c.id !== id);
    if (!remaining.length) {
      remaining.push(createConversation());
    }
    setConversations(remaining);
    if (active.id === id) {
      setActiveId(remaining[0]?.id ?? '');
    }
  }
  function clearAll() {
    if (!setPersistence(false)) {
      return;
    }
    const next = createConversation();
    setConversations([next]);
    setActiveId(next.id);
  }
  return {
    conversations,
    active,
    update,
    persistent,
    ready,
    storageNotice,
    setPersistence,
    newConversation,
    removeConversation,
    clearAll,
    setActiveId,
    maxTurns: MAX_LOCAL_TURNS,
  };
}
