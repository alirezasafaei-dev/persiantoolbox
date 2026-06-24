'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AsyncState, Button, Card } from '@/components/ui';
import Input from '@/shared/ui/Input';
import { SUBSCRIPTION_PLANS, type PlanId } from '@/lib/subscriptionPlans';
import UserBadges from '@/components/ui/UserBadges';
import { getUsageSnapshot } from '@/shared/analytics/localUsage';

type UserInfo = {
  id: string;
  email: string;
  createdAt: number;
};

type SubscriptionInfo = {
  id: string;
  planId: PlanId;
  status: 'active' | 'canceled' | 'expired';
  startedAt: number;
  expiresAt: number;
};

type HistoryEntry = {
  id: string;
  tool: string;
  inputSummary: string;
  outputSummary: string;
  createdAt: number;
};

type ActivityItem = {
  id: string;
  type: 'tool_use' | 'login' | 'subscription';
  title: string;
  detail?: string;
  timestamp: number;
};

type NotificationPrefs = {
  emailNotifications: boolean;
  historyReminders: boolean;
};

const TOOL_NAMES: Record<string, string> = {
  '/tools/currency-converter': 'تبدیل ارز',
  '/tools/interest-calculator': 'محاسبه سود',
  '/tools/tax-calculator': 'محاسبه مالیات',
  '/pdf-tools/pdf-merge': 'ادغام PDF',
  '/pdf-tools/pdf-split': 'جدا کردن PDF',
  '/pdf-tools/pdf-to-word': 'PDF به Word',
  '/text-tools/resume-builder': 'رزومه‌ساز',
  '/image-tools/background-remover': 'حذف پس‌زمینه',
  '/date-tools/date-converter': 'تبدیل تاریخ',
  '/validation-tools/iranian-national-code': 'کد ملی',
};

type UsageData = {
  lastUpdated: number;
  totalViews: number;
  paths: Record<string, number>;
};

const NOTIFICATION_STORAGE_KEY = 'persian-tools.notifications.v1';

function formatDate(value: number) {
  return new Intl.DateTimeFormat('fa-IR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function formatDateShort(value: number) {
  return new Intl.DateTimeFormat('fa-IR', {
    dateStyle: 'medium',
  }).format(new Date(value));
}

function getToolDisplayName(path: string): string {
  if (TOOL_NAMES[path]) {
    return TOOL_NAMES[path];
  }
  const segments = path.split('/');
  const slug = segments[segments.length - 1] ?? path;
  return slug.replace(/-/g, ' ');
}

function loadNotificationPrefs(): NotificationPrefs {
  if (typeof window === 'undefined') {
    return { emailNotifications: true, historyReminders: true };
  }
  try {
    const raw = window.localStorage.getItem(NOTIFICATION_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as NotificationPrefs;
    }
  } catch {
    // ignore
  }
  return { emailNotifications: true, historyReminders: true };
}

function saveNotificationPrefs(prefs: NotificationPrefs) {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(prefs));
}

