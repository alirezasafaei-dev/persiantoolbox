'use client';

import { Card, Button, AsyncState } from '@/components/ui';
import Input from '@/shared/ui/Input';
import type { SubscriptionInfo, HistoryEntry } from './account-utils';
import { formatDate } from './account-utils';

interface WorkHistorySectionProps {
  subscription: SubscriptionInfo | null;
  historyStatus: 'idle' | 'loading' | 'ready' | 'empty' | 'error';
  history: HistoryEntry[];
  historyRecoveryNotice: string | null;
  historyTool: string;
  setHistoryTool: (v: string) => void;
  historyInput: string;
  setHistoryInput: (v: string) => void;
  historyOutput: string;
  setHistoryOutput: (v: string) => void;
  handleHistorySample: () => Promise<void>;
  handleHistoryClear: () => Promise<void>;
  loadHistory: () => Promise<void>;
}

export default function WorkHistorySection({
  subscription,
  historyStatus,
  history,
  historyRecoveryNotice,
  historyTool,
  setHistoryTool,
  historyInput,
  setHistoryInput,
  historyOutput,
  setHistoryOutput,
  handleHistorySample,
  handleHistoryClear,
  loadHistory,
}: WorkHistorySectionProps) {
  return (
    <section className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
      <Card className="p-6 space-y-4">
        <div className="text-lg font-bold text-[var(--text-primary)]">تاریخچه کارها</div>
        {subscription ? (
          <div className="space-y-3">
            {historyStatus === 'loading' && (
              <AsyncState
                variant="loading"
                title="در حال دریافت تاریخچه"
                description="چند لحظه صبر کنید."
              />
            )}
            {historyStatus === 'error' && (
              <AsyncState
                variant="error"
                description="دریافت تاریخچه با خطا مواجه شد."
                action={{
                  label: 'تلاش مجدد',
                  onClick: () => {
                    void loadHistory();
                  },
                }}
              />
            )}
            {historyStatus === 'empty' && (
              <div className="space-y-2">
                <AsyncState
                  variant="empty"
                  title="تاریخچه خالی است"
                  description="هنوز موردی ثبت نشده است."
                />
                {historyRecoveryNotice ? (
                  <p role="status" className="text-sm font-semibold text-[var(--color-success)]">
                    {historyRecoveryNotice}
                  </p>
                ) : null}
              </div>
            )}
            {historyStatus === 'ready' && (
              <div className="space-y-2">
                {historyRecoveryNotice ? (
                  <p role="status" className="text-sm font-semibold text-[var(--color-success)]">
                    {historyRecoveryNotice}
                  </p>
                ) : null}
                {history.map((entry) => (
                  <div
                    key={entry.id}
                    className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] px-4 py-3 text-sm"
                  >
                    <div className="font-semibold text-[var(--text-primary)]">{entry.tool}</div>
                    <div className="text-xs text-[var(--text-muted)]">
                      {entry.inputSummary} → {entry.outputSummary}
                    </div>
                    <div className="text-xs text-[var(--text-muted)]">
                      {formatDate(entry.createdAt)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="text-sm text-[var(--text-muted)]">
            برای مشاهده تاریخچه، ابتدا اشتراک را فعال کنید.
          </div>
        )}
      </Card>

      <Card className="p-6 space-y-4">
        <div className="text-lg font-bold text-[var(--text-primary)]">ثبت نمونه تاریخچه</div>
        <Input
          label="نام ابزار"
          value={historyTool}
          onChange={(e) => setHistoryTool(e.target.value)}
        />
        <Input
          label="خلاصه ورودی"
          value={historyInput}
          onChange={(e) => setHistoryInput(e.target.value)}
        />
        <Input
          label="خلاصه خروجی"
          value={historyOutput}
          onChange={(e) => setHistoryOutput(e.target.value)}
        />
        <Button type="button" onClick={handleHistorySample}>
          ثبت نمونه
        </Button>
        <Button type="button" variant="tertiary" onClick={handleHistoryClear}>
          پاکسازی تاریخچه
        </Button>
      </Card>
    </section>
  );
}
