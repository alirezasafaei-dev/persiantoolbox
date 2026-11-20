'use client';

import { useCallback, useMemo } from 'react';
import { trackExportFunnel, ANALYTICS_EVENTS } from './events';
import type { ExportProduct } from '@/lib/export-products';

type ExportFunnelMeta = {
  product: ExportProduct;
  source: string;
  isPremium: boolean;
};

export function useExportFunnel(product: ExportProduct, source: string, isPremium: boolean) {
  const meta = useMemo<ExportFunnelMeta>(
    () => ({ product, source, isPremium }),
    [product, source, isPremium],
  );

  const trackExportClick = useCallback(
    (format: 'pdf' | 'docx' | 'html' | 'print') => {
      trackExportFunnel(ANALYTICS_EVENTS.EXPORT_CLICK, {
        ...meta,
        format,
      });
    },
    [meta],
  );

  const trackUpgradeView = useCallback(() => {
    trackExportFunnel(ANALYTICS_EVENTS.UPGRADE_VIEW, {
      ...meta,
      format: 'pdf',
    });
  }, [meta]);

  const trackCheckoutStart = useCallback(
    (planId: string) => {
      trackExportFunnel(ANALYTICS_EVENTS.CHECKOUT_START, {
        ...meta,
        format: 'pdf',
        planId,
      });
    },
    [meta],
  );

  const trackTokenIssued = useCallback(
    (format: 'pdf' | 'docx', status: 'success' | 'error') => {
      trackExportFunnel(ANALYTICS_EVENTS.EXPORT_TOKEN_ISSUED, {
        ...meta,
        format,
        status,
      });
    },
    [meta],
  );

  const trackExportConfirm = useCallback(
    (format: 'pdf' | 'docx') => {
      trackExportFunnel(ANALYTICS_EVENTS.EXPORT_CONFIRM, {
        ...meta,
        format,
        status: 'success',
      });
    },
    [meta],
  );

  const trackExportCancel = useCallback(
    (format: 'pdf' | 'docx') => {
      trackExportFunnel(ANALYTICS_EVENTS.EXPORT_CANCEL, {
        ...meta,
        format,
        status: 'cancelled',
      });
    },
    [meta],
  );

  const trackPaymentSuccess = useCallback(() => {
    trackExportFunnel(ANALYTICS_EVENTS.PAYMENT_SUCCESS, {
      ...meta,
      format: 'pdf',
      status: 'success',
    });
  }, [meta]);

  return {
    trackExportClick,
    trackUpgradeView,
    trackCheckoutStart,
    trackTokenIssued,
    trackExportConfirm,
    trackExportCancel,
    trackPaymentSuccess,
  };
}