function buildActivityTimeline(history: HistoryEntry[], usage: UsageData): ActivityItem[] {
  const items: ActivityItem[] = [];

  for (const entry of history.slice(0, 10)) {
    items.push({
      id: `history-${entry.id}`,
      type: 'tool_use',
      title: `استفاده از ${getToolDisplayName(entry.tool)}`,
      detail: `${entry.inputSummary} → ${entry.outputSummary}`,
      timestamp: entry.createdAt,
    });
  }

  const topPaths = Object.entries(usage.paths ?? {})
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  for (const [path, count] of topPaths) {
    if (!items.some((i) => i.type === 'tool_use' && i.title.includes(getToolDisplayName(path)))) {
      items.push({
        id: `usage-${path}`,
        type: 'tool_use',
        title: `بازدید ${count} بار از ${getToolDisplayName(path)}`,
        timestamp: usage.lastUpdated,
      });
    }
  }

  items.sort((a, b) => b.timestamp - a.timestamp);
  return items.slice(0, 10);
}

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [accountLoadError, setAccountLoadError] = useState(false);
  const [historyStatus, setHistoryStatus] = useState<
    'idle' | 'loading' | 'ready' | 'empty' | 'error'
  >('idle');
  const [accountRecoveryNotice, setAccountRecoveryNotice] = useState<string | null>(null);
  const accountRecoveryPendingRef = useRef(false);
  const [historyRecoveryNotice, setHistoryRecoveryNotice] = useState<string | null>(null);
  const historyRecoveryPendingRef = useRef(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [planId, setPlanId] = useState<PlanId>('basic_monthly');
  const [historyTool, setHistoryTool] = useState('pdf-merge');
  const [historyInput, setHistoryInput] = useState('3 فایل PDF');
  const [historyOutput, setHistoryOutput] = useState('merge.pdf');
  const [usageSnapshot, setUsageSnapshot] = useState<UsageData>({
    lastUpdated: 0,
    totalViews: 0,
    paths: {},
  });
  const [notifPrefs, setNotifPrefs] = useState<NotificationPrefs>({
    emailNotifications: true,
    historyReminders: true,
  });

  useEffect(() => {
    setUsageSnapshot(getUsageSnapshot());
    setNotifPrefs(loadNotificationPrefs());
  }, []);

  const loadAccount = useCallback(async () => {
    setLoading(true);
    setAccountLoadError(false);
    const controller = new AbortController();
    let timedOut = false;
    const timeoutId = window.setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, 8000);
    try {
      const response = await fetch('/api/auth/me', {
        cache: 'no-store',
        signal: controller.signal,
      });
      if (!response.ok) {
        if (response.status >= 500) {
          setAccountLoadError(true);
          setAccountRecoveryNotice(null);
          return;
        }
        setUser(null);
        setSubscription(null);
        setHistory([]);
        setHistoryStatus('idle');
        setAccountRecoveryNotice(null);
        accountRecoveryPendingRef.current = false;
        return;
      }
      const data = (await response.json()) as { user: UserInfo; subscription?: SubscriptionInfo };
      setUser(data.user);
      setSubscription(data.subscription ?? null);
      if (accountRecoveryPendingRef.current) {
        setAccountRecoveryNotice('ارتباط مجدد برقرار شد و اطلاعات حساب بازیابی شد.');
        accountRecoveryPendingRef.current = false;
      } else {
        setAccountRecoveryNotice(null);
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError' && !timedOut) {
        return;
      }
      setAccountLoadError(true);
      setAccountRecoveryNotice(null);
    } finally {
      window.clearTimeout(timeoutId);
      setLoading(false);
    }
  }, []);

  const loadHistory = useCallback(async () => {
    if (!subscription) {
      setHistory([]);
      setHistoryStatus('idle');
      setHistoryRecoveryNotice(null);
      historyRecoveryPendingRef.current = false;
      return;
    }
    setHistoryStatus('loading');
    setHistoryRecoveryNotice(null);
    const controller = new AbortController();
    let timedOut = false;
    const timeoutId = window.setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, 8000);
    try {
      const response = await fetch('/api/history', {
        cache: 'no-store',
        signal: controller.signal,
      });
      if (!response.ok) {
        setHistory([]);
        setHistoryStatus('error');
        setHistoryRecoveryNotice(null);
        return;
      }
      const data = (await response.json()) as { entries: HistoryEntry[] };
      const entries = data.entries ?? [];
      setHistory(entries);
      setHistoryStatus(entries.length > 0 ? 'ready' : 'empty');
      if (historyRecoveryPendingRef.current) {
        setHistoryRecoveryNotice('ارتباط مجدد برقرار شد و تاریخچه بازیابی شد.');
        historyRecoveryPendingRef.current = false;
      } else {
        setHistoryRecoveryNotice(null);
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError' && !timedOut) {
        return;
      }
      setHistory([]);
      setHistoryStatus('error');
      setHistoryRecoveryNotice(null);
      return;
    } finally {
      window.clearTimeout(timeoutId);
    }
  }, [subscription]);

  useEffect(() => {
    void loadAccount();
  }, [loadAccount]);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  const planOptions = useMemo(() => SUBSCRIPTION_PLANS, []);

  const handleRegister = async () => {
    setAuthError(null);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: registerEmail, password: registerPassword }),
      });
      if (!response.ok) {
        setAuthError('ثبت‌نام ناموفق بود. لطفاً ایمیل یا رمز را بررسی کنید.');
        return;
      }
      await loadAccount();
    } catch {
      setAuthError('خطا در ارتباط با سرور.');
    }
  };

  const handleLogin = async () => {
    setAuthError(null);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      if (!response.ok) {
        setAuthError('ورود ناموفق بود. لطفاً اطلاعات را بررسی کنید.');
        return;
      }
      await loadAccount();
    } catch {
      setAuthError('خطا در ارتباط با سرور.');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // Ignore logout errors
    }
    setUser(null);
    setSubscription(null);
    setHistory([]);
  };

  const handleCheckout = async () => {
    try {
      const response = await fetch('/api/subscription/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      });
      if (!response.ok) {
        return;
      }
      const data = (await response.json()) as { payUrl?: string };
      if (data.payUrl) {
        router.push(data.payUrl);
      }
    } catch {
      // Checkout error handled by UI state
    }
  };

  const handleHistorySample = async () => {
    try {
      await fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tool: historyTool,
          inputSummary: historyInput,
          outputSummary: historyOutput,
        }),
      });
      await loadHistory();
    } catch {
      // History error handled by UI state
    }
  };

  const handleHistoryClear = async () => {
    try {
      await fetch('/api/history', { method: 'DELETE' });
    } catch {
      // Clear error handled by UI state
    }
    setHistory([]);
  };

  const toggleNotifPref = (key: keyof NotificationPrefs) => {
    const updated = { ...notifPrefs, [key]: !notifPrefs[key] };
    setNotifPrefs(updated);
    saveNotificationPrefs(updated);
  };

  const uniqueToolsUsed = useMemo(() => {
    const toolSet = new Set<string>();
    for (const entry of history) {
      toolSet.add(entry.tool);
    }
    for (const path of Object.keys(usageSnapshot.paths ?? {})) {
      toolSet.add(path);
    }
    return toolSet.size;
  }, [history, usageSnapshot]);

  const topTools = useMemo(() => {
    return Object.entries(usageSnapshot.paths ?? {})
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([path, count]) => ({
        path,
        name: getToolDisplayName(path),
        count,
      }));
  }, [usageSnapshot]);

  const activityTimeline = useMemo(
    () => buildActivityTimeline(history, usageSnapshot),
    [history, usageSnapshot],
  );

  if (loading) {
    return (
      <AsyncState
        variant="loading"
        title="در حال بارگذاری حساب"
        description="در حال دریافت اطلاعات حساب کاربری شما هستیم."
      />
    );
  }

  if (accountLoadError) {
    return (
      <AsyncState
        variant="error"
        title="خطا در بارگذاری حساب"
        description="بارگذاری اطلاعات حساب با خطا مواجه شد."
        action={{
          label: 'تلاش مجدد',
          onClick: () => {
            accountRecoveryPendingRef.current = true;
            void loadAccount();
          },
        }}
      />
    );
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <section className="section-surface p-6 md:p-8">
          <h1 className="text-2xl md:text-3xl font-black text-[var(--text-primary)]">
            ورود یا ثبت‌نام
          </h1>
          <p className="text-[var(--text-secondary)] mt-2">
            برای فعال‌سازی تاریخچه کارها، وارد شوید یا حساب بسازید.
          </p>
        </section>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="p-6 space-y-4">
            <div className="text-lg font-bold">ثبت‌نام</div>
            <Input
              label="ایمیل"
              value={registerEmail}
              onChange={(e) => setRegisterEmail(e.target.value)}
            />
            <Input
              label="رمز عبور"
              type="password"
              value={registerPassword}
              onChange={(e) => setRegisterPassword(e.target.value)}
            />
            <Button type="button" onClick={handleRegister}>
              ثبت‌نام
            </Button>
          </Card>

          <Card className="p-6 space-y-4">
            <div className="text-lg font-bold">ورود</div>
            <Input
              label="ایمیل"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
            />
            <Input
              label="رمز عبور"
              type="password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
            />
            <Button type="button" variant="secondary" onClick={handleLogin}>
              ورود
            </Button>
          </Card>
        </div>

        {authError && <AsyncState variant="error" title="خطای ورود" description={authError} />}
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <section className="section-surface p-6 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-[var(--text-primary)]">
              حساب کاربری
            </h1>
            <p className="text-[var(--text-secondary)]">{user.email}</p>
            {accountRecoveryNotice && (
              <p role="status" className="mt-2 text-sm font-semibold text-[var(--color-success)]">
                {accountRecoveryNotice}
              </p>
            )}
          </div>
          <Button type="button" variant="tertiary" onClick={handleLogout}>
            خروج
          </Button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Card className="p-5">
          <div className="text-sm text-[var(--text-muted)] mb-1">ایمیل</div>
          <div className="text-sm font-semibold text-[var(--text-primary)]">{user.email}</div>
        </Card>
        <Card className="p-5">
          <div className="text-sm text-[var(--text-muted)] mb-1">عضویت از</div>
          <div className="text-sm font-semibold text-[var(--text-primary)]">
            {formatDateShort(user.createdAt)}
          </div>
        </Card>
        <Card className="p-5">
          <div className="text-sm text-[var(--text-muted)] mb-1">وضعیت پلن</div>
          <div className="text-sm font-semibold text-[var(--text-primary)]">
            {subscription ? `${subscription.planId} — فعال` : 'بدون اشتراک'}
          </div>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Card className="p-5">
          <div className="text-sm text-[var(--text-muted)] mb-1">ابزارهای استفاده‌شده</div>
          <div className="text-2xl font-black text-[var(--color-primary)]">
            {uniqueToolsUsed.toLocaleString('fa-IR')}
          </div>
        </Card>
        <Card className="p-5">
          <div className="text-sm text-[var(--text-muted)] mb-1">مجموع بازدیدها</div>
          <div className="text-2xl font-black text-[var(--color-primary)]">
            {(usageSnapshot.totalViews ?? 0).toLocaleString('fa-IR')}
          </div>
        </Card>
      </section>

      <UserBadges />

      <section className="grid gap-4 md:grid-cols-2">
        <Card className="p-6 space-y-3">
          <div className="text-lg font-bold text-[var(--text-primary)]">وضعیت اشتراک</div>
          {subscription ? (
            <div className="text-sm text-[var(--text-muted)] space-y-1">
              <div>پلن: {subscription.planId}</div>
              <div>وضعیت: {subscription.status}</div>
              <div>انقضا: {formatDate(subscription.expiresAt)}</div>
            </div>
          ) : (
            <div className="text-sm text-[var(--text-muted)]">اشتراکی فعال نیست.</div>
          )}
        </Card>

        <Card className="p-6 space-y-3">
          <div className="text-lg font-bold text-[var(--text-primary)]">شروع اشتراک</div>
          <label htmlFor="plan-select" className="space-y-2 text-sm text-[var(--text-primary)]">
            انتخاب پلن
            <select
              id="plan-select"
              className="input w-full px-4 py-3 bg-[var(--surface-1)] border border-[var(--border-light)] rounded-[var(--radius-md)]"
              value={planId}
              onChange={(event) => setPlanId(event.target.value as PlanId)}
            >
              {planOptions.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.title} - {plan.price.toLocaleString('fa-IR')} تومان
                </option>
              ))}
            </select>
          </label>
          <Button type="button" onClick={handleCheckout}>
            پرداخت و فعال‌سازی
          </Button>
        </Card>
      </section>

      <section className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-5">
        <h3 className="text-lg font-bold text-[var(--text-primary)] mb-3">پیوندهای سریع</h3>
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
          <Link
            href="/history"
            className="flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-2)] px-4 py-3 text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--surface-3)] transition-colors"
          >
            <span aria-hidden="true">📜</span>
            تاریخچه
          </Link>
          <Link
            href="/tools"
            className="flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-2)] px-4 py-3 text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--surface-3)] transition-colors"
          >
            <span aria-hidden="true">🧰</span>
            ابزارها
          </Link>
          <Link
            href="/pdf-tools"
            className="flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-2)] px-4 py-3 text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--surface-3)] transition-colors"
          >
            <span aria-hidden="true">📄</span>
            ابزارهای PDF
          </Link>
          <Link
            href="/compare"
            className="flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface-2)] px-4 py-3 text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--surface-3)] transition-colors"
          >
            <span aria-hidden="true">⚖️</span>
            مقایسه ابزارها
          </Link>
        </div>
        {topTools.length > 0 && (
          <div className="mt-4 pt-3 border-t border-[var(--border-light)]">
            <div className="text-xs text-[var(--text-muted)] mb-2">ابزارهای پرتکرار شما</div>
            <div className="flex flex-wrap gap-2">
              {topTools.map((tool) => (
                <Link
                  key={tool.path}
                  href={tool.path}
                  className="inline-flex items-center gap-1 rounded-full border border-[var(--border-light)] bg-[var(--surface-2)] px-3 py-1 text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--surface-3)] transition-colors"
                >
                  {tool.name}
                  <span className="text-[var(--text-muted)]">({tool.count})</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>

      {activityTimeline.length > 0 && (
        <section className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-5">
          <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4">خط زمانی فعالیت</h3>
          <div className="relative">
            <div
              className="absolute right-3 top-0 bottom-0 w-px bg-[var(--border-light)]"
              aria-hidden="true"
            />
            <div className="space-y-4">
              {activityTimeline.map((item) => (
                <div key={item.id} className="relative flex gap-3">
                  <div
                    className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[var(--border-light)] bg-[var(--surface-2)] text-xs"
                    aria-hidden="true"
                  >
                    {item.type === 'tool_use' && '🔧'}
                    {item.type === 'login' && '🔑'}
                    {item.type === 'subscription' && '💳'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-[var(--text-primary)]">
                      {item.title}
                    </div>
                    {item.detail && (
                      <div className="text-xs text-[var(--text-muted)] truncate">{item.detail}</div>
                    )}
                    <div className="text-xs text-[var(--text-muted)] mt-0.5">
                      {formatDate(item.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-5">
        <h3 className="text-lg font-bold text-[var(--text-primary)] mb-3">تنظیمات اعلان‌ها</h3>
        <div className="space-y-3">
          <label className="flex items-center justify-between gap-3 cursor-pointer">
            <span className="text-sm text-[var(--text-primary)]">اعلان‌های ایمیلی</span>
            <button
              type="button"
              role="switch"
              aria-checked={notifPrefs.emailNotifications}
              onClick={() => toggleNotifPref('emailNotifications')}
              className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-[var(--motion-fast)] ${
                notifPrefs.emailNotifications
                  ? 'bg-[var(--color-primary)]'
                  : 'bg-[var(--color-secondary)]'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 rounded-full bg-white transition-transform duration-[var(--motion-fast)] ${
                  notifPrefs.emailNotifications
                    ? 'translate-x-1 rtl:-translate-x-1'
                    : '-translate-x-5 rtl:translate-x-5'
                }`}
              />
            </button>
          </label>
          <label className="flex items-center justify-between gap-3 cursor-pointer">
            <span className="text-sm text-[var(--text-primary)]">یادآوری تاریخچه</span>
            <button
              type="button"
              role="switch"
              aria-checked={notifPrefs.historyReminders}
              onClick={() => toggleNotifPref('historyReminders')}
              className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-[var(--motion-fast)] ${
                notifPrefs.historyReminders
                  ? 'bg-[var(--color-primary)]'
                  : 'bg-[var(--color-secondary)]'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 rounded-full bg-white transition-transform duration-[var(--motion-fast)] ${
                  notifPrefs.historyReminders
                    ? 'translate-x-1 rtl:-translate-x-1'
                    : '-translate-x-5 rtl:translate-x-5'
                }`}
              />
            </button>
          </label>
        </div>
      </section>

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
                      historyRecoveryPendingRef.current = true;
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
                  {historyRecoveryNotice && (
                    <p role="status" className="text-sm font-semibold text-[var(--color-success)]">
                      {historyRecoveryNotice}
                    </p>
                  )}
                </div>
              )}
              {historyStatus === 'ready' && (
                <div className="space-y-2">
                  {historyRecoveryNotice && (
                    <p role="status" className="text-sm font-semibold text-[var(--color-success)]">
                      {historyRecoveryNotice}
                    </p>
                  )}
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
    </div>
  );
}
