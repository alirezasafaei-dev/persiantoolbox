'use client';

import { useCallback, useRef } from 'react';
import { trackExportFunnel, ANALYTICS_EVENTS } from './events';
import type { ExportProduct } from '@/lib/export-products';

type ExportFunnelMeta = {
  product: ExportProduct;
  source: string;
  isPremium: boolean;
};

export function useExportFunnel(product: ExportProduct, source: string, isPremium: boolean) {
  const meta = useRef<ExportFunnelMeta>({ product, source, isPremium });

  const trackExportClick = useCallback((format: 'pdf' | 'docx' | 'html' | 'print') => {
    trackExportFunnel(ANALYTICS_EVENTS.EXPORT_CLICK, {
      ...meta.current,
      format,
    });
  }, []);

  const trackUpgradeView = useCallback(() => {
    trackExportFunnel(ANALYTICS_EVENTS.UPGRADE_VIEW, {
      ...meta.current,
      format: 'pdf',
    });
  }, []);

  const trackCheckoutStart = useCallback((planId: string) => {
    trackExportFunnel(ANALYTICS_EVENTS.CHECKOUT_START, {
      ...meta.current,
      format: 'pdf',
      planId,
    });
  }, []);

  const trackTokenIssued = useCallback((format: 'pdf' | 'docx', status: 'success' | 'error') => {
    trackExportFunnel(ANALYTICS_EVENTS.EXPORT_TOKEN_ISSUED, {
      ...meta.current,
      format,
      status,
    });
  }, []);

  const trackExportConfirm = useCallback((format: 'pdf' | 'docx') => {
    trackExportFunnel(ANALYTICS_EVENTS.EXPORT_CONFIRM, {
      ...meta.current,
      format,
      status: 'success',
    });
  }, []);

  const trackExportCancel = useCallback((format: 'pdf' | 'docx') => {
    trackExportFunnel(ANALYTICS_EVENTS.EXPORT_CANCEL, {
      ...meta.current,
      format,
      status: 'cancelled',
    });
  }, []);

  const trackPaymentSuccess = useCallback(() => {
    trackExportFunnel(ANALYTICS_EVENTS.PAYMENT_SUCCESS, {
      ...meta.current,
      format: 'pdf',
      status: 'success',
    });
  }, []);

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
