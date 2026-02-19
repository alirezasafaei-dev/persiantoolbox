import type { Metadata } from 'next';

export type FeatureId =
  | 'support'
  | 'ads'
  | 'plans'
  | 'account'
  | 'subscription'
  | 'history'
  | 'history-share'
  | 'auth'
  | 'admin-site-settings'
  | 'admin-monetization'
  | 'developers'
  | 'checkout'
  | 'dashboard'
  | 'subscription-roadmap';

type FeatureConfig = {
  id: FeatureId;
  title: string;
  path?: string;
  defaultEnabled: boolean;
  category: 'monetization' | 'account' | 'admin' | 'platform';
  disabledMessage: string;
  disabledRedirect?: string;
  robots?: {
    enabled?: Metadata['robots'];
    disabled?: Metadata['robots'];
  };
};

const features: Record<FeatureId, FeatureConfig> = {
  support: {
    id: 'support',
    title: 'حمایت و پشتیبانی',
    path: '/support',
    defaultEnabled: false,
    category: 'monetization',
    disabledMessage: 'صفحه حمایت در این نسخه غیرفعال است.',
    disabledRedirect: '/',
  },
  ads: {
    id: 'ads',
    title: 'شفافیت تبلیغات',
    path: '/ads',
    defaultEnabled: false,
    category: 'monetization',
    disabledMessage: 'مدیریت و شفافیت تبلیغات در این نسخه فعال نیست.',
  },
  plans: {
    id: 'plans',
    title: 'طرح‌های اشتراک',
    path: '/plans',
    defaultEnabled: false,
    category: 'monetization',
    disabledMessage: 'طرح‌های اشتراک هنوز منتشر نشده‌اند.',
  },
  account: {
    id: 'account',
    title: 'حساب کاربری',
    path: '/account',
    defaultEnabled: false,
    category: 'account',
    disabledMessage: 'ورود و حساب کاربری در این نسخه غیرفعال است.',
  },
  subscription: {
    id: 'subscription',
    title: 'اشتراک‌ها',
    defaultEnabled: false,
    category: 'monetization',
    disabledMessage: 'عملیات اشتراک (پرداخت، تأیید، وبهوک) در این نسخه غیرفعال است.',
  },
  history: {
    id: 'history',
    title: 'تاریخچه پردازش',
    defaultEnabled: false,
    category: 'account',
    disabledMessage: 'ذخیره و بازیابی تاریخچه در این نسخه غیرفعال است.',
  },
  'history-share': {
    id: 'history-share',
    title: 'اشتراک تاریخچه',
    defaultEnabled: false,
    category: 'account',
    disabledMessage: 'اشتراک تاریخچه در این نسخه غیرفعال است.',
  },
  auth: {
    id: 'auth',
    title: 'احراز هویت',
    defaultEnabled: false,
    category: 'account',
    disabledMessage: 'احراز هویت و نشست‌ها در این نسخه غیرفعال است.',
  },
  'admin-site-settings': {
    id: 'admin-site-settings',
    title: 'تنظیمات سایت (ادمین)',
    path: '/admin/site-settings',
    defaultEnabled: false,
    category: 'admin',
    disabledMessage: 'پنل تنظیمات ادمین در این نسخه غیرفعال است.',
  },
  'admin-monetization': {
    id: 'admin-monetization',
    title: 'مدیریت درآمدزایی (ادمین)',
    path: '/admin/monetization',
    defaultEnabled: false,
    category: 'admin',
    disabledMessage: 'پنل درآمدزایی ادمین در این نسخه غیرفعال است.',
  },
  developers: {
    id: 'developers',
    title: 'راهنمای توسعه‌دهندگان',
    path: '/developers',
    defaultEnabled: false,
    category: 'platform',
    disabledMessage: 'راهنمای توسعه‌دهندگان هنوز منتشر نشده است.',
  },
  checkout: {
    id: 'checkout',
    title: 'تسویه/Checkout',
    path: '/checkout',
    defaultEnabled: false,
    category: 'monetization',
    disabledMessage: 'فرآیند پرداخت در این نسخه غیرفعال است.',
  },
  dashboard: {
    id: 'dashboard',
    title: 'داشبورد حساب',
    path: '/dashboard',
    defaultEnabled: false,
    category: 'account',
    disabledMessage: 'داشبورد حساب هنوز در دسترس نیست.',
  },
  'subscription-roadmap': {
    id: 'subscription-roadmap',
    title: 'نقشه راه اشتراک',
    path: '/subscription-roadmap',
    defaultEnabled: false,
    category: 'monetization',
    disabledMessage: 'نقشه راه اشتراک در این نسخه غیرفعال است.',
  },
};

const disabledRobots: Metadata['robots'] = { index: false, follow: false };

const envKeyFor = (id: FeatureId) => `FEATURE_${id.toUpperCase().replace(/-/g, '_')}_ENABLED`;

function resolveEnabled(id: FeatureId, defaultEnabled: boolean): boolean {
  const raw = process.env[envKeyFor(id)];
  if (raw === undefined) {
    return defaultEnabled;
  }
  const normalized = raw.toLowerCase();
  if (normalized === '1' || normalized === 'true') {
    return true;
  }
  if (normalized === '0' || normalized === 'false') {
    return false;
  }
  return defaultEnabled;
}

export function getFeatureInfo(
  id: FeatureId,
): FeatureConfig & { envKey: string; enabled: boolean } {
  const config = features[id];
  if (!config) {
    throw new Error(`Unknown feature id: ${id}`);
  }
  const enabled = resolveEnabled(id, config.defaultEnabled);
  return {
    ...config,
    envKey: envKeyFor(id),
    enabled,
    robots: {
      enabled: config.robots?.enabled,
      disabled: config.robots?.disabled ?? disabledRobots,
    },
  };
}

export function isFeatureEnabled(id: FeatureId): boolean {
  return getFeatureInfo(id).enabled;
}

export function featurePageMetadata(id: FeatureId, overrides: Partial<Metadata> = {}): Metadata {
  const info = getFeatureInfo(id);
  return {
    title: overrides.title ?? info.title,
    description: overrides.description,
    robots: info.enabled ? info.robots?.enabled : info.robots?.disabled,
    ...overrides,
  };
}

export function getFeatureHref(id: FeatureId): string {
  const info = getFeatureInfo(id);
  if (info.enabled && info.path) {
    return info.path;
  }
  if (info.id !== 'support' && isFeatureEnabled('support')) {
    return features.support.path ?? '/support';
  }
  return info.disabledRedirect ?? '/';
}

export type FeatureDisabledPayload = {
  ok: false;
  feature: FeatureId;
  status: 'disabled';
  message: string;
  envKey: string;
};

export function buildDisabledApiBody(id: FeatureId): FeatureDisabledPayload {
  const info = getFeatureInfo(id);
  return {
    ok: false,
    feature: id,
    status: 'disabled',
    message: info.disabledMessage,
    envKey: info.envKey,
  };
}

export const featureIds = Object.keys(features) as FeatureId[];
