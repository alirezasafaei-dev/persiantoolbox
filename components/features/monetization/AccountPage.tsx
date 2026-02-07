'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AsyncState, Button, Card } from '@/components/ui';
import Input from '@/shared/ui/Input';
import { SUBSCRIPTION_PLANS, type PlanId } from '@/lib/subscriptionPlans';

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

const formatDate = (value: number) =>
  new Intl.DateTimeFormat('fa-IR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));

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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [planId, setPlanId] = useState<PlanId>('basic_monthly');
  const [historyTool, setHistoryTool] = useState('pdf-merge');
  const [historyInput, setHistoryInput] = useState('3 فایل PDF');
  const [historyOutput, setHistoryOutput] = useState('merge.pdf');

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
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
      setAuthError('ثبت‌نام ناموفق بود. لطفاً ایمیل یا رمز را بررسی کنید.');
      return;
    }
    await loadAccount();
  };

  const handleLogin = async () => {
    setAuthError(null);
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
      setAuthError('ورود ناموفق بود. لطفاً اطلاعات را بررسی کنید.');
      return;
    }
    await loadAccount();
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    setSubscription(null);
    setHistory([]);
  };

  const handleCheckout = async () => {
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
  };

  const handleHistorySample = async () => {
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
  };

  const handleHistoryClear = async () => {
    await fetch('/api/history', { method: 'DELETE' });
    setHistory([]);
  };

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
            <Input label="ایمیل" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Input
              label="رمز عبور"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button type="button" onClick={handleRegister}>
              ثبت‌نام
            </Button>
          </Card>

          <Card className="p-6 space-y-4">
            <div className="text-lg font-bold">ورود</div>
            <Input label="ایمیل" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Input
              label="رمز عبور"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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

      <section className="grid gap-4 md:grid-cols-2">
        <Card className="p-6 space-y-3">
          <div className="text-lg font-bold">وضعیت اشتراک</div>
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
          <div className="text-lg font-bold">شروع اشتراک</div>
          <label className="space-y-2 text-sm text-[var(--text-primary)]">
            انتخاب پلن
            <select
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
          <div className="text-xs text-[var(--text-muted)]">
            این مسیر فعلاً پرداخت آزمایشی است و بعداً به درگاه واقعی متصل می‌شود.
          </div>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
        <Card className="p-6 space-y-4">
          <div className="text-lg font-bold">تاریخچه کارها</div>
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
          <div className="text-lg font-bold">ثبت نمونه تاریخچه</div>
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
