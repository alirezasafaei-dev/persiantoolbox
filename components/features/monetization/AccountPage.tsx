'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AsyncState, Button, Card } from '@/components/ui';
import Input from '@/shared/ui/Input';
import { SUBSCRIPTION_PLANS, type PlanId } from '@/lib/subscriptionPlans';
import UserBadges from '@/components/ui/UserBadges';
import { getUsageSnapshot } from '@/shared/analytics/localUsage';
import { usePushNotifications } from '@/shared/hooks/usePushNotifications';
import PremiumFeatureHighlights from '@/components/features/monetization/PremiumFeatureHighlights';

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

type PaymentEntry = {
  id: string;
  amount: number;
  method: string;
  status: string;
  createdAt: number;
};

type NotificationPrefs = {
  emailNotifications: boolean;
  historyReminders: boolean;
  pushNotifications: boolean;
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
    return { emailNotifications: true, historyReminders: true, pushNotifications: false };
  }
  try {
    const raw = window.localStorage.getItem(NOTIFICATION_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as NotificationPrefs;
      return { ...parsed, pushNotifications: parsed.pushNotifications ?? false };
    }
  } catch {
    // ignore
  }
  return { emailNotifications: true, historyReminders: true, pushNotifications: false };
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

function validateEmail(email: string): string | null {
  if (!email.trim()) {
    return 'ایمیل الزامی است';
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'فرمت ایمیل صحیح نیست';
  }
  return null;
}

function validatePassword(password: string): string | null {
  if (!password) {
    return 'رمز عبور الزامی است';
  }
  if (password.length < 8) {
    return 'رمز عبور باید حداقل ۸ کاراکتر باشد';
  }
  if (!/[a-zA-Z]/.test(password)) {
    return 'رمز عبور باید حداقل شامل یک حرف باشد';
  }
  if (!/[0-9]/.test(password)) {
    return 'رمز عبور باید حداقل شامل یک عدد باشد';
  }
  return null;
}

function getPasswordStrength(password: string): { score: number; label: string; color: string } {
  let score = 0;
  if (password.length >= 8) {
    score++;
  }
  if (password.length >= 12) {
    score++;
  }
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) {
    score++;
  }
  if (/[0-9]/.test(password)) {
    score++;
  }
  if (/[^a-zA-Z0-9]/.test(password)) {
    score++;
  }

  if (score <= 1) {
    return { score, label: 'ضعیف', color: 'var(--color-danger)' };
  }
  if (score <= 2) {
    return { score, label: 'متوسط', color: 'var(--color-warning, #f59e0b)' };
  }
  if (score <= 3) {
    return { score, label: 'خوب', color: 'var(--color-primary)' };
  }
  return { score, label: 'عالی', color: 'var(--color-success)' };
}

