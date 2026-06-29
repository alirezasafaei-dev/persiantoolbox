import type { PlanId } from '@/lib/subscriptionPlans';

export type UserInfo = {
  id: string;
  email: string;
  createdAt: number;
  role?: string;
};

export type SubscriptionInfo = {
  id: string;
  planId: PlanId;
  status: 'active' | 'canceled' | 'expired';
  startedAt: number;
  expiresAt: number;
};

export type HistoryEntry = {
  id: string;
  tool: string;
  inputSummary: string;
  outputSummary: string;
  createdAt: number;
};

export type ActivityItem = {
  id: string;
  type: 'tool_use' | 'login' | 'subscription';
  title: string;
  detail?: string;
  timestamp: number;
};

export type PaymentEntry = {
  id: string;
  amount: number;
  method: string;
  status: string;
  createdAt: number;
};

export type NotificationPrefs = {
  emailNotifications: boolean;
  historyReminders: boolean;
  pushNotifications: boolean;
};

export type UsageData = {
  lastUpdated: number;
  totalViews: number;
  paths: Record<string, number>;
};

export const TOOL_NAMES: Record<string, string> = {
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

export const NOTIFICATION_STORAGE_KEY = 'persian-tools.notifications.v1';

export function formatDate(value: number) {
  return new Intl.DateTimeFormat('fa-IR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export function formatDateShort(value: number) {
  return new Intl.DateTimeFormat('fa-IR', {
    dateStyle: 'medium',
  }).format(new Date(value));
}

export function getToolDisplayName(path: string): string {
  if (TOOL_NAMES[path]) {
    return TOOL_NAMES[path];
  }
  const segments = path.split('/');
  const slug = segments[segments.length - 1] ?? path;
  return slug.replace(/-/g, ' ');
}

export function loadNotificationPrefs(): NotificationPrefs {
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

export function saveNotificationPrefs(prefs: NotificationPrefs) {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(prefs));
}

export function buildActivityTimeline(history: HistoryEntry[], usage: UsageData): ActivityItem[] {
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

export function validateEmail(email: string): string | null {
  if (!email.trim()) {
    return 'ایمیل الزامی است';
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'فرمت ایمیل صحیح نیست';
  }
  return null;
}

export function validatePassword(password: string): string | null {
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

export function getPasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
} {
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
