'use client';

import { useEffect } from 'react';
import { trackAnalyticsEvent, ANALYTICS_EVENTS } from '@/shared/analytics/events';

/**
 * Tracks visitors arriving from social media campaigns via UTM parameters.
 * Only fires once on page load when valid social UTM parameters are present.
 * 
 * Privacy: Only sends UTM metadata (platform, campaign, asset_type).
 * No fingerprinting, no cross-site tracking.
 */
export default function SocialLandingTracker() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    const utmSource = params.get('utm_source');
    const utmCampaign = params.get('utm_campaign');
    const utmContent = params.get('utm_content');
    const utmMedium = params.get('utm_medium');

    // Only track social platforms
    const socialPlatforms = ['instagram', 'telegram', 'twitter', 'facebook', 'linkedin'];
    if (!utmSource || !socialPlatforms.includes(utmSource.toLowerCase())) {
      return;
    }

    trackAnalyticsEvent(ANALYTICS_EVENTS.SOCIAL_LANDING, {
      platform: utmSource.toLowerCase(),
      campaign: utmCampaign || undefined,
      asset_type: utmContent || undefined,
      medium: utmMedium || undefined,
    });
  }, []);

  return null;
}