type AuthTab = 'login' | 'register';

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
  const [activeTab, setActiveTab] = useState<AuthTab>('login');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loginErrors, setLoginErrors] = useState<{ email?: string; password?: string }>({});
  const [registerErrors, setRegisterErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
  const [planId, setPlanId] = useState<PlanId>('basic-monthly');
  const [historyTool, setHistoryTool] = useState('pdf-merge');
  const [historyInput, setHistoryInput] = useState('3 فایل PDF');
  const [historyOutput, setHistoryOutput] = useState('merge.pdf');
  const [usageSnapshot, setUsageSnapshot] = useState<UsageData>({
    lastUpdated: 0,
    totalViews: 0,
    paths: {},
  });
  const [paymentHistory, setPaymentHistory] = useState<PaymentEntry[]>([]);
  const [paymentHistoryLoading, setPaymentHistoryLoading] = useState(false);
  const [notifPrefs, setNotifPrefs] = useState<NotificationPrefs>({
    emailNotifications: true,
    historyReminders: true,
    pushNotifications: false,
  });

  const {
    isSupported: pushSupported,
    isSubscribed: pushSubscribed,
    subscribe: subscribePush,
    unsubscribe: unsubscribePush,
    isLoading: pushLoading,
  } = usePushNotifications();

  useEffect(() => {
    setUsageSnapshot(getUsageSnapshot());
    setNotifPrefs(loadNotificationPrefs());
  }, []);

  useEffect(() => {
    setNotifPrefs((prev) => ({
      ...prev,
      pushNotifications: pushSubscribed,
    }));
  }, [pushSubscribed]);

  useEffect(() => {
    setNotifPrefs((prev) => ({
      ...prev,
      pushNotifications: pushSubscribed,
    }));
  }, [pushSubscribed]);

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

  const loadPaymentHistory = useCallback(async () => {
    setPaymentHistoryLoading(true);
    try {
      const response = await fetch('/api/payments/history', { cache: 'no-store' });
      if (response.ok) {
        const data = (await response.json()) as { payments: PaymentEntry[] };
        setPaymentHistory(data.payments ?? []);
      }
    } catch {
      // silent
    } finally {
      setPaymentHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAccount();
  }, [loadAccount]);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  useEffect(() => {
    if (user) {
      void loadPaymentHistory();
    }
  }, [user, loadPaymentHistory]);

  const planOptions = useMemo(() => SUBSCRIPTION_PLANS, []);

  const markTouched = (field: string) => {
    setTouchedFields((prev) => ({ ...prev, [field]: true }));
  };

  const validateLoginForm = (): boolean => {
    const errors: { email?: string; password?: string } = {};
    const emailErr = validateEmail(loginEmail);
    if (emailErr) {
      errors.email = emailErr;
    }
    if (!loginPassword) {
      errors.password = 'رمز عبور الزامی است';
    }
    setLoginErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateRegisterForm = (): boolean => {
    const errors: { email?: string; password?: string; confirmPassword?: string } = {};
    const emailErr = validateEmail(registerEmail);
    if (emailErr) {
      errors.email = emailErr;
    }
    const passwordErr = validatePassword(registerPassword);
    if (passwordErr) {
      errors.password = passwordErr;
    }
    if (!registerConfirmPassword) {
      errors.confirmPassword = 'تکرار رمز عبور الزامی است';
    } else if (registerPassword !== registerConfirmPassword) {
      errors.confirmPassword = 'رمز عبور و تکرار آن مطابقت ندارند';
    }
    setRegisterErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegister = async () => {
    setAuthError(null);
    setRegisterSuccess(false);
    if (!validateRegisterForm()) {
      return;
    }
    setRegisterLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: registerEmail, password: registerPassword }),
      });
      const data = (await response.json().catch(() => ({}))) as { ok?: boolean; errors?: string[] };
      if (!response.ok || data.ok === false) {
        const apiErrors = data.errors ?? [];
        if (apiErrors.length > 0) {
          setAuthError(apiErrors[0] ?? 'ثبت‌نام ناموفق بود.');
        } else {
          setAuthError('ثبت‌نام ناموفق بود. لطفاً ایمیل یا رمز را بررسی کنید.');
        }
        return;
      }
      setRegisterSuccess(true);
      setRegisterEmail('');
      setRegisterPassword('');
      setRegisterConfirmPassword('');
      setRegisterErrors({});
      setTouchedFields({});
      await loadAccount();
    } catch {
      setAuthError('خطا در ارتباط با سرور.');
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleLogin = async () => {
    setAuthError(null);
    if (!validateLoginForm()) {
      return;
    }
    setLoginLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = (await response.json().catch(() => ({}))) as { ok?: boolean; errors?: string[] };
      if (!response.ok || data.ok === false) {
        const apiErrors = data.errors ?? [];
        if (apiErrors.length > 0) {
          setAuthError(apiErrors[0] ?? 'ورود ناموفق بود.');
        } else {
          setAuthError('ورود ناموفق بود. لطفاً اطلاعات را بررسی کنید.');
        }
        return;
      }
      await loadAccount();
    } catch {
      setAuthError('خطا در ارتباط با سرور.');
    } finally {
      setLoginLoading(false);
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

  const toggleNotifPref = async (key: keyof NotificationPrefs) => {
    if (key === 'pushNotifications') {
      if (pushSubscribed) {
        const success = await unsubscribePush();
        if (success) {
          setNotifPrefs((prev) => ({ ...prev, pushNotifications: false }));
        }
      } else {
        const success = await subscribePush();
        if (success) {
          setNotifPrefs((prev) => ({ ...prev, pushNotifications: true }));
        }
      }
      return;
    }

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

  const passwordStrength = getPasswordStrength(registerPassword);
  const showPasswordStrength = registerPassword.length > 0;

  const recentActivities = useMemo(() => {
    const items: { tool: string; path: string; name: string; timestamp: number }[] = [];
    for (const entry of history.slice(0, 5)) {
      const toolPath = entry.tool.startsWith('/') ? entry.tool : `/${entry.tool}`;
      items.push({
        tool: entry.tool,
        path: toolPath,
        name: getToolDisplayName(entry.tool),
        timestamp: entry.createdAt,
      });
    }
    if (items.length < 5) {
      const seen = new Set(items.map((i) => i.tool));
      for (const [path] of Object.entries(usageSnapshot.paths ?? {}).sort(
        ([, a], [, b]) => b - a,
      )) {
        if (items.length >= 5) {
          break;
        }
        const name = getToolDisplayName(path);
        if (!seen.has(path)) {
          items.push({ tool: path, path, name, timestamp: usageSnapshot.lastUpdated });
          seen.add(path);
        }
      }
    }
    return items;
  }, [history, usageSnapshot]);

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
      <div className="space-y-6 max-w-lg mx-auto px-4">
        <section className="text-center py-4">
          <h1 className="text-2xl md:text-3xl font-black text-[var(--text-primary)]">
            {activeTab === 'login' ? 'ورود به حساب' : 'ایجاد حساب جدید'}
          </h1>
          <p className="text-[var(--text-secondary)] mt-2 text-sm">
            {activeTab === 'login'
              ? 'برای فعال‌سازی تاریخچه کارها، وارد شوید.'
              : 'حساب بسازید و از امکانات بیشتر بهره‌مند شوید.'}
          </p>
        </section>

        <Card className="p-6 md:p-8">
          <div className="flex border-b border-[var(--border-light)] mb-6">
            <button
              type="button"
              className={`flex-1 py-3 text-sm font-bold transition-colors border-b-2 ${
                activeTab === 'login'
                  ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
                  : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
              onClick={() => {
                setActiveTab('login');
                setAuthError(null);
                setLoginErrors({});
              }}
            >
              ورود
            </button>
            <button
              type="button"
              className={`flex-1 py-3 text-sm font-bold transition-colors border-b-2 ${
                activeTab === 'register'
                  ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
                  : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
              onClick={() => {
                setActiveTab('register');
                setAuthError(null);
                setRegisterErrors({});
                setRegisterSuccess(false);
              }}
            >
              ثبت‌نام
            </button>
          </div>

          {authError && (
            <div
              role="alert"
              className="mb-4 p-3 rounded-[var(--radius-md)] bg-[var(--color-danger)]/10 border border-[var(--color-danger)]/20 text-sm text-[var(--color-danger)]"
            >
              {authError}
            </div>
          )}

          {activeTab === 'login' && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleLogin();
              }}
              className="space-y-4"
            >
              <Input
                label="ایمیل"
                type="email"
                dir="ltr"
                placeholder="example@email.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                onBlur={() => markTouched('loginEmail')}
                {...(touchedFields['loginEmail'] && loginErrors.email
                  ? { error: loginErrors.email }
                  : {})}
              />
              <Input
                label="رمز عبور"
                type={showLoginPassword ? 'text' : 'password'}
                dir="ltr"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                onBlur={() => markTouched('loginPassword')}
                {...(touchedFields['loginPassword'] && loginErrors.password
                  ? { error: loginErrors.password }
                  : {})}
                endAction={
                  <button
                    type="button"
                    tabIndex={-1}
                    className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    aria-label={showLoginPassword ? 'مخفی کردن رمز' : 'نمایش رمز'}
                  >
                    {showLoginPassword ? (
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                }
              />
              <Button type="submit" fullWidth isLoading={loginLoading}>
                ورود
              </Button>
            </form>
          )}

          {activeTab === 'register' && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleRegister();
              }}
              className="space-y-4"
            >
              {registerSuccess && (
                <div
                  role="status"
                  className="p-3 rounded-[var(--radius-md)] bg-[var(--color-success)]/10 border border-[var(--color-success)]/20 text-sm text-[var(--color-success)]"
                >
                  ثبت‌نام با موفقیت انجام شد. در حال انتقال به حساب کاربری...
                </div>
              )}
              <Input
                label="ایمیل"
                type="email"
                dir="ltr"
                placeholder="example@email.com"
                value={registerEmail}
                onChange={(e) => setRegisterEmail(e.target.value)}
                onBlur={() => markTouched('registerEmail')}
                {...(touchedFields['registerEmail'] && registerErrors.email
                  ? { error: registerErrors.email }
                  : {})}
              />
              <div>
                <Input
                  label="رمز عبور"
                  type={showRegisterPassword ? 'text' : 'password'}
                  dir="ltr"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  onBlur={() => markTouched('registerPassword')}
                  {...(touchedFields['registerPassword'] && registerErrors.password
                    ? { error: registerErrors.password }
                    : {})}
                  endAction={
                    <button
                      type="button"
                      tabIndex={-1}
                      className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                      onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                      aria-label={showRegisterPassword ? 'مخفی کردن رمز' : 'نمایش رمز'}
                    >
                      {showRegisterPassword ? (
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                      ) : (
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  }
                />
                {showPasswordStrength && (
                  <div className="mt-2 space-y-1">
                    <div className="flex gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div
                          key={i}
                          className="h-1 flex-1 rounded-full transition-colors"
                          style={{
                            backgroundColor:
                              i < passwordStrength.score
                                ? passwordStrength.color
                                : 'var(--border-light)',
                          }}
                        />
                      ))}
                    </div>
                    <p className="text-xs" style={{ color: passwordStrength.color }}>
                      قدرت رمز: {passwordStrength.label}
                    </p>
                  </div>
                )}
              </div>
              <Input
                label="تکرار رمز عبور"
                type={showConfirmPassword ? 'text' : 'password'}
                dir="ltr"
                value={registerConfirmPassword}
                onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                onBlur={() => markTouched('registerConfirmPassword')}
                {...(touchedFields['registerConfirmPassword'] && registerErrors.confirmPassword
                  ? { error: registerErrors.confirmPassword }
                  : {})}
                endAction={
                  <button
                    type="button"
                    tabIndex={-1}
                    className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? 'مخفی کردن رمز' : 'نمایش رمز'}
                  >
                    {showConfirmPassword ? (
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                }
              />
              <Button type="submit" fullWidth isLoading={registerLoading}>
                ثبت‌نام
              </Button>
            </form>
          )}
        </Card>

        <p className="text-center text-xs text-[var(--text-muted)]">
          با {activeTab === 'login' ? 'ورود' : 'ثبت‌نام'}، شما{' '}
          <Link href="/terms" className="underline hover:text-[var(--color-primary)]">
            شرایط استفاده
          </Link>{' '}
          را می‌پذیرید.
        </p>
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
            <div className="flex items-center gap-2 mt-1">
              <p className="text-[var(--text-secondary)]">{user.email}</p>
              {subscription && subscription.status === 'active' && (
                <span className="inline-flex items-center gap-1 rounded-full bg-[rgb(var(--color-primary-rgb)/0.12)] px-2.5 py-0.5 text-xs font-bold text-[var(--color-primary)]">
                  ⭐ پریمیوم
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-[var(--text-muted)]">
              <span className="inline-flex items-center gap-1 rounded-full bg-[var(--surface-2)] px-2.5 py-1">
                📅 عضویت از {formatDateShort(user.createdAt)}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-[var(--surface-2)] px-2.5 py-1">
                🔧 {uniqueToolsUsed.toLocaleString('fa-IR')} ابزار استفاده‌شده
              </span>
              {subscription && subscription.status === 'active' && (
                <>
                  <span className="rounded-full bg-[var(--surface-2)] px-2.5 py-1">
                    پلن:{' '}
                    {SUBSCRIPTION_PLANS.find((p) => p.id === subscription.planId)?.title ??
                      subscription.planId}
                  </span>
                  <span className="rounded-full bg-[var(--surface-2)] px-2.5 py-1">
                    انقضا: {formatDateShort(subscription.expiresAt)}
                  </span>
                </>
              )}
            </div>
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

      <section>
        <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">دسترسی سریع</h2>
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {[
            { href: '/dashboard/financial', icon: '📊', label: 'داشبورد مالی' },
            { href: '/tools', icon: '🧰', label: 'ابزارهای مالی' },
            { href: '/history', icon: '📜', label: 'تاریخچه استفاده' },
            { href: '/favorites', icon: '❤️', label: 'علاقه‌مندی‌ها' },
            { href: '/subscription', icon: '⭐', label: 'اشتراک' },
            { href: '/blog', icon: '✍️', label: 'بلاگ' },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] px-5 py-4 text-[var(--text-primary)] hover:bg-[var(--surface-2)] hover:border-[var(--color-primary)]/30 transition-all duration-[var(--motion-normal)]"
            >
              <span className="text-xl flex-shrink-0" aria-hidden="true">
                {item.icon}
              </span>
              <span className="font-semibold text-sm">{item.label}</span>
              <svg
                className="me-auto w-4 h-4 text-[var(--text-muted)]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
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
        <Card className="p-5">
          <div className="text-sm text-[var(--text-muted)] mb-1">سناریوهای ذخیره‌شده</div>
          <div className="text-2xl font-black text-[var(--color-primary)]">
            {subscription ? '∞' : '۰'}
          </div>
        </Card>
        <Card className="p-5">
          <div className="text-sm text-[var(--text-muted)] mb-1">گزارش‌های تولیدشده</div>
          <div className="text-2xl font-black text-[var(--color-primary)]">
            {history.length.toLocaleString('fa-IR')}
          </div>
        </Card>
      </section>

      {recentActivities.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[var(--text-primary)]">فعالیت اخیر</h2>
            <Link
              href="/history"
              className="text-xs font-semibold text-[var(--color-primary)] hover:underline"
            >
              مشاهده همه
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-5">
            {recentActivities.map((activity, index) => (
              <Link
                key={`${activity.path}-${index}`}
                href={activity.path}
                className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] px-4 py-3 hover:bg-[var(--surface-2)] hover:border-[var(--color-primary)]/30 transition-all duration-[var(--motion-normal)]"
              >
                <div className="text-sm font-semibold text-[var(--text-primary)] truncate">
                  {activity.name}
                </div>
                <div className="text-xs text-[var(--text-muted)] mt-1">
                  {formatDate(activity.timestamp)}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

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
        <h3 className="text-lg font-bold text-[var(--text-primary)] mb-3">تاریخچه پرداخت‌ها</h3>
        {paymentHistoryLoading ? (
          <div className="text-sm text-[var(--text-muted)] py-4 text-center">
            در حال بارگذاری...
          </div>
        ) : paymentHistory.length === 0 ? (
          <div className="text-sm text-[var(--text-muted)] py-4 text-center">
            هنوز پرداختی ثبت نشده است.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border-light)]">
                  <th className="text-right py-2 px-3 text-xs font-semibold text-[var(--text-muted)]">
                    تاریخ
                  </th>
                  <th className="text-right py-2 px-3 text-xs font-semibold text-[var(--text-muted)]">
                    مبلغ
                  </th>
                  <th className="text-right py-2 px-3 text-xs font-semibold text-[var(--text-muted)]">
                    روش
                  </th>
                  <th className="text-right py-2 px-3 text-xs font-semibold text-[var(--text-muted)]">
                    وضعیت
                  </th>
                </tr>
              </thead>
              <tbody>
                {paymentHistory.map((payment) => (
                  <tr
                    key={payment.id}
                    className="border-b border-[var(--border-light)] last:border-0"
                  >
                    <td className="py-2 px-3 text-[var(--text-primary)]">
                      {formatDate(payment.createdAt)}
                    </td>
                    <td className="py-2 px-3 text-[var(--text-primary)] font-semibold">
                      {payment.amount.toLocaleString('fa-IR')} تومان
                    </td>
                    <td className="py-2 px-3 text-[var(--text-secondary)]">{payment.method}</td>
                    <td className="py-2 px-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold ${
                          payment.status === 'completed' || payment.status === 'paid'
                            ? 'bg-[var(--color-success)]/10 text-[var(--color-success)]'
                            : payment.status === 'failed' || payment.status === 'cancelled'
                              ? 'bg-[var(--color-danger)]/10 text-[var(--color-danger)]'
                              : 'bg-[var(--color-warning, #f59e0b)]/10 text-[var(--color-warning, #f59e0b)]'
                        }`}
                      >
                        {payment.status === 'completed' || payment.status === 'paid'
                          ? 'موفق'
                          : payment.status === 'failed'
                            ? 'ناموفق'
                            : payment.status === 'cancelled'
                              ? 'لغو شده'
                              : 'در انتظار'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <h3 className="text-lg font-bold text-[var(--text-primary)] mb-3">امکانات پریمیوم</h3>
        <PremiumFeatureHighlights />
      </section>

      {topTools.length > 0 && (
        <section className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-5">
          <h3 className="text-lg font-bold text-[var(--text-primary)] mb-3">
            ابزارهای پرتکرار شما
          </h3>
          <div className="flex flex-wrap gap-2">
            {topTools.map((tool) => (
              <Link
                key={tool.path}
                href={tool.path}
                className="inline-flex items-center gap-1 rounded-full border border-[var(--border-light)] bg-[var(--surface-2)] px-3 py-1.5 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--surface-3)] transition-colors"
              >
                {tool.name}
                <span className="text-[var(--text-muted)] text-xs">({tool.count})</span>
              </Link>
            ))}
          </div>
        </section>
      )}

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
          {pushSupported && (
            <label className="flex items-center justify-between gap-3 cursor-pointer">
              <div className="flex-1">
                <span className="text-sm text-[var(--text-primary)]">اعلان‌های فشاری (Push)</span>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  دریافت اعلان‌های فوری در مرورگر
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={notifPrefs.pushNotifications}
                onClick={() => void toggleNotifPref('pushNotifications')}
                disabled={pushLoading}
                className={`relative inline-flex h-8 w-14 shrink-0 items-center rounded-full transition-colors duration-[var(--motion-fast)] ${
                  notifPrefs.pushNotifications
                    ? 'bg-[var(--color-primary)]'
                    : 'bg-[var(--color-secondary)]'
                } ${pushLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span
                  className={`inline-block h-5 w-5 rounded-full bg-white transition-transform duration-[var(--motion-fast)] ${
                    notifPrefs.pushNotifications
                      ? 'translate-x-8 rtl:-translate-x-8'
                      : 'translate-x-1 rtl:-translate-x-1'
                  }`}
                />
              </button>
            </label>
          )}
          {!pushSupported && (
            <div className="text-xs text-[var(--text-muted)] bg-[var(--surface-2)] rounded-[var(--radius-md)] p-3">
              مرورگر شما از اعلان‌های فشاری پشتیبانی نمی‌کند.
            </div>
          )}
          <label className="flex items-center justify-between gap-3 cursor-pointer">
            <span className="text-sm text-[var(--text-primary)]">اعلان‌های ایمیلی</span>
            <button
              type="button"
              role="switch"
              aria-checked={notifPrefs.emailNotifications}
              onClick={() => void toggleNotifPref('emailNotifications')}
              className={`relative inline-flex h-8 w-14 shrink-0 items-center rounded-full transition-colors duration-[var(--motion-fast)] ${
                notifPrefs.emailNotifications
                  ? 'bg-[var(--color-primary)]'
                  : 'bg-[var(--color-secondary)]'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 rounded-full bg-white transition-transform duration-[var(--motion-fast)] ${
                  notifPrefs.emailNotifications
                    ? 'translate-x-8 rtl:-translate-x-8'
                    : 'translate-x-1 rtl:-translate-x-1'
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
              onClick={() => void toggleNotifPref('historyReminders')}
              className={`relative inline-flex h-8 w-14 shrink-0 items-center rounded-full transition-colors duration-[var(--motion-fast)] ${
                notifPrefs.historyReminders
                  ? 'bg-[var(--color-primary)]'
                  : 'bg-[var(--color-secondary)]'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 rounded-full bg-white transition-transform duration-[var(--motion-fast)] ${
                  notifPrefs.historyReminders
                    ? 'translate-x-8 rtl:-translate-x-8'
                    : 'translate-x-1 rtl:-translate-x-1'
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
