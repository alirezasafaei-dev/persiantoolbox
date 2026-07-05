'use client';

import { useReportWebVitals } from 'next/web-vitals';

const VITALS_STORAGE_KEY = 'pt.web-vitals';

type VitalRecord = {
  name: string;
  value: number;
  rating: string;
  url: string;
  ts: number;
};

function storeVital(vital: VitalRecord) {
  try {
    const stored = localStorage.getItem(VITALS_STORAGE_KEY);
    const vitals: VitalRecord[] = stored ? JSON.parse(stored) : [];
    vitals.push(vital);
    if (vitals.length > 200) {
      vitals.splice(0, vitals.length - 200);
    }
    localStorage.setItem(VITALS_STORAGE_KEY, JSON.stringify(vitals));
  } catch {
    /* localStorage full or unavailable */
  }
}

function sendToGA(metric: { name: string; value: number; rating: string; id: string }) {
  try {
    const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
    if (typeof gtag === 'function') {
      gtag('event', metric.name, {
        event_category: 'Web Vitals',
        event_label: metric.id,
        value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
        non_interaction: true,
      });
    }
  } catch {
    /* GA not available */
  }
}

export function WebVitals() {
  useReportWebVitals((metric) => {
    const vital: VitalRecord = {
      name: metric.name,
      value: Math.round(metric.value),
      rating: metric.rating,
      url: window.location.pathname,
      ts: Date.now(),
    };
    storeVital(vital);
    sendToGA(metric);
  });

  return null;
}
