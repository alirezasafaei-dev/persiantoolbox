'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui';
import Button from '@/shared/ui/Button';

type SubscriptionInfo = {
  id: string;
  title: string;
  tier: 'basic' | 'pro';
  expiresAt: string;
  startedAt: string;
};

type UsageInfo = {
  used: number;
  limit: number;
  isPremium: boolean;
  freeDailyLimit: number;
};

type UsageDay = { date: string; count: number };

type Props = {
  subscription: SubscriptionInfo | null;
  usage: UsageInfo;
};

function formatDateShort(value: string): string {
  return new Intl.DateTimeFormat('fa-IR', {
    dateStyle: 'medium',
  }).format(new Date(value));
}

function getExpiryCountdown(expiresAt: string): string {
  const now = Date.now();
  const expiry = new Date(expiresAt).getTime();
  const diff = expiry - now;

  if (diff <= 0) {
    return 'منقضی شده';
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 0) {
    return `${days.toLocaleString('fa-IR')} روز و ${hours.toLocaleString('fa-IR')} ساعت`;
  }

  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours.toLocaleString('fa-IR')} ساعت و ${minutes.toLocaleString('fa-IR')} دقیقه`;
}

function getDaysUntilExpiry(expiresAt: string): number {
  const now = Date.now();
  const expiry = new Date(expiresAt).getTime();
  const diff = expiry - now;
  if (diff <= 0) {
    return 0;
  }
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function getUsagePercentage(used: number, limit: number): number {
  if (limit < 0) {
    return 0;
  }
  return Math.min(100, Math.round((used / limit) * 100));
}

function getUsageBarColor(percentage: number): string {
  if (percentage >= 90) {
    return 'var(--color-danger)';
  }
  if (percentage >= 70) {
    return 'var(--color-warning, #f59e0b)';
  }
  return 'var(--color-primary)';
}

const PERSIAN_WEEKDAYS = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه'];

function getUsageHistoryMax(counts: number[]): number {
  return Math.max(...counts, 10);
}

function formatDatePersian(dateStr: string): string {
  const d = new Date(dateStr);
  const dayOfWeek = d.getDay();
  const dayOfMonth = d.getDate();
  const weekday = PERSIAN_WEEKDAYS[(dayOfWeek + 1) % 7] ?? '';
  return `${weekday} ${dayOfMonth.toLocaleString('fa-IR')}`;
}

export default function SubscriptionPageClient({ subscription, usage }: Props) {
  const [refreshing, setRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const [liveUsage, setLiveUsage] = useState(usage);
  const [usageHistory, setUsageHistory] = useState<UsageDay[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [cancelMessage, setCancelMessage] = useState<string | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  useEffect(() => {
    setLiveUsage(usage);
  }, [usage]);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await fetch('/api/usage/history', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          setUsageHistory(data.days ?? []);
        }
      } catch {
        // silent
      } finally {
        setHistoryLoading(false);
      }
    }
    void fetchHistory();
  }, []);

  const handleRefresh = async () => {
    setRefreshError(null);
    setRefreshing(true);
    try {
      const res = await fetch('/api/subscription/status', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.usage) {
          setLiveUsage({
            used: data.usage.used,
            limit: data.usage.limit,
            isPremium: data.usage.isPremium,
            freeDailyLimit: usage.freeDailyLimit,
          });
        }
      } else {
        setRefreshError('خطا در بروزرسانی اطلاعات');
      }
    } catch {
      setRefreshError('خطای شبکه. لطفاً دوباره تلاش کنید.');
    } finally {
      setRefreshing(false);
    }
  };

  const usagePercentage = useMemo(
    () => getUsagePercentage(liveUsage.used, liveUsage.limit),
    [liveUsage.used, liveUsage.limit],
  );

  const barColor = useMemo(() => getUsageBarColor(usagePercentage), [usagePercentage]);

  const expiryCountdown = useMemo(() => {
    if (!subscription) {
      return null;
    }
    return getExpiryCountdown(subscription.expiresAt);
  }, [subscription]);

  const historyCounts = useMemo(() => usageHistory.map((d) => d.count), [usageHistory]);

  const historyMax = useMemo(() => getUsageHistoryMax(historyCounts), [historyCounts]);

  const averageUsage = useMemo(() => {
    if (historyCounts.length === 0) {
      return 0;
    }
    const sum = historyCounts.reduce((a, b) => a + b, 0);
    return Math.round((sum / historyCounts.length) * 10) / 10;
  }, [historyCounts]);

  const expiryDays = useMemo(() => {
    if (!subscription) {
      return null;
    }
    return getDaysUntilExpiry(subscription.expiresAt);
  }, [subscription]);

  const handleCancelSubscription = async () => {
    setCancelling(true);
    setCancelMessage(null);
    try {
      const response = await fetch('/api/subscription/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      if (data.ok) {
        setCancelMessage('اشتراک با موفقیت لغو شد.');
        setShowCancelConfirm(false);
      } else {
        setCancelMessage(data.error ?? 'خطا در لغو اشتراک.');
      }
    } catch {
      setCancelMessage('خطای شبکه. لطفاً دوباره تلاش کنید.');
    } finally {
      setCancelling(false);
    }
  };

  const showUpgradeCTA = !liveUsage.isPremium && historyCounts.length > 0 && averageUsage > 7;

  return (
    <div className="space-y-8">
      <section className="section-surface relative overflow-hidden p-6 md:p-10 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgb(var(--color-primary-rgb)/0.15),_transparent_55%)]" />
        <div className="relative space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)]">
            مدیریت اشتراک
          </h1>
          <p className="text-base md:text-lg text-[var(--text-muted)]">
            وضعیت اشتراک و مصرف روزانه خود را مشاهده کنید
          </p>
        </div>
      </section>

      {subscription && expiryDays !== null && expiryDays < 3 && expiryDays > 0 && (
        <div className="max-w-4xl mx-auto">
          <div className="rounded-[var(--radius-md)] border border-[var(--color-warning, #f59e0b)]/30 bg-[var(--color-warning, #f59e0b)]/5 p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xl">⚠️</span>
              <span className="text-sm font-semibold text-[var(--color-warning, #f59e0b)]">
                اشتراک شما {expiryDays.toLocaleString('fa-IR')} روز دیگر منقضی می‌شود
              </span>
            </div>
            <Link href="/pricing">
              <Button size="sm">تمدید اشتراک</Button>
            </Link>
          </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
        <Card className="p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[var(--text-primary)]">プラン فعلی</h2>
            {subscription && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-success)]/10 px-2.5 py-0.5 text-xs font-bold text-[var(--color-success)]">
                فعال
              </span>
            )}
          </div>

          {subscription ? (
            <div className="space-y-3">
              <div className="text-2xl font-black text-[var(--color-primary)]">
                {subscription.title}
              </div>
              <div className="space-y-2 text-sm text-[var(--text-secondary)]">
                <div className="flex justify-between">
                  <span>تاریخ شروع</span>
                  <span>{formatDateShort(subscription.startedAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span>تاریخ انقضا</span>
                  <span>{formatDateShort(subscription.expiresAt)}</span>
                </div>
                {expiryCountdown && (
                  <div className="flex justify-between font-semibold">
                    <span>زمان باقی‌مانده</span>
                    <span className="text-[var(--color-primary)]">{expiryCountdown}</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-lg font-semibold text-[var(--text-secondary)]">کاربر رایگان</div>
              <p className="text-sm text-[var(--text-muted)]">
                با ارتقا به اشتراک ویژه از محدودیت‌ها رها شوید
              </p>
            </div>
          )}

          <Link href="/pricing">
            <Button className="w-full">{subscription ? 'تغییر پلن' : '⭐ ارتقا به پرو'}</Button>
          </Link>

          {subscription && (
            <div className="space-y-2">
              {cancelMessage && (
                <div role="status" className="text-sm text-center py-2">
                  <span
                    className={
                      cancelMessage.includes('موفقیت')
                        ? 'text-[var(--color-success)]'
                        : 'text-[var(--color-danger)]'
                    }
                  >
                    {cancelMessage}
                  </span>
                </div>
              )}
              {showCancelConfirm ? (
                <div className="space-y-2">
                  <p className="text-sm text-[var(--text-muted)] text-center">
                    آیا از لغو اشتراک اطمینان دارید؟
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="tertiary"
                      className="flex-1"
                      onClick={() => setShowCancelConfirm(false)}
                    >
                      انصراف
                    </Button>
                    <Button
                      className="flex-1 bg-[var(--color-danger)] hover:bg-[var(--color-danger)]/90"
                      isLoading={cancelling}
                      onClick={() => void handleCancelSubscription()}
                    >
                      بله، لغو شود
                    </Button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  className="w-full text-sm text-[var(--color-danger)] hover:underline py-1"
                  onClick={() => setShowCancelConfirm(true)}
                >
                  لغو اشتراک
                </button>
              )}
            </div>
          )}
        </Card>

        <Card className="p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[var(--text-primary)]">مصرف امروز</h2>
            <button
              type="button"
              onClick={() => void handleRefresh()}
              disabled={refreshing}
              className="text-xs text-[var(--color-primary)] hover:underline disabled:opacity-50"
            >
              {refreshing ? 'در حال بروزرسانی...' : 'بروزرسانی'}
            </button>
          </div>

          {refreshError && (
            <div
              role="alert"
              aria-live="polite"
              className="rounded-[var(--radius-md)] bg-[var(--color-danger)]/10 border border-[var(--color-danger)]/20 p-3 text-sm text-[var(--color-danger)]"
            >
              {refreshError}
            </div>
          )}

          {liveUsage.isPremium ? (
            <div className="space-y-3">
              <div className="text-3xl font-black text-[var(--color-primary)]">∞</div>
              <p className="text-sm text-[var(--text-muted)]">
                استفاده نامحدود — بدون محدودیت روزانه
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-[var(--text-primary)]">
                  {liveUsage.used.toLocaleString('fa-IR')}
                </span>
                <span className="text-sm text-[var(--text-muted)]">
                  از {liveUsage.limit.toLocaleString('fa-IR')} استفاده
                </span>
              </div>

              <div className="relative h-3 rounded-full bg-[var(--surface-2)] overflow-hidden">
                <div
                  className="absolute inset-y-0 right-0 rounded-full transition-all duration-500"
                  style={{
                    width: `${usagePercentage}%`,
                    backgroundColor: barColor,
                  }}
                />
              </div>

              <div className="flex justify-between text-xs text-[var(--text-muted)]">
                <span>{usagePercentage.toLocaleString('fa-IR')}٪ مصرف شده</span>
                <span>
                  {Math.max(0, liveUsage.limit - liveUsage.used).toLocaleString('fa-IR')} باقی‌مانده
                </span>
              </div>

              {usagePercentage >= 80 && (
                <div className="rounded-[var(--radius-md)] bg-[var(--color-warning, #f59e0b)]/10 border border-[var(--color-warning, #f59e0b)]/20 p-3 text-sm text-[var(--color-warning, #f59e0b)]">
                  {usagePercentage >= 100
                    ? 'مصرف روزانه شما به پایان رسیده است. فردا دوباره تلاش کنید یا اشتراک خود را ارتقا دهید.'
                    : 'مصرف روزانه شما رو به اتمام است. برای استفاده نامحدود اشتراک بگیرید.'}
                </div>
              )}
            </div>
          )}
        </Card>
      </div>

      <div className="max-w-4xl mx-auto">
        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-bold text-[var(--text-primary)]">نمودار مصرف هفتگی</h2>
          {historyLoading ? (
            <div className="h-40 flex items-center justify-center text-[var(--text-muted)] text-sm">
              در حال بارگذاری...
            </div>
          ) : liveUsage.isPremium ? (
            <div className="h-40 flex items-center justify-center">
              <div className="text-center space-y-2">
                <div className="text-3xl font-black text-[var(--color-primary)]">∞</div>
                <p className="text-sm text-[var(--text-muted)]">
                  استفاده نامحدود — نمودار مصرف فقط برای کاربران رایگان نمایش داده می‌شود
                </p>
              </div>
            </div>
          ) : historyCounts.length > 0 ? (
            <div className="space-y-3">
              <div className="relative" style={{ height: '180px' }}>
                <div className="absolute inset-0 flex items-end gap-1.5 px-1" dir="rtl">
                  {usageHistory.map((day) => {
                    const barHeight = historyMax > 0 ? (day.count / historyMax) * 100 : 0;
                    const atLimit = day.count >= 10;
                    const barColorVar = atLimit
                      ? 'var(--color-danger)'
                      : day.count >= 7
                        ? 'var(--color-warning, #f59e0b)'
                        : 'var(--color-primary)';
                    return (
                      <div
                        key={day.date}
                        className="flex-1 flex flex-col items-center justify-end gap-1"
                      >
                        <span className="text-xs font-bold text-[var(--text-secondary)]">
                          {day.count.toLocaleString('fa-IR')}
                        </span>
                        <div className="w-full flex justify-center">
                          <div
                            className="w-full max-w-[40px] rounded-t-[var(--radius-sm)] transition-all duration-300"
                            style={{
                              height: `${barHeight}%`,
                              minHeight: day.count > 0 ? '4px' : '0px',
                              backgroundColor: barColorVar,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div
                  className="absolute inset-x-0 border-t border-dashed border-[var(--color-warning, #f59e0b)]"
                  style={{
                    bottom: `${(10 / historyMax) * 100}%`,
                  }}
                >
                  <span className="absolute left-0 -top-4 text-xs text-[var(--color-warning, #f59e0b)]">
                    حد مجاز
                  </span>
                </div>
              </div>
              <div className="flex gap-1.5 px-1" dir="rtl">
                {usageHistory.map((day) => (
                  <div key={day.date} className="flex-1 text-center">
                    <span className="text-[10px] text-[var(--text-muted)] leading-tight block">
                      {formatDatePersian(day.date)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="text-center text-sm text-[var(--text-secondary)]">
                میانگین:{' '}
                <span className="font-bold text-[var(--text-primary)]">
                  {averageUsage.toLocaleString('fa-IR')}
                </span>{' '}
                استفاده در روز
              </div>
            </div>
          ) : (
            <div className="h-40 flex items-center justify-center text-[var(--text-muted)] text-sm">
              هنوز داده‌ای برای نمایش وجود ندارد
            </div>
          )}
        </Card>
      </div>

      {showUpgradeCTA && (
        <div className="max-w-4xl mx-auto">
          <div className="rounded-[var(--radius-md)] border border-[var(--color-primary)]/30 bg-[var(--color-primary)]/5 p-6 text-center space-y-3">
            <p className="text-[var(--text-primary)] leading-relaxed">
              شما در ۷ روز گذشته به طور متوسط{' '}
              <span className="font-black text-[var(--color-primary)]">
                {averageUsage.toLocaleString('fa-IR')}
              </span>{' '}
              بار در روز از ابزارها استفاده کردید. با اشتراک حرفه‌ای، بدون محدودیت استفاده کنید.
            </p>
            <Link href="/pricing">
              <Button>⭐ ارتقا به پرو</Button>
            </Link>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-bold text-[var(--text-primary)]">مقایسه پلن‌ها</h2>
          <div className="grid gap-4 md:grid-cols-3 text-sm">
            <div className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-4 space-y-2">
              <div className="font-bold text-[var(--text-primary)]">کاربر رایگان</div>
              <ul className="space-y-1 text-[var(--text-secondary)]">
                <li>۱۰ استفاده ابزار در روز</li>
                <li>ابزارهای پایه</li>
                <li>با تبلیغات</li>
              </ul>
            </div>
            <div className="rounded-[var(--radius-md)] border-2 border-[var(--color-primary)] bg-[var(--surface-1)] p-4 space-y-2 relative">
              <div className="absolute -top-3 right-4 bg-[var(--color-primary)] text-[var(--text-inverted)] px-3 py-1 rounded-full text-xs font-bold">
                پیشنهادی
              </div>
              <div className="font-bold text-[var(--text-primary)]">پلن پایه</div>
              <ul className="space-y-1 text-[var(--text-secondary)]">
                <li>۵۰ استفاده ابزار در روز</li>
                <li>ابزارهای PDF و تصویر</li>
                <li>بدون تبلیغات</li>
              </ul>
            </div>
            <div className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-1)] p-4 space-y-2">
              <div className="font-bold text-[var(--text-primary)]">پلن حرفه‌ای</div>
              <ul className="space-y-1 text-[var(--text-secondary)]">
                <li>استفاده نامحدود</li>
                <li>تمام ابزارها</li>
                <li>بدون تبلیغات</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>

      <div className="max-w-4xl mx-auto text-center">
        <p className="text-sm text-[var(--text-muted)]">
          برای لغو اشتراک یا سؤالات پشتیبانی با ما{' '}
          <Link href="/contact" className="text-[var(--color-primary)] hover:underline">
            تماس بگیرید
          </Link>
        </p>
      </div>
    </div>
  );
}
