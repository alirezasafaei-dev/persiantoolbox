'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { AsyncState, Card } from '@/components/ui';

type HistoryEntry = {
  id: string;
  tool: string;
  inputSummary: string;
  outputSummary: string;
  createdAt: number;
};

type Props = {
  title?: string;
  toolPrefixes?: string[];
  toolIds?: string[];
  limit?: number;
};

const formatDate = (value: number) =>
  new Intl.DateTimeFormat('fa-IR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));

export default function RecentHistoryCard({
  title = 'آخرین عملیات شما',
  toolPrefixes,
  toolIds,
  limit = 5,
}: Props) {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'empty' | 'error' | 'unauthorized'>(
    'loading',
  );
  const [reloadTick, setReloadTick] = useState(0);
  const [recoveryNotice, setRecoveryNotice] = useState<string | null>(null);
  const recoveryPendingRef = useRef(false);

  useEffect(() => {
    const controller = new AbortController();
    let timedOut = false;
    const timeoutId = window.setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, 8000);

    const load = async () => {
      try {
        if (typeof document !== 'undefined') {
          const hasSession = document.cookie
            .split(';')
            .some((item) => item.trim().startsWith('pt_session='));
          if (!hasSession) {
            setStatus('unauthorized');
            setEntries([]);
            return;
          }
        }
        const response = await fetch(`/api/history?limit=${limit}`, {
          cache: 'no-store',
          signal: controller.signal,
        });
        if (response.status === 401 || response.status === 402) {
          setStatus('unauthorized');
          setEntries([]);
          setRecoveryNotice(null);
          recoveryPendingRef.current = false;
          return;
        }
        if (!response.ok) {
          setStatus('error');
          setEntries([]);
          setRecoveryNotice(null);
          return;
        }
        const data = (await response.json()) as { entries?: HistoryEntry[] };
        const list = data.entries ?? [];
        setEntries(list);
        setStatus(list.length > 0 ? 'ready' : 'empty');
        if (recoveryPendingRef.current) {
          setRecoveryNotice('اتصال دوباره برقرار شد و تاریخچه بازیابی شد.');
          recoveryPendingRef.current = false;
        } else {
          setRecoveryNotice(null);
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError' && !timedOut) {
          return;
        }
        setStatus('error');
        setRecoveryNotice(null);
      } finally {
        window.clearTimeout(timeoutId);
      }
    };

    void load();
    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [limit, reloadTick]);

  const filteredEntries = useMemo(() => {
    if (!toolPrefixes?.length && !toolIds?.length) {
      return entries;
    }
    return entries.filter((entry) => {
      const matchesPrefix = toolPrefixes?.some((prefix) => entry.tool.startsWith(prefix)) ?? false;
      const matchesId = toolIds?.includes(entry.tool) ?? false;
      return matchesPrefix || matchesId;
    });
  }, [entries, toolPrefixes, toolIds]);

  if (status === 'unauthorized') {
    return (
      <Card className="p-6 space-y-3">
        <div className="text-lg font-black text-[var(--text-primary)]">{title}</div>
        <p className="text-sm text-[var(--text-muted)]">
          تاریخچه حساب کاربری در نسخه ۱.۱.۱ غیرفعال شده است.
        </p>
      </Card>
    );
  }

  if (status === 'loading') {
    return (
      <Card className="p-6">
        <AsyncState
          variant="loading"
          title="در حال دریافت تاریخچه"
          description="در حال بارگذاری آخرین عملیات شما هستیم."
        />
      </Card>
    );
  }

  if (status === 'error') {
    return (
      <Card className="p-6 space-y-3">
        <div className="text-lg font-black text-[var(--text-primary)]">{title}</div>
        <AsyncState
          variant="error"
          description="دریافت تاریخچه با خطا مواجه شد. لطفاً دوباره تلاش کنید."
          action={{
            label: 'تلاش مجدد',
            onClick: () => {
              recoveryPendingRef.current = true;
              setReloadTick((value) => value + 1);
            },
          }}
        />
      </Card>
    );
  }

  if (filteredEntries.length === 0) {
    return (
      <Card className="p-6 space-y-2">
        <div className="text-lg font-black text-[var(--text-primary)]">{title}</div>
        <AsyncState
          variant="empty"
          title="تاریخچه خالی است"
          description="هنوز عملیاتی ثبت نشده است."
        />
        {recoveryNotice && (
          <p role="status" className="text-sm font-semibold text-[var(--color-success)]">
            {recoveryNotice}
          </p>
        )}
      </Card>
    );
  }

  return (
    <Card className="p-6 space-y-4">
      <div className="text-lg font-black text-[var(--text-primary)]">{title}</div>
      {recoveryNotice && (
        <p role="status" className="text-sm font-semibold text-[var(--color-success)]">
          {recoveryNotice}
        </p>
      )}
      <div className="space-y-3">
        {filteredEntries.map((entry) => (
          <div
            key={entry.id}
            className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] px-4 py-3 text-sm"
          >
            <div className="flex items-center justify-between">
              <div className="font-semibold text-[var(--text-primary)]">{entry.tool}</div>
              <div className="text-xs text-[var(--text-muted)]">{formatDate(entry.createdAt)}</div>
            </div>
            <div className="mt-1 text-xs text-[var(--text-muted)]">{entry.inputSummary}</div>
            <div className="text-xs text-[var(--text-muted)]">{entry.outputSummary}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}
