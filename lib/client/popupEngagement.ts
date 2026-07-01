export const POPUP_THRESHOLDS = {
  ACCOUNT_ENGAGEMENT: 8,
  PREMIUM_ENGAGEMENT: 15,
} as const;

export const POPUP_TIMING = {
  WELCOME_DELAY_MS: 25_000,
  WELCOME_MIN_SCROLL_PX: 320,
  EXIT_MIN_TIME_ON_SITE_MS: 60_000,
  EXIT_MIN_ENGAGEMENT: 2,
  TOOL_ENGAGEMENT_DELAY_MS: 45_000,
  PWA_INSTALL_DELAY_MS: 30_000,
} as const;

export const POPUP_EXCLUDED_PREFIXES = ['/admin', '/account', '/pricing'] as const;

const ENGAGEMENT_KEY = 'persiantoolbox.usage.count';
const DISMISS_KEYS = {
  welcome: 'persiantoolbox.cta.dismissed.welcome',
  account: 'persiantoolbox.cta.dismissed.account',
  premium: 'persiantoolbox.cta.dismissed.premium',
} as const;
const EXIT_DISMISSED_KEY = 'persiantoolbox.exit.dismissed';
const EXIT_SHOWN_SESSION_KEY = 'persiantoolbox.exit.shown.session';
const TOOL_ENGAGEMENT_PREFIX = 'persiantoolbox.tool.engagement.';
export const ENGAGEMENT_CHANGED_EVENT = 'persiantoolbox:engagement-changed';

export function getEngagementCount(): number {
  if (typeof window === 'undefined') {
    return 0;
  }
  try {
    return parseInt(localStorage.getItem(ENGAGEMENT_KEY) ?? '0', 10);
  } catch {
    return 0;
  }
}

export function incrementEngagement(): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    const count = getEngagementCount() + 1;
    localStorage.setItem(ENGAGEMENT_KEY, String(count));
    window.dispatchEvent(new CustomEvent(ENGAGEMENT_CHANGED_EVENT, { detail: { count } }));
  } catch {
    // ignore
  }
}

/** @deprecated Use incrementEngagement — kept for existing imports */
export const incrementUsage = incrementEngagement;

export function isCtaDismissed(variant: Exclude<SmartCtaVariant, null>): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  try {
    const key = DISMISS_KEYS[variant];
    const storage = variant === 'welcome' ? sessionStorage : localStorage;
    return storage.getItem(key) === '1';
  } catch {
    return false;
  }
}

export function dismissCta(variant: Exclude<SmartCtaVariant, null>): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    const key = DISMISS_KEYS[variant];
    const storage = variant === 'welcome' ? sessionStorage : localStorage;
    storage.setItem(key, '1');
  } catch {
    // ignore
  }
}

export function isExitIntentDismissed(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  try {
    return localStorage.getItem(EXIT_DISMISSED_KEY) === '1';
  } catch {
    return false;
  }
}

export function dismissExitIntent(): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    localStorage.setItem(EXIT_DISMISSED_KEY, '1');
  } catch {
    // ignore
  }
}

export function wasExitIntentShownThisSession(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  try {
    return sessionStorage.getItem(EXIT_SHOWN_SESSION_KEY) === '1';
  } catch {
    return false;
  }
}

export function markExitIntentShownThisSession(): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    sessionStorage.setItem(EXIT_SHOWN_SESSION_KEY, '1');
  } catch {
    // ignore
  }
}

export function wasToolEngagementCounted(toolId: string): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  try {
    return sessionStorage.getItem(`${TOOL_ENGAGEMENT_PREFIX}${toolId}`) === '1';
  } catch {
    return false;
  }
}

export function markToolEngagementCounted(toolId: string): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    sessionStorage.setItem(`${TOOL_ENGAGEMENT_PREFIX}${toolId}`, '1');
  } catch {
    // ignore
  }
}

export type SmartCtaVariant = 'welcome' | 'account' | 'premium' | null;

export function isPopupExcludedPath(pathname: string): boolean {
  return POPUP_EXCLUDED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function resolveSmartCtaVariant(params: {
  engagementCount: number;
  isHomepage: boolean;
  welcomeReady: boolean;
  hasScrolledEnough: boolean;
  dismissedWelcome: boolean;
  dismissedAccount: boolean;
  dismissedPremium: boolean;
}): SmartCtaVariant {
  if (params.engagementCount >= POPUP_THRESHOLDS.PREMIUM_ENGAGEMENT && !params.dismissedPremium) {
    return 'premium';
  }

  if (params.engagementCount >= POPUP_THRESHOLDS.ACCOUNT_ENGAGEMENT && !params.dismissedAccount) {
    return 'account';
  }

  if (
    params.engagementCount === 0 &&
    params.isHomepage &&
    params.welcomeReady &&
    params.hasScrolledEnough &&
    !params.dismissedWelcome
  ) {
    return 'welcome';
  }

  return null;
}

export function shouldAllowExitIntent(params: {
  dismissed: boolean;
  timeOnSiteMs: number;
  engagementCount: number;
  isDesktop: boolean;
  excludedPath: boolean;
  alreadyShownThisSession: boolean;
}): boolean {
  if (
    params.dismissed ||
    params.excludedPath ||
    !params.isDesktop ||
    params.alreadyShownThisSession
  ) {
    return false;
  }

  if (params.timeOnSiteMs < POPUP_TIMING.EXIT_MIN_TIME_ON_SITE_MS) {
    return false;
  }

  if (params.engagementCount < POPUP_TIMING.EXIT_MIN_ENGAGEMENT) {
    return false;
  }

  return true;
}
