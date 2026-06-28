'use client';

import { useEffect, useRef, useCallback } from 'react';
import { trackAnalyticsEvent, ANALYTICS_EVENTS } from './events';

type ToolAnalyticsMeta = {
  tool_id: string;
  category?: string | undefined;
};

export function useToolAnalytics(toolId: string, category?: string) {
  const meta = useRef<ToolAnalyticsMeta>({ tool_id: toolId, category });

  useEffect(() => {
    meta.current = { tool_id: toolId, category };
  }, [toolId, category]);

  useEffect(() => {
    trackAnalyticsEvent(ANALYTICS_EVENTS.TOOL_OPEN, meta.current);
  }, []);

  const trackRun = useCallback((extra?: Record<string, unknown>) => {
    trackAnalyticsEvent(ANALYTICS_EVENTS.TOOL_RUN, { ...meta.current, ...extra });
  }, []);

  const trackUse = useCallback((extra?: Record<string, unknown>) => {
    trackAnalyticsEvent(ANALYTICS_EVENTS.TOOL_USE, { ...meta.current, ...extra });
  }, []);

  const trackExport = useCallback((extra?: Record<string, unknown>) => {
    trackAnalyticsEvent(ANALYTICS_EVENTS.TOOL_EXPORT_CLICK, { ...meta.current, ...extra });
    trackAnalyticsEvent(ANALYTICS_EVENTS.EXPORT_ATTEMPT, { ...meta.current, ...extra });
  }, []);

  const trackError = useCallback((extra?: Record<string, unknown>) => {
    trackAnalyticsEvent(ANALYTICS_EVENTS.TOOL_ERROR, { ...meta.current, ...extra });
  }, []);

  return { trackRun, trackUse, trackExport, trackError };
}
