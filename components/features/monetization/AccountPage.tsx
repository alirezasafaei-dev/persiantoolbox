'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AsyncState } from '@/components/ui';
import { type PlanId } from '@/lib/subscriptionPlans';
import UserBadges from '@/components/ui/UserBadges';
import { getUsageSnapshot } from '@/shared/analytics/localUsage';
import { usePushNotifications } from '@/shared/hooks/usePushNotifications';
import PremiumFeatureHighlights from '@/components/features/monetization/PremiumFeatureHighlights';
import ChangePasswordSection from './ChangePasswordSection';
import AuthForms from './AuthForms';
import ProfileHeader from './ProfileHeader';
import QuickAccessGrid from './QuickAccessGrid';
import StatsCards from './StatsCards';
import RecentActivities from './RecentActivities';
import SubscriptionSection from './SubscriptionSection';
import PaymentHistoryTable from './PaymentHistoryTable';
import TopToolsSection from './TopToolsSection';
import ActivityTimelineSection from './ActivityTimelineSection';
import NotificationSettings from './NotificationSettings';
import WorkHistorySection from './WorkHistorySection';
import {
  type UserInfo,
  type SubscriptionInfo,
  type HistoryEntry,
  type PaymentEntry,
  type NotificationPrefs,
  type UsageData,
  buildActivityTimeline,
  validateEmail,
  validatePassword,
  getPasswordStrength,
  loadNotificationPrefs,
  saveNotificationPrefs,
  getToolDisplayName,
} from './account-utils';

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
  const [planId, setPlanId] = useState<PlanId>('basic');
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
    const paths = usageSnapshot.paths ?? ({} as Record<string, number>);
    return Object.entries(paths)
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
      for (const [path] of Object.entries(
        usageSnapshot.paths ?? ({} as Record<string, number>),
      ).sort(([, a], [, b]) => b - a)) {
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

  const handleHistoryRetry = useCallback(async () => {
    historyRecoveryPendingRef.current = true;
    await loadHistory();
  }, [loadHistory]);

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
      <AuthForms
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        authError={authError}
        loginEmail={loginEmail}
        setLoginEmail={setLoginEmail}
        loginPassword={loginPassword}
        setLoginPassword={setLoginPassword}
        showLoginPassword={showLoginPassword}
        setShowLoginPassword={setShowLoginPassword}
        loginErrors={loginErrors}
        touchedFields={touchedFields}
        registerEmail={registerEmail}
        setRegisterEmail={setRegisterEmail}
        registerPassword={registerPassword}
        setRegisterPassword={setRegisterPassword}
        registerConfirmPassword={registerConfirmPassword}
        setRegisterConfirmPassword={setRegisterConfirmPassword}
        showRegisterPassword={showRegisterPassword}
        setShowRegisterPassword={setShowRegisterPassword}
        showConfirmPassword={showConfirmPassword}
        setShowConfirmPassword={setShowConfirmPassword}
        registerErrors={registerErrors}
        registerSuccess={registerSuccess}
        passwordStrength={passwordStrength}
        showPasswordStrength={showPasswordStrength}
        handleLogin={handleLogin}
        handleRegister={handleRegister}
        markTouched={markTouched}
        loginLoading={loginLoading}
        registerLoading={registerLoading}
      />
    );
  }

  return (
    <div className="space-y-10">
      <ProfileHeader
        user={user}
        subscription={subscription}
        uniqueToolsUsed={uniqueToolsUsed}
        accountRecoveryNotice={accountRecoveryNotice}
        handleLogout={handleLogout}
      />

      <QuickAccessGrid userRole={user.role} />

      <StatsCards
        uniqueToolsUsed={uniqueToolsUsed}
        usageSnapshot={usageSnapshot}
        subscription={subscription}
        history={history}
      />

      <RecentActivities recentActivities={recentActivities} />

      <UserBadges />

      <SubscriptionSection
        subscription={subscription}
        planId={planId}
        setPlanId={setPlanId}
        handleCheckout={handleCheckout}
      />

      <PaymentHistoryTable
        paymentHistory={paymentHistory}
        paymentHistoryLoading={paymentHistoryLoading}
      />

      <section>
        <h3 className="text-lg font-bold text-[var(--text-primary)] mb-3">امکانات پریمیوم</h3>
        <PremiumFeatureHighlights />
      </section>

      <TopToolsSection topTools={topTools} />

      <ActivityTimelineSection activityTimeline={activityTimeline} />

      <ChangePasswordSection />

      <NotificationSettings
        notifPrefs={notifPrefs}
        toggleNotifPref={toggleNotifPref}
        pushSupported={pushSupported}
        pushLoading={pushLoading}
      />

      <WorkHistorySection
        subscription={subscription}
        historyStatus={historyStatus}
        history={history}
        historyRecoveryNotice={historyRecoveryNotice}
        historyTool={historyTool}
        setHistoryTool={setHistoryTool}
        historyInput={historyInput}
        setHistoryInput={setHistoryInput}
        historyOutput={historyOutput}
        setHistoryOutput={setHistoryOutput}
        handleHistorySample={handleHistorySample}
        handleHistoryClear={handleHistoryClear}
        loadHistory={handleHistoryRetry}
      />
    </div>
  );
}
