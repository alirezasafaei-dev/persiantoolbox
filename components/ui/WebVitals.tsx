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
  });

  return null;
}
