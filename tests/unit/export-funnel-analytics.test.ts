import { describe, expect, it, vi, beforeEach } from 'vitest';
import {
  ANALYTICS_EVENTS,
  trackAnalyticsEvent,
  trackExportFunnel,
} from '@/shared/analytics/events';

vi.mock('@/lib/monitoring', () => ({
  analytics: {
    trackEvent: vi.fn(),
  },
}));

describe('Export funnel analytics events', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('defines all required export funnel events', () => {
    expect(ANALYTICS_EVENTS.EXPORT_CLICK).toBe('export_click');
    expect(ANALYTICS_EVENTS.EXPORT_ATTEMPT).toBe('export_attempt');
    expect(ANALYTICS_EVENTS.UPGRADE_VIEW).toBe('upgrade_view');
    expect(ANALYTICS_EVENTS.CHECKOUT_START).toBe('checkout_start');
    expect(ANALYTICS_EVENTS.EXPORT_TOKEN_ISSUED).toBe('export_token_issued');
    expect(ANALYTICS_EVENTS.EXPORT_CONFIRM).toBe('export_confirm');
    expect(ANALYTICS_EVENTS.EXPORT_CANCEL).toBe('export_cancel');
    expect(ANALYTICS_EVENTS.PAYMENT_SUCCESS).toBe('payment_success');
  });

  it('trackAnalyticsEvent calls analytics.trackEvent with metadata', async () => {
    const { analytics } = await import('@/lib/monitoring');
    trackAnalyticsEvent(ANALYTICS_EVENTS.EXPORT_CLICK, { product: 'business' });
    await vi.waitFor(() => {
      expect(analytics.trackEvent).toHaveBeenCalledWith(
        'export_click',
        expect.objectContaining({ product: 'business' }),
      );
    });
  });

  it('trackExportFunnel sends privacy-safe metadata only', async () => {
    const { analytics } = await import('@/lib/monitoring');
    trackExportFunnel(ANALYTICS_EVENTS.EXPORT_CONFIRM, {
      product: 'career',
      format: 'pdf',
      source: 'resume-builder',
      isPremium: true,
      status: 'success',
    });
    await vi.waitFor(() => {
      expect(analytics.trackEvent).toHaveBeenCalledWith(
        'export_confirm',
        expect.objectContaining({
          product: 'career',
          format: 'pdf',
          source: 'resume-builder',
          isPremium: true,
          status: 'success',
        }),
      );
    });
  });

  it('trackExportFunnel never sends document content', async () => {
    const { analytics } = await import('@/lib/monitoring');
    trackExportFunnel(ANALYTICS_EVENTS.EXPORT_CLICK, {
      product: 'business',
      format: 'docx',
      source: 'document-studio',
      isFree: true,
    });
    await vi.waitFor(() => {
      const call = (analytics.trackEvent as ReturnType<typeof vi.fn>).mock.calls[0];
      const metadata = call?.[1] as Record<string, unknown>;
      expect(metadata).toBeDefined();
      expect(metadata).not.toHaveProperty('invoiceRows');
      expect(metadata).not.toHaveProperty('resumeText');
      expect(metadata).not.toHaveProperty('documentContent');
      expect(metadata).not.toHaveProperty('pdfBase64');
      expect(metadata).not.toHaveProperty('filePath');
      expect(metadata).not.toHaveProperty('userData');
    });
  });
});
