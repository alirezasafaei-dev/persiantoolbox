'use client';

import { useEffect } from 'react';
import { trackAnalyticsEvent, ANALYTICS_EVENTS } from '@/shared/analytics/events';

type Props = {
  toolId: string;
  category?: string;
};

export default function ToolOpenTracker({ toolId, category }: Props) {
  useEffect(() => {
    trackAnalyticsEvent(ANALYTICS_EVENTS.TOOL_OPEN, { tool_id: toolId, category });
  }, [toolId, category]);

  return null;
}
