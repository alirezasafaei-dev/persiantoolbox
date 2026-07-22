export function trackAddressEvent(event: string, data?: Record<string, string>) {
  if (typeof window === 'undefined') {
    return;
  }

  const safeData: Record<string, string> = {};
  if (data) {
    for (const [key, value] of Object.entries(data)) {
      if (['fieldType', 'confidence', 'mode'].includes(key)) {
        safeData[key] = value;
      }
    }
  }

  window.dispatchEvent(
    new CustomEvent('address-tool-event', {
      detail: { event, ...safeData, timestamp: Date.now() },
    }),
  );
}
