import { getGa4MeasurementId, isGa4Enabled } from '@/lib/analytics/ga4Config';
import { readAnalyticsConsent } from '@/shared/consent/analyticsConsent';

const SPLIT_PATH = '/pdf-tools/split/split-pdf';

type SplitOutcome = 'tool_start' | 'tool_complete' | 'tool_error' | 'tool_cancel';

export function trackSplitPdfOutcome(event: SplitOutcome): void {
  if (typeof window === 'undefined' || !isGa4Enabled()) {
    return;
  }
  const id = getGa4MeasurementId();
  if (
    !id ||
    window.location.pathname !== SPLIT_PATH ||
    readAnalyticsConsent()?.analytics_storage !== true
  ) {
    return;
  }
  try {
    window.gtag?.('event', event, {
      send_to: id,
      tool_id: 'split-pdf',
      page_location: new URL(SPLIT_PATH, window.location.origin).href,
    });
  } catch {
    // A telemetry failure must not interrupt the local PDF operation.
  }
}
