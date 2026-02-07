'use client';

import { useEffect, useMemo, useState } from 'react';
import { AsyncState, Card, ButtonLink } from '@/components/ui';

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

  useEffect(() => {
    const controller = new AbortController();

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
          return;
        }
        if (!response.ok) {
          setStatus('error');
          setEntries([]);
          return;
        }
        const data = (await response.json()) as { entries?: HistoryEntry[] };
        const list = data.entries ?? [];
        setEntries(list);
        setStatus(list.length > 0 ? 'ready' : 'empty');
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return;
        }
        setStatus('error');
      }
    };

    void load();
    return () => controller.abort();
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
          برای مشاهده تاریخچه، اشتراک فعال نیاز است.
        </p>
        <div className="flex flex-wrap gap-3">
          <ButtonLink href="/account" size="sm">
            ورود / اشتراک
          </ButtonLink>
          <ButtonLink href="/plans" size="sm" variant="secondary">
            مشاهده پلن‌ها
          </ButtonLink>
        </div>
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
          action={{ label: 'تلاش مجدد', onClick: () => setReloadTick((value) => value + 1) }}
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
      </Card>
    );
  }

  return (
    <Card className="p-6 space-y-4">
      <div className="text-lg font-black text-[var(--text-primary)]">{title}</div>
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
