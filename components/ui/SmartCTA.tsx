'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Button from '@/shared/ui/Button';
import { getDisplayToolsCount } from '@/lib/tools-registry';
import { toPersianNumbers } from '@/shared/utils/localization/persian';
import { trackAnalyticsEvent, ANALYTICS_EVENTS } from '@/shared/analytics/events';
import {
  dismissCta,
  dismissExitIntent,
  ENGAGEMENT_CHANGED_EVENT,
  getEngagementCount,
  isCtaDismissed,
  isExitIntentDismissed,
  isPopupExcludedPath,
  markExitIntentShownThisSession,
  POPUP_TIMING,
  resolveSmartCtaVariant,
  shouldAllowExitIntent,
  wasExitIntentShownThisSession,
  type SmartCtaVariant,
} from '@/lib/client/popupEngagement';

export { incrementEngagement as incrementUsage } from '@/lib/client/popupEngagement';

const CTA_POSITION = 'fixed bottom-20 right-4 left-4 md:left-auto md:w-96 z-40 animate-slide-up';

type CtaContent = {
  icon: string;
  title: string;
  description: string;
  href: string;
  buttonLabel: string;
  dismissLabel: string;
  analyticsLocation: string;
  borderClass?: string;
  shadowClass?: string;
};

const CTA_CONTENT: Record<Exclude<SmartCtaVariant, null>, CtaContent> = {
  welcome: {
    icon: '👋',
    title: 'ابزارهای ما را امتحان کنید!',
    description: `بیش از ${toPersianNumbers(getDisplayToolsCount())} ابزار رایگان و آنلاین در اختیار شماست.`,
    href: '/tools',
    buttonLabel: 'مشاهده همه ابزارها',
    dismissLabel: 'بعداً',
    analyticsLocation: 'fab-zero',
  },
  account: {
    icon: '🧰',
    title: 'حساب کاربری بسازید',
    description: 'نتایج محاسبات خود را ذخیره و مدیریت کنید.',
    href: '/account',
    buttonLabel: 'ثبت‌نام رایگان',
    dismissLabel: 'بعداً',
    analyticsLocation: 'fab-account',
  },
  premium: {
    icon: '⭐',
    title: 'پریمیوم شوید!',
    description: 'با اشتراک پریمیوم به تمام ابزارها بدون محدودیت دسترسی داشته باشید.',
    href: '/pricing',
    buttonLabel: 'مشاهده پلن‌ها',
    dismissLabel: 'نه متشکرم',
    analyticsLocation: 'fab-premium',
    borderClass: 'border-[var(--color-primary)]/20',
    shadowClass: 'shadow-[var(--shadow-strong)]',
  },
};

