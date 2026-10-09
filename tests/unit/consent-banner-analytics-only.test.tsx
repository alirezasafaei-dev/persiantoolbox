import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import ConsentBanner from '@/components/ui/ConsentBanner';
import { readAnalyticsConsent } from '@/shared/consent/analyticsConsent';

describe('analytics banner never grants advertising consent', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => {
    cleanup();
    localStorage.clear();
  });
  it('persists analytics consent while keeping all advertising fields denied', () => {
    render(<ConsentBanner />);
    fireEvent.click(screen.getByRole('button', { name: /پذیرش/ }));
    expect(readAnalyticsConsent()).toMatchObject({
      analytics_storage: true,
      ad_storage: false,
      ad_user_data: false,
      ad_personalization: false,
    });
  });
});
