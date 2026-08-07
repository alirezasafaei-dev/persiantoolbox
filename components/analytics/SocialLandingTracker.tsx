'use client';

import { useEffect, useRef } from 'react';
import { trackAnalyticsEvent, ANALYTICS_EVENTS } from '@/shared/analytics/events';
import { SUPPORTED_PLATFORMS } from '../../scripts/growth/utm-generator';

/**
 * Tracks visitors arriving from social media campaigns via UTM parameters.
 * Only fires once per page load when valid social UTM parameters are present.
 *
 * §11: Supported platforms — instagram, youtube, aparat, telegram, x
 * UTM convention: utm_source={platform}, utm_medium={type}_organic,
 *   utm_campaign={cluster}_cycle{N}, utm_content={creator}_day{N}
 *
 * Privacy: Only sends UTM metadata (platform, campaign, asset_type).
 * No fingerprinting, no cross-site tracking.
 *
 * Duplicate prevention: Uses a module-level ref to ensure the event fires
 * at most once per component lifecycle. React StrictMode double-mounts
 * in development — the ref guards against the second mount firing a
 * duplicate event.
 */

export default function SocialLandingTracker() {
  const firedRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    // Prevent duplicate fire from StrictMode double-mount or remount
    if (firedRef.current) {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const utmSource = params.get('utm_source');
    const utmCampaign = params.get('utm_campaign');
    const utmContent = params.get('utm_content');
    const utmMedium = params.get('utm_medium');

    if (
      !utmSource ||
      !SUPPORTED_PLATFORMS.includes(utmSource.toLowerCase() as (typeof SUPPORTED_PLATFORMS)[number])
    ) {
      return;
    }

    firedRef.current = true;

    trackAnalyticsEvent(ANALYTICS_EVENTS.SOCIAL_LANDING, {
      platform: utmSource.toLowerCase(),
      campaign: utmCampaign ?? undefined,
      asset_type: utmContent ?? undefined,
      medium: utmMedium ?? undefined,
    });
  }, []);

  return null;
}