function SmartCtaCard({
  variant,
  onDismiss,
}: {
  variant: Exclude<SmartCtaVariant, null>;
  onDismiss: () => void;
}) {
  const content = CTA_CONTENT[variant];

  return (
    <div className={CTA_POSITION}>
      <div
        className={`rounded-[var(--radius-lg)] border bg-[var(--surface-1)] p-4 backdrop-blur-xl ${
          content.borderClass ?? 'border-[var(--border-light)]'
        } ${content.shadowClass ?? 'shadow-lg'}`}
      >
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-lg">
            {content.icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-[var(--text-primary)]">{content.title}</p>
            <p className="mt-1 text-xs text-[var(--text-secondary)] leading-relaxed">
              {content.description}
            </p>
            <div className="mt-3 flex items-center gap-2">
              <Link
                href={content.href}
                onClick={() =>
                  trackAnalyticsEvent(ANALYTICS_EVENTS.CTA_CLICK, {
                    location: content.analyticsLocation,
                  })
                }
              >
                <Button size="sm">{content.buttonLabel}</Button>
              </Link>
              <button
                type="button"
                onClick={onDismiss}
                className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                {content.dismissLabel}
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={onDismiss}
            className="shrink-0 rounded-lg p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            aria-label="بستن"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export function SmartCTA() {
  const pathname = usePathname();
  const [engagementCount, setEngagementCount] = useState(0);
  const [welcomeReady, setWelcomeReady] = useState(false);
  const [hasScrolledEnough, setHasScrolledEnough] = useState(false);
  const [dismissed, setDismissed] = useState({
    welcome: false,
    account: false,
    premium: false,
  });
  const [activeVariant, setActiveVariant] = useState<SmartCtaVariant>(null);

  const isHomepage = pathname === '/';
  const excludedPath = isPopupExcludedPath(pathname);

  useEffect(() => {
    setEngagementCount(getEngagementCount());
    setDismissed({
      welcome: isCtaDismissed('welcome'),
      account: isCtaDismissed('account'),
      premium: isCtaDismissed('premium'),
    });

    const welcomeTimer = setTimeout(() => {
      setWelcomeReady(true);
    }, POPUP_TIMING.WELCOME_DELAY_MS);

    const handleScroll = () => {
      if (window.scrollY >= POPUP_TIMING.WELCOME_MIN_SCROLL_PX) {
        setHasScrolledEnough(true);
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    const syncEngagement = () => {
      setEngagementCount(getEngagementCount());
    };
    window.addEventListener('storage', syncEngagement);
    window.addEventListener(ENGAGEMENT_CHANGED_EVENT, syncEngagement);

    return () => {
      clearTimeout(welcomeTimer);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('storage', syncEngagement);
      window.removeEventListener(ENGAGEMENT_CHANGED_EVENT, syncEngagement);
    };
  }, []);

  useEffect(() => {
    if (excludedPath) {
      setActiveVariant(null);
      return;
    }

    setActiveVariant(
      resolveSmartCtaVariant({
        engagementCount,
        isHomepage,
        welcomeReady,
        hasScrolledEnough,
        dismissedWelcome: dismissed.welcome,
        dismissedAccount: dismissed.account,
        dismissedPremium: dismissed.premium,
      }),
    );
  }, [engagementCount, isHomepage, welcomeReady, hasScrolledEnough, dismissed, excludedPath]);

  const handleDismiss = useCallback((variant: Exclude<SmartCtaVariant, null>) => {
    dismissCta(variant);
    setDismissed((prev) => ({ ...prev, [variant]: true }));
  }, []);

  if (!activeVariant) {
    return null;
  }

  return <SmartCtaCard variant={activeVariant} onDismiss={() => handleDismiss(activeVariant)} />;
}

export function ExitIntentPopup() {
  const pathname = usePathname();
  const [show, setShow] = useState(false);
  const sessionStartRef = useRef(Date.now());
  const dismissedRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (isExitIntentDismissed()) {
      dismissedRef.current = true;
      return;
    }

    if (wasExitIntentShownThisSession()) {
      dismissedRef.current = true;
      return;
    }

    const isDesktop = window.matchMedia('(pointer: fine)').matches;

    const handler = (e: MouseEvent) => {
      if (dismissedRef.current || e.clientY > 0) {
        return;
      }

      const allowed = shouldAllowExitIntent({
        dismissed: dismissedRef.current,
        timeOnSiteMs: Date.now() - sessionStartRef.current,
        engagementCount: getEngagementCount(),
        isDesktop,
        excludedPath: isPopupExcludedPath(pathname),
        alreadyShownThisSession: wasExitIntentShownThisSession(),
      });

      if (allowed) {
        markExitIntentShownThisSession();
        setShow(true);
      }
    };

    document.addEventListener('mouseleave', handler);
    return () => document.removeEventListener('mouseleave', handler);
  }, [pathname]);

  const handleDismiss = useCallback(() => {
    setShow(false);
    dismissedRef.current = true;
    dismissExitIntent();
  }, []);

  if (!show) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <button
        type="button"
        onClick={handleDismiss}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            handleDismiss();
          }
        }}
        className="absolute inset-0"
        aria-label="بستن"
      />
      <div className="relative mx-4 w-full max-w-md rounded-[var(--radius-xl)] border border-[var(--border-light)] bg-[var(--surface-1)] p-8 shadow-[var(--shadow-strong)]">
        <div className="text-center space-y-4">
          <div className="text-5xl">🧰</div>
          <h3 className="text-xl font-bold text-[var(--text-primary)]">
            ابزارهای بیشتری کشف کنید!
          </h3>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            بیش از {toPersianNumbers(getDisplayToolsCount())} ابزار رایگان برای کار و زندگی.
            ابزارهای مالی، PDF، تصویر و متنی.
          </p>
          <div className="flex flex-col gap-2 pt-2">
            <Link
              href="/tools"
              onClick={() => {
                handleDismiss();
                trackAnalyticsEvent(ANALYTICS_EVENTS.CTA_CLICK, { location: 'exit-popup' });
              }}
            >
              <Button fullWidth>مشاهده همه ابزارها</Button>
            </Link>
            <Link
              href="/blog"
              onClick={() => {
                handleDismiss();
                trackAnalyticsEvent(ANALYTICS_EVENTS.CTA_CLICK, { location: 'exit-popup' });
              }}
            >
              <Button variant="secondary" fullWidth>
                مقالات آموزشی
              </Button>
            </Link>
          </div>
          <button
            type="button"
            onClick={handleDismiss}
            className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          >
            بستن
          </button>
        </div>
      </div>
    </div>
  );
}
