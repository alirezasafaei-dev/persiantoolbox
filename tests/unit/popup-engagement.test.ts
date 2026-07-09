import { describe, expect, it } from 'vitest';
import {
  getEngagementCount,
  incrementEngagement,
  isPopupExcludedPath,
  resolveSmartCtaVariant,
  shouldAllowExitIntent,
} from '@/lib/client/popupEngagement';

describe('popup engagement', () => {
  it('excludes admin, account, and pricing routes', () => {
    expect(isPopupExcludedPath('/admin')).toBe(true);
    expect(isPopupExcludedPath('/admin/users')).toBe(true);
    expect(isPopupExcludedPath('/account')).toBe(true);
    expect(isPopupExcludedPath('/pricing')).toBe(true);
    expect(isPopupExcludedPath('/loan')).toBe(false);
  });

  it('shows welcome only after scroll and timing gates', () => {
    expect(
      resolveSmartCtaVariant({
        engagementCount: 0,
        isHomepage: true,
        welcomeReady: false,
        hasScrolledEnough: true,
        dismissedWelcome: false,
        dismissedAccount: false,
        dismissedPremium: false,
      }),
    ).toBeNull();

    expect(
      resolveSmartCtaVariant({
        engagementCount: 0,
        isHomepage: true,
        welcomeReady: true,
        hasScrolledEnough: true,
        dismissedWelcome: false,
        dismissedAccount: false,
        dismissedPremium: false,
      }),
    ).toBe('welcome');
  });

  it('prioritizes premium over account at high engagement', () => {
    expect(
      resolveSmartCtaVariant({
        engagementCount: 16,
        isHomepage: false,
        welcomeReady: true,
        hasScrolledEnough: true,
        dismissedWelcome: false,
        dismissedAccount: false,
        dismissedPremium: false,
      }),
    ).toBe('premium');
  });

  it('increments engagement count in localStorage', () => {
    localStorage.clear();
    expect(getEngagementCount()).toBe(0);
    incrementEngagement();
    expect(getEngagementCount()).toBe(1);
  });

  it('blocks exit intent until time and engagement thresholds are met', () => {
    expect(
      shouldAllowExitIntent({
        dismissed: false,
        timeOnSiteMs: 10_000,
        engagementCount: 5,
        isDesktop: true,
        excludedPath: false,
        alreadyShownThisSession: false,
      }),
    ).toBe(false);

    expect(
      shouldAllowExitIntent({
        dismissed: false,
        timeOnSiteMs: 70_000,
        engagementCount: 2,
        isDesktop: true,
        excludedPath: false,
        alreadyShownThisSession: false,
      }),
    ).toBe(false);

    expect(
      shouldAllowExitIntent({
        dismissed: false,
        timeOnSiteMs: 95_000,
        engagementCount: 3,
        isDesktop: true,
        excludedPath: false,
        alreadyShownThisSession: false,
      }),
    ).toBe(true);
  });
});
